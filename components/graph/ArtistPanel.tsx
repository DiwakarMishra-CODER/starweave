'use client';

import Link from 'next/link';
import type { Artist, Edge, GraphData } from '@/data/types';
import { resolveNodeColor, resolveNodeLabel } from '@/lib/colors';
import SpotifyEmbed from '@/components/artist/SpotifyEmbed';
import DeezerPreview from '@/components/artist/DeezerPreview';
import ArtistBackground from '@/components/artist/ArtistBackground';

interface Props {
  artist: Artist | null;
  graphData: GraphData;
  onClose: () => void;
  onSelectArtist: (id: string) => void;
}

// The panel is a quick peek, not the full read — keep only the first couple
// of sentences so there's a reason to visit the full artist page.
function truncateBio(bio: string, maxSentences: number): { text: string; truncated: boolean } {
  const sentences = bio.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
  if (!sentences || sentences.length <= maxSentences) {
    return { text: bio.trim(), truncated: false };
  }
  return { text: sentences.slice(0, maxSentences).join('').trim(), truncated: true };
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

  const color = artist ? resolveNodeColor(artist) : undefined;
  const bioPreview = artist?.bio ? truncateBio(artist.bio, 2) : null;

  return (
    <aside
      className={`artist-panel${open ? ' artist-panel--open' : ''}`}
      style={color ? ({ '--layer-color': color } as React.CSSProperties) : undefined}
      aria-label="Artist details"
      aria-hidden={!open}
    >
      {artist && (
        <>
          {/* Subtle atmospheric tint, in the artist's own layer color — same
              engine as the artist/genre/scene pages, tuned low and "calm"
              (no drifting orbs/particles) since this is a reading surface —
              the panel should stay clean and legible behind the text. */}
          {color && <ArtistBackground layerColor={color} boost={0.4} scoped calm />}

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
                {resolveNodeLabel(artist)}
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
                Full artist page
                <span className="panel-full-link__arrow" aria-hidden>→</span>
              </Link>
            </div>

            {/* Audio preview — key ensures a full remount on artist change so
                playing/progress state never bleeds across artists. Its own
                song-level "Listen on" links (via streamingQuery) are the only
                Listen-on set in this panel — a quick-peek shows one, not two. */}
            <DeezerPreview
              key={artist.id}
              previewUrl={artist.previewUrl}
              previewTrack={artist.previewTrack}
              previewAlbum={artist.previewAlbum}
              streamingQuery={artist.signatureSong ? `${artist.name} ${artist.signatureSong}` : undefined}
              compact
            />

            {/* Spotify embed (secondary) */}
            <SpotifyEmbed spotifyId={artist.spotifyId} type="artist" compact />

            {/* Bio — truncated teaser; the full artist page has the complete text */}
            {bioPreview && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">About</p>
                  <p className={`panel-bio${bioPreview.truncated ? ' panel-bio--truncated' : ''}`}>
                    {bioPreview.text}
                  </p>
                  {bioPreview.truncated && (
                    <Link href={`/artist/${artist.id}`} className="panel-bio-more">
                      Read full bio →
                    </Link>
                  )}
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
                            style={{ background: resolveNodeColor(target) }}
                            aria-hidden
                          />
                          <button
                            className="panel-edge-link"
                            onClick={() => onSelectArtist(target.id)}
                          >
                            {target.name}
                          </button>
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
                            style={{ background: resolveNodeColor(source) }}
                            aria-hidden
                          />
                          <button
                            className="panel-edge-link"
                            onClick={() => onSelectArtist(source.id)}
                          >
                            {source.name}
                          </button>
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
