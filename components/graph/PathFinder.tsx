'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artist } from '@/data/types';
import { resolveNodeColor } from '@/lib/colors';
import { useNarrowLayout } from '@/lib/use-media-query';
import { compareNames } from '@/lib/sort';

const PATH_ENDS = ['from', 'to'] as const;

interface Props {
  artists: Artist[];
  // Both ends of a path search. Fires with (fromId, toId) whenever either
  // changes; '' means "not chosen yet". GraphView owns the search itself so the
  // one resolved result can drive the canvas and the result panel together.
  onFindPath: (fromId: string, toId: string) => void;
  pathFromId: string | null;
  pathToId: string | null;
  // Fired when an outside click closes the panel — lets the caller suppress the
  // graph's own background-click deselect, which would otherwise also fire from
  // that same click when its only intent was to close this.
  onOutsideClick?: () => void;
}

// Small round photo, in the two end fields and in the artist list. Every artist
// in the graph has an imageUrl, but the letter tile stays as a fallback since
// the field is optional on the type and a build can come back with a gap.
// Lazy, because the unfiltered list renders all ~293 rows into the scroller.
function ArtistThumb({ artist, className }: { artist: Artist; className: string }) {
  return (
    <span className={className} aria-hidden>
      {artist.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artist.imageUrl} alt="" width={22} height={22} loading="lazy" />
      ) : (
        <span className={`${className}-initial`}>{artist.name.charAt(0)}</span>
      )}
    </span>
  );
}

/**
 * Its own control rather than a fourth tab inside "Jump to…".
 *
 * The three tabs in that menu — Realms, Genres, Scenes — all do one thing:
 * highlight a set and fly the camera to it. That is navigation. This asks the
 * graph a question and computes an answer, which is a different verb, and
 * filing it last in a list of three navigation options buried the one feature
 * that demonstrates what the citation data is actually for.
 *
 * Named as the question rather than as the mechanism, for the same reason the
 * evidence filter stopped saying "edges": "Path" is graph vocabulary, and the
 * people this is built for came here for music.
 */
