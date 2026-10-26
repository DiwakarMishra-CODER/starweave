import type { Artist, GraphData } from '@/data/types';
import { compareEdgesByEvidence } from '@/data/types';
import { roomWall } from '@/lib/colors';

// The room behind an artist's page (components/artist/backline/Room): a
// cosy, cluttered room whose shelves hold the records of the artist's own
// family, with two instruments standing in front, chosen by their sound and
// decorated the way bands decorate theirs -- pin badges of the bands that
// shaped them, stickers of the bands they shaped. Pure and server-side;
// tested in tests/lib/backline.test.ts.

/** Which instruments: a bass and a guitar for most; a synth and a drum
 *  machine for electronic artists; an acoustic guitar and its case for folk. */
export type Kit = 'band' | 'electronic' | 'folk';

export interface Face {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ShelfRecord {
  /** The artist whose record it is. */
  artistId: string;
  title: string;
  imageUrl: string;
  /** One of the artist's family (or their own), not a genre neighbour. */
  family: boolean;
}

/** A flyer for the scene they played in, from the map's own scene: name,
 *  city, years -- no invented gig. */
export interface SceneFlyer {
  name: string;
  city: string;
  years: string;
}

export interface Backline {
  kit: Kit;
  /** Their own photo, for their poster on the wall. */
  self: Face | null;
  scene: SceneFlyer | null;
  /** The wall, a deep shade of the artist's colour. */
  wall: string;
  /** Who shaped them, strongest proof first: the badges. */
  badges: Face[];
  /** Who they shaped, strongest proof first: the stickers. */
  stickers: Face[];
  /** The shelves, most telling first: their own record, their family's,
   *  then records from their genre to fill the rest of the wall. */
  records: ShelfRecord[];
}

const MAX_BADGES = 14;
const MAX_STICKERS = 10;
export const SHELF_RECORDS = 30;

export function kitFor(artist: Pick<Artist, 'realm' | 'lineage' | 'genres'>): Kit {
  const genres = artist.genres ?? [];
  if (artist.realm === 'electronic' || genres.includes('electronic') || genres[0] === 'ambient') return 'electronic';
  if (artist.realm === 'folk-confessional' && artist.lineage !== 'slowcore') return 'folk';
  return 'band';
}

export function resolveBackline(data: Pick<GraphData, 'artists' | 'edges' | 'scenes'>, artistId: string, color: string): Backline {
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const artist = byId.get(artistId);
  if (!artist) throw new Error(`No artist ${artistId}`);

  const family = (side: 'back' | 'front'): Artist[] => {
    const seen = new Set<string>();
    return data.edges
      .filter(e => e.type === 'influence' && (side === 'back' ? e.source === artistId : e.target === artistId))
      .sort(compareEdgesByEvidence)
      .flatMap(e => {
        const other = byId.get(side === 'back' ? e.target : e.source);
        if (!other || seen.has(other.id)) return [];
        seen.add(other.id);
        return [other];
      });
  };
  const back = family('back');
  const front = family('front');
  const face = (a: Artist): Face[] => (a.imageUrl ? [{ id: a.id, name: a.name, imageUrl: a.imageUrl }] : []);

  // The shelves: their own record, then their family alternating back and
  // front (both sides of the family are seen in the columns), then genre
  // neighbours the map names most often.
  const records: ShelfRecord[] = [];
  const shelved = new Set<string>();
  const shelve = (a: Artist, isFamily: boolean) => {
    const album = a.classicAlbums?.[0];
    if (!album?.imageUrl || shelved.has(a.id)) return;
    shelved.add(a.id);
    records.push({ artistId: a.id, title: album.title, imageUrl: album.imageUrl, family: isFamily });
  };
  shelve(artist, true);
  for (let i = 0; i < Math.max(back.length, front.length); i++) {
    if (back[i]) shelve(back[i], true);
    if (front[i]) shelve(front[i], true);
  }
  const named = new Map<string, number>();
  for (const e of data.edges) if (e.type === 'influence') named.set(e.target, (named.get(e.target) ?? 0) + 1);
  const genre = artist.genres?.[0];
  data.artists
    .filter(a => genre && a.genres?.includes(genre))
    .sort((x, y) => (named.get(y.id) ?? 0) - (named.get(x.id) ?? 0) || x.name.localeCompare(y.name))
    .forEach(a => { if (records.length < SHELF_RECORDS) shelve(a, false); });

  const scene = data.scenes.find(sc => sc.memberIds.includes(artistId));
  return {
    kit: kitFor(artist),
    self: face(artist)[0] ?? null,
    scene: scene ? { name: scene.name, city: scene.city, years: `${scene.yearStart}–${scene.yearEnd ?? 'now'}` } : null,
    wall: roomWall(color),
    badges: back.flatMap(face).slice(0, MAX_BADGES),
    stickers: front.flatMap(face).slice(0, MAX_STICKERS),
    records: records.slice(0, SHELF_RECORDS),
  };
}

/** A genre's room (its feature page): the same room, filled with the genre.
 *  The instruments are the ones most of its artists play (each artist's
 *  kitFor, by majority; a tie is a band); the first on the map to play it
 *  wear the badges and the latest are the stickers; the shelves hold its
 *  essential records first (`essential`: their artists, in the page's ranked
 *  order), then its other artists' records, the most named first; its most
 *  named artist with a photo is the poster of honour. */
export function resolveGenreBackline(
  data: Pick<GraphData, 'artists' | 'edges'>,
  genreId: string,
  color: string,
  essential: string[],
): Backline {
  const members = data.artists.filter(a => a.genres?.includes(genreId));
  const votes = new Map<Kit, number>();
  for (const a of members) votes.set(kitFor(a), (votes.get(kitFor(a)) ?? 0) + 1);
  const kit = (['band', 'electronic', 'folk'] as Kit[]).reduce((best, k) => ((votes.get(k) ?? 0) > (votes.get(best) ?? 0) ? k : best), 'band' as Kit);
  const face = (a: Artist): Face[] => (a.imageUrl ? [{ id: a.id, name: a.name, imageUrl: a.imageUrl }] : []);
  const byYear = members.filter(a => a.imageUrl && a.activeFrom).sort((a, b) => a.activeFrom! - b.activeFrom! || a.name.localeCompare(b.name));
  const badges = byYear.slice(0, MAX_BADGES).flatMap(face);
  const worn = new Set(badges.map(f => f.id));
  const stickers = byYear.slice().reverse().filter(a => !worn.has(a.id)).slice(0, MAX_STICKERS).flatMap(face);

  const named = new Map<string, number>();
  for (const e of data.edges) if (e.type === 'influence') named.set(e.target, (named.get(e.target) ?? 0) + 1);
  const mostNamed = members.slice().sort((a, b) => (named.get(b.id) ?? 0) - (named.get(a.id) ?? 0) || a.name.localeCompare(b.name));
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const records: ShelfRecord[] = [];
  const shelved = new Set<string>();
  const shelve = (a: Artist | undefined, isEssential: boolean) => {
    const album = a?.classicAlbums?.[0];
    if (!a || !album?.imageUrl || shelved.has(a.id) || records.length >= SHELF_RECORDS) return;
    shelved.add(a.id);
    records.push({ artistId: a.id, title: album.title, imageUrl: album.imageUrl, family: isEssential });
  };
  essential.forEach(id => shelve(byId.get(id), true));
  mostNamed.forEach(a => shelve(a, false));

  return {
    kit,
    wall: roomWall(color),
    self: mostNamed.flatMap(face)[0] ?? null,
    scene: null,
    badges,
    stickers,
    records,
  };
}

