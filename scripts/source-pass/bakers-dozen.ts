// The Quietus Baker's Dozen sweep: every pick, in the artist's own words,
// from each Baker's Dozen by an artist on the map (a member counts for their
// band). No searches: the list comes from the Quietus sitemap, and each pick
// has its own slide URL (`.../bakers-dozen/<slug>/2/` to `/14/`).
//
//   npx tsx scripts/source-pass/bakers-dozen.ts fetch        pull every slide into picks.json
//   npx tsx scripts/source-pass/bakers-dozen.ts sort [n]     sort picks, write n judging batches
//
// Input: research/source-pass/bakers-dozen/speakers.json ([{ speaker, url }]).
// Output: research/source-pass/bakers-dozen/picks.json, one entry per pick:
// who chose it, the slide URL, the heading ("4. Yo La Tengo – Popular Songs")
// and the slide's text. Pages are cached in research/source-pass/.pages/ under
// the same names `ledger.ts read` uses, so a checker's `read` of a slide is
// served from the cache.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const DIR = resolve(ROOT, 'research/source-pass/bakers-dozen');
const PAGES = resolve(ROOT, 'research/source-pass/.pages');

interface Speaker { speaker: string; url: string }
interface Pick { speaker: string; dozen: string; url: string; n: number | null; heading: string; text: string }

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function get(url: string): Promise<string | null> {
  const file = resolve(PAGES, `${Buffer.from(url).toString('base64url').slice(-120)}.txt`);
  if (existsSync(file)) return readFileSync(file, 'utf-8');
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await wait(5000 * attempt);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30_000);
    try {
      const r = await fetch(`https://r.jina.ai/${url}`, { signal: ctrl.signal });
      if (!r.ok) continue;
      const text = await r.text();
      if (/just a moment|captcha/i.test(text.slice(0, 3000)) || text.length < 1500) continue;
      mkdirSync(PAGES, { recursive: true });
      writeFileSync(file, text);
      return text;
    } catch { /* retried */ } finally { clearTimeout(t); }
  }
  return null;
}