export default function PathFinder({
  artists,
  onFindPath,
  pathFromId,
  pathToId,
  onOutsideClick,
}: Props) {
  const [open, setOpen] = useState(false);
  // Which end is being typed into, and its query. One query at a time because
  // only the focused field opens a list.
  const [field, setField] = useState<'from' | 'to'>('from');
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  // The full question does not fit beside "Jump to…" on a phone. Same
  // short-form treatment the evidence filter uses, and for the same reason.
  const isNarrowLayout = useNarrowLayout();

  const artistOptions = useMemo(
    () => [...artists].sort((a, b) => compareNames(a.name, b.name)),
    [artists],
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return artistOptions;
    return artistOptions.filter(a => a.name.toLowerCase().includes(q));
  }, [artistOptions, query]);

  const artistById = useMemo(
    () => Object.fromEntries(artists.map(a => [a.id, a])) as Record<string, Artist>,
    [artists],
  );

  const hasPath = pathFromId !== null || pathToId !== null;

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
    <div className="path-finder" ref={containerRef}>
      <button
        className={`path-finder__toggle${hasPath ? ' path-finder__toggle--active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        {/* Two stops and the line between them — the shape of the answer. */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="2.5" cy="2.5" r="2" fill="currentColor" />
          <circle cx="9.5" cy="9.5" r="2" fill="currentColor" />
          <path d="M2.5 4.5v2a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        {/* Names the action and its input. An earlier label asked "How are
            they connected?" -- but nothing is selected when this is read, so
            "they" referred to nothing. Deliberately avoids "lineage" or "line
            of descent": only 8.6% of paths in this graph run one direction the
            whole way, so that framing would be wrong most times it was used. */}
        {isNarrowLayout ? 'Connect' : 'Connect two artists'}
      </button>

      {open && (
        <div className="path-finder__panel">
          {PATH_ENDS.map(end => {
            const id = end === 'from' ? pathFromId : pathToId;
            const artist = id ? artistById[id] : null;
            const active = field === end;
            return (
              <div key={end} className="graph-controls__path-row">
                <div
                  className={[
                    'graph-controls__path-field',
                    active ? 'graph-controls__path-field--active' : '',
                    artist ? 'graph-controls__path-field--filled' : '',
                  ].filter(Boolean).join(' ')}
                  style={artist ? ({ '--end-color': resolveNodeColor(artist) } as React.CSSProperties) : undefined}
                >
                  <span className="graph-controls__path-dot" aria-hidden />
                  {artist
                    ? <ArtistThumb artist={artist} className="graph-controls__path-avatar" />
                    : <span className="graph-controls__path-avatar graph-controls__path-avatar--empty" aria-hidden />}
                  <input
                    type="search"
                    className="graph-controls__path-input"
                    // The chosen artist shows whenever there is no query to show
                    // instead — including while this field is still the active
                    // one, which is the state right after a pick. Focus selects
                    // the text so typing replaces the name rather than appending.
                    value={active && query !== '' ? query : (artist?.name ?? '')}
                    placeholder={end === 'from' ? 'Starting artist…' : 'Destination…'}
                    aria-label={end === 'from' ? 'Starting artist' : 'Destination artist'}
                    onFocus={e => { setField(end); setQuery(''); e.currentTarget.select(); }}
                    onChange={e => { setField(end); setQuery(e.target.value); }}
                  />
                  {artist && (
                    <button
                      type="button"
                      className="graph-controls__path-clear"
                      aria-label={`Clear ${end === 'from' ? 'starting artist' : 'destination'}`}
                      onClick={() => {
                        const nextFrom = end === 'from' ? '' : (pathFromId ?? '');
                        const nextTo   = end === 'to'   ? '' : (pathToId ?? '');
                        setField(end);
                        setQuery('');
                        onFindPath(nextFrom, nextTo);
                      }}
                    >
                      &#10005;
                    </button>
                  )}
                </div>

                {/* In flow, directly beneath the field being filled, so choosing
                    a From pushes the To field down rather than covering it. */}
                {active && (
                  <div
                    className="graph-controls__options graph-controls__options--scroll graph-controls__path-results"
                    role="listbox"
                    aria-label={end === 'from' ? 'Starting artists' : 'Destination artists'}
                  >
                    {filteredOptions.length === 0 && (
                      <p className="graph-controls__empty">No matches</p>
                    )}
                    {filteredOptions.map(a => {
                      const chosen = id === a.id;
                      // The other end, so the same artist can't be picked twice.
                      const takenByOtherEnd = end === 'from' ? pathToId === a.id : pathFromId === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          role="option"
                          aria-selected={chosen}
                          disabled={takenByOtherEnd}
                          className={`graph-controls__check${chosen ? ' graph-controls__check--active' : ''}`}
                          style={{ '--opt-color': resolveNodeColor(a) } as React.CSSProperties}
                          onClick={() => {
                            const nextFrom = end === 'from' ? a.id : pathFromId;
                            const nextTo   = end === 'to'   ? a.id : pathToId;
                            // Move to the empty end so two picks complete a
                            // search — visible as the caret landing there.
                            if (end === 'from' && !pathToId) { setField('to'); setQuery(''); }
                            else if (end === 'to' && !pathFromId) { setField('from'); setQuery(''); }
                            else setQuery('');
                            if (nextFrom && nextTo && nextFrom !== nextTo) onFindPath(nextFrom, nextTo);
                            else onFindPath(nextFrom ?? '', nextTo ?? '');
                            // On a phone, get out of the way once the question
                            // is complete: the answer is the sheet and the route
                            // on the graph, and this panel covers both. Desktop
                            // keeps it open -- the picker is top-left, the result
                            // is a right-hand drawer, they never overlap, and
                            // staying open is what makes swapping ends quick.
                            // In the handler rather than an effect so it fires
                            // once, on the completing action, and can never
                            // fight the user reopening the panel afterwards.
                            if (isNarrowLayout && nextFrom && nextTo && nextFrom !== nextTo) {
                              setOpen(false);
                            }
                          }}
                        >
                          <ArtistThumb artist={a} className="graph-controls__option-avatar" />
                          <span className="graph-controls__option-label">{a.name}</span>
                          {takenByOtherEnd
                            ? <span className="graph-controls__option-taken">{end === 'from' ? 'To' : 'From'}</span>
                            : chosen && <span className="graph-controls__check-mark" aria-hidden>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {pathFromId && pathToId && (
            <button
              type="button"
              className="graph-controls__path-swap"
              onClick={() => onFindPath(pathToId, pathFromId)}
            >
              <span aria-hidden>&#8645;</span> Swap ends
            </button>
          )}

          {hasPath && (
            <button
              type="button"
              className="graph-controls__clear"
              onClick={() => { setField('from'); setQuery(''); onFindPath('', ''); }}
            >
              Clear path
            </button>
          )}
        </div>
      )}
    </div>
  );
}
