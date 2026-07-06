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
  // Hub = highest-influence artist in this genre — "View in graph" focuses them.
  const hubArtist = shoegazeArtists.reduce<typeof shoegazeArtists[0] | null>(
    (best, a) => (a.influenceScore ?? 0) > (best?.influenceScore ?? 0) ? a : best,
    null,
  );
  const graphHref = hubArtist ? `/?artist=${hubArtist.id}` : '/';

  // One classic album per artist, sorted chronologically.
  const definingAlbums = shoegazeArtists
    .filter(a => a.classicAlbums && a.classicAlbums.length > 0)
    .map(a => ({ artist: a, album: a.classicAlbums![0] }))
    .sort((a, b) => (a.album.year ?? 0) - (b.album.year ?? 0));

  return (
    <div
      className="genre-overlay"
      style={{ '--genre-color': genreColor, '--layer-color': genreColor } as React.CSSProperties}
    >
      <ArtistBackground layerColor={genreColor} boost={1.7} />
      <div className="artist-bg-scrim" aria-hidden />

      {/* Prose — 700px reading width */}
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
      </article>

      {/* Defining albums — wider section, breaks out of prose column */}
      {definingAlbums.length > 0 && (
        <section className="genre-albums-section">
          <h2 className="genre-albums-heading">Defining albums</h2>
          <div className="genre-albums">
            {definingAlbums.map(({ artist, album }) => {
              const q = encodeURIComponent(`${artist.name} ${album.title}`);
              return (
                <div key={album.id} className="genre-album-card">
                  {/* Main link — cover + info → artist page */}
                  <Link href={`/artist/${artist.id}`} className="genre-album-card__link">
                    <div className="genre-album-card__cover-wrap">
                      {album.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={album.imageUrl}
                          alt={`${album.title} cover`}
                          className="genre-album-card__cover"
                          width={280}
                          height={280}
                        />
                      ) : (
                        <div className="genre-album-card__cover--placeholder" aria-hidden />
                      )}
                    </div>
                    <div className="genre-album-card__info">
                      <p className="genre-album-card__title">{album.title}</p>
                      {album.year && (
                        <p className="genre-album-card__year">{album.year}</p>
                      )}
                      <p className="genre-album-card__artist">{artist.name}</p>
                    </div>
                  </Link>

                  {/* Hover overlay — sibling of Link so no nested <a> */}
                  <div className="genre-album-card__listen-overlay" aria-hidden>
                    <a
                      href={`https://open.spotify.com/search/${q}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-platform="spotify"
                      aria-label={`Search "${album.title}" on Spotify`}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://music.apple.com/search?term=${q}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-platform="apple"
                      aria-label={`Search "${album.title}" on Apple Music`}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${q}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-platform="youtube"
                      aria-label={`Search "${album.title}" on YouTube`}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lower prose — 700px reading width, no top padding */}
      <div className="genre-page genre-page--lower">
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

        <Link href={graphHref} className="genre-page__graph-btn">
          View in graph →
        </Link>
      </div>
    </div>
  );
}
