'use client';

/* eslint-disable @next/next/no-img-element -- the face on the mini player's screen, sized by lib/image-url */
import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGraphData } from '@/components/graph/GraphDataProvider';
import { resolveNodeColor } from '@/lib/colors';
import { sizedImageUrl } from '@/lib/image-url';
import { onAir, player, usePlayer } from '@/lib/player';
import { wholeStory } from '@/lib/player-library';
import { useStory } from '@/lib/story-store';
import { FoldIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from './icons';
import PlayerDevice from './PlayerDevice';

// The player in the corner of every page (mounted once in the (graph)
// layout, so it never stops between pages). Folded, it's the same pocket
// player as on the artist page, small: a screen with the face on air and
// the song scrolling across like an old LCD, a mini click wheel with play
// in the middle, the earphone lead trailing off. Press MENU or the screen
// and it grows into the full player (PlayerDevice) with the whole library;
// until someone has, a note says so. It takes the colour of whoever's
// playing. It steps aside while the opening plays, and on an artist page
// while that page's own docked player is in view -- unless what's playing
// is from somewhere else, which the docked player doesn't show.

export default function FloatingPlayer() {
  const s = usePlayer();
  const { mode } = useStory();
  const pathname = usePathname();
  const { data } = useGraphData();
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  const colorOf = useMemo(() => new Map(data?.artists.map(a => [a.id, resolveNodeColor(a)]) ?? []), [data]);
  const story = useMemo(() => (data ? wholeStory(data.artists) : null), [data]);
  const current = onAir(s);
  const live = current !== null && !s.paused;
  const offer = s.context ?? (story ? { queue: story, start: 0 } : null);
  const shown = current ?? (offer ? offer.queue.tracks[offer.start] : null);
  const color = (shown && colorOf.get(shown.id)) ?? '#e8c87a';
  // The artist page's docked player stands in for this one -- unless the
  // song playing isn't from that page's family; then this one stays, to
  // show and control it.
  const elsewhere = current !== null && !s.context?.queue.tracks.some(t => t.id === current.id);
  const hidden = mode === 'story' || (s.docked && !elsewhere);

  // The screen's progress line (--player-progress, set every frame by lib/player).
  useEffect(() => {
    const el = progressRef.current;
    return el ? player.showProgressOn(el) : undefined;
  }, [s.open]);

  // Open: Escape or a press anywhere else folds it again.
  useEffect(() => {
    if (!s.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') player.setOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) player.setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [s.open]);

  const toggle = () => {
    if (!current) { if (offer) player.play(offer.queue, offer.start); }
    else if (s.paused) player.resume();
    else player.pause();
  };
  const open = () => player.setOpen(true);

  const status = !current ? 'Ready' : s.paused ? 'Paused' : 'Playing';
  const song = shown ? (shown.previewTrack ?? (shown.previewUrl ? 'A song' : 'No song')) : '';

  return (
    <div
      ref={rootRef}
      className={`player-float${pathname === '/' ? ' player-float--map' : ''}${current ? '' : ' player-float--idle'}${live ? ' player-float--live' : ''}${s.heard ? '' : ' player-float--fresh'}`}
      style={{ '--layer-color': color } as React.CSSProperties}
      hidden={hidden}
    >
      {s.open ? (
        <div className="player-float__panel" id="player-float-panel" role="region" aria-label="Music player">
          <button type="button" className="player-float__fold" onClick={() => player.setOpen(false)} aria-label="Fold the player away">
            <FoldIcon className="player-float__fold-icon" />
          </button>
          <PlayerDevice variant="floating" />
        </div>
      ) : (
        <>
          {!s.browsed && story && (
            <p className="player-float__note">
              <span><b>Menu</b>: all {story.tracks.length} songs</span>
              <svg className="player-float__note-arrow" viewBox="0 0 40 24" aria-hidden>
                <path d="M2 8 C14 6 24 9 33 15 M26 15 L34 16 L32 8" />
              </svg>
            </p>
          )}
          <div className="player-float__mini">
            {/* The earphone lead: up out of the jack and off the edge of the
                screen, to earphones out of view. */}
            <svg className="player-float__lead" viewBox="0 0 90 60" aria-hidden>
              <path d="M24 60 C24 34 38 24 58 22 C74 20 84 14 96 4" />
            </svg>
            <button
              type="button"
              className="player-float__screen"
              onClick={open}
              aria-expanded={false}
              aria-controls="player-float-panel"
              aria-label={`${current ? `${status}: ${shown?.name}, ${song}` : `${shown?.name ?? 'Music'}`}. Open the library`}
            >
              <span className="player-float__status" aria-hidden>
                {live && <span className="pocket__eq"><i /><i /><i /><i /></span>}
                {status}
              </span>
              <span className="player-float__now" aria-hidden>
                <span className="player-float__face">
                  {shown?.imageUrl && <img src={sizedImageUrl(shown.imageUrl, 250)} alt="" width={32} height={32} />}
                </span>
                <span className="player-float__name">{shown?.name ?? 'Music'}</span>
              </span>
              {/* The song name, scrolling across while it plays. */}
              <span className={`player-float__ticker${live ? ' player-float__ticker--run' : ''}`} aria-hidden>
                <span>{song}{live && <>&nbsp;&nbsp;·&nbsp;&nbsp;{song}&nbsp;&nbsp;·&nbsp;&nbsp;</>}</span>
              </span>
              <span className="player-float__progress" ref={progressRef} aria-hidden />
            </button>

            <div className="player-float__wheel">
              <button
                type="button"
                className="player-float__key player-float__key--menu"
                onClick={open}
                aria-expanded={false}
                aria-controls="player-float-panel"
                aria-label="Menu: open the library"
              >
                Menu
              </button>
              <button type="button" className="player-float__key player-float__key--prev" onClick={() => player.prev()} disabled={!current} aria-label="Previous">
                <PrevIcon className="player-float__key-icon" />
              </button>
              <button type="button" className="player-float__key player-float__key--next" onClick={() => player.next()} disabled={!current} aria-label="Next">
                <NextIcon className="player-float__key-icon" />
              </button>
              <button type="button" className="player-float__play" onClick={toggle} aria-label={live ? 'Pause' : `Play ${shown?.name ?? 'music'}`}>
                {live ? <PauseIcon className="player-float__play-icon" /> : <PlayIcon className="player-float__play-icon" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
