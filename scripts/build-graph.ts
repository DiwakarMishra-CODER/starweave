import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { graphData } from '../data/seed-data';
import type { Artist, Album, GraphData } from '../data/types';
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

// ── Fetch with a hard timeout ─────────────────────────────────────────────────
// Plain fetch() has no timeout: if a third-party API accepts the connection
// and never responds (observed repeatedly against MusicBrainz/CAA after many
// build:data runs in one session — presumably soft rate-limiting by going
// silent rather than returning 429), the whole pipeline hangs forever with
// no error. Every fetch() in this file goes through this instead.
async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── iTunes rate-limit backoff ─────────────────────────────────────────────────
// iTunes Search API throttles hard under sustained use — undocumented exact
// threshold, empirically somewhere around 60-70 rapid requests in one run —
// and does it by returning a non-2xx status (observed as 403) rather than a
// clearly-labeled 429. A genuine "no match" from this endpoint is a 200 with
// an empty results array, never a 404, so any !res.ok here is essentially
// always the rate limit, not a real miss. Earlier code treated the two
// identically, which silently misreported ~150 rate-limited artists as
// "signature song not found on iTunes" in a single run once the graph grew
// past ~70 nodes. Shared across both iTunes call sites in this file (preview
// search and album-cover search) so a block detected by one phase also
// pauses the other, since the loops run fully sequentially and both hit the
// same endpoint/limit.
let itunesBlockedUntil = 0;
let itunesConsecutiveBlocks = 0;

// ── Title/name matching ─────────────────────────────────────────────────────
// Comparisons must survive the ways a store writes a title differently from
// the way this repo does. Two problems, found by auditing all 28 artists that
// were missing a cover or a preview:
//
//   1. STYLISATION. Slayyyter renders every S as a dollar sign, so
//      "WOR$T GIRL IN AMERICA" never contains "worst girl i" and the album read
//      as absent when it was right there. Same class: "OLD FLING$", "$T. LOSER".
//   2. EDITION SUFFIXES. The store's copy is frequently the reissue --
//      "Exile In Guyville (2018 Remaster)", "Atomizer (Remastered)",
//      "Hex Enduction Hour (Expanded Deluxe Edition)", "Superfuzz Bigmuff
//      (Deluxe Edition)". Ours is the plain title, and a strict compare misses.
function normKey(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\$/g, 's')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Drops a trailing "(2018 Remaster)" / "(Deluxe Edition)" style qualifier. */
function stripEdition(title: string): string {
  return title.replace(/\s*[([][^)\]]*(remaster|deluxe|edition|expanded|reissue|anniversary|version|mono|stereo)[^)\]]*[)\]]\s*$/i, '').trim();
}

// Stores censor profanity in track titles: Liz Phair's "Fuck and Run" is sold
// as "F**k and Run". The asterisks survive normKey as gaps, so no prefix test
// can match. Treating the censored string as a SUBSEQUENCE of ours does:
// "f k and run" fits inside "fuck and run" in order, while an unrelated title
// will not. Only used when one side actually contains an asterisk, so it
// cannot loosen ordinary comparisons.
function isSubsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
}

/** True when a store title is our title, allowing stylisation and edition suffixes. */
function titleMatches(ours: string, theirs: string): boolean {
  const a = normKey(stripEdition(ours));
  const b = normKey(stripEdition(theirs));
  if (!a || !b) return false;
  if (a === b || b.startsWith(a) || a.startsWith(b)) return true;
  if (/\*/.test(ours) || /\*/.test(theirs)) {
    const censored = /\*/.test(theirs) ? b : a;
    const full     = /\*/.test(theirs) ? a : b;
    return isSubsequence(censored.replace(/ /g, ''), full.replace(/ /g, ''));
  }
  return false;
}

// Resolve an artist to their iTunes artistId, then read their catalogue
// directly. This is the fallback for the case that defeated the plain search:
// "Liz Phair Exile in Guyville" as a search TERM returns zero results, while
// the same album is plainly present in her catalogue under an artistId lookup.
// Keyword search also returns confident wrong answers -- searching Wilco's
// "Yankee Hotel Foxtrot" returns three cover-version acts and no Wilco -- so
// resolving the artist first and filtering locally is both more complete and
// safer than trusting the search ranking.
const artistIdCache = new Map<string, number | null>();

