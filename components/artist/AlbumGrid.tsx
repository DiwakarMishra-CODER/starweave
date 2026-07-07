import Link from 'next/link';
import type { Artist, Album } from '@/data/types';

interface AlbumGridItem {
  artist: Artist;
  album: Album;
}

interface Props {
  heading: string;
  items: AlbumGridItem[];
}

// Wide (900px) square-cover grid with hover listen-on links — shared by the
// genre and scene page design system. Keyed off the --genre-color custom
// property set by whichever page wrapper renders it.
export default function AlbumGrid({ heading, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="genre-albums-section">
      <h2 className="genre-albums-heading">{heading}</h2>
      <div className="genre-albums">
        {items.map(({ artist, album }) => {
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
  );
}
