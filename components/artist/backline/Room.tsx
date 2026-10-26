'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { onAir as trackOnAir, player, usePlayer, type Queue } from '@/lib/player';
import { storyFrame } from '@/lib/story-store';
import { musicReader } from '@/lib/music-motion';
import { BANDS, notePicker } from '@/lib/song-notes';
import { stringOf, stringState, strumOrder } from '@/lib/strings';
import type { Backline, Kit } from '@/lib/backline';
import Wall from './Wall';
import Bass, { BASS_H, BASS_PIVOT, BASS_REACH, BASS_STRINGS, BASS_STRUM_Y, BASS_W, bassStringX } from './Bass';
import Guitar, { GUITAR_H, GUITAR_PIVOT, GUITAR_REACH, GUITAR_STRINGS, GUITAR_STRUM_Y, GUITAR_W, guitarStringX } from './Guitar';
import Acoustic, { ACOUSTIC_H, ACOUSTIC_PIVOT, ACOUSTIC_REACH, ACOUSTIC_STRINGS, ACOUSTIC_STRUM_Y, ACOUSTIC_W, acousticStringX } from './Acoustic';
import GuitarCase, { CASE_H, CASE_REACH, CASE_W } from './GuitarCase';
import Synth, { SYNTH_H, SYNTH_KEYS, SYNTH_REACH, SYNTH_W } from './Synth';
import Rig, { RIG_H, RIG_REACH, RIG_STEPS, RIG_W } from './Rig';

// The room behind the artist's page, in the spirit of a Tiny Desk session:
// bookcases crammed with their family's records and a wall plastered with
// posters (Wall, from lib/backline), and in front, two pieces of gear chosen
// by the artist's sound (KITS), wearing badges of the bands that shaped them
// and stickers of the bands they shaped:
// - a band: a bass and an electric guitar, held at an angle on camo straps by
//   unseen players, necks leaning in towards the page;
// - folk: an acoustic, held the same way, and its sticker-covered case
//   standing on the floor;
// - electronic: a synth on an X-stand, and a speaker with a drum machine on top.
// When a song plays they're played like a band plays: a pick strums each note
// the song strikes and the string it hits blurs the way a vibrating string
// does (the bass takes the low notes, the guitar the high; the acoustic all
// of them); the synth's keys go down on the notes and its knobs turn with the
// swell; the woofer pumps on the low notes and the drum machine's step light
// runs in time; sound rings out into the room from wherever it's made (the
// pick, the soundhole, the keys, the woofer and tweeter) -- thin rings that
// spread and fade, drifting faintly over the page (two-fifths as strong there,
// so they're seen without getting in the way of reading). A new song strums
// the guitar. Each piece bobs on the beat and
// sways across the bar -- the held ones swing their necks up when the song
// swells; the ribbon flutters; the badge or sticker of whoever's on air lifts
// off. When the music stops they settle back and go still.
//
// Sound never starts on its own (browsers block it, and it annoys). So the
// magic shows without it: once the family photo is taken, the band does a
// silent soundcheck (SOUNDCHECK: a strum, a bass note, a run up the synth, a
// thump), every time the page opens; then a note says to tap an instrument --
// tapping any of them plays the artist, as the pocket player would. Music
// already playing from anywhere on the site carries on, and they play along.
//
// It's all decoration, pinned to the screen behind the sheets. Per frame,
// only while something moves: a couple of dozen transforms. Nothing changes
// brightness. Reduced motion keeps it still.

const PAD = 14;                        // room either side of a piece in its column
const MIN_INSTRUMENT = 70;             // narrower than this and it's not drawn
const OVERLAP = 20;                    // how far a piece reaches over the page: its margin, never its words
const SOUNDCHECK_MS = 1500;            // the silent soundcheck, start to finish
const SCALE_RUN = [0, 2, 4, 5, 7, 9, 11, 12]; // up the synth, a major scale

/** The note after the soundcheck, by kit. */
const HINT: Record<Kit, string> = {
  band: 'Tap the bass or the guitar to hear them: the band plays along.',
  folk: 'Tap the guitar to hear them: it plays along.',
  electronic: 'Tap the synth to hear them: the gear plays along.',
};

/** How each piece is held and moves. They lean in towards the page (`side`:
 *  +1 on the left, -1 on the right) by `tilt`, placed just where their inner
 *  side crosses the page's edge by OVERLAP -- so they stand in front of the
 *  page, over its margin and never its words (holdAt). A held instrument's
 *  neck swinging up turns it back towards upright. They sway as far as they
 *  like away from the page, but only `reach` degrees further towards it. */
interface Player { side: number; tilt: number; maxTilt: number; lean: number; dip: number; lift: number; reach: number }

type Place = 'held-low' | 'held-high' | 'floor' | 'mount';
type PieceKind = 'bass' | 'guitar' | 'acoustic' | 'case' | 'synth' | 'rig';

