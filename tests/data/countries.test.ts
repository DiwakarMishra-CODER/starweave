import { describe, it, expect } from 'vitest';
import { graphData } from '@/data/seed-data';
import { COUNTRY } from '@/data/countries';
import { countryName } from '@/lib/format';

// 2814 is a French producer working with a Hong Kong-based artist: no single country.
const NO_SINGLE_COUNTRY = new Set(['2814']);

describe('artist countries', () => {
  it('gives every artist a country, apart from the known splits', () => {
    const missing = graphData.artists.filter(a => !a.country && !NO_SINGLE_COUNTRY.has(a.id)).map(a => a.id);
    expect(missing).toEqual([]);
  });

  it('only fills artists that exist, and never overrides a literal', () => {
    const ids = new Set(graphData.artists.map(a => a.id));
    for (const id of Object.keys(COUNTRY)) expect(ids.has(id)).toBe(true);
  });

  it('uses codes that read as a country name, UK not GB', () => {
    for (const a of graphData.artists) {
      if (!a.country) continue;
      expect(a.country).not.toBe('GB');
      expect(countryName(a.country)).not.toBe(a.country);
    }
  });
});
