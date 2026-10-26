import { useId } from 'react';
import type { Face } from '@/lib/backline';
import { Badges, type Spot } from './Decor';

// A two-octave analog synth on an X-stand: walnut end cheeks, a black panel
// of coloured knobs and a small green screen, a keybed of real proportions.
// No maker's name. Round stickers of the bands that shaped the artist on its
// panel and cheeks. When a song plays, its keys go down on the notes the song
// strikes (each of the song's 24 bands a semitone, low to high) and the
// knobs turn with its swell (components/artist/backline/Room).

export const SYNTH_W = 600;
export const SYNTH_H = 1000;
const KEY_TOP = 158;
const KEY_H = 134;
const WHITE = 15;
const WHITE_W = 520 / WHITE;
/** Which white key each black key follows, across two octaves. */
const BLACK_AFTER = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
/** The keys in chromatic order, low C up: white or black, and which. */
export const SYNTH_KEYS: { black: boolean; i: number }[] = (() => {
  const keys: { black: boolean; i: number }[] = [];
  let w = 0;
  let b = 0;
  for (let semis = 0; semis < 25; semis++) {
    const black = [1, 3, 6, 8, 10].includes(semis % 12);
    keys.push(black ? { black, i: b++ } : { black, i: w++ });
  }
  return keys;
})();
export const SYNTH_KNOBS = 14;

export const SYNTH_SPOTS: Spot[] = [
  { x: 420, y: 118, r: 20, tilt: -8 },
  { x: 476, y: 120, r: 20, tilt: 6 },
  { x: 530, y: 116, r: 18, tilt: -4 },
  { x: 18, y: 70, r: 14, tilt: 0 },
  { x: 582, y: 230, r: 14, tilt: 10 },
];

/** Its side nearest the page when it stands in the left column. */
export const SYNTH_REACH = [[600, 0], [600, 300], [520, 1000]] as const;

const INK = ['#efe6cf', '#ff7a1a', '#2f6fb3', '#efe6cf', '#e8463a', '#efe6cf', '#16a3a3'];

export default function Synth({ badges, onAir, keyRef, knobRef }: {
  badges: Face[];
  onAir: string | null;
  keyRef: (semitone: number, el: SVGRectElement | null) => void;
  knobRef: (i: number, el: SVGGElement | null) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <>
      <svg className="bline__svg" viewBox={`0 0 ${SYNTH_W} ${SYNTH_H}`} aria-hidden focusable="false">
        <defs>
          <linearGradient id={`${id}walnut`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a2a17" />
            <stop offset="0.5" stopColor="#7a4a2a" />
            <stop offset="1" stopColor="#4a2a17" />
          </linearGradient>
          <linearGradient id={`${id}white`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7f2e7" />
            <stop offset="0.85" stopColor="#ece4d2" />
            <stop offset="1" stopColor="#cfc6b2" />
          </linearGradient>
        </defs>

        {/* The X-stand. */}
        <g stroke="#1a181b" strokeWidth="22" strokeLinecap="round">
          <path d="M140 300L470 990M460 300L130 990" />
          <path d="M100 300H500" strokeWidth="14" />
        </g>
        <circle cx="300" cy="645" r="16" fill="#2c2a2e" />

        <rect x="0" y="0" width="36" height="300" rx="6" fill={`url(#${id}walnut)`} />
        <rect x="564" y="0" width="36" height="300" rx="6" fill={`url(#${id}walnut)`} />
        <rect x="36" y="8" width="528" height="146" fill="#1b1a1d" />
        <rect x="36" y="8" width="528" height="8" fill="#9a968e" />
        {Array.from({ length: SYNTH_KNOBS }, (_, i) => {
          const x = 70 + (i % 7) * 44;
          const y = i < 7 ? 50 : 106;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="17" fill="#0e0d0f" />
              <g ref={el => knobRef(i, el)} className="bline__knob">
                <circle cx={x} cy={y} r="12.5" fill={INK[(i * 3) % INK.length]} stroke="#000" strokeOpacity="0.4" />
                <path d={`M${x} ${y}V${y - 11}`} stroke="#1c1724" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          );
        })}
        <rect x="392" y="30" width="148" height="50" rx="4" fill="#0f2a1c" stroke="#000" />
        <path d="M400 56C412 40 422 40 432 56S452 72 462 56S482 40 492 56S512 72 532 56" fill="none" stroke="#5be08a" strokeWidth="2" />

        {/* The keybed: whites, then blacks over them. */}
        <rect className="bline__source" x="36" y={KEY_TOP - 4} width="528" height={KEY_H + 8} fill="#0d0c0e" />
        {SYNTH_KEYS.map((k, semis) => (k.black ? null : (
          <rect
            key={semis}
            ref={el => keyRef(semis, el)}
            className="bline__key"
            x={40 + k.i * WHITE_W + 0.8}
            y={KEY_TOP}
            width={WHITE_W - 1.6}
            height={KEY_H}
            rx="2"
            fill={`url(#${id}white)`}
          />
        )))}
        {SYNTH_KEYS.map((k, semis) => (!k.black ? null : (
          <rect
            key={semis}
            ref={el => keyRef(semis, el)}
            className="bline__key bline__key--black"
            x={40 + (BLACK_AFTER[k.i] + 1) * WHITE_W - 10}
            y={KEY_TOP}
            width="20"
            height="84"
            rx="2"
            fill="#1a191c"
          />
        )))}
      </svg>
      <div className="bline__decor">
        <Badges faces={badges} spots={SYNTH_SPOTS} w={SYNTH_W} h={SYNTH_H} onAir={onAir} />
      </div>
    </>
  );
}
