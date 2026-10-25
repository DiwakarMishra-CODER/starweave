import type { GraphData, ImageCredit } from '@/data/types';
import { buildLightbox, resolveScenes, roomQueue, type Lightbox, type LightboxScene } from '@/lib/scenes-lightbox';
import type { Queue } from '@/lib/player';

// A scene's own page: its strip lifted off the lightbox (/scenes) and put
// under the loupe. This file is the data, pure and worked out on the server;
// components/scenes/SceneTable, RoomToRoom and SceneCircle draw it.
//
// - The strip, big: one portrait frame per band, sized from how many bands
//   there are so seven still fit, with each band's role in the room written
//   under its frame.
// - Room to room: the influence links between this room's bands and bands in
//   other rooms (the lightbox's arrows), drawn on the real /scenes sheet.
// - Their circle: everyone on the map the bands name, and everyone who names
//   them, rooms or not.

export const HERO_SHEET_W = 1400;
export const HERO_FILM_MAX = 1160; // the film never runs under the pocket player's corner
export const HERO_FRAME_MAX = 190;
export const HERO_FRAME_RATIO = 1.3; // portrait, as on the lightbox
export const HERO_LEADER = 8;
export const HERO_GAP = 4;

export interface SceneBand {
  id: string;
  name: string;
  imageUrl: string | null;
  imageCredit: ImageCredit | null;
  previewUrl: string | null;
  previewTrack: string | null;
  /** What they did in this room, one line. */
  role: string;
  /** The band in the room the most artists on the map name: the star. */
  starred: boolean;
  /** How many artists on the map name them as an influence. */
  namedBy: number;
  /** Their major record, which slides out from behind the frame. */
  record: { title: string; year: number | null; imageUrl: string | null } | null;
}

/** One arrow between rooms: a band here and a band in another scene. */
export interface RoomLink {
  /** The band in this room. */
  here: string;
  hereName: string;
  /** The band in the other room. */
  there: string;
  thereName: string;
  scene: string;
  sceneName: string;
  /** True: the band here shaped the one there. False: the one there shaped it. */
  out: boolean;
}

export interface CircleFace {
  id: string;
  name: string;
  imageUrl: string | null;
  activeFrom: number | null;
  /** The bands here they're linked to. */
  via: string[];
}

export interface SceneStep {
  id: string;
  name: string;
  yearStart: number;
}

export interface ScenePage {
  scene: LightboxScene;
  place: string;
  placeAndTime: string[];
  legacy: string;
  bands: SceneBand[];
  frameW: number;
  frameH: number;
  filmW: number;
  /** The scenes before and after this one in time, as the lightbox orders them. */
  prev: SceneStep | null;
  next: SceneStep | null;
  links: RoomLink[];
  /** The links in one plain sentence of counts. */
  linkSummary: string;
  learnedFrom: CircleFace[];
  passedTo: CircleFace[];
  /** What an empty row of the circle says instead. */
  learnedFromEmpty: string;
  passedToEmpty: string;
  /** The whole lightbox, for the room-to-room sheet. */
  sheet: Lightbox;
  queue: Queue;
}

