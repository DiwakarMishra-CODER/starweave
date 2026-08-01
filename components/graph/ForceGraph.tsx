'use client';

import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force-3d';
import type { Artist, Edge, GraphData, Layer } from '@/data/types';
import { resolveNodeColor, resolveNodeGlow, resolveEdgeTint } from '@/lib/colors';
import { getNeighbors, pathEdgeKeys } from '@/lib/graph-utils';

// Dev-only zoom readout (tuning instrument for the zoom-based cloud/detail
// reveal work) — flip to false to remove the on-screen number without
// deleting the plumbing. Reads globalScale that onRenderFramePost already
// receives every frame; no new camera/zoom system.
const SHOW_ZOOM_READOUT = true;

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

// The single set of ids to frame together right now (and, for a node focus
// only — see `spread` below — spread apart), plus a stable primitive key
// identifying that selection (for effect deps / pending-retry comparisons —
// arrays are a fresh reference every render, strings compare by value).
// Single-node focus (id + its direct neighbors) takes priority; otherwise a
// highlighted genre/scene set. The two are mutually exclusive by construction
// in GraphView (selectedId and highlightSetIds are never both set).
//
// `spread` distinguishes the two cluster kinds for applySpreadForCluster /
// animateClusterIntoView: true only for a node focus. A focused node's direct
// neighbors are pulled toward it by their shared edge (forceLink distance 75)
// and often sit close enough to overlap, so spreading them apart from their
// shared centroid makes the cluster legible. A genre/scene set has no such
// local-overlap problem — its members already sit wherever the realm-
// separation forces settled them, typically each in their own realm's home
// cluster on the opposite side of the layout from each other — so applying
// the same outward spread only balloons the bounding box (by SPREAD_FACTOR
// on top of distances that can already span most of the graph), forcing the
// camera to zoom out far past what the set's own natural positions need and
// leaving cross-realm members looking flung to the edges of an over-wide
// frame instead of gathered into a legible cluster.
function getActiveCluster(
  selectedId: string | null,
  highlightSetIds: string[] | null,
  edges: Edge[],
): { ids: string[]; key: string; spread: boolean } {
  if (selectedId) {
    return { ids: [selectedId, ...getNeighbors(selectedId, edges)], key: `artist:${selectedId}`, spread: true };
  }
  if (highlightSetIds && highlightSetIds.length > 0) {
    return { ids: highlightSetIds, key: `set:${highlightSetIds.join(',')}`, spread: false };
  }
  return { ids: [], key: '', spread: false };
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

// ── Zoom-size dampening (detail zoom decluttering) ──────────────────────────
// Node radius/label fontSize are otherwise graph-space constants with no
// globalScale term at all, and node positions are equally fixed (one-time
// presettleLayout) — so on screen, both radius and inter-node gap scale by
// the exact same globalScale factor as you zoom, and their RATIO never
// changes. Zooming in just magnifies everything uniformly; it can never
// open up relative breathing room, which is why photos/labels stay just as
// overlapped at zoom 4.3 as at zoom 3.5. Fix: shrink the graph-space
// radius/fontSize themselves, relative to the (unchanged) node spacing,
// once you're zoomed in past ZOOM_SIZE_REFERENCE — real gaps open up and
// the label collision search below actually has room to work with.
// Clamped to exactly 1 at/below the reference zoom, so cloud/overview
// rendering (which all happens well below this zoom) is untouched.
const ZOOM_SIZE_REFERENCE = 3.5; // globalScale below which sizing is unchanged from today
const ZOOM_SIZE_DAMPEN = 0.75;   // 0 = no dampening (old behavior), 1 = constant on-screen size past the reference
function computeZoomSizeMult(globalScale: number): number {
  if (globalScale <= ZOOM_SIZE_REFERENCE) return 1;
  return Math.pow(ZOOM_SIZE_REFERENCE / globalScale, ZOOM_SIZE_DAMPEN);
}

// ── Label collision search (widened — see the demotion logic in
// onRenderFramePost) — now that zoom-size dampening opens up real gaps at
// high zoom, the bump search has room to use. Was 2 steps / 0.8×textH.
const LABEL_BUMP_MAX_STEPS = 3;
const LABEL_BUMP_STRIDE_MULT = 1.1; // × textH per step

// ── Label chip (dark rounded pill behind label text) ────────────────────────
// Replaces the old shadow-halo (three stacked fillText calls at decreasing
// shadowBlur) — a soft glow reads fine against plain background but not
// against a bright node/edge underneath. A solid chip guarantees contrast
// regardless of what's behind it. Same rect used for BOTH the visible chip
// and the label-collision math below (labelRects) — one source of truth, so
// collision avoidance always matches what's actually drawn.
const LABEL_CHIP_PAD_X = 6;   // px — horizontal padding around the text
const LABEL_CHIP_PAD_Y = 3;   // px — vertical padding around the text
const LABEL_CHIP_RADIUS = 6;  // px — corner rounding
const LABEL_CHIP_MAX_ALPHA = 0.72; // chip background peak opacity (scaled by the label's own alpha)

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

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
// declarations. O(n²) per iteration is trivial at this graph's node count.
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
//
// Runs COLLIDE_ITERATIONS resolution passes per external tick, correcting
// position directly (not just velocity). One velocity-only pass per tick
// converges fine for a handful of scattered overlaps, but a realm cluster
// (e.g. ~57 region-one nodes all pulled toward the same home point at the
// weaker REALM_CHARGE repulsion) is dense enough that some pairs — reported:
// Mazzy Star / Modest Mouse — never fully separated within the fixed
// PRESETTLE_TICKS budget: velocity added late in the simulation gets
// multiplied by velocityDecay and only partially applied to position by the
// next external tick's own integration step. Direct position correction
// resolves each pass's overlap immediately, so multiple passes per tick
// converge far faster than waiting on more external ticks would.
const COLLIDE_ITERATIONS = 3;

function createCollideForce(padding: number) {
  let nodes: CollideNode[] = [];
  function resolveOnce() {
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
        // Immediate position correction — the hard constraint itself —
        // plus a matching velocity nudge so the next external tick's other
        // forces (link/charge) don't re-integrate from a stale vx/vy and
        // undo it.
        a.x -= ox; a.y -= oy;
        b.x += ox; b.y += oy;
        a.vx = (a.vx ?? 0) - ox;
        a.vy = (a.vy ?? 0) - oy;
        b.vx = (b.vx ?? 0) + ox;
        b.vy = (b.vy ?? 0) + oy;
      }
    }
  }
  function force() {
    for (let iter = 0; iter < COLLIDE_ITERATIONS; iter++) resolveOnce();
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
// Pulls realm-tagged nodes toward a "home" position so each realm reads as
// a loosely separated cluster instead of one hairball. A node with no
// `realm` at all — every real region-one Artist on the plain graph, and any
// node a caller doesn't explicitly tag — gets exactly 0 strength from BOTH
// the x- and y-force below (see realmPullStrengthX/Y), so it contributes
// nothing for them: only the existing charge/link/center/collide forces
// above apply, unchanged from before this force existed.
//
// RADIAL LAYOUT — core sits at dead center; every non-core realm is placed
// evenly around it on an ellipse. Data-driven: computeRealmHomePositions
// below derives the list of non-core realms actually present in the node
// set (not a hardcoded name list) and spaces them evenly by index, so
// adding a 3rd/4th realm later needs no formula change here — it just
// re-spaces automatically.
//
// TUNING KNOBS — every value governing the ellipse size/rotation and how
// hard each realm is pulled toward its point on it lives here, together.
// Kept small enough that zoomToFit's dense-core fit (see DENSE_CORE_
// PERCENTILE below) still lands at or above SCROLL_MIN_ZOOM (now 1.6, was
// 2.5 — raised as the realm count grew from 3 to 6 spread positions; see the
// SCROLL_MIN_ZOOM comment below) — the user can't scroll out any further
// than that floor, so if the ellipse is wider than what fits at that zoom,
// the realms spill off-screen with no way to compensate. First-pass values
// (420/260) were too wide; these are a more conservative starting point at
// the same ~1.6:1 aspect ratio.
// Raised from 230/145 — with six realms at even 60° spacing (see
// REALM_ANGLE_DEG below), the tightest neighbor chord was still visually
// tight even after evening the angles out. This bump needs SCROLL_MIN_ZOOM
// re-checked empirically against the wider ellipse — do not assume the
// existing 1.6 floor still fits without looking.
const REALM_RADIUS_X = 260; // ellipse semi-axis, horizontal — wider than tall to fill a landscape viewport
const REALM_RADIUS_Y = 165; // ellipse semi-axis, vertical
const REALM_ANGLE_OFFSET = 0; // degrees — rotates the whole arrangement; spin to a pleasing orientation by eye
const CORE_PULL_STRENGTH = 1.2;       // core-only horizontal pull toward center — core must be the most strongly-positioned thing in the graph so it wins against its own heavy edges into region-one, rather than getting dragged into that mass
const CORE_PULL_STRENGTH_Y = 1.2;     // core-only vertical pull toward center — same strength as CORE_PULL_STRENGTH (core's target is the origin on both axes, so this being separate is harmless, not load-bearing)
// One strength for BOTH axes on every non-core realm — deliberately
// isotropic. The old linear layout could get away with a weaker Y pull
// (every realm shared Y=0, so Y was just a vertical-compacting force, not a
// real separating axis) but a true ellipse needs equal pull on both axes:
// a realm placed near the top/bottom of the ellipse is mostly a Y-offset
// from center, one near the sides is mostly an X-offset, and an asymmetric
// strength would under-pull whichever axis matters more for a given realm's
// angle — settling some realms closer to center than others by accident of
// angle rather than by design.
const REALM_PULL_STRENGTH = 0.6;
const REALM_CHARGE = -22;             // charge (repulsion) for any realm-tagged node — weaker than the graph's normal -40 so each realm's bloom can pull tighter without its own internal repulsion fighting that pull. Realm-less nodes (every real region-one Artist on the plain graph) keep exactly -40 — see chargeStrength below.

// Fixed compass-style angle (degrees) per known realm — a named, tunable
// arrangement rather than pure auto-spacing, so adding a realm can't shift
// the existing ones. 0 = right/+X, 90 = below/+Y (canvas Y increases
// downward), 180 = left/-X, 270 = above/-Y. Any realm NOT listed here (a
// future addition without a config update) falls back to even auto-spacing
// among just the unlisted realms in computeRealmHomePositions below —
// preserves the original "never breaks on an unknown realm" behavior.
// Evened to exact 60° spacing (was 0/45/112.5/180/247.5/315 — a 45° pinch
// around electronic on one side). Same order/adjacency as before, just
// uniformly spread: every neighbor pair is now equidistant, widening the
// tightest chord (previously the 45° electronic<->folk / emo<->electronic
// gaps) by about a third. Unlike a REALM_RADIUS bump, this has no coupling
// to SCROLL_MIN_ZOOM — the ellipse's overall extent is unchanged, only the
// angular distribution around it.
const REALM_ANGLE_DEG: Record<string, number> = {
  electronic: 0,                    // right
  'folk-confessional': 60,          // bottom-right
  'american-underground': 120,      // bottom-left
  'region-one': 180,                // left
  'post-rock-drone-noise': 240,     // upper-left
  'emo-posthardcore': 300,          // upper-right
};

// Scans the actual node set for distinct non-core realms present (not a
// hardcoded name list — REALM_ANGLE_DEG above only fixes the ANGLE for the
// realms named in it; the scan itself still works for any realm), sorts
// them for a deterministic order regardless of array/insertion order, then
// places each at its REALM_ANGLE_DEG angle (or auto-spaces the leftovers).
// core always maps to the origin. Called once per layout pass (presettle,
// and once in the live-sim force-config effect) — not per node.
function computeRealmHomePositions(nodes: { realm?: string }[]): Map<string, { x: number; y: number }> {
  const nonCoreRealms = Array.from(
    new Set(nodes.map(n => n.realm).filter((r): r is string => !!r && r !== 'core')),
  ).sort();

  const positions = new Map<string, { x: number; y: number }>();
  positions.set('core', { x: 0, y: 0 });

  // Realms without a fixed REALM_ANGLE_DEG entry auto-space evenly among
  // themselves (not among the full realm count) so they never collide with
  // a named realm's angle.
  const unlisted = nonCoreRealms.filter(r => !(r in REALM_ANGLE_DEG));
  nonCoreRealms.forEach(realm => {
    const namedAngleDeg = REALM_ANGLE_DEG[realm];
    const angleDeg = namedAngleDeg !== undefined
      ? namedAngleDeg
      : (unlisted.indexOf(realm) * 360) / unlisted.length;
    const angle = ((REALM_ANGLE_OFFSET + angleDeg) * Math.PI) / 180;
    positions.set(realm, {
      x: REALM_RADIUS_X * Math.cos(angle),
      y: REALM_RADIUS_Y * Math.sin(angle),
    });
  });
  return positions;
}

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

// Factories, not plain functions — each closes over a homePositions map
// computed once per layout pass by computeRealmHomePositions (the map
// depends on which realms are actually present in that pass's node set).
function makeRealmHomeX(homePositions: Map<string, { x: number; y: number }>) {
  return (node: { realm?: string }): number => {
    if (!node.realm) return 0; // unused — realmPullStrengthX returns 0 for this case, so this never moves the node
    return homePositions.get(node.realm)?.x ?? 0;
  };
}

function makeRealmHomeY(homePositions: Map<string, { x: number; y: number }>) {
  return (node: { realm?: string }): number => {
    if (!node.realm) return 0; // unused — realmPullStrengthY returns 0 for this case, so this never moves the node
    return homePositions.get(node.realm)?.y ?? 0;
  };
}

function realmPullStrengthX(node: { realm?: string }): number {
  if (node.realm === 'core') return CORE_PULL_STRENGTH;
  if (node.realm) return REALM_PULL_STRENGTH; // any non-core realm — data-driven, no per-realm branch needed
  return 0;
}

function realmPullStrengthY(node: { realm?: string }): number {
  if (node.realm === 'core') return CORE_PULL_STRENGTH_Y;
  if (node.realm) return REALM_PULL_STRENGTH; // isotropic — see REALM_PULL_STRENGTH's comment above
  return 0;
}

function chargeStrength(node: { realm?: string }): number {
  // Data-driven, matching realmPullStrengthX/Y above — ANY realm-tagged node
  // gets the weaker charge, not an enumerated list of known realm names.
  // The enumerated version silently gave a newly-added realm (folk-
  // confessional) the default -40 instead of REALM_CHARGE, nearly doubling
  // its nodes' mutual repulsion relative to region-one/electronic and
  // fighting its own realm-home pull — the direct cause of it failing to
  // cluster into a tight, separate cloud.
  return node.realm ? REALM_CHARGE : -40; // realm-less node (the plain region-one graph) keeps exactly -40, unchanged
}

function presettleLayout(nodes: GraphNode[], links: GraphLink[]): void {
  const sim = forceSimulation(nodes, 2);
  sim.stop(); // d3-force schedules its own auto-tick timer on creation — must
              // stop it before it ever fires; we drive ticking manually below.
  sim.force('link', forceLink<GraphNode, GraphLink>(links).id(n => n.id).distance(75).strength(linkStrength));
  sim.force('charge', forceManyBody<GraphNode>().strength(chargeStrength));
  sim.force('center', forceCenter().strength(0.04));
  sim.force('collide', createCollideForce(COLLIDE_PADDING));
  const realmHomePositions = computeRealmHomePositions(nodes);
  sim.force('realmX', forceX<GraphNode>(makeRealmHomeX(realmHomePositions)).strength(realmPullStrengthX));
  sim.force('realmY', forceY<GraphNode>(makeRealmHomeY(realmHomePositions)).strength(realmPullStrengthY));
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
// Lowered from 0.12 — tuned when the graph was roughly a third its current
// size; the same alpha now means far more edges crossing the same detail-
// zoom viewport, reading as a bright uniform crosshatch over the nodes
// rather than individually legible relationships.
const EDGE_IDLE_ALPHA = 0.06;
const EDGE_IDLE_WIDTH = 0.6;

// Core-touching edges stay faintly visible at cloud zoom instead of fading
// to 0 like everything else — without them, the three realm clouds float
// unlinked and read as "random scattered dots" rather than a connected
// structure. Every other edge (within-realm, AND any cross-realm edge that
// doesn't touch core) is untouched — still fades fully via edgeFade, that's
// the clutter this fade was built to remove. Tried "any cross-realm bridge"
// and "significant bridges" (core OR high-influenceScore) first — both
// still read as a crisscross web; "touches core" alone is what actually
// reads as a few clean arms radiating from the center. Remaps edgeFade into
// [CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM..1] (a floor, not 0) rather than a
// new threshold — the node-side equivalent of this floor pattern was
// removed when drawNode moved to the anchors-only redesign (see ANCHOR_COUNT),
// but edges still use it: it's what keeps these threads visible at cloud zoom.
const CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM = 0.015; // opacity — barely-there wispy filament, not a bright line
// Lowered from 6 (was tuned for three realm clouds; with six now, ~95
// core-touching edges glow simultaneously and the blur bloom was
// compounding into the reported "petals" look around the core). Deliberately
// a bare, easy-to-retune constant rather than derived from anything else —
// expect to want a value between 3 and 6 depending on how this reads with
// six realms; nudge here only, no other formula depends on it.
const CORE_EDGE_THREAD_GLOW_BLUR = 3; // intensity — soft glow, strongest at cloud zoom, 0 by detail zoom

// Every other edge (within-realm, and cross-realm bridges that don't touch
// core) still fades all the way to 0 above — reads as bare scattered dots
// with no sense of a web underneath the core arms. Same floor pattern as
// CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM, just a lower floor: enough for the
// overall shape to read as "connected," dim enough to stay entirely behind
// the core threads. No glow (unlike the core branch) — these are background
// texture, not featured arms.
// Lowered from 0.045 — with six realm clouds now reading as distinct color
// zones (post 60°-spacing + glow-blur fixes), this idle web was still dense
// enough to fill the visual gaps between clusters and read as one continuous
// mass rather than separated clouds.
const IDLE_EDGE_ALPHA_AT_CLOUD_ZOOM = 0.02;
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

// User-scroll zoom clamp for the unfocused overview — distinct from MAX_ZOOM
// above (that one caps what the focus camera itself will dial in to).
// react-force-graph-2d only exposes minZoom/maxZoom as declarative props —
// its ref's methodNames whitelist (zoom/zoomToFit/centerAt/d3Force/etc.)
// does NOT include minZoom/maxZoom, even though the underlying force-graph
// kapsule instance has both as callable setters. So this has to be driven
// via React state on <ForceGraph2D minZoom maxZoom>, not graphRef.
// Lowered from 2.5: with six realms now spread to their own distinct
// positions around the layout ellipse (see REALM_ANGLE_DEG) instead of
// three overlapping in one arc, the combined bounding extent of every
// realm's cluster no longer fits inside a zoom-2.5 viewport. FADE_ZOOM_OUT
// deliberately stays at 2.5, NOT lowered alongside this — the new headroom
// between 1.6 and 2.5 is extra room to pull back while already fully in
// cloud-dot rendering (computeZoomFade is already 0, i.e. full cloud, for
// any globalScale at/below FADE_ZOOM_OUT), not a new visual state to design
// for. See the REALM_RADIUS_X/Y comment above for the root-cause coupling.
const SCROLL_MIN_ZOOM = 1.6;
const SCROLL_MAX_ZOOM = 7;
// force-graph's own library defaults (force-graph.js: minZoom default 0.01,
// maxZoom default 1000) — used as the "unclamped" bounds while a focus view
// is active, rather than inventing new numbers that might not cover every
// focus target (zoomToFit's dense-core fit isn't bounded by MAX_ZOOM at all).
const UNCLAMPED_MIN_ZOOM = 0.01;
const UNCLAMPED_MAX_ZOOM = 1000;
const CLAMPED_BOUNDS: [number, number] = [SCROLL_MIN_ZOOM, SCROLL_MAX_ZOOM];
const UNCLAMPED_BOUNDS: [number, number] = [UNCLAMPED_MIN_ZOOM, UNCLAMPED_MAX_ZOOM];

// ── Node opacity fade by zoom (P2 of the zoom-based cloud/detail reveal) ────
// Overview only — drawNode forces this to 1 whenever a focus view is open
// (see isFocusModeActive there), since focus legitimately zooms below
// FADE_ZOOM_OUT to frame neighbors and those neighbors must stay visible.
// Fully solid at/above FADE_ZOOM_IN — unchanged from pre-fade behavior.
// Fully invisible at/below FADE_ZOOM_OUT, for every node, hubs included.
const FADE_ZOOM_OUT = 2.5;
const FADE_ZOOM_IN = 3.5;
// Shifts each node's fade-START point (not its zero point) down from
// FADE_ZOOM_IN by this many zoom-units per sqrt(influenceScore) — so a hub
// holds full opacity over a wider range while zooming out, then fades over a
// narrower stretch just above FADE_ZOOM_OUT. Every node still reaches
// exactly 0 at FADE_ZOOM_OUT regardless of this value. Set to 0 to disable.
const FADE_HUB_BIAS_STRENGTH = 0.15;

// The ~N most influential nodes globally (by influenceScore) that get a
// name label at cloud zoom — "meaning without clutter" landmarks on the
// star-map. Every node still gets a visible dot at cloud zoom (see
// CLOUD_DOT_* below) — this only gates LABELS, not the dot itself. Computed
// once in a useMemo (see topAnchorIds near stableData), not per-frame.
const ANCHOR_COUNT = 12;

// ── Crisp colored dot at cloud zoom — EVERY node, not just anchors. A
// modest solid-colored core + a tight soft glow halo (both cached sprites —
// see the perf report), crossfading against the existing bloom-haze/fill/
// photo path via cloudDotFade/zoomFade (computed per-node in drawNode):
// cloudDotFade = 1 - zoomFade, so the two are exact complements — summing to
// 1 at every zoom, never both invisible at once. 0 in focus mode or at/above
// FADE_ZOOM_IN, so detail zoom/focus stay byte-for-byte the existing
// rendering, ramping to full cloud-dot treatment at FADE_ZOOM_OUT.
//
// An earlier version of this (applying it only to the top ANCHOR_COUNT
// nodes, oversized/bright enough to read as a landmark) is why these values
// are deliberately modest now: applied to all ~106 nodes, additive glow at
// that size/intensity was adding up fast and reading as a blown-out white
// wash rather than clean colored dots. No twinkle, no influence-based
// brightness boost either — dropped for a calmer, simpler look now that
// this runs for every node instead of 12 (see the report for why).
//
// Reworked toward a deep-space-starfield reference: nodes should read as
// tiny sharp points with strong faint/bright variation (few bright, many
// faint), not uniform circles. A flat 1:1 size mult against baseR (already
// sqrt(influenceScore)-scaled for the DETAIL view) drew a real hub's dot as
// big as a full detail-zoom circle — replaced with its own flat min/max
// range plus a gentle sqrt(score) growth, independent of baseR entirely.
const CLOUD_DOT_MIN_R = 1.3;       // world units — point size for a typical/low-score node
const CLOUD_DOT_MAX_R = 3.2;       // world units — cap on even the biggest hub's point
const CLOUD_DOT_HUB_GROWTH = 0.28; // × sqrt(score) added on top of CLOUD_DOT_MIN_R, capped at CLOUD_DOT_MAX_R
const CLOUD_DOT_BRIGHTNESS = 0.7;  // peak core alpha ceiling — actual per-node alpha is also scaled by score just below
const CLOUD_DOT_MIN_BRIGHTNESS_FRACTION = 0.35; // faintest (score 0) nodes still read at this fraction of CLOUD_DOT_BRIGHTNESS
const CLOUD_DOT_BRIGHTNESS_GROWTH = 0.12;        // × sqrt(score) added on top of the floor above, capped at 1
const CLOUD_DOT_GLOW_TIGHTNESS = 1.6; // halo radius × core radius — modest, well short of the detail dot's wide bloom haze (2.8–4×)
const CLOUD_DOT_GLOW_INTENSITY = 0.18; // halo peak alpha — kept low: additive glow across many hubs adds up fast even at a modest per-node value
// Only hubs/anchors get the soft bloom halo — everyone else is a bare
// point, per the reference (most stars are just points; a few bloom).
const CLOUD_DOT_HALO_MIN_SCORE = ALWAYS_LABEL_THRESHOLD;

// ── Glow sprite cache (perf) ────────────────────────────────────────────────
// Before this, every radial-glow draw (nebula, bloom haze, star halo) built
// a brand-new CanvasGradient — with 2-3 addColorStop calls each — from
// scratch, per node, per frame. Once autoPauseRedraw={false} made the whole
// canvas repaint continuously (needed for the twinkle), that meant ~300
// gradient constructions/frame, ~18,000/second: the actual cause of the lag.
//
// Fix: a radial gradient's shape scales perfectly under drawImage (no
// distortion, unlike e.g. a blur) — so each DISTINCT (shape, color) pair
// only needs ONE reference-resolution bitmap, rendered once, reused forever
// via drawImage + globalAlpha for brightness. There are only ~14 distinct
// glow colors in the whole dataset (5 layer colors + core gold + 8
// electronic lineages), so this collapses "one gradient per node per frame"
// into a handful of cached bitmaps stamped via drawImage (one of the
// cheapest canvas operations) — same visual result, a fraction of the cost.
const GLOW_SPRITE_REFERENCE_RADIUS = 64; // px — reference bitmap size; drawImage scales it to each node's actual radius, so this only needs to be "big enough to look smooth," not exact

function buildGlowSprite(build: (grad: CanvasGradient) => void, innerFraction = 0): HTMLCanvasElement {
  const refR = GLOW_SPRITE_REFERENCE_RADIUS;
  const size = refR * 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const octx = canvas.getContext('2d')!;
  const grad = octx.createRadialGradient(refR, refR, refR * innerFraction, refR, refR, refR);
  build(grad);
  octx.beginPath();
  octx.arc(refR, refR, refR, 0, Math.PI * 2);
  octx.fillStyle = grad;
  octx.fill();
  return canvas;
}

// Stamps a cached sprite at (x, y) scaled to `radius`, with `peakAlpha`
// composited via globalAlpha (the sprite itself is always baked at peak
// alpha 1.0 — canvas composites source-alpha × globalAlpha, so this
// reproduces exactly what a fresh gradient at that peak alpha would have
// drawn). Callers that need globalAlpha restored afterward for further
// drawing must do so themselves (same convention already used elsewhere in
// this file for temporary globalAlpha overrides).
function stampGlowSprite(
  ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement,
  x: number, y: number, radius: number, peakAlpha: number,
): void {
  ctx.globalAlpha = Math.max(0, Math.min(1, peakAlpha));
  ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
}

// 2-stop "peak at center -> fully transparent at edge" shape — shared by
// drawNodeGlow (region-one/electronic nebula) and the star halo below, since
// both use the exact same relative shape and only the color differs.
const glow2StopSpriteCache = new Map<string, HTMLCanvasElement>();
function get2StopGlowSprite(glowColor: string): HTMLCanvasElement {
  let sprite = glow2StopSpriteCache.get(glowColor);
  if (!sprite) {
    sprite = buildGlowSprite(grad => {
      grad.addColorStop(0, glowColor.replace('0.7)', '1)'));
      grad.addColorStop(1, glowColor.replace('0.7)', '0)'));
    });
    glow2StopSpriteCache.set(glowColor, sprite);
  }
  return sprite;
}

// Solid opaque-color circle — the star's bright core (see drawNode below).
// Even cheaper than a gradient sprite: no stops, just a fill.
const solidCircleSpriteCache = new Map<string, HTMLCanvasElement>();
function getSolidCircleSprite(hexColor: string): HTMLCanvasElement {
  let sprite = solidCircleSpriteCache.get(hexColor);
  if (!sprite) {
    const refR = GLOW_SPRITE_REFERENCE_RADIUS;
    const size = refR * 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const octx = canvas.getContext('2d')!;
    octx.beginPath();
    octx.arc(refR, refR, refR, 0, Math.PI * 2);
    octx.fillStyle = hexColor;
    octx.fill();
    solidCircleSpriteCache.set(hexColor, canvas);
    return canvas;
  }
  return sprite;
}

// drawNode's "Outer bloom haze," resting case only (not isFocused/
// isHovered — see that block's own comment for why those two stay on the
// original per-call gradient). Ratio-normalized to the ORIGINAL resting
// values (innerAlpha=0.22, midAlpha=0.07): peak (stop 0) = 1.0 reference,
// stop 0.5 = 0.07/0.22 of peak, stop 1 = 0 — the real peak alpha is applied
// via ctx.globalAlpha at stamp time (see drawNode), which reproduces the
// original gradient's composited result exactly (source-alpha × globalAlpha
// is how canvas already composites a gradient fill against whatever
// globalAlpha happens to be active). isCore changes the ORIGINAL gradient's
// inner-start-radius (createRadialGradient's r0 = er*0.5, expressed as a
// FRACTION of bloomR = er*bloomMult, and bloomMult itself differs for core
// via CORE_GLOW_RADIUS_MULT) — not just a uniform scale — so core needs its
// own sprite variant, not just a brighter/bigger draw of the same one.
const bloomHazeSpriteCache = new Map<string, HTMLCanvasElement>();
function getBloomHazeSprite(glowColor: string, isCoreNode: boolean): HTMLCanvasElement {
  const key = `${glowColor}|${isCoreNode ? 'core' : 'std'}`;
  let sprite = bloomHazeSpriteCache.get(key);
  if (!sprite) {
    const bloomMult = 2.8 * (isCoreNode ? CORE_GLOW_RADIUS_MULT : 1);
    const innerFraction = 0.5 / bloomMult; // matches the original createRadialGradient(..., er*0.5, ..., bloomR) ratio
    sprite = buildGlowSprite(grad => {
      grad.addColorStop(0,   glowColor.replace('0.7)', '1)'));
      grad.addColorStop(0.5, glowColor.replace('0.7)', `${(0.07 / 0.22).toFixed(4)})`));
      grad.addColorStop(1,   glowColor.replace('0.7)', '0)'));
    }, innerFraction);
    bloomHazeSpriteCache.set(key, sprite);
  }
  return sprite;
}

function computeZoomFade(globalScale: number, influenceScore: number): number {
  if (globalScale >= FADE_ZOOM_IN) return 1;
  if (globalScale <= FADE_ZOOM_OUT) return 0;
  const maxShift = FADE_ZOOM_IN - FADE_ZOOM_OUT - 0.01; // keep fadeStart above FADE_ZOOM_OUT
  const hubShift = Math.min(FADE_HUB_BIAS_STRENGTH * Math.sqrt(influenceScore), maxShift);
  const fadeStart = FADE_ZOOM_IN - hubShift;
  if (globalScale >= fadeStart) return 1;
  return (globalScale - FADE_ZOOM_OUT) / (fadeStart - FADE_ZOOM_OUT);
}

// Photos/labels fully gone at/below this zoom — deliberately its OWN
// threshold and its OWN unbiased curve (computePhotoLabelFade below), not
// zoomFade/computeZoomFade above. computeZoomFade's hub bias shifts a high-
// influenceScore node's fade-start close to FADE_ZOOM_OUT (so ITS DOT lingers
// longest, which is intended) — but wantsPhoto only ever applies to exactly
// those high-score nodes, so reusing that same biased curve for photos let
// the highest-score nodes' photos/labels linger too, showing up right at
// load (e.g. zoom ~2.55) instead of being fully gone. Shares FADE_ZOOM_IN as
// the top end, so "full photos/names at detail zoom" stays a single source
// of truth.
const PHOTO_LABEL_FADE_OUT_ZOOM = 2.8;

function computePhotoLabelFade(globalScale: number): number {
  if (globalScale >= FADE_ZOOM_IN) return 1;
  if (globalScale <= PHOTO_LABEL_FADE_OUT_ZOOM) return 0;
  return (globalScale - PHOTO_LABEL_FADE_OUT_ZOOM) / (FADE_ZOOM_IN - PHOTO_LABEL_FADE_OUT_ZOOM);
}

// ── Per-node nebula glow (P3 of the zoom-based cloud/detail reveal) ────────
// Replaces an earlier approach that drew one circular radial-gradient "blob"
// per realm at that realm's centroid — it read as a clean lamp, not a
// nebula, because a real scatter of nodes is never a circle. Instead, EVERY
// realm-tagged node draws its own soft glow at its own position, additively
// blended ('lighter'): dense clumps sum into bright solid mass, sparse edges
// trail off wispy, and the aggregate shape follows the actual (irregular)
// footprint of that realm's node scatter. Drawn in onRenderFramePre, the
// only hook that fires before links/nodes are painted, so every glow sits
// fully behind them. Same cloudFade/isFocusModeActive gating as before.
//
// The crisp colored dots (see CLOUD_DOT_* above) are the main content at
// cloud zoom now — clouds recede to a subtle atmospheric backdrop giving
// depth/region-identity, not competing for attention. One multiplier
// applied to every realm's peak alpha (region-one/electronic/core alike) at
// the point of use below, rather than hand-editing three separate constants.
const CLOUD_BACKDROP_INTENSITY = 0.08;

// ── Near-black background wash (cloud zoom only) ────────────────────────────
// The page behind the (transparent) canvas has its own lighter radial
// gradient (see app/globals.css --color-bg-lift) — fine for detail
// zoom/focus, but against a starfield reference the overview needs to read
// as near-black no matter what's showing through underneath. Painted first
// in handleRenderFramePre, in raw screen space (transform reset, so it
// covers the full canvas regardless of current pan/zoom), faded by the same
// cloudFade as everything else so it recedes back to the normal page
// background by FADE_ZOOM_IN — detail zoom/focus never see this at all.
const OVERVIEW_BG_WASH_COLOR = '6, 5, 14'; // near-black deep navy, r/g/b only — alpha appended at draw time
const OVERVIEW_BG_WASH_MAX_ALPHA = 0.92;

// ── Decorative dust starfield (cloud zoom only) ─────────────────────────────
// ~106 real artist nodes can't fill a "hundreds of tiny stars" starfield on
// their own. This is pure decoration — static positions, no click/hover/
// label, not part of stableData/GraphNode at all — generated once and
// scattered with jitter around each realm's existing home cluster (reusing
// computeRealmHomePositions/REALM_RADIUS_X/Y, so density already follows the
// real realm regions without any separate placement logic). Drawn as plain
// filled circles (no gradient/sprite — hundreds of tiny dots is already
// cheap without one) between the background wash and the nebula/real nodes,
// faded by the same cloudFade so they recede on zoom-in like everything
// else at cloud zoom.
const DUST_STAR_COUNT = 450;
const DUST_STAR_MIN_R = 0.4;             // world units
const DUST_STAR_MAX_R = 1.3;             // world units
const DUST_STAR_MIN_ALPHA = 0.06;
const DUST_STAR_MAX_ALPHA = 0.55;
const DUST_STAR_TINT_FRACTION = 0.12;    // fraction of stars given a faint realm tint instead of pale white
const DUST_STAR_CLUSTER_SPREAD = 1.6;    // × realm ellipse radius — how far dust scatters from its realm's home position
const DUST_STAR_PALE_COLOR = '#F4F2FF';  // most stars — pale white/lavender, not realm-colored
const DUST_STAR_ELECTRONIC_TINT = '#C77DD1'; // representative electronic tint for the rare tinted dust star (krautrock hex from LINEAGE_COLORS)
const DUST_STAR_FOLK_TINT = '#8CAA52'; // representative folk tint for the rare tinted dust star (freak-folk hex from FOLK_LINEAGE_COLORS)
const DUST_STAR_EMO_TINT = '#B02E2E'; // representative emo tint for the rare tinted dust star (post-hardcore hex from EMO_LINEAGE_COLORS)
const DUST_STAR_POSTROCK_TINT = '#6B3FA0'; // representative post-rock tint for the rare tinted dust star (post-rock hex from POSTROCK_LINEAGE_COLORS)
const DUST_STAR_AMERICAN_UNDERGROUND_TINT = '#B85C2E'; // representative american-underground tint for the rare tinted dust star (college-rock hex from AMERICAN_UNDERGROUND_LINEAGE_COLORS)

interface DustStar {
  x: number;
  y: number;
  r: number;
  alpha: number;
  color: string;
}

// hex '#RRGGBB' -> 'rgba(r, g, b, alpha)' — this file has no existing
// hex->rgba helper (lib/colors.ts has an equivalent but it's private), and
// the region-one glow below needs a color that ISN'T sourced from the
// per-layer palette (unlike electronic/core) — it's a new glow-only tone, so
// the tunable hex constant needs to stay the single source of truth for its
// derived glow string rather than a second hand-maintained value.
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Draws one soft radial glow at (x, y): peak alpha at center, fading to
// fully transparent at the edge — no hard rim. Shared by region-one (one
// flat color for the whole region) and electronic (each node's own real
// lineage color) below; core uses its own hotter addCoreGradientStops curve
// instead (see further down). Uses the cached 2-stop sprite (see the perf
// section above) instead of building a fresh gradient every call — this ran
// for every realm-tagged node, every frame, and was a primary source of lag.
function drawNodeGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number,
  glowColor: string, peakAlpha: number,
): void {
  stampGlowSprite(ctx, get2StopGlowSprite(glowColor), x, y, radius, peakAlpha);
}

// ── Region-one — one flat color for the whole region (region-one nodes
// still color individually by their own `layer` field elsewhere, unchanged;
// this glow is deliberately NOT a per-node/per-layer read — see the report
// for why: no dedicated realm color or lineage field to draw from, and an
// earlier task explicitly ruled out a multi-colored region-one cloud).
//
// Soft cool periwinkle/violet-blue, deliberately distinct from the gold core
// and magenta electronic glow — tune the hex by eye.
const REGION_ONE_CLOUD_COLOR = '#8A9CE0';
const REGION_ONE_CLOUD_GLOW = hexToRgba(REGION_ONE_CLOUD_COLOR, 0.7); // same "0.7)" suffix convention drawNodeGlow expects

// Region-one/electronic kept as matched peers — own named constants, not a
// shared reference, so each can still be tuned independently. Raised from
// 40/0.16: region-one's sparser edge nodes (nearer the core, e.g. Bowie,
// Talking Heads) sat too far apart for their glows to merge into the dense
// left side's continuous mass, leaving them uncovered. Watch for bleed into
// core/electronic if pushed much higher — core sits closest, at the
// ellipse's center.
const REGION_ONE_NODE_GLOW_RADIUS = 60; // px — bigger than a node's own drawn radius, so neighbors' glows overlap and merge
// Cut to ~1/3 of 0.22 — at this radius/density, dozens of overlapping
// 'lighter'-composited glows were summing past 1.0 and clipping to pure
// white at cluster centers instead of reading as a dim, colored haze.
const REGION_ONE_NODE_GLOW_PEAK_ALPHA = 0.16; // low per-node — density (many overlapping glows) is what builds brightness, not any single node

// ── Electronic — each node's own real lineage color via resolveNodeGlow
// (same source the old "ghost hub" nodes already used; now every electronic
// node gets this, not just the top few by influenceScore). Matched to
// region-one's bump above.
const ELECTRONIC_NODE_GLOW_RADIUS = 60;
const ELECTRONIC_NODE_GLOW_PEAK_ALPHA = 0.16; // matched to region-one above

// ── Folk & Confessional — each node's own real lineage color via
// resolveNodeGlow, same per-node-color pattern as electronic (folk has 5
// sub-lineages like electronic's 8, unlike region-one's single flat color).
// Matched to region-one/electronic's values as a starting point.
const FOLK_NODE_GLOW_RADIUS = 60;
const FOLK_NODE_GLOW_PEAK_ALPHA = 0.16;

// ── Emo & Post-Hardcore — each node's own real lineage color via
// resolveNodeGlow, same per-node-color pattern as electronic/folk (4
// sub-lineages). Matched to the other realm glows as a starting point.
const EMO_NODE_GLOW_RADIUS = 60;
const EMO_NODE_GLOW_PEAK_ALPHA = 0.16;

// ── Post-Rock, Drone & Noise — each node's own real lineage color via
// resolveNodeGlow, same per-node-color pattern as electronic/folk/emo (3
// sub-lineages). Matched to the other realm glows as a starting point.
const POSTROCK_NODE_GLOW_RADIUS = 60;
const POSTROCK_NODE_GLOW_PEAK_ALPHA = 0.16;

// ── American Underground — each node's own real lineage color via
// resolveNodeGlow, same per-node-color pattern as electronic/folk/emo/
// post-rock above (3 sub-lineages). Matched to the other realm glows as a
// starting point.
const AMERICAN_UNDERGROUND_NODE_GLOW_RADIUS = 60;
const AMERICAN_UNDERGROUND_NODE_GLOW_PEAK_ALPHA = 0.16;

// ── Core — hot gold, brighter/tighter than the realm glows above so the
// merged knot still blazes hottest. Reuses the smooth falloff curve below
// (already tuned for a continuous, non-plateaued center-to-edge falloff)
// per node instead of per realm-centroid.
//
// alpha(t) = peakAlpha * (1 - t)^power, t = normalized distance from center
// (0 at the very center, 1 at the glow's own edge) — strictly decreasing at
// every point starting at t=0, so no flat "disc" segment. >1 = gaussian-like:
// steep near the center, gentle near the edge.
const CORE_CLOUD_FALLOFF_POWER = 2.2;
const CORE_CLOUD_STOP_COUNT = 8; // sampled stops approximating the curve — more = smoother

// Gold as separate RGB channels — matches lib/colors.ts's CORE_COLOR
// ('#E8C87A', i.e. resolveNodeColor({realm:'core',...})).
const CORE_GOLD_RGB: [number, number, number] = [232, 200, 122];

// Larger and brighter per-node than the realm glows — only 5 core nodes,
// clustered tightly by CORE_PULL_STRENGTH, so each needs real presence to
// merge into one bright knot rather than 5 separate dots. Cut to ~1/3 of
// 0.55 for the same reason as the realm glows above — 5 overlapping glows
// this size/alpha were clipping the knot's center to pure white.
const CORE_NODE_GLOW_RADIUS = 90;
const CORE_NODE_GLOW_PEAK_ALPHA = 0.30;

// Flat gold at every stop — no white-hot center blend. A near-white center,
// additively composited across the core's several overlapping node glows,
// was exactly the kind of blown-out bright center this backdrop must never
// produce; it should read as a dim, dark-toned gold haze, not a glowing
// lamp. Alpha still falls off smoothly via addCoreGradientStops below —
// only the color itself no longer brightens toward white near the center.
function coreStopColor(): string {
  const [r, g, b] = CORE_GOLD_RGB;
  return `${r}, ${g}, ${b}`;
}

function addCoreGradientStops(grad: CanvasGradient, peakAlpha: number): void {
  for (let i = 0; i <= CORE_CLOUD_STOP_COUNT; i++) {
    const t = i / CORE_CLOUD_STOP_COUNT;
    const alpha = (peakAlpha * Math.pow(1 - t, CORE_CLOUD_FALLOFF_POWER)).toFixed(3);
    grad.addColorStop(t, `rgba(${coreStopColor()}, ${alpha})`);
  }
}

// Single cached sprite (only one shape/color combination exists for core) —
// addCoreGradientStops already parameterizes stops as fractions of the
// gradient's own radius, so building it once at peakAlpha=1 as the
// reference and applying the real peak via globalAlpha at stamp time
// reproduces the original per-call gradient exactly.
let coreNebulaSprite: HTMLCanvasElement | null = null;
function drawCoreNodeGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, peakAlpha: number): void {
  if (!coreNebulaSprite) {
    coreNebulaSprite = buildGlowSprite(grad => addCoreGradientStops(grad, 1));
  }
  stampGlowSprite(ctx, coreNebulaSprite, x, y, radius, peakAlpha);
}

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
  // True while an /artist/[slug] page overlay is covering the graph — see
  // app/(graph)/layout.tsx, which keeps this component mounted underneath
  // that overlay rather than unmounting it. The canvas is fully hidden in
  // that state, so there's nothing to gain from redrawing it every frame;
  // see the autoPauseRedraw prop below. Defaults to false (never
  // backgrounded) so every existing caller is unaffected if it doesn't
  // pass this prop.
  isBackgrounded?: boolean;
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
  score: number;        // influenceScore — breaks ties when two forced labels collide (see forced below)
  forced: boolean;      // alwaysLabel tier (hub/anchor) — persistent regardless of hover/focus; see the demotion logic in onRenderFramePost
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
  isBackgrounded = false,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Dev zoom readout — see SHOW_ZOOM_READOUT above. Written directly (no
  // setState) so the per-frame update never triggers a React re-render.
  const zoomReadoutRef = useRef<HTMLDivElement>(null);
  // Live globalScale, refreshed every frame in handleRenderFramePre (which
  // fires before arrows paint) — linkDirectionalArrowColor below needs the
  // current zoom to fade arrows the same way drawLink fades edge lines, but
  // that accessor is a plain per-link callback with no globalScale argument.
  const currentGlobalScaleRef = useRef(1);
  // Null until ResizeObserver fires — ForceGraph2D is not rendered before then,
  // which prevents the hardcoded-default → real-size bounce that resets d3-zoom
  // and jams nodes at the canvas origin on every navigation-back.
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // [min, max] passed straight through as <ForceGraph2D minZoom maxZoom>
  // props — see the SCROLL_MIN_ZOOM comment above for why this has to be
  // state (declarative props) rather than a graphRef method call, and
  // applyCameraFocusForCluster/animateClusterIntoView for the bail-and-retry
  // this requires to keep a widen ordered before the zoom() that needs it.
  const [scrollZoomBounds, setScrollZoomBounds] = useState<[number, number]>(CLAMPED_BOUNDS);
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
  // Pending "re-engage the scroll clamp" timeout from the last defocus —
  // cancelled if a new focus supersedes it before it fires (see
  // applyCameraFocusForCluster/animateClusterIntoView).
  const zoomClampRestoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // The ~ANCHOR_COUNT highest-influenceScore nodes globally — the only ones
  // that stay visible (as small "star" anchors + a label) at cloud zoom; see
  // drawNode. Computed once here, not per-frame/per-node.
  const topAnchorIds = useMemo(() => {
    const ranked = [...stableData.nodes].sort(
      (a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0),
    );
    return new Set(ranked.slice(0, ANCHOR_COUNT).map(n => n.id));
  }, [stableData.nodes]);

  // ── Decorative dust starfield (see DUST_STAR_* above) ───────────────────────
  // Generated once from the same realm home positions the real layout
  // already settled around (computeRealmHomePositions) — jittered scatter
  // per realm, not a separate placement system. Pure decoration: never
  // touched by click/hover/label/highlight logic, not part of GraphNode.
  const dustStars = useMemo<DustStar[]>(() => {
    const homePositions = [...computeRealmHomePositions(stableData.nodes).entries()];
    if (homePositions.length === 0) return [];

    const tintForRealm = (realm: string): string => {
      if (realm === 'core') return `rgb(${CORE_GOLD_RGB.join(', ')})`;
      if (realm === 'region-one') return REGION_ONE_CLOUD_COLOR;
      if (realm === 'folk-confessional') return DUST_STAR_FOLK_TINT;
      if (realm === 'emo-posthardcore') return DUST_STAR_EMO_TINT;
      if (realm === 'post-rock-drone-noise') return DUST_STAR_POSTROCK_TINT;
      if (realm === 'american-underground') return DUST_STAR_AMERICAN_UNDERGROUND_TINT;
      return DUST_STAR_ELECTRONIC_TINT;
    };

    const stars: DustStar[] = [];
    for (let i = 0; i < DUST_STAR_COUNT; i++) {
      const [realm, home] = homePositions[Math.floor(Math.random() * homePositions.length)];
      // Sum of 3 uniforms — a cheap triangular spread favoring the cluster
      // center over a flat uniform scatter, without pulling in a real
      // gaussian helper for a decorative effect.
      const jitterX = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const jitterY = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      stars.push({
        x: home.x + jitterX * REALM_RADIUS_X * DUST_STAR_CLUSTER_SPREAD,
        y: home.y + jitterY * REALM_RADIUS_Y * DUST_STAR_CLUSTER_SPREAD,
        r: DUST_STAR_MIN_R + Math.random() * (DUST_STAR_MAX_R - DUST_STAR_MIN_R),
        alpha: DUST_STAR_MIN_ALPHA + Math.random() * (DUST_STAR_MAX_ALPHA - DUST_STAR_MIN_ALPHA),
        color: Math.random() < DUST_STAR_TINT_FRACTION ? tintForRealm(realm) : DUST_STAR_PALE_COLOR,
      });
    }
    return stars;
  }, [stableData.nodes]);

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
    const realmHomePositions = computeRealmHomePositions(stableData.nodes);
    fg.d3Force('realmX', forceX<GraphNode>(makeRealmHomeX(realmHomePositions)).strength(realmPullStrengthX));
    fg.d3Force('realmY', forceY<GraphNode>(makeRealmHomeY(realmHomePositions)).strength(realmPullStrengthY));
    fg.d3VelocityDecay?.(0.38);
    // Reduced motion: converge in a couple dozen ticks instead of ~300 for
    // any future tick cycle (e.g. post-drag readjustment) that does run.
    if (prefersReducedMotionRef.current) fg.d3AlphaDecay?.(0.1);
  }, [dimensions]);

  // Scroll-zoom clamp starts at CLAMPED_BOUNDS (scrollZoomBounds' initial
  // state) and is passed straight to <ForceGraph2D minZoom maxZoom> below;
  // the focus camera (applyCameraFocusForCluster/animateClusterIntoView)
  // widens it for as long as a focus view is open and restores it on defocus.

  // Cancel any pending clamp-restore timeout on unmount.
  useEffect(() => {
    return () => {
      if (zoomClampRestoreTimerRef.current !== null) clearTimeout(zoomClampRestoreTimerRef.current);
    };
  }, []);

  // The single set of ids to spread + frame right now — see getActiveCluster.
  const { ids: activeClusterIds, key: activeClusterKey, spread: activeClusterSpread } = useMemo(
    () => getActiveCluster(selectedId, highlightSetIds, graphData.edges),
    [selectedId, highlightSetIds, graphData.edges],
  );

  // ── Spotlight spread ─────────────────────────────────────────────────────────
  // Pure: computes where spotlight-spread WOULD place each cluster node,
  // without mutating anything. null means the simulation hasn't positioned
  // the cluster's primary node (clusterIds[0]) yet; an empty map means
  // there's nothing to spread (0 or 1 node).
  const computeSpreadTargetsForCluster = useCallback((clusterIds: string[], shouldSpread: boolean): Map<string, { x: number; y: number }> | null => {
    if (clusterIds.length === 0) return new Map();

    const primary = stableData.nodes.find(n => n.id === clusterIds[0]);
    if (primary?.x === undefined || primary?.y === undefined) return null;

    // A genre/scene set: "ready" (primary is positioned) but nothing to
    // move — see getActiveCluster's `spread` comment for why. The camera-fit
    // step downstream then reads each node's untouched, natural position.
    if (!shouldSpread) return new Map();

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
  const applySpreadForCluster = useCallback((clusterIds: string[], shouldSpread: boolean): boolean => {
    // Always restore first — handles deselect, cluster-to-cluster switches,
    // and switching from a spread focus cluster to a non-spread genre/scene
    // set (whose own branch below never touches these nodes' positions).
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

    const targets = computeSpreadTargetsForCluster(clusterIds, shouldSpread);
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
    const ready = applySpreadForCluster(activeClusterIds, activeClusterSpread);
    pendingClusterKeyRef.current = ready ? null : activeClusterKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterKey, activeClusterSpread, dimensions, applySpreadForCluster]);

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
        // Re-engage the scroll clamp only once this zoom-out transition has
        // actually finished — restoring synchronously here would fight the
        // in-flight zoomToFit transition for the same d3-zoom scale.
        if (zoomClampRestoreTimerRef.current !== null) clearTimeout(zoomClampRestoreTimerRef.current);
        zoomClampRestoreTimerRef.current = setTimeout(() => {
          zoomClampRestoreTimerRef.current = null;
          setScrollZoomBounds(CLAMPED_BOUNDS);
        }, duration);
      }
      return true;
    }

    // Guard: skip if the cluster's primary node hasn't been placed by the simulation yet.
    const primary = stableData.nodes.find(n => n.id === clusterIds[0]);
    if (primary?.x === undefined || primary?.y === undefined) return false;

    const cameraTarget = computeCameraTargetForCluster(clusterIds, new Map());
    if (!cameraTarget) return true; // degenerate bounding box, nothing more to do

    // A focus view is opening — cancel any pending clamp-restore left over
    // from a just-superseded defocus.
    if (zoomClampRestoreTimerRef.current !== null) {
      clearTimeout(zoomClampRestoreTimerRef.current);
      zoomClampRestoreTimerRef.current = null;
    }
    // The scroll clamp must be widened before the zoom() call below (e.g.
    // Kraftwerk's neighbors need ~0.92, well under the 1.6 floor) — but
    // <ForceGraph2D>'s minZoom/maxZoom are declarative props (no imperative
    // setter is exposed on the ref — see the SCROLL_MIN_ZOOM comment), so a
    // state update here only takes effect on this component's NEXT render.
    // Request it and bail; this callback's identity changes when
    // scrollZoomBounds changes (it's a dep below), which re-fires the effect
    // that calls this function — by then the widened props have already
    // committed, since <ForceGraph2D> applies them during its own render,
    // which finishes before any passive effect of this same update runs.
    if (scrollZoomBounds[0] !== UNCLAMPED_MIN_ZOOM) {
      setScrollZoomBounds(UNCLAMPED_BOUNDS);
      return false;
    }

    // Step 1 — instant zoom (no d3-zoom transition → no conflict with step 2).
    fg.zoom(cameraTarget.targetZoom, 0);
    // Step 2 — animated pan to the panel-adjusted centre.
    fg.centerAt(cameraTarget.camX, cameraTarget.centerGY, duration);
    return true;
  }, [stableData.nodes, computeCameraTargetForCluster, scrollZoomBounds]);

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
  const animateClusterIntoView = useCallback((clusterIds: string[], shouldSpread: boolean): boolean => {
    const fg = graphRef.current;
    if (!fg) return false;
    if (clusterIds.length === 0) return true; // nothing to animate

    const computedTargets = computeSpreadTargetsForCluster(clusterIds, shouldSpread);
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
      // Composing into a focus view — cancel any pending clamp-restore left
      // over from a just-superseded defocus.
      if (zoomClampRestoreTimerRef.current !== null) {
        clearTimeout(zoomClampRestoreTimerRef.current);
        zoomClampRestoreTimerRef.current = null;
      }
      // Same bail-and-retry as applyCameraFocusForCluster above — the widen
      // must land on <ForceGraph2D>'s minZoom/maxZoom props (no imperative
      // setter exists) before zoom() below, which only happens on this
      // component's next render. Bailing here re-snapshots savedPositionsRef
      // on retry, which is harmless: nothing moves between this call and the
      // retry a render later.
      if (scrollZoomBounds[0] !== UNCLAMPED_MIN_ZOOM) {
        setScrollZoomBounds(UNCLAMPED_BOUNDS);
        return false;
      }
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
  }, [stableData.nodes, computeSpreadTargetsForCluster, computeCameraTargetForCluster, scrollZoomBounds]);

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
      if (animateClusterIntoView(activeClusterIds, activeClusterSpread)) pendingClusterKeyRef.current = null;
    }
  }, [activeClusterKey, activeClusterIds, activeClusterSpread, animateClusterIntoView, tryInitialFit]);

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
      // Zoom fade (P2, overview only) — forced to 1 whenever a focus view is
      // open (selectedId or a genre/scene set active), the same two-mode
      // split the scroll-zoom clamp above uses. See computeZoomFade/
      // FADE_ZOOM_OUT/FADE_ZOOM_IN/FADE_HUB_BIAS_STRENGTH.
      const isFocusModeActive = selectedId !== null || highlightSetMemberSet.size > 0;
      const zoomFade = isFocusModeActive ? 1 : computeZoomFade(globalScale, score);
      // One of the ~ANCHOR_COUNT highest-influenceScore nodes globally —
      // gates LABELS only now (see the label logic further down), not the
      // dot itself. Computed once in topAnchorIds (useMemo, alongside
      // stableData), not per-frame.
      const isAnchor = topAnchorIds.has(n.id);
      // Crisp cloud-zoom dot fade — 0 in focus mode or at/above FADE_ZOOM_IN
      // (detail zoom stays byte-for-byte the existing rendering below), 1 at
      // full cloud zoom. The exact complement of zoomFade (which drives the
      // existing bloom-haze/fill/photo path below): the two sum to 1 at
      // every zoom, so a node is never fully invisible in between — this is
      // what makes "dots resolve into full detailed nodes" a continuous
      // crossfade rather than a gap.
      const cloudDotFade = isFocusModeActive ? 0 : 1 - zoomFade;
      const dimFactor = isDimmed ? dimLevelRef.current : 1.0;
      // Photo/label fade — its own unbiased curve/threshold (see
      // PHOTO_LABEL_FADE_OUT_ZOOM/computePhotoLabelFade above), NOT zoomFade
      // — reaches exactly 0 at/below that threshold (photo dissolves fully;
      // labels show NONE, not a floored remnant).
      const photoLabelFade = isFocusModeActive ? 1 : computePhotoLabelFade(globalScale);
      const photoOpacity = dimFactor * photoLabelFade;
      // Base (detail-style) dot/glow alpha — reaches exactly 0 at
      // FADE_ZOOM_OUT, the exact complement of cloudDotFade above: at cloud
      // zoom this fades out as the crisp cloud-zoom dot (below) fades in,
      // and vice versa approaching detail zoom.
      const alpha = dimFactor * zoomFade;
      // Same zoomFade also SHRINKS the detail-style bloom/shadow/fill path's
      // own radius below (not just its opacity) — without this, a hub's
      // FADE_HUB_BIAS_STRENGTH head start meant its zoomFade (and therefore
      // alpha) was already 0.3-0.5 at cloud zoom while its drawn radius
      // stayed full-size, reading as a big, semi-transparent disc instead of
      // a small point resolving smoothly into the full node as you zoom in.
      const overviewSizeShrink = isFocusModeActive ? 1 : zoomFade;

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
      const erPhoto = Math.min(Math.max(r, minPhotoR), maxPhotoR);
      // Crossfades the node's own radius between its natural dot size and
      // the larger photo-clamped size, on photoOpacity — the point shrinks
      // to its normal (unshrunk) dot size as the photo dissolves. No
      // separate cloud-zoom size shrink anymore: a non-anchor's dot fades
      // to invisible via alpha alone (see above), and an anchor's cloud-zoom
      // size comes entirely from the star sprite's own sizing, not this.
      let er = showPhoto
        ? r + (erPhoto - r) * photoOpacity
        : r;
      // Zoom-size dampening (see ZOOM_SIZE_REFERENCE/DAMPEN above) — applied
      // BEFORE the click-focus floor just below, so the floor still
      // guarantees its own on-screen minimum regardless: dampening only
      // ever shrinks the "natural" size, it can't undercut the floor.
      // No-op (mult === 1) at/below ZOOM_SIZE_REFERENCE, i.e. everywhere the
      // cloud/overview rendering above actually runs.
      const zoomSizeMult = computeZoomSizeMult(globalScale);
      er *= zoomSizeMult;
      // Click-focus readability floor (see constants above) — additive, only
      // ever grows er further, never shrinks it below what the existing
      // logic above already produced.
      if (selectedId !== null && (isFocused || isNeighbor)) {
        const minScreenR = isFocused ? FOCUS_MIN_SCREEN_R : NEIGHBOR_MIN_SCREEN_R;
        er = Math.max(er, minScreenR / globalScale);
      }
      // Detail-style radius for the bloom/fill path just below ONLY — see
      // overviewSizeShrink's comment above. `er` itself stays unshrunk for
      // the photo/label/collision code further down, none of which is
      // visible at cloud zoom anyway (photoOpacity/label alpha are already
      // 0 there via their own thresholds).
      const erOverview = Math.max(er * overviewSizeShrink, 0.01);

      ctx.save();
      ctx.globalAlpha = alpha;

      // ── Outer bloom haze ──
      // alpha > 0.01 skips this entirely for the ~94 non-anchor nodes at
      // cloud zoom (alpha is now unfloored — see above — so it's genuinely
      // ~0 there): no sprite-stamp for something that would be invisible.
      if (!isDimmed && alpha > 0.01) {
        if (!isFocused && !isHovered) {
          // Resting case — nearly every node, nearly every frame. Cached
          // sprite instead of a fresh gradient (see getBloomHazeSprite's
          // comment/the perf report) — isFocused/isHovered fall through to
          // the original inline gradient below, which is at most 1-2 nodes
          // at a time and not worth caching.
          const bloomMult = 2.8 * (isCore ? CORE_GLOW_RADIUS_MULT : 1);
          const bloomR = erOverview * bloomMult;
          const innerAlpha = 0.22 * (isCore ? CORE_GLOW_INTENSITY : 1);
          stampGlowSprite(ctx, getBloomHazeSprite(glow, isCore), n.x, n.y, bloomR, Math.min(innerAlpha, 1) * alpha);
          ctx.globalAlpha = alpha; // restore — stampGlowSprite set it to the combined peak value above
        } else {
          const bloomMult = (isFocused ? 4.0 : 3.5) * (isCore ? CORE_GLOW_RADIUS_MULT : 1);
          const bloomR = erOverview * bloomMult;
          const innerAlpha = (isFocused ? 0.30 : 0.22) * (isCore ? CORE_GLOW_INTENSITY : 1);
          const midAlpha = 0.07 * (isCore ? CORE_GLOW_INTENSITY : 1);
          const grad = ctx.createRadialGradient(n.x, n.y, erOverview * 0.5, n.x, n.y, bloomR);
          grad.addColorStop(0,    glow.replace('0.7)', `${Math.min(innerAlpha, 1)})`));
          grad.addColorStop(0.5,  glow.replace('0.7)', `${Math.min(midAlpha, 1)})`));
          grad.addColorStop(1,    glow.replace('0.7)', '0)'));
          ctx.beginPath();
          ctx.arc(n.x, n.y, bloomR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // ── Core shadow glow ──
      ctx.shadowBlur = (isFocused ? 32
                     : isHovered ? 22
                     : isInPath  ? 16
                     : score >= ALWAYS_LABEL_THRESHOLD ? 14
                     : 10) * (isCore ? CORE_GLOW_RADIUS_MULT : 1) * overviewSizeShrink;
      ctx.shadowColor = glow;

      // ── Node fill (becomes the colored ring when a photo is overlaid) ──
      ctx.beginPath();
      ctx.arc(n.x, n.y, erOverview, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Crisp cloud-zoom dot (every node — see CLOUD_DOT_* above) ───────────
      // A modest solid-colored core + a tight soft halo, crossfading against
      // the bloom-haze/fill/photo path above via cloudDotFade (the exact
      // complement of zoomFade). Both cached sprites (perf report) — no
      // shadowBlur, the halo sprite alone reads as "glowing" without the
      // extra cost. No twinkle/influence-boost (dropped — see the report):
      // a calm, uniform brightness reads as clean colored dots rather than
      // a busy or blown-out wash once applied to every node instead of 12.
      if (cloudDotFade > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Strong faint/bright variation by score — most nodes sit near the
        // floor (faint), hubs climb toward the ceiling (bright), instead of
        // every node reading at the same flat brightness.
        const scoreBrightness = Math.min(1, CLOUD_DOT_MIN_BRIGHTNESS_FRACTION + Math.sqrt(score) * CLOUD_DOT_BRIGHTNESS_GROWTH);
        const dotBrightness = CLOUD_DOT_BRIGHTNESS * scoreBrightness * cloudDotFade * dimFactor;

        // Flat min/max range, independent of baseR (see CLOUD_DOT_MIN_R's
        // comment above) — a tiny sharp point for most nodes, only growing
        // modestly for real hubs, never a big circle.
        const dotCoreR = Math.min(CLOUD_DOT_MAX_R, CLOUD_DOT_MIN_R + Math.sqrt(score) * CLOUD_DOT_HUB_GROWTH);

        // Soft bloom halo reserved for hubs/anchors — most nodes are a bare
        // sharp point, matching the reference's "few bright, many faint".
        if (score >= CLOUD_DOT_HALO_MIN_SCORE || isAnchor) {
          const haloR = dotCoreR * CLOUD_DOT_GLOW_TIGHTNESS;
          // Halo stays additive — that's what makes it read as glowing light.
          stampGlowSprite(ctx, get2StopGlowSprite(glow), n.x, n.y, haloR, CLOUD_DOT_GLOW_INTENSITY * dotBrightness);
        }
        // Core switches to normal blending — additive was stacking with the
        // halo above AND the nebula glow underneath, which for any node
        // whose real color is already near-white (layer 'outside', e.g.
        // Bowie — #EDEBF5, by design close to white) accumulated into a
        // genuinely blown-out glowing orb, the harshest thing on screen.
        // Normal blending shows the node's TRUE color at a fixed opacity —
        // it can't stack brighter than that regardless of what's underneath.
        ctx.globalCompositeOperation = 'source-over';
        stampGlowSprite(ctx, getSolidCircleSprite(color), n.x, n.y, dotCoreR, dotBrightness);

        ctx.restore();
      }

      // ── Photo clip + glowing ring ─────────────────────────────────────────
      if (showPhoto) {
        // Photo's own alpha — fades fully to 0 by FADE_ZOOM_OUT, dissolving
        // into the fill circle already drawn above at the floored `alpha`.
        ctx.globalAlpha = photoOpacity;
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
        ctx.globalAlpha = alpha; // restore to the (floored) dot alpha for anything drawn after

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
      // Tier 1 — always-on: hub landmarks (score ≥ threshold, OR one of the
      // anchors regardless of raw score — in practice the top ANCHOR_COUNT
      // are almost certainly already above the threshold, but this makes it
      // exact rather than assumed), never when dimmed
      // Tier 2 — hover: the hovered node only
      // Tier 3 — focus: the focused node + every direct neighbor
      const alwaysLabel = (isAnchor || score >= ALWAYS_LABEL_THRESHOLD) && !isDimmed;
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
        // Zoom-size dampening (see ZOOM_SIZE_REFERENCE/DAMPEN above) — same
        // rationale/ordering as er's above: applied before the click-focus
        // floor so the floor's own guaranteed on-screen minimum still holds.
        fontSize *= zoomSizeMult;
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
        // Anchors use dimFactor (never fades with zoom, only with dimming —
        // an anchor's name must stay legible at cloud zoom, that's the whole
        // point). Everyone else keeps photoOpacity, which already correctly
        // fades non-anchor labels to true 0 by cloud zoom and back to full
        // by detail zoom — outside the cloud-zoom band the two are identical
        // anyway (photoLabelFade reaches 1 there), so this only changes
        // anything exactly where it needs to.
        // "forced" = shown purely via the persistent hub/anchor tier, at
        // rest — NOT because the user is actively focused/hovering/pathing
        // it. Only this tier is eligible for the collision demotion in
        // onRenderFramePost: hiding a label the user is directly engaging
        // with (their click-focus, a hover, a path node) would be worse
        // than the rare overlap, so those keep the old accept-overlap
        // fallback regardless of this flag.
        const forced = alwaysLabel && !isFocused && !isNeighbor && !isHovered && !isInPath && !isSetMember;
        labelQueueRef.current.push({
          name: n.name, nx: n.x, ny: n.y, er,
          fontSize, bright, alpha: isAnchor ? dimFactor : photoOpacity,
          score, forced,
          radialFromX: useRadial ? focusedNode!.x : undefined,
          radialFromY: useRadial ? focusedNode!.y : undefined,
        });
      }

      // Register every node's circle so onRenderFramePost can avoid ALL photos
      // when placing labels — including nodes drawn after a label was queued.
      nodeCirclesRef.current.push({ x: n.x, y: n.y, r: er + 2 });

      ctx.restore();
    },
    [selectedId, hoveredId, pathSet, neighborSet, focusedNode, highlightSetMemberSet, topAnchorIds],
  );

  // ── Edge drawing ────────────────────────────────────────────────────────────
  const drawLink = useCallback(
    (link: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
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
      // Set edges: BOTH endpoints must be genre/scene set members — an edge
      // out to a non-member (a different realm, a different genre entirely)
      // is real but not part of what the set is showing, and drawing it
      // anyway is what made a genre filter look like noise rather than a
      // lineage: filtering to shoegaze (18 members) used to draw every edge
      // touching any of them, including ones shooting off to unrelated
      // artists in other realms — around 250 edges for a set that only has
      // a few dozen genuinely internal to it.
      const isSetEdge    = highlightSetMemberSet.size > 0 &&
                           (highlightSetMemberSet.has(srcId) && highlightSetMemberSet.has(tgtId));
      // Core-touching edge — the "galaxy arms" radiating from the blazing
      // center to each realm cloud. Every real node already carries a realm
      // (backfilled in seed-data.ts), so this is a direct comparison, no
      // extra lookup. Deliberately not a "cross-realm bridge" check — any
      // edge touching core qualifies, including a core↔core edge; anything
      // NOT touching core (within-realm, or a cross-realm edge between two
      // non-core realms) does not, no matter how significant its endpoints.
      const isCoreEdge = (srcNode as GraphNode).realm === 'core' || (tgtNode as GraphNode).realm === 'core';
      const edgeColor    = resolveEdgeTint(srcNode as GraphNode);
      const glow         = edgeGlowLevelRef.current;

      // Zoom fade (P2/P3 coupling) — same two-mode split and same unbiased
      // reference curve the electronic cloud uses (no per-endpoint hub bias
      // for edges). Forced to 1 whenever a focus view is open so focused-
      // cluster edges (and every other edge — the whole graph, same as
      // drawNode) stay solid regardless of zoom.
      const isFocusModeActive = selectedId !== null || highlightSetMemberSet.size > 0;
      const edgeFade = isFocusModeActive ? 1 : computeZoomFade(globalScale, 0);

      ctx.save();

      if (isPathEdge) {
        // Chromatic aberration for path-finding mode
        const offsets = [
          { dx: -1, color: `rgba(255, 30, 90, ${(0.9 * edgeFade).toFixed(3)})` },
          { dx:  0, color: `rgba(242, 168, 196, ${(0.9 * edgeFade).toFixed(3)})` },
          { dx:  1, color: `rgba(0, 200, 255, ${(0.9 * edgeFade).toFixed(3)})` },
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
        ctx.globalAlpha = (EDGE_IDLE_ALPHA + (0.82 - EDGE_IDLE_ALPHA) * glow) * edgeFade;
        ctx.lineWidth = EDGE_IDLE_WIDTH + (2 - EDGE_IDLE_WIDTH) * glow;
        ctx.setLineDash([]);
        ctx.stroke();
      } else if (isHoverEdge) {
        // Brightened tint on hover (no aberration), same fade-up as focus edges.
        const alpha = (EDGE_IDLE_ALPHA + (0.75 - EDGE_IDLE_ALPHA) * glow) * edgeFade;
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
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${(0.7 * edgeFade).toFixed(3)})`);
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else if (isCoreEdge && edgeFade < 1) {
        // `edgeFade < 1` makes cloud-zoom-only a STRUCTURAL gate, not just a
        // formula that happens to converge with idle at edgeFade===1 (the
        // previous fix only corrected the formula, which was fragile — any
        // future retune of either alpha constant could silently reintroduce
        // a detail-zoom mismatch). At full detail zoom or in focus mode
        // (edgeFade forced to 1) this branch is skipped entirely and falls
        // through to the plain idle branch below — one source of truth for
        // "what a normal edge looks like."
        // Faint glowing thread — a "galaxy arm" radiating from the blazing
        // core out to a realm cloud (or, for a core↔core edge, within the
        // core knot itself), so the clouds read as one connected structure
        // at cloud zoom instead of floating unlinked. Only core-touching
        // edges reach this branch — see isCoreEdge above for why that's the
        // rule (not "any cross-realm bridge") — a few clean arms, not a
        // crisscross. Same floor pattern as the dot's DOT_OPACITY_AT_CLOUD_
        // ZOOM: never reaches 0 like the idle branch below does. Glow is
        // strongest at cloud zoom and fades to exactly 0 by FADE_ZOOM_IN, so
        // by full detail this looks identical to any other idle edge —
        // geometry and width never change, only alpha/glow do.
        // Target is EDGE_IDLE_ALPHA (the idle branch's own resting alpha),
        // NOT 1 — interpolating to 1 made every core-touching edge render
        // fully opaque at detail zoom instead of receding to the same calm
        // idle look every other edge gets by FADE_ZOOM_IN, contradicting
        // the "looks identical to any other idle edge" comment just above.
        const coreEdgeAlpha = CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM + (EDGE_IDLE_ALPHA - CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM) * edgeFade;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${coreEdgeAlpha.toFixed(3)})`);
        ctx.lineWidth = EDGE_IDLE_WIDTH;
        ctx.shadowColor = edgeColor.replace(/[\d.]+\)$/, '1)');
        ctx.shadowBlur = CORE_EDGE_THREAD_GLOW_BLUR * (1 - edgeFade);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idle / non-highlighted edges recede into a soft faint web at all
        // times — whether nothing is selected, or something else is
        // focused — so the graph never reads as a scribble of crossing
        // lines. Only the edges above (focus/hover/set/path/core) rise
        // above this baseline. Every within-realm edge lands here, plus
        // every cross-realm edge that doesn't touch core (see isCoreEdge
        // above). Same floor pattern as the core-edge branch, just a much
        // lower floor (IDLE_EDGE_ALPHA_AT_CLOUD_ZOOM) — without it these
        // vanished entirely at cloud zoom, leaving only the core's few
        // "arms" and making everything else look like unconnected scattered
        // dots. Still fully recedes to the plain idle look by FADE_ZOOM_IN.
        const idleEdgeAlpha = IDLE_EDGE_ALPHA_AT_CLOUD_ZOOM + (EDGE_IDLE_ALPHA - IDLE_EDGE_ALPHA_AT_CLOUD_ZOOM) * edgeFade;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${idleEdgeAlpha.toFixed(3)})`);
        ctx.lineWidth = EDGE_IDLE_WIDTH;
        ctx.stroke();
      }

      ctx.restore();
    },
    [selectedId, hoveredId, pathEdges, focusedNode, highlightSetMemberSet],
  );

  // ── Realm cloud (electronic only, overview only) ────────────────────────
  // Fires before links/nodes are painted (see the CLOUD_* constants above),
  // so everything drawn here sits fully behind them.
  const handleRenderFramePre = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Unconditional, before any early return below — linkDirectionalArrowColor
    // reads this every frame regardless of focus/zoom state (see its own gate).
    currentGlobalScaleRef.current = globalScale;

    const isFocusModeActive = selectedId !== null || highlightSetMemberSet.size > 0;
    if (isFocusModeActive) return; // focus nodes stay solid — no clouds, per the two-mode split

    // Inverse of the P2 node fade, reusing the exact same constants/function
    // so cloud-in and nodes-out are perfectly complementary (sum to 1 at every
    // zoom) — no gap, no overlap-mush. Uses the unbiased reference curve
    // (score 0): individual nodes fade at their own hub-biased rate, but
    // there's no single "the nodes' " curve to invert otherwise.
    const cloudFade = 1 - computeZoomFade(globalScale, 0);
    if (cloudFade <= 0) return; // zoom >= FADE_ZOOM_IN — draw nothing, not just zero-alpha

    // ── Near-black background wash ──
    // Raw screen space (transform reset) so this covers the full canvas
    // regardless of current pan/zoom/DPR — see OVERVIEW_BG_WASH_* above.
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(${OVERVIEW_BG_WASH_COLOR}, ${(OVERVIEW_BG_WASH_MAX_ALPHA * cloudFade).toFixed(3)})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();

    // One shared additive context for every realm-tagged node's individual
    // glow — order between realms doesn't matter ('lighter' is commutative),
    // so core/region-one/electronic can all draw into the same save/restore.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // additive — overlapping glow brightens and merges, never washes out

    const cloudBackdropFade = cloudFade * CLOUD_BACKDROP_INTENSITY;
    for (const n of stableData.nodes) {
      if (n.x === undefined || n.y === undefined) continue;
      if (n.realm === 'core') {
        drawCoreNodeGlow(ctx, n.x, n.y, CORE_NODE_GLOW_RADIUS, CORE_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      } else if (n.realm === 'region-one') {
        drawNodeGlow(ctx, n.x, n.y, REGION_ONE_NODE_GLOW_RADIUS, REGION_ONE_CLOUD_GLOW, REGION_ONE_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      } else if (n.realm === 'electronic') {
        // Each node's own real lineage color — same source the old ghost
        // hubs used, now applied to every electronic node, not just the
        // top few by influenceScore.
        drawNodeGlow(ctx, n.x, n.y, ELECTRONIC_NODE_GLOW_RADIUS, resolveNodeGlow(n), ELECTRONIC_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      } else if (n.realm === 'folk-confessional') {
        // Same per-node-own-lineage-color pattern as electronic above.
        drawNodeGlow(ctx, n.x, n.y, FOLK_NODE_GLOW_RADIUS, resolveNodeGlow(n), FOLK_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      } else if (n.realm === 'emo-posthardcore') {
        // Same per-node-own-lineage-color pattern as electronic/folk above.
        drawNodeGlow(ctx, n.x, n.y, EMO_NODE_GLOW_RADIUS, resolveNodeGlow(n), EMO_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      } else if (n.realm === 'post-rock-drone-noise') {
        // Same per-node-own-lineage-color pattern as electronic/folk/emo above.
        drawNodeGlow(ctx, n.x, n.y, POSTROCK_NODE_GLOW_RADIUS, resolveNodeGlow(n), POSTROCK_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      } else if (n.realm === 'american-underground') {
        // Same per-node-own-lineage-color pattern as electronic/folk/emo/post-rock above.
        drawNodeGlow(ctx, n.x, n.y, AMERICAN_UNDERGROUND_NODE_GLOW_RADIUS, resolveNodeGlow(n), AMERICAN_UNDERGROUND_NODE_GLOW_PEAK_ALPHA * cloudBackdropFade);
      }
    }

    ctx.restore();

    // ── Decorative dust starfield ──
    // Drawn after the nebula (in front of it) but before links/nodes are
    // painted (this whole hook fires pre-paint) — see DUST_STAR_* above.
    // Plain filled circles, no composite/gradient: hundreds of these need to
    // stay cheap, and "sharp tiny point" doesn't want a soft sprite anyway.
    ctx.save();
    const dustFade = cloudFade; // fades out on zoom-in alongside everything else at cloud zoom
    for (const star of dustStars) {
      ctx.globalAlpha = star.alpha * dustFade;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();
    }
    ctx.restore();
  }, [stableData.nodes, dustStars, selectedId, highlightSetMemberSet]);

  // ── Deferred label placement + rendering ─────────────────────────────────
  // Called after every node has been drawn — nodeCirclesRef holds ALL circles.
  // Labels are placed here (not in drawNode) so collision detection against
  // node photos is complete before any label position is committed.
  const handleRenderFramePost = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (SHOW_ZOOM_READOUT && zoomReadoutRef.current) {
      zoomReadoutRef.current.textContent = `zoom ${globalScale.toFixed(2)}`;
    }

    const candidates = labelQueueRef.current;
    if (!candidates.length) return;

    const circles    = nodeCirclesRef.current; // all nodes drawn this frame
    const labelRects: [number, number, number, number][] = [];

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Forced (persistent hub/anchor) labels get first pick of placement,
    // highest-influenceScore first — so when two forced labels contest the
    // same space, the higher-score one always wins and the lower-score one
    // is the one left to demote (see the !placed branch below). Non-forced
    // (focus/hover/path) candidates are processed after, in whatever order
    // they were queued — there are at most a couple of those at once and
    // they never lose a spot they can reach.
    const orderedCandidates = [...candidates].sort(
      (a, b) => Number(b.forced) - Number(a.forced) || b.score - a.score,
    );

    for (const { name, nx, ny, er, fontSize, bright, alpha, forced, radialFromX, radialFromY } of orderedCandidates) {
      // Fully invisible at cloud zoom (photoOpacity floors to exactly 0 —
      // see drawNode) but was still running measureText/collision-avoidance/
      // shadowBlur/fillText for nothing every frame. Skip entirely — a
      // label this faint contributes zero visible pixels either way.
      if (alpha < 0.01) continue;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textW = ctx.measureText(name).width;
      const textH = fontSize;
      const padH  = LABEL_CHIP_PAD_X;
      const padV  = LABEL_CHIP_PAD_Y;

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

      const MAX_BUMP_STEPS = LABEL_BUMP_MAX_STEPS;
      const BUMP_STRIDE     = textH * LABEL_BUMP_STRIDE_MULT;

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
        if (forced) {
          // Demote: this forced label couldn't find a clear spot near its
          // node — since forced candidates are processed highest-score
          // first (see orderedCandidates above), whatever it collided with
          // already had priority. Hide it entirely rather than draw two
          // forced labels overlapping.
          continue;
        }
        // Non-forced (focus/hover/path): rare and transient, and hiding the
        // thing the user is actively engaging with would be worse than a
        // little overlap — keep the old accept-the-overlap fallback.
        labelRects.push([
          lx - textW / 2 - padH, ly - textH / 2 - padV,
          textW + padH * 2,      textH + padV * 2,
        ]);
      }

      // Dark rounded chip behind the text (see LABEL_CHIP_* above) — same
      // rect placement already computed for collision avoidance, so the
      // chip always exactly matches what the search reasoned about.
      const textColor = bright
        ? `rgba(237,234,247,${(alpha * 0.92).toFixed(3)})`
        : `rgba(237,234,247,${(alpha * 0.6).toFixed(3)})`;

      // Scaled by alpha, not fixed — otherwise the chip stays at full
      // strength even once the glyph itself has faded to invisible, leaving
      // a dark smudge where a "no labels" cloud-zoom label used to be.
      ctx.fillStyle = `rgba(10, 8, 22, ${(alpha * LABEL_CHIP_MAX_ALPHA).toFixed(3)})`;
      drawRoundedRect(
        ctx,
        lx - textW / 2 - padH, ly - textH / 2 - padV,
        textW + padH * 2,      textH + padV * 2,
        LABEL_CHIP_RADIUS,
      );
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.fillText(name, lx, ly);
    }
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
      // Zoom-size dampening — must mirror drawNode's exactly (same formula,
      // same ordering before the floor below) or the clickable area drifts
      // out of sync with the shrunk visual circle at high zoom.
      er *= computeZoomSizeMult(globalScale);
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
      {SHOW_ZOOM_READOUT && (
        <div
          ref={zoomReadoutRef}
          aria-hidden
          style={{
            position: 'fixed',
            bottom: 8,
            left: 8,
            zIndex: 9999,
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.35)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          zoom —
        </div>
      )}
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
          minZoom={scrollZoomBounds[0]}
          maxZoom={scrollZoomBounds[1]}
          // Keeps the canvas painting every animation frame instead of only
          // on interaction (the library's default) — needed for the zoom-
          // based cloud/detail crossfade (drawNode/handleRenderFramePre),
          // which continuously re-evaluates against the live globalScale
          // rather than only repainting on interaction. Safe: tickFrame()'s
          // own layoutTick() only ever advances physics while
          // state.engineRunning is true, which is permanently false once
          // the simulation settles — this only makes paint continuous, it
          // can't reheat or move nodes.
          //
          // Suspended (autoPauseRedraw={true}, the library's own default
          // gate) while isBackgrounded — an /artist/[slug] overlay is
          // covering this canvas entirely, so continuing to redraw every
          // frame only burns CPU competing with that page's own animation
          // (ArtistBackground's aurora) for nothing visible. Resumes
          // instantly on navigating back: canvas redraws are a full
          // immediate-mode repaint each frame, not incremental, so there's
          // no stale-frame flash from having been paused.
          autoPauseRedraw={isBackgrounded}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          linkSource="source"
          linkTarget="target"
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => 'replace'}
          nodePointerAreaPaint={paintNodePointerArea}
          linkCanvasObject={drawLink}
          linkCanvasObjectMode={() => 'replace'}
          onRenderFramePre={handleRenderFramePre}
          onRenderFramePost={handleRenderFramePost}
          nodeVisibility={isNodeVisible}
          linkVisibility={isLinkVisible}
          linkDirectionalArrowLength={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            // Arrows only on focused/hovered/set-highlighted edges — direction
            // matters there. Plain resting edges (the general web, including
            // path-find mode) get no arrowhead at all: just a line.
            const isHighlightedEdge =
              (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ||
              (hoveredId !== null && selectedId === null && (srcId === hoveredId || tgtId === hoveredId)) ||
              (highlightSetMemberSet.size > 0 && (highlightSetMemberSet.has(srcId) && highlightSetMemberSet.has(tgtId)));
            return isHighlightedEdge ? 9 : 0;
          }}
          linkDirectionalArrowRelPos={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            // Focus/hover/set edges: midpoint keeps the arrow in open space, away from node images
            const isHighlightedEdge =
              (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ||
              (hoveredId !== null && selectedId === null && (srcId === hoveredId || tgtId === hoveredId)) ||
              (highlightSetMemberSet.size > 0 && (highlightSetMemberSet.has(srcId) && highlightSetMemberSet.has(tgtId)));
            return isHighlightedEdge ? 0.5 : 0.85;
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
            // Set edges: no single "hero" layer color, so brighten the normal
            // tint instead. Both endpoints must be set members — see drawLink's
            // isSetEdge comment for why this isn't "either endpoint."
            const isSetEdge = highlightSetMemberSet.size > 0 &&
              (highlightSetMemberSet.has(srcId) && highlightSetMemberSet.has(tgtId));
            // Same zoom fade as drawLink's edge lines (this accessor has no
            // globalScale argument, so it reads the live value tracked in
            // handleRenderFramePre) — without this, arrowheads stayed fully
            // opaque at FADE_ZOOM_OUT while the lines under them faded out.
            const isFocusModeActive = selectedId !== null || highlightSetMemberSet.size > 0;
            const edgeFade = isFocusModeActive ? 1 : computeZoomFade(currentGlobalScaleRef.current, 0);
            const alpha = (isSetEdge ? 0.85 : parseFloat(baseColor.match(/[\d.]+(?=\)$)/)?.[0] ?? '1')) * edgeFade;
            return baseColor.replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`);
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
