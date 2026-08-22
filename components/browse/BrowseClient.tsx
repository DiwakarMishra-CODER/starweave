'use client';

import { useMemo, useState } from 'react';
import type { Artist, Edge, Genre, Scene } from '@/data/types';
import ArtistCard from '@/components/artist/ArtistCard';
import FilterDropdown, { type FilterOption } from '@/components/browse/FilterDropdown';
import SortDropdown, { type SortOption } from '@/components/browse/SortDropdown';
import { compareNames } from '@/lib/sort';

type SortBy = 'influence' | 'alpha' | 'year';
type DropdownKey = 'genre' | 'scene' | 'era' | 'sort';
type FilterKind = 'genre' | 'scene' | 'era';

const SORT_OPTIONS: SortOption[] = [
  { id: 'influence', label: 'Influence' },
  { id: 'alpha', label: 'A – Z' },
  { id: 'year', label: 'Year / Era' },
];

interface Props {
  artists: Artist[];
  genres: Genre[];
  scenes: Scene[];
  edges: Edge[];
}

interface EraBucket {
  id: string;
  label: string;
  test: (year: number) => boolean;
}

// 169 of 293 artists carry no `activeFrom` in the live data, despite
// CLAUDE.md's claim that every artist has one — 'unknown' surfaces that gap
// as a real, selectable bucket instead of silently dropping those artists
// out of every era filter.
const ERA_BUCKETS: EraBucket[] = [
  { id: '1960s', label: '1960s', test: y => y < 1970 },
  { id: '1970s', label: '1970s', test: y => y >= 1970 && y < 1980 },
  { id: '1980s', label: '1980s', test: y => y >= 1980 && y < 1990 },
  { id: '1990s', label: '1990s', test: y => y >= 1990 && y < 2000 },
  { id: '2000s', label: '2000s', test: y => y >= 2000 && y < 2010 },
  { id: '2010s+', label: '2010s+', test: y => y >= 2010 },
];

function eraIdOf(year: number | undefined): string {
  if (year == null) return 'unknown';
  return ERA_BUCKETS.find(b => b.test(year))?.id ?? 'unknown';
}

const KIND_LABELS: Record<FilterKind, string> = {
  genre: 'Genre',
  scene: 'Scene',
  era: 'Era',
};

