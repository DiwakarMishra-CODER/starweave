interface Props {
  query: string;
  size?: 'sm' | 'xs';
}

const PX = { sm: 16, xs: 14 };

export default function StreamingLinks({ query, size = 'sm' }: Props) {
  const q = encodeURIComponent(query);
  const px = PX[size];

  return (
    <span className={`streaming-links streaming-links--${size}`}>
      <span className="streaming-links__label">Listen on</span>

      <a
        href={`https://open.spotify.com/search/${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="streaming-links__btn"
        data-platform="spotify"
        aria-label="Search on Spotify"
      >
        <svg width={px} height={px} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </a>

      <a
        href={`https://music.apple.com/search?term=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="streaming-links__btn"
        data-platform="apple"
        aria-label="Search on Apple Music"
      >
        <svg width={px} height={px} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </a>

      <a
        href={`https://www.youtube.com/results?search_query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="streaming-links__btn"
        data-platform="youtube"
        aria-label="Search on YouTube"
      >
        <svg width={px} height={px} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
        </svg>
      </a>
    </span>
  );
}
