import type { Edge } from '@/data/types';

// The family view: a focused artist with their musical parents (the artists
// they learned from) in rows above and their musical children (the artists
// who learned from them) in rows below. Drawn by ForceGraph; timed by the
// home page's opening, which shows a family through the same view — so both
// read these.

// The two directions, in two colours that can't be confused: warm for where
// the music came from, cool for where it went.
export const FAMILY_PARENT_COLOR = '#f0c97a';
export const FAMILY_CHILD_COLOR = '#8fd0ff';

// The lines draw themselves in, one after another, in the direction the
// influence ran — out of the older artist, into the younger: parents first,
// then a beat, then children. The first starts once the camera has mostly
// arrived.
export const FAMILY_DRAW_DELAY_MS = 420;
export const FAMILY_DRAW_MS = 420;
export const FAMILY_DRAW_STAGGER_MS = 110;
// The home page's opening draws its example family faster: it's showing
// what a family looks like, not inviting a read of every line.
export const FAMILY_DRAW_STAGGER_FAST_MS = 55;
export const FAMILY_CHILDREN_PAUSE_MS = 250;

/** Who `id` learned from and who learned from them. An artist who is both —
 *  they cite each other — counts as a parent. Unordered. */
export function familyOf(edges: Edge[], id: string): { parents: string[]; children: string[] } {
  const parents = new Set<string>();
  const children = new Set<string>();
  for (const e of edges) {
    if (e.type !== 'influence') continue;
    if (e.source === id) parents.add(e.target);
    else if (e.target === id) children.add(e.source);
  }
  for (const p of parents) children.delete(p);
  return { parents: [...parents], children: [...children] };
}

/** How long a family takes to finish drawing in, from the moment it's focused. */
export function familyDrawMs(parents: number, children: number, stagger = FAMILY_DRAW_STAGGER_MS): number {
  return FAMILY_DRAW_DELAY_MS
    + Math.max(0, parents - 1) * stagger
    + (children > 0 ? FAMILY_CHILDREN_PAUSE_MS + parents * stagger + (children - 1) * stagger : 0)
    + FAMILY_DRAW_MS;
}
