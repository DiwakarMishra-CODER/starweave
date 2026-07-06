'use client';

import { useState, useMemo } from 'react';
import type { Artist, Genre, Layer } from '@/data/types';
import { LAYER_COLORS, LAYER_LABELS, LAYERS } from '@/lib/colors';
import ArtistCard from '@/components/artist/ArtistCard';

interface Props {
  artists: Artist[];
  genres: Genre[];
}

export default function BrowseClient({ artists, genres }: Props) {
  const [query, setQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<Layer | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const genreNames = Object.fromEntries(genres.map(g => [g.id, g.name]));

  const filtered = useMemo(() => {
    let result = artists;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q));
    }
    if (activeLayer) {
      result = result.filter(a => a.layer === activeLayer);
    }
    if (activeGenre) {
      result = result.filter(a => a.genres.includes(activeGenre));
    }
    return [...result].sort((a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0));
  }, [artists, query, activeLayer, activeGenre]);

  const topGenres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const artist of artists) {
      for (const g of artist.genres) {
        counts.set(g, (counts.get(g) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);
  }, [artists]);

  return (
    <>
      <div className="browse-search">
        <input
          className="browse-search__input"
          type="search"
          placeholder="Search artists…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search artists"
        />
      </div>

      <div className="browse-filters" role="group" aria-label="Layer filters">
        {LAYERS.map(layer => (
          <button
            key={layer}
            className={`browse-filter-chip${activeLayer === layer ? ' browse-filter-chip--active' : ''}`}
            style={
              activeLayer === layer
                ? { background: LAYER_COLORS[layer], borderColor: LAYER_COLORS[layer] }
                : {}
            }
            onClick={() => setActiveLayer(prev => (prev === layer ? null : layer))}
            aria-pressed={activeLayer === layer}
          >
            {LAYER_LABELS[layer]}
          </button>
        ))}
      </div>

      <div className="browse-filters" role="group" aria-label="Genre filters">
        {topGenres.map(gId => (
          <button
            key={gId}
            className={`browse-filter-chip${activeGenre === gId ? ' browse-filter-chip--active' : ''}`}
            style={
              activeGenre === gId
                ? { background: 'var(--color-shoegaze)', borderColor: 'var(--color-shoegaze)', color: '#0e0b1a' }
                : {}
            }
            onClick={() => setActiveGenre(prev => (prev === gId ? null : gId))}
            aria-pressed={activeGenre === gId}
          >
            {genreNames[gId] ?? gId}
          </button>
        ))}
      </div>

      <p className="browse-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'artist' : 'artists'}
      </p>

      <div className="artist-grid">
        {filtered.map(artist => (
          <ArtistCard key={artist.id} artist={artist} genreNames={genreNames} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
          No artists match your filters.
        </p>
      )}
    </>
  );
}
