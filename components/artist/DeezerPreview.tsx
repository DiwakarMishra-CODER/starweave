'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  previewUrl?: string | null;
  previewTrack?: string | null;
  previewAlbum?: string | null;
  compact?: boolean;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function DeezerPreview({
  previewUrl,
  previewTrack,
  previewAlbum,
  compact = false,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Pause and reset when this instance is unmounted (e.g. artist panel switches nodes)
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [playing]);

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

  if (!previewUrl) return null;

  return (
    <div className={`itp${compact ? ' itp--compact' : ''}`}>
      {previewTrack && (
        <div className="itp__meta">
          <span className="itp__track">{previewTrack}</span>
          {previewAlbum && (
            <span className="itp__album">{previewAlbum}</span>
          )}
        </div>
      )}

      <div className="itp__controls">
        <button
          className="itp__play"
          onClick={toggle}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
        >
          {playing ? (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
              <rect x="2" y="1.5" width="3.5" height="10" rx="1" />
              <rect x="7.5" y="1.5" width="3.5" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
              <path d="M3 1.8 11 6.5 3 11.2V1.8z" />
            </svg>
          )}
        </button>

        <div className="itp__progress-wrap">
          <div
            className="itp__bar"
            onClick={seek}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Playback position"
          >
            <div className="itp__fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="itp__times">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <span className="itp__source">30s preview · iTunes</span>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (!a) return;
          setCurrentTime(a.currentTime);
          setProgress(a.currentTime / (a.duration || 30));
        }}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a && a.duration) setDuration(a.duration);
        }}
      />
    </div>
  );
}
