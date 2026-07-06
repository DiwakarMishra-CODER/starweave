'use client';

import { useEffect, useRef } from 'react';

// Deterministic PRNG — same seed → same star positions on every render
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wrap = canvas.parentElement;
    if (!wrap) return;

    // Size the canvas to the wrapper (which is inset: -3% for seamless drift)
    const w = wrap.offsetWidth || window.innerWidth;
    const h = wrap.offsetHeight || window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rng = mulberry32(0xa8f23c91);

    // Small point stars — more of them, brighter
    for (let i = 0; i < 130; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const r = rng() * 1.1 + 0.25;
      const a = rng() * 0.3 + 0.08;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(237,234,247,${a.toFixed(3)})`;
      ctx.fill();
    }

    // Brighter pin-prick stars
    for (let i = 0; i < 22; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const r = rng() * 1.7 + 0.8;
      const a = rng() * 0.22 + 0.12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(237,234,247,${a.toFixed(3)})`;
      ctx.fill();
    }
  }, []);

  return (
    <div className="nebula-bg" aria-hidden="true">
      <div className="nebula-bg__blob nebula-bg__blob--0" />
      <div className="nebula-bg__blob nebula-bg__blob--1" />
      <div className="nebula-bg__blob nebula-bg__blob--2" />
      <div className="nebula-bg__blob nebula-bg__blob--3" />
      <div className="nebula-bg__stars-wrap">
        <canvas ref={canvasRef} className="nebula-bg__stars-canvas" />
      </div>
    </div>
  );
}
