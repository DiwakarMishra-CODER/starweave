'use client';

import { useState, useRef, useEffect } from 'react';
import type { Artist } from '@/data/types';

interface Props {
  artists: Artist[];
  onSelectArtist: (id: string) => void;
}

export default function ArtistSearch({ artists, onSelectArtist }: Props) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  const sorted = [...artists].sort((a, b) => a.name.localeCompare(b.name));
  const q      = query.trim().toLowerCase();
  const matches = q ? sorted.filter(a => a.name.toLowerCase().includes(q)) : sorted;

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

      {open && matches.length > 0 && (
        <ul id="artist-search-list" className="artist-search__list" role="listbox">
          {matches.slice(0, 14).map(a => (
            <li key={a.id} role="option">
              <button
                className="artist-search__item"
                onPointerDown={e => { e.preventDefault(); handleSelect(a.id); }}
              >
                {a.name}
              </button>
            </li>
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
