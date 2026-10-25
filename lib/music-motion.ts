import { storyFrame } from './story-store';

// How the artist page moves with the music: one smooth reading of whatever
// is playing (storyFrame.level, set by every player), shared by everything
// that moves, as two CSS variables:
// - --energy: a slow envelope of the song's loudness, 0..1, against the
//   song's own quiet and loud parts (so a loud record and a hushed one both
//   breathe) -- never the frame-to-frame jitter of the raw level;
// - --beat: a pulse on each sudden rise (a kick, a snare, a chord coming
//   in) -- swelling in over a few frames and falling away over a third of a
//   second, never a jump in a single frame (which reads as a glitch).
// CSS does the moving from there (the faces' sway, the on-air face's bump,
// the background print's glow and thump), so the work per frame is writing
// two numbers on a couple of elements. Checked four times a second while
// nothing plays; with reduced motion, nothing is written at all.

const ENERGY_UP = 0.1;    // how quickly the swell follows the song up...
const ENERGY_DOWN = 0.03;  // ...and lets go of it
const BEAT_GAP_MS = 240;   // no two beats closer than this
const KICK_DECAY = 0.9;    // the kick behind each beat, per frame
const BEAT_UP = 0.4;       // the pulse rising to the kick...
const BEAT_DOWN = 0.12;    // ...and falling away
// Everything is read against the song itself, not against silence: a loud,
// compressed master (most records since the 2000s) sits near the top of the
// level the whole time, which pinned the swell at full and left the beat no
// headroom to jump -- measured on Ethel Cain's "American Teenager", above
// half level 90% of the time. So:
const RANGE_GRAB = 0.3;     // the song's floor and ceiling follow a new low/high quickly...
const RANGE_RELAX = 0.004;  // ...and drift back toward the present over ~4s, so they follow its sections
const MIN_RANGE = 0.08;     // a near-flat stretch still breathes a little, not wildly
const MEAN_RATE = 0.05;     // the recent average a beat has to clear...
const BEAT_SIGMA = 1.0;     // ...by this many of its usual wobbles (measured: ~1.5 beats/s on loud records, ~2 on softer ones)
const MIN_JUMP = 0.025;     // and by at least this much, so hiss isn't a beat

export interface MusicReading {
  /** The slow swell of the song's loudness, 0..1, against its own quiet and loud parts. */
  energy: number;
  /** The pulse after each beat, 0..1: up over a few frames, down over a third of a second. */
  beat: number;
  /** A beat landed this frame. */
  onset: boolean;
}

/**
 * The reading itself, one per thing that reads it (this page's loop; the
 * map, which reads it in its own frame -- see ForceGraph's "sky listens"):
 * feed it the raw level (storyFrame.level) once a frame.
 */
export function musicReader() {
  let fast = 0;
  let prevFast = 0;
  let lo = 0;
  let hi = 0;
  let mean = 0;
  let wobble = 0; // the recent variance around the mean
  let energy = 0;
  let kick = 0;
  let beat = 0;
  let lastBeat = -Infinity;
  let started = false;
  return {
    step(level: number, now: number): MusicReading {
      fast += (level - fast) * 0.5;
      if (!started && level > 0) {
        started = true;
        lo = hi = mean = fast;
      }
      // The song's own range: where its quiet and its loud are right now.
      lo += (fast - lo) * (fast < lo ? RANGE_GRAB : RANGE_RELAX);
      hi += (fast - hi) * (fast > hi ? RANGE_GRAB : RANGE_RELAX);
      const relative = Math.min(1, Math.max(0, (fast - lo) / Math.max(MIN_RANGE, hi - lo)));
      energy += (relative - energy) * (relative > energy ? ENERGY_UP : ENERGY_DOWN);

      // A beat: the quick reading rising clear of its own recent average, by
      // more than it usually wobbles -- relative, so it works at any loudness.
      const jump = fast - mean;
      mean += jump * MEAN_RATE;
      wobble += (jump * jump - wobble) * MEAN_RATE;
      const onset = fast > prevFast
        && jump > Math.max(MIN_JUMP, BEAT_SIGMA * Math.sqrt(wobble))
        && now - lastBeat > BEAT_GAP_MS;
      prevFast = fast;
      if (onset) {
        kick = 1;
        lastBeat = now;
      } else {
        kick *= KICK_DECAY;
      }
      beat += (kick - beat) * (kick > beat ? BEAT_UP : BEAT_DOWN);
      return { energy, beat: Math.min(1, beat * 1.4), onset };
    },
    /** At rest: nothing left of the last song. */
    still: () => energy < 0.004 && beat < 0.01 && kick < 0.01,
    reset() {
      fast = prevFast = lo = hi = mean = wobble = energy = kick = beat = 0;
      lastBeat = -Infinity;
      started = false;
    },
  };
}

const targets = new Set<HTMLElement>();
const reader = musicReader();
let raf = 0;
let timer = 0;
let energy = 0;
let beat = 0;

function write() {
  const e = energy.toFixed(3);
  const b = beat.toFixed(3);
  targets.forEach(el => {
    el.style.setProperty('--energy', e);
    el.style.setProperty('--beat', b);
  });
}

function frame(now: number) {
  ({ energy, beat } = reader.step(storyFrame.playing ? storyFrame.level : 0, now));
  write();
  if (!storyFrame.playing && reader.still()) {
    reader.reset();
    energy = beat = 0;
    write();
    raf = 0;
    listen();
    return;
  }
  raf = requestAnimationFrame(frame);
}

function listen() {
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    if (!storyFrame.playing || raf) return;
    window.clearInterval(timer);
    timer = 0;
    raf = requestAnimationFrame(frame);
  }, 250);
}

/** Give `el` --energy and --beat while music plays; returns the undo. */
export function moveWithMusic(el: HTMLElement): () => void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  targets.add(el);
  if (!raf && !timer) listen();
  return () => {
    targets.delete(el);
    el.style.removeProperty('--energy');
    el.style.removeProperty('--beat');
    if (targets.size === 0) {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      raf = 0;
      timer = 0;
    }
  };
}
