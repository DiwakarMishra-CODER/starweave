'use client';

// ─────────────────────────────────────────────────────────────
// ForceGraphLab — throwaway sandbox graph for island-two.
//
// This started as a from-scratch component modeled on the CONTRACT of
// components/graph/ForceGraph.tsx (graphData prop shape, plain
// react-force-graph-2d import, a small ResizeObserver for sizing) but
// deliberately does NOT carry over that file's region-one-specific
// machinery: camera-focus/panel-width math, spotlight spread, onboarding,
// photo loading, three-tier label logic, layer filtering, path-finding.
// None of that applies to a floating island of new nodes with no photos,
// no influenceScore, and no panel UI. Per this pass's instructions, this
// is a genuinely separate, freely-editable copy scoped to "get it on
// screen" — not a fork expected to stay in sync with region one.
//
// Safe to gut and rebuild freely while tuning island two — nothing here
// is imported by any region-one file.
// ─────────────────────────────────────────────────────────────

import { useRef, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Edge } from '@/data/types';
import type { IslandTwoArtist, IslandTwoLineage, IslandTwoRealm, StubAnchor } from '@/data/island-two-data';

type LabNode = IslandTwoArtist | StubAnchor;

// Mirrors the naming of the real ForceGraph's `graphData: GraphData` prop
// (graphData.artists / graphData.edges) — adapted to the sandbox's own
// node union, since full GraphData also demands genres/scenes this lab
// has no use for.
interface LabGraphData {
  artists: LabNode[];
  edges: Edge[];
}

interface Props {
  graphData: LabGraphData;
}

interface GraphNode extends Record<string, unknown> {
  id: string;
  name: string;
  realm?: IslandTwoRealm;
  lineage?: IslandTwoLineage;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: GraphNode | string;
  target: GraphNode | string;
}

// Flat placeholder palette — colouring by realm/lineage since these nodes
// have no `layer` worth reusing LAYER_COLORS for (every island-two node
// would resolve to the same 'outside' layer). Final palette is a later
// pass; this just needs to visually separate the lineages on first render.
const LINEAGE_COLORS: Record<IslandTwoLineage, string> = {
  krautrock: '#e8c87a',
  'synth-pop': '#f2a8c4',
  idm: '#8891f2',
  'ambient-drone': '#5fd0c0',
  'electronic-indie-dancepunk': '#f2846a',
  'trip-hop-downtempo': '#b48ee8',
  'hyperpop-pcmusic': '#f25fb0',
  'art-electronic': '#6ad1f2',
};

const REALM_FALLBACK_COLORS: Record<IslandTwoRealm, string> = {
  core: '#e8dca0',
  electronic: '#8891f2',
  'region-one': '#5a5a66',
};

function colorForNode(n: GraphNode): string {
  if (n.realm === 'electronic' && n.lineage) return LINEAGE_COLORS[n.lineage];
  if (n.realm) return REALM_FALLBACK_COLORS[n.realm];
  return '#8891f2';
}

const NODE_R = 6;
const STUB_R = 4.5; // slightly smaller — visually marks "placeholder, not a real island-two node"

// react-force-graph-2d touches browser globals at module-evaluation time,
// which crashes if it's ever evaluated during SSR. Region one's fix is not
// the plain top-level import in ForceGraph.tsx itself — it's that
// GraphView.tsx (a Client Component) loads ForceGraph via
// `dynamic(() => import('./ForceGraph'), { ssr: false })`, so the module
// is never evaluated on the server regardless of the plain import inside
// it. Same mechanism here, applied directly to the library import since
// this component isn't split across a wrapper/inner-file pair.
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function ForceGraphLab({ graphData }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Fresh node/link objects per mount — same reasoning as region one's
  // stableData: react-force-graph mutates node objects in place (x/y/vx/vy),
  // so this must not be recreated on every render.
  const stableData = useMemo(() => {
    const nodes: GraphNode[] = graphData.artists.map(a => ({ ...a }));
    const links: GraphLink[] = graphData.edges.map(e => ({ source: e.source, target: e.target }));
    return { nodes, links };
  }, [graphData]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      {dimensions && (
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={stableData}
          nodeId="id"
          nodeLabel={(node: object) => (node as GraphNode).name}
          nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const n = node as GraphNode;
            if (n.x === undefined || n.y === undefined) return;
            const isStub = n.realm === 'core' || n.realm === 'region-one';
            const r = isStub ? STUB_R : NODE_R;
            const color = colorForNode(n);

            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = isStub ? 0.55 : 1.0;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Always-on labels — this is a small enough graph (68 nodes)
            // that legibility while tuning matters more than decluttering.
            const fontSize = Math.max(10 / globalScale, 3);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isStub ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.92)';
            ctx.fillText(n.name, n.x, n.y + r + 2);
          }}
          nodePointerAreaPaint={(node: object, color: string, ctx: CanvasRenderingContext2D) => {
            const n = node as GraphNode;
            if (n.x === undefined || n.y === undefined) return;
            const isStub = n.realm === 'core' || n.realm === 'region-one';
            ctx.beginPath();
            ctx.arc(n.x, n.y, isStub ? STUB_R : NODE_R, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkColor={() => 'rgba(255, 255, 255, 0.15)'}
          linkWidth={0.6}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          backgroundColor="#06060e"
          cooldownTicks={200}
        />
      )}
    </div>
  );
}
