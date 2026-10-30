// The source pass's working tool (plan: research/source-pass/PLAN.md).
//
//   npx tsx scripts/source-pass/ledger.ts queue          build queue.json + roster.txt (once)
//   npx tsx scripts/source-pass/ledger.ts next <name> <n> hand the next ~n links to a checker
//   npx tsx scripts/source-pass/ledger.ts merge [names…] fold checkers' results into the ledger (all, or just these)
//   npx tsx scripts/source-pass/ledger.ts status         what's done, what's left
//   npx tsx scripts/source-pass/ledger.ts check [--all]  re-open every recorded page, look for `found`
//   npx tsx scripts/source-pass/ledger.ts read <url> [words…] [--raw]  open a page, print the paragraphs holding the words
//
// Links are queued in groups that share a speaker (the artist whose
// interview it usually is), so one interview is read once for all its links;
// a group is never split between two checkers. A link with a ledger entry is
// never handed out again. Checkers write only their own results file; this
// script is the one writer of the ledger, so parallel checkers can't collide.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { resolve } from 'path';
import { graphData } from '../../data/seed-data';
import type { Edge, GraphData } from '../../data/types';
import { edgeKey, ledgerProblems, type EdgeSources } from '../../lib/edge-sources';
import { pickPool, whyFor, SUNDAY_RECORD } from '../../lib/home-story';

const ROOT = resolve(__dirname, '../..');
const DIR = resolve(ROOT, 'research/source-pass');
const LEDGER = resolve(ROOT, 'data/edge-sources.json');
const QUEUE = resolve(DIR, 'queue.json');
const BATCHES = resolve(DIR, 'batches');
const RESULTS = resolve(DIR, 'results');
const MERGED = resolve(RESULTS, 'merged');
const CANDIDATES = resolve(DIR, 'candidates.json');
const OFF_MAP = resolve(DIR, 'off-map.json');
const CHECK_REPORT = resolve(DIR, 'check-report.json');
// A video's words are its captions: the Amoeba sweep saves them here, one
// `[m:ss] words` line each, and a YouTube source is checked against them.
const TRANSCRIPTS = resolve(DIR, 'amoeba/transcripts');
const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/)?.[1];
const captions = (url: string): string | null => {
  const id = youtubeId(url);
  const file = id && resolve(TRANSCRIPTS, `${id}.txt`);
  if (!file || !existsSync(file)) return null;
  return readFileSync(file, 'utf-8').split('\n').map(l => l.replace(/^\[\d+:\d\d\] /, '')).join(' ');
};

type Phase = 'why' | 'first-person' | 'reported' | 'critic' | 'unsourceable';
const PHASES: Phase[] = ['why', 'first-person', 'reported', 'critic', 'unsourceable'];

interface QueueLink {
  key: string;
  from: string;        // the influenced artist's name
  to: string;          // the influence's name
  fromYear: number | null;
  toYear: number | null;
  citation: string | null;
  sourceTier: string | null;
  confidence: number;
  /** For a today's-record link: the line shown on the home page. */
  why?: { quote: string; speaker: string };
}
interface QueueGroup { id: string; phase: Phase; speaker: string; links: QueueLink[] }
interface Batch { name: string; made: string; groups: QueueGroup[] }
interface Candidate { source: string; target: string; kind: 'influence' | 'denial'; speaker: string; sentence: string; url: string; foundBy?: string }
interface OffMap { name: string; namedBy: string; sentence: string; url: string; foundBy?: string }
interface Results {
  agent: string;
  searches: number;
  toolStatus: string;
  entries: EdgeSources;
  candidates?: Candidate[];
  offMap?: OffMap[];
  /** Set by the checker in its last write. */
  finished?: boolean;
}

const readJson = <T>(p: string, fallback: T): T => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) as T : fallback);
const writeJson = (p: string, v: unknown) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const today = () => new Date().toISOString().slice(0, 10);

function loadLedger(): EdgeSources { return readJson<EdgeSources>(LEDGER, {}); }

