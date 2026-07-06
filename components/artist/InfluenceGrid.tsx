import type { Artist } from '@/data/types';
import ArtistCircleGrid from './ArtistCircleGrid';

interface Props {
  title: string;
  artists: Artist[];
  emptyMessage: string;
}

export default function InfluenceGrid({ title, artists, emptyMessage }: Props) {
  return (
    <section className="artist-page__section">
      <h2 className="artist-page__section-title">{title}</h2>
      {artists.length === 0 ? (
        <p className="influence-grid__empty">{emptyMessage}</p>
      ) : (
        <ArtistCircleGrid artists={artists} />
      )}
    </section>
  );
}
