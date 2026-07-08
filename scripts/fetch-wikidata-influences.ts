// ─────────────────────────────────────────────────────────────────────────
// One-time research script — fetches "influenced by" (P737) data from
// Wikidata for our current artist roster + 14 candidate artists.
//
// READ-ONLY: this does not touch data/seed-data.ts, public/graph.json, or
// any other project data. It only writes scripts/output/wikidata-influences.json
// for manual analysis.
//
// Design notes:
//  - Artist NAME RESOLUTION uses Wikidata's plain wbsearchentities REST API
//    (https://www.wikidata.org/w/api.php?action=wbsearchentities). SPARQL is
//    not well suited to fuzzy text search — this is the standard,
//    recommended way to go from a name to a ranked list of candidate Q-IDs.
//    A wide net (top 50) is used deliberately: spot-checking during
//    development showed that even an EXACT label match (e.g. "Nico", the
//    Velvet Underground singer, Q44634) can rank below 20th place against
//    more "prominent" unrelated entities sharing the name (Nicolas Cage,
//    Nicolaus Copernicus, a chemical compound, etc.). Exact-label matches
//    are also prioritized over fuzzy/alias matches before falling back to
//    plain relevance order, specifically to catch cases like this.
//  - TYPE VERIFICATION (is this candidate actually a musician/band?) and the
//    actual P737 ("influenced by") graph traversal both run as real SPARQL
//    queries against https://query.wikidata.org/sparql, per the brief.
//  - Every request carries a descriptive User-Agent (Wikidata requires this)
//    and requests run strictly sequentially with a fixed delay between them
//    — this is a slow, polite, one-time script, not a bulk scraper.
//
// Run: npx tsx scripts/fetch-wikidata-influences.ts
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { graphData } from '../data/seed-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const SEARCH_ENDPOINT = 'https://www.wikidata.org/w/api.php';
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// Wikidata requires a descriptive User-Agent identifying the tool and a
// contact point — untagged traffic gets rate-limited or blocked outright.
const USER_AGENT =
  'StarweaveResearchScript/1.0 (https://github.com/DiwakarMishra-CODER/starweave; one-time manual research fetch, not for redistribution)';

// Sequential, ~1 request/second — polite spacing per Wikidata's usage policy.
const REQUEST_DELAY_MS = 1000;
const RETRY_DELAY_MS = 3000;

const CANDIDATE_ARTISTS = [
  'Slint',
  'Guided By Voices',
  'Built to Spill',
  'Modest Mouse',
  'The White Stripes',
  'Blur',
  'Pulp',
  'Stereolab',
  'Spiritualized',
  'The Flaming Lips',
  'Fugazi',
  'Minor Threat',
  'Fontaines D.C.',
  'IDLES',
];

// P31 (instance of) values that qualify as a band/group in their own right.
const BAND_TYPES = new Set([
  'Q215380',  // musical group
  'Q2088357', // musical ensemble
  'Q5741069', // rock band
]);

// P106 (occupation) values that qualify a human (P31 = Q5) as a musician.
const MUSIC_OCCUPATIONS = new Set([
  'Q639669',   // musician
  'Q177220',   // singer
  'Q488205',   // singer-songwriter
  'Q36834',    // composer
  'Q855091',   // guitarist
  'Q386854',   // drummer
  'Q584301',   // bassist
  'Q183945',   // record producer
  'Q130857',   // disc jockey
  'Q753110',   // songwriter
  'Q2252262',  // rapper
  'Q1327329',  // multi-instrumentalist
  'Q1259917',  // violinist
]);
const HUMAN_TYPE = 'Q5';

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function qidFromUri(uri: string): string {
  return uri.split('/').pop() ?? uri;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────

async function getJson(url: string, label: string): Promise<any | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.log(`    ⚠ ${label} failed (attempt ${attempt}/2): ${(err as Error).message}`);
      if (attempt < 2) await sleep(RETRY_DELAY_MS);
    }
  }
  return null;
}

async function sparql(query: string, label: string): Promise<any | null> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  return getJson(url, `SPARQL: ${label}`);
}

// ── Step 1: name → ranked candidate Q-IDs (wbsearchentities) ───────────────

interface Candidate {
  qid: string;
  label: string;
  exactMatch: boolean;
}

