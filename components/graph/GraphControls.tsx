'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artist, Genre, Realm, Scene } from '@/data/types';
import {
  REALMS, REALM_LABELS, REALM_COLORS,
  GENRE_COLORS, DEFAULT_GENRE_COLOR,
  SCENE_COLORS, DEFAULT_SCENE_COLOR,
} from '@/lib/colors';

type Tab = 'realms' | 'genres' | 'scenes';

// A genre bigger than this highlights so much of the graph that the highlight
// stops meaning anything -- see genreOptions below. 35 sits in the real gap in
// the data, between Folk (39) and Art pop (32).
const BROAD_GENRE_MEMBER_COUNT = 35;
const BROAD_GENRE_PENALTY = 0.5;

interface Props {
  activeRealm: Realm | null;
  onSelectRealm: (realm: Realm) => void;
  artists: Artist[];
  genres: Genre[];
  activeGenreId: string | null;
  onSelectGenre: (id: string) => void;
  scenes: Scene[];
  activeSceneId: string | null;
  onSelectScene: (id: string) => void;
  onClear: () => void;
  // Fired when an outside click closes the panel — lets the caller
  // suppress whatever click-through side effect (e.g. the graph's own
  // background-click deselect) would otherwise also fire from that same
  // click, since the click's only real intent here was to close the menu.
  onOutsideClick?: () => void;
  // One-shot: opens the panel once, when it flips false -> true (the caller
  // reads localStorage in an effect, so it can't be true on first render).
  // Never reopens it — once the user closes the panel it stays closed.
  initialOpen?: boolean;
}

