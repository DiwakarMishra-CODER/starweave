import type { GraphData } from '@/data/types';
import { compareNames } from './sort';
import { readableInk } from './colors';
import { ROOT_COLOR, DEFAULT_ROOT_COLOR } from './genre-family';

// The /genres page: the history of these sounds drawn as a studio track
// sheet, all of it on one screen. Each row is a track, grouped by family;
// each genre is a clip on its track, starting at the year it was born. A
// clip that carries a track on from the one before it is spliced to it; one
// that grew out of a clip elsewhere is patched in with a cable. Pure layout
// -- no DOM, run on the server -- with every position in real pixels, so the
// page draws names at true CSS size and never scales them.
//
// Two ideas decide where everything goes:
// - Heavy-path decomposition: within a family, the child with the most
//   artists carries its parent's track on (a splice); every other child
//   starts a chain of its own, which may fork again later.
// - Greedy interval colouring: chains are packed onto as few tracks as
//   possible -- a track is reused once the chain on it has ended. 13 tracks
//   for 51 genres.
//
// Time runs across, but not on a year scale: clips go down in year order,
// each as far left as it can sit -- never left of the year before it, never
// on top of the clip before it on its track. A crowded stretch (1978-85)
// gets the room its names need and an empty one closes up, so the whole
// history fits one screen. The ruler shows the real years at their uneven
// spacing, which is the honest readout of that. (A vertical family tree came
// first: every name fitted, but it was ~1,700px tall and couldn't be seen
// at once.)

// The masking tape the track heads are labelled on (--tape in globals.css):
// family names are darkened against it to read as ink.
export const PAPER = '#e6dcc3';
// Each sign is lettered in the condensed sign face (Anton, like the title
// and the street signs), in its name's own case -- capitals at this size
// were hard to read -- and sized from the real width of every letter,
// measured in the page at 100px with canvas measureText, so a name never
// runs out of its sign. An average letter width was used once and cut
// "Chamber pop" and "Hypnagogic pop" short.
const SIGN_GLYPHS: Record<string, number> = {
  A: 48.54, B: 47.85, C: 47.41, D: 49.32, E: 41.16, F: 39.89, G: 48.49, H: 49.9, I: 22.66,
  J: 46.63, K: 47.22, L: 39.75, M: 74.61, N: 49.8, O: 48.63, P: 47.22, Q: 49.37, R: 47.66,
  S: 46.14, T: 39.55, U: 47.36, V: 46.92, W: 71.19, X: 48.39, Y: 44.63, Z: 41.02,
  a: 48.34, b: 50.15, c: 49.12, d: 49.8, e: 48.83, f: 28.03, g: 50.39, h: 50.54, i: 24.32,
  j: 26.27, k: 49.07, l: 24.8, m: 75.83, n: 49.85, o: 49.66, p: 50.15, q: 49.8, r: 34.67,
  s: 47.46, t: 30.52, u: 49.9, v: 46.09, w: 69.63, x: 45.9, y: 46.09, z: 38.57,
  ' ': 23.44, '-': 31.1, '&': 52,
};
export const SIGN_PX = 12.5;
export const SIGN_TRACKING = 0.04; // em, between letters
// Padding 9px left and 8px right plus a 1.5px border a side in globals.css,
// and a pixel spare.
const CLIP_CHROME = 9 + 8 + 3 + 1;
const CLIP_MIN_W = 42;

/** How wide a line of text is in the condensed poster face (Anton), at
 *  `px`, with `tracking` em between letters: the genre features' headlines. */
export function antonWidth(line: string, px: number, tracking = 0): number {
  let w = 0;
  for (const ch of line) w += SIGN_GLYPHS[ch] ?? 50;
  return (w * px) / 100 + line.length * tracking * px;
}

