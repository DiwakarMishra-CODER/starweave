import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { buildPortrait, familyRunningOrder, introLine, standInLines, standInRow } from '@/lib/family-portrait';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const influences = (id: string) => data.edges.filter(e => e.type === 'influence' && e.source === id);
const shaped = (id: string) => data.edges.filter(e => e.type === 'influence' && e.target === id);

describe('buildPortrait', () => {
  it('puts every influence in the back row once, each a real edge', () => {
    const { back } = buildPortrait(data, 'radiohead');
    const ids = back.flat().map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(influences('radiohead').map(e => e.target).sort());
  });

  it('shows the strongest dozen in front and names the rest in the caption', () => {
    const p = buildPortrait(data, 'velvet-underground');
    expect(p.front.flat()).toHaveLength(12);
    expect(p.front.flat().length + p.frontMore.length).toBe(shaped('velvet-underground').length);
    const rank = { said: 0, reported: 1, other: 2 } as const;
    const worstInPhoto = Math.max(...p.front.flat().map(m => rank[m.proof]));
    for (const m of p.frontMore) expect(rank[m.proof]).toBeGreaterThanOrEqual(worstInPhoto);
  });

  it('stands the strongest in the middle of the row', () => {
    expect(standInRow([1, 2, 3, 4, 5])).toEqual([4, 2, 1, 3, 5]);
    expect(standInRow([1, 2])).toEqual([2, 1]);
    expect(standInRow([])).toEqual([]);
  });

  it('splits a big row into balanced lines, the strongest line first', () => {
    expect(standInLines([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 8)).toEqual([[4, 2, 1, 3, 5], [9, 7, 6, 8, 10]]);
    expect(standInLines([1, 2, 3], 8)).toEqual([[2, 1, 3]]);
    expect(standInLines([], 8)).toEqual([]);
  });

  it('keeps denials out of the photo', () => {
    const withDenial = data.rejectedEdges[0];
    const p = buildPortrait(data, withDenial.source);
    expect(p.deniedBack.map(d => d.id)).toContain(withDenial.target);
    expect(p.back.flat().map(m => m.id)).not.toContain(withDenial.target);
  });

  it('copes with an empty row', () => {
    const loner = data.artists.find(a => shaped(a.id).length === 0)!;
    const p = buildPortrait(data, loner.id);
    expect(p.front).toEqual([]);
    expect(p.frontMore).toEqual([]);
  });
});

describe('familyRunningOrder', () => {
  it('plays the back row oldest first, then the artist, then the front row', () => {
    const y = (activeFrom: number) => ({ id: String(activeFrom), activeFrom });
    const order = familyRunningOrder([y(1980), y(1965)], y(1990), [y(2010), y(2001)]);
    expect(order.map(m => m.activeFrom)).toEqual([1965, 1980, 1990, 2001, 2010]);
  });

  it('plays two artists who shaped each other once, with who shaped them', () => {
    // No two artists on the map shape each other since the source pass (the
    // Mogwai / Cure pair was one way only), so a made-up family: `both`
    // stands in both rows.
    const y = (id: string, activeFrom: number) => ({ id, activeFrom });
    const both = y('both', 1980);
    const ids = familyRunningOrder([both, y('old', 1970)], y('me', 1990), [both, y('young', 2000)]).map(m => m.id);
    expect(ids).toEqual(['old', 'both', 'me', 'young']);
  });
});

describe('introLine', () => {
  it("doesn't stop at a name's own full stop or exclamation mark", () => {
    expect(introLine('Neu! formed in Düsseldorf in 1971 when two friends left. More.')).toBe(
      'Neu! formed in Düsseldorf in 1971 when two friends left.',
    );
  });

  it('cuts a long sentence at its first clause break', () => {
    const long = `Robert Smith has been doing one of the more peculiar things in pop: ${'x'.repeat(220)}.`;
    expect(introLine(long)).toBe('Robert Smith has been doing one of the more peculiar things in pop…');
  });
});
