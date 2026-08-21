import type { Edge } from '@/data/types';
import { resolveCitationStatus } from '@/data/types';

export type AdjList = Map<string, string[]>;

export function buildAdjacencyList(edges: Edge[]): AdjList {
  const adj: AdjList = new Map();
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }
  return adj;
}

export function buildReverseAdjacencyList(edges: Edge[]): AdjList {
  const adj: AdjList = new Map();
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    if (!adj.has(edge.target)) adj.set(edge.target, []);
    adj.get(edge.target)!.push(edge.source);
  }
  return adj;
}

// BFS over directed influence graph (source → target, i.e. toward the root).
// Returns array of node IDs from src to dst, or null if no path exists.
export function findShortestPath(
  src: string,
  dst: string,
  adjList: AdjList,
): string[] | null {
  if (src === dst) return [src];
  const visited = new Set<string>([src]);
  const queue: string[][] = [[src]];
  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    for (const neighbor of adjList.get(node) ?? []) {
      if (neighbor === dst) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

// Returns set of IDs directly connected to a node (in either direction).
export function getNeighbors(nodeId: string, edges: Edge[]): Set<string> {
  const neighbors = new Set<string>();
  for (const edge of edges) {
    if (edge.source === nodeId) neighbors.add(edge.target);
    if (edge.target === nodeId) neighbors.add(edge.source);
  }
  return neighbors;
}

// For a path [A, B, C], returns the edge keys to highlight: "A→B" and "B→C",
// plus both reverses.
//
// Both orientations, because the renderer keys edges by their REAL direction
// (`${source}→${target}` in drawLink) while a path is walked without regard to
// direction — see findConnectionPath. Emitting walk-order keys only meant every
// hop that happened to run against its edge silently failed to match, so the
// nodes lit up and the line between them did not. Velvet Underground to Cocteau
// Twins was the reported case: the real edge is cocteau-twins→velvet-underground,
// and the walk produced the opposite key.
//
// Over-matching is harmless: a key only exists for a pair genuinely adjacent on
// the path. Two pairs in the graph DO cite each other in both directions --
// Autechre/Boards of Canada and The Cure/Mogwai -- so a path crossing one lights
// two edges rather than one. Both are real, so that reads correctly.
export function pathEdgeKeys(path: string[]): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    keys.add(`${path[i]}→${path[i + 1]}`);
    keys.add(`${path[i + 1]}→${path[i]}`);
  }
  return keys;
}

// ── Connection paths ─────────────────────────────────────────────────────────
// findShortestPath above walks influence edges in their real direction only, so
// it answers "is B an ancestor of A". That is the right question and the wrong
// feature: measured over 599 random artist pairs, a directed path exists in the
// order picked 10% of the time, and 23% trying both directions. A path finder
// that returns nothing nine times out of ten is not a path finder.
//
// Walking the graph as undirected finds a connection for essentially every pair
// (100% of that sample, median 3 hops). The honesty cost is that a hop can now
// run either way, so a path is no longer automatically a line of descent — it
// might be two artists meeting at a shared ancestor. resolvePathHops below
// keeps each hop's true direction so the UI can say which it is rather than
// flattening the distinction.

export type HopDirection = 'influenced-by' | 'influenced';

export interface PathHop {
  from: string;
  to: string;
  /** From `from`'s point of view: did it inherit from `to`, or feed into it. */
  direction: HopDirection;
  /** The real edge behind this hop — carries citation, sourceTier, confidence. */
  edge: Edge;
}

function buildUndirectedAdjacency(edges: Edge[]): AdjList {
  const adj: AdjList = new Map();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  };
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    link(edge.source, edge.target);
    link(edge.target, edge.source);
  }
  return adj;
}

/**
 * Shortest chain of artists connecting src to dst, ignoring edge direction.
 * Returns node ids from src to dst inclusive, or null if genuinely unconnected.
 */
export function findConnectionPath(src: string, dst: string, edges: Edge[]): string[] | null {
  return findShortestPath(src, dst, buildUndirectedAdjacency(edges));
}

/**
 * Turns a node chain into hops carrying direction and the underlying edge.
 * Returns null if any consecutive pair has no edge between them, which would
 * mean the caller built the chain from something other than this edge set.
 */
export function resolvePathHops(path: string[], edges: Edge[]): PathHop[] | null {
  const hops: PathHop[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    // source was influenced BY target (see Edge in data/types.ts), so an edge
    // from->to means `from` inherited from `to`.
    const inherits = edges.find(e => e.type === 'influence' && e.source === from && e.target === to);
    if (inherits) {
      hops.push({ from, to, direction: 'influenced-by', edge: inherits });
      continue;
    }
    const feeds = edges.find(e => e.type === 'influence' && e.source === to && e.target === from);
    if (!feeds) return null;
    hops.push({ from, to, direction: 'influenced', edge: feeds });
  }
  return hops;
}