/** How wide a line of a sign's name is, as it's lettered. */
export function signTextWidth(line: string): number {
  let w = 0;
  for (const ch of line) w += SIGN_GLYPHS[ch] ?? 50;
  return (w * SIGN_PX) / 100 + line.length * SIGN_TRACKING * SIGN_PX;
}
// A name this long or shorter stays on one line.
const ONE_LINE_MAX_CHARS = 10;
export const CLIP_H = 30;
// The 20px between rows is where cables run, like cords taped down along
// the gaps of a studio floor. It was 10px, so the whole city fit a ~760px
// laptop window, but the owner couldn't see what went where in the stacked
// rows (Post-punk, No wave, Dance-punk); the city now runs a little past
// the first screen instead, at full lettering size.
export const TRACK_H = 50;
const FAMILY_GAP = 14;
export const HEAD_W = 96;
// The night sky along the top of the spread: the skyline, the rooftop sign
// with the page's title, and beside it how to read the whole thing -- the
// key on one line, what to do on the next -- always in the same place.
export const SKY_H = 60;
export const RULER_H = 36; // the year ticker, under the sky
export const YEAR_LABEL_GAP = 36; // a four-digit year on the display, and room either side
const PAD_LEFT = 10; // after the track heads
const PAD_RIGHT = 12;
const PAD_BOTTOM = 10;
const CLIP_GAP = 16; // between clips on a track: room for a cable to drop in and plug
const YEAR_STEP = 4; // the least a year moves time along
export const JACK_W = 9;
const ROAD_LEAD = 8; // how far a road runs on past its first and last sign
const DROP_IN = 12; // a cable crosses between gaps this far left of its clip
const ENTRY_IN = 14; // and drops onto the clip this far in from its left edge
const CORNER_R = 6;
const RUN_STEP = 4; // cables sharing a gap run side by side

// Top to bottom. The pocket player floats over the sheet's bottom-right
// corner (PLAYER_CORNER), so the families whose right ends sit low and late
// go last: Songwriter's runs out by 2006 short of the edge, Minimalism's in
// 1991, while Psychedelic's reaches 2010 and so sits above the corner. Any
// family not listed follows, biggest first.
const FAMILY_ORDER = ['garage-rock', 'art-rock', 'psychedelic-pop', 'singer-songwriter', 'minimalism'];
// Genres that start a road of their own on a free row, reached by an
// overpass, instead of carrying their parent's road on. Twee pop (Oct 2026)
// on Indie pop's road ran past 1984 and pushed Dream pop and Shoegaze onto a
// fifth row: the city grew 50px, its bottom family went under the index tab
// and the pocket player landed on Psychedelic. On its own road it fits the
// gap after Noise pop. Each entry should save its family a row; a rule that
// cut every such genre also repacked lines the owner had approved.
const OWN_ROAD = new Set(['twee-pop']);
const FAMILY_NAME: Record<string, string> = {
  'garage-rock': 'Garage',
  'art-rock': 'Art',
  'psychedelic-pop': 'Psychedelic',
  'singer-songwriter': 'Songwriter',
  minimalism: 'Minimalism',
};

// Containers, not ancestors: a genre whose parent is one of these starts its
// own family.
const CONTAINER_IDS = new Set(['electronic', 'folk']);

export interface SessionClip {
  id: string;
  name: string;
  /** The name as it's lettered: one line, or two broken at a space or hyphen. */
  lines: string[];
  emerged: number;
  emergedBasis: string;
  count: number; // artists tagged with it
  familyId: string;
  parentId: string | null;
  alsoFromIds: string[];
  isFounder: boolean;
  track: number; // 0-based, top to bottom
  left: number;
  y: number; // the track's middle
  w: number;
}

export interface SessionFamily {
  id: string;
  name: string;
  /** The family's own colour, lit on the console. */
  color: string;
  /** Darkened to read as ink on paper (its masking-tape label). */
  ink: string;
  size: number; // genres in it
  firstTrack: number;
  trackCount: number;
  top: number;
  bottom: number;
  /** The family's name lettered big and faint across its district, in the
   *  emptiest stretch of its rows: the box's top-left, width and type size. */
  district: { x: number; y: number; w: number; px: number } | null;
}

export interface SessionLink {
  childId: string;
  parentId: string;
  /** A splice carries a track straight on; a cable patches in from elsewhere. */
  kind: 'splice' | 'cable';
  d: string;
  /** The corners the line runs through (d rounds them off). */
  pts: { x: number; y: number }[];
  ink: string;
  count: number; // the child's artists, for the pen weight
  /** The arrow at a cable's end, dropping onto the child's top edge (dir 1)
   *  or up onto its bottom edge (dir -1). */
  jack?: { x: number; y: number; dir: 1 | -1 };
}

export interface SessionRoad {
  y: number;
  x1: number;
  x2: number;
  familyId: string;
}

export interface GenreSession {
  clips: SessionClip[];
  families: SessionFamily[];
  links: SessionLink[];
  trackYs: number[];
  /** The roads as drawn: one per line. A road runs from a line's first sign
   *  to its last and breaks where the next sign on the lane didn't grow out
   *  of the one before it, so a continuous road always means "this grew out
   *  of that". (The lanes themselves stay packed by interval colouring; a
   *  lane once drew as one road end to end, and unrelated genres read as
   *  one line.) */
  roads: SessionRoad[];
  /** Each year's place on the ruler, and whether its label fits. */
  years: { year: number; x: number; labelled: boolean }[];
  /** Where each decade starts: a bar line down the sheet. */
  decades: { label: string; x: number }[];
  /** Where time starts and ends on the sheet. */
  timeStart: number;
  timeEnd: number;
  width: number;
  height: number;
}

