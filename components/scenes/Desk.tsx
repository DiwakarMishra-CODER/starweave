import { sizedImageUrl } from '@/lib/image-url';

// The photo editor's desk the lightbox (and each scene's light table) sits
// on: a worn walnut top (the page's background, globals) and the things left
// round the glass -- a loupe, two grease pencils, a 35mm cassette with its
// leader out, a roll of masking tape, and a couple of stray prints of the
// bands tucked under the glass's edge. In the margins only, under the glass,
// so nothing covers it; decoration, hidden from screen readers. No text on
// anything, so the few things lying at an angle never tilt a word.

export interface StrayPrint {
  imageUrl: string;
}

function Loupe() {
  return (
    <svg viewBox="0 0 100 100" className="pdesk__svg" aria-hidden focusable="false">
      <circle cx="50" cy="54" r="44" fill="#000" opacity="0.35" />
      <circle cx="50" cy="50" r="44" fill="#141215" />
      <circle cx="50" cy="50" r="38" fill="#2b2a2e" />
      <circle cx="50" cy="50" r="33" fill="rgba(210, 225, 230, 0.16)" stroke="#9aa3a6" strokeWidth="2" />
      <path d="M28 38A26 26 0 0 1 56 22" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
      <path d="M70 66A24 24 0 0 1 58 74" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GreasePencil({ wrap }: { wrap: string }) {
  return (
    <svg viewBox="0 0 200 20" className="pdesk__svg" aria-hidden focusable="false">
      <rect x="4" y="6" width="190" height="12" rx="6" fill="#000" opacity="0.3" />
      <path d="M2 10L22 3H186Q194 3 194 10Q194 17 186 17H22Z" fill={wrap} />
      <path d="M2 10L22 3V17Z" fill="#1c1724" />
      <path d="M22 3V17" stroke="#000" strokeOpacity="0.25" />
      {[52, 92, 132, 168].map(x => <path key={x} d={`M${x} 3L${x + 8} 17`} stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />)}
      <path d="M26 6H186" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FilmCassette() {
  return (
    <svg viewBox="0 0 140 70" className="pdesk__svg" aria-hidden focusable="false">
      <ellipse cx="44" cy="64" rx="40" ry="5" fill="#000" opacity="0.35" />
      {/* The leader, out of the cassette's lip. */}
      <path d="M70 26H132Q138 26 138 32V50Q138 56 132 56H70Z" fill="#b8692c" opacity="0.92" />
      {[80, 92, 104, 116, 128].map(x => (
        <g key={x}>
          <rect x={x} y="29" width="6" height="4" rx="1" fill="#2a1a10" />
          <rect x={x} y="49" width="6" height="4" rx="1" fill="#2a1a10" />
        </g>
      ))}
      <rect x="8" y="12" width="66" height="50" rx="10" fill="#d9d4c8" />
      <rect x="8" y="12" width="66" height="50" rx="10" fill="url(#dk-tin)" />
      <rect x="14" y="20" width="54" height="34" rx="4" fill="#e8a33a" />
      <rect x="14" y="20" width="54" height="10" fill="#c8322a" />
      <rect x="34" y="2" width="14" height="12" rx="3" fill="#8f8a80" />
      <defs>
        <linearGradient id="dk-tin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.25" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TapeRoll() {
  return (
    <svg viewBox="0 0 100 100" className="pdesk__svg" aria-hidden focusable="false">
      <circle cx="51" cy="54" r="44" fill="#000" opacity="0.3" />
      <circle cx="50" cy="50" r="44" fill="#e6d9b6" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#c9b98f" strokeWidth="3" />
      {[40, 36, 32].map(r => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#cdbd92" strokeOpacity="0.6" />)}
      <circle cx="50" cy="50" r="27" fill="#a8885a" />
      <circle cx="50" cy="50" r="23" fill="#2a1c13" />
      <path d="M94 50Q96 70 82 78L74 68Q84 62 84 50Z" fill="#e6d9b6" opacity="0.9" />
    </svg>
  );
}

/** The desk's clutter round the glass. `at` is where the glass is: the
 *  /scenes lightbox (whose width the page sets as --sheet-w) or a scene's
 *  light table (centred on the page). */
export default function Desk({ prints, at }: { prints: StrayPrint[]; at: 'lightbox' | 'table' }) {
  return (
    <div className={`pdesk pdesk--${at}`} aria-hidden>
      {prints.slice(0, 2).map((p, i) => (
        <span key={p.imageUrl} className={`pdesk__thing pdesk__print pdesk__print--${i}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sizedImageUrl(p.imageUrl, 250)} alt="" loading="lazy" />
        </span>
      ))}
      <span className="pdesk__thing pdesk__cassette"><FilmCassette /></span>
      <span className="pdesk__thing pdesk__loupe"><Loupe /></span>
      <span className="pdesk__thing pdesk__pencil pdesk__pencil--red"><GreasePencil wrap="#c8322a" /></span>
      <span className="pdesk__thing pdesk__pencil pdesk__pencil--yellow"><GreasePencil wrap="#e8b23a" /></span>
      <span className="pdesk__thing pdesk__tape"><TapeRoll /></span>
    </div>
  );
}
