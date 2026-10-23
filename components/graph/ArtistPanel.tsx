'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Artist, Edge, GraphData } from '@/data/types';
import { resolveCitationStatus, compareEdgesByEvidence } from '@/data/types';
import { readableInk, resolveNodeColor, resolveNodeLabel } from '@/lib/colors';
import { countryName } from '@/lib/format';
import { sizedImageUrl } from '@/lib/image-url';
import PhotoCredit from '@/components/ui/PhotoCredit';
import StreamingLinks from '@/components/ui/StreamingLinks';
import RadioDial from '@/components/panel/RadioDial';
import { useNarrowLayout } from '@/lib/use-media-query';
import { useAudioPreview } from '@/lib/use-audio-preview';
import { whyFor } from '@/lib/home-story';
import { storyCamera } from '@/lib/story-store';

// The artist panel is a page from a cut-and-paste fan zine: their photo taped
// on, their name with a highlighter swipe behind it, who they are in a couple
// of sentences, a pocket radio that plays their song and tunes through their
// musical family (RadioDial) with buttons out to the streaming apps, their own
// words on a torn cutting, the record to start with, and who inspired them and
// who they inspired. Printed in one spot colour, their realm's, on
// photocopied paper.
//
// The look must never get in the way of using it: the full page, the songs
// and the sources are all plain, labelled, obviously clickable, and the spot
// ink is deepened wherever it has to carry text (readableInk).
//
// The entrance: when the panel opens on a star, that star's photo lifts off
// the map where it was clicked and flies onto the page, then the tape sticks,
// the highlighter swipes and the pieces land one by one. Only when the panel
// opens — hopping between artists while it's open is a quick crossfade, so it
// never gets in the way.
const FLIGHT_MS = 620;
const ENTER_MS = 1300; // the pieces' stagger, start to last
const FLIGHT_START_PX = 44; // the photo's size as it leaves the map
const PAPER = '#f2ede0';     // the page (--paper in globals.css), for readableInk

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

