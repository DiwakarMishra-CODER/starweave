import type { GraphData } from '@/data/types';

// Builds the layout model for the genre-index "poster map" — a subway-style
// diagram positioning every dated genre by when it emerged (x, ordinal rank
// among dated genres — NOT a linear year scale) and by lineage (y).
//
// Pure data/layout computation — no DOM, safe to run in a Server Component.
// x/y are resolved to final pixel coordinates here (not left to the
// component) because the row-packing decisions below need real pixel widths
// to reason about label collisions — see COMPACT_BAND_IDS's comment.

// ── Geometry constants — shared source of truth with GenreTimeline.tsx ──
export const VIEW_W = 1400;
export const PAD_LEFT = 34;
export const PAD_RIGHT = 46;
export const PAD_TOP = 10;
export const AXIS_H = 34;
// Base per-lane pixel pitch; bands with more lanes get MORE than this (see
// bandPitch below) — a 1-lane band doesn't need the breathing room a
// 5-lane band does, and forcing them to match either starves the busy band
// or wastes space on the quiet one.
export const BASE_LANE_PITCH = 20;
export const EXTRA_PITCH_PER_LANE = 6;
export const BAND_GAP = 10;
// Rough average glyph width at font-size ~10 SVG units (proportional body
// font) — used to estimate label pixel width for collision decisions, both
// here (which rows a set of labels needs) and in the component (render-time
// truncation). Not exact text metrics (unavailable outside a browser), but
// conservative enough to avoid the worst collisions in practice.
export const AVG_GLYPH_W = 5.3;
export const LABEL_GAP_PAD = 6;

export function estimateLabelWidth(text: string): number {
  return text.length * AVG_GLYPH_W;
}

export interface TimelineNode {
  id: string;
  name: string;
  emerged: number;
  emergedBasis: string;
  count: number; // artists tagged with this genre
  rank: number; // 0..N-1, ordinal position among dated genres sorted by (emerged, name)
  x: number; // resolved pixel position
  y: number; // resolved pixel position
  lane: number; // physical row index WITHIN this node's band/strip — used to
  // group same-row labels for truncation, not a global index
  bandId: string; // the top-level lineage this node belongs to
  parentId: string | null; // effective parent for drawing an edge — null if this node's real
  // parent is either absent or a pure container (electronic/folk/indie/underground),
  // which are excluded from the timeline entirely
  alwaysLabeled: boolean;
  color: string; // resolved directly from the node's own lineage family —
  // independent of which layout group (major band vs. compact strip) it
  // renders in, so moving a band into the compact strip never changes its color
  isCompact: boolean;
}

export interface TimelineBand {
  id: string; // the root/orphan genre id anchoring this band, or '__COMPACT__'
  name: string;
  color: string;
  laneCount: number;
  isCompact: boolean;
}

export interface GenreTimelineLayout {
  nodes: TimelineNode[];
  nodesById: Map<string, TimelineNode>;
  bands: TimelineBand[];
  rankCount: number; // number of dated genres (rank runs 0..rankCount-1)
  yearMarks: { year: number; rank: number }[]; // one entry per distinct year, at its first rank
  viewH: number; // resolved total SVG viewBox height (plot + axis)
  plotH: number; // resolved plot height (excludes the axis strip)
}

const CONTAINER_IDS = new Set(['underground', 'indie', 'electronic', 'folk']);

// These 9 genres are each their own band with zero or one child (power-pop
// is the one exception with a child, jangle-pop — included anyway per an
// explicit call: it's a 2-node band, not meaningfully different from the
// 8 true singletons for space purposes). Each one used to reserve a full
// dedicated lane + band gap despite having nothing to branch into — 9 rows
// and 8 gaps spent on what's often a single dot. Collapsed into one shared
// "compact strip" at the bottom instead, packed by real (label-width-aware)
// interval coloring rather than a fixed row count.
const COMPACT_BAND_IDS = new Set([
  'singer-songwriter', 'power-pop', 'indie-folk', 'garage-rock',
  'alt-country', 'freak-folk', 'minimalism', 'folk-punk',
  // post-rock meets the identical criteria (no parent, no children) but
  // wasn't in the list this was requested against — included for
  // consistency since it's the same shape of problem; flagged in the report.
  'post-rock',
]);

