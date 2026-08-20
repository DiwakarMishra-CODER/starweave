import type { Layer, Realm } from '@/data/types';

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

// realm: 'region-one' — every real region-one Artist carries no `lineage`
// (unlike the five newer realms), so before this branch existed it fell
// through resolveNodeColor's final `LAYER_COLORS[node.layer]` line and
// painted by the dead 5-value Layer field instead — one realm rendering as
// five different colors (root gold, post-punk indigo, shoegaze-dreampop
// pink, indie-alt teal, outside near-white). Reuses the existing indie-alt
// teal verbatim (same reuse-don't-invent precedent as CORE_COLOR above) —
// teal sits at hue ~170°, the widest hue gap of any candidate (~85° of
// clearance from folk's ~70-85° family, ~101° from post-rock's ~271°),
// so a flat region-one reads as clearly distinct from all six other realms.
const REGION_ONE_COLOR = LAYER_COLORS['indie-alt'];
const REGION_ONE_GLOW = LAYER_GLOW['indie-alt'];
const REGION_ONE_EDGE_TINT = EDGE_TINT['indie-alt'];

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

// realm: 'folk-confessional' — one shade per folk-realm lineage, a warm
// yellow-green/olive family (hue ~70-85°) deliberately far from every other
// family in this file: region-one's indie-alt teal (#5FD0C0, hue ~170°,
// blue-green) reads clearly cooler, electronic's LINEAGE_COLORS (hue
// ~300-330°, magenta) and core's gold (#E8C87A, hue ~42°, orange-yellow)
// are both well clear of this range too. folk-roots is the deepest/most
// saturated (the elders), each subsequent lineage progressively brighter/
// lighter, same "one flat shade per lineage" structure as LINEAGE_COLORS.
export const FOLK_LINEAGE_COLORS: Record<string, string> = {
  'folk-roots':   '#78963C',
  'freak-folk':   '#8CAA52',
  confessional:   '#A1BD6C',
  slowcore:       '#B7D089',
  'indie-folk':   '#CEE3AA',
};

// Fallback for a folk lineage string not in the map above (defensive only —
// every current folk-realm lineage is covered).
const DEFAULT_FOLK_COLOR = '#8CAA52';

// realm: 'emo-posthardcore' — one shade per emo-realm lineage, a red/crimson
// family (hue ~355-8°) distinct from every other family in this file:
// region-one's teal (~170°), electronic's magenta (~300-330°), core/root's
// gold (~42°), and folk's yellow-green/olive (~70-85°) are all well clear of
// this range. hardcore-roots is the deepest/most saturated (the scene's
// literal origin point), each subsequent lineage progressively brighter,
// same "one flat shade per lineage, darkest-to-brightest by era" structure
// as FOLK_LINEAGE_COLORS/LINEAGE_COLORS.
export const EMO_LINEAGE_COLORS: Record<string, string> = {
  'hardcore-roots': '#8C1E1E',
  'post-hardcore':  '#B02E2E',
  'midwest-emo':    '#D14A3A',
  'math-rock':      '#F26B52',
};

// Fallback for an emo lineage string not in the map above (defensive only —
// every current emo-realm lineage is covered).
const DEFAULT_EMO_COLOR = '#B02E2E';

// realm: 'post-rock-drone-noise' — one shade per lineage, a true purple/
// violet family (hue ~271°, blue-violet) held deliberately apart from every
// other family in this file: region-one's post-punk indigo (#8891F2, hue
// ~235°, much lighter/pastel), electronic's magenta family (hue ~300-330°),
// emo's red/crimson family (hue ~0-8°), folk's yellow-green/olive (hue
// ~70-85°), and core/root's gold (hue ~42°) are all well clear of this
// range. no-wave is the deepest/most saturated (the scene's 1970s NYC
// origin point), post-rock sits in the middle, drone is the lightest —
// same "one flat shade per lineage, darkest-to-brightest" structure as
// EMO_LINEAGE_COLORS/FOLK_LINEAGE_COLORS/LINEAGE_COLORS.
// no-wave was originally #3B1F5C (1.42:1 contrast against #0e0b1a — the
// same illegible value SCENE_COLORS' no-wave entry was already flagged and
// fixed for, see that map's own comment). That value was never fixed HERE,
// so no-wave-lineage artists (Swans, Blonde Redhead, Mars, DNA, Teenage
// Jesus and the Jerks, James Chance and the Contortions) rendered with
// visually dead node fills and near-invisible focus-mode edges — reported
// directly ("Swans/Blonde Redhead edges too faint, MBV/Cocteau Twins look
// fine"). #683A9C keeps the same ~268° hue and stays the deepest of the
// three shades (still darker than post-rock), but lifts contrast from
// 1.42:1 to 2.47:1 — just under post-rock's own 2.63:1, which nobody has
// flagged as illegible, rather than chasing a much brighter target that
// would abandon "no-wave is the deepest" entirely.
export const POSTROCK_LINEAGE_COLORS: Record<string, string> = {
  'no-wave':   '#683A9C',
  'post-rock': '#6B3FA0',
  drone:       '#A87FD1',
};

