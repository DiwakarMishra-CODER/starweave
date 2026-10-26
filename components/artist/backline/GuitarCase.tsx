import { useId } from 'react';
import type { Face } from '@/lib/backline';
import { Stickers, type Spot } from './Decor';

// The acoustic's hard case, standing on its end: black tolex with stitched
// edges, chrome latches, a leather handle with a ribbon in the artist's
// colour tied on, and plastered, the way touring cases get, with stickers of
// the bands the artist shaped. It isn't played; it just nods along.

export const CASE_W = 440;
export const CASE_H = 1100;

export const CASE_SPOTS: Spot[] = [
  { x: 150, y: 820, r: 40, tilt: -8 },
  { x: 300, y: 860, r: 40, tilt: 7 },
  { x: 210, y: 960, r: 38, tilt: 3 },
  { x: 110, y: 960, r: 30, tilt: 12 },
  { x: 330, y: 990, r: 30, tilt: -12 },
  { x: 140, y: 650, r: 34, tilt: 6 },
  { x: 290, y: 680, r: 34, tilt: -5 },
  { x: 220, y: 540, r: 30, tilt: 10 },
  { x: 220, y: 330, r: 30, tilt: -6 },
  { x: 220, y: 160, r: 26, tilt: 8 },
];

/** Its side nearest the page when it leans in from the left. */
export const CASE_REACH = [[300, 20], [320, 300], [380, 520], [430, 820], [400, 1060]] as const;

const SHELL = 'M220 14C276 14 300 30 304 60L318 380C320 420 360 440 382 500C410 580 432 680 432 820C432 980 360 1092 220 1092C80 1092 8 980 8 820C8 680 30 580 58 500C80 440 120 420 122 380L136 60C140 30 164 14 220 14Z';

export default function GuitarCase({ ribbon, stickers, onAir, tailRef }: {
  ribbon: string;
  stickers: Face[];
  onAir: string | null;
  tailRef: (i: number, el: SVGGElement | null) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <>
      <svg className="bline__svg" viewBox={`0 0 ${CASE_W} ${CASE_H}`} aria-hidden focusable="false">
        <defs>
          <pattern id={`${id}tolex`} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#1d1b1e" />
            <circle cx="2" cy="2" r="1" fill="#2a272b" />
            <circle cx="6" cy="6" r="1" fill="#141215" />
          </pattern>
          <linearGradient id={`${id}sheen`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}chrome`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfbf8" />
            <stop offset="0.5" stopColor="#bfbcb5" />
            <stop offset="1" stopColor="#8d8a84" />
          </linearGradient>
        </defs>
        <path d={SHELL} fill={`url(#${id}tolex)`} />
        <path d={SHELL} fill={`url(#${id}sheen)`} />
        <path d={SHELL} fill="none" stroke="#000" strokeWidth="3" />
        {/* The stitched seam just inside the edge. */}
        <path d={SHELL} fill="none" stroke="#8f8a80" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="6 5" transform="translate(220 553) scale(0.94) translate(-220 -553)" />
        {/* Latches down the right side, and the handle. */}
        {[300, 620, 900].map(y => (
          <g key={y}>
            <rect x={y < 400 ? 300 : 406} y={y} width="18" height="34" rx="3" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.5" />
          </g>
        ))}
        <path d="M420 690C470 690 476 780 420 780" fill="none" stroke="#3a2416" strokeWidth="14" strokeLinecap="round" />
        <rect x="412" y="682" width="14" height="16" rx="3" fill={`url(#${id}chrome)`} />
        <rect x="412" y="772" width="14" height="16" rx="3" fill={`url(#${id}chrome)`} />
        {/* A ribbon tied to the handle, tails hanging. */}
        {[0, 1].map(i => (
          <g key={i} ref={el => tailRef(i, el)} className="bline__tail" style={{ transformOrigin: '458px 736px' }}>
            <path
              d={i === 0 ? 'M454 736C462 780 452 830 462 880L476 878C468 830 476 780 466 734Z' : 'M460 738C478 776 476 818 492 858L504 850C488 814 486 774 472 736Z'}
              fill={ribbon}
              stroke="#000"
              strokeOpacity="0.25"
            />
          </g>
        ))}
        <path d="M448 730C454 722 468 722 472 730C474 738 466 744 456 742C448 740 446 736 448 730Z" fill={ribbon} stroke="#000" strokeOpacity="0.3" />
      </svg>
      <div className="bline__decor">
        <Stickers faces={stickers} spots={CASE_SPOTS} w={CASE_W} h={CASE_H} onAir={onAir} />
      </div>
    </>
  );
}
