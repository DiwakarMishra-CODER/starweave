'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { dayNumber } from '@/lib/home-story';
import { buildIssue, type CoverStar, type Issue } from '@/lib/genre-issue';
import type { GenreSession } from '@/lib/genre-session';

// The /genres opening, as a music paper's day: the cover comes out of the
// dark and lights up with today's issue, the band counts in (1, 2, 3, 4!),
// the cover swings open and the centrefold -- the city -- unfolds, its lights
// come on, and then the cover story plays: a red banner carries its
// headline across the sky and its road lights up on its own, so the first
// thing you see the page do is the thing it's for. Then the billboard with
// the key flickers on. A click, a tap, a scroll or a key ends the story
// early; just moving the mouse doesn't (it would almost always cancel it
// before it began).
//
// The full run is once a day (a new issue); later visits that day open
// quickly and skip the count-in and the story. With reduced motion there's
// no cover and no story -- the city is simply there.
//
// The server can't know the visitor's day, so the cover is rendered dark
// until the browser has picked the issue; nothing on it ever visibly swaps.

export type Stage = 'dark' | 'lit' | 'counting' | 'opening' | 'open' | 'story' | 'done';

const LIGHT_UP_MS = 380; // dark to lit
export const BEAT_MS = 440; // ~135 bpm
const COUNT_MS = BEAT_MS * 4 + 120; // 1, 2, 3, 4! -- then it opens
export const OPEN_MS = 1300; // the cover swinging over, the centrefold unfolding
// From the cover opening to the story: the city's lights come on first
// (0.9s in, a 1.5s sweep).
const STORY_AT_MS = 2600;
const STORY_MS = 6200;
const QUICK_MS = 150; // a later visit the same day: straight in
const SEEN_KEY = 'starweave:genres-issue';

export function useIssue(
  session: GenreSession,
  counts: { artists: number; genres: number },
  stars: Record<string, CoverStar>,
) {
  const [stage, setStageState] = useState<Stage>('dark');
  const [issue, setIssue] = useState<Issue | null>(null);
  const timers = useRef<number[]>([]);
  const full = useRef(false);
  const today = useRef('');
  // The story only plays if the visitor hasn't started looking around first.
  const storyWanted = useRef(true);
  const stageRef = useRef<Stage>('dark');
  const setStage = useCallback((next: Stage) => {
    stageRef.current = next;
    setStageState(next);
    if (next === 'done' && full.current) {
      try { localStorage.setItem(SEEN_KEY, today.current); } catch {}
    }
  }, []);
  const clear = useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
  }, []);
  const at = useCallback((ms: number, next: Stage) => {
    timers.current.push(window.setTimeout(() => setStage(next), ms));
  }, [setStage]);

  const runOpening = useCallback(() => {
    clear();
    setStage('opening');
    at(OPEN_MS, 'open');
    if (full.current) {
      timers.current.push(window.setTimeout(() => {
        if (!storyWanted.current) return setStage('done');
        setStage('story');
        at(STORY_MS, 'done');
      }, STORY_AT_MS));
    } else {
      at(OPEN_MS + 50, 'done');
    }
  }, [at, clear, setStage]);

  useEffect(() => {
    const now = new Date();
    const day = dayNumber(now, 'local');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the visitor's day is only known here; the cover waits dark for it
    setIssue(buildIssue(session, counts, day, stars));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage('done');
      return;
    }
    // Only read here. It's marked seen once the full show has actually
    // played (below): marking it now broke it -- React runs this twice in
    // development, and the second run found today already "seen" and played
    // the quick version, story and all skipped.
    today.current = String(day);
    try {
      full.current = localStorage.getItem(SEEN_KEY) !== today.current;
    } catch {
      full.current = true;
    }
    if (full.current) {
      at(30, 'lit');
      at(30 + LIGHT_UP_MS, 'counting');
      timers.current.push(window.setTimeout(runOpening, 30 + LIGHT_UP_MS + COUNT_MS));
    } else {
      at(30, 'lit');
      timers.current.push(window.setTimeout(runOpening, QUICK_MS));
    }
    return clear;
    // Built once per visit: the session and counts don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Open now: a click or tap on the cover. */
  const open = useCallback(() => {
    const s = stageRef.current;
    if (s === 'dark' || s === 'lit' || s === 'counting') runOpening();
  }, [runOpening]);

  /** The visitor has started looking for themselves: the story steps aside. */
  const release = useCallback(() => {
    storyWanted.current = false;
    if (stageRef.current === 'story') {
      clear();
      setStage('done');
    }
  }, [clear, setStage]);

  return {
    stage,
    issue,
    open,
    release,
    /** The billboard's key: on once the story is over (or was never coming). */
    keyOn: stage === 'done',
  };
}
