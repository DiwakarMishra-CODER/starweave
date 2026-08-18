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

// A scene with no yearEnd (currently just Windmill) hasn't closed — its bands
// are all still active. It still needs SOME definite number for axis and width
// math, so it gets a synthetic end: the CURRENT year, i.e. "still running as of
// now," which is the only end date that is actually true of an ongoing scene.
//
// This used to be a flat yearStart + 4, chosen to mirror Windmill's own first
// four years. That silently went stale — by 2026 it was drawing a decade-old
// scene as a four-year sliver pinned to the right edge, roughly a third the
// width it should have. Deriving from the current year is self-maintaining:
// the bar grows as the scene keeps running, without anyone remembering to
// bump a constant.
//
// The floor still applies so a scene that started this year (or, defensively,
// one with a future start) can't collapse to a zero-width bar. The renderer
// draws an open-ended scene with a fade rather than a hard stop specifically
// so this synthetic number is never read as a claimed end date.
const OPEN_ENDED_MIN_SPAN = 4;

function resolveOpenEndedYearEnd(yearStart: number): number {
  return Math.max(yearStart + OPEN_ENDED_MIN_SPAN, new Date().getFullYear());
}

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
// Rows are ordered by start year, member count descending as the tiebreak.
//
// This deliberately REVERSES an earlier decision, so don't re-revert it from
// the old note. Rows used to sort by member count, on the reasoning that
// start-year order puts every bar's left edge further right than the one
// above it, producing a diagonal "staircase" with empty triangles top-right
// and bottom-left, and that scattering early/late bars across rows keeps the
// composition from reading as a ramp.
//
// That held at 12 scenes inside a 44-year window, where the bars clustered
// horizontally anyway and the scatter was invisible. It stopped holding once
// the axis stretched to 59 years (1961–2020) with three scenes isolated in
// the sparse left third: with row position unrelated to bar position, reading
// down the rows gave 28.8% → 32.2% → … → 93.2% → 11.9% → …, and the earliest
// scene of all (Greenwich Village, left edge 0%) landed at row 12 with twelve
// rows of empty space above and left of it. Measured deviation between row
// order and chronological order was 3.57 rows mean, 12 max — reported
// directly as the page looking disjointed, with one bar "lonely in a corner."
//
// Sorted by year the staircase is back, and its empty triangles are simply
// the shape of the data: scenes genuinely start progressively later. What it
// buys is that the two isolated bars become the timeline's endpoints rather
// than outliers, and a reader can scan top-to-bottom and read chronology,
// which is the point of a timeline. The shared time axis (unaffected by row
// order either way) still shows every real overlap (SST/DC Hardcore,
// Bristol/Seattle, riot grrrl/Seattle).
export function resolveSceneTimelineScenes(graphData: GraphData): SceneTimelineScene[] {
  const artistById = new Map(graphData.artists.map(a => [a.id, a]));

  return graphData.scenes
    .slice()
    .sort((a, b) => a.yearStart - b.yearStart || b.memberIds.length - a.memberIds.length)
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
        yearEnd: s.yearEnd ?? resolveOpenEndedYearEnd(s.yearStart),
        isOpenEnded: s.yearEnd === undefined,
        color: SCENE_COLORS[s.id] ?? DEFAULT_SCENE_COLOR,
        row,
        members,
      };
    });
}

// ── Non-linear, density-weighted time axis ────────────────────────────────
// The axis allocates width by how many scenes occupy a stretch of years, not
// by elapsed time. A linear scale was fine while every scene sat inside one
// 44-year window, but the roster now runs 1961-2020 and is not remotely
// uniform: eleven of fourteen scenes live between 1976 and 2000, while
// 1965-68 and 2010-16 contain literally nothing. Linear, that gave the
// crowded quarter-century ~41% of the width and handed the rest to two
// near-empty margins.
//
// Same principle the /genres timeline already uses (see lib/genre-timeline.ts,
// where x is ordinal rank among dated genres rather than a year scale), but it
// cannot be borrowed directly: a genre is a point, a scene is an interval, so
// this needs a continuous monotonic year -> position mapping that both ends of
// a bar can be pushed through, not a rank lookup.
//
// Construction: cut the axis at every yearStart and yearEnd, count how many
// scenes overlap each resulting segment, and give the segment a share of the
// width proportional to `duration * (DENSITY_FLOOR + sceneCount)`. Positions
// interpolate linearly inside a segment, so the mapping is continuous and
// strictly increasing, and bar widths still mean something — a longer scene in
// the same neighbourhood is still a longer bar.
//
// DENSITY_FLOOR is what an empty year is worth relative to a year holding one
// scene. At 0.35 the two dead stretches collapse to under 2% of the width each
// (from 15% and 10% linear) without vanishing entirely, which keeps the gap
// legible as a gap. Raise it to flatten the effect, lower it to compress the
// empty margins harder.
const DENSITY_FLOOR = 0.35;

