import { useId } from 'react';
import { blurPath } from '@/lib/strings';
import type { Face } from '@/lib/backline';
import { Badges, type Spot } from './Decor';
import { Camo, Pick, Strap } from './Gear';

// A four-string bass, worn on a camo strap by an unseen player, drawn to a
// real one's proportions (one unit a millimetre): a body in the artist's
// colour with a cream pickguard, a split pickup, a maple neck with a rosewood
// board, its frets where the twelfth root of two puts them. No maker's name.
// Pin badges of the bands that shaped the artist cover the body, Karly
// Hartzman style, and a pick plays it.

export const BASS_W = 360;
export const BASS_H = 1180;
const NUT = 150;
const BRIDGE = 1030;
const SCALE = BRIDGE - NUT;
const BOARD_END = 760;
/** Where the player holds it: the body's middle, which it turns about. */
export const BASS_PIVOT = [180, 900] as const;
/** Where the pick plays: between the pickup and the bridge. */
export const BASS_STRUM_Y = 950;

/** Nut to saddle, low string first. */
export const BASS_STRINGS = [
  { nut: 168, saddle: 153, post: [146, 30], width: 4.2 },
  { nut: 176, saddle: 171, post: [150, 62], width: 3.6 },
  { nut: 184, saddle: 189, post: [157, 94], width: 3 },
  { nut: 192, saddle: 207, post: [168, 126], width: 2.4 },
];

export const BASS_SPOTS: Spot[] = [
  { x: 70, y: 905, r: 27, tilt: -8 },
  { x: 300, y: 905, r: 27, tilt: 6 },
  { x: 78, y: 975, r: 27, tilt: 12 },
  { x: 98, y: 1045, r: 27, tilt: -4 },
  { x: 74, y: 840, r: 25, tilt: 15 },
  { x: 284, y: 845, r: 25, tilt: -10 },
  { x: 140, y: 1105, r: 26, tilt: 8 },
  { x: 225, y: 1110, r: 26, tilt: -12 },
  { x: 64, y: 762, r: 24, tilt: -6 },
  { x: 296, y: 762, r: 24, tilt: 10 },
  { x: 112, y: 965, r: 22, tilt: 0 },
  { x: 246, y: 920, r: 22, tilt: 14 },
  { x: 182, y: 1140, r: 20, tilt: 0 },
];

const BODY = 'M151 660C146 630 120 596 96 590C72 584 58 604 60 632C62 670 36 690 34 740C32 778 50 790 46 820C40 860 14 880 16 940C18 1040 60 1176 180 1176C300 1176 346 1040 344 940C342 880 314 860 312 820C310 780 330 760 322 720C316 680 300 640 276 636C254 632 234 664 209 672Z';
const GUARD = 'M150 668C138 640 112 626 98 640C86 654 92 690 84 730C78 770 96 792 112 822C128 852 128 920 146 952C164 982 222 984 240 952C256 922 262 860 280 828C296 800 306 760 296 726C288 700 264 694 240 694L212 694L212 668Z';
const HEAD = 'M159 150L159 140C156 110 140 90 132 60C126 36 132 10 156 6C176 2 214 0 220 14C226 26 214 40 208 64C202 92 203 120 201 140L201 150Z';

const fretY = (n: number) => NUT + SCALE * (1 - 2 ** (-n / 12));
const boardX = (y: number) => {
  const t = (y - NUT) / (BOARD_END - NUT);
  return [159 - 9 * t, 201 + 9 * t] as const;
};

/** Its side nearest the page when it leans in: the headstock's edge and
 *  the body's treble side (Room keeps these off the page's words). */
export const BASS_REACH = [[220, 14], [214, 40], [208, 64], [203, 120], [210, 700], [276, 636], [322, 720], [344, 940]] as const;

/** Where string `i` crosses height `y`. */
export const bassStringX = (i: number, y: number) => {
  const s = BASS_STRINGS[i];
  return s.nut + ((s.saddle - s.nut) * (y - NUT)) / SCALE;
};

const STRAP = ['M90 590C70 470 -10 260 -180 -400', 'M180 1172C110 1215 10 1190 -70 1110'];

