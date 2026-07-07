'use client';

import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { Artist, Edge, GraphData, Layer } from '@/data/types';
import { LAYER_COLORS, LAYER_GLOW } from '@/lib/colors';
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

// Edge colors tinted toward source-node layer. All influence edges render
// uniformly regardless of verified/ai-suggested status — see Edge['status']
// in data/types.ts, still recorded in the data but no longer distinguished visually.
const EDGE_TINT: Record<Layer, string> = {
  root:                'rgba(232, 200, 122, 0.4)',
  'post-punk':         'rgba(136, 145, 242, 0.4)',
  'shoegaze-dreampop': 'rgba(242, 168, 196, 0.4)',
  'indie-alt':         'rgba(95,  208, 192, 0.4)',
  outside:             'rgba(237, 235, 245, 0.38)',
};

// Always-on label threshold: nodes with influenceScore >= this get permanent labels.
// Scores: VU=20, MBV=9, CT=8, Television=5, SY=5, JAMC=4, Slowdive=4, Bowie=4…
// Threshold of 5 → exactly the top 5 hubs, no others.
const ALWAYS_LABEL_THRESHOLD = 5;

// Dim target alpha when a highlight (hover/focus/path) is active.
const DIM_ALPHA = 0.09;
const TRANSITION_MS = 220;

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

  // ── Animated dim level ──────────────────────────────────────────────────────
  // Stored in a ref so the canvas rAF loop picks it up without React re-renders.
  const dimLevelRef = useRef(1.0); // 1.0 = full brightness; DIM_ALPHA = dimmed
  const animFrameRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);
  // Tracks whether a cluster (single-node or set) was active last run, so we
  // don't trigger zoomToFit on initial mount but do on a genuine deselect.
  const prevClusterActiveRef = useRef(false);
  // Guards the one-time initial fit so window resizes don't re-trigger it
  const didInitialFitRef = useRef(false);
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

  useEffect(() => {
    prefersReducedMotionRef.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ── Initial fit — runs once on the first real dimension snapshot ─────────────
  // By waiting for ResizeObserver we guarantee ForceGraph2D was initialized with
  // the correct canvas size, so warmupTicks and d3-zoom are both valid.
  // Skip zoomToFit when an artist/genre/scene is already pre-selected (from
  // URL); the camera focus effect handles framing in that case — including
  // the fresh-mount case where node positions aren't ready yet, via the
  // pendingClusterKeyRef/onEngineStop retry below, so framing is guaranteed
  // to happen either way.
  const hasPreselectedCluster = !!selectedId || !!(highlightSetIds && highlightSetIds.length > 0);
  useEffect(() => {
    if (!dimensions || didInitialFitRef.current) return;
    if (hasPreselectedCluster) {
      // Pre-selected from URL — camera focus effect handles framing.
      didInitialFitRef.current = true;
      return;
    }
    didInitialFitRef.current = true;
    const raf = requestAnimationFrame(() => {
      const dur = prefersReducedMotionRef.current ? 0 : 600;
      graphRef.current?.zoomToFit(dur, 60);
    });
    return () => cancelAnimationFrame(raf);
  }, [dimensions, hasPreselectedCluster]);

  useEffect(() => {
    const isActive =
      selectedId !== null ||
      hoveredId !== null ||
      (highlightSetIds !== null && highlightSetIds.length > 0) ||
      (highlightPath !== null && highlightPath.length > 0);
    const target = isActive ? DIM_ALPHA : 1.0;

    cancelAnimationFrame(animFrameRef.current);

    if (prefersReducedMotionRef.current) {
      dimLevelRef.current = target;
      return;
    }

    const from = dimLevelRef.current;
    if (Math.abs(from - target) < 0.005) return;

    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / TRANSITION_MS, 1);
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      dimLevelRef.current = from + (target - from) * eased;
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

  // ── Stable graph data (created once — prevents simulation restart) ──────────
  const stableData = useMemo(
    () => ({
      nodes: graphData.artists.map(a => ({ ...a })) as GraphNode[],
      links: graphData.edges.map(e => ({ ...e })) as GraphLink[],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Force config (hairball guard) ───────────────────────────────────────────
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-600);
    fg.d3Force('link')?.distance(110).strength(0.25);
    fg.d3Force('center')?.strength(0.04);
    fg.d3VelocityDecay?.(0.38);
  }, []);

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
        fg.zoomToFit(duration, 60);
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
    if (pendingClusterKeyRef.current && pendingClusterKeyRef.current === activeClusterKey) {
      if (animateClusterIntoView(activeClusterIds)) pendingClusterKeyRef.current = null;
    }
  }, [activeClusterKey, activeClusterIds, animateClusterIntoView]);

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

      const color = LAYER_COLORS[n.layer];
      const glow  = LAYER_GLOW[n.layer];

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
      const er = showPhoto
        ? Math.min(Math.max(r, minPhotoR), maxPhotoR)
        : r;

      ctx.save();
      ctx.globalAlpha = alpha;

      // ── Outer bloom haze ──
      if (!isDimmed) {
        const bloomMult = isFocused ? 4.0 : isHovered ? 3.5 : 2.8;
        const bloomR = er * bloomMult;
        const grad = ctx.createRadialGradient(n.x, n.y, er * 0.5, n.x, n.y, bloomR);
        grad.addColorStop(0,    glow.replace('0.7)', isFocused ? '0.30)' : '0.22)'));
        grad.addColorStop(0.5,  glow.replace('0.7)', '0.07)'));
        grad.addColorStop(1,    glow.replace('0.7)', '0)'));
        ctx.beginPath();
        ctx.arc(n.x, n.y, bloomR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Core shadow glow ──
      ctx.shadowBlur = isFocused ? 32
                     : isHovered ? 22
                     : isInPath  ? 16
                     : score >= ALWAYS_LABEL_THRESHOLD ? 14
                     : 10;
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
        const fontSize = Math.max(7, Math.min(9, 8 / globalScale));
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
      const srcLayer     = (srcNode as GraphNode).layer;
      const edgeColor    = EDGE_TINT[srcLayer];

      const hasHighlight = selectedId !== null || hoveredId !== null || pathSet.size > 0 || highlightSetMemberSet.size > 0;
      const isDimmed     = hasHighlight && !isPathEdge && !isFocusEdge && !isHoverEdge && !isSetEdge;

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
        // Focused artist's own layer color — their world glows in their color
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = LAYER_COLORS[focusedNode.layer];
        ctx.globalAlpha = 0.82;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();
      } else if (isHoverEdge) {
        // Brightened tint on hover (no aberration)
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor.replace(/[\d.]+\)$/, '0.75)');
        ctx.lineWidth = 1.6;
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
        // Normal or dimmed — use animated dim level
        ctx.globalAlpha = isDimmed ? dimLevelRef.current * 0.4 : 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      ctx.restore();
    },
    [selectedId, hoveredId, pathSet, pathEdges, focusedNode, highlightSetMemberSet],
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

      // Collision avoidance: step outward + try 5 angles, check labels AND circles
      const dxBase    = lx - nx;
      const dyBase    = ly - ny;
      const baseDist  = Math.max(Math.sqrt(dxBase * dxBase + dyBase * dyBase), 0.01);
      const baseAngle = Math.atan2(dyBase, dxBase);

      let placed = false;
      outer:
      for (let step = 0; step < 6; step++) {
        const dist   = baseDist + step * textH * 1.8;
        const angles = step === 0
          ? [baseAngle]
          : [baseAngle, baseAngle + 0.35, baseAngle - 0.35,
             baseAngle + 0.7,  baseAngle - 0.7];

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
    (node: object, color: string, ctx: CanvasRenderingContext2D) => {
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
      const er = wantsPhoto ? Math.min(Math.max(r, minPhotoR), maxPhotoR) : r;

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
          Prevents the 800×600 → actual-size re-render that resets d3-zoom. */}
      {dimensions && <ForceGraph2D
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
            return LAYER_COLORS[focusedNode.layer];
          }
          const srcLayer = typeof l.source === 'object'
            ? (l.source as GraphNode).layer
            : 'outside' as Layer;
          const baseColor = EDGE_TINT[srcLayer];
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
        cooldownTicks={40}
        warmupTicks={300}
      />}
    </div>
  );
}
