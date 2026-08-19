import Link from 'next/link';
import type { Artist } from '@/data/types';
import { resolveNodeColor } from '@/lib/colors';

interface Props {
  artist: Artist;
  genreNames: Record<string, string>;
  /**
   * Counted by the caller once over the whole edge set, not derived from
   * artist.influenceScore. That field is in-degree ONLY, and the card used to
   * print it as "N influences" -- which says the opposite of what it measures:
   * the Velvet Underground cites nobody, yet its card claimed 56 influences.
   * It also meant the 96 artists with in-degree 0 (a third of the graph,
   * Alvvays among them) rendered with no number at all despite having a list
   * of stated influences.
   *
   * Named for the artist page's own sections so the two agree: roots are who
   * shaped them, descendants are who they shaped.
   */
  roots: number;
  descendants: number;
}

export default function ArtistCard({ artist, genreNames, roots, descendants }: Props) {
  const color = resolveNodeColor(artist);
  const genreLabels = artist.genres
    .slice(0, 2)
    .map(g => genreNames[g] ?? g)
    .join(' · ');

  return (
    <Link
      href={`/artist/${artist.id}`}
      className="artist-card"
      style={{ '--layer-color': color } as React.CSSProperties}
    >
      <div className="artist-card__photo-wrap">
        {artist.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="artist-card__photo"
            loading="lazy"
            width={280}
            height={280}
          />
        ) : (
          <div
            className="artist-card__photo-fallback"
            style={{ background: color }}
            aria-hidden
          >
            {artist.name.charAt(0)}
          </div>
        )}
        <div className="artist-card__photo-overlay" aria-hidden />
      </div>
      <div className="artist-card__info">
        <div className="artist-card__name-row">
          <span
            className="artist-card__layer-dot"
            style={{ background: color }}
            aria-hidden
          />
          <p className="artist-card__name">{artist.name}</p>
        </div>
        {genreLabels && (
          <p className="artist-card__genres">{genreLabels}</p>
        )}
        {/* Descendants first: that is the figure the Influence sort ranks by,
            so the order of the grid stays explained by the first number on the
            card. A zero side is dropped rather than printed -- but never both,
            since the no-orphans rule means every artist has at least one edge. */}
        {(descendants > 0 || roots > 0) && (
          <p className="artist-card__score">
            {[
              descendants > 0 && `${descendants} ${descendants === 1 ? 'descendant' : 'descendants'}`,
              roots > 0 && `${roots} ${roots === 1 ? 'root' : 'roots'}`,
            ].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}
