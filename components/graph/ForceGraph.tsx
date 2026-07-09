'use client';

import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force-3d';
import type { Artist, Edge, GraphData, Layer } from '@/data/types';
import { resolveNodeColor, resolveNodeGlow, resolveEdgeTint } from '@/lib/colors';
import { getNeighbors, pathEdgeKeys } from '@/lib/graph-utils';

// AABB overlap test for label collision avoidance [x, y, w, h]
function rectsOverlap(
  a: [number, number, number, number],
  b: [number, number, number, number],
): boolean {
  return a[0] < b[0] + b[2] && a[0] + a[2] > b[0]
      && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
}

// Circle-AABB test: does a rect [x,y,w,h] overlap a circle at (cx,cy) radius cr?
function rectOverlapsCircle(
  a: [number, number, number, number],
  cx: number, cy: number, cr: number,
): boolean {
  const nearX = Math.max(a[0], Math.min(cx, a[0] + a[2]));
  const nearY = Math.max(a[1], Math.min(cy, a[1] + a[3]));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < cr * cr;
}

// The single set of ids to spread + frame together right now, and a stable
// primitive key identifying that selection (for effect deps / pending-retry
// comparisons — arrays are a fresh reference every render, strings compare
// by value). Single-node focus (id + its direct neighbors) takes priority;
// otherwise a highlighted genre/scene set. The two are mutually exclusive by
// construction in GraphView (selectedId and highlightSetIds are never both set).
function getActiveCluster(
  selectedId: string | null,
  highlightSetIds: string[] | null,
  edges: Edge[],
): { ids: string[]; key: string } {
  if (selectedId) {
    return { ids: [selectedId, ...getNeighbors(selectedId, edges)], key: `artist:${selectedId}` };
  }
  if (highlightSetIds && highlightSetIds.length > 0) {
    return { ids: highlightSetIds, key: `set:${highlightSetIds.join(',')}` };
  }
  return { ids: [], key: '' };
}

// ── Lazy image cache ─────────────────────────────────────────────────────────
// Persists across component remounts; canvas reads it on every frame.
// Values: 'loading' | HTMLImageElement (ready) | null (failed/no image)
const imgCache = new Map<string, HTMLImageElement | 'loading' | null>();

// Photo rendering constants
const RING_WIDTH   = 2.5;   // colored ring that wraps the photo
const PHOTO_MIN_R  = 9;     // min canvas radius for a recognizable face
const PHOTO_MAX_R  = 22;    // cap so large hubs don't overwhelm layout

// ── Click-focus readability floor ────────────────────────────────────────────
// Additive on top of the existing focus/neighbor size-up below (baseR * 2.8 /
// * 1.9, minPhotoR/maxPhotoR) — that scale-up is in WORLD units, so when a
// clicked node's neighbors are spread far apart, the camera (unchanged, see
// applyCameraFocusForCluster) has to zoom out to fit them all, which shrinks
// their ON-SCREEN size right back down regardless of the world-space boost.
// These floors guarantee a minimum on-screen size no matter how far out the
// camera sits, the same way the existing `8 / globalScale` label formula
// below already compensates for zoom — just with headroom high enough to
// matter at the zoom levels a widely-spread cluster forces.
// Scoped to true click-focus only (selectedId's focused node + its direct
// neighbors) — hover, path-finding, and genre/scene highlighting keep their
// existing sizing untouched.
const FOCUS_MIN_SCREEN_R = 28;           // px — focused node's circle/photo floor
const NEIGHBOR_MIN_SCREEN_R = 20;        // px — neighbor nodes' circle/photo floor
const FOCUS_LABEL_MIN_SCREEN_PX = 13;    // px — focused node's label floor
const NEIGHBOR_LABEL_MIN_SCREEN_PX = 11; // px — neighbor labels' floor

// Edge tint (by source-node layer, or by realm/lineage for sandbox datasets)
// now resolved via resolveEdgeTint (@/lib/colors) — moved there so the
// realm/lineage resolvers can reference the same map. All influence edges
// render uniformly regardless of verified/ai-suggested status — see
// Edge['status'] in data/types.ts, still recorded in the data but no longer
// distinguished visually.

// Always-on label threshold: nodes with influenceScore >= this get permanent labels.
// Scores: VU=20, MBV=9, CT=8, Television=5, SY=5, JAMC=4, Slowdive=4, Bowie=4…
// Threshold of 5 → exactly the top 5 hubs, no others.
const ALWAYS_LABEL_THRESHOLD = 5;

// ── Collision force ──────────────────────────────────────────────────────────
// True resting (non-focused/non-hovered) outer radius of a node — base circle
// per drawNode's baseR/PHOTO_MIN_R/PHOTO_MAX_R clamp, PLUS RING_WIDTH for any
// node that shows a photo at rest (score >= ALWAYS_LABEL_THRESHOLD): drawNode
// draws a hairline ring right at the photo edge, but paintNodePointerArea
// below already treats `er + RING_WIDTH` as that node's real circular
// footprint (its own comment: "the entire node — photo, ring, glow"). The
// previous version of this force used bare `er`, undercounting hub/photo
// nodes' true footprint by RING_WIDTH on each side.
function restingNodeRadius(score: number): number {
  const baseR = 3.5 + Math.sqrt(score) * 2.2;
  const hasPhoto = score >= ALWAYS_LABEL_THRESHOLD;
  const clamped = hasPhoto ? Math.min(Math.max(baseR, PHOTO_MIN_R), PHOTO_MAX_R) : baseR;
  return hasPhoto ? clamped + RING_WIDTH : clamped;
}

// Padding on top of the touching-radius so nodes get a clearly visible gap,
// not just a non-touching one.
const COLLIDE_PADDING = 3;

type CollideNode = { x?: number; y?: number; vx?: number; vy?: number; influenceScore?: number };

// Minimal hand-rolled d3-force-compatible collision force (function + optional
// .initialize(nodes)) — avoids importing d3-force-3d, which ships no type
// declarations. O(n²) per tick is trivial at this graph's node count.
//
// Deliberately does NOT scale the correction by the simulation's `alpha`
// (unlike the charge/link forces above). d3-force's real forceCollide never
// scales by alpha either — collision is a positional constraint, not a
// physical force, and its whole job is to keep fully resolving overlaps even
// late in the simulation when alpha has decayed near zero. The previous
// version of this force multiplied the correction by `alpha`, so once the
// simulation cooled down the push became too weak to finish separating the
// biggest (hub/photo) node pairs — exactly the nodes that need the most
// total displacement to stop overlapping — leaving them visibly overlapping
// once the simulation settled and ticking stopped.
function createCollideForce(padding: number) {
  let nodes: CollideNode[] = [];
  function force() {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (a.x === undefined || a.y === undefined) continue;
      const ra = restingNodeRadius(a.influenceScore ?? 0) + padding;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        if (b.x === undefined || b.y === undefined) continue;
        const rb = restingNodeRadius(b.influenceScore ?? 0) + padding;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ra + rb;
        if (dist >= minDist) continue;
        if (dist === 0) {
          dx = (Math.random() - 0.5) * 0.01;
          dy = (Math.random() - 0.5) * 0.01;
          dist = Math.sqrt(dx * dx + dy * dy);
        }
        const push = ((minDist - dist) / dist) * 0.5;
        const ox = dx * push;
        const oy = dy * push;
        a.vx = (a.vx ?? 0) - ox;
        a.vy = (a.vy ?? 0) - oy;
        b.vx = (b.vx ?? 0) + ox;
        b.vy = (b.vy ?? 0) + oy;
      }
    }
  }
  force.initialize = (ns: CollideNode[]) => { nodes = ns; };
  return force;
}

// ── Off-screen pre-settle ─────────────────────────────────────────────────────
// Runs the exact charge/link/center/collide configuration the live force-config
// effect below registers — charge -40, link distance 75/strength 0.25, center
// 0.04, our collide force at COLLIDE_PADDING — on a throwaway d3-force
// simulation, entirely in memory, before ForceGraph2D ever mounts. Mutates
// `nodes`/`links` in place (x/y/vx/vy, and link.source/target from raw id
// strings into node object references — the same resolution d3-force's own
// forceLink does, and safe for the live simulation to redo: it no-ops on a
// link whose source/target is already an object, see d3-force-3d's link.js).
//
// This is what actually kills the multi-second visible settle: nodes used to
// arrive at a spiral/scattered start and animate into place over ~300
// real-time animation frames (one tick per rendered frame). Ticking that
// same 300-tick budget synchronously, with nothing on screen to paint yet,
// takes well under a second — the graph simply appears already-settled on
// its first frame.
//
// d3-force-3d ships no type declarations (see types/d3-force-3d.d.ts) —
// the same reason createCollideForce above is hand-rolled rather than using
// the library's own forceCollide.
const PRESETTLE_TICKS = 300;