// One name in either list. `other` is whichever end of the edge isn't the
// panel's artist (the influence, for "Who inspired them"; the one they
// inspired, for "Who they inspired") — the citation belongs to the edge either way. Cited
// and unsourceable rows carry a small stamp that opens the source; 'unchecked'
// has nothing to open, so no stamp.
function FamilyRow({
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
  const hasToggle = status === 'cited' || status === 'unsourceable';
  return (
    <li className="zine-row">
      <div className="zine-row__line">
        <span className="zine-row__bullet" style={{ background: resolveNodeColor(other) }} aria-hidden />
        <button className="zine-row__name" onClick={() => onSelectArtist(other.id)}>
          {other.name}
        </button>
        {other.activeFrom && <span className="zine-row__year">since {other.activeFrom}</span>}
        {hasToggle && (
          <button
            className={`zine-row__stamp${status === 'unsourceable' ? ' zine-row__stamp--none' : ''}`}
            onClick={onToggleCitation}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} source for ${other.name}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <circle cx="5" cy="5" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="4.4" y="4.2" width="1.2" height="3.3" rx="0.6" fill="currentColor" />
              <circle cx="5" cy="2.8" r="0.7" fill="currentColor" />
            </svg>
            {status === 'cited' ? 'Source' : 'No source'}
          </button>
        )}
      </div>
      {isExpanded && status === 'unsourceable' && (
        <p className="zine-row__note">Widely accepted, unsourced.</p>
      )}
      {isExpanded && status === 'cited' && edge.citation && (
        <p className="zine-row__note">{edge.citation}</p>
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
  // The peek bar's play button: their own song, on the panel's one <audio>
  // (see lib/use-audio-preview). The radio dial has its own and the two
  // never play at once.
  const { audioRef, audioProps, playing, toggle, stop: stopAudio } = useAudioPreview();
  const artistMap = Object.fromEntries(graphData.artists.map(a => [a.id, a]));

  // Their own words about who shaped them (or, for an artist nobody came
  // before, someone they shaped on them) — the same rule as today's record.
  const why = useMemo(() => (artist ? whyFor(graphData, artist.id) : null), [graphData, artist]);

  // The entrance (see FLIGHT_MS above).
  const asideRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const peekAvatarRef = useRef<HTMLImageElement>(null);
  const shownIdRef = useRef<string | null>(null);
  const [entering, setEntering] = useState(false);
  useEffect(() => {
    const was = shownIdRef.current;
    shownIdRef.current = artist?.id ?? null;
    if (!artist || was !== null) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: the panel just opened, which is a moment, not derived state
    setEntering(true);
    const done = window.setTimeout(() => setEntering(false), ENTER_MS);
    const from = storyCamera.nodeScreen?.(artist.id);
    const target = isNarrowLayout ? peekAvatarRef.current : photoRef.current;
    const panel = asideRef.current;
    if (!from || !target || !panel || !artist.imageUrl) return () => window.clearTimeout(done);
    // Where the target will be once the panel has slid in: its rect now,
    // less however far the slide still has to go. Its tilt comes along too.
    const slide = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
    const end = target.getBoundingClientRect();
    const endLeft = end.left - slide.m41;
    const endTop = end.top - slide.m42;
    const flier = document.createElement('img');
    flier.src = sizedImageUrl(artist.imageUrl, 500);
    flier.alt = '';
    flier.className = 'panel-flier';
    document.body.appendChild(flier);
    target.style.opacity = '0';
    const half = FLIGHT_START_PX / 2;
    const flight = flier.animate([
      { left: `${from.x - half}px`, top: `${from.y - half}px`, width: `${FLIGHT_START_PX}px`, height: `${FLIGHT_START_PX}px`, borderRadius: '50%' },
      { left: `${endLeft}px`, top: `${endTop}px`, width: `${end.width}px`, height: `${end.height}px`, borderRadius: isNarrowLayout ? '50%' : '2px' },
    ], { duration: FLIGHT_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
    flight.onfinish = () => {
      target.style.opacity = '';
      flier.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).onfinish = () => flier.remove();
    };
    return () => {
      window.clearTimeout(done);
      flight.cancel();
      flier.remove();
      target.style.opacity = '';
    };
    // isNarrowLayout is read at the moment of opening, deliberately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist?.id]);

  // Which rows have their source open. Keyed by edge. Reset on artist change
  // so switching artists never leaves a stale row open.
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting UI state keyed to the artist prop's identity, not deriving render output
    setExpandedCitations(new Set());
  }, [artist?.id]);

  // How many "Who they inspired" rows are shown — grows in pages, so a hub like
  // the Velvet Underground (56 of them) reveals in comfortable chunks.
  const FOLLOWERS_PAGE_SIZE = 6;
  const [followersShown, setFollowersShown] = useState(FOLLOWERS_PAGE_SIZE);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting UI state keyed to the artist prop's identity, not deriving render output
    setFollowersShown(FOLLOWERS_PAGE_SIZE);
  }, [artist?.id]);
  // Collapse back to the peek bar whenever the selected artist changes, so
  // tapping through the graph never strands the user in reading mode with the
  // canvas covered.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resetting UI state keyed to the artist prop's identity, not deriving render output
    setExpanded(false);
  }, [artist?.id]);

  // A new artist stops whatever was playing.
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

  // Sourced connections first — see compareEdgesByEvidence.
  const influences: Edge[] = artist
    ? graphData.edges.filter(e => e.source === artist.id && e.type === 'influence').sort(compareEdgesByEvidence)
    : [];
  const influencedBy: Edge[] = artist
    ? graphData.edges.filter(e => e.target === artist.id && e.type === 'influence').sort(compareEdgesByEvidence)
    : [];
  const connectionCount = influences.length + influencedBy.length;
  const genreMap = Object.fromEntries(graphData.genres.map(g => [g.id, g.name]));

  const color = artist ? resolveNodeColor(artist) : undefined;
  const bioPreview = artist?.bio ? truncateBio(artist.bio, 2) : null;
  const album = artist?.classicAlbums?.[0];

  return (
    <aside
      ref={asideRef}
      className={`artist-panel zine-panel${open ? ' artist-panel--open' : ''}${entering ? ' artist-panel--entering' : ''}${
        isNarrowLayout ? (expanded ? ' artist-panel--expanded' : ' artist-panel--peek') : ''
      }`}
      style={color ? ({ '--layer-color': color, '--spot': readableInk(color, PAPER) } as React.CSSProperties) : undefined}
      aria-label="Artist details"
      aria-hidden={!open}
    >
      {artist && (
        <>
          {/* ── Peek bar (narrow layouts) ──────────────────────────
              The sheet's collapsed face: enough to know who you tapped and
              to hear them, without covering the graph. */}
          {isNarrowLayout && (
            // The whole bar toggles, not just the grip and the chevron —
            // tapping the photo or the name is what everyone tries. The
            // controls that mean something else stop the event below.
            <div
              className="panel-peek"
              onClick={() => setExpanded(v => !v)}
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse artist details' : 'Expand artist details'}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v); }
              }}
            >
              <span className="panel-peek__handle" aria-hidden>
                <span className="panel-peek__grip" />
              </span>

              <div className="panel-peek__row">
                {artist.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={peekAvatarRef}
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

                {artist.previewUrl && (
                  <button
                    className={`panel-peek__play${playing ? ' panel-peek__play--playing' : ''}`}
                    onClick={e => { e.stopPropagation(); toggle(); }}
                    aria-label={playing ? 'Pause preview' : 'Play preview'}
                  >
                    {playing ? (
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
                  className="panel-peek__close"
                  onClick={e => { e.stopPropagation(); onClose(); }}
                  aria-label="Close artist panel"
                >
                  ✕
                </button>
              </div>

              <div className="panel-peek__row panel-peek__row--sub">
                <span className="panel-peek__sub">
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
                <span className="panel-peek__more">
                  {expanded ? 'Less' : 'Details'}
                  <span className="panel-peek__more-chev" aria-hidden>⌄</span>
                </span>
              </div>
            </div>
          )}

          {/* The peek bar's song, on the panel's own audio element. */}
          {artist.previewUrl && (
            <audio ref={audioRef} src={artist.previewUrl} preload="none" {...audioProps} />
          )}

          {/* ── The zine page ───────────────────────────────────── */}
          {/* Keyed by artist, so hopping between artists crossfades. */}
          <div key={artist.id} className="artist-panel__inner zine">
            <header className="zine__masthead">
              <span>
                {[artist.activeFrom && `Since ${artist.activeFrom}`, artist.country && countryName(artist.country)]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              <button className="zine__close" onClick={onClose} aria-label="Close artist panel">✕</button>
            </header>

            {/* Their photo, cut out and taped on, printed in the spot colour. */}
            {artist.imageUrl && (
              <figure className="zine__photo">
                <span className="zine__print">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img ref={photoRef} src={sizedImageUrl(artist.imageUrl, 500)} alt={artist.name} />
                </span>
                <span className="zine__tape zine__tape--left" aria-hidden />
                <span className="zine__tape zine__tape--right" aria-hidden />
                <PhotoCredit credit={artist.imageCredit} className="photo-credit--panel" />
              </figure>
            )}

            <h2 className="zine__name">
              <span className="zine__highlight">{artist.name}</span>
            </h2>
            <p className="zine__typed">
              {artist.genres.map((g, i) => (
                <span key={g}>
                  {i > 0 && ' · '}
                  <Link href={`/genre/${g}`} className="zine__genre">{genreMap[g] ?? g}</Link>
                </span>
              ))}
            </p>

            {/* Who they are, first, then the way to everything else. */}
            {bioPreview && <p className="zine__intro">{bioPreview.text}</p>}
            <Link href={`/artist/${artist.id}`} className="zine__fullpage">
              Full artist page <span aria-hidden>→</span>
            </Link>

            {/* Their song, and their musical family, on a pocket radio; the
                whole songs on the apps. */}
            <section className="zine__radio">
              <h3 className="zine__marker">Listen</h3>
              <RadioDial
                artist={artist}
                data={graphData}
                silenced={playing}
                onSound={stopAudio}
              />
              {artist.signatureSong && (
                <div className="zine__apps">
                  <StreamingLinks query={`${artist.name} ${artist.signatureSong}`} label="Full songs on" named />
                </div>
              )}
            </section>

            {/* Their own words, on a torn cutting. */}
            {why && (
              <figure className="zine__cutting">
                <blockquote>“{why.quote.replace(/[,;:]$/, '…').replace(/!$/, '')}”</blockquote>
                <figcaption>— {why.speaker} on {why.direction === 'parent' ? why.other.name : artist.name}</figcaption>
              </figure>
            )}

            {/* The record to start with, taped in with a scribbled caption. */}
            {album && (
              <figure className="zine__album">
                {album.imageUrl && (
                  <span className="zine__album-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sizedImageUrl(album.imageUrl, 300)} alt="" />
                    <span className="zine__tape zine__tape--small" aria-hidden />
                  </span>
                )}
                <figcaption>
                  <span className="zine__marker zine__marker--small">the one to start with</span>
                  <span className="zine__album-title">{album.title}</span>
                  {album.year && <span className="zine__album-year">{album.year}</span>}
                </figcaption>
              </figure>
            )}

            {influences.length > 0 && (
              <section className="zine__family">
                <h3 className="zine__marker">Who inspired them</h3>
                <ul className="zine__list">
                  {influences.map(edge => {
                    const target = artistMap[edge.target];
                    if (!target) return null;
                    const key = `${edge.source}->${edge.target}`;
                    return (
                      <FamilyRow
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
              </section>
            )}

            {influencedBy.length > 0 && (
              <section className="zine__family">
                <h3 className="zine__marker">Who they inspired</h3>
                <ul className="zine__list">
                  {influencedBy.slice(0, followersShown).map(edge => {
                    const source = artistMap[edge.source];
                    if (!source) return null;
                    const key = `${edge.source}->${edge.target}`;
                    return (
                      <FamilyRow
                        key={key}
                        edge={edge}
                        other={source}
                        isExpanded={expandedCitations.has(key)}
                        onToggleCitation={() => toggleCitation(key)}
                        onSelectArtist={onSelectArtist}
                      />
                    );
                  })}
                </ul>
                {influencedBy.length > followersShown && (
                  <button
                    type="button"
                    className="zine__more"
                    onClick={() => setFollowersShown(n => n + FOLLOWERS_PAGE_SIZE)}
                  >
                    +{influencedBy.length - followersShown} more
                  </button>
                )}
              </section>
            )}

            <footer className="zine__footer">
              <Link href={`/artist/${artist.id}`} className="zine__sticker">
                Full artist page →
              </Link>
            </footer>
          </div>
        </>
      )}
    </aside>
  );
}