async function searchCandidates(name: string): Promise<Candidate[]> {
  const url =
    `${SEARCH_ENDPOINT}?action=wbsearchentities&search=${encodeURIComponent(name)}` +
    `&language=en&type=item&format=json&limit=50`;
  const data = await getJson(url, `search "${name}"`);
  if (!data?.search) return [];
  return data.search.map((r: any) => ({
    qid: r.id,
    label: r.label ?? r.display?.label?.value ?? '',
    exactMatch: (r.label ?? '').toLowerCase() === name.toLowerCase(),
  }));
}

// ── Step 2: batch type-check candidates via SPARQL (P31 + P106) ───────────

async function checkTypes(
  qids: string[],
): Promise<Map<string, { instanceOf: Set<string>; occupation: Set<string> }>> {
  const result = new Map<string, { instanceOf: Set<string>; occupation: Set<string> }>();
  if (qids.length === 0) return result;

  const values = qids.map(q => `wd:${q}`).join(' ');
  const query = `
    SELECT ?item ?instanceOf ?occupation WHERE {
      VALUES ?item { ${values} }
      OPTIONAL { ?item wdt:P31 ?instanceOf . }
      OPTIONAL { ?item wdt:P106 ?occupation . }
    }
  `;
  const data = await sparql(query, 'type-check batch');
  if (!data?.results?.bindings) return result;

  for (const b of data.results.bindings) {
    const qid = qidFromUri(b.item.value);
    if (!result.has(qid)) result.set(qid, { instanceOf: new Set(), occupation: new Set() });
    const entry = result.get(qid)!;
    if (b.instanceOf) entry.instanceOf.add(qidFromUri(b.instanceOf.value));
    if (b.occupation) entry.occupation.add(qidFromUri(b.occupation.value));
  }
  return result;
}

function isMusicRelated(types: { instanceOf: Set<string>; occupation: Set<string> }): boolean {
  for (const t of types.instanceOf) {
    if (BAND_TYPES.has(t)) return true;
  }
  if (types.instanceOf.has(HUMAN_TYPE)) {
    for (const o of types.occupation) {
      if (MUSIC_OCCUPATIONS.has(o)) return true;
    }
  }
  return false;
}

// Resolve a name to a single Wikidata Q-ID, matching on name + musician/
// band/musical-group type to avoid disambiguation errors. Exact label
// matches are checked (in rank order) before fuzzy/alias matches. Returns
// null — "unresolved" — rather than guessing when nothing passes.
async function resolveArtist(name: string): Promise<Candidate | null> {
  const candidates = await searchCandidates(name);
  await sleep(REQUEST_DELAY_MS);
  if (candidates.length === 0) return null;

  const exact = candidates.filter(c => c.exactMatch);
  const fuzzy = candidates.filter(c => !c.exactMatch);
  const orderedCandidates = [...exact, ...fuzzy];

  const typeMap = await checkTypes(orderedCandidates.map(c => c.qid));
  await sleep(REQUEST_DELAY_MS);

  for (const c of orderedCandidates) {
    const types = typeMap.get(c.qid);
    if (types && isMusicRelated(types)) return c;
  }
  return null;
}

// ── P737 "influenced by" fetch (SPARQL) ────────────────────────────────────

interface InfluenceRef {
  qid: string;
  label: string;
}

