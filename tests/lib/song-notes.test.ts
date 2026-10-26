import { describe, it, expect } from 'vitest';
import { BANDS, CHORD, bandBins, notePicker } from '@/lib/song-notes';

const FRAME = 1000 / 60;
const silent = () => new Float32Array(BANDS);

/** Run the picker over `frames` frames of levels; the notes struck, by frame. */
function play(levels: (frame: number) => Float32Array, frames: number) {
  const picker = notePicker();
  const struck: { frame: number; band: number }[] = [];
  for (let f = 0; f < frames; f++) {
    for (const n of picker.step(levels(f), f * FRAME)) struck.push({ frame: f, band: n.band });
  }
  return struck;
}

describe('the song as notes', () => {
  it('splits the analyser into bands by pitch, each its own bins', () => {
    // A 512-point analyser at 44.1 kHz: 256 bins of ~86 Hz.
    const bins = bandBins(44100 / 512, 256);
    expect(bins).toHaveLength(BANDS);
    bins.forEach(([a, b], i) => {
      expect(b).toBeGreaterThanOrEqual(a);
      if (i > 0) expect(a).toBe(bins[i - 1][1] + 1);
    });
    expect(bins[BANDS - 1][1]).toBeLessThan(256);
    // Pitch, not frequency: the top band is far wider than the bottom one.
    const width = ([a, b]: [number, number]) => b - a + 1;
    expect(width(bins[BANDS - 1])).toBeGreaterThan(width(bins[0]) * 4);
  });

  it('plays nothing in silence or hiss', () => {
    expect(play(silent, 300)).toEqual([]);
    expect(play(() => silent().fill(0.12 + Math.random() * 0.04), 300)).toEqual([]);
  });

  it('punches a held chord once, then rests', () => {
    const held = play(f => {
      const l = silent();
      if (f >= 60) l[3] = l[9] = 0.8;
      return l;
    }, 600);
    expect(held.filter(n => n.band === 3)).toHaveLength(1);
    expect(held.filter(n => n.band === 9)).toHaveLength(1);
  });

  it('punches a drum every time it is struck', () => {
    // A kick in band 1 every half second over a steady bass line in band 2.
    const kicks = play(f => {
      const l = silent();
      l[2] = 0.5;
      l[1] = f % 30 < 4 ? 0.9 : 0.3;
      return l;
    }, 600);
    const kick = kicks.filter(n => n.band === 1);
    expect(kick.length).toBeGreaterThanOrEqual(17);
    expect(kick.every(n => n.frame % 30 < 4)).toBe(true);
  });

  it('strikes at most a few notes at once', () => {
    const all = play(f => silent().fill(f % 40 < 3 ? 0.9 : 0.2), 400);
    const perFrame = new Map<number, number>();
    for (const n of all) perFrame.set(n.frame, (perFrame.get(n.frame) ?? 0) + 1);
    expect(Math.max(...perFrame.values())).toBeLessThanOrEqual(CHORD);
  });
});
