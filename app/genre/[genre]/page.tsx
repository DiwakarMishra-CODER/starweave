import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { GENRE_COLORS, DEFAULT_GENRE_COLOR } from '@/lib/colors';
import ArtistBackground from '@/components/artist/ArtistBackground';
import ArtistCircleGrid from '@/components/artist/ArtistCircleGrid';

interface Props {
  params: Promise<{ genre: string }>;
}

// Only shoegaze is fully built in v1; others render a stub.
const BUILT_GENRES = new Set(['shoegaze']);

export function generateStaticParams() {
  const data = loadGraphData();
  return data.genres.map(g => ({ genre: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const data = loadGraphData();
  const g = data.genres.find(x => x.id === genre);
  if (!g) return {};
  return { title: `${g.name} — Starweave` };
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;
  const data = loadGraphData();
  const genreData = data.genres.find(g => g.id === genre);
  if (!genreData) notFound();

  const genreColor = GENRE_COLORS[genre] ?? DEFAULT_GENRE_COLOR;

  if (!BUILT_GENRES.has(genre)) {
    return (
      <div
        className="genre-overlay"
        style={{ '--genre-color': genreColor, '--layer-color': genreColor } as React.CSSProperties}
      >
        <ArtistBackground layerColor={genreColor} boost={1.7} />
        <div className="artist-bg-scrim" aria-hidden />
        <div className="genre-stub">
          <p className="genre-stub__title">{genreData.name}</p>
          <p className="genre-stub__text">
            This genre story is coming in a future update. The graph already includes{' '}
            {genreData.name.toLowerCase()} artists — explore them on the{' '}
            <Link href="/" style={{ color: 'var(--genre-color)' }}>graph</Link>.
          </p>
          <Link href="/" className="genre-page__graph-btn" style={{ display: 'inline-flex' }}>
            Open graph →
          </Link>
        </div>
      </div>
    );
  }

  // --- Shoegaze story ---
  const shoegazeArtists = data.artists.filter(a =>
    a.genres.includes('shoegaze'),
  );
  const pioneers = shoegazeArtists.filter(a =>
    a.activeFrom && a.activeFrom < 1995,
  );
  const modern = shoegazeArtists.filter(a =>
    a.activeFrom && a.activeFrom >= 1995,
  );

  return (
    <div
      className="genre-overlay"
      style={{ '--genre-color': genreColor, '--layer-color': genreColor } as React.CSSProperties}
    >
      <ArtistBackground layerColor={genreColor} boost={1.7} />
      <div className="artist-bg-scrim" aria-hidden />

      <article className="genre-page">

        <header className="genre-page__header">
          <p className="genre-page__super">Genre story</p>
          <h1 className="genre-page__title">Shoegaze</h1>
          <p className="genre-page__deck">
            Guitar-pedal haze, oceanic walls of distortion, and vocals buried so deep in the mix
            they become texture. Shoegaze emerged from the UK in the late 1980s as a reaction
            against the studied cool of post-punk — something more overwhelming, more ambiguous,
            harder to hold at arm&apos;s length.
          </p>
        </header>

        <section className="genre-page__section">
          <h2>Origin</h2>
          <p>
            The name came from a dismissive joke — these guitarists spent their live sets
            staring at their pedalboards, lost in the sound they were making. The Jesus and
            Mary Chain sparked the template in 1985 with <em>Psychocandy</em>: Velvet Underground
            drones run through walls of feedback, with melodies buried underneath.
          </p>
          <p>
            By 1988–1991 a cluster of Oxford and Reading acts — Ride, Slowdive, Chapterhouse —
            had formed around Creation and 4AD, the two labels that would define the genre&apos;s
            first wave. My Bloody Valentine&apos;s <em>Loveless</em> (1991) set a ceiling nobody
            has convincingly matched since.
          </p>
        </section>

        <section className="genre-page__section">
          <h2>Pioneers</h2>
          <p>
            These artists built the genre&apos;s first wave, most active between 1983 and 1995.
            Many were initially dismissed as derivative by the press and commercially
            overlooked — all are now considered essential.
          </p>
          <div className="genre-page__section-artists">
            <ArtistCircleGrid artists={pioneers} />
          </div>
        </section>

        <section className="genre-page__section">
          <h2>Modern torchbearers</h2>
          <p>
            After a mid-90s backlash quieted the original wave, shoegaze never fully
            disappeared — it went underground and global. Artists like Deerhunter, Beach House,
            Wolf Alice, and Korea&apos;s Parannoul absorbed the template and pushed it forward,
            often in entirely different cultural contexts.
          </p>
          <div className="genre-page__section-artists">
            <ArtistCircleGrid artists={modern} />
          </div>
        </section>

        <Link href="/" className="genre-page__graph-btn">
          View in graph →
        </Link>

      </article>
    </div>
  );
}
