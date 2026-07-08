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
import GraphOnboarding from './GraphOnboarding';

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
  // A genre's or scene's member artist ids, from ?genre=/?scene= — highlighted
  // as a cluster in the graph. Mutually exclusive with selectedId: setting one
  // always clears the other (enforced at every call site below).
  const [highlightSetIds, setHighlightSetIds] = useState<string[] | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(new Set());

  const searchParams = useSearchParams();
  useEffect(() => {
    const artistParam = searchParams.get('artist');
    const genreParam  = searchParams.get('genre');
    const sceneParam  = searchParams.get('scene');

    if (artistParam && graphData.artists.some(a => a.id === artistParam)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncing selectedId to URL param; no external-subscription pattern applies
      setSelectedId(artistParam);
      setHighlightSetIds(null);
      return;
    }

    if (genreParam) {
      const ids = graphData.artists.filter(a => a.genres.includes(genreParam)).map(a => a.id);
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        return;
      }
    }

    if (sceneParam) {
      const scene = graphData.scenes.find(s => s.id === sceneParam);
      const ids = scene ? scene.memberIds.filter(id => graphData.artists.some(a => a.id === id)) : [];
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        return;
      }
    }

    setSelectedId(null);
    setHighlightSetIds(null);
  }, [searchParams, graphData.artists, graphData.scenes]);

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
      setHighlightSetIds(null);
      window.history.replaceState(null, '', `/?artist=${artistId}`);
    }
  }, [selectedId, router]);

  const handleSelectArtist = useCallback((id: string) => {
    setSelectedId(id);
    setHighlightSetIds(null);
    window.history.replaceState(null, '', `/?artist=${id}`);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setHighlightSetIds(null);
    window.history.replaceState(null, '', '/');
  }, []);

  return (
    <div className="graph-container">
      <NebulaBackground />
      <GraphOnboarding />
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
          highlightSetIds={highlightSetIds}
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
