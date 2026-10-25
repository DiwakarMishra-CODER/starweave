import { storyFrame } from './story-store';

// How the artist page moves with the music: one smooth reading of whatever
// is playing (storyFrame.level, set by every player), shared by everything
// that moves, as two CSS variables:
// - --energy: a slow envelope of the song's loudness, 0..1 -- breathing,
//   never the frame-to-frame jitter of the raw level;
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

export interface MusicReading {
  /** The slow swell of the song's loudness, 0..1. */
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
  let energy = 0;
  let kick = 0;
  let beat = 0;
  let lastBeat = -Infinity;
  return {
    step(level: number, now: number): MusicReading {
      fast += (level - fast) * 0.5;
      energy += (level - energy) * (level > energy ? ENERGY_UP : ENERGY_DOWN);
      // A beat: the quick reading jumps well above the slow one. It sets off
      // a kick, which the pulse follows smoothly up and back down.
      const onset = fast > energy * 1.22 + 0.04 && now - lastBeat > BEAT_GAP_MS;
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
    reset() { fast = energy = kick = beat = 0; },
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
