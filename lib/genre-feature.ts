import type { GraphData } from '@/data/types';
import { GENRE_PAGES } from '@/data/genre-pages';
import { DEFAULT_GENRE_COLOR, GENRE_COLORS, readableInk } from '@/lib/colors';
import { antonWidth, buildGenreSession } from '@/lib/genre-session';
import { getGenreLineage } from '@/lib/genre-lineage';
import { whyFor } from '@/lib/home-story';
import type { Queue } from '@/lib/player';
// The player's own module is browser-only (see the tape queue below).
const SONG_MS = 30000;

// A genre's page: its feature inside today's issue of the paper (/genres),
// with a free tape stuck to the front. This file is the data, pure and
// worked out on the server; components/genre draws it.
//
// - The opening spread: the genre's most-named artist as a riso print in its
//   family's colour, the tape on it, the name as a headline sized so its
//   longest word fits the page.
// - The article: how it started (with a pull quote in one of its own
//   artists' words), the sound, the essential records (ranked, the first
//   one to start with), who plays it.
// - Its road from the city: the signs it came from, its own, where it went.

export const PAPER = '#efe6d1';
export const TAPE_STOP_MS = 8000; // a few seconds of each band, like Play the room
// The headline's room: the right-hand page's text column.
export const HEADLINE_W = 520;
export const HEADLINE_MAX_PX = 150;
export const HEADLINE_MIN_PX = 60;
const HEADLINE_TRACKING = 0.005; // em, as on the cover

/** How many of the first on the map to play a genre lead its story. */
export const FIRST_WAVE = 6;

export interface FeatureArtist {
  id: string;
  name: string;
  imageUrl: string | null;
  activeFrom: number | null;
  previewUrl: string | null;
}

export interface FeatureRecord {
  artistId: string;
  artistName: string;
  artistImage: string | null;
  title: string;
  year: number | null;
  imageUrl: string | null;
  review: string;
  /** A song from this very record (scripts/build-graph's album songs). */
  song: string | null;
  previewUrl: string | null;
}

export interface FeatureSign {
  id: string;
  name: string;
  emerged: number | null;
  color: string;
}

export interface FeatureStep {
  id: string;
  name: string;
  /** Its family's colour: what shows under the page's corner as it lifts. */
  color: string;
}

export interface GenreFeature {
  id: string;
  name: string;
  emerged: number | null;
  emergedBasis: string | null;
  color: string;
  /** The colour darkened to read as ink on the paper. */
  ink: string;
  familyName: string | null;
  folio: number;
  headlinePx: number;
  deck: string;
  origin: string[];
  sound: string;
  /** Somebody's own words, or (for the few with none) the line it was born on. */
  pull: { quote: string; speaker: string; about: string | null } | { born: string };
  lead: FeatureArtist | null;
  artistCount: number;
  records: FeatureRecord[];
  groups: { title: string; blurb: string; artists: FeatureArtist[] }[];
  /** The first on the map to play it, oldest first, with their photos: the
   *  strip across the top of How it started. */
  firstWave: FeatureArtist[];
  road: { ancestors: FeatureSign[]; self: FeatureSign; children: FeatureSign[]; borrowed: FeatureSign[] };
  prev: FeatureStep;
  next: FeatureStep;
  queue: Queue;
  /** The essential records, a song from each, in their ranked order. */
  recordsQueue: Queue;
}

/** The largest headline size at which every word of the name fits the page. */
export function headlinePx(name: string): number {
  // Hyphenated names may break after the hyphen, as the browser would.
  const words = name.toUpperCase().split(' ').flatMap(w => w.split(/(?<=-)/));
  const widest = Math.max(...words.map(w => antonWidth(w, 1, HEADLINE_TRACKING)));
  return Math.max(HEADLINE_MIN_PX, Math.min(HEADLINE_MAX_PX, Math.floor(HEADLINE_W / widest)));
}

/** The order the features run in: the city's, family by family, oldest
 *  first; the two undated containers (electronic, folk) at the back. */
export function featureOrder(data: GraphData): string[] {
  const session = buildGenreSession(data);
  const familyAt = new Map(session.families.map((f, i) => [f.id, i]));
  const dated = session.clips
    .slice()
    .sort((a, b) => (familyAt.get(a.familyId) ?? 99) - (familyAt.get(b.familyId) ?? 99) || a.emerged - b.emerged || a.name.localeCompare(b.name))
    .map(c => c.id);
  const rest = data.genres.filter(g => !dated.includes(g.id)).map(g => g.id).sort();
  return [...dated, ...rest];
}

/** The page a genre's feature is on in today's issue: the index (/genres)
 *  and the feature's own folio read it from here, so they always agree. */
export function folioOf(order: string[], id: string): number {
  return 4 + order.indexOf(id) * 2;
}

