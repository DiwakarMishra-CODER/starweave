import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { HEADLINE_W, resolveGenreFeature } from '@/lib/genre-feature';
import FeatureSpread from '@/components/genre/FeatureSpread';
import FeatureStep from '@/components/genre/FeatureStep';
import Records from '@/components/genre/Records';
import Players from '@/components/genre/Players';
import Road from '@/components/genre/Road';
import Reveal from '@/components/ui/Reveal';
import Room from '@/components/artist/backline/Room';
import { resolveGenreBackline } from '@/lib/backline';
import { risoInk } from '@/lib/colors';
import { GENRE_PAGES } from '@/data/genre-pages';
import { sizedImageUrl } from '@/lib/image-url';
import SiteFooter from '@/components/layout/SiteFooter';

interface Props {
  params: Promise<{ genre: string }>;
}

export function generateStaticParams() {
  const data = loadGraphData();
  return data.genres.map(g => ({ genre: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const f = resolveGenreFeature(loadGraphData(), genre);
  if (!f) return {};
  return { title: `${f.name} — Starweave`, description: f.deck };
}

// A genre's page: its feature inside today's issue of the paper (/genres),
// with a free tape stuck to the front. The data is lib/genre-feature.ts; the
// opening and the page turns are described in components/genre/FeatureSpread.
export default async function GenrePage({ params }: Props) {
  const { genre } = await params;
  const data = loadGraphData();
  const f = resolveGenreFeature(data, genre);
  if (!f) notFound();
  const [first, ...rest] = f.origin;
  // Its room behind the paper: its records, its people on the wall, the
  // instruments its artists play, which play along with its tape.
  const backline = resolveGenreBackline(data, f.id, f.color, GENRE_PAGES[f.id]?.definingAlbums ?? []);
  const sounds = [...f.road.ancestors, f.road.self, ...f.road.children].map(s => s.name);

  return (
    <div className="feature-overlay" style={{ '--spot': f.color, '--spot-ink': f.ink, '--wall': backline.wall } as React.CSSProperties}>
      <Room
        backline={backline}
        genres={sounds}
        finish={risoInk(f.color, backline.wall, 3.2, 6)}
        ribbon={risoInk(f.color, backline.wall, 7, 10)}
        seed={`genre:${f.id}`}
        page=".feature"
        soundcheck={false}
        queue={f.queue}
        hint="Tap an instrument to play the tape: the band plays along."
      />
      <div className="feature">
        <FeatureSpread
          id={f.id}
          name={f.name}
          emerged={f.emerged}
          emergedBasis={f.emergedBasis}
          familyName={f.familyName}
          folio={f.folio}
          headlinePx={f.headlinePx}
          deck={f.deck}
          lead={f.lead}
          artistCount={f.artistCount}
          recordCount={f.records.length}
          headlineFit={(f.headlinePx * 100) / HEADLINE_W}
          color={f.color}
          ink={f.ink}
          queue={f.queue}
        />

        <Reveal className="fsheet farticle" aria-labelledby="feature-started">
          <h2 id="feature-started" className="fhead">How it started</h2>
          {/* The first on the map to play it, oldest first: the story opens on faces. */}
          {f.firstWave.length > 0 && (
            <figure className="fwave">
              <ul className="fwave__strip">
                {f.firstWave.map(a => (
                  <li key={a.id}>
                    <Link href={`/artist/${a.id}`} className="fwave__photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sizedImageUrl(a.imageUrl!, 250)} alt="" loading="lazy" />
                      <span className="fwave__name">{a.name}</span>
                      <span className="fwave__year">{a.activeFrom}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <figcaption className="fwave__caption">The first on the map to play it, oldest first.</figcaption>
            </figure>
          )}
          <div className="farticle__columns">
            {first && <p className="farticle__first">{first}</p>}
            {'quote' in f.pull ? (
              <blockquote className="fpull">
                <p className="fpull__quote">{f.pull.quote}</p>
                <footer className="fpull__who">
                  {f.pull.speaker}{f.pull.about ? <>, on {f.pull.about}</> : null}
                </footer>
              </blockquote>
            ) : (
              <p className="fpull fpull--born">
                <span className="fpull__label">Where it started</span>
                <span className="fpull__quote">{f.pull.born}</span>
              </p>
            )}
            {rest.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <aside className="fsound" aria-labelledby="feature-sound">
            <span className="fsound__tape fsound__tape--l" aria-hidden />
            <span className="fsound__tape fsound__tape--r" aria-hidden />
            <h3 id="feature-sound" className="fsound__title">The sound</h3>
            <p>{f.sound}</p>
          </aside>
        </Reveal>

        <Reveal className="fsheet frecords-section" aria-labelledby="feature-records">
          <h2 id="feature-records" className="fhead">Essential records</h2>
          <Records records={f.records} tapeId={f.queue.id} queue={f.recordsQueue} />
        </Reveal>

        <Reveal className="fsheet fplayers-section" aria-labelledby="feature-players">
          <h2 id="feature-players" className="fhead">Who plays it</h2>
          <Players groups={f.groups} />
        </Reveal>

        <Reveal className="fsheet froad-section" aria-labelledby="feature-road">
          <h2 id="feature-road" className="fhead">Where it came from, where it went</h2>
          <Road road={f.road} />
        </Reveal>

        <Reveal as="nav" className="fend" aria-label="More features">
          <FeatureStep step={f.prev} dir="prev" big />
          <Link href="/genres" className="fend__issue">Back to today&rsquo;s issue</Link>
          <FeatureStep step={f.next} dir="next" big />
        </Reveal>
      </div>
      <SiteFooter />
    </div>
  );
}
