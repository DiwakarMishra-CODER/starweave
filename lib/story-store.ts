'use client';

import { useSyncExternalStore } from 'react';

// State shared between the home page's story (app/(graph)/page.tsx, a child of
// the (graph) layout) and the persistent graph that sits under it in that
// layout (GraphView/ForceGraph). Two kinds, kept apart on purpose:
//
//   storyFrame — values that change every frame of the opening (how far the
//     record has played, its spin, the morph into the atlas). A plain mutable
//     object the canvas's draw callbacks read directly. Passing these as
//     props would re-render the whole canvas component every frame; the
//     canvas repaints every frame anyway, so the next frame picks up the write.
//   the snapshot — values that change a handful of times a visit (story or
//     map, whether the canvas is live, whose family is shown). Read through
//     useSyncExternalStore, same pattern as lib/use-media-query.ts.
//
// Module scope is the point: it survives page.tsx remounting when a visitor
// comes back from an artist page, which is what lets "back" land on the map.

export type StoryMode = 'story' | 'map';

export interface StorySnapshot {
  mode: StoryMode;
  /** The canvas repaints under the story only when a track uses it. */
  canvasLive: boolean;
  /** Today's record is on the map (components/home/TodayStar) — until the
   *  visitor hides it, for the rest of the visit. */
  todayOpen: boolean;
  /** The opening has reached today's record and shows it, before handing
   *  over the map. */
  todayShown: boolean;
  /** The visitor has something selected on the map (an artist, a genre, a
   *  path…), which today's record steps aside for. Set by GraphView. */
  mapBusy: boolean;
  /** An artist the opening is showing the family of, through the map's own
   *  focus view — without the side panel a real click would open. */
  storyFocus: string | null;
}

// The story is for a visit that arrives at `/` from outside. Arriving
// anywhere else first (an artist page, a deep link to a selection) means
// later trips to `/` are moves within the site, and those land on the map.
// Read once, when this module first runs in the browser — the landing URL.
function initialMode(): StoryMode {
  if (typeof window === 'undefined') return 'story';
  const { pathname, search } = window.location;
  if (pathname !== '/') return 'map';
  const params = new URLSearchParams(search);
  if (params.has('artist') || params.has('genre') || params.has('scene')) return 'map';
  return 'story';
}

let snapshot: StorySnapshot = {
  mode: initialMode(), canvasLive: false, todayOpen: true, todayShown: false, mapBusy: false, storyFocus: null,
};
const SERVER_SNAPSHOT: StorySnapshot = {
  mode: 'story', canvasLive: false, todayOpen: true, todayShown: false, mapBusy: false, storyFocus: null,
};
const listeners = new Set<() => void>();