// Six curated hue families (matching the app's existing per-family palette
// convention — see Design system in CLAUDE.md) grouping the graph's ~15 real
// timeline roots by musical affinity. This is a presentation-only grouping:
// bands sharing a family share a hue, but no edge is ever drawn between
// different bands — the underlying parent data has no connection between
// them, and this layer doesn't invent one.
const BAND_FAMILY: Record<string, { hue: string; shades: string[] }> = {
  'proto-punk': { hue: 'indigo', shades: ['#8891F2'] },
  krautrock: { hue: 'magenta', shades: ['#C77DD1'] },
  'indie-rock': { hue: 'teal', shades: ['#5FD0C0', '#4BB8A8', '#7FE0D2'] },
  'alt-rock': { hue: 'teal', shades: ['#4BB8A8'] },
  'power-pop': { hue: 'teal', shades: ['#7FE0D2'] },
  'art-rock': { hue: 'gold', shades: ['#E8C87A', '#D9AE55', '#C99530'] },
  'garage-rock': { hue: 'gold', shades: ['#D9AE55'] },
  'post-rock': { hue: 'gold', shades: ['#C99530'] },
  'psychedelic-pop': { hue: 'rose', shades: ['#F2A8C4', '#D97FA0'] },
  minimalism: { hue: 'rose', shades: ['#D97FA0'] },
  'singer-songwriter': { hue: 'folk', shades: ['#78963C'] },
  'alt-country': { hue: 'folk', shades: ['#8CAA52'] },
  'freak-folk': { hue: 'folk', shades: ['#A1BD6C'] },
  'indie-folk': { hue: 'folk', shades: ['#B7D089'] },
  'folk-punk': { hue: 'folk', shades: ['#CEE3AA'] },
};

function effectiveParent(g: { parent: string | null }, byId: Map<string, { id: string; parent: string | null }>): string | null {
  if (g.parent === null) return null;
  const p = byId.get(g.parent);
  if (!p || CONTAINER_IDS.has(p.id)) return null;
  return g.parent;
}

interface Chain { startId: string; nodeIds: string[]; startRank: number; endRank: number }

