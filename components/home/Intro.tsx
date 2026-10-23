'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useGraphData } from '@/components/graph/GraphDataProvider';
import {
  storyCamera, storyControl, storyFrame, setCanvasLive, setStoryMode, setStoryFocus, setTodayOpen,
  setTodayShown, takeFullIntroRequest,
} from '@/lib/story-store';
import {
  buildGroove, grooveSlotAt, spinForNeedle, GROOVE_INNER, GROOVE_TURNS, LABEL_ID, NEEDLE_ANGLE, RIM_SHARE,
} from '@/lib/intro-groove';
import { familyDrawMs, familyOf, FAMILY_DRAW_STAGGER_FAST_MS } from '@/lib/family';
import { connectAnalyser, readLevel, startCrackle } from '@/lib/use-audio-level';
import { pullQuote, whyFor, type RecordCard } from '@/lib/home-story';
import { sizedImageUrl } from '@/lib/image-url';
import { OPENING_VU_BEAT } from '@/lib/flags';

interface Props {
  record: RecordCard;
  artistCount: number;
  /** The earliest and latest years any artist started. */
  years: [number, number];
}

// The opening: the record becomes the map, then the map shows what it's for.
//
// A first visit, start to finish:
//   1. The Velvet Underground's first record, in the dark: the banana sleeve,
//      the vinyl sliding out of it. Copies of it are handed on — three, one
//      at a time, to bands most people know, then to every other artist here
//      who learned from them — and Brian Eno says what that record did.
//   2. Every artist on one spinning record, in the order they began; then
//      the record stops and every star flies to its place in the atlas —
//      sorted first by when, then by who they learned from.
//   3. One real band's family (the same view a click opens), with the music
//      travelling in from the band that shaped them and out to the bands
//      they shaped.
//   4. Every line on the map lights, outward from the Velvet Underground,
//      and the light gathers into today's record.
// A return visit is only step 2, with the record shrinking into today's
// star at the end, and no words.
//
// Read, then watch: words only ever appear while nothing on screen is
// moving, and nothing moves while new words are arriving — the eye can't
// follow motion and read at once. So the opening is a run of steps, each
// either motion or words (see STEPS), never both.
//
// This component owns the clock and writes the opening's state into
// storyFrame every frame; ForceGraph reads it while drawing (see the
// "opening's record" block there and lib/intro-groove.ts). React only
// re-renders at the step changes, never per frame.

// The band the first visit is shown, the band that changed them, and who said
// so. Chosen because the quote is a real first-person one and short enough to
// read while the music travels — and because the family is big on both sides.
const DEMO = { artist: 'radiohead', parent: 'rem', speaker: 'Thom Yorke' } as const;

type Variant = 'full' | 'short';
type Phase =
  | 'label'
  // the first record (first visit)
  | 'vu' | 'eno' | 'vinyl' | 'passing' | 'landed' | 'into'
  // every artist on one record, then the map
  | 'groove' | 'coast' | 'record' | 'morph' | 'mapped'
  // one family
  | 'family' | 'named' | 'quote' | 'in' | 'passed' | 'out'
  // the ending
  | 'wave' | 'lit' | 'gather' | 'today';

// Step lengths, ms, for the steps with motion; a step with words lasts as
// long as its words take to read (readMs), so those are 0 here.
const LABEL_MS = 150; // the label alone, a beat before anything moves
// The first record's steps (behind OPENING_VU_BEAT, lib/flags.ts).
const VU_STEPS: [Phase, number][] = [
  ['vu', 0],         // the sleeve, still: its title
  ['eno', 0],        // the sleeve, still: what that record did — read first, then watched
  ['vinyl', 1400],   // the vinyl slides out, spins, takes the middle
  ['passing', 4600], // three handoffs, then everyone else
  ['landed', 800],   // the count comes to rest
  ['into', 600],     // the vinyl shrinks into the gold star
];
const FULL: [Phase, number][] = [
  ...(OPENING_VU_BEAT ? VU_STEPS : []),
  ['groove', 2000],  // the needle plays every artist onto one record
  ['coast', 700],    // the record coasts to a stop
  ['record', 0],     // still: what the record is
  ['morph', 1800],   // the record becomes the map
  ['mapped', 0],     // still: what the map is
  ['family', 0],     // the dive and the family's lines (length from the data)
  ['named', 0],      // still: whose family
  ['quote', 0],      // still: what R.E.M. did to them
  ['in', 1500],      // the music travels in from R.E.M.
  ['passed', 0],     // still: and Radiohead passed it on
  ['out', 1500],     // …out to everyone they shaped
  ['wave', 2400],    // back out, and every line lights from the Velvet Underground
  ['lit', 0],        // still: what that means
  ['gather', 1400],  // the light gathers into today's record
  ['today', 0],      // still: start there
];
const SHORT: [Phase, number][] = [
  ['groove', 1600],
  ['morph', 1500],   // shrinking into today's star
  ['today', 300],
];

