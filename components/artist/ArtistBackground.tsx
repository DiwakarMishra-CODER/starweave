'use client';

import { useEffect, useRef } from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function clamp(v: number): number {
  return Math.round(Math.min(255, Math.max(0, v)));
}

// Derive three harmonious aurora tones from the layer color.
function auroraColors(r: number, g: number, b: number): Array<[number, number, number]> {
  return [
    [r, g, b],
    [clamp(r * 0.5 + 70), clamp(g * 0.22), clamp(b * 1.45)],
    [clamp(r * 0.18), clamp(g * 0.7 + 45), clamp(b * 0.5 + 130)],
  ];
}

// ─── blob descriptors ────────────────────────────────────────────────────────
// bx/by = base position [0..1], rx/ry = drift amplitude, f = angular frequency
// (rad/ms → period = 2π/f ms), ph = phase offset, rs = radius scale vs min(W,H),
// ci = color index, a = peak alpha.
//
// Target periods: 9–20 s so drift is clearly visible within 2–3 s of page load.
// rx/ry scaled so blobs visibly cross 15–25 % of the viewport per half-cycle.

const BLOBS = [
  { bx: 0.73, by: 0.06, rx: 0.22, ry: 0.16, f: 5.5e-4, ph: 0.00, rs: 0.72, ci: 0, a: 0.46 },
  { bx: 0.10, by: 0.86, rx: 0.18, ry: 0.14, f: 4.2e-4, ph: 2.10, rs: 0.62, ci: 1, a: 0.38 },
  { bx: 0.88, by: 0.56, rx: 0.15, ry: 0.20, f: 6.8e-4, ph: 4.70, rs: 0.54, ci: 2, a: 0.32 },
  { bx: 0.42, by: 0.24, rx: 0.19, ry: 0.13, f: 4.8e-4, ph: 1.30, rs: 0.65, ci: 0, a: 0.27 },
  { bx: 0.23, by: 0.53, rx: 0.15, ry: 0.18, f: 7.2e-4, ph: 3.80, rs: 0.57, ci: 1, a: 0.25 },
  { bx: 0.63, by: 0.81, rx: 0.14, ry: 0.15, f: 3.5e-4, ph: 5.50, rs: 0.49, ci: 2, a: 0.22 },
] as const;

// ─── component ───────────────────────────────────────────────────────────────

export default function ArtistBackground({ layerColor, boost = 1 }: { layerColor: string; boost?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [lr, lg, lb] = hexToRgb(layerColor);
    const C = auroraColors(lr, lg, lb);

    // ── size ──
    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    // ── particles (normalized 0–1 coords) ──
    // dx/dy are per-frame deltas; at 60 fps dx=3e-4 → ~35 px/s on a 1920px screen.
    const pts = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),                       // depth: size/brightness/parallax
      dx: (Math.random() - 0.5) * 3.0e-4,
      dy: (Math.random() - 0.5) * 1.8e-4,
    }));

    // ── grain sub-canvas ──
    const gc = document.createElement('canvas');
    gc.width = gc.height = 256;
    const gx = gc.getContext('2d')!;
    let gTick = 0;

    function refreshGrain() {
      const id = gx.createImageData(256, 256);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = (Math.random() * 22 + 3) | 0;
      }
      gx.putImageData(id, 0, 0);
    }
    refreshGrain();

    let raf = 0;

    function draw(t: number) {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);

      // ── 1. Breathing pulse — the "heartbeat" of the layer color ──────────
      // Period ≈ 7 s (2π / 9e-4 ≈ 6980 ms).  Alpha swings 0.08 → 0.42.
      const breathRaw = 0.08 + 0.34 * (0.5 + 0.5 * Math.sin(t * 9e-4));
      const breath = Math.min(breathRaw * boost, 0.92);
      const bpR = Math.min(W, H) * 0.98;
      const bp = ctx!.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, bpR);
      bp.addColorStop(0,   `rgba(${lr},${lg},${lb},${breath.toFixed(3)})`);
      bp.addColorStop(0.45,`rgba(${lr},${lg},${lb},${(breath * 0.40).toFixed(3)})`);
      bp.addColorStop(1,   'rgba(0,0,0,0)');
      ctx!.globalCompositeOperation = 'screen';
      ctx!.fillStyle = bp;
      ctx!.fillRect(0, 0, W, H);

      // ── 2. Aurora / plasma blobs ──────────────────────────────────────────
      for (const b of BLOBS) {
        const x = (b.bx + Math.sin(t * b.f + b.ph)          * b.rx) * W;
        const y = (b.by + Math.cos(t * b.f * 0.73 + b.ph * 1.3) * b.ry) * H;
        // Radius pulses ±17 % over ~3 s (2π / 2.2e-3 ≈ 2860 ms)
        const r = Math.min(W, H) * b.rs * (1 + Math.sin(t * 2.2e-3 + b.ph) * 0.17);

        const [cr, cg, cb] = C[b.ci];
        const ba = Math.min(b.a * boost, 0.92);
        const g = ctx!.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,    `rgba(${cr},${cg},${cb},${ba.toFixed(3)})`);
        g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${(ba * 0.38).toFixed(3)})`);
        g.addColorStop(1,    'rgba(0,0,0,0)');
        ctx!.globalCompositeOperation = 'screen';
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // ── 3. Star / particle field with scroll parallax ─────────────────────
      ctx!.globalCompositeOperation = 'source-over';
      const sy = window.scrollY;
      for (const p of pts) {
        p.x = ((p.x + p.dx) + 1) % 1;
        p.y = ((p.y + p.dy) + 1) % 1;

        const px = p.x * W;
        // Parallax: deeper stars (high z) move less with scroll
        const parallax = (sy * (1 - p.z) * 0.12) / H;
        const py = (((p.y - parallax) % 1) + 1) % 1 * H;

        const size  = 0.4 + p.z * 1.5;
        const alpha = 0.12 + p.z * 0.58;

        ctx!.beginPath();
        ctx!.arc(px, py, size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(235,222,255,${alpha.toFixed(2)})`;
        ctx!.fill();
      }

      // ── 4. Animated grain / shimmer ───────────────────────────────────────
      // Refresh the noise texture every 4 frames (≈15 fps grain = nice film feel)
      if (++gTick % 4 === 0) refreshGrain();

      ctx!.globalCompositeOperation = 'screen';
      ctx!.globalAlpha = 0.06;
      const pat = ctx!.createPattern(gc, 'repeat');
      if (pat) { ctx!.fillStyle = pat; ctx!.fillRect(0, 0, W, H); }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    if (reduced) {
      draw(performance.now());   // one static frame
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [layerColor, boost]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
