import type { Metadata } from 'next';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { buildGenreSession } from '@/lib/genre-session';
import { coverStars } from '@/lib/genre-issue';
import GenreSession from '@/components/genres/GenreSession';
import { compareNames } from '@/lib/sort';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Genres — Starweave',
  description: 'Where every sound came from: fifty years of genres as a city at night, each a lit sign on its road in the year it was born.',
};

export default function GenresIndexPage() {
  const graphData = loadGraphData();
  const session = buildGenreSession(graphData);

  const counts = new Map<string, number>(graphData.genres.map(g => [g.id, 0]));
  for (const a of graphData.artists) {
    for (const g of a.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  const azList = graphData.genres
    .slice()
    .sort((a, b) => compareNames(a.name, b.name));

  return (
    <div className="genres-overlay">
      <div className="genres-page">
        <GenreSession
          session={session}
          counts={{ artists: graphData.artists.length, genres: graphData.genres.length }}
          stars={coverStars(session, graphData)}
        />

        <section className="genres-az" id="all-genres" aria-label="All genres, alphabetically">
          {/* Title wrapped in its own span rather than left as a bare text
              node. JSX trims BOTH ends of a text chunk containing a newline,
              so `All {n} genres` split across a line before the subhead span
              rendered as "All 53genres" — the space silently vanished. Keeping
              each text run closed on its own line avoids it. */}
          <h2 className="genres-az__heading">
            <span>All {graphData.genres.length} genres, A&ndash;Z</span>
            <span className="genres-az__subhead">every genre page, including the {graphData.genres.length - session.clips.length} with no year to place in the city</span>
          </h2>
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
      <SiteFooter />
    </div>
  );
}
