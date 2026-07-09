// Throwaway dev route — mounts the REAL GraphView/ForceGraph (not the lean
// ForceGraphLab) against a combined dataset: real, build-enriched region-one
// data (via loadGraphData()) plus island-two's 44 real nodes and their edges.
// Stub anchors are dropped wherever the real region-one artist for that id
// already exists in loadGraphData()'s result — see missingAnchors below for
// the one case where that assumption doesn't hold.
//
// New file only. Does not import or affect the root page, and does not
// modify ForceGraph.tsx, GraphView.tsx, lib/graph-data.ts, seed-data.ts,
// build-graph.ts, or any other region-one file.
import { Suspense } from 'react';
import { loadGraphData } from '@/lib/graph-data';
import { islandTwoNodes, islandTwoEdges, stubAnchors } from '@/data/island-two-data';
import { computeInfluenceScores } from '@/scripts/pipeline';
import GraphView from '@/components/graph/GraphView';
import type { GraphData, Layer, Scope } from '@/data/types';

export default function MergedLabPage() {
  const regionOne = loadGraphData();
  const regionOneIds = new Set(regionOne.artists.map(a => a.id));

  // island-two's edges assume all 24 stub-anchor ids already exist as real
  // region-one artists. True for 23 of them — but Brian Eno is referenced
  // throughout region-one bios (Talking Heads, OMD, Slowdive...) without
  // ever being an actual Artist node in seed-data.ts, so dropping every stub
  // anchor left his edges dangling ("node not found: brian-eno"). Computed
  // here (not hardcoded to that one id) so it stays correct if that changes.
  const missingAnchors = stubAnchors
    .filter(a => !regionOneIds.has(a.id))
    .map(a => ({
      id: a.id,
      name: a.name,
      layer: 'outside' as Layer,
      genres: [] as string[],
      scope: [] as Scope[],
      // Carry through the stub anchor's own realm/lineage (e.g. Brian Eno's
      // realm: 'core', lineage: 'ambient-drone') so he resolves to the gold
      // core color instead of falling back to a bare, untagged node.
      realm: a.realm,
      lineage: a.lineage,
    }));

  const combinedArtists = [...regionOne.artists, ...islandTwoNodes, ...missingAnchors];
  const combinedEdges = [...regionOne.edges, ...islandTwoEdges];

  // Region-one's own influenceScore values (already baked into graph.json by
  // scripts/build-graph.ts) are left untouched. Island-two nodes and any
  // missing anchor (see above) never went through that build and default to
  // score 0 — recomputed here from the full combined edge list, reusing the
  // same pure helper build-graph.ts itself calls (scripts/pipeline.ts's
  // computeInfluenceScores — no fs/network side effects, safe to import into
  // a Server Component) rather than hand-rolling a duplicate in-degree
  // counter here.
  const scores = computeInfluenceScores(combinedArtists, combinedEdges);
  const needsScore = new Set([...islandTwoNodes.map(n => n.id), ...missingAnchors.map(n => n.id)]);
  const sizedArtists = combinedArtists.map(a =>
    needsScore.has(a.id) ? { ...a, influenceScore: scores.get(a.id) ?? 0 } : a,
  );

  const combinedGraphData: GraphData = {
    artists: sizedArtists,
    genres: regionOne.genres,
    scenes: regionOne.scenes,
    edges: combinedEdges,
  };

  return (
    <main className="graph-page">
      <Suspense fallback={null}>
        <GraphView graphData={combinedGraphData} />
      </Suspense>
    </main>
  );
}
