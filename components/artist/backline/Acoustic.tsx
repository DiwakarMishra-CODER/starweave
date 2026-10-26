import { useId } from 'react';
import { blurPath } from '@/lib/strings';
import type { Face } from '@/lib/backline';
import { Badges, type Spot } from './Decor';
import { Camo, Pick, Strap } from './Gear';

// A dreadnought acoustic, worn on a strap by an unseen player, drawn to a
// real one's proportions (one unit a millimetre): a sunburst spruce top with
// cream binding, a round soundhole and its rosette, a tortoiseshell
// pickguard, a rosewood bridge with its pins, a solid headstock with three
// tuners a side. No maker's name. Round stickers of the bands that shaped
// the artist on its lower bout, and a pick strums it over the soundhole.

export const ACOUSTIC_W = 420;
export const ACOUSTIC_H = 1000;
const NUT = 150;
const BRIDGE = 795;
const SCALE = BRIDGE - NUT;
const BOARD_END = 592;
/** Where the player holds it: the lower bout, which it turns about. */
export const ACOUSTIC_PIVOT = [210, 760] as const;
/** Where the pick strums: just below the soundhole. */
export const ACOUSTIC_STRUM_Y = 712;

export const ACOUSTIC_STRINGS = Array.from({ length: 6 }, (_, i) => ({
  nut: 194 + i * 6.4,
  saddle: 184 + i * 10.4,
  post: ([[190, 35], [190, 75], [190, 115], [230, 115], [230, 75], [230, 35]] as const)[i],
  width: [3.2, 2.8, 2.3, 1.8, 1.3, 1][i],
}));

/** Its side nearest the page when it leans in from the right: the tuner
 *  keys, the headstock's edge and the body's bass side. */
export const ACOUSTIC_REACH = [[150, 35], [150, 75], [150, 115], [172, 30], [178, 150], [70, 500], [88, 640], [12, 820], [60, 940]] as const;

export const ACOUSTIC_SPOTS: Spot[] = [
  { x: 82, y: 860, r: 27, tilt: -6 },
  { x: 340, y: 860, r: 27, tilt: 8 },
  { x: 132, y: 932, r: 25, tilt: 4 },
  { x: 290, y: 932, r: 25, tilt: -10 },
  { x: 52, y: 770, r: 23, tilt: 12 },
  { x: 366, y: 770, r: 23, tilt: -4 },
  { x: 112, y: 540, r: 22, tilt: 0 },
  { x: 312, y: 540, r: 22, tilt: 6 },
  { x: 210, y: 950, r: 22, tilt: -8 },
  { x: 120, y: 690, r: 20, tilt: 10 },
];

const BODY = 'M210 430C150 430 80 440 70 500C60 560 90 600 88 640C86 680 12 720 12 820C12 930 100 992 210 992C320 992 408 930 408 820C408 720 334 680 332 640C330 600 360 560 350 500C340 440 270 430 210 430Z';
const HEAD = 'M178 150L172 30C172 12 186 2 210 2C234 2 248 12 248 30L242 150Z';
const GUARD = 'M262 642C262 600 300 590 318 620C334 650 320 712 282 716C264 718 258 690 262 642Z';
const STRAP = ['M240 440C300 300 420 120 600 -400', 'M210 990C300 1030 420 1000 500 930'];

const fretY = (n: number) => NUT + SCALE * (1 - 2 ** (-n / 12));
const boardX = (y: number) => {
  const t = (y - NUT) / (BOARD_END - NUT);
  return [188 - 6 * t, 232 + 6 * t] as const;
};

/** Where string `i` crosses height `y`. */
export const acousticStringX = (i: number, y: number) => {
  const s = ACOUSTIC_STRINGS[i];
  return s.nut + ((s.saddle - s.nut) * (y - NUT)) / SCALE;
};

