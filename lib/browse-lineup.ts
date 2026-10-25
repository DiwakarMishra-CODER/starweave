import type { GraphData, Realm } from '@/data/types';
import { REALM_COLORS, REALM_LABELS, readableInk } from '@/lib/colors';
import { compareNames } from '@/lib/sort';

// /browse as a festival bill told in faces: every artist on the map, the
// billing set by how many artists on the map name them as an influence --
// headliners large at the top, each tier smaller below, the newest voices
// in small faces at the foot. Pointing at anyone lights the artists they
// shaped and the ones who shaped them, across the whole bill. This file is
// the data and the arrangements, pure and server-side; the drawing is
// components/browse.

export const PAPER = '#efe3cb';

export interface Tier {
  id: string;
  /** Lowest "named by" count in the tier. */
  min: number;
  heading: string;
  /** Plain-words note under the heading, if the tier needs one. */
  note?: string;
  /** Photo size in px on a laptop. */
  size: number;
}

// Thresholds fall where the data has natural breaks (Oct 2026: 11, 16, 41,
// 81 and 148 artists). The foot of the bill is mostly newer bands -- median
// start 2001, 82 of 148 after 2000 -- and says so, so small never reads as
// lesser.
export const TIERS: Tier[] = [
  { id: 'headliners', min: 20, heading: 'Named as an influence by 20 or more artists', size: 168 },
  { id: 'second', min: 10, heading: 'Named by 10 to 19', size: 120 },
  { id: 'third', min: 5, heading: 'Named by 5 to 9', size: 96 },
  { id: 'fourth', min: 2, heading: 'Named by 2 to 4', size: 80 },
  { id: 'newest', min: 0, heading: 'Named by one, or none yet', note: 'More than half of them started after 2000: the newest voices on the map.', size: 64 },
];

export const tierOf = (named: number): Tier => TIERS.find(t => named >= t.min)!;

export interface LineupArtist {
  id: string;
  name: string;
  imageUrl: string | null;
  realm: Realm;
  /** The realm's colour: its stage on the bill, and the photo's ink. */
  color: string;
  /** The realm colour darkened until a name reads on the paper. */
  ink: string;
  activeFrom: number | null;
  genres: string[];
  hasSong: boolean;
  /** How many artists on the map name this one as an influence. */
  named: number;
  /** Indices (into the lineup's artists) of the artists that name this one. */
  shaped: number[];
  /** Indices of the artists this one names. */
  shapedBy: number[];
}

export interface Lineup {
  artists: LineupArtist[];
  links: number;
  first: number;
}

export function buildLineup(data: GraphData): Lineup {
  const index = new Map(data.artists.map((a, i) => [a.id, i]));
  const shaped: number[][] = data.artists.map(() => []);
  const shapedBy: number[][] = data.artists.map(() => []);
  let links = 0;
  for (const e of data.edges) {
    if (e.type !== 'influence') continue;
    const s = index.get(e.source), t = index.get(e.target);
    if (s === undefined || t === undefined) continue;
    links++;
    // An edge's source names its target as an influence: the target shaped it.
    if (!shaped[t].includes(s)) shaped[t].push(s);
    if (!shapedBy[s].includes(t)) shapedBy[s].push(t);
  }
  const artists = data.artists.map((a, i) => {
    const realm = (a.realm ?? 'region-one') as Realm;
    const color = REALM_COLORS[realm];
    return {
      id: a.id,
      name: a.name,
      imageUrl: a.imageUrl ?? null,
      realm,
      color,
      ink: readableInk(color, PAPER, 4.6),
      activeFrom: a.activeFrom ?? null,
      genres: a.genres,
      hasSong: !!a.previewUrl,
      named: shaped[i].length,
      shaped: shaped[i],
      shapedBy: shapedBy[i],
    };
  });
  return { artists, links, first: Math.min(...artists.map(a => a.activeFrom ?? 9999)) };
}

