import Link from 'next/link';
import type { Artist } from '@/data/types';
import { LAYER_COLORS } from '@/lib/colors';

interface Props {
  artist: Artist;
  genreNames: Record<string, string>;
}

export default function ArtistCard({ artist, genreNames }: Props) {
  const color = LAYER_COLORS[artist.layer];
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
        {typeof artist.influenceScore === 'number' && artist.influenceScore > 0 && (
          <p className="artist-card__score">
            {artist.influenceScore} {artist.influenceScore === 1 ? 'influence' : 'influences'}
          </p>
        )}
      </div>
    </Link>
  );
}
