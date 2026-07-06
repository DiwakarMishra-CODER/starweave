'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { GraphData, Layer } from '@/data/types';
import GraphControls from './GraphControls';
import ArtistSearch from './ArtistSearch';
import ArtistPanel from './ArtistPanel';
import Legend from '@/components/ui/Legend';
import NebulaBackground from './NebulaBackground';

const ForceGraphCanvas = dynamic(() => import('./ForceGraph'), {
  ssr: false,
  loading: () => (
    <div className="graph-loading">
      <span>Mapping the constellation…</span>
    </div>
  ),
});

interface Props {
  graphData: GraphData;
}

export default function GraphView({ graphData }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(new Set());

  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get('artist');
    if (id && graphData.artists.some(a => a.id === id)) {
      setSelectedId(id);
    } else if (!id) {
      // Navigating to / with no artist param (e.g. logo click, router.push('/'))
      // should clear any selection that was set in a previous graph visit.
      setSelectedId(null);
    }
  }, [searchParams, graphData.artists]);

  const selectedArtist = selectedId
    ? (graphData.artists.find(a => a.id === selectedId) ?? null)
    : null;

  const handleToggleLayer = useCallback((layer: Layer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        if (next.size === 0) {
          const allLayers: Layer[] = ['root', 'post-punk', 'shoegaze-dreampop', 'indie-alt', 'outside'];
          allLayers.forEach(l => next.add(l));
          next.delete(layer);
        } else {
          next.add(layer);
        }
      }
      const allLayers: Layer[] = ['root', 'post-punk', 'shoegaze-dreampop', 'indie-alt', 'outside'];
      if (next.size === allLayers.length) return new Set();
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((artistId: string) => {
    if (selectedId === artistId) {
      router.push(`/artist/${artistId}`);
    } else {
      setSelectedId(artistId);
      window.history.replaceState(null, '', `/?artist=${artistId}`);
    }
  }, [selectedId, router]);

  const handleSelectArtist = useCallback((id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, '', `/?artist=${id}`);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    window.history.replaceState(null, '', '/');
  }, []);

  return (
    <div className="graph-container">
      <NebulaBackground />
      <GraphControls activeLayers={activeLayers} onToggleLayer={handleToggleLayer} />
      <ArtistSearch artists={graphData.artists} onSelectArtist={handleSelectArtist} />
      <Legend activeLayers={activeLayers} />

      {/* z-index: 1 keeps the canvas above the nebula (z-index: 0) */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        <ForceGraphCanvas
          graphData={graphData}
          activeLayers={activeLayers}
          highlightPath={null}
          selectedId={selectedId}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
        />
      </div>

      <ArtistPanel
        artist={selectedArtist}
        graphData={graphData}
        onClose={handleBackgroundClick}
        onSelectArtist={handleSelectArtist}
      />
    </div>
  );
}