interface PieceSpec {
  w: number;
  h: number;
  /** What it turns about: where it's held, or what it stands on. */
  pivot: readonly [number, number];
  /** Its side nearest the page. */
  reach: readonly (readonly [number, number])[];
  place: Place;
  /** How much of its column it fills, across. */
  fill: number;
  /** At most this share of the window, tall. */
  tall: number;
  player: Player;
}

const PIECES: Record<PieceKind, PieceSpec> = {
  bass: { w: BASS_W, h: BASS_H, pivot: BASS_PIVOT, reach: BASS_REACH, place: 'held-low', fill: 1.2, tall: 0.92, player: { side: 1, tilt: 15, maxTilt: 15, lean: 2.2, dip: 7, lift: 9, reach: 1.5 } },
  guitar: { w: GUITAR_W, h: GUITAR_H, pivot: GUITAR_PIVOT, reach: GUITAR_REACH, place: 'held-high', fill: 1.15, tall: 0.66, player: { side: -1, tilt: 16, maxTilt: 16, lean: 3.6, dip: 10, lift: 13, reach: 2.5 } },
  acoustic: { w: ACOUSTIC_W, h: ACOUSTIC_H, pivot: ACOUSTIC_PIVOT, reach: ACOUSTIC_REACH, place: 'held-high', fill: 1.1, tall: 0.66, player: { side: -1, tilt: 14, maxTilt: 14, lean: 2.8, dip: 8, lift: 10, reach: 2 } },
  case: { w: CASE_W, h: CASE_H, pivot: [220, CASE_H], reach: CASE_REACH, place: 'floor', fill: 0.85, tall: 0.6, player: { side: 1, tilt: 4, maxTilt: 4, lean: 0.5, dip: 2, lift: 0, reach: 0.5 } },
  synth: { w: SYNTH_W, h: SYNTH_H, pivot: [300, SYNTH_H], reach: SYNTH_REACH, place: 'floor', fill: 1, tall: 0.5, player: { side: 1, tilt: 2, maxTilt: 2, lean: 0.6, dip: 3, lift: 0, reach: 0.6 } },
  rig: { w: RIG_W, h: RIG_H, pivot: [170, 450], reach: RIG_REACH, place: 'mount', fill: 0.92, tall: 0.66, player: { side: -1, tilt: 2, maxTilt: 2, lean: 0.5, dip: 6, lift: 0, reach: 0.5 } },
};

/** The gear for each sound: [left column, right column]. */
const KITS: Record<Kit, [PieceKind, PieceKind]> = {
  band: ['bass', 'guitar'],
  folk: ['case', 'acoustic'],
  electronic: ['synth', 'rig'],
};

/** The strings of each held instrument, where its pick strums, and how
 *  long its notes ring. */
const STRUNG: Partial<Record<PieceKind, { count: number; x: (i: number, y: number) => number; strumY: number; pickFrom: number; decay: (i: number) => number }>> = {
  bass: { count: BASS_STRINGS.length, x: bassStringX, strumY: BASS_STRUM_Y, pickFrom: bassStringX(0, BASS_STRUM_Y) - 16, decay: i => 0.95 - i * 0.1 },
  guitar: { count: GUITAR_STRINGS.length, x: guitarStringX, strumY: GUITAR_STRUM_Y, pickFrom: guitarStringX(0, GUITAR_STRUM_Y) - 14, decay: i => 0.7 - i * 0.07 },
  acoustic: { count: ACOUSTIC_STRINGS.length, x: acousticStringX, strumY: ACOUSTIC_STRUM_Y, pickFrom: acousticStringX(0, ACOUSTIC_STRUM_Y) - 14, decay: i => 0.9 - i * 0.08 },
};

/** Where to hold a piece (screen x) so that, leaning in by its tilt and
 *  swaying `reach` further, its inner side just reaches `limit`: the page's
 *  edge plus OVERLAP. Kept within [min, max] of its column; when that stops
 *  it short of the page, it leans less instead (fitTilt). */
function holdAt(p: Player, points: readonly (readonly [number, number])[], pivot: readonly [number, number], k: number, limit: number, min: number, max: number) {
  const a = ((p.tilt + p.reach) * p.side * Math.PI) / 180;
  const rot = points.map(([x, y]) => ((x - pivot[0]) * Math.cos(a) - (y - pivot[1]) * Math.sin(a)) * k);
  const px = limit - (p.side > 0 ? Math.max(...rot) : Math.min(...rot));
  const held = Math.min(max, Math.max(min, px));
  // Held further in than it would be: lean less, so it still only reaches the margin.
  const tilt = held === px || (p.side > 0 ? held < px : held > px) ? p.tilt * p.side : fitTilt(p, points, pivot, k, held, limit);
  return { px: held, tilt };
}

/** The most a piece can lean in, held at screen x `px`, before its inner
 *  side (`points`, in its own units, turning about `pivot`) reaches past
 *  `limit`. Returned signed, the way it's turned. */
