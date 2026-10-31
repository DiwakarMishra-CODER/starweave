// Each genre's family colour: the colour of the root its parent chain ends at,
// as on /genres. Shared by the city, the footer's sticker and the genre tags
// in the artist panel and on the artist page, so a genre is one colour
// everywhere.

import type { Genre } from '@/data/types';

// The family founders' colours, from the app's palette (lib/colors.ts):
// gold for the earliest and biggest, magenta for the krautrock/electronic
// line, rose, folk olive, and a neutral for minimalism.
export const ROOT_COLOR: Record<string, string> = {
  'garage-rock': '#E8C87A',
  'art-rock': '#C77DD1',
  'psychedelic-pop': '#F2A8C4',
  'singer-songwriter': '#78963C',
  minimalism: '#9b96b8',
};
export const DEFAULT_ROOT_COLOR = '#8891F2';

/** The colour of the family `id` belongs to (its root's colour). */
export function genreFamilyColor(genres: Pick<Genre, 'id' | 'parent'>[], id: string): string {
  const parentOf = new Map(genres.map(g => [g.id, g.parent ?? null]));
  let at = id;
  for (let i = 0; i < 50; i++) {
    const up = parentOf.get(at);
    if (!up) break;
    at = up;
  }
  return ROOT_COLOR[at] ?? DEFAULT_ROOT_COLOR;
}
