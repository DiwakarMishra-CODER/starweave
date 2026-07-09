// Sandbox route — renders data/island-two-data.ts in its own isolated
// force graph (components/ForceGraphLab.tsx). Self-contained: does not
// import or affect the region-one graph, layout, or root page.
//
// This page is a Server Component (mirrors the (graph) layout's own
// pattern of a Server Component handing data down to a Client Component
// for canvas rendering) — only ForceGraphLab itself is 'use client'.
//
// Note: this route still inherits the root app/layout.tsx (fonts,
// <TopNav />) — that's unavoidable without editing app/layout.tsx, which
// this task explicitly forbids. paddingTop below just keeps the canvas
// from rendering underneath the fixed nav bar.
import ForceGraphLab from '@/components/ForceGraphLab';
import { islandTwoNodes, stubAnchors, islandTwoEdges } from '@/data/island-two-data';

export default function IslandTwoLabPage() {
  const artists = [...islandTwoNodes, ...stubAnchors];

  return (
    <main style={{ position: 'fixed', inset: 0, paddingTop: 'var(--nav-height)', background: '#06060e' }}>
      <ForceGraphLab graphData={{ artists, edges: islandTwoEdges }} />
    </main>
  );
}