interface Chain { nodeIds: string[]; startRank: number; endRank: number }

/** "Alternative rock" -> ["Alternative", "rock"]; short names stay whole. */
export function letterLines(name: string): string[] {
  if (name.length <= ONE_LINE_MAX_CHARS) return [name];
  // Break points: after a space (dropping it) or after a hyphen (keeping it).
  let best: string[] = [name];
  let bestMax = name.length;
  for (let i = 1; i < name.length; i++) {
    let a: string, b: string;
    if (name[i - 1] === ' ') { a = name.slice(0, i - 1); b = name.slice(i); }
    else if (name[i - 1] === '-') { a = name.slice(0, i); b = name.slice(i); }
    else continue;
    const m = Math.max(a.length, b.length);
    if (m < bestMax) { bestMax = m; best = [a, b]; }
  }
  return best;
}

const clipWidth = (lines: string[]) =>
  Math.max(CLIP_MIN_W, Math.ceil(Math.max(...lines.map(signTextWidth)) + CLIP_CHROME));

export function buildGenreSession(graphData: GraphData): GenreSession {
  const genres = graphData.genres;
  const counts = new Map<string, number>(genres.map(g => [g.id, 0]));
  for (const a of graphData.artists) for (const g of a.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  const byId = new Map(genres.map(g => [g.id, g]));
  const dated = genres.filter(g => g.emerged !== undefined);
  const datedIds = new Set(dated.map(g => g.id));

  const parentOf = (id: string): string | null => {
    const p = byId.get(id)?.parent;
    if (!p || CONTAINER_IDS.has(p) || !datedIds.has(p)) return null;
    return p;
  };

  const sorted = dated.slice().sort((a, b) => a.emerged! - b.emerged! || compareNames(a.name, b.name));
  const rankOf = new Map(sorted.map((g, i) => [g.id, i]));

  const childrenOf = new Map<string | null, string[]>();
  for (const g of sorted) {
    const p = parentOf(g.id);
    if (!childrenOf.has(p)) childrenOf.set(p, []);
    childrenOf.get(p)!.push(g.id);
  }
  const rootIds = childrenOf.get(null) ?? [];
  const familyOf = new Map<string, string>();
  const depthOf = new Map<string, number>();
  const walk = (id: string, family: string, depth: number) => {
    familyOf.set(id, family);
    depthOf.set(id, depth);
    for (const c of childrenOf.get(id) ?? []) walk(c, family, depth + 1);
  };
  for (const r of rootIds) walk(r, r, 0);
  const subtreeArtists = (id: string): number =>
    (counts.get(id) ?? 0) + (childrenOf.get(id) ?? []).reduce((s, c) => s + subtreeArtists(c), 0);

  // Heavy-path decomposition. A genre in OWN_ROAD starts a road of its own
  // instead of carrying its parent's on.
  const chainsOf = new Map<string, Chain[]>();
  const heaviest = (id: string) => {
    const heavy = (childrenOf.get(id) ?? []).slice()
      .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || rankOf.get(a)! - rankOf.get(b)!)[0] ?? null;
    return heavy && !OWN_ROAD.has(heavy) ? heavy : null;
  };
  const buildChain = (startId: string, family: string) => {
    const nodeIds: string[] = [];
    let cur: string | null = startId;
    while (cur) {
      nodeIds.push(cur);
      const heavy = heaviest(cur);
      for (const k of childrenOf.get(cur) ?? []) if (k !== heavy) buildChain(k, family);
      cur = heavy;
    }
    const ranks = nodeIds.map(n => rankOf.get(n)!);
    if (!chainsOf.has(family)) chainsOf.set(family, []);
    chainsOf.get(family)!.push({ nodeIds, startRank: Math.min(...ranks), endRank: Math.max(...ranks) });
  };
  for (const r of rootIds) buildChain(r, r);

  // Greedy interval colouring: each family's chains onto tracks.
  const laneOf = new Map<string, number>();
  const laneCountOf = new Map<string, number>();
  for (const r of rootIds) {
    const chains = (chainsOf.get(r) ?? []).slice().sort((a, b) => a.startRank - b.startRank);
    const laneEnd: number[] = [];
    for (const c of chains) {
      let lane = laneEnd.findIndex(end => end < c.startRank);
      if (lane === -1) { lane = laneEnd.length; laneEnd.push(-1); }
      laneEnd[lane] = c.endRank;
      for (const id of c.nodeIds) laneOf.set(id, lane);
    }
    laneCountOf.set(r, laneEnd.length);
  }

  const placeOf = (r: string) => (FAMILY_ORDER.includes(r) ? FAMILY_ORDER.indexOf(r) : FAMILY_ORDER.length);
  const familyOrder = rootIds.slice().sort((a, b) => placeOf(a) - placeOf(b) || subtreeArtists(b) - subtreeArtists(a));

  // Tracks, top to bottom.
  const trackOf = new Map<string, number>();
  const trackYs: number[] = [];
  const families: SessionFamily[] = [];
  let y = SKY_H + RULER_H;
  let track = 0;
  familyOrder.forEach((f, fi) => {
    if (fi > 0) y += FAMILY_GAP;
    const top = y;
    const firstTrack = track;
    const n = laneCountOf.get(f) ?? 0;
    for (let lane = 0; lane < n; lane++) {
      trackYs.push(y + TRACK_H / 2);
      y += TRACK_H;
      track++;
    }
    for (const g of sorted) if (familyOf.get(g.id) === f) trackOf.set(g.id, firstTrack + laneOf.get(g.id)!);
    families.push({
      id: f,
      name: FAMILY_NAME[f] ?? byId.get(f)!.name,
      color: ROOT_COLOR[f] ?? DEFAULT_ROOT_COLOR,
      ink: readableInk(ROOT_COLOR[f] ?? DEFAULT_ROOT_COLOR, PAPER),
      size: sorted.filter(g => familyOf.get(g.id) === f).length,
      firstTrack,
      trackCount: n,
      top,
      bottom: y,
      district: null,
    });
  });
  const inkOf = new Map(families.map(f => [f.id, f.ink]));

  // Time: each year as far left as the names allow. Within a year, elders
  // first, so a parent born the same year as its child still comes first.
  const linesOf = new Map(sorted.map(g => [g.id, letterLines(g.name)]));
  const widthOf = new Map(sorted.map(g => [g.id, clipWidth(linesOf.get(g.id)!)]));
  const timeStart = HEAD_W + PAD_LEFT;
  const leftOf = new Map<string, number>();
  const lastOnTrack = new Map<number, string>();
  const years: { year: number; x: number; labelled: boolean }[] = [];
  const byYear = new Map<number, typeof sorted>();
  for (const g of sorted) {
    if (!byYear.has(g.emerged!)) byYear.set(g.emerged!, []);
    byYear.get(g.emerged!)!.push(g);
  }
  let yearX = timeStart - YEAR_STEP;
  for (const [year, list] of byYear) {
    list.sort((a, b) => depthOf.get(a.id)! - depthOf.get(b.id)! || compareNames(a.name, b.name));
    // The year's place: right of the year before, and clear of every clip
    // already on the tracks it lands on.
    let x = yearX + YEAR_STEP;
    for (const g of list) {
      const prev = lastOnTrack.get(trackOf.get(g.id)!);
      if (prev && byId.get(prev)!.emerged !== year) x = Math.max(x, leftOf.get(prev)! + widthOf.get(prev)! + CLIP_GAP);
    }
    yearX = x;
    years.push({ year, x, labelled: false });
    for (const g of list) {
      const t = trackOf.get(g.id)!;
      const prev = lastOnTrack.get(t);
      // Two of this year's clips on one track: the younger follows the elder.
      const left = prev && byId.get(prev)!.emerged === year ? leftOf.get(prev)! + widthOf.get(prev)! + CLIP_GAP : x;
      leftOf.set(g.id, left);
      lastOnTrack.set(t, g.id);
      // ...and the next year starts after it, so time never runs backwards.
      yearX = Math.max(yearX, left);
    }
  }
  const timeEnd = Math.max(...sorted.map(g => leftOf.get(g.id)! + widthOf.get(g.id)!));

  // Year labels where they fit; decades get a bar line and always a label.
  let lastLabelX = -Infinity;
  for (const yr of years) {
    if (yr.x - lastLabelX >= YEAR_LABEL_GAP) { yr.labelled = true; lastLabelX = yr.x; }
  }
  const decades: { label: string; x: number }[] = [];
  let lastDecade: number | null = null;
  for (const yr of years) {
    const decade = Math.floor(yr.year / 10) * 10;
    if (decade !== lastDecade) {
      decades.push({ label: `the ${String(decade).slice(2)}s`, x: yr.x - YEAR_STEP / 2 - 2 });
      lastDecade = decade;
    }
  }

  const clips: SessionClip[] = sorted.map(g => ({
    id: g.id,
    name: g.name,
    lines: linesOf.get(g.id)!,
    emerged: g.emerged!,
    emergedBasis: g.emergedBasis ?? '',
    count: counts.get(g.id) ?? 0,
    familyId: familyOf.get(g.id)!,
    parentId: parentOf(g.id),
    alsoFromIds: (g.alsoFrom ?? []).filter(id => datedIds.has(id) && id !== g.parent),
    isFounder: parentOf(g.id) === null,
    track: trackOf.get(g.id)!,
    left: leftOf.get(g.id)!,
    y: trackYs[trackOf.get(g.id)!],
    w: widthOf.get(g.id)!,
  }));
  const clipById = new Map(clips.map(c => [c.id, c]));

  // Which clip comes next on each track.
  const nextOnTrack = new Map<string, string>();
  for (let t = 0; t < trackYs.length; t++) {
    const onTrack = clips.filter(c => c.track === t).sort((a, b) => a.left - b.left);
    for (let i = 0; i + 1 < onTrack.length; i++) nextOnTrack.set(onTrack[i].id, onTrack[i + 1].id);
  }

  // Splices and cables. A cable leaves the parent's edge facing the child,
  // runs along the gap beside the parent's track, drops at an x where every
  // track in the way is clear, runs along the gap beside the child's track,
  // and drops straight onto the child's top (or bottom) edge -- never behind
  // a clip, where the clip would read as the parent, and never along a road:
  // it used to come down beside the child and run in along the road's centre
  // line, which read as the sign before it being the parent.
  const channelY = (k: number) => {
    // k: the gap above track k (k = trackYs.length is below the last).
    if (k === 0) return trackYs[0] - CLIP_H / 2 - 6;
    if (k === trackYs.length) return trackYs[k - 1] + CLIP_H / 2 + 6;
    return (trackYs[k - 1] + CLIP_H / 2 + trackYs[k] - CLIP_H / 2) / 2;
  };
  const clear = (x: number, track: number) =>
    !clips.some(o => o.track === track && x > o.left - 4 && x < o.left + o.w + 4);
  interface Route { link: SessionLink; pts: { x: number; y: number; ch?: number }[] }
  const routes: Route[] = [];
  const drops: { x: number; y1: number; y2: number; parent: string }[] = [];
  const links: SessionLink[] = [];
  for (const c of clips) {
    const p = c.parentId ? clipById.get(c.parentId) : undefined;
    if (!p) continue;
    const ink = inkOf.get(c.familyId)!;
    if (nextOnTrack.get(p.id) === c.id) {
      links.push({ childId: c.id, parentId: p.id, kind: 'splice', d: `M ${p.left + p.w} ${p.y} H ${c.left}`, pts: [{ x: p.left + p.w, y: p.y }, { x: c.left, y: p.y }], ink, count: c.count });
      continue;
    }
    const down = c.track >= p.track;
    const ch1 = down ? p.track + 1 : p.track; // the gap beside the parent
    const ch2 = c.track > p.track ? c.track : c.track + 1; // the gap beside the child
    const xIn = c.left - DROP_IN;
    const sx = Math.max(p.left + 8, Math.min(p.left + p.w - 10, xIn));
    const sy = p.y + (down ? 1 : -1) * (CLIP_H / 2);
    const pts: Route['pts'] = [{ x: sx, y: sy }, { x: sx, y: 0, ch: ch1 }];
    if (ch1 !== ch2) {
      // Tracks strictly between the two gaps.
      const lo = Math.min(ch1, ch2), hi = Math.max(ch1, ch2);
      const between = Array.from({ length: hi - lo }, (_, i) => lo + i);
      const y1 = channelY(ch1), y2 = channelY(ch2);
      const free = (x: number) =>
        between.every(t => clear(x, t)) &&
        !drops.some(dr => dr.parent !== p.id && Math.abs(dr.x - x) < 3 &&
          Math.min(dr.y1, dr.y2) < Math.max(y1, y2) && Math.max(dr.y1, dr.y2) > Math.min(y1, y2));
      let dx = xIn;
      while (dx > timeStart && !free(dx)) dx -= 2;
      drops.push({ x: dx, y1, y2, parent: p.id });
      pts.push({ x: dx, y: 0, ch: ch1 }, { x: dx, y: 0, ch: ch2 });
    }
    // Onto the sign from the gap it arrives in: from above when that gap is
    // over the child's track, from below otherwise.
    const dir: 1 | -1 = ch2 === c.track ? 1 : -1;
    const entryX = c.left + Math.min(ENTRY_IN, c.w / 2);
    const jackY = c.y - dir * (CLIP_H / 2 + JACK_W);
    pts.push({ x: xIn, y: 0, ch: ch2 }, { x: entryX, y: 0, ch: ch2 }, { x: entryX, y: jackY });
    const link: SessionLink = { childId: c.id, parentId: p.id, kind: 'cable', d: '', pts: [], ink, count: c.count, jack: { x: entryX, y: jackY, dir } };
    links.push(link);
    routes.push({ link, pts });
  }
  // Cables sharing a gap at the same time run side by side, unless they
  // come from the same parent, when one run serving both is exactly right.
  const runs = new Map<number, { lo: number; hi: number; route: Route; parent: string }[]>();
  for (const r of routes) {
    for (let i = 0; i + 1 < r.pts.length; i++) {
      const a = r.pts[i], b = r.pts[i + 1];
      if (a.ch === undefined || a.ch !== b.ch) continue;
      if (!runs.has(a.ch)) runs.set(a.ch, []);
      runs.get(a.ch)!.push({ lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x), route: r, parent: r.link.parentId });
    }
  }
  const offsetOf = new Map<Route, Map<number, number>>();
  const OFFSETS = [0, RUN_STEP, -RUN_STEP];
  for (const [ch, list] of runs) {
    list.sort((a, b) => a.lo - b.lo);
    const laneEnd: { end: number; parent: string }[] = [];
    for (const run of list) {
      let k = laneEnd.findIndex(e => e.end + 6 < run.lo || e.parent === run.parent);
      if (k === -1 && laneEnd.length < OFFSETS.length) { k = laneEnd.length; laneEnd.push({ end: -Infinity, parent: run.parent }); }
      if (k === -1) k = laneEnd.length - 1;
      laneEnd[k] = { end: Math.max(laneEnd[k].end, run.hi), parent: run.parent };
      if (!offsetOf.has(run.route)) offsetOf.set(run.route, new Map());
      offsetOf.get(run.route)!.set(ch, OFFSETS[k]);
    }
  }
  // Every straight run of every cable, as a box the districts' names keep clear of.
  const cableRuns: Box[] = [];
  for (const r of routes) {
    const pts = r.pts.map(q => (q.ch === undefined ? q : { x: q.x, y: channelY(q.ch) + (offsetOf.get(r)?.get(q.ch) ?? 0) }));
    r.link.d = roundedPath(pts);
    r.link.pts = pts.map(q => ({ x: q.x, y: q.y }));
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      cableRuns.push({ x1: Math.min(a.x, b.x), x2: Math.max(a.x, b.x), y1: Math.min(a.y, b.y), y2: Math.max(a.y, b.y) });
    }
  }

  // The roads: walk each lane left to right, carrying a road on only while
  // each sign was spliced onto the one before it (its parent, right behind
  // it on the same lane).
  const splicedIn = new Set(links.filter(l => l.kind === 'splice').map(l => l.childId));
  const roads: SessionRoad[] = [];
  for (let t = 0; t < trackYs.length; t++) {
    let road: (SessionRoad & { last: string }) | null = null;
    for (const c of clips.filter(k => k.track === t).sort((a, b) => a.left - b.left)) {
      if (road && splicedIn.has(c.id) && c.parentId === road.last) {
        road.x2 = c.left + c.w + ROAD_LEAD;
        road.last = c.id;
        continue;
      }
      if (road) roads.push({ y: road.y, x1: road.x1, x2: road.x2, familyId: road.familyId });
      road = { y: trackYs[t], x1: c.left - ROAD_LEAD, x2: c.left + c.w + ROAD_LEAD, familyId: c.familyId, last: c.id };
    }
    if (road) roads.push({ y: road.y, x1: road.x1, x2: road.x2, familyId: road.familyId });
  }

  const width = timeEnd + PAD_RIGHT;
  const height = y + PAD_BOTTOM;
  const inTheWay: Box[] = [
    ...roads.map(r => ({ x1: r.x1, x2: r.x2, y1: r.y - CLIP_H / 2 - 3, y2: r.y + CLIP_H / 2 + 3 })),
    ...cableRuns,
  ];
  for (const f of families) f.district = placeDistrict(f, trackYs, inTheWay, timeStart, timeEnd, width, height);
  return {
    clips,
    families,
    links,
    trackYs,
    roads,
    years,
    decades,
    timeStart,
    timeEnd,
    width,
    height,
  };
}

