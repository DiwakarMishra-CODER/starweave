import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { graphData } from '../data/seed-data';
import type { Artist, GraphData } from '../data/types';
import { validateEdges, computeInfluenceScores } from './pipeline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ── Env loading ─────────────────────────────────────────────────────────────
// CI sets env vars directly; local dev uses .env.local.
// Only sets values not already in the environment so CI vars always win.
function loadEnvLocal() {
  try {
    const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  } catch { /* absent = fine */ }
}

// ── Deezer (public, no auth) — images only ───────────────────────────────────
// /search/artist gives picture_medium reliably. Track preview endpoints are
// geo-restricted in many regions and return empty data[], so previews come
// from iTunes Search API instead (see below).

async function fetchDeezerImage(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=3`,
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      data: Array<{ name: string; picture_medium: string }>;
    };
    const artist =
      data.data.find(a => a.name.toLowerCase() === name.toLowerCase()) ??
      data.data[0];
    return artist?.picture_medium ?? null;
  } catch {
    return null;
  }
}

async function enrichDeezerImages(
  artists: Artist[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  console.log(`  Fetching Deezer images for ${artists.length} artists…`);
  let hits = 0;
  for (const artist of artists) {
    const imageUrl = await fetchDeezerImage(artist.name);
    result.set(artist.id, imageUrl);
    if (imageUrl) hits++;
    await new Promise(r => setTimeout(r, 80));
  }
  console.log(`✓ Deezer images: ${hits}/${artists.length}`);
  return result;
}

// ── iTunes Search API — 30s previews ─────────────────────────────────────────
// Free, no auth, globally available. Returns AAC preview URLs playable by
// the HTML5 <audio> element. Used instead of Deezer tracks which are
// geo-restricted in many regions.

interface ItunesPreview {
  previewUrl: string;
  previewTrack: string;
  previewAlbum: string;
}

// Strip iTunes noise from track/album names (remaster tags, live dates, etc.)
function cleanTitle(s: string): string {
  return s
    .replace(/\s*[\[(](?:\d{4}\s+)?(?:remaster(?:ed)?(?:\s+version)?|reissue|live[^)\]]*|single version|mono version|bonus track)[)\]]\s*/gi, '')
    .replace(/\s*[\[(][^\])]*(mix|version|edit)[)\]]\s*/gi, '')
    .trim();
}

async function fetchItunesPreview(name: string): Promise<ItunesPreview | null> {
  try {
    const url =
      `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&media=music&entity=song&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as {
      results: Array<{ artistName: string; trackName: string; collectionName: string; previewUrl?: string }>;
    };
    const match =
      data.results.find(
        t => t.previewUrl &&
          t.artistName.toLowerCase().includes(name.toLowerCase().split(' ')[0]),
      ) ?? data.results.find(t => t.previewUrl);
    if (!match?.previewUrl) return null;
    return {
      previewUrl:   match.previewUrl,
      previewTrack: cleanTitle(match.trackName),
      previewAlbum: cleanTitle(match.collectionName),
    };
  } catch {
    return null;
  }
}

async function enrichItunesPreviews(
  artists: Artist[],
): Promise<Map<string, ItunesPreview | null>> {
  const result = new Map<string, ItunesPreview | null>();
  console.log(`  Fetching iTunes previews for ${artists.length} artists…`);
  let hits = 0;
  for (const artist of artists) {
    const preview = await fetchItunesPreview(artist.name);
    result.set(artist.id, preview);
    if (preview) hits++;
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`✓ iTunes previews: ${hits}/${artists.length}`);
  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  loadEnvLocal();
  console.log('\n🌌 Starweave — build-graph pipeline\n');

  const errors = validateEdges(graphData.artists, graphData.edges);
  if (errors.length > 0) {
    console.error('❌ Graph validation failed:\n');
    errors.forEach(e => console.error('   ', e));
    process.exit(1);
  }
  console.log(`✓ Validated ${graphData.artists.length} artists, ${graphData.edges.length} edges`);

  const scores = computeInfluenceScores(graphData.artists, graphData.edges);
  console.log(`✓ Computed influence scores (top: ${
    [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([id, s]) => `${id}=${s}`).join(', ')
  })`);

  if (process.env.SPOTIFY_CLIENT_ID) {
    console.log('ℹ  Spotify enrichment skipped (requires Premium app — using Deezer images instead)');
  }

  // Run both in parallel — independent APIs, no shared state
  const [imageMap, previewMap] = await Promise.all([
    enrichDeezerImages(graphData.artists),
    enrichItunesPreviews(graphData.artists),
  ]);

  const enrichedArtists = graphData.artists.map(a => ({
    ...a,
    influenceScore: scores.get(a.id) ?? 0,
    imageUrl:       imageMap.get(a.id)         ?? null,
    previewUrl:     previewMap.get(a.id)?.previewUrl   ?? null,
    previewTrack:   previewMap.get(a.id)?.previewTrack ?? null,
    previewAlbum:   previewMap.get(a.id)?.previewAlbum ?? null,
  }));

  const output: GraphData = {
    artists: enrichedArtists,
    genres:  graphData.genres,
    edges:   graphData.edges,
  };

  const outPath = resolve(ROOT, 'public', 'graph.json');
  mkdirSync(resolve(ROOT, 'public'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✓ Wrote ${outPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
