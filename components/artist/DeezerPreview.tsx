'use client';

import { useEffect } from 'react';
import StreamingLinks from '@/components/ui/StreamingLinks';
import { useAudioPreview, type AudioPreviewController } from '@/lib/use-audio-preview';

interface Props {
  previewUrl?: string | null;
  previewTrack?: string | null;
  previewAlbum?: string | null;
  streamingQuery?: string | null;
  compact?: boolean;
  /**
   * Optional externally-owned transport. Omitted (every usage outside the
   * graph's artist panel), this component owns its own via useAudioPreview
   * and behaves exactly as it always has. Passed, the owner is driving the
   * same <audio> element from somewhere else too — see lib/use-audio-preview.
   */
  controller?: AudioPreviewController;
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
  streamingQuery,
  compact = false,
  controller,
}: Props) {
  // Hooks can't be called conditionally, so the fallback controller is always
  // created; when `controller` is supplied it simply goes unused, and its
  // <audio> element is never rendered so it owns nothing.
  const ownController = useAudioPreview();
  const { audioRef, playing, progress, currentTime, duration, toggle, seek, audioProps } =
    controller ?? ownController;

  // Pause and reset when this instance is unmounted (e.g. artist panel switches nodes)
  // — ref captured at effect-setup time, not inside the cleanup closure, since
  // audioRef.current could already be null by the time cleanup actually runs.
  //
  // Skipped when an external controller owns the element: that owner outlives
  // this component and stops playback itself (see the panel's artist-change
  // effect), so pausing here on unmount would kill audio the owner still
  // considers live.
  useEffect(() => {
    if (controller) return;
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [controller, audioRef]);

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

      <div className="itp__footer">
        {streamingQuery && <StreamingLinks query={streamingQuery} size="xs" />}
        <span className="itp__source">30s preview · iTunes</span>
      </div>

      <audio
        ref={audioRef}
        src={previewUrl}
        preload="none"
        {...audioProps}
      />
    </div>
  );
}
