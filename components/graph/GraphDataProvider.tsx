'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { GraphData } from '@/data/types';
import { player } from '@/lib/player';

// Loads public/graph.json once, client-side, and hands it to every route in
// the (graph) group via context instead of the graph being embedded as a
// Server Component prop on every single one of them. graph.json is a
// committed static asset -- Vercel's CDN serves it directly, with no origin
// compute involved, regardless of how the dynamic HTML routes themselves
// cache. See app/(graph)/layout.tsx for where this wraps the tree.
//
// A shared context rather than each consumer fetching independently: /browse
// mounts both the backgrounded GraphView and BrowseClient at once (same route
// group), so two independent fetches would still double the JSON.parse() /
// object-materialization cost even with the network request itself deduped
// by the browser's HTTP cache.
interface GraphDataState {
  data: GraphData | null;
  error: unknown;
}

const GraphDataContext = createContext<GraphDataState | null>(null);

export function GraphDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/graph.json')
      .then(res => {
        if (!res.ok) throw new Error(`graph.json: ${res.status}`);
        return res.json();
      })
      .then((json: GraphData) => {
        // The loud rule: the player steps past these artists unless pressed.
        player.setLoudArtists(json.artists.filter(a => a.loud).map(a => a.id));
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GraphDataContext.Provider value={{ data, error }}>
      {children}
    </GraphDataContext.Provider>
  );
}

export function useGraphData(): GraphDataState {
  const ctx = useContext(GraphDataContext);
  if (!ctx) throw new Error('useGraphData must be used within a GraphDataProvider');
  return ctx;
}
