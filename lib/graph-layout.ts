// The graph's layout: where every artist sits on the map. Shared by the
// canvas (components/graph/ForceGraph.tsx), which registers these same forces
// on the live simulation, and by the build (scripts/build-graph.ts), which
// runs presettleLayout once and stores each artist's settled position in
// public/graph.json — so the browser never has to solve 300 ticks before it
// can draw anything. The layout is a pure, deterministic function of the
// artists and edges: the build's positions are the ones the browser would
// have computed.

import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force-3d';

// The shape both callers' nodes and links share, as far as the layout cares.
export interface LayoutNode {
  id: string;
  realm?: string;
  influenceScore?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface LayoutLink {
  source: LayoutNode | string;
  target: LayoutNode | string;
}

// Photo rendering constants — here because a node's collision footprint
// depends on how large its photo is drawn (see restingNodeRadius).
export const RING_WIDTH   = 2.5;   // colored ring that wraps the photo
export const PHOTO_MIN_R  = 9;     // min canvas radius for a recognizable face
export const PHOTO_MAX_R  = 22;    // cap so large hubs don't overwhelm layout
// Always-on label threshold: nodes with influenceScore >= this get permanent labels.
// Scores: VU=20, MBV=9, CT=8, Television=5, SY=5, JAMC=4, Slowdive=4, Bowie=4…
// Threshold of 5 → exactly the top 5 hubs, no others.
export const ALWAYS_LABEL_THRESHOLD = 5;

// ── Collision force ──────────────────────────────────────────────────────────
// True resting (non-focused/non-hovered) outer radius of a node — base circle
// per drawNode's baseR/PHOTO_MIN_R/PHOTO_MAX_R clamp, PLUS RING_WIDTH for any
// node that shows a photo at rest (score >= ALWAYS_LABEL_THRESHOLD): drawNode
// draws a hairline ring right at the photo edge, but paintNodePointerArea
// below already treats `er + RING_WIDTH` as that node's real circular
// footprint (its own comment: "the entire node — photo, ring, glow"). The
// previous version of this force used bare `er`, undercounting hub/photo
// nodes' true footprint by RING_WIDTH on each side.
export function restingNodeRadius(score: number): number {
  const baseR = 3.5 + Math.sqrt(score) * 2.2;
  const hasPhoto = score >= ALWAYS_LABEL_THRESHOLD;
  const clamped = hasPhoto ? Math.min(Math.max(baseR, PHOTO_MIN_R), PHOTO_MAX_R) : baseR;
  return hasPhoto ? clamped + RING_WIDTH : clamped;
}

// Padding on top of the touching-radius so nodes get a clearly visible gap,
// not just a non-touching one.
export const COLLIDE_PADDING = 3;

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
export const COLLIDE_ITERATIONS = 3;

export function createCollideForce(padding: number) {
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
export const PRESETTLE_TICKS = 300;

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
export const REALM_RADIUS_X = 260; // ellipse semi-axis, horizontal — wider than tall to fill a landscape viewport
export const REALM_RADIUS_Y = 165; // ellipse semi-axis, vertical
export const REALM_ANGLE_OFFSET = 0; // degrees — rotates the whole arrangement; spin to a pleasing orientation by eye
export const CORE_PULL_STRENGTH = 1.2;       // core-only horizontal pull toward center — core must be the most strongly-positioned thing in the graph so it wins against its own heavy edges into region-one, rather than getting dragged into that mass
export const CORE_PULL_STRENGTH_Y = 1.2;     // core-only vertical pull toward center — same strength as CORE_PULL_STRENGTH (core's target is the origin on both axes, so this being separate is harmless, not load-bearing)
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
export const VU_PULL_STRENGTH = CORE_PULL_STRENGTH * 2;
// One strength for BOTH axes on every non-core realm — deliberately
// isotropic. The old linear layout could get away with a weaker Y pull
// (every realm shared Y=0, so Y was just a vertical-compacting force, not a
// real separating axis) but a true ellipse needs equal pull on both axes:
// a realm placed near the top/bottom of the ellipse is mostly a Y-offset
// from center, one near the sides is mostly an X-offset, and an asymmetric
// strength would under-pull whichever axis matters more for a given realm's
// angle — settling some realms closer to center than others by accident of
// angle rather than by design.
export const REALM_PULL_STRENGTH = 0.6;
export const REALM_CHARGE = -22;             // charge (repulsion) for any realm-tagged node — weaker than the graph's normal -40 so each realm's bloom can pull tighter without its own internal repulsion fighting that pull. Realm-less nodes (every real region-one Artist on the plain graph) keep exactly -40 — see chargeStrength below.

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
export const REALM_ANGLE_DEG: Record<string, number> = {
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
export function computeRealmHomePositions(nodes: { realm?: string }[]): Map<string, { x: number; y: number }> {
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
export const LINK_STRENGTH_WITHIN = 0.25;                      // unchanged from the original single global value
export const LINK_STRENGTH_BRIDGE = LINK_STRENGTH_WITHIN / 3;      // general cross-realm weakening — roughly one-third of within
export const LINK_STRENGTH_CORE_BRIDGE = LINK_STRENGTH_BRIDGE / 4; // core↔region-one specifically — even weaker than the general bridge

export function edgeRealms(
  link: { source: { realm?: string } | string; target: { realm?: string } | string },
): [string | undefined, string | undefined] {
  const srcRealm = typeof link.source === 'object' ? link.source.realm : undefined;
  const tgtRealm = typeof link.target === 'object' ? link.target.realm : undefined;
  return [srcRealm, tgtRealm];
}

export function linkStrength(link: { source: { realm?: string } | string; target: { realm?: string } | string }): number {
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
export function makeRealmHomeX(homePositions: Map<string, { x: number; y: number }>) {
  return (node: { realm?: string }): number => {
    if (!node.realm) return 0; // unused — realmPullStrengthX returns 0 for this case, so this never moves the node
    return homePositions.get(node.realm)?.x ?? 0;
  };
}

export function makeRealmHomeY(homePositions: Map<string, { x: number; y: number }>) {
  return (node: { realm?: string }): number => {
    if (!node.realm) return 0; // unused — realmPullStrengthY returns 0 for this case, so this never moves the node
    return homePositions.get(node.realm)?.y ?? 0;
  };
}

export function realmPullStrengthX(node: { id: string; realm?: string }): number {
  if (node.id === 'velvet-underground') return VU_PULL_STRENGTH;
  if (node.realm === 'core') return CORE_PULL_STRENGTH;
  if (node.realm) return REALM_PULL_STRENGTH; // any non-core realm — data-driven, no per-realm branch needed
  return 0;
}

export function realmPullStrengthY(node: { id: string; realm?: string }): number {
  if (node.id === 'velvet-underground') return VU_PULL_STRENGTH;
  if (node.realm === 'core') return CORE_PULL_STRENGTH_Y;
  if (node.realm) return REALM_PULL_STRENGTH; // isotropic — see REALM_PULL_STRENGTH's comment above
  return 0;
}

export function chargeStrength(node: { realm?: string }): number {
  // Data-driven, matching realmPullStrengthX/Y above — ANY realm-tagged node
  // gets the weaker charge, not an enumerated list of known realm names.
  // The enumerated version silently gave a newly-added realm (folk-
  // confessional) the default -40 instead of REALM_CHARGE, nearly doubling
  // its nodes' mutual repulsion relative to region-one/electronic and
  // fighting its own realm-home pull — the direct cause of it failing to
  // cluster into a tight, separate cloud.
  return node.realm ? REALM_CHARGE : -40; // realm-less node (the plain region-one graph) keeps exactly -40, unchanged
}

export function presettleLayout(nodes: LayoutNode[], links: LayoutLink[]): void {
  const sim = forceSimulation(nodes, 2);
  sim.stop(); // d3-force schedules its own auto-tick timer on creation — must
              // stop it before it ever fires; we drive ticking manually below.
  sim.force('link', forceLink<LayoutNode, LayoutLink>(links).id(n => n.id).distance(75).strength(linkStrength));
  sim.force('charge', forceManyBody<LayoutNode>().strength(chargeStrength));
  sim.force('center', forceCenter().strength(0.04));
  sim.force('collide', createCollideForce(COLLIDE_PADDING));
  const realmHomePositions = computeRealmHomePositions(nodes);
  sim.force('realmX', forceX<LayoutNode>(makeRealmHomeX(realmHomePositions)).strength(realmPullStrengthX));
  sim.force('realmY', forceY<LayoutNode>(makeRealmHomeY(realmHomePositions)).strength(realmPullStrengthY));
  sim.velocityDecay(0.38);
  for (let i = 0; i < PRESETTLE_TICKS; i++) sim.tick();
}