async function resolveItunesArtistId(artistName: string): Promise<number | null> {
  const key = normKey(artistName);
  if (artistIdCache.has(key)) return artistIdCache.get(key)!;
  let id: number | null = null;
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=5`;
    const res = await fetchItunesWithBackoff(url);
    if (res?.ok) {
      const data = await res.json() as { results: Array<{ artistName: string; artistId: number }> };
      id = data.results.find(r => normKey(r.artistName) === key)?.artistId ?? null;
    }
  } catch { /* leave null */ }
  artistIdCache.set(key, id);
  return id;
}

type CatalogueTrack = {
  wrapperType: string; trackName?: string; collectionName?: string;
  previewUrl?: string; artworkUrl100?: string; artistName?: string;
};

const catalogueCache = new Map<number, CatalogueTrack[]>();

async function fetchItunesCatalogue(artistId: number): Promise<CatalogueTrack[]> {
  const hit = catalogueCache.get(artistId);
  if (hit) return hit;
  let tracks: CatalogueTrack[] = [];
  try {
    const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=200`;
    const res = await fetchItunesWithBackoff(url);
    if (res?.ok) {
      const data = await res.json() as { results: CatalogueTrack[] };
      tracks = (data.results || []).filter(r => r.wrapperType === 'track');
    }
  } catch { /* leave empty */ }
  catalogueCache.set(artistId, tracks);
  return tracks;
}


async function fetchItunesWithBackoff(url: string): Promise<Response | null> {
  const wait = itunesBlockedUntil - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, wait));

  let res: Response;
  try {
    res = await fetchWithTimeout(url);
  } catch {
    return null;
  }
  if (res.ok) {
    itunesConsecutiveBlocks = 0;
    return res;
  }

  itunesConsecutiveBlocks++;
  const backoffMs = Math.min(60_000 * 2 ** (itunesConsecutiveBlocks - 1), 300_000);
  itunesBlockedUntil = Date.now() + backoffMs;
  console.log(`   ⏳ iTunes returned ${res.status} (likely rate-limited) — backing off ${Math.round(backoffMs / 1000)}s`);
  await new Promise(r => setTimeout(r, backoffMs));
  try {
    const retryRes = await fetchWithTimeout(url);
    if (retryRes.ok) {
      itunesConsecutiveBlocks = 0;
      return retryRes;
    }
  } catch { /* fall through to null */ }
  return null;
}

// ── Deezer (public, no auth) — artist images ─────────────────────────────────
// /search/artist gives picture_medium reliably. Track preview endpoints are
// geo-restricted in many regions and return empty data[], so previews come
// from iTunes Search API instead (see below).

