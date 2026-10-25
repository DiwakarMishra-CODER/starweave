import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import {
  FRAME_GAP, LABEL_H, LEADER, LIGHT, SHEET_W,
  buildLightbox, edgePrint, markerWidth, packRows, resolveScenes, yearToX,
} from '@/lib/scenes-lightbox';
import { contrastRatio } from '@/lib/colors';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const scenes = resolveScenes(data, 2026);
const sheet = buildLightbox(scenes);

const overlaps = (a: { left: number; width: number }, b: { left: number; width: number }) =>
  a.left < b.left + b.width && b.left < a.left + a.width;

describe('scenes lightbox', () => {
  it('fits a laptop window: the sheet is 1400 wide and short enough for ~760px tall', () => {
    expect(sheet.width).toBe(SHEET_W);
    expect(sheet.height).toBeLessThanOrEqual(700);
    for (const s of sheet.strips) {
      expect(s.left).toBeGreaterThanOrEqual(0);
      expect(s.left + s.width).toBeLessThanOrEqual(SHEET_W);
    }
  });

  it('packs strips that share a row so they never overlap or touch in time', () => {
    for (const a of sheet.strips) {
      for (const b of sheet.strips) {
        if (a === b || a.row !== b.row) continue;
        expect(overlaps(a, b)).toBe(false);
        expect(a.yearEnd < b.yearStart || b.yearEnd < a.yearStart).toBe(true);
      }
    }
    expect(sheet.rows).toBe(Math.max(...packRows(scenes)) + 1);
  });

  it('starts each strip on its first year and ends its line on its last', () => {
    for (const s of sheet.strips) {
      expect(Math.abs(s.left - yearToX(sheet.axis, s.yearStart))).toBeLessThanOrEqual(0.5);
      if (s.isOpenEnded) expect(s.spanEnd).toBe(SHEET_W);
      else expect(Math.abs(s.spanEnd - yearToX(sheet.axis, s.yearEnd))).toBeLessThanOrEqual(0.5);
      // The film, cut after its last band, never runs past the scene's years.
      expect(s.left + s.width).toBeLessThanOrEqual(s.spanEnd + 1);
    }
  });

  it('keeps time running forwards', () => {
    const { years, pos } = sheet.axis;
    for (let k = 1; k < years.length; k++) {
      expect(years[k]).toBeGreaterThan(years[k - 1]);
      expect(pos[k]).toBeGreaterThan(pos[k - 1]);
    }
  });

  it('has room on every strip for every band, and frames big enough to see a face', () => {
    expect(sheet.frameW).toBeGreaterThanOrEqual(32);
    for (const s of sheet.strips) {
      const film = 2 * LEADER + s.members.length * sheet.frameW + (s.members.length - 1) * FRAME_GAP;
      expect(film).toBeLessThanOrEqual(s.width);
      // Cut after the last band: no more than a few pixels of bare film.
      expect(s.width - film).toBeLessThan(sheet.frameW);
      expect(edgePrint(s).length * 0.6 * 8 + 2 * LEADER).toBeLessThanOrEqual(s.width + 0.5);
    }
  });

  it('never lets a name run into the next strip’s name in its row, or off the sheet', () => {
    const byRow = new Map<number, typeof sheet.strips>();
    for (const s of sheet.strips) byRow.set(s.row, [...(byRow.get(s.row) ?? []), s]);
    for (const row of byRow.values()) {
      row.sort((a, b) => a.left - b.left);
      row.forEach((s, i) => {
        const end = s.left + markerWidth(s.name);
        const next = row[i + 1];
        if (next) expect(end).toBeLessThan(next.left);
        else expect(end).toBeLessThanOrEqual(SHEET_W);
      });
    }
  });

  it('writes every name in an ink that reads on the lit panel, and sits it above its strip', () => {
    for (const s of sheet.strips) {
      expect(contrastRatio(s.ink, LIGHT)).toBeGreaterThanOrEqual(4.5);
      expect(s.top - LABEL_H).toBeGreaterThanOrEqual(0);
    }
  });

  it('runs an ongoing scene to now', () => {
    const open = sheet.strips.filter(s => s.isOpenEnded);
    for (const s of open) expect(s.yearEnd).toBe(2026);
    expect(sheet.axisEnd).toBe(Math.max(...scenes.map(s => s.yearEnd)));
  });
});
