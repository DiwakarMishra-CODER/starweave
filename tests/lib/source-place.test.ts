import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { sourcePlace } from '@/lib/source-place';
import type { EdgeSources } from '@/lib/edge-sources';

describe('sourcePlace', () => {
  it('names a publication instead of its address', () => {
    expect(sourcePlace('https://www.rollingstone.com/music/x')).toEqual({ name: 'Rolling Stone', archived: false });
    expect(sourcePlace('https://m.lasvegassun.com/news/x')).toEqual({ name: 'Las Vegas Sun', archived: false });
  });

  it('names an archived page after the site it came from', () => {
    expect(sourcePlace('https://web.archive.org/web/20140813215902/http://www.undertheradarmag.com/interviews/x'))
      .toEqual({ name: 'Under the Radar', archived: true });
    expect(sourcePlace('https://web.archive.org/web/2010/https://www.stopsmilingonline.com/story_detail.php?id=1170&page=2'))
      .toEqual({ name: 'Stop Smiling', archived: true });
  });

  it('falls back to the address for a site it does not know', () => {
    expect(sourcePlace('https://www.example-zine.org/a')).toEqual({ name: 'example-zine.org', archived: false });
  });

  it('gives every source in the ledger a readable name', () => {
    const ledger = JSON.parse(readFileSync(resolve(__dirname, '../../data/edge-sources.json'), 'utf-8')) as EdgeSources;
    for (const [k, s] of Object.entries(ledger)) {
      if (!s.url) continue;
      const { name } = sourcePlace(s.url);
      expect(name.length, k).toBeGreaterThan(1);
      expect(name, k).not.toMatch(/^https?:/);
    }
  });
});