async function fetchInfluences(qid: string): Promise<InfluenceRef[]> {
  const query = `
    SELECT ?influence ?influenceLabel WHERE {
      wd:${qid} wdt:P737 ?influence .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
  `;
  const data = await sparql(query, `P737 for ${qid}`);
  if (!data?.results?.bindings) return [];
  return data.results.bindings.map((b: any) => ({
    qid: qidFromUri(b.influence.value),
    label: b.influenceLabel?.value ?? qidFromUri(b.influence.value),
  }));
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const currentArtists = graphData.artists.map(a => a.name);
  const allNames = [...currentArtists, ...CANDIDATE_ARTISTS];

  console.log(
    `Starweave × Wikidata influence research\n` +
      `Resolving ${allNames.length} artists ` +
      `(${currentArtists.length} current graph + ${CANDIDATE_ARTISTS.length} candidates)…\n`,
  );

  // ── Resolve every artist ──────────────────────────────────────────────
  const resolved: Record<string, { qid: string; wikidataLabel: string }> = {};
  const unresolved: string[] = [];

  for (const name of allNames) {
    process.stdout.write(`  Resolving "${name}"... `);
    const match = await resolveArtist(name);
    if (match) {
      resolved[name] = { qid: match.qid, wikidataLabel: match.label };
      console.log(`✓ ${match.qid} (${match.label})`);
    } else {
      unresolved.push(name);
      console.log('✗ unresolved');
    }
  }

  console.log(
    `\nResolved ${Object.keys(resolved).length}/${allNames.length}. ` +
      `Fetching P737 "influenced by" data (hop 1)…\n`,
  );

  // ── Hop 1: each resolved artist's P737 influences ────────────────────
  const inSetQids = new Set(Object.values(resolved).map(r => r.qid));

  const artistInfluences: Record<
    string,
    { qid: string; wikidataLabel: string; influences: { name: string; qid: string; status: 'in-set' | 'external' }[] }
  > = {};
  const externalTally = new Map<string, { qid: string; label: string; citedBy: string[] }>();

  for (const [name, { qid, wikidataLabel }] of Object.entries(resolved)) {
    process.stdout.write(`  Influences for "${name}" (${qid})... `);
    const influences = await fetchInfluences(qid);
    await sleep(REQUEST_DELAY_MS);
    console.log(`${influences.length} found`);

    artistInfluences[name] = {
      qid,
      wikidataLabel,
      influences: influences.map(inf => ({
        name: inf.label,
        qid: inf.qid,
        status: inSetQids.has(inf.qid) ? 'in-set' : 'external',
      })),
    };

    for (const inf of influences) {
      if (!inSetQids.has(inf.qid)) {
        if (!externalTally.has(inf.qid)) {
          externalTally.set(inf.qid, { qid: inf.qid, label: inf.label, citedBy: [] });
        }
        externalTally.get(inf.qid)!.citedBy.push(name);
      }
    }
  }

  console.log(
    `\nFound ${externalTally.size} unique external influences. ` +
      `Fetching their own influences (hop 2)…\n`,
  );

  // ── Hop 2: each external influence's own P737 influences ─────────────
  const externalHop2 = new Map<string, InfluenceRef[]>();
  for (const [qid, info] of externalTally) {
    process.stdout.write(`  Hop-2 for "${info.label}" (${qid})... `);
    const influences = await fetchInfluences(qid);
    await sleep(REQUEST_DELAY_MS);
    console.log(`${influences.length} found`);
    externalHop2.set(qid, influences);
  }

  // ── Assemble + write output ────────────────────────────────────────────
  const influenceCounts = Object.values(artistInfluences).map(a => a.influences.length);
  const artistsWithData = influenceCounts.filter(n => n > 0).length;
  const totalInfluenceLinks = influenceCounts.reduce((s, n) => s + n, 0);

  const output = {
    generatedAt: new Date().toISOString(),
    source: 'https://query.wikidata.org/sparql (P737 "influenced by")',
    summary: {
      totalArtists: allNames.length,
      currentGraphArtists: currentArtists.length,
      candidateArtists: CANDIDATE_ARTISTS.length,
      resolved: Object.keys(resolved).length,
      unresolved: unresolved.length,
      artistsWithAtLeastOneInfluence: artistsWithData,
      totalInfluenceLinks,
      uniqueExternalInfluences: externalTally.size,
    },
    artists: artistInfluences,
    unresolvedArtists: unresolved,
    externalInfluences: Array.from(externalTally.values())
      .sort((a, b) => b.citedBy.length - a.citedBy.length)
      .map(e => ({
        name: e.label,
        qid: e.qid,
        citationCount: e.citedBy.length,
        citedBy: e.citedBy,
        theirInfluences: (externalHop2.get(e.qid) ?? []).map(inf => ({ name: inf.label, qid: inf.qid })),
      })),
  };

  const outDir = resolve(ROOT, 'scripts', 'output');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'wikidata-influences.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\n✓ Wrote ${outPath}\n`);
  console.log('Summary:');
  console.log(`  Resolved:   ${Object.keys(resolved).length}/${allNames.length}`);
  console.log(`  Unresolved: ${unresolved.length}${unresolved.length ? ` (${unresolved.join(', ')})` : ''}`);
  console.log(`  Artists with ≥1 P737 influence: ${artistsWithData}/${Object.keys(resolved).length}`);
  console.log(`  Total influence links found:    ${totalInfluenceLinks}`);
  console.log(`  Unique external influences:     ${externalTally.size}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
