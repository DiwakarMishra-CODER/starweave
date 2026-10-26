import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { buildGenreSession } from '@/lib/genre-session';
import { buildIssue, coverStars, coverStories, inSentence } from '@/lib/genre-issue';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const session = buildGenreSession(data);
const counts = { artists: data.artists.length, genres: data.genres.length };
const byId = new Map(data.genres.map(g => [g.id, g]));

describe('coverStories', () => {
  const stories = coverStories(session);

  it('finds the roads of four or more sounds', () => {
    expect(stories.length).toBeGreaterThanOrEqual(20);
  });

  it('only tells true stories: each step grew out of the one before', () => {
    for (const s of stories) {
      expect(s.line.length).toBeGreaterThanOrEqual(4);
      expect(byId.get(s.line[0].id)?.parent ?? null).toBeNull();
      for (let i = 1; i < s.line.length; i++) {
        expect(byId.get(s.line[i].id)!.parent, `${s.leafId}: ${s.line[i].id}`).toBe(s.line[i - 1].id);
      }
      expect(s.leafId).toBe(s.line[s.line.length - 1].id);
    }
  });

  it("puts the road's real years and length in its headline", () => {
    for (const s of stories) {
      expect(s.from).toBe(byId.get(s.line[0].id)!.emerged);
      expect(s.to).toBe(byId.get(s.leafId)!.emerged);
      expect(s.headline).toContain(`in ${s.to - s.from} year`);
      expect(s.kicker).toBe(`${s.line.length} genres, one line`);
    }
  });
});

describe('buildIssue', () => {
  it('gives the same issue all day, and a different story the next', () => {
    const day = 20_500;
    expect(buildIssue(session, counts, day)).toEqual(buildIssue(session, counts, day));
    expect(buildIssue(session, counts, day + 1).story.leafId).not.toBe(buildIssue(session, counts, day).story.leafId);
    expect(buildIssue(session, counts, day + 1).number).toBe(buildIssue(session, counts, day).number + 1);
  });

  it('prints counts that match the map', () => {
    const issue = buildIssue(session, counts, 20_500);
    expect(issue.facts[0]).toBe(`${data.artists.length} artists`);
    expect(issue.facts[1]).toBe(`${data.genres.length} genres`);
    const borrowers = data.genres.filter(g => g.emerged !== undefined && (g.alsoFrom ?? []).some(id => id !== g.parent && byId.get(id)?.emerged !== undefined)).length;
    expect(issue.facts[3]).toBe(`${borrowers} borrowed sounds`);
    expect(issue.barcode).toMatch(/^\d{12}$/);
  });

  it('puts a real artist of the story on the cover, with a photo', () => {
    const stars = coverStars(session, data);
    for (const story of coverStories(session)) {
      const star = stars[story.leafId];
      expect(star, story.leafId).toBeDefined();
      const artist = data.artists.find(a => a.id === star.id)!;
      expect(artist.genres).toContain(story.leafId);
      expect(artist.imageUrl).toBe(star.imageUrl);
    }
    const issue = buildIssue(session, counts, 20_500, stars);
    expect(issue.standfirst).toContain(issue.star!.name);
    expect(issue.standfirst).toContain(`From ${issue.story.from} to ${issue.story.to}`);
  });
});

describe('inSentence', () => {
  it('lower-cases a name mid-sentence, but not a proper name or an initialism', () => {
    expect(inSentence('Garage rock')).toBe('garage rock');
    expect(inSentence('Britpop')).toBe('Britpop');
    expect(inSentence('IDM')).toBe('IDM');
  });
});