// Fallback for a post-rock-realm lineage string not in the map above
// (defensive only — every current lineage is covered).
const DEFAULT_POSTROCK_COLOR = '#6B3FA0';

// realm: 'american-underground' — one shade per lineage, an amber/orange/
// rust family (hue ~18-22°) held deliberately apart from every other family
// in this file, including core/root's gold (#E8C87A, hue ~42°, much paler
// and yellower) — this family stays low-hue, toward orange-red/rust rather
// than drifting up toward gold. Also clear of region-one's post-punk indigo
// (~235°), electronic's magenta (~300-330°), folk's yellow-green (~70-85°),
// emo's red/crimson (~0-8°, redder/less orange than this), and post-rock's
// violet (~271°). noise-alt is the deepest/most saturated (the 80s noise-
// rock pioneers), college-rock sits in the middle, indie-rock is the
// lightest/most contemporary — same "one flat shade per lineage,
// darkest-to-brightest" structure as the other multi-lineage realms.
export const AMERICAN_UNDERGROUND_LINEAGE_COLORS: Record<string, string> = {
  'noise-alt':     '#7A3418',
  'college-rock':  '#B85C2E',
  'indie-rock':    '#E8834A',
};

// Fallback for an american-underground lineage string not in the map above
// (defensive only — every current lineage is covered).
const DEFAULT_AMERICAN_UNDERGROUND_COLOR = '#B85C2E';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function electronicColor(lineage?: string): string {
  return LINEAGE_COLORS[lineage ?? ''] ?? DEFAULT_ELECTRONIC_COLOR;
}

function folkColor(lineage?: string): string {
  return FOLK_LINEAGE_COLORS[lineage ?? ''] ?? DEFAULT_FOLK_COLOR;
}

function emoColor(lineage?: string): string {
  return EMO_LINEAGE_COLORS[lineage ?? ''] ?? DEFAULT_EMO_COLOR;
}

function postrockColor(lineage?: string): string {
  return POSTROCK_LINEAGE_COLORS[lineage ?? ''] ?? DEFAULT_POSTROCK_COLOR;
}

function americanUndergroundColor(lineage?: string): string {
  return AMERICAN_UNDERGROUND_LINEAGE_COLORS[lineage ?? ''] ?? DEFAULT_AMERICAN_UNDERGROUND_COLOR;
}

export function resolveNodeColor(node: RealmLineageNode): string {
  if (!node.realm) return LAYER_COLORS[node.layer];
  if (node.realm === 'core') return CORE_COLOR;
  if (node.realm === 'region-one') return REGION_ONE_COLOR;
  if (node.realm === 'electronic') return electronicColor(node.lineage);
  if (node.realm === 'folk-confessional') return folkColor(node.lineage);
  if (node.realm === 'emo-posthardcore') return emoColor(node.lineage);
  if (node.realm === 'post-rock-drone-noise') return postrockColor(node.lineage);
  if (node.realm === 'american-underground') return americanUndergroundColor(node.lineage);
  return LAYER_COLORS[node.layer];
}

export function resolveNodeGlow(node: RealmLineageNode): string {
  if (!node.realm) return LAYER_GLOW[node.layer];
  if (node.realm === 'core') return CORE_GLOW;
  if (node.realm === 'region-one') return REGION_ONE_GLOW;
  if (node.realm === 'electronic') return hexToRgba(electronicColor(node.lineage), 0.7);
  if (node.realm === 'folk-confessional') return hexToRgba(folkColor(node.lineage), 0.7);
  if (node.realm === 'emo-posthardcore') return hexToRgba(emoColor(node.lineage), 0.7);
  if (node.realm === 'post-rock-drone-noise') return hexToRgba(postrockColor(node.lineage), 0.7);
  if (node.realm === 'american-underground') return hexToRgba(americanUndergroundColor(node.lineage), 0.7);
  return LAYER_GLOW[node.layer];
}

