import type { GraphData, ImageCredit } from '@/data/types';
import { SCENE_COLORS, DEFAULT_SCENE_COLOR, readableInk } from '@/lib/colors';
import type { Queue, Track } from '@/lib/player';

// /scenes as contact sheets on a lightbox: each scene a strip of slide film,
// as long as the scene lasted, one frame per band in it, with its name
// written above in grease pencil and its city and years printed along the
// film's edge. This file is the layout, pure and in real pixels;
// components/scenes/Lightbox.tsx draws it.
//
// Two things decide the shape:
//
// - Strips that don't overlap in time share a row, packed greedily in year
//   order (touching years count as overlapping, so a strip never butts
//   against the next). Fifteen scenes fit six rows: at most six ran at once.
//   Each strip is its own element with its own hit area -- shared rows broke
//   hover once, when every row was a full-width <div> stacked on the others.
//
// - Time is not a year scale. A strip has to be long enough for its frames,
//   its name and its edge print, so the years are spaced just as far apart
//   as the strips need (the /genres idea). Every constraint runs forward in
//   time, so the shortest axis is one pass of longest-path over the years
//   where scenes start or end. The frame size is then the largest that fits
//   the sheet, and the axis is stretched evenly to fill it -- stretching
//   only lengthens spans, so it never breaks a constraint. The film is cut
//   after its last band (blank frames on the long scenes looked like broken
//   film), and how long the scene lasted is a grease-pencil line from its
//   name to its end year -- the mark a photographer makes on a sheet. The
//   ruler along the top shows real years at their uneven spacing.

export const LIGHT = '#efe5cf';
export const SHEET_W = 1400;
export const PAD_X = 22;
export const PAD_TOP = 10;
export const PAD_BOTTOM = 12;
export const RULER_H = 36;
export const LABEL_PX = 14;
export const LABEL_H = 19;
export const TOP_REBATE = 8;
export const BOTTOM_REBATE = 13;
export const LEADER = 5;
export const FRAME_GAP = 3;
export const STRIP_GAP = 10;
const LABEL_GAP = 12; // between a name and the next strip's name in its row
export const ROW_GAP = 15; // air between rows: the sheet was cramped at 8
export const EDGE_PX = 8;
const EDGE_CHAR = 0.6 * EDGE_PX; // IBM Plex Mono advances 0.6em
const YEAR_MIN_PX = 1.5;
const KEY_MARGIN = 14;
const KEY_SIZES: [number, number][] = [[372, 262], [340, 262]];
const FRAME_MIN = 30;
const FRAME_MAX = 46;
const FRAME_RATIO = 1.3; // portrait, so a face fills the frame's height

// Permanent Marker's advance widths at 100px, measured in the page with
// canvas measureText (summing them matches the browser to a pixel). If the
// grease-pencil face or size changes, measure again.
const MARKER: Record<string, number> = {
  A: 70.2, B: 68.7, C: 61.1, D: 58.9, E: 62.7, F: 57.5, G: 78.9, H: 69.5, I: 51.6, J: 66.9, K: 77.6, L: 63.3, M: 97.4,
  N: 68.5, O: 74.4, P: 64, Q: 74.4, R: 64.6, S: 57.6, T: 60.7, U: 69.5, V: 58.4, W: 99.4, X: 62.3, Y: 49.3, Z: 66.4,
  a: 58.1, b: 57.3, c: 51.4, d: 49.7, e: 52.1, f: 45.5, g: 65.2, h: 58.2, i: 32, j: 53.4, k: 64.6, l: 53.3, m: 81.4,
  n: 56.4, o: 62.9, p: 52.4, q: 62.5, r: 54.1, s: 46.4, t: 47.9, u: 58.5, v: 48.5, w: 82.5, x: 50.7, y: 40, z: 54.8,
  '0': 68.7, '1': 32.2, '2': 65, '3': 56.2, '4': 58.2, '5': 58, '6': 50.1, '7': 57.6, '8': 53.7, '9': 52.9,
  ' ': 37, '.': 22.9, ',': 20.4, '-': 60.9, '–': 58.9, '·': 22.7, '&': 60, '!': 26.1, 'ü': 58.5, 'é': 52.1, '?': 55.7,
  '’': 19.9, "'": 26.6,
};

export function markerWidth(text: string, px = LABEL_PX): number {
  let w = 0;
  for (const ch of text) w += MARKER[ch] ?? 70;
  return (w * px) / 100;
}

export interface LightboxMember {
  id: string;
  name: string;
  imageUrl: string | null;
  /** Only on the few freely licensed photos that ask for one. */
  imageCredit: ImageCredit | null;
  previewUrl: string | null;
  previewTrack: string | null;
  activeFrom: number | null;
  /** Bands in other rooms that name this one as an influence (room to room). */
  shaped: string[];
  /** Bands in other rooms this one names as an influence. */
  shapedBy: string[];
}