/** How much of the sheet's bottom-right corner the pocket player can cover:
 *  the sheet sits flush left, and a browser window ~720px tall puts the
 *  player this far up it. Kept empty of genres and the key. */
export const PLAYER_CORNER = { w: 90, h: 220 };

// A district's name: the family's, in capitals in the sign face, as big as
// the emptiest stretch of its rows allows -- centred on any run of its rows,
// wherever no road or cable crosses it -- and kept out of the pocket
// player's corner. (A cable through a name read as a strikethrough.)
interface Box { x1: number; x2: number; y1: number; y2: number }
const DISTRICT_PAD = 12;
const DISTRICT_MIN_PX = 22;
const DISTRICT_MAX_PX = 96;
const DISTRICT_FILL = 0.66; // of the rows' height
export const DISTRICT_TRACKING = 0.04;

function placeDistrict(
  f: SessionFamily, trackYs: number[], inTheWay: Box[],
  timeStart: number, timeEnd: number, width: number, height: number,
): SessionFamily['district'] {
  const label = f.name.toUpperCase();
  const perPx = antonWidth(label, 1, DISTRICT_TRACKING);
  let best: SessionFamily['district'] = null;
  for (let i = 0; i < f.trackCount; i++) {
    for (let j = i; j < f.trackCount; j++) {
      const bandTop = trackYs[f.firstTrack + i] - TRACK_H / 2;
      const bandH = (j - i + 1) * TRACK_H;
      const mid = bandTop + bandH / 2;
      // The tallest the name could be here; whatever crosses that is in the way.
      const tall = Math.min(DISTRICT_MAX_PX, bandH * DISTRICT_FILL);
      const end = bandTop + bandH > height - PLAYER_CORNER.h ? Math.min(timeEnd, width - PLAYER_CORNER.w) : timeEnd;
      const across = inTheWay
        .filter(o => o.y2 > mid - tall / 2 - 2 && o.y1 < mid + tall / 2 + 2)
        .sort((a, b) => a.x1 - b.x1);
      const gaps: [number, number][] = [];
      let x = timeStart;
      for (const o of across) { if (o.x1 > x) gaps.push([x, o.x1]); x = Math.max(x, o.x2); }
      if (end > x) gaps.push([x, end]);
      for (const [a, b] of gaps) {
        const room = b - a - 2 * DISTRICT_PAD;
        const px = Math.floor(Math.min(tall, room / perPx));
        if (px < DISTRICT_MIN_PX || (best && px <= best.px)) continue;
        const w = perPx * px;
        best = { x: Math.round((a + b - w) / 2), y: Math.round(mid - px / 2), w: Math.ceil(w), px };
      }
    }
  }
  return best;
}

