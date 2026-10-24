import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { artistThenFamily, searchArtists, shuffled, station, stations, wholeStory } from '@/lib/player-library';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const withSong = data.artists.filter(a => a.previewUrl);

describe('wholeStory', () => {
  it('plays every song on the map once, oldest first', () => {
    const q = wholeStory(data.artists);
    expect(q.tracks).toHaveLength(withSong.length);
    expect(new Set(q.tracks.map(t => t.id)).size).toBe(q.tracks.length);
    const years = q.tracks.map(t => t.activeFrom ?? 9999);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(q.tracks.every(t => t.previewUrl)).toBe(true);
  });
});

describe('stations', () => {
  it('splits the whole story into realms with nothing lost or doubled', () => {
    const all = stations(data.artists).flatMap(q => q.tracks.map(t => t.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual(withSong.map(a => a.id).sort());
  });

  it('keeps a station to its own realm', () => {
    const q = station(data.artists, 'electronic');
    const realm = new Map(data.artists.map(a => [a.id, a.realm]));
    expect(q.tracks.length).toBeGreaterThan(0);
    for (const t of q.tracks) expect(realm.get(t.id)).toBe('electronic');
  });
});

describe('shuffled', () => {
  it('has every song once, in a new order', () => {
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const q = shuffled(data.artists, random);
    expect(q.tracks.map(t => t.id).sort()).toEqual(withSong.map(a => a.id).sort());
    expect(q.tracks.map(t => t.id)).not.toEqual(wholeStory(data.artists).tracks.map(t => t.id));
  });
});

describe('artistThenFamily', () => {
  it('starts with the artist, then their family, each once', () => {
    const q = artistThenFamily(data, 'joy-division')!;
    expect(q.tracks[0].id).toBe('joy-division');
    const ids = q.tracks.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('velvet-underground');
  });
});

describe('searchArtists', () => {
  it('finds names that start with the query first, ignoring a leading "The"', () => {
    const found = searchArtists(data.artists, 'velvet');
    expect(found[0].id).toBe('velvet-underground');
    expect(searchArtists(data.artists, '   ')).toEqual([]);
  });
});
