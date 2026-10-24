'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Artist, GraphData } from '@/data/types';
import { familyOf } from '@/lib/family';
import { storyFrame } from '@/lib/story-store';
import { claimAudio, onAudioClaimed } from '@/lib/audio-focus';
import { connectAnalyser, readLevel, startStatic, type RadioStatic } from '@/lib/use-audio-level';

// A pocket radio that plays the artist's song and tunes through their musical
// family. Play starts their own song; Stop stops whatever is on. The stations
// are the artists who inspired them and the artists they inspired, laid out
// along the tuning window by the year each started, oldest on the left, with
// the artist among them at their own year.
//
// It shows it tunes rather than hoping someone tries: each station plays for
// STATION_MS, then the needle turns by itself to the next one, like a radio
// show, until Stop. ◀ ▶ (and the neighbours' names in the window) step
// through by hand; the knob turns, or steps on a tap; the window drags.
// Between stations there's static. When a station comes in, its artist and
// song light up on the display, their star rings on the map, and light runs
// down the line between them and the artist the panel is about (storyFrame,
// drawn by ForceGraph). The speaker thumps with whatever is playing.

interface Station {
  id: string;
  name: string;
  year: number | null;
  track: string | null;
  url: string;
  role: 'parent' | 'child' | 'self';
}

interface Props {
  artist: Artist;
  data: GraphData;
  /** Something else in the panel started playing: go quiet. */
  silenced: boolean;
  /** The radio made a sound: anything else should stop. */
  onSound: () => void;
}

