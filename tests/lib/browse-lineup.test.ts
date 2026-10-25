import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { PAPER, TIERS, arrange, billFor, buildLineup, tierOf } from '@/lib/browse-lineup';
import { contrastRatio } from '@/lib/colors';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const lineup = buildLineup(data);
const { artists } = lineup;

describe('the browse lineup', () => {
  it('bills every artist exactly once, in the tier its count belongs to', () => {
    const poster = arrange(artists, 'poster');
    const seen = poster.flatMap(s => s.items);
    expect(seen.length).toBe(artists.length);
    expect(new Set(seen).size).toBe(artists.length);
    poster.forEach((s, k) => {
      const t = TIERS[k];
      for (const i of s.items) {
        expect(artists[i].named).toBeGreaterThanOrEqual(t.min);
        if (k > 0) expect(artists[i].named).toBeLessThan(TIERS[k - 1].min);
        expect(tierOf(artists[i].named)).toBe(t);
      }
    });
    // Headliners are billed biggest, and sizes only go down the bill.
    for (let k = 1; k < TIERS.length; k++) expect(TIERS[k].size).toBeLessThan(TIERS[k - 1].size);
  });

  it('takes who shaped whom straight from the influence links, both ways round', () => {
    const index = new Map(artists.map((a, i) => [a.id, i]));
    for (const e of data.edges.filter(e => e.type === 'influence')) {
      const s = index.get(e.source)!, t = index.get(e.target)!;
      expect(artists[t].shaped).toContain(s);
      expect(artists[s].shapedBy).toContain(t);
    }
    artists.forEach((a, i) => {
      expect(a.named).toBe(a.shaped.length);
      for (const j of a.shaped) expect(artists[j].shapedBy).toContain(i);
    });
  });

  it('keeps everyone in the A-Z and by-year arrangements', () => {
    for (const how of ['az', 'year'] as const) {
      const items = arrange(artists, how).flatMap(s => s.items);
      expect(new Set(items).size).toBe(artists.length);
    }
    const smiths = artists.findIndex(a => a.id === 'the-smiths');
    expect(arrange(artists, 'az').find(s => s.items.includes(smiths))?.heading).toBe('S');
  });

  it('writes every name in an ink that reads on the paper', () => {
    for (const a of artists) expect(contrastRatio(a.ink, PAPER)).toBeGreaterThanOrEqual(4.5);
  });

  it("puts an artist's family around them in their own bill, and everyone else below, once each", () => {
    for (const id of ['velvet-underground', 'neil-young', 'black-midi']) {
      const i = artists.findIndex(a => a.id === id);
      const bill = billFor(artists, i);
      const all = bill.flatMap(s => s.items);
      expect(all.length).toBe(artists.length);
      expect(new Set(all).size).toBe(artists.length);
      expect(bill.find(s => s.kind === 'star')!.items).toEqual([i]);
      for (const j of bill.find(s => s.kind === 'by')!.items) expect(artists[i].shapedBy).toContain(j);
      for (const j of bill.find(s => s.kind === 'shaped')!.items) expect(artists[i].shaped).toContain(j);
    }
  });
});