export function resolveEdgeTint(node: RealmLineageNode): string {
  if (!node.realm) return EDGE_TINT[node.layer];
  if (node.realm === 'core') return CORE_EDGE_TINT;
  if (node.realm === 'region-one') return REGION_ONE_EDGE_TINT;
  if (node.realm === 'electronic') return hexToRgba(electronicColor(node.lineage), 0.4);
  if (node.realm === 'folk-confessional') return hexToRgba(folkColor(node.lineage), 0.4);
  if (node.realm === 'emo-posthardcore') return hexToRgba(emoColor(node.lineage), 0.4);
  if (node.realm === 'post-rock-drone-noise') return hexToRgba(postrockColor(node.lineage), 0.4);
  if (node.realm === 'american-underground') return hexToRgba(americanUndergroundColor(node.lineage), 0.4);
  return EDGE_TINT[node.layer];
}

// Ordered list of every realm, in the app's canonical display order — the
// same list the graph's realm filter (GraphControls) iterates, so its 7
// rows always render in the same order. (A separate bottom-left legend
// panel used to iterate this too, showing the same realms a second time —
// removed as a duplicate once GraphControls' filter took over that job.)
export const REALMS: Realm[] = [
  'core',
  'region-one',
  'american-underground',
  'electronic',
  'folk-confessional',
  'emo-posthardcore',
  'post-rock-drone-noise',
];

// Single display name per realm — this is the distinction a visitor can
// actually see (node color, legend, filter). The finer per-lineage
// subdivisions inside a realm exist for layout/data structure, not because
// they're visually distinguishable — see the lineage color comments above,
// where every lineage within one realm renders as a near-identical shade
// of that realm's one hue.
export const REALM_LABELS: Record<Realm, string> = {
  core: 'Core',
  // "to Shoegaze", not "to Dream Pop": the label names an arc, and shoegaze is
  // where that arc actually ends. In this graph's own genre hierarchy
  // shoegaze's parent IS dream-pop (1988 descending from 1984), so ending the
  // name at dream pop stops a generation short and implies it is the terminus
  // when it is really the parent of what came next. Dream pop is the larger
  // cohort (18 region-one artists to shoegaze's 15, and 8 carry both tags), so
  // this is a call about where the line reaches rather than about which is
  // bigger. Caveat kept deliberately: neither name covers the realm's real
  // tail, which runs to 2021 (black midi, Squid, Jockstrap, beabadoobee,
  // Fontaines D.C.) -- fixing that needs a label that names no terminus at all.
  'region-one': 'Punk to Shoegaze',
  'american-underground': 'American Underground',
  electronic: 'Electronic',
  // "Folk Confessional" read as a single genre name, and no such genre exists.
  // Ampersand rather than "Folk to Confessional" (the arc form region-one uses)
  // and rather than plain "Folk": only 27 of the 50 members are folk in any
  // sense -- confessional is the largest lineage at 16, and the 7 slowcore
  // artists (Codeine, Low, Duster) are not folk at all.
  'folk-confessional': 'Folk & Confessional',
  'emo-posthardcore': 'Emo & Post-Hardcore',
  'post-rock-drone-noise': 'Post-Rock, Drone & Noise',
};

// Single representative swatch per realm, for the legend and the realm
// filter — each reuses that realm's own DEFAULT_*_COLOR (the same mid-tone
// shade a lineage-less/unrecognized node in that realm already falls back
// to), so the swatch always matches what most of that realm's nodes render.
export const REALM_COLORS: Record<Realm, string> = {
  core: CORE_COLOR,
  'region-one': REGION_ONE_COLOR,
  'american-underground': DEFAULT_AMERICAN_UNDERGROUND_COLOR,
  electronic: DEFAULT_ELECTRONIC_COLOR,
  'folk-confessional': DEFAULT_FOLK_COLOR,
  'emo-posthardcore': DEFAULT_EMO_COLOR,
  'post-rock-drone-noise': DEFAULT_POSTROCK_COLOR,
};

