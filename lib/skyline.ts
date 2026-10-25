// A night skyline for the /genres gatefold: the city along the top of the
// inside spread, and the one on the front of the sleeve. Pure and seeded,
// so the server and the browser draw exactly the same city.
//
// Buildings stand shoulder to shoulder along the bottom of a band, each
// with a grid of tiny windows, a few of them lit; some carry a water tower
// on the roof (the city is New York's, after Television). A `maxHeight` per
// x keeps the skyline low wherever words sit above it. Stars go only where
// the sky is open.

export interface Building {
  x: number;
  w: number;
  h: number;
  /** Lit windows, as top-left corners. */
  lit: { x: number; y: number }[];
  /** A water tower on the roof, centred at this x. */
  tower?: number;
}

export interface Skyline {
  buildings: Building[];
  stars: { x: number; y: number; r: number }[];
}

export const WINDOW = 2.5; // a window's size
const WINDOW_PITCH = 6;
const LIT_SHARE = 0.16;

/** mulberry32: small, fast, and the same everywhere for the same seed. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSkyline(
  width: number,
  height: number,
  { seed = 7, maxHeight = () => height, minHeight = 6, stars = 30 }: {
    seed?: number;
    maxHeight?: (x: number) => number;
    minHeight?: number;
    stars?: number;
  } = {},
): Skyline {
  const rnd = random(seed);
  const buildings: Building[] = [];
  let x = 0;
  while (x < width) {
    const w = Math.min(width - x, 14 + Math.floor(rnd() * 34));
    const cap = Math.min(maxHeight(x), maxHeight(x + w - 1), height);
    const h = Math.max(Math.min(minHeight, cap), Math.round(minHeight + rnd() * Math.max(0, cap - minHeight)));
    const lit: { x: number; y: number }[] = [];
    for (let wy = height - h + 4; wy + WINDOW <= height - 2; wy += WINDOW_PITCH) {
      for (let wx = x + 3; wx + WINDOW <= x + w - 3; wx += WINDOW_PITCH) {
        if (rnd() < LIT_SHARE) lit.push({ x: wx, y: wy });
      }
    }
    const tower = w >= 22 && h >= 18 && h + 9 <= cap && rnd() < 0.3 ? x + w * (0.3 + rnd() * 0.4) : undefined;
    buildings.push({ x, w, h, lit, tower });
    x += w + (rnd() < 0.25 ? 2 : 0);
  }
  const skyStars: Skyline['stars'] = [];
  for (let i = 0; i < stars * 4 && skyStars.length < stars; i++) {
    const sx = rnd() * width;
    const sy = 2 + rnd() * (height * 0.6);
    // Only in open sky: above whatever stands at that x, with room to spare.
    if (sy < height - maxHeight(sx) - 6) skyStars.push({ x: sx, y: sy, r: 0.5 + rnd() * 0.7 });
  }
  return { buildings, stars: skyStars };
}
