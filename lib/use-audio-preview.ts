'use client';

import { useRef, useState, useCallback, type RefObject } from 'react';

// Ownership of a 30s preview's <audio> element and its transport state,
// extracted from DeezerPreview so more than one control can drive the same
// element.
//
// The artist panel needs exactly that: on a phone the panel collapses to a
// peek bar with its own play button, while the full player (progress, times,
// streaming links) lives in the expanded state further down the same panel.
// Two <audio> elements would double-play, and moving DeezerPreview up the DOM
// to sit in the peek bar would change where the player renders on desktop.
// One hook, one element, two controls.
//
// `playing` is not tracked by the toggle — it is driven by the element's own
// play/pause events (see audioProps below), so any control that calls
// toggle(), or any external pause, keeps every consumer in sync for free.
export interface AudioPreviewController {
  audioRef: RefObject<HTMLAudioElement | null>;
  playing: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  toggle: () => void;
  seek: (e: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * Pause and rewind. DeezerPreview used to get this for free from a
   * `key={artist.id}` remount inside the panel; now that the element's state
   * lives above that component, the panel has to stop playback explicitly
   * when the selected artist changes, or one artist's preview carries on
   * over another's.
   */
  stop: () => void;
  /** Spread onto the <audio> element that DeezerPreview renders. */
  audioProps: {
    onPlay: () => void;
    onPause: () => void;
    onEnded: () => void;
    onTimeUpdate: () => void;
    onLoadedMetadata: () => void;
  };
}

export function useAudioPreview(): AudioPreviewController {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = frac * (audio.duration || 30);
    audio.currentTime = t;
    setCurrentTime(t);
    setProgress(frac);
  }, []);

  const audioProps = {
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    },
    onTimeUpdate: () => {
      const a = audioRef.current;
      if (!a) return;
      setCurrentTime(a.currentTime);
      setProgress(a.currentTime / (a.duration || 30));
    },
    onLoadedMetadata: () => {
      const a = audioRef.current;
      if (a && a.duration) setDuration(a.duration);
    },
  };

  return { audioRef, playing, progress, currentTime, duration, toggle, seek, stop, audioProps };
}