// ── Best-sourced paths ───────────────────────────────────────────────────────
// findConnectionPath above answers "fewest hops". That is the wrong question
// for this graph. Measured over 1,758 artist pairs: 70% of shortest paths
// contained a link that was only a critic's comparison or was not sourced at
// all -- so seven times in ten the fewest-hops answer handed back a chain with
// a weak link in it, on a graph whose entire claim is that its edges are
// checkable. Someone expands that hop, finds "no first-person source found",
// and the strongest thing about the project has just undercut itself.
//
// Pricing each hop by how much trust it costs to cross makes "cheapest path"
// mean "best-documented path", which is Dijkstra rather than BFS. Same 1,758
// pairs: weak links drop from 70% to 11%, for an average of 1.08 extra hops
// and a mean search of 0.4ms. A four-hop chain of artist quotes (0.40) beats a
// two-hop chain leaning on an unsourced claim (1.10), which is the trade this
// whole project exists to make.
//
// Velvet Underground -> Big Thief is the case in miniature. Fewest hops routes
// through Nico, whose edge nobody ever stated on the record; the best-sourced
// route goes via Pulp and Leonard Cohen, three hops, every one first-person.
//
// The ladder is a judgement call, not a derivation, and is deliberately steep:
// an unsourced hop costs ten times a first-person one, so the search will walk
// a long way around to avoid one.
const HOP_COST: Record<string, number> = {
  'first-person': 0.10,   // the artist said it
  reported: 0.35,         // a publication states it, no quote
  critic: 0.60,           // a critic's comparison
  unsourceable: 0.85,     // real and undisputed, but nobody said it on record
  unchecked: 1.00,        // inherited, never verified
};

export function hopCost(edge: Pick<Edge, 'citation' | 'citationStatus' | 'sourceTier'>): number {
  const status = resolveCitationStatus(edge);
  if (status !== 'cited') return HOP_COST[status] ?? 1;
  return HOP_COST[edge.sourceTier ?? 'unchecked'] ?? 1;
}

/**
 * The best-documented route between two artists: Dijkstra over the undirected
 * influence graph, weighted by hopCost. Returns node ids from src to dst, or
 * null if genuinely unconnected.
 *
 * Frontier selection is a linear scan rather than a heap -- O(V^2) at 293
 * nodes is ~86k comparisons and runs in well under a millisecond, so a priority
 * queue would be complexity with nothing to buy.
 */
export function findBestSourcedPath(src: string, dst: string, edges: Edge[]): string[] | null {
  if (src === dst) return [src];

  const adj = new Map<string, { to: string; cost: number }[]>();
  const link = (a: string, b: string, cost: number) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push({ to: b, cost });
  };
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    const cost = hopCost(edge);
    link(edge.source, edge.target, cost);
    link(edge.target, edge.source, cost);
  }

  const dist = new Map<string, number>([[src, 0]]);
  const prev = new Map<string, string>();
  const settled = new Set<string>();

  for (;;) {
    let node: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!settled.has(id) && d < best) { best = d; node = id; }
    }
    if (node === null) return null;      // frontier exhausted — unreachable
    if (node === dst) break;
    settled.add(node);

    for (const { to, cost } of adj.get(node) ?? []) {
      const next = best + cost;
      if (next < (dist.get(to) ?? Infinity)) {
        dist.set(to, next);
        prev.set(to, node);
      }
    }
  }

  const path = [dst];
  let cur = dst;
  while (cur !== src) {
    const parent = prev.get(cur);
    if (parent === undefined) return null;
    cur = parent;
    path.unshift(cur);
  }
  return path;
}

/** True when every hop runs the same way — a real, unbroken line of descent. */
export function isDirectDescent(hops: PathHop[]): boolean {
  if (hops.length === 0) return false;
  return hops.every(h => h.direction === hops[0].direction);
}

/**
 * For a mixed path, the artist where the direction flips — the point the two
 * ends have in common. Null for a direct line of descent, which has no such
 * point. Only the first flip is reported; a longer path can zigzag, and the
 * first shared node is the one worth naming.
 */
export function findMeetingPoint(hops: PathHop[]): string | null {
  for (let i = 0; i < hops.length - 1; i++) {
    if (hops[i].direction !== hops[i + 1].direction) return hops[i].to;
  }
  return null;
}

/**
 * How many times the route changes direction. Measured across 522 sampled
 * pairs: 8.6% never turn (a real line of descent), 35.4% turn exactly once
 * (two artists genuinely meeting at one shared point), and 56% turn two to six
 * times.
 *
 * That last group is why this exists. findMeetingPoint reports only the FIRST
 * flip, so a route that zigzags four times still yields a confident-looking
 * "they meet at X" naming one arbitrary node — a claim the path does not
 * support. Callers should name a meeting point only when this returns 1.
 */
export function countDirectionTurns(hops: PathHop[]): number {
  let turns = 0;
  for (let i = 0; i < hops.length - 1; i++) {
    if (hops[i].direction !== hops[i + 1].direction) turns++;
  }
  return turns;
}

/**
 * How a single hop should be described and drawn. One function so a connector's
 * line style and the tier word beside it can never disagree about the same edge
 * — both read this.
 *
 * Note this is a presentation concern, deliberately kept separate from
 * HOP_COST: that ladder is a search weight tuned to make Dijkstra detour around
 * weak evidence, and tying a visual decision to it would couple the look of the
 * panel to a knob that exists for another reason entirely.
 */
export type HopEvidence = 'first-person' | 'reported' | 'critic' | 'unsourceable' | 'unchecked';

export function hopEvidence(edge: Pick<Edge, 'citation' | 'citationStatus' | 'sourceTier'>): HopEvidence {
  const status = resolveCitationStatus(edge);
  if (status !== 'cited') return status;
  return edge.sourceTier ?? 'unchecked';
}