export function resolveGenreFeature(data: GraphData, id: string): GenreFeature | null {
  const genre = data.genres.find(g => g.id === id);
  const content = GENRE_PAGES[id];
  if (!genre || !content) return null;

  const session = buildGenreSession(data);
  const clips = new Map(session.clips.map(c => [c.id, c]));
  const families = new Map(session.families.map(f => [f.id, f]));
  const colorOf = (gid: string) => {
    const clip = clips.get(gid);
    return (clip && families.get(clip.familyId)?.color) ?? GENRE_COLORS[gid] ?? DEFAULT_GENRE_COLOR;
  };
  const family = clips.has(id) ? families.get(clips.get(id)!.familyId) ?? null : null;
  const color = colorOf(id);

  const byId = new Map(data.artists.map(a => [a.id, a]));
  const named = new Map<string, number>();
  for (const e of data.edges) if (e.type === 'influence') named.set(e.target, (named.get(e.target) ?? 0) + 1);
  const toArtist = (a: (typeof data.artists)[number]): FeatureArtist => ({
    id: a.id, name: a.name, imageUrl: a.imageUrl ?? null, activeFrom: a.activeFrom ?? null, previewUrl: a.previewUrl ?? null,
  });

  const members = data.artists.filter(a => a.genres.includes(id));
  const mostNamed = members.slice().sort((a, b) => (named.get(b.id) ?? 0) - (named.get(a.id) ?? 0) || a.name.localeCompare(b.name));
  const leadArtist = mostNamed.find(a => a.imageUrl);

  // The pull quote: the most-named of its own artists speaking about what
  // shaped them, in their own words (whyFor already turns away quoted
  // passages that aren't the artist talking).
  // Failing that, one of its artists speaking about another of them.
  const memberIds = new Set(members.map(a => a.id));
  const fits = (q: string) => q.length >= 30 && q.length <= 260;
  let pull: GenreFeature['pull'] | null = null;
  for (const a of mostNamed) {
    const why = whyFor(data, a.id);
    if (why && why.direction === 'parent' && fits(why.quote)) {
      pull = { quote: why.quote, speaker: why.speaker, about: why.other.name };
      break;
    }
  }
  // And failing that, an artist who came after, in their own words about one
  // of its artists.
  for (const insider of [true, false]) {
    if (pull) break;
    for (const a of mostNamed) {
      const why = whyFor(data, a.id);
      if (why && why.direction === 'child' && memberIds.has(why.other.id) === insider && fits(why.quote)) {
        pull = { quote: why.quote, speaker: why.speaker, about: a.name };
        break;
      }
    }
  }
  if (!pull) {
    pull = genre.emerged && genre.emergedBasis
      ? { born: `${genre.emerged}: ${genre.emergedBasis}` }
      : { born: content.deck };
  }

  const records: FeatureRecord[] = content.definingAlbums
    .map(aid => byId.get(aid))
    .filter((a): a is NonNullable<typeof a> => !!a && !!a.classicAlbums?.length)
    .map(a => {
      const album = a.classicAlbums![0];
      return {
        artistId: a.id, artistName: a.name, artistImage: a.imageUrl ?? null, title: album.title, year: album.year ?? null,
        imageUrl: album.imageUrl ?? null, review: album.classicReason ?? '',
        song: album.previewUrl ? album.previewTrack ?? null : null,
        previewUrl: album.previewUrl ?? null,
      };
    });
  // In the page's own order: most essential first (data/genre-pages.ts ranks them).

  const groups = content.sections.map(s => ({
    title: s.title,
    blurb: s.blurb,
    artists: s.artistIds.map(aid => byId.get(aid)).filter((a): a is NonNullable<typeof a> => !!a).map(toArtist),
  }));

  const sign = (gid: string): FeatureSign => {
    const g = data.genres.find(x => x.id === gid)!;
    return { id: g.id, name: g.name, emerged: g.emerged ?? null, color: colorOf(g.id) };
  };
  const lineage = getGenreLineage(data.genres, id)!;

  const order = featureOrder(data);
  const at = order.indexOf(id);
  const step = (k: number): FeatureStep => {
    const g = data.genres.find(x => x.id === order[(k + order.length) % order.length])!;
    return { id: g.id, name: g.name, color: colorOf(g.id) };
  };

  const playable = members.filter(a => a.previewUrl)
    .sort((a, b) => (a.activeFrom ?? 9999) - (b.activeFrom ?? 9999) || a.name.localeCompare(b.name));

  return {
    id,
    name: genre.name,
    emerged: genre.emerged ?? null,
    emergedBasis: genre.emergedBasis ?? null,
    color,
    ink: family?.ink ?? readableInk(color, PAPER),
    familyName: family?.name ?? null,
    folio: folioOf(order, id),
    headlinePx: headlinePx(genre.name),
    deck: content.deck,
    origin: content.originParagraphs,
    sound: content.soundParagraph,
    pull,
    lead: leadArtist ? toArtist(leadArtist) : null,
    artistCount: members.length,
    records,
    groups,
    firstWave: members
      .filter(a => a.imageUrl && a.activeFrom)
      .sort((a, b) => a.activeFrom! - b.activeFrom! || a.name.localeCompare(b.name))
      .slice(0, FIRST_WAVE)
      .map(toArtist),
    road: {
      ancestors: lineage.ancestors.map(g => sign(g.id)),
      self: sign(id),
      children: lineage.children.map(g => sign(g.id)).sort((a, b) => (a.emerged ?? 9999) - (b.emerged ?? 9999)),
      borrowed: (genre.alsoFrom ?? []).filter(g => data.genres.some(x => x.id === g)).map(sign),
    },
    prev: step(at - 1),
    next: step(at + 1),
    recordsQueue: {
      id: `records:${id}`,
      title: `${genre.name}: the essential records`,
      stopMs: SONG_MS, // a whole preview of each
      tracks: records.filter(r => r.previewUrl).map(r => ({
        id: r.artistId, name: r.artistName, imageUrl: r.imageUrl, previewUrl: r.previewUrl,
        previewTrack: r.song, activeFrom: r.year, note: `From ${r.title}${r.year ? ` (${r.year})` : ''}`,
      })),
    },
    queue: {
      id: `genre:${id}`,
      title: `${genre.name}: the free tape`,
      stopMs: TAPE_STOP_MS,
      // Built here rather than with lib/player-library's toTrack: that module
      // brings the player itself, which only runs in the browser.
      tracks: playable.map(a => ({
        id: a.id, name: a.name, imageUrl: a.imageUrl ?? null, previewUrl: a.previewUrl ?? null,
        previewTrack: a.previewTrack ?? null, activeFrom: a.activeFrom ?? null, note: `${genre.name} · the free tape`,
      })),
    },
  };
}
