'use client';

import { onAir, player, usePlayer, type Queue } from '@/lib/player';
import { isScenesQueue } from '@/lib/scenes-lightbox';

// The Scenes page's headline control. At rest, "Play the history": one band
// from every room, oldest first (lib/scenes-lightbox historyQueue), through
// the site's player -- the lightbox follows it, lighting each room and
// drawing that band's arrows. While any room or the history plays, it's the
// transport: pause or carry on, stop, and what's on air.

export default function PlayHistory({ history }: { history: Queue }) {
  const now = usePlayer();
  const loaded = isScenesQueue(now.queue?.id) && now.at !== null;
  const track = loaded ? onAir(now) : null;
  const minutes = Math.max(1, Math.round((history.tracks.length * history.stopMs) / 60000));

  if (!loaded || !track) {
    return (
      <button type="button" className="scenes-history" onClick={() => player.play(history, 0)}>
        <span className="scenes-history__disc" aria-hidden>
          <svg width="10" height="11" viewBox="0 0 8 9"><path d="M1 0.5L7.5 4.5L1 8.5z" /></svg>
        </span>
        <span className="scenes-history__words">
          <span className="scenes-history__label">Play the history</span>
          <span className="scenes-history__sub">One band from every scene, oldest first &middot; {minutes} min</span>
        </span>
      </button>
    );
  }

  return (
    <div className="scenes-history scenes-history--on" role="group" aria-label="Now playing">
      <span className="scenes-history__disc scenes-history__disc--spin" data-paused={now.paused || undefined} aria-hidden />
      <span className="scenes-history__words" aria-live="polite">
        <span className="scenes-history__label">{track.name}</span>
        <span className="scenes-history__sub">{track.note}</span>
      </span>
      <button
        type="button"
        className="scenes-history__btn"
        aria-label={now.paused ? 'Carry on' : 'Pause'}
        onClick={() => (now.paused ? player.resume() : player.pause())}
      >
        <svg width="10" height="11" viewBox="0 0 8 9" aria-hidden>
          {now.paused ? <path d="M1 0.5L7.5 4.5L1 8.5z" /> : <path d="M1 0.5h2v8H1zM5 0.5h2v8H5z" />}
        </svg>
      </button>
      <button type="button" className="scenes-history__btn" aria-label="Stop" onClick={() => player.stop()}>
        <svg width="10" height="10" viewBox="0 0 8 8" aria-hidden><path d="M0.5 0.5h7v7h-7z" /></svg>
      </button>
    </div>
  );
}