export function buildGenreTimeline(graphData: GraphData): GenreTimelineLayout {
  const genres = graphData.genres;
  const counts = new Map<string, number>(genres.map(g => [g.id, 0]));
  for (const a of graphData.artists) {
    for (const g of a.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  const byId = new Map(genres.map(g => [g.id, g]));
  const dated = genres.filter(g => g.emerged !== undefined);

  const sorted = dated.slice().sort((a, b) => a.emerged! - b.emerged! || a.name.localeCompare(b.name));
  const rankOf = new Map<string, number>();
  sorted.forEach((g, i) => rankOf.set(g.id, i));
  const rankCount = sorted.length;
  const rankStep = (VIEW_W - PAD_LEFT - PAD_RIGHT) / Math.max(1, rankCount - 1);
  const xOf = (rank: number) => PAD_LEFT + rank * rankStep;

  const childrenOf = new Map<string, string[]>();
  const ROOT_KEY = '__ROOT__';
  for (const g of dated) {
    const ep = effectiveParent(g, byId) ?? ROOT_KEY;
    if (!childrenOf.has(ep)) childrenOf.set(ep, []);
    childrenOf.get(ep)!.push(g.id);
  }
  const bandRootIds = childrenOf.get(ROOT_KEY) ?? [];

  function subtreeArtists(id: string): number {
    let n = counts.get(id) ?? 0;
    for (const c of childrenOf.get(id) ?? []) n += subtreeArtists(c);
    return n;
  }

  // Heavy-path decomposition: within each band, the highest-count child
  // continues the "trunk" (same lane as its parent); every other child
  // starts a new chain, which may itself fork further down.
  const chains: Chain[] = [];
  const chainOfBand = new Map<string, Chain[]>();

  function heaviestChild(id: string): string | null {
    const kids = (childrenOf.get(id) ?? []).slice();
    if (kids.length === 0) return null;
    kids.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || rankOf.get(a)! - rankOf.get(b)!);
    return kids[0];
  }

  function buildChain(startId: string, bandId: string) {
    const nodeIds: string[] = [];
    let cur: string | null = startId;
    while (cur) {
      nodeIds.push(cur);
      const heavy = heaviestChild(cur);
      for (const k of childrenOf.get(cur) ?? []) {
        if (k !== heavy) buildChain(k, bandId);
      }
      cur = heavy;
    }
    const ranks = nodeIds.map(n => rankOf.get(n)!);
    const chain: Chain = { startId, nodeIds, startRank: Math.min(...ranks), endRank: Math.max(...ranks) };
    chains.push(chain);
    if (!chainOfBand.has(bandId)) chainOfBand.set(bandId, []);
    chainOfBand.get(bandId)!.push(chain);
  }
  for (const r of bandRootIds) buildChain(r, r);

  const majorBandIds = bandRootIds
    .filter(id => !COMPACT_BAND_IDS.has(id))
    .sort((a, b) => subtreeArtists(b) - subtreeArtists(a));
  const compactBandIds = bandRootIds.filter(id => COMPACT_BAND_IDS.has(id));

  const bands: TimelineBand[] = [];
  const laneOfChainStart = new Map<string, number>(); // chain.startId -> lane WITHIN its band/strip
  const bandOfChainStart = new Map<string, string>(); // chain.startId -> resolved band id ('__COMPACT__' for compact members)
  const yStartOfBand = new Map<string, number>(); // band id -> pixel y of lane 0
  const pitchOfBand = new Map<string, number>();

  let cursorY = PAD_TOP;

  // ── Major bands: same per-band greedy interval-coloring as before, but
  // pitch now scales with how many lanes the band actually needs — a band
  // with more branches gets more room per branch, not the same fixed pitch
  // every other band gets. ──
  for (const bandId of majorBandIds) {
    const bandChains = (chainOfBand.get(bandId) ?? []).slice().sort((a, b) => a.startRank - b.startRank);
    const laneEndRank: number[] = [];
    for (const c of bandChains) {
      let placed = -1;
      for (let lane = 0; lane < laneEndRank.length; lane++) {
        if (laneEndRank[lane] < c.startRank) { placed = lane; break; }
      }
      if (placed === -1) { placed = laneEndRank.length; laneEndRank.push(-1); }
      laneEndRank[placed] = c.endRank;
      laneOfChainStart.set(c.startId, placed);
      bandOfChainStart.set(c.startId, bandId);
    }
    const laneCount = laneEndRank.length;
    const pitch = BASE_LANE_PITCH + EXTRA_PITCH_PER_LANE * (laneCount - 1);
    yStartOfBand.set(bandId, cursorY);
    pitchOfBand.set(bandId, pitch);
    const family = BAND_FAMILY[bandId];
    bands.push({ id: bandId, name: byId.get(bandId)!.name, color: family?.shades[0] ?? '#8891F2', laneCount, isCompact: false });
    cursorY += laneCount * pitch + BAND_GAP;
  }

  // ── Compact strip: every tiny orphan band merged into one shared region,
  // packed with LABEL-WIDTH-AWARE interval coloring — a chain's occupied
  // interval is extended past its last node's own rank by how many ranks
  // its label needs, so two dots with no real overlap (e.g. garage-rock
  // 1963, minimalism 1964 — one rank apart) still land on separate rows if
  // their labels would otherwise collide. Plain point-interval coloring
  // undercounts this badly: it says all 9 of these fit on ONE shared row
  // (they never overlap as bare points), but their labels absolutely would.
  // ──
  if (compactBandIds.length > 0) {
    const compactChains = compactBandIds
      .flatMap(id => chainOfBand.get(id) ?? [])
      .slice()
      .sort((a, b) => a.startRank - b.startRank);
    const labelRankSpan = (name: string) => (estimateLabelWidth(name) + LABEL_GAP_PAD) / rankStep;
    const effectiveEnd = (c: Chain) => {
      const lastNode = byId.get(c.nodeIds[c.nodeIds.length - 1])!;
      return c.endRank + labelRankSpan(lastNode.name);
    };
    const laneEndRank: number[] = [];
    for (const c of compactChains) {
      const end = effectiveEnd(c);
      let placed = -1;
      for (let lane = 0; lane < laneEndRank.length; lane++) {
        if (laneEndRank[lane] < c.startRank) { placed = lane; break; }
      }
      if (placed === -1) { placed = laneEndRank.length; laneEndRank.push(-1); }
      laneEndRank[placed] = end;
      laneOfChainStart.set(c.startId, placed);
      bandOfChainStart.set(c.startId, '__COMPACT__');
    }
    const laneCount = laneEndRank.length;
    yStartOfBand.set('__COMPACT__', cursorY);
    pitchOfBand.set('__COMPACT__', BASE_LANE_PITCH);
    bands.push({ id: '__COMPACT__', name: 'Independent strands', color: '#9b96b8', laneCount, isCompact: true });
    cursorY += laneCount * BASE_LANE_PITCH;
  }

  const plotH = cursorY + PAD_TOP;
  const viewH = plotH + AXIS_H;

  // Assign lane + resolved band to every node (a chain's non-start members
  // inherit the chain's own lane/band — they're the straight continuation).
  const laneOfNode = new Map<string, number>();
  const resolvedBandOfNode = new Map<string, string>();
  for (const c of chains) {
    const lane = laneOfChainStart.get(c.startId)!;
    const band = bandOfChainStart.get(c.startId)!;
    for (const nid of c.nodeIds) {
      laneOfNode.set(nid, lane);
      resolvedBandOfNode.set(nid, band);
    }
  }

  const ALWAYS_LABEL_COUNT_THRESHOLD = 10;
  const alwaysLabeledIds = new Set<string>(bandRootIds);
  for (const g of dated) {
    if ((counts.get(g.id) ?? 0) >= ALWAYS_LABEL_COUNT_THRESHOLD) alwaysLabeledIds.add(g.id);
  }

  const effParentOf = new Map<string, string | null>(dated.map(g => [g.id, effectiveParent(g, byId)]));
  function findOriginalBand(id: string): string {
    let cur = id;
    let p = effParentOf.get(cur) ?? null;
    while (p !== null) {
      cur = p;
      p = effParentOf.get(cur) ?? null;
    }
    return cur;
  }

  const nodes: TimelineNode[] = dated.map(g => {
    const originalBandId = findOriginalBand(g.id);
    const resolvedBand = resolvedBandOfNode.get(g.id)!;
    const lane = laneOfNode.get(g.id)!;
    const family = BAND_FAMILY[originalBandId];
    const rank = rankOf.get(g.id)!;
    return {
      id: g.id,
      name: g.name,
      emerged: g.emerged!,
      emergedBasis: g.emergedBasis ?? '',
      count: counts.get(g.id) ?? 0,
      rank,
      x: xOf(rank),
      y: yStartOfBand.get(resolvedBand)! + lane * pitchOfBand.get(resolvedBand)!,
      lane,
      bandId: originalBandId,
      parentId: effParentOf.get(g.id) ?? null,
      alwaysLabeled: alwaysLabeledIds.has(g.id),
      color: family?.shades[0] ?? '#8891F2',
      isCompact: resolvedBand === '__COMPACT__',
    };
  });
  nodes.sort((a, b) => a.rank - b.rank);

  const yearMarks: { year: number; rank: number }[] = [];
  let lastYear: number | null = null;
  sorted.forEach((g, i) => {
    if (g.emerged !== lastYear) {
      yearMarks.push({ year: g.emerged!, rank: i });
      lastYear = g.emerged!;
    }
  });

  return {
    nodes,
    nodesById: new Map(nodes.map(n => [n.id, n])),
    bands,
    rankCount,
    yearMarks,
    viewH,
    plotH,
  };
}

// Returns the chain of ids from `id` up to (and including) its band root,
// via effective parents — used to highlight the full ancestral line on hover.
export function ancestorChain(id: string, layout: GenreTimelineLayout): string[] {
  const chain: string[] = [];
  let cur: string | undefined = id;
  while (cur) {
    chain.push(cur);
    const node = layout.nodesById.get(cur);
    cur = node?.parentId ?? undefined;
  }
  return chain;
}
