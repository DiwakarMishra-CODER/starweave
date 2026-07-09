import type { Layer } from '@/data/types';

export const LAYER_COLORS: Record<Layer, string> = {
  root: '#E8C87A',
  'post-punk': '#8891F2',
  'shoegaze-dreampop': '#F2A8C4',
  'indie-alt': '#5FD0C0',
  outside: '#EDEBF5',
};

export const LAYER_GLOW: Record<Layer, string> = {
  root: 'rgba(232, 200, 122, 0.7)',
  'post-punk': 'rgba(136, 145, 242, 0.7)',
  'shoegaze-dreampop': 'rgba(242, 168, 196, 0.7)',
  'indie-alt': 'rgba(95, 208, 192, 0.7)',
  outside: 'rgba(237, 235, 245, 0.7)',
};

export const LAYER_LABELS: Record<Layer, string> = {
  root: 'Roots',
  'post-punk': 'Post-punk / Goth',
  'shoegaze-dreampop': 'Shoegaze / Dream-pop',
  'indie-alt': 'Indie / Alt-rock',
  outside: 'Outside influences',
};

export const BG_COLOR = '#0E0B1A';
export const TEXT_COLOR = '#EDEAF7';
export const TEXT_MUTED = '#9B96B8';
export const EDGE_VERIFIED = 'rgba(237, 234, 247, 0.28)';
export const EDGE_SUGGESTED = 'rgba(155, 150, 184, 0.13)';
export const EDGE_PATH = '#F2A8C4';
export const EDGE_HOVER = 'rgba(242, 168, 196, 0.65)';

export const LAYERS: Layer[] = ['root', 'post-punk', 'shoegaze-dreampop', 'indie-alt', 'outside'];

// Moved here verbatim from components/graph/ForceGraph.tsx (same 5 values,
// same keys) so the realm/lineage resolvers below can reference it —
// ForceGraph.tsx now imports resolveEdgeTint instead of defining this
// locally. Edge colors tinted toward source-node layer; unchanged from the
// original: all influence edges render uniformly regardless of
// verified/ai-suggested status — see Edge['status'] in data/types.ts.
export const EDGE_TINT: Record<Layer, string> = {
  root:                'rgba(232, 200, 122, 0.4)',
  'post-punk':         'rgba(136, 145, 242, 0.4)',
  'shoegaze-dreampop': 'rgba(242, 168, 196, 0.4)',
  'indie-alt':         'rgba(95,  208, 192, 0.4)',
  outside:             'rgba(237, 235, 245, 0.38)',
};

// ── Realm/lineage color resolvers ────────────────────────────────────────────
// Additive extension for sandbox datasets (e.g. data/island-two-data.ts) that
// tag nodes with `realm`/`lineage` fields the real Artist type doesn't have.
// Every real region-one Artist has neither field, so the `!node.realm`
// fallback branch below — LAYER_COLORS[layer] / LAYER_GLOW[layer] /
// EDGE_TINT[layer], the exact same lookup as before this file changed — is
// the ONLY branch a region-one node can ever take. Region-one rendering is
// byte-for-byte unchanged by this addition.
export interface RealmLineageNode {
  layer: Layer;
  realm?: string;
  lineage?: string;
}

// realm: 'core' reuses the existing root gold exactly, so core nodes (Velvet
// Underground, Kraftwerk, Can, Neu!, Brian Eno) read as the same established
// "roots" color rather than a new one.
const CORE_COLOR = LAYER_COLORS.root;
const CORE_GLOW = LAYER_GLOW.root;
const CORE_EDGE_TINT = EDGE_TINT.root;

// realm: 'electronic' — one shade per island-two lineage, magenta/pink-purple
// family. Mid-to-light (dark vanishes on the #0E0B1A background),
// distinguishable from each other and from every region-one Layer color.
export const LINEAGE_COLORS: Record<string, string> = {
  krautrock:                    '#C77DD1',
  'synth-pop':                  '#E066C4',
  idm:                          '#B25CC9',
  'ambient-drone':              '#C99AE0',
  'electronic-indie-dancepunk': '#F25FA8',
  'trip-hop-downtempo':         '#B0679E',
  'hyperpop-pcmusic':           '#FF6EC7',
  'art-electronic':             '#A56DD6',
};

// Fallback for a lineage string not in the map above (defensive only —
// every current island-two lineage is covered).
const DEFAULT_ELECTRONIC_COLOR = '#C77DD1';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function electronicColor(lineage?: string): string {
  return LINEAGE_COLORS[lineage ?? ''] ?? DEFAULT_ELECTRONIC_COLOR;
}

export function resolveNodeColor(node: RealmLineageNode): string {
  if (!node.realm) return LAYER_COLORS[node.layer];
  if (node.realm === 'core') return CORE_COLOR;
  if (node.realm === 'electronic') return electronicColor(node.lineage);
  return LAYER_COLORS[node.layer];
}

export function resolveNodeGlow(node: RealmLineageNode): string {
  if (!node.realm) return LAYER_GLOW[node.layer];
  if (node.realm === 'core') return CORE_GLOW;
  if (node.realm === 'electronic') return hexToRgba(electronicColor(node.lineage), 0.7);
  return LAYER_GLOW[node.layer];
}

export function resolveEdgeTint(node: RealmLineageNode): string {
  if (!node.realm) return EDGE_TINT[node.layer];
  if (node.realm === 'core') return CORE_EDGE_TINT;
  if (node.realm === 'electronic') return hexToRgba(electronicColor(node.lineage), 0.4);
  return EDGE_TINT[node.layer];
}

export const GENRE_COLORS: Record<string, string> = {
  shoegaze:     '#F2A8C4',  // rose — shoegaze-dreampop layer
  'dream-pop':  '#F2A8C4',
  'post-punk':  '#8891F2',  // indigo — post-punk layer
  goth:         '#8891F2',
  'dance-punk': '#8891F2',
  'proto-punk': '#8891F2',
  'art-rock':   '#E8C87A',  // gold — root layer
  underground:  '#E8C87A',
  indie:        '#5FD0C0',  // teal — indie-alt layer
  'indie-rock': '#5FD0C0',
  'alt-rock':   '#5FD0C0',
  'noise-rock': '#5FD0C0',
  'jangle-pop': '#5FD0C0',
  'power-pop':  '#5FD0C0',
};

export const DEFAULT_GENRE_COLOR = '#8891F2';

// Scenes are a time + place, not a sound — deliberately muted/warm (archival,
// documentary) rather than the saturated single hues genres use.
export const SCENE_COLORS: Record<string, string> = {
  'american-underground': '#C9985E',
};

export const DEFAULT_SCENE_COLOR = '#C9985E';
