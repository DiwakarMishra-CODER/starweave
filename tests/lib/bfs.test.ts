import { describe, it, expect } from 'vitest';
import {
  buildAdjacencyList,
  findShortestPath,
  getNeighbors,
  pathEdgeKeys,
} from '@/lib/graph-utils';
import { graphData } from '@/data/seed-data';
import type { Edge } from '@/data/types';

describe('buildAdjacencyList', () => {
  it('builds adjacency list only from influence edges', () => {
    const edges: Edge[] = [
      { source: 'a', target: 'b', type: 'influence', status: 'verified', confidence: 0.8 },
      { source: 'c', target: 'd', type: 'similarity', status: 'verified', confidence: 0.8 },
    ];
    const adj = buildAdjacencyList(edges);
    expect(adj.get('a')).toEqual(['b']);
    expect(adj.has('c')).toBe(false);
  });
});

describe('findShortestPath', () => {
  const adjList = buildAdjacencyList(graphData.edges);

  it('finds the direct path when one exists', () => {
    // slowdive → my-bloody-valentine → jesus-and-mary-chain → velvet-underground
    const path = findShortestPath('slowdive', 'velvet-underground', adjList);
    expect(path).not.toBeNull();
    expect(path![0]).toBe('slowdive');
    expect(path![path!.length - 1]).toBe('velvet-underground');
  });

  it('returns single-element array for same-node query', () => {
    const path = findShortestPath('slowdive', 'slowdive', adjList);
    expect(path).toEqual(['slowdive']);
  });

  it('returns null for nodes with no connecting path', () => {
    // velvet-underground has no outgoing influence edges (it is the root)
    const path = findShortestPath('velvet-underground', 'parannoul', adjList);
    expect(path).toBeNull();
  });

  it('finds path: parannoul → slowdive → velvet-underground (2 hops)', () => {
    const path = findShortestPath('parannoul', 'velvet-underground', adjList);
    expect(path).not.toBeNull();
    // Must start and end correctly
    expect(path![0]).toBe('parannoul');
    expect(path![path!.length - 1]).toBe('velvet-underground');
    // Shortest should be <= 4 hops
    expect(path!.length).toBeLessThanOrEqual(5);
  });

  it('does not revisit nodes (no infinite loop on cycles)', () => {
    // Tiny cycle graph
    const edges: Edge[] = [
      { source: 'a', target: 'b', type: 'influence', status: 'verified', confidence: 1 },
      { source: 'b', target: 'a', type: 'influence', status: 'verified', confidence: 1 },
    ];
    const adj = buildAdjacencyList(edges);
    const path = findShortestPath('a', 'c', adj);
    expect(path).toBeNull();
  });
});

describe('getNeighbors', () => {
  it('returns both source and target directions', () => {
    const edges: Edge[] = [
      { source: 'a', target: 'b', type: 'influence', status: 'verified', confidence: 0.8 },
      { source: 'c', target: 'a', type: 'influence', status: 'verified', confidence: 0.8 },
    ];
    const neighbors = getNeighbors('a', edges);
    expect(neighbors.has('b')).toBe(true);
    expect(neighbors.has('c')).toBe(true);
  });
});

describe('pathEdgeKeys', () => {
  it('generates correct edge keys for a path', () => {
    const keys = pathEdgeKeys(['a', 'b', 'c']);
    expect(keys.has('a→b')).toBe(true);
    expect(keys.has('b→c')).toBe(true);
    expect(keys.has('a→c')).toBe(false);
  });

  it('returns empty set for single-node path', () => {
    const keys = pathEdgeKeys(['a']);
    expect(keys.size).toBe(0);
  });
});