function toggleId(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export default function BrowseClient({ artists, genres, scenes, edges }: Props) {
  // One pass over the edge set for the whole grid, rather than each card
  // filtering 1,041 edges for itself. Roots = who shaped them (outgoing),
  // descendants = who they shaped (incoming) -- the same split the artist
  // pages label with those words.
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, { roots: number; descendants: number }>();
    const bump = (id: string, key: 'roots' | 'descendants') => {
      const cur = counts.get(id) ?? { roots: 0, descendants: 0 };
      cur[key] += 1;
      counts.set(id, cur);
    };
    for (const e of edges) {
      if (e.type !== 'influence') continue;
      bump(e.source, 'roots');
      bump(e.target, 'descendants');
    }
    return counts;
  }, [edges]);

  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  const [selectedEras, setSelectedEras] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('influence');

  const genreNames = useMemo(() => Object.fromEntries(genres.map(g => [g.id, g.name])), [genres]);
  const sceneNames = useMemo(() => Object.fromEntries(scenes.map(s => [s.id, s.name])), [scenes]);

  const genreOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const artist of artists) {
      for (const g of artist.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...genres]
      .map(g => ({ id: g.id, label: g.name, count: counts.get(g.id) ?? 0 }))
      .sort((a, b) => compareNames(a.label, b.label));
  }, [artists, genres]);

  const sceneOptions: FilterOption[] = useMemo(
    () =>
      [...scenes]
        .map(s => ({ id: s.id, label: s.name, count: s.memberIds.length }))
        .sort((a, b) => compareNames(a.label, b.label)),
    [scenes]
  );

  const sceneMembership = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const scene of scenes) {
      for (const artistId of scene.memberIds) {
        if (!map.has(artistId)) map.set(artistId, new Set());
        map.get(artistId)!.add(scene.id);
      }
    }
    return map;
  }, [scenes]);

  const eraOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const artist of artists) {
      const id = eraIdOf(artist.activeFrom);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const unknownCount = counts.get('unknown') ?? 0;
    return [
      ...ERA_BUCKETS.map(b => ({ id: b.id, label: b.label, count: counts.get(b.id) ?? 0 })),
      // Hidden while the gap is fully closed (0 artists) — reappears on its own
      // if a future artist is ever added without activeFrom, rather than
      // silently masking a real data gap behind a hardcoded removal.
      ...(unknownCount > 0 ? [{ id: 'unknown', label: 'Unknown', count: unknownCount }] : []),
    ];
  }, [artists]);

  const filtered = useMemo(() => {
    let result = artists;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q));
    }
    if (selectedGenres.size > 0) {
      result = result.filter(a => a.genres.some(g => selectedGenres.has(g)));
    }
    if (selectedScenes.size > 0) {
      result = result.filter(a => {
        const memberOf = sceneMembership.get(a.id);
        if (!memberOf) return false;
        for (const s of selectedScenes) if (memberOf.has(s)) return true;
        return false;
      });
    }
    if (selectedEras.size > 0) {
      result = result.filter(a => selectedEras.has(eraIdOf(a.activeFrom)));
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'alpha') return compareNames(a.name, b.name);
      if (sortBy === 'year') return (a.activeFrom ?? 9999) - (b.activeFrom ?? 9999);
      return (b.influenceScore ?? 0) - (a.influenceScore ?? 0);
    });
  }, [artists, query, selectedGenres, selectedScenes, selectedEras, sceneMembership, sortBy]);

  const activeFilters = useMemo(() => {
    const list: { kind: FilterKind; id: string; label: string }[] = [];
    for (const id of selectedGenres) list.push({ kind: 'genre', id, label: genreNames[id] ?? id });
    for (const id of selectedScenes) list.push({ kind: 'scene', id, label: sceneNames[id] ?? id });
    for (const id of selectedEras) {
      const label = eraOptions.find(o => o.id === id)?.label ?? id;
      list.push({ kind: 'era', id, label });
    }
    return list;
  }, [selectedGenres, selectedScenes, selectedEras, genreNames, sceneNames, eraOptions]);

  function removeFilter(kind: FilterKind, id: string) {
    if (kind === 'genre') setSelectedGenres(prev => toggleId(prev, id));
    else if (kind === 'scene') setSelectedScenes(prev => toggleId(prev, id));
    else setSelectedEras(prev => toggleId(prev, id));
  }

  function clearAll() {
    setSelectedGenres(new Set());
    setSelectedScenes(new Set());
    setSelectedEras(new Set());
  }

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

      <div className="browse-dropdown-row" role="group" aria-label="Browse filters">
        <FilterDropdown
          label="Genre"
          options={genreOptions}
          selected={selectedGenres}
          onToggle={id => setSelectedGenres(prev => toggleId(prev, id))}
          isOpen={openDropdown === 'genre'}
          onOpenChange={open => setOpenDropdown(open ? 'genre' : null)}
          searchable
        />
        <FilterDropdown
          label="Scene"
          options={sceneOptions}
          selected={selectedScenes}
          onToggle={id => setSelectedScenes(prev => toggleId(prev, id))}
          isOpen={openDropdown === 'scene'}
          onOpenChange={open => setOpenDropdown(open ? 'scene' : null)}
        />
        <FilterDropdown
          label="Era"
          options={eraOptions}
          selected={selectedEras}
          onToggle={id => setSelectedEras(prev => toggleId(prev, id))}
          isOpen={openDropdown === 'era'}
          onOpenChange={open => setOpenDropdown(open ? 'era' : null)}
        />

        <SortDropdown
          label="Sort"
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={id => setSortBy(id as SortBy)}
          isOpen={openDropdown === 'sort'}
          onOpenChange={open => setOpenDropdown(open ? 'sort' : null)}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="browse-active-filters">
          {activeFilters.map(f => (
            <span key={`${f.kind}-${f.id}`} className="browse-active-chip">
              <span className="browse-active-chip__kind">{KIND_LABELS[f.kind]}</span>
              {f.label}
              <button
                type="button"
                className="browse-active-chip__remove"
                onClick={() => removeFilter(f.kind, f.id)}
                aria-label={`Remove ${KIND_LABELS[f.kind]} filter: ${f.label}`}
              >
                ×
              </button>
            </span>
          ))}
          {activeFilters.length >= 2 && (
            <button type="button" className="browse-clear-all" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="browse-toolbar">
        <p className="browse-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'artist' : 'artists'}
        </p>
      </div>

      <div className="artist-grid">
        {filtered.map(artist => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            genreNames={genreNames}
            roots={connectionCounts.get(artist.id)?.roots ?? 0}
            descendants={connectionCounts.get(artist.id)?.descendants ?? 0}
          />
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
