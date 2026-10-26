import { useId } from 'react';
import { blurPath } from '@/lib/strings';
import type { Face } from '@/lib/backline';
import { Stickers, type Spot } from './Decor';
import { Camo, Pick, Strap } from './Gear';

// An offset electric guitar -- the shape indie and shoegaze took up -- worn
// on a camo strap by an unseen player, drawn to a real one's proportions (one
// unit a millimetre): a cream body, a tortoiseshell pickguard, two wide flat
// pickups, a floating vibrato, a maple neck with a rosewood board. No
// maker's name. Stickers of the bands the artist shaped are slapped on it,
// a ribbon in their colour is tied to the strap, and a pick strums it.

export const GUITAR_W = 380;
export const GUITAR_H = 1000;
/** Where the player holds it: the body's middle, which it turns about. */
export const GUITAR_PIVOT = [190, 780] as const;
const NUT = 120;
const BRIDGE = 770;
const SCALE = BRIDGE - NUT;
const BOARD_END = 585;
/** Where the pick strums: between the pickups. */
export const GUITAR_STRUM_Y = 676;

export const GUITAR_STRINGS = Array.from({ length: 6 }, (_, i) => ({
  nut: 171.5 + i * 7.4,
  saddle: 164 + i * 10.4,
  post: ([[156, 18], [155, 36], [159, 54], [166, 72], [176, 88], [186, 102]] as const)[i],
  width: [3, 2.6, 2.2, 1.7, 1.3, 1][i],
}));

export const GUITAR_SPOTS: Spot[] = [
  { x: 80, y: 880, r: 30, tilt: 12 },
  { x: 300, y: 905, r: 30, tilt: -7 },
  { x: 96, y: 762, r: 28, tilt: -9 },
  { x: 300, y: 700, r: 28, tilt: 8 },
  { x: 150, y: 950, r: 28, tilt: 4 },
  { x: 232, y: 945, r: 28, tilt: -14 },
  { x: 96, y: 640, r: 26, tilt: 10 },
  { x: 318, y: 620, r: 24, tilt: -6 },
  { x: 60, y: 700, r: 22, tilt: 5 },
  { x: 110, y: 830, r: 22, tilt: -12 },
];

const BODY = 'M162 600C156 560 132 512 108 512C82 512 70 540 66 580C62 620 36 640 34 690C32 730 62 750 58 790C54 830 14 850 14 900C14 970 90 998 190 998C300 998 366 960 366 880C366 820 330 800 330 750C330 700 356 690 350 640C344 590 320 566 300 566C272 566 250 600 218 612Z';
const GUARD = 'M150 600C128 568 100 560 92 590C84 620 90 660 82 700C76 740 92 776 120 800C140 818 150 850 176 858L214 858C236 850 250 818 276 800C304 780 318 744 312 704C306 664 318 628 300 606C284 588 254 596 230 612L150 612Z';
const HEAD = 'M169 120L169 112C166 90 150 74 142 50C136 30 140 8 162 4C184 0 222 0 228 12C234 24 222 34 216 52C210 74 212 100 211 112L211 120Z';
// A tortoiseshell's mottle: amber, dark and red-brown flecks, layered.
const BLOTCHES: [number, number, number, number, string, number][] = [
  [160, 614, 13, 5, '#9c5024', 0.55],
  [208, 676, 6, 9, '#1c0a03', 0.55],
  [95, 696, 6, 5, '#6e3014', 0.6],
  [183, 810, 7, 6, '#c27a3c', 0.35],
  [229, 845, 13, 8, '#9c5024', 0.55],
  [309, 584, 16, 7, '#1c0a03', 0.55],
  [119, 604, 9, 11, '#6e3014', 0.6],
  [127, 739, 13, 7, '#c27a3c', 0.35],
  [211, 588, 6, 6, '#9c5024', 0.55],
  [241, 694, 9, 9, '#1c0a03', 0.55],
  [189, 657, 15, 10, '#6e3014', 0.6],
  [142, 737, 12, 12, '#c27a3c', 0.35],
  [252, 654, 18, 5, '#9c5024', 0.55],
  [181, 790, 7, 8, '#1c0a03', 0.55],
  [95, 764, 15, 9, '#6e3014', 0.6],
  [286, 661, 14, 9, '#c27a3c', 0.35],
  [218, 702, 16, 13, '#9c5024', 0.55],
  [194, 763, 6, 10, '#1c0a03', 0.55],
  [234, 858, 16, 7, '#6e3014', 0.6],
  [174, 764, 5, 8, '#c27a3c', 0.35],
  [124, 604, 6, 11, '#9c5024', 0.55],
  [115, 642, 10, 12, '#1c0a03', 0.55],
  [104, 700, 12, 12, '#6e3014', 0.6],
  [273, 821, 9, 8, '#c27a3c', 0.35],
  [168, 826, 17, 5, '#9c5024', 0.55],
  [126, 637, 8, 8, '#1c0a03', 0.55],
  [220, 646, 5, 8, '#6e3014', 0.6],
  [170, 734, 17, 10, '#c27a3c', 0.35],
  [204, 749, 14, 4, '#9c5024', 0.55],
  [291, 796, 16, 11, '#1c0a03', 0.55],
  [175, 686, 6, 10, '#6e3014', 0.6],
  [100, 590, 8, 5, '#c27a3c', 0.35],
  [164, 585, 5, 5, '#9c5024', 0.55],
  [109, 675, 5, 12, '#1c0a03', 0.55],
  [226, 613, 8, 7, '#6e3014', 0.6],
  [169, 606, 16, 13, '#c27a3c', 0.35],
  [192, 710, 6, 5, '#9c5024', 0.55],
  [164, 647, 16, 5, '#1c0a03', 0.55],
  [91, 846, 12, 5, '#6e3014', 0.6],
  [210, 578, 12, 13, '#c27a3c', 0.35],
  [283, 772, 8, 7, '#9c5024', 0.55],
  [124, 794, 12, 11, '#1c0a03', 0.55],
  [161, 635, 16, 13, '#6e3014', 0.6],
  [280, 804, 16, 11, '#c27a3c', 0.35],
  [138, 720, 10, 4, '#9c5024', 0.55],
  [92, 651, 8, 10, '#1c0a03', 0.55],
];

