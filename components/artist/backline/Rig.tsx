import { useId } from 'react';
import type { Face } from '@/lib/backline';
import { Stickers, type Spot } from './Decor';

// A monitor speaker on a stand with a drum machine on top: the drum machine
// with its row of sixteen step buttons in four colours, a light over each;
// the speaker with a tweeter and a big woofer. No maker's name. Stickers of
// the bands the artist shaped on the cabinet. When a song plays the woofer
// pumps hard on the low notes and the beat, the tweeter on the high ones, the
// cabinet jumps on the kick, sound rings out of both, and the step lights
// run in time
// (components/artist/backline/Room).

export const RIG_W = 340;
export const RIG_H = 900;
export const RIG_STEPS = 16;

export const RIG_SPOTS: Spot[] = [
  { x: 64, y: 206, r: 26, tilt: -8 },
  { x: 278, y: 206, r: 26, tilt: 7 },
  { x: 60, y: 600, r: 24, tilt: 10 },
  { x: 282, y: 604, r: 24, tilt: -6 },
  { x: 58, y: 318, r: 21, tilt: 4 },
  { x: 284, y: 320, r: 21, tilt: -10 },
];

/** Its side nearest the page when it stands in the right column. */
export const RIG_REACH = [[0, 20], [0, 150], [20, 160], [20, 640]] as const;

const STEP_INK = ['#e8463a', '#ff8a2a', '#f2c94c', '#efe9da'];

export default function Rig({ stickers, onAir, coneRef, tweeterRef, stepRef }: {
  stickers: Face[];
  onAir: string | null;
  coneRef: (el: SVGGElement | null) => void;
  tweeterRef: (el: SVGGElement | null) => void;
  stepRef: (i: number, el: SVGCircleElement | null) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <>
      <svg className="bline__svg" viewBox={`0 0 ${RIG_W} ${RIG_H}`} aria-hidden focusable="false">
        <defs>
          <radialGradient id={`${id}cone`}>
            <stop offset="0" stopColor="#3d3a44" />
            <stop offset="0.7" stopColor="#1f1d22" />
            <stop offset="1" stopColor="#121014" />
          </radialGradient>
          <radialGradient id={`${id}cap`} cx="0.4" cy="0.35">
            <stop offset="0" stopColor="#5a5662" />
            <stop offset="1" stopColor="#1b191e" />
          </radialGradient>
        </defs>

        {/* The stand's pole, down to the floor. */}
        <rect x="160" y="630" width="20" height="270" fill="#1a181b" />
        <rect x="140" y="634" width="60" height="14" rx="4" fill="#2c2a2e" />

        {/* The speaker. */}
        <rect x="20" y="160" width="300" height="480" rx="14" fill="#19171a" stroke="#000" strokeWidth="2" />
        <rect x="24" y="164" width="292" height="472" rx="12" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="2" />
        <circle cx="170" cy="250" r="40" fill="#0e0d0f" />
        <g ref={tweeterRef} className="bline__cone">
          <circle cx="170" cy="250" r="26" fill={`url(#${id}cap)`} />
        </g>
        <circle cx="170" cy="450" r="124" fill="#0b0a0c" />
        <g ref={coneRef} className="bline__cone">
          <circle cx="170" cy="450" r="118" fill="#141215" stroke="#2a272d" strokeWidth="6" />
          <circle cx="170" cy="450" r="104" fill={`url(#${id}cone)`} />
          <circle cx="170" cy="450" r="36" fill={`url(#${id}cap)`} />
        </g>
        <rect x="110" y="588" width="120" height="18" rx="9" fill="#0b0a0c" />

        {/* The drum machine on top. */}
        <rect x="0" y="22" width="340" height="128" rx="8" fill="#2c2a2e" stroke="#000" strokeWidth="2" />
        <rect x="0" y="22" width="340" height="14" rx="6" fill="#e8463a" />
        <rect x="0" y="30" width="340" height="6" fill="#ff8a2a" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <circle cx={24 + i * 41} cy="62" r="11" fill="#0e0d0f" />
            <circle cx={24 + i * 41} cy="62" r="7.5" fill="#efe6cf" />
          </g>
        ))}
        {Array.from({ length: RIG_STEPS }, (_, i) => {
          const x = 10 + i * 20.5;
          return (
            <g key={i}>
              <circle ref={el => stepRef(i, el)} className="bline__step" cx={x + 8} cy="94" r="3.4" />
              <rect x={x} y="104" width="16" height="30" rx="3" fill={STEP_INK[Math.floor(i / 4)]} stroke="#000" strokeOpacity="0.4" />
            </g>
          );
        })}
      </svg>
      <div className="bline__decor">
        <Stickers faces={stickers} spots={RIG_SPOTS} w={RIG_W} h={RIG_H} onAir={onAir} />
      </div>
    </>
  );
}
