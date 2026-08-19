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
      {/* The count belongs in the heading rather than only on the "Show all N"
          button: that button appears only when a list is long enough to
          truncate, so a 7-root artist showed no number anywhere and you had to
          count photographs. Matches the panel's "Descendants (56)" form. */}
      <h2 className="artist-page__section-title">
        {title}
        {items.length > 0 && (
          <span className="artist-page__section-count"> ({items.length})</span>
        )}
      </h2>
      {items.length === 0 ? (
        <p className="influence-grid__empty">{emptyMessage}</p>
      ) : (
        <ArtistCircleGrid items={items} />
      )}
    </section>
  );
}
