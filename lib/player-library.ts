import type { Artist, Edge, GraphData, Realm } from '@/data/types';
import { REALMS, REALM_LABELS } from './colors';
import { buildPortrait } from './family-portrait';
import { SONG_MS, type Queue, type Track } from './player';

// What the site's player can play (lib/player), built from the graph:
// - the whole story: every song on the map, oldest first, from the earliest
//   start (Karen Dalton, 1960) to today;
// - a station per realm, oldest first;
// - shuffle: everything, in a random order;
// - an artist and then their family, for search.
// Only artists with a song are in these lists.

/** Anyone with a name and maybe a song: an artist, or a face in a family photo. */
export interface Playable {
  id: string;
  name: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  previewTrack?: string | null;
  activeFrom?: number | null;
}

export const toTrack = (a: Playable): Track => ({
  id: a.id,
  name: a.name,
  imageUrl: a.imageUrl ?? null,
  previewUrl: a.previewUrl ?? null,
  previewTrack: a.previewTrack ?? null,
  activeFrom: a.activeFrom ?? null,
});

const oldestFirst = (a: Artist, b: Artist) =>
  (a.activeFrom ?? 9999) - (b.activeFrom ?? 9999) || a.name.localeCompare(b.name);

const playable = (artists: Artist[]) => artists.filter(a => a.previewUrl);

export function wholeStory(artists: Artist[]): Queue {
  return { id: 'story', title: 'The whole story', tracks: playable(artists).sort(oldestFirst).map(toTrack), stopMs: SONG_MS };
}

export function station(artists: Artist[], realm: Realm): Queue {
  return {
    id: `station:${realm}`,
    title: REALM_LABELS[realm],
    tracks: playable(artists).filter(a => (a.realm ?? 'region-one') === realm).sort(oldestFirst).map(toTrack),
    stopMs: SONG_MS,
  };
}

export function stations(artists: Artist[]): Queue[] {
  return REALMS.map(r => station(artists, r)).filter(q => q.tracks.length > 0);
}

/** Everything in a random order (Fisher-Yates); `random` for tests. */
export function shuffled(artists: Artist[], random = Math.random): Queue {
  const tracks = playable(artists).map(toTrack);
  for (let i = tracks.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
  }
  return { id: 'shuffle', title: 'Shuffle', tracks, stopMs: SONG_MS };
}

/** An artist's song, then everyone in their family photo, oldest first. */
export function artistThenFamily(data: GraphData, id: string): Queue | null {
  const artist = data.artists.find(a => a.id === id);
  if (!artist) return null;
  const portrait = buildPortrait(data, id);
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const family = [...portrait.back.flat(), ...portrait.front.flat(), ...portrait.frontMore]
    .map(m => byId.get(m.id))
    .filter((a): a is Artist => !!a?.previewUrl)
    .sort(oldestFirst);
  return {
    id: `from:${id}`,
    title: `${artist.name}, then their family`,
    tracks: [artist, ...family].map(toTrack),
    stopMs: SONG_MS,
  };
}

const TIER_RANK: Record<string, number> = { 'first-person': 0, reported: 1, critic: 2 };
const bySource = (a: Edge, b: Edge) =>
  (TIER_RANK[a.sourceTier ?? ''] ?? 3) - (TIER_RANK[b.sourceTier ?? ''] ?? 3) || (b.confidence ?? 0) - (a.confidence ?? 0);

/**
 * Today's record as a road through its family (the home page's "Hear where
 * it came from"): the influence it's quoted on, briefly, then the record
 * itself, then three it shaped -- their best-sourced links, the one quoted
 * on it first. Linked, so the map lights each line as the music crosses it,
 * and offering their whole family after.
 */
export function todaysRoad(
  data: GraphData,
  record: { id: string; why: { direction: 'parent' | 'child'; other: { id: string } } | null },
): Queue | null {
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const artist = byId.get(record.id);
  if (!artist) return null;
  const from = record.why?.direction === 'parent' ? byId.get(record.why.other.id) : undefined;
  const quotedChild = record.why?.direction === 'child' ? record.why.other.id : null;
  const shaped = data.edges
    .filter(e => e.type === 'influence' && e.target === record.id && e.source !== from?.id && byId.get(e.source)?.previewUrl)
    .sort((a, b) => (a.source === quotedChild ? -1 : b.source === quotedChild ? 1 : bySource(a, b)))
    .slice(0, 3)
    .map(e => byId.get(e.source)!);
  const tracks: Track[] = [
    // Notes short enough for one line of the folded player's screen.
    ...(from?.previewUrl ? [{ ...toTrack(from), note: 'Came from', ms: 12000 }] : []),
    { ...toTrack(artist), note: "Today's record" },
    ...shaped.map(a => ({ ...toTrack(a), note: 'Led to', ms: 15000 })),
  ];
  const family = artistThenFamily(data, record.id);
  return {
    id: `today:${record.id}`,
    title: `Today's record: ${artist.name}`,
    tracks,
    stopMs: SONG_MS,
    flows: true,
    after: family && family.tracks.length > 1
      ? { label: `Keep going: ${artist.name}'s family`, queue: { ...family, id: `family-of:${record.id}`, title: `${artist.name}'s family`, tracks: family.tracks.slice(1) } }
      : undefined,
  };
}

/** Search by name: names starting with the query first, then names containing it. */
export function searchArtists(artists: Artist[], query: string, limit = 8): Artist[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: Artist[] = [];
  const contains: Artist[] = [];
  for (const a of artists) {
    const name = a.name.toLowerCase();
    const bare = name.replace(/^the /, '');
    if (name.startsWith(q) || bare.startsWith(q)) starts.push(a);
    else if (name.includes(q)) contains.push(a);
  }
  return [...starts.sort((a, b) => a.name.localeCompare(b.name)), ...contains].slice(0, limit);
}
