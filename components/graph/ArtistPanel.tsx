'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Artist, Edge, GraphData } from '@/data/types';
import { resolveCitationStatus } from '@/data/types';
import { resolveNodeColor, resolveNodeLabel } from '@/lib/colors';
import { countryName } from '@/lib/format';
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

// One row in either the Influences or Influenced-by list. `other` is
// whichever end of the edge isn't the panel's current artist (the
// influence, for Influences; the disciple, for Influenced-by) — the
// citation itself belongs to the edge either way, so the same row/toggle/
// note logic applies regardless of which direction the list is reading.
function InfluenceEdgeRow({
  edge,
  other,
  isExpanded,
  onToggleCitation,
  onSelectArtist,
}: {
  edge: Edge;
  other: Artist;
  isExpanded: boolean;
  onToggleCitation: () => void;
  onSelectArtist: (id: string) => void;
}) {
  const status = resolveCitationStatus(edge);
  // Both cited and unsourceable rows collapse behind the same toggle now —
  // only 'unchecked' (nobody's looked) gets no button at all, since there's
  // nothing on either side of a click for it to reveal. Cited and
  // unsourceable get differently-labeled, differently-colored buttons (see
  // .panel-influence-cite--unsourceable) so the state is legible without
  // clicking, but the same collapsed-by-default shape either way — a row
  // with real evidence and a row with none now take up the same amount of
  // space until you ask.
  const hasToggle = status === 'cited' || status === 'unsourceable';
  return (
    <li className="panel-influence-item">
      <div className="panel-influence-row">
        <span
          className="panel-edge-dot"
          style={{ background: resolveNodeColor(other) }}
          aria-hidden
        />
        <button className="panel-edge-link" onClick={() => onSelectArtist(other.id)}>
          {other.name}
        </button>
        {hasToggle && (
          <button
            className={`panel-influence-cite${status === 'unsourceable' ? ' panel-influence-cite--unsourceable' : ''}${isExpanded ? ' panel-influence-cite--open' : ''}`}
            onClick={onToggleCitation}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} source for ${other.name}`}
          >
            {status === 'cited' ? 'Source' : 'No source'}
            <span className="panel-influence-cite__chevron" aria-hidden>⌄</span>
          </button>
        )}
      </div>
      {isExpanded && status === 'unsourceable' && (
        <p className="panel-influence-note panel-influence-note--unsourceable">
          Widely accepted, unsourced.
        </p>
      )}
      {isExpanded && status === 'cited' && edge.citation && (
        <p className="panel-influence-note panel-influence-note--citation">
          {edge.citation}
        </p>
      )}
    </li>
  );
}

export default function ArtistPanel({ artist, graphData, onClose, onSelectArtist }: Props) {
  const open = artist !== null;
  const artistMap = Object.fromEntries(graphData.artists.map(a => [a.id, a]));
  const genreMap = Object.fromEntries(graphData.genres.map(g => [g.id, g.name]));

  // Which cited-influence rows have their source quote expanded. Keyed by
  // edge.target (unique within one artist's influences list). Reset on
  // artist change so switching artists never leaves a stale row expanded.
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting UI state keyed to the artist prop's identity, not deriving render output
    setExpandedCitations(new Set());
  }, [artist?.id]);

  // How many "Influenced by" rows are currently shown — starts at INFLUENCED_BY_PAGE_SIZE,
  // grows by the same amount each time "+N more" is clicked, so a hub like Velvet
  // Underground (56 entries) reveals in comfortable chunks instead of one giant dump.
  // Reset on artist change so switching artists always starts collapsed again.
  const INFLUENCED_BY_PAGE_SIZE = 6;
  const [influencedByShown, setInfluencedByShown] = useState(INFLUENCED_BY_PAGE_SIZE);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting UI state keyed to the artist prop's identity, not deriving render output
    setInfluencedByShown(INFLUENCED_BY_PAGE_SIZE);
  }, [artist?.id]);
  const toggleCitation = (key: string) =>
    setExpandedCitations(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

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
                  <Link key={g} href={`/genre/${g}`} className="panel-tag genre-tag-chip">
                    {genreMap[g] ?? g}
                    <span className="genre-tag-chip__arrow" aria-hidden>→</span>
                  </Link>
                ))}
                {artist.country && (
                  <span className="panel-tag">{countryName(artist.country)}</span>
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

            {/* Influences — carries citation state (see resolveCitationStatus
                in data/types.ts). 'unchecked' renders identically to before
                (dot + name, nothing else) — silence, not a "not yet
                checked" flag. 'cited' gets a Source toggle that expands the
                quote inline. 'unsourceable' gets a persistent note, since
                there's no quote text to hide behind a click — it's a
                finding, not a gap. */}
            {influences.length > 0 && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">Roots</p>
                  <ul className="panel-edge-list">
                    {influences.map(edge => {
                      const target = artistMap[edge.target];
                      if (!target) return null;
                      const key = `${edge.source}->${edge.target}`;
                      return (
                        <InfluenceEdgeRow
                          key={key}
                          edge={edge}
                          other={target}
                          isExpanded={expandedCitations.has(key)}
                          onToggleCitation={() => toggleCitation(key)}
                          onSelectArtist={onSelectArtist}
                        />
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
                    Descendants ({influencedBy.length})
                  </p>
                  <ul className="panel-edge-list">
                    {influencedBy.slice(0, influencedByShown).map(edge => {
                      const source = artistMap[edge.source];
                      if (!source) return null;
                      const key = `${edge.source}->${edge.target}`;
                      return (
                        <InfluenceEdgeRow
                          key={key}
                          edge={edge}
                          other={source}
                          isExpanded={expandedCitations.has(key)}
                          onToggleCitation={() => toggleCitation(key)}
                          onSelectArtist={onSelectArtist}
                        />
                      );
                    })}
                    {influencedBy.length > influencedByShown && (
                      <li>
                        <button
                          type="button"
                          className="panel-edge-more"
                          onClick={() => setInfluencedByShown(n => n + INFLUENCED_BY_PAGE_SIZE)}
                        >
                          +{influencedBy.length - influencedByShown} more
                          <span className="panel-edge-more__chevron" aria-hidden>⌄</span>
                        </button>
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
