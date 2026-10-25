import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import {
  HERO_FILM_MAX, HERO_FRAME_MAX,
  heroFrame, resolveScenePage, summariseLinks, type RoomLink,
} from '@/lib/scene-page';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const pages = data.scenes.map(s => resolveScenePage(data, s.id, 2026)!);

describe('scene page', () => {
  it('resolves every scene, with a role for every band', () => {
    expect(pages.every(Boolean)).toBe(true);
    for (const p of pages) {
      expect(p.bands.length).toBeGreaterThanOrEqual(2);
      for (const b of p.bands) {
        expect(b.role.length).toBeGreaterThan(40);
        expect(b.record?.imageUrl).toBeTruthy(); // every band's record can slide out
      }
      expect(p.bands.filter(b => b.starred).length).toBeLessThanOrEqual(1);
    }
    expect(resolveScenePage(data, 'no-such-scene')).toBeNull();
  });

  it('sizes the frames from the band count so every strip fits the film', () => {
    for (const p of pages) {
      expect(p.frameW).toBeLessThanOrEqual(HERO_FRAME_MAX);
      expect(p.frameW).toBeGreaterThanOrEqual(150); // seven bands still read as faces
      expect(p.filmW).toBeLessThanOrEqual(HERO_FILM_MAX);
    }
    expect(heroFrame(2).frameW).toBe(HERO_FRAME_MAX);
  });

  it('steps to the scenes before and after in the lightbox order', () => {
    const order = pages.slice().sort((a, b) => a.scene.yearStart - b.scene.yearStart || b.bands.length - a.bands.length);
    order.forEach((p, i) => {
      expect(p.prev?.id ?? null).toBe(order[i - 1]?.scene.id ?? null);
      expect(p.next?.id ?? null).toBe(order[i + 1]?.scene.id ?? null);
    });
  });

  it('links every room to at least one other, each link between two different scenes', () => {
    for (const p of pages) {
      expect(p.links.length).toBeGreaterThan(0);
      for (const l of p.links) {
        expect(l.scene).not.toBe(p.scene.id);
        expect(p.bands.some(b => b.id === l.here)).toBe(true);
      }
    }
  });

  it('keeps each face to one shared-transition name: no band is in two scenes', () => {
    const seen = new Set<string>();
    for (const p of pages) for (const b of p.bands) {
      expect(seen.has(b.id)).toBe(false);
      seen.add(b.id);
    }
  });

  it('leaves the bands themselves out of their circle', () => {
    for (const p of pages) {
      const ids = new Set(p.bands.map(b => b.id));
      for (const f of [...p.learnedFrom, ...p.passedTo]) {
        expect(ids.has(f.id)).toBe(false);
        expect(f.via.length).toBeGreaterThan(0);
      }
    }
  });

  it('says plainly when a row of the circle is empty', () => {
    const windmill = pages.find(p => p.scene.id === 'windmill')!;
    expect(windmill.passedTo).toHaveLength(0);
    expect(windmill.passedToEmpty).toMatch(/^Too soon to tell/);
    const village = pages.find(p => p.scene.id === 'greenwich-village')!;
    expect(village.learnedFrom).toHaveLength(0);
    expect(village.passedToEmpty).not.toMatch(/Too soon/);
  });

  it('counts the links in plain words', () => {
    const l = (here: string, there: string, scene: string, out: boolean): RoomLink =>
      ({ here, hereName: here, there, thereName: there, scene, sceneName: scene, out });
    expect(summariseLinks([l('a', 'x', 's1', true), l('b', 'x', 's1', true), l('a', 'y', 's2', true), l('a', 'z', 's3', false)]))
      .toBe('The bands here shaped 2 bands in 2 other scenes; 1 band from 1 other scene shaped them.');
    expect(summariseLinks([l('a', 'z', 's3', false)]))
      .toBe('No band in another scene names the bands here; 1 band from 1 other scene shaped them.');
    expect(summariseLinks([l('a', 'x', 's1', true)]))
      .toBe('The bands here shaped 1 band in 1 other scene; none of them names a band from another scene.');
  });
});
