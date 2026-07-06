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

// ── Name variants ────────────────────────────────────────────────────────────
// Generates alternative search terms for artists whose canonical name doesn't
// match well against APIs (leading "The", umlauts, " & The …" suffixes, etc.)

function nameVariants(name: string): string[] {
  const variants: string[] = [];
  if (name.startsWith('The ')) variants.push(name.slice(4));
  if (name.startsWith('A '))   variants.push(name.slice(2));
  // Normalize unicode: Hüsker Dü → Husker Du, etc.
  const normalized = name.normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (normalized !== name) variants.push(normalized);
  // Strip " & The …" / " & …" suffix: "Nick Cave & The Bad Seeds" → "Nick Cave"
  const noAmp = name.replace(/\s*[&+]\s.*$/, '').trim();
  if (noAmp !== name && noAmp.length > 2) variants.push(noAmp);
  return [...new Set(variants)];
}

// ── Deezer (public, no auth) — artist images ─────────────────────────────────
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
    // d41d8cd98f00b204e9800998ecf8427e is MD5("") — Deezer's "no image" placeholder
    const withImage = data.data.filter(
      a => !a.picture_medium.includes('d41d8cd98f00b204e9800998ecf8427e'),
    );
    const artist =
      withImage.find(a => a.name.toLowerCase() === name.toLowerCase()) ??
      withImage[0];
    return artist?.picture_medium ?? null;
  } catch {
    return null;
  }
}

// ── Deezer album covers ───────────────────────────────────────────────────────
// Fallback for albums iTunes can't find. /search/album?q= returns cover_xl
// (1000×1000) and cover_medium (250×250).

async function fetchDeezerAlbumCover(artistName: string, albumTitle: string): Promise<string | null> {
  const titleKey = albumTitle.toLowerCase().split(':')[0].trim();
  const tryDeezer = async (term: string) => {
    try {
      const url = `https://api.deezer.com/search/album?q=${encodeURIComponent(term)}&limit=5`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json() as {
        data: Array<{ title: string; cover_xl?: string; cover_medium?: string }>;
      };
      const match =
        data.data.find(d => d.title.toLowerCase().includes(titleKey.slice(0, 10))) ??
        data.data[0];
      return match?.cover_xl ?? match?.cover_medium ?? null;
    } catch {
      return null;
    }
  };
  const full = await tryDeezer(`${artistName} ${albumTitle}`);
  if (full) return full;
  await new Promise(r => setTimeout(r, 80));
  return tryDeezer(albumTitle);
}

async function enrichDeezerImages(
  artists: Artist[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  console.log(`  Fetching Deezer artist images (with name-variant fallback)…`);
  let hits = 0;
  for (const artist of artists) {
    let imageUrl = await fetchDeezerImage(artist.name);
    if (!imageUrl) {
      for (const variant of nameVariants(artist.name)) {
        await new Promise(r => setTimeout(r, 80));
        imageUrl = await fetchDeezerImage(variant);
        if (imageUrl) break;
      }
    }
    result.set(artist.id, imageUrl);
    if (imageUrl) hits++;
    await new Promise(r => setTimeout(r, 80));
  }
  console.log(`✓ Deezer images: ${hits}/${artists.length}`);
  return result;
}

// ── MusicBrainz + Cover Art Archive — album covers ───────────────────────────
// Most comprehensive music DB; CAA serves cover scans for verified releases.
// MusicBrainz rate limit: 1 req/s — caller must enforce delays.
// CAA JSON: /release/{mbid} → images[].thumbnails["500"]

async function fetchMusicBrainzCover(artistName: string, albumTitle: string): Promise<string | null> {
  try {
    // Strip accents so "Hüsker Dü" matches the MB record
    const artistKey = artistName.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const titleKey  = albumTitle.toLowerCase().split(':')[0].trim();
    const query = `artist:"${artistKey}" AND release:"${albumTitle}"`;
    const searchRes = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`,
      { headers: { 'User-Agent': 'Starweave/1.0 (build-script)' } },
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json() as {
      releases: Array<{ id: string; title: string; date?: string }>;
    };

    // Prefer oldest (original) release, filter to title matches
    const releases = [...searchData.releases]
      .filter(r => r.title.toLowerCase().includes(titleKey.slice(0, 8)))
      .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'));

    for (const release of releases) {
      await new Promise(r => setTimeout(r, 250));
      try {
        const caaRes = await fetch(
          `https://coverartarchive.org/release/${release.id}`,
          { headers: { 'User-Agent': 'Starweave/1.0 (build-script)' } },
        );
        if (!caaRes.ok) continue;
        const caa = await caaRes.json() as {
          images: Array<{ front?: boolean; thumbnails?: Record<string, string>; image: string }>;
        };
        const front = caa.images.find(img => img.front) ?? caa.images[0];
        if (!front) continue;
        // CAA uses 'large' (500px) and 'small' (250px) keys, not numeric strings.
        // Force https — CAA sometimes returns http:// which causes mixed-content errors.
        const url = front.thumbnails?.['large'] ?? front.thumbnails?.['500'] ?? front.thumbnails?.['small'] ?? front.thumbnails?.['250'] ?? front.image;
        return url ? url.replace(/^http:\/\//, 'https://') : null;
      } catch { continue; }
    }
    return null;
  } catch {
    return null;
  }
}

// ── iTunes Search API — album covers ─────────────────────────────────────────
// entity=album returns artworkUrl100; replace suffix for 600x600.

