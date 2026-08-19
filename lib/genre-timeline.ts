import type { GraphData } from '@/data/types';

// Builds the layout model for the genre-index "poster map" — a subway-style
// diagram positioning every dated genre by when it emerged (x, ordinal rank
// among dated genres — NOT a linear year scale) and by lineage (y).
//
// Pure data/layout computation — no DOM, safe to run in a Server Component.
// x/y are resolved to final pixel coordinates here (not left to the
// component) because the row-packing decisions below need real pixel widths
// to reason about label collisions — see the packing loop's comment.
//
// Re-derived for the 2026 genre-hierarchy pass (parent + alsoFrom — see
// data/seed-data.ts's file-level comment on the genres array): the old
// layout was built for eleven scattered roots, most of them 0-1-child
// orphans, and leaned on a two-tier system (a handful of "major" bands
// packed by bare rank overlap, plus a shared "compact strip" for the tiny
// orphans, packed by label-aware interval coloring since bare-rank packing
// undercounted their real footprint). That split doesn't apply anymore:
// reparenting collapsed eleven roots to five, and only one of those five
// (minimalism, held out of the no-wave reparenting for a real chronology
// violation — see seed-data.ts) is still a trivial single-node band. Every
// band now gets the SAME treatment — heavy-path decomposition for chains,
// label-aware interval packing for lanes — since a genuinely deep band
// (garage-rock's subtree alone is 26 of the 51 dated genres) has exactly
// the same label-collision risk the old compact strip was built to solve,
// not a different problem than the tiny bands had.

// ── Geometry constants — shared source of truth with GenreTimeline.tsx ──
export const VIEW_W = 1400;
export const PAD_LEFT = 34;
export const PAD_RIGHT = 46;
// Raised from 10: row-0 nodes (the band roots) sit right at this offset, and
// their glow filter's blur region extends well past their own radius — too
// little headroom here let that glow bleed up toward the SVG's very top
// edge, close enough to the header block above it to read as a collision.
export const PAD_TOP = 24;
export const AXIS_H = 34;
// Base per-lane pixel pitch; bands with more lanes get MORE than this (see
// bandPitch below) — a 1-lane band doesn't need the breathing room a
// 10-lane band does, and forcing them to match either starves the busy band
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
  lane: number; // physical row index WITHIN this node's band — used to
  // group same-row labels for truncation, not a global index
  bandId: string; // the top-level root this node's subtree belongs to
  parentId: string | null; // primary parent for drawing the structural edge and the
  // layout position — null if this node's real parent is either absent or a pure
  // container (electronic/folk/indie/underground), which are excluded from the
  // timeline entirely
  alsoFromIds: string[]; // secondary parents — drawn as distinct lines, never affect x/y
  alwaysLabeled: boolean;
  color: string; // resolved from the node's ROOT (band) — flat per root, not
  // shaded by sub-lineage, so the whole subtree reads as one branch color
  isCompact: boolean; // true only for a genuinely single-node band (currently just minimalism)
}

export interface TimelineBand {
  id: string; // the root genre id anchoring this band
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

// 'underground' and 'indie' used to be in here too; both were deleted from the
// genre vocabulary for carrying zero artists (see the note in data/seed-data.ts).
const CONTAINER_IDS = new Set(['electronic', 'folk']);

// One flat color per root — every genre in a root's subtree gets that
// root's color, full stop. The pre-2026-pass version shaded each old
// sub-family with its own tint (proto-punk vs. its post-punk children,
// etc.); with only four real branches now (plus minimalism, held out as a
// genuine edge case, not a fifth peer branch) a single flat hue per root is
// what actually reads as "four colours, meaningful, readable at a glance"
// instead of a dozen barely-distinguishable shades. All five hexes are
// reused from the app's existing palette (lib/colors.ts) — none invented.
const ROOT_COLOR: Record<string, string> = {
  'garage-rock': '#E8C87A',       // LAYER_COLORS.root gold — the graph's earliest chronological root (1963) and its biggest branch by far (26 of 51 dated genres)
  'art-rock': '#C77DD1',          // LINEAGE_COLORS.krautrock magenta — this branch IS the krautrock/electronic lineage
  'psychedelic-pop': '#F2A8C4',   // LAYER_COLORS['shoegaze-dreampop'] rose
  'singer-songwriter': '#78963C', // FOLK_LINEAGE_COLORS['folk-roots'] olive-green
  minimalism: '#9b96b8',          // neutral — a held, single-node edge case, not a real fifth peer branch (see seed-data.ts)
};
const DEFAULT_ROOT_COLOR = '#8891F2';

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
  const datedIds = new Set(dated.map(g => g.id));

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

  // Every root is a real band now — ordered by total subtree artist weight,
  // biggest first (garage-rock's ~330-artist branch, down to minimalism's
  // single node).
  const orderedBandIds = bandRootIds.slice().sort((a, b) => subtreeArtists(b) - subtreeArtists(a));

