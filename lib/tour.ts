import type { Edge, GraphData } from '@/data/types';
import { hopCost } from '@/lib/graph-utils';
import { ownWords } from '@/lib/home-story';
import { LABEL_ID } from '@/lib/intro-groove';

// "How it works" (components/tour/Tour.tsx): a visitor picks an artist and
// walks their music back, one influence at a time, to the Velvet Underground.
// Pure functions only.

/** The faces the tour offers, most people's best chance of knowing one: a
 *  spread of eras and sounds, each with a road of two or three steps. */
// Chosen for roads where every step is in the artist's own account and at
// least one is a quote (checked against the data, Oct 2026).
export const TOUR_PICKS = [
  'nirvana', 'radiohead', 'the-cure', 'tame-impala', 'arcade-fire', 'charli-xcx', 'mgmt', 'clairo',
];
/** "Pick for me": the name most people know. */
export const TOUR_DEFAULT = 'nirvana';

// Roads chosen by hand where the best-sourced one by cost isn't the best
// one to walk: Nirvana is the default pick, and Cobain on the Pixies is the
// story — "basically trying to rip off the Pixies" — not a festival wishlist
// naming Sonic Youth. Used only if every step is still an influence edge.
const ROAD_OVERRIDES: Record<string, string[]> = {
  nirvana: ['nirvana', 'pixies', LABEL_ID],
};

const ROAD_MIN_STEPS = 2;
const ROAD_MAX_STEPS = 3;
// The walk shows each step's evidence, so a road whose steps can show
// somebody's own words — or at least say where the link comes from — wins.
const NO_QUOTE_COST = 0.2;
const NO_SOURCE_COST = 0.5;
// A source sentence longer than this is cut at a sentence end.
const MAX_SOURCE_CHARS = 130;

type Data = Pick<GraphData, 'artists' | 'edges'>;

function stepCost(edge: Edge): number {
  return hopCost(edge)
    + (edge.sourceTier === 'first-person' && ownWords(edge.citation) ? 0 : NO_QUOTE_COST)
    + (edge.citation ? 0 : NO_SOURCE_COST);
}

// A citation, cut at a sentence end if it runs long. Citations here are
// written as finished sentences for a reader (see CLAUDE.md), so one can
// stand on screen as it is.
function sourceLine(citation: string): string {
  if (citation.length <= MAX_SOURCE_CHARS) return citation;
  const cut = citation.slice(0, MAX_SOURCE_CHARS);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('." '), cut.lastIndexOf('.” '));
  return end > 60 ? citation.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

/**
 * The road from `src` back to the Velvet Underground, each step "this artist
 * learned from that one" — ids from `src` to the root.
 *
 * A walk of one step teaches nothing about following lines, and most famous
 * artists name the Velvet Underground outright, so the best-sourced road of
 * two or three steps wins when there is one. Otherwise the fewest steps that
 * get there; null when nothing leads back.
 */
export function roadToRoot(data: Data, src: string): string[] | null {
  const pinned = ROAD_OVERRIDES[src];
  if (pinned && pinned.every((id, i) => i === 0 || data.edges.some(e =>
    e.type === 'influence' && e.source === pinned[i - 1] && e.target === id))) return pinned;

  const parents = new Map<string, Edge[]>();
  for (const e of data.edges) {
    if (e.type !== 'influence') continue;
    const list = parents.get(e.source);
    if (list) list.push(e); else parents.set(e.source, [e]);
  }

  let best: { road: string[]; cost: number } | null = null;
  const walk = (road: string[], cost: number) => {
    const here = road[road.length - 1];
    const steps = road.length - 1;
    if (here === LABEL_ID) {
      if (steps >= ROAD_MIN_STEPS && (!best || cost < best.cost)) best = { road, cost };
      return;
    }
    if (steps >= ROAD_MAX_STEPS) return;
    for (const e of parents.get(here) ?? []) {
      if (road.includes(e.target)) continue;
      walk([...road, e.target], cost + stepCost(e));
    }
  };
  walk([src], 0);
  if (best) return (best as { road: string[] }).road;

  // No road of the preferred length: the fewest steps there are.
  const prev = new Map<string, string>([[src, src]]);
  let frontier = [src];
  while (frontier.length && !prev.has(LABEL_ID)) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const e of parents.get(id) ?? []) {
        if (prev.has(e.target)) continue;
        prev.set(e.target, id);
        next.push(e.target);
      }
    }
    frontier = next;
  }
  if (!prev.has(LABEL_ID) || src === LABEL_ID) return null;
  const road = [LABEL_ID];
  while (road[0] !== src) road.unshift(prev.get(road[0])!);
  return road;
}

export interface StepWords {
  /** Somebody's own words about this influence, verbatim; else null. */
  quote: string | null;
  /** Whose words; or, with no quote, the plain fact of the step. */
  credit: string;
  /** With no quote: where the link comes from, as the citation says it. */
  source: string | null;
}

/** What to show for the step `from` → `to` (`from` learned from `to`). */
export function stepWords(data: Data, from: string, to: string): StepWords {
  const name = (id: string) => data.artists.find(a => a.id === id)?.name ?? id;
  const edge = data.edges.find(e => e.type === 'influence' && e.source === from && e.target === to);
  const quote = edge?.sourceTier === 'first-person'
    ? ownWords(edge.citation, name(to)) ?? ownWords(edge.citation)
    : null;
  if (quote) return { quote, credit: `${name(from)} on ${name(to)}`, source: null };
  return {
    quote: null,
    credit: `${name(from)} learned from ${name(to)}.`,
    source: edge?.citation ? sourceLine(edge.citation) : null,
  };
}

// How long words stay up: time to find them, then a reading pace. The same
// pace as the opening's (components/home/Intro.tsx).
const READ_BASE_MS = 800;
const READ_PER_WORD_MS = 190;
const READ_MIN_MS = 1800;

export function readMs(...lines: (string | null | undefined)[]): number {
  const words = lines.filter(Boolean).join(' ').split(/\s+/).length;
  return Math.max(READ_MIN_MS, READ_BASE_MS + READ_PER_WORD_MS * words);
}
