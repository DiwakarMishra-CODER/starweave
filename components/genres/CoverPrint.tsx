'use client';

import { useEffect, useRef } from 'react';
import { sizedImageUrl } from '@/lib/image-url';

// The cover star, printed the way an indie paper would print them: a
// two-drum risograph on the cover's cream stock. The colour drum (the story
// family's colour) lays down the light and the mid-tones on one screen; the
// black drum lays the shadows on another, at a different angle and a hair
// off register. A third print -- the black with fatter dots -- sits on top
// at zero opacity and flashes on each beat of the count-in, so the photo
// pumps with the band. Drawn once when the photo arrives (and on a resize);
// the beats only change an opacity, which the GPU does.
//
// On the cover's dark-to-lit moment the drums print in turn, colour first,
// then black, like a sheet going through a riso twice.
//
// `colorOnly` prints just the colour drum, for a page that lays the sharp
// photo itself down as the black (the genre features: their print is far
// bigger than the cover's, and a black drum sampled from a small photo went
// soft at that size).

const TONE_W = 128; // samples across a photo, by default

export interface Tone {
  w: number;
  h: number;
  /** Brightness 0..1 per sample, levelled so every photo has a full range. */
  lum: Float32Array;
}

/** A photo's light, sampled and levelled. */
export function readTone(img: HTMLImageElement, samples = TONE_W): Tone | null {
  const w = samples;
  const h = Math.max(1, Math.round((samples * img.naturalHeight) / img.naturalWidth));
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

const CELL = 5.2; // dot spacing, CSS px: a fine screen, so the face reads
const FACE_Y = 0.3; // crop toward the top, where the faces are
const TAU = Math.PI * 2;

interface Drum {
  color: string;
  angle: number; // degrees
  /** How much ink a sample takes, 0..1, from its brightness. */
  coverage: (light: number) => number;
  grow?: number;
  shift?: [number, number]; // off register, px
}

function printDrum(canvas: HTMLCanvasElement, tone: Tone, drum: Drum) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  if (!W || !H) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

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

  const [dx, dy] = drum.shift ?? [0, 0];
  const maxR = CELL * 0.62 * (drum.grow ?? 1);
  const cos = Math.cos((drum.angle * Math.PI) / 180);
  const sin = Math.sin((drum.angle * Math.PI) / 180);
  const n = Math.ceil(Math.hypot(W, H) / CELL / 2) + 1;
  const path = new Path2D();
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const x = W / 2 + (i * cos - j * sin) * CELL + dx;
      const y = H / 2 + (i * sin + j * cos) * CELL + dy;
      if (x < -CELL || x > W + CELL || y < -CELL || y > H + CELL) continue;
      const r = maxR * Math.sqrt(drum.coverage(light(x - dx, y - dy)));
      if (r < 0.35) continue;
      path.moveTo(x + r, y);
      path.arc(x, y, r, 0, TAU);
    }
  }
  ctx.fillStyle = drum.color;
  ctx.fill(path);
}

export default function CoverPrint({ imageUrl, color, colorOnly = false, samples }: {
  imageUrl: string;
  color: string;
  colorOnly?: boolean;
  /** How finely to sample the photo (readTone's default suits the cover). */
  samples?: number;
}) {
  const colorRef = useRef<HTMLCanvasElement>(null);
  const blackRef = useRef<HTMLCanvasElement>(null);
  const beatRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    let tone: Tone | null = null;
    const print = () => {
      if (!tone) return;
      // The colour drum: everything but the brightest highlights.
      if (colorRef.current) printDrum(colorRef.current, tone, { color, angle: 75, coverage: l => Math.pow(1 - l, 0.85) * 0.85 });
      // The black drum: the shadows, a hair off register.
      const black = { color: '#1c1724', angle: 15, coverage: (l: number) => Math.pow(1 - l, 2.4), shift: [1.2, 0.8] as [number, number] };
      if (blackRef.current) printDrum(blackRef.current, tone, black);
      if (beatRef.current) printDrum(beatRef.current, tone, { ...black, grow: 1.4, coverage: (l: number) => Math.pow(1 - l, 1.2) });
      frameRef.current?.classList.add('gprint--ready');
    };
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      tone = readTone(img, samples);
      print();
    };
    img.src = sizedImageUrl(imageUrl, 500);
    const ro = new ResizeObserver(() => print());
    if (frameRef.current) ro.observe(frameRef.current);
    return () => { cancelled = true; ro.disconnect(); };
  }, [imageUrl, color, samples]);

  return (
    <span ref={frameRef} className="gprint" aria-hidden>
      <canvas ref={colorRef} className="gprint__drum gprint__drum--color" />
      {!colorOnly && <canvas ref={blackRef} className="gprint__drum gprint__drum--black" />}
      {!colorOnly && <canvas ref={beatRef} className="gprint__drum gprint__drum--beat" />}
    </span>
  );
}
