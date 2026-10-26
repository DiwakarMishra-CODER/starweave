import { useId } from 'react';

// A compact cassette, drawn to its real proportions (100.4 x 63.8 mm, one
// unit a tenth of a millimetre): a smoked plastic shell with its screws and
// the raised head end at the bottom, a paper label written on in marker,
// and through the window the two hubs and the tape wound between them.
// `wound` is how much of the tape has run onto the right-hand reel, 0 to 1;
// `leader` shows the clear leader running between them, as at the very end.

const W = 1004;
const H = 638;
const HUB_Y = 312;
const HUB_X = [290, 714] as const;
const HUB_R = 58;
const CORE_R = 62; // where the tape starts winding
const FULL_R = 190; // a full reel
const WIN = { x0: 222, x1: 782, y0: 244, y1: 380 };
const ROLLERS = [[150, 600], [854, 600]] as const;
const SCREWS = [[46, 594], [958, 594], [502, 552]] as const;
const STRIPES = ['#e8c87a', '#f2a8c4', '#8891f2'];

/** The radius of each reel's tape pack: the tape's area is conserved. */
function packs(wound: number): [number, number] {
  const spare = FULL_R ** 2 - CORE_R ** 2;
  return [Math.sqrt(CORE_R ** 2 + (1 - wound) * spare), Math.sqrt(CORE_R ** 2 + wound * spare)];
}

/** Where tape leaving a reel of radius r touches it, on its outer side,
 *  on its way down to the roller at p. */
function tangent(cx: number, r: number, p: readonly [number, number], outer: -1 | 1): [number, number] {
  const dx = p[0] - cx;
  const dy = p[1] - HUB_Y;
  const d = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx) + outer * Math.acos(Math.min(1, r / d));
  return [cx + r * Math.cos(a), HUB_Y + r * Math.sin(a)];
}

