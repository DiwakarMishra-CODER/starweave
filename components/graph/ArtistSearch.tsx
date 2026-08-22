'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { Artist, Edge, Genre } from '@/data/types';
import { resolveNodeColor } from '@/lib/colors';
import { compareNames } from '@/lib/sort';

interface Props {
  artists: Artist[];
  genres: Genre[];
  edges: Edge[];
  onSelectArtist: (id: string) => void;
}

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
    <li role="option" aria-selected={false}>
      <button
        className="artist-search__item"
        style={{ '--row-color': color } as React.CSSProperties}
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

export default function ArtistSearch({ artists, genres, edges, onSelectArtist }: Props) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  const genreNames = Object.fromEntries(genres.map(g => [g.id, g.name]));
  const sorted = [...artists].sort((a, b) => compareNames(a.name, b.name));
  const q      = query.trim().toLowerCase();
  const matches = q ? sorted.filter(a => a.name.toLowerCase().includes(q)) : [];

  // Empty-query view: every artist, not a hand-picked top-N — the whole
  // point of dropping "Start here" is that a fixed shortlist read as if the
  // graph only had 6 artists in it. Ranked by TOTAL edge count (both
  // directions, not just influenceScore's in-degree-only count), so a
  // heavily-cited root and a disciple with a long list of stated influences
  // both rank by how connected they actually are, not just how often
  // they're cited. The existing .artist-search__list is already a scrollable
  // (max-height + overflow-y) container, so showing all 293 here doesn't
  // need any new scroll mechanism — it just needed something worth scrolling.
  const browseAll = useMemo(() => {
    const edgeCount = new Map<string, number>();
    for (const e of edges) {
      edgeCount.set(e.source, (edgeCount.get(e.source) ?? 0) + 1);
      edgeCount.set(e.target, (edgeCount.get(e.target) ?? 0) + 1);
    }
    return [...artists].sort((a, b) => {
      const diff = (edgeCount.get(b.id) ?? 0) - (edgeCount.get(a.id) ?? 0);
      return diff !== 0 ? diff : compareNames(a.name, b.name);
    });
  }, [artists, edges]);

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
          role="combobox"
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
          {browseAll.map(a => (
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
