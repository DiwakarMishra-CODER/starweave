'use client';

import { useEffect, type RefObject } from 'react';

// "The music drives the light": while a preview plays, its loudness is written
// to a CSS custom property (--level, 0..1) on a target element, and the CSS
// does the rest (a glow's opacity, a room light's scale). Written straight to
// the element every animation frame rather than through React state, so a
// playing song never re-renders anything.
//
// Needs the <audio> element to carry crossOrigin="anonymous": the iTunes
// preview host sends Access-Control-Allow-Origin: *, and without the attribute
// the browser hands the analyser silence.

// One AudioContext for the site. Browsers only let one start inside a user
// gesture, so it's created by connectAnalyser, which the play button calls.
let context: AudioContext | null = null;
// An element can only ever be wired into a context once.
const analysers = new WeakMap<HTMLAudioElement, AnalyserNode>();

/** Call from the play button's click handler, before playing. */
export function connectAnalyser(audio: HTMLAudioElement | null): void {
  if (!audio || typeof AudioContext === 'undefined') return;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    if (analysers.has(audio)) return;
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyser.connect(context.destination);
    analysers.set(audio, analyser);
  } catch {
    // No Web Audio: the song still plays, the light just holds still.
  }
}

/** The quiet crackle of a needle in the groove, made rather than recorded:
 *  a faint hiss with the odd pop, looped. Needs the context the play button
 *  made (see connectAnalyser); returns a function that fades it out, or
 *  null when there's no context yet. */
export function startCrackle(volume = 0.35): (() => void) | null {
  const ctx = context;
  if (!ctx) return null;
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, rate * 2, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] += (Math.random() * 2 - 1) * 0.01;
    if (Math.random() < 0.0008) {
      const amp = 0.2 + Math.random() * 0.6;
      const len = 30 + Math.floor(Math.random() * 120);
      for (let j = 0; j < len && i + j < data.length; j++) data[i + j] += (Math.random() * 2 - 1) * amp * Math.exp(-j / (len / 4));
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  // No rumble, no fizz: the pops sit where a record's do.
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 2400;
  band.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.4);
  source.connect(band).connect(gain).connect(ctx.destination);
  source.start();
  return () => {
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.6);
    source.stop(t + 0.7);
  };
}

/** One reading of an element's loudness, 0..1 — for a caller running its own
 *  animation loop. 0 if the element was never connected. */
export function readLevel(audio: HTMLAudioElement | null): number {
  const analyser = audio ? analysers.get(audio) : undefined;
  if (!analyser || audio!.paused) return 0;
  const samples = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(samples);
  let sum = 0;
  for (const s of samples) {
    const v = (s - 128) / 128;
    sum += v * v;
  }
  return Math.min(1, Math.sqrt(sum / samples.length) * 3.2);
}

// `onLevel`, if given, also receives each frame's level — for something that
// isn't CSS, like the graph canvas (see storyFrame.level).
export function useAudioLevel(
  audioRef: RefObject<HTMLAudioElement | null>,
  playing: boolean,
  targetRef: RefObject<HTMLElement | null>,
  onLevel?: (level: number) => void,
): void {
  useEffect(() => {
    const audio = audioRef.current;
    const target = targetRef.current;
    if (!audio || !target) return;
    const analyser = analysers.get(audio);
    if (!playing || !analyser || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.style.setProperty('--level', '0');
      onLevel?.(0);
      return;
    }

    const samples = new Uint8Array(analyser.fftSize);
    let level = 0;
    let raf = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) {
        const v = (s - 128) / 128;
        sum += v * v;
      }
      // RMS of a mastered track sits around 0.1-0.3; scale it to fill 0..1.
      const loud = Math.min(1, Math.sqrt(sum / samples.length) * 3.2);
      // Fast attack, slow release: the light jumps with a beat and settles.
      level += (loud - level) * (loud > level ? 0.5 : 0.1);
      target.style.setProperty('--level', level.toFixed(3));
      onLevel?.(level);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      target.style.setProperty('--level', '0');
      onLevel?.(0);
    };
  }, [audioRef, playing, targetRef, onLevel]);
}
