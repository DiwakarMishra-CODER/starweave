// How a genre's feature page was arrived at, so it opens the right way:
// turned to from the feature before or after (a page turn), or opened fresh
// (the paper opens and the photo prints), or a feature already read this
// visit (shown as it is). The same shape as lib/scene-arrival.
//
// Module state, so it lives for the visit and resets on a reload. Notes go
// stale after a few seconds rather than being cleared when read: React's
// development mode renders and mounts twice, and both must read the same.

const FRESH_MS = 4000;
/** How long the page turns before the route changes, going to the next feature. */
export const TURN_MS = 300;

export type TurnKind = 'next' | 'prev';

let arrival: { kind: TurnKind; genre: string; at: number } | null = null;
const read = new Set<string>();

// Which way the page being left is turning, so it can turn before the page
// changes. A store, so the spread hears it at the click.
let leaving: TurnKind | null = null;
const listeners = new Set<() => void>();
const setLeaving = (v: TurnKind | null) => {
  if (leaving === v) return;
  leaving = v;
  listeners.forEach(l => l());
};
export const subscribeLeaving = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getLeaving = () => leaving;
export const clearLeaving = () => setLeaving(null);

export function noteTurn(kind: TurnKind, genre: string): void {
  arrival = { kind, genre, at: Date.now() };
  setLeaving(kind);
}

export function turnedTo(genre: string): TurnKind | null {
  return arrival && arrival.genre === genre && Date.now() - arrival.at < FRESH_MS ? arrival.kind : null;
}

export function markRead(genre: string): void {
  read.add(genre);
}

export function wasRead(genre: string): boolean {
  return read.has(genre);
}