function update(next: Partial<StorySnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach(fn => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function useStory(): StorySnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
}

export function getStory(): StorySnapshot {
  return snapshot;
}

export function setStoryMode(mode: StoryMode) {
  if (snapshot.mode === mode) return;
  // The pre-paint script in HomeStory hides the server-rendered story for a
  // deep link; replaying the story has to undo that.
  if (mode === 'story') delete document.documentElement.dataset.story;
  update({ mode, canvasLive: mode === 'map', storyFocus: null, todayShown: false });
  if (mode === 'map') {
    storyFrame.intro = false;
    storyFrame.reveal = 1;
    storyFrame.morph = 1;
  }
}

export function setCanvasLive(canvasLive: boolean) {
  if (snapshot.canvasLive !== canvasLive) update({ canvasLive });
}

export function setStoryFocus(storyFocus: string | null) {
  if (snapshot.storyFocus !== storyFocus) update({ storyFocus });
}

export function setTodayOpen(todayOpen: boolean) {
  if (snapshot.todayOpen !== todayOpen) update({ todayOpen });
}

export function setTodayShown(todayShown: boolean) {
  if (snapshot.todayShown !== todayShown) update({ todayShown });
}

export function setMapBusy(mapBusy: boolean) {
  if (snapshot.mapBusy !== mapBusy) update({ mapBusy });
}

// "How it works" asks for the full opening even on a return visit. Read once
// (and cleared) by the opening when it starts.
let fullIntroRequested = false;
export function requestFullIntro() {
  fullIntroRequested = true;
  // The map may be anywhere; ForceGraph frames the overview again and sets
  // this back before the opening starts.
  storyFrame.graphReady = false;
  setStoryMode('story');
}
export function takeFullIntroRequest(): boolean {
  const asked = fullIntroRequested;
  fullIntroRequested = false;
  return asked;
}

// ── Per-frame values ─────────────────────────────────────────────────────────
// The opening (components/home/Intro.tsx) writes these every frame; ForceGraph
// reads them while drawing. See lib/intro-groove.ts for the record's geometry.
export const storyFrame = {
  /** Set by ForceGraph once the camera has its overview framing. */
  graphReady: false,
  /** True while the opening owns the stars' positions. */
  intro: false,
  /** How far the needle has travelled along the groove, 0..1. Stars further
   *  along aren't lit yet. */
  reveal: 1,
  /** The record's rotation, radians. */
  spin: 0,
  /** 0 = every star on the record, 1 = every star at its place in the atlas. */
  morph: 1,
  /** The loudness of whatever the opening is playing, 0..1 (see
   *  lib/use-audio-level.ts). The music travelling a line swells with it. */
  level: 0,
  /** Music travelling a family's lines: out of `from` (an influence) into
   *  `to` (the artist they shaped), or into every artist `from` shaped when
   *  `to` is null. `t` is how far along, 0..1. Null when nothing travels. */
  flow: null as { from: string; to: string | null; t: number } | null,
  /** The closing wave that lights every line on the map outward from the
   *  Velvet Underground, 0..1; past 1 it fades back out. -1 when off. */
  wave: -1,
  /** The opening's first beat: copies of the Velvet Underground's record fly
   *  out and light each artist who learned from them, 0..1. -1 when off. */
  sparks: -1,
  /** Vinyl dust drifting in the light around the label, 0..1. */
  dust: 0,
  /** How many copies have landed so far — written by ForceGraph, which
   *  schedules them, for the opening's tally. */
  vuLanded: 0,
  /** A return visit's record shrinking into today's star, 0..1. -1 when off. */
  collapse: -1,
  /** Light from across the map gathering into today's star at the end of
   *  the first visit, 0..1. -1 when off. */
  gather: -1,
  // "How it works" (components/tour/Tour.tsx), drawn by ForceGraph:
  /** Stars to find or tap: rings open out from each. */
  pulse: [] as string[],
  /** A line to follow: it brightens and fades. */
  pulseLine: null as { from: string; to: string } | null,
  /** A road walked, kept lit: ids in order. */
  route: null as string[] | null,
  /** The realms' names lighting one at a time, 0..1. -1 when off. */
  realms: -1,
  /** Today's record: the star that spins as a little record. */
  todayId: null as string | null,
  /** Whether it's spinning (1) or not (0). ForceGraph eases toward it. */
  todayTarget: 0,
};

// Filled in by ForceGraph while it's mounted, so the opening's words can sit
// beside a star: where artist `id` is on screen, in viewport pixels.
// …and moves the camera part of the way to a star (`amount` 0..1 of the
// distance), zooming by `zoom`, over `ms`.
export const storyCamera: {
  nodeScreen: ((id: string) => { x: number; y: number } | null) | null;
  drift: ((id: string, amount: number, zoom: number, ms: number) => void) | null;
  /** The camera's zoom; with `k`, moves to it over `ms` first. */
  zoom: ((k?: number, ms?: number) => number) | null;
  /** Back to the whole map, over `ms`. */
  overview: ((ms: number) => void) | null;
  /** Centre on a star at zoom `k`, over `ms`. */
  zoomOn: ((id: string, k: number, ms: number) => void) | null;
} = {
  nodeScreen: null,
  drift: null,
  zoom: null,
  overview: null,
  zoomOn: null,
};

// Filled in by the opening while it plays: ends it exactly as a skip would.
// Today's record calls it when the visitor presses play before it's over.
export const storyControl: { finish: (() => void) | null } = { finish: null };

export function resetStoryFrame() {
  storyFrame.intro = false;
  storyFrame.reveal = 1;
  storyFrame.morph = 1;
  storyFrame.level = 0;
  storyFrame.flow = null;
  storyFrame.wave = -1;
  storyFrame.sparks = -1;
  storyFrame.dust = 0;
  storyFrame.collapse = -1;
  storyFrame.gather = -1;
}
