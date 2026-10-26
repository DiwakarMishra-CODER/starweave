// The song on air read as notes (the artist page's strings, components/
// artist/Strings.tsx): its loudness split into bands by pitch, and the
// moments a band is struck. Pure, so it's tested (tests/lib/song-notes.test.ts).

/** How many bands the song is split into, low to high. */
export const BANDS = 24;
const LOW_HZ = 60;
const HIGH_HZ = 12000;

/** Which analyser bins make up each band, [first, last] inclusive: equal
 *  steps in pitch (octaves), not in frequency -- an even split would put all
 *  the bass and the voice in the first band or two. Every band gets at least
 *  one bin, and no bin is shared. */
export function bandBins(binHz: number, bins: number, bands = BANDS): [number, number][] {
  const out: [number, number][] = [];
  const ratio = HIGH_HZ / LOW_HZ;
  let next = Math.max(1, Math.floor(LOW_HZ / binHz));
  for (let i = 0; i < bands; i++) {
    const top = Math.min(bins - 1, Math.floor((LOW_HZ * ratio ** ((i + 1) / bands)) / binHz));
    const first = Math.min(next, bins - 1);
    const last = Math.max(first, top);
    out.push([first, last]);
    next = last + 1;
  }
  return out;
}

export interface Note {
  band: number;
  /** How far the band jumped clear of its usual level, 0..1. */
  strength: number;
}

const MEAN_RATE = 0.06;   // how quickly a band's usual level follows it
const SIGMA = 1.6;        // a note jumps clear of the usual by this many of its wobbles...
const MIN_JUMP = 0.07;    // ...and by at least this much
const MIN_LEVEL = 0.2;    // a band this quiet plays no notes (hiss, room tone)
const REST_MS = 220;      // a band's notes no closer than this
export const CHORD = 2;   // at most this many notes struck at once

/** Notes, one frame at a time: a band whose level jumps clear of its own
 *  recent average, by more than it usually wobbles -- so a held chord or a
 *  wall of guitar punches one row and then rests, and a drum or a plucked
 *  note punches every time it's struck. The strongest few at once. */
export function notePicker(bands = BANDS) {
  const mean = new Float32Array(bands);
  const wobble = new Float32Array(bands);
  const prev = new Float32Array(bands);
  const last = new Float64Array(bands).fill(-Infinity);
  return {
    step(levels: ArrayLike<number>, now: number): Note[] {
      const notes: Note[] = [];
      for (let b = 0; b < bands; b++) {
        const v = levels[b] ?? 0;
        const jump = v - mean[b];
        const clear = Math.max(MIN_JUMP, SIGMA * Math.sqrt(wobble[b]));
        if (v > MIN_LEVEL && v > prev[b] && jump > clear && now - last[b] > REST_MS) {
          notes.push({ band: b, strength: Math.min(1, (jump - clear) / 0.2 + 0.3) });
        }
        mean[b] += jump * MEAN_RATE;
        wobble[b] += (jump * jump - wobble[b]) * MEAN_RATE;
        prev[b] = v;
      }
      notes.sort((x, y) => y.strength - x.strength);
      const struck = notes.slice(0, CHORD);
      for (const n of struck) last[n.band] = now;
      return struck;
    },
    reset() {
      mean.fill(0);
      wobble.fill(0);
      prev.fill(0);
      last.fill(-Infinity);
    },
  };
}