export interface LightboxScene {
  id: string;
  name: string;
  city: string;
  era: string;
  blurb: string;
  yearStart: number;
  /** Always a number: an open-ended scene runs to the current year. */
  yearEnd: number;
  isOpenEnded: boolean;
  color: string;
  /** The scene colour darkened until it reads on the lit lightbox. */
  ink: string;
  members: LightboxMember[];
  /** The band in the room the most artists on the map name as an influence:
   *  the frame that gets the photographer's star. Null if none is named. */
  starId: string | null;
  /** How many artists on the map name the starred band. */
  starCount: number;
}

export interface LightboxStrip extends LightboxScene {
  row: number;
  left: number;
  top: number;
  /** The film: its bands' frames and its edge print, cut after the last. */
  width: number;
  /** Where the scene's years end on the sheet (the panel's edge if it's still going). */
  spanEnd: number;
  /** How far the grease-pencil name runs, so its line starts after it. */
  nameWidth: number;
  edge: string;
}

export interface RulerTick {
  year: number;
  x: number;
  label: boolean;
}

export interface Lightbox {
  width: number;
  height: number;
  rows: number;
  frameW: number;
  frameH: number;
  stripH: number;
  rowH: number;
  rulerTop: number;
  axisStart: number;
  axisEnd: number;
  strips: LightboxStrip[];
  ticks: RulerTick[];
  /** The years where scenes start or end and where they sit on the sheet;
   *  yearToX reads any year off it. Plain numbers, so the layout can be
   *  built on the server and handed to the page. */
  axis: { years: number[]; pos: number[] };
  /** Where the key card is taped: the biggest empty corner the strips leave
   *  (bottom left, before the late-70s scenes start), or null if none fits. */
  keySpot: { left: number; top: number; width: number; height: number } | null;
}

export function yearToX(axis: Lightbox['axis'], year: number): number {
  const { years, pos } = axis;
  if (year <= years[0]) return pos[0];
  for (let k = 1; k < years.length; k++) {
    if (year <= years[k]) return pos[k - 1] + ((year - years[k - 1]) / (years[k] - years[k - 1])) * (pos[k] - pos[k - 1]);
  }
  return pos[pos.length - 1];
}

// A scene with no yearEnd (the Windmill) hasn't closed. It runs to the
// current year -- the only end that's true of an ongoing scene -- and its
// strip runs off the edge of the lightbox rather than being cut, so the
// number is never read as an end date. The floor keeps a scene that started
// this year from having no length at all.
const OPEN_ENDED_MIN_SPAN = 4;

export function resolveScenes(data: GraphData, now = new Date().getFullYear()): LightboxScene[] {
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const named = new Map<string, number>();
  for (const e of data.edges) if (e.type === 'influence') named.set(e.target, (named.get(e.target) ?? 0) + 1);
  // Room to room: influence links between bands in different scenes. An
  // edge's source names its target as an influence, so the target shaped it.
  const sceneOf = new Map<string, string>();
  for (const s of data.scenes) for (const id of s.memberIds) if (!sceneOf.has(id)) sceneOf.set(id, s.id);
  const shaped = new Map<string, string[]>();
  const shapedBy = new Map<string, string[]>();
  for (const e of data.edges) {
    if (e.type !== 'influence') continue;
    const from = sceneOf.get(e.target), to = sceneOf.get(e.source);
    if (!from || !to || from === to) continue;
    shaped.set(e.target, [...(shaped.get(e.target) ?? []), e.source]);
    shapedBy.set(e.source, [...(shapedBy.get(e.source) ?? []), e.target]);
  }
  return data.scenes
    .slice()
    .sort((a, b) => a.yearStart - b.yearStart || b.memberIds.length - a.memberIds.length)
    .map(s => {
      const color = SCENE_COLORS[s.id] ?? DEFAULT_SCENE_COLOR;
      // Most named first; on a tie, the one listed first in the scene.
      const starId = s.memberIds.reduce<string | null>(
        (best, id) => ((named.get(id) ?? 0) > (best ? named.get(best) ?? 0 : 0) ? id : best), null);
      return {
        id: s.id,
        name: s.name,
        city: s.city,
        era: s.era,
        blurb: s.blurb,
        yearStart: s.yearStart,
        yearEnd: s.yearEnd ?? Math.max(s.yearStart + OPEN_ENDED_MIN_SPAN, now),
        isOpenEnded: s.yearEnd === undefined,
        color,
        ink: readableInk(color, LIGHT, 4.6),
        members: s.memberIds
          .map(id => byId.get(id))
          .filter((a): a is NonNullable<typeof a> => !!a)
          .map(a => ({
            id: a.id,
            name: a.name,
            imageUrl: a.imageUrl ?? null,
            imageCredit: a.imageCredit ?? null,
            previewUrl: a.previewUrl ?? null,
            previewTrack: a.previewTrack ?? null,
            activeFrom: a.activeFrom ?? null,
            shaped: [...new Set(shaped.get(a.id) ?? [])],
            shapedBy: [...new Set(shapedBy.get(a.id) ?? [])],
          })),
        starId,
        starCount: starId ? named.get(starId) ?? 0 : 0,
      };
    });
}

