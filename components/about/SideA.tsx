'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { player, usePlayer } from '@/lib/player';
import { sizedImageUrl } from '@/lib/image-url';
import { Van } from '@/components/genre/Road';
import { useMusicMotion } from '@/components/genre/useMusicMotion';
import { useTape } from './TapePage';

// Side A, "How I found it": the grey before, the song that ended it, the
// road in, and the rotation around the two records that never move.

const FEED = ['Recommended for you', 'More like this', 'Because you listened'];

/** 1. Static: everything the same. Rows of one blank tile drifting by like a
 *  feed that never ends; no colour anywhere. */
export function Static() {
  return (
    <div className="tstatic" aria-hidden>
      {FEED.map((label, r) => (
        <div key={label} className="tstatic__row" style={{ '--r': r } as React.CSSProperties}>
          <p className="tstatic__label">{label}</p>
          <div className="tstatic__belt">
            {[0, 1].map(half => (
              <div key={half} className="tstatic__strip">
                {Array.from({ length: 9 }, (_, k) => (
                  <span key={k} className="tstatic__tile"><i /><b /><b /></span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const GREY_TILES = 36; // over the three covers, 9 x 4

/** 2. How to Disappear Completely: as you scroll, the grey over the three
 *  Radiohead records disappears, tile by tile, and the page's first colour
 *  shows through. While the song plays, the covers move with it. */
export function Disappear() {
  const { tape, play, onAir } = useTape();
  const now = usePlayer();
  const song = tape.tracks.find(t => t.id === 'disappear')!.songs[0];
  const ref = useRef<HTMLDivElement>(null);
  useMusicMotion(ref, onAir === song.at);
  // Each record plays: a song on the tape on the tape, the others a song from themselves.
  const recordOn = (c: (typeof tape.radiohead)[number]) => (c.at !== null ? onAir === c.at : now.queue?.id === `about:record:${c.artistId}:${c.title}` && now.at !== null && !now.paused);
  const playRecord = (c: (typeof tape.radiohead)[number]) => {
    if (c.at !== null) { play(c.at); return; }
    if (!c.track) return;
    const id = `about:record:${c.artistId}:${c.title}`;
    if (now.queue?.id === id && now.at !== null) { if (now.paused) player.resume(); else player.pause(); return; }
    player.play({ id, title: c.title, stopMs: 30000, tracks: [c.track] });
  };
  return (
    <div ref={ref} className="tdis" data-live={onAir === song.at || undefined}>
      <div className="tdis__covers">
        {tape.radiohead.map((c, i) => {
          const on = recordOn(c);
          return (
            <figure key={c.title} className="tdis__cover" style={{ '--i': i } as React.CSSProperties}>
              <button type="button" className="tdis__play" data-on={on || undefined} onClick={() => playRecord(c)} aria-label={`${on ? 'Pause' : 'Play'} ${c.title}`}>
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sizedImageUrl(c.imageUrl, 500)} alt="" width={260} height={260} loading="lazy" />
                )}
                <span className="trot__play" aria-hidden><span className="tbutton__icon" data-pause={on || undefined} /></span>
              </button>
              <figcaption>{c.title}</figcaption>
            </figure>
          );
        })}
      </div>
      <div className="tdis__grey" aria-hidden>
        {Array.from({ length: GREY_TILES }, (_, k) => (
          // A scattered order, so the grey goes in patches rather than a sweep.
          <span key={k} className="tdis__tile" style={{ '--o': (k * 7) % GREY_TILES } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

/** 3. And I kept expanding: the road in, Radiohead to My Bloody Valentine.
 *  The stops light one after another like an arpeggio, the van drives it,
 *  and with each stop the page gains a colour. */
export function RoadIn() {
  const { tape } = useTape();
  const now = usePlayer();
  const loaded = now.queue?.id === tape.roadQueue.id && now.at !== null;
  const playing = loaded && !now.paused;
  return (
    <div className="troad" style={{ '--n': tape.road.length } as React.CSSProperties}>
      <ol className="troad__stops">
        {tape.road.map((f, i) => (
          <li key={f.id} className="troad__stop" style={{ '--i': i, '--glow': f.color } as React.CSSProperties} data-air={(loaded && now.at === i) || undefined}>
            {f.via && <span className="troad__via">via {f.via}</span>}
            <Link href={`/artist/${f.id}`} className="troad__sign">
              <span className="troad__face">
                {f.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sizedImageUrl(f.imageUrl, 160)} alt="" width={64} height={64} loading="lazy" />
                )}
              </span>
              <span className="troad__name">{f.name}</span>
            </Link>
          </li>
        ))}
      </ol>
      <span className="troad__van" style={{ '--spot': tape.road[tape.road.length - 1].color } as React.CSSProperties} aria-hidden><Van /></span>
      <button
        type="button"
        className="tbutton"
        onClick={() => (loaded ? (now.paused ? player.resume() : player.pause()) : player.play(tape.roadQueue, 0))}
      >
        <span className="tbutton__icon" data-pause={playing || undefined} aria-hidden />
        {playing ? 'Pause my road' : loaded ? 'Carry on' : 'Play my road'}
      </button>
    </div>
  );
}

/** 4. The only constants: the rest of their listening orbits the two records
 *  that never leave the rotation. Click an orbiting record to hear it. The
 *  two in the middle play too, and more than the rest: pointed at, the
 *  vinyl slides out of the sleeve; playing, it spins out there and the
 *  sleeve moves with the song. */
export function Rotation() {
  const { tape, play, onAir } = useTape();
  const now = usePlayer();
  const middle = useRef<HTMLDivElement>(null);
  const { down, tired } = tape.constants;
  useMusicMotion(middle, onAir !== null && (onAir === down.at || onAir === tired.at));
  const n = tape.rotation.length;
  // A record that isn't on the tape plays a song from itself on its own.
  const playRecord = (c: (typeof tape.rotation)[number]) => {
    if (c.at !== null) { play(c.at); return; }
    if (!c.track) return;
    const id = `about:record:${c.artistId}`;
    if (now.queue?.id === id && now.at !== null) { if (now.paused) player.resume(); else player.pause(); return; }
    player.play({ id, title: c.title, stopMs: 30000, tracks: [c.track] });
  };
  return (
    <div className="trot" style={{ '--n': n } as React.CSSProperties}>
      <div className="trot__ring">
        {tape.rotation.map((c, i) => {
          const img = c.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sizedImageUrl(c.imageUrl, 250)} alt="" width={84} height={84} loading="lazy" />
          );
          const style = { '--a': `${(360 / n) * i}deg` } as React.CSSProperties;
          const on = c.at !== null ? onAir === c.at : now.queue?.id === `about:record:${c.artistId}` && now.at !== null && !now.paused;
          return (
            <button
              key={`${c.artistId}:${c.title}`}
              type="button"
              className="trot__rec"
              style={style}
              data-on={on || undefined}
              aria-label={`Play ${c.title}, ${c.artistName}`}
              onClick={() => playRecord(c)}
            >
              <span className="trot__upright">
                {img}
                {/* A play button on every sleeve, so each one reads as something to press. */}
                <span className="trot__play" aria-hidden><span className="tbutton__icon" data-pause={on || undefined} /></span>
              </span>
            </button>
          );
        })}
      </div>
      <div ref={middle} className="trot__constants">
        {[down, tired].map((c, i) => {
          const on = onAir === c.at;
          return (
            <button
              key={c.title}
              type="button"
              className={`trot__constant trot__constant--${i === 0 ? 'left' : 'right'}`}
              data-on={on || undefined}
              onClick={() => c.at !== null && play(c.at)}
              aria-label={`${on ? 'Pause' : 'Play'} ${c.title}, ${c.artistName}`}
            >
              <span className="trot__vinyl" style={{ '--label': i === 0 ? '#e7a2c6' : '#e0457b' } as React.CSSProperties} aria-hidden />
              {c.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sizedImageUrl(c.imageUrl, 500)} alt="" width={170} height={170} />
              )}
              <span className="trot__big-play" aria-hidden><span className="tbutton__icon" data-pause={on || undefined} /></span>
            </button>
          );
        })}
        <p className="trot__caption">the two I always come back to</p>
      </div>
      <p className="trot__hint">Click any record going round to hear it.</p>
    </div>
  );
}
