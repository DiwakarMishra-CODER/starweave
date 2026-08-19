'use client';

import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force-3d';
import type { Artist, Edge, EvidenceFilter, GraphData, Layer, Realm } from '@/data/types';
import { edgePassesEvidenceFilter } from '@/data/types';
import { resolveNodeColor, resolveNodeGlow, resolveEdgeTint } from '@/lib/colors';
import { getNeighbors, pathEdgeKeys } from '@/lib/graph-utils';
import { useCoarsePointer } from '@/lib/use-media-query';

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

// Picks the member of a genre/scene set with the most edges to OTHER
// MEMBERS OF THE SAME SET (either direction) to anchor the spotlight-spread
// from — see getActiveCluster below. Ties broken by graph-wide degree.
//
// Graph-wide degree was tried first and rejected: a node can dominate the
// whole graph's edge count without being what actually holds ITS OWN genre
// together. Kraftwerk has in-degree 22 graph-wide, but almost none of it is
// from other krautrock-tagged artists citing it back — picking it as
// krautrock's hub left 5 of that set's 6 other members with no line to their
// own supposed center, reading as stranded rather than spread. In-set degree
// picks the member other members actually connect to, which is what a
// visual "spine" for the set needs.
function pickSetHub(memberIds: string[], edges: Edge[]): string {
  const memberSet = new Set(memberIds);
  const inSetDegree = new Map<string, number>(memberIds.map(id => [id, 0]));
  const graphWideDegree = new Map<string, number>(memberIds.map(id => [id, 0]));
  for (const e of edges) {
    if (graphWideDegree.has(e.source)) graphWideDegree.set(e.source, graphWideDegree.get(e.source)! + 1);
    if (graphWideDegree.has(e.target)) graphWideDegree.set(e.target, graphWideDegree.get(e.target)! + 1);
    if (memberSet.has(e.source) && memberSet.has(e.target)) {
      inSetDegree.set(e.source, inSetDegree.get(e.source)! + 1);
      inSetDegree.set(e.target, inSetDegree.get(e.target)! + 1);
    }
  }
  let bestId = memberIds[0];
  let bestInSet = -1;
  let bestGraphWide = -1;
  for (const id of memberIds) {
    const inSet = inSetDegree.get(id) ?? 0;
    const graphWide = graphWideDegree.get(id) ?? 0;
    if (inSet > bestInSet || (inSet === bestInSet && graphWide > bestGraphWide)) {
      bestInSet = inSet;
      bestGraphWide = graphWide;
      bestId = id;
    }
  }
  return bestId;
}

