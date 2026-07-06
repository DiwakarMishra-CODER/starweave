import { describe, it, expect } from 'vitest';
import { validateEdges, computeInfluenceScores } from '@/scripts/pipeline';
import { graphData } from '@/data/seed-data';
import type { Artist, Edge } from '@/data/types';

describe('validateEdges', () => {
  it('passes on valid seed data with no errors', () => {
    const errors = validateEdges(graphData.artists, graphData.edges);
    expect(errors).toHaveLength(0);
  });

  it('catches a dangling source reference', () => {
    const badEdge: Edge = {
      source: 'ghost-band',
      target: 'velvet-underground',
      type: 'influence',
      status: 'verified',
      confidence: 0.9,
    };
    const errors = validateEdges(graphData.artists, [...graphData.edges, badEdge]);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/ghost-band/);
  });

  it('catches a dangling target reference', () => {
    const badEdge: Edge = {
      source: 'slowdive',
      target: 'non-existent-artist',
      type: 'influence',
      status: 'verified',
      confidence: 0.7,
    };
    const errors = validateEdges(graphData.artists, [...graphData.edges, badEdge]);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/non-existent-artist/);
  });

  it('returns multiple errors for multiple bad edges', () => {
    const badEdges: Edge[] = [
      { source: 'ghost-a', target: 'velvet-underground', type: 'influence', status: 'verified', confidence: 0.5 },
      { source: 'slowdive', target: 'ghost-b', type: 'influence', status: 'verified', confidence: 0.5 },
    ];
    const errors = validateEdges(graphData.artists, [...graphData.edges, ...badEdges]);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('computeInfluenceScores', () => {
  it('gives velvet-underground the highest score', () => {
    const scores = computeInfluenceScores(graphData.artists, graphData.edges);
    const vuScore = scores.get('velvet-underground') ?? 0;
    for (const [id, score] of scores) {
      if (id !== 'velvet-underground') {
        expect(vuScore).toBeGreaterThanOrEqual(score);
      }
    }
  });

  it('gives MBV and Cocteau Twins high secondary scores', () => {
    const scores = computeInfluenceScores(graphData.artists, graphData.edges);
    const mbv = scores.get('my-bloody-valentine') ?? 0;
    const ct = scores.get('cocteau-twins') ?? 0;
    expect(mbv).toBeGreaterThan(3);
    expect(ct).toBeGreaterThan(3);
  });

  it('assigns zero to artists with no incoming influence edges', () => {
    const minimalArtists: Artist[] = [
      { id: 'a', name: 'A', layer: 'root', genres: [], scope: ['shoegaze-dreampop-v1'] },
      { id: 'b', name: 'B', layer: 'root', genres: [], scope: ['shoegaze-dreampop-v1'] },
    ];
    const scores = computeInfluenceScores(minimalArtists, []);
    expect(scores.get('a')).toBe(0);
    expect(scores.get('b')).toBe(0);
  });

  it('only counts influence edges, not other types', () => {
    const artists: Artist[] = [
      { id: 'x', name: 'X', layer: 'root', genres: [], scope: ['shoegaze-dreampop-v1'] },
      { id: 'y', name: 'Y', layer: 'root', genres: [], scope: ['shoegaze-dreampop-v1'] },
    ];
    const edges: Edge[] = [
      { source: 'x', target: 'y', type: 'similarity', status: 'verified', confidence: 0.8 },
      { source: 'x', target: 'y', type: 'contemporary', status: 'verified', confidence: 0.8 },
    ];
    const scores = computeInfluenceScores(artists, edges);
    expect(scores.get('y')).toBe(0);
  });
});