// One control for all three "jump to" axes (realm / genre / scene) rather
// than three separate top-left buttons — folded in as tabs so navigating
// the graph to a realm, genre, or scene never grows past this one panel.
export default function GraphControls({
  activeRealm, onSelectRealm,
  artists, genres, activeGenreId, onSelectGenre,
  scenes, activeSceneId, onSelectScene,
  onClear,
  onOutsideClick,
  initialOpen,
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('realms');
  const [genreQuery, setGenreQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const realmCounts = useMemo(() => {
    const counts = new Map<Realm, number>();
    for (const a of artists) {
      const r = (a.realm ?? 'region-one') as Realm;
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return counts;
  }, [artists]);

  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of artists) for (const g of a.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    return counts;
  }, [artists]);

  // Biggest first, alphabetical to break ties -- A-Z put alt-country (6 artists)
  // above art-pop (32) and buried every genre worth jumping to below the fold
  // of a scrolling list. This is a "take me somewhere" menu, so the entries that
  // actually change the view belong at the top, and the counts are already on
  // screen beside each row so the ordering explains itself.
  //
  // With one correction: the very broadest genres are demoted. Electronic (61),
  // Indie rock (51) and Folk (39) led the list and are the three worst things to
  // jump to -- each lights up a fifth of the graph, so the highlight stops
  // distinguishing anything. Two of them are not even sounds: Electronic and
  // Folk are the only genres in the vocabulary with no `emerged` date, because
  // they are containers (see the Genre notes in data/types.ts). Weighting rather
  // than bucketing keeps the list looking sorted -- they slide to roughly 2nd,
  // 4th and 9th instead of jumping to the bottom where nobody would find them.
  const genreOptions = useMemo(
    () => [...genres]
      .map(g => {
        const count = genreCounts.get(g.id) ?? 0;
        const broad = count > BROAD_GENRE_MEMBER_COUNT;
        return { id: g.id, label: g.name, count, weight: broad ? count * BROAD_GENRE_PENALTY : count };
      })
      .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label)),
    [genres, genreCounts],
  );

  const filteredGenreOptions = genreQuery.trim()
    ? genreOptions.filter(g => g.label.toLowerCase().includes(genreQuery.trim().toLowerCase()))
    : genreOptions;

  // Same ordering as genres above, for the same reason.
  const sceneOptions = useMemo(
    () => [...scenes]
      .map(s => ({ id: s.id, label: s.name, count: s.memberIds.length }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    [scenes],
  );

  const hasSelection = activeRealm !== null || activeGenreId !== null || activeSceneId !== null;

  // Reopening the panel lands on whichever axis is actually active, rather
  // than always resetting to Realms — e.g. arriving via a genre page's
  // "?genre=" link and then reopening this control should show the Genres
  // tab with that genre already checked, not bounce back to Realms.
  const activeTab: Tab | null =
    activeRealm !== null ? 'realms' : activeGenreId !== null ? 'genres' : activeSceneId !== null ? 'scenes' : null;

  function handleToggleOpen() {
    setOpen(v => {
      const next = !v;
      if (next && activeTab) setTab(activeTab);
      return next;
    });
  }

  // First-visit auto-open. Deps are [initialOpen] alone, so this fires only on
  // the false -> true transition and can't fight the user by reopening the
  // panel after they close it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: the caller derives this from localStorage, which can't be read during render
    if (initialOpen) setOpen(true);
  }, [initialOpen]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onOutsideClick?.();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onOutsideClick]);

  return (
    <div className="graph-controls" ref={containerRef}>
      <button
        className="graph-controls__toggle"
        onClick={handleToggleOpen}
        aria-expanded={open}
        aria-label="Toggle jump-to menu"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="1.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
          <circle cx="10.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
        </svg>
        Jump to…
      </button>

      {open && (
        <div className="graph-controls__panel">
          <div className="graph-controls__tabs" role="tablist" aria-label="Jump to">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'realms'}
              className={`graph-controls__tab${tab === 'realms' ? ' graph-controls__tab--active' : ''}`}
              onClick={() => setTab('realms')}
            >
              Realms
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'genres'}
              className={`graph-controls__tab${tab === 'genres' ? ' graph-controls__tab--active' : ''}`}
              onClick={() => setTab('genres')}
            >
              Genres
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'scenes'}
              className={`graph-controls__tab${tab === 'scenes' ? ' graph-controls__tab--active' : ''}`}
              onClick={() => setTab('scenes')}
            >
              Scenes
            </button>
          </div>

          {tab === 'realms' && (
            <div className="graph-controls__options" role="radiogroup" aria-label="Realms">
              {REALMS.map(realm => {
                const checked = activeRealm === realm;
                return (
                  <label
                    key={realm}
                    className={`graph-controls__check${checked ? ' graph-controls__check--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      role="radio"
                      aria-checked={checked}
                      checked={checked}
                      onChange={() => onSelectRealm(realm)}
                      className="sr-only"
                    />
                    <span className="graph-controls__swatch" style={{ background: REALM_COLORS[realm] }} aria-hidden />
                    <span className="graph-controls__option-label">{REALM_LABELS[realm]}</span>
                    <span className="graph-controls__option-count">{realmCounts.get(realm) ?? 0}</span>
                    {checked && <span className="graph-controls__check-mark" aria-hidden>✓</span>}
                  </label>
                );
              })}
            </div>
          )}

          {tab === 'genres' && (
            <>
              <input
                type="search"
                className="graph-controls__search"
                placeholder="Search genres…"
                value={genreQuery}
                onChange={e => setGenreQuery(e.target.value)}
              />
              <div className="graph-controls__options graph-controls__options--scroll" role="radiogroup" aria-label="Genres">
                {filteredGenreOptions.length === 0 && (
                  <p className="graph-controls__empty">No matches</p>
                )}
                {filteredGenreOptions.map(g => {
                  const checked = activeGenreId === g.id;
                  return (
                    <label
                      key={g.id}
                      className={`graph-controls__check${checked ? ' graph-controls__check--active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        role="radio"
                        aria-checked={checked}
                        checked={checked}
                        onChange={() => onSelectGenre(g.id)}
                        className="sr-only"
                      />
                      <span
                        className="graph-controls__swatch"
                        style={{ background: GENRE_COLORS[g.id] ?? DEFAULT_GENRE_COLOR }}
                        aria-hidden
                      />
                      <span className="graph-controls__option-label">{g.label}</span>
                      <span className="graph-controls__option-count">{g.count}</span>
                      {checked && <span className="graph-controls__check-mark" aria-hidden>✓</span>}
                    </label>
                  );
                })}
              </div>
            </>
          )}


          {tab === 'scenes' && (
            <div className="graph-controls__options" role="radiogroup" aria-label="Scenes">
              {sceneOptions.map(s => {
                const checked = activeSceneId === s.id;
                return (
                  <label
                    key={s.id}
                    className={`graph-controls__check${checked ? ' graph-controls__check--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      role="radio"
                      aria-checked={checked}
                      checked={checked}
                      onChange={() => onSelectScene(s.id)}
                      className="sr-only"
                    />
                    <span
                      className="graph-controls__swatch"
                      style={{ background: SCENE_COLORS[s.id] ?? DEFAULT_SCENE_COLOR }}
                      aria-hidden
                    />
                    <span className="graph-controls__option-label">{s.label}</span>
                    <span className="graph-controls__option-count">{s.count}</span>
                    {checked && <span className="graph-controls__check-mark" aria-hidden>✓</span>}
                  </label>
                );
              })}
            </div>
          )}

          {hasSelection && (
            <button type="button" className="graph-controls__clear" onClick={onClear}>
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
