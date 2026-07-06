'use client';

import Link from 'next/link';
import type { Artist, Edge, GraphData } from '@/data/types';
import { LAYER_COLORS, LAYER_LABELS } from '@/lib/colors';
import SpotifyEmbed from '@/components/artist/SpotifyEmbed';
import DeezerPreview from '@/components/artist/DeezerPreview';

interface Props {
  artist: Artist | null;
  graphData: GraphData;
  onClose: () => void;
  onSelectArtist: (id: string) => void;
}

export default function ArtistPanel({ artist, graphData, onClose, onSelectArtist }: Props) {
  const open = artist !== null;
  const artistMap = Object.fromEntries(graphData.artists.map(a => [a.id, a]));
  const genreMap = Object.fromEntries(graphData.genres.map(g => [g.id, g.name]));

  const influences: Edge[] = artist
    ? graphData.edges.filter(e => e.source === artist.id && e.type === 'influence')
    : [];
  const influencedBy: Edge[] = artist
    ? graphData.edges.filter(e => e.target === artist.id && e.type === 'influence')
    : [];

  const color = artist ? LAYER_COLORS[artist.layer] : undefined;

  return (
    <aside
      className={`artist-panel${open ? ' artist-panel--open' : ''}`}
      style={color ? ({ '--layer-color': color } as React.CSSProperties) : undefined}
      aria-label="Artist details"
      aria-hidden={!open}
    >
      {artist && (
        <>
          {/* ── Hero image ─────────────────────────────────────── */}
          <div className={`panel-hero${!artist.imageUrl ? ' panel-hero--no-image' : ''}`}>
            {artist.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="panel-hero__img"
                />
                <div className="panel-hero__gradient" />
              </>
            ) : (
              <div className="panel-hero__color-wash" />
            )}
            <button
              className="panel-hero__close"
              onClick={onClose}
              aria-label="Close artist panel"
            >
              ✕
            </button>
          </div>

          {/* ── Scrollable content ─────────────────────────────── */}
          <div className="artist-panel__inner">

            {/* Name / meta */}
            <div className="panel-artist-meta">
              <div className="panel-layer-badge">
                <span
                  className="panel-layer-dot"
                  style={{ background: color }}
                  aria-hidden
                />
                {LAYER_LABELS[artist.layer]}
                {artist.activeFrom && (
                  <span style={{ opacity: 0.6 }}>· est. {artist.activeFrom}</span>
                )}
              </div>

              <h2 className="panel-artist-name">{artist.name}</h2>

              <div className="panel-tags">
                {artist.genres.map(g => (
                  <span key={g} className="panel-tag">{genreMap[g] ?? g}</span>
                ))}
                {artist.country && (
                  <span className="panel-tag">{artist.country}</span>
                )}
              </div>

              <Link href={`/artist/${artist.id}`} className="panel-full-link">
                Full artist page →
              </Link>
            </div>

            {/* Audio preview */}
            <DeezerPreview
              previewUrl={artist.previewUrl}
              previewTrack={artist.previewTrack}
              previewAlbum={artist.previewAlbum}
              compact
            />

            {/* Spotify embed (secondary) */}
            <SpotifyEmbed spotifyId={artist.spotifyId} type="artist" compact />

            {/* Bio */}
            {artist.bio && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">About</p>
                  <p className="panel-bio">{artist.bio}</p>
                </div>
              </>
            )}

            {/* Classic albums */}
            {artist.classicAlbums && artist.classicAlbums.length > 0 && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">Classic albums</p>
                  {artist.classicAlbums.map(album => (
                    <div key={album.id} style={{ marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>
                        {album.title}
                        {album.year && (
                          <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                            {album.year}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Influences */}
            {influences.length > 0 && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">Influences</p>
                  <ul className="panel-edge-list">
                    {influences.map(edge => {
                      const target = artistMap[edge.target];
                      if (!target) return null;
                      return (
                        <li key={edge.target} className="panel-edge-item">
                          <span
                            className="panel-edge-dot"
                            style={{ background: LAYER_COLORS[target.layer] }}
                            aria-hidden
                          />
                          <button
                            className="panel-edge-link"
                            onClick={() => onSelectArtist(target.id)}
                          >
                            {target.name}
                          </button>
                          {edge.status === 'ai-suggested' && (
                            <span className="panel-edge-badge">ai</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}

            {/* Influenced by */}
            {influencedBy.length > 0 && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">
                    Influenced ({influencedBy.length})
                  </p>
                  <ul className="panel-edge-list">
                    {influencedBy.slice(0, 6).map(edge => {
                      const source = artistMap[edge.source];
                      if (!source) return null;
                      return (
                        <li key={edge.source} className="panel-edge-item">
                          <span
                            className="panel-edge-dot"
                            style={{ background: LAYER_COLORS[source.layer] }}
                            aria-hidden
                          />
                          <button
                            className="panel-edge-link"
                            onClick={() => onSelectArtist(source.id)}
                          >
                            {source.name}
                          </button>
                          {edge.status === 'ai-suggested' && (
                            <span className="panel-edge-badge">ai</span>
                          )}
                        </li>
                      );
                    })}
                    {influencedBy.length > 6 && (
                      <li style={{ fontSize: '0.72rem', color: 'var(--color-muted)', paddingLeft: '0.5rem', paddingTop: '0.2rem' }}>
                        +{influencedBy.length - 6} more
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}

          </div>
        </>
      )}
    </aside>
  );
}
