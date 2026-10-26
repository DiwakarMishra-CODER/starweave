import { describe, it, expect } from 'vitest';
import { BANDS } from '@/lib/song-notes';
import { blurPath, stringOf, stringState, strumOrder } from '@/lib/strings';

const FRAME = 1 / 60;

describe('the strings', () => {
  it('swells into a pluck over a few frames, never in one jump', () => {
    const st = stringState({ decay: 0.9 });
    st.pluck(1);
    st.step(FRAME, 0);
    expect(st.blur()).toBeGreaterThan(0);
    expect(st.blur()).toBeLessThan(0.6);
    for (let f = 0; f < 6; f++) st.step(FRAME, 0);
    expect(st.blur()).toBeGreaterThan(0.6);
  });

  it('dies away to rest, the low strings ringing longer', () => {
    const low = stringState({ decay: 0.9 });
    const high = stringState({ decay: 0.35 });
    low.pluck(1);
    high.pluck(1);
    for (let f = 0; f < 45; f++) { low.step(FRAME, 0); high.step(FRAME, 0); }
    expect(low.blur()).toBeGreaterThan(high.blur());
    for (let f = 0; f < 600; f++) { low.step(FRAME, 0); high.step(FRAME, 0); }
    expect(low.atRest()).toBe(true);
    expect(high.atRest()).toBe(true);
  });

  it('never blurs past its widest, however hard and often it is plucked', () => {
    const st = stringState({ decay: 0.6 });
    let widest = 0;
    for (let f = 0; f < 600; f++) {
      if (f % 6 === 0) st.pluck(5);
      st.step(FRAME, 1);
      widest = Math.max(widest, st.blur());
    }
    expect(widest).toBeLessThanOrEqual(1);
  });

  it('keeps shivering with the song between notes', () => {
    const st = stringState({ decay: 0.6 });
    for (let f = 0; f < 120; f++) st.step(FRAME, 0.9);
    expect(st.blur()).toBeGreaterThan(0.1);
    expect(st.atRest()).toBe(false);
  });

  it('puts the low notes on the bass and the high on the guitar, in order', () => {
    const places = Array.from({ length: BANDS }, (_, b) => stringOf(b, 4, 6));
    expect(places.slice(0, BANDS / 2).every(p => !p.high)).toBe(true);
    expect(places.slice(BANDS / 2).every(p => p.high)).toBe(true);
    expect(new Set(places.filter(p => !p.high).map(p => p.index))).toEqual(new Set([0, 1, 2, 3]));
    expect(new Set(places.filter(p => p.high).map(p => p.index))).toEqual(new Set([0, 1, 2, 3, 4, 5]));
    const order = places.map(p => (p.high ? 4 : 0) + p.index);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('strums the strings one after another', () => {
    const strum = strumOrder(6);
    expect(strum).toHaveLength(6);
    strum.slice(1).forEach((t, i) => expect(t).toBeGreaterThan(strum[i]));
  });

  it('draws the blur as a lens, still at both ends', () => {
    const d = blurPath(900, 20);
    expect(d.startsWith('M0 0')).toBe(true);
    expect(d).toContain(' 0 900.0');
  });
});
