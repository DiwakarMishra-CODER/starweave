import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { roadToRoot, stepWords, TOUR_PICKS, TOUR_DEFAULT } from '@/lib/tour';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const isEdge = (from: string, to: string) => data.edges.some(e => e.type === 'influence' && e.source === from && e.target === to);

describe('roadToRoot', () => {
  it('walks every pick back to the Velvet Underground in two or three real steps', () => {
    for (const id of [...TOUR_PICKS, TOUR_DEFAULT]) {
      const road = roadToRoot(data, id)!;
      expect(road[0]).toBe(id);
      expect(road[road.length - 1]).toBe('velvet-underground');
      expect(road.length - 1).toBeGreaterThanOrEqual(2);
      expect(road.length - 1).toBeLessThanOrEqual(3);
      for (let i = 1; i < road.length; i++) expect(isEdge(road[i - 1], road[i])).toBe(true);
    }
  });

  it('takes Nirvana through the Pixies', () => {
    expect(roadToRoot(data, 'nirvana')).toEqual(['nirvana', 'pixies', 'velvet-underground']);
  });

  it('is null for the Velvet Underground itself', () => {
    expect(roadToRoot(data, 'velvet-underground')).toBeNull();
  });
});

describe('stepWords', () => {
  it('only ever quotes a citation word for word', () => {
    for (const id of TOUR_PICKS) {
      const road = roadToRoot(data, id)!;
      for (let i = 1; i < road.length; i++) {
        const words = stepWords(data, road[i - 1], road[i]);
        const edge = data.edges.find(e => e.source === road[i - 1] && e.target === road[i])!;
        if (words.quote) expect(edge.citation).toContain(words.quote);
        else expect(words.credit).toMatch(/learned from/);
      }
    }
  });
});
