import Link from 'next/link';
import type { GenreLineage } from '@/lib/genre-lineage';

interface Props {
  lineage: GenreLineage;
}

// Compact orientation strip for a genre page — ancestors chained up to the
// current genre, children (if any) listed below. Pure `parent`-pointer data,
// distinct from the "light up the graph" CTA (which shows artists/edges, not
// genre ancestry) — see the Architecture decisions note on /genres for why
// these are kept separate. A root genre (no ancestors, e.g. krautrock) just
// renders its own name with no leading chain.
export default function GenreLineageStrip({ lineage }: Props) {
  const { ancestors, current, children } = lineage;

  return (
    <nav className="genre-lineage-strip" aria-label={`${current.name} lineage`}>
      <div className="genre-lineage-strip__row">
        {ancestors.map(g => (
          <span key={g.id} className="genre-lineage-strip__item">
            <Link href={`/genre/${g.id}`} className="genre-lineage-strip__link">
              {g.name}
            </Link>
            <span className="genre-lineage-strip__sep" aria-hidden>→</span>
          </span>
        ))}
        <span className="genre-lineage-strip__current">{current.name}</span>
      </div>

      {children.length > 0 && (
        <div className="genre-lineage-strip__children">
          <span className="genre-lineage-strip__children-label">Descends into</span>
          {children.map((g, i) => (
            <span key={g.id}>
              <Link href={`/genre/${g.id}`} className="genre-lineage-strip__link">
                {g.name}
              </Link>
              {i < children.length - 1 && <span aria-hidden>, </span>}
            </span>
          ))}
        </div>
      )}
    </nav>
  );
}
