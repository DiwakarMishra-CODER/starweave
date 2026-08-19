'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Artist, Edge, GraphData } from '@/data/types';
import { resolveCitationStatus, compareEdgesByEvidence } from '@/data/types';
import { resolveNodeColor, resolveNodeLabel } from '@/lib/colors';
import { countryName } from '@/lib/format';
import SpotifyEmbed from '@/components/artist/SpotifyEmbed';
import DeezerPreview from '@/components/artist/DeezerPreview';
import ArtistBackground from '@/components/artist/ArtistBackground';
import { useNarrowLayout } from '@/lib/use-media-query';
import { useAudioPreview } from '@/lib/use-audio-preview';

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
  // A two-state bottom sheet replaces the side drawer when there isn't room
  // for the drawer: a peek bar that leaves the graph visible, expanding on
  // demand. Keyed to viewport WIDTH, not pointer type — a 587px window on a
  // laptop has exactly the same problem a phone does (the panel covers the
  // constellation you just clicked into), and gating this on touch left that
  // window with the sheet's stylesheet and none of its markup.
  const isNarrowLayout = useNarrowLayout();
  const [expanded, setExpanded] = useState(false);
  // The panel's <audio> is owned here rather than inside DeezerPreview, so the
  // peek bar's play button and the expanded player's own controls drive one
  // element. See lib/use-audio-preview.
  const audio = useAudioPreview();
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
  // Collapse back to the peek bar whenever the selected artist changes, so
  // tapping through the graph never strands the user in reading mode with the
  // canvas covered. Same artist-keyed reset pattern as the two effects above.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting UI state keyed to the artist prop's identity, not deriving render output
    setExpanded(false);
  }, [artist?.id]);

  // DeezerPreview used to stop playback via a key={artist.id} remount; now
  // that the element outlives that component, stopping is explicit or one
  // artist's preview plays on over the next one's.
  const stopAudio = audio.stop;
  useEffect(() => {
    stopAudio();
  }, [artist?.id, stopAudio]);

  const toggleCitation = (key: string) =>
    setExpandedCitations(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Sorted so sourced connections lead — see compareEdgesByEvidence. Without
  // it these render in seed-data declaration order, which regularly put an
  // unsourced row at the top of the list.
  const influences: Edge[] = artist
    ? graphData.edges.filter(e => e.source === artist.id && e.type === 'influence').sort(compareEdgesByEvidence)
    : [];
  const influencedBy: Edge[] = artist
    ? graphData.edges.filter(e => e.target === artist.id && e.type === 'influence').sort(compareEdgesByEvidence)
    : [];

  // One number rather than the roots/descendants split: the peek bar has one
  // line to spend and the song title now shares it, and "16 connections" is
  // the figure that reads as substance at a glance — the direction breakdown
  // is a click away in the expanded sheet, where both lists are labelled.
  const connectionCount = influences.length + influencedBy.length;

  const color = artist ? resolveNodeColor(artist) : undefined;
  const bioPreview = artist?.bio ? truncateBio(artist.bio, 2) : null;

  return (
    <aside
      className={`artist-panel${open ? ' artist-panel--open' : ''}${
        isNarrowLayout ? (expanded ? ' artist-panel--expanded' : ' artist-panel--peek') : ''
      }`}
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

          {/* ── Peek bar (narrow layouts) ──────────────────────────
              The sheet's collapsed face: enough to know who you tapped and
              to hear them, without covering the graph. Rendered above the
              hero so it reads as the sheet's header in both states — when
              expanded it stays put and its chevron flips to collapse. */}
          {isNarrowLayout && (
            <div className="panel-peek">
              <button
                className="panel-peek__handle"
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse artist details' : 'Expand artist details'}
              >
                <span className="panel-peek__grip" aria-hidden />
              </button>

              {/* The panel's usual close button lives inside .panel-hero,
                  which is hidden while collapsed — without this the sheet
                  could only be dismissed by tapping bare canvas. */}
              <button
                className="panel-peek__close"
                onClick={onClose}
                aria-label="Close artist panel"
              >
                ✕
              </button>

              <div className="panel-peek__row">
                {artist.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artist.imageUrl}
                    alt=""
                    aria-hidden
                    className="panel-peek__avatar"
                    style={{ borderColor: color }}
                  />
                )}

                <span className="panel-peek__text">
                  <span className="panel-peek__name">{artist.name}</span>
                  <span className="panel-peek__meta">
                    {resolveNodeLabel(artist)}
                    {artist.activeFrom && ` · ${artist.activeFrom}`}
                  </span>
                </span>

                {/* Same <audio> the expanded player controls — one element,
                    two transports. Absent for the handful of artists with no
                    preview, matching DeezerPreview's own previewUrl guard. */}
                {artist.previewUrl && (
                  <button
                    className={`panel-peek__play${audio.playing ? ' panel-peek__play--playing' : ''}`}
                    onClick={audio.toggle}
                    aria-label={audio.playing ? 'Pause preview' : 'Play preview'}
                  >
                    {audio.playing ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
                        <rect x="2" y="1.5" width="3.5" height="10" rx="1" />
                        <rect x="7.5" y="1.5" width="3.5" height="10" rx="1" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
                        <path d="M3 1.8 11 6.5 3 11.2V1.8z" />
                      </svg>
                    )}
                  </button>
                )}

                <button
                  className="panel-peek__chevron"
                  onClick={() => setExpanded(v => !v)}
                  aria-expanded={expanded}
                  aria-label={expanded ? 'Collapse artist details' : 'Expand artist details'}
                >
                  <span aria-hidden>⌄</span>
                </button>
              </div>

              <div className="panel-peek__row panel-peek__row--sub">
                <span className="panel-peek__sub">
                  {/* previewTrack, not signatureSong — this names what the
                      play button to its right will actually sound, and it is
                      populated for exactly the 273 artists that have a
                      previewUrl, so it is never absent while that button is
                      showing. */}
                  {artist.previewTrack && (
                    <>
                      <span className="panel-peek__song">{artist.previewTrack}</span>
                      <span className="panel-peek__dot" aria-hidden>·</span>
                    </>
                  )}
                  <span className="panel-peek__counts">
                    {connectionCount} {connectionCount === 1 ? 'connection' : 'connections'}
                  </span>
                </span>
                <Link href={`/artist/${artist.id}`} className="panel-peek__full">
                  Full page <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          )}

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
              controller={audio}
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

            {/* Major album(s) */}
            {artist.classicAlbums && artist.classicAlbums.length > 0 && (
              <>
                <div className="panel-divider" />
                <div className="panel-section">
                  <p className="panel-section-title">
                    {artist.classicAlbums.length === 1 ? 'Major album' : 'Major albums'}
                  </p>
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