export default function Acoustic({ pick, badges, onAir, blurRef, pickRef }: {
  pick: string;
  badges: Face[];
  onAir: string | null;
  blurRef: (i: number, el: SVGPathElement | null) => void;
  pickRef: (el: SVGGElement | null) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const frets = Array.from({ length: 20 }, (_, i) => fretY(i + 1));
  const dots = [3, 5, 7, 9, 15].map(n => (fretY(n - 1) + fretY(n)) / 2);
  const twelve = (fretY(11) + fretY(12)) / 2;
  return (
    <>
      <svg className="bline__svg" viewBox={`0 0 ${ACOUSTIC_W} ${ACOUSTIC_H}`} aria-hidden focusable="false">
        <defs>
          <radialGradient id={`${id}burst`} cx="210" cy="720" r="330" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f2d9a4" />
            <stop offset="0.5" stopColor="#dca862" />
            <stop offset="0.78" stopColor="#8a4a1c" />
            <stop offset="1" stopColor="#3a1a08" />
          </radialGradient>
          <linearGradient id={`${id}grain`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.05" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#000" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={`${id}mahogany`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a2414" />
            <stop offset="0.5" stopColor="#6e3a1f" />
            <stop offset="1" stopColor="#4a2414" />
          </linearGradient>
          <linearGradient id={`${id}chrome`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfbf8" />
            <stop offset="0.5" stopColor="#bfbcb5" />
            <stop offset="1" stopColor="#8d8a84" />
          </linearGradient>
          <Camo id={`${id}camo`} />
        </defs>

        <Strap paths={STRAP} camo={`${id}camo`} />
        <path d={HEAD} fill={`url(#${id}mahogany)`} stroke="#000" strokeOpacity="0.4" strokeWidth="1.5" />
        <rect x="186" y="140" width="48" height="300" rx="6" fill={`url(#${id}mahogany)`} />
        {ACOUSTIC_STRINGS.map((s, i) => {
          const left = i < 3;
          const key = left ? s.post[0] - 40 : s.post[0] + 40;
          return (
            <g key={i}>
              <path d={`M${s.post[0]} ${s.post[1]}H${key}`} stroke="#b7b2a8" strokeWidth="4" />
              <ellipse cx={key} cy={s.post[1]} rx="12" ry="8" fill="#efe6d0" stroke="#000" strokeOpacity="0.35" />
              <circle cx={s.post[0]} cy={s.post[1]} r="6" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
            </g>
          );
        })}

        {/* The body: sunburst spruce, cream binding. */}
        <path d={BODY} fill={`url(#${id}burst)`} />
        <path d={BODY} fill={`url(#${id}grain)`} />
        <path d={BODY} fill="none" stroke="#efe3c6" strokeWidth="5" />
        <path d={BODY} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle cx="210" cy="650" r="64" fill="none" stroke="#3a2410" strokeWidth="3" />
        <circle cx="210" cy="650" r="58" fill="none" stroke="#efe3c6" strokeWidth="4" strokeDasharray="3 2" />
        <circle className="bline__source" cx="210" cy="650" r="48" fill="#140b06" />
        <path d={GUARD} fill="#5a2a10" stroke="#000" strokeOpacity="0.35" />
        <path d="M150 790H270Q278 803 270 816H150Q142 803 150 790Z" fill="#2a1a12" stroke="#000" strokeOpacity="0.5" />
        <path d="M166 797H254" stroke="#efe6cf" strokeWidth="3" />
        {ACOUSTIC_STRINGS.map(s => <circle key={s.saddle} cx={s.saddle} cy="808" r="3.2" fill="#efe6cf" />)}

        <path d={`M188 ${NUT}H232L238 ${BOARD_END}Q210 ${BOARD_END + 8} 182 ${BOARD_END}Z`} fill="#2e1c12" />
        {frets.map(y => {
          const [l, r] = boardX(y);
          return (
            <g key={y}>
              <path d={`M${l} ${y + 1.4}H${r}`} stroke="#000" strokeOpacity="0.45" strokeWidth="1.2" />
              <path d={`M${l} ${y}H${r}`} stroke="#ddd7cb" strokeWidth="2.2" />
            </g>
          );
        })}
        {dots.map(y => <circle key={y} cx="210" cy={y} r="4.2" fill="#efe7d6" />)}
        <circle cx="202" cy={twelve} r="4.2" fill="#efe7d6" />
        <circle cx="218" cy={twelve} r="4.2" fill="#efe7d6" />
        <rect x="187" y={NUT - 6} width="46" height="7" rx="1.5" fill="#efe6cf" />

        {ACOUSTIC_STRINGS.map((s, i) => {
          const len = Math.hypot(s.saddle - s.nut, BRIDGE - NUT);
          const angle = (Math.atan2(s.nut - s.saddle, BRIDGE - NUT) * 180) / Math.PI;
          return (
            <g key={i}>
              <path d={`M${s.post[0]} ${s.post[1]}L${s.nut} ${NUT}`} stroke="#c9b48a" strokeWidth={s.width * 0.8} />
              <g transform={`translate(${s.nut} ${NUT}) rotate(${angle})`}>
                <path ref={el => blurRef(i, el)} className="bline__blur" d={blurPath(len, 38 - i * 3.2)} />
              </g>
              <path d={`M${s.nut} ${NUT}L${s.saddle} ${BRIDGE}`} stroke={i < 4 ? '#d8b77a' : '#e4ded2'} strokeWidth={s.width} />
              {i < 4 && <path d={`M${s.nut} ${NUT}L${s.saddle} ${BRIDGE}`} stroke="#5d4a2d" strokeOpacity="0.5" strokeWidth={s.width} strokeDasharray="1 1.2" />}
            </g>
          );
        })}
        {[[240, 440], [210, 990]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="6" fill="#efe6cf" stroke="#000" strokeOpacity="0.4" />)}
        <g transform={`translate(${acousticStringX(0, ACOUSTIC_STRUM_Y) - 14} ${ACOUSTIC_STRUM_Y})`}>
          <Pick color={pick} pickRef={pickRef} />
        </g>
      </svg>
      <div className="bline__decor">
        <Badges faces={badges} spots={ACOUSTIC_SPOTS} w={ACOUSTIC_W} h={ACOUSTIC_H} onAir={onAir} />
      </div>
    </>
  );
}
