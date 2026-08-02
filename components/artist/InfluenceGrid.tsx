import type { Artist, Edge } from '@/data/types';
import ArtistCircleGrid from './ArtistCircleGrid';

export interface InfluenceItem {
  artist: Artist;
  edge: Edge;
}

interface Props {
  title: string;
  items: InfluenceItem[];
  emptyMessage: string;
}

export default function InfluenceGrid({ title, items, emptyMessage }: Props) {
  return (
    <section className="artist-page__section">
      <h2 className="artist-page__section-title">{title}</h2>
      {items.length === 0 ? (
        <p className="influence-grid__empty">{emptyMessage}</p>
      ) : (
        <ArtistCircleGrid items={items} />
      )}
    </section>
  );
}
