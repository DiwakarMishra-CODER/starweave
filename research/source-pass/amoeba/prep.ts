// Turn fetched captions into timestamped transcripts and split them into judge batches.
// Run after fetch.sh: npx tsx research/source-pass/amoeba/prep.ts 3
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { graphData } from '../../../data/seed-data';

const dir = __dirname;
const batches = Number(process.argv[2] ?? 3);

// Auto captions roll: each cue repeats the previous line, so keep each line the first time it appears.
function transcript(vtt: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const block of vtt.split(/\n\n+/)) {
    const m = block.match(/^(\d+):(\d+):(\d+)\.\d+ -->/m);
    if (!m) continue;
    const secs = +m[1] * 3600 + +m[2] * 60 + +m[3];
    const stamp = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    for (const line of block.split('\n').slice(1)) {
      const text = line.replace(/<[^>]+>/g, '').trim();
      if (!text || seen.has(text) || / --> /.test(text)) continue;
      seen.add(text);
      out.push(`[${stamp}] ${text}`);
    }
  }
  return out.join('\n');
}

interface Episode { id: string; guest: string; title: string; artistIds: string[] }
interface Ready { id: string; guest: string; title: string; speakers: string[]; transcript: string; lines: number; alreadyLinked: Record<string, string[]> }

const episodes = (JSON.parse(readFileSync(`${dir}/episodes.json`, 'utf8')) as Episode[]).filter(e => e.artistIds.length);
const subs = readdirSync(`${dir}/subs`);
mkdirSync(`${dir}/transcripts`, { recursive: true });

const ready: Ready[] = [];
const seenIds = new Set<string>();
for (const e of episodes) {
  if (seenIds.has(e.id)) continue;
  seenIds.add(e.id);
  // yt-dlp keeps hand-made captions over automatic ones; prefer plain `en` over a regional track.
  const file = subs.filter(f => f.startsWith(e.id + '.')).sort((a, b) => a.length - b.length)[0];
  if (!file) { console.log(`no captions: ${e.id} ${e.guest}`); continue; }
  const path = `research/source-pass/amoeba/transcripts/${e.id}.txt`;
  const text = transcript(readFileSync(`${dir}/subs/${file}`, 'utf8'));
  writeFileSync(`${dir}/transcripts/${e.id}.txt`, text);
  ready.push({
    id: e.id, guest: e.guest, title: e.title, speakers: e.artistIds, transcript: path,
    lines: text.split('\n').length,
    // Targets the map already has for each speaker, so a judge can mark a pick `existing`.
    alreadyLinked: Object.fromEntries(e.artistIds.map(s =>
      [s, graphData.edges.filter(x => x.source === s).map(x => x.target)])),
  });
}

// Deal the episodes out by length so each batch carries a similar amount of reading.
ready.sort((a, b) => b.lines - a.lines);
const out: Ready[][] = Array.from({ length: batches }, () => []);
const load = new Array(batches).fill(0);
for (const ep of ready) {
  const i = load.indexOf(Math.min(...load));
  out[i].push(ep);
  load[i] += ep.lines;
}
out.forEach((b, i) => writeFileSync(`${dir}/judge-${i + 1}.json`, JSON.stringify(b, null, 1)));
console.log(`${ready.length} transcripts; batches of ${out.map(b => b.length).join(' / ')} episodes (${load.join(' / ')} lines)`);
if (existsSync(`${dir}/failed.txt`)) console.log(`failed fetches: ${readFileSync(`${dir}/failed.txt`, 'utf8').trim().split('\n').filter(Boolean).length}`);
