'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Artist } from '@/data/types';
import { storyFrame } from '@/lib/story-store';
import { connectAnalyser, readLevel } from '@/lib/use-audio-level';

// "Play the road": a few seconds of each stop on a Connect two road, in
// order, from the first artist to the last (or from any stop, and skipping
// back and on). While a stop plays its star rings on the map
// (storyFrame.pulse) and the map listens to it (storyFrame.playing,
// storyFrame.level); at the end of its turn the music fades and light travels
// along the road to the next stop (storyFrame.roadFlow, drawn by ForceGraph's
// path lines) before that one comes in. Stops with no preview are passed over
// quickly. Sound only ever starts from a press. How far through its turn the
// stop on air is goes to --road-progress on `progressRef`'s element, for the
// line under it — set directly each frame, never through React.

const STOP_MS = 8000;   // each stop's turn
const SKIP_MS = 1400;   // a stop with no song: just long enough to see it
const TRAVEL_MS = 1200; // the light crossing to the next stop, at the end of a turn
const FADE_MS = 600;
const VOLUME = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface RoadPlayer {
  /** Which stop is on air, or null when the road isn't playing. */
  at: number | null;
  /** Play from a stop (the first, by default). */
  play: (from?: number) => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  /** Attach to the element that holds the stops: it gets --road-progress. */
  progressRef: React.RefObject<HTMLOListElement | null>;
}

interface Live {
  begin: (index: number) => void;
  end: () => void;
  index: () => number;
}

export function useRoadPlayer(stops: Artist[]): RoadPlayer {
  const [at, setAt] = useState<number | null>(null);
  const progressRef = useRef<HTMLOListElement>(null);
  const liveRef = useRef<Live | null>(null);

  const start = useCallback((from: number) => {
    if (stops.length === 0) return;
    const target = Math.min(stops.length - 1, Math.max(0, from));
    // Already playing: just move along the road.
    if (liveRef.current) { liveRef.current.begin(target); return; }

    const audio = new Audio();
    // Before the source, so the analyser can hear it (see lib/use-audio-level).
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    // Inside the press, so the browser lets it make a sound.
    connectAnalyser(audio);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let i = 0;
    let startedAt = 0;
    let raf = 0;

    const begin = (index: number) => {
      i = index;
      startedAt = performance.now();
      setAt(index);
      const here = stops[index];
      storyFrame.pulse = [here.id];
      storyFrame.playing = here.id;
      storyFrame.roadFlow = null;
      if (here.previewUrl) {
        audio.src = here.previewUrl;
        audio.currentTime = 0;
        audio.volume = 0;
        void audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    };

    const end = () => {
      cancelAnimationFrame(raf);
      audio.pause();
      storyFrame.pulse = [];
      storyFrame.playing = null;
      storyFrame.level = 0;
      storyFrame.roadFlow = null;
      progressRef.current?.style.setProperty('--road-progress', '0');
      setAt(null);
      liveRef.current = null;
    };

    const tick = (now: number) => {
      const here = stops[i];
      const turn = here.previewUrl ? STOP_MS : SKIP_MS;
      const t = now - startedAt;
      const last = i === stops.length - 1;
      // Fade in, and out before the light sets off for the next stop.
      if (here.previewUrl) {
        const until = last ? turn : turn - TRAVEL_MS;
        audio.volume = VOLUME * clamp01(Math.min(t / FADE_MS, (until - t) / FADE_MS));
      }
      storyFrame.level = readLevel(audio);
      progressRef.current?.style.setProperty('--road-progress', clamp01(t / turn).toFixed(3));
      if (!last && t >= turn - TRAVEL_MS) {
        storyFrame.roadFlow = reduce ? null : { from: here.id, to: stops[i + 1].id, t: clamp01((t - (turn - TRAVEL_MS)) / TRAVEL_MS) };
      }
      if (t >= turn) {
        if (last) { end(); return; }
        begin(i + 1);
      }
      raf = requestAnimationFrame(tick);
    };

    liveRef.current = { begin, end, index: () => i };
    begin(target);
    raf = requestAnimationFrame(tick);
  }, [stops]);

  const play = useCallback((from = 0) => start(from), [start]);
  const stop = useCallback(() => liveRef.current?.end(), []);
  // Skipping on from the last stop ends the road; back from the first
  // starts it over.
  const next = useCallback(() => {
    const live = liveRef.current;
    if (!live) { start(0); return; }
    if (live.index() >= stops.length - 1) live.end();
    else live.begin(live.index() + 1);
  }, [start, stops.length]);
  const prev = useCallback(() => {
    const live = liveRef.current;
    if (!live) { start(0); return; }
    live.begin(Math.max(0, live.index() - 1));
  }, [start]);

  // A different road, or the panel going away, stops the music.
  useEffect(() => () => liveRef.current?.end(), [stops]);

  return { at, play, stop, next, prev, progressRef };
}
