import type { GraphData } from '@/data/types';
import { SCENE_COLORS, DEFAULT_SCENE_COLOR } from '@/lib/colors';

export interface SceneTimelineMember {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface SceneTimelineScene {
  id: string;
  name: string;
  city: string;
  era: string;
  yearStart: number;
  yearEnd: number; // always a definite number here — an open-ended scene's
  // real (undefined) yearEnd is resolved to a synthetic one below, purely so
  // axis/width math keeps working. isOpenEnded is what the renderer actually
  // checks to decide whether to draw a hard stop or a fade.
  isOpenEnded: boolean;
  color: string;
  row: number;
  members: SceneTimelineMember[];
}

// A scene with no yearEnd (currently just Windmill) hasn't closed — its
// bands are all still active. It still needs SOME width for axis/layout
// math, so it gets a synthetic span rather than a real end date: matches
// the scene's own original 4-year run (2016-2020) for visual continuity,
// not an attempt to guess how long it'll actually last. The renderer draws
// this with a fade instead of a hard stop specifically so nobody reads the
// synthetic number as a claimed end date.
const OPEN_ENDED_MIN_SPAN = 4;

// One row per scene, ordered by member count descending (not by start year).
// Packed rows (an earlier attempt shared a row between non-overlapping
// scenes to save vertical space) turned out to break hover: two scenes in
// the same row means two full-width row <div>s stacked at the identical
// top/height, and the later one in DOM order silently intercepts pointer
// events across its ENTIRE width — including wherever the other scene's bar
// sits — even though it has no visible content there. One row per scene,
// guaranteed no two rows ever share a vertical position, is what actually
// fixes that.
//
// Ordering by member count (rather than start year) still matters
// independent of that fix: start-year order put every bar's left edge
// further right than the one above it, producing a diagonal "staircase"
// with large empty triangles top-right and bottom-left. Sorting by count
// scatters early/late bars across rows instead, so the composition doesn't
// read as a ramp — the shared time axis (unaffected by row order) is still
// what shows every real overlap (SST/Dischord, 4AD/Creation, riot
// grrrl/Seattle).
export function resolveSceneTimelineScenes(graphData: GraphData): SceneTimelineScene[] {
  const artistById = new Map(graphData.artists.map(a => [a.id, a]));

  return graphData.scenes
    .slice()
    .sort((a, b) => b.memberIds.length - a.memberIds.length || a.yearStart - b.yearStart)
    .map((s, row) => {
      const members = s.memberIds
        .map(id => artistById.get(id))
        .filter((a): a is NonNullable<typeof a> => !!a)
        .map(a => ({ id: a.id, name: a.name, imageUrl: a.imageUrl ?? null }));

      return {
        id: s.id,
        name: s.name,
        city: s.city,
        era: s.era,
        yearStart: s.yearStart,
        yearEnd: s.yearEnd ?? s.yearStart + OPEN_ENDED_MIN_SPAN,
        isOpenEnded: s.yearEnd === undefined,
        color: SCENE_COLORS[s.id] ?? DEFAULT_SCENE_COLOR,
        row,
        members,
      };
    });
}

export function computeAxis(scenes: SceneTimelineScene[]) {
  const axisStart = Math.min(...scenes.map(s => s.yearStart));
  const axisEnd = Math.max(...scenes.map(s => s.yearEnd));
  return { axisStart, axisEnd, span: axisEnd - axisStart };
}

export function computeYearTicks(axisStart: number, axisEnd: number): number[] {
  const ticks: number[] = [];
  for (let y = Math.ceil(axisStart / 5) * 5; y <= axisEnd; y += 5) ticks.push(y);
  if (!ticks.includes(axisStart)) ticks.unshift(axisStart);
  if (!ticks.includes(axisEnd)) ticks.push(axisEnd);
  return Array.from(new Set(ticks)).sort((a, b) => a - b);
}

// ── Vertical sizing — scales to fill whatever height the browser actually
// gives the plot, rather than a fixed compact size. ────────────────────────
// The plot's height comes from CSS flex (.scenes-timeline__plot is flex:1
// inside a column that fills the viewport — see globals.css), so a short
// window and a tall one both hand back a real, different measured height;
// this fills it exactly instead of stopping at a fixed pixel target and
// leaving empty background below on anything taller than that target.
// Bar heights, the row gap, and face size/step/pad are all expressed as
// ratios of one scale factor `k`, solved so AXIS_HEADER_HEIGHT + every bar
// + every gap between them sums to exactly the available height.
const MIN_BAR_RATIO = 1;
const MAX_BAR_RATIO = 1.55;
const GAP_RATIO = 0.45;
export const AXIS_HEADER_HEIGHT = 24;
const MIN_BAR_HEIGHT_FLOOR = 20; // guards against comically tiny bars if the window is very short — the page scrolls in that case instead, which is fine

export interface VerticalSizing {
  barHeights: number[]; // parallel to the scenes array passed in
  rowGap: number;
  faceSize: number;
  faceStep: number;
  facePad: number;
}

export function computeVerticalSizing(scenes: SceneTimelineScene[], availableHeight: number): VerticalSizing {
  const counts = scenes.map(s => s.members.length);
  const minMembers = Math.min(...counts);
  const maxMembers = Math.max(...counts);

  const ratios = scenes.map(s => {
    const t = maxMembers === minMembers ? 1 : (s.members.length - minMembers) / (maxMembers - minMembers);
    return MIN_BAR_RATIO + t * (MAX_BAR_RATIO - MIN_BAR_RATIO);
  });
  const baseSum = ratios.reduce((a, b) => a + b, 0);
  const baseGapUnits = Math.max(0, scenes.length - 1) * GAP_RATIO;
  const denom = baseSum + baseGapUnits;

  const usable = Math.max(0, availableHeight - AXIS_HEADER_HEIGHT);
  const rawK = denom > 0 ? usable / denom : 0;
  const k = Math.max(rawK, MIN_BAR_HEIGHT_FLOOR / MIN_BAR_RATIO);

  const barHeights = ratios.map(r => Math.round(r * k));
  const rowGap = k * GAP_RATIO;
  // Face size follows the SHORTEST bar (every bar must be able to fit its
  // own faces regardless of member count), then step/pad follow face size.
  const faceSize = Math.max(12, Math.round(k * MIN_BAR_RATIO * 0.72));
  const faceStep = Math.round(faceSize * 0.62);
  const facePad = Math.round(faceSize * 0.42);

  return { barHeights, rowGap, faceSize, faceStep, facePad };
}

// Labels always render outside the bar (never competing with faces for
// space inside it), immediately to its right, unless that would run past
// the plot's own edge — see the flip check in ScenesTimeline.tsx. This is a
// flat estimate used only for that decision and to size the label's box.
// Heuristic average px/character (same kind of estimate as /genres'
// AVG_GLYPH_W — not measured against real font metrics).
export const LABEL_GLYPH_W = 6.4;
export const LABEL_GAP = 8;

// `Name · City`, or just the city when the scene is named for it (Manchester,
// Bristol, Seattle, Glasgow) — the redundant repeat was cut, and so was the
// era: the axis and the bar's own position/length already encode it, and the
// hover tooltip is where the exact years belong now.
export function sceneLabelText(scene: Pick<SceneTimelineScene, 'name' | 'city'>): string {
  const cityIsName = scene.name.trim().toLowerCase() === scene.city.trim().toLowerCase();
  return cityIsName ? scene.city : `${scene.name} · ${scene.city}`;
}

export interface SceneBarGeometry {
  leftPct: number;
  trueWidthPct: number;
  widthPx: number;
  widthIsPx: boolean; // true when the true-duration width lost out to the face-driven minimum
  barHeight: number;
  labelText: string;
  labelWidthPx: number;
}

export function computeBarGeometry(
  scene: SceneTimelineScene,
  axisStart: number,
  span: number,
  plotWidthPx: number,
  barHeight: number,
  faceSize: number,
  faceStep: number,
  facePad: number,
): SceneBarGeometry {
  const leftPct = ((scene.yearStart - axisStart) / span) * 100;
  const trueWidthPct = ((scene.yearEnd - scene.yearStart) / span) * 100;
  const trueWidthPx = (trueWidthPct / 100) * plotWidthPx;

  const facesWidthPx = facePad * 2 + faceSize + Math.max(0, scene.members.length - 1) * faceStep;

  const widthIsPx = facesWidthPx > trueWidthPx;
  const widthPx = widthIsPx ? facesWidthPx : trueWidthPx;

  const labelText = sceneLabelText(scene);
  const labelWidthPx = labelText.length * LABEL_GLYPH_W;

  return {
    leftPct,
    trueWidthPct,
    widthPx,
    widthIsPx,
    barHeight,
    labelText,
    labelWidthPx,
  };
}