export interface AxisScale {
  axisStart: number;
  axisEnd: number;
  span: number;
  // Year -> percentage across the plot (0-100). Monotonic; clamps outside the
  // axis range. Every bar edge and every tick goes through this.
  yearToPct: (year: number) => number;
}

export function computeAxis(scenes: SceneTimelineScene[]): AxisScale {
  const axisStart = Math.min(...scenes.map(s => s.yearStart));
  const axisEnd = Math.max(...scenes.map(s => s.yearEnd));
  const span = axisEnd - axisStart;

  const cuts = Array.from(
    new Set([axisStart, axisEnd, ...scenes.flatMap(s => [s.yearStart, s.yearEnd])]),
  ).sort((a, b) => a - b);

  const segments = cuts.slice(0, -1).map((from, i) => {
    const to = cuts[i + 1];
    const overlapping = scenes.filter(s => s.yearStart < to && s.yearEnd > from).length;
    return { from, to, weight: (to - from) * (DENSITY_FLOOR + overlapping) };
  });

  const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);

  // Cumulative percentage at each cut point, so a lookup is one scan plus a
  // linear interpolation rather than a re-sum per call.
  const cumulative: number[] = [0];
  let running = 0;
  for (const seg of segments) {
    running += totalWeight > 0 ? (seg.weight / totalWeight) * 100 : 0;
    cumulative.push(running);
  }

  const yearToPct = (year: number): number => {
    if (year <= axisStart) return 0;
    if (year >= axisEnd) return 100;
    for (let i = 0; i < segments.length; i++) {
      const { from, to } = segments[i];
      if (year >= from && year <= to) {
        const t = to === from ? 0 : (year - from) / (to - from);
        return cumulative[i] + t * (cumulative[i + 1] - cumulative[i]);
      }
    }
    return 100;
  };

  return { axisStart, axisEnd, span, yearToPct };
}

// Minimum on-screen gap between two tick labels before the later one is
// dropped. Ticks stay on the same every-5-years grid, but a non-linear axis
// can squeeze two of them within a few pixels of each other inside a
// compressed stretch (1965 and 1970 sit ~19px apart at the current data), and
// two overlapping four-digit labels are worse than one missing one.
const MIN_TICK_GAP_PX = 34;

// Candidate ticks are still every 5 years plus both endpoints — deliberately
// NOT re-spaced to look even. Uneven tick spacing is the honest readout of a
// non-linear axis: it is what shows the compression rather than hiding it.
export function computeYearTicks(scale: AxisScale, plotWidthPx: number): number[] {
  const { axisStart, axisEnd, yearToPct } = scale;

  const candidates: number[] = [];
  for (let y = Math.ceil(axisStart / 5) * 5; y <= axisEnd; y += 5) candidates.push(y);
  if (!candidates.includes(axisStart)) candidates.unshift(axisStart);
  if (!candidates.includes(axisEnd)) candidates.push(axisEnd);
  const sorted = Array.from(new Set(candidates)).sort((a, b) => a - b);

  if (plotWidthPx <= 0) return sorted;

  // Both endpoints always survive; interior ticks yield to whichever tick was
  // last kept. The end is reserved before the sweep so a tick crowding it is
  // dropped rather than the endpoint itself.
  const kept: number[] = [];
  let lastPx = -Infinity;
  for (const year of sorted) {
    const px = (yearToPct(year) / 100) * plotWidthPx;
    const isEndpoint = year === axisStart || year === axisEnd;
    const endPx = plotWidthPx;
    if (isEndpoint) { kept.push(year); lastPx = px; continue; }
    if (px - lastPx < MIN_TICK_GAP_PX) continue;
    if (endPx - px < MIN_TICK_GAP_PX) continue;
    kept.push(year);
    lastPx = px;
  }
  return kept;
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
// A MIN_BAR_HEIGHT_FLOOR used to clamp k UPWARD on short windows/many rows,
// on the assumption that the resulting overflow was harmless because
// ".scenes-overlay scrolls in that case, which is fine." In practice the
// last one or two rows (whichever scenes sort last — currently Elephant 6
// and Glasgow, the smallest) rendered past the bottom of the plot with no
// way to reach them, reported directly ("going out of the page... there is
// no below"). Since k IS the exact-fit scale factor by construction (see
// the comment above), ANY k above it produces MORE total content height
// than is actually available — there's no floor value that both avoids
// comically tiny bars AND guarantees a fit; the two are mutually exclusive
// once a row count needs more room than the window actually has. Given the
// choice, always fitting inside the given height (accepting smaller bars on
// a short window) is what's actually asked for, so k is never allowed to
// exceed the exact-fit value at all.

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
  const k = denom > 0 ? usable / denom : 0;

  // Math.floor, not Math.round, on every individual bar height — rounding
  // even one bar UP is enough to push the fit guarantee above `usable`
  // again (rounding 12 bars up by up to 0.5px each can compound to several
  // px), and there's no equivalent risk from always rounding down.
  const barHeights = ratios.map(r => Math.floor(r * k));
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
  widthPct: number;
  widthPx: number;
  barHeight: number;
  // Per-bar face metrics. Capped at the global values from
  // computeVerticalSizing and shrunk only for a bar too narrow to seat its
  // members at full size — see the comment on computeBarGeometry.
  faceSize: number;
  faceStep: number;
  labelText: string;
  labelWidthPx: number;
}

