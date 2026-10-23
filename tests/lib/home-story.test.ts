import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import {
  dayNumber, isSunday, pickPool, pickRecordId, pullQuote, recordCard, whyFor, SUNDAY_RECORD,
} from '@/lib/home-story';

// The enriched build output, not seed-data: the pick depends on covers and
// previews, which only exist after build:data.
const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;

describe("today's record", () => {
  it('is The Sundays on a Sunday', () => {
    const sunday = new Date(Date.UTC(2026, 9, 25, 12)); // Sun 25 Oct 2026
    expect(isSunday(sunday, 'utc')).toBe(true);
    expect(pickRecordId(data, dayNumber(sunday, 'utc'), true)).toBe(SUNDAY_RECORD);
  });

  it('is the same pick for the same day, with a song and a why line', () => {
    for (let day = 20_000; day < 20_030; day++) {
      const id = pickRecordId(data, day, false);
      expect(pickRecordId(data, day, false)).toBe(id);
      const card = recordCard(data, id)!;
      expect(card.previewUrl).toBeTruthy();
      expect(card.why).not.toBeNull();
    }
  });

  it('draws from artists who matter, the Velvet Underground and Radiohead among them', () => {
    const pool = pickPool(data);
    expect(pool).toContain('velvet-underground');
    expect(pool).toContain('radiohead');
    expect(pool.length).toBeGreaterThan(50);
  });
});

describe('whyFor', () => {
  it("gives the Velvet Underground Brian Eno's line about them", () => {
    const why = whyFor(data, 'velvet-underground')!;
    expect(why.direction).toBe('child');
    expect(why.other.id).toBe('brian-eno');
    expect(why.quote).toContain('30,000 copies');
  });

  it('only ever quotes, word for word, a first-person citation on that influence', () => {
    for (const id of pickPool(data)) {
      const why = whyFor(data, id)!;
      const edge = data.edges.find(e => why.direction === 'parent'
        ? e.source === id && e.target === why.other.id
        : e.source === why.other.id && e.target === id)!;
      expect(edge.sourceTier).toBe('first-person');
      expect(edge.citation).toContain(why.quote);
    }
  });
});

describe('pullQuote', () => {
  it('takes the first quoted sentence, verbatim, and skips titles', () => {
    const c = 'Byrne on Desert Island Discs: picks "I Wanna Be Your Dog," saying the band came "from somewhere you didn\'t know existed."';
    expect(pullQuote(c)).toBe("from somewhere you didn't know existed.");
  });

  it('never returns words that are not in the citation', () => {
    for (const e of data.edges) {
      const q = pullQuote(e.citation);
      if (q) expect(e.citation).toContain(q);
    }
  });

  it('is null when nobody is quoted', () => {
    expect(pullQuote('AllMusic biography names them as an influence.')).toBeNull();
  });
});
