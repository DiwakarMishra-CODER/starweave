import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { graphData } from '../data/seed-data';
import type { Artist, Album, GraphData, ImageCredit } from '../data/types';
import { validateEdges, computeInfluenceScores } from './pipeline';
import { presettleLayout, type LayoutNode, type LayoutLink } from '../lib/graph-layout';

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

// Some artists' catalogues are published on iTunes under a DIFFERENT artist
// name than the one we display, so the exact-name match below can never find
// them and the artist reads as "not digitised" when their whole catalogue is
// actually present. Natural Snow Buildings is the confirmed case: everything
// -- The Dance of the Moon and the Sun, The Winter Ray, 30+ other releases --
// is on iTunes under "NSB Archive", the duo's own reissue imprint.
//
// Keyed by normKey(our display name) -> the name iTunes publishes under. Only
// add an entry after confirming the target artistId really is the same act;
// note "NSB ARCHIVE" (Hip-Hop/Rap) and "NSB Archives" are different accounts,
// exactly the collision class that the nb_fan ranking fix exists for.
const ITUNES_ARTIST_ALIAS: Record<string, string> = {
  [normKey('Natural Snow Buildings')]: 'NSB Archive',
};

async function resolveItunesArtistId(artistName: string): Promise<number | null> {
  const key = normKey(artistName);
  if (artistIdCache.has(key)) return artistIdCache.get(key)!;
  const searchName = ITUNES_ARTIST_ALIAS[key] ?? artistName;
  const matchKey = normKey(searchName);
  let id: number | null = null;
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchName)}&entity=musicArtist&limit=5`;
    const res = await fetchItunesWithBackoff(url);
    if (res?.ok) {
      const data = await res.json() as { results: Array<{ artistName: string; artistId: number }> };
      id = data.results.find(r => normKey(r.artistName) === matchKey)?.artistId ?? null;
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

// ── Artist photo overrides ───────────────────────────────────────────────────
// From a contact-sheet audit of all 297 photos (Oct 2026), which found 38 the
// name search above can't get right on its own:
//
//   deezer — the real artist, pinned by Deezer id. Most of these were a
//            same-name stranger left in the cache by an older, first-match
//            version of fetchDeezerImage ("Low" was a Dutch rapper, "Wilco" a
//            Dutch singer, "Spoon" a compilation); the rest were cached links Deezer had since
//            re-hashed, which now redirect to its grey placeholder (Joy
//            Division, Can, The Rapture…).
//   url    — an Apple Music artist image (mzstatic, stored at 250 like the
//            Deezer ones), where Deezer only has album art or a logo.
//   file   — a freely licensed Wikimedia Commons photo, served from
//            public/photos/ (Wikimedia's own 960px rendition, or the
//            original where that is smaller; never cropped) because
//            hotlinking its thumbnails gets rate-limited.
//            The licence asks for the credit, which the pages show.
//   cover  — no photo of the band anywhere usable; their own record's cover
//            stands in, as artwork already does for Burial or Parannoul.
//
// Left alone on purpose: faceless acts whose artwork IS their public face
// (2814, Burial, Boards of Canada, Mid-Air Thief). Parannoul, Panchiko,
// death's dynamic shroud, Candy Claws and Women keep their platform image
// only because Commons has nothing usable of them (Oct 2026): distant stage
// shots, or a wide frame whose square crop misses both people.
type PhotoOverride =
  | { deezer: number }
  | { url: string }
  | { file: string; credit: ImageCredit }
  | { cover: true };

const APPLE = 'https://is1-ssl.mzstatic.com/image/thumb';
const ARTIST_PHOTO: Record<string, PhotoOverride> = {
  // same-name strangers and stale links
  'arca':                { deezer: 54453 },
  'beck':                { deezer: 408 },
  'broken-social-scene': { deezer: 2020 },
  'can':                 { deezer: 2344 },
  'destroyer':           { deezer: 75819 },
  'geese':               { deezer: 137555232 },
  'grouper':             { deezer: 402944 },
  'joy-division':        { deezer: 1249 },
  'low':                 { deezer: 4377 },
  'mono':                { deezer: 3075 },
  'sophie':              { deezer: 6478881 },
  'spoon':               { deezer: 1280 },
  'st-vincent':          { deezer: 14630 },
  'suicide':             { deezer: 4132 },
  'the-rapture':         { deezer: 1363 },
  'wednesday':           { deezer: 87096062 },
  'wilco':               { deezer: 1700 },

  // Apple Music artist images
  'cap-n-jazz':         { url: `${APPLE}/AMCArtistImages221/v4/8b/4e/f4/8b4ef4e4-39ba-e461-a548-3497d25e68b0/ami-identity-1b8798748045596bb52b6eaa1703301c-2025-11-12T18-42-10.079Z_cropped.png/250x250cc.jpg` },
  'dead-kennedys':      { url: `${APPLE}/AMCArtistImages221/v4/4c/50/a9/4c50a9e9-355c-05f0-c1c4-5d9697f531ff/ami-identity-8ab127697c7b33b8d398e6f637a3ec1e-2025-03-27T21-36-21.544Z_cropped.png/250x250cc.jpg` },
  'descendents':        { url: `${APPLE}/Features115/v4/a7/fd/f8/a7fdf886-b64f-be32-7828-4204047a6f7e/mzl.iynpkclc.jpg/250x250cc.jpg` },
  'faust':              { url: `${APPLE}/Features115/v4/d3/b4/72/d3b472f5-ab27-e08a-a413-27626d73307b/mzl.dfqfspsd.jpg/250x250cc.jpg` },
  'japanese-breakfast': { url: `${APPLE}/AMCArtistImages221/v4/14/f7/4f/14f74f28-c482-c66b-13f5-c4c36f46f2b2/ami-identity-1133256b8c91515ecb37bfe679d3c1ba-2025-01-06T16-15-25.746Z_cropped.png/250x250cc.jpg` },
  'mars':               { url: `${APPLE}/Music/60/08/11/mzi.qjgqqkiu.tif/250x250cc.jpg` },
  'rites-of-spring':    { url: `${APPLE}/Features124/v4/68/df/d8/68dfd8a6-1752-daae-43a9-369892e1295e/mzl.jypxszwr.jpg/250x250cc.jpg` },
  'songs-ohia':         { url: `${APPLE}/Features125/v4/9d/fa/ad/9dfaadad-63f0-d8f2-8f7a-1a15a4e61051/pr_source.png/250x250cc.jpg` },
  'swans':              { url: `${APPLE}/Features221/v4/d8/04/1f/d8041f00-1f3b-3826-8d8c-e4021dcd85c6/mzl.tonhmqcz.jpg/250x250cc.jpg` },

  // Wikimedia Commons
  'ariel-pink': { file: '/photos/ariel-pink.jpg', credit: { author: 'Dustin Drew', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Ariel_Pink%27s_Haunted_Graffiti,_FYF_2010_(4975726091).jpg' } },
  'bon-iver': { file: '/photos/bon-iver.jpg', credit: { author: 'Simon.Appelblad', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Bon_Iver_3.jpg' } },
  'bonnie-prince-billy': { file: '/photos/bonnie-prince-billy.jpg', credit: { author: 'Neff Conner', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Bonnie-Prince-Billy-060609_(614bw)_(3606166772)_(cropped).jpg' } },
  'bratmobile': { file: '/photos/bratmobile.jpg', credit: { author: 'Greg Neate', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Bratmobile.jpg' } },
  'christie-front-drive': { file: '/photos/christie-front-drive.jpg', credit: { author: 'denverkid', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Christie_Front_Drive.jpg' } },
  // Arto Lindsay alone, decades on: no photo of DNA as a band is free to use
  'dna': { file: '/photos/dna.jpg', credit: { author: 'Kaethe17', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Arto-lindsay-2026.jpg' } },
  'godspeed-you-black-emperor': { file: '/photos/godspeed-you-black-emperor.jpg', credit: { author: 'Grywnn', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Godspeed_You!_Black_Emperor_@_Roadburn_Festival_2018-04-21_003.jpg' } },
  'james-chance-and-the-contortions': { file: '/photos/james-chance-and-the-contortions.jpg', credit: { author: 'Braunov', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:James_White_1981_2.jpg' } },
  'mogwai': { file: '/photos/mogwai.jpg', credit: { author: 'S. Bollmann', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Mogwai_Melt!_2015_04.jpg' } },
  'porter-robinson': { file: '/photos/porter-robinson.jpg', credit: { author: 'Chan4est', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Porter_Robinson_SMILE!_-D_listening_party_(cropped).png' } },
  'radiohead': { file: '/photos/radiohead.jpg', credit: { author: 'Raph_PH', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Radiohead_-_The_O2_-_Monday_24th_November_2025.jpg' } },
  'squid': { file: '/photos/squid.jpg', credit: { author: 'Paul Hudson from United Kingdom', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Squid_at_the_Wide_Awake_Festival_(51427598430).jpg' } },
  'the-cure': { file: '/photos/the-cure.jpg', credit: { author: 'Raph_PH', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:CureTroxy011124_(35_of_139)_(54115038895).jpg' } },
  // Charles Hayward alone, in 2007: no photo of This Heat as a band is free to use
  'this-heat': { file: '/photos/this-heat.jpg', credit: { author: 'roomtemperature.org / Fergus Kelly', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:CharlesHayward_May2007.jpg' } },
  'turnstile': { file: '/photos/turnstile.jpg', credit: { author: 'S. Bollmann', license: 'Attribution', url: 'https://commons.wikimedia.org/wiki/File:Turnstile_Full_Force_2019_02.jpg' } },
  'underscores': { file: '/photos/underscores.jpg', credit: { author: 'jwx8', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Underscores_in_Los_Angeles,_15_April_2026_(cropped).jpg' } },

  // the band's own record stands in
  'far-apart': { cover: true },
};

async function fetchDeezerImageById(id: number): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`https://api.deezer.com/artist/${id}`);
    if (!res.ok) return null;
    const data = await res.json() as { picture_medium?: string };
    return data.picture_medium ?? null;
  } catch {
    return null;
  }
}

