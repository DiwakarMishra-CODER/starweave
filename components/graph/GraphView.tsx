'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { GraphData, Realm, EvidenceFilter } from '@/data/types';
import { edgePassesEvidenceFilter } from '@/data/types';
import { useNarrowLayout } from '@/lib/use-media-query';
import { findBestSourcedPath, resolvePathHops } from '@/lib/graph-utils';
import { PATH_FINDER_ENABLED } from '@/lib/flags';
import GraphControls from './GraphControls';
import ArtistSearch from './ArtistSearch';
import ArtistPanel from './ArtistPanel';
import EvidenceFilterControl from './EvidenceFilter';
import PathPanel from './PathPanel';
import PathFinder from './PathFinder';
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
  // True on every content route in the (graph) group — the graph stays
  // mounted underneath that page's fixed overlay (see app/(graph)/layout.tsx)
  // rather than unmounting, so this flag exists purely to tell the canvas it's
  // fully hidden and can stop its continuous per-frame redraw until the user
  // navigates back.
  //
  // Every entry here has to be kept in step with what actually lives in the
  // route group. /about was the last page still sitting OUTSIDE it, which
  // meant navigating from /about to the graph crossed a route-group boundary
  // and forced (graph)/layout.tsx — and therefore GraphView's ~293-node,
  // PRESETTLE_TICKS-deep presettleLayout — to mount from scratch, a ~6s stall
  // with the old page still on screen and no feedback. Third time this exact
  // bug appeared (see the /genre, /scene and /browse moves before it): moving
  // a page into the group and adding it here are two halves of one fix.
  const isBackgrounded =
    pathname.startsWith('/artist/') || pathname.startsWith('/genre/') || pathname === '/genres' ||
    pathname.startsWith('/scene/') || pathname === '/scenes' || pathname.startsWith('/browse') ||
    pathname === '/about';
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
  // Both ends of a path search. Owned here rather than in GraphControls so the
  // one resolved result can drive the canvas highlight and the result panel
  // together; the picker just reports which artists were chosen.
  const [pathFromId, setPathFromId] = useState<string | null>(null);
  const [pathToId, setPathToId] = useState<string | null>(null);
  // Single-select: at most one realm filtered at a time. null = no filter,
  // everything shown.
  const [activeRealm, setActiveRealm] = useState<Realm | null>(null);
  // Evidence filter — ghosts edges that don't meet the chosen sourcing bar.
  // See edgePassesEvidenceFilter in data/types.ts.
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>('all');
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
  const isNarrowLayout = useNarrowLayout();
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
      setPathFromId(null);
      setPathToId(null);
      setActiveGenreId(null);
      setActiveSceneId(null);
      return;
    }

    if (genreParam) {
      // Already showing exactly this genre — bail before touching any state.
      // This effect fires on far more than real navigations (see the header
      // comment above), and re-applying identical state is NOT free:
      // setHighlightSetIds would hand back a BRAND-NEW array every time (new
      // activeClusterIds identity, so ForceGraph's spread and camera effects
      // both re-fire), and setHighlightSetPinnedId(null) would throw away the
      // member the user just clicked. Together those two made clicking a set
      // member move the camera to that member and then snap it straight back
      // to the set's auto-picked hub about a second later.
      //
      // Same bug class, same fix as the activeRealm regression described in
      // the header comment — the effect was clearing state that the handlers
      // already own. Every handler that genuinely needs to drop the pin
      // (handleSelectRealm/Genre/Scene, handleNodeClick, handleSelectArtist,
      // handleBackgroundClick, handlePanelClose) does it itself.
      if (genreParam === activeGenreId) return;
      const ids = graphData.artists.filter(a => a.genres.includes(genreParam)).map(a => a.id);
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        setHighlightSetPinnedId(null);
        setPathFromId(null);
        setPathToId(null);
        setActiveGenreId(genreParam);
        setActiveSceneId(null);
        return;
      }
    }

    if (sceneParam) {
      // Same early bail as the genre branch above, for the same reason.
      if (sceneParam === activeSceneId) return;
      const scene = graphData.scenes.find(s => s.id === sceneParam);
      const ids = scene ? scene.memberIds.filter(id => graphData.artists.some(a => a.id === id)) : [];
      if (ids.length > 0) {
        setSelectedId(null);
        setHighlightSetIds(ids);
        setHighlightSetPinnedId(null);
        setPathFromId(null);
        setPathToId(null);
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
    // NOTE: this fallback deliberately does NOT clear the path. Every other
    // mode here is derived from the URL, so "the URL names nothing" correctly
    // means "show nothing". A path is not in the URL, and handleFindPath
    // resets the address bar to '/' on purpose (see the note there), which
    // fires this effect -- so clearing the path here wiped it in the same tick
    // it was created and the feature never rendered at all. The branches above
    // still clear it, because navigating to an artist, genre or scene really
    // should exit path mode.
    //
    // activeGenreId/activeSceneId are read by the two early bails above, so
    // they belong here — a genuine navigation to a DIFFERENT genre/scene still
    // falls through and re-applies everything.
  }, [searchParams, graphData.artists, graphData.scenes, activeGenreId, activeSceneId]);

  // The artist shown in the slide-over panel — either the fully-focused
  // node, or (while browsing within a set) the pinned set member. The two
  // are mutually exclusive in practice: highlightSetPinnedId is only ever
  // set while selectedId is null (see handleSetMemberClick).
  // Counted once here rather than per render of the control.
  const evidenceCounts = useMemo(() => ({
    all: graphData.edges.length,
    'first-person': graphData.edges.filter(e => edgePassesEvidenceFilter(e, 'first-person')).length,
  }), [graphData.edges]);

  // Resolved once here so the canvas highlight and the result panel can never
  // disagree about what the path is. Undirected on purpose -- see the note
  // above findConnectionPath in lib/graph-utils.ts.
  const { pathIds, pathHops } = useMemo(() => {
    if (!pathFromId || !pathToId || pathFromId === pathToId) {
      return { pathIds: null as string[] | null, pathHops: null };
    }
    // Best-sourced, not shortest. See findBestSourcedPath -- fewest-hops routes
    // carried a weak link 70% of the time, which is the one thing this graph
    // cannot afford to hand someone who clicks to check it.
    const ids = findBestSourcedPath(pathFromId, pathToId, graphData.edges);
    return { pathIds: ids, pathHops: ids ? resolvePathHops(ids, graphData.edges) : null };
  }, [pathFromId, pathToId, graphData.edges]);

  // A path search takes over the panel slot; the two are mutually exclusive by
  // construction, since picking either end clears selectedId above.
  const panelArtistId = pathIds ? null : (selectedId ?? highlightSetPinnedId);
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
  // Fires as each end is picked, so the panel can fill in as soon as both are
  // known. Empty strings mean "not chosen yet" -- the picker sends both ends
  // every time rather than tracking which one changed.
  const handleFindPath = useCallback((fromId: string, toId: string) => {
    setPathFromId(fromId || null);
    setPathToId(toId || null);
    if (fromId || toId) {
      setSelectedId(null);
      setHighlightSetIds(null);
      setHighlightSetPinnedId(null);
      setActiveRealm(null);
      setActiveGenreId(null);
      setActiveSceneId(null);
      // Clearing the URL is load-bearing, not tidiness. activeGenreId is a
      // dependency of the URL-sync effect above, so nulling it re-fires that
      // effect; with ?genre= still in the address bar its early bail no longer
      // matches (param vs null), so it falls straight through, re-applies the
      // genre set AND clears both path ends -- the path would vanish in the
      // same tick it was created. handleSelectRealm/Genre/Scene each do this
      // for the same reason.
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const handleClosePath = useCallback(() => {
    setPathFromId(null);
    setPathToId(null);
  }, []);

  const handleSelectRealm = useCallback((realm: Realm) => {
    if (activeRealm === realm) {
      setActiveRealm(null);
      return;
    }
    setActiveRealm(realm);
    setSelectedId(null);
    setHighlightSetIds(null);
    setHighlightSetPinnedId(null);
    setPathFromId(null);
    setPathToId(null);
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
      setPathFromId(null);
      setPathToId(null);
      window.history.replaceState(null, '', '/');
      return;
    }
    const ids = graphData.artists.filter(a => a.genres.includes(genreId)).map(a => a.id);
    if (ids.length === 0) return; // defensive — every real genre has at least one tagged artist
    setSelectedId(null);
    setActiveRealm(null);
    setActiveSceneId(null);
    setHighlightSetPinnedId(null);
    setPathFromId(null);
    setPathToId(null);
    setHighlightSetIds(ids);
    setActiveGenreId(genreId);
    window.history.replaceState(null, '', `/?genre=${genreId}`);
  }, [activeGenreId, graphData.artists]);

  const handleSelectScene = useCallback((sceneId: string) => {
    if (activeSceneId === sceneId) {
      setActiveSceneId(null);
      setHighlightSetIds(null);
      setHighlightSetPinnedId(null);
      setPathFromId(null);
      setPathToId(null);
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
    setPathFromId(null);
    setPathToId(null);
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
      setPathFromId(null);
      setPathToId(null);
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
    setPathFromId(null);
    setPathToId(null);
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
    setPathFromId(null);
    setPathToId(null);
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
      setPathFromId(null);
      setPathToId(null);
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
        // Desktop only. On a phone this panel is 250px tall inside a 798px
        // canvas -- a third of the screen, opened before the visitor has seen
        // the graph at all. The onboarding card's last row names this control,
        // which is what that row is for.
        initialOpen={controlsAutoOpen && !isNarrowLayout}
      />

      {/* Its own control rather than a fourth tab inside "Jump to..." -- that
          menu's three tabs all navigate, and this asks the graph a question.
          Gated by the same flag, which now controls one component instead of
          two fragments inside another one. */}
      {PATH_FINDER_ENABLED && (
        <PathFinder
          artists={graphData.artists}
          onFindPath={handleFindPath}
          pathFromId={pathFromId}
          pathToId={pathToId}
          // With a path on screen, an outside click resets here and now rather
          // than waiting for the canvas to receive it. The picker closes on
          // POINTERDOWN, so the later click event often lands on a different
          // element than the one under the cursor when the gesture began and
          // never reaches the canvas at all -- which is why clearing a path
          // took two or three clicks instead of one. Doing the reset in this
          // handler makes it exactly one, and the suppress flag then swallows
          // the trailing click so it cannot fire a second time.
          //
          // With no path up this stays the plain suppression the Jump to...
          // menu uses, where a dismissing click should not also deselect.
          // Order is load-bearing: handleBackgroundClick CONSUMES the suppress
          // flag and returns early if it is already set, so the reset has to
          // run first and the flag be raised after it.
          onOutsideClick={() => {
            if (pathFromId !== null || pathToId !== null) handleBackgroundClick();
            suppressBackgroundClickRef.current = true;
          }}
        />
      )}
      <ArtistSearch artists={graphData.artists} genres={graphData.genres} edges={graphData.edges} onSelectArtist={handleSelectArtist} />

      {/* z-index: 1 keeps the canvas above the nebula (z-index: 0) */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        <ForceGraphCanvas
          graphData={graphData}
          activeRealm={activeRealm}
          highlightPath={pathIds}
          selectedId={selectedId}
          highlightSetIds={highlightSetIds}
          highlightSetPinnedId={highlightSetPinnedId}
          onNodeClick={handleNodeClick}
          onSetMemberClick={handleSetMemberClick}
          onBackgroundClick={handleBackgroundClick}
          isBackgrounded={isBackgrounded}
          evidenceFilter={evidenceFilter}
        />
      </div>

      <EvidenceFilterControl
        value={evidenceFilter}
        onChange={setEvidenceFilter}
        counts={evidenceCounts}
      />

      <PathPanel
        fromId={pathFromId}
        toId={pathToId}
        graphData={graphData}
        hops={pathHops}
        onClose={handleClosePath}
      />

      <ArtistPanel
        artist={selectedArtist}
        graphData={graphData}
        onClose={handlePanelClose}
        onSelectArtist={handleSelectArtist}
      />
    </div>
  );
}
