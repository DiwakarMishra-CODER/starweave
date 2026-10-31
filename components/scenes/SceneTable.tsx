'use client';

import { ViewTransition, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  HERO_GAP, HERO_LEADER, HERO_SHEET_W,
  type SceneBand, type SceneStep as Step,
} from '@/lib/scene-page';
import { edgePrint, type LightboxScene } from '@/lib/scenes-lightbox';
import type { Queue } from '@/lib/player';
import { onAir, player, usePlayer } from '@/lib/player';
import { sizedImageUrl } from '@/lib/image-url';
import { storyFrame } from '@/lib/story-store';
import { musicReader } from '@/lib/music-motion';
import {
  LEAVE_MS, arrivalFor, clearLeaving, getLeaving, markSeen, noteLeft, subscribeLeaving, wasSeen,
} from '@/lib/scene-arrival';
import { useMediaQuery } from '@/lib/use-media-query';
import PhotoCredit from '@/components/ui/PhotoCredit';
import SceneStep from '@/components/scenes/SceneStep';
import { starPath } from '@/components/scenes/pencil';

// A scene's strip, lifted off the lightbox (/scenes) and laid on its own
// light table. One frame per band, big, with what each band did in this room
// written under its frame.
//
// Point at a band (or focus it) and its frame lifts and tips off the film,
// and their record slides out from behind it -- the real cover, the disc
// peeking from the sleeve, the title and year -- while the other frames dim.
// The band on air does the same, so as the room plays each record comes out
// in turn. Clicking a record plays that band. (It had a loupe once; the owner
// found it useless on frames this size and not indie.)
//
// How it greets you depends on how you came (lib/scene-arrival):
// - from the lightbox: the frames fly up from their slots there (each face
//   shares its view-transition name), then the name writes on, the captions
//   rise and the star pops;
// - from the scene before or after: the film advances -- the old strip runs
//   out one side, this one feeds in from the other and the years roll on
//   from the last scene's;
// - any other first visit: the film runs in from the right like film through
//   a projector, a big year counter ticking from the scene's first year to its
//   last, then the tubes flicker on and the same marks follow;
// - back to a scene already seen this visit: the quick version.
// Any click, key, scroll or tap ends it early; no feed-in on a phone and no
// motion at all under reduced motion.
//
// Play the room plays a few seconds of each band through the site's player.
// The band on air: its frame lifts, glows and bumps on the beat, its record
// is out, its name gets a highlighter swipe, the others dim, and the glass
// glows warm with the song (--energy, --beat: lib/music-motion).

type Stage = 'off' | 'feed' | 'land' | 'advance' | 'on';

const FIT_MIN = 0.72;
const PEEK = 64; // room under the table so the next section's heading shows
const FEED_RUN = 850;
const FEED_MS = 1800;
const LAND_MS = 1250;
const ADVANCE_MS = 950;
const ADVANCE_RUN = 560;
const ROLL_MS = 650;
const STAR = 22;

interface Props {
  scene: LightboxScene;
  place: string;
  bands: SceneBand[];
  frameW: number;
  frameH: number;
  filmW: number;
  prev: Step | null;
  next: Step | null;
  queue: Queue;
}

// Rolls a pair of years from one pair to another (easing out, or evenly, a
// year at a time) by writing the element's text: a few frames, then done.
// Returns a stop function.
function rollYears(el: HTMLElement, from: [number, number], to: [number, number], ms: number,
  format: (a: number, b: number) => string, final: string, even = false): () => void {
  const t0 = performance.now();
  let raf = 0;
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / ms);
    const e = even ? p : 1 - Math.pow(1 - p, 3);
    el.textContent = p >= 1 ? final : format(
      Math.round(from[0] + (to[0] - from[0]) * e),
      Math.round(from[1] + (to[1] - from[1]) * e));
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => { cancelAnimationFrame(raf); el.textContent = final; };
}

