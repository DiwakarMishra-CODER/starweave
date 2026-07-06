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

// ── Lazy image cache ─────────────────────────────────────────────────────────
// Persists across component remounts; canvas reads it on every frame.
// Values: 'loading' | HTMLImageElement (ready) | null (failed/no image)
const imgCache = new Map<string, HTMLImageElement | 'loading' | null>();

// Photo rendering constants
const RING_WIDTH   = 2.5;   // colored ring that wraps the photo
const PHOTO_MIN_R  = 9;     // min canvas radius for a recognizable face
const PHOTO_MAX_R  = 22;    // cap so large hubs don't overwhelm layout

// Edge colors tinted toward source-node layer
const EDGE_TINT: Record<Layer, { verified: string; suggested: string }> = {
  root:                { verified: 'rgba(232, 200, 122, 0.4)',  suggested: 'rgba(232, 200, 122, 0.14)' },
  'post-punk':         { verified: 'rgba(136, 145, 242, 0.4)',  suggested: 'rgba(136, 145, 242, 0.14)' },
  'shoegaze-dreampop': { verified: 'rgba(242, 168, 196, 0.4)',  suggested: 'rgba(242, 168, 196, 0.14)' },
  'indie-alt':         { verified: 'rgba(95,  208, 192, 0.4)',  suggested: 'rgba(95,  208, 192, 0.14)' },
  outside:             { verified: 'rgba(237, 235, 245, 0.38)', suggested: 'rgba(237, 235, 245, 0.13)' },
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

interface Props {
  graphData: GraphData;
  activeLayers: Set<Layer>;
  highlightPath: string[] | null;
  selectedId: string | null;       // clicked node → focus mode
  onNodeClick: (artistId: string) => void;
  onBackgroundClick: () => void;   // click empty canvas → clear focus
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
  // Tracks the previous selectedId so we don't trigger zoomToFit on initial mount
  const prevSelectedIdRef = useRef<string | null>(null);
  // Guards the one-time initial fit so window resizes don't re-trigger it
  const didInitialFitRef = useRef(false);
  // Per-frame label state — both refs reset together at each new frame.
  const labelQueueRef  = useRef<LabelCandidate[]>([]);
  const nodeCirclesRef = useRef<Array<{ x: number; y: number; r: number }>>([]);
  const labelFrameRef  = useRef(0); // performance.now() snapshot of last reset
  // Saves original cluster positions so they can be restored on deselect.
  const savedPositionsRef = useRef<Map<string, { x: number; y: number }> | null>(null);

  useEffect(() => {
    prefersReducedMotionRef.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ── Initial fit — runs once on the first real dimension snapshot ─────────────
  // By waiting for ResizeObserver we guarantee ForceGraph2D was initialized with
  // the correct canvas size, so warmupTicks and d3-zoom are both valid.
  useEffect(() => {
    if (!dimensions || didInitialFitRef.current) return;
    didInitialFitRef.current = true;
    const raf = requestAnimationFrame(() => {
      const dur = prefersReducedMotionRef.current ? 0 : 600;
      graphRef.current?.zoomToFit(dur, 60);
    });
    return () => cancelAnimationFrame(raf);
  }, [dimensions]);

  useEffect(() => {
    const isActive =
      selectedId !== null ||
      hoveredId !== null ||
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
  }, [selectedId, hoveredId, highlightPath]);

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

  // ── Spotlight spread — fires before the camera effect on the same selectedId change ──
  // Moves focused cluster nodes outward so the camera frames the already-spread
  // positions. Restores originals on deselect (or when switching to a different node).
  useEffect(() => {
    // Always restore first — handles both deselect and node-to-node switches.
    if (savedPositionsRef.current) {
      for (const [id, pos] of savedPositionsRef.current) {
        const node = stableData.nodes.find(n => n.id === id);
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

    if (!selectedId) return;

    const focused = stableData.nodes.find(n => n.id === selectedId);
    if (focused?.x === undefined || focused?.y === undefined) return;

    const neighborIds = getNeighbors(selectedId, graphData.edges);
    const clusterNodes = stableData.nodes.filter(
      n => (n.id === selectedId || neighborIds.has(n.id))
        && n.x !== undefined && n.y !== undefined,
    );
    if (clusterNodes.length < 2) return;

    // Save originals
    const saved = new Map<string, { x: number; y: number }>();
    for (const n of clusterNodes) saved.set(n.id, { x: n.x!, y: n.y! });
    savedPositionsRef.current = saved;

    // Centroid of the cluster
    const cx = clusterNodes.reduce((s, n) => s + n.x!, 0) / clusterNodes.length;
    const cy = clusterNodes.reduce((s, n) => s + n.y!, 0) / clusterNodes.length;

    // Scale each node outward from the centroid so nodes fill the frame
    // with comfortable gaps. Simulation is paused after initial cooldown,
    // so these positions hold until we restore them on deselect.
    const SPREAD = 2.6;
    for (const n of clusterNodes) {
      const dx = n.x! - cx;
      const dy = n.y! - cy;
      n.x = cx + dx * SPREAD;
      n.y = cy + dy * SPREAD;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n as any).vx = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n as any).vy = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ── Camera focus on node click ──────────────────────────────────────────────
  // Frame the selected node + its direct neighbors in the left portion of the
  // canvas (accounting for the info panel on the right).
  //
  // d3-zoom runs ONE transition per selection at a time — calling zoom() and
  // centerAt() both with a duration cancels whichever started first and only
  // runs the second.  Fix: set zoom instantly (ms=0, no transition created),
  // then animate only the pan via centerAt.
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;

    const wasSelected = prevSelectedIdRef.current;
    prevSelectedIdRef.current = selectedId;

    const duration = prefersReducedMotionRef.current ? 0 : CAMERA_MS;

    if (!selectedId) {
      // Only zoom out if we actually had a selection before — never on mount.
      if (wasSelected !== null) {
        fg.zoomToFit(duration, 60);
      }
      return;
    }

    // Guard: skip if the selected node hasn't been placed by the simulation yet.
    const selectedNode = stableData.nodes.find(n => n.id === selectedId);
    if (selectedNode?.x === undefined || selectedNode?.y === undefined) return;

    // Collect positions of selected node + direct neighbors.
    const neighborIds = getNeighbors(selectedId, graphData.edges);
    const relevantNodes = stableData.nodes.filter(
      n => (n.id === selectedId || neighborIds.has(n.id)) &&
           n.x !== undefined && n.y !== undefined,
    );
    if (relevantNodes.length === 0) return;

    const xs = relevantNodes.map(n => n.x as number);
    const ys = relevantNodes.map(n => n.y as number);
    const minX = Math.min(...xs) - CAMERA_PADDING;
    const maxX = Math.max(...xs) + CAMERA_PADDING;
    const minY = Math.min(...ys) - CAMERA_PADDING;
    const maxY = Math.max(...ys) + CAMERA_PADDING;

    const bbW = maxX - minX;
    const bbH = maxY - minY;
    if (bbW < 1 || bbH < 1) return; // degenerate bounding box

    // Canvas dimensions read live from the DOM (never stale-captured from state).
    const canvasW = containerRef.current?.offsetWidth  ?? 800;
    const canvasH = containerRef.current?.offsetHeight ?? 600;

    // Clear canvas area: full width minus right panel and left UI insets.
    const availW = Math.max(canvasW - PANEL_WIDTH - LEFT_UI_WIDTH, 200);
    const availH = Math.max(canvasH, 200);

    // Zoom level that fits the cluster in the clear area, capped.
    const targetZoom = Math.max(
      Math.min(availW / bbW, availH / bbH, MAX_ZOOM),
      0.5,
    );

    // Bounding-box centre in graph space.
    const centerGX = (minX + maxX) / 2;
    const centerGY = (minY + maxY) / 2;

    // Camera centre offset so the cluster lands in the clear area between
    // LEFT_UI_WIDTH and (canvasW - PANEL_WIDTH).
    // Derivation: screen_x_of_centerGX = (centerGX - camX)*zoom + canvasW/2
    //   target: (canvasW + LEFT_UI_WIDTH - PANEL_WIDTH) / 2
    //   → camX = centerGX + (PANEL_WIDTH - LEFT_UI_WIDTH) / (2 * zoom)
    const camX = centerGX + (PANEL_WIDTH - LEFT_UI_WIDTH) / (2 * targetZoom);

    // Step 1 — instant zoom (no d3-zoom transition → no conflict with step 2).
    fg.zoom(targetZoom, 0);
    // Step 2 — animated pan to the panel-adjusted centre.
    fg.centerAt(camX, centerGY, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

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

      const hasHighlight =
        selectedId !== null || hoveredId !== null || pathSet.size > 0;

      const isDimmed =
        hasHighlight &&
        !isFocused &&
        !isNeighbor &&
        !isHovered &&
        !isHoverNeighbor &&
        !isInPath;

      // Animated alpha for dimmed nodes (reads live from ref — smooth without re-renders)
      const alpha = isDimmed ? dimLevelRef.current : 1.0;

      // ── Size ──
      // In focus mode, both the selected node and its neighbors scale up so
      // images and labels are clearly legible. Relative size order is preserved
      // (focused > hub-neighbor > small-neighbor). Hover/path modes unchanged.
      const isInFocusCluster = selectedId !== null && (isFocused || isNeighbor);
      const r = isInFocusCluster
        ? (isFocused ? baseR * 2.8 : baseR * 1.9)
        : isHovered  ? baseR * 1.5
        : isInPath   ? baseR * 1.25
        : baseR;

      const color = LAYER_COLORS[n.layer];
      const glow  = LAYER_GLOW[n.layer];

      // ── Photo eligibility ─────────────────────────────────────────────────
      // Resting state: hub nodes (score ≥ threshold) always show photo.
      // Focus mode: focused node + ALL neighbors show their photo — they're
      // big enough to be recognizable and it's the whole point of the spotlight.
      const wantsPhoto =
        (score >= ALWAYS_LABEL_THRESHOLD || isFocused || (selectedId !== null && isNeighbor))
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
      const showLabel   = isFocused || isNeighbor || isHovered || alwaysLabel || isInPath;

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
        const bright   = isFocused || isNeighbor || alwaysLabel || isInPath;
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
    [selectedId, hoveredId, pathSet, neighborSet, focusedNode],
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
      const isVerified   = l.status === 'verified';
      const srcLayer     = (srcNode as GraphNode).layer;
      const edgeColor    = EDGE_TINT[srcLayer][isVerified ? 'verified' : 'suggested'];

      const hasHighlight = selectedId !== null || hoveredId !== null || pathSet.size > 0;
      const isDimmed     = hasHighlight && !isPathEdge && !isFocusEdge && !isHoverEdge;

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
      } else {
        // Normal or dimmed — use animated dim level
        ctx.globalAlpha = isDimmed ? dimLevelRef.current * 0.4 : 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = isVerified ? 1.1 : 0.8;
        if (!isVerified) ctx.setLineDash([4, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    },
    [selectedId, hoveredId, pathSet, pathEdges, focusedNode],
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
      const isFocused        = n.id === selectedId;
      const isNeighbor       = selectedId !== null ? neighborSet.has(n.id) : false;
      const isHovered        = n.id === hoveredId && selectedId === null;
      const isInPath         = pathSet.has(n.id);
      const isInFocusCluster = selectedId !== null && (isFocused || isNeighbor);

      const r = isInFocusCluster
        ? (isFocused ? baseR * 2.8 : baseR * 1.9)
        : isHovered  ? baseR * 1.5
        : isInPath   ? baseR * 1.25
        : baseR;

      const wantsPhoto = (score >= ALWAYS_LABEL_THRESHOLD || isFocused || (selectedId !== null && isNeighbor)) && !!n.imageUrl;
      const minPhotoR  = isInFocusCluster ? 14 : PHOTO_MIN_R;
      const maxPhotoR  = isInFocusCluster ? 48 : PHOTO_MAX_R;
      const er = wantsPhoto ? Math.min(Math.max(r, minPhotoR), maxPhotoR) : r;

      ctx.beginPath();
      ctx.arc(n.x, n.y, er + RING_WIDTH, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [selectedId, hoveredId, neighborSet, pathSet],
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
          return (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ? 9 : 3;
        }}
        linkDirectionalArrowRelPos={(link: object) => {
          const l = link as GraphLink;
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
          // Focus edges: midpoint keeps the arrow in open space, away from node images
          return (selectedId !== null && (srcId === selectedId || tgtId === selectedId)) ? 0.5 : 0.85;
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
          return EDGE_TINT[srcLayer][l.status === 'verified' ? 'verified' : 'suggested'];
        }}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        onBackgroundClick={onBackgroundClick}
        enableNodeDrag
        enableZoomInteraction
        enablePanInteraction
        cooldownTicks={120}
        warmupTicks={40}
      />}
    </div>
  );
}
