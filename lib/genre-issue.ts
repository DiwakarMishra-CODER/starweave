import type { GraphData } from '@/data/types';
import { lineageOf, type GenreSession } from './genre-session';

// The /genres opening is the cover of a music paper, a new issue every day;
// the city inside is its pull-out centrefold. Every line on the cover is
// true, worked out here from the map: the cover story is one real road of
// four or more sounds (founder to newest), picked by the day, so it changes
// daily and comes round again about a month later; the other cover lines
// are counts taken from the same data. Pure -- the page builds the issue in
// the browser, where the visitor's own day is known.

export interface CoverStory {
  /** The newest sign on the road: the one that lights up when it plays. */
  leafId: string;
  line: { id: string; name: string; year: number }[];
  from: number;
  to: number;
  headline: string;
  kicker: string;
}

/** Who's on the cover: the most-cited artist in the story's newest genre. */
export interface CoverStar {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Issue {
  number: number;
  story: CoverStory;
  star: CoverStar | null;
  /** One line under the headline, in the paper's voice -- and true. */
  standfirst: string;
  /** The small print along the foot of the cover. */
  facts: string[];
  /** Twelve digits under the barcode. */
  barcode: string;
}

const MIN_STEPS = 4;
// Issue 1 came out on 1 January 2026.
const FIRST_DAY = Math.floor(Date.UTC(2026, 0, 1) / 86_400_000);
// Names that stay as they are in a sentence: a proper name, an initialism.
const KEEP_CASE = new Set(['Britpop']);

/** "Garage rock" -> "garage rock", but "IDM" and "Britpop" stay as they are. */
export function inSentence(name: string): string {
  if (KEEP_CASE.has(name) || name === name.toUpperCase()) return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** Every road of MIN_STEPS or more sounds, founder to sign, oldest first. */
export function coverStories(session: GenreSession): CoverStory[] {
  const byId = new Map(session.clips.map(c => [c.id, c]));
  const stories: CoverStory[] = [];
  for (const c of session.clips) {
    const ids = lineageOf(c.id, byId).reverse();
    if (ids.length < MIN_STEPS) continue;
    const line = ids.map(id => {
      const g = byId.get(id)!;
      return { id, name: g.name, year: g.emerged };
    });
    const from = line[0].year;
    const to = line[line.length - 1].year;
    const years = to - from;
    stories.push({
      leafId: c.id,
      line,
      from,
      to,
      headline: `How ${inSentence(line[0].name)} became ${inSentence(line[line.length - 1].name)} in ${years} ${years === 1 ? 'year' : 'years'}`,
      kicker: `${line.length} genres, one line`,
    });
  }
  return stories.sort((a, b) => a.from - b.from || a.to - b.to || a.leafId.localeCompare(b.leafId));
}

/**
 * Every story's cover star, worked out on the server where the whole map is
 * (the browser then needs only this small table): of the artists tagged with
 * the story's newest genre and with a photo, the one most others cite.
 */
export function coverStars(session: GenreSession, data: Pick<GraphData, 'artists' | 'edges'>): Record<string, CoverStar> {
  const cited = new Map<string, number>();
  for (const e of data.edges) if (e.type === 'influence') cited.set(e.target, (cited.get(e.target) ?? 0) + 1);
  const out: Record<string, CoverStar> = {};
  for (const story of coverStories(session)) {
    const star = data.artists
      .filter(a => a.genres.includes(story.leafId) && a.imageUrl)
      .sort((a, b) => (cited.get(b.id) ?? 0) - (cited.get(a.id) ?? 0) || a.name.localeCompare(b.name))[0];
    if (star) out[story.leafId] = { id: star.id, name: star.name, imageUrl: star.imageUrl! };
  }
  return out;
}

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** The day's issue. `day` is days since 1970 by the visitor's clock (lib/home-story's dayNumber). */
export function buildIssue(
  session: GenreSession,
  counts: { artists: number; genres: number },
  day: number,
  stars: Record<string, CoverStar> = {},
): Issue {
  const stories = coverStories(session);
  const story = stories[((day % stories.length) + stories.length) % stories.length];
  const star = stars[story.leafId] ?? null;
  const steps = NUMBER_WORDS[story.line.length] ?? String(story.line.length);
  const standfirst = star
    ? `From ${story.from} to ${story.to}: ${steps} genres, each grown out of the one before, and ${star.name} at the end of it.`
    : `From ${story.from} to ${story.to}: ${steps} genres, each grown out of the one before.`;

  const perYear = new Map<number, number>();
  for (const c of session.clips) perYear.set(c.emerged, (perYear.get(c.emerged) ?? 0) + 1);
  const [busiest, busiestCount] = [...perYear].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  const borrowers = session.clips.filter(c => c.alsoFromIds.length > 0).length;

  const number = Math.max(1, day - FIRST_DAY + 1);
  return {
    number,
    story,
    star,
    standfirst,
    facts: [
      `${counts.artists} artists`,
      `${counts.genres} genres`,
      `${busiest}, the busiest year (${busiestCount} new sounds)`,
      `${borrowers} borrowed sounds`,
    ],
    barcode: `977${String(number).padStart(6, '0')}${String(day % 1000).padStart(3, '0')}`,
  };
}
