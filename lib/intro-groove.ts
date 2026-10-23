// The opening's record (components/home/Intro.tsx drives it, ForceGraph draws
// it): every artist placed on one spiral groove in the order they started,
// with the Velvet Underground alone at the centre as the label. Pure geometry,
// shared so the canvas and the year counter can never disagree about where
// the needle is.

export const LABEL_ID = 'velvet-underground';

// How many times the groove winds from the label out to the rim.
export const GROOVE_TURNS = 4.5;
// The groove starts this far out (a fraction of the rim), leaving room for
// the label.
export const GROOVE_INNER = 0.16;
// The record's rim as a share of the canvas's shorter side.
export const RIM_SHARE = 0.42;
// Where the needle sits, as a screen angle: upper right, where a tonearm rests.
export const NEEDLE_ANGLE = -Math.PI / 5;

export interface GrooveSlot {
  id: string;
  /** Position along the groove, 0 (innermost) to 1 (the rim). */
  f: number;
  year: number;
}

export function buildGroove(artists: { id: string; name: string; activeFrom?: number }[]): GrooveSlot[] {
  const rest = artists
    .filter(a => a.id !== LABEL_ID)
    .sort((a, b) => (a.activeFrom ?? 9999) - (b.activeFrom ?? 9999) || a.name.localeCompare(b.name));
  const last = Math.max(rest.length - 1, 1);
  return rest.map((a, i) => ({ id: a.id, f: i / last, year: a.activeFrom ?? 0 }));
}

/** The artist under the needle when it has travelled `f` of the groove. */
export function grooveSlotAt(slots: GrooveSlot[], f: number): GrooveSlot | null {
  if (slots.length === 0) return null;
  return slots[Math.min(slots.length - 1, Math.max(0, Math.floor(f * (slots.length - 1))))];
}

/**
 * The record's rotation that keeps the groove point at `f` under the needle.
 * The groove winds anticlockwise outward, so the record turns clockwise as
 * the needle tracks outward — the way a record turns.
 */
export function spinForNeedle(f: number): number {
  return NEEDLE_ANGLE + f * Math.PI * 2 * GROOVE_TURNS;
}

/** A point on the groove, in graph units, for a record of rim radius `rim`. */
export function groovePoint(f: number, rim: number, spin: number): { x: number; y: number } {
  const r = rim * (GROOVE_INNER + (1 - GROOVE_INNER) * f);
  const angle = -f * Math.PI * 2 * GROOVE_TURNS + spin;
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
}