// Only a genuinely realm-less node falls through to LAYER_LABELS[layer] now.
// region-one used to be the one realm still reporting its fine-grained Layer
// text here ('Post-punk / Goth', 'Outside influences') instead of a realm
// name — a leftover from before d8fd0c0 flattened its node COLOR to one flat
// teal; once the dot stopped varying by layer, the label still doing so just
// read as a mismatch (same-colored dot, five different badge texts). Every
// realm now reports its own REALM's display name rather than a finer
// lineage/layer (e.g. 'Electronic', not 'Hyperpop / PC Music') — that finer
// string is an internal clustering label a visitor has no way to verify; the
// genre tags shown alongside already convey what kind of music this is, and
// a realm name is a real category the rest of the UI (legend, filter, URLs)
// also uses.
export function resolveNodeLabel(node: RealmLineageNode): string {
  if (!node.realm) return LAYER_LABELS[node.layer];
  if (node.realm === 'core') return REALM_LABELS.core;
  if (node.realm === 'region-one') return REALM_LABELS['region-one'];
  if (node.realm === 'electronic') return REALM_LABELS.electronic;
  if (node.realm === 'folk-confessional') return REALM_LABELS['folk-confessional'];
  if (node.realm === 'emo-posthardcore') return REALM_LABELS['emo-posthardcore'];
  if (node.realm === 'post-rock-drone-noise') return REALM_LABELS['post-rock-drone-noise'];
  if (node.realm === 'american-underground') return REALM_LABELS['american-underground'];
  return LAYER_LABELS[node.layer];
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
  'art-pop':    '#E8C87A',  // gold — child of art-rock, same lineage
  krautrock:    '#C77DD1',  // reuses LINEAGE_COLORS.krautrock (electronic realm)
  ambient:      '#C99AE0',  // reuses LINEAGE_COLORS['ambient-drone']
  hyperpop:     '#FF6EC7',  // reuses LINEAGE_COLORS['hyperpop-pcmusic']
  'hardcore-punk': '#8C1E1E', // reuses EMO_LINEAGE_COLORS['hardcore-roots'] — most tagged artists carry that lineage
  punk:            '#8891F2', // indigo — same family as its proto-punk parent
  'post-hardcore': '#B02E2E', // reuses EMO_LINEAGE_COLORS['post-hardcore']
  emo:             '#D14A3A', // reuses EMO_LINEAGE_COLORS['midwest-emo'] — distinct from post-hardcore's shade
  'synth-pop':     '#E066C4', // reuses LINEAGE_COLORS['synth-pop']
  'lo-fi':         '#5FD0C0', // teal — same family as indie-rock/noise-rock
  'post-rock':     '#6B3FA0', // reuses POSTROCK_LINEAGE_COLORS['post-rock']
  'indie-pop':     '#F2A8C4', // rose — same family as shoegaze/dream-pop, its heaviest overlap
  'midwest-emo':   '#D14A3A', // reuses EMO_LINEAGE_COLORS['midwest-emo'] — same shade as its emo parent
  'math-rock':     '#F26B52', // reuses EMO_LINEAGE_COLORS['math-rock'] — brightest of the emo family
  'no-wave':       '#683A9C', // reuses POSTROCK_LINEAGE_COLORS['no-wave']
  darkwave:        '#A87FD1', // reuses POSTROCK_LINEAGE_COLORS['drone'] — goth's electronic-leaning cousin
  'garage-rock':   '#E8C87A', // gold — root genre, same family as art-rock/krautrock
  'chamber-pop':   '#5FD0C0', // teal — indie-rock family
  'singer-songwriter': '#78963C', // reuses FOLK_LINEAGE_COLORS['folk-roots']
  'indie-folk':    '#CEE3AA', // reuses FOLK_LINEAGE_COLORS['indie-folk']
  'alt-country':   '#B85C2E', // reuses AMERICAN_UNDERGROUND_LINEAGE_COLORS['college-rock']
  slowcore:        '#B7D089', // reuses FOLK_LINEAGE_COLORS['slowcore']
  'bedroom-pop':   '#5FD0C0', // teal — indie-rock family, small genre
  'psychedelic-pop': '#A56DD6', // reuses LINEAGE_COLORS['art-electronic']
  idm:             '#B25CC9', // reuses LINEAGE_COLORS.idm
  industrial:      '#F25FA8', // reuses LINEAGE_COLORS['electronic-indie-dancepunk']
  drone:           '#A87FD1', // reuses POSTROCK_LINEAGE_COLORS['drone'] — same family as darkwave
  'trip-hop':      '#B0679E', // reuses LINEAGE_COLORS['trip-hop-downtempo']
  'neo-psychedelia': '#A56DD6', // same as its psychedelic-pop parent
  'experimental-pop': '#FF6EC7', // reuses LINEAGE_COLORS['hyperpop-pcmusic']
  'riot-grrrl':    '#8891F2', // indigo — same family as its punk parent
  vaporwave:       '#C99AE0', // reuses LINEAGE_COLORS['ambient-drone'] — same family as ambient
  'freak-folk':    '#8CAA52', // reuses FOLK_LINEAGE_COLORS['freak-folk']
  britpop:         '#5FD0C0', // teal — indie-rock family
  grunge:          '#7A3418', // reuses AMERICAN_UNDERGROUND_LINEAGE_COLORS['noise-alt']
  'noise-pop':     '#5FD0C0', // teal — same family as its noise-rock parent
  minimalism:      '#683A9C', // reuses POSTROCK_LINEAGE_COLORS['no-wave'] — same family as its 2 tagged artists' real lineage
  'folk-punk':     '#8891F2', // indigo — punk half of the blend
  'hypnagogic-pop': '#A56DD6', // same as its psychedelic-pop grandparent
  electronic:      '#C77DD1', // reuses LINEAGE_COLORS.krautrock — the realm's own founding lineage
  folk:            '#A1BD6C', // reuses FOLK_LINEAGE_COLORS.confessional — the mode the page argues "folk" now means
};

