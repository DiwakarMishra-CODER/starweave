import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { resolveNodeColor, resolveNodeLabel } from '@/lib/colors';
import { countryName } from '@/lib/format';
import SpotifyEmbed from '@/components/artist/SpotifyEmbed';
import DeezerPreview from '@/components/artist/DeezerPreview';
import ArtistBackground from '@/components/artist/ArtistBackground';
import BackButton from '@/components/artist/BackButton';
import StreamingLinks from '@/components/ui/StreamingLinks';
import InfluenceGrid from '@/components/artist/InfluenceGrid';
import type { Artist, Edge } from '@/data/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = loadGraphData();
  return data.artists.map(a => ({ slug: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = loadGraphData();
  const artist = data.artists.find(a => a.id === slug);
  if (!artist) return {};
  return {
    title: `${artist.name} — Starweave`,
    description: artist.bio ?? `Explore ${artist.name}'s place in the indie influence graph.`,
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const data = loadGraphData();
  const artist = data.artists.find(a => a.id === slug);
  if (!artist) notFound();

  const genreMap  = Object.fromEntries(data.genres.map(g => [g.id, g.name]));
  const artistMap = Object.fromEntries(data.artists.map(a => [a.id, a]));

  const influences   = data.edges.filter(e => e.source === artist.id && e.type === 'influence');
  const influencedBy = data.edges.filter(e => e.target === artist.id && e.type === 'influence');
  const color = resolveNodeColor(artist);

  // Edge kept alongside its artist (not just a flat Artist[]) so citation
  // status/text can travel with each row — InfluenceGrid/ArtistCircleGrid
  // need the edge to render the "Show sources" list view.
  function toItems(edges: Edge[], idOf: (e: Edge) => string): { edge: Edge; artist: Artist }[] {
    return edges
      .map(edge => ({ edge, artist: artistMap[idOf(edge)] }))
      .filter((x): x is { edge: Edge; artist: Artist } => !!x.artist);
  }
  const influenceItems   = toItems(influences, e => e.target);
  const influencedByItems = toItems(influencedBy, e => e.source);

  const metaParts: string[] = [];
  if (artist.country) metaParts.push(countryName(artist.country));

  return (
    <div className="artist-overlay" style={{ '--layer-color': color } as React.CSSProperties}>
      <ArtistBackground layerColor={color} />
      <div className="artist-bg-scrim" aria-hidden />
      <BackButton />
      <div className="artist-page">

        {/* Hero */}
        <div className="artist-page__hero">
          {artist.imageUrl && (
            <div className="artist-page__photo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="artist-page__photo"
                width={240}
                height={240}
              />
            </div>
          )}

          <div className="artist-page__hero-text">
            <div className="artist-page__layer-row">
              <span
                className="artist-page__layer-dot"
                style={{ background: color }}
                aria-hidden
              />
              <span className="artist-page__layer-label">{resolveNodeLabel(artist)}</span>
            </div>

            <h1 className="artist-page__name">{artist.name}</h1>

            {artist.genres.length > 0 && (
              <div className="artist-page__genre-tags">
                {artist.genres.map(g => (
                  <Link key={g} href={`/genre/${g}`} className="genre-tag-chip genre-tag-chip--lg">
                    {genreMap[g] ?? g}
                    <span className="genre-tag-chip__arrow" aria-hidden>→</span>
                  </Link>
                ))}
              </div>
            )}

            {metaParts.length > 0 && (
              <p className="artist-page__meta-row">{metaParts.join(' · ')}</p>
            )}

            {artist.activeFrom && (
              <p className="artist-page__year">Active from {artist.activeFrom}</p>
            )}

            <Link href={`/?artist=${artist.id}`} className="artist-page__graph-link">
              <span aria-hidden>✦</span> Explore the constellation
            </Link>

            <div className="artist-page__listen-row">
              <StreamingLinks query={artist.name} />
            </div>
          </div>
        </div>

        {/* Audio player — above the fold, before bio */}
        <DeezerPreview
          previewUrl={artist.previewUrl}
          previewTrack={artist.previewTrack}
          previewAlbum={artist.previewAlbum}
          streamingQuery={artist.signatureSong ? `${artist.name} ${artist.signatureSong}` : undefined}
        />

        <div className="artist-page__rule" aria-hidden />

        {/* Bio */}
        {artist.bio ? (
          <div className="artist-page__bio">
            {artist.bio.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className="artist-page__bio artist-page__bio--placeholder">
            No biography available yet. Check back soon.
          </p>
        )}

        {/* Spotify (secondary, stays below bio) */}
        <SpotifyEmbed spotifyId={artist.spotifyId} type="artist" />

        {/* Classic albums — visual card layout */}
        {artist.classicAlbums && artist.classicAlbums.length > 0 && (
          <section className="artist-page__section">
            <h2 className="artist-page__section-title">Classic albums</h2>
            <div className={`albums-visual${artist.classicAlbums.length === 1 ? ' albums-visual--solo' : ' albums-visual--grid'}`}>
              {artist.classicAlbums.map(album => (
                <div key={album.id} className="album-card-visual">
                  {album.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={album.imageUrl}
                      alt={`${album.title} cover`}
                      className="album-card-visual__cover"
                      width={280}
                      height={280}
                    />
                  ) : (
                    <div className="album-card-visual__cover album-card-visual__cover--placeholder" aria-hidden />
                  )}
                  <div className="album-card-visual__body">
                    <p className="album-card-visual__title">{album.title}</p>
                    {album.year && (
                      <p className="album-card-visual__year">{album.year}</p>
                    )}
                    {album.classicReason && (
                      <p className="album-card-visual__reason">{album.classicReason}</p>
                    )}
                    <div className="album-card-visual__listen">
                      <StreamingLinks query={`${artist.name} ${album.title}`} />
                    </div>
                    <SpotifyEmbed spotifyId={album.spotifyId} type="album" compact />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Influences — circular avatar grid, with a per-section "Show
            sources" toggle to switch to a citation list (see InfluenceGrid/
            ArtistCircleGrid). */}
        <InfluenceGrid
          title="Roots"
          items={influenceItems}
          emptyMessage="A root — no documented influences in this constellation."
        />
        <InfluenceGrid
          title="Descendants"
          items={influencedByItems}
          emptyMessage="No documented descendants in this constellation yet."
        />


      </div>
    </div>
  );
}