// ── Realm separation (tunable — rough first pass, not final tuning) ─────────
// Pulls realm-tagged nodes toward one of three "home" positions so
// core/region-one/electronic read as three loosely separated clusters
// instead of one hairball. A node with no `realm` at all — every real
// region-one Artist on the plain graph, and any node a caller doesn't
// explicitly tag — gets exactly 0 strength from BOTH the x- and y-force
// below (see realmPullStrengthX/Y), so it contributes nothing for them: only
// the existing charge/link/center/collide forces above apply, unchanged
// from before this force existed.
//
// TUNING KNOBS — every value governing where the three clusters sit and how
// hard they're pulled lives here, together, so they stay easy to dial.
const REALM_HOME_X_CORE = 0;          // core realm home x — canvas center
const REALM_HOME_X_REGION_ONE = -200; // region-one realm home x — left of center — brought in from -260 to reduce empty space to the core
const REALM_HOME_X_ELECTRONIC = 200;  // electronic realm home x — right of center — brought in from 260 to reduce empty space to the core
const REALM_HOME_Y_CORE = 0;          // core realm home y — canvas center
const REALM_HOME_Y_REGION_ONE = 0;    // region-one realm home y — same centerline as electronic below (both at Y=0), so this is a centering pull, not a separating one: it compacts vertical spread without tilting, since both realms share one target
const REALM_HOME_Y_ELECTRONIC = 0;    // electronic realm home y — see region-one comment above
const CORE_PULL_STRENGTH = 1.2;       // core-only horizontal pull toward center — raised from 0.65: core must be the most strongly-positioned thing in the graph so it wins against its own heavy edges into region-one, rather than getting dragged into that mass
const CORE_PULL_STRENGTH_Y = 1.2;     // core-only vertical pull toward center — same strength as CORE_PULL_STRENGTH, applied on the Y axis too, so core nodes clump to a single (center, center) point rather than just lining up on a vertical axis
const REALM_PULL_STRENGTH = 0.6;      // region-one + electronic horizontal pull toward their home x — raised from 0.4 for a tighter hug to each realm's home point
const REALM_PULL_STRENGTH_Y = 0.3;    // region-one + electronic vertical pull toward the shared centerline (REALM_HOME_Y_REGION_ONE/ELECTRONIC = 0 above) — turned back on (was 0) to compact vertical spread; safe from the earlier tilt because both realms now share the same Y target instead of opposing ones. Core's own Y pull is separate — see CORE_PULL_STRENGTH_Y above — and is unaffected by this value.
const REALM_CHARGE = -22;             // charge (repulsion) for any realm-tagged node — weaker than the graph's normal -40 so each realm's bloom can pull tighter without its own internal repulsion fighting that pull. Realm-less nodes (every real region-one Artist on the plain graph) keep exactly -40 — see chargeStrength below.

// Core glow — realm === 'core' nodes only (drawNode below). Both multipliers
// are applied as `<original value> * (isCore ? MULT : 1)`, so for every
// non-core node (every region-one node, and every non-core island-two node)
// the multiplier is exactly 1 and the drawn glow is bit-for-bit identical to
// before this addition — nothing about their color, radius, or intensity
// changes. The glow COLOR itself is untouched (still resolveNodeGlow's
// existing gold, LAYER_GLOW.root's #E8C87A family) — only its size/brightness
// scale up for core.
const CORE_GLOW_RADIUS_MULT = 1.4;    // scales both the bloom haze radius and the shadowBlur size for core nodes — toned down from 2.0, smaller halo
const CORE_GLOW_INTENSITY = 1.4;      // scales the bloom haze's inner/mid alpha stops for core nodes (clamped to 1 so it can't exceed fully opaque) — toned down from 1.8, a notch less bright/saturated

// Link strength: within-realm edges keep the graph's original strength;
// cross-realm ("bridge") edges are weakened so each realm can clump into
// its own bloom while bridges stretch thin across the gaps between them.
// core↔region-one bridges are weakened even further than a general bridge
// (LINK_STRENGTH_CORE_BRIDGE) — core nodes (Kraftwerk, Eno, VU) carry heavy
// edges into the dense region-one cluster that were dragging the core
// off-center even against a strong central pull; this is the actual fix for
// that drag, not just a stronger pull fighting it. Any edge touching a
// realm-less node — every edge in region-one's plain graph, where neither
// endpoint is ever tagged — falls through to LINK_STRENGTH_WITHIN, i.e.
// exactly the original 0.25, unchanged.
const LINK_STRENGTH_WITHIN = 0.25;                      // unchanged from the original single global value
const LINK_STRENGTH_BRIDGE = LINK_STRENGTH_WITHIN / 3;      // general cross-realm weakening — roughly one-third of within
const LINK_STRENGTH_CORE_BRIDGE = LINK_STRENGTH_BRIDGE / 4; // core↔region-one specifically — even weaker than the general bridge

function edgeRealms(
  link: { source: { realm?: string } | string; target: { realm?: string } | string },
): [string | undefined, string | undefined] {
  const srcRealm = typeof link.source === 'object' ? link.source.realm : undefined;
  const tgtRealm = typeof link.target === 'object' ? link.target.realm : undefined;
  return [srcRealm, tgtRealm];
}

function linkStrength(link: { source: { realm?: string } | string; target: { realm?: string } | string }): number {
  const [srcRealm, tgtRealm] = edgeRealms(link);
  if (!srcRealm || !tgtRealm) return LINK_STRENGTH_WITHIN; // realm-less endpoint(s) — keeps today's strength
  if (srcRealm === tgtRealm) return LINK_STRENGTH_WITHIN;  // within-realm — full strength
  if ((srcRealm === 'core' && tgtRealm === 'region-one') || (srcRealm === 'region-one' && tgtRealm === 'core')) {
    return LINK_STRENGTH_CORE_BRIDGE;
  }
  return LINK_STRENGTH_BRIDGE; // any other cross-realm pair (electronic↔region-one, electronic↔core)
}

function realmHomeX(node: { realm?: string }): number {
  if (node.realm === 'core') return REALM_HOME_X_CORE;
  if (node.realm === 'region-one') return REALM_HOME_X_REGION_ONE;
  if (node.realm === 'electronic') return REALM_HOME_X_ELECTRONIC;
  return 0; // unused — realmPullStrengthX returns 0 for this case, so this never moves the node
}

function realmPullStrengthX(node: { realm?: string }): number {
  if (node.realm === 'core') return CORE_PULL_STRENGTH;
  if (node.realm === 'region-one' || node.realm === 'electronic') return REALM_PULL_STRENGTH;
  return 0;
}

function realmHomeY(node: { realm?: string }): number {
  if (node.realm === 'core') return REALM_HOME_Y_CORE;
  if (node.realm === 'region-one') return REALM_HOME_Y_REGION_ONE;
  if (node.realm === 'electronic') return REALM_HOME_Y_ELECTRONIC;
  return 0; // unused — realmPullStrengthY returns 0 for this case, so this never moves the node
}

function realmPullStrengthY(node: { realm?: string }): number {
  if (node.realm === 'core') return CORE_PULL_STRENGTH_Y;
  if (node.realm === 'region-one' || node.realm === 'electronic') return REALM_PULL_STRENGTH_Y;
  return 0;
}

function chargeStrength(node: { realm?: string }): number {
  return node.realm === 'core' || node.realm === 'region-one' || node.realm === 'electronic'
    ? REALM_CHARGE
    : -40; // unchanged default for every realm-less node — the plain region-one graph never sees anything but this
}

function presettleLayout(nodes: GraphNode[], links: GraphLink[]): void {
  const sim = forceSimulation(nodes, 2);
  sim.stop(); // d3-force schedules its own auto-tick timer on creation — must
              // stop it before it ever fires; we drive ticking manually below.
  sim.force('link', forceLink<GraphNode, GraphLink>(links).id(n => n.id).distance(75).strength(linkStrength));
  sim.force('charge', forceManyBody<GraphNode>().strength(chargeStrength));
  sim.force('center', forceCenter().strength(0.04));
  sim.force('collide', createCollideForce(COLLIDE_PADDING));
  sim.force('realmX', forceX<GraphNode>(realmHomeX).strength(realmPullStrengthX));
  sim.force('realmY', forceY<GraphNode>(realmHomeY).strength(realmPullStrengthY));
  sim.velocityDecay(0.38);
  for (let i = 0; i < PRESETTLE_TICKS; i++) sim.tick();
}

// ── Dense-core zoom filter ───────────────────────────────────────────────────
// At low charge, a handful of sparsely-linked artists settle noticeably
// farther from the cluster centroid than everyone else — nothing (weak
// charge, few/no links) pulls them back in. Letting zoomToFit's bounding box
// include those stragglers forces the whole camera to zoom out just to keep
// them on screen, leaving the actual cluster small with big empty margins.
// Fitting to the nearest DENSE_CORE_PERCENTILE of nodes by distance from the
// centroid excludes just the outliers — they're still rendered and reachable
// via search/click, just excluded from the framing math.
const DENSE_CORE_PERCENTILE = 0.9;