function fitTilt(p: Player, points: readonly (readonly [number, number])[], pivot: readonly [number, number], k: number, px: number, limit: number): number {
  for (let t = p.maxTilt; t > 0; t -= 1) {
    const a = ((t + p.reach) * p.side * Math.PI) / 180;
    const reach = Math.max(...points.map(([x, y]) => p.side * (px + ((x - pivot[0]) * Math.cos(a) - (y - pivot[1]) * Math.sin(a)) * k)));
    if (reach <= p.side * limit) return t * p.side;
  }
  return 0;
}

/** Where a piece is: its box, its scale and its resting tilt. */
interface Held { kind: PieceKind; left: number; top: number; k: number; tilt: number }

interface Layout {
  W: number;
  H: number;
  L: number;
  R: number;
  pieces: [Held | null, Held | null];
}

/** Each piece of a kit placed in its column. */
function placePieces(kit: Kit, W: number, H: number, L: number, R: number, nav: number): [Held | null, Held | null] {
  return KITS[kit].map((kind, slot) => {
    const s = PIECES[kind];
    const col = slot === 0 ? L : R;
    const k = Math.min(((col - 2 * PAD) * s.fill) / s.w, s.place === 'held-low' ? (H - nav - 50) / (s.h * 0.95) : (H * s.tall - (s.place === 'floor' ? 0 : nav)) / (s.h * 0.94));
    if (s.w * k < MIN_INSTRUMENT) return null;
    const limit = slot === 0 ? L + OVERLAP : W - R - OVERLAP;
    const [min, max] = slot === 0 ? [L * 0.2, L * 0.7] : [W - R * 0.7, W - R * 0.2];
    const { px, tilt } = holdAt(s.player, s.reach, s.pivot, k, limit, min, max);
    const py = s.place === 'held-low'
      ? Math.min(H - (s.h - s.pivot[1]) * k - 10, nav + s.pivot[1] * k * 0.95 + (H - nav) * 0.04)
      : s.place === 'floor' ? H + 4
        : nav + 16 + s.pivot[1] * k * 0.94;
    return { kind, k, tilt, left: px - s.pivot[0] * k, top: py - s.pivot[1] * k };
  }) as [Held | null, Held | null];
}

/** One unseen player's motion: bob, sway, the neck swinging up, a strum's
 *  nudge -- all eased, the way a body moves, never a twitch. Every input is
 *  smoothed and the result follows it like a weight on a spring, so a busy
 *  song makes them move more, not shake (the first version jumped up to
 *  2.6deg in a frame and changed direction ~9 times a second). */
function playerMotion(p: Player, tilt: number) {
  let phase = 0;
  let phaseTo = 0;
  let dipKick = 0;
  let dip = 0;
  let liftKick = 0;
  let lift = 0;
  let nudgeTo = 0;
  let nudge = 0;
  let angle = tilt;
  let y = 0;
  return {
    beat() { phaseTo += Math.PI / 2; dipKick = 1; },
    hit() { dipKick = Math.max(dipKick, 0.6); },
    swell() { liftKick = 1; },
    // A strum leans it a little the way the pick went; strokes that come
    // fast average out instead of rattling it back and forth.
    strum(dir: number) { nudgeTo = nudgeTo * 0.5 + dir * 0.5; },
    step(dt: number, on: boolean, energy: number) {
      phase += (phaseTo - phase) * Math.min(1, dt * 3);
      dipKick *= Math.exp(-dt / 0.22);
      dip += (dipKick - dip) * Math.min(1, dt * 9);
      liftKick *= Math.exp(-dt / 1.4);
      lift += (liftKick - lift) * Math.min(1, dt * 3);
      nudgeTo *= Math.exp(-dt / 0.35);
      nudge += (nudgeTo - nudge) * Math.min(1, dt * 5);
      const sway = on ? Math.sin(phase) * p.lean * (0.4 + energy) : 0;
      const neckUp = lift * p.lift * p.side;
      const turned = tilt + sway - neckUp + nudge * 0.6;
      // Never further in than the page's margin allows.
      const target = p.side * Math.min(p.side * turned, Math.abs(tilt) + p.reach);
      const targetY = dip * p.dip * (0.6 + 0.4 * energy);
      angle += (target - angle) * Math.min(1, dt * 6);
      y += (targetY - y) * Math.min(1, dt * 8);
      return {
        angle,
        y,
        moving: Math.abs(sway) > 0.02 || dip > 0.01 || lift > 0.01 || Math.abs(nudge) > 0.01 || Math.abs(target - angle) > 0.01 || y > 0.05,
      };
    },
  };
}

/** The pick across one instrument's strings: a sweep for a chord or a strum,
 *  a flick at one string for a single note, each stroke the other way. */
function pickMotion(xs: number[]) {
  let x = xs[0] - 10;
  let to = x;
  let dir = 1;
  return {
    play(strings: number[]) {
      if (strings.length >= 2) to = dir > 0 ? xs[xs.length - 1] + 12 : xs[0] - 12;
      else to = xs[strings[0]] + dir * 8;
      dir = -dir;
      return -dir;
    },
    step(dt: number) {
      x += (to - x) * Math.min(1, dt * 28);
      return { x, y: -Math.min(7, Math.abs(to - x) * 0.2), tilt: dir > 0 ? 14 : -10 };
    },
  };
}

