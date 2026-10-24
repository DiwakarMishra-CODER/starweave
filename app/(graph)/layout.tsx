import { Suspense } from 'react';
import GraphView from '@/components/graph/GraphView';
import { GraphDataProvider } from '@/components/graph/GraphDataProvider';
import FloatingPlayer from '@/components/player/FloatingPlayer';

// This layout keeps GraphView mounted across all routes in the (graph) group.
// Navigating between / and /artist/[slug] never unmounts the graph, so its
// camera position, selected node, and spread state are perfectly preserved.
// Suspense is required because GraphView uses useSearchParams().
//
// GraphDataProvider (not loadGraphData() here) is deliberate: this layout
// wraps every route in the group, so a server-fetched graphData prop would
// re-embed the full ~1.2MB dataset into the RSC payload of every one of
// them -- home, every artist/genre/scene page, browse. Loading it client-side
// from the public/graph.json static asset instead means the CDN serves it
// once, cached, with no origin compute per route. See GraphDataProvider.tsx.
//
// The site's music player lives here too (FloatingPlayer, lib/player), last
// so it sits above every page, and for the same reason as the graph: it never
// unmounts, so a song keeps playing from page to page.
export default function GraphLayout({ children }: { children: React.ReactNode }) {
  return (
    <GraphDataProvider>
      <main className="graph-page">
        <Suspense fallback={null}>
          <GraphView />
        </Suspense>
      </main>
      {/* Artist pages render as a fixed overlay — graph stays alive underneath */}
      {children}
      <FloatingPlayer />
    </GraphDataProvider>
  );
}
