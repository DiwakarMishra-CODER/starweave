// How a scene page was arrived at, so it can greet you the right way: from
// the lightbox (its frames fly up from their slots, so the strip must already
// be in place), from the scene before or after (the film advances, and the
// years roll on from the last scene's), or back to a scene already seen this
// visit (shown lit, no feed-in). And which scene was just left, so the
// lightbox can let that strip fly home into its slot.
//
// Module state, so it lives for the visit and resets on a reload. Notes go
// stale after a few seconds rather than being cleared when read: React's
// development mode renders and mounts twice, and both must read the same.

const FRESH_MS = 4000;
/** How long the strip runs out before the page changes, going to the next scene. */
export const LEAVE_MS = 220;

export type ArrivalKind = 'lightbox' | 'next' | 'prev';

interface Arrival {
  kind: ArrivalKind;
  scene: string;
  /** The years of the scene just left, for the rolling years. */
  from?: { start: number; end: number; open: boolean };
  at: number;
}

let arrival: Arrival | null = null;
let left: { scene: string; at: number } | null = null;
const seen = new Set<string>();

// Which way the page being left is going (to the scene after or before), so
// its strip can run out that side. A store, so the strip hears it at the
// click, before the page changes; the next scene page clears it.
let leaving: 'next' | 'prev' | null = null;
const listeners = new Set<() => void>();
const setLeaving = (v: typeof leaving) => {
  if (leaving === v) return;
  leaving = v;
  listeners.forEach(l => l());
};
export const subscribeLeaving = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getLeaving = () => leaving;
export const clearLeaving = () => setLeaving(null);

export function noteArrival(a: Omit<Arrival, 'at'>): void {
  arrival = { ...a, at: Date.now() };
  if (a.kind === 'next' || a.kind === 'prev') setLeaving(a.kind);
}

export function arrivalFor(scene: string): Arrival | null {
  return arrival && arrival.scene === scene && Date.now() - arrival.at < FRESH_MS ? arrival : null;
}

export function noteLeft(scene: string): void {
  left = { scene, at: Date.now() };
}

/** The scene page just left, if it was left a moment ago. */
export function justLeft(): string | null {
  return left && Date.now() - left.at < FRESH_MS ? left.scene : null;
}

export function markSeen(scene: string): void {
  seen.add(scene);
}

export function wasSeen(scene: string): boolean {
  return seen.has(scene);
}
