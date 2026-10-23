import type { Artist, GraphData } from '@/data/types';
import { resolveNodeColor, resolveNodeLabel } from '@/lib/colors';

// The home page's record of the day. Pure functions only: the server page
// runs them to render today's record, and the client runs the same ones for
// a visitor whose local date differs from the server's. Same inputs, same
// pick, on both sides.

// The owner's rule: on a Sunday, the record is The Sundays.
export const SUNDAY_RECORD = 'the-sundays';

// Who gets to be today's record: artists who matter to the map — at least
// this many artists here learned from them — plus a hand-picked few from
// recent years, who haven't had time to gather descendants yet but are the
// names a newcomer knows.
export const MIN_PICK_CHILDREN = 3;
export const RECENT_PICKS = new Set<string>([
  'alvvays', 'beabadoobee', 'black-country-new-road', 'bon-iver', 'car-seat-headrest', 'charli-xcx',
  'clairo', 'fleet-foxes', 'lcd-soundsystem', 'mac-demarco', 'st-vincent', 'sufjan-stevens',
  'the-last-dinner-party', 'the-strokes',
]);

// Where the best line is a famous one the scoring can't know about, the
// artist whose words to use.
const WHY_FROM: Record<string, string> = {
  'velvet-underground': 'brian-eno',
};