function computeDenseCoreIds(nodes: { id: string; x?: number; y?: number }[]): Set<string> | null {
  const positioned = nodes.filter(n => n.x !== undefined && n.y !== undefined);
  if (positioned.length === 0) return null;
  const cx = positioned.reduce((sum, n) => sum + n.x!, 0) / positioned.length;
  const cy = positioned.reduce((sum, n) => sum + n.y!, 0) / positioned.length;
  const byDist = positioned
    .map(n => ({ id: n.id, dist: Math.hypot(n.x! - cx, n.y! - cy) }))
    .sort((a, b) => a.dist - b.dist);
  const cutoff = byDist[Math.floor(byDist.length * DENSE_CORE_PERCENTILE)]?.dist ?? Infinity;
  return new Set(byDist.filter(n => n.dist <= cutoff).map(n => n.id));
}

// Screen-pixel margin around the fitted bounding box for zoomToFit calls —
// reduced from the library-typical 60 so the dense core fills more of the
// viewport instead of floating in a wide empty margin.
const ZOOM_FIT_PADDING = 40;

// Dim target alpha when a highlight (hover/focus/path) is active.
const DIM_ALPHA = 0.09;
const TRANSITION_MS = 220;

// Idle edge appearance — edges recede into a soft faint web by default so a
// dense graph doesn't read as a scribble of crossing lines. Only the edges
// touching a focused/hovered node rise above this baseline.
const EDGE_IDLE_ALPHA = 0.12;
const EDGE_IDLE_WIDTH = 0.6;
// Fast, subtle fade for edges lighting up/down on focus or hover — separate
// from TRANSITION_MS (node dimming) so edges pop quicker without touching
// that existing timing.
const EDGE_GLOW_MS = 150;

// Camera focus on node click — must match CSS --panel-width (380px).
// When a node is selected the panel slides in from the right, so the
// "visible" canvas area is (containerWidth - PANEL_WIDTH).  We offset
// the camera centre to keep the focused cluster in that left region.
const PANEL_WIDTH = 380;
// Left-side UI: layer-filter toggle button is ~130px wide at left: 20px.
// The expandable panel (200px) only appears on demand, so 160px is accurate
// for normal graph interaction and reclaims 60px of usable horizontal space.
const LEFT_UI_WIDTH = 160;
const MAX_ZOOM = 3.5;       // raised so small clusters can zoom in tighter
const CAMERA_PADDING = 60;  // tighter frame → cluster fills more of the clear area
const CAMERA_MS = 600;     // transition duration (ms)
const SPREAD_FACTOR = 2.6; // spotlight-spread outward scale from cluster centroid

interface Props {
  graphData: GraphData;
  activeLayers: Set<Layer>;
  highlightPath: string[] | null;
  selectedId: string | null;
  // A genre's or scene's member artist ids — highlighted as a cluster
  // (spread + framed together, dimmed background) rather than a single
  // node + its neighbors. Mutually exclusive with selectedId (enforced by
  // the caller): when selectedId is set, this is ignored.
  highlightSetIds: string[] | null;
  onNodeClick: (artistId: string) => void;
  onBackgroundClick: () => void;
}

interface GraphNode extends Artist {
  x?: number;
  y?: number;
  // realm/lineage are inherited from Artist itself (data/types.ts) — a node
  // without either (realm undefined) takes resolveNodeColor/resolveNodeGlow/
  // resolveEdgeTint's fallback branch, identical to the pre-existing
  // LAYER_COLORS[layer]/LAYER_GLOW[layer]/EDGE_TINT[layer] lookups.
}

interface GraphLink {
  source: GraphNode | string;
  target: GraphNode | string;
  type: Edge['type'];
  status: Edge['status'];
  confidence: number;
  citation?: string | null;
}

// Label candidate — queued during drawNode (node position + style),
// placed and drawn in onRenderFramePost once ALL node circles are registered.
interface LabelCandidate {
  name: string;
  nx: number;          // node center x
  ny: number;          // node center y
  er: number;          // visual radius (photo or dot)
  fontSize: number;
  bright: boolean;
  alpha: number;
  radialFromX?: number; // focus node x — set for neighbors to push label radially
  radialFromY?: number;
}