export function heroFrame(bands: number): { frameW: number; frameH: number; filmW: number } {
  const n = Math.max(1, bands);
  const frameW = Math.min(HERO_FRAME_MAX, Math.floor((HERO_FILM_MAX - 2 * HERO_LEADER - (n - 1) * HERO_GAP) / n));
  return {
    frameW,
    frameH: Math.round(frameW * HERO_FRAME_RATIO),
    filmW: 2 * HERO_LEADER + n * frameW + (n - 1) * HERO_GAP,
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function summariseLinks(links: RoomLink[]): string {
  const outs = links.filter(l => l.out), ins = links.filter(l => !l.out);
  const bands = (ls: RoomLink[]) => new Set(ls.map(l => l.there)).size;
  const rooms = (ls: RoomLink[]) => new Set(ls.map(l => l.scene)).size;
  const shaped = outs.length > 0
    ? `The bands here shaped ${plural(bands(outs), 'band', 'bands')} in ${plural(rooms(outs), 'other scene', 'other scenes')}`
    : 'No band in another scene names the bands here';
  const shapedBy = ins.length > 0
    ? `${plural(bands(ins), 'band', 'bands')} from ${plural(rooms(ins), 'other scene', 'other scenes')} shaped them`
    : 'none of them names a band from another scene';
  return `${shaped}; ${shapedBy}.`;
}

export function resolveScenePage(data: GraphData, id: string, now = new Date().getFullYear()): ScenePage | null {
  const raw = data.scenes.find(s => s.id === id);
  const scenes = resolveScenes(data, now);
  const at = scenes.findIndex(s => s.id === id);
  if (!raw || at < 0) return null;
  const scene = scenes[at];

  const byId = new Map(data.artists.map(a => [a.id, a]));
  const named = new Map<string, number>();
  for (const e of data.edges) if (e.type === 'influence') named.set(e.target, (named.get(e.target) ?? 0) + 1);
  const roles = new Map(raw.memberRoles.map(r => [r.artistId, r.role]));

  const bands: SceneBand[] = scene.members.map(m => {
    const album = byId.get(m.id)?.classicAlbums?.[0];
    return {
      id: m.id,
      name: m.name,
      imageUrl: m.imageUrl,
      imageCredit: m.imageCredit,
      previewUrl: m.previewUrl,
      previewTrack: m.previewTrack,
      role: roles.get(m.id) ?? '',
      starred: m.id === scene.starId,
      namedBy: named.get(m.id) ?? 0,
      record: album ? { title: album.title, year: album.year ?? null, imageUrl: album.imageUrl ?? null } : null,
    };
  });

  // Room to room, from the lightbox's own links between scenes.
  const sceneOf = new Map<string, LightboxScene>();
  for (const s of scenes) for (const m of s.members) if (!sceneOf.has(m.id)) sceneOf.set(m.id, s);
  const nameOf = (a: string) => byId.get(a)?.name ?? a;
  const links: RoomLink[] = scene.members.flatMap(m => [
    ...m.shaped.map(there => ({ there, out: true })),
    ...m.shapedBy.map(there => ({ there, out: false })),
  ].flatMap(({ there, out }) => {
    const other = sceneOf.get(there);
    return other ? [{ here: m.id, hereName: m.name, there, thereName: nameOf(there), scene: other.id, sceneName: other.name, out }] : [];
  }));

  // Their circle: anyone on the map, in a room or not, oldest first.
  const ids = new Set(scene.members.map(m => m.id));
  const circle = (pairs: [string, string][]): CircleFace[] => {
    const via = new Map<string, Set<string>>();
    for (const [other, member] of pairs) {
      if (ids.has(other) || !byId.has(other)) continue;
      if (!via.has(other)) via.set(other, new Set());
      via.get(other)!.add(nameOf(member));
    }
    return [...via].map(([a, v]) => {
      const artist = byId.get(a)!;
      return { id: a, name: artist.name, imageUrl: artist.imageUrl ?? null, activeFrom: artist.activeFrom ?? null, via: [...v] };
    }).sort((x, y) => (x.activeFrom ?? 9999) - (y.activeFrom ?? 9999) || x.name.localeCompare(y.name));
  };
  const influence = data.edges.filter(e => e.type === 'influence');
  const learnedFrom = circle(influence.filter(e => ids.has(e.source)).map(e => [e.target, e.source]));
  const passedTo = circle(influence.filter(e => ids.has(e.target)).map(e => [e.source, e.target]));

  const step = (s: LightboxScene | undefined): SceneStep | null => (s ? { id: s.id, name: s.name, yearStart: s.yearStart } : null);

  return {
    scene,
    place: raw.place,
    placeAndTime: raw.placeAndTime,
    legacy: raw.legacy,
    bands,
    ...heroFrame(bands.length),
    prev: step(scenes[at - 1]),
    next: step(scenes[at + 1]),
    links,
    linkSummary: summariseLinks(links),
    learnedFrom,
    passedTo,
    learnedFromEmpty: 'No one they name is on the map.',
    // A room still going is too young to have been named; an old one simply wasn't.
    passedToEmpty: scene.isOpenEnded || scene.yearStart >= now - 10
      ? 'Too soon to tell: no one on the map names them yet.'
      : 'No one on the map names them.',
    sheet: buildLightbox(scenes),
    queue: roomQueue(scene),
  };
}
