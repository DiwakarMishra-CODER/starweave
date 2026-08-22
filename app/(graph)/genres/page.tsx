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

          {/* Sits in the reading column under the deck, not off in a corner of
              the hint row where an earlier outlined pill read as chrome bolted
              onto a poster — and, being at the far right of a muted caption
              line, went unnoticed anyway. Here it follows title → deck → link
              in natural reading order, and gold makes it the only coloured
              text above the diagram, which is what earns the glance. The A-Z
              list is the other route into a genre page and it starts below the
              fold, so without a cue up here nobody suspects it exists. Count
              derived, never hardcoded — /scenes shipped one that went stale. */}
          <a href="#all-genres" className="genres-page__jump">
            {/* Label closed on its own line — see the JSX newline-trimming
                note on the A-Z heading below. Leaving it as a bare text node
                before the arrow span silently ate the space in "53 genres". */}
            <span>Browse all {graphData.genres.length} genres A&ndash;Z</span>
            <span className="genres-page__jump-arrow" aria-hidden>&darr;</span>
          </a>
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

        <section className="genres-az" id="all-genres" aria-label="All genres, alphabetically">
          {/* Title wrapped in its own span rather than left as a bare text
              node. JSX trims BOTH ends of a text chunk containing a newline,
              so `All {n} genres` split across a line before the subhead span
              rendered as "All 53genres" — the space silently vanished. Keeping
              each text run closed on its own line avoids it. */}
          <h2 className="genres-az__heading">
            <span>All {graphData.genres.length} genres, A&ndash;Z</span>
            <span className="genres-az__subhead">every genre page, including the {graphData.genres.length - layout.rankCount} undated ones the timeline can&rsquo;t place</span>
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
    </div>
  );
}