// ── queue ──────────────────────────────────────────────────────────────────
function buildQueue() {
  const built = readJson<GraphData | null>(resolve(ROOT, 'public/graph.json'), null);
  if (!built) throw new Error('public/graph.json is missing: run npm run build:data first');
  const byId = new Map(graphData.artists.map(a => [a.id, a]));

  // Today's record: the link each possible pick's "why" line comes from.
  const why = new Map<string, { quote: string; speaker: string }>();
  for (const id of [...pickPool(built), SUNDAY_RECORD]) {
    const w = whyFor(built, id);
    if (w) why.set(w.edgeKey, { quote: w.quote, speaker: w.speaker });
  }

  const degree = new Map<string, number>();
  for (const e of graphData.edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  const phaseOf = (e: Edge): Phase =>
    why.has(edgeKey(e)) ? 'why'
      : !e.citation ? 'unsourceable'
      : (e.sourceTier ?? 'critic') as Phase;

  const link = (e: Edge): QueueLink => ({
    key: edgeKey(e),
    from: byId.get(e.source)?.name ?? e.source,
    to: byId.get(e.target)?.name ?? e.target,
    fromYear: byId.get(e.source)?.activeFrom ?? null,
    toYear: byId.get(e.target)?.activeFrom ?? null,
    citation: e.citation ?? null,
    sourceTier: e.sourceTier ?? null,
    confidence: e.confidence,
    ...(why.has(edgeKey(e)) ? { why: why.get(edgeKey(e)) } : {}),
  });

  // Within a phase, one group per influenced artist (whose interview it
  // usually is), most-connected first.
  const groups: QueueGroup[] = [];
  for (const phase of PHASES) {
    const bySpeaker = new Map<string, Edge[]>();
    for (const e of graphData.edges.filter(x => x.type === 'influence' && phaseOf(x) === phase)) {
      bySpeaker.set(e.source, [...(bySpeaker.get(e.source) ?? []), e]);
    }
    const speakers = [...bySpeaker.keys()].sort((a, b) => (degree.get(b) ?? 0) - (degree.get(a) ?? 0) || a.localeCompare(b));
    for (const s of speakers) {
      groups.push({ id: `${phase}:${s}`, phase, speaker: byId.get(s)?.name ?? s, links: bySpeaker.get(s)!.map(link) });
    }
  }

  mkdirSync(DIR, { recursive: true });
  writeJson(QUEUE, { built: today(), groups });
  const roster = graphData.artists.map(a => `${a.id}\t${a.name}\t${a.activeFrom ?? ''}`).sort().join('\n');
  writeFileSync(resolve(DIR, 'roster.txt'), `# id\tname\tactive from -- every artist on the map\n${roster}\n`);
  const count = (p: Phase) => groups.filter(g => g.phase === p).reduce((n, g) => n + g.links.length, 0);
  console.log(`queue.json: ${groups.length} groups, ${groups.reduce((n, g) => n + g.links.length, 0)} links`);
  for (const p of PHASES) console.log(`  ${p.padEnd(13)} ${count(p)}`);
}

// ── next ───────────────────────────────────────────────────────────────────
function assignedKeys(): Set<string> {
  const keys = new Set<string>();
  if (!existsSync(BATCHES)) return keys;
  for (const f of readdirSync(BATCHES).filter(f => f.endsWith('.json'))) {
    const b = readJson<Batch>(resolve(BATCHES, f), { name: '', made: '', groups: [] });
    b.groups.forEach(g => g.links.forEach(l => keys.add(l.key)));
  }
  return keys;
}

function nextBatch(name: string, n: number, phase?: Phase) {
  if (!name || !n) throw new Error('usage: next <name> <links> [phase]');
  const out = resolve(BATCHES, `${name}.json`);
  if (existsSync(out)) throw new Error(`${out} already exists: merge it first`);
  const queue = readJson<{ groups: QueueGroup[] }>(QUEUE, { groups: [] });
  const done = loadLedger();
  const taken = assignedKeys();
  const picked: QueueGroup[] = [];
  let count = 0;
  for (const g of queue.groups) {
    if (phase && g.phase !== phase) continue;
    const links = g.links.filter(l => !done[l.key] && !taken.has(l.key));
    if (!links.length) continue;
    if (count && count + links.length > n * 1.25) continue;
    picked.push({ ...g, links });
    count += links.length;
    if (count >= n) break;
  }
  mkdirSync(BATCHES, { recursive: true });
  writeJson(out, { name, made: today(), groups: picked } satisfies Batch);
  console.log(`${out}: ${picked.length} groups, ${count} links`);
}

// ── merge ──────────────────────────────────────────────────────────────────
function dedupe<T>(list: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return list.filter(t => { const k = key(t); if (seen.has(k)) return false; seen.add(k); return true; });
}

function merge(only: string[] = []) {
  if (!existsSync(RESULTS)) return console.log('no results yet');
  const ledger = loadLedger();
  const candidates = readJson<Candidate[]>(CANDIDATES, []);
  const offMap = readJson<OffMap[]>(OFF_MAP, []);
  const ids = new Set(graphData.artists.map(a => a.id));
  mkdirSync(MERGED, { recursive: true });
  // Named files only, when given: a checker still running isn't merged by
  // accident (its partial file would land in the ledger unreviewed).
  for (const f of readdirSync(RESULTS).filter(f => f.endsWith('.json') && (!only.length || only.includes(f) || only.includes(f.replace(/\.json$/, ''))))) {
    const r = readJson<Results>(resolve(RESULTS, f), null as unknown as Results);
    // A checker rewrites its file as it goes, so a file may be merged more
    // than once: its newer entries replace its own older ones.
    const entries = Object.fromEntries(Object.entries(r.entries ?? {})
      .map(([k, s]) => [k, { ...s, by: r.agent }] as const)
      .filter(([k, s]) => JSON.stringify(ledger[k]) !== JSON.stringify(s)));
    // Checked before anything is touched: a refused file must leave the
    // ledger exactly as it was.
    const problems = ledgerProblems(graphData.edges, entries);
    if (problems.length) {
      console.log(`✗ ${f} not merged:`);
      problems.forEach(p => console.log(`    ${p}`));
      continue;
    }
    for (const k of Object.keys(entries)) if (ledger[k]?.by === r.agent) delete ledger[k];
    // A link already settled in the ledger (by another file, or by hand) keeps
    // its entry; the newer one is reported and set aside.
    // A retry that finds what an earlier checker couldn't replaces its
    // not-found or blocked entry, whoever wrote it.
    const unsettled = (v?: EdgeSources[string]) => v?.verdict === 'not-found' || v?.verdict === 'blocked';
    for (const [k, s] of Object.entries(entries)) {
      if (unsettled(ledger[k]) && !unsettled(s)) { console.log(`    ${f}: ${k} ${ledger[k].verdict} -> ${s.verdict}`); delete ledger[k]; }
    }
    for (const k of Object.keys(entries).filter(k => ledger[k])) {
      console.log(`    ${f}: ${k} is already in the ledger as ${ledger[k].verdict}; kept that, set this ${entries[k].verdict} aside`);
      delete entries[k];
    }
    Object.assign(ledger, entries);
    const badCandidates = (r.candidates ?? []).filter(c => !ids.has(c.source) || !ids.has(c.target));
    badCandidates.forEach(c => console.log(`    ${f}: candidate ${c.source}>${c.target} names an id not on the map; kept anyway`));
    candidates.push(...(r.candidates ?? []).map(c => ({ ...c, foundBy: r.agent })));
    offMap.push(...(r.offMap ?? []).map(o => ({ ...o, foundBy: r.agent })));
    // Retired only once its checker has said it's finished (`finished: true`)
    // and every link in its batch is in the ledger.
    const batch = resolve(BATCHES, f);
    const b = readJson<Batch | null>(batch, null);
    const complete = r.finished === true && (!b || b.groups.every(g => g.links.every(l => ledger[l.key])));
    if (complete) {
      renameSync(resolve(RESULTS, f), resolve(MERGED, f));
      if (b) renameSync(batch, resolve(MERGED, `batch-${f}`));
    }
    const verdicts = Object.values(entries).reduce<Record<string, number>>((m, s) => ({ ...m, [s.verdict]: (m[s.verdict] ?? 0) + 1 }), {});
    console.log(`✓ ${f}${complete ? '' : ' (batch not finished)'}: ${Object.keys(entries).length} new links (${Object.entries(verdicts).map(([v, n]) => `${n} ${v}`).join(', ')}), ${r.searches} searches; ${r.toolStatus}`);
  }
  // Sorted, so the file diffs cleanly.
  writeJson(LEDGER, Object.fromEntries(Object.entries(ledger).sort(([a], [b]) => a.localeCompare(b))));
  writeJson(CANDIDATES, dedupe(candidates, c => `${c.source}>${c.target}:${c.kind}`));
  writeJson(OFF_MAP, dedupe(offMap, o => `${o.name.toLowerCase()}<${o.namedBy}`));
  status();
}

// ── status ─────────────────────────────────────────────────────────────────
function status() {
  const ledger = loadLedger();
  const queue = readJson<{ groups: QueueGroup[] }>(QUEUE, { groups: [] });
  console.log('\nsource pass:');
  for (const p of PHASES) {
    const links = queue.groups.filter(g => g.phase === p).flatMap(g => g.links);
    const done = links.filter(l => ledger[l.key]).length;
    console.log(`  ${p.padEnd(13)} ${String(done).padStart(4)} / ${links.length}`);
  }
  const verdicts = Object.values(ledger).reduce<Record<string, number>>((m, s) => ({ ...m, [s.verdict]: (m[s.verdict] ?? 0) + 1 }), {});
  console.log(`  verdicts: ${Object.entries(verdicts).map(([v, n]) => `${n} ${v}`).join(', ') || 'none yet'}`);
  const blocked = Object.entries(ledger).filter(([, s]) => s.verdict === 'blocked');
  if (blocked.length) {
    console.log(`  for the owner to open (${blocked.length}):`);
    blocked.forEach(([k, s]) => console.log(`    ${k}  ${s.url}  -- ${s.note}`));
  }
  const open = existsSync(BATCHES) ? readdirSync(BATCHES).filter(f => f.endsWith('.json')) : [];
  if (open.length) console.log(`  handed out, not merged: ${open.join(', ')}`);
  const offMap = readJson<OffMap[]>(OFF_MAP, []);
  const tally = new Map<string, Set<string>>();
  for (const o of offMap) tally.set(o.name, (tally.get(o.name) ?? new Set()).add(o.namedBy));
  const top = [...tally.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 10);
  if (top.length) console.log(`  most-named off the map: ${top.map(([n, s]) => `${n} (${s.size})`).join(', ')}`);
  console.log(`  candidate links noted: ${readJson<Candidate[]>(CANDIDATES, []).length}`);
}

// ── check ──────────────────────────────────────────────────────────────────
// Re-opens every recorded page and looks for the recorded sentence, so a
// mis-copied or invented `found` can't stand. Compares text with quotes,
// dashes, case and spacing flattened, since pages and copies differ there.
// r.jina.ai answers in Markdown: links become their words, images and
// footnote markers go, so text read through it matches the page's own.
const demark = (s: string) => s
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[\[(\d+)\]\]\((?:[^()\s]|\([^)]*\))*(?:\s+"[^"]*")?\)/g, '[$1]')
  .replace(/\[([^\]]*)\]\((?:[^()\s]|\([^)]*\))*(?:\s+"[^"]*")?\)/g, '$1');

// A page served as UTF-8 but decoded as Latin-1 ("BjÃ¶rk") is turned back.
const unmojibake = (s: string) => /Ã[\u0080-\u00bf]|â€/.test(s) ? Buffer.from(s, 'latin1').toString('utf8') : s;

const flatten = (s: string) => demark(unmojibake(s))
  .replace(/<[^>]+>/g, ' ')
  .replace(/\[(\d+|citation needed)\]/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…').replace(/&[lr]squo;|&apos;/g, "'")
  .replace(/&ndash;|&mdash;/g, '-')
  .replace(/&amp;/g, '&').replace(/&#8217;|&#x2019;|&rsquo;|&#39;|&apos;/g, "'")
  .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;|&quot;/g, '"')
  .replace(/[‘’ʼ′]/g, "'").replace(/[“”″]/g, '"').replace(/\u00a0/g, ' ')
  .replace(/[–—―]/g, '-').replace(/…/g, '...')
  .replace(/\\[_*]/g, '').replace(/[*_]/g, '')
  .replace(/\s+/g, ' ')
  // Linked words on a page often leave a space before the comma after them.
  .replace(/ ([,.;:!?])/g, '$1')
  .toLowerCase();

async function fetchText(url: string): Promise<string | null> {
  const get = async (u: string) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20_000);
    try {
      const r = await fetch(u, { signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' } });
      return r.ok ? await r.text() : null;
    } catch { return null; } finally { clearTimeout(t); }
  };
  return get(url);
}

// ── read ───────────────────────────────────────────────────────────────────
// How a checker opens a page: the page's own text, as fetched (proxied
// through r.jina.ai when the site refuses), never a model's summary of it.
// Prints each paragraph holding all the given words, exactly as on the page,
// so `found` can be copied from it. Pages are kept in .pages/ so a page read
// for several links, or by the check, is fetched once.
const PAGES = resolve(DIR, '.pages');
const plain = (html: string) => html
  .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<\/(p|div|li|h[1-6]|blockquote|br|tr)>|<br\s*\/?>/gi, '\n\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#8217;|&#x2019;|&rsquo;|&#39;|&apos;/g, "’").replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—').replace(/&#8230;|&hellip;/g, '…');

async function readPage(url: string, words: string[]) {
  mkdirSync(PAGES, { recursive: true });
  const file = resolve(PAGES, `${Buffer.from(url).toString('base64url').slice(-120)}.txt`);
  let text = existsSync(file) ? readFileSync(file, 'utf-8') : null;
  let via = 'cache';
  if (text === null) {
    // An Internet Archive copy is fetched raw (`id_`): the framed page goes
    // through the live site's bot wall, the raw capture doesn't.
    const raw = url.replace(/(web\.archive\.org\/web\/\d+)(?:id_)?\//, '$1id_/');
    const direct = await fetchText(raw);
    // A page that came back but is mostly script (or a bot wall) reads
    // better through the proxy, which renders it.
    const wall = (t: string) => /captcha|access denied|just a moment|one moment, please|enable javascript/i.test(t.slice(0, 5000));
    if (direct && plain(direct).replace(/\s+/g, ' ').length > 3000 && !wall(direct)) {
      text = plain(direct); via = 'direct';
    } else {
      // The proxy rate-limits now and then: one retry after a pause before
      // calling a page unreadable.
      for (let attempt = 0; attempt < 2 && (text === null || wall(text)); attempt++) {
        if (attempt) await new Promise(r => setTimeout(r, 4000));
        text = await fetchText(`https://r.jina.ai/${url}`); via = 'r.jina.ai';
      }
    }
    if (text === null || wall(text)) { console.log(`could not open ${url} (direct or through r.jina.ai, retried)`); process.exit(2); }
    // A near-empty page (a logo and a cookie banner) is not kept, so the next
    // read tries again instead of serving it.
    if (text.replace(/\s+/g, ' ').length > 1500 && !wall(text)) writeFileSync(file, text);
  }
  // --raw keeps the links, to follow a footnote to its source.
  const raw = words.includes('--raw');
  words = words.filter(w => w !== '--raw');
  const paras = text.split(/\n\s*\n/).map(p => (raw ? p : demark(p)).replace(/\s+/g, ' ').trim()).filter(Boolean);
  const title = paras.find(p => /^Title:/.test(p)) ?? paras[0]?.slice(0, 120);
  console.log(`${url}\n(${via}; ${paras.length} paragraphs; ${title})\n`);
  if (!words.length) { console.log(paras.slice(0, 60).join('\n\n')); return; }
  const want = words.map(w => flatten(w));
  const hits = paras.filter(p => { const f = flatten(p); return want.every(w => f.includes(w)); });
  if (!hits.length) console.log(`no paragraph holds all of: ${words.join(', ')}`);
  // A long paragraph (a reference list, a whole page in one block) is shown
  // around the first word asked for.
  const around = (p: string) => {
    if (p.length <= 1200) return p;
    const at = Math.max(0, p.toLowerCase().indexOf(words[0].toLowerCase()));
    return `…${p.slice(Math.max(0, at - 500), at + 700)}…`;
  };
  hits.slice(0, 12).forEach(p => console.log(`> ${around(p)}\n`));
}

async function check(all: boolean) {
  const ledger = loadLedger();
  const report = readJson<Record<string, { result: string; at: string; url?: string; found?: string }>>(CHECK_REPORT, {});
  // A page the owner opened in a browser for us (a bot can't render it) is
  // taken on their reading, not re-fetched.
  const byOwner = (s: EdgeSources[string]) => /opened in a browser by the owner/i.test(s.note ?? '');
  for (const [k, s] of Object.entries(ledger)) if (byOwner(s)) report[k] = { result: 'owner', at: s.checked };
  // Re-checked when it isn't found yet, or its page or sentence has changed.
  const todo = Object.entries(ledger).filter(([k, s]) => s.url && s.found && !byOwner(s) &&
    (all || !report[k]?.result.startsWith('found') || report[k]?.url !== s.url || report[k]?.found !== s.found));
  console.log(`checking ${todo.length} pages…`);
  const pageCache = new Map<string, Promise<string | null>>();
  const page = (u: string) => {
    const said = captions(u);
    if (said !== null) return Promise.resolve(said);
    if (!pageCache.has(u)) pageCache.set(u, fetchText(u.replace(/(web\.archive\.org\/web\/\d+)(?:id_)?\//, '$1id_/')));
    return pageCache.get(u)!;
  };
  const proxied = (u: string) => {
    const k = `jina:${u}`;
    if (!pageCache.has(k)) pageCache.set(k, fetchText(`https://r.jina.ai/${u}`));
    return pageCache.get(k)!;
  };
  let i = 0;
  const worker = async () => {
    while (i < todo.length) {
      const [k, s] = todo[i++];
      const needle = flatten(s.found!);
      // Long sentences are matched on their middle 80%, so a sentence cut
      // differently at either end still counts.
      const core = needle.length > 60 ? needle.slice(Math.floor(needle.length * 0.1), Math.ceil(needle.length * 0.9)) : needle;
      let text = await page(s.url!);
      let result = text === null ? 'unreachable' : flatten(text).includes(core) ? 'found' : 'missing';
      if (result !== 'found') {
        text = await proxied(s.url!);
        if (text !== null) result = flatten(text).includes(core) ? 'found' : 'missing';
      }
      // A live page that now refuses bots, or has changed, is checked against
      // its Internet Archive copies.
      if (result !== 'found' && !/web\.archive\.org/.test(s.url!)) {
        for (const copy of await archiveCopies(s.url!)) {
          const html = await fetchText(copy);
          if (html && flatten(html).includes(core)) { result = 'found (archived copy)'; break; }
        }
      }
      report[k] = { result, at: today(), url: s.url, found: s.found };
      if (!result.startsWith('found')) console.log(`  ${result.padEnd(11)} ${k}  ${s.url}`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  writeJson(CHECK_REPORT, Object.fromEntries(Object.entries(report).sort(([a], [b]) => a.localeCompare(b))));
  const tally = Object.values(report).reduce<Record<string, number>>((m, r) => ({ ...m, [r.result]: (m[r.result] ?? 0) + 1 }), {});
  console.log(`check: ${Object.entries(tally).map(([r, n]) => `${n} ${r}`).join(', ')} (report in ${CHECK_REPORT})`);
}

// ── rescue ─────────────────────────────────────────────────────────────────
// Before a link is left not-found or blocked, every page already named for it
// (its url, any address in its note) is tried in the Internet Archive: a site
// that walls bots or has dropped a page often had it open years ago. Prints,
// per link, the archived copies that hold the influence's name, to be read
// and recorded. No searches.
const URL_RE = /https?:\/\/[^\s)'"\]]+/g;

async function archiveCopies(url: string): Promise<string[]> {
  const bare = url.replace(/^https?:\/\/(web\.archive\.org\/web\/\d+(?:id_)?\/(?:https?:\/\/)?)?/, '');
  const cdx = await fetchText(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(bare)}&output=json&filter=statuscode:200&collapse=digest&limit=200`);
  let rows: string[][] = [];
  try { rows = cdx ? (JSON.parse(cdx) as string[][]).slice(1) : []; } catch { rows = []; }
  // Oldest, a middle one and newest: walls and paywalls are usually recent.
  const pick = rows.length <= 3 ? rows : [rows[0], rows[Math.floor(rows.length / 2)], rows[rows.length - 1]];
  return pick.map(r => `https://web.archive.org/web/${r[1]}id_/${r[2]}`);
}

async function rescue(only?: string) {
  const ledger = loadLedger();
  const byId = new Map(graphData.artists.map(a => [a.id, a]));
  const todo = Object.entries(ledger).filter(([k, s]) =>
    (s.verdict === 'not-found' || s.verdict === 'blocked') && (!only || k === only) &&
    `${s.url ?? ''} ${s.note ?? ''}`.match(URL_RE));
  console.log(`rescue: ${todo.length} links with a known page`);
  const out: Record<string, { tried: number; hits: string[] }> = {};
  for (const [k, s] of todo) {
    const name = byId.get(k.split('>')[1])?.name ?? '';
    const token = flatten(name.replace(/^the\s+/i, '').split(/\s+/).sort((a, b) => b.length - a.length)[0] ?? '');
    const pages = [...new Set([s.url, ...(`${s.note ?? ''}`.match(URL_RE) ?? [])]
      .filter((u): u is string => !!u).map(u => u.replace(/[.,;:]+$/, '')))]
      .filter(u => !/r\.jina\.ai|duckduckgo|google\.|bing\./.test(u));
    const hits: string[] = [];
    let tried = 0;
    for (const page of pages) {
      for (const copy of await archiveCopies(page)) {
        tried++;
        const html = await fetchText(copy);
        const text = html ? flatten(html) : '';
        if (text.length > 2000 && text.includes(token)) { hits.push(copy); break; }
      }
    }
    out[k] = { tried, hits };
    console.log(`  ${hits.length ? 'FOUND' : 'none '}  ${k}  (${tried} copies tried)${hits.map(h => `\n           ${h}`).join('')}`);
  }
  writeJson(resolve(DIR, 'rescue-report.json'), out);
}

const [cmd, ...args] = process.argv.slice(2);
const run: Record<string, () => unknown> = {
  queue: buildQueue,
  next: () => nextBatch(args[0], Number(args[1]), args[2] as Phase | undefined),
  merge: () => merge(args),
  status,
  check: () => check(args.includes('--all')),
  read: () => readPage(args[0], args.slice(1)),
  rescue: () => rescue(args[0]),
};
if (!run[cmd]) {
  console.log('usage: ledger.ts queue | next <name> <links> [phase] | merge [files…] | status | check [--all] | read <url> [words…]');
  process.exit(1);
}
Promise.resolve(run[cmd]()).catch(e => { console.error(e instanceof Error ? e.message : e); process.exit(1); });