/** Where each lit year's label sits on the ticker. A road's years can fall
 *  within a few pixels of each other (Art rock 1967, Krautrock 1968,
 *  Industrial 1975 sit 12px apart) and printed over each other read as
 *  "11975", so crowded labels are spread just far enough apart, in order,
 *  each run of them centred on its years: the classic one-dimensional label
 *  layout, merging runs that collide until none do. */
export function spreadYears(years: { year: number; x: number }[], minX: number, maxX: number, gap = YEAR_LABEL_GAP): Map<number, number> {
  const sorted = years.slice().sort((a, b) => a.x - b.x);
  type Run = { ideal: number[]; years: number[]; start: number };
  const place = (r: Run) => {
    const n = r.ideal.length;
    const mid = r.ideal.reduce((a, b) => a + b, 0) / n;
    r.start = Math.max(minX, Math.min(maxX - (n - 1) * gap, mid - ((n - 1) * gap) / 2));
  };
  const runs: Run[] = [];
  for (const y of sorted) {
    runs.push({ ideal: [y.x], years: [y.year], start: y.x });
    place(runs[runs.length - 1]);
    while (runs.length > 1) {
      const a = runs[runs.length - 2], b = runs[runs.length - 1];
      if (a.start + (a.ideal.length - 1) * gap + gap <= b.start) break;
      runs.splice(-2, 2, { ideal: [...a.ideal, ...b.ideal], years: [...a.years, ...b.years], start: 0 });
      place(runs[runs.length - 1]);
    }
  }
  const at = new Map<number, number>();
  for (const r of runs) r.years.forEach((year, i) => at.set(year, r.start + i * gap));
  return at;
}