export const DEFAULT_GENRE_COLOR = '#8891F2';

// Rebuilt for consistent perceived brightness, not just distinct hues — the
// previous set (each reused wholesale from an existing lineage family) put
// no-wave/dischord/sst at each family's own DEEPEST shade (the "1970s/80s
// origin point" convention those families use elsewhere), which reads fine
// as a lineage-color accent but fails badly as a scene's own background/
// title color: no-wave's #3B1F5C measured 1.42:1 contrast against the
// #0e0b1a background — a title in that color was reported illegible, and
// dischord (2.14:1) and sst (2.16:1) had the same problem one notch less
// severe. Meanwhile the other 9 scenes ranged 4.88:1 (Bristol) to 14.05:1
// (Glasgow) — legible individually, but Glasgow's bar still visibly
// "popped" next to Bristol's, which is what "no bar should recede" is
// actually asking to fix.
//
// This set targets one fixed WCAG relative luminance (~0.40, i.e. ~8.3:1
// contrast against the page background) at a consistent HSL saturation
// (0.60), varying ONLY hue, spaced roughly 30° apart around the wheel —
// genuinely equal brightness by the same math used to catch the illegible
// case above, not just "looks about as bright to me." riot-grrrl is the one
// deliberate exception, kept at its original #8891F2 (6.82:1, still well
// above the 4.5:1 text-legibility floor) because it was chosen to match the
// riot-grrrl GENRE's own color on purpose — changing it would break that.
export const SCENE_COLORS: Record<string, string> = {
  'dc-hardcore': '#E49494', // 0°   — warm red-pink (renamed from 'dischord'; same hue)
  sst:           '#D89E64', // 30°  — tan-orange
  dusseldorf:    '#CCA633', // 45°  — gold. The one genuinely new hue: every 30° slot was
                            //        already taken, so this splits the sst/elephant-6 gap and
                            //        sits ~15° from each. Solved to the same target as the
                            //        rest (luminance 0.403, 8.39:1 on #0e0b1a).
  'elephant-6':  '#AFAF2C', // 60°  — olive-yellow
  seattle:       '#76BC2F', // 90°  — grass green
  glasgow:       '#31C331', // 120° — green
  windmill:      '#30C178', // 150° — spring green-teal, closest match to its own prior teal identity
  manchester:    '#2FBCBC', // 180° — cyan-teal
  'no-wave':     '#7DAEDF', // 210° — steel blue — was the illegible #3B1F5C; this is the fix
  'riot-grrrl':  '#8891F2', // 235° — indigo — KEPT UNCHANGED, matches GENRE_COLORS['riot-grrrl'] deliberately
  '4ad':         '#C09AE6', // 270° — lavender
  cbgb:          '#E28BE2', // 300° — magenta/orchid, inherited from the removed 'creation'
                            //        entry, so the wheel keeps its existing spacing
  bristol:       '#E390BA', // 330° — dusty rose
  'greenwich-village':
                 '#E492A7', // 345° — rose-pink. Second gap-splitter (after dusseldorf's
                            //        45°): at 14 scenes the wheel no longer divides into
                            //        clean 30° steps, so this sits ~15° off bristol.
};

export const DEFAULT_SCENE_COLOR = '#C9985E';
