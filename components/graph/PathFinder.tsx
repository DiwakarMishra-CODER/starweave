'use client';

import { useState } from 'react';
import type { Artist, Edge } from '@/data/types';
import { buildAdjacencyList, findShortestPath } from '@/lib/graph-utils';

interface Props {
  artists: Artist[];
  edges: Edge[];
  onPathFound: (path: string[] | null) => void;
}

export default function PathFinder({ artists, edges, onPathFound }: Props) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [path, setPath] = useState<string[] | null | 'none'>(null);

  const sorted = [...artists].sort((a, b) => a.name.localeCompare(b.name));
  const nameMap = Object.fromEntries(artists.map(a => [a.id, a.name]));
  const adjList = buildAdjacencyList(edges);

  function handleFind() {
    if (!src || !dst) return;
    const result = findShortestPath(src, dst, adjList);
    setPath(result ?? 'none');
    onPathFound(result);
  }

  function handleClear() {
    setSrc('');
    setDst('');
    setPath(null);
    onPathFound(null);
  }

  return (
    <div className="pathfinder">
      <button
        className={`pathfinder__trigger${open ? ' pathfinder__trigger--active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Find path between artists"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 10 L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="2" cy="10" r="1.5" fill="currentColor" />
          <circle cx="10" cy="2" r="1.5" fill="currentColor" />
        </svg>
        Find a path
      </button>

      {open && (
        <div className="pathfinder__card">
          <label className="pathfinder__label" htmlFor="pf-src">
            From
          </label>
          <select
            id="pf-src"
            className="pathfinder__select"
            value={src}
            onChange={e => setSrc(e.target.value)}
          >
            <option value="">Select artist…</option>
            {sorted.map(a => (
              <option key={a.id} value={a.id} disabled={a.id === dst}>
                {a.name}
              </option>
            ))}
          </select>

          <label className="pathfinder__label" htmlFor="pf-dst">
            To
          </label>
          <select
            id="pf-dst"
            className="pathfinder__select"
            value={dst}
            onChange={e => setDst(e.target.value)}
          >
            <option value="">Select artist…</option>
            {sorted.map(a => (
              <option key={a.id} value={a.id} disabled={a.id === src}>
                {a.name}
              </option>
            ))}
          </select>

          <button
            className="pathfinder__btn"
            onClick={handleFind}
            disabled={!src || !dst || src === dst}
          >
            Find connection
          </button>

          {path !== null && (
            <div className="pathfinder__result">
              <p className="pathfinder__result-label">
                {path === 'none' ? 'No path found' : `${(path as string[]).length - 1} hop${(path as string[]).length - 1 !== 1 ? 's' : ''}`}
              </p>
              {path === 'none' ? (
                <p className="pathfinder__no-path">
                  No directed influence path exists between these artists in this dataset.
                </p>
              ) : (
                <ol className="pathfinder__path">
                  {(path as string[]).map(id => (
                    <li key={id} className="pathfinder__path-node">
                      {nameMap[id] ?? id}
                    </li>
                  ))}
                </ol>
              )}
              <button className="pathfinder__clear" onClick={handleClear}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