// The note a sign pins when it's pointed at.
export const NOTE_W = 240;
const NOTE_GAP = 8;

/** Where a sign's note goes: beside it, in the first of a few spots -- below,
 *  above, then to either side -- that covers none of the signs and lines lit
 *  with it, or failing that the spot that covers least. (It always went
 *  below, and hid Indie rock under Slowcore's note.) */
export function placeNote(
  session: GenreSession, clipId: string, lit: Set<string>, noteH: number,
): { left: number; top: number } {
  const clip = session.clips.find(c => c.id === clipId)!;
  const top0 = SKY_H + RULER_H;
  const maxLeft = session.width - NOTE_W - 8;
  const clampX = (x: number) => Math.max(HEAD_W, Math.min(maxLeft, x));
  const clampY = (y: number) => Math.max(top0, Math.min(session.height - noteH - 4, y));
  const cTop = clip.y - CLIP_H / 2, cBottom = clip.y + CLIP_H / 2;
  const below = cBottom + NOTE_GAP, above = cTop - NOTE_GAP - noteH;
  const spots: { left: number; top: number }[] = [];
  for (const top of [below, above]) {
    if (top < top0 || top + noteH > session.height - 4) continue;
    spots.push({ left: clampX(clip.left), top }, { left: clampX(clip.left + clip.w - NOTE_W), top });
  }
  const side = clampY(cTop);
  if (clip.left + clip.w + NOTE_GAP + NOTE_W <= session.width - 8) spots.push({ left: clip.left + clip.w + NOTE_GAP, top: side });
  if (clip.left - NOTE_GAP - NOTE_W >= HEAD_W) spots.push({ left: clip.left - NOTE_GAP - NOTE_W, top: side });
  if (spots.length === 0) spots.push({ left: clampX(clip.left), top: clampY(below) });

  const signs = session.clips.filter(c => lit.has(c.id));
  const lines = session.links.filter(l => lit.has(l.childId) && lit.has(l.parentId));
  const covered = ({ left, top }: { left: number; top: number }) => {
    const r = left + NOTE_W, b = top + noteH;
    let cost = 0;
    for (const c of signs) {
      const w = Math.min(r, c.left + c.w + 4) - Math.max(left, c.left - 4);
      const h = Math.min(b, c.y + CLIP_H / 2 + 4) - Math.max(top, c.y - CLIP_H / 2 - 4);
      if (w > 0 && h > 0) cost += w * h * (c.id === clipId ? 100 : 1);
    }
    for (const l of lines) {
      for (let i = 0; i + 1 < l.pts.length; i++) {
        const a = l.pts[i], z = l.pts[i + 1];
        const w = Math.min(r, Math.max(a.x, z.x)) - Math.max(left, Math.min(a.x, z.x));
        const h = Math.min(b, Math.max(a.y, z.y)) - Math.max(top, Math.min(a.y, z.y));
        if (w >= 0 && h >= 0 && w + h > 0) cost += (w + h) * 10;
      }
    }
    return cost;
  };
  let best = spots[0], bestCost = Infinity;
  for (const spot of spots) {
    const cost = covered(spot);
    if (cost === 0) return spot;
    if (cost < bestCost) { best = spot; bestCost = cost; }
  }
  return best;
}