export default function ForceGraphCanvas({
  graphData,
  activeLayers,
  highlightPath,
  selectedId,
  highlightSetIds,
  onNodeClick,
  onBackgroundClick,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Null until ResizeObserver fires — ForceGraph2D is not rendered before then,
  // which prevents the hardcoded-default → real-size bounce that resets d3-zoom
  // and jams nodes at the canvas origin on every navigation-back.
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Starts at 0 so the library's own automatic post-mount cooldown — which
  // starts ticking as an unconditional side effect of the graphData prop
  // being applied, before any of our effects get a chance to run — does zero
  // ticks on load: nodes are already final (presettleLayout, see stableData
  // below), so there's nothing to settle.
  //
  // Only raised to a real budget from handleEngineStop, once that first
  // (zero-tick) cooldown has already fully resolved — see that callback's
  // comment for why this has to be event-gated rather than timed. Changing
  // this prop has no onChange handler in the library, so raising it while
  // the engine is already stopped is inert; it only matters for a FUTURE
  // resetCountdown() call (e.g. a node drag), which then gets a real tick
  // budget to animate with.
  const [postMountCooldownTicks, setPostMountCooldownTicks] = useState(0);

  // ── Animated dim level ──────────────────────────────────────────────────────
  // Stored in a ref so the canvas rAF loop picks it up without React re-renders.
  const dimLevelRef = useRef(1.0); // 1.0 = full brightness; DIM_ALPHA = dimmed
  // 0 = idle (all edges faint); 1 = a focused/hovered node's edges fully lit.
  const edgeGlowLevelRef = useRef(0);
  const animFrameRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);
  // Tracks whether a cluster (single-node or set) was active last run, so we
  // don't trigger zoomToFit on initial mount but do on a genuine deselect.
  const prevClusterActiveRef = useRef(false);
  // Guards the one-time initial fit so window resizes don't re-trigger it
  const didInitialFitRef = useRef(false);
  // The initial fit must wait for BOTH: dimensions have settled (ResizeObserver
  // debounce — see below) AND onEngineStop has fired at least once. Node
  // positions are already final by then either way (presettleLayout — see
  // stableData below), but onEngineStop still only fires once the library's
  // own post-mount cooldown completes, which needs cooldownTicks to have
  // been raised past 0 first (see postMountCooldownTicks) — in practice this
  // resolves within the first couple of animation frames, not the ~7s it
  // used to. Either condition can finish first; whichever is last calls
  // tryInitialFit(), which only proceeds once both are true.
  const dimensionsSettledRef = useRef(false);
  const engineStoppedOnceRef = useRef(false);
  // Per-frame label state — both refs reset together at each new frame.
  const labelQueueRef  = useRef<LabelCandidate[]>([]);
  const nodeCirclesRef = useRef<Array<{ x: number; y: number; r: number }>>([]);
  const labelFrameRef  = useRef(0); // performance.now() snapshot of last reset
  // Saves original cluster positions so they can be restored on deselect.
  const savedPositionsRef = useRef<Map<string, { x: number; y: number }> | null>(null);
  // Set (to the active cluster's key) when spread/camera-focus can't run yet
  // because the force simulation hasn't positioned the cluster's nodes (fresh
  // mount + URL-preselected artist/genre/scene, e.g. "View in graph"/genre
  // and scene pages). onEngineStop retries once the simulation settles, so
  // the result matches a click/selection made on an already-settled graph.
  const pendingClusterKeyRef = useRef<string | null>(null);
  // Bumped whenever the active cluster/dimensions change so an in-flight
  // compose-into-focus animation (see animateClusterIntoView) can detect
  // it's been superseded and stop touching node positions.
  const focusAnimTokenRef = useRef(0);
  // Guards the one-time force-config registration (see that effect below) so
  // it runs exactly once — even though the effect's dependency on `dimensions`
  // means it re-fires on every resize once graphRef.current is available.
  const forceConfigDoneRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ── Stable graph data (created once — prevents simulation restart) ──────────
  // Declared here (before tryInitialFit below) rather than further down: it
  // only depends on the graphData prop, and tryInitialFit's dense-core zoom
  // filter needs to read stableData.nodes — referencing a const declared
  // later in the same component is a hard error for the React Compiler, even
  // though the closure itself wouldn't run until after full render.
  //
  // presettleLayout runs synchronously here, during render (inside useMemo,
  // not an effect) — before ForceGraph2D ever mounts, so there is no
  // "scattered start" frame for it to ever paint. See that function's own
  // comment for why this is what actually eliminates the visible settle.
  //
  // Runs twice per mount in dev (React Strict Mode double-invokes useMemo
  // factories as a purity check) — harmless as presettleLayout is a pure,
  // deterministic function of its inputs, and each run is well under 100ms.
  // A ref-based guard to skip the second call was tried and reverted: this
  // project's React Compiler lint config (react-hooks/refs) hard-rejects
  // reading/writing a ref during render, which that guard requires.
  const stableData = useMemo(
    () => {
      const nodes = graphData.artists.map(a => ({ ...a })) as GraphNode[];
      const links = graphData.edges.map(e => ({ ...e })) as GraphLink[];
      presettleLayout(nodes, links);
      return { nodes, links };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Initial fit — runs once BOTH dimensions and onEngineStop have fired ──────
  // dimensions comes from a ResizeObserver, whose first callback(s) during a
  // busy initial mount (extra components/effects competing for the main
  // thread — e.g. onboarding doing a localStorage read + a couple of its own
  // state-driven re-renders on a true first visit) can report a transient,
  // too-small box before layout has fully settled. zoomToFit computes a
  // camera transform for whatever size is current *at that instant* — if we
  // lock it in immediately on the first reading and a later callback reports
  // the real (larger) size, the canvas resizes but the transform doesn't,
  // leaving the graph looking "crammed in a corner." Debouncing until
  // dimensions stops changing for a short window avoids fitting to a
  // not-yet-final size, without needing to know exactly why the timing
  // shifted.
  //
  // Skip zoomToFit when an artist/genre/scene is already pre-selected (from
  // URL); the camera focus effect handles framing in that case — including
  // the fresh-mount case where node positions aren't ready yet, via the
  // pendingClusterKeyRef/onEngineStop retry below, so framing is guaranteed
  // to happen either way.
  const hasPreselectedCluster = !!selectedId || !!(highlightSetIds && highlightSetIds.length > 0);
  const tryInitialFit = useCallback(() => {
    if (didInitialFitRef.current) return;
    if (!dimensionsSettledRef.current || !engineStoppedOnceRef.current) return;
    if (hasPreselectedCluster) {
      // Pre-selected from URL — camera focus effect handles framing.
      didInitialFitRef.current = true;
      return;
    }
    didInitialFitRef.current = true;
    const dur = prefersReducedMotionRef.current ? 0 : 600;
    const coreIds = computeDenseCoreIds(stableData.nodes);
    graphRef.current?.zoomToFit(
      dur,
      ZOOM_FIT_PADDING,
      coreIds ? (n: object) => coreIds.has((n as GraphNode).id) : undefined,
    );
    // stableData is a stable reference (see its own useMemo below) — reading
    // it here doesn't need to be a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPreselectedCluster]);

  useEffect(() => {
    if (!dimensions || dimensionsSettledRef.current) return;
    const settleTimer = setTimeout(() => {
      dimensionsSettledRef.current = true;
      tryInitialFit();
    }, 150);
    return () => clearTimeout(settleTimer);
  }, [dimensions, tryInitialFit]);

  useEffect(() => {
    const isActive =
      selectedId !== null ||
      hoveredId !== null ||
      (highlightSetIds !== null && highlightSetIds.length > 0) ||
      (highlightPath !== null && highlightPath.length > 0);
    const target = isActive ? DIM_ALPHA : 1.0;
    const glowTarget = isActive ? 1 : 0;

    cancelAnimationFrame(animFrameRef.current);

    if (prefersReducedMotionRef.current) {
      dimLevelRef.current = target;
      edgeGlowLevelRef.current = glowTarget;
      return;
    }

    const from = dimLevelRef.current;
    const glowFrom = edgeGlowLevelRef.current;
    if (Math.abs(from - target) < 0.005 && Math.abs(glowFrom - glowTarget) < 0.005) return;

    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / TRANSITION_MS, 1);
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      dimLevelRef.current = from + (target - from) * eased;

      // Edges fade in/out faster than node dimming (EDGE_GLOW_MS < TRANSITION_MS).
      const tGlow = Math.min((now - start) / EDGE_GLOW_MS, 1);
      const easedGlow = tGlow < 0.5 ? 4 * tGlow * tGlow * tGlow : 1 - Math.pow(-2 * tGlow + 2, 3) / 2;
      edgeGlowLevelRef.current = glowFrom + (glowTarget - glowFrom) * easedGlow;

      if (t < 1) animFrameRef.current = requestAnimationFrame(tick);
    }
    animFrameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [selectedId, hoveredId, highlightSetIds, highlightPath]);

  // ── Container sizing ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Force config (hairball guard) ───────────────────────────────────────────
  // Node positions are already fully settled by presettleLayout (see
  // stableData above) by the time ForceGraph2D ever mounts, so this effect no
  // longer needs to reheat the simulation to get a real settle out of it —
  // it only needs to register the same charge/link/center/collide values on
  // the LIVE simulation instance, so that anything which ticks it later
  // (e.g. the library's own post-drag readjustment) uses the right physics
  // instead of the library's bare defaults (charge -30, default link, center
  // strength 1).
  //
  // Depends on `dimensions`: <ForceGraph2D> itself is only rendered once
  // dimensions is non-null (see the JSX below), so graphRef.current is
  // guaranteed null on the very first commit — an effect with `[]` deps would
  // run exactly then and permanently miss attaching these forces at all.
  // Depending on `dimensions` makes this effect re-fire once the ref actually
  // attaches; forceConfigDoneRef then ensures the config only happens once,
  // since `dimensions` also changes on every window resize.
  //
  // Does NOT touch cooldownTicks — that used to be raised to 300 right here,
  // which measurably lost the race against the library's own first post-mount
  // tick: this effect (167ms after mount, per real browser measurement)
  // consistently finished and raised cooldownTicks before the engine's first
  // tick check ever ran (176ms), so the "start at 0" guard never actually
  // engaged — the full 300-tick, ~5s cooldown ran every time regardless of
  // presettleLayout already having solved the layout. Fixed by moving the
  // raise to handleEngineStop instead (event-gated on the first natural
  // cooldown actually finishing, not timed against it) — see that callback.
  useEffect(() => {
    if (forceConfigDoneRef.current) return;
    const fg = graphRef.current;
    if (!fg) return;
    forceConfigDoneRef.current = true;
    fg.d3Force('charge')?.strength(chargeStrength);
    fg.d3Force('link')?.distance(75).strength(linkStrength);
    fg.d3Force('center')?.strength(0.04);
    // Collision only — stops the handful of nodes that physically overlap
    // without touching charge/link/center above, so overall spread/shape holds.
    fg.d3Force('collide', createCollideForce(COLLIDE_PADDING));
    // Realm separation — see the constants/comment above presettleLayout.
    // Registered as brand-new named forces (same pattern as 'collide' just
    // above), not a getter/setter on a library default — these forces don't
    // exist until we add them. Zero effect on any node without a realm.
    fg.d3Force('realmX', forceX<GraphNode>(realmHomeX).strength(realmPullStrengthX));
    fg.d3Force('realmY', forceY<GraphNode>(realmHomeY).strength(realmPullStrengthY));
    fg.d3VelocityDecay?.(0.38);
    // Reduced motion: converge in a couple dozen ticks instead of ~300 for
    // any future tick cycle (e.g. post-drag readjustment) that does run.
    if (prefersReducedMotionRef.current) fg.d3AlphaDecay?.(0.1);
  }, [dimensions]);

  // The single set of ids to spread + frame right now — see getActiveCluster.
  const { ids: activeClusterIds, key: activeClusterKey } = useMemo(
    () => getActiveCluster(selectedId, highlightSetIds, graphData.edges),
    [selectedId, highlightSetIds, graphData.edges],
  );

  // ── Spotlight spread ─────────────────────────────────────────────────────────
  // Pure: computes where spotlight-spread WOULD place each cluster node,
  // without mutating anything. null means the simulation hasn't positioned
  // the cluster's primary node (clusterIds[0]) yet; an empty map means
  // there's nothing to spread (0 or 1 node).
  const computeSpreadTargetsForCluster = useCallback((clusterIds: string[]): Map<string, { x: number; y: number }> | null => {
    if (clusterIds.length === 0) return new Map();

    const primary = stableData.nodes.find(n => n.id === clusterIds[0]);
    if (primary?.x === undefined || primary?.y === undefined) return null;

    const idSet = new Set(clusterIds);
    const clusterNodes = stableData.nodes.filter(
      n => idSet.has(n.id) && n.x !== undefined && n.y !== undefined,
    );
    if (clusterNodes.length < 2) return new Map();

    const cx = clusterNodes.reduce((s, n) => s + n.x!, 0) / clusterNodes.length;
    const cy = clusterNodes.reduce((s, n) => s + n.y!, 0) / clusterNodes.length;

    const targets = new Map<string, { x: number; y: number }>();
    for (const n of clusterNodes) {
      const dx = n.x! - cx;
      const dy = n.y! - cy;
      targets.set(n.id, { x: cx + dx * SPREAD_FACTOR, y: cy + dy * SPREAD_FACTOR });
    }
    return targets;
  }, [stableData.nodes]);

  // Moves the cluster's nodes outward so the camera frames the already-spread
  // positions. Restores originals on deselect (or when switching clusters).
  // Returns true once handled (spread applied, deselected, or nothing to
  // spread); false when the simulation hasn't positioned the cluster yet —
  // the caller then leaves a pending marker so onEngineStop can retry.
  const applySpreadForCluster = useCallback((clusterIds: string[]): boolean => {
    // Always restore first — handles both deselect and cluster-to-cluster switches.
    if (savedPositionsRef.current) {
      for (const [savedId, pos] of savedPositionsRef.current) {
        const node = stableData.nodes.find(n => n.id === savedId);
        if (node) {
          node.x = pos.x;
          node.y = pos.y;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).vx = 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).vy = 0;
        }
      }
      savedPositionsRef.current = null;
    }

    const targets = computeSpreadTargetsForCluster(clusterIds);
    if (targets === null) return false;
    if (targets.size === 0) return true;

    // Save originals (current, pre-spread positions — computeSpreadTargetsForCluster
    // is pure, so nothing has moved yet).
    const saved = new Map<string, { x: number; y: number }>();
    for (const nodeId of targets.keys()) {
      const n = stableData.nodes.find(nn => nn.id === nodeId);
      if (n?.x !== undefined && n?.y !== undefined) saved.set(nodeId, { x: n.x, y: n.y });
    }
    savedPositionsRef.current = saved;

    // Scale each node outward from the centroid so nodes fill the frame
    // with comfortable gaps. Simulation is paused after initial cooldown,
    // so these positions hold until we restore them on deselect.
    for (const [nodeId, pos] of targets) {
      const n = stableData.nodes.find(nn => nn.id === nodeId);
      if (n) {
        n.x = pos.x;
        n.y = pos.y;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n as any).vx = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n as any).vy = 0;
      }
    }
    return true;
  }, [stableData.nodes, computeSpreadTargetsForCluster]);

  useEffect(() => {
    // Any new cluster/resize invalidates an in-flight compose-into-focus
    // animation from a previous cluster (see animateClusterIntoView).
    focusAnimTokenRef.current++;
    const ready = applySpreadForCluster(activeClusterIds);
    pendingClusterKeyRef.current = ready ? null : activeClusterKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterKey, dimensions, applySpreadForCluster]);

  // ── Camera focus on node click / genre / scene selection ────────────────────
  // Frame the cluster (a single node + its direct neighbors, or a whole
  // genre/scene set) in the left portion of the canvas (accounting for the
  // info panel on the right).
  //
  // d3-zoom runs ONE transition per selection at a time — calling zoom() and
  // centerAt() both with a duration cancels whichever started first and only
  // runs the second.  Fix: set zoom instantly (ms=0, no transition created),
  // then animate only the pan via centerAt.
  //
  // Pure: same bbox/zoom/pan math either way, computed from an arbitrary
  // position map (e.g. not-yet-applied spread targets) instead of each
  // node's current x/y where provided — so the camera can frame where the
  // cluster is about to end up rather than where it currently sits.
  const computeCameraTargetForCluster = useCallback(
    (clusterIds: string[], overrides: Map<string, { x: number; y: number }>): { targetZoom: number; camX: number; centerGY: number } | null => {
      const positions: { x: number; y: number }[] = [];
      for (const nid of clusterIds) {
        const override = overrides.get(nid);
        if (override) { positions.push(override); continue; }
        const n = stableData.nodes.find(nn => nn.id === nid);
        if (n?.x !== undefined && n?.y !== undefined) positions.push({ x: n.x, y: n.y });
      }
      if (positions.length === 0) return null;

      const xs = positions.map(p => p.x);
      const ys = positions.map(p => p.y);
      const minX = Math.min(...xs) - CAMERA_PADDING;
      const maxX = Math.max(...xs) + CAMERA_PADDING;
      const minY = Math.min(...ys) - CAMERA_PADDING;
      const maxY = Math.max(...ys) + CAMERA_PADDING;

      const bbW = maxX - minX;
      const bbH = maxY - minY;
      if (bbW < 1 || bbH < 1) return null;

      const canvasW = containerRef.current?.offsetWidth  ?? 800;
      const canvasH = containerRef.current?.offsetHeight ?? 600;
      const availW = Math.max(canvasW - PANEL_WIDTH - LEFT_UI_WIDTH, 200);
      const availH = Math.max(canvasH, 200);

      const targetZoom = Math.max(Math.min(availW / bbW, availH / bbH, MAX_ZOOM), 0.5);
      const centerGX = (minX + maxX) / 2;
      const centerGY = (minY + maxY) / 2;
      const camX = centerGX + (PANEL_WIDTH - LEFT_UI_WIDTH) / (2 * targetZoom);

      return { targetZoom, camX, centerGY };
    },
    [stableData.nodes],
  );

  // Returns true once handled; false when the cluster's primary node hasn't
  // been placed by the simulation yet — the caller then leaves a pending
  // marker so onEngineStop can retry once positions exist.
  const applyCameraFocusForCluster = useCallback((clusterIds: string[]): boolean => {
    const fg = graphRef.current;
    if (!fg) return false;

    const wasActive = prevClusterActiveRef.current;
    prevClusterActiveRef.current = clusterIds.length > 0;

    const duration = prefersReducedMotionRef.current ? 0 : CAMERA_MS;

    if (clusterIds.length === 0) {
      // Only zoom out if we actually had a cluster active before — never on mount.
      if (wasActive) {
        const coreIds = computeDenseCoreIds(stableData.nodes);
        fg.zoomToFit(
          duration,
          ZOOM_FIT_PADDING,
          coreIds ? (n: object) => coreIds.has((n as GraphNode).id) : undefined,
        );
      }
      return true;
    }

    // Guard: skip if the cluster's primary node hasn't been placed by the simulation yet.
    const primary = stableData.nodes.find(n => n.id === clusterIds[0]);
    if (primary?.x === undefined || primary?.y === undefined) return false;

    const cameraTarget = computeCameraTargetForCluster(clusterIds, new Map());
    if (!cameraTarget) return true; // degenerate bounding box, nothing more to do

    // Step 1 — instant zoom (no d3-zoom transition → no conflict with step 2).
    fg.zoom(cameraTarget.targetZoom, 0);
    // Step 2 — animated pan to the panel-adjusted centre.
    fg.centerAt(cameraTarget.camX, cameraTarget.centerGY, duration);
    return true;
  }, [stableData.nodes, computeCameraTargetForCluster]);

  useEffect(() => {
    const ready = applyCameraFocusForCluster(activeClusterIds);
    pendingClusterKeyRef.current = ready ? null : activeClusterKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterKey, dimensions, applyCameraFocusForCluster]);

  // ── Compose into focus (deferred catch-up, animated) ────────────────────────
  // Covers the fresh-mount + URL-preselected case (e.g. "View in graph" from
  // an artist/genre/scene page): the cluster is chosen before the force
  // simulation has positioned any node, so applySpreadForCluster/
  // applyCameraFocusForCluster bail and leave a pending marker. By the time
  // the simulation settles, the cluster has already been visible on screen
  // (unspread) for a beat — snapping straight to the spread+framed state
  // would read as a jarring jump cut. Instead, ease node positions out to
  // their spread targets while the camera pans/zooms to the same
  // destination, so it reads as one continuous "composing into focus"
  // motion rather than settle-then-snap.
  const animateClusterIntoView = useCallback((clusterIds: string[]): boolean => {
    const fg = graphRef.current;
    if (!fg) return false;
    if (clusterIds.length === 0) return true; // nothing to animate

    const computedTargets = computeSpreadTargetsForCluster(clusterIds);
    if (computedTargets === null) return false; // simulation still hasn't positioned the cluster
    const targets = computedTargets;

    // Snapshot current (natural, unspread) positions — this is both the tween's
    // start state and exactly what applySpreadForCluster's restore-on-deselect
    // expects to find in savedPositionsRef.
    const starts = new Map<string, { x: number; y: number }>();
    for (const nodeId of targets.keys()) {
      const n = stableData.nodes.find(nn => nn.id === nodeId);
      if (n?.x !== undefined && n?.y !== undefined) starts.set(nodeId, { x: n.x, y: n.y });
    }
    savedPositionsRef.current = starts.size > 0 ? starts : null;

    const cameraTarget = computeCameraTargetForCluster(clusterIds, targets);
    const duration = prefersReducedMotionRef.current ? 0 : CAMERA_MS;

    prevClusterActiveRef.current = true;
    if (cameraTarget) {
      fg.zoom(cameraTarget.targetZoom, 0);
      fg.centerAt(cameraTarget.camX, cameraTarget.centerGY, duration);
    }

    // No cluster to spread, reduced motion, or no active camera transition to
    // ride the redraws on — apply the end state immediately instead of an
    // animation nothing would repaint.
    if (duration === 0 || targets.size === 0 || !cameraTarget) {
      for (const [nodeId, pos] of targets) {
        const n = stableData.nodes.find(nn => nn.id === nodeId);
        if (n) {
          n.x = pos.x;
          n.y = pos.y;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).vx = 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).vy = 0;
        }
      }
      return true;
    }

    // The concurrent centerAt(...) transition above keeps the canvas repainting
    // every frame (d3-zoom's 'zoom' event sets the library's internal needsRedraw
    // flag for the whole transition), so this manual tween renders smoothly
    // without needing its own redraw trigger.
    const myToken = ++focusAnimTokenRef.current;
    const start = performance.now();
    function tick(now: number) {
      if (focusAnimTokenRef.current !== myToken) return; // superseded by a newer cluster
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      for (const [nodeId, target] of targets) {
        const n = stableData.nodes.find(nn => nn.id === nodeId);
        const s = starts.get(nodeId);
        if (n && s) {
          n.x = s.x + (target.x - s.x) * eased;
          n.y = s.y + (target.y - s.y) * eased;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).vx = 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).vy = 0;
        }
      }
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    return true;
  }, [stableData.nodes, computeSpreadTargetsForCluster, computeCameraTargetForCluster]);

  const handleEngineStop = useCallback(() => {
    // Fires once the library's post-mount cooldown completes. With
    // cooldownTicks still at 0 (see that state's own comment), this first
    // call fires after doing zero actual ticks — the check that decides to
    // stop (cntTicks(1) > cooldownTicks(0)) is what calls onEngineStop, so
    // there's no tick in between. That's exactly what we want:
    // presettleLayout already solved the layout, so the first cooldown has
    // nothing to do.
    //
    // Raising cooldownTicks here — after the fact, gated on this event
    // rather than on a timer or another effect — is what actually fixes the
    // race the previous attempt lost: there's no longer any window where
    // cooldownTicks could be temporarily nonzero while the FIRST cooldown is
    // still in flight, because we only ever raise it once that cooldown has
    // already reported itself finished. This isn't a timing assumption —
    // onEngineStop firing IS the event that means the first cooldown ended.
    if (!engineStoppedOnceRef.current) {
      setPostMountCooldownTicks(300);
    }
    engineStoppedOnceRef.current = true;
    tryInitialFit();
    if (pendingClusterKeyRef.current && pendingClusterKeyRef.current === activeClusterKey) {
      if (animateClusterIntoView(activeClusterIds)) pendingClusterKeyRef.current = null;
    }
  }, [activeClusterKey, activeClusterIds, animateClusterIntoView, tryInitialFit]);

  // ── Derived sets ────────────────────────────────────────────────────────────
  const pathSet = useMemo(() => new Set<string>(highlightPath ?? []), [highlightPath]);
  const pathEdges = useMemo(
    () => (highlightPath ? pathEdgeKeys(highlightPath) : new Set<string>()),
    [highlightPath],
  );

  // Neighbors come from selectedId (focus mode) or hoveredId (hover mode).
  const activeHighlightId = selectedId ?? hoveredId;
  const neighborSet = useMemo(
    () => (activeHighlightId ? getNeighbors(activeHighlightId, graphData.edges) : new Set<string>()),
    [activeHighlightId, graphData.edges],
  );

  // Genre/scene set members — only meaningful when selectedId is null (see
  // getActiveCluster's mutual-exclusivity contract), so a non-empty set here
  // always means "set mode" is active.
  const highlightSetMemberSet = useMemo(
    () => new Set<string>(selectedId === null ? (highlightSetIds ?? []) : []),
    [selectedId, highlightSetIds],
  );

  // The focused node object (mutated in-place by d3-force, so .x/.y stay live).
  const focusedNode = useMemo(
    () => (selectedId ? stableData.nodes.find(n => n.id === selectedId) ?? null : null),
    [selectedId, stableData.nodes],
  );

  // ── Visibility ──────────────────────────────────────────────────────────────
  const isNodeVisible = useCallback(
    (node: object) => {
      const n = node as GraphNode;
      if (activeLayers.size === 0) return true;
      return activeLayers.has(n.layer);
    },
    [activeLayers],
  );

  const isLinkVisible = useCallback(
    (link: object) => {
      const l = link as GraphLink;
      if (activeLayers.size === 0) return true;
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      const srcNode = stableData.nodes.find(n => n.id === srcId);
      const tgtNode = stableData.nodes.find(n => n.id === tgtId);
      if (!srcNode || !tgtNode) return false;
      return activeLayers.has(srcNode.layer) && activeLayers.has(tgtNode.layer);
    },
    [activeLayers, stableData.nodes],
  );

  // ── Node drawing ────────────────────────────────────────────────────────────
  const drawNode = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode;
      if (n.x === undefined || n.y === undefined) return;

      const score = n.influenceScore ?? 0;
      const baseR = 3.5 + Math.sqrt(score) * 2.2;

      // ── Three-tier classification ──
      const isFocused   = n.id === selectedId;
      const isNeighbor  = selectedId !== null ? neighborSet.has(n.id) : false;
      const isHovered   = n.id === hoveredId && selectedId === null;
      const isHoverNeighbor = hoveredId !== null && selectedId === null && neighborSet.has(n.id);
      const isInPath    = pathSet.has(n.id);
      // Genre/scene set member — same visual tier as a single-focus neighbor
      // (crisp, not blown-out), just without one node standing out as "the" focus.
      const isSetMember = highlightSetMemberSet.has(n.id);
      const hasHighlight =
        selectedId !== null || hoveredId !== null || pathSet.size > 0 || highlightSetMemberSet.size > 0;

      const isDimmed =
        hasHighlight &&
        !isFocused &&
        !isNeighbor &&
        !isHovered &&
        !isHoverNeighbor &&
        !isInPath &&
        !isSetMember;

      // Animated alpha for dimmed nodes (reads live from ref — smooth without re-renders)
      const alpha = isDimmed ? dimLevelRef.current : 1.0;

      // ── Size ──
      // In focus mode, both the selected node and its neighbors scale up so
      // images and labels are clearly legible. Relative size order is preserved
      // (focused > hub-neighbor > small-neighbor). Hover/path modes unchanged.
      // Set members use the same "neighbor" tier — a set has no single hero node.
      const isInFocusCluster = (selectedId !== null && (isFocused || isNeighbor)) || isSetMember;
      const r = isInFocusCluster
        ? (isFocused ? baseR * 2.8 : baseR * 1.9)
        : isHovered  ? baseR * 1.5
        : isInPath   ? baseR * 1.25
        : baseR;

      const color = resolveNodeColor(n);
      const glow  = resolveNodeGlow(n);
      // Core glow boost — see CORE_GLOW_RADIUS_MULT/CORE_GLOW_INTENSITY above.
      // false for every node without realm === 'core', i.e. every region-one
      // node (plain graph or merged route) and every non-core island-two node.
      const isCore = n.realm === 'core';

      // ── Photo eligibility ─────────────────────────────────────────────────
      // Resting state: hub nodes (score ≥ threshold) always show photo.
      // Focus mode: every cluster node shows photo; dimmed non-cluster nodes stay dots.
      const wantsPhoto =
        (score >= ALWAYS_LABEL_THRESHOLD || isInFocusCluster)
        && !!n.imageUrl;
      if (wantsPhoto && n.imageUrl && !imgCache.has(n.imageUrl)) {
        // Kick off lazy load — canvas will pick it up on the next frame it's ready
        imgCache.set(n.imageUrl, 'loading');
        const el = new Image();
        el.crossOrigin = 'anonymous';
        el.onload  = () => imgCache.set(n.imageUrl!, el);
        el.onerror = () => imgCache.set(n.imageUrl!, null);
        el.src = n.imageUrl;
      }
      const cachedImg = n.imageUrl ? imgCache.get(n.imageUrl) : undefined;
      const photoImg  = cachedImg instanceof HTMLImageElement ? cachedImg : null;
      const showPhoto = wantsPhoto && photoImg !== null;

      // In focus mode, raise the size caps so faces are large and recognizable.
      // Genre mode: intermediate caps — faces are recognizable but smaller than focus.
      // Resting state keeps the original caps (hubs don't overwhelm the layout).
      const minPhotoR = isInFocusCluster ? 14 : PHOTO_MIN_R;
      const maxPhotoR = isInFocusCluster ? 48 : PHOTO_MAX_R;
      let er = showPhoto
        ? Math.min(Math.max(r, minPhotoR), maxPhotoR)
        : r;
      // Click-focus readability floor (see constants above) — additive, only
      // ever grows er further, never shrinks it below what the existing
      // logic above already produced.
      if (selectedId !== null && (isFocused || isNeighbor)) {
        const minScreenR = isFocused ? FOCUS_MIN_SCREEN_R : NEIGHBOR_MIN_SCREEN_R;
        er = Math.max(er, minScreenR / globalScale);
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      // ── Outer bloom haze ──
      if (!isDimmed) {
        const bloomMult = (isFocused ? 4.0 : isHovered ? 3.5 : 2.8) * (isCore ? CORE_GLOW_RADIUS_MULT : 1);
        const bloomR = er * bloomMult;
        const innerAlpha = (isFocused ? 0.30 : 0.22) * (isCore ? CORE_GLOW_INTENSITY : 1);
        const midAlpha = 0.07 * (isCore ? CORE_GLOW_INTENSITY : 1);
        const grad = ctx.createRadialGradient(n.x, n.y, er * 0.5, n.x, n.y, bloomR);
        grad.addColorStop(0,    glow.replace('0.7)', `${Math.min(innerAlpha, 1)})`));
        grad.addColorStop(0.5,  glow.replace('0.7)', `${Math.min(midAlpha, 1)})`));
        grad.addColorStop(1,    glow.replace('0.7)', '0)'));
        ctx.beginPath();
        ctx.arc(n.x, n.y, bloomR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Core shadow glow ──
      ctx.shadowBlur = (isFocused ? 32
                     : isHovered ? 22
                     : isInPath  ? 16
                     : score >= ALWAYS_LABEL_THRESHOLD ? 14
                     : 10) * (isCore ? CORE_GLOW_RADIUS_MULT : 1);
      ctx.shadowColor = glow;

      // ── Node fill (becomes the colored ring when a photo is overlaid) ──
      ctx.beginPath();
      ctx.arc(n.x, n.y, er, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Photo clip + glowing ring ─────────────────────────────────────────
      if (showPhoto) {
        // Photo fills the full node circle — the colored fill behind it is
        // the source of the core shadowBlur glow drawn above; the photo
        // covers it cleanly, leaving only the outward glow halo visible.
        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(er, 1), 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          photoImg!,
          n.x - er, n.y - er,
          er * 2,   er * 2,
        );
        ctx.restore(); // removes clip path

        // Hairline ring with layer-color shadow glow — luminous edge, not a band
        ctx.shadowColor = color;
        ctx.shadowBlur  = isFocused ? 14 : isHovered ? 11 : 8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, er - 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 0.85;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // Focused: a second, wider ghost ring further out
        if (isFocused) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, er + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha * 0.28;
          ctx.lineWidth   = 0.75;
          ctx.shadowColor = color;
          ctx.shadowBlur  = 10;
          ctx.stroke();
          ctx.shadowBlur  = 0;
          ctx.globalAlpha = alpha;
        }
      } else {
        // ── Standard dot: ring accent on focused node ──
        if (isFocused) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, er + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth   = 1.5;
          ctx.stroke();
          ctx.globalAlpha = alpha;
        }

        // ── Specular highlight (dots only — skip for photos) ──
        if (!isDimmed) {
          ctx.beginPath();
          ctx.arc(n.x - er * 0.28, n.y - er * 0.28, er * 0.32, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // ── Label logic (three tiers) ────────────────────────────────────────────
      // Tier 1 — always-on: hub landmarks (score ≥ threshold), never when dimmed
      // Tier 2 — hover: the hovered node only
      // Tier 3 — focus: the focused node + every direct neighbor
      const alwaysLabel = score >= ALWAYS_LABEL_THRESHOLD && !isDimmed;
      const showLabel   = isFocused || isNeighbor || isHovered || alwaysLabel || isInPath || isSetMember;

      // ── Per-frame state reset ──────────────────────────────────────────────────
      // >10 ms gap between drawNode calls = new animation frame: clear all state.
      const nowMs = performance.now();
      if (nowMs - labelFrameRef.current > 10) {
        labelFrameRef.current  = nowMs;
        labelQueueRef.current  = [];
        nodeCirclesRef.current = [];
      }

      if (showLabel) {
        let fontSize = Math.max(7, Math.min(9, 8 / globalScale));
        // Click-focus readability floor — same rationale as er above: additive,
        // only grows the label further, never shrinks below the existing size.
        if (selectedId !== null && (isFocused || isNeighbor)) {
          const minLabelScreenPx = isFocused ? FOCUS_LABEL_MIN_SCREEN_PX : NEIGHBOR_LABEL_MIN_SCREEN_PX;
          fontSize = Math.max(fontSize, minLabelScreenPx / globalScale);
        }
        const bright   = isFocused || isNeighbor || alwaysLabel || isInPath || isSetMember;
        // Radial placement for neighbors: push label away from focused node.
        const useRadial = isNeighbor && focusedNode?.x !== undefined && focusedNode?.y !== undefined;
        // Queue only position/style — placement runs in onRenderFramePost
        // once ALL node circles are collected, so every label avoids every node.
        labelQueueRef.current.push({
          name: n.name, nx: n.x, ny: n.y, er,
          fontSize, bright, alpha,
          radialFromX: useRadial ? focusedNode!.x : undefined,
          radialFromY: useRadial ? focusedNode!.y : undefined,
        });
      }

      // Register every node's circle so onRenderFramePost can avoid ALL photos
      // when placing labels — including nodes drawn after a label was queued.
      nodeCirclesRef.current.push({ x: n.x, y: n.y, r: er + 2 });

      ctx.restore();
    },
    [selectedId, hoveredId, pathSet, neighborSet, focusedNode, highlightSetMemberSet],
  );

  // ── Edge drawing ────────────────────────────────────────────────────────────
  const drawLink = useCallback(
    (link: object, ctx: CanvasRenderingContext2D) => {
      const l = link as GraphLink;
      const srcNode = typeof l.source === 'object' ? l.source : null;
      const tgtNode = typeof l.target === 'object' ? l.target : null;
      if (!srcNode?.x || !srcNode?.y || !tgtNode?.x || !tgtNode?.y) return;

      const sx = srcNode.x;
      const sy = srcNode.y;
      const tx = tgtNode.x;
      const ty = tgtNode.y;

      const srcId   = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId   = typeof l.target === 'object' ? l.target.id : l.target;
      const edgeKey = `${srcId}→${tgtId}`;

      const isPathEdge   = pathEdges.has(edgeKey);
      // Focus edges: any edge touching the focused node
      const isFocusEdge  = selectedId !== null && (srcId === selectedId || tgtId === selectedId);
      // Hover brightened edge (only when no focus mode active)
      const isHoverEdge  = hoveredId !== null && selectedId === null &&
                           (srcId === hoveredId || tgtId === hoveredId);
      // Set edges: any edge touching a genre/scene set member — keeps lineage
      // (including connections out to non-member influences) legible rather
      // than uniformly dimmed along with the unrelated rest of the graph.
      const isSetEdge    = highlightSetMemberSet.size > 0 &&
                           (highlightSetMemberSet.has(srcId) || highlightSetMemberSet.has(tgtId));
      const edgeColor    = resolveEdgeTint(srcNode as GraphNode);
      const glow         = edgeGlowLevelRef.current;

      ctx.save();

      if (isPathEdge) {
        // Chromatic aberration for path-finding mode
        const offsets = [
          { dx: -1, color: 'rgba(255, 30, 90, 0.9)' },
          { dx:  0, color: 'rgba(242, 168, 196, 0.9)' },
          { dx:  1, color: 'rgba(0, 200, 255, 0.9)' },
        ];
        for (const { dx, color } of offsets) {
          ctx.beginPath();
          ctx.moveTo(sx + dx, sy);
          ctx.lineTo(tx + dx, ty);
          ctx.strokeStyle = color;
          ctx.lineWidth = dx === 0 ? 2.5 : 1.5;
          ctx.setLineDash([]);
          ctx.stroke();
        }
      } else if (isFocusEdge && focusedNode) {
        // Focused artist's own layer color — their world glows in their color.
        // Fades up from the idle faint baseline rather than snapping on, via
        // edgeGlowLevelRef (fast, ~150ms — see EDGE_GLOW_MS).
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = resolveNodeColor(focusedNode);
        ctx.globalAlpha = EDGE_IDLE_ALPHA + (0.82 - EDGE_IDLE_ALPHA) * glow;
        ctx.lineWidth = EDGE_IDLE_WIDTH + (2 - EDGE_IDLE_WIDTH) * glow;
        ctx.setLineDash([]);
        ctx.stroke();
      } else if (isHoverEdge) {
        // Brightened tint on hover (no aberration), same fade-up as focus edges.
        const alpha = EDGE_IDLE_ALPHA + (0.75 - EDGE_IDLE_ALPHA) * glow;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.lineWidth = EDGE_IDLE_WIDTH + (1.6 - EDGE_IDLE_WIDTH) * glow;
        ctx.setLineDash([]);
        ctx.stroke();
      } else if (isSetEdge) {
        // Brightened tint for set-mode — no single "hero" layer color to use,
        // so this is just a brighter version of the edge's own normal tint.
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, '0.7)');
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        // Idle / non-highlighted edges recede into a soft faint web at all
        // times — whether nothing is selected, or something else is focused —
        // so the graph never reads as a scribble of crossing lines. Only the
        // edges above (focus/hover/set/path) rise above this baseline.
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${EDGE_IDLE_ALPHA})`);
        ctx.lineWidth = EDGE_IDLE_WIDTH;
        ctx.stroke();
      }

      ctx.restore();
    },
    [selectedId, hoveredId, pathEdges, focusedNode, highlightSetMemberSet],
  );

  // ── Deferred label placement + rendering ─────────────────────────────────
  // Called after every node has been drawn — nodeCirclesRef holds ALL circles.
  // Labels are placed here (not in drawNode) so collision detection against
  // node photos is complete before any label position is committed.
  const handleRenderFramePost = useCallback((ctx: CanvasRenderingContext2D) => {
    const candidates = labelQueueRef.current;
    if (!candidates.length) return;

    const circles    = nodeCirclesRef.current; // all nodes drawn this frame
    const labelRects: [number, number, number, number][] = [];

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (const { name, nx, ny, er, fontSize, bright, alpha, radialFromX, radialFromY } of candidates) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textW = ctx.measureText(name).width;
      const textH = fontSize;
      const padH  = 2;
      const padV  = 1;

      // Base anchor: directly below the node edge, or radially away from focused node
      const labelGap = er + 4;
      let lx = nx;
      let ly = ny + labelGap + textH * 0.5;

      if (radialFromX !== undefined && radialFromY !== undefined) {
        const dx  = nx - radialFromX;
        const dy  = ny - radialFromY;
        const len = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
        const gap = er + 4 + textH * 0.5;
        lx = nx + (dx / len) * gap;
        ly = ny + (dy / len) * gap;
      }

      // Collision avoidance: nudge within a small radius close to the node,
      // trying several nearby angles at each of a couple of small distance
      // steps. A label must stay visibly attached to its node — mild overlap
      // with another label/node is acceptable, but drifting far enough to
      // read as "detached" is not. If nothing within that small radius is
      // clear, fall back to the natural anchor (lx/ly are untouched below)
      // and accept the overlap rather than jumping the label far away.
      const dxBase    = lx - nx;
      const dyBase    = ly - ny;
      const baseDist  = Math.max(Math.sqrt(dxBase * dxBase + dyBase * dyBase), 0.01);
      const baseAngle = Math.atan2(dyBase, dxBase);

      const MAX_BUMP_STEPS = 2;
      const BUMP_STRIDE     = textH * 0.8; // total max drift ≈ 1.6× a text line

      let placed = false;
      outer:
      for (let step = 0; step <= MAX_BUMP_STEPS; step++) {
        const dist   = baseDist + step * BUMP_STRIDE;
        const angles = step === 0
          ? [baseAngle]
          : [baseAngle + 0.3, baseAngle - 0.3, baseAngle + 0.6, baseAngle - 0.6,
             baseAngle + 0.9, baseAngle - 0.9];

        for (const ang of angles) {
          const cx   = nx + Math.cos(ang) * dist;
          const cy   = ny + Math.sin(ang) * dist;
          const rect: [number, number, number, number] = [
            cx - textW / 2 - padH, cy - textH / 2 - padV,
            textW + padH * 2,      textH + padV * 2,
          ];
          const clearOfLabels = !labelRects.some(r2 => rectsOverlap(rect, r2));
          const clearOfNodes  = !circles.some(c => rectOverlapsCircle(rect, c.x, c.y, c.r));
          if (clearOfLabels && clearOfNodes) {
            labelRects.push(rect);
            lx = cx;
            ly = cy;
            placed = true;
            break outer;
          }
        }
      }
      if (!placed) {
        labelRects.push([
          lx - textW / 2 - padH, ly - textH / 2 - padV,
          textW + padH * 2,      textH + padV * 2,
        ]);
      }

      // Soft dark halo — three layers of decreasing blur, no hard rect
      const textColor = bright
        ? `rgba(237,234,247,${(alpha * 0.92).toFixed(3)})`
        : `rgba(237,234,247,${(alpha * 0.6).toFixed(3)})`;

      ctx.shadowColor = 'rgba(10,8,22,0.95)';
      ctx.shadowBlur  = 7;
      ctx.fillStyle   = textColor;
      ctx.fillText(name, lx, ly);
      ctx.shadowBlur = 4;
      ctx.fillText(name, lx, ly);
      ctx.shadowBlur = 0;
      ctx.fillText(name, lx, ly);
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;
  }, []);

  // ── Pointer hit-area ─────────────────────────────────────────────────────
  // Paints the invisible picking layer used by the library for hover/click detection.
  // Must replicate the same er (visual radius) as drawNode so the entire node —
  // photo, ring, glow — is one unified circular target with no dead zones.
  const paintNodePointerArea = useCallback(
    (node: object, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode;
      if (n.x === undefined || n.y === undefined) return;

      const score  = n.influenceScore ?? 0;
      const baseR  = 3.5 + Math.sqrt(score) * 2.2;
      const isFocused           = n.id === selectedId;
      const isNeighbor          = selectedId !== null ? neighborSet.has(n.id) : false;
      const isHovered           = n.id === hoveredId && selectedId === null;
      const isInPath            = pathSet.has(n.id);
      const isSetMember         = highlightSetMemberSet.has(n.id);
      const isInFocusCluster    = (selectedId !== null && (isFocused || isNeighbor)) || isSetMember;

      const r = isInFocusCluster
        ? (isFocused ? baseR * 2.8 : baseR * 1.9)
        : isHovered  ? baseR * 1.5
        : isInPath   ? baseR * 1.25
        : baseR;

      const wantsPhoto = (score >= ALWAYS_LABEL_THRESHOLD || isInFocusCluster) && !!n.imageUrl;
      const minPhotoR  = isInFocusCluster ? 14 : PHOTO_MIN_R;
      const maxPhotoR  = isInFocusCluster ? 48 : PHOTO_MAX_R;
      let er = wantsPhoto ? Math.min(Math.max(r, minPhotoR), maxPhotoR) : r;
      // Mirrors drawNode's click-focus readability floor exactly, so the
      // clickable area always matches the enlarged visual circle — no dead
      // zone around a node that reads bigger on screen than it hit-tests.
      if (selectedId !== null && (isFocused || isNeighbor)) {
        const minScreenR = isFocused ? FOCUS_MIN_SCREEN_R : NEIGHBOR_MIN_SCREEN_R;
        er = Math.max(er, minScreenR / globalScale);
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, er + RING_WIDTH, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [selectedId, hoveredId, neighborSet, pathSet, highlightSetMemberSet],
  );

  const handleNodeHover = useCallback((node: object | null) => {
    const n = node as GraphNode | null;
    setHoveredId(n?.id ?? null);
  }, []);

  const handleNodeClick = useCallback(
    (node: object) => {
      const n = node as GraphNode;
      onNodeClick(n.id);
    },
    [onNodeClick],
  );

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {/* Only mount once ResizeObserver has provided real dimensions.
          Prevents the 800×600 → actual-size re-render that resets d3-zoom.
          By the time this mounts, stableData's nodes are already
          pre-settled (see presettleLayout above), so there's no scattered
          starting frame underneath the fade-in for the user to ever see —
          this wrapper's only job is a quick, on-brand reveal instead of a
          hard cut once the (already-loading) dynamic-import fallback
          ("Mapping the constellation…") swaps in the real canvas. */}
      {dimensions && <div className="graph-canvas-reveal" style={{ width: '100%', height: '100%' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={stableData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          linkSource="source"
          linkTarget="target"
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => 'replace'}
          nodePointerAreaPaint={paintNodePointerArea}
          linkCanvasObject={drawLink}
          linkCanvasObjectMode={() => 'replace'}
          onRenderFramePost={handleRenderFramePost}
          nodeVisibility={isNodeVisible}
          linkVisibility={isLinkVisible}
          linkDirectionalArrowLength={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            const isFocusOrSetEdge =
              (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ||
              (highlightSetMemberSet.size > 0 && (highlightSetMemberSet.has(srcId) || highlightSetMemberSet.has(tgtId)));
            return isFocusOrSetEdge ? 9 : 3;
          }}
          linkDirectionalArrowRelPos={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            // Focus/set edges: midpoint keeps the arrow in open space, away from node images
            const isFocusOrSetEdge =
              (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ||
              (highlightSetMemberSet.size > 0 && (highlightSetMemberSet.has(srcId) || highlightSetMemberSet.has(tgtId)));
            return isFocusOrSetEdge ? 0.5 : 0.85;
          }}
          linkDirectionalArrowColor={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            // Focus edges: bright layer color so arrows are legible at a glance
            if (selectedId !== null && (srcId === selectedId || tgtId === selectedId) && focusedNode) {
              return resolveNodeColor(focusedNode);
            }
            const srcNodeForTint = typeof l.source === 'object'
              ? (l.source as GraphNode)
              : ({ layer: 'outside' as Layer } as GraphNode);
            const baseColor = resolveEdgeTint(srcNodeForTint);
            // Set edges: no single "hero" layer color, so brighten the normal tint instead.
            const isSetEdge = highlightSetMemberSet.size > 0 &&
              (highlightSetMemberSet.has(srcId) || highlightSetMemberSet.has(tgtId));
            return isSetEdge ? baseColor.replace(/[\d.]+\)$/, '0.85)') : baseColor;
          }}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onBackgroundClick={onBackgroundClick}
          onEngineStop={handleEngineStop}
          enableNodeDrag
          enableZoomInteraction
          enablePanInteraction
          // Nodes are already pre-settled (see presettleLayout/stableData
          // above) before this ever mounts, so no warmup ticking is needed —
          // 0 renders our precomputed positions on the very first frame,
          // untouched. cooldownTicks starts at 0 for the same reason (see
          // postMountCooldownTicks/the force-config effect above) and is
          // raised to a real budget once the correct forces are registered.
          warmupTicks={0}
          cooldownTicks={postMountCooldownTicks}
        />
      </div>}
    </div>
  );
}
