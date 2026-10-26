import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import {
  FIRST_WAVE, HEADLINE_MAX_PX, HEADLINE_MIN_PX, HEADLINE_W,
  featureOrder, headlinePx, resolveGenreFeature,
} from '@/lib/genre-feature';
import { antonWidth } from '@/lib/genre-session';
import { GENRE_PAGES } from '@/data/genre-pages';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const features = data.genres.map(g => resolveGenreFeature(data, g.id)!);

describe('genre feature', () => {
  it('resolves every genre, led by a photographed artist of its own', () => {
    expect(features.every(Boolean)).toBe(true);
    for (const f of features) {
      expect(f.lead?.imageUrl).toBeTruthy();
      expect(data.artists.find(a => a.id === f.lead!.id)!.genres).toContain(f.id);
    }
    expect(resolveGenreFeature(data, 'no-such-genre')).toBeNull();
  });

  it('pulls out somebody\'s own words, or the line it was born on', () => {
    const quoted = features.filter(f => 'quote' in f.pull);
    expect(quoted.length).toBeGreaterThanOrEqual(40);
    for (const f of quoted) {
      const p = f.pull as { quote: string; speaker: string };
      expect(p.quote.length).toBeGreaterThanOrEqual(30);
      expect(p.quote.length).toBeLessThanOrEqual(260);
      expect(p.speaker.length).toBeGreaterThan(0);
    }
    for (const f of features.filter(f => 'born' in f.pull)) {
      expect((f.pull as { born: string }).born.length).toBeGreaterThan(10);
    }
  });

  it('prints the records in their ranked order, each by an artist of the genre, with a cover and a review', () => {
    for (const f of features) {
      expect(f.records.length).toBeGreaterThan(0);
      expect(f.records.map(r => r.artistId)).toEqual(GENRE_PAGES[f.id].definingAlbums);
      expect(new Set(f.records.map(r => r.artistId)).size).toBe(f.records.length);
      for (const r of f.records) {
        expect(data.artists.find(a => a.id === r.artistId)!.genres, `${f.id} / ${r.artistId}`).toContain(f.id);
        expect(r.imageUrl).toBeTruthy();
        expect(r.review.length).toBeGreaterThan(40);
      }
    }
  });

  it('puts every artist tagged with the genre in exactly one group', () => {
    for (const f of features) {
      const tagged = data.artists.filter(a => a.genres.includes(f.id)).map(a => a.id).sort();
      const grouped = f.groups.flatMap(g => g.artists.map(a => a.id)).sort();
      expect(grouped).toEqual(tagged);
      expect(f.artistCount).toBe(tagged.length);
    }
  });

  it('steps through all the features once, in the city\'s order', () => {
    const order = featureOrder(data);
    expect(new Set(order).size).toBe(data.genres.length);
    let id = order[0];
    const seen = new Set<string>();
    for (let k = 0; k < order.length; k++) {
      seen.add(id);
      id = features.find(f => f.id === id)!.next.id;
    }
    expect(seen.size).toBe(order.length);
    expect(id).toBe(order[0]);
  });

  it('sizes every headline so its longest word fits the page', () => {
    for (const f of features) {
      expect(f.headlinePx).toBe(headlinePx(f.name));
      expect(f.headlinePx).toBeGreaterThanOrEqual(HEADLINE_MIN_PX);
      expect(f.headlinePx).toBeLessThanOrEqual(HEADLINE_MAX_PX);
      for (const word of f.name.toUpperCase().split(' ').flatMap(w => w.split(/(?<=-)/))) {
        expect(antonWidth(word, f.headlinePx, 0.005)).toBeLessThanOrEqual(HEADLINE_W);
      }
    }
  });

  it('only puts songs on the tape, oldest first', () => {
    for (const f of features) {
      expect(f.queue.tracks.length).toBeGreaterThan(0);
      for (const t of f.queue.tracks) expect(t.previewUrl).toBeTruthy();
      const years = f.queue.tracks.map(t => t.activeFrom ?? 9999);
      expect(years).toEqual([...years].sort((a, b) => a - b));
    }
  });

  it('plays a song from each record itself, in the order the records run', () => {
    for (const f of features) {
      const withSong = f.records.filter(r => r.song);
      expect(f.recordsQueue.tracks.map(t => t.id)).toEqual(withSong.map(r => r.artistId));
      for (const t of f.recordsQueue.tracks) expect(t.previewUrl).toBeTruthy();
    }
    const all = features.flatMap(f => f.records);
    expect(all.filter(r => r.song).length / all.length).toBeGreaterThan(0.9);
  });

  it('walks the road back to a root and on to its offspring', () => {
    for (const f of features) {
      const genre = data.genres.find(g => g.id === f.id)!;
      if (genre.parent) expect(f.road.ancestors.at(-1)!.id).toBe(genre.parent);
      else expect(f.road.ancestors).toHaveLength(0);
      for (const c of f.road.children) expect(data.genres.find(g => g.id === c.id)!.parent).toBe(f.id);
    }
  });

  it('opens its story on the first on the map to play it, oldest first, every one with a photo', () => {
    for (const g of data.genres) {
      const f = resolveGenreFeature(data, g.id);
      if (!f) continue;
      expect(f.firstWave.length, g.id).toBeLessThanOrEqual(FIRST_WAVE);
      expect(f.firstWave.length, g.id).toBeGreaterThan(0);
      const years = f.firstWave.map(a => a.activeFrom!);
      expect(years).toEqual([...years].sort((a, b) => a - b));
      for (const a of f.firstWave) {
        expect(a.imageUrl).toBeTruthy();
        expect(data.artists.find(x => x.id === a.id)!.genres).toContain(g.id);
      }
    }
  });
});
