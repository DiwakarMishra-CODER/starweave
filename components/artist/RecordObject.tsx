'use client';

/* eslint-disable @next/next/no-img-element -- the cover, sized by lib/image-url */
import { useEffect, useRef, useState } from 'react';
import { imageSrcSet, sizedImageUrl } from '@/lib/image-url';
import { player, usePlayer, SONG_MS, type Queue } from '@/lib/player';
import type { Album } from '@/data/types';

// The record on the artist page, as something you can handle:
// - it rises out of a record-shop crate once it's in view, then its vinyl
//   spins out of the sleeve (CSS, played by SleeveArrivals; already risen
//   and out without it, or with reduced motion);
// - the cover tilts toward the pointer, as if you're holding the sleeve
//   (mouse and trackpad only);
// - the vinyl can be grabbed and spun, and coasts to a stop when let go; a
//   "Spin it" tag says so until someone has;
// - it plays: the crate's front is a record shop's listening post, a play
//   button and the song (the one its write-up names, from the record);
//   clicking the cover plays it too, and the vinyl spins while it does.
//   (The crate's front said "LPs" and the letter they're filed under once,
//   which nobody read as anything.)
// The cover's alt text and the card beside it carry the facts.

interface Props {
  album: Album;
  artistId: string;
  artistName: string;
  /** A loud artist (the loud rule): the listening post says so. */
  loud?: boolean;
}

const TILT_X = 9;  // degrees, top and bottom
const TILT_Y = 12; // degrees, either side
const COAST = 0.955; // how much spin is left each frame after letting go

export default function RecordObject({ album, artistId, artistName, loud }: Props) {
  const coverRef = useRef<HTMLElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const spin = useRef({ angle: 0, velocity: 0, raf: 0, grab: null as null | { last: number; at: number } });
  const [spun, setSpun] = useState(false);

  // The record shop's divider: the first letter they're filed under.
  const filed = artistName.replace(/^the\s+/i, '').charAt(0).toUpperCase();

  // Its song, through the site's player.
  const now = usePlayer();
  const queue: Queue | null = album.previewUrl ? {
    id: `record:${artistId}:${album.id}`,
    title: album.title,
    stopMs: SONG_MS,
    tracks: [{
      id: artistId, name: artistName, imageUrl: album.imageUrl ?? null, previewUrl: album.previewUrl,
      previewTrack: album.previewTrack ?? null, activeFrom: album.year ?? null, note: `From ${album.title}`,
    }],
  } : null;
  const loaded = queue !== null && now.queue?.id === queue.id && now.at !== null;
  const playing = loaded && !now.paused;
  const toggle = () => {
    if (!queue) return;
    if (loaded) { if (now.paused) player.resume(); else player.pause(); }
    else player.play(queue, 0);
  };

  // Tilt toward the pointer, once a frame at most.
  const tiltRaf = useRef(0);
  const onTilt = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(tiltRaf.current);
    tiltRaf.current = requestAnimationFrame(() => {
      el.classList.add('is-held');
      el.style.setProperty('--tilt-x', `${(-y * TILT_X * 2).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(x * TILT_Y * 2).toFixed(2)}deg`);
    });
  };
  const onLetGo = () => {
    const el = coverRef.current;
    cancelAnimationFrame(tiltRaf.current);
    if (!el) return;
    el.classList.remove('is-held');
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  // Spinning the vinyl: the angle of the pointer round its middle.
  const angleOf = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const show = () => discRef.current?.style.setProperty('--spin', `${spin.current.angle.toFixed(1)}deg`);
  const onGrab = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    cancelAnimationFrame(s.raf);
    s.velocity = 0;
    s.grab = { last: angleOf(e), at: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('is-grabbed');
    setSpun(true);
  };
  const onTurn = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.grab) return;
    const a = angleOf(e);
    let d = a - s.grab.last;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const now = performance.now();
    const dt = Math.max(1, now - s.grab.at);
    s.angle += d;
    s.velocity = s.velocity * 0.6 + (d / dt) * 16.7 * 0.4; // degrees per frame, smoothed
    s.grab = { last: a, at: now };
    show();
  };
  const onRelease = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.grab) return;
    s.grab = null;
    e.currentTarget.classList.remove('is-grabbed');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const coast = () => {
      s.velocity *= COAST;
      s.angle += s.velocity;
      show();
      if (Math.abs(s.velocity) > 0.05) s.raf = requestAnimationFrame(coast);
    };
    s.raf = requestAnimationFrame(coast);
  };

  useEffect(() => {
    const s = spin.current;
    const tilt = tiltRaf.current;
    return () => { cancelAnimationFrame(s.raf); cancelAnimationFrame(tilt); };
  }, []);

  return (
    <div className="sleeve__object" data-arrive data-playing={playing || undefined}>
      <div className="sleeve__lift">
        {!spun && <span className="vinyl__hint" aria-hidden>Spin it <span className="vinyl__hint-arrow">↻</span></span>}
        <div className="vinyl" aria-hidden>
          <div
            ref={discRef}
            className="vinyl__disc"
            onPointerDown={onGrab}
            onPointerMove={onTurn}
            onPointerUp={onRelease}
            onPointerCancel={onRelease}
          >
            <span className="vinyl__label">
              <span className="vinyl__artist">{artistName}</span>
              <span className="vinyl__title">{album.title}</span>
            </span>
          </div>
        </div>
        {album.imageUrl && (
          <figure ref={coverRef} className="sleeve__cover" onPointerMove={onTilt} onPointerLeave={onLetGo} onClick={toggle} data-plays={queue ? true : undefined}>
            <img
              src={sizedImageUrl(album.imageUrl, 600)}
              srcSet={imageSrcSet(album.imageUrl, [300, 600, 1200])}
              sizes="(max-width: 700px) 220px, 320px"
              alt={`${album.title} cover`}
              width={320}
              height={320}
            />
          </figure>
        )}
      </div>
      <div className="crate">
        {queue ? (
          <button type="button" className="crate__play" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${album.previewTrack ?? album.title}, from ${album.title}${loud ? ' (it’s loud)' : ''}`}>
            <span className="crate__icon" data-pause={playing || undefined} aria-hidden />
            <span className="crate__song" aria-hidden>
              <span className="crate__kicker">{playing ? (now.loading ? 'Loading…' : 'Now playing') : 'Listen'}{loud && <span className="loud-tag">Loud</span>}</span>
              <span className="crate__name">{album.previewTrack ?? album.title}</span>
            </span>
          </button>
        ) : (
          <span aria-hidden>
            <span className="crate__label">LPs</span>
            <span className="crate__divider">{filed}</span>
          </span>
        )}
      </div>
    </div>
  );
}