async function fetchDeezerImage(name: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=10`,
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      data: Array<{ name: string; picture_medium: string; nb_fan?: number }>;
    };
    // d41d8cd98f00b204e9800998ecf8427e is MD5("") — Deezer's "no image" placeholder
    const withImage = data.data.filter(
      a => !a.picture_medium.includes('d41d8cd98f00b204e9800998ecf8427e'),
    );
    // Among artists sharing the name EXACTLY, take the one with the most fans.
    // Taking the first match instead let Deezer's own ranking decide, and it
    // picks wrong on common words: "Duster" returned a 6.5k-fan act ahead of
    // the 28k-fan slowcore band, and "Coil" returned a 25-fan account ahead of
    // the real 9.8k one. Both shipped visibly wrong photographs. Fan count is
    // a blunt signal but a reliable one for "the artist people mean", and the
    // limit is 10 rather than 3 so the real one is in the candidate set at all.
    const exact = withImage.filter(a => a.name.toLowerCase() === name.toLowerCase());
    const artist =
      exact.sort((x, y) => (y.nb_fan ?? 0) - (x.nb_fan ?? 0))[0] ??
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
      const res = await fetchWithTimeout(url);
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
    const searchRes = await fetchWithTimeout(
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
        const caaRes = await fetchWithTimeout(
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
      const res = await fetchItunesWithBackoff(url);
      if (!res?.ok) return null;
      const data = await res.json() as {
        results: Array<{ artistName: string; collectionName: string; artworkUrl100?: string }>;
      };
      // Must match both album title AND artist — prevents e.g. Goo Goo Dolls "Let Love In"
      // matching a Nick Cave search. Strip "The"/"A", normalize accents for loose artist check.
      const artistKey = artistName.normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/^(the|a|an)\s+/i, '').split(/[\s&,+]/)[0].toLowerCase();
      const match = data.results.find(r =>
        r.artworkUrl100 &&
        // titleMatches handles stylisation ($ for S) and edition suffixes; the
        // old substring test on the first 12 chars failed both.
        (titleMatches(albumTitle, r.collectionName) ||
          r.collectionName.toLowerCase().includes(titleKey.slice(0, 12))) &&
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
  const byTitle = await tryFetch(albumTitle);
  if (byTitle) return byTitle;

  // Last resort: read the artist's catalogue directly. Keyword search can miss
  // an album that is plainly present (Liz Phair's Exile in Guyville returns
  // zero results as a search term) -- see resolveItunesArtistId's comment.
  const artistId = await resolveItunesArtistId(artistName);
  if (artistId === null) return null;
  const tracks = await fetchItunesCatalogue(artistId);
  const hit = tracks.find(t =>
    t.artworkUrl100 && t.collectionName && titleMatches(albumTitle, t.collectionName),
  );
  return hit?.artworkUrl100?.replace('100x100bb', '600x600bb') ?? null;
}

interface AlbumFetchEntry {
  artistId: string;
  artistName: string;
  album: Album;
}

async function enrichAlbumCovers(
  albums: AlbumFetchEntry[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
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

async function fetchItunesPreview(artistName: string, songTitle: string): Promise<ItunesPreview | null> {
  // Strip parenthetical subtitles for matching (e.g. "This Must Be the Place (Naive Melody)" → "this must be the place")
  const songKey = (songTitle.toLowerCase().replace(/\s*\([^)]*\)\s*/g, '').trim() || songTitle.toLowerCase()).slice(0, 25);
  // Skip very short first words like "My", "Yo", "A" — they match too broadly
  const nameParts = artistName.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/^(the|a|an)\s+/i, '').toLowerCase().split(/[\s&,+]/);
  const artistKey = nameParts.find(p => p.length >= 3) ?? nameParts[0];
  // All significant words in the artist name (not just the first) — used by
  // the relaxed fallback below so it still requires SOME real connection to
  // the artist, rather than none at all (see that branch's comment for why).
  const artistWords = nameParts.filter(p => p.length >= 3);

  type Track = { artistName: string; trackName: string; collectionName: string; previewUrl?: string };
  const isUnwanted = (t: Track) => {
    const combined = `${t.trackName} ${t.collectionName}`.toLowerCase();
    return /([\[(]live[)\]]|\blive\s+(at|in|from|version)\b|[\[(]demo[)\]]|[\[(]acoustic[)\]]|\bcover\b|movie clip)/.test(combined);
  };

  const tryFetch = async (term: string) => {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=15`;
      const res = await fetchItunesWithBackoff(url);
      if (!res?.ok) return null;
      const data = await res.json() as { results: Track[] };
      // Prefer: right song + right artist + not live/demo
      const match =
        data.results.find(t =>
          t.previewUrl &&
          t.trackName.toLowerCase().includes(songKey) &&
          t.artistName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(artistKey) &&
          !isUnwanted(t),
        ) ??
        // Fallback: right song + not live/demo, but still requires at least
        // one significant word of the artist's name to appear somewhere in
        // the result's artist name. A fully artist-less fallback (dropping
        // this check to just the song title) confidently returns a same-
        // titled song by a totally unrelated artist whenever the real
        // recording isn't on iTunes at all — which happens (My Bloody
        // Valentine's "When You Sleep" from Loveless isn't on iTunes or
        // Deezer under any search we've tried) — rather than correctly
        // reporting no match.
        data.results.find(t => {
          if (!t.previewUrl || !t.trackName.toLowerCase().includes(songKey) || isUnwanted(t)) return false;
          const tArtist = t.artistName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
          return artistWords.some(w => tArtist.includes(w));
        });
      if (!match?.previewUrl) return null;
      return {
        previewUrl:   match.previewUrl,
        previewTrack: cleanTitle(match.trackName),
        previewAlbum: cleanTitle(match.collectionName),
      };
    } catch { return null; }
  };

  const result = await tryFetch(`${artistName} ${songTitle}`);
  if (result) return result;
  await new Promise(r => setTimeout(r, 100));
  const byTitle = await tryFetch(songTitle);
  if (byTitle) return byTitle;

  // Same catalogue fallback as the cover fetcher. Recovers stylised titles the
  // keyword search cannot reach -- Slayyyter's "BEAT UP CHANEL$" against our
  // "Beat Up Chanels" -- and reissue-only pressings.
  const artistId = await resolveItunesArtistId(artistName);
  if (artistId === null) return null;
  const tracks = await fetchItunesCatalogue(artistId);
  const hit = tracks.find(t =>
    t.previewUrl && t.trackName && titleMatches(songTitle, t.trackName) &&
    !isUnwanted(t as { trackName: string; collectionName: string; artistName: string; previewUrl?: string }),
  );
  if (!hit?.previewUrl || !hit.trackName) return null;
  return {
    previewUrl:   hit.previewUrl,
    previewTrack: cleanTitle(hit.trackName),
    previewAlbum: cleanTitle(hit.collectionName ?? ''),
  };
}