// A slide's pick: the "# 4. _Artist – Album_" heading and the paragraphs
// under it, up to the page's own navigation.
function parse(text: string): { n: number | null; heading: string; body: string } | null {
  const lines = text.split('\n');
  const at = lines.findIndex(l => /^#{1,3}\s*\d+\.\s/.test(l.trim()));
  if (at < 0) return null;
  const heading = lines[at].replace(/^#+\s*/, '').replace(/[_*]/g, '').trim();
  const body: string[] = [];
  for (const l of lines.slice(at + 1)) {
    const s = l.trim();
    if (/^(Prev|Next|Next Selection|More on |More from )/.test(s)) break;
    if (!s || s === 'Advertisement' || /^!\[|^\[!\[/.test(s)) continue;
    body.push(s.replace(/[_*]/g, ''));
  }
  const n = Number(heading.match(/^(\d+)\./)?.[1]);
  return { n: Number.isFinite(n) ? n : null, heading, body: body.join('\n\n') };
}

// The intro (page 1): the standfirst and anything the artist says before the
// picks, up to where the slideshow's own furniture starts.
function intro(text: string): string {
  const body = text.split('Markdown Content:')[1] ?? text;
  return body.split('\n').map(l => l.trim())
    .filter(l => l.length > 80 && !/^[*\[!#]/.test(l) && !/^\d+$/.test(l))
    .slice(0, 12).join('\n\n');
}

async function fetchAll() {
  const speakers: Speaker[] = JSON.parse(readFileSync(resolve(DIR, 'speakers.json'), 'utf-8'));
  const out = resolve(DIR, 'picks.json');
  const picks: Pick[] = existsSync(out) ? JSON.parse(readFileSync(out, 'utf-8')) : [];
  const done = new Set(picks.map(p => p.dozen));
  const failed: string[] = [];
  const limit = Number(process.env.LIMIT) || speakers.length;
  const todo = speakers.slice(0, limit).filter(s => !done.has(s.url));
  let finished = 0;
  // A slide takes the proxy ~6s, so four dozens are fetched at once (one
  // process, one writer of picks.json).
  const worker = async () => { for (let s = todo.shift(); s; s = todo.shift()) await one(s); };
  const one = async (s: Speaker) => {
    const first = await get(s.url);
    if (!first) { failed.push(s.url); console.log(`✗ ${s.url}`); return; }
    const slides = [...new Set([...first.matchAll(new RegExp(`${s.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)/`, 'g'))].map(m => Number(m[1])))].sort((a, b) => a - b);
    const mine: Pick[] = [{ speaker: s.speaker, dozen: s.url, url: s.url, n: 0, heading: 'Introduction', text: intro(first) }];
    // A slideshow page lists its slides; one without slide links holds every
    // pick on the page itself.
    const own = parse(first);
    if (own) mine.push({ speaker: s.speaker, dozen: s.url, url: s.url, n: own.n, heading: own.heading, text: own.body });
    for (const k of slides) {
      const url = `${s.url}${k}/`;
      const text = await get(url);
      const p = text && parse(text);
      if (!p) { failed.push(url); continue; }
      mine.push({ speaker: s.speaker, dozen: s.url, url, n: p.n, heading: p.heading, text: p.body });
      await wait(400);
    }
    picks.push(...mine);
    writeFileSync(out, JSON.stringify(picks, null, 1) + '\n');
    console.log(`${++finished} ${s.speaker}: ${mine.length - 1} picks (${slides.length} slides)`);
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  writeFileSync(resolve(DIR, 'failed.json'), JSON.stringify(failed, null, 1) + '\n');
  console.log(`done: ${picks.length} entries, ${failed.length} pages failed`);
}

// ── sort ─────────────────────────────────────────────────────────────────
// Who each pick is by, and what it could be: a new link between two artists
// on the map, a source for a link already there, or an artist off the map.
// Strict on names: a solo record by a band member (Lou Reed, Morrissey) is
// not the band. Writes sorted.json and one judging batch per checker.
async function sortPicks(batches: number) {
  const { graphData } = await import('../../data/seed-data');
  const ledger: Record<string, { verdict: string }> = JSON.parse(readFileSync(resolve(ROOT, 'data/edge-sources.json'), 'utf-8'));
  const picks: Pick[] = JSON.parse(readFileSync(resolve(DIR, 'picks.json'), 'utf-8'));
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/^the /, '').replace(/[^a-z0-9]/g, '');
  const byName = new Map(graphData.artists.map(a => [norm(a.name), a]));
  const edges = new Set(graphData.edges.map(e => `${e.source}>${e.target}`));
  const sorted = picks.filter(p => p.n !== 0 && p.text.length > 40).map(p => {
    const h = p.heading.replace(/^\d+\.\s*/, '');
    // "[Television](…/artist/television/)Marquee Moon" or "Lou Reed – Berlin"
    const artist = (h.match(/^\[([^\]]+)\]\(/)?.[1] ?? h.split(/\s[–-]\s/)[0]).trim();
    const hit = byName.get(norm(artist));
    const key = hit ? `${p.speaker}>${hit.id}` : null;
    const kind = !hit ? 'off-map' : hit.id === p.speaker ? 'self' : edges.has(key!) ? 'existing' : 'new';
    return { ...p, heading: h.replace(/^\[([^\]]+)\]\([^)]*\)\s*/, '$1 – '), artist, target: hit?.id ?? null, kind, ledger: key ? ledger[key]?.verdict ?? null : null };
  }).filter(p => p.kind !== 'self');
  writeFileSync(resolve(DIR, 'sorted.json'), JSON.stringify(sorted, null, 1) + '\n');
  const count = (k: string) => sorted.filter(p => p.kind === k).length;
  console.log(`${sorted.length} picks: ${count('new')} new links on the map, ${count('existing')} for links already there, ${count('off-map')} off the map`);
  // Judging batches: every on-map pick, plus off-map picks (only to tally who
  // the artists themselves point to), split by speaker so a dozen stays whole.
  const speakers = [...new Set(sorted.map(p => p.speaker + ' ' + p.dozen))];
  for (let b = 0; b < batches; b++) {
    const mine = speakers.filter((_, i) => i % batches === b);
    const list = sorted.filter(p => mine.includes(p.speaker + ' ' + p.dozen));
    writeFileSync(resolve(DIR, `judge-${b + 1}.json`), JSON.stringify(list, null, 1) + '\n');
    console.log(`judge-${b + 1}.json: ${mine.length} dozens, ${list.length} picks`);
  }
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'fetch') fetchAll();
else if (cmd === 'sort') sortPicks(Number(arg) || 3);
else console.log('usage: bakers-dozen.ts fetch | sort [batches]');
