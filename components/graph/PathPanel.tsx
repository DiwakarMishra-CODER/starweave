'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';
import type { Artist, GraphData } from '@/data/types';
import { resolveCitationStatus } from '@/data/types';
import { readableInk, resolveNodeColor } from '@/lib/colors';
import { countryName } from '@/lib/format';
import { useNarrowLayout } from '@/lib/use-media-query';
import SourceLink, { SourceStampIcon } from '@/components/ui/SourceLink';
import { useRoadPlayer } from './useRoadPlayer';
import {
  countDirectionTurns,
  findMeetingPoint,
  hopEvidence,
  isDirectDescent,
  type HopEvidence,
  type PathHop,
} from '@/lib/graph-utils';

interface Props {
  fromId: string | null;
  toId: string | null;
  graphData: GraphData;
  /**
   * Resolved by GraphView, which owns the search so the same result can drive
   * both this panel and the canvas highlight. Presentational only here — a
   * component that computed its own path would have to report it back upward,
   * and there is no honest place to do that from a render.
   */
  hops: PathHop[] | null;
  onClose: () => void;
}

// Who is speaking in the citation. Shown beside the Source toggle rather than
// on the direction line above it, and worded as a label rather than a phrase:
// "their own words" sat directly after "was influenced by" and the two read as
// one sentence -- "was influenced by their own words".
//
// Only the cited tiers appear. An unsourceable hop's toggle already says
// "No source", so a chip beside it saying "unsourced" is the same fact twice.
// The panel is a tour itinerary on a sheet of paper, like the zine artist
// panel and the tour pass Connect two opens with: "The road from A to B",
// each artist a stop like tour dates on a gig poster, a dotted road with a
// little van between stops saying which way the influence ran, with the
// source behind it, and "Play the road" to hear each stop in turn while the
// map lights the way (useRoadPlayer).
const PAPER = '#f2ede0'; // the sheet (--paper in globals.css), for readableInk

const TIER_WORD: Partial<Record<HopEvidence, string>> = {
  'first-person': 'First-person',
  reported: 'Reported',
  critic: 'Critic',
};

// Where and since when — only what the data holds: a country, not a city.
function stopMeta(artist: Artist): string {
  return [artist.country && countryName(artist.country), artist.activeFrom && `since ${artist.activeFrom}`]
    .filter(Boolean)
    .join(' · ');
}

function Stop({
  artist,
  index,
  onAir,
  onPlayFrom,
}: {
  artist: Artist;
  index: number;
  onAir: boolean;
  onPlayFrom: (index: number) => void;
}) {
  const color = resolveNodeColor(artist);
  return (
    <li
      className={`road-stop${onAir ? ' road-stop--on' : ''}`}
      style={{ '--stop-color': color } as React.CSSProperties}
    >
      {/* Tap the photo to play the road from this stop. */}
      <button
        type="button"
        className="road-stop__photo"
        onClick={() => onPlayFrom(index)}
        aria-label={`Play the road from ${artist.name}`}
      >
        {artist.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.imageUrl} alt="" width={52} height={52} loading="lazy" />
        ) : (
          <span className="road-stop__initial">{artist.name.charAt(0)}</span>
        )}
        <span className="road-stop__tape" aria-hidden />
        <span className="road-stop__play" aria-hidden>
          <svg width="12" height="12" viewBox="0 0 13 13" fill="currentColor">
            <path d="M3 1.8 11 6.5 3 11.2V1.8z" />
          </svg>
        </span>
      </button>
      <span className="road-stop__body">
        <span className="road-stop__label">
          Stop {index + 1}
          {onAir && <span className="road-stop__onair">On air</span>}
        </span>
        <span className="road-stop__name">{artist.name}</span>
        <span className="road-stop__meta">{stopMeta(artist)}</span>
        {/* How far through its turn it is (--road-progress, set by useRoadPlayer). */}
        {onAir && <span className="road-stop__progress" aria-hidden />}
      </span>
      {/* A link, not a button: opening an artist through GraphView's select
          handler would clear both ends of the road being shown. */}
      <Link href={`/artist/${artist.id}`} className="road-stop__open" aria-label={`Open ${artist.name}`}>
        <span aria-hidden>&rarr;</span>
      </Link>
    </li>
  );
}

