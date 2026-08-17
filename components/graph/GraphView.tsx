'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { GraphData, Realm } from '@/data/types';
import GraphControls from './GraphControls';
import ArtistSearch from './ArtistSearch';
import ArtistPanel from './ArtistPanel';
import NebulaBackground from './NebulaBackground';
import GraphOnboarding from './GraphOnboarding';

const ONBOARDING_STORAGE_KEY = 'starweave:onboarding-seen';

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
  // True on /artist/[slug], /genre/[genre], /genres, /scene/[scene],
  // /scenes, or /browse — the graph stays mounted underneath that page's
  // fixed overlay (see app/(graph)/layout.tsx) rather than unmounting, so
  // this flag exists purely to tell the canvas it's fully hidden and can
  // stop its continuous per-frame redraw until the user navigates back.
  const isBackgrounded =
    pathname.startsWith('/artist/') || pathname.startsWith('/genre/') || pathname === '/genres' ||
    pathname.startsWith('/scene/') || pathname === '/scenes' || pathname.startsWith('/browse');
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
  // Single-select: at most one realm filtered at a time. null = no filter,
  // everything shown.
  const [activeRealm, setActiveRealm] = useState<Realm | null>(null);
  // Which genre/scene (if any) is the current highlightSetIds source — kept
  // alongside the generic member-id list so GraphControls' Genres/Scenes
  // tabs know which single row (if any) to show as selected, the same way
  // activeRealm already does for the Realms tab.
  const [activeGenreId, setActiveGenreId] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  // Onboarding hint — persistent until dismissed (× or clicking a node),
  // never on a timer. Starts false (not visible) so there's no flash before
  // the effect below has had a chance to read localStorage; flips true only
  // if this browser has never dismissed it.
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  // Same first-visit signal as the hint above, deliberately sharing one key:
  // the "Jump to…" control is a collapsed button a first-timer has no reason
  // to click, so on a first visit it's opened for them once. Once the hint has
  // been dismissed (which is what writes the key), neither auto-appears again.
  const [controlsAutoOpen, setControlsAutoOpen] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
    } catch {
      // Storage unavailable (private browsing, disabled, etc.) — treat as
      // unseen rather than crash.
      seen = false;
    }
    if (!seen) {
      /* eslint-disable react-hooks/set-state-in-effect -- intentional: visibility depends on reading localStorage, an external system that can't be read during render */
      setOnboardingOpen(true);
      setControlsAutoOpen(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  // Only persisted when the user actually dismisses it (click × or click a
  // node) — not the moment it's shown — so reloading without interacting
  // shows it again next time, per "remember the dismissal," not "remember
  // that it was rendered."
  const dismissOnboarding = useCallback(() => {
    setOnboardingOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    } catch {
      // Nothing we can do — worst case it shows again next visit.
    }
  }, []);

  // Syncs selectedId/highlightSetIds/activeGenreId/activeSceneId to the
  // ?artist=/?genre=/?scene= URL params — never activeRealm, which has no
  // URL representation at all (no ?realm= param exists). This effect fires
  // on more than just a real navigation: every handler in this file calls
  // window.history.replaceState(...) after setting its own state (so a
  // selection is shareable/refresh-safe), and in this Next.js version that
  // replaceState call itself retriggers useSearchParams() even when the URL
  // string is byte-identical to before (e.g. handleSelectRealm's plain '/').
  // Previously this effect's "no params" fallback also reset activeRealm —
  // harmless for genre/artist/scene selections (whose own replaceState calls
  // encode real params this effect re-derives back to the same state) but
  // fatal for realm: handleSelectRealm's replaceState('/') has no params to
  // re-derive from, so the very next tick's fallback branch wiped the realm
  // that was just selected, making a realm's camera focus revert to the
  // full-graph view immediately after landing on it. Every handler that
  // actually needs to clear activeRealm (handleSelectGenre, handleSelectScene,
  // handleSelectArtist, handleNodeClick, handleBackgroundClick) already does
  // so itself — this effect doesn't need to duplicate that.
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
      setActiveGenreId(null);
      setActiveSceneId(null);
      return;
    }

    if (genreParam) {
      const ids = graphData.artists.filter(a => a.genres.includes(genreParam)).map(a => a.id);
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        setHighlightSetPinnedId(null);
        setActiveGenreId(genreParam);
        setActiveSceneId(null);
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
        setActiveGenreId(null);
        setActiveSceneId(sceneParam);
        return;
      }
    }

    setSelectedId(null);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    setActiveGenreId(null);
    setActiveSceneId(null);
  }, [searchParams, graphData.artists, graphData.scenes]);

  // The artist shown in the slide-over panel — either the fully-focused
  // node, or (while browsing within a set) the pinned set member. The two
  // are mutually exclusive in practice: highlightSetPinnedId is only ever
  // set while selectedId is null (see handleSetMemberClick).
  const panelArtistId = selectedId ?? highlightSetPinnedId;
  const selectedArtist = panelArtistId
    ? (graphData.artists.find(a => a.id === panelArtistId) ?? null)
    : null;

  // Pure camera shortcut: clicking a realm pans/zooms there; clicking the
  // same realm again resets to null, which flies the camera back to the
  // full default view (see getActiveCluster/applyCameraFocusForCluster in
  // ForceGraph.tsx). Nothing is hidden or filtered — every node stays
  // rendered throughout. Realm, click-focus, and genre/scene sets are one
  // "where's the camera pointed" axis between them — selecting a realm
  // exits the other two, and clears the URL's own artist/genre/scene param
  // so a refresh can't resurrect a different answer than what's on screen.
  const handleSelectRealm = useCallback((realm: Realm) => {
    if (activeRealm === realm) {
      setActiveRealm(null);
      return;
    }
    setActiveRealm(realm);
    setSelectedId(null);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    setActiveGenreId(null);
    setActiveSceneId(null);
    window.history.replaceState(null, '', '/');
  }, [activeRealm]);

  // Same shape as handleSelectRealm, for the Genres/Scenes tabs (see
  // GraphControls) — sets highlightSetIds directly (same effect the ?genre=
  // URL sync above produces) rather than routing through a navigation, and
  // mirrors the URL for shareability/refresh. Clicking the currently active
  // genre again clears back to the default view, same toggle-off as realm.
  const handleSelectGenre = useCallback((genreId: string) => {
    if (activeGenreId === genreId) {
      setActiveGenreId(null);
      setHighlightSetIds(null);
      setHighlightSetPinnedId(null);
      window.history.replaceState(null, '', '/');
      return;
    }
    const ids = graphData.artists.filter(a => a.genres.includes(genreId)).map(a => a.id);
    if (ids.length === 0) return; // defensive — every real genre has at least one tagged artist
    setSelectedId(null);
    setActiveRealm(null);
    setActiveSceneId(null);
    setHighlightSetPinnedId(null);
    setHighlightSetIds(ids);
    setActiveGenreId(genreId);
    window.history.replaceState(null, '', `/?genre=${genreId}`);
  }, [activeGenreId, graphData.artists]);

  const handleSelectScene = useCallback((sceneId: string) => {
    if (activeSceneId === sceneId) {
      setActiveSceneId(null);
      setHighlightSetIds(null);
      setHighlightSetPinnedId(null);
      window.history.replaceState(null, '', '/');
      return;
    }
    const scene = graphData.scenes.find(s => s.id === sceneId);
    const ids = scene ? scene.memberIds.filter(id => graphData.artists.some(a => a.id === id)) : [];
    if (ids.length === 0) return;
    setSelectedId(null);
    setActiveRealm(null);
    setActiveGenreId(null);
    setHighlightSetPinnedId(null);
    setHighlightSetIds(ids);
    setActiveSceneId(sceneId);
    window.history.replaceState(null, '', `/?scene=${sceneId}`);
  }, [activeSceneId, graphData.artists, graphData.scenes]);

  // Set by GraphControls' onOutsideClick right before the click that closed
  // the "Jump to" panel also lands on the canvas underneath it — that click
  // is only meant to close the menu, not to deselect whatever's active.
  // Exactly one of the three canvas handlers below fires per click, and each
  // clears the flag, so it can never stay armed past the click it was set
  // for. (It used to be cleared only by handleBackgroundClick, which left it
  // armed whenever the closing click landed on a node instead — harmless
  // while the panel started closed, but the default path once it auto-opens
  // on a first visit: the next click on empty space would silently not
  // deselect.) Declared above the handlers so they capture it, not the other
  // way round — the react-hooks/immutability rule rejects the reverse order.
  const suppressBackgroundClickRef = useRef(false);

  const handleNodeClick = useCallback((artistId: string) => {
    // Clicking a node is the interaction the hint is teaching — treat it as
    // "understood" the same as dismissing via the × (see dismissOnboarding).
    if (onboardingOpen) dismissOnboarding();
    // This click consumed the suppress flag (see suppressBackgroundClickRef).
    suppressBackgroundClickRef.current = false;
    if (selectedId === artistId) {
      router.push(`/artist/${artistId}`);
    } else {
      setSelectedId(artistId);
      setHighlightSetIds(null);
      setHighlightSetPinnedId(null);
      setActiveRealm(null);
      setActiveGenreId(null);
      setActiveSceneId(null);
      window.history.replaceState(null, '', `/?artist=${artistId}`);
    }
  }, [selectedId, router, onboardingOpen, dismissOnboarding]);

  // Clicking a member of the active genre/scene set re-centers the set on
  // that member instead of exiting to a full single-artist focus — the set
  // (highlightSetIds) and URL are left untouched, only the pin moves.
  const handleSetMemberClick = useCallback((artistId: string) => {
    // This click consumed the suppress flag (see suppressBackgroundClickRef).
    suppressBackgroundClickRef.current = false;
    setHighlightSetPinnedId(artistId);
  }, []);

  const handleSelectArtist = useCallback((id: string) => {
    setSelectedId(id);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    setActiveRealm(null);
    setActiveGenreId(null);
    setActiveSceneId(null);
    window.history.replaceState(null, '', `/?artist=${id}`);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    if (suppressBackgroundClickRef.current) {
      suppressBackgroundClickRef.current = false;
      return;
    }
    setSelectedId(null);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    setActiveRealm(null);
    setActiveGenreId(null);
    setActiveSceneId(null);
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
      <GraphOnboarding open={onboardingOpen} onDismiss={dismissOnboarding} />
      <GraphControls
        activeRealm={activeRealm}
        onSelectRealm={handleSelectRealm}
        artists={graphData.artists}
        genres={graphData.genres}
        activeGenreId={activeGenreId}
        onSelectGenre={handleSelectGenre}
        scenes={graphData.scenes}
        activeSceneId={activeSceneId}
        onSelectScene={handleSelectScene}
        onClear={handleBackgroundClick}
        onOutsideClick={() => { suppressBackgroundClickRef.current = true; }}
        initialOpen={controlsAutoOpen}
      />
      <ArtistSearch artists={graphData.artists} genres={graphData.genres} edges={graphData.edges} onSelectArtist={handleSelectArtist} />

      {/* z-index: 1 keeps the canvas above the nebula (z-index: 0) */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        <ForceGraphCanvas
          graphData={graphData}
          activeRealm={activeRealm}
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
