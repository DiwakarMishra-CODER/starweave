import { Suspense } from 'react';
import { loadGraphData } from '@/lib/graph-data';
import GraphView from '@/components/graph/GraphView';

// This layout keeps GraphView mounted across all routes in the (graph) group.
// Navigating between / and /artist/[slug] never unmounts the graph, so its
// camera position, selected node, and spread state are perfectly preserved.
// Suspense is required because GraphView uses useSearchParams().
export default function GraphLayout({ children }: { children: React.ReactNode }) {
  const graphData = loadGraphData();
  return (
    <>
      <main className="graph-page">
        <Suspense fallback={null}>
          <GraphView graphData={graphData} />
        </Suspense>
      </main>
      {/* Artist pages render as a fixed overlay — graph stays alive underneath */}
      {children}
    </>
  );
}
