'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storyControl, storyFrame } from '@/lib/story-store';
import { connectAnalyser, readLevel } from '@/lib/use-audio-level';
import { useAudioFocus } from '@/lib/audio-focus';
import type { RecordCard } from '@/lib/home-story';

// "Hear where it came from": an artist played as an influence — today's
// record from its tag on the map, or any artist from the side panel.
//
// The artist's family opens (a real selection, so its panel comes too) and
// the band that shaped it plays while a light travels down the line between
// them into today's star. Then the record's own song comes in as the light
// lands, and the star swells with it. For a record nobody came before (the
// Velvet Underground), it's the other way round: their song plays while the
// light goes out to the artist quoted about them, then to everyone they
// shaped.
//
// Both songs are the 30-second previews already on the artists. Their
// loudness drives storyFrame.level, which ForceGraph reads for the light and
// the disc.

const SWITCH_MS = 6500;     // the influence's turn, before today's record comes in
const FLOW_START_MS = 1600; // the camera and the family's lines arrive first
const FLOW_MS = 2400;       // the light crossing one line
const VOLUME = 0.8;
const FADE_STEP = 0.03;     // per frame

export interface Listening {
  /** Who's playing now, for the "now playing" line. */
  now: { name: string; track: string | null } | null;
  start: () => void;
  stop: () => void;
}

function previewAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  // Before the source, so the request is made with CORS and the analyser
  // hears it (see lib/use-audio-level.ts).
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.src = url;
  return audio;
}

/** What playing an artist as an influence needs to know about them. */
export type ListenRecord = Pick<RecordCard, 'id' | 'name' | 'previewUrl' | 'previewTrack' | 'why'>;

/** `select`: open the artist's family first — off where it's already open
 *  (the side panel). */
export function useListen(record: ListenRecord, { select = true }: { select?: boolean } = {}): Listening {
  const router = useRouter();
  const [now, setNow] = useState<Listening['now']>(null);
  const stopRef = useRef<() => void>(() => {});

  // One sound at a time across the site: anything else starting stops this.
  const claim = useAudioFocus(() => stopRef.current());

  const start = useCallback(() => {
    stopRef.current();
    claim();
    const why = record.why;
    const fromParent = why?.direction === 'parent' && why.other.previewUrl ? why : null;
    const first = previewAudio(fromParent ? fromParent.other.previewUrl! : record.previewUrl);
    const second = fromParent ? previewAudio(record.previewUrl) : null;
    // Inside the click, so the browser lets the audio start.
    connectAnalyser(first);
    if (second) connectAnalyser(second);

    if (select) {
      // Pressed before the opening was over: end it the way a skip would.
      storyControl.finish?.();
      router.push(`/?artist=${encodeURIComponent(record.id)}`, { scroll: false });
    }

    first.volume = 0;
    void first.play().catch(() => {});
    storyFrame.playing = fromParent ? fromParent.other.id : record.id;
    setNow(fromParent
      ? { name: fromParent.other.name, track: fromParent.other.previewTrack }
      : { name: record.name, track: record.previewTrack });

    const startedAt = performance.now();
    let playing = first;
    let raf = 0;
    const stop = () => {
      cancelAnimationFrame(raf);
      first.pause();
      second?.pause();
      storyFrame.flow = null;
      storyFrame.level = 0;
      storyFrame.playing = null;
      setNow(null);
      stopRef.current = () => {};
    };
    stopRef.current = stop;

    const tick = (t: number) => {
      const elapsed = t - startedAt;
      // The visitor moved on to another artist, or off the map: let it go.
      const selected = new URLSearchParams(window.location.search).get('artist');
      if (elapsed > 1500 && selected !== record.id) { stop(); return; }

      if (second && playing === first && elapsed > SWITCH_MS) {
        first.pause();
        second.volume = 0;
        void second.play().catch(() => {});
        playing = second;
        storyFrame.playing = record.id;
        setNow({ name: record.name, track: record.previewTrack });
      }
      if (playing.volume < VOLUME) playing.volume = Math.min(VOLUME, playing.volume + FADE_STEP);
      storyFrame.level = readLevel(playing);

      // The light: in from the influence, or out to who they shaped.
      const f = (elapsed - FLOW_START_MS) / FLOW_MS;
      if (fromParent) {
        storyFrame.flow = f > 0 && f < 1 ? { from: fromParent.other.id, to: record.id, t: f } : null;
      } else if (why) {
        storyFrame.flow = f > 0 && f < 1 ? { from: record.id, to: why.other.id, t: f }
          : f >= 1.2 && f < 2.2 ? { from: record.id, to: null, t: f - 1.2 }
          : null;
      }

      if (playing.ended) { stop(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }, [record, router, select, claim]);

  const stop = useCallback(() => stopRef.current(), []);
  useEffect(() => () => stopRef.current(), []);

  return { now, start, stop };
}
