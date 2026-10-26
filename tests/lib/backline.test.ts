import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { contrastRatio, resolveNodeColor } from '@/lib/colors';
import { SHELF_RECORDS, kitFor, resolveBackline, resolveGenreBackline } from '@/lib/backline';
import { GENRE_PAGES } from '@/data/genre-pages';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const artist = (id: string) => data.artists.find(a => a.id === id)!;
const backline = (id: string) => resolveBackline(data, id, resolveNodeColor(artist(id)));

describe('the room behind the artist page', () => {
  it('gives each artist instruments that suit their sound', () => {
    expect(kitFor(artist('cocteau-twins'))).toBe('band');
    expect(kitFor(artist('fugazi'))).toBe('band');
    expect(kitFor(artist('kraftwerk'))).toBe('electronic');
    expect(kitFor(artist('brian-eno'))).toBe('electronic');
    expect(kitFor(artist('aphex-twin'))).toBe('electronic');
    expect(kitFor(artist('joni-mitchell'))).toBe('folk');
    expect(kitFor(artist('low'))).toBe('band'); // slowcore is a band
  });

  it('pins on badges of the bands that shaped them, and stickers of the bands they shaped', () => {
    for (const a of data.artists) {
      const b = backline(a.id);
      const shapedBy = new Set(data.edges.filter(e => e.source === a.id).map(e => e.target));
      const shaped = new Set(data.edges.filter(e => e.target === a.id).map(e => e.source));
      for (const f of b.badges) expect(shapedBy.has(f.id), `${a.id} badge ${f.id}`).toBe(true);
      for (const f of b.stickers) expect(shaped.has(f.id), `${a.id} sticker ${f.id}`).toBe(true);
      for (const f of [...b.badges, ...b.stickers]) expect(f.imageUrl).toBeTruthy();
      expect(new Set(b.badges.map(f => f.id)).size).toBe(b.badges.length);
    }
  });

  it('fills the shelves with real records, family first, none twice', () => {
    for (const a of data.artists) {
      const { records } = backline(a.id);
      expect(records.length, a.id).toBeGreaterThan(0);
      expect(records.length).toBeLessThanOrEqual(SHELF_RECORDS);
      expect(new Set(records.map(r => r.artistId)).size).toBe(records.length);
      for (const r of records) expect(r.imageUrl).toBeTruthy();
      const firstNeighbour = records.findIndex(r => !r.family);
      if (firstNeighbour >= 0) expect(records.slice(firstNeighbour).every(r => !r.family)).toBe(true);
      expect(records.some(r => r.artistId === a.id)).toBe(true);
    }
  });

  it('puts up their own poster, and their scene\u2019s flyer only if they played in one', () => {
    for (const a of data.artists) {
      const b = backline(a.id);
      if (a.imageUrl) expect(b.self?.id).toBe(a.id);
      const scene = data.scenes.find(sc => sc.memberIds.includes(a.id));
      expect(b.scene?.name ?? null).toBe(scene?.name ?? null);
    }
  });

  it('paints every room dark enough for cream type, in its own colour', () => {
    const walls = new Set<string>();
    for (const a of data.artists) {
      const { wall } = backline(a.id);
      expect(contrastRatio(wall, '#efe3cb'), a.id).toBeGreaterThanOrEqual(7);
      walls.add(wall);
    }
    expect(walls.size).toBeGreaterThan(10);
  });

  it('fills each genre\u2019s room with that genre: its records first, its first wave as badges, its latest as stickers', () => {
    const kits = new Set<string>();
    for (const g of data.genres) {
      const page = GENRE_PAGES[g.id];
      if (!page) continue;
      const b = resolveGenreBackline(data, g.id, '#8891f2', page.definingAlbums);
      const members = data.artists.filter(a => a.genres.includes(g.id));
      const ids = new Set(members.map(a => a.id));
      kits.add(b.kit);
      for (const f of [...b.badges, ...b.stickers]) expect(ids.has(f.id), `${g.id} ${f.id}`).toBe(true);
      const badgeYears = b.badges.map(f => data.artists.find(a => a.id === f.id)!.activeFrom!);
      expect(badgeYears).toEqual([...badgeYears].sort((x, y) => x - y));
      expect(b.stickers.some(f => b.badges.some(x => x.id === f.id))).toBe(false);
      const essentials = b.records.filter(r => r.family).map(r => r.artistId);
      expect(essentials).toEqual(page.definingAlbums.filter(id => essentials.includes(id)));
      expect(b.records.slice(0, essentials.length).every(r => r.family)).toBe(true);
    }
    // Synth-pop rooms get synths, folk rooms acoustics, the rest guitars.
    expect(kits).toEqual(new Set(['band', 'electronic', 'folk']));
    expect(resolveGenreBackline(data, 'synth-pop', '#000', GENRE_PAGES['synth-pop'].definingAlbums).kit).toBe('electronic');
    expect(resolveGenreBackline(data, 'shoegaze', '#000', GENRE_PAGES['shoegaze'].definingAlbums).kit).toBe('band');
  });
});