// Some signature songs genuinely aren't on iTunes or Deezer under any
// recording by the actual artist — confirmed by hand, not just a search-
// matching failure (e.g. My Bloody Valentine's back catalog has long had
// messy digital distribution; Pavement's "Range Life" has a history of
// rights friction over its Stone Temple Pilots/Smashing Pumpkins lyric).
// Rather than leave these with no preview at all, search for a different,
// genuinely available track by the same artist instead — signatureSong
// itself is untouched (it's locked/verified data used elsewhere), this only
// changes what plays in the embedded preview player, which always labels
// itself honestly via previewTrack regardless of what's searched for here.
const PREVIEW_TRACK_OVERRIDES: Record<string, string> = {
  'my-bloody-valentine': 'Only Shallow',
  pavement: 'Gold Soundz',
};

async function enrichItunesPreviews(
  artists: Artist[],
): Promise<Map<string, ItunesPreview | null>> {
  const result = new Map<string, ItunesPreview | null>();
  console.log(`  Fetching iTunes previews for ${artists.length} artists…`);
  let hits = 0;
  const misses: string[] = [];
  for (const artist of artists) {
    const song = PREVIEW_TRACK_OVERRIDES[artist.id] ?? artist.signatureSong ?? artist.name;
    const preview = await fetchItunesPreview(artist.name, song);
    result.set(artist.id, preview);
    if (preview) {
      hits++;
    } else {
      misses.push(`${artist.name} — "${song}"`);
    }
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`✓ iTunes previews: ${hits}/${artists.length}`);
  if (misses.length > 0) {
    console.log('\n⚠  Signature songs not found on iTunes:');
    misses.forEach(m => console.log(`   missing preview: ${m}`));
  }
  return result;
}

