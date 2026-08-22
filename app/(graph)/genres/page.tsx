import type { Metadata } from 'next';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { buildGenreTimeline } from '@/lib/genre-timeline';
import GenreTimeline from '@/components/genres/GenreTimeline';
import ArtistBackground from '@/components/artist/ArtistBackground';
import { compareNames } from '@/lib/sort';

export const metadata: Metadata = {
  title: 'Genres — Starweave',
  description: 'Every genre in the Starweave influence graph, positioned by when it emerged.',
};

export default function GenresIndexPage() {
  const graphData = loadGraphData();
  const layout = buildGenreTimeline(graphData);

  const counts = new Map<string, number>(graphData.genres.map(g => [g.id, 0]));
  for (const a of graphData.artists) {
    for (const g of a.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  const azList = graphData.genres
    .slice()
    .sort((a, b) => compareNames(a.name, b.name));

  return (
    <div className="genres-overlay">
      {/* Canvas and scrim are siblings of genres-page, not children — same
          stacking pattern as browse/genre/artist pages (see their own
          comments): keeps them at z:1/2 so genres-page at z:3 renders above. */}
      <ArtistBackground layerColor="#8891F2" />
      <div className="artist-bg-scrim" aria-hidden />

      <div className="genres-page">
        <header className="genres-page__header">
          <h1 className="genres-page__title">Genre timeline</h1>
          <p className="genres-page__deck">
            {layout.rankCount} dated genres, positioned by when each one emerged — not by elapsed
            calendar time, so a crowded few years (like 1978–85) get the room eleven genres actually
            need instead of the sliver a linear year scale would give it.
          </p>
        </header>

        {/* Own line, not folded into the deck above — testers weren't
            reading that far into a five-line paragraph to find "click any
            dot to open that genre." This sits where the eye lands on
            reaching the diagram instead. */}
        <p className="genre-timeline__hint">Solid lines are a genre&rsquo;s main lineage; dashed arrows point from a secondary source to what it fed · hover to trace a lineage · click to open a genre</p>

        <GenreTimeline
          nodes={layout.nodes}
          rankCount={layout.rankCount}
          yearMarks={layout.yearMarks}
          viewH={layout.viewH}
          plotH={layout.plotH}
        />

        <section className="genres-az" aria-label="All genres, alphabetically">
          <h2 className="genres-az__heading">All genres, A–Z</h2>
          <ul className="genres-az__list" role="list">
            {azList.map(g => (
              <li key={g.id}>
                <Link href={`/genre/${g.id}`} className="genres-az__item">
                  <span className="genres-az__name">{g.name}</span>
                  <span className="genres-az__count">{counts.get(g.id) ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