/** An axis-aligned line through `pts`, its corners rounded like a cable bending. */
function roundedPath(pts: { x: number; y: number }[]): string {
  const clean = pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 0.5);
  let d = `M ${clean[0].x} ${clean[0].y}`;
  for (let i = 1; i < clean.length - 1; i++) {
    const a = clean[i - 1], b = clean[i], c = clean[i + 1];
    const r = Math.min(CORNER_R, Math.hypot(b.x - a.x, b.y - a.y) / 2, Math.hypot(c.x - b.x, c.y - b.y) / 2);
    const toward = (q: { x: number; y: number }) => {
      const len = Math.hypot(q.x - b.x, q.y - b.y) || 1;
      return { x: b.x + ((q.x - b.x) / len) * r, y: b.y + ((q.y - b.y) / len) * r };
    };
    const p1 = toward(a), p2 = toward(c);
    d += ` L ${p1.x} ${p1.y} Q ${b.x} ${b.y} ${p2.x} ${p2.y}`;
  }
  const last = clean[clean.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

/** The genre and its elders up to its family's founder, by main lines. */
export function lineageOf(id: string, clips: Map<string, SessionClip>): string[] {
  const out: string[] = [];
  let cur: string | null = id;
  while (cur && clips.has(cur)) {
    out.push(cur);
    cur = clips.get(cur)!.parentId;
  }
  return out;
}