// ── Enrichment cache ─────────────────────────────────────────────────────────
// public/graph.json is committed to the repo, so the previous run's fetched
// imageUrl/previewUrl/previewTrack/previewAlbum/album-imageUrl values are
// already sitting on disk every time this script runs. Re-fetching all 293
// artists (+ ~290 albums) from Deezer/iTunes/MusicBrainz every single time —
// even for a pure genre-tag or edge edit with zero new artists — is what
// makes build:data take ~20 minutes when the actual enrichment work needed
// is often zero. Read that previous output back in and skip the network
// entirely for anything unchanged.
//
// "Unchanged" is judged per artist by name + signatureSong (both feed the
// search terms sent to Deezer/iTunes) and per album by title, scoped under
// an unchanged artist name (album search terms include the artist name too).
// A new artist id, a rename, or a retitled classic album all correctly fall
// through to a real fetch — this only ever skips work for entries that are
// byte-for-byte the same as what was already successfully resolved.
//
// --force / FORCE_REFETCH=1 bypasses the cache entirely (treats the previous
// output as absent), specifically so the artists/albums that came up empty
// last time — the ~22 missing previews, ~18 missing covers noted in past
// build logs — can be retried by hand later if a source adds coverage.
// Without this, a `null` cached result would never be attempted again.
function loadPreviousArtists(outPath: string): Artist[] {
  try {
    const prev = JSON.parse(readFileSync(outPath, 'utf-8')) as GraphData;
    return prev.artists ?? [];
  } catch {
    return []; // no previous file, or unreadable — everything is treated as new
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  loadEnvLocal();
  console.log('\n🌌 Starweave — build-graph pipeline\n');

  const force = process.argv.includes('--force') || process.env.FORCE_REFETCH === '1';

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

  const outPath = resolve(ROOT, 'public', 'graph.json');
  const oldArtists = force ? [] : loadPreviousArtists(outPath);
  const oldArtistById = new Map(oldArtists.map(a => [a.id, a]));
  if (force) {
    console.log('⚡ --force / FORCE_REFETCH=1 set — ignoring cache, re-fetching everything');
  }

  const needsImageFetch = (a: Artist) => {
    const old = oldArtistById.get(a.id);
    return !old || old.name !== a.name;
  };
  const needsPreviewFetch = (a: Artist) => {
    const old = oldArtistById.get(a.id);
    return !old || old.name !== a.name || old.signatureSong !== a.signatureSong;
  };
  const allAlbumEntries: AlbumFetchEntry[] = graphData.artists.flatMap(a =>
    (a.classicAlbums ?? []).map(al => ({ artistId: a.id, artistName: a.name, album: al })),
  );
  const needsAlbumFetch = ({ artistId, artistName, album }: AlbumFetchEntry) => {
    const old = oldArtistById.get(artistId);
    if (!old || old.name !== artistName) return true;
    const oldAlbum = (old.classicAlbums ?? []).find(x => x.id === album.id);
    return !oldAlbum || oldAlbum.title !== album.title;
  };

  const imageFetchTargets = graphData.artists.filter(needsImageFetch);
  const previewFetchTargets = graphData.artists.filter(needsPreviewFetch);
  const albumFetchTargets = allAlbumEntries.filter(needsAlbumFetch);
  console.log(
    `✓ Cache: ${graphData.artists.length - imageFetchTargets.length}/${graphData.artists.length} images, ` +
    `${graphData.artists.length - previewFetchTargets.length}/${graphData.artists.length} previews, ` +
    `${allAlbumEntries.length - albumFetchTargets.length}/${allAlbumEntries.length} album covers reused unchanged`,
  );

  // Deezer and iTunes previews run in parallel; album covers run after to avoid
  // hitting iTunes rate limits from two simultaneous iTunes fetch loops.
  const [freshImageMap, freshPreviewMap] = await Promise.all([
    enrichDeezerImages(imageFetchTargets),
    enrichItunesPreviews(previewFetchTargets),
  ]);
  const freshAlbumCoverMap = await enrichAlbumCovers(albumFetchTargets);

  // Merge: an id present in the fresh map was actually fetched this run (even
  // a `null` there is a real, current result) and wins outright; anything
  // absent from the fresh map wasn't fetched, so fall back to the cached
  // value from the previous output.
  const imageMap = new Map<string, string | null>();
  for (const a of graphData.artists) {
    imageMap.set(a.id, freshImageMap.has(a.id) ? freshImageMap.get(a.id) ?? null : oldArtistById.get(a.id)?.imageUrl ?? null);
  }
  const previewMap = new Map<string, ItunesPreview | null>();
  for (const a of graphData.artists) {
    if (freshPreviewMap.has(a.id)) {
      previewMap.set(a.id, freshPreviewMap.get(a.id) ?? null);
    } else {
      const old = oldArtistById.get(a.id);
      previewMap.set(a.id, old?.previewUrl
        ? { previewUrl: old.previewUrl, previewTrack: old.previewTrack ?? '', previewAlbum: old.previewAlbum ?? '' }
        : null);
    }
  }
  const albumCoverMap = new Map<string, string | null>();
  for (const { artistId, album } of allAlbumEntries) {
    const key = `${artistId}::${album.id}`;
    if (freshAlbumCoverMap.has(key)) {
      albumCoverMap.set(key, freshAlbumCoverMap.get(key) ?? null);
    } else {
      const oldAlbum = oldArtistById.get(artistId)?.classicAlbums?.find(x => x.id === album.id);
      albumCoverMap.set(key, oldAlbum?.imageUrl ?? null);
    }
  }

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
    scenes:  graphData.scenes,
    edges:   graphData.edges,
    rejectedEdges: graphData.rejectedEdges,
  };

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
