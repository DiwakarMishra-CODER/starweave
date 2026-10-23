// The realms' lights coming on in the opening: one after another, each
// stuttering as it catches, then holding (ForceGraph scales each realm's own
// glow by this). The room is kept crisp and calm otherwise — no pools, cones
// or flicker; soft layers stacked up read as blur.

// A small seeded random, so the stutter is the same on every visit.
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// How far a lamp is on, 0..1, while the lamps come on one after another
// (`lamps` 0..1 across all of them, `i` this lamp's turn of `count`).
const CATCH_SHARE = 0.9; // of one lamp's turn, spent catching
export function lampOn(lamps: number, i: number, count: number, now: number, steady: boolean): number {
  if (lamps >= 1) return 1;
  const p = (lamps * count - i) / CATCH_SHARE;
  if (p <= 0) return 0;
  if (p >= 1 || steady) return 1;
  // A stutter that settles: dark more often early on, then just holds.
  const r = seeded(Math.floor(now / 60) * 31 + i * 977)();
  return r < 0.55 - p * 0.5 ? 0.12 : Math.sqrt(p);
}
