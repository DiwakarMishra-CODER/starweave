import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { ONE_FAMILY, SOUNDS_LIKE, TAPE_SONGS, TAPE_TRACKS } from '@/data/about';
import { aboutCards, notSoundQuote, resolveAboutTape } from '@/lib/about-tape';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const tape = resolveAboutTape(data);

describe('the About tape', () => {
  it('plays every song on the tape, each from its own record', () => {
    expect(tape.queue.tracks).toHaveLength(TAPE_SONGS.filter(s => s.onTape !== false).length);
    for (const t of tape.queue.tracks) expect(t.previewUrl, t.previewTrack ?? t.id).toBeTruthy();
    for (const s of TAPE_SONGS) expect(data.songs?.[s.key]?.imageUrl, s.key).toBeTruthy();
  });

  it('gives every track but the silent first its songs, in tape order', () => {
    expect(tape.tracks.map(t => t.id)).toEqual(TAPE_TRACKS.map(t => t.id));
    expect(tape.tracks[0].songs).toEqual([]);
    const order = tape.tracks.flatMap(t => t.songs.map(s => s.at));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    for (const t of tape.tracks.slice(1)) expect(t.songs.length, t.id).toBeGreaterThan(0);
  });

  it('draws both roads from punk as they run in the map\u2019s own family tree', () => {
    const parent = (id: string) => data.genres.find(g => g.id === id)?.parent;
    for (const road of [ONE_FAMILY.soft.road, ONE_FAMILY.loud.road]) {
      road.forEach((id, i) => expect(parent(id), id).toBe(i === 0 ? ONE_FAMILY.root : road[i - 1]));
    }
    // Shoegaze's line back, from the split's own root.
    const line = [...ONE_FAMILY.merge.road, ONE_FAMILY.merge.from];
    expect(line[0]).toBe(ONE_FAMILY.root);
    line.slice(1).forEach((id, i) => expect(parent(id), id).toBe(line[i]));
  });

  it('files every find under where it was found, each with its sleeve and a song', () => {
    expect(tape.dig.map(p => p.name)).toHaveLength(3);
    for (const c of tape.dig.flatMap(p => p.finds)) {
      expect(c.imageUrl, c.title).toBeTruthy();
      expect(c.at !== null || !!c.track?.previewUrl, c.title).toBe(true);
      expect(c.note.length, c.title).toBeGreaterThan(0);
      expect(c.song, c.title).toBeTruthy();
    }
  });

  it('shows the bands that sound like Alvvays with no line to them', () => {
    expect(tape.learned.soundsLike).toHaveLength(SOUNDS_LIKE.length);
    for (const f of tape.learned.soundsLike) {
      expect(f.imageUrl, f.id).toBeTruthy();
      expect(data.edges.some(e => [e.source, e.target].includes(f.id) && [e.source, e.target].includes('alvvays')), f.id).toBe(false);
    }
  });

  it('keeps the loud songs off the tape: only on a press, and quieter', () => {
    const f = tape.oneFamily;
    for (const q of [f.loud.listen, f.merge.listen, f.merge.loud.listen]) {
      const t = q.tracks[0];
      expect(TAPE_SONGS.find(s => s.label === t.previewTrack || s.song === t.previewTrack)?.onTape, t.previewTrack ?? '').toBe(false);
      expect(tape.queue.tracks.some(x => x.previewTrack === t.previewTrack), t.previewTrack ?? '').toBe(false);
      expect(t.gain).toBeLessThan(1);
      expect(t.previewUrl).toBeTruthy();
    }
  });

  it('gives the bands who aren\u2019t on the map their own photos', () => {
    const f = tape.oneFamily;
    for (const b of [f.loud.band, f.merge.band, f.merge.loud.band]) expect(b.imageUrl, b.name).toBeTruthy();
  });

  it('quotes its sources exactly as the map records them', () => {
    for (const c of aboutCards) {
      const e = data.edges.find(x => x.source === c.edge[0] && x.target === c.edge[1]);
      expect(e?.citation, c.edge.join(' -> ')).toContain(c.quote);
    }
    const ns = data.edges.find(e => e.source === 'elliott-smith' && e.target === 'fugazi');
    expect(ns?.citation).toContain(notSoundQuote.quote);
    expect(tape.learned.notSound.quote).toBe(notSoundQuote.quote);
  });

  it('draws Alvvays from the bands they learned from on the map', () => {
    const targets = data.edges.filter(e => e.source === 'alvvays').map(e => e.target).sort();
    expect(tape.learned.from.map(f => f.id).sort()).toEqual(targets);
  });

  it('counts the bands between the two constants from the links themselves', () => {
    const into = (id: string) => new Set(data.edges.filter(e => e.target === id).map(e => e.source));
    const ct = into('cocteau-twins');
    const mbv = into('my-bloody-valentine');
    expect(tape.between.ctCount).toBe(ct.size);
    expect(tape.between.mbvCount).toBe(mbv.size);
    expect(tape.between.both.map(f => f.id).sort()).toEqual([...ct].filter(id => mbv.has(id)).sort());
    expect(tape.between.both.map(f => f.id)).toContain('alvvays');
  });

  it('gives every record in the rotation something to play', () => {
    for (const c of tape.rotation) expect(c.at !== null || !!c.track?.previewUrl, c.title).toBe(true);
  });

  it('says nothing in the map’s own jargon', () => {
    // The hidden track names the library the map is drawn with; that's a name, not jargon.
    const words = JSON.stringify([TAPE_TRACKS, tape.label, tape.constants, tape.learned.notSound.words, tape.between.lead, tape.liner.lines])
      .replace('react-force-graph', '');
    expect(words).not.toMatch(/\b(graph|nodes?|edges?)\b/i);
  });
});