const fretY = (n: number) => NUT + SCALE * (1 - 2 ** (-n / 12));
const boardX = (y: number) => {
  const t = (y - NUT) / (BOARD_END - NUT);
  return [169 - 8 * t, 211 + 8 * t] as const;
};

/** Its side nearest the page when it leans in: the tuner keys, the
 *  headstock's edge and the body's bass side (Room keeps these off the
 *  page's words). */
export const GUITAR_REACH = [[102, 18], [101, 36], [105, 54], [112, 72], [122, 88], [132, 102], [140, 8], [142, 50], [108, 512], [66, 580], [34, 690], [14, 900]] as const;

/** Where string `i` crosses height `y`. */
export const guitarStringX = (i: number, y: number) => {
  const s = GUITAR_STRINGS[i];
  return s.nut + ((s.saddle - s.nut) * (y - NUT)) / SCALE;
};

const STRAP = ['M300 566C320 450 400 260 560 -400', 'M190 998C270 1040 380 1010 460 930'];

export default function Guitar({ ribbon, stickers, onAir, blurRef, tailRef, pickRef }: {
  ribbon: string;
  stickers: Face[];
  onAir: string | null;
  blurRef: (i: number, el: SVGPathElement | null) => void;
  tailRef: (i: number, el: SVGGElement | null) => void;
  pickRef: (el: SVGGElement | null) => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const frets = Array.from({ length: 21 }, (_, i) => fretY(i + 1));
  const dots = [3, 5, 7, 9, 15, 17, 19, 21].map(n => (fretY(n - 1) + fretY(n)) / 2);
  const twelve = (fretY(11) + fretY(12)) / 2;
  return (
    <>
      <svg className="bline__svg" viewBox={`0 0 ${GUITAR_W} ${GUITAR_H}`} aria-hidden focusable="false">
        <defs>
          <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#7a5a2a" stopOpacity="0" />
            <stop offset="1" stopColor="#7a5a2a" stopOpacity="0.35" />
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
          <clipPath id={`${id}guard`}><path d={GUARD} /></clipPath>
          <Camo id={`${id}camo`} />
        </defs>

        <Strap paths={STRAP} camo={`${id}camo`} />

        <path d={HEAD} fill={`url(#${id}maple)`} stroke="#000" strokeOpacity="0.3" strokeWidth="1.5" />
        <rect x="167" y="112" width="46" height="480" rx="6" fill={`url(#${id}maple)`} />
        {GUITAR_STRINGS.map(s => {
          const edge = s.post[0] - 20;
          return (
            <g key={s.post[1]}>
              <path d={`M${edge - 20} ${s.post[1]}H${s.post[0]}`} stroke="#9a968f" strokeWidth="3" />
              <rect x={edge - 34} y={s.post[1] - 6} width="16" height="12" rx="4" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.35" />
              <circle cx={s.post[0]} cy={s.post[1]} r="5" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
            </g>
          );
        })}

        {/* The body: cream, aged a little at the edges, glossy. */}
        <path d={BODY} fill="#ece3cc" />
        <path d={BODY} fill={`url(#${id}gloss)`} />
        <path d={BODY} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" transform="translate(1.5 1.5)" />
        <path d={BODY} fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="2" />
        <path d={GUARD} fill="#4a1f0c" />
        <g clipPath={`url(#${id}guard)`}>
          {BLOTCHES.map(([x, y, rx, ry, c, o], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={c} opacity={o} transform={`rotate(${(i * 37) % 180} ${x} ${y})`} />)}
        </g>
        <path d={GUARD} fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="1.5" />

        <path d={`M169 ${NUT}H211L219 ${BOARD_END}Q190 ${BOARD_END + 8} 161 ${BOARD_END}Z`} fill="#3a2418" />
        {frets.map(y => {
          const [l, r] = boardX(y);
          return (
            <g key={y}>
              <path d={`M${l} ${y + 1.4}H${r}`} stroke="#000" strokeOpacity="0.45" strokeWidth="1.2" />
              <path d={`M${l} ${y}H${r}`} stroke="#ddd7cb" strokeWidth="2.2" />
            </g>
          );
        })}
        {dots.map(y => <circle key={y} cx="190" cy={y} r="4.2" fill="#efe7d6" />)}
        <circle cx="182" cy={twelve} r="4.2" fill="#efe7d6" />
        <circle cx="198" cy={twelve} r="4.2" fill="#efe7d6" />
        <rect x="168" y={NUT - 6} width="44" height="7" rx="1.5" fill="#efe6cf" />

        {/* Two wide flat pickups, the bridge, the floating vibrato, the knobs. */}
        {[640, 712].map(y => (
          <g key={y}>
            <rect x="148" y={y - 17} width="84" height="34" rx="5" fill="#efe9da" stroke="#000" strokeOpacity="0.35" />
            {GUITAR_STRINGS.map(s => {
              const t = (y - NUT) / SCALE;
              return <circle key={s.nut} cx={s.nut + (s.saddle - s.nut) * t} cy={y} r="2.4" fill="#b9b2a6" />;
            })}
          </g>
        ))}
        <rect x="156" y="760" width="68" height="20" rx="4" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
        {GUITAR_STRINGS.map(s => <rect key={s.saddle} x={s.saddle - 3.5} y="764" width="7" height="12" rx="1.5" fill="#d9d6cf" stroke="#000" strokeOpacity="0.3" />)}
        <path d="M150 826H236L230 880H156Z" fill={`url(#${id}chrome)`} stroke="#000" strokeOpacity="0.4" />
        <path d="M228 840C250 846 262 870 260 900" fill="none" stroke="#cfcac0" strokeWidth="4" strokeLinecap="round" />
        {[[300, 800], [316, 846]].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="14" fill="#efe9da" stroke="#000" strokeOpacity="0.4" />
            <circle cx={x} cy={y} r="9" fill="#e2dccd" />
          </g>
        ))}
        {[[300, 566], [190, 996]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="7" fill={`url(#${id}chrome)`} />)}

        {/* The strings, each with the blur a pluck leaves on it. */}
        {GUITAR_STRINGS.map((s, i) => {
          const len = Math.hypot(s.saddle - s.nut, BRIDGE - NUT);
          const angle = (Math.atan2(s.nut - s.saddle, BRIDGE - NUT) * 180) / Math.PI;
          return (
            <g key={i}>
              <path d={`M${s.post[0]} ${s.post[1]}L${s.nut} ${NUT}`} stroke="#c9c3b8" strokeWidth={s.width * 0.8} />
              <g transform={`translate(${s.nut} ${NUT}) rotate(${angle})`}>
                <path ref={el => blurRef(i, el)} className="bline__blur" d={blurPath(len, 38 - i * 3.2)} />
              </g>
              <path d={`M${s.nut} ${NUT}L${s.saddle} ${BRIDGE}`} stroke="#e4ded2" strokeWidth={s.width} />
              {i < 3 && <path d={`M${s.nut} ${NUT}L${s.saddle} ${BRIDGE}`} stroke="#5d564d" strokeOpacity="0.5" strokeWidth={s.width} strokeDasharray="1 1.2" />}
            </g>
          );
        })}

        {/* A ribbon tied to the strap, its tails hanging down. */}
        {[0, 1].map(i => (
          <g key={i} ref={el => tailRef(i, el)} className="bline__tail" style={{ transformOrigin: '318px 506px' }}>
            <path
              d={i === 0
                ? 'M314 506C318 548 306 594 316 640L330 638C322 594 332 548 326 504Z'
                : 'M320 508C336 546 334 588 350 626L362 618C346 582 344 542 330 506Z'}
              fill={ribbon}
              stroke="#000"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          </g>
        ))}
        <path d="M308 500C314 492 328 492 332 500C334 508 326 514 316 512C308 510 306 506 308 500Z" fill={ribbon} stroke="#000" strokeOpacity="0.3" />

        <g transform={`translate(${guitarStringX(0, GUITAR_STRUM_Y) - 14} ${GUITAR_STRUM_Y})`}>
          <Pick color={ribbon} pickRef={pickRef} />
        </g>
      </svg>
      <div className="bline__decor">
        <Stickers faces={stickers} spots={GUITAR_SPOTS} w={GUITAR_W} h={GUITAR_H} onAir={onAir} />
      </div>
    </>
  );
}
