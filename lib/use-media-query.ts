'use client';

import { useSyncExternalStore } from 'react';

// Media queries read during render.
//
// useSyncExternalStore rather than a useState/useEffect pair: a media query IS
// an external store, callers need the value during render (the graph's draw
// callbacks, both timelines' event wiring, the artist panel's layout), and a
// synchronous setState inside an effect would trip react-hooks/set-state-in-effect.
//
// Server snapshot is false everywhere: the desktop/pointer path is the
// pre-existing behaviour, so SSR renders that and a phone corrects on
// hydration, before any gesture can have happened.
//
// ── Which hook to reach for ──────────────────────────────────────────────
// These answer genuinely different questions and must not stand in for each
// other. Conflating them caused a real bug: the artist panel's bottom sheet
// was styled by a width query but rendered on a pointer check, so a narrow
// laptop window got the sheet's CSS and none of its markup — a 104px panel
// wrapped around a 128px hero with nothing able to expand it.
//
//   useNarrowLayout()  — "is there room?" Layout and chrome decisions: the
//                        bottom sheet vs the side drawer, the collapsed
//                        search. A small window on a laptop has the same
//                        problem a phone does.
//   useCoarsePointer() — "what is the user touching this with?" Interaction
//                        decisions: hover suppression, finger-sized hit
//                        targets, tap-instead-of-hover on the timelines.
//                        A large tablet is still a finger.
const COARSE_POINTER_QUERY = '(pointer: coarse)';

// Must match the --peek/--expanded sheet rules in globals.css and
// SHEET_MAX_CANVAS_WIDTH in ForceGraph.tsx, which offsets the focus camera by
// the collapsed sheet's height.
export const NARROW_LAYOUT_QUERY = '(max-width: 600px)';

type Store = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => boolean;
};

// Cached per query string so subscribe/getSnapshot keep stable identities
// across renders — otherwise useSyncExternalStore resubscribes every time.
const stores = new Map<string, Store>();

function storeFor(query: string): Store {
  let store = stores.get(query);
  if (!store) {
    store = {
      subscribe: (onChange: () => void) => {
        const mq = window.matchMedia(query);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
      },
      getSnapshot: () => window.matchMedia(query).matches,
    };
    stores.set(query, store);
  }
  return store;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  const { subscribe, getSnapshot } = storeFor(query);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Touch device (no mouse). An interaction question — see the note above. */
export function useCoarsePointer(): boolean {
  return useMediaQuery(COARSE_POINTER_QUERY);
}

/** Too narrow for the side drawer. A space question — see the note above. */
export function useNarrowLayout(): boolean {
  return useMediaQuery(NARROW_LAYOUT_QUERY);
}