// A "why" line longer than this doesn't fit beside a star.
const MAX_WHY_CHARS = 170;
// Quoted passages in a first-person citation aren't always the artist's own
// voice: some are a writer's sentence ("After seeing a Bad Brains concert,
// MacKaye and Nelson began…"), a song title, or a list of bands. Shown as
// "X on Y: …", those would put words in an artist's mouth — so a why line
// has to speak in the first person, and can't be a list.
const FIRST_PERSON = /\b(I|I'm|I've|I'd|I'll|me|my|myself|we|we're|we've|we'd|us|our)\b/i;
const isList = (q: string) => (q.match(/,/g)?.length ?? 0) >= 3 || (q.match(/\//g)?.length ?? 0) >= 2;

/** A passage from a citation that can be shown as an artist's own words:
 *  pullQuote's verbatim passage, in the first person, not a list, and short
 *  enough to sit on screen. Null otherwise. */
export function ownWords(citation: string | null | undefined, naming?: string): string | null {
  const quote = pullQuote(citation, naming);
  return quote && quote.length <= MAX_WHY_CHARS && FIRST_PERSON.test(quote) && !isList(quote) ? quote : null;
}

export interface RecordCard {
  id: string;
  name: string;
  cover: string;
  album: string;
  albumYear: number | null;
  previewUrl: string;
  previewTrack: string | null;
  color: string;
  realmLabel: string;
  /** Why this one, in somebody's own words. Null only for a Sunday record
   *  with no quote on file. */
  why: RecordWhy | null;
}

// One line of somebody's own words about an influence the pick is part of:
// the pick on who shaped them ('parent'), or someone they shaped on them
// ('child') — the Velvet Underground have no one before them, but Brian Eno
// has plenty to say about them.
export interface RecordWhy {
  direction: 'parent' | 'child';
  /** The other end of the influence. */
  other: { id: string; name: string; previewUrl: string | null; previewTrack: string | null };
  /** Whose words: the pick's for a parent, the other artist's for a child. */
  speaker: string;
  /** Verbatim from a first-person citation. */
  quote: string;
}

// The artist's own words from a citation: a quoted passage long enough to be
// a sentence rather than a title, and — when `naming` is given — one that
// actually names that artist (a citation can quote someone on several bands;
// "I adored the fast R&B of Doctor Feelgood" is no caption for the Ramones).
// Returned exactly as it appears in the citation (a test holds it to that),
// so nothing shown is ever reworded. Null when there's no such passage.
const QUOTE = /["“]([^"”]+)["”]/g;
const MIN_QUOTE_WORDS = 6;

function nameToken(name: string): string {
  // The longest word of the name: "Velvet" for The Velvet Underground.
  const words = name.replace(/^the\s+/i, '').split(/[^\p{L}\p{N}]+/u).filter(w => w.length >= 3);
  return (words.sort((a, b) => b.length - a.length)[0] ?? name).toLowerCase();
}

export function pullQuote(citation: string | null | undefined, naming?: string): string | null {
  if (!citation) return null;
  const token = naming ? nameToken(naming) : null;
  for (const m of citation.matchAll(QUOTE)) {
    const text = m[1].trim();
    if (text.split(/\s+/).length < MIN_QUOTE_WORDS) continue;
    if (token && !text.toLowerCase().includes(token)) continue;
    return text;
  }
  return null;
}

/** Days since 1970 by the given clock — the seed for the day's pick. */
export function dayNumber(d: Date, clock: 'utc' | 'local'): number {
  const ms = clock === 'utc'
    ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor(ms / 86_400_000);
}

export function isSunday(d: Date, clock: 'utc' | 'local'): boolean {
  return (clock === 'utc' ? d.getUTCDay() : d.getDay()) === 0;
}

// mulberry32: a tiny seeded generator, so a day's draw is the same everywhere.
function seeded(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4_294_967_296;
  };
}

type StoryData = Pick<GraphData, 'artists' | 'edges'>;

/** The best line of somebody's own words about an influence `id` is part of. */
export function whyFor(data: StoryData, id: string): RecordWhy | null {
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const pick = byId.get(id);
  if (!pick) return null;
  let best: { why: RecordWhy; score: number } | null = null;
  for (const e of data.edges) {
    if (e.type !== 'influence' || e.sourceTier !== 'first-person') continue;
    const direction = e.source === id ? 'parent' : e.target === id ? 'child' : null;
    if (!direction) continue;
    const other = byId.get(direction === 'parent' ? e.target : e.source);
    if (!other) continue;
    if (WHY_FROM[id] && other.id !== WHY_FROM[id]) continue;
    // Words that name the other end read best; any of the speaker's own
    // words about this influence will do.
    const named = ownWords(e.citation, direction === 'parent' ? other.name : pick.name);
    const quote = named ?? ownWords(e.citation);
    if (!quote) continue;
    // The pick's own words beat words about them.
    const score = (direction === 'parent' ? 3 : 0)
      + (named ? 2 : 0)
      + (quote.length <= 120 ? 2 : 0)
      + (other.previewUrl ? 1 : 0)
      + (e.confidence ?? 0);
    if (best && (score < best.score || (score === best.score && quote.length >= best.why.quote.length))) continue;
    best = {
      score,
      why: {
        direction,
        other: { id: other.id, name: other.name, previewUrl: other.previewUrl ?? null, previewTrack: other.previewTrack ?? null },
        speaker: direction === 'parent' ? pick.name : other.name,
        quote,
      },
    };
  }
  return best?.why ?? null;
}

function hasRecord(a: Artist): boolean {
  return !!a.previewUrl && !!a.classicAlbums?.[0]?.imageUrl;
}

/** Every artist who can be today's record, sorted, so a day's draw is stable. */
export function pickPool(data: StoryData): string[] {
  const children = new Map<string, number>();
  for (const e of data.edges) {
    if (e.type === 'influence') children.set(e.target, (children.get(e.target) ?? 0) + 1);
  }
  return data.artists
    .filter(a => hasRecord(a))
    .filter(a => (children.get(a.id) ?? 0) >= MIN_PICK_CHILDREN || RECENT_PICKS.has(a.id))
    .filter(a => whyFor(data, a.id) !== null)
    .map(a => a.id)
    .sort();
}

export function pickRecordId(data: StoryData, day: number, sunday: boolean): string {
  if (sunday && data.artists.some(a => a.id === SUNDAY_RECORD && hasRecord(a))) return SUNDAY_RECORD;
  const pool = pickPool(data);
  return pool[Math.floor(seeded(day)() * pool.length)];
}

export function recordCard(data: StoryData, id: string): RecordCard | null {
  const a = data.artists.find(x => x.id === id);
  const album = a?.classicAlbums?.[0];
  if (!a || !album?.imageUrl || !a.previewUrl) return null;
  return {
    id: a.id,
    name: a.name,
    cover: album.imageUrl,
    album: album.title,
    albumYear: album.year ?? null,
    previewUrl: a.previewUrl,
    previewTrack: a.previewTrack ?? a.signatureSong ?? null,
    color: resolveNodeColor(a),
    realmLabel: resolveNodeLabel(a),
    why: whyFor(data, id),
  };
}