/** The window's rounded outline, grown by `o` (the printed frame round it). */
function stadium(o = 0) {
  const r = (WIN.y1 - WIN.y0) / 2 + o;
  const [x0, x1, y0, y1] = [WIN.x0 - o, WIN.x1 + o, WIN.y0 - o, WIN.y1 + o];
  return `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
}
const windowPath = stadium();
const shellPath = `M34 0H${W - 34}Q${W} 0 ${W} 34V${H - 20}Q${W} ${H} ${W - 20} ${H}H20Q0 ${H} 0 ${H - 20}V34Q0 0 34 0Z`;
const labelPath = 'M78 28H926Q944 28 944 46V434Q944 452 926 452H78Q60 452 60 434V46Q60 28 78 28Z';
const HEAD_END = 'M196 520H808L852 638H152Z';

export default function Cassette({ side, to, title, wound = 0, leader = false }: {
  side: 'A' | 'B';
  to: string;
  title: string;
  wound?: number;
  leader?: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [rl, rr] = packs(wound);
  const tl = tangent(HUB_X[0], rl, ROLLERS[0], 1);
  const tr = tangent(HUB_X[1], rr, ROLLERS[1], -1);
  const tapeD = `M${tl[0].toFixed(1)} ${tl[1].toFixed(1)}L${ROLLERS[0][0] - 14} ${ROLLERS[0][1]}`
    + `M${ROLLERS[0][0]} ${ROLLERS[0][1] + 14}H${ROLLERS[1][0]}`
    + `M${ROLLERS[1][0] + 14} ${ROLLERS[1][1]}L${tr[0].toFixed(1)} ${tr[1].toFixed(1)}`;
  const tapeInk = leader ? 'rgba(239, 227, 203, 0.42)' : '#4a3326';

  return (
    <svg className="cass" viewBox={`0 0 ${W} ${H}`} aria-hidden focusable="false">
      <defs>
        <radialGradient id={`${id}p`}>
          <stop offset="0" stopColor="#2a1d16" />
          <stop offset="0.82" stopColor="#4a3428" />
          <stop offset="0.93" stopColor="#6a4c3a" />
          <stop offset="1" stopColor="#3b2a20" />
        </radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3340" />
          <stop offset="0.45" stopColor="#221d27" />
          <stop offset="1" stopColor="#17131b" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.78" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}w`}><path d={windowPath} /></clipPath>
      </defs>

      {/* The shell's back, and inside it the tape. */}
      <path d={shellPath} fill="#120f15" />
      <g className="cass__inside">
        <path d={tapeD} fill="none" stroke={tapeInk} strokeWidth="5" />
        {ROLLERS.map(([x, y]) => <circle key={x} cx={x} cy={y} r="14" fill="#cfc5b3" />)}
        {HUB_X.map((x, i) => {
          const r = i === 0 ? rl : rr;
          return r > CORE_R + 1 ? <circle key={x} cx={x} cy={HUB_Y} r={r} fill={`url(#${id}p)`} /> : null;
        })}
        {HUB_X.map(x => (
          <g key={x} className="cass__hub">
            <circle cx={x} cy={HUB_Y} r={HUB_R} fill="#e9dfcb" />
            <circle cx={x} cy={HUB_Y} r={HUB_R - 7} fill="none" stroke="#cbbfa8" strokeWidth="2" />
            <circle cx={x} cy={HUB_Y} r="38" fill="#0e0b11" />
            {[0, 60, 120, 180, 240, 300].map(a => (
              <rect key={a} x={x - 5} y={HUB_Y - 40} width="10" height="13" rx="2" fill="#e9dfcb" transform={`rotate(${a} ${x} ${HUB_Y})`} />
            ))}
          </g>
        ))}
      </g>

      {/* The shell's front: smoked plastic, clear through the window. */}
      <path d={shellPath + windowPath} fillRule="evenodd" fill={`url(#${id}s)`} fillOpacity="0.8" />
      <path d={shellPath + windowPath} fillRule="evenodd" fill={`url(#${id}g)`} />
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="26" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="2" />
      <path d={shellPath} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="3" />

      {/* The head end: the raised part at the bottom, its openings showing the tape. */}
      <path d={HEAD_END} fill="#1d1922" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />
      <g fill="#07060a">
        <circle cx="262" cy="584" r="15" />
        <circle cx="742" cy="584" r="15" />
        <rect x="318" y="600" width="50" height="40" rx="4" />
        <rect x="636" y="600" width="50" height="40" rx="4" />
        <rect x="446" y="586" width="112" height="54" rx="6" />
      </g>
      <g stroke={tapeInk} strokeWidth="5">
        <path d="M318 614H368M636 614H686M446 614H558" />
      </g>
      <rect x="480" y="594" width="44" height="14" rx="3" fill="#bdb3a2" />
      {SCREWS.map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="15" fill="#2c2731" stroke="#fff" strokeOpacity="0.16" strokeWidth="2" />
          <path d={`M${x - 8} ${y}H${x + 8}M${x} ${y - 8}V${y + 8}`} stroke="#0b090d" strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}

      {/* The label, stuck on the outside, with the window cut out of it. */}
      <path d={labelPath + windowPath} fillRule="evenodd" fill="#efe6d1" stroke="#000" strokeOpacity="0.3" strokeWidth="2" />
      <g stroke="#1c1724" strokeOpacity="0.28" strokeWidth="2">
        <path d="M96 138H908M96 214H908" />
      </g>
      <text x="104" y="126" className="cass__hand" fontSize="76">{to}</text>
      <text x="108" y="204" className="cass__hand cass__hand--red" fontSize="38">{title}</text>
      <path d={stadium(9)} fill="none" stroke="#1c1724" strokeWidth="4" />
      <rect x="96" y="268" width="92" height="88" rx="8" fill="none" stroke="#1c1724" strokeWidth="4" />
      <text x="142" y="341" className="cass__side" fontSize="74" textAnchor="middle">{side}</text>
      <text x="866" y="300" className="cass__print" fontSize="25" textAnchor="middle">STARWEAVE</text>
      <text x="866" y="326" className="cass__mono" fontSize="13" textAnchor="middle">TYPE I</text>
      <text x="866" y="346" className="cass__mono" fontSize="13" textAnchor="middle">NORMAL</text>
      <g stroke="#1c1724" strokeOpacity="0.6" strokeWidth="2">
        {Array.from({ length: 9 }, (_, k) => {
          const x = 412 + k * 22.5;
          return <path key={k} d={`M${x} 392V${k % 4 === 0 ? 404 : 399}`} />;
        })}
      </g>
      {STRIPES.map((c, i) => <rect key={c} x="60" y={414 + i * 12} width={W - 120} height="8" fill={c} />)}

      {/* The window's clear plastic catches the light. */}
      <g clipPath={`url(#${id}w)`}>
        <path d={`M${WIN.x0 + 120} ${WIN.y0}L${WIN.x0 + 190} ${WIN.y0}L${WIN.x0 + 110} ${WIN.y1}L${WIN.x0 + 40} ${WIN.y1}Z`} fill="#fff" fillOpacity="0.07" />
        <path d={`M${WIN.x1 - 150} ${WIN.y0}L${WIN.x1 - 128} ${WIN.y0}L${WIN.x1 - 208} ${WIN.y1}L${WIN.x1 - 230} ${WIN.y1}Z`} fill="#fff" fillOpacity="0.05" />
      </g>
    </svg>
  );
}
