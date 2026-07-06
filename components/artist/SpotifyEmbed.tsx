interface Props {
  spotifyId: string | null | undefined;
  type?: 'artist' | 'album' | 'track';
  compact?: boolean;
}

export default function SpotifyEmbed({ spotifyId, type = 'artist', compact = false }: Props) {
  if (!spotifyId) return null;

  const height = compact ? 80 : 152;
  const src = `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=0`;

  return (
    <div className="spotify-embed">
      <iframe
        src={src}
        width="100%"
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`Spotify ${type} embed`}
      />
    </div>
  );
}
