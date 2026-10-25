// Grease-pencil marks shared by the lightbox (/scenes) and each scene's page:
// the arrows between rooms, the circle round a frame, the photographer's star.

export interface Pt { x: number; y: number }

export const RED = '#cf3a26';  // grease pencil: who a band shaped
export const BLUE = '#3b5b9e'; // and who shaped it

// A pencil arrow between two frames, bowed upward, stopping short of both.
export function arrowPath(a: Pt, b: Pt): { d: string; head: string } {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const s = { x: a.x + ux * Math.min(22, len / 3), y: a.y + uy * Math.min(22, len / 3) };
  const e = { x: b.x - ux * Math.min(26, len / 3), y: b.y - uy * Math.min(26, len / 3) };
  let nx = -uy, ny = ux;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const bow = Math.min(70, len * 0.2);
  const m = { x: (s.x + e.x) / 2 + nx * bow, y: (s.y + e.y) / 2 + ny * bow };
  const tl = Math.hypot(e.x - m.x, e.y - m.y) || 1;
  const tx = (e.x - m.x) / tl, ty = (e.y - m.y) / tl;
  const head = [
    `${e.x.toFixed(1)},${e.y.toFixed(1)}`,
    `${(e.x - tx * 8 - ty * 4.5).toFixed(1)},${(e.y - ty * 8 + tx * 4.5).toFixed(1)}`,
    `${(e.x - tx * 8 + ty * 4.5).toFixed(1)},${(e.y - ty * 8 - tx * 4.5).toFixed(1)}`,
  ].join(' ');
  return { d: `M${s.x.toFixed(1)} ${s.y.toFixed(1)} Q${m.x.toFixed(1)} ${m.y.toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`, head };
}

// One stroke round a frame that overshoots where it started, like a hand
// with a grease pencil.
export function greaseLoop(w: number, h: number): string {
  const steps = 48;
  const pts: string[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = -2.3 + (k / steps) * (Math.PI * 2 + 0.6);
    const grow = 1 + 0.07 * (k / steps);
    pts.push(`${(w / 2 + Math.cos(t) * (w / 2) * grow).toFixed(1)} ${(h / 2 + Math.sin(t) * (h / 2) * grow).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

// A five-point star in one stroke, the way a photographer marks their pick.
export function starPath(size: number): string {
  const c = size / 2, R = size / 2 - 1, r = R * 0.45;
  const pts: string[] = [];
  for (let k = 0; k <= 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rad = k % 2 === 0 ? R : r;
    pts.push(`${(c + Math.cos(a) * rad).toFixed(1)} ${(c + Math.sin(a) * rad).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}