export default function Room({ backline, genres, finish, ribbon, seed, page = '.artist-family', soundcheck = true, queue = null, onPlay, hint }: {
  backline: Backline;
  /** The sounds they're filed under, for type posters on the wall. */
  genres: string[];
  finish: string;
  ribbon: string;
  seed: string;
  /** The page's column of paper, which the room keeps clear of. */
  page?: string;
  /** The silent soundcheck when the page opens (not where the page has its own opening). */
  soundcheck?: boolean;
  /** What a tap on an instrument plays; else what the pocket player would. */
  queue?: Queue | null;
  /** Or what a tap does when nothing's loaded (the About page starts its tape where the reader is). */
  onPlay?: () => void;
  /** The note on how to hear them, if not the kit's own. */
  hint?: string;
}) {
  const now = usePlayer();
  const on = now.at !== null && !now.paused && !!now.queue?.tracks[now.at]?.previewUrl;
  const song = now.queue && now.at !== null ? `${now.queue.id}:${now.at}` : null;
  const onAirId = on ? trackOnAir(now)?.id ?? null : null;
  const [layout, setLayout] = useState<Layout | null>(null);
  const [away, setAway] = useState(false);
  const [checkedHere, setCheckedHere] = useState(false);
  /** Whose page the soundcheck last ran for: once each time a page opens, not on a resize. */
  const checkedFor = useRef<string | null>(null);
  const live = useRef({ on, song });
  const wake = useRef<() => void>(() => {});
  /** Strum the band once, silently: the soundcheck, or a tap while playing. */
  const poke = useRef<(full: boolean) => void>(() => {});
  // What moves, per column: the piece itself, a string's blur, the pick,
  // the synth's keys and knobs, the woofer, the drum machine's step lights.
  const bodies = useRef<(HTMLDivElement | null)[]>([]);
  const blurs = useRef<(SVGPathElement | null)[][]>([[], []]);
  const picks = useRef<(SVGGElement | null)[]>([]);
  const keys = useRef<(SVGRectElement | null)[]>([]);
  const knobs = useRef<(SVGGElement | null)[]>([]);
  const cone = useRef<SVGGElement | null>(null);
  const tweeter = useRef<SVGGElement | null>(null);
  const air = useRef<HTMLDivElement>(null);
  const steps = useRef<(SVGCircleElement | null)[]>([]);
  const tails = useRef<(SVGGElement | null)[]>([]);
  const roomRef = useRef<HTMLDivElement>(null);
  const kit = backline.kit;

  // The credits at the foot of the page run the full width: the band steps
  // back while they're on screen.
  useEffect(() => {
    const foot = document.querySelector('.site-foot');
    if (!foot) return;
    const io = new IntersectionObserver(([e]) => setAway(e.isIntersecting));
    io.observe(foot);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    live.current = { on, song };
    wake.current();
  }, [on, song]);

  // Measure the room: the dark either side of the page, and the window.
  useEffect(() => {
    let laid = '';
    const measure = () => {
      const column = document.querySelector<HTMLElement>(page);
      if (!column) return;
      const r = column.getBoundingClientRect();
      const cs = getComputedStyle(column);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const L = Math.max(0, r.left + parseFloat(cs.paddingLeft));
      const R = Math.max(0, W - (r.right - parseFloat(cs.paddingRight)));
      const key = `${W}:${H}:${Math.round(L)}:${Math.round(R)}`;
      if (key === laid) return;
      laid = key;
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 46;
      setLayout({ W, H, L, R, pieces: placePieces(kit, W, H, L, R, nav) });
    };
    measure();
    let timer = 0;
    const onResize = () => { window.clearTimeout(timer); timer = window.setTimeout(measure, 150); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.clearTimeout(timer); };
  }, [kit, page]);

  // The band plays along.
  useEffect(() => {
    if (!layout || !layout.pieces.some(Boolean)) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) return;
    const reader = musicReader();
    const picker = notePicker();
    const pieces = layout.pieces.map(held => {
      if (!held) return null;
      const strung = STRUNG[held.kind];
      return {
        held,
        player: playerMotion(PIECES[held.kind].player, held.tilt),
        strings: strung ? Array.from({ length: strung.count }, (_, i) => stringState({ decay: strung.decay(i) })) : [],
        pick: strung ? pickMotion(Array.from({ length: strung.count }, (_, i) => strung.x(i, strung.strumY) - strung.pickFrom)) : null,
      };
    });
    const strungSlots = pieces.flatMap((p, slot) => (p && p.strings.length ? [slot] : []));
    // Which string a band of the song plucks: with two strung instruments the
    // left takes the low half, the right the high; with one, it takes them all.
    const stringFor = (band: number): { slot: number; index: number } | null => {
      if (strungSlots.length === 2) {
        const { high, index } = stringOf(band, pieces[0]!.strings.length, pieces[1]!.strings.length);
        return { slot: high ? 1 : 0, index };
      }
      if (strungSlots.length === 1) {
        const slot = strungSlots[0];
        return { slot, index: Math.min(pieces[slot]!.strings.length - 1, Math.floor((band * pieces[slot]!.strings.length) / BANDS)) };
      }
      return null;
    };
    const keyDown = new Float64Array(SYNTH_KEYS.length).fill(-Infinity);
    const keyShown = new Uint8Array(SYNTH_KEYS.length);
    let pump = 0;
    let pumpKick = 0;
    let tweet = 0;
    let step = 0;
    let stepShown = -1;
    let lastStep = -Infinity;
    let knob = 0;
    let raf = 0;
    let lastT = 0;
    let lastSong: string | null = null;
    let strum: { at: number; slot: number; index: number }[] = [];
    let phase = 0;
    let wasSwelling = false;
    let lastSwell = -Infinity;
    let flick = 0;
    // The room rattling on the big low hits: a few marked things in it (Wall).
    let shake = 0;
    let shakePhase = 0;
    let shaking = false;
    let lastShake = -Infinity;
    // Sound in the air: rings spreading out of each piece, from a small pool
    // per column, each started by the Web Animations API (the compositor's job).
    const pools = [0, 1].map(() => (air.current ? Array.from({ length: 12 }, () => {
      const el = document.createElement('span');
      el.className = 'room__ring';
      air.current!.appendChild(el);
      return el;
    }) : []));
    const poolAt = [0, 0];
    const lastRing = new Map<string, number>();
    const ring = (slot: number, from: Element | null | undefined, size: number, strength: number, key: string, gap: number, t: number) => {
      const pool = pools[slot];
      if (!from || !pool?.length || t - (lastRing.get(key) ?? -Infinity) < gap) return;
      lastRing.set(key, t);
      const r = from.getBoundingClientRect();
      const el = pool[poolAt[slot]++ % pool.length];
      el.getAnimations().forEach(a => a.cancel());
      el.style.left = `${r.left + r.width / 2}px`;
      el.style.top = `${r.top + r.height / 2}px`;
      el.style.width = el.style.height = `${Math.round(size)}px`;
      const a = Math.min(1, 0.55 + 0.45 * strength);
      el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.22)', opacity: a },
          { transform: 'translate(-50%, -50%) scale(0.66)', opacity: a * 0.8, offset: 0.45 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
        ],
        { duration: 800 + 450 * strength, easing: 'cubic-bezier(0.2, 0.55, 0.35, 1)' },
      );
    };
    // Where each piece's sound comes from: its soundhole or keys if it has
    // them, else the pick, where the strings are struck.
    const sourceOf = (slot: number) => bodies.current[slot]?.querySelector('.bline__source') ?? picks.current[slot];
    const rattlers = [...(roomRef.current?.querySelectorAll<HTMLElement>('[data-rattle]') ?? [])].map(el => {
      const cs = getComputedStyle(el);
      return { el, x: parseFloat(cs.getPropertyValue('--rx')) || 0, y: parseFloat(cs.getPropertyValue('--ry')) || 0, r: parseFloat(cs.getPropertyValue('--rr')) || 0 };
    });
    // The soundcheck in progress: when it started, and which of its moments have played.
    let check: { start: number; fired: Set<number>; full: boolean } | null = null;
    const endCheck = () => {
      if (!check) return;
      check = null;
      setCheckedHere(true);
    };
    const six = strungSlots.find(slot => pieces[slot]!.strings.length === 6);
    const low = strungSlots.find(slot => slot !== six) ?? six;
    const pluckOn = (slot: number | undefined, index: number, strength = 0.8) => {
      const p = slot === undefined ? null : pieces[slot];
      if (!p?.pick || !p.strings[index]) return;
      p.strings[index].pluck(strength);
      const dir = p.pick.play([index]);
      if (p.strings.length === 6) p.player.strum(dir); else p.player.hit();
    };
    /** The soundcheck's moments, ms from its start. */
    const SOUNDCHECK: [number, (t: number) => void][] = [
      [0, t => {
        if (six !== undefined) {
          strum = strumOrder(6).map((d, i) => ({ at: t + d, slot: six, index: i }));
          pieces[six]!.player.strum(pieces[six]!.pick!.play([0, 1, 2, 3, 4, 5]));
          ring(six, sourceOf(six), 240, 1, `c${six}`, 0, t);
          window.setTimeout(() => ring(six, sourceOf(six), 300, 0.7, `c${six}b`, 0, performance.now()), 140);
        }
        if (low !== six) pluckOn(low, 0);
        pieces.forEach(p => p?.player.beat());
        flick = 1;
        pumpKick = 1;
        shake = 1;
      }],
      [450, () => {
        if (low !== six) pluckOn(low, 1, 0.7);
        pieces.forEach(p => p?.player.beat());
        pumpKick = 1;
      }],
      [900, () => { pluckOn(six, 4, 0.7); flick = 0.6; }],
      ...SCALE_RUN.map((semi, i): [number, (t: number) => void] => [120 + i * 70, t => { keyDown[semi] = t; }]),
    ];

    const levelOf = (from: number, to: number) => {
      let l = 0;
      for (let b = from; b < to; b++) l = Math.max(l, storyFrame.bands[b] ?? 0);
      return l;
    };
    const place = (el: Element | null, transform: string) => {
      if (el) (el as HTMLElement).style.transform = transform;
    };

    const frame = (t: number) => {
      raf = 0;
      const dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;
      const { on, song } = live.current;
      const m = reader.step(on ? storyFrame.level : 0, t);
      const notes = on ? picker.step(storyFrame.bands, t) : [];
      if (check) {
        const elapsed = t - check.start;
        SOUNDCHECK.forEach(([at, fn], i) => {
          if (elapsed >= at && !check!.fired.has(i)) { check!.fired.add(i); fn(t); }
        });
        // The drum machine's light runs once across its steps.
        if (elapsed < 640) step = Math.min(RIG_STEPS - 1, Math.floor(elapsed / 40));
        if (elapsed > SOUNDCHECK_MS) endCheck();
      }
      if (on && song !== lastSong) {
        // A new song: the six-string strummed, string by string.
        const six = strungSlots.find(slot => pieces[slot]!.strings.length === 6);
        strum = six === undefined ? [] : strumOrder(6).map((d, i) => ({ at: t + d, slot: six, index: i }));
        if (six !== undefined) pieces[six]!.player.strum(pieces[six]!.pick!.play([0, 1, 2, 3, 4, 5]));
        picker.reset();
      }
      lastSong = song;

      // The strings played this frame, and the picks that play them.
      const hit: number[][] = [[], []];
      while (strum.length && strum[0].at <= t) {
        const s = strum.shift()!;
        pieces[s.slot]!.strings[s.index].pluck(0.8);
      }
      for (const n of notes) {
        const at = stringFor(n.band);
        if (!at) continue;
        pieces[at.slot]!.strings[at.index].pluck(n.strength);
        hit[at.slot].push(at.index);
      }
      pieces.forEach((p, slot) => {
        if (!p?.pick || !hit[slot].length) return;
        const dir = p.pick.play(hit[slot]);
        if (p.strings.length === 6) p.player.strum(dir); else p.player.hit();
        const loud = Math.max(...notes.map(n => n.strength), 0.5);
        ring(slot, sourceOf(slot), (p.strings.length === 4 ? 230 : 190) * (0.75 + 0.35 * loud), loud, `s${slot}`, 150, t);
      });

      // Everyone bobs on the beat and the sway moves on; a swell swings the
      // held instruments' necks up.
      if (m.onset) pieces.forEach(p => p?.player.beat());
      const swelling = m.energy > 0.8;
      if (on && swelling && !wasSwelling && t - lastSwell > 4000) {
        lastSwell = t;
        pieces.forEach((p, slot) => p && window.setTimeout(() => p.player.swell(), slot ? 0 : 180));
      }
      wasSwelling = swelling;

      let moving = on || strum.length > 0 || !!check;
      const half = BANDS / 2;
      pieces.forEach((p, slot) => {
        if (!p) return;
        const n = p.strings.length;
        p.strings.forEach((st, i) => {
          // Each string shivers with the song's loudness in its own bands.
          const span = strungSlots.length === 2 ? half : BANDS;
          const base = strungSlots.length === 2 && slot === 1 ? half : 0;
          st.step(dt, on ? levelOf(base + Math.floor((i * span) / n), base + Math.floor(((i + 1) * span) / n)) : 0);
          place(blurs.current[slot][i], `scaleX(${st.blur().toFixed(3)})`);
          if (!st.atRest()) moving = true;
        });
        const b = p.player.step(dt, on, m.energy);
        if (b.moving) moving = true;
        place(bodies.current[slot], `translateY(${b.y.toFixed(2)}px) rotate(${b.angle.toFixed(3)}deg)`);
        if (p.pick) {
          const pk = p.pick.step(dt);
          place(picks.current[slot], `translate(${pk.x.toFixed(2)}px, ${pk.y.toFixed(2)}px) rotate(${pk.tilt}deg)`);
        }
      });

      if (kit === 'electronic') {
        // The synth: a key down for each note, held a moment, sound ringing off
        // the keys; knobs turning with the swell.
        for (const n of notes) keyDown[n.band] = t;
        if (notes.length) ring(0, sourceOf(0), 170, Math.max(...notes.map(n => n.strength)), 'keys', 170, t);
        if (check && keyDown.some(at => at === t)) ring(0, sourceOf(0), 150, 0.6, 'keys', 140, t);
        keyDown.forEach((at, i) => {
          const down = t - at < 170 ? 1 : 0;
          if (down !== keyShown[i]) {
            keyShown[i] = down;
            keys.current[i]?.toggleAttribute('data-down', !!down);
          }
          if (down) moving = true;
        });
        knob += (m.energy - knob) * Math.min(1, dt * 4);
        knobs.current.forEach((el, i) => place(el, `rotate(${((i % 2 ? 1 : -1) * (30 + 110 * knob) + i * 9).toFixed(1)}deg)`));
        // The woofer pumps hard on the low notes and the beat, the tweeter on
        // the high ones, both ringing out; the step light runs in time.
        if (m.onset || notes.some(n => n.band < 6)) {
          pumpKick = 1;
          ring(1, cone.current, 330, 0.6 + 0.4 * m.energy, 'woofer', 230, t);
        }
        if (pumpKick === 1 && check) ring(1, cone.current, 330, 1, 'woofer', 230, t);
        pumpKick *= Math.exp(-dt / 0.11);
        pump += (pumpKick - pump) * Math.min(1, dt * 30);
        place(cone.current, `scale(${(1 + 0.16 * pump + 0.05 * m.energy).toFixed(4)})`);
        const highs = notes.filter(n => n.band >= 16);
        if (highs.length) {
          tweet = 1;
          ring(1, tweeter.current, 120, Math.max(...highs.map(n => n.strength)), 'tweeter', 200, t);
        }
        tweet *= Math.exp(-dt / 0.07);
        place(tweeter.current, `scale(${(1 + 0.18 * tweet).toFixed(4)})`);
        if (pump > 0.005 || tweet > 0.01) moving = true;
        if (on && (m.onset || notes.some(n => n.band >= 6 && n.band < 18)) && t - lastStep > 110) {
          lastStep = t;
          step = (step + 1) % RIG_STEPS;
        }
        const shown = on || check ? step : -1;
        if (shown !== stepShown) {
          if (stepShown >= 0) steps.current[stepShown]?.removeAttribute('data-lit');
          if (shown >= 0) steps.current[shown]?.setAttribute('data-lit', '');
          stepShown = shown;
        }
      }

      // The ribbon: a lazy flutter that quickens and widens with the song.
      phase += dt * Math.PI * 2 * (0.6 + 1.2 * m.energy);
      flick *= Math.exp(-dt / 0.25);
      tails.current.forEach((el, i) => {
        const a = Math.sin(phase + i * 1.3) * (1.5 + 8 * m.energy) + (m.beat + flick) * (i ? 7 : -7);
        place(el, `rotate(${a.toFixed(2)}deg)`);
      });
      if (flick > 0.01) moving = true;

      // The room rattles on the big low hits and settles: a quick, damped shiver.
      // Only the strongest low hits, and not more than every 0.4s, so it stays a
      // jolt, not a hum -- and only when the low end is genuinely loud, so a
      // soft song (read against its own range, it swells too) doesn't shake the room.
      const heavy = levelOf(0, 3) > 0.74;
      if (heavy && (notes.some(n => n.band < 3 && n.strength > 0.6) || (m.onset && m.energy > 0.65)) && t - lastShake > 400) {
        lastShake = t;
        shake = Math.max(shake, 0.6 + 0.4 * m.energy);
      }
      shake *= Math.exp(-dt / 0.13);
      shakePhase += dt * Math.PI * 2 * 11;
      if (shake > 0.05) {
        const off = shake * Math.sin(shakePhase);
        for (const r of rattlers) r.el.style.transform = `translate(${(r.x * off).toFixed(2)}px, ${(r.y * Math.abs(off)).toFixed(2)}px) rotate(${(r.r * off).toFixed(2)}deg)`;
        shaking = true;
        moving = true;
      } else if (shaking) {
        for (const r of rattlers) r.el.style.transform = '';
        shaking = false;
      }
      if (!reader.still()) moving = true;

      if (moving) raf = requestAnimationFrame(frame);
    };

    wake.current = () => {
      if (raf) return;
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    };
    poke.current = full => {
      if (full) {
        check = { start: performance.now(), fired: new Set(), full };
      } else {
        // A tap while the music plays: one strum, no sound of its own.
        SOUNDCHECK[0][1](performance.now());
      }
      wake.current();
    };
    // Any click, key, scroll or tap ends the soundcheck where it is.
    const stop = () => endCheck();
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, stop, { capture: true, passive: true }));
    if (live.current.on) wake.current();
    return () => {
      cancelAnimationFrame(raf);
      pools.flat().forEach(el => el.remove());
      wake.current = () => {};
      poke.current = () => {};
      events.forEach(e => window.removeEventListener(e, stop, { capture: true }));
    };
  }, [layout, kit, seed]);

  // The soundcheck, every time the page opens: once the family photo is taken
  // (or straight away if it's already been taken this visit), unless the
  // music's already on or motion is reduced -- then just the note.
  useEffect(() => {
    if (!layout || !layout.pieces.some(Boolean) || checkedFor.current === seed) return;
    if (!soundcheck || matchMedia('(prefers-reduced-motion: reduce)').matches || live.current.on) {
      setCheckedHere(true);
      return;
    }
    const photo = document.querySelector('.family-photo');
    let timer = 0;
    // Marked when it starts, not when this runs: React's development mode
    // runs effects twice, and the first run's timer is cleared.
    const go = () => { window.clearTimeout(timer); obs.disconnect(); timer = window.setTimeout(() => { checkedFor.current = seed; poke.current(true); }, 250); };
    const taken = () => ['taken', 'done'].includes(photo?.getAttribute('data-arrive') ?? 'done');
    const obs = new MutationObserver(() => { if (taken()) go(); });
    if (taken()) go();
    else if (photo) obs.observe(photo, { attributes: true, attributeFilter: ['data-arrive'] });
    return () => { obs.disconnect(); window.clearTimeout(timer); };
  }, [layout, seed, soundcheck]);

  /** A tap on any piece: play the page's own music (`queue`, or the artist
   *  as the pocket player would); carry on if paused; while something plays,
   *  just strum along. */
  const tap = () => {
    if (now.at !== null && now.paused) player.resume();
    else if (now.at === null && onPlay) onPlay();
    else if (now.at === null && queue) player.play(queue, 0);
    else if (now.at === null && now.context) player.play(now.context.queue, now.context.start);
    else poke.current(false);
  };

  const style = (p: Held) => {
    const s = PIECES[p.kind];
    return {
      left: p.left,
      top: p.top,
      width: s.w * p.k,
      height: s.h * p.k,
      transformOrigin: `${s.pivot[0] * p.k}px ${s.pivot[1] * p.k}px`,
      transform: `rotate(${p.tilt}deg)`,
      // Its shadow falls onto the page, the way something in front of it would cast one.
      '--cast': `${(p.left + (s.w * p.k) / 2 < (layout?.W ?? 0) / 2 ? 1 : -1) * 16}px`,
    } as React.CSSProperties;
  };

  // Who wears what: badges of who shaped them on the left piece in a band
  // (the bass), stickers of who they shaped on the right; folk and electronic
  // put the badges on the instrument played and the stickers on the case or
  // the speaker.
  const piece = (p: Held, slot: number) => {
    const blurRef = (i: number, el: SVGPathElement | null) => { blurs.current[slot][i] = el; };
    const pickRef = (el: SVGGElement | null) => { picks.current[slot] = el; };
    const tailRef = (i: number, el: SVGGElement | null) => { tails.current[i] = el; };
    switch (p.kind) {
      case 'bass': return <Bass finish={finish} pick={ribbon} badges={backline.badges} onAir={onAirId} blurRef={blurRef} pickRef={pickRef} />;
      case 'guitar': return <Guitar ribbon={ribbon} stickers={backline.stickers} onAir={onAirId} blurRef={blurRef} tailRef={tailRef} pickRef={pickRef} />;
      case 'acoustic': return <Acoustic pick={ribbon} badges={backline.badges} onAir={onAirId} blurRef={blurRef} pickRef={pickRef} />;
      case 'case': return <GuitarCase ribbon={ribbon} stickers={backline.stickers} onAir={onAirId} tailRef={tailRef} />;
      case 'synth': return <Synth badges={backline.badges} onAir={onAirId} keyRef={(i, el) => { keys.current[i] = el; }} knobRef={(i, el) => { knobs.current[i] = el; }} />;
      case 'rig': return <Rig stickers={backline.stickers} onAir={onAirId} coneRef={el => { cone.current = el; }} tweeterRef={el => { tweeter.current = el; }} stepRef={(i, el) => { steps.current[i] = el; }} />;
    }
  };

  return (
    <>
    <div ref={roomRef} className="room" aria-hidden>
      {layout && <Wall backline={backline} genres={genres} W={layout.W} H={layout.H} L={layout.L} R={layout.R} seed={seed} />}
    </div>
    {/* The band stands in front of the page, reaching only over its margin;
        they step back when the credits at the foot of the page come up. */}
    <div className="room__band" aria-hidden data-playing={on || undefined} data-away={away || undefined} style={{ '--press': ribbon, '--ring': ribbon } as React.CSSProperties}>
      {layout?.pieces.map((p, slot) => p && (
        <div key={p.kind} ref={el => { bodies.current[slot] = el; }} className="bline__inst" style={style(p)} onClick={tap}>
          <div className="bline__hold" style={{ transformOrigin: style(p).transformOrigin }}>
            {piece(p, slot)}
          </div>
        </div>
      ))}
      {/* The air, where sound rings out: in front of the pieces, so a ring is
          seen leaving the instrument, full strength in the side columns and
          two-fifths as strong over the page, so they drift over its words faintly. */}
      {layout && (
        <div
          ref={air}
          className="room__air"
          style={{
            maskImage: `linear-gradient(to right, #000 ${layout.L}px, rgba(0, 0, 0, 0.4) ${layout.L + 40}px, rgba(0, 0, 0, 0.4) ${layout.W - layout.R - 40}px, #000 ${layout.W - layout.R}px)`,
          }}
        />
      )}
      {checkedHere && !now.heard && layout && layout.L >= 130 && layout.pieces.some(Boolean) && (
        <p className="room__hint" style={{ width: layout.L - 28 }}>{hint ?? HINT[kit]}</p>
      )}
    </div>
    </>
  );
}