// How long words stay: time to find them, then a reading pace.
const READ_BASE_MS = 800;
const READ_PER_WORD_MS = 190;
const READ_MIN_MS = 1800;

// The first record's moves: the sleeve fades in at the start of 'vu'; in
// 'vinyl' the vinyl slides out of it, then takes the middle as the sleeve
// steps away; through 'passing' its copies are handed on (ForceGraph
// schedules each one — see vuFlights); in 'into' it shrinks away.
const SLEEVE_IN_MS = 600;
const SLIDE_MS = 900;
const CENTRE_MS = 500;
const WAVE_AT = 0.66; // a share of the handoffs: when the wave starts, as ForceGraph's VU_WAVE_FROM
// The camera leans in for the handoffs, so the copies are big enough to
// follow, and back out for the wave.
const LEAN_IN = 1.3;
const LEAN_MS = 900;
const VINYL_RPM_DEG_PER_MS = 0.2; // 33⅓
const DUST_IN_MS = 500;
const DUST_OUT_MS = 900;   // into the groove
const FLOW_MS = 1500;      // how long the light takes to cross a line
const WAVE_DELAY_MS = 600; // the camera pulls back before the map lights
const WAVE_FADE_MS = 700;  // the lit lines settle back as the light gathers
const READY_TIMEOUT_MS = 8000; // the graph never arrived: skip the opening
// The camera's move toward today's star: how far of the way, and how much
// closer.
const DRIFT = { full: { amount: 0.3, zoom: 1.1 }, short: { amount: 0.5, zoom: 1.2 } } as const;
// When today's tag appears: a share of the gather, or of a return visit's morph.
const TODAY_TAG_AT = 0.55;

// The share of the groove step spent spinning up to speed.
const SPIN_UP = 0.25;

// Loudest the snippets play, and how fast they fade in per frame.
const SOUND_VOLUME = 0.8;
const SOUND_FADE_STEP = 0.04;

const SEEN_KEY = 'starweave:intro-seen';
// The map's own first-visit hint (GraphView) teaches what the full opening
// just showed, so having seen one means not needing the other.
const ONBOARDING_KEY = 'starweave:onboarding-seen';