  const bands: TimelineBand[] = [];
  const laneOfChainStart = new Map<string, number>(); // chain.startId -> lane WITHIN its band
  const yStartOfBand = new Map<string, number>(); // band id -> pixel y of lane 0
  const pitchOfBand = new Map<string, number>();

  let cursorY = PAD_TOP;

  // Label-aware interval coloring, applied uniformly to every band: a
  // chain's occupied interval is extended past its last node's own rank by
  // how many ranks its label needs, so two dots with no real rank overlap
  // still land on separate lanes if their labels would otherwise collide.
  // Plain point-interval coloring undercounts this — it only checks bare
  // rank overlap, not the label text that actually has to fit next to it.
  const labelRankSpan = (name: string) => (estimateLabelWidth(name) + LABEL_GAP_PAD) / rankStep;
  const effectiveEnd = (c: Chain) => {
    const lastNode = byId.get(c.nodeIds[c.nodeIds.length - 1])!;
    return c.endRank + labelRankSpan(lastNode.name);
  };

  for (const bandId of orderedBandIds) {
    const bandChains = (chainOfBand.get(bandId) ?? []).slice().sort((a, b) => a.startRank - b.startRank);
    const laneEndRank: number[] = [];
    for (const c of bandChains) {
      const end = effectiveEnd(c);
      let placed = -1;
      for (let lane = 0; lane < laneEndRank.length; lane++) {
        if (laneEndRank[lane] < c.startRank) { placed = lane; break; }
      }
      if (placed === -1) { placed = laneEndRank.length; laneEndRank.push(-1); }
      laneEndRank[placed] = end;
      laneOfChainStart.set(c.startId, placed);
    }
    const laneCount = laneEndRank.length;
    const pitch = BASE_LANE_PITCH + EXTRA_PITCH_PER_LANE * (laneCount - 1);
    yStartOfBand.set(bandId, cursorY);
    pitchOfBand.set(bandId, pitch);
    bands.push({
      id: bandId,
      name: byId.get(bandId)!.name,
      color: ROOT_COLOR[bandId] ?? DEFAULT_ROOT_COLOR,
      laneCount,
      isCompact: laneCount === 1 && bandChains.length === 1 && bandChains[0].nodeIds.length === 1,
    });
    cursorY += laneCount * pitch + BAND_GAP;
  }

  const plotH = cursorY + PAD_TOP;
  const viewH = plotH + AXIS_H;

  // Assign lane to every node (a chain's non-start members inherit the
  // chain's own lane — they're the straight continuation).
  const laneOfNode = new Map<string, number>();
  for (const c of chains) {
    const lane = laneOfChainStart.get(c.startId)!;
    for (const nid of c.nodeIds) laneOfNode.set(nid, lane);
  }

  const ALWAYS_LABEL_COUNT_THRESHOLD = 10;
  const alwaysLabeledIds = new Set<string>(bandRootIds);
  for (const g of dated) {
    if ((counts.get(g.id) ?? 0) >= ALWAYS_LABEL_COUNT_THRESHOLD) alwaysLabeledIds.add(g.id);
  }

  const effParentOf = new Map<string, string | null>(dated.map(g => [g.id, effectiveParent(g, byId)]));
  function findBandRoot(id: string): string {
    let cur = id;
    let p = effParentOf.get(cur) ?? null;
    while (p !== null) {
      cur = p;
      p = effParentOf.get(cur) ?? null;
    }
    return cur;
  }

  const nodes: TimelineNode[] = dated.map(g => {
    const bandRootId = findBandRoot(g.id);
    const lane = laneOfNode.get(g.id)!;
    const rank = rankOf.get(g.id)!;
    // alsoFrom entries are validated at write time (see the hierarchy pass's
    // report) but re-filtered here defensively: a secondary parent must
    // still be a real, dated, non-container genre to draw a line to it.
    const alsoFromIds = (g.alsoFrom ?? []).filter(id => datedIds.has(id) && id !== g.parent);
    return {
      id: g.id,
      name: g.name,
      emerged: g.emerged!,
      emergedBasis: g.emergedBasis ?? '',
      count: counts.get(g.id) ?? 0,
      rank,
      x: xOf(rank),
      y: yStartOfBand.get(bandRootId)! + lane * pitchOfBand.get(bandRootId)!,
      lane,
      bandId: bandRootId,
      parentId: effParentOf.get(g.id) ?? null,
      alsoFromIds,
      alwaysLabeled: alwaysLabeledIds.has(g.id),
      color: ROOT_COLOR[bandRootId] ?? DEFAULT_ROOT_COLOR,
      isCompact: bands.find(b => b.id === bandRootId)?.isCompact ?? false,
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
// via primary parents — used to highlight the full ancestral line on hover.
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
