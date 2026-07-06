import Link from 'next/link';
import type { Artist } from '@/data/types';
import { LAYER_COLORS } from '@/lib/colors';

interface Props {
  artist: Artist;
  genreNames: Record<string, string>;
}

export default function ArtistCard({ artist, genreNames }: Props) {
  const genreLabels = artist.genres
    .slice(0, 2)
    .map(g => genreNames[g] ?? g)
    .join(' · ');

  return (
    <Link href={`/artist/${artist.id}`} className="artist-card">
      <div style={{ marginBottom: '0.5rem' }}>
        <span
          className="artist-card__layer-dot"
          style={{ background: LAYER_COLORS[artist.layer] }}
          aria-hidden
        />
      </div>
      <p className="artist-card__name">{artist.name}</p>
      <p className="artist-card__genres">{genreLabels}</p>
      {typeof artist.influenceScore === 'number' && artist.influenceScore > 0 && (
        <p className="artist-card__score">
          {artist.influenceScore} {artist.influenceScore === 1 ? 'influence' : 'influences'}
        </p>
      )}
    </Link>
  );
}
