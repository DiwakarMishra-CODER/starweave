'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import type { FeatureSign, GenreFeature } from '@/lib/genre-feature';

// The genre's own road from the city (/genres): the enamel signs it came
// from, oldest first, running in from the left; its own sign, lit; where it
// went, branching out to the right; and above, on an overpass, the sounds it
// also borrowed from. Every sign goes to that genre's feature. When the
// section scrolls into view (Reveal) the road draws from the oldest sign,
// each sign switching on as the light passes, then the branches come out.
// A little tour van then drives the road as the page scrolls, from the
// oldest sign to this one (a scroll-driven CSS animation over --run, the
// distance measured here); where scroll-driven animations aren't supported
// it is simply parked at its destination.

function Sign({ s, lit = false, i = 0 }: { s: FeatureSign; lit?: boolean; i?: number }) {
  const inner = (
    <>
      <span className="froad__name">{s.name}</span>
      {s.emerged && <span className="froad__year">{s.emerged}</span>}
    </>
  );
  const style = { '--glow': s.color, '--i': i } as React.CSSProperties;
  return lit
    ? <span className="froad__sign froad__sign--self" style={style} aria-current="page">{inner}</span>
    : <Link href={`/genre/${s.id}`} className="froad__sign" style={style}>{inner}</Link>;
}

export default function Road({ road }: { road: GenreFeature['road'] }) {
  const n = road.ancestors.length;
  // The road takes the page's width (up to GAP_MAX between signs, so the
  // van has room to show between them; a long road stays at its minimum and
  // scrolls), and the van's run is measured to just short of this sign.
  const trackRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const track = trackRef.current;
    const road = track?.parentElement;
    const line = track?.querySelector<HTMLElement>('.froad__line');
    const self = track?.querySelector<HTMLElement>('.froad__stop--self');
    if (!track || !road || !line || !self) return;
    const measure = () => {
      const stops = [...line.children] as HTMLElement[];
      const signs = stops.reduce((w, el) => w + el.offsetWidth, 0);
      const room = road.clientWidth - 8 - PLAYER_ROOM - signs;
      const gap = stops.length > 1 ? Math.max(GAP_MIN, Math.min(GAP_MAX, room / (stops.length - 1))) : GAP_MIN;
      track.style.setProperty('--gap', `${Math.floor(gap)}px`);
      track.style.setProperty('--run', `${Math.max(0, self.offsetLeft - VAN_W - 6)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(road);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="froad" style={{ '--n': n } as React.CSSProperties}>
      {road.borrowed.length > 0 && (
        <div className="froad__over">
          <span className="froad__over-label">Also borrowed from</span>
          <div className="froad__over-signs">
            {road.borrowed.map((s, i) => <Sign key={s.id} s={s} i={n + 1 + i} />)}
          </div>
        </div>
      )}
      <div ref={trackRef} className="froad__track">
        <ol className="froad__line">
          {road.ancestors.map((s, i) => (
            <li key={s.id} className="froad__stop" style={{ '--i': i } as React.CSSProperties}>
              <Sign s={s} i={i} />
            </li>
          ))}
          <li className="froad__stop froad__stop--self" style={{ '--i': n } as React.CSSProperties}>
            <Sign s={road.self} lit i={n} />
          </li>
          {road.children.length > 0 && (
            <li className="froad__stop froad__stop--branches" style={{ '--i': n + 1 } as React.CSSProperties}>
              <span className="froad__branch-label">Where it went</span>
              <ul className="froad__branches">
                {road.children.map((s, i) => (
                  <li key={s.id} style={{ '--b': i } as React.CSSProperties}><Sign s={s} i={n + 1 + i} /></li>
                ))}
              </ul>
            </li>
          )}
        </ol>
        {n > 0 && <Van />}
      </div>
      {n === 0 && <p className="froad__note">Nothing on the map came before it: this is where its road starts.</p>}
      {road.children.length === 0 && <p className="froad__note">Nothing on the map has grown out of it yet.</p>}
    </div>
  );
}

const VAN_W = 40;
const GAP_MIN = 38;
const GAP_MAX = 90;
// Kept clear at the right: the pocket player sits in the screen's corner.
const PLAYER_ROOM = 150;

/** The band's van: the genre's colour (--spot), cream windows, ink wheels.
 *  The About page's road drives it too. */
export function Van() {
  return (
    <svg className="froad__van" width={VAN_W} height={26} viewBox="0 0 34 22" aria-hidden>
      <path className="froad__van-body" d="M2 3.5h19v13H2z M21 8h6.5l4.5 5v3.5H21z" />
      <path className="froad__van-glass" d="M23 9.5h4l3 3.5h-7z M4.5 6h6v4.5h-6z M12.5 6h6v4.5h-6z" />
      <circle className="froad__van-wheel" cx="8" cy="17.5" r="3" />
      <circle className="froad__van-wheel" cx="26" cy="17.5" r="3" />
    </svg>
  );
}
