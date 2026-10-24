'use client';

import { useCallback, useEffect, useRef } from 'react';
import { sizedImageUrl } from '@/lib/image-url';
import { moveWithMusic } from '@/lib/music-motion';

// The artist page's background: their own photo as a giant risograph print
// on the page's dark, fixed behind everything so the paper sheets scroll
// over it -- a screen of dots in their colour whose area follows the
// photo's light. Crisp dots, no blur. At rest it's printed dark on dark,
// like ink on black paper, so the paper stays the brightest thing on the
// page (a bright, even dot pattern strains the eyes). When music plays it
// glows with the song and pulses on its beats (lib/music-motion).
//
// Cheap on purpose: the print is drawn twice, once, when the photo arrives
// (and again only on a resize) -- at rest, and lit (bigger dots, a brighter
// ink) on a second canvas over it. The music only changes the lit print's
// opacity, which the GPU does; nothing is redrawn.
//
// Drawn straight from the photo's pixels (both photo hosts send CORS
// headers; the local photos are same-origin). If the photo can't be read,
// nothing is drawn and the page keeps its plain dark.

interface Props {
  imageUrl: string | null;
  /** The artist's colour as an ink at rest, and lit by the music (risoInk). */
  ink: string;
  lit: string;
}

interface Tone {
  w: number;
  h: number;
  /** Brightness 0..1 per sample, levelled so every photo has a full range. */
  lum: Float32Array;
}

const TONE_W = 128; // samples across the photo
const CELL_PX = 16; // dot spacing on a desktop
const CELL_PX_NARROW = 12; // and on a phone
const FACE_Y = 0.3; // where the photo sits vertically when cropped (0 top, 1 bottom)
const DOT = 0.42; // a dot's largest radius at rest, as a share of the spacing
const LIT_GROW = 1.8; // the lit print's dots, against the resting ones
const TAU = Math.PI * 2;

function readTone(img: HTMLImageElement): Tone | null {
  const w = TONE_W;
  const h = Math.max(1, Math.round((TONE_W * img.naturalHeight) / img.naturalWidth));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null; // pixels not readable
  }
  const lum = new Float32Array(w * h);
  for (let i = 0; i < lum.length; i++) {
    lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
  }
  // Auto-levels: stretch the 2nd to 98th percentile across the full range.
  const sorted = Float32Array.from(lum).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)];
  const hi = sorted[Math.floor(sorted.length * 0.98)];
  const span = Math.max(0.05, hi - lo);
  for (let i = 0; i < lum.length; i++) lum[i] = Math.min(1, Math.max(0, (lum[i] - lo) / span));
  return { w, h, lum };
}

/** One print: a screen of dots at 15° in `color`, each dot's area following
 *  the light under it, `grow` times the resting size. */
function paint(canvas: HTMLCanvasElement, tone: Tone, color: string, grow: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // The photo cover-fitted to the screen, cropped toward its top.
  const scale = Math.max(W / tone.w, H / tone.h);
  const x0 = (W - tone.w * scale) / 2;
  const y0 = (H - tone.h * scale) * FACE_Y;
  const light = (x: number, y: number) => {
    const u = Math.min(tone.w - 1.001, Math.max(0, (x - x0) / scale - 0.5));
    const v = Math.min(tone.h - 1.001, Math.max(0, (y - y0) / scale - 0.5));
    const i = Math.floor(u);
    const j = Math.floor(v);
    const fu = u - i;
    const fv = v - j;
    const at = (a: number, b: number) => tone.lum[b * tone.w + a];
    return (at(i, j) * (1 - fu) + at(i + 1, j) * fu) * (1 - fv) + (at(i, j + 1) * (1 - fu) + at(i + 1, j + 1) * fu) * fv;
  };

  const cell = W < 700 ? CELL_PX_NARROW : CELL_PX;
  const maxR = cell * DOT * grow;
  const path = new Path2D();
  const cos = Math.cos((15 * Math.PI) / 180);
  const sin = Math.sin((15 * Math.PI) / 180);
  const n = Math.ceil(Math.hypot(W, H) / cell / 2) + 1;
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const x = W / 2 + (i * cos - j * sin) * cell;
      const y = H / 2 + (i * sin + j * cos) * cell;
      if (x < -cell || x > W + cell || y < -cell || y > H + cell) continue;
      const r = maxR * Math.sqrt(light(x, y));
      if (r < 0.45) continue;
      path.moveTo(x + r, y);
      path.arc(x, y, r, 0, TAU);
    }
  }
  ctx.fillStyle = color;
  ctx.fill(path);
}

export default function RisoPrint({ imageUrl, ink, lit }: Props) {
  const restRef = useRef<HTMLCanvasElement>(null);
  const litRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // What's printed now, so a resize can print it again.
  const printed = useRef<{ tone: Tone; ink: string; lit: string } | null>(null);

  const print = useCallback(() => {
    const p = printed.current;
    if (!p) return;
    if (restRef.current) paint(restRef.current, p.tone, p.ink, 1);
    if (litRef.current) paint(litRef.current, p.tone, p.lit, LIT_GROW);
  }, []);

  // Their photo, read and printed. The old print stays up until the new one
  // is ready, so going from artist to artist never flashes blank.
  useEffect(() => {
    const rest = restRef.current;
    if (!rest) return;
    if (!imageUrl) {
      printed.current = null;
      rest.classList.remove('riso--ready');
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      const tone = readTone(img);
      if (!tone) return;
      printed.current = { tone, ink, lit };
      print();
      rest.classList.add('riso--ready');
    };
    img.src = sizedImageUrl(imageUrl, 500);
    return () => { cancelled = true; };
  }, [imageUrl, ink, lit, print]);

  // Print again at the new size, once a resize has settled.
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(print, 150);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.clearTimeout(timer); };
  }, [print]);

  // The print listens (lib/music-motion): --energy and --beat on its frame;
  // CSS turns them into the lit print's glow and its pulse on beats.
  useEffect(() => {
    const el = frameRef.current;
    return el ? moveWithMusic(el) : undefined;
  }, []);

  return (
    <div ref={frameRef} className="riso-frame" aria-hidden>
      <canvas ref={restRef} className="riso" />
      <canvas ref={litRef} className="riso riso--lit" />
    </div>
  );
}
