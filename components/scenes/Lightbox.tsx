'use client';

import { Fragment, ViewTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FRAME_GAP, HISTORY_ID, LABEL_H, LEADER, PLAY_GAP, PLAY_W, RULER_H, TOP_REBATE,
  isScenesQueue, roomQueue, yearToX,
  type Lightbox as Layout, type LightboxStrip,
} from '@/lib/scenes-lightbox';
import { sizedImageUrl } from '@/lib/image-url';
import { onAir, player, usePlayer } from '@/lib/player';
import { storyFrame } from '@/lib/story-store';
import { musicReader } from '@/lib/music-motion';
import { justLeft, noteArrival } from '@/lib/scene-arrival';
import PhotoCredit from '@/components/ui/PhotoCredit';
import { BLUE, RED, arrowPath, greaseLoop, starPath, type Pt } from '@/components/scenes/pencil';

// The scenes as contact sheets on a lightbox (layout: lib/scenes-lightbox).
// Each strip is a link to its scene. Point at a frame and a grease-pencil
// circle goes round it, the strip's years light on the ruler, and a card
// shows that band through a loupe with the scene's details. The keyboard
// does the same (Tab to a strip, arrows along its frames, Enter to open);
// on a touch screen the first tap on a frame shows it and a second opens
// the scene. On a phone the sheet becomes a plain contact sheet, one strip
// per row in date order.
//
// Room to room: pointing at a band draws grease-pencil arrows to the bands
// it shaped in other rooms (red) and from the ones that shaped it (blue) --
// the influence links the map holds between scenes. Play the room (the
// button after each name) plays a few seconds of each band through the
// site's player, and so does Play the history in the header (one band from
// every room, oldest first). The band on air gets the loupe and its arrows,
// its strip lights up warm with the music and the rest of the glass dims a
// touch. Pausing or stopping clears all of that; Esc or a click on empty
// glass stops.
//
// The opening, "the reel": every room's strip, end to end in year order and
// larger than life, runs in from the right across the dark glass like film
// through a projector, a big year counter ticking 1961 to now above it, and
// slows to a stop; the tubes flicker on; the reel is cut at each join and
// the strips fly to their places on the sheet in year order, shrinking as
// they land; then the names write on, the lines draw, the stars pop and the
// play buttons pulse. The scenes are pieces of one story -- you watch one
// reel become the rooms. Every time the page opens, ended early only by a click, tap,
// scroll or key (never by a mouse passing over), not on a phone, and not at
// all under reduced motion. The page is rendered with the light off, so
// nothing visibly swaps when it starts.

type Stage = 'off' | 'opening' | 'return' | 'on';
interface Active { id: string; frame: number; pinned: boolean }

const FIT_MIN = 0.7;
// Room left under the sheet in the first screen, so the log's heading peeks
// in below it and the page reads as continuing.
const LOG_PEEK = 66;
const OPENING_MS = 4100; // the last Play sticker finishes its pulse at ~4s
// The reel, in ms from the start of the opening (CSS uses the same times).
const REEL_IN = 300;       // the film starts running
const REEL_RUN = 1500;     // ...and has stopped by 1.8s; the tubes flicker on
const REEL_CUT = 2000;     // the first strip leaves the reel
const REEL_STAGGER = 40;   // and each after it, in year order
const REEL_FLY = 600;      // the flight to its place
const REEL_SCALE = 1.4;
// Coming back to the page in the same visit: no run, just the cut and the
// strips flying in from where the reel stopped.
const RETURN_MS = 1400;
const RETURN_STAGGER = 30;
const REEL_JOIN = 8;       // the gap at each cut
// Spins up from slow (the early rooms are seen), runs, slows into now.
const RUN_EASE = 'cubic-bezier(0.45, 0.05, 0.2, 1)';
const FLY_EASE = 'cubic-bezier(0.3, 1.22, 0.5, 1)';
const CARD_W = 268;
const SPAN_GAP = 8; // between the play button and the scene's line

const STAR = 13;

const starName = (s: LightboxStrip) => s.members.find(m => m.id === s.starId)?.name ?? null;

// When the page was last left after a real visit, for the quick return.
let leftAt = 0;

