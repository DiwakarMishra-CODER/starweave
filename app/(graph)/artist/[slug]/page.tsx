import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { LAYER_COLORS, LAYER_LABELS } from '@/lib/colors';
import SpotifyEmbed from '@/components/artist/SpotifyEmbed';
import DeezerPreview from '@/components/artist/DeezerPreview';
import ArtistBackground from '@/components/artist/ArtistBackground';

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
  const color = LAYER_COLORS[artist.layer];

  const metaParts: string[] = [];
  if (artist.genres.length > 0) metaParts.push(artist.genres.map(g => genreMap[g] ?? g).join(', '));
  if (artist.country) metaParts.push(artist.country);

  return (
    <div className="artist-overlay" style={{ '--layer-color': color } as React.CSSProperties}>
      <ArtistBackground layerColor={color} />
      <div className="artist-bg-scrim" aria-hidden />
      <div className="artist-page">
        <Link href="/" className="artist-page__back">← Graph</Link>

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
              <span className="artist-page__layer-label">{LAYER_LABELS[artist.layer]}</span>
            </div>

            <h1 className="artist-page__name">{artist.name}</h1>

            {metaParts.length > 0 && (
              <p className="artist-page__meta-row">{metaParts.join(' · ')}</p>
            )}

            {artist.activeFrom && (
              <p className="artist-page__year">Active from {artist.activeFrom}</p>
            )}
          </div>
        </div>

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

        {/* Audio players */}
        <SpotifyEmbed spotifyId={artist.spotifyId} type="artist" />
        <DeezerPreview
          previewUrl={artist.previewUrl}
          previewTrack={artist.previewTrack}
          previewAlbum={artist.previewAlbum}
        />

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
                    <SpotifyEmbed spotifyId={album.spotifyId} type="album" compact />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Influences — visual chip roster */}
        {(influences.length > 0 || influencedBy.length > 0) && (
          <section className="artist-page__section artist-page__section--influences">
            {influences.length > 0 && (
              <div>
                <h2 className="artist-page__section-title">Influenced by</h2>
                <div className="influence-chips">
                  {influences.map(edge => {
                    const target = artistMap[edge.target];
                    if (!target) return null;
                    const chipColor = LAYER_COLORS[target.layer];
                    return (
                      <Link
                        key={edge.target}
                        href={`/artist/${edge.target}`}
                        className="influence-chip"
                        style={{ '--chip-color': chipColor } as React.CSSProperties}
                      >
                        <span className="influence-chip__avatar">
                          {target.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={target.imageUrl}
                              alt=""
                              className="influence-chip__img"
                              width={36}
                              height={36}
                            />
                          ) : (
                            <span
                              className="influence-chip__initial"
                              style={{ background: chipColor }}
                            >
                              {target.name.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span className="influence-chip__name">{target.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {influencedBy.length > 0 && (
              <div>
                <h2 className="artist-page__section-title">Influenced</h2>
                <div className="influence-chips">
                  {influencedBy.map(edge => {
                    const source = artistMap[edge.source];
                    if (!source) return null;
                    const chipColor = LAYER_COLORS[source.layer];
                    return (
                      <Link
                        key={edge.source}
                        href={`/artist/${edge.source}`}
                        className="influence-chip"
                        style={{ '--chip-color': chipColor } as React.CSSProperties}
                      >
                        <span className="influence-chip__avatar">
                          {source.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={source.imageUrl}
                              alt=""
                              className="influence-chip__img"
                              width={36}
                              height={36}
                            />
                          ) : (
                            <span
                              className="influence-chip__initial"
                              style={{ background: chipColor }}
                            >
                              {source.name.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span className="influence-chip__name">{source.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {typeof artist.influenceScore === 'number' && (
          <p className="artist-page__score">
            Influence score: {artist.influenceScore}
          </p>
        )}
      </div>
    </div>
  );
}