// Play the room (8 seconds a band, through the site's player) and Play the
// history: one band from every room, oldest first -- each room's starred
// band, or its first with a song.
export const ROOM_STOP_MS = 8000;
export const HISTORY_ID = 'scenes:history';

const toTrack = (m: LightboxMember, note: string): Track => ({
  id: m.id, name: m.name, imageUrl: m.imageUrl, previewUrl: m.previewUrl,
  previewTrack: m.previewTrack, activeFrom: m.activeFrom, note,
});

export function roomQueue(s: LightboxScene): Queue {
  return { id: `scene:${s.id}`, title: s.name, stopMs: ROOM_STOP_MS, tracks: s.members.map(m => toTrack(m, `${s.name} · ${s.city}`)) };
}

export function historyQueue(scenes: LightboxScene[]): Queue {
  return {
    id: HISTORY_ID,
    title: 'The history, one band from every room',
    stopMs: ROOM_STOP_MS,
    tracks: scenes.flatMap(s => {
      const pick = s.members.find(m => m.id === s.starId && m.previewUrl) ?? s.members.find(m => m.previewUrl);
      return pick ? [toTrack(pick, `${s.name} · ${s.era}`)] : [];
    }),
  };
}

/** A scene queue (a room or the history) is loaded in the site's player. */
export const isScenesQueue = (id: string | undefined) => !!id && (id === HISTORY_ID || id.startsWith('scene:'));

const yy = (y: number) => String(y % 100).padStart(2, '0');

/** What's printed along the film's edge: the city and the years. */
export function edgePrint(s: Pick<LightboxScene, 'city' | 'yearStart' | 'yearEnd' | 'isOpenEnded'>): string {
  // The first place only: the edge has room for a word or two.
  const city = s.city.split(/[,–]/)[0].replace(/ then /g, ' → ').toUpperCase();
  return `${city} · ${yy(s.yearStart)}–${s.isOpenEnded ? '' : yy(s.yearEnd)}`;
}

/** The narrowest a strip can be: its bands' frames and its edge print. Its
 *  name may run on past the film, over the gap before the next strip. */
function minStripWidth(s: LightboxScene, frameW: number): number {
  const n = Math.max(1, s.members.length);
  const film = 2 * LEADER + n * frameW + (n - 1) * FRAME_GAP;
  const edge = edgePrint(s).length * EDGE_CHAR + 2 * LEADER;
  return Math.max(film, edge);
}

/** The name, then its play button ("Play the room"), then a gap. */
export const PLAY_W = 20; // a filled round button; it widens over the line when pointed at
export const PLAY_GAP = 6;
const nameRoom = (s: LightboxScene) => markerWidth(s.name) + PLAY_GAP + PLAY_W + LABEL_GAP;

/** Greedy row packing in year order; touching years count as overlapping. */
export function packRows(scenes: LightboxScene[]): number[] {
  const ends: number[] = [];
  return scenes.map(s => {
    let row = ends.findIndex(end => end < s.yearStart);
    if (row < 0) row = ends.push(0) - 1;
    ends[row] = s.yearEnd;
    return row;
  });
}

// The shortest axis for a frame size: one forward pass over the years where
// a scene starts or ends, each taking the furthest of what reaches it.
function solveAxis(scenes: LightboxScene[], rows: number[], frameW: number) {
  const years = [...new Set(scenes.flatMap(s => [s.yearStart, s.yearEnd]))].sort((a, b) => a - b);
  const at = new Map(years.map((y, i) => [y, i]));
  const x = new Array<number>(years.length).fill(0);
  // Constraints into each year: [from year index, minimum distance].
  const into: [number, number][][] = years.map(() => []);
  scenes.forEach(s => into[at.get(s.yearEnd)!].push([at.get(s.yearStart)!, minStripWidth(s, frameW)]));
  const lastInRow = new Map<number, LightboxScene>();
  scenes.forEach((s, i) => {
    const before = lastInRow.get(rows[i]);
    if (before) {
      into[at.get(s.yearStart)!].push([at.get(before.yearEnd)!, STRIP_GAP]);
      into[at.get(s.yearStart)!].push([at.get(before.yearStart)!, nameRoom(before)]);
    }
    lastInRow.set(rows[i], s);
  });
  // The last name in each row still has to fit on the sheet.
  for (const s of lastInRow.values()) into[years.length - 1].push([at.get(s.yearStart)!, nameRoom(s)]);
  for (let k = 1; k < years.length; k++) {
    let v = x[k - 1] + YEAR_MIN_PX * (years[k] - years[k - 1]);
    for (const [from, d] of into[k]) v = Math.max(v, x[from] + d);
    x[k] = v;
  }
  return { years, x };
}