function Segment({
  hop,
  isOpen,
  onToggle,
}: {
  hop: PathHop;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tier = hopEvidence(hop.edge);
  const status = resolveCitationStatus(hop.edge);
  const inherits = hop.direction === 'influenced-by';
  const hasToggle = status === 'cited' || status === 'unsourceable';
  const checked = !!(hop.edge.sourceUrl || hop.edge.sourcePrint);
  return (
    <li className={`road-seg road-seg--${tier}`}>
      <span className="road-seg__road" aria-hidden>
        <span className="road-seg__van" />
      </span>
      <div className="road-seg__body">
        <p className="road-seg__note">
          {inherits ? 'was influenced by' : 'went on to influence'}
        </p>
        {hasToggle && (
          <div className="road-seg__evidence">
            <button
              type="button"
              className={`zine-row__stamp${status === 'unsourceable' ? ' zine-row__stamp--none' : ''}${checked ? ' zine-row__stamp--checked' : ''}`}
              onClick={onToggle}
              aria-expanded={isOpen}
            >
              <SourceStampIcon checked={checked} />
              {status === 'cited' ? (isOpen ? 'Hide source' : 'Source') : 'No source'}
            </button>
            {TIER_WORD[tier] && <span className="road-seg__tier">{TIER_WORD[tier]}</span>}
          </div>
        )}
        {isOpen && status === 'cited' && hop.edge.citation && (
          <div className="road-seg__slip">
            <p>{hop.edge.citation}</p>
            <SourceLink url={hop.edge.sourceUrl} print={hop.edge.sourcePrint} />
          </div>
        )}
        {isOpen && status === 'unsourceable' && (
          <p className="road-seg__slip">Widely accepted, unsourced.</p>
        )}
      </div>
    </li>
  );
}

export default function PathPanel({ fromId, toId, graphData, hops, onClose }: Props) {
  const artistMap = Object.fromEntries(graphData.artists.map(a => [a.id, a])) as Record<string, Artist>;
  const from = fromId ? artistMap[fromId] : null;
  const to = toId ? artistMap[toId] : null;

  const open = !!(from && to && from.id !== to.id);

  // Collapsed by default, same as the artist panel's influence rows: a hop with
  // real evidence and a hop with none take the same space until asked.
  const isNarrowLayout = useNarrowLayout();
  // Collapsed by default on a phone. Peeked, the sheet is 104px and the route
  // is visible on the graph behind it; expanded, it is 78dvh for reading. The
  // 104 is not arbitrary -- it matches SHEET_PEEK_HEIGHT in ForceGraph, which
  // is what the narrow camera frames against. Without a collapsed state this
  // sheet was 62dvh always, so the camera solved the fit for 696px of a 800px
  // phone while only 214px was uncovered and most of the path drew behind it.
  const [expanded, setExpanded] = useState(false);

  const [openCites, setOpenCites] = useState<Set<string>>(new Set());
  // Reset during render rather than in an effect: searching a new path must not
  // leave a previous route's row expanded. Adjusting state while rendering is
  // React's own answer for state derived from a prop's identity, and it avoids
  // the extra commit an effect would cost on every path change.
  const pathKey = hops ? hops.map(h => `${h.from}->${h.to}`).join('|') : '';
  const [seenPathKey, setSeenPathKey] = useState(pathKey);
  if (seenPathKey !== pathKey) {
    setSeenPathKey(pathKey);
    setOpenCites(new Set());
    // A new search starts collapsed, so the first thing seen is the route on
    // the graph rather than a wall of text over it.
    setExpanded(false);
  }

  const toggleCite = (key: string) =>
    setOpenCites(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const direct = hops ? isDirectDescent(hops) : false;
  // A meeting point is only claimed when the route turns exactly once. Naming
  // one was previously unconditional, which meant it fired on 91% of paths and
  // was wrong on most of them: 56% of routes turn two to six times, and
  // findMeetingPoint reports only the first flip, so those got a confident
  // "they meet at X" pointing at an arbitrary node. Saying nothing is better
  // than saying something the per-hop arrows below contradict.
  const turns = hops ? countDirectionTurns(hops) : 0;
  const meetingId = hops && turns === 1 ? findMeetingPoint(hops) : null;
  const meeting = meetingId ? artistMap[meetingId] : null;

  // The stops, in order along the road. Keyed to the road itself, so the
  // player starts over (and the old one stops) when the road changes.
  const stops = useMemo(() => {
    if (!hops || hops.length === 0) return [] as Artist[];
    const byId = new Map(graphData.artists.map(a => [a.id, a]));
    return [hops[0].from, ...hops.map(h => h.to)].map(id => byId.get(id)).filter((a): a is Artist => !!a);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pathKey is the road's identity
  }, [pathKey, graphData.artists]);
  // Destructured: the result carries a ref, which render mustn't read through.
  const { at: roadAt, play: playRoad, stop: stopRoad, next: nextRoad, prev: prevRoad, progressRef } = useRoadPlayer(stops);
  const roadPlaying = roadAt !== null;
  // Closing the panel stops the music.
  useEffect(() => {
    if (!open) stopRoad();
  }, [open, stopRoad]);
  const toggleRoad = () => (roadPlaying ? stopRoad() : playRoad());
  const step = (dir: 'prev' | 'next') => (
    <button
      type="button"
      className="radio__step"
      onClick={dir === 'prev' ? prevRoad : nextRoad}
      aria-label={dir === 'prev' ? 'Previous stop' : 'Next stop'}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden>
        <path d={dir === 'prev' ? 'M8.5 1.2v8.6L1.5 5.5z' : 'M2.5 1.2v8.6l7-4.3z'} />
      </svg>
    </button>
  );
  const tint = resolveNodeColor(to ?? from ?? graphData.artists[0]);

  return (
    <aside
      className={`path-panel zine-panel${open ? ' path-panel--open' : ''}${
        isNarrowLayout ? (expanded ? ' path-panel--expanded' : ' path-panel--peek') : ''
      }`}
      aria-label="Path between artists"
      aria-hidden={!open}
      // Tinted to the destination, the way every other panel belongs to its
      // subject. Falls back to the origin so an unresolved path is not colourless.
      style={{ '--layer-color': tint, '--spot': readableInk(tint, PAPER) } as React.CSSProperties}
    >
      {/* ── Peek bar (narrow layouts) ──────────────────────────
          The sheet's collapsed face, and the state the camera frames against.
          The whole bar toggles -- the same lesson the artist panel's peek bar
          learned, where a grip and a chevron were the only handlers and tapping
          the obvious target did nothing. Close stops propagation so it does not
          also expand on its way out. */}
      {open && isNarrowLayout && (
        <div
          className="path-peek"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse path' : 'Expand path'}
          onClick={() => setExpanded(v => !v)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v); }
          }}
        >
          <span className="path-peek__handle" aria-hidden>
            <span className="path-peek__grip" />
          </span>
          <div className="path-peek__row">
            <span className="path-peek__faces" aria-hidden>
              {[from!, to!].map(a => (
                <span
                  key={a.id}
                  className="path-peek__face"
                  style={{ '--hop-color': resolveNodeColor(a) } as React.CSSProperties}
                >
                  {a.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={a.imageUrl} alt="" width={26} height={26} />
                    : <span className="path-peek__initial">{a.name.charAt(0)}</span>}
                </span>
              ))}
            </span>
            <span className="path-peek__text">
              <span className="path-peek__names">
                {from!.name} <span aria-hidden>&rarr;</span> {to!.name}
              </span>
              <span className="path-peek__meta">
                {hops
                  ? `${hops.length} ${hops.length === 1 ? 'step' : 'steps'} · best-sourced route`
                  : 'No connection found'}
              </span>
            </span>
            {hops && (
              <button
                type="button"
                className={`panel-peek__play${roadPlaying ? ' panel-peek__play--playing' : ''}`}
                onClick={e => { e.stopPropagation(); toggleRoad(); }}
                aria-label={roadPlaying ? 'Stop playing the road' : 'Play the road'}
              >
                {roadPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                    <rect x="1.5" y="1.5" width="9" height="9" rx="1.2" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
                    <path d="M3 1.8 11 6.5 3 11.2V1.8z" />
                  </svg>
                )}
              </button>
            )}
            <button
              className="path-peek__close"
              onClick={e => { e.stopPropagation(); onClose(); }}
              aria-label="Close path"
            >
              &#10005;
            </button>
          </div>
          <span className="path-peek__more">
            {expanded ? 'Hide steps' : 'See the steps'}
            <span className="path-peek__more-chev" aria-hidden>&#8964;</span>
          </span>
        </div>
      )}

      {open && (
        <div className="path-panel__inner road">
          <header className="road__masthead">
            <span className="road__mark">The road</span>
            <button className="zine__close road__close" onClick={onClose} aria-label="Close path">&#10005;</button>
          </header>

          <h2 className="road__title">
            <span className="road__title-word">from</span> {from!.name}{' '}
            <span className="road__title-word">to</span> {to!.name}
          </h2>

          {!hops && (
            <p className="road__none">No road between these two in the graph yet.</p>
          )}

          {hops && (
            <>
              {/* Shown only when there is something true to say: a straight
                  line of descent, or the one place the road turns. */}
              {(direct || meeting) && (
                <p className="road__verdict">
                  {direct ? 'A direct line of descent.' : <>They meet at {meeting!.name}.</>}
                </p>
              )}

              {/* Play / Stop, with back and on beside it while the road plays —
                  the same buttons, in the same places, as the radio's. */}
              <div className="road__controls">
              {roadPlaying && step('prev')}
              <button
                type="button"
                className={`radio__play road__play${roadPlaying ? ' radio__play--on' : ''}`}
                onClick={toggleRoad}
                aria-label={roadPlaying ? 'Stop playing the road' : 'Play the road: a few seconds of each stop, in order'}
              >
                <span className="radio__play-icon" aria-hidden>
                  {roadPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="1.2" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 13 13" fill="currentColor">
                      <path d="M3 1.8 11 6.5 3 11.2V1.8z" />
                    </svg>
                  )}
                </span>
                <span className="radio__play-verb">{roadPlaying ? 'Stop' : 'Play the road'}</span>
              </button>
              {roadPlaying && step('next')}
              </div>

              <ol className="road__stops" ref={progressRef}>
                {stops.map((artist, i) => {
                  const hop = hops[i];
                  const key = hop ? `${hop.from}->${hop.to}` : `end-${artist.id}`;
                  return (
                    <Fragment key={key}>
                      <Stop artist={artist} index={i} onAir={roadAt === i} onPlayFrom={playRoad} />
                      {hop && (
                        <Segment hop={hop} isOpen={openCites.has(key)} onToggle={() => toggleCite(key)} />
                      )}
                    </Fragment>
                  );
                })}
              </ol>

              {/* What kind of answer this is: the best-documented road, not
                  the shortest (see findBestSourcedPath). Without saying so,
                  someone who finds a shorter route on the map would conclude
                  the search was broken. */}
              <footer className="road__foot">
                <p className="road__steps">
                  Connected in {hops.length} {hops.length === 1 ? 'step' : 'steps'}
                </p>
                <p className="road__fine">the best-sourced route, not the shortest</p>
              </footer>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
