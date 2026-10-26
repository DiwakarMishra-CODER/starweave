import type { Metadata } from 'next';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { buildGenreSession } from '@/lib/genre-session';
import { coverStars } from '@/lib/genre-issue';
import { featureOrder, folioOf, resolveGenreFeature } from '@/lib/genre-feature';
import { sizedImageUrl } from '@/lib/image-url';
import GenreSession from '@/components/genres/GenreSession';
import { compareNames } from '@/lib/sort';
import SiteFooter from '@/components/layout/SiteFooter';
import StreetWall, { type StreetPoster } from '@/components/genres/StreetWall';

export const metadata: Metadata = {
  title: 'Genres — Starweave',
  description: 'The family tree of genres: fifty years of sounds, each in the year it was born, joined to the genre it grew out of.',
};

export default function GenresIndexPage() {
  const graphData = loadGraphData();
  const session = buildGenreSession(graphData);

  // The index: every genre A-Z under its letter, with the page its feature
  // is on (the folio printed on the feature itself).
  const order = featureOrder(graphData);
  const byLetter = new Map<string, typeof graphData.genres>();
  for (const g of graphData.genres.slice().sort((a, b) => compareNames(a.name, b.name))) {
    const letter = g.name[0].toUpperCase();
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), g]);
  }
  const inCity = new Set(session.clips.map(c => c.id));
  const undated = graphData.genres.filter(g => !inCity.has(g.id)).map(g => g.name);

  // The back page's furniture, all counted from the map: each genre's
  // "Start here" record (printed small), the genres born in each decade,
  // the oldest and newest sounds in the issue, and the biggest by artists.
  const cover = new Map(graphData.genres.map(g => [g.id, resolveGenreFeature(graphData, g.id)?.records[0]?.imageUrl ?? null]));
  const dated = graphData.genres.filter(g => g.emerged).sort((a, b) => a.emerged! - b.emerged!);
  const decades = new Map<number, number>();
  for (const g of dated) decades.set(Math.floor(g.emerged! / 10) * 10, (decades.get(Math.floor(g.emerged! / 10) * 10) ?? 0) + 1);
  const most = Math.max(...decades.values());
  const oldest = dated[0];
  const newest = dated[dated.length - 1];
  // The wall the issue is pasted on: records to start with, band posters of
  // the most-named artists, the scenes' flyers, genre names -- interleaved.
  const named = new Map<string, number>();
  for (const e of graphData.edges) if (e.type === 'influence') named.set(e.target, (named.get(e.target) ?? 0) + 1);
  const stars = graphData.artists.filter(a => a.imageUrl).sort((a, b) => (named.get(b.id) ?? 0) - (named.get(a.id) ?? 0)).slice(0, 40);
  const recordPosters: StreetPoster[] = order.flatMap(id => { const img = cover.get(id); return img ? [{ kind: 'record' as const, imageUrl: img }] : []; });
  const bandPosters: StreetPoster[] = stars.map(a => ({ kind: 'band', imageUrl: a.imageUrl!, name: a.name }));
  const flyers: StreetPoster[] = graphData.scenes.map(sc => ({ kind: 'flyer', name: sc.name, city: sc.city, years: `${sc.yearStart}–${sc.yearEnd ?? 'now'}` }));
  const typePosters: StreetPoster[] = order.map(id => ({ kind: 'type', words: graphData.genres.find(g => g.id === id)!.name }));
  const wall: StreetPoster[] = [];
  for (let i = 0; wall.length < 140; i++) {
    for (const list of [bandPosters, recordPosters, typePosters, bandPosters, recordPosters, flyers]) {
      if (list.length) wall.push(list[(i + wall.length) % list.length]);
    }
  }
  const biggest = graphData.genres
    .map(g => ({ g, n: graphData.artists.filter(a => a.genres?.includes(g.id)).length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  return (
    <div className="genres-overlay">
      <div className="genres-page">
        <StreetWall posters={wall} />
        {/* The city has the whole first screen to itself; the index waits
            under the fold, with a tab on the screen's bottom edge saying so. */}
        <div className="genres-stage">
          <GenreSession
            session={session}
            counts={{ artists: graphData.artists.length, genres: graphData.genres.length }}
            stars={coverStars(session, graphData)}
          />
          <a href="#index" className="genres-cue">
            <span className="genres-cue__tab">Index</span>
            <span className="genres-cue__text">Every genre A&ndash;Z, with the page its feature is on</span>
            <span className="genres-cue__arrow" aria-hidden>&darr;</span>
          </a>
        </div>

        {/* The paper's back page: printed newsprint, the index set in
            columns, each genre with its "Start here" record printed small,
            and a few boxes counted from the map. Each text run sits in its
            own element: JSX trims both ends of a text chunk that runs onto a
            new line, which once rendered "All 53genres". */}
        <section className="genres-index" id="index" aria-labelledby="genres-index-title">
          <p className="genres-index__masthead" aria-hidden>
            <span>Starweave</span>
            <span>The back page</span>
          </p>
          <h2 id="genres-index-title" className="genres-index__title">Index</h2>
          <p className="genres-index__sub">
            <span>Every genre in this issue, with the page its feature is on, and the record to start with.</span>{' '}
            {undated.length > 0 && <span>{undated.join(' and ')} have no year, so they don&rsquo;t stand in the city: find them here.</span>}
          </p>
          <div className="genres-index__body">
            <div className="genres-index__cols">
              {[...byLetter].map(([letter, gs]) => (
                <section key={letter} className="genres-index__group" aria-label={letter}>
                  <p className="genres-index__letter" aria-hidden>{letter}</p>
                  <ul className="genres-index__list">
                    {gs.map(g => {
                      const img = cover.get(g.id);
                      return (
                        <li key={g.id}>
                          <Link href={`/genre/${g.id}`} className="genres-index__entry">
                            <span className="genres-index__thumb" aria-hidden>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {img && <img src={sizedImageUrl(img, 100)} alt="" loading="lazy" />}
                            </span>
                            <span className="genres-index__name">{g.name}</span>
                            <span className="genres-index__leader" aria-hidden />
                            <span className="sr-only">, page</span>
                            <span className="genres-index__page">{folioOf(order, g.id)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
            <aside className="genres-index__boxes" aria-label="In this issue, by the numbers">
              <section className="genres-box">
                <p className="genres-box__kicker">In this issue</p>
                <h3 className="genres-box__title">Born in each decade</h3>
                <ul className="genres-box__bars">
                  {[...decades].map(([decade, n]) => (
                    <li key={decade}>
                      <span className="genres-box__decade">{decade}s</span>
                      <span className="genres-box__bar" style={{ width: `${(n / most) * 100}%` }} />
                      <span className="genres-box__n">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="genres-box">
                <p className="genres-box__kicker">Oldest and newest</p>
                <h3 className="genres-box__title">
                  <Link href={`/genre/${oldest.id}`}>{oldest.name}</Link>, {oldest.emerged}
                </h3>
                {oldest.emergedBasis && <p className="genres-box__basis">{oldest.emergedBasis}</p>}
                <h3 className="genres-box__title">
                  <Link href={`/genre/${newest.id}`}>{newest.name}</Link>, {newest.emerged}
                </h3>
                {newest.emergedBasis && <p className="genres-box__basis">{newest.emergedBasis}</p>}
              </section>
              <section className="genres-box">
                <p className="genres-box__kicker">The most artists on the map</p>
                <ol className="genres-box__top">
                  {biggest.map(({ g, n }) => (
                    <li key={g.id}>
                      <Link href={`/genre/${g.id}`}>{g.name}</Link>
                      <span className="genres-box__n">{n}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </aside>
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
