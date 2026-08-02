import type { Genre } from '@/data/types';

export interface GenreLineage {
  ancestors: Genre[]; // root-first, nearest-parent-last
  current: Genre;
  children: Genre[];
}

// Pure `parent`-chain walk — no year/rank logic (that's lib/genre-timeline.ts's
// job for the /genres poster). Used for the small per-genre-page lineage strip,
// which only needs "what's directly above and below this genre in the tree."
export function getGenreLineage(genres: Genre[], genreId: string): GenreLineage | null {
  const byId = new Map(genres.map(g => [g.id, g]));
  const current = byId.get(genreId);
  if (!current) return null;

  const ancestors: Genre[] = [];
  let cursor = current;
  while (cursor.parent) {
    const parent = byId.get(cursor.parent);
    if (!parent) break;
    ancestors.unshift(parent);
    cursor = parent;
  }

  const children = genres.filter(g => g.parent === genreId);

  return { ancestors, current, children };
}
