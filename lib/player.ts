import { useSyncExternalStore } from 'react';
import { storyFrame } from './story-store';
import { connectAnalyser, readLevel } from './use-audio-level';
import { claimAudio, onAudioClaimed } from './audio-focus';

// The site's one music player. It lives above the pages (mounted once in the
// (graph) layout, which never unmounts), so a song keeps playing as you move
// between the map, artist pages, genres and scenes. It plays a queue -- an
// artist's family, the whole story oldest first, a realm's station, a
// shuffle -- one preview after another, fading each in and out. While a song
// plays, its star rings on the map and the pages listen (storyFrame.pulse,
// .playing, .level), exactly as the map's own players do.
//
// Views read it with usePlayer() and drive it through `player`: the pocket
// player docked in an artist's family photo, and the floating one in the
// corner of every page (components/player). One sound at a time across the
// site: it claims the audio when it starts (lib/audio-focus) and pauses
// when anything else does.

export interface Track {
  id: string;
  name: string;
  imageUrl: string | null;
  previewUrl: string | null;
  previewTrack: string | null;
  activeFrom: number | null;
}

export interface Queue {
  /** Stable for the same list ("family:joy-division", "story", "station:electronic"). */
  id: string;
  title: string;
  tracks: Track[];
  /** Each track's turn: a whole preview, or a few seconds when sampling. */
  stopMs: number;
}

export interface PlayerState {
  queue: Queue | null;
  /** Which track is on air, or null when nothing plays. */
  at: number | null;
  /** On air but held. */
  paused: boolean;
  /** Anything played yet this visit (the "it really plays" invitation goes). */
  heard: boolean;
  /** The floating player is opened up. */
  open: boolean;
  /** It has been opened at least once this visit (its "press MENU" note goes). */
  browsed: boolean;
  /** A docked player (the artist page's) is on screen, so the floating one steps aside. */
  docked: boolean;
  /** What this page offers first, and where in it to start: an artist page's family. */
  context: { queue: Queue; start: number } | null;
}

export const SONG_MS = 30000; // a whole preview
const SKIP_MS = 1400;         // a track with no song: just long enough to see it
const FADE_MS = 600;
const VOLUME = 0.8;
const OWNER = Symbol('player');

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const INITIAL: PlayerState = {
  queue: null, at: null, paused: false, heard: false, open: false, browsed: false, docked: false, context: null,
};
let state = INITIAL;
const listeners = new Set<() => void>();
const set = (patch: Partial<PlayerState>) => {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export function usePlayer(): PlayerState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

/** The track on air, if any. */
export const onAir = (s: PlayerState): Track | null => (s.queue && s.at !== null ? s.queue.tracks[s.at] : null);

// ── The engine ──
let audio: HTMLAudioElement | null = null;
let raf = 0;
let startedAt = 0;
let pausedAt = 0;
// Elements that show how far through its turn the track on air is
// (--player-progress), written every frame rather than through React.
const progressEls = new Set<HTMLElement>();
const showProgress = (p: number) => progressEls.forEach(el => el.style.setProperty('--player-progress', p.toFixed(3)));

function sound(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  // Before any source, so the analyser can hear it (lib/use-audio-level).
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  connectAnalyser(audio);
  audio.addEventListener('ended', () => { if (state.at !== null && !state.paused) advance(); });
  onAudioClaimed(OWNER, () => player.pause());
  return audio;
}

function begin(index: number) {
  const queue = state.queue;
  if (!queue) return;
  const track = queue.tracks[index];
  startedAt = performance.now();
  pausedAt = 0;
  set({ at: index, paused: false, heard: true });
  storyFrame.pulse = [track.id];
  storyFrame.playing = track.id;
  const a = sound();
  if (track.previewUrl) {
    a.src = track.previewUrl;
    a.currentTime = 0;
    a.volume = 0;
    void a.play().catch(() => {});
  } else {
    a.pause();
  }
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}

function advance() {
  const { queue, at } = state;
  if (!queue || at === null) return;
  if (at >= queue.tracks.length - 1) player.stop();
  else begin(at + 1);
}

function tick(now: number) {
  const { queue, at } = state;
  if (!queue || at === null) return;
  const track = queue.tracks[at];
  const turn = track.previewUrl ? queue.stopMs : SKIP_MS;
  const t = now - startedAt;
  if (track.previewUrl && audio) audio.volume = VOLUME * clamp01(Math.min(t / FADE_MS, (turn - t) / FADE_MS));
  storyFrame.level = readLevel(audio);
  showProgress(clamp01(t / turn));
  if (t >= turn) { advance(); return; }
  raf = requestAnimationFrame(tick);
}

export const player = {
  /** Play a queue from a track. Call it from a press, so the browser lets it make a sound. */
  play(queue: Queue, from = 0) {
    if (queue.tracks.length === 0) return;
    claimAudio(OWNER);
    set({ queue });
    begin(Math.min(queue.tracks.length - 1, Math.max(0, from)));
  },
  pause() {
    if (state.at === null || state.paused) return;
    pausedAt = performance.now();
    cancelAnimationFrame(raf);
    audio?.pause();
    storyFrame.level = 0;
    set({ paused: true });
  },
  resume() {
    if (state.at === null || !state.paused) return;
    claimAudio(OWNER);
    startedAt += performance.now() - pausedAt;
    pausedAt = 0;
    if (onAir(state)?.previewUrl) void audio?.play().catch(() => {});
    raf = requestAnimationFrame(tick);
    set({ paused: false });
  },
  /** On to the next track; from the last, round to the first. */
  next() {
    const { queue, at } = state;
    if (!queue || at === null) return;
    begin(at >= queue.tracks.length - 1 ? 0 : at + 1);
  },
  prev() {
    if (state.at !== null) begin(Math.max(0, state.at - 1));
  },
  stop() {
    cancelAnimationFrame(raf);
    audio?.pause();
    storyFrame.pulse = [];
    storyFrame.playing = null;
    storyFrame.level = 0;
    showProgress(0);
    set({ at: null, paused: false });
  },
  setOpen(open: boolean) {
    if (open !== state.open) set(open ? { open, browsed: true } : { open });
  },
  setDocked(docked: boolean) {
    if (docked !== state.docked) set({ docked });
  },
  /** An artist page offers its family first; it clears it again on the way out. */
  setContext(context: PlayerState['context']) {
    set({ context });
  },
  clearContext(queueId: string) {
    if (state.context?.queue.id === queueId) set({ context: null });
  },
  /** Attach an element that shows the progress bar; returns the detach. */
  showProgressOn(el: HTMLElement): () => void {
    progressEls.add(el);
    return () => { progressEls.delete(el); };
  },
};
