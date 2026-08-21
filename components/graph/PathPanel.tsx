'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import type { Artist, GraphData } from '@/data/types';
import { resolveCitationStatus } from '@/data/types';
import { resolveNodeColor, REALM_LABELS_SHORT, resolveNodeLabel } from '@/lib/colors';
import { useNarrowLayout } from '@/lib/use-media-query';
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
const TIER_WORD: Partial<Record<HopEvidence, string>> = {
  'first-person': 'First-person',
  reported: 'Reported',
  critic: 'Critic',
};

function artistMeta(artist: Artist): string {
  // Same shape the artist panel's peek bar uses, with the short realm name so
  // "Post-Rock, Drone & Noise" cannot push the year onto a second line.
  const realm = artist.realm ? REALM_LABELS_SHORT[artist.realm] : resolveNodeLabel(artist);
  return artist.activeFrom ? `${realm} · ${artist.activeFrom}` : realm;
}

function Avatar({ artist }: { artist: Artist }) {
  const color = resolveNodeColor(artist);
  return (
    <span className="path-node__avatar" style={{ '--hop-color': color } as React.CSSProperties}>
      {artist.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artist.imageUrl} alt="" width={44} height={44} loading="lazy" />
      ) : (
        <span className="path-node__initial">{artist.name.charAt(0)}</span>
      )}
    </span>
  );
}

// One artist on the thread. `role` drives the origin/destination treatment —
// before this existed, .path-hop--start was rendered but had no CSS at all, so
// the two ends looked identical to everything between them.
function PathNode({
  artist,
  role,
  index,
}: {
  artist: Artist;
  role: 'start' | 'middle' | 'end';
  index: number;
}) {
  return (
    <li className={`path-node path-node--${role}`}>
      <Avatar artist={artist} />
      <span className="path-node__body">
        <span className="path-node__name">{artist.name}</span>
        <span className="path-node__meta">{artistMeta(artist)}</span>
      </span>
      {/* A link, not a button. Opening an artist used to call back into
          GraphView's handleSelectArtist, which nulls both path ends -- the
          panel's most inviting control destroyed the thing it was showing. */}
      <Link
        href={`/artist/${artist.id}`}
        className="path-node__open"
        aria-label={`Open ${artist.name}`}
        style={{ '--hop-color': resolveNodeColor(artist) } as React.CSSProperties}
      >
        <span aria-hidden>&rarr;</span>
      </Link>
      <span className="path-node__ordinal" aria-hidden>{index + 1}</span>
    </li>
  );
}

