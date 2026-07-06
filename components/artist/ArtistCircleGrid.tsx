'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Artist } from '@/data/types';
import { LAYER_COLORS } from '@/lib/colors';

const INITIAL_LIMIT = 12;

interface Props {
  artists: Artist[];
  emptyMessage?: string;
}

export default function ArtistCircleGrid({ artists, emptyMessage }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = artists.length > INITIAL_LIMIT;
  const visible = expanded ? artists : artists.slice(0, INITIAL_LIMIT);

  if (artists.length === 0) {
    return emptyMessage ? (
      <p className="influence-grid__empty">{emptyMessage}</p>
    ) : null;
  }

  return (
    <>
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
      {hasMore && (
        <button
          className="influence-grid__toggle"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Show less' : `Show all ${artists.length}`}
        </button>
      )}
    </>
  );
}