// A cached Deezer link can die without the artist changing: Deezer re-hashes
// a picture when the artist uploads a new one, and the old URL then 302s to
// its grey placeholder. Joy Division shipped like that, unnoticed, because
// the cache only re-fetches on a rename. A HEAD per cached photo (in small
// parallel batches) catches it every build for the cost of a few seconds.
async function isImageAlive(url: string): Promise<boolean> {
  if (!url.startsWith('http')) return true; // our own public/ files
  try {
    const res = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'manual' });
    return res.status === 200;
  } catch {
    return true; // a timeout says nothing about the link; don't churn on it
  }
}

async function findDeadImages(artists: Artist[]): Promise<Set<string>> {
  const dead = new Set<string>();
  const BATCH = 12;
  for (let i = 0; i < artists.length; i += BATCH) {
    const batch = artists.slice(i, i + BATCH);
    const alive = await Promise.all(batch.map(a => isImageAlive(a.imageUrl!)));
    batch.forEach((a, j) => { if (!alive[j]) dead.add(a.id); });
  }
  return dead;
}

async function enrichDeezerImages(
  artists: Artist[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  console.log(`  Fetching Deezer artist images (with name-variant fallback)…`);
  let hits = 0;
  for (const artist of artists) {
    const pinned = ARTIST_PHOTO[artist.id];
    if (pinned && 'deezer' in pinned) {
      const imageUrl = await fetchDeezerImageById(pinned.deezer);
      result.set(artist.id, imageUrl);
      if (imageUrl) hits++;
      await new Promise(r => setTimeout(r, 80));
      continue;
    }
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

// ── Album cover overrides ────────────────────────────────────────────────────
// Keyed `${artistId}::${albumId}`. From the same Oct 2026 audit: two covers
// the search got wrong (a Cover Art Archive scan of Punisher's barcode
// sticker, a photo of Bury Me at Makeout Creek's vinyl disc) and six it never
// found. Those six were thought undigitised; they weren't — No New York, Buy,
// A Taste of DNA and 2814's record all sit on the Cover Art Archive under
// their release group, and Shōso Strip is in Apple's Japanese store.
const CAA = 'https://coverartarchive.org/release';
const ALBUM_COVER: Record<string, string> = {
  'phoebe-bridgers::punisher':                 `${APPLE}/Music115/v4/39/91/4f/39914f60-e9aa-4ae9-3962-44b0a5e5d570/656605150062.jpg/600x600bb.jpg`,
  'mitski::bury-me-at-makeout-creek':          `${APPLE}/Music211/v4/bf/11/65/bf116592-f8eb-fbed-4255-f43b4b09e651/37052.jpg/600x600bb.jpg`,
  'sheena-ringo::shoso-strip':                 `${APPLE}/Music125/v4/17/d2/81/17d281fc-298d-f5c3-b69c-f557a423850d/00602567661245.rgb.jpg/600x600bb.jpg`,
  'mars::no-new-york-mars':                    `${CAA}/127e8422-5111-4ebb-beea-8c916fbcf225/11433840498-500.jpg`,
  'teenage-jesus-and-the-jerks::no-new-york':  `${CAA}/127e8422-5111-4ebb-beea-8c916fbcf225/11433840498-500.jpg`,
  'james-chance-and-the-contortions::buy':     `${CAA}/398cb433-376c-4ce4-8884-01c555021d4a/17936278882-500.jpg`,
  'dna::a-taste-of-dna':                       `${CAA}/9dc553dd-2807-4aac-84d7-ee5b11528823/46213543258-500.jpg`,
  '2814::birth-of-a-new-day':                  `${CAA}/ffb1c808-7e37-4415-9449-9cd839545dfb/22277033080-500.jpg`,
};

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

  // Pinned Deezer ids are re-read every build (a handful of calls) so they
  // can't go stale; url/file/cover overrides need no fetch at all.
  const photoOverride = (a: Artist) => ARTIST_PHOTO[a.id];
  const isPinnedDeezer = (a: Artist) => { const o = photoOverride(a); return !!o && 'deezer' in o; };
  const needsImageFetch = (a: Artist) => {
    const o = photoOverride(a);
    if (o && !('deezer' in o)) return false;
    if (o) return true;
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
    if (ALBUM_COVER[`${artistId}::${album.id}`]) return false;
    const old = oldArtistById.get(artistId);
    if (!old || old.name !== artistName) return true;
    const oldAlbum = (old.classicAlbums ?? []).find(x => x.id === album.id);
    return !oldAlbum || oldAlbum.title !== album.title;
  };

  const cachedPhotos = graphData.artists.filter(a =>
    !needsImageFetch(a) && !photoOverride(a) && oldArtistById.get(a.id)?.imageUrl,
  ).map(a => ({ ...a, imageUrl: oldArtistById.get(a.id)!.imageUrl }));
  const deadPhotos = await findDeadImages(cachedPhotos);
  if (deadPhotos.size > 0) {
    console.log(`  ${deadPhotos.size} cached photo link(s) dead, re-fetching: ${[...deadPhotos].join(', ')}`);
  }
  const imageFetchTargets = graphData.artists.filter(a => needsImageFetch(a) || deadPhotos.has(a.id));
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
  // A pinned Deezer id that came back empty (network blip) keeps last
  // build's picture rather than dropping to no photo.
  for (const a of graphData.artists) {
    if (isPinnedDeezer(a) && !imageMap.get(a.id)) imageMap.set(a.id, oldArtistById.get(a.id)?.imageUrl ?? null);
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
    if (ALBUM_COVER[key]) {
      albumCoverMap.set(key, ALBUM_COVER[key]);
    } else if (freshAlbumCoverMap.has(key)) {
      albumCoverMap.set(key, freshAlbumCoverMap.get(key) ?? null);
    } else {
      const oldAlbum = oldArtistById.get(artistId)?.classicAlbums?.find(x => x.id === album.id);
      albumCoverMap.set(key, oldAlbum?.imageUrl ?? null);
    }
  }

  // url/file/cover overrides resolve last: `cover` needs the album covers.
  // imageCredit stays undefined (so JSON.stringify leaves it out) for every
  // photo that doesn't need one.
  const photoFor = (a: Artist): { imageUrl: string | null; imageCredit?: ImageCredit } => {
    const o = photoOverride(a);
    if (o && 'url' in o) return { imageUrl: o.url };
    if (o && 'file' in o) return { imageUrl: o.file, imageCredit: o.credit };
    if (o && 'cover' in o) {
      const first = a.classicAlbums?.[0];
      return { imageUrl: first ? albumCoverMap.get(`${a.id}::${first.id}`) ?? null : null };
    }
    return { imageUrl: imageMap.get(a.id) ?? null };
  };

  const enrichedArtists = graphData.artists.map(a => ({
    ...a,
    influenceScore: scores.get(a.id) ?? 0,
    ...photoFor(a),
    previewUrl:     previewMap.get(a.id)?.previewUrl   ?? null,
    previewTrack:   previewMap.get(a.id)?.previewTrack ?? null,
    previewAlbum:   previewMap.get(a.id)?.previewAlbum ?? null,
    classicAlbums:  (a.classicAlbums ?? []).map(al => ({
      ...al,
      imageUrl: albumCoverMap.get(`${a.id}::${al.id}`) ?? null,
    })),
  }));

  // Settle the map's layout once, here, instead of in every visitor's browser
  // (it used to cost ~0.5s of frozen main thread on every cold load). Same
  // function, same inputs in the same order as the canvas would use, so the
  // positions are the ones the browser would have computed; rounded to 0.01
  // of a graph unit, which no zoom level can show.
  const layoutNodes: LayoutNode[] = enrichedArtists.map(a => ({ id: a.id, realm: a.realm, influenceScore: a.influenceScore }));
  const layoutLinks: LayoutLink[] = graphData.edges.map(e => ({ ...e }));
  presettleLayout(layoutNodes, layoutLinks);
  const settled = new Map(layoutNodes.map(n => [n.id, n]));
  const round = (v: number | undefined) => (v === undefined ? undefined : Math.round(v * 100) / 100);
  const positionedArtists = enrichedArtists.map(a => ({
    ...a,
    x: round(settled.get(a.id)?.x),
    y: round(settled.get(a.id)?.y),
  }));
  console.log(`✓ Settled the layout (${layoutNodes.length} positions)`);

  const output: GraphData = {
    artists: positionedArtists,
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
