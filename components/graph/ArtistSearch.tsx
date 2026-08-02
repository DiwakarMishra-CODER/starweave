'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { Artist, Genre } from '@/data/types';
import { resolveNodeColor } from '@/lib/colors';

interface Props {
  artists: Artist[];
  genres: Genre[];
  onSelectArtist: (id: string) => void;
}

// Number of "Start here" suggestions shown when the search box is focused
// with an empty query — a cold visitor's entry point into 293 otherwise-
// unlabeled nodes. Ranked by influenceScore (in-degree of influence edges),
// not hand-picked, so it stays correct as the roster grows.
const START_HERE_COUNT = 6;

function ArtistRow({
  artist,
  color,
  genreLabel,
  onSelect,
}: {
  artist: Artist;
  color: string;
  genreLabel: string;
  onSelect: (id: string) => void;
}) {
  return (
    <li role="option">
      <button
        className="artist-search__item"
        onPointerDown={e => { e.preventDefault(); onSelect(artist.id); }}
      >
        {artist.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.imageUrl}
            alt=""
            aria-hidden
            className="artist-search__item-avatar"
            style={{ borderColor: color }}
            loading="lazy"
            width={28}
            height={28}
          />
        ) : (
          <span
            className="artist-search__item-avatar-fallback"
            style={{ background: color, borderColor: color }}
            aria-hidden
          >
            {artist.name.charAt(0)}
          </span>
        )}
        <span className="artist-search__item-text">
          <span className="artist-search__item-name">{artist.name}</span>
          {genreLabel && (
            <span className="artist-search__item-genres">{genreLabel}</span>
          )}
        </span>
      </button>
    </li>
  );
}

export default function ArtistSearch({ artists, genres, onSelectArtist }: Props) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  const genreNames = Object.fromEntries(genres.map(g => [g.id, g.name]));
  const sorted = [...artists].sort((a, b) => a.name.localeCompare(b.name));
  const q      = query.trim().toLowerCase();
  const matches = q ? sorted.filter(a => a.name.toLowerCase().includes(q)) : [];

  const startHere = useMemo(
    () => [...artists]
      .sort((a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0))
      .slice(0, START_HERE_COUNT),
    [artists],
  );

  function handleSelect(id: string) {
    onSelectArtist(id);
    setQuery('');
    setOpen(false);
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function genreLabelFor(a: Artist): string {
    return a.genres.slice(0, 2).map(g => genreNames[g] ?? g).join(' · ');
  }

  return (
    <div className="artist-search" ref={containerRef}>
      <div className="artist-search__input-wrap">
        <svg className="artist-search__icon" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="artist-search__input"
          placeholder="Find artist…"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setOpen(false); setQuery(''); }
            if (e.key === 'Enter' && matches.length === 1) handleSelect(matches[0].id);
          }}
          aria-label="Find artist"
          aria-expanded={open}
          aria-controls="artist-search-list"
        />
        {query && (
          <button className="artist-search__clear" onClick={handleClear} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {open && !q && (
        <ul id="artist-search-list" className="artist-search__list" role="listbox">
          <li className="artist-search__section-label" aria-hidden>Start here</li>
          {startHere.map(a => (
            <ArtistRow
              key={a.id}
              artist={a}
              color={resolveNodeColor(a)}
              genreLabel={genreLabelFor(a)}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      )}

      {open && q && matches.length > 0 && (
        <ul id="artist-search-list" className="artist-search__list" role="listbox">
          {matches.slice(0, 14).map(a => (
            <ArtistRow
              key={a.id}
              artist={a}
              color={resolveNodeColor(a)}
              genreLabel={genreLabelFor(a)}
              onSelect={handleSelect}
            />
          ))}
          {matches.length > 14 && (
            <li className="artist-search__overflow" aria-hidden>
              +{matches.length - 14} more — keep typing
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