export const REALM_ORDER: Realm[] = [
  'core', 'region-one', 'american-underground', 'electronic', 'folk-confessional', 'emo-posthardcore', 'post-rock-drone-noise',
];
export const realmName = (r: Realm) => REALM_LABELS[r];

export type Arrangement = 'poster' | 'az' | 'year';

export interface Section {
  id: string;
  heading: string;
  note?: string;
  size: number;
  /** Indices into the lineup's artists, in reading order. */
  items: number[];
  /** In one artist's own bill: who shaped them, them, who they shaped, the rest. */
  kind?: 'by' | 'star' | 'shaped' | 'rest';
  /** What to say when the section is empty. */
  empty?: string;
}

const SMALL = 72; // every face in the A-Z and year arrangements

/** The bill's sections for an arrangement: tiers (most named first, then
 *  by start year), letters, or decades. */
export function arrange(artists: LineupArtist[], how: Arrangement): Section[] {
  const all = artists.map((_, i) => i);
  if (how === 'poster') {
    return TIERS.map(t => ({
      id: t.id,
      heading: t.heading,
      note: t.note,
      size: t.size,
      items: all
        .filter(i => tierOf(artists[i].named) === t)
        .sort((a, b) => artists[b].named - artists[a].named
          || (artists[a].activeFrom ?? 9999) - (artists[b].activeFrom ?? 9999)
          || compareNames(artists[a].name, artists[b].name)),
    }));
  }
  if (how === 'az') {
    // Filed the way a record shop files them: "The Smiths" under S.
    const key = (i: number) => artists[i].name.replace(/^the\s+/i, '');
    const sorted = [...all].sort((a, b) => compareNames(key(a), key(b)));
    const groups = new Map<string, number[]>();
    for (const i of sorted) {
      const ch = key(i).replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase();
      const letter = /\p{L}/u.test(ch) ? ch : '#';
      groups.set(letter, [...(groups.get(letter) ?? []), i]);
    }
    return [...groups].map(([k, items]) => ({ id: `az-${k}`, heading: k, size: SMALL, items }));
  }
  const groups = new Map<number, number[]>();
  for (const i of [...all].sort((a, b) => (artists[a].activeFrom ?? 9999) - (artists[b].activeFrom ?? 9999)
    || compareNames(artists[a].name, artists[b].name))) {
    const decade = Math.floor((artists[i].activeFrom ?? 0) / 10) * 10;
    groups.set(decade, [...(groups.get(decade) ?? []), i]);
  }
  return [...groups].map(([d, items]) => ({ id: `year-${d}`, heading: d ? `${d}s` : 'Year unknown', size: SMALL, items }));
}

/** One artist's own bill: the artists who shaped them across the top, them
 *  large in the middle, the ones they shaped below, and everyone else
 *  folded small underneath. Each artist appears once (a mutual influence
 *  sits with the ones who shaped them). */
export function billFor(artists: LineupArtist[], i: number): Section[] {
  const a = artists[i];
  const mostNamed = (x: number, y: number) => artists[y].named - artists[x].named || compareNames(artists[x].name, artists[y].name);
  const by = [...a.shapedBy].sort(mostNamed);
  const shaped = a.shaped.filter(x => !a.shapedBy.includes(x)).sort(mostNamed);
  const family = new Set([i, ...by, ...shaped]);
  return [
    { id: 'bill-by', kind: 'by', heading: `Who shaped ${a.name}`, size: 96, items: by,
      empty: `Nobody on the map is named as shaping ${a.name}.` },
    { id: 'bill-star', kind: 'star', heading: a.name, size: 200, items: [i] },
    { id: 'bill-shaped', kind: 'shaped', heading: `Who ${a.name} shaped`, size: shaped.length > 24 ? 72 : 96, items: shaped,
      empty: `Nobody on the map names ${a.name} as an influence yet.` },
    { id: 'bill-rest', kind: 'rest', heading: 'Everyone else', size: 40,
      items: artists.map((_, j) => j).filter(j => !family.has(j)).sort(mostNamed) },
  ];
}