const SNAP = 0.38;          // how near a station (a share of the gap between two) it comes in
const SETTLE_MS = 280;      // the needle easing onto a station when let go
const SWEEP_MS = 520;       // a longer swing (back to the artist, or round from the end)
const AUTO_MOVE_MS = 650;   // the needle turning by itself to the next station
const STATION_MS = 15000;   // how long each station plays before the radio moves on
const FLOW_EVERY_MS = 2600; // the light running down a tuned station's line, again and again
const FLOW_MS = 1500;
const VOLUME = 0.85;
const KNOB_TRAVEL_PX = 220; // dragging the knob this far turns the whole band
const KNOB_TAP_PX = 4;      // less movement than this is a tap: next station
const KNOB_TURN_DEG = 300;  // the knob's rotation from one end of the band to the other

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function RadioDial({ artist, data, silenced, onSound }: Props) {
  const stations = useMemo<Station[]>(() => {
    const byId = new Map(data.artists.map(a => [a.id, a]));
    const { parents, children } = familyOf(data.edges, artist.id);
    const list: Station[] = [];
    const add = (id: string, role: Station['role']) => {
      const a = byId.get(id);
      if (!a?.previewUrl) return;
      list.push({ id, name: a.name, year: a.activeFrom ?? null, track: a.previewTrack ?? null, url: a.previewUrl, role });
    };
    add(artist.id, 'self');
    parents.forEach(id => add(id, 'parent'));
    children.forEach(id => add(id, 'child'));
    return list.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.name.localeCompare(b.name));
  }, [artist.id, data]);

  const n = stations.length;
  const xOf = useCallback((i: number) => (i + 0.5) / n, [n]);
  const selfIndex = stations.findIndex(s => s.role === 'self'); // -1: no song of their own
  const nearestTo = useCallback((p: number) => Math.min(n - 1, Math.max(0, Math.round(p * n - 0.5))), [n]);

  const [pos, setPos] = useState(() => xOf(Math.max(0, selfIndex)));
  const [tunedIndex, setTunedIndex] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  const scaleRef = useRef<HTMLDivElement>(null);
  const grilleRef = useRef<HTMLSpanElement>(null);
  const displayRef = useRef<HTMLParagraphElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const staticRef = useRef<RadioStatic | null>(null);
  const posRef = useRef(pos);
  const tunedRef = useRef<number | null>(null);
  const tunedAtRef = useRef(0);
  const liveRef = useRef(false);
  const draggingRef = useRef(false);
  const knobRef = useRef<{ x: number; y: number; pos: number; moved: boolean } | null>(null);
  const settleRef = useRef(0);
  const loopRef = useRef(0);

  // One sound at a time across the site: the radio claims the audio when a
  // station comes in, and anything else starting switches it off (below).
  const [owner] = useState(() => Symbol('radio'));

  const setTuned = useCallback((tuned: number | null) => {
    if (tuned === tunedRef.current) return;
    tunedRef.current = tuned;
    tunedAtRef.current = performance.now();
    setTunedIndex(tuned);
    const audio = audioRef.current;
    if (audio) {
      if (tuned === null) {
        audio.pause();
      } else {
        if (audio.src !== stations[tuned].url) audio.src = stations[tuned].url;
        audio.currentTime = 0;
        claimAudio(owner);
        void audio.play().catch(() => {});
      }
    }
    const station = tuned === null ? null : stations[tuned];
    storyFrame.pulse = station && station.role !== 'self' ? [station.id] : [];
    storyFrame.playing = station?.id ?? null;
  }, [stations, owner]);

  // Where the needle is: which station is in, how much static, what plays.
  // `passing`: the needle is only on its way somewhere (a long swing), so
  // stations it crosses stay quiet.
  const tuneTo = useCallback((p: number, passing = false) => {
    posRef.current = p;
    setPos(p);
    if (!liveRef.current || n === 0) return;
    if (passing) {
      staticRef.current?.set(0.5);
      setTuned(null);
      return;
    }
    const nearest = nearestTo(p);
    const off = Math.abs(p * n - 0.5 - nearest); // 0 on a station, 0.5 midway
    staticRef.current?.set(off < 0.08 ? 0 : off * 2);
    const tuned = off < SNAP ? nearest : null;
    setTuned(tuned);
    const audio = audioRef.current;
    if (audio && tuned !== null) audio.volume = VOLUME * (1 - (off / SNAP) * 0.7);
  }, [n, nearestTo, setTuned]);

  // Ease the needle onto a station. A swing further than one station stays
  // quiet until it lands.
  const settleOn = useCallback((i: number, ms = SETTLE_MS) => {
    cancelAnimationFrame(settleRef.current);
    const from = posRef.current;
    const to = xOf(i);
    const start = performance.now();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const quiet = Math.abs(to - from) > 1.5 / n;
    const dur = quiet ? Math.max(ms, SWEEP_MS) : ms;
    const step = (now: number) => {
      const t = reduce ? 1 : clamp01((now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      tuneTo(from + (to - from) * e, quiet && t < 1);
      if (t < 1) settleRef.current = requestAnimationFrame(step);
    };
    settleRef.current = requestAnimationFrame(step);
  }, [n, tuneTo, xOf]);

  const switchOff = useCallback(() => {
    liveRef.current = false;
    setLive(false);
    cancelAnimationFrame(loopRef.current);
    cancelAnimationFrame(settleRef.current);
    audioRef.current?.pause();
    staticRef.current?.stop();
    staticRef.current = null;
    tunedRef.current = null;
    setTunedIndex(null);
    grilleRef.current?.style.setProperty('--thump', '0');
    displayRef.current?.style.setProperty('--progress', '0');
    storyFrame.pulse = [];
    storyFrame.flow = null;
    storyFrame.level = 0;
    storyFrame.playing = null;
  }, []);

  useEffect(() => onAudioClaimed(owner, switchOff), [owner, switchOff]);

  // While the radio's on: the light, the speaker, the display's progress
  // line, and moving on to the next station when this one's had its turn.
  const runLoop = useCallback(() => {
    const tick = (now: number) => {
      if (!liveRef.current) return;
      const at = tunedRef.current;
      const tuned = at === null ? null : stations[at];
      const since = now - tunedAtRef.current;
      const f = (since % FLOW_EVERY_MS) / FLOW_MS;
      storyFrame.flow = !tuned || tuned.role === 'self' || f >= 1 ? null
        : tuned.role === 'parent' ? { from: tuned.id, to: artist.id, t: f }
        : { from: artist.id, to: tuned.id, t: f };
      const level = readLevel(audioRef.current);
      storyFrame.level = level;
      grilleRef.current?.style.setProperty('--thump', level.toFixed(3));

      const held = draggingRef.current || knobRef.current !== null;
      displayRef.current?.style.setProperty('--progress', at === null || held ? '0' : clamp01(since / STATION_MS).toFixed(4));
      if (at !== null && !held && (since >= STATION_MS || audioRef.current?.ended)) {
        if (n < 2) { switchOff(); return; }
        tunedAtRef.current = now; // once per turn, while the needle moves
        settleOn((at + 1) % n, AUTO_MOVE_MS);
      }
      loopRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(loopRef.current);
    loopRef.current = requestAnimationFrame(tick);
  }, [artist.id, n, settleOn, stations, switchOff]);

  // Inside the gesture that first touches the radio, so the browser lets it
  // make a sound.
  const switchOn = useCallback(() => {
    if (liveRef.current) return;
    liveRef.current = true;
    setLive(true);
    connectAnalyser(audioRef.current);
    staticRef.current = startStatic();
    onSound();
    runLoop();
  }, [onSound, runLoop]);

  // Play: their own song (or, with none, the station under the needle).
  // Stop: whatever is on.
  const onPlay = () => {
    if (liveRef.current) { switchOff(); return; }
    switchOn();
    settleOn(selfIndex >= 0 ? selfIndex : nearestTo(posRef.current));
  };

  // ◀ ▶: one station along, round from the end to the start.
  const step = (dir: 1 | -1) => {
    switchOn();
    settleOn((nearestTo(posRef.current) + dir + n) % n);
  };

  // The tuning window: drag along it.
  const fromPointer = (clientX: number) => {
    const box = scaleRef.current?.getBoundingClientRect();
    return box ? clamp01((clientX - box.left) / box.width) : posRef.current;
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (n === 0) return;
    switchOn();
    draggingRef.current = true;
    cancelAnimationFrame(settleRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    tuneTo(fromPointer(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current) tuneTo(fromPointer(e.clientX));
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    settleOn(nearestTo(posRef.current));
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (n === 0 || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    step(e.key === 'ArrowRight' ? 1 : -1);
  };

  // The knob: turn it (drag right or up), or tap it. The first tap switches
  // the radio on at the station under the needle; each one after moves
  // along one.
  const knobTap = () => {
    const wasLive = liveRef.current;
    switchOn();
    const at = nearestTo(posRef.current);
    settleOn(wasLive ? (at + 1) % n : at);
  };
  const onKnobDown = (e: React.PointerEvent) => {
    if (n === 0) return;
    cancelAnimationFrame(settleRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    knobRef.current = { x: e.clientX, y: e.clientY, pos: posRef.current, moved: false };
  };
  const onKnobMove = (e: React.PointerEvent) => {
    const k = knobRef.current;
    if (!k) return;
    const dx = e.clientX - k.x;
    const dy = e.clientY - k.y;
    if (!k.moved && Math.hypot(dx, dy) < KNOB_TAP_PX) return;
    if (!k.moved) { k.moved = true; switchOn(); }
    tuneTo(clamp01(k.pos + (dx - dy) / KNOB_TRAVEL_PX));
  };
  const onKnobUp = () => {
    const k = knobRef.current;
    knobRef.current = null;
    if (!k) return;
    if (k.moved) settleOn(nearestTo(posRef.current));
    else knobTap();
  };

  // Another sound in the panel took over; or the panel moved on.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: an outside sound (the panel's own player) switches the radio off
    if (silenced) switchOff();
  }, [silenced, switchOff]);
  useEffect(() => () => switchOff(), [switchOff]);

  if (n === 0) return null;
  const tuned = tunedIndex === null ? null : stations[tunedIndex];
  const nearestIndex = nearestTo(pos);
  const prev = nearestIndex > 0 ? stations[nearestIndex - 1] : null;
  const next = nearestIndex < n - 1 ? stations[nearestIndex + 1] : null;
  const first = stations[0].year;
  const last = stations[n - 1].year;
  const self = selfIndex >= 0 ? stations[selfIndex] : null;
  // Off the air, the display shows what Play will play.
  const onDisplay = live ? tuned : (self ?? stations[nearestIndex]);
  const hasParents = stations.some(s => s.role === 'parent');
  const hasChildren = stations.some(s => s.role === 'child');
  const pct = pos * 100;

  return (
    <div className={`radio${live ? ' radio--live' : ''}`}>
      <div className="radio__body">
        {/* The tuning window. */}
        <div
          ref={scaleRef}
          className="radio__window"
          role="slider"
          tabIndex={0}
          aria-label={`Tune through the artists who inspired ${artist.name} and the artists they inspired`}
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={nearestIndex}
          aria-valuetext={`${stations[nearestIndex].name}${stations[nearestIndex].year ? `, ${stations[nearestIndex].year}` : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          {stations.map((s, i) => (
            <span
              key={s.id}
              className={`radio__station radio__station--${s.role}${i === tunedIndex ? ' radio__station--on' : ''}`}
              style={{ left: `${xOf(i) * 100}%` }}
              aria-hidden
            />
          ))}
          {/* The stations either side of the needle, by name: tap one to
              go there. (◀ ▶ do the same for keyboards and screen readers.) */}
          {prev && (
            <span
              className="radio__near radio__near--prev"
              style={{ right: `calc(${100 - pct}% + 7px)`, maxWidth: `calc(${pct}% - 12px)` }}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => step(-1)}
              aria-hidden
            >
              ‹ {prev.name}
            </span>
          )}
          {next && (
            <span
              className="radio__near radio__near--next"
              style={{ left: `calc(${pct}% + 7px)`, maxWidth: `calc(${100 - pct}% - 12px)` }}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => step(1)}
              aria-hidden
            >
              {next.name} ›
            </span>
          )}
          <span className="radio__needle" style={{ left: `${pct}%` }} aria-hidden />
        </div>

        {/* Who's on: their name and song, lit. The line along the bottom
            fills while the station has its turn. */}
        <p ref={displayRef} className={`radio__display${live ? '' : ' radio__display--off'}`}>
          {onDisplay ? (
            <>
              <strong>{onDisplay.name}</strong>
              {onDisplay.track && <> · {onDisplay.track}</>}
            </>
          ) : (
            <span className="radio__display-static">· · · tuning · · ·</span>
          )}
        </p>

        <div className="radio__front">
          <button
            type="button"
            className="radio__step"
            onClick={() => step(-1)}
            aria-label={`Previous station${prev ? `: ${prev.name}` : ''}`}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden>
              <path d="M8.5 1.2v8.6L1.5 5.5z" />
            </svg>
          </button>
          <button
            type="button"
            className={`radio__play${live ? ' radio__play--on' : ''}`}
            onClick={onPlay}
            aria-label={live ? 'Stop the radio' : `Play ${artist.name}${self?.track ? `: ${self.track}` : ''}`}
          >
            <span className="radio__play-icon" aria-hidden>
              {live ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="1.5" y="1.5" width="9" height="9" rx="1.2" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 13 13" fill="currentColor">
                  <path d="M3 1.8 11 6.5 3 11.2V1.8z" />
                </svg>
              )}
            </span>
            <span className="radio__play-verb">{live ? 'Stop' : 'Play'}</span>
          </button>
          <button
            type="button"
            className="radio__step"
            onClick={() => step(1)}
            aria-label={`Next station${next ? `: ${next.name}` : ''}`}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden>
              <path d="M2.5 1.2v8.6l7-4.3z" />
            </svg>
          </button>
          <span ref={grilleRef} className="radio__grille" aria-hidden />
          <button
            type="button"
            className="radio__knob"
            aria-label="Next station"
            title="Turn, or tap for the next station"
            onPointerDown={onKnobDown}
            onPointerMove={onKnobMove}
            onPointerUp={onKnobUp}
            onPointerCancel={onKnobUp}
            // Keyboard presses arrive as a click with no pointer behind it.
            onClick={e => { if (e.detail === 0) knobTap(); }}
          >
            <span className="radio__knob-grip" style={{ rotate: `${(pos - 0.5) * KNOB_TURN_DEG}deg` }} />
          </button>
        </div>
      </div>

      <div className="radio__legend" aria-hidden>
        <span>{first ?? ''}</span>
        <span className="radio__key">
          {hasParents && <><i className="radio__key-dot radio__key-dot--parent" />inspired them</>}
          {hasChildren && <><i className="radio__key-dot radio__key-dot--child" />they inspired</>}
        </span>
        <span>{last ?? ''}</span>
      </div>

      <p className="radio__readout" aria-live="polite">
        {!live ? (
          <span className="radio__hint">
            Press play{self ? ' to hear them' : ''}. Then it plays who inspired them, and who they inspired — or skip with ◀ ▶.
          </span>
        ) : tuned ? (
          <>
            <span className="radio__on-air">On air</span>{' '}
            {tuned.role === 'self' ? (
              <><strong>{artist.name}</strong>, their own song</>
            ) : tuned.role === 'parent' ? (
              <><strong>{tuned.name}</strong>, who inspired {artist.name}</>
            ) : (
              <><strong>{tuned.name}</strong>, inspired by {artist.name}</>
            )}
          </>
        ) : (
          <span className="radio__static">…static…</span>
        )}
      </p>
      <audio ref={audioRef} crossOrigin="anonymous" preload="none" />
    </div>
  );
}
