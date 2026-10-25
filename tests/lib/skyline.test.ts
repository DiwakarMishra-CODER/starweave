import { describe, it, expect } from 'vitest';
import { buildSkyline, WINDOW } from '@/lib/skyline';

describe('buildSkyline', () => {
  it('draws the same city for the same seed, on the server and in the browser', () => {
    expect(buildSkyline(800, 50, { seed: 7 })).toEqual(buildSkyline(800, 50, { seed: 7 }));
    expect(buildSkyline(800, 50, { seed: 7 })).not.toEqual(buildSkyline(800, 50, { seed: 8 }));
  });

  it('keeps every building, window and star inside its band, and low where asked', () => {
    const low = (x: number) => (x < 300 ? 10 : 42);
    const { buildings, stars } = buildSkyline(800, 50, { seed: 3, maxHeight: low, stars: 20 });
    expect(buildings[0].x).toBe(0);
    for (const b of buildings) {
      expect(b.x + b.w).toBeLessThanOrEqual(800);
      expect(b.h).toBeLessThanOrEqual(Math.min(low(b.x), low(b.x + b.w - 1)));
      for (const w of b.lit) {
        expect(w.x).toBeGreaterThanOrEqual(b.x);
        expect(w.x + WINDOW).toBeLessThanOrEqual(b.x + b.w);
        expect(w.y).toBeGreaterThanOrEqual(50 - b.h);
      }
    }
    for (const s of stars) expect(s.y).toBeLessThan(50 - low(s.x));
  });
});