// Ratios that computeVerticalSizing uses to derive faceStep/facePad from
// faceSize, repeated here so a per-bar face size can be re-derived
// consistently rather than scaling three numbers independently.
const FACE_STEP_RATIO = 0.62;
// Mirrors `.scenes-timeline__faces { left: 14px }` in globals.css — the faces
// strip is inset from the bar's left edge by a fixed amount, so that inset is
// unavailable to the faces themselves and has to come off the usable width
// here. computeVerticalSizing's facePad is NOT this number and is not used by
// the renderer at all; the CSS owns the inset.
const FACES_LEFT_INSET_PX = 14;
// Below this a face stops reading as a face at all. A bar too narrow to seat
// its members even at this size lets them overflow its right edge slightly,
// which is a cosmetic blemish; widening the bar instead would misstate the
// scene's end year, which is not.
const MIN_BAR_FACE_SIZE = 11;

// A bar's width is ALWAYS its true span on the axis. It used to be allowed to
// grow past its real end year when its members' faces would not otherwise fit
// (CBGB, three years and four members, was the case this existed for), with a
// dashed tick drawn at the true end to admit the distortion. That traded a
// correct chart for a footnote explaining an incorrect one, and the dashed
// mark read as a rendering glitch.
//
// Instead the faces shrink to fit the bar they sit in: per-bar face size,
// capped at the global size so nothing is ever drawn larger than the shared
// rhythm, floored so it stays legible. Under the density-weighted axis only
// the two narrowest bars need this at all, and both land within a couple of
// pixels of the global size.
export function computeBarGeometry(
  scene: SceneTimelineScene,
  scale: AxisScale,
  plotWidthPx: number,
  barHeight: number,
  faceSize: number,
  faceStep: number,
): SceneBarGeometry {
  const leftPct = scale.yearToPct(scene.yearStart);
  const widthPct = Math.max(0, scale.yearToPct(scene.yearEnd) - leftPct);
  const widthPx = (widthPct / 100) * plotWidthPx;

  // n faces at size f occupy f * (1 + (n-1)*STEP), inside a strip already
  // inset from the bar's left edge; invert that for the largest f this bar
  // can actually seat.
  const faceCount = Math.max(1, scene.members.length);
  const usableWidthPx = Math.max(0, widthPx - FACES_LEFT_INSET_PX);
  const widthPerUnit = 1 + (faceCount - 1) * FACE_STEP_RATIO;
  const fittedSize = Math.floor(usableWidthPx / widthPerUnit);

  let barFaceSize = Math.max(MIN_BAR_FACE_SIZE, Math.min(faceSize, fittedSize));
  // Keep the shared step whenever the bar seats faces at full size, so the
  // common case stays pixel-identical to the global rhythm.
  let barFaceStep = barFaceSize === faceSize ? faceStep : Math.round(barFaceSize * FACE_STEP_RATIO);

  // The step above is rounded, and rounding up can put the row back over the
  // width `fittedSize` was just solved for — a one-pixel overflow on exactly
  // the bars this logic exists to protect. Step down until it genuinely fits
  // at the integer sizes actually rendered, or until the floor is reached.
  while (
    barFaceSize > MIN_BAR_FACE_SIZE
    && barFaceSize + (faceCount - 1) * barFaceStep > usableWidthPx
  ) {
    barFaceSize -= 1;
    barFaceStep = Math.round(barFaceSize * FACE_STEP_RATIO);
  }

  const labelText = sceneLabelText(scene);
  const labelWidthPx = labelText.length * LABEL_GLYPH_W;

  return {
    leftPct,
    widthPct,
    widthPx,
    barHeight,
    faceSize: barFaceSize,
    faceStep: barFaceStep,
    labelText,
    labelWidthPx,
  };
}