export default function SceneTable({ scene, place, bands, frameW, frameH, filmW, prev, next, queue }: Props) {
  const phone = useMediaQuery('(max-width: 700px)');
  const pitch = frameW + HERO_GAP;

  const [stage, setStage] = useState<Stage>(() => {
    const a = arrivalFor(scene.id);
    if (a?.kind === 'lightbox') return 'land';
    if (a) return 'advance';
    return wasSeen(scene.id) ? 'land' : 'off';
  });
  const [arrival] = useState(() => arrivalFor(scene.id));
  // Going to the scene before or after: set at the click (SceneStep), a beat
  // before the page changes, so this strip can run out that side.
  const leaving = useSyncExternalStore(subscribeLeaving, getLeaving, () => null);
  const [fit, setFit] = useState({ scale: 1, h: 0 });

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const yearsRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // The site's player: this room loaded, sounding, and which band is on air.
  const now = usePlayer();
  const loaded = now.queue?.id === queue.id && now.at !== null;
  const airing = loaded && !now.paused;
  const airIdx = airing ? bands.findIndex(b => b.id === onAir(now)?.id) : -1;
  // The band whose record is out: the one pointed at or focused, else the one on air.
  const [pointed, setPointed] = useState<number | null>(null);
  const out = pointed ?? (airIdx >= 0 ? airIdx : null);

  // Seen this visit (a later return is the quick version), and left: the
  // lightbox lets this strip fly home if that's where you're going. Noted at
  // the click (any link to /scenes) or the back button, not on unmount: the
  // lightbox decides how to arrive while it first renders, before this page's
  // cleanup has run.
  useEffect(() => {
    markSeen(scene.id);
    clearLeaving();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (a && new URL(a.href, location.href).pathname === '/scenes') noteLeft(scene.id);
    };
    const onBack = () => noteLeft(scene.id);
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onBack);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onBack);
    };
  }, [scene.id]);

  // Fit the table to the window: the whole strip and its captions in the
  // first screen, the next heading peeking in under it. Scaled with a
  // transform (layout keeps its real size, so it can be measured), the
  // frame around it sized to match.
  useLayoutEffect(() => {
    const frame = frameRef.current, glass = glassRef.current;
    if (!frame || !glass) return;
    const measure = () => {
      if (window.matchMedia('(max-width: 700px)').matches) {
        setFit(f => (f.scale === 1 && f.h === 0 ? f : { scale: 1, h: 0 }));
        return;
      }
      const room = frame.parentElement?.clientWidth ?? window.innerWidth;
      const scroller = frame.closest('.scenes-overlay');
      const top = frame.getBoundingClientRect().top + (scroller?.scrollTop ?? 0);
      const h = glass.offsetHeight;
      const scale = Math.max(FIT_MIN, Math.min(1, room / HERO_SHEET_W, (window.innerHeight - top - PEEK) / h));
      setFit(f => (Math.abs(f.scale - scale) < 0.002 && f.h === h ? f : { scale, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(glass);
    ro.observe(frame.parentElement ?? frame);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  // The stages: off (server render, light out) -> feed / land / advance -> on.
  useEffect(() => {
    if (stage === 'on') return;
    if (stage === 'off') {
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || window.matchMedia('(max-width: 700px)').matches;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion and phone width are only known here; the table waits unlit for them
      setStage(still ? 'on' : 'feed');
      return;
    }
    const t = setTimeout(() => setStage('on'), stage === 'feed' ? FEED_MS : stage === 'land' ? LAND_MS : ADVANCE_MS);
    const skip = () => setStage('on');
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, skip, { capture: true, passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach(e => window.removeEventListener(e, skip, { capture: true }));
    };
  }, [stage]);

  // The feed-in: the strip runs in from beyond the right of the glass and
  // slows into place while the counter ticks through the scene's years. Set
  // up before the first paint of the stage, so it never shows in place first.
  useLayoutEffect(() => {
    if (stage !== 'feed') return;
    const strip = stripRef.current;
    const anim = strip?.animate(
      [{ transform: `translateX(${HERO_SHEET_W}px)` }, { transform: 'translateX(0)' }],
      { duration: FEED_RUN, easing: 'cubic-bezier(0.16, 0.84, 0.3, 1)', fill: 'backwards' },
    );
    const end = scene.isOpenEnded ? 'Now' : String(scene.yearEnd);
    const stop = counterRef.current
      ? rollYears(counterRef.current, [scene.yearStart, 0], [scene.yearEnd, 0], FEED_RUN, a => String(a), end, true)
      : () => {};
    return () => { anim?.cancel(); stop(); };
  }, [stage, scene.yearStart, scene.yearEnd, scene.isOpenEnded]);

  // The film advancing. Leaving: this strip runs out the side the reader is
  // going. Arriving: it feeds in from the other side and the years roll on
  // from the last scene's. (Done here, not with React's <ViewTransition>
  // enter/exit: going between two scene pages never started one.)
  useLayoutEffect(() => {
    if (!leaving || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const run = filmRef.current?.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${leaving === 'next' ? -HERO_SHEET_W : HERO_SHEET_W}px)` }],
      { duration: LEAVE_MS + 80, easing: 'cubic-bezier(0.55, 0, 0.8, 0.2)', fill: 'forwards' },
    );
    return () => run?.cancel();
  }, [leaving]);

  useLayoutEffect(() => {
    if (stage !== 'advance' || !arrival?.from) return;
    const run = filmRef.current?.animate(
      [{ transform: `translateX(${arrival.kind === 'prev' ? -HERO_SHEET_W : HERO_SHEET_W}px)` }, { transform: 'translateX(0)' }],
      { duration: ADVANCE_RUN, easing: 'cubic-bezier(0.16, 0.84, 0.3, 1)', fill: 'backwards' },
    );
    const { from } = arrival;
    const stop = yearsRef.current
      ? rollYears(yearsRef.current, [from.start, from.end], [scene.yearStart, scene.yearEnd], ROLL_MS, (a, b) => `${a}–${b}`, scene.era)
      : () => {};
    return () => { run?.cancel(); stop(); };
  }, [stage, arrival, scene.yearStart, scene.yearEnd, scene.era]);

  // While the room plays, the glass glows with the song's swell and the band
  // on air bumps on its beats, read against the song's own range.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !airing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const reader = musicReader();
    let raf = 0;
    const tick = (t: number) => {
      const r = reader.step(storyFrame.level, t);
      el.style.setProperty('--energy', r.energy.toFixed(3));
      el.style.setProperty('--beat', r.beat.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--energy', '0');
      el.style.setProperty('--beat', '0');
    };
  }, [airing]);

  // Esc stops the room.
  useEffect(() => {
    if (!loaded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') player.stop(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loaded]);

  const playBand = (k: number) => {
    if (loaded && now.at === k) {
      if (now.paused) player.resume();
      else player.pause();
    } else player.play(queue, k, true);
  };

  const from = { start: scene.yearStart, end: scene.yearEnd, open: scene.isOpenEnded };

  return (
    <section
      ref={sectionRef}
      className="scene-table"
      data-stage={stage}
      data-playing={airing || undefined}
      aria-labelledby="scene-title"
      style={{
        '--ink': scene.ink,
        '--color': scene.color,
        '--frame-w': `${frameW}px`,
        '--frame-h': `${frameH}px`,
        '--film-w': `${filmW}px`,
        '--gap': `${HERO_GAP}px`,
        '--leader': `${HERO_LEADER}px`,
        '--n': bands.length,
      } as React.CSSProperties}
    >
      <div
        ref={frameRef}
        className="scene-table__frame"
        style={phone || !fit.h ? undefined : { width: HERO_SHEET_W * fit.scale, height: fit.h * fit.scale }}
      >
        <div
          ref={glassRef}
          className="scene-table__glass"
          style={phone ? undefined : { width: HERO_SHEET_W, transform: fit.scale === 1 ? undefined : `scale(${fit.scale})` }}
        >
          <span className="scene-table__light" aria-hidden />
          <span className="scene-table__glow" aria-hidden />
          {stage === 'feed' && (
            <span ref={counterRef} className="scene-table__counter" aria-hidden>{scene.yearStart}</span>
          )}

          <div className="scene-table__top">
            <Link href="/scenes" className="scene-table__back">&larr; All scenes</Link>
            <nav className="scene-table__steps" aria-label="The scenes before and after">
              {prev && <SceneStep step={prev} dir="prev" from={from} />}
              {next && <SceneStep step={next} dir="next" from={from} />}
            </nav>
          </div>

          <div className="scene-table__block">
            <header className="scene-table__head">
              <div className="scene-table__title-row">
                <h1 id="scene-title" className="scene-table__name">{scene.name}</h1>
                <span className="scene-table__playwrap">
                  <button
                    type="button"
                    className="scene-play"
                    data-on={loaded || undefined}
                    aria-label={loaded && !now.paused ? `Pause ${scene.name}` : `Play the room: a few seconds of each band in ${scene.name}`}
                    onClick={() => (loaded ? (now.paused ? player.resume() : player.pause()) : player.play(queue, 0))}
                  >
                    <svg width="11" height="12" viewBox="0 0 8 9" aria-hidden>
                      {loaded && !now.paused ? <path d="M1 0.5h2v8H1zM5 0.5h2v8H5z" /> : <path d="M1 0.5L7.5 4.5L1 8.5z" />}
                    </svg>
                    <span>{loaded ? (now.paused ? 'Carry on' : 'Pause') : 'Play the room'}</span>
                  </button>
                  {loaded && (
                    <button type="button" className="scene-stop" aria-label={`Stop ${scene.name}`} onClick={() => player.stop()}>
                      <svg width="9" height="9" viewBox="0 0 8 8" aria-hidden><path d="M0.5 0.5h7v7h-7z" /></svg>
                    </button>
                  )}
                </span>
              </div>
              <p className="scene-table__meta">
                <span>{place}</span>
                <span aria-hidden> &middot; </span>
                <span ref={yearsRef}>{scene.era}</span>
                <span aria-hidden> &middot; </span>
                <span>{bands.length} bands</span>
              </p>
              <p className="scene-table__blurb">{scene.blurb}</p>
            </header>

            <div ref={filmRef} className="scene-film">
              <div
                ref={stripRef}
                className="scene-film__strip"
                onPointerLeave={e => { if (e.pointerType === 'mouse') setPointed(null); }}
              >
                <span className="scene-film__holes" aria-hidden />
                <ol className="scene-film__frames" aria-label={`The bands in ${scene.name}`}>
                  {bands.map((b, k) => (
                    <li
                      key={b.id}
                      className="scene-film__frame"
                      data-air={airIdx === k || undefined}
                      data-out={out === k || undefined}
                      // The last band's record comes out the other way, onto the film.
                      data-side={k === bands.length - 1 && k > 0 ? 'left' : undefined}
                      style={{ '--k': k } as React.CSSProperties}
                      onPointerEnter={e => { if (e.pointerType === 'mouse') setPointed(k); }}
                    >
                      {b.record?.imageUrl && (
                        <span className="scene-film__record" aria-hidden onClick={() => playBand(k)}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sizedImageUrl(b.record.imageUrl, 500)} alt="" draggable={false} decoding="async" />
                          <span className="scene-film__record-play">
                            <svg width="12" height="13" viewBox="0 0 8 9">
                              {loaded && now.at === k && !now.paused ? <path d="M1 0.5h2v8H1zM5 0.5h2v8H5z" /> : <path d="M1 0.5L7.5 4.5L1 8.5z" />}
                            </svg>
                          </span>
                        </span>
                      )}
                      {b.record && (
                        <span className="scene-film__record-label" aria-hidden>
                          {b.record.title}{b.record.year ? ` · ${b.record.year}` : ''}
                        </span>
                      )}
                      <Link
                        ref={el => { linkRefs.current[k] = el; }}
                        href={`/artist/${b.id}`}
                        className="scene-film__link"
                        aria-label={b.starred ? `${b.name}, the band here most named as an influence` : b.name}
                        draggable={false}
                        onFocus={() => setPointed(k)}
                        onBlur={() => setPointed(null)}
                        onKeyDown={e => {
                          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                          e.preventDefault();
                          linkRefs.current[Math.max(0, Math.min(bands.length - 1, k + (e.key === 'ArrowRight' ? 1 : -1)))]?.focus();
                        }}
                      >
                        {/* Shares its name with the face on the lightbox and
                            the artist's own portrait, so it flies between them. */}
                        <ViewTransition name={`portrait-${b.id}`} share="morph" default="none">
                          {b.imageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={sizedImageUrl(b.imageUrl, 500)} alt="" width={frameW} height={frameH} draggable={false} />
                            : <span className="scene-film__initials">{b.name.replace(/^The /, '').slice(0, 2)}</span>}
                        </ViewTransition>
                        {b.starred && (
                          <svg className="lightbox__star scene-film__star" width={STAR} height={STAR} aria-hidden>
                            <path d={starPath(STAR)} />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))}
                </ol>
                <span className="scene-film__edge" aria-hidden>
                  <span className="scene-film__edge-print">{edgePrint(scene)}</span>
                  {bands.map((b, k) => (
                    <span key={b.id} className="scene-film__number" style={{ left: HERO_LEADER + k * pitch + frameW - 8 }}>&#9656;{k + 1}</span>
                  ))}
                </span>
                <span className="scene-film__tape" aria-hidden />
              </div>

              <ol className="scene-film__captions">
                {bands.map((b, k) => (
                  <li
                    key={b.id}
                    className="scene-cap"
                    data-air={airIdx === k || undefined}
                    data-out={out === k || undefined}
                    style={{ '--k': k } as React.CSSProperties}
                  >
                    <Link href={`/artist/${b.id}`} className="scene-cap__name" tabIndex={-1}>{b.name}</Link>
                    {b.starred && (
                      <span className="scene-cap__star">&#9733; Named as an influence by {b.namedBy} artists on the map</span>
                    )}
                    <p className="scene-cap__role">{b.role}</p>
                    {b.previewUrl ? (
                      <button
                        type="button"
                        className="scene-cap__play"
                        data-on={(loaded && now.at === k) || undefined}
                        aria-label={loaded && now.at === k && !now.paused ? `Pause ${b.name}` : `Play ${b.name}${b.previewTrack ? `: ${b.previewTrack}` : ''}`}
                        onClick={() => playBand(k)}
                      >
                        <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
                          {loaded && now.at === k && !now.paused ? <path d="M1 0.5h2v8H1zM5 0.5h2v8H5z" /> : <path d="M1 0.5L7.5 4.5L1 8.5z" />}
                        </svg>
                        <span>{b.previewTrack ?? 'Play'}</span>
                      </button>
                    ) : (
                      <span className="scene-cap__none">No song to play</span>
                    )}
                    <PhotoCredit credit={b.imageCredit} className="photo-credit--caption" />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
