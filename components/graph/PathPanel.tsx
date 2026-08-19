'use client';

import type { Artist, GraphData } from '@/data/types';
import { resolveCitationStatus } from '@/data/types';
import { resolveNodeColor } from '@/lib/colors';
import { findMeetingPoint, isDirectDescent, type PathHop } from '@/lib/graph-utils';

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
  onSelectArtist: (id: string) => void;
}

// One hop: who, which way, and the evidence. The direction line matters as much
// as the names — an undirected search can return a chain that is a real line of
// descent or two artists meeting at a shared ancestor, and only the per-hop
// arrows tell those apart. See the note above findConnectionPath.
function HopRow({
  hop,
  artistMap,
  onSelectArtist,
}: {
  hop: PathHop;
  artistMap: Record<string, Artist>;
  onSelectArtist: (id: string) => void;
}) {
  const target = artistMap[hop.to];
  if (!target) return null;
  const status = resolveCitationStatus(hop.edge);
  const inherits = hop.direction === 'influenced-by';

  return (
    <li className="path-hop">
      <p className="path-hop__direction">
        <span className="path-hop__arrow" aria-hidden>{inherits ? '↑' : '↓'}</span>
        {inherits ? 'was influenced by' : 'went on to influence'}
      </p>

      <button
        className="path-hop__artist"
        onClick={() => onSelectArtist(target.id)}
        style={{ '--hop-color': resolveNodeColor(target) } as React.CSSProperties}
      >
        <span className="path-hop__dot" aria-hidden />
        {target.name}
      </button>

      {/* A path is only as good as its weakest link, so an unsourced hop says
          so in place rather than leaving a silent gap. Same wording the artist
          panel uses for the same state. */}
      {status === 'cited' && hop.edge.citation && (
        <p className="path-hop__citation">
          {hop.edge.citation}
          {hop.edge.sourceTier && (
            <span className="path-hop__tier"> · {hop.edge.sourceTier.replace('-', ' ')}</span>
          )}
        </p>
      )}
      {status === 'unsourceable' && (
        <p className="path-hop__citation path-hop__citation--weak">
          Widely accepted — no first-person source found.
        </p>
      )}
      {status === 'unchecked' && (
        <p className="path-hop__citation path-hop__citation--weak">
          Not yet verified.
        </p>
      )}
    </li>
  );
}

export default function PathPanel({
  fromId,
  toId,
  graphData,
  hops,
  onClose,
  onSelectArtist,
}: Props) {
  const artistMap = Object.fromEntries(graphData.artists.map(a => [a.id, a])) as Record<string, Artist>;
  const from = fromId ? artistMap[fromId] : null;
  const to = toId ? artistMap[toId] : null;

  const open = !!(from && to && from.id !== to.id);

  const direct = hops ? isDirectDescent(hops) : false;
  const meetingId = hops ? findMeetingPoint(hops) : null;
  const meeting = meetingId ? artistMap[meetingId] : null;

  return (
    <aside
      className={`path-panel${open ? ' path-panel--open' : ''}`}
      aria-label="Path between artists"
      aria-hidden={!open}
    >
      {open && (
        <div className="path-panel__inner">
          <button className="path-panel__close" onClick={onClose} aria-label="Close path">
            ✕
          </button>

          <p className="path-panel__eyebrow">Path</p>
          <h2 className="path-panel__title">
            {from!.name} <span aria-hidden>→</span> {to!.name}
          </h2>

          {!hops && (
            <p className="path-panel__verdict path-panel__verdict--none">
              No connection between these two in the graph yet.
            </p>
          )}

          {hops && (
            <>
              <p className="path-panel__verdict">
                {direct
                  ? 'A direct line of descent.'
                  : meeting
                    ? <>They meet at <strong>{meeting.name}</strong>.</>
                    : 'They are connected.'}
              </p>

              <ol className="path-panel__chain">
                <li className="path-hop path-hop--start">
                  <button
                    className="path-hop__artist"
                    onClick={() => onSelectArtist(from!.id)}
                    style={{ '--hop-color': resolveNodeColor(from!) } as React.CSSProperties}
                  >
                    <span className="path-hop__dot" aria-hidden />
                    {from!.name}
                  </button>
                </li>
                {hops.map(hop => (
                  <HopRow
                    key={`${hop.from}->${hop.to}`}
                    hop={hop}
                    artistMap={artistMap}
                    onSelectArtist={onSelectArtist}
                  />
                ))}
              </ol>

              <p className="path-panel__count">
                {hops.length} {hops.length === 1 ? 'step' : 'steps'} · every one sourced or marked
              </p>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