function frameOf(target: EventTarget | null, s: LightboxStrip): number | null {
  const el = (target as HTMLElement | null)?.closest?.('[data-frame]') as HTMLElement | null;
  if (!el) return null;
  return Math.min(Number(el.dataset.frame), s.members.length - 1);
}

export default function Lightbox({ layout }: { layout: Layout }) {
  const { strips, frameW, frameH, stripH } = layout;
  const pitch = frameW + FRAME_GAP;
  const frameRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ zoom: 1, scroll: false, phone: false });
  // Back from a scene's page a moment ago: its faces fly home into their
  // slots (they share names with that page's frames), so the sheet starts
  // with that strip already in place and only the rest fly in from the reel.
  // Never on a first load: nothing has been left yet, so server and browser agree.
  const [home] = useState(() => justLeft());
  const [stage, setStage] = useState<Stage>(() => (home ? 'return' : 'off'));
  const [active, setActive] = useState<Active | null>(null);
  const touch = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Play the room: each scene as a queue for the site's player.
  const queues = useMemo(() => new Map(strips.map(s => [s.id, roomQueue(s)])), [strips]);
  const now = usePlayer();
  // A room or the history loaded in the player; `airing` only while it sounds.
  const loaded = isScenesQueue(now.queue?.id) && now.at !== null;
  const airing = loaded && !now.paused;
  const airId = loaded ? onAir(now)?.id ?? null : null;
  const roomId = loaded && now.queue?.id !== HISTORY_ID ? now.queue!.id.slice(6) : null;
  const playingId = airing ? (roomId ?? strips.find(s => s.members.some(m => m.id === airId))?.id ?? null) : null;

  // Esc stops whatever room is playing.
  useEffect(() => {
    if (!loaded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') player.stop(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loaded]);

  // Every frame's centre on the sheet, for the arrows between rooms.
  const centres = useMemo(() => {
    const m = new Map<string, Pt>();
    for (const s of strips) s.members.forEach((b, k) => {
      if (!m.has(b.id)) m.set(b.id, { x: s.left + LEADER + k * pitch + frameW / 2, y: s.top + TOP_REBATE + frameH / 2 });
    });
    return m;
  }, [strips, pitch, frameW, frameH]);

  // While a room plays, its strip glows warm with the music: the song's own
  // swell and its beats, read against its own range (lib/music-motion).
  useEffect(() => {
    const el = sheetRef.current;
    if (!el || !playingId) return;
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
  }, [playingId]);

  // Fit the sheet to the window when it nearly fits, in both directions;
  // scroll sideways when it doesn't; a phone gets the stacked sheet.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      if (window.matchMedia('(max-width: 700px)').matches) {
        setFit({ zoom: 1, scroll: false, phone: true });
        return;
      }
      const room = frame.parentElement?.clientWidth ?? frame.clientWidth;
      const scroller = frame.closest('.scenes-overlay');
      const top = frame.getBoundingClientRect().top + (scroller?.scrollTop ?? 0);
      const wz = room / layout.width;
      const hz = Math.max(FIT_MIN, (window.innerHeight - top - LOG_PEEK) / layout.height);
      const next = wz >= FIT_MIN
        ? { zoom: Math.min(1, wz, hz), scroll: false, phone: false }
        : { zoom: Math.min(1, hz), scroll: true, phone: false };
      setFit(next);
      // The header lines up with the sheet's edges, whatever size it fits to.
      (frame.closest('.scenes-page') as HTMLElement | null)?.style.setProperty(
        '--sheet-w', next.scroll ? 'none' : `${Math.round(layout.width * next.zoom)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame.parentElement ?? frame);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [layout.width, layout.height]);

  // The opening plays every time the page opens (the owner's call: it's the
  // page's welcome, and any click, key or scroll ends it). Coming back in the
  // same visit -- from a scene page, say -- gets the quick version.
  useEffect(() => {
    const mountedAt = Date.now();
    // Leaving after a real visit marks the next arrival as a return. (React's
    // development mode mounts, unmounts and mounts again at once; that
    // instant unmount mustn't count.)
    const markLeft = () => { if (Date.now() - mountedAt > 1000) leftAt = Date.now(); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || window.matchMedia('(max-width: 700px)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion and phone width are only known here; the sheet waits unlit for them
      setStage('on');
      return markLeft;
    }
    const back = leftAt > 0 || home !== null;
    setStage(back ? 'return' : 'opening');
    const t = setTimeout(() => setStage('on'), back ? RETURN_MS : OPENING_MS);
    return () => { clearTimeout(t); markLeft(); };
  }, [home]);

  // The reel: each strip's whole journey as one animation -- run in with the
  // reel, hold while the lights come on, fly to its place. Set up before the
  // first paint of the opening, so no strip shows in its place first.
  const reel = useMemo(() => {
    const at: number[] = [];
    let x = 0;
    for (const s of strips) { at.push(x); x += s.width * REEL_SCALE + REEL_JOIN; }
    const length = x - REEL_JOIN;
    return {
      at,
      y: Math.round(layout.height / 2 - (stripH * REEL_SCALE) / 2 + 20),
      from: Math.round(layout.width * 0.72),   // the reel's head already on the glass
      to: Math.round(layout.width * 0.62 - length), // its tail stopped right of centre
    };
  }, [strips, stripH, layout.width, layout.height]);

  useLayoutEffect(() => {
    if (stage !== 'return') return;
    const anims = strips.map((s, i) => {
      const el = stripRefs.current[i];
      if (s.id === home) return undefined;
      return el?.animate([
        { transform: `translate(${reel.to + reel.at[i] - s.left}px, ${reel.y - s.top}px) scale(${REEL_SCALE})`, easing: FLY_EASE },
        { transform: 'translate(0px, 0px) scale(1)' },
      ], { duration: REEL_FLY, delay: i * RETURN_STAGGER, fill: 'backwards' });
    });
    return () => anims.forEach(a => a?.cancel());
  }, [stage, strips, reel, home]);

  useLayoutEffect(() => {
    if (stage !== 'opening') return;
    const anims: Animation[] = [];
    strips.forEach((s, i) => {
      const el = stripRefs.current[i];
      if (!el) return;
      const place = (origin: number) =>
        `translate(${origin + reel.at[i] - s.left}px, ${reel.y - s.top}px) scale(${REEL_SCALE})`;
      const flyAt = REEL_CUT - REEL_IN + i * REEL_STAGGER;
      const total = flyAt + REEL_FLY;
      anims.push(el.animate([
        { offset: 0, transform: place(reel.from), easing: RUN_EASE },
        { offset: REEL_RUN / total, transform: place(reel.to), easing: 'linear' },
        { offset: flyAt / total, transform: place(reel.to), easing: FLY_EASE },
        { offset: 1, transform: 'translate(0px, 0px) scale(1)' },
      ], { duration: total, delay: REEL_IN, fill: 'backwards' }));
    });
    // The year counter: whichever room is passing the middle of the glass.
    let raf = 0;
    const first = stripRefs.current[0];
    const tick = () => {
      if (first && counterRef.current) {
        const m = new DOMMatrixReadOnly(getComputedStyle(first).transform);
        const origin = m.e - reel.at[0] + strips[0].left;
        const c = layout.width / 2 - origin;
        let year = layout.axisStart;
        strips.forEach((s, i) => {
          const w = s.width * REEL_SCALE;
          if (c >= reel.at[i] + w) year = s.yearEnd;
          else if (c >= reel.at[i]) year = Math.round(s.yearStart + ((c - reel.at[i]) / w) * (s.yearEnd - s.yearStart));
        });
        counterRef.current.textContent = String(Math.min(year, layout.axisEnd));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Stopped: it reads "now" as it gives way to the ruler.
    const stopCounter = setTimeout(() => {
      cancelAnimationFrame(raf);
      if (counterRef.current) counterRef.current.textContent = 'Now';
    }, REEL_IN + REEL_RUN - 60);
    return () => {
      anims.forEach(a => a.cancel());
      cancelAnimationFrame(raf);
      clearTimeout(stopCounter);
    };
  }, [stage, strips, reel, layout.width, layout.axisStart, layout.axisEnd]);

  useEffect(() => {
    if (stage !== 'opening' && stage !== 'return') return;
    const skip = () => setStage('on');
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, skip, { capture: true, passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, skip, { capture: true }));
  }, [stage]);

  // A pinned frame (from a tap) stays until a tap lands somewhere else.
  useEffect(() => {
    if (!active?.pinned) return;
    const away = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest('.lightbox__strip, .lightbox__card')) setActive(null);
    };
    window.addEventListener('pointerdown', away);
    return () => window.removeEventListener('pointerdown', away);
  }, [active?.pinned]);

  // What the loupe shows: the frame pointed at, or else the band on air.
  const airStrip = airing && playingId ? strips.find(s => s.id === playingId) ?? null : null;
  const airFrame = airStrip && airId ? airStrip.members.findIndex(m => m.id === airId) : -1;
  const shown: Active | null = active ?? (airStrip && airFrame >= 0 ? { id: airStrip.id, frame: airFrame, pinned: false } : null);
  const on = shown ? strips.find(s => s.id === shown.id) ?? null : null;
  const member = on && shown ? on.members[shown.frame] : null;

  // Where the shown frame sits on the sheet, for the circle and the card.
  const fx = on && shown ? on.left + LEADER + shown.frame * pitch : 0;
  const fy = on ? on.top + TOP_REBATE : 0;
  const below = on ? on.row < layout.rows / 2 : true;
  const cardLeft = Math.max(8, Math.min(layout.width - CARD_W - 8, fx + frameW / 2 - 52));
  // Below the strip in the top half; above it (grown upward) in the bottom half.
  const cardTop = on ? (below ? on.top + stripH + 10 : on.top - LABEL_H - 4) : 0;
  const endX = on ? (on.isOpenEnded ? yearToX(layout.axis, layout.axisEnd) : on.spanEnd) : 0;
  const rulerBottom = layout.rulerTop + RULER_H;

  return (
    <div
      ref={frameRef}
      className={`lightbox-frame${fit.scroll ? ' lightbox-frame--scroll' : ''}`}
    >
      <div
        ref={sheetRef}
        className="lightbox"
        data-stage={stage}
        data-phone={fit.phone || undefined}
        data-playing={playingId || undefined}
        onClick={e => {
          // A click on empty glass puts everything down.
          const t = e.target as HTMLElement;
          if (t === e.currentTarget || t.classList.contains('lightbox__light')) {
            setActive(null);
            if (loaded) player.stop();
          }
        }}
        style={{
          width: layout.width,
          height: layout.height,
          zoom: fit.phone ? undefined : fit.zoom,
          '--frame-w': `${frameW}px`,
          '--frame-h': `${frameH}px`,
          '--strip-h': `${stripH}px`,
        } as React.CSSProperties}
      >
        <div className="lightbox__light" aria-hidden />
        {stage === 'opening' && (
          <span ref={counterRef} className="lightbox__counter" style={{ top: reel.y - 96 }} aria-hidden>
            {layout.axisStart}
          </span>
        )}

        {strips.map((s, i) => {
          const isOn = shown?.id === s.id;
          const playing = playingId === s.id;
          const thisRoom = roomId === s.id;
          const lineX = s.left + s.nameWidth + PLAY_GAP + PLAY_W + SPAN_GAP;
          return (
            <Fragment key={s.id}>
              <span
                className="lightbox__name"
                aria-hidden
                style={{ '--x': `${s.left + 1}px`, '--y': `${s.top - LABEL_H}px`, '--i': i, color: s.ink } as React.CSSProperties}
              >
                {s.name}
              </span>
              <span
                className="lightbox__playwrap"
                style={{ '--x': `${s.left + s.nameWidth + PLAY_GAP}px`, '--y': `${s.top - LABEL_H}px`, '--name-w': `${s.nameWidth}px`, '--i': i, '--ink': s.ink } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="lightbox__play"
                  data-on={thisRoom || undefined}
                  aria-label={thisRoom && !now.paused ? `Pause ${s.name}` : `Play this scene: ${s.name}, a few seconds of each band`}
                  onClick={() => {
                    if (thisRoom && !now.paused) player.pause();
                    else if (thisRoom) player.resume();
                    else player.play(queues.get(s.id)!, 0);
                  }}
                >
                  <svg width="7" height="8" viewBox="0 0 8 9" aria-hidden>
                    {thisRoom && !now.paused
                      ? <path d="M1 0.5h2v8H1zM5 0.5h2v8H5z" />
                      : <path d="M1 0.5L7.5 4.5L1 8.5z" />}
                  </svg>
                  <span className="lightbox__play-label">{thisRoom ? (now.paused ? 'Carry on' : 'Pause') : 'Play this scene'}</span>
                </button>
                {thisRoom && (
                  <button type="button" className="lightbox__stop" aria-label={`Stop ${s.name}`} onClick={() => player.stop()}>
                    <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden><path d="M0.5 0.5h7v7h-7z" /></svg>
                  </button>
                )}
              </span>
              {/* How long the scene lasted: a grease-pencil line from its name to its end year. */}
              {s.spanEnd - lineX >= 14 && (
                <span
                  className="lightbox__span"
                  aria-hidden
                  data-open-ended={s.isOpenEnded || undefined}
                  style={{
                    '--x': `${lineX}px`,
                    '--y': `${s.top - LABEL_H / 2}px`,
                    '--w': `${s.spanEnd - lineX}px`,
                    '--i': i,
                    color: s.ink,
                  } as React.CSSProperties}
                />
              )}
              <Link
                ref={el => { stripRefs.current[i] = el; }}
                href={`/scene/${s.id}`}
                className="lightbox__strip"
                data-active={isOn || undefined}
                data-playing={playing || undefined}
                aria-label={`${s.name}, ${s.city}, ${s.era}: ${s.members.map(m => m.name).join(', ')}${starName(s) ? `. Starred: ${starName(s)}, the band here most named as an influence` : ''}`}
                style={{ '--x': `${s.left}px`, '--y': `${s.top}px`, '--w': `${s.width}px`, '--i': i, '--ink': s.ink } as React.CSSProperties}
                onPointerDown={e => { touch.current = e.pointerType !== 'mouse'; }}
                onPointerMove={e => {
                  if (e.pointerType !== 'mouse' || active?.pinned) return;
                  const f = frameOf(e.target, s);
                  if (f !== null && (!isOn || active?.frame !== f)) setActive({ id: s.id, frame: f, pinned: false });
                }}
                onPointerLeave={e => {
                  if (e.pointerType === 'mouse' && isOn && !active?.pinned) setActive(null);
                }}
                onClick={e => {
                  if (touch.current) {
                    const f = frameOf(e.target, s) ?? 0;
                    // First tap on a frame shows it; a second tap on the same one opens the scene.
                    if (!(isOn && active?.pinned && active.frame === f)) {
                      e.preventDefault();
                      setActive({ id: s.id, frame: f, pinned: true });
                      return;
                    }
                  }
                  // Going: the scene's page lets these faces fly up into its strip.
                  noteArrival({ kind: 'lightbox', scene: s.id });
                }}
                onFocus={() => { if (!isOn) setActive({ id: s.id, frame: 0, pinned: false }); }}
                onBlur={() => { if (isOn && !active?.pinned) setActive(null); }}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setActive(null); return; }
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                  e.preventDefault();
                  const cur = isOn && active ? active.frame : 0;
                  const next = Math.max(0, Math.min(s.members.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)));
                  setActive({ id: s.id, frame: next, pinned: false });
                }}
              >
                <span className="lightbox__holes" aria-hidden />
                <span className="lightbox__frames">
                  {s.members.map((m, k) => {
                    return (
                      <span
                        key={k}
                        className="lightbox__frame"
                        data-frame={k}
                        data-on={(isOn && shown?.frame === k) || undefined}
                        data-air={(airing && airId === m.id) || undefined}
                      >
                        {/* Each face shares its name with its frame on the scene's
                            page (and the artist's portrait), so it flies between them. */}
                        <ViewTransition name={`portrait-${m.id}`} share="morph" default="none">
                          {m.imageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={sizedImageUrl(m.imageUrl, 120)} alt="" draggable={false} decoding="async" />
                            : <span className="lightbox__initials">{m.name.replace(/^The /, '').slice(0, 2)}</span>}
                        </ViewTransition>
                        {m.id === s.starId && (
                          <svg className="lightbox__star" width={STAR} height={STAR} aria-hidden>
                            <path d={starPath(STAR)} />
                          </svg>
                        )}
                      </span>
                    );
                  })}
                </span>
                <span className="lightbox__edge" aria-hidden>{s.edge}</span>
              </Link>
              {/* Masking tape holding the strip's far end down. */}
              <span
                className="lightbox__tape"
                aria-hidden
                style={{ '--x': `${s.left + s.width - 17}px`, '--y': `${s.top - 4}px`, '--i': i } as React.CSSProperties}
              />

            </Fragment>
          );
        })}

        {layout.keySpot && (
          <aside
            className="lightbox__key"
            aria-label="How to read it"
            style={{ '--x': `${layout.keySpot.left}px`, '--y': `${layout.keySpot.top}px`, width: layout.keySpot.width, height: layout.keySpot.height } as React.CSSProperties}
          >
            <span className="lightbox__key-tape lightbox__key-tape--l" aria-hidden />
            <span className="lightbox__key-tape lightbox__key-tape--r" aria-hidden />
            <h2 className="lightbox__key-title">How to read it</h2>
            <ul className="lightbox__key-list">
              <li>
                <span className="lightbox__key-mark lightbox__key-mark--film" aria-hidden><i /><i /></span>
                <span>A scene: one frame for each band in it</span>
              </li>
              <li className="lightbox__key-span">
                <span className="lightbox__key-mark lightbox__key-mark--line" aria-hidden />
                <span>How long the scene lasted</span>
              </li>
              <li>
                <span className="lightbox__key-mark" aria-hidden>
                  <svg className="lightbox__star lightbox__star--key" width={STAR} height={STAR}><path d={starPath(STAR)} /></svg>
                </span>
                <span>The band there most named as an influence</span>
              </li>
              <li>
                <span className="lightbox__key-mark lightbox__key-mark--circle" aria-hidden><i /></span>
                <span>Point at a frame for a closer look; click to open the scene</span>
              </li>
              <li className="lightbox__key-threads">
                <span className="lightbox__key-mark lightbox__key-mark--arrows" aria-hidden>
                  <svg width="40" height="20" viewBox="0 0 40 20">
                    <path d="M3 15 Q18 1 33 9" style={{ stroke: RED }} />
                    <polygon points="36,10.5 28.5,10.8 32.2,4.6" style={{ fill: RED }} />
                  </svg>
                </span>
                <span>Arrows to the bands it <b className="lightbox__key-red">shaped</b> in other scenes, and from those that <b className="lightbox__key-blue">shaped it</b></span>
              </li>
              <li>
                <span className="lightbox__key-mark" aria-hidden><span className="lightbox__key-play"><svg width="7" height="8" viewBox="0 0 8 9"><path d="M1 0.5L7.5 4.5L1 8.5z" /></svg></span></span>
                <span>Play this scene: a few seconds of each band (or every scene, top right)</span>
              </li>
            </ul>
          </aside>
        )}

        {/* The ruler along the top: real years at their uneven spacing. */}
        <div className="lightbox__ruler" style={{ top: layout.rulerTop }} aria-hidden>
          {layout.ticks.map(t => (
            <span key={t.year} className={`lightbox__tick${t.label ? ' lightbox__tick--label' : ''}`} style={{ left: t.x }}>
              {t.label && <span>{t.year}</span>}
            </span>
          ))}
        </div>

        {on && member && !fit.phone && (member.shaped.length > 0 || member.shapedBy.length > 0) && (
          <svg
            key={`threads:${member.id}`}
            className="lightbox__threads"
            width={layout.width}
            height={layout.height}
            aria-hidden
          >
            {[...member.shaped.map(id => ({ id, out: true })), ...member.shapedBy.map(id => ({ id, out: false }))].map(({ id, out }, n) => {
              const here = centres.get(member.id), there = centres.get(id);
              if (!here || !there) return null;
              const { d, head } = out ? arrowPath(here, there) : arrowPath(there, here);
              const color = out ? RED : BLUE;
              return (
                <g key={`${out ? 'o' : 'i'}:${id}`} style={{ color, '--n': n } as React.CSSProperties}>
                  <rect
                    x={there.x - frameW / 2 - 3}
                    y={there.y - frameH / 2 - 3}
                    width={frameW + 6}
                    height={frameH + 6}
                    rx={3}
                    className="lightbox__thread-ring"
                  />
                  <path d={d} pathLength={1} className="lightbox__thread" />
                  <polygon points={head} className="lightbox__thread-head" />
                </g>
              );
            })}
          </svg>
        )}

        {on && member && (
          <>
            {!fit.phone && (
              <svg
                key={`${on.id}:${shown?.frame}`}
                className="lightbox__circle"
                width={frameW + 22}
                height={frameH + 22}
                style={{ left: fx - 11, top: fy - 11, color: on.ink }}
                aria-hidden
              >
                <path d={greaseLoop(frameW + 18, frameH + 18)} transform="translate(2 2)" pathLength={1} />
              </svg>
            )}
            {!fit.phone && (
              <>
                <span className="lightbox__drop" style={{ left: on.left, top: rulerBottom, height: on.top - LABEL_H - rulerBottom, color: on.ink }} aria-hidden />
                <span className="lightbox__drop" style={{ left: endX, top: rulerBottom, height: on.top - LABEL_H / 2 - rulerBottom, color: on.ink }} aria-hidden />
                <span className="lightbox__lit" style={{ left: on.left, top: layout.rulerTop, background: on.ink }} aria-hidden>{on.yearStart}</span>
                <span className="lightbox__lit" style={{ left: endX, top: layout.rulerTop, background: on.ink }} aria-hidden>
                  {on.isOpenEnded ? 'now' : on.yearEnd}
                </span>
              </>
            )}
            <div
              className="lightbox__card"
              data-pinned={shown?.pinned || undefined}
              style={fit.phone ? undefined : { left: cardLeft, top: cardTop, transform: below ? undefined : 'translateY(-100%)' }}
              role="status"
            >
              <span className="lightbox__loupe">
                {member.imageUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={sizedImageUrl(member.imageUrl, 250)} alt="" draggable={false} />
                  : <span className="lightbox__initials">{member.name.replace(/^The /, '').slice(0, 2)}</span>}
              </span>
              <span className="lightbox__card-text">
                <span className="lightbox__card-band">{member.name}</span>
                {member.id === on.starId && (
                  <span className="lightbox__card-star">&#9733; Named as an influence by {on.starCount} artists on the map</span>
                )}
                <span className="lightbox__card-scene" style={{ color: on.color }}>{on.name}</span>
                <span className="lightbox__card-when">{on.city} &middot; {on.era}</span>
                {(member.shaped.length > 0 || member.shapedBy.length > 0) && (
                  <span className="lightbox__card-threads">
                    {member.shaped.length > 0 && (
                      <span style={{ color: '#ff8a6e' }}>Shaped {member.shaped.length} {member.shaped.length === 1 ? 'band' : 'bands'} in other scenes</span>
                    )}
                    {member.shaped.length > 0 && member.shapedBy.length > 0 && ' · '}
                    {member.shapedBy.length > 0 && (
                      <span style={{ color: '#9db4ec' }}>shaped by {member.shapedBy.length}</span>
                    )}
                  </span>
                )}
                <span className="lightbox__card-with">
                  {on.members.length > 1
                    ? <>With {on.members.filter(m => m.id !== member.id).map(m => m.name).join(', ')}</>
                    : null}
                </span>
                {shown?.pinned
                  ? <Link className="lightbox__card-open" href={`/scene/${on.id}`}>Open the scene &rarr;</Link>
                  : !active && airStrip
                    ? <span className="lightbox__card-open">On air: {member.previewTrack ?? 'a few seconds'}</span>
                    : <span className="lightbox__card-open">Click to open the scene &rarr;</span>}
                <PhotoCredit credit={member.imageCredit} className="photo-credit--lightbox" />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
