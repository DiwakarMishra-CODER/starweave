'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  // True on /artist/[slug], /genre/[genre], /genres, /scene/[scene], or
  // /browse — the graph stays mounted underneath that page's fixed overlay
  // (see app/(graph)/layout.tsx) rather than unmounting, so this flag
  // exists purely to tell the canvas it's fully hidden and can stop its
  // continuous per-frame redraw until the user navigates back.
  const isBackgrounded =
    pathname.startsWith('/artist/') || pathname.startsWith('/genre/') || pathname === '/genres' ||
    pathname.startsWith('/scene/') || pathname.startsWith('/browse');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // A genre's or scene's member artist ids, from ?genre=/?scene= — highlighted
  // as a cluster in the graph. Mutually exclusive with selectedId: setting one
  // always clears the other (enforced at every call site below).
  const [highlightSetIds, setHighlightSetIds] = useState<string[] | null>(null);
  // Which set member is re-centered as the spread's hub, set by clicking a
  // member while a set is active (see handleSetMemberClick) — lets the user
  // browse within a genre/scene set without ever leaving it. Reset to null
  // everywhere highlightSetIds itself changes or clears, so a stale pin from
  // a previous set never leaks into a new one.
  const [highlightSetPinnedId, setHighlightSetPinnedId] = useState<string | null>(null);
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
      setHighlightSetPinnedId(null);
      return;
    }

    if (genreParam) {
      const ids = graphData.artists.filter(a => a.genres.includes(genreParam)).map(a => a.id);
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        setHighlightSetPinnedId(null);
        return;
      }
    }

    if (sceneParam) {
      const scene = graphData.scenes.find(s => s.id === sceneParam);
      const ids = scene ? scene.memberIds.filter(id => graphData.artists.some(a => a.id === id)) : [];
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        setHighlightSetPinnedId(null);
        return;
      }
    }

    setSelectedId(null);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
  }, [searchParams, graphData.artists, graphData.scenes]);

  // The artist shown in the slide-over panel — either the fully-focused
  // node, or (while browsing within a set) the pinned set member. The two
  // are mutually exclusive in practice: highlightSetPinnedId is only ever
  // set while selectedId is null (see handleSetMemberClick).
  const panelArtistId = selectedId ?? highlightSetPinnedId;
  const selectedArtist = panelArtistId
    ? (graphData.artists.find(a => a.id === panelArtistId) ?? null)
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
      setHighlightSetPinnedId(null);
      window.history.replaceState(null, '', `/?artist=${artistId}`);
    }
  }, [selectedId, router]);

  // Clicking a member of the active genre/scene set re-centers the set on
  // that member instead of exiting to a full single-artist focus — the set
  // (highlightSetIds) and URL are left untouched, only the pin moves.
  const handleSetMemberClick = useCallback((artistId: string) => {
    setHighlightSetPinnedId(artistId);
  }, []);

  const handleSelectArtist = useCallback((id: string) => {
    setSelectedId(id);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    window.history.replaceState(null, '', `/?artist=${id}`);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    window.history.replaceState(null, '', '/');
  }, []);

  // Closing the panel: if it's showing a full single-artist focus, exit
  // that entirely (existing behavior). If it's only showing a pinned set
  // member, just unpin — stay in set mode with the auto-picked hub.
  const handlePanelClose = useCallback(() => {
    if (selectedId !== null) {
      handleBackgroundClick();
    } else {
      setHighlightSetPinnedId(null);
    }
  }, [selectedId, handleBackgroundClick]);

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
          highlightSetPinnedId={highlightSetPinnedId}
          onNodeClick={handleNodeClick}
          onSetMemberClick={handleSetMemberClick}
          onBackgroundClick={handleBackgroundClick}
          isBackgrounded={isBackgrounded}
        />
      </div>

      <ArtistPanel
        artist={selectedArtist}
        graphData={graphData}
        onClose={handlePanelClose}
        onSelectArtist={handleSelectArtist}
      />
    </div>
  );
}