export default function Bass({ finish, pick, badges, onAir, blurRef, pickRef }: {
  finish: string;
  pick: string;
  badges: Face[];
  onAir: string | null;
  blurRef: (i: number, el: SVGPathElement | null) => void;
  pickRef: (el: SVGGElement | null) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const frets = Array.from({ length: 20 }, (_, i) => fretY(i + 1));
  const dots = [3, 5, 7, 9, 15, 17, 19].map(n => (fretY(n - 1) + fretY(n)) / 2);
  const twelve = (fretY(11) + fretY(12)) / 2;
  return (
    <>
      <svg className="bline__svg" viewBox={`0 0 ${BASS_W} ${BASS_H}`} aria-hidden focusable="false">
        <defs>
          <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.75" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`${id}maple`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c8955a" />
            <stop offset="0.5" stopColor="#e6bd84" />
            <stop offset="1" stopColor="#c08c52" />
          </linearGradient>
          <linearGradient id={`${id}chrome`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfbf8" />
            <stop offset="0.5" stopColor="#bfbcb5" />
            <stop offset="1" stopColor="#8d8a84" />
          </linearGradient>
          <Camo id={`${id}camo`} />
        </defs>

        <Strap paths={STRAP} camo={`${id}camo`} />

        {/* Headstock and neck, maple. */}
        <path d={HEAD} fill={`url(#${id}maple)`} stroke="#000" strokeOpacity="0.3" strokeWidth="1.5" />
        <rect x="157" y="140" width="46" height="560" rx="6" fill={`url(#${id}maple)`} />
        {BASS_STRINGS.map(s => (
          <g key={s.post[1]}>
            <path d={`M${s.post[0] - 46} ${s.post[1]}H${s.post[0]}`} stroke="#9a968f" strokeWidth="5" />
            <ellipse cx={s.post[0] - 52} cy={s.post[1]} rx="12" ry="9" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.35" />
            <circle cx={s.post[0]} cy={s.post[1]} r="7" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
          </g>
        ))}

        {/* The body, in the artist's colour, glossy. */}
        <path d={BODY} fill={finish} />
        <path d={BODY} fill={`url(#${id}gloss)`} />
        <path d={BODY} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" transform="translate(1.5 1.5)" />
        <path d={BODY} fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="2" />
        <path d={GUARD} fill="#efe8d8" stroke="#000" strokeOpacity="0.28" strokeWidth="1.5" />
        {[[172, 700], [104, 650], [92, 790], [140, 938], [232, 960], [276, 812], [270, 712]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="#a9a399" />
        ))}

        {/* Rosewood board, frets, dots. */}
        <path d={`M159 ${NUT}H201L210 ${BOARD_END}Q180 ${BOARD_END + 8} 150 ${BOARD_END}Z`} fill="#3a2418" />
        {frets.map(y => {
          const [l, r] = boardX(y);
          return (
            <g key={y}>
              <path d={`M${l} ${y + 1.6}H${r}`} stroke="#000" strokeOpacity="0.45" strokeWidth="1.4" />
              <path d={`M${l} ${y}H${r}`} stroke="#ddd7cb" strokeWidth="2.6" />
            </g>
          );
        })}
        {dots.map(y => <circle key={y} cx="180" cy={y} r="5" fill="#efe7d6" />)}
        <circle cx="171" cy={twelve} r="5" fill="#efe7d6" />
        <circle cx="189" cy={twelve} r="5" fill="#efe7d6" />
        <rect x="158" y={NUT - 6} width="44" height="7" rx="1.5" fill="#efe6cf" />

        {/* A split pickup, the bridge, the control plate. */}
        <rect x="138" y="852" width="40" height="22" rx="6" fill="#151215" />
        <rect x="182" y="872" width="40" height="22" rx="6" fill="#151215" />
        {[148, 158, 168, 192, 202, 212].map((x, i) => <circle key={x} cx={x} cy={i < 3 ? 863 : 883} r="2.4" fill="#b9b2a6" />)}
        <rect x="136" y="1014" width="88" height="34" rx="4" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
        {BASS_STRINGS.map(s => <rect key={s.saddle} x={s.saddle - 7} y="1021" width="14" height="16" rx="2" fill="#d9d6cf" stroke="#000" strokeOpacity="0.35" />)}
        <g transform="rotate(-32 282 1002)">
          <rect x="266" y="958" width="32" height="88" rx="15" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
          <circle cx="282" cy="978" r="12" fill="#1b1719" stroke="#000" />
          <circle cx="282" cy="1012" r="12" fill="#1b1719" stroke="#000" />
          <circle cx="282" cy="978" r="3" fill="#cfc9bd" />
          <circle cx="282" cy="1012" r="3" fill="#cfc9bd" />
        </g>

        {/* The strings, each with the blur a pluck leaves on it. */}
        {BASS_STRINGS.map((s, i) => {
          const len = Math.hypot(s.saddle - s.nut, BRIDGE - NUT);
          const angle = (Math.atan2(s.nut - s.saddle, BRIDGE - NUT) * 180) / Math.PI;
          return (
            <g key={i}>
              <path d={`M${s.post[0]} ${s.post[1]}L${s.nut} ${NUT}`} stroke="#bdb7ad" strokeWidth={s.width * 0.7} />
              <g transform={`translate(${s.nut} ${NUT}) rotate(${angle})`}>
                <path ref={el => blurRef(i, el)} className="bline__blur" d={blurPath(len, 54 - i * 6)} />
              </g>
              <path d={`M${s.nut} ${NUT}L${s.saddle} ${BRIDGE}`} stroke="#d6cfc2" strokeWidth={s.width} />
              <path d={`M${s.nut} ${NUT}L${s.saddle} ${BRIDGE}`} stroke="#5d564d" strokeOpacity="0.55" strokeWidth={s.width} strokeDasharray="1 1.4" />
            </g>
          );
        })}
        {[[90, 594], [180, 1170]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="6" fill={`url(#${id}chrome)`} />)}
        <g transform={`translate(${bassStringX(0, BASS_STRUM_Y) - 16} ${BASS_STRUM_Y})`}>
          <Pick color={pick} pickRef={pickRef} />
        </g>
      </svg>
      <div className="bline__decor">
        <Badges faces={badges} spots={BASS_SPOTS} w={BASS_W} h={BASS_H} onAir={onAir} />
      </div>
    </>
  );
}
