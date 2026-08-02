'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Artist, Edge } from '@/data/types';
import { resolveCitationStatus } from '@/data/types';
import { LAYER_COLORS } from '@/lib/colors';

const INITIAL_LIMIT = 12;

export interface InfluenceItem {
  artist: Artist;
  edge: Edge;
}

interface Props {
  // Plain mode — genre pages pass just artists, no citation data and no
  // "Show sources" toggle (a genre's membership isn't a per-artist cited
  // claim the way an influence edge is). Kept working byte-for-byte as
  // before so that caller stays untouched.
  artists?: Artist[];
  // Citation-aware mode — the artist page's Influenced/Influenced by
  // sections pass each artist alongside the edge connecting it, so a
  // "Show sources" toggle can switch the grid to a list showing the same
  // three citation states (cited / unsourceable / unchecked) and the same
  // wording as the graph panel's own Source/No source toggle.
  items?: InfluenceItem[];
  emptyMessage?: string;
}

export default function ArtistCircleGrid({ artists, items, emptyMessage }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const list: Artist[] = items ? items.map(i => i.artist) : (artists ?? []);
  const edgeById = items ? new Map(items.map(i => [i.artist.id, i.edge])) : null;

  const hasMore = list.length > INITIAL_LIMIT;
  const visible = expanded ? list : list.slice(0, INITIAL_LIMIT);

  if (list.length === 0) {
    return emptyMessage ? (
      <p className="influence-grid__empty">{emptyMessage}</p>
    ) : null;
  }

  return (
    <>
      {edgeById && (
        <button
          type="button"
          className={`influence-grid__sources-toggle${showSources ? ' influence-grid__sources-toggle--active' : ''}`}
          onClick={() => setShowSources(s => !s)}
          aria-pressed={showSources}
        >
          <svg className="influence-grid__sources-toggle__icon" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M7 8h4v4c0 2.2-1.8 4-4 4v-2c1.1 0 2-.9 2-2H7V8z" fill="currentColor" />
            <path d="M15 8h4v4c0 2.2-1.8 4-4 4v-2c1.1 0 2-.9 2-2h-2V8z" fill="currentColor" />
          </svg>
          {showSources ? 'Hide sources' : 'Show sources'}
        </button>
      )}

      {edgeById && showSources ? (
        <ul className="influence-list">
          {visible.map(artist => {
            const edge = edgeById.get(artist.id)!;
            const status = resolveCitationStatus(edge);
            const color = LAYER_COLORS[artist.layer];
            return (
              <li key={artist.id}>
                <Link
                  href={`/artist/${artist.id}`}
                  className="influence-list-item"
                >
                  <span
                    className="influence-list-item__avatar"
                    style={{ '--chip-color': color } as React.CSSProperties}
                  >
                    {artist.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={artist.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                      />
                    ) : (
                      <span
                        className="influence-list-item__initial"
                        style={{ background: color }}
                      >
                        {artist.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="influence-list-item__body">
                    <span className="influence-list-item__name">{artist.name}</span>
                    {status === 'cited' && edge.citation && (
                      <span className="influence-list-item__note influence-list-item__note--citation">
                        {edge.citation}
                      </span>
                    )}
                    {status === 'unsourceable' && (
                      <span className="influence-list-item__note influence-list-item__note--unsourceable">
                        Widely accepted, unsourced.
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="influence-grid">
          {visible.map(artist => {
            const color = LAYER_COLORS[artist.layer];
            return (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="influence-circle"
                style={{ '--chip-color': color } as React.CSSProperties}
              >
                <div className="influence-circle__avatar">
                  {artist.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artist.imageUrl}
                      alt=""
                      className="influence-circle__img"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <span
                      className="influence-circle__initial"
                      style={{ background: color }}
                    >
                      {artist.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="influence-circle__name">{artist.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          className="influence-grid__toggle"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Show less' : `Show all ${list.length}`}
        </button>
      )}
    </>
  );
}