// How far the needle has travelled at `u` (0..1) through the groove step:
// accelerating for the first SPIN_UP of it, then at a steady speed.
function needleAt(u: number): number {
  const total = SPIN_UP / 2 + (1 - SPIN_UP);
  const dist = u < SPIN_UP ? (u * u) / (2 * SPIN_UP) : SPIN_UP / 2 + (u - SPIN_UP);
  return dist / total;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Intro({ record, artistCount, years }: Props) {
  const { data } = useGraphData();
  const slots = useMemo(() => (data ? buildGroove(data.artists) : []), [data]);
  const nameOf = useMemo(() => new Map((data?.artists ?? []).map(a => [a.id, a.name])), [data]);

  // The first visit's words and example family, from the data itself.
  const demo = useMemo((): Demo | null => {
    if (!data) return null;
    const artist = data.artists.find(a => a.id === DEMO.artist);
    const parent = data.artists.find(a => a.id === DEMO.parent);
    const root = data.artists.find(a => a.id === LABEL_ID);
    if (!artist || !parent || !root) return null;
    const album = root.classicAlbums?.[0];
    const edge = data.edges.find(e => e.source === DEMO.artist && e.target === DEMO.parent);
    const family = familyOf(data.edges, DEMO.artist);
    return {
      years,
      artist, parent, root,
      // The quote up to its first ellipsis: the part about the music.
      quote: pullQuote(edge?.citation)?.split(/\.\.\.|…/)[0].trim() ?? null,
      album: album?.imageUrl ? { title: album.title, year: album.year ?? null, cover: album.imageUrl } : null,
      // What somebody they shaped said about the Velvet Underground.
      rootWhy: whyFor(data, LABEL_ID),
      parents: family.parents.length,
      children: family.children.length,
    };
  }, [data, years]);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [phase, setPhase] = useState<Phase>('label');
  // The words on screen, and whether they're on their way out (a step with
  // no words of its own fades the last ones rather than cutting them).
  const [shown, setShown] = useState<{ phase: Phase; out: boolean } | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const tallyRef = useRef<HTMLDivElement>(null);
  const tallyCountRef = useRef<HTMLSpanElement>(null);
  const rootTagRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sleeveRef = useRef<HTMLImageElement>(null);
  const vinylRef = useRef<HTMLDivElement>(null);
  const vinylSpinRef = useRef<HTMLDivElement>(null);
  const inAudioRef = useRef<HTMLAudioElement>(null);
  const outAudioRef = useRef<HTMLAudioElement>(null);
  const soundRef = useRef(false);
  const crackleRef = useRef<(() => void) | null>(null);
  const phaseRef = useRef<Phase>('label');
  // Skip and the sound button reach the clock through these; the effect
  // below fills them in once it knows which version is playing.
  const finishRef = useRef<() => void>(() => {});
  const syncSoundRef = useRef<() => void>(() => {});
  // "How it works" asked for the full version. Read once per mount: the
  // effect below can run again when the graph data arrives.
  const fullAskedRef = useRef<boolean | null>(null);

  useEffect(() => {
    setCanvasLive(true);
    let finished = false;
    let raf = 0;
    let leanFrom = 0; // the overview zoom, while the camera leans in

    // What should be sounding now: the needle's crackle while the record is
    // the record, R.E.M. as their line to Radiohead is told and travelled,
    // then Radiohead as the music goes on out and the map lights.
    const syncSound = () => {
      const p = phaseRef.current;
      const crackle = soundRef.current
        && (p === 'label' || p === 'vu' || p === 'vinyl' || p === 'passing' || p === 'eno' || p === 'into' || p === 'groove');
      if (crackle && !crackleRef.current) crackleRef.current = startCrackle();
      if (!crackle && crackleRef.current) { crackleRef.current(); crackleRef.current = null; }
      const want = !soundRef.current ? null
        : p === 'quote' || p === 'in' ? inAudioRef.current
        : p === 'passed' || p === 'out' || p === 'wave' || p === 'lit' || p === 'gather' || p === 'today' ? outAudioRef.current
        : null;
      for (const audio of [inAudioRef.current, outAudioRef.current]) {
        if (!audio) continue;
        if (audio === want && audio.paused) {
          audio.volume = 0;
          void audio.play().catch(() => {});
        } else if (audio !== want && !audio.paused) {
          audio.pause();
        }
      }
    };
    syncSoundRef.current = syncSound;

    const stopSound = () => {
      for (const audio of [inAudioRef.current, outAudioRef.current]) audio?.pause();
      crackleRef.current?.();
      crackleRef.current = null;
      storyFrame.level = 0;
    };

    // Lets go of the stars and settles the frame the canvas reads; hands
    // over the map with today's record on it.
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      stopSound();
      storyFrame.intro = false;
      storyFrame.reveal = 1;
      storyFrame.morph = 1;
      storyFrame.flow = null;
      storyFrame.wave = -1;
      storyFrame.sparks = -1;
      storyFrame.dust = 0;
      storyFrame.collapse = -1;
      storyFrame.gather = -1;
      storyControl.finish = null;
      // Skipped while the camera leaned in: back to the overview.
      if (leanFrom) storyCamera.zoom?.(leanFrom, 400);
      try {
        localStorage.setItem(SEEN_KEY, '1');
        localStorage.setItem(ONBOARDING_KEY, '1');
      } catch {
        // Storage blocked: the full opening plays again next time.
      }
      setStoryMode('map');
      setTodayOpen(true);
    };
    finishRef.current = finish;
    storyControl.finish = finish;

    let chosen: Variant = 'full';
    try {
      chosen = localStorage.getItem(SEEN_KEY) === '1' ? 'short' : 'full';
    } catch {
      // Storage blocked: every visit is a first visit.
    }
    fullAskedRef.current ??= takeFullIntroRequest();
    if (fullAskedRef.current) chosen = 'full';
    if (chosen === 'full' && !demo) chosen = 'short';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    // The run of steps, with when each starts. The family's own step is as
    // long as its lines take to draw (faster in the opening, see lib/family);
    // a step with words, as long as they take to read.
    const familyMs = familyDrawMs(demo?.parents ?? 0, demo?.children ?? 0, FAMILY_DRAW_STAGGER_FAST_MS) + 200;
    const lengthFor = (p: Phase, ms: number) => {
      if (p === 'family') return familyMs;
      const words = captionFor(p, chosen, demo);
      return words ? readMs(words) : ms;
    };
    const steps = (chosen === 'full' ? FULL : SHORT).map(([p, ms]) => [p, lengthFor(p, ms)] as const);
    const startOf = new Map<Phase, number>();
    let total = LABEL_MS;
    for (const [p, ms] of steps) { startOf.set(p, total); total += ms; }
    const lengthOf = new Map<Phase, number>(steps);
    // The first record's moves, in the clock's own time.
    const beat = chosen === 'full' && OPENING_VU_BEAT ? {
      sleeveAt: startOf.get('vu')!,
      slideAt: startOf.get('vinyl')!,
      centreAt: startOf.get('vinyl')! + SLIDE_MS,
      passAt: startOf.get('passing')!,
      passEnd: startOf.get('passing')! + lengthOf.get('passing')!,
      intoAt: startOf.get('into')!,
      intoMs: lengthOf.get('into')!,
    } : null;

    const mountedAt = performance.now();
    let start = 0;
    let underNeedle = '';
    let focused = false;
    let drifted = false;
    let leanedOut = false;
    const enter = (p: Phase) => {
      if (p === phaseRef.current) return;
      phaseRef.current = p;
      setPhase(p);
      setShown(prev => (captionFor(p, chosen, demo) ? { phase: p, out: false } : prev && { ...prev, out: true }));
      syncSound();
    };

    const tick = (now: number) => {
      if (finished) return;
      if (!start) {
        // Wait for the graph to be mounted and framed — the record is sized
        // to that framing.
        if (!storyFrame.graphReady || slots.length === 0) {
          if (now - mountedAt > READY_TIMEOUT_MS) { finish(); return; }
          raf = requestAnimationFrame(tick);
          return;
        }
        start = now;
        setVariant(chosen);
        storyFrame.intro = true;
        storyFrame.reveal = 0;
        storyFrame.morph = 0;
        storyFrame.spin = spinForNeedle(0);
        storyFrame.sparks = beat ? 0 : -1;
        storyFrame.collapse = chosen === 'short' ? 0 : -1;
      }

      const t = now - start;
      if (t >= total) { finish(); return; }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${(t / total).toFixed(4)})`;
      let p: Phase = 'label';
      for (const [step] of steps) if (t >= startOf.get(step)!) p = step;
      enter(p);
      const into = (step: Phase) => (t - startOf.get(step)!) / lengthOf.get(step)!;
      const since = (step: Phase) => t - startOf.get(step)!;

      // ── The first record ──
      if (beat && t < startOf.get('groove')!) {
        storyFrame.dust = clamp01((t - beat.sleeveAt) / DUST_IN_MS);
        storyFrame.sparks = clamp01((t - beat.passAt) / (beat.passEnd - beat.passAt));
        if (!leanFrom && t >= beat.passAt - LEAN_MS / 2) {
          leanFrom = storyCamera.zoom?.() ?? 0;
          if (leanFrom) storyCamera.zoom?.(leanFrom * LEAN_IN, LEAN_MS);
        }
        if (leanFrom && !leanedOut && storyFrame.sparks >= WAVE_AT) {
          leanedOut = true;
          storyCamera.zoom?.(leanFrom, LEAN_MS);
        }
        placeBeat(t);
        raf = requestAnimationFrame(tick);
        return;
      }

      // ── Every artist on one record, then the map ──
      if (t < (startOf.get('family') ?? total)) {
        const groove = lengthOf.get('groove')!;
        const g = clamp01(since('groove') / groove);
        // The record coasts to a stop: before its words on a first visit,
        // through the morph on a return.
        const coastStep: Phase = chosen === 'full' ? 'coast' : 'morph';
        const coastMs = lengthOf.get(coastStep)!;
        const c = clamp01(since(coastStep) / coastMs);
        const omega = (Math.PI * 2 * GROOVE_TURNS) / (SPIN_UP / 2 + (1 - SPIN_UP)) / groove; // rad/ms at full speed
        const reveal = needleAt(g);
        storyFrame.reveal = reveal;
        storyFrame.spin = g < 1 ? spinForNeedle(reveal) : spinForNeedle(1) + omega * coastMs * (c - (c * c) / 2);
        const m = clamp01(into('morph'));
        storyFrame.morph = m;
        if (beat) {
          storyFrame.dust = 1 - clamp01(since('groove') / DUST_OUT_MS);
          storyFrame.sparks = 1;
          placeBeat(-1);
        }
        if (chosen === 'short' && m > 0) {
          // A return visit's record shrinks into today's star, and the
          // camera goes with it.
          storyFrame.collapse = m;
          if (!drifted) {
            drifted = true;
            storyCamera.drift?.(record.id, DRIFT.short.amount, DRIFT.short.zoom, lengthOf.get('morph')!);
          }
          if (m >= TODAY_TAG_AT) setTodayShown(true);
        }
        placeWords(reveal);
        raf = requestAnimationFrame(tick);
        return;
      }

      // The record is the map now. Hand the stars back to it and dive into
      // a family, through the same view a click opens.
      if (!focused) {
        focused = true;
        storyFrame.intro = false;
        storyFrame.reveal = 1;
        storyFrame.morph = 1;
        storyFrame.sparks = -1;
        storyFrame.dust = 0;
        setStoryFocus(DEMO.artist);
      }

      storyFrame.flow =
        p === 'in' ? { from: DEMO.parent, to: DEMO.artist, t: clamp01(since('in') / FLOW_MS) }
        : p === 'out' ? { from: DEMO.artist, to: null, t: clamp01(since('out') / FLOW_MS) }
        : null;

      if (p === 'wave' || p === 'lit') {
        // Back out to the whole map, and every line lights — starting with
        // a pulse out of the Velvet Underground, named as it goes.
        setStoryFocus(null);
        const w = since('wave') - WAVE_DELAY_MS;
        storyFrame.wave = w < 0 ? -1 : clamp01(w / (lengthOf.get('wave')! - WAVE_DELAY_MS));
        placeRootTag();
      } else if (p === 'gather' || p === 'today') {
        // The light gathers into today's record.
        const g = since('gather') / lengthOf.get('gather')!;
        storyFrame.wave = 1 + clamp01(since('gather') / WAVE_FADE_MS);
        storyFrame.gather = g < 1 ? g : -1;
        if (!drifted) {
          drifted = true;
          storyCamera.drift?.(record.id, DRIFT.full.amount, DRIFT.full.zoom, lengthOf.get('gather')!);
        }
        if (g >= TODAY_TAG_AT) setTodayShown(true);
      }

      // The music swells the light, and fades in rather than starting cold.
      if (soundRef.current) {
        const playing = [inAudioRef.current, outAudioRef.current].find(a => a && !a.paused) ?? null;
        if (playing && playing.volume < SOUND_VOLUME) playing.volume = Math.min(SOUND_VOLUME, playing.volume + SOUND_FADE_STEP);
        storyFrame.level = readLevel(playing);
      }
      raf = requestAnimationFrame(tick);
    };

    // Where the record's centre is on screen, and how big the record is.
    const frame = () => {
      const overlay = overlayRef.current;
      if (!overlay) return null;
      const box = overlay.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(overlay).paddingTop) || 0;
      const short = Math.min(box.width, box.height - top);
      return { overlay, width: box.width, cx: box.width / 2, cy: top + (box.height - top) / 2, rim: RIM_SHARE * short, short };
    };

    // The sleeve and the vinyl at clock time `t` (-1: gone). Laid out round
    // the record's centre, which is where the canvas's gold star and the
    // copies' flights are. The words sit under the sleeve (--near-top).
    const ease = (v: number) => easeInOut(clamp01(v));
    const placeBeat = (t: number) => {
      const sleeve = sleeveRef.current;
      const vinyl = vinylRef.current;
      const f = frame();
      if (!sleeve || !vinyl || !f) return;
      if (t < 0 || !beat) {
        sleeve.style.opacity = '0';
        vinyl.style.opacity = '0';
        if (tallyRef.current) tallyRef.current.style.opacity = '0';
        return;
      }
      const { cx, cy } = f;
      const size = Math.round(Math.min(230, 0.34 * f.short));
      const disc = size * 0.95;
      const shown = ease((t - beat.sleeveAt) / SLEEVE_IN_MS);
      const slide = ease((t - beat.slideAt) / SLIDE_MS);
      const centre = ease((t - beat.centreAt) / CENTRE_MS);
      const gone = ease((t - beat.intoAt) / beat.intoMs);
      // It gives way as its copies leave, so the stars they reach — many of
      // them close to the middle — stay in view.
      const give = ease((t - beat.passAt + 400) / 800);
      const scale = (1 - 0.68 * give) * (1 - 0.85 * gone);
      // Sleeve and vinyl start left of centre so that, half out, the pair is
      // centred; then the sleeve steps away and the vinyl takes the middle.
      const sleeveX = cx - 0.25 * size - 0.45 * size * centre;
      const outX = cx - 0.25 * size + 0.55 * size * slide;
      const vinylX = outX + (cx - outX) * centre;
      sleeve.style.width = `${size}px`;
      sleeve.style.height = `${size}px`;
      sleeve.style.opacity = String(shown * (1 - centre));
      sleeve.style.transform = `translate(${(sleeveX - size / 2).toFixed(1)}px, ${(cy - size / 2).toFixed(1)}px) scale(${(0.97 + 0.03 * shown).toFixed(3)})`;
      vinyl.style.width = `${disc}px`;
      vinyl.style.height = `${disc}px`;
      vinyl.style.opacity = String(shown * (1 - gone));
      vinyl.style.transform = `translate(${(vinylX - disc / 2).toFixed(1)}px, ${(cy - disc / 2).toFixed(1)}px) scale(${scale.toFixed(3)})`;
      // Up to speed as it slides out, then a steady 33⅓.
      const spinUp = 700;
      const s = Math.max(0, t - beat.slideAt);
      const deg = s < spinUp ? (VINYL_RPM_DEG_PER_MS * s * s) / (2 * spinUp) : (VINYL_RPM_DEG_PER_MS * spinUp) / 2 + VINYL_RPM_DEG_PER_MS * (s - spinUp);
      if (vinylSpinRef.current) vinylSpinRef.current.style.transform = `rotate(${deg.toFixed(1)}deg)`;

      // How many it has reached so far, beside it — clear of the handoffs'
      // names, which land below and to the left of the middle.
      const tally = tallyRef.current;
      const count = tallyCountRef.current;
      if (tally && count) {
        const n = storyFrame.vuLanded;
        if (count.textContent !== String(n)) count.textContent = String(n);
        tally.style.opacity = String(n > 0 ? 1 - gone : 0);
        tally.style.transform = `translate(${(cx + (disc / 2) * scale + 22).toFixed(1)}px, ${(cy - 18).toFixed(1)}px)`;
      }

      // The words, under the sleeve.
      f.overlay.style.setProperty('--near-top', `${(cy + size / 2 + 28).toFixed(0)}px`);
    };

    // The Velvet Underground's name beside their star as the closing wave
    // leaves it.
    const placeRootTag = () => {
      const tag = rootTagRef.current;
      const p = storyCamera.nodeScreen?.(LABEL_ID);
      if (!tag || !p) return;
      tag.style.transform = `translate(${p.x.toFixed(1)}px, ${(p.y + 18).toFixed(1)}px)`;
    };

    // The year and whoever the needle is on ride just outside the needle.
    const placeWords = (reveal: number) => {
      const slot = grooveSlotAt(slots, reveal);
      if (slot && slot.id !== underNeedle && yearRef.current && nameRef.current) {
        underNeedle = slot.id;
        yearRef.current.textContent = String(slot.year);
        nameRef.current.textContent = nameOf.get(slot.id) ?? '';
      }
      const counter = counterRef.current;
      const f = frame();
      if (!counter || !f) return;
      const r = f.rim * (GROOVE_INNER + (1 - GROOVE_INNER) * reveal) + 26;
      // Kept on screen: on a phone the rim sits close to the edge.
      const x = Math.min(f.cx + r * Math.cos(NEEDLE_ANGLE), f.width - counter.offsetWidth - 16);
      const y = f.cy + r * Math.sin(NEEDLE_ANGLE);
      counter.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };

    raf = requestAnimationFrame(tick);

    // Only a deliberate skip ends it early: the Skip button, or Esc. A
    // stray click, tap or scroll from someone who doesn't know what they're
    // watching yet must not throw the whole opening away.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      stopSound();
      if (storyControl.finish === finish) storyControl.finish = null;
      // Leaving mid-opening (a nav link): don't leave a family on screen.
      if (!finished) setStoryFocus(null);
    };
  }, [slots, nameOf, record.id, demo]);

  const toggleSound = () => {
    const on = !soundRef.current;
    soundRef.current = on;
    setSoundOn(on);
    // Inside the click, so the browser lets the audio start.
    if (on) {
      connectAnalyser(inAudioRef.current);
      connectAnalyser(outAudioRef.current);
    }
    syncSoundRef.current();
  };

  const caption = shown ? captionFor(shown.phase, variant, demo) : null;
  const near = shown?.phase === 'vu' || shown?.phase === 'eno';
  // While words are up, the picture behind them recedes, so the eye goes to
  // the words; it comes back as they leave.
  const dim = caption && shown && !shown.out ? caption.dim ?? 0 : 0;
  // The gold point that holds the dark while the graph arrives — on a first
  // visit the sleeve takes its place.
  const showLabel = phase === 'label' && (variant !== 'full' || !OPENING_VU_BEAT);

  return (
    <div
      ref={overlayRef}
      className={`intro intro--${phase}${showLabel ? ' intro--root' : ''}${near ? ' intro--near' : ''}`}
      role="region"
      aria-label="Starweave, an introduction"
    >
      {/* What the animation shows, as text — for screen readers and search. */}
      <p className="sr-only">
        {artistCount} artists, first placed by the year they began, then by who they learned from.
        Each line joins an artist to one they learned from.
        {demo && ` For example, ${demo.artist.name} learned from ${demo.parent.name}, and ${demo.children} artists here learned from ${demo.artist.name}.`}
        {' '}Today&apos;s record: <Link href={`/artist/${record.id}`}>{record.name}</Link>, {record.album}
        {record.albumYear ? ` (${record.albumYear})` : ''}.
      </p>

      <div className="intro__veil" aria-hidden />
      <div className="intro__scrim" aria-hidden />
      <div className="intro__label" aria-hidden>
        <span className="intro__label-dot" />
        <span className="intro__label-name">The Velvet Underground</span>
      </div>
      <div ref={counterRef} className="intro__counter" aria-hidden>
        <span ref={yearRef} className="intro__counter-year" />
        <span ref={nameRef} className="intro__counter-name" />
      </div>
      {/* The Velvet Underground's first record: its sleeve, and the vinyl
          that slides out of it. Placed and turned per frame (placeBeat);
          rendered from the start so the cover has loaded by its cue. */}
      {OPENING_VU_BEAT && demo?.album && (
        <div className="intro__beat" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={sleeveRef} className="intro__sleeve" src={sizedImageUrl(demo.album.cover, 600)} alt="" />
          <div ref={vinylRef} className="intro__vinyl">
            <div ref={vinylSpinRef} className="intro__vinyl-spin">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="intro__vinyl-label" src={sizedImageUrl(demo.album.cover, 300)} alt="" />
            </div>
            <span className="intro__vinyl-sheen" />
          </div>
          <div ref={tallyRef} className="intro__tally">
            <span ref={tallyCountRef} className="intro__tally-count">0</span>
            <span className="intro__tally-label">learned from it</span>
          </div>
        </div>
      )}
      {demo && (
        <div ref={rootTagRef} className="intro__root-tag" aria-hidden>
          {demo.root.name}{demo.root.activeFrom ? ` · ${demo.root.activeFrom}` : ''}
        </div>
      )}

      <div className="intro__dim" style={{ opacity: dim }} aria-hidden />

      {/* One line at a time, while the picture holds still. Keyed by step so
          each new line's words land one by one; a step without words fades
          the last ones out. */}
      {caption && shown && (
        <div key={shown.phase} className={`intro__caption${shown.out ? ' intro__caption--out' : ''}`} aria-hidden>
          {caption.eyebrow && <p className="intro__caption-eyebrow">{caption.eyebrow}</p>}
          <p className="intro__caption-big">
            {caption.big.split(' ').map((word, i) => (
              <span key={i} className="intro__word" style={{ '--i': i } as React.CSSProperties}>{word} </span>
            ))}
          </p>
          {caption.small && (
            <p className="intro__caption-small" style={{ '--n': caption.big.split(' ').length } as React.CSSProperties}>
              {caption.small}
            </p>
          )}
        </div>
      )}

      {variant === 'full' && demo && (
        <>
          <audio ref={inAudioRef} src={demo.parent.previewUrl ?? undefined} crossOrigin="anonymous" preload="none" />
          <audio ref={outAudioRef} src={demo.artist.previewUrl ?? undefined} crossOrigin="anonymous" preload="none" />
        </>
      )}

      {/* How far through it is, so it reads as something with an end. */}
      <div ref={progressRef} className="intro__progress" aria-hidden />

      <div className="intro__controls">
        {variant === 'full' && demo?.parent.previewUrl && (
          <button type="button" className="intro__button" aria-pressed={soundOn} onClick={toggleSound}>
            <SpeakerIcon on={soundOn} /> <span>Sound</span>
          </button>
        )}
        <button type="button" className="intro__button" onClick={() => finishRef.current()}>
          <span>Skip</span> <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

interface Caption {
  eyebrow?: string;
  big: string;
  small?: string;
  /** How far the picture recedes behind these words, 0..1. */
  dim?: number;
}

function readMs(c: Caption): number {
  const words = [c.eyebrow, c.big, c.small].filter(Boolean).join(' ').split(/\s+/).length;
  return Math.max(READ_MIN_MS, READ_BASE_MS + READ_PER_WORD_MS * words);
}

type Demo = {
  years: [number, number];
  artist: { name: string; previewUrl?: string | null };
  parent: { name: string; previewUrl?: string | null };
  root: { name: string; activeFrom?: number };
  quote: string | null;
  album: { title: string; year: number | null; cover: string } | null;
  rootWhy: { quote: string; speaker: string } | null;
  parents: number;
  children: number;
};

// The words for each still moment, and null for every moving one. Short,
// plain, and only ever about what's on screen right then. A return visit
// has none: today's record speaks for itself.
function captionFor(phase: Phase, variant: Variant | null, demo: Demo | null): Caption | null {
  if (variant !== 'full' || !demo) return null;
  const band = demo.artist.name;
  switch (phase) {
    case 'vu':
      // The setup for Eno's line, so "those 30,000 copies" points back at
      // something: the figure he gives in the same interview.
      return demo.album
        ? { big: `${demo.album.title}${demo.album.year ? `, ${demo.album.year}` : ''}.`, small: 'It sold just 30,000 copies in its first five years.' }
        : null;
    case 'eno':
      // His words exactly, without the closing "!": said plainly, it lands.
      return demo.rootWhy ? { big: `“${demo.rootWhy.quote.replace(/!$/, '')}”`, small: demo.rootWhy.speaker } : null;
    case 'record':
      return { big: 'Every artist here, by the year they started.', small: `${demo.years[0]} – present`, dim: 0.35 };
    case 'mapped':
      return { big: 'Now arranged by who shaped whom.', dim: 0.35 };
    case 'named':
      return { big: `This is ${band}'s musical family.`, dim: 0.25 };
    case 'quote':
      return demo.quote
        ? { big: `${demo.parent.name} “${demo.quote}…”`, small: `${DEMO.speaker}, ${band}`, dim: 0.5 }
        : { big: `${demo.parent.name} shaped ${band}.`, dim: 0.5 };
    case 'passed':
      return { big: `…and ${band} passed it on.`, small: `${demo.children} artists here learned from them.`, dim: 0.35 };
    case 'lit':
      return { eyebrow: 'Starweave', big: 'Every artist here has a family like this.', dim: 0.35 };
    case 'today':
      return { big: "Start with today's record." };
    default:
      return null;
  }
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg className="intro__icon" viewBox="0 0 16 16" aria-hidden>
      <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
      {on ? (
        <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      ) : (
        <path d="M11 6l4 4M15 6l-4 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  );
}