// The single set of ids to spread + frame together right now, and a stable
// primitive key identifying that selection (for effect deps / pending-retry
// comparisons — arrays are a fresh reference every render, strings compare
// by value). Priority: single-node focus (id + its direct neighbors), then a
// highlighted genre/scene set, then the realm filter's own selection — all
// three are mutually exclusive by construction (selectedId/highlightSetIds
// per GraphView; realmMemberIds only ever reaches this function when neither
// of the other two is active, since GraphView derives it independently of
// them). Either way, `ids[0]` is the cluster's anchor — the focused node
// itself for a node focus, the highest-in-set-degree member (pickSetHub)
// for a genre/scene set or a realm selection — which is what
// computeSpreadTargetsForCluster spreads every other member outward from.
// `spreadFactor` (SPREAD_FACTOR / SET_SPREAD_FACTOR / REALM_SPREAD_FACTOR,
// all defined below) selects how far computeSpreadTargetsForCluster pushes
// members outward from the anchor. A click-focus's neighbors are scattered
// across realms and need real separation to stop photos overlapping; a
// genre/scene set clusters somewhat tighter but can still span several
// realms. A realm selection is different in kind, not just degree: its
// members are ALL already clustered together by the layout's own
// realm-separation forces (see REALM_PULL_STRENGTH/REALM_CHARGE), so
// spreading them further (even at the gentler SET_SPREAD_FACTOR) just
// inflates the bounding box for no reason — for a large realm (region-one,
// electronic) this could inflate it enough that the camera has to zoom back
// out almost as far as the full-graph view, which is what made jumping to a
// realm look like it "popped back out" instead of framing that realm.
// REALM_SPREAD_FACTOR = 1 is a true no-op (target = original position), so a
// realm selection frames members at their real, already-clustered positions.
// pinnedHubId lets a click on a set member re-center the spread on that
// member instead of the auto-picked one (see handleNodeClick/onSetMemberClick)
// — clicking within an active set should stay scoped to the set, not jump
// out to a full single-artist focus showing every real connection. Ignored
// if it isn't actually a member of the current set (stale pin after the
// set itself changed). Realm selections have no pinned-hub concept — the
// hub is always freshly picked by pickSetHub.
function getActiveCluster(
  selectedId: string | null,
  highlightSetIds: string[] | null,
  realmMemberIds: string[] | null,
  edges: Edge[],
  pinnedHubId?: string | null,
): { ids: string[]; key: string; spreadFactor: number } {
  if (selectedId) {
    return { ids: [selectedId, ...getNeighbors(selectedId, edges)], key: `artist:${selectedId}`, spreadFactor: SPREAD_FACTOR };
  }
  if (highlightSetIds && highlightSetIds.length > 0) {
    const hubId = pinnedHubId && highlightSetIds.includes(pinnedHubId)
      ? pinnedHubId
      : pickSetHub(highlightSetIds, edges);
    const rest = highlightSetIds.filter(id => id !== hubId);
    // hubId is part of the key (not just the member list) so switching the
    // pinned hub within the same set still counts as a new cluster and
    // re-triggers the spread/camera effects below.
    return { ids: [hubId, ...rest], key: `set:${highlightSetIds.join(',')}:${hubId}`, spreadFactor: SET_SPREAD_FACTOR };
  }
  if (realmMemberIds && realmMemberIds.length > 0) {
    const hubId = pickSetHub(realmMemberIds, edges);
    const rest = realmMemberIds.filter(id => id !== hubId);
    return { ids: [hubId, ...rest], key: `realm:${hubId}:${realmMemberIds.length}`, spreadFactor: REALM_SPREAD_FACTOR };
  }
  return { ids: [], key: '', spreadFactor: SPREAD_FACTOR };
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

// px — minimum hit-target RADIUS on a touch device, i.e. a ~22px-wide target.
// Applied in paintNodePointerArea only, never in drawNode: this inflates what
// is tappable without changing what is drawn. Kept below the usual 44px
// accessibility diameter on purpose — at cloud zoom the constellation is dense
// enough that a 44px target would swallow several neighbouring nodes, and a
// tap landing on the wrong artist is worse than one that misses.
const MIN_TOUCH_SCREEN_R = 11;


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
//
// This threshold was tuned around click-focus's own typical camera fit — a
// small cluster (one artist + a handful of neighbors) commonly lands at or
// near MAX_ZOOM (also 3.5), right at the reference, so manually zooming in
// from there engages dampening almost immediately. A genre/scene set's
// camera fit is nowhere near that: 18+ members spread across realms settle
// around 1.0-1.6× (see SET_SPREAD_FACTOR's comment) — reusing the same 3.5
// reference meant a set had to be zoomed in far past its own natural
// viewing range, to the point only 1-2 members were even on screen, before
// dampening ever engaged. Net effect: zooming into a set never visibly
// "shrank" anything the way zooming into a focused node does, because the
// effect was gated behind a zoom level nobody browsing a set ever reached.
// SET_ZOOM_SIZE_REFERENCE gives sets their own, much lower threshold, sized
// to their own resting zoom instead of click-focus's.
const ZOOM_SIZE_REFERENCE = 3.5;     // globalScale below which sizing is unchanged from today (click-focus / no highlight)
const SET_ZOOM_SIZE_REFERENCE = 1.3; // same idea, scaled to a genre/scene set's own ~1.0-1.6 resting zoom
const ZOOM_SIZE_DAMPEN = 0.75;   // 0 = no dampening (old behavior), 1 = constant on-screen size past the reference
function computeZoomSizeMult(globalScale: number, reference: number = ZOOM_SIZE_REFERENCE): number {
  if (globalScale <= reference) return 1;
  return Math.pow(reference / globalScale, ZOOM_SIZE_DAMPEN);
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
// The Velvet Underground specifically (not "core" generally) gets an even
// stronger pull to the same (0,0) origin — every core node targets that
// point, so without this they jostle for it via collision rather than any
// one of them owning it. VU is the one artist the whole graph is framed
// around ("rooted at The Velvet Underground"), and it's already the
// biggest, most heavily-linked node in the graph (influenceScore 56, next
// highest is 32), so in practice it barely moves anyway — this just makes
// that already-almost-true position exact rather than incidental. Twice
// CORE_PULL_STRENGTH is enough to decisively win against Kraftwerk/Can/
// Neu!/Eno's own pull to the same point, so they settle just outside VU
// instead of contesting it.
const VU_PULL_STRENGTH = CORE_PULL_STRENGTH * 2;
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

// Velvet Underground's own extra boost on top of the shared core boost above
// — it's the one node the whole graph is framed around (see VU_PULL_STRENGTH
// pinning it to the exact center), so it gets a visibly hotter glow and a
// slow breathing pulse rather than just being "one of the five core nodes."
// Applied via its own dedicated gradient in drawNode (bypassing the shared
// getBloomHazeSprite cache — see that function's own comment on why a
// different gradient shape needs its own sprite/path), not by cranking
// these shared CORE_* constants, so Kraftwerk/Can/Neu!/Eno are untouched.
const VU_GLOW_RADIUS_MULT = 1.9;
const VU_GLOW_INTENSITY = 1.6;
const VU_PULSE_PERIOD_MS = 4200;      // one full breath, slow enough to read as alive rather than flickery
const VU_PULSE_DEPTH = 0.22;          // swings the glow between (1 - depth) and (1 + depth) of its resting brightness

// Screen-pixel floors for VU's cloud-zoom dot (see the "Crisp cloud-zoom
// dot" branch in drawNode) — every other size/radius on this page is a
// WORLD-space unit that the canvas's own zoom transform scales down like
// everything else, so at the deep zoom-out the initial "fit all 293 nodes"
// view actually sits at, VU_GLOW_RADIUS_MULT alone still shrank to a
// handful of sub-visible pixels right along with it: multiplying a tiny
// number by 1.9 is still a tiny number. These are divided by globalScale at
// the call site (same `minScreenR / globalScale` floor pattern the click-
// focus readability floor already uses elsewhere in this file), which
// guarantees an actual minimum ON-SCREEN pixel size no matter how far
// zoomed out the camera is — the fix that world-space multipliers alone
// can't provide.
const VU_MIN_CORE_SCREEN_R = 13;
const VU_MIN_HALO_SCREEN_R = 34;

// VU's cloud-zoom halo alpha, deliberately NOT derived from
// CLOUD_DOT_GLOW_INTENSITY (0.18) — that value is kept low specifically
// because it's applied to every hub/anchor at once and an additive glow
// across many of them stacks up fast (see its own comment). VU is a single
// one-off node, so that ceiling doesn't apply to it; without its own much
// higher base, VU_GLOW_INTENSITY's multiplier was only ever lifting an
// already-tiny alpha (~0.13) to a still-faint ~0.2, indistinguishable from
// an ordinary anchor's own halo.
const VU_HALO_ALPHA = 0.7;

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

function realmPullStrengthX(node: { id: string; realm?: string }): number {
  if (node.id === 'velvet-underground') return VU_PULL_STRENGTH;
  if (node.realm === 'core') return CORE_PULL_STRENGTH;
  if (node.realm) return REALM_PULL_STRENGTH; // any non-core realm — data-driven, no per-realm branch needed
  return 0;
}

function realmPullStrengthY(node: { id: string; realm?: string }): number {
  if (node.id === 'velvet-underground') return VU_PULL_STRENGTH;
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

// The library's own zoomToFit() centers on the dense-core bounding box's own
// center ((minX+maxX)/2, (minY+maxY)/2) — not on graph-origin (0,0), which is
// where VU_PULL_STRENGTH actually pins Velvet Underground. With six realms
// of uneven size spaced around the origin, that bounding box is asymmetric
// enough (confirmed by replicating the real layout offline) that framing on
// its own center left VU sitting ~12 units below the framed middle of the
// screen, not in it — the pull fix alone wasn't sufficient because nothing
// was actually asking the camera to center on (0,0) in the first place.
// This replicates zoomToFit's own scale math (same bounding box, same
// padding) but returns just the zoom level, so the caller can pan to true
// origin instead of the bbox's own center — same "compute the number,
// apply it yourself" split used by computeCameraTargetForCluster elsewhere
// in this file, for the same reason (owning the pan target, not the scale).
function computeOverviewZoom(
  nodes: { id: string; x?: number; y?: number }[],
  coreIds: Set<string> | null,
  canvasWidth: number,
  canvasHeight: number,
): number | null {
  const filtered = coreIds ? nodes.filter(n => coreIds.has(n.id)) : nodes;
  const positioned = filtered.filter(n => n.x !== undefined && n.y !== undefined);
  if (positioned.length === 0) return null;
  const minX = Math.min(...positioned.map(n => n.x!));
  const maxX = Math.max(...positioned.map(n => n.x!));
  const minY = Math.min(...positioned.map(n => n.y!));
  const maxY = Math.max(...positioned.map(n => n.y!));
  const bbW = maxX - minX;
  const bbH = maxY - minY;
  if (bbW <= 0 || bbH <= 0) return null;
  return Math.min(
    (canvasWidth - ZOOM_FIT_PADDING * 2) / bbW,
    (canvasHeight - ZOOM_FIT_PADDING * 2) / bbH,
  );
}

// Dim target alpha when a highlight (hover/focus/path/set) is active.
// Lowered from 0.09: a genre/scene set's frame is often zoomed out enough
// (see SET_SPREAD_FACTOR's comment) that most of the graph is on screen at
// once, and combined with the full-detail-size rendering non-cluster nodes
// used to get regardless of mode (see isInFocusCluster below), 0.09 read as
// a wall of faint but visible ghost nodes rather than a quiet backdrop.
const DIM_ALPHA = 0.04;
const TRANSITION_MS = 220;

// Idle edge appearance — edges recede into a soft faint web by default so a
// dense graph doesn't read as a scribble of crossing lines. Only the edges
// touching a focused/hovered node rise above this baseline.
// Lowered from 0.12 — tuned when the graph was roughly a third its current
// size; the same alpha now means far more edges crossing the same detail-
// zoom viewport, reading as a bright uniform crosshatch over the nodes
// rather than individually legible relationships.
// What an edge fades to when it fails the active evidence filter. Ghosted,
// never removed: the constellation's shape IS the thing being looked at, and
// deleting half its threads would read as a rendering fault rather than as an
// argument about sourcing. Low enough that the surviving edges clearly carry
// the structure, high enough that the discarded ones are still visibly there.
const EVIDENCE_FAIL_ALPHA_MULT = 0.12;
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
const CORE_EDGE_THREAD_GLOW_BLUR = 3; // now a WIDTH delta in px, not a shadowBlur radius — see the core-edge branch in drawLink for why the blur was removed
// How faint the wide underlay stroke is relative to the thread itself. Low
// enough that the pair reads as one soft filament rather than two lines.
const CORE_EDGE_THREAD_GLOW_ALPHA_FRACTION = 0.45;

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
// Touch equivalents of the two above. On a phone the panel is a bottom sheet
// (see the artist-panel rules in the max-width:600px block of globals.css),
// so the chrome to compensate for is horizontal-full-width and vertical-short
// rather than vertical-full-height and horizontal-wide.
//
// SHEET_PEEK_HEIGHT must match the collapsed sheet's CSS height — same
// hand-kept correspondence as PANEL_WIDTH and --panel-width above. It is
// deliberately the COLLAPSED height even though the sheet can expand: framing
// is done once per selection, and re-framing every time the user expands or
// collapses would put the camera in constant motion under their thumb.
const SHEET_PEEK_HEIGHT = 104;
// The canvas width below which the panel becomes that sheet. Must match the
// NARROW_LAYOUT_QUERY breakpoint (lib/use-media-query.ts) and the --peek /
// --expanded rules in globals.css. Compared against the live canvas width
// rather than a media query so the camera and the panel can never disagree
// about which shape of chrome is on screen — a space question, answered by
// space, not by pointer type.
const SHEET_MAX_CANVAS_WIDTH = 600;
// Breathing room at the left/right edges of a phone screen, standing in for
// LEFT_UI_WIDTH — there is no persistent side chrome to clear on touch, the
// search having collapsed to an icon.
const TOUCH_EDGE_MARGIN = 24;
const MAX_ZOOM = 3.5;       // raised so small clusters can zoom in tighter
const CAMERA_PADDING = 60;  // tighter frame → cluster fills more of the clear area
const CAMERA_MS = 600;     // transition duration (ms)
const SPREAD_FACTOR = 2.6;     // click-focus spotlight-spread outward scale — a focused node's neighbors are scattered across realms and need real separation to stop photos overlapping
const SET_SPREAD_FACTOR = 1.6; // genre/scene set spread scale — a set clusters tightly by realm positioning already, so it needs less outward push than a focus cluster to stop members overlapping; tune here if sets still pile up or still land too wide
const REALM_SPREAD_FACTOR = 1; // realm selection: a true no-op (target = original position) — see getActiveCluster's comment for why realm members shouldn't be spread at all

// Per-realm camera zoom, overriding the bounding-box fit in
// computeCameraTargetForCluster. That fit frames every member of the realm,
// so the biggest rosters (region-one at 71 nodes, american-underground at 55)
// resolve to the furthest-out zoom of any realm — the two that most need to
// be readable end up the least readable. These are pinned to a fixed zoom
// instead; the framing is intentionally tighter than the full roster, so the
// realm now overflows the viewport and is panned around rather than seen
// whole. Still under MAX_ZOOM (3.5), and reachable because a focus view
// widens the scroll clamp to UNCLAMPED_BOUNDS. Add a realm here only to
// override its fit; any realm left out keeps the automatic fit.
const REALM_ZOOM_OVERRIDE: Partial<Record<Realm, number>> = {
  'region-one': 3.32,
  'american-underground': 3.32,
};

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

// ── Narrow-viewport zoom floor ──────────────────────────────────────────────
// SCROLL_MIN_ZOOM above is a DESKTOP number: it was picked by eye against a
// ~1400px-wide canvas and never re-derived from the viewport (its own comment
// says as much). That's fine until the canvas is a phone, where the fit that
// shows all seven realms lands far below 1.6 — and since the floor is handed
// to d3-zoom as scaleExtent, even the programmatic initial fit gets clamped UP
// to it. The result on a phone is landing inside one realm with no way to pull
// out, because the floor IS the wall.
//
// The fix is deliberately gated on canvas width rather than applied
// everywhere: at or above NARROW_VIEWPORT_WIDTH the floor is exactly
// SCROLL_MIN_ZOOM and this whole mechanism is a no-op, so no desktop viewport
// can have its framing changed by this. Whether the desktop fit *also* wants a
// number below 1.6 is a real open question (see the REALM_RADIUS_X/Y comment),
// but it's a separate decision from making phones work and isn't made here.
const NARROW_VIEWPORT_WIDTH = 900;
// Headroom below the exact everything-fits zoom, so pulling all the way out on
// a phone lands with a margin around the constellation rather than hard against
// its bounding box.
const NARROW_FIT_HEADROOM = 0.85;

function computeMinScrollZoom(
  nodes: { id: string; x?: number; y?: number }[],
  canvasWidth: number,
  canvasHeight: number,
): number {
  if (canvasWidth >= NARROW_VIEWPORT_WIDTH) return SCROLL_MIN_ZOOM;
  // Fits EVERY node, not computeOverviewZoom's dense-core subset (coreIds
  // null). The initial fit deliberately frames the densest 90% and lets the
  // outliers sit off-screen; a floor has the opposite job — "you can always
  // pull back far enough to see the whole thing" — and the nodes the
  // dense-core cut discards are exactly the outermost ones.
  const fit = computeOverviewZoom(nodes, null, canvasWidth, canvasHeight);
  if (fit === null) return SCROLL_MIN_ZOOM;
  return Math.min(SCROLL_MIN_ZOOM, fit * NARROW_FIT_HEADROOM);
}

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
  const sprite = solidCircleSpriteCache.get(hexColor);
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
// Touch devices get roughly a third of the starfield — see the dustStars memo
// for why the full count is a worse deal on a phone than on a laptop.
const DUST_STAR_COUNT_TOUCH = 150;
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
// Twinkle: alpha oscillates between TWINKLE_FLOOR and 1× a star's own base
// alpha — never fully dark, so it reads as a shimmer, not a blink. Distinct
// min/max period per star (not one shared period) is what keeps 450 stars
// from breathing in visible lockstep — see DustStar's own comment.
const DUST_STAR_TWINKLE_FLOOR = 0.15;
const DUST_STAR_TWINKLE_PERIOD_MIN_MS = 1100;
const DUST_STAR_TWINKLE_PERIOD_MAX_MS = 2800;

interface DustStar {
  x: number;
  y: number;
  r: number;
  alpha: number;
  color: string;
  // Per-star twinkle phase (radians) + period (ms) — generated once here,
  // not per frame, so the render loop only ever does one Math.sin per star
  // (see the dust-star render loop's own comment) rather than reconstructing
  // anything. Different phase AND period per star (not just phase) so 450
  // stars don't all breathe in lockstep, which would read as one pulsing
  // blob instead of an actual sky.
  twinklePhase: number;
  twinklePeriodMs: number;
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
  activeRealm: Realm | null;
  highlightPath: string[] | null;
  selectedId: string | null;
  // A genre's or scene's member artist ids — highlighted as a cluster
  // (spread + framed together, dimmed background) rather than a single
  // node + its neighbors. Mutually exclusive with selectedId (enforced by
  // the caller): when selectedId is set, this is ignored.
  highlightSetIds: string[] | null;
  // Which set member (if any) is re-centered as the spread's hub, from a
  // click on a member while the set is active — see getActiveCluster's
  // pinnedHubId. Ignored when highlightSetIds is empty/null.
  highlightSetPinnedId?: string | null;
  onNodeClick: (artistId: string) => void;
  // Fires instead of onNodeClick when the clicked node is a member of the
  // active genre/scene set — lets the caller re-center the set on that
  // member (see highlightSetPinnedId) instead of exiting to a full
  // single-artist focus. Falls back to onNodeClick if not provided.
  onSetMemberClick?: (artistId: string) => void;
  onBackgroundClick: () => void;
  // Which edges count as evidenced enough to stay lit — see
  // edgePassesEvidenceFilter. Applied as a final alpha multiplier in drawLink
  // rather than as another branch, so it composes with focus/set/zoom fading
  // instead of interacting with any of it.
  evidenceFilter: EvidenceFilter;
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
  // Present at runtime already: stableData builds links as a full {...edge}
  // spread. Declared here so the evidence filter can read them without a cast.
  citationStatus?: Edge['citationStatus'];
  sourceTier?: Edge['sourceTier'];
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
  activeRealm,
  highlightPath,
  selectedId,
  highlightSetIds,
  highlightSetPinnedId = null,
  onNodeClick,
  onSetMemberClick,
  onBackgroundClick,
  evidenceFilter,
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
  // Hover is split into "what the library last reported" and "is the pointer
  // actually over the canvas," because force-graph stores the last pointer
  // position and never clears it when the pointer leaves (there is no
  // pointerleave/mouseout handler in the library — only pointermove keeps
  // pointerPos up to date), while re-running its hit test against that stored
  // position on EVERY animation frame. With autoPauseRedraw={false} that loop
  // never idles, so parking the cursor on an overlay (the "Jump to…" panel,
  // the search field, the artist panel) and then moving the camera hovers
  // whatever node happens to slide under that stale screen point — which is
  // exactly what made picking a realm light up an unrelated node sitting
  // behind the panel's own text. The overlays are DOM siblings of the canvas,
  // so the canvas genuinely receives no pointer events while the cursor is on
  // one; tracking that here is what the library is missing.
  const [rawHoveredId, setRawHoveredId] = useState<string | null>(null);
  const [pointerOverCanvas, setPointerOverCanvas] = useState(true);
  // True on a touch device (no mouse) — see lib/use-coarse-pointer.ts. Needed
  // during render because every draw callback reads hoveredId just below.
  const isCoarsePointer = useCoarsePointer();
  // Derived, and deliberately still named hoveredId so every downstream read
  // (drawNode, drawLink, neighborSet, the arrow props) picks up the
  // suppression for free rather than each having to remember to check.
  //
  // Hard-nulled on touch. There is no hover on a touch screen, but the
  // library still runs its hit test against the last pointer position on
  // every frame and never clears it (see pointerOverCanvas above) — so a tap
  // would leave that node reading as "hovered" indefinitely, lighting up its
  // neighbours and edges with no gesture available to undo it. Killing the
  // signal at the source means tap-to-focus is the one and only interaction,
  // and every downstream isHovered/isHoverNeighbor/isHoverEdge branch goes
  // cold for free.
  const hoveredId = isCoarsePointer ? null : (pointerOverCanvas ? rawHoveredId : null);
  // [min, max] passed straight through as <ForceGraph2D minZoom maxZoom>
  // props — see the SCROLL_MIN_ZOOM comment above for why this has to be
  // state (declarative props) rather than a graphRef method call, and
  // applyCameraFocusForCluster/animateClusterIntoView for the bail-and-retry
  // this requires to keep a widen ordered before the zoom() that needs it.
  const [scrollZoomBounds, setScrollZoomBounds] = useState<[number, number]>(CLAMPED_BOUNDS);
  // The resting (non-focus-view) bounds, recomputed from the live canvas size
  // by the effect below — CLAMPED_BOUNDS on any desktop-width viewport, a
  // lower floor on a phone (see computeMinScrollZoom).
  //
  // Deliberately a ref rather than state or a memo: every consumer of
  // `scrollZoomBounds` in the camera code is already load-bearing as an effect
  // dependency, and the defocus restore path below reads this from inside a
  // setTimeout. Making it a dependency instead would re-fire
  // applyCameraFocusForCluster — the exact second-re-frame hazard that
  // callback's own comment (see prevClusterActiveRef, ~40 lines down) exists
  // to prevent.
  const restingZoomBoundsRef = useRef<[number, number]>(CLAMPED_BOUNDS);
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
  // Per-frame label state — both refs reset together, once per frame, in
  // handleRenderFramePre (see its own comment for why that's the reset
  // point rather than a timing heuristic inside drawNode).
  const labelQueueRef  = useRef<LabelCandidate[]>([]);
  const nodeCirclesRef = useRef<Array<{ x: number; y: number; r: number }>>([]);
  // Saves original cluster positions so they can be restored on deselect.
  const savedPositionsRef = useRef<Map<string, { x: number; y: number }> | null>(null);
  // Set (to the active cluster's key) when spread/camera-focus can't run yet
  // because the force simulation hasn't positioned the cluster's nodes (fresh
  // mount + URL-preselected artist/genre/scene, e.g. "View in graph"/genre
  // and scene pages). onEngineStop retries once the simulation settles, so
  // the result matches a click/selection made on an already-settled graph.
  //
  // Deliberately TWO markers, one per path, plus a record of what the camera
  // has already framed. All three used to be one shared ref, which is what
  // made clicking a member of a genre/scene set move the camera and then jerk
  // it back about a second later: the spread effect and the camera effect both
  // wrote the same marker (last writer won, so one path's "I bailed" could be
  // erased by the other's "I'm fine"), and onEngineStop then fired a THIRD
  // camera animation via animateClusterIntoView. That third one frames from
  // not-yet-applied spread targets while applyCameraFocusForCluster frames
  // from nodes' current positions, so the two disagree — two CAMERA_MS
  // transitions back to back, landing in different places.
  const pendingSpreadKeyRef = useRef<string | null>(null);
  const pendingCameraKeyRef = useRef<string | null>(null);
  // The last cluster key the camera successfully framed. onEngineStop must
  // never re-frame a cluster already framed: the simulation settling is not a
  // reason to move a camera that is already where it belongs.
  const framedClusterKeyRef = useRef<string | null>(null);
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
    // Deliberately impure — this decorative starfield needs one fixed random
    // layout per mount/data-change, not a re-roll every render; the useMemo's
    // own dependency array ([stableData.nodes]) is what actually keeps this
    // from re-running on every render, same as any other useMemo. Confirmed
    // via git-stash earlier this session that this predates these edits —
    // restructuring it into an effect+state to satisfy the purity rule would
    // risk a one-frame flash of no stars on mount for a purely cosmetic
    // starfield, not worth it.
    /* eslint-disable react-hooks/purity -- see comment above */
    // Thinned on touch. Each star is an individual arc+fill every frame
    // (autoPauseRedraw={false} — see DUST_STAR_COUNT, they're plain circles,
    // not sprites), and a phone now frames the WHOLE constellation rather
    // than a cropped part of it, so all of them rasterize at once where on
    // desktop many sat off-screen. Pure decoration behind the real nodes —
    // the cheapest honest thing to cut, and the only render-loop change made
    // here without a device measurement.
    const dustCount = isCoarsePointer ? DUST_STAR_COUNT_TOUCH : DUST_STAR_COUNT;
    for (let i = 0; i < dustCount; i++) {
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
        twinklePhase: Math.random() * Math.PI * 2,
        twinklePeriodMs: DUST_STAR_TWINKLE_PERIOD_MIN_MS + Math.random() * (DUST_STAR_TWINKLE_PERIOD_MAX_MS - DUST_STAR_TWINKLE_PERIOD_MIN_MS),
      });
    }
    /* eslint-enable react-hooks/purity */
    return stars;
  }, [stableData.nodes, isCoarsePointer]);

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
  // pendingSpreadKeyRef/pendingCameraKeyRef + onEngineStop retry below, so framing is guaranteed
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
    const fg = graphRef.current;
    if (fg) {
      const canvasW = containerRef.current?.offsetWidth  ?? 800;
      const canvasH = containerRef.current?.offsetHeight ?? 600;
      // Desktop frames the densest 90% and lets the outermost nodes sit just
      // off-screen — there's room to pan to them and the tighter crop reads
      // better. A phone has no such room: cropping 10% of a constellation
      // that's already only a few hundred pixels wide means whole realm edges
      // are simply gone on arrival, with nothing on screen suggesting they
      // exist. Below NARROW_VIEWPORT_WIDTH, fit everything.
      const coreIds = canvasW < NARROW_VIEWPORT_WIDTH
        ? null
        : computeDenseCoreIds(stableData.nodes);
      const targetZoom = computeOverviewZoom(stableData.nodes, coreIds, canvasW, canvasH);
      if (targetZoom !== null) {
        // Instant zoom + animated pan, not the library's own zoomToFit (which
        // would animate both AND center on the dense-core bbox's own center —
        // see computeOverviewZoom's comment for why that's not graph-origin).
        fg.zoom(targetZoom, 0);
        fg.centerAt(0, 0, dur);
      }
    }
    // stableData is a stable reference (see its own useMemo below) — reading
    // it here doesn't need to be a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPreselectedCluster]);

  // Re-derive the resting zoom floor whenever the canvas size changes (mount,
  // resize, phone rotation). Declared BEFORE the settle-timer effect below on
  // purpose: minZoom is a declarative prop, so a widened floor only reaches
  // d3-zoom on the next render — and tryInitialFit's fg.zoom() call would be
  // clamped by the OLD floor if it ran first. The 150ms settle window is what
  // guarantees the new prop has landed by the time the fit runs.
  useEffect(() => {
    if (!dimensions) return;
    const next: [number, number] = [
      computeMinScrollZoom(stableData.nodes, dimensions.width, dimensions.height),
      SCROLL_MAX_ZOOM,
    ];
    if (
      next[0] === restingZoomBoundsRef.current[0] &&
      next[1] === restingZoomBoundsRef.current[1]
    ) return;
    restingZoomBoundsRef.current = next;
    // Only push it to the live props when no focus view owns the bounds — a
    // focus view runs UNCLAMPED and restores from restingZoomBoundsRef on its
    // way out, so it picks the new floor up for free rather than being yanked
    // out of its own widened range mid-animation.
    if (!prevClusterActiveRef.current) setScrollZoomBounds(next);
    // stableData is a stable reference (see its own useMemo) — node positions
    // are final after presettleLayout and never change identity, so depending
    // on it here would be inert noise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

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
    // This one-time force configuration is deliberately scoped to
    // [dimensions] only; adding stableData.nodes would re-register every
    // d3Force (charge/link/collide/realmX/realmY) on every node-data
    // reference change instead of once, risking a physics reset each time
    // the graph data updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above
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

  // Every artist in the currently-selected realm filter (GraphControls) —
  // null when nothing's selected (no filter, "show everything", not
  // "cluster to nothing").
  const realmMemberIds = useMemo(
    () => (activeRealm === null
      ? null
      : stableData.nodes.filter(n => n.realm === activeRealm).map(n => n.id)),
    [stableData.nodes, activeRealm],
  );

  // The single set of ids to spread + frame right now — see getActiveCluster.
  const { ids: activeClusterIds, key: activeClusterKey, spreadFactor: activeClusterSpreadFactor } = useMemo(
    () => getActiveCluster(selectedId, highlightSetIds, realmMemberIds, graphData.edges, highlightSetPinnedId),
    [selectedId, highlightSetIds, realmMemberIds, graphData.edges, highlightSetPinnedId],
  );

  // ── Spotlight spread ─────────────────────────────────────────────────────────
  // Pure: computes where spotlight-spread WOULD place each cluster node,
  // without mutating anything. null means the simulation hasn't positioned
  // the cluster's primary node (clusterIds[0]) yet; an empty map means
  // there's nothing to spread (0 or 1 node).
  //
  // Spreads every member outward from clusterIds[0] — the cluster's anchor
  // (the focused node itself for a node focus, the set's highest-in-set-
  // degree member for a genre/scene set; see getActiveCluster/pickSetHub) —
  // not from the cluster's arithmetic-mean centroid. For a node focus this is
  // nearly the same thing in practice (the focused node's own neighbors sit
  // close around it, so the centroid was already near its position), but for
  // a genre/scene set spanning several realms the centroid can float in
  // empty space between them. Anchoring to a real member's own position at
  // least gives the spread a stable, non-jittering point to radiate from
  // (the anchor doesn't move at all — its own offset from itself is zero) —
  // though note the outward SCALE factor, not the origin, is what actually
  // controls the resulting bounding box size (scaling a fixed point set by a
  // factor from any single origin produces the same-size bounding box
  // regardless of which point you scale from), which is why the caller
  // passes a smaller factor (or REALM_SPREAD_FACTOR's true no-op) below
  // rather than relying on the anchor choice alone.
  const computeSpreadTargetsForCluster = useCallback((clusterIds: string[], factor: number): Map<string, { x: number; y: number }> | null => {
    if (clusterIds.length === 0) return new Map();

    const anchor = stableData.nodes.find(n => n.id === clusterIds[0]);
    if (anchor?.x === undefined || anchor?.y === undefined) return null;

    const idSet = new Set(clusterIds);
    const clusterNodes = stableData.nodes.filter(
      n => idSet.has(n.id) && n.x !== undefined && n.y !== undefined,
    );
    if (clusterNodes.length < 2) return new Map();

    const ax = anchor.x;
    const ay = anchor.y;

    const targets = new Map<string, { x: number; y: number }>();
    for (const n of clusterNodes) {
      const dx = n.x! - ax;
      const dy = n.y! - ay;
      targets.set(n.id, { x: ax + dx * factor, y: ay + dy * factor });
    }
    return targets;
  }, [stableData.nodes]);

  // Moves the cluster's nodes outward so the camera frames the already-spread
  // positions. Restores originals on deselect (or when switching clusters).
  // Returns true once handled (spread applied, deselected, or nothing to
  // spread); false when the simulation hasn't positioned the cluster yet —
  // the caller then leaves a pending marker so onEngineStop can retry.
  const applySpreadForCluster = useCallback((clusterIds: string[], factor: number): boolean => {
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

    const targets = computeSpreadTargetsForCluster(clusterIds, factor);
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

    // Scale each node outward from the cluster's anchor so nodes fill the
    // frame with comfortable gaps. Simulation is paused after initial
    // cooldown, so these positions hold until we restore them on deselect.
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
    const ready = applySpreadForCluster(activeClusterIds, activeClusterSpreadFactor);
    pendingSpreadKeyRef.current = ready ? null : activeClusterKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterKey, activeClusterSpreadFactor, dimensions, applySpreadForCluster]);

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
    (clusterIds: string[], overrides: Map<string, { x: number; y: number }>): { targetZoom: number; camX: number; camY: number } | null => {
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
      // The panel is a right-hand drawer when there's room and a bottom
      // sheet when there isn't, so the clear area it leaves behind is a
      // different shape and the compensation has to be too. Getting this
      // wrong is not subtle at phone size: the desktop branch subtracts 540px
      // of chrome width, which on a 390px canvas drives availW straight to
      // its 200px floor (solving the zoom for a viewport that doesn't exist)
      // and then shifts camX by a further ~110 graph units to clear a drawer
      // that isn't on screen.
      // Which chrome is actually on screen is a question of room, not of
      // input device: a narrow laptop window gets the same bottom sheet a
      // phone does. Keyed to the same breakpoint the CSS uses.
      const isSheetLayout = canvasW < SHEET_MAX_CANVAS_WIDTH;
      const availW = isSheetLayout
        ? Math.max(canvasW - TOUCH_EDGE_MARGIN * 2, 200)
        : Math.max(canvasW - PANEL_WIDTH - LEFT_UI_WIDTH, 200);
      const availH = isSheetLayout
        ? Math.max(canvasH - SHEET_PEEK_HEIGHT, 200)
        : Math.max(canvasH, 200);

      const fitZoom = Math.max(Math.min(availW / bbW, availH / bbH, MAX_ZOOM), 0.5);
      // activeRealm is non-null only when a realm IS the active cluster —
      // selecting one clears selectedId/highlightSetIds, and getActiveCluster
      // only reaches its realm branch when both of those are empty — so this
      // can't leak a realm's zoom into an artist-focus or genre/scene frame.
      const override = activeRealm !== null ? REALM_ZOOM_OVERRIDE[activeRealm] : undefined;
      const targetZoom = override ?? fitZoom;
      const centerGX = (minX + maxX) / 2;
      const centerGY = (minY + maxY) / 2;
      // Both offsets depend on targetZoom, so they have to be computed after
      // the override is resolved — otherwise the pan would be sized for the
      // fit zoom rather than the zoom actually being applied.
      //
      // Touch gets no horizontal offset (the sheet spans the full width, so
      // the clear area is already horizontally centred) and a vertical one
      // instead — the exact mirror of the desktop formula. Adding to camY
      // moves the camera DOWN in graph space, which moves the cluster UP on
      // screen, into the strip above the sheet.
      const camX = isSheetLayout
        ? centerGX
        : centerGX + (PANEL_WIDTH - LEFT_UI_WIDTH) / (2 * targetZoom);
      const camY = isSheetLayout
        ? centerGY + SHEET_PEEK_HEIGHT / (2 * targetZoom)
        : centerGY;

      return { targetZoom, camX, camY };
    },
    [stableData.nodes, activeRealm],
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
        // Same instant-zoom + centered-pan split as tryInitialFit, and for
        // the same reason — the library's own zoomToFit centers on the
        // dense-core bbox's own center, not graph-origin, which is where
        // VU_PULL_STRENGTH actually pins Velvet Underground.
        const canvasW = containerRef.current?.offsetWidth  ?? 800;
        const canvasH = containerRef.current?.offsetHeight ?? 600;
        const targetZoom = computeOverviewZoom(stableData.nodes, coreIds, canvasW, canvasH);
        if (targetZoom !== null) {
          fg.zoom(targetZoom, 0);
          fg.centerAt(0, 0, duration);
        }
        // Re-engage the scroll clamp only once this zoom-out transition has
        // actually finished — restoring synchronously here would fight the
        // in-flight zoomToFit transition for the same d3-zoom scale.
        if (zoomClampRestoreTimerRef.current !== null) clearTimeout(zoomClampRestoreTimerRef.current);
        zoomClampRestoreTimerRef.current = setTimeout(() => {
          zoomClampRestoreTimerRef.current = null;
          // A focus view can open during this CAMERA_MS window, and the
          // cancel below (the "focus view is opening" block) only runs when
          // applyCameraFocusForCluster actually reaches it — it returns
          // earlier on !fg and on the not-yet-positioned primary-node guard.
          // If the timer survives to here with a cluster active, writing
          // scrollZoomBounds would change a dependency of this very callback,
          // re-firing the camera effect into its clamp-widen bail and out the
          // other side as a SECOND full re-frame, ~600ms after the click that
          // caused none of it. Skip instead: the focus path owns the bounds
          // while it's open, and its own defocus re-arms this timer later, so
          // the clamp is never permanently lost.
          if (prevClusterActiveRef.current) return;
          // restingZoomBoundsRef, not CLAMPED_BOUNDS — on a narrow viewport
          // the resting floor is lower than SCROLL_MIN_ZOOM, and restoring the
          // constant here would silently re-impose the desktop wall the moment
          // a user closed their first focus view.
          setScrollZoomBounds(restingZoomBoundsRef.current);
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
    fg.centerAt(cameraTarget.camX, cameraTarget.camY, duration);
    return true;
  }, [stableData.nodes, computeCameraTargetForCluster, scrollZoomBounds]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: applyCameraFocusForCluster's own comment above (scrollZoomBounds widening) explains why a setState here is required, not incidental
    const ready = applyCameraFocusForCluster(activeClusterIds);
    pendingCameraKeyRef.current = ready ? null : activeClusterKey;
    // Record the framing so the onEngineStop retry below can tell "never got
    // framed" apart from "already framed, leave it alone."
    if (ready) framedClusterKeyRef.current = activeClusterKey;
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
  const animateClusterIntoView = useCallback((clusterIds: string[], factor: number): boolean => {
    const fg = graphRef.current;
    if (!fg) return false;
    if (clusterIds.length === 0) return true; // nothing to animate

    const computedTargets = computeSpreadTargetsForCluster(clusterIds, factor);
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
      fg.centerAt(cameraTarget.camX, cameraTarget.camY, duration);
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
    // Retry only a cluster that genuinely never got applied — either path
    // reporting itself unready counts — and never one the camera has already
    // framed. That last guard is what stops the snap-back: without it, a
    // settle event re-ran animateClusterIntoView over an already-correct
    // camera and dragged it somewhere slightly different.
    const needsRetry =
      pendingSpreadKeyRef.current === activeClusterKey ||
      pendingCameraKeyRef.current === activeClusterKey;
    if (needsRetry && framedClusterKeyRef.current !== activeClusterKey) {
      if (animateClusterIntoView(activeClusterIds, activeClusterSpreadFactor)) {
        pendingSpreadKeyRef.current = null;
        pendingCameraKeyRef.current = null;
        framedClusterKeyRef.current = activeClusterKey;
      }
    }
  }, [activeClusterKey, activeClusterIds, activeClusterSpreadFactor, animateClusterIntoView, tryInitialFit]);

  // ── Derived sets ────────────────────────────────────────────────────────────
  const pathSet = useMemo(() => new Set<string>(highlightPath ?? []), [highlightPath]);
  const pathEdges = useMemo(
    () => (highlightPath ? pathEdgeKeys(highlightPath) : new Set<string>()),
    [highlightPath],
  );

  // Neighbors come from selectedId (focus mode) or hoveredId (hover mode) —
  // but NOT hoveredId while a genre/scene set is active (highlightSetIds
  // non-empty and selectedId null, since the two are mutually exclusive).
  // Otherwise hovering a node outside the set would pull in its real,
  // unrelated neighbors — the same leak click-focus already avoids for
  // free via its own selectedId !== null short-circuit.
  const isSetModeActive = !!highlightSetIds && highlightSetIds.length > 0 && selectedId === null;
  const activeHighlightId = selectedId ?? (isSetModeActive ? null : hoveredId);
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
      // Genre/scene set member — same visual tier as a single-focus neighbor
      // (crisp, not blown-out), just without one node standing out as "the" focus.
      const isSetMember = highlightSetMemberSet.has(n.id);
      // True while a genre/scene set is highlighted (selectedId is always
      // null then, per getActiveCluster's mutual-exclusivity contract).
      // Hover-driven reveal (isHovered/isHoverNeighbor just below) must stay
      // off in this mode — otherwise hovering a node outside the set pulls
      // in its unrelated photo and neighbors, defeating the point of the
      // set filter. Click-focus already gets this for free via its own
      // selectedId !== null check on both lines below.
      const isSetModeActive = highlightSetMemberSet.size > 0;
      const isHovered   = n.id === hoveredId && selectedId === null && !isSetModeActive;
      const isHoverNeighbor = hoveredId !== null && selectedId === null && !isSetModeActive && neighborSet.has(n.id);
      const isInPath    = pathSet.has(n.id);
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

      // A node "in the active highlight" — the focused node + its neighbors
      // in click-focus mode, or every member of a genre/scene set. Drives
      // both the enlarged size below AND the zoom-fade gating just below:
      // these nodes should always render fully resolved regardless of the
      // camera's actual zoom (a set's camera fit can land anywhere from a
      // tight zoom to well into cloud-zoom range — see SET_SPREAD_FACTOR's
      // comment), while everything NOT in the highlight follows the real
      // cloud/detail crossfade curve so it recedes to a small cloud dot
      // instead of reading as a wall of full-size, merely-faded-alpha
      // circles.
      const isInFocusCluster = (selectedId !== null && (isFocused || isNeighbor)) || isSetMember;

      // Animated alpha for dimmed nodes (reads live from ref — smooth without re-renders)
      // Zoom fade (P2, overview only). isInFocusCluster forces this to 1 —
      // a node that IS the thing being shown off (a focus cluster member or
      // a set member) should never render as a half-faded cloud dot,
      // regardless of camera distance. Everything else follows the real
      // curve. See computeZoomFade/FADE_ZOOM_OUT/FADE_ZOOM_IN/FADE_HUB_BIAS_STRENGTH.
      const isFocusModeActive = selectedId !== null || highlightSetMemberSet.size > 0;
      const zoomFade = isInFocusCluster ? 1 : computeZoomFade(globalScale, score);
      // One of the ~ANCHOR_COUNT highest-influenceScore nodes globally —
      // gates LABELS only now (see the label logic further down), not the
      // dot itself. Computed once in topAnchorIds (useMemo, alongside
      // stableData), not per-frame.
      const isAnchor = topAnchorIds.has(n.id);
      // Crisp cloud-zoom dot fade — 0 for any node in the active highlight
      // (see isInFocusCluster above) or at/above FADE_ZOOM_IN (detail zoom
      // stays byte-for-byte the existing rendering below), 1 at full cloud
      // zoom. The exact complement of zoomFade (which drives the existing
      // bloom-haze/fill/photo path below): the two sum to 1 at every zoom,
      // so a node is never fully invisible in between — this is what makes
      // "dots resolve into full detailed nodes" a continuous crossfade
      // rather than a gap.
      const cloudDotFade = isInFocusCluster ? 0 : 1 - zoomFade;
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
      const overviewSizeShrink = isInFocusCluster ? 1 : zoomFade;

      // ── Size ──
      // In focus mode, both the selected node and its neighbors scale up so
      // images and labels are clearly legible. Relative size order is preserved
      // (focused > hub-neighbor > small-neighbor). Hover/path modes unchanged.
      // Set members use the same "neighbor" tier — a set has no single hero node.
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
      // Velvet Underground's own extra boost — see VU_GLOW_RADIUS_MULT above.
      // pulseMult oscillates 1±VU_PULSE_DEPTH; performance.now() is safe to
      // call directly here (not stored in a ref) because this whole canvas
      // already repaints every frame regardless of physics state
      // (autoPauseRedraw={false}), so there's no risk of it going stale.
      const isVU = n.id === 'velvet-underground';
      const pulseMult = isVU
        ? 1 + Math.sin((performance.now() % VU_PULSE_PERIOD_MS) / VU_PULSE_PERIOD_MS * Math.PI * 2) * VU_PULSE_DEPTH
        : 1;
      // The special treatment is for the far, constellation-scale view where
      // VU reads as "the sun of the graph" — reported as distracting once
      // you're actually looking at a focus cluster it happens to be part of
      // (not just when VU itself is the clicked node — isFocused alone
      // missed the case where VU shows up as a NEIGHBOR of whatever else is
      // focused, e.g. clicking LCD Soundsystem, which has a real edge to
      // VU, still lit VU up like a sun sitting right next to the actual
      // focus), or once already zoomed in close enough to be reading detail
      // (photo, label, etc.) right next to it. Suppressed in both cases; VU
      // then falls through to the exact same rendering every other core
      // node gets (still isCore's own boost, just not VU's extra one on
      // top, and no pulse).
      const vuSpecialActive = isVU && !isInFocusCluster && globalScale < 3;

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
      // No-op (mult === 1) at/below the active reference, i.e. everywhere
      // the cloud/overview rendering above actually runs. Uses
      // SET_ZOOM_SIZE_REFERENCE while a genre/scene set is active — see its
      // comment above for why the click-focus-tuned default never engaged
      // within a set's own, much lower resting zoom.
      const zoomSizeMult = computeZoomSizeMult(globalScale, isSetModeActive ? SET_ZOOM_SIZE_REFERENCE : ZOOM_SIZE_REFERENCE);
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
        if (vuSpecialActive) {
          // Velvet Underground's own dedicated glow (see VU_GLOW_RADIUS_MULT
          // above) — always a fresh gradient, never the shared cached
          // sprite: there's only ever one of this node, so this pays the
          // same low per-frame cost the isFocused/isHovered branch below
          // already pays for 1-2 nodes at a time. A white-hot inner stop
          // (instead of flat gold) plus the breathing pulseMult computed
          // above are what make it read as a hotter, alive center rather
          // than just a bigger core node.
          const baseBloomMult  = (isFocused ? 4.0 : isHovered ? 3.5 : 2.8) * CORE_GLOW_RADIUS_MULT * VU_GLOW_RADIUS_MULT;
          const baseInnerAlpha = (isFocused ? 0.30 : 0.22) * CORE_GLOW_INTENSITY * VU_GLOW_INTENSITY;
          const baseMidAlpha   = 0.07 * CORE_GLOW_INTENSITY * VU_GLOW_INTENSITY;
          const bloomR = erOverview * baseBloomMult * pulseMult;
          const innerAlpha = Math.min(baseInnerAlpha * pulseMult, 1);
          const midAlpha = Math.min(baseMidAlpha, 1);
          const grad = ctx.createRadialGradient(n.x, n.y, erOverview * 0.15, n.x, n.y, bloomR);
          grad.addColorStop(0,    `rgba(255, 250, 235, ${innerAlpha})`);
          grad.addColorStop(0.3,  glow.replace('0.7)', `${innerAlpha})`));
          grad.addColorStop(0.6,  glow.replace('0.7)', `${midAlpha})`));
          grad.addColorStop(1,    glow.replace('0.7)', '0)'));
          ctx.beginPath();
          ctx.arc(n.x, n.y, bloomR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (!isFocused && !isHovered) {
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
                     : 10) * (isCore ? CORE_GLOW_RADIUS_MULT : 1) * (vuSpecialActive ? VU_GLOW_RADIUS_MULT * pulseMult : 1) * overviewSizeShrink;
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
        // Strong faint/bright variation by score — most nodes sit near the
        // floor (faint), hubs climb toward the ceiling (bright), instead of
        // every node reading at the same flat brightness.
        const scoreBrightness = Math.min(1, CLOUD_DOT_MIN_BRIGHTNESS_FRACTION + Math.sqrt(score) * CLOUD_DOT_BRIGHTNESS_GROWTH);
        const dotBrightness = CLOUD_DOT_BRIGHTNESS * scoreBrightness * cloudDotFade * dimFactor;

        // Skip the sprite stamps entirely below a visibility floor — same
        // pattern as the bloom-haze block's `alpha > 0.01` gate above (a
        // node this faint is indistinguishable from not drawn at all). A
        // dimmed background node's dimFactor (DIM_ALPHA = 0.04) alone pulls
        // most low/mid-score nodes under this floor. That matters here
        // specifically because cloudDotFade is 1 (this whole block runs)
        // for EVERY non-cluster node whenever a genre/scene set's camera
        // fit lands in cloud-zoom range — routinely all ~270+ of them,
        // every single frame (autoPauseRedraw={false} never stops
        // repainting) — where click-focus's typically tighter, higher-zoom
        // fit keeps cloudDotFade near 0 for the same nodes and skips this
        // block already. Without this floor, that difference in camera
        // zoom directly became a difference in frame cost.
        if (dotBrightness > 0.01) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          // Flat min/max range, independent of baseR (see CLOUD_DOT_MIN_R's
          // comment above) — a tiny sharp point for most nodes, only growing
          // modestly for real hubs, never a big circle.
          const dotCoreR = Math.min(CLOUD_DOT_MAX_R, CLOUD_DOT_MIN_R + Math.sqrt(score) * CLOUD_DOT_HUB_GROWTH);
          // Isolates the legitimate fade/dim behavior (zoom crossfade, focus-
          // mode dimming) from dotBrightness's OWN ceiling (CLOUD_DOT_BRIGHTNESS
          // × scoreBrightness, both deliberately conservative for the shared
          // many-hubs-at-once system) — VU's own alpha below is built from
          // this instead of dotBrightness directly, so its much higher
          // VU_HALO_ALPHA base isn't multiplied back down by a ceiling meant
          // for everyone else.
          const fadeAndDim = cloudDotFade * dimFactor;

          if (vuSpecialActive) {
            // Velvet Underground keeps its bigger, hotter, breathing glow
            // even at full cloud zoom instead of reading as just another
            // bright dot — same VU_GLOW_RADIUS_MULT/pulseMult as the detail-
            // zoom bloom haze above, so it doesn't visually "turn off" its
            // special treatment on zoom-out the way the detail-only bloom
            // haze/shadowBlur do once cloudDotFade takes over. A dedicated
            // gradient (white-hot center, same as the detail path) rather
            // than the shared get2StopGlowSprite cache — there's only one
            // of this node, so this costs the same as the one extra draw
            // call every hub/anchor already pays for its own halo just below.
            // pulseMult multiplies AFTER the max(), not inside the world-
            // space term — at deep zoom-out the screen-space floor is the
            // larger of the two (that's the whole point of it), so a
            // pulseMult buried inside the losing branch of the max() never
            // affected the final radius at all: the pulse was fully masked
            // by the floor, which is exactly why it looked static when
            // zoomed out. Applying it to the maxed result instead means the
            // breathing is always visible, whichever term is winning.
            const vuHaloR = Math.max(
              dotCoreR * CLOUD_DOT_GLOW_TIGHTNESS * VU_GLOW_RADIUS_MULT,
              VU_MIN_HALO_SCREEN_R / globalScale,
            ) * pulseMult;
            const vuHaloAlpha = Math.min(VU_HALO_ALPHA * fadeAndDim * pulseMult, 1);
            const vuGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, vuHaloR);
            vuGrad.addColorStop(0,    `rgba(255, 250, 235, ${vuHaloAlpha})`);
            vuGrad.addColorStop(0.35, glow.replace('0.7)', `${vuHaloAlpha})`));
            vuGrad.addColorStop(1,    glow.replace('0.7)', '0)'));
            // ctx.globalAlpha is still whatever the "Outer bloom haze" block
            // set it to earlier in this function (dimFactor * zoomFade) — at
            // deep zoom-out zoomFade is ~0, so that ambient alpha alone
            // would crush this gradient to near-invisible regardless of the
            // alpha already baked into its own rgba() stops above. Every
            // other draw in this cloud-dot block goes through
            // stampGlowSprite, which sets its OWN globalAlpha internally
            // before drawing (see its call sites' "restore" comments) — this
            // is a raw ctx.fill(), so it needs the same reset done by hand.
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(n.x, n.y, vuHaloR, 0, Math.PI * 2);
            ctx.fillStyle = vuGrad;
            ctx.fill();
          } else if (score >= CLOUD_DOT_HALO_MIN_SCORE || isAnchor) {
            // Soft bloom halo reserved for hubs/anchors — most nodes are a bare
            // sharp point, matching the reference's "few bright, many faint".
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
          // VU's own solid core gets a modest, non-pulsing size bump (the
          // pulse lives entirely in the halo above; pulsing a hard-edged dot
          // this small would read as jitter rather than breathing) AND full-
          // strength opacity instead of dotBrightness's own 0.7 ceiling —
          // VU should read as solid, saturated gold, not 70%-see-through.
          const coreR = vuSpecialActive ? Math.max(dotCoreR * 1.4, VU_MIN_CORE_SCREEN_R / globalScale) : dotCoreR;
          const coreAlpha = vuSpecialActive ? Math.min(fadeAndDim, 1) : dotBrightness;
          stampGlowSprite(ctx, getSolidCircleSprite(color), n.x, n.y, coreR, coreAlpha);

          ctx.restore();
        }
      }

      // ── Photo clip + glowing ring ─────────────────────────────────────────
      if (showPhoto) {
        // Photo's own alpha snaps to 0/1 on the ZOOM crossfade only
        // (photoLabelFade), not the combined photoOpacity — drawing it
        // semi-transparent during the zoom-in ramp let the solid color fill
        // drawn above (same size, same position, fully opaque) bleed
        // through as a colored tint/wash over the image, worst mid-
        // crossfade and only gone once photoLabelFade reached exactly 1 at
        // FADE_ZOOM_IN (which is why zooming further in "cleared" it up).
        // dimFactor is still applied multiplicatively on top — a dimmed
        // (non-focus-cluster) node's photo must stay genuinely faint, not
        // jump to full brightness just because it cleared the zoom snap.
        // photoOpacity itself (dimFactor * photoLabelFade) can't be used for
        // the snap test directly: dimFactor is never exactly 0 (it floors at
        // DIM_ALPHA, not 0), so a fully-dimmed node's photoOpacity is still
        // a tiny positive number and would incorrectly pass a ">0" snap
        // check, popping every dimmed hub's photo to full opacity instead of
        // staying faint — the SIZE still ramps smoothly via photoOpacity
        // (see `er` above); only this specific alpha decision changes.
        ctx.globalAlpha = (photoLabelFade > 0 ? 1 : 0) * dimFactor;
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

        // Hairline ring with layer-color shadow glow — luminous edge, not a
        // band. Kept on the original gradual photoOpacity fade (not the
        // snapped alpha above) — a thin ring easing in reads nothing like a
        // whole tinted photo, so there's no reason to give up its smoother
        // appearance too.
        ctx.globalAlpha = photoOpacity;
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
      // Tier 1 — hub landmarks (score ≥ threshold, OR one of the anchors
      // regardless of raw score — in practice the top ANCHOR_COUNT are
      // almost certainly already above the threshold, but this makes it
      // exact rather than assumed), never when dimmed. Still zoom-gated like
      // everyone else (see photoOpacity below) — "always" means "without
      // needing hover/focus/path", not "regardless of zoom."
      // Tier 2 — hover: the hovered node only
      // Tier 3 — focus: the focused node + every direct neighbor
      const alwaysLabel = (isAnchor || score >= ALWAYS_LABEL_THRESHOLD) && !isDimmed;
      const showLabel   = isFocused || isNeighbor || isHovered || alwaysLabel || isInPath || isSetMember;

      // Per-frame label/circle queues are reset once in onRenderFramePre (see
      // handleRenderFramePre), not here — see that reset's comment for why a
      // >10ms-gap timing heuristic between drawNode calls was unreliable.

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
        // Anchors used to get dimFactor here (never fades with zoom, only
        // with dimming), so the graph's dozen biggest names stayed lettered
        // in at full cloud zoom, before the background wash even starts
        // clearing. Switched to the same photoOpacity every other label
        // uses — names (anchors included) now stay fully hidden through
        // cloud zoom and only resolve in as the background itself starts
        // transitioning toward detail zoom, same fade window as everything
        // else on this canvas.
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
          fontSize, bright, alpha: photoOpacity,
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
      // Final, single multiplier for the evidence filter. Deliberately NOT a
      // branch: drawLink already has six alpha paths (focus, hover, path,
      // core-thread, idle-web, arrows) and adding a seventh condition to each
      // is how the isInFocusCluster/isFocusModeActive class of bug happened.
      // One factor, multiplied into every alpha computation. Most paths bake
      // alpha into the strokeStyle rgba string rather than ctx.globalAlpha, so
      // this has to reach the numbers, not the context. The two core-thread
      // strokes inherit it via coreEdgeAlpha.
      const evidenceMult = edgePassesEvidenceFilter(l, evidenceFilter)
        ? 1
        : EVIDENCE_FAIL_ALPHA_MULT;

      const isPathEdge   = pathEdges.has(edgeKey);
      // Focus edges: any edge touching the focused node
      const isFocusEdge  = selectedId !== null && (srcId === selectedId || tgtId === selectedId);
      // Hover brightened edge — only when no focus mode AND no genre/scene
      // set is active. Without the set check, hovering a node outside an
      // active set would light up its real, unrelated edges — exactly the
      // "connections to nodes not in shoegaze" leak the set filter exists
      // to prevent.
      const isSetModeActive = highlightSetMemberSet.size > 0;
      const isHoverEdge  = hoveredId !== null && selectedId === null && !isSetModeActive &&
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
      // for edges). Forced to 1 whenever a focus view is open so the
      // highlighted edges themselves (path/focus/hover/set, below) stay
      // solid regardless of zoom — this one is deliberately left on the
      // broad isFocusModeActive (focus OR set), not just node-focus, because
      // it only ever reaches the branches that render an edge we WANT lit.
      const isFocusModeActive = selectedId !== null || highlightSetMemberSet.size > 0;
      const edgeFade = isFocusModeActive ? 1 : computeZoomFade(globalScale, 0);
      // Separate fade for the two BACKGROUND branches below (idle, core-edge)
      // — these render the ghost web, not anything highlighted, so they
      // should never inherit the "stay solid" override just because a
      // genre/scene set happens to also be active. isNodeFocusActive (click-
      // focus only) keeps that override where it's correct — a focus
      // cluster always zooms in tight — while a set's ghost edges follow the
      // real cloud-zoom curve instead, same reasoning as drawNode's
      // isNodeFocusActive split.
      const isNodeFocusActive = selectedId !== null;
      const ghostEdgeFade = isNodeFocusActive ? 1 : computeZoomFade(globalScale, 0);

      ctx.save();

      if (isPathEdge) {
        // Chromatic aberration for path-finding mode
        const offsets = [
          { dx: -1, color: `rgba(255, 30, 90, ${(0.9 * edgeFade * evidenceMult).toFixed(3)})` },
          { dx:  0, color: `rgba(242, 168, 196, ${(0.9 * edgeFade * evidenceMult).toFixed(3)})` },
          { dx:  1, color: `rgba(0, 200, 255, ${(0.9 * edgeFade * evidenceMult).toFixed(3)})` },
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
        ctx.globalAlpha = ((EDGE_IDLE_ALPHA + (0.82 - EDGE_IDLE_ALPHA) * glow) * edgeFade) * evidenceMult;
        ctx.lineWidth = EDGE_IDLE_WIDTH + (2 - EDGE_IDLE_WIDTH) * glow;
        ctx.setLineDash([]);
        ctx.stroke();
      } else if (isHoverEdge) {
        // Brightened tint on hover (no aberration), same fade-up as focus edges.
        const alpha = (EDGE_IDLE_ALPHA + (0.75 - EDGE_IDLE_ALPHA) * glow) * edgeFade * evidenceMult;
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
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${(0.7 * edgeFade * evidenceMult).toFixed(3)})`);
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else if (isCoreEdge && ghostEdgeFade < 1) {
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
        const coreEdgeAlpha = (CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM + (EDGE_IDLE_ALPHA - CORE_EDGE_THREAD_ALPHA_AT_CLOUD_ZOOM) * ghostEdgeFade) * evidenceMult;
        // The glow is a wide, fainter underlay stroke — NOT ctx.shadowBlur.
        //
        // shadowBlur is the most expensive primitive in Canvas 2D (it forces
        // an offscreen blur pass per draw), and this branch runs for all 126
        // core-touching edges on every frame at cloud zoom AND throughout
        // genre/scene set mode, where ghostEdgeFade is 0 so the blur ran at
        // full strength. That was the whole reason set mode felt like ~20fps
        // while click-focus felt like 60: click-focus sets ghostEdgeFade to 1
        // and skips this branch entirely, so it never paid the cost.
        //
        // Two plain strokes cost essentially nothing and read the same at
        // these alphas — the thread tops out at 0.015 opacity, so the blur
        // was buying a barely-perceptible softening at an enormous price.
        // CORE_EDGE_THREAD_GLOW_BLUR is reused as the width delta so the
        // existing tuning constant still means "how soft is this filament."
        // Do not reintroduce shadowBlur here.
        const glowSpread = CORE_EDGE_THREAD_GLOW_BLUR * (1 - ghostEdgeFade);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        if (glowSpread > 0) {
          ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${(coreEdgeAlpha * CORE_EDGE_THREAD_GLOW_ALPHA_FRACTION).toFixed(4)})`);
          ctx.lineWidth = EDGE_IDLE_WIDTH + glowSpread;
          ctx.stroke();
        }
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${coreEdgeAlpha.toFixed(3)})`);
        ctx.lineWidth = EDGE_IDLE_WIDTH;
        ctx.stroke();
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
        const idleEdgeAlpha = (IDLE_EDGE_ALPHA_AT_CLOUD_ZOOM + (EDGE_IDLE_ALPHA - IDLE_EDGE_ALPHA_AT_CLOUD_ZOOM) * ghostEdgeFade) * evidenceMult;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, `${idleEdgeAlpha.toFixed(3)})`);
        ctx.lineWidth = EDGE_IDLE_WIDTH;
        ctx.stroke();
      }

      ctx.restore();
    },
    [selectedId, hoveredId, pathEdges, focusedNode, highlightSetMemberSet, evidenceFilter],
  );

  // ── Realm cloud (electronic only, overview only) ────────────────────────
  // Fires before links/nodes are painted (see the CLOUD_* constants above),
  // so everything drawn here sits fully behind them.
  const handleRenderFramePre = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Unconditional, before any early return below — linkDirectionalArrowColor
    // reads this every frame regardless of focus/zoom state (see its own gate).
    currentGlobalScaleRef.current = globalScale;

    // Reset the label-placement queues exactly once per frame, here — the
    // one hook guaranteed to fire once per render pass before any node is
    // drawn. Previously this reset lived inside drawNode itself, guarded by
    // "has more than 10ms passed since the last reset" as a proxy for "is
    // this a new frame" (drawNode runs once per NODE, not once per frame,
    // so it has no direct signal for that). On a slower frame — all ~293
    // nodes plus edges/glows/labels genuinely can take that long — a stall
    // partway through one frame's node loop could cross the 10ms mark, so
    // the heuristic fired again mid-frame: it wiped nodeCirclesRef/
    // labelQueueRef midway through registering that same frame's nodes,
    // so the collision search for labels processed after the false reset
    // no longer saw the nodes drawn before it. A forced/anchor label (e.g.
    // The Velvet Underground, always labeled) could land in a different
    // spot than the one processed moments earlier in the same frame,
    // depending on exactly when the misfire happened — read as the label
    // flickering between two positions once every so often, worse whenever
    // the frame was already slow enough to trigger it.
    labelQueueRef.current  = [];
    nodeCirclesRef.current = [];

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
    // Twinkle is one extra Math.sin per star per frame using each star's own
    // pre-generated phase/period (see DustStar) — no gradient reconstruction,
    // so this doesn't repeat the earlier twinkle attempt's lag regression
    // (that one rebuilt a CanvasGradient per star per frame; this is just an
    // alpha multiplier on the same plain fill already happening here).
    ctx.save();
    const dustFade = cloudFade; // fades out on zoom-in alongside everything else at cloud zoom
    const twinkleNow = performance.now();
    for (const star of dustStars) {
      const twinkle = DUST_STAR_TWINKLE_FLOOR
        + (1 - DUST_STAR_TWINKLE_FLOOR) * (0.5 + 0.5 * Math.sin(twinkleNow / star.twinklePeriodMs * Math.PI * 2 + star.twinklePhase));
      ctx.globalAlpha = star.alpha * dustFade * twinkle;
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
      // Same hover-gate as drawNode's isSetModeActive — a hovered node
      // outside an active genre/scene set must not get the enlarged
      // isHovered hit-area treatment, mirroring what click-focus already
      // does via its own selectedId !== null check.
      const isSetModeActive     = highlightSetMemberSet.size > 0;
      const isHovered           = n.id === hoveredId && selectedId === null && !isSetModeActive;
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
      // same reference selection, same ordering before the floor below) or
      // the clickable area drifts out of sync with the shrunk visual circle.
      er *= computeZoomSizeMult(globalScale, isSetModeActive ? SET_ZOOM_SIZE_REFERENCE : ZOOM_SIZE_REFERENCE);
      // Mirrors drawNode's click-focus readability floor exactly, so the
      // clickable area always matches the enlarged visual circle — no dead
      // zone around a node that reads bigger on screen than it hit-tests.
      if (selectedId !== null && (isFocused || isNeighbor)) {
        const minScreenR = isFocused ? FOCUS_MIN_SCREEN_R : NEIGHBOR_MIN_SCREEN_R;
        er = Math.max(er, minScreenR / globalScale);
      }
      // Touch only: floor the hit target at a fingertip. This is a DELIBERATE
      // break from the "must mirror drawNode exactly" rule above, and the only
      // one in this function — a hit area LARGER than the visual circle costs
      // nothing (d3 picks the topmost hit, and the paint is invisible), while
      // the reverse leaves dead zones. At the full-constellation zoom a phone
      // now lands on, a mid-tier node draws about 3px across; nobody can tap
      // that. Converted through globalScale because er is in graph space and
      // MIN_TOUCH_SCREEN_R is the screen-pixel size a finger actually needs.
      if (isCoarsePointer) {
        er = Math.max(er, MIN_TOUCH_SCREEN_R / globalScale);
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, er + RING_WIDTH, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [selectedId, hoveredId, neighborSet, pathSet, highlightSetMemberSet, isCoarsePointer],
  );

  // Kept in sync with the library unconditionally, even while the pointer is
  // off-canvas — the suppression lives in the derived hoveredId above. Doing
  // it that way round means re-entering the canvas over the same node the
  // library still considers hovered restores the highlight immediately; if
  // this callback dropped those events instead, the library would see no
  // change to report and the node would stay un-highlighted until the pointer
  // moved to a different one and back.
  const handleNodeHover = useCallback((node: object | null) => {
    const n = node as GraphNode | null;
    setRawHoveredId(n?.id ?? null);
  }, []);

  const handleNodeClick = useCallback(
    (node: object) => {
      const n = node as GraphNode;
      // Clicking a member of the active genre/scene set should re-center
      // the set on that member, not exit to a full single-artist focus
      // (which would pull in every real connection, most of them outside
      // the set). Clicking anything else — a non-member, or any node when
      // no set is active — keeps the existing onNodeClick behavior.
      if (highlightSetMemberSet.has(n.id) && onSetMemberClick) {
        onSetMemberClick(n.id);
      } else {
        onNodeClick(n.id);
      }
    },
    [onNodeClick, onSetMemberClick, highlightSetMemberSet],
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
      {dimensions && <div
        className="graph-canvas-reveal"
        style={{ width: '100%', height: '100%' }}
        // enter/leave rather than over/out: these don't re-fire as the pointer
        // crosses into the canvas child, so this is a true "is the cursor on
        // the graph" signal. See the rawHoveredId/pointerOverCanvas comment.
        onPointerEnter={() => setPointerOverCanvas(true)}
        onPointerLeave={() => setPointerOverCanvas(false)}
      >
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
          linkDirectionalArrowLength={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            // Arrows only on focused/hovered/set-highlighted edges — direction
            // matters there. Plain resting edges (the general web, including
            // path-find mode) get no arrowhead at all: just a line. The
            // hover clause is suppressed while a genre/scene set is active
            // (same reasoning as drawLink's isHoverEdge) — otherwise
            // hovering a node outside the set draws an arrowhead on one of
            // its real, unrelated edges.
            const isSetModeActive = highlightSetMemberSet.size > 0;
            const isHighlightedEdge =
              (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ||
              (hoveredId !== null && selectedId === null && !isSetModeActive && (srcId === hoveredId || tgtId === hoveredId)) ||
              (highlightSetMemberSet.size > 0 && (highlightSetMemberSet.has(srcId) && highlightSetMemberSet.has(tgtId)));
            return isHighlightedEdge ? 9 : 0;
          }}
          linkDirectionalArrowRelPos={(link: object) => {
            const l = link as GraphLink;
            const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
            const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
            // Focus/hover/set edges: midpoint keeps the arrow in open space,
            // away from node images. Same hover-suppression-during-set-mode
            // reasoning as linkDirectionalArrowLength above.
            const isSetModeActive = highlightSetMemberSet.size > 0;
            const isHighlightedEdge =
              (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ||
              (hoveredId !== null && selectedId === null && !isSetModeActive && (srcId === hoveredId || tgtId === hoveredId)) ||
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
          // Dragging is OFF on purpose. This layout is authored, not emergent:
          // presettleLayout solves it over PRESETTLE_TICKS before the canvas
          // mounts, cooldownTicks starts at 0 so the live engine renders those
          // positions untouched, and each realm sits at a hand-assigned angle
          // (REALM_ANGLE_DEG). Position carries meaning here.
          //
          // The library calls resetCountdown() on drag, which reheats the
          // simulation to full alpha with every force live (charge, link,
          // center, collide, realmX/realmY), so all ~293 nodes re-settle at
          // once — pulling one node visibly convulsed the whole constellation.
          // Worse mid-focus, where applySpreadForCluster writes x/y by hand and
          // stashes originals in savedPositionsRef: the reheat drags nodes off
          // their spread targets while restore-on-deselect still writes the
          // saved values back, leaving physics and spread state disagreeing.
          //
          // Pinning nodes (fx/fy) so only the dragged one moves was considered
          // and rejected — it fights applySpreadForCluster, which animates x/y
          // directly and would be overridden by pinned coordinates.
          enableNodeDrag={false}
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
