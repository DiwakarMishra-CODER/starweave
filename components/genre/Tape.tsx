'use client';

import { useEffect } from 'react';
import type { Queue } from '@/lib/player';
import { player, usePlayer } from '@/lib/player';

// The free tape stuck to the front of the feature, the way music papers gave
// away a cassette with an issue (NME's C86 tape gave indie pop its name).
// It is the play button: the genre's artists, oldest first, a few seconds of
// each, through the site's player. Its reels turn only while it plays. Built
// like the pocket player -- a crafted object, not an icon -- and kept upright
// (no tilt on anything with words on it); only the masking tape leans.
export default function Tape({ name, queue }: { name: string; queue: Queue }) {
  const now = usePlayer();
  const loaded = now.queue?.id === queue.id && now.at !== null;
  const playing = loaded && !now.paused;
  const bands = queue.tracks.length;

  // Esc stops the tape.
  useEffect(() => {
    if (!loaded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') player.stop(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loaded]);

  return (
    <button
      type="button"
      className="ftape"
      data-on={loaded || undefined}
      data-playing={playing || undefined}
      aria-label={playing ? `Pause the ${name} tape` : `Play ${name}: ${bands} ${bands === 1 ? 'band' : 'bands'}, a few seconds each`}
      onClick={() => (loaded ? (now.paused ? player.resume() : player.pause()) : player.play(queue, 0))}
    >
      <span className="ftape__strip ftape__strip--l" aria-hidden />
      <span className="ftape__strip ftape__strip--r" aria-hidden />
      <span className="ftape__shell" aria-hidden>
        <span className="ftape__label">
          <span className="ftape__free">Free tape with this issue</span>
          <span className="ftape__title">{name}</span>
          <span className="ftape__sub">{bands} {bands === 1 ? 'band' : 'bands'} &middot; side A</span>
        </span>
        <span className="ftape__window">
          <span className="ftape__reel" />
          <span className="ftape__ribbon" />
          <span className="ftape__reel" />
        </span>
        <span className="ftape__press">
          {playing ? 'Pause' : loaded ? 'Carry on' : 'Press to play'}
        </span>
      </span>
    </button>
  );
}