// The segment between two artists. Its line style is the evidence: solid and
// bright for a first-person hop, dashed for a critic's comparison, faint dots
// for an unsourced one. That is the whole best-sourced-route argument made
// visible instead of stated in a caption nobody reaches.
function PathLink({
  hop,
  color,
  isOpen,
  onToggle,
}: {
  hop: PathHop;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tier = hopEvidence(hop.edge);
  const status = resolveCitationStatus(hop.edge);
  const inherits = hop.direction === 'influenced-by';
  const hasToggle = status === 'cited' || status === 'unsourceable';

  return (
    <li
      className={`path-link path-link--${tier}`}
      style={{ '--hop-color': color } as React.CSSProperties}
    >
      <span className="path-link__rail" aria-hidden />

      <div className="path-link__body">
        <p className="path-link__direction">
          <span className="path-link__arrow" aria-hidden>{inherits ? '↑' : '↓'}</span>
          {inherits ? 'was influenced by' : 'went on to influence'}
        </p>

        {/* The evidence controls, grouped on their own row -- the tier says who
            is speaking in the source, so it belongs with the source toggle and
            not appended to the sentence above. */}
        {hasToggle && (
          <div className="path-link__evidence">
            <button
              type="button"
              className={`path-link__cite${status === 'unsourceable' ? ' path-link__cite--unsourceable' : ''}${isOpen ? ' path-link__cite--open' : ''}`}
              onClick={onToggle}
              aria-expanded={isOpen}
            >
              {/* Same quote glyph the artist pages use on their own sources
                  toggle -- it reads as "there is a quotation behind this"
                  faster than the word does, and separates this from the flat
                  tier label sitting next to it. */}
              <svg className="path-link__cite-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M7 8h4v4c0 2.2-1.8 4-4 4v-2c1.1 0 2-.9 2-2H7V8z" fill="currentColor" />
                <path d="M15 8h4v4c0 2.2-1.8 4-4 4v-2c1.1 0 2-.9 2-2h-2V8z" fill="currentColor" />
              </svg>
              {status === 'cited' ? (isOpen ? 'Hide source' : 'Read source') : 'No source'}
              <span className="path-link__cite-chevron" aria-hidden>&#8964;</span>
            </button>
            {TIER_WORD[tier] && <span className="path-link__tier">{TIER_WORD[tier]}</span>}
          </div>
        )}

        {isOpen && status === 'cited' && hop.edge.citation && (
          <p className="path-link__note path-link__note--citation">{hop.edge.citation}</p>
        )}
        {isOpen && status === 'unsourceable' && (
          <p className="path-link__note path-link__note--unsourceable">
            Widely accepted, unsourced.
          </p>
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

  return (
    <aside
      className={`path-panel${open ? ' path-panel--open' : ''}${
        isNarrowLayout ? (expanded ? ' path-panel--expanded' : ' path-panel--peek') : ''
      }`}
      aria-label="Path between artists"
      aria-hidden={!open}
      // Tinted to the destination, the way every other panel belongs to its
      // subject. Falls back to the origin so an unresolved path is not colourless.
      style={{ '--layer-color': resolveNodeColor(to ?? from ?? graphData.artists[0]) } as React.CSSProperties}
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
        <div className="path-panel__inner">
          <button className="path-panel__close" onClick={onClose} aria-label="Close path">
            Close
          </button>

          <p className="path-panel__eyebrow">Path</p>
          <h2 className="path-panel__title">
            {from!.name} <span aria-hidden>&rarr;</span> {to!.name}
          </h2>

          {!hops && (
            <p className="path-panel__verdict path-panel__verdict--none">
              No connection between these two in the graph yet.
            </p>
          )}

          {hops && (
            <>
              {/* Shown only when there is something true to say. The old third
                  branch, "They are connected.", never fired once across 522
                  sampled pairs and restated the panel's own existence anyway. */}
              {(direct || meeting) && (
                <p className="path-panel__verdict">
                  {direct
                    ? 'A direct line of descent.'
                    : <>They meet at <strong>{meeting!.name}</strong>.</>}
                </p>
              )}

              {/* No route-level evidence summary. It said the same thing on 77%
                  of paths, and every hop already carries its own tier -- in the
                  connector's line style and in the chip beside it -- so the
                  weak step in a route is still visible exactly where it is. */}

              {/* Nodes and connectors alternate as siblings in one list, so the
                  rail down the left is a single continuous run rather than
                  something re-drawn per group. Ordinals are passed explicitly
                  rather than taken from list position, since only half these
                  items are artists. */}
              <ol className="path-chain">
                {hops.map((hop, i) => {
                  const node = artistMap[hop.from];
                  const nextArtist = artistMap[hop.to];
                  if (!node || !nextArtist) return null;
                  const key = `${hop.from}->${hop.to}`;
                  return (
                    <Fragment key={key}>
                      <PathNode artist={node} role={i === 0 ? 'start' : 'middle'} index={i} />
                      <PathLink
                        hop={hop}
                        color={resolveNodeColor(nextArtist)}
                        isOpen={openCites.has(key)}
                        onToggle={() => toggleCite(key)}
                      />
                    </Fragment>
                  );
                })}
                <PathNode artist={to!} role="end" index={hops.length} />
              </ol>

              {/* Names what kind of answer this is. The route shown is the
                  best-documented one, not the shortest -- see
                  findBestSourcedPath. Without saying so, someone who counts the
                  hops and finds a shorter route on the canvas would reasonably
                  conclude the search was broken. */}
              <p className="path-panel__count">
                {hops.length} {hops.length === 1 ? 'step' : 'steps'} &middot; the best-sourced route, not the shortest
              </p>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