async function fetchItunesAlbumCover(artistName: string, albumTitle: string): Promise<string | null> {
  const titleKey = albumTitle.toLowerCase().split(':')[0].trim();
  const tryFetch = async (term: string) => {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=album&limit=5`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json() as {
        results: Array<{ artistName: string; collectionName: string; artworkUrl100?: string }>;
      };
      // Must match both album title AND artist — prevents e.g. Goo Goo Dolls "Let Love In"
      // matching a Nick Cave search. Strip "The"/"A", normalize accents for loose artist check.
      const artistKey = artistName.normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/^(the|a|an)\s+/i, '').split(/[\s&,+]/)[0].toLowerCase();
      const match = data.results.find(r =>
        r.artworkUrl100 &&
        r.collectionName.toLowerCase().includes(titleKey.slice(0, 12)) &&
        r.artistName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(artistKey)
      );
      return match?.artworkUrl100?.replace('100x100bb', '600x600bb') ?? null;
    } catch {
      return null;
    }
  };

  // Primary search: "Artist Album"
  const result = await tryFetch(`${artistName} ${albumTitle}`);
  if (result) return result;
  // Retry with just the album title in case artist name pollutes results
  await new Promise(r => setTimeout(r, 100));
  return tryFetch(albumTitle);
}

async function enrichAlbumCovers(
  artists: Artist[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  const albums = artists.flatMap(a => (a.classicAlbums ?? []).map(al => ({ artistId: a.id, artistName: a.name, album: al })));
  console.log(`  Fetching album covers (iTunes → Deezer → MusicBrainz/CAA)…`);
  let itunesHits = 0, deezerHits = 0, mbHits = 0;
  for (const { artistId, artistName, album } of albums) {
    // Try with canonical name first, then umlaut-stripped variant (e.g. "Hüsker Dü" → "Husker Du")
    const artistVariants = [artistName, ...nameVariants(artistName).filter(v => v !== artistName)];
    let imageUrl: string | null = null;

    // 1. iTunes
    for (const name of artistVariants) {
      imageUrl = await fetchItunesAlbumCover(name, album.title);
      if (imageUrl) break;
      await new Promise(r => setTimeout(r, 80));
    }
    if (imageUrl) {
      itunesHits++;
    } else {
      // 2. Deezer
      for (const name of artistVariants) {
        imageUrl = await fetchDeezerAlbumCover(name, album.title);
        if (imageUrl) break;
        await new Promise(r => setTimeout(r, 80));
      }
      if (imageUrl) {
        deezerHits++;
      } else {
        // 3. MusicBrainz + Cover Art Archive (1 req/s limit — delay before each call)
        await new Promise(r => setTimeout(r, 1100));
        imageUrl = await fetchMusicBrainzCover(artistName, album.title);
        if (imageUrl) mbHits++;
      }
    }
    result.set(`${artistId}::${album.id}`, imageUrl);
    await new Promise(r => setTimeout(r, 80));
  }
  console.log(`✓ Album covers: ${itunesHits + deezerHits + mbHits}/${albums.length} (iTunes: ${itunesHits}, Deezer: ${deezerHits}, MusicBrainz: ${mbHits})`);
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

  // Deezer and iTunes previews run in parallel; album covers run after to avoid
  // hitting iTunes rate limits from two simultaneous iTunes fetch loops.
  const [imageMap, previewMap] = await Promise.all([
    enrichDeezerImages(graphData.artists),
    enrichItunesPreviews(graphData.artists),
  ]);
  const albumCoverMap = await enrichAlbumCovers(graphData.artists);

  const enrichedArtists = graphData.artists.map(a => ({
    ...a,
    influenceScore: scores.get(a.id) ?? 0,
    imageUrl:       imageMap.get(a.id)         ?? null,
    previewUrl:     previewMap.get(a.id)?.previewUrl   ?? null,
    previewTrack:   previewMap.get(a.id)?.previewTrack ?? null,
    previewAlbum:   previewMap.get(a.id)?.previewAlbum ?? null,
    classicAlbums:  (a.classicAlbums ?? []).map(al => ({
      ...al,
      imageUrl: albumCoverMap.get(`${a.id}::${al.id}`) ?? null,
    })),
  }));

  const output: GraphData = {
    artists: enrichedArtists,
    genres:  graphData.genres,
    edges:   graphData.edges,
  };

  const outPath = resolve(ROOT, 'public', 'graph.json');
  mkdirSync(resolve(ROOT, 'public'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✓ Wrote ${outPath}`);

  // ── Report genuinely missing images ────────────────────────────────────────
  const missingArtistImages  = enrichedArtists.filter(a => !a.imageUrl).map(a => a.name);
  const missingAlbumCovers   = enrichedArtists.flatMap(a =>
    (a.classicAlbums ?? []).filter(al => !al.imageUrl).map(al => `${a.name} — ${al.title}`),
  );
  if (missingArtistImages.length || missingAlbumCovers.length) {
    console.log('\n⚠  Still missing after both sources:');
    if (missingArtistImages.length)
      missingArtistImages.forEach(n => console.log(`   artist image : ${n}`));
    if (missingAlbumCovers.length)
      missingAlbumCovers.forEach(n => console.log(`   album cover  : ${n}`));
  } else {
    console.log('✓ All artist images and album covers resolved.');
  }
  console.log();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
