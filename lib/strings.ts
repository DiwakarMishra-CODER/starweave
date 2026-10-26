// The strings of the instruments in the room behind the artist's page
// (components/artist/backline). A real string vibrates too fast to see: what
// the eye gets is a blur, widest halfway along and gone at both ends, that
// narrows as the note dies. So a string here is that blur -- plucked by the
// notes the song strikes (lib/song-notes), swelling in over a few frames,
// dying away like a real one, and kept shivering a little by the song between
// notes. Only movement: the blur is a faint shape, never a flash. Pure, so
// it's tested (tests/lib/strings.test.ts).

import { BANDS } from './song-notes';

const ATTACK = 0.45;   // a pluck swells in over a few frames, never in one jump (at 60fps)
const AT_REST = 0.02;  // still enough to draw as a plain string
const SHIVER = 0.25;   // between notes, the song keeps it this wide at most

export interface StringSpec {
  /** Seconds for a pluck to die to a third: low strings ring longer. */
  decay: number;
}

/** One string's blur, 0 (still) to 1 (as wide as it goes). `pluck` excites
 *  it; `step` moves it on, `level` being the song's loudness in its own
 *  bands (0..1). */
export function stringState(spec: StringSpec) {
  let kick = 0;   // where the last pluck has died to
  let amp = 0;    // the blur, following the kick: up over a few frames, down as it dies
  let shiver = 0; // the song's loudness, smoothed
  return {
    pluck(strength: number) {
      kick = Math.max(kick, 0.55 + 0.45 * Math.min(1, Math.max(0, strength)));
    },
    step(dt: number, level: number) {
      kick *= Math.exp(-dt / spec.decay);
      amp = kick > amp ? amp + (kick - amp) * (1 - (1 - ATTACK) ** (dt * 60)) : kick;
      shiver += (SHIVER * Math.max(0, (level - 0.2) / 0.8) - shiver) * Math.min(1, dt * 6);
    },
    blur: () => Math.min(1, amp + shiver),
    atRest: () => amp + shiver < AT_REST,
  };
}

/** Which instrument and string a band of the song plucks: the low half of
 *  the bands on the low instrument (the bass), the high half on the other,
 *  low to high across each one's strings. */
export function stringOf(band: number, lowStrings: number, highStrings: number): { high: boolean; index: number } {
  const half = BANDS / 2;
  const high = band >= half;
  const n = high ? highStrings : lowStrings;
  return { high, index: Math.min(n - 1, Math.floor(((band % half) * n) / half)) };
}

/** The strum when a song starts: every string in order, `gapMs` apart. */
export function strumOrder(strings: number, gapMs = 35): number[] {
  return Array.from({ length: strings }, (_, i) => i * gapMs);
}

/** A string's blur as a shape: a lens along the string, `length` long and
 *  `width` wide at its widest, as an SVG path from (0, 0) to (0, length). */
export function blurPath(length: number, width: number): string {
  // A cubic whose controls sit at a third and two thirds reaches 3/4 of
  // their offset at its middle.
  const k = (width / 2) / 0.75;
  const a = (length / 3).toFixed(1);
  const b = ((2 * length) / 3).toFixed(1);
  const l = length.toFixed(1);
  return `M0 0C${k.toFixed(2)} ${a} ${k.toFixed(2)} ${b} 0 ${l}C${(-k).toFixed(2)} ${b} ${(-k).toFixed(2)} ${a} 0 0Z`;
}
