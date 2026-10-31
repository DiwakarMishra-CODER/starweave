'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Artist } from '@/data/types';
import { storyFrame } from '@/lib/story-store';
import { connectAnalyser, readLevel } from '@/lib/use-audio-level';
import { useAudioFocus } from '@/lib/audio-focus';
import { isLoudArtist } from '@/lib/player';

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

const STOP_MS = 8000;   // each stop's turn (the default; see `stopMs`)
const GIVE_UP_MS = 12000; // a stop's song that won't load in this long is skipped
const SKIP_MS = 1400;   // a stop with no song: just long enough to see it
const TRAVEL_MS = 1200; // the light crossing to the next stop, at the end of a turn
const FADE_MS = 600;
const VOLUME = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Anything with a song to play: an artist, or a face in the artist page's family photo. */
type Stop = Pick<Artist, 'id' | 'previewUrl'>;

export interface RoadPlayer<E extends HTMLElement = HTMLOListElement> {
  /** Which stop is on air, or null when the road isn't playing. */
  at: number | null;
  /** On air but held (pause). */
  paused: boolean;
  /** Play from a stop (the first, by default); `stopMs` sets each stop's
   *  turn for this run (the artist page's pocket player plays whole previews). */
  play: (from?: number, opts?: { stopMs?: number }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  /** Attach to the element that holds the stops: it gets --road-progress. */
  progressRef: React.RefObject<E | null>;
}

interface Live {
  begin: (index: number) => void;
  end: () => void;
  index: () => number;
  setTurn: (ms: number) => void;
  pause: () => void;
  resume: () => void;
}

export function useRoadPlayer<E extends HTMLElement = HTMLOListElement>(
  allStops: Stop[],
  { stopMs = STOP_MS }: { stopMs?: number } = {},
): RoadPlayer<E> {
  // The road plays itself stop after stop, so a loud artist's stop stays
  // silent (the loud rule): the van still stops and the stop still lights.
  const stops = useMemo(
    () => allStops.map(s => (isLoudArtist(s.id) ? { ...s, previewUrl: null } : s)),
    [allStops],
  );
  const [at, setAt] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const progressRef = useRef<E>(null);
  const liveRef = useRef<Live | null>(null);
  // One sound at a time across the site: anything else starting stops the road.
  const claim = useAudioFocus(() => liveRef.current?.end());

  const start = useCallback((from: number, turnMs?: number) => {
    if (stops.length === 0) return;
    const target = Math.min(stops.length - 1, Math.max(0, from));
    // Already playing: just move along the road.
    if (liveRef.current) {
      liveRef.current.setTurn(turnMs ?? stopMs);
      liveRef.current.begin(target);
      return;
    }

    claim();
    const audio = new Audio();
    // Before the source, so the analyser can hear it (see lib/use-audio-level).
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    // Inside the press, so the browser lets it make a sound.
    connectAnalyser(audio);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The next stop's song, fetched while this one plays, so it starts at once.
    const spare = new Audio();
    spare.crossOrigin = 'anonymous';
    spare.muted = true;
    audio.addEventListener('playing', () => {
      const next = stops[i + 1]?.previewUrl;
      if (next && spare.src !== next) { spare.preload = 'auto'; spare.src = next; spare.load(); }
    });
    // A song that can't be fetched: on to the next stop.
    audio.addEventListener('error', () => { if (stops[i].previewUrl) skip(); });

    let i = 0;
    let startedAt = 0;
    let raf = 0;
    let runMs = turnMs ?? stopMs;
    let pausedAt = 0;

    const begin = (index: number) => {
      i = index;
      startedAt = performance.now();
      setAt(index);
      // Moving on from a held stop plays again.
      if (pausedAt) {
        pausedAt = 0;
        setPaused(false);
        raf = requestAnimationFrame(tick);
      }
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
      setPaused(false);
      liveRef.current = null;
    };

    // Hold where it is: the clock stops with the song, and picks up again.
    const pause = () => {
      if (pausedAt) return;
      pausedAt = performance.now();
      cancelAnimationFrame(raf);
      audio.pause();
      storyFrame.level = 0;
      setPaused(true);
    };
    const resume = () => {
      if (!pausedAt) return;
      startedAt += performance.now() - pausedAt;
      pausedAt = 0;
      if (stops[i].previewUrl) void audio.play().catch(() => {});
      raf = requestAnimationFrame(tick);
      setPaused(false);
    };

    const skip = () => { if (i === stops.length - 1) end(); else begin(i + 1); };

    // A stop's turn runs on its song's own clock, so the seconds a preview
    // takes to arrive aren't taken off its turn (and the bar waits for it);
    // a stop with no song, or one that never arrives, goes by the wall clock.
    const tick = (now: number) => {
      const here = stops[i];
      const turn = here.previewUrl ? runMs : SKIP_MS;
      if (here.previewUrl && audio.currentTime === 0 && now - startedAt > GIVE_UP_MS) {
        if (i === stops.length - 1) { end(); return; }
        begin(i + 1);
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = here.previewUrl ? audio.currentTime * 1000 : now - startedAt;
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

    liveRef.current = { begin, end, index: () => i, setTurn: ms => { runMs = ms; }, pause, resume };
    begin(target);
    raf = requestAnimationFrame(tick);
  }, [stops, stopMs, claim]);

  const play = useCallback((from = 0, opts?: { stopMs?: number }) => start(from, opts?.stopMs), [start]);
  const stop = useCallback(() => liveRef.current?.end(), []);
  const pause = useCallback(() => liveRef.current?.pause(), []);
  const resume = useCallback(() => { claim(); liveRef.current?.resume(); }, [claim]);
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

  return { at, paused, play, pause, resume, stop, next, prev, progressRef };
}