export function buildLightbox(scenes: LightboxScene[], width = SHEET_W): Lightbox {
  const rows = packRows(scenes);
  const inner = width - 2 * PAD_X;

  // The largest frame that fits the sheet, to a tenth of a pixel.
  let lo = FRAME_MIN, hi = FRAME_MAX;
  const span = (fw: number) => { const a = solveAxis(scenes, rows, fw); return a.x[a.x.length - 1]; };
  if (span(hi) <= inner) lo = hi;
  else for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (span(mid) <= inner) lo = mid; else hi = mid; }
  const frameW = Math.floor(lo);
  const frameH = Math.round(frameW * FRAME_RATIO);

  const { years, x } = solveAxis(scenes, rows, frameW);
  const stretch = inner / x[x.length - 1];
  const axis = { years, pos: x.map(v => PAD_X + v * stretch) };
  const yearX = (year: number) => yearToX(axis, year);

  const stripH = TOP_REBATE + frameH + BOTTOM_REBATE;
  const rowH = LABEL_H + stripH + ROW_GAP;
  const strips: LightboxStrip[] = scenes.map((s, i) => {
    const left = Math.round(yearX(s.yearStart));
    return {
      ...s,
      row: rows[i],
      left,
      top: PAD_TOP + RULER_H + rows[i] * rowH + LABEL_H,
      width: Math.ceil(minStripWidth(s, frameW)),
      // Still running: the line carries on to the edge of the panel.
      spanEnd: s.isOpenEnded ? width : Math.round(yearX(s.yearEnd)),
      nameWidth: Math.ceil(markerWidth(s.name)),
      edge: edgePrint(s),
    };
  });

  const rowCount = Math.max(...rows) + 1;
  // The ruler runs along the top: the site's pocket player floats over the
  // bottom-right corner, which the strips leave empty but a ruler wouldn't.
  const rulerTop = PAD_TOP;
  const axisStart = years[0];
  const axisEnd = years[years.length - 1];

  // A tick on every year that has room for one; a year written on the
  // multiples of five, the first and the last, where they don't collide.
  const ticks: RulerTick[] = [];
  let lastTick = -Infinity, lastLabel = -Infinity;
  for (let y = axisStart; y <= axisEnd; y++) {
    const tx = yearX(y);
    if (tx - lastTick < 3 && y !== axisEnd) continue;
    const wantsLabel = y === axisStart || y === axisEnd || y % 5 === 0;
    const label = wantsLabel && tx - lastLabel >= 34 && (y === axisEnd || yearX(axisEnd) - tx >= 34);
    ticks.push({ year: y, x: tx, label });
    lastTick = tx;
    if (label) lastLabel = tx;
  }

  const height = PAD_TOP + RULER_H + rowCount * rowH + PAD_BOTTOM;

  // The key card goes in the empty bottom-left corner when there's one big
  // enough: it mustn't touch any strip, name or pencil line.
  const taken = strips.map(s => ({
    l: s.left, t: s.top - LABEL_H,
    r: Math.max(s.left + s.width, s.left + s.nameWidth, s.spanEnd), b: s.top + stripH,
  }));
  const clear = (k: { left: number; top: number; width: number; height: number }) =>
    taken.every(o => k.left + k.width + KEY_MARGIN <= o.l || o.r + KEY_MARGIN <= k.left
      || k.top + k.height + KEY_MARGIN <= o.t || o.b + KEY_MARGIN <= k.top);
  let keySpot: Lightbox['keySpot'] = null;
  for (const [w, h] of KEY_SIZES) {
    const k = { left: PAD_X + 10, top: height - h - 14, width: w, height: h };
    if (k.top > rulerTop + RULER_H && clear(k)) { keySpot = k; break; }
  }

  return {
    width,
    height,
    rows: rowCount,
    frameW,
    frameH,
    stripH,
    rowH,
    rulerTop,
    axisStart,
    axisEnd,
    strips,
    ticks,
    axis,
    keySpot,
  };
}
