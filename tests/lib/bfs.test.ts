import { describe, it, expect } from 'vitest';
import {
  buildAdjacencyList,
  findShortestPath,
  findBestSourcedPath,
  findConnectionPath,
  hopCost,
  findMeetingPoint,
  getNeighbors,
  isDirectDescent,
  pathEdgeKeys,
  resolvePathHops,
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

  it('emits both orientations, since paths are walked without direction', () => {
    // The renderer keys edges by their real source→target; a hop that runs
    // against its edge must still match or the line stays unlit.
    const keys = pathEdgeKeys(['a', 'b']);
    expect(keys.has('a→b')).toBe(true);
    expect(keys.has('b→a')).toBe(true);
  });

  it('returns empty set for single-node path', () => {
    const keys = pathEdgeKeys(['a']);
    expect(keys.size).toBe(0);
  });
});

// ── Connection paths ─────────────────────────────────────────────────────────
// The undirected search exists because the directed one answers a question
// almost nobody's pair of artists satisfies — see the note above
// findConnectionPath in lib/graph-utils.ts.

describe('findConnectionPath', () => {
  const adjList = buildAdjacencyList(graphData.edges);

  it('connects a pair that has no directed path in either direction', () => {
    // Turnstile and Alvvays sit in different realms with no line of descent
    // between them, but both trace to the Ramones.
    expect(findShortestPath('turnstile', 'alvvays', adjList)).toBeNull();
    expect(findShortestPath('alvvays', 'turnstile', adjList)).toBeNull();

    const path = findConnectionPath('turnstile', 'alvvays', graphData.edges);
    expect(path).not.toBeNull();
    expect(path![0]).toBe('turnstile');
    expect(path![path!.length - 1]).toBe('alvvays');
  });

  it('still finds the descent path when one exists', () => {
    const path = findConnectionPath('slowdive', 'velvet-underground', graphData.edges);
    expect(path).not.toBeNull();
    expect(path![0]).toBe('slowdive');
    expect(path![path!.length - 1]).toBe('velvet-underground');
  });

  it('returns a single-element path for the same node', () => {
    expect(findConnectionPath('slowdive', 'slowdive', graphData.edges)).toEqual(['slowdive']);
  });
});

describe('resolvePathHops', () => {
  it('reads direction from the artist the hop starts at', () => {
    const edges: Edge[] = [
      // b influenced a
      { source: 'a', target: 'b', type: 'influence', status: 'verified', confidence: 0.8 },
      // b influenced c
      { source: 'c', target: 'b', type: 'influence', status: 'verified', confidence: 0.8 },
    ];
    const hops = resolvePathHops(['a', 'b', 'c'], edges);
    expect(hops).not.toBeNull();
    expect(hops![0].direction).toBe('influenced-by'); // a inherited from b
    expect(hops![1].direction).toBe('influenced');    // b fed into c
  });

  it('carries the underlying edge so citations travel with the hop', () => {
    const path = findConnectionPath('turnstile', 'alvvays', graphData.edges)!;
    const hops = resolvePathHops(path, graphData.edges)!;
    for (const hop of hops) {
      expect(graphData.edges).toContain(hop.edge);
    }
  });

  it('returns null when consecutive nodes have no edge between them', () => {
    const edges: Edge[] = [
      { source: 'a', target: 'b', type: 'influence', status: 'verified', confidence: 0.8 },
    ];
    expect(resolvePathHops(['a', 'b', 'z'], edges)).toBeNull();
  });

  it('resolves every hop of every path across a broad sample', () => {
    const ids = graphData.artists.map(a => a.id);
    for (let i = 0; i < ids.length; i += 7) {
      for (let j = 3; j < ids.length; j += 29) {
        if (ids[i] === ids[j]) continue;
        const path = findConnectionPath(ids[i], ids[j], graphData.edges);
        expect(path).not.toBeNull();
        expect(resolvePathHops(path!, graphData.edges)).not.toBeNull();
      }
    }
  });
});

describe('isDirectDescent / findMeetingPoint', () => {
  it('reports a single-direction chain as descent with no meeting point', () => {
    const path = findConnectionPath('slowdive', 'velvet-underground', graphData.edges)!;
    const hops = resolvePathHops(path, graphData.edges)!;
    expect(isDirectDescent(hops)).toBe(true);
    expect(findMeetingPoint(hops)).toBeNull();
  });

  it('reports a mixed chain as not-descent and names where it turns', () => {
    const path = findConnectionPath('turnstile', 'alvvays', graphData.edges)!;
    const hops = resolvePathHops(path, graphData.edges)!;
    expect(isDirectDescent(hops)).toBe(false);
    expect(findMeetingPoint(hops)).not.toBeNull();
  });

  it('treats an empty hop list as not descent', () => {
    expect(isDirectDescent([])).toBe(false);
  });
});

// ── Best-sourced paths ───────────────────────────────────────────────────────
// Why this exists rather than just using the shortest path: see the note above
// findBestSourcedPath in lib/graph-utils.ts.

describe('hopCost', () => {
  it('prices a first-person hop far below an unsourced one', () => {
    const firstPerson = { citation: 'x', citationStatus: undefined, sourceTier: 'first-person' } as const;
    const unchecked = { citation: undefined, citationStatus: undefined, sourceTier: undefined } as const;
    expect(hopCost(firstPerson)).toBeLessThan(hopCost(unchecked) / 5);
  });

  it('orders the tiers first-person < reported < critic', () => {
    const at = (t: 'first-person' | 'reported' | 'critic') =>
      hopCost({ citation: 'x', citationStatus: undefined, sourceTier: t });
    expect(at('first-person')).toBeLessThan(at('reported'));
    expect(at('reported')).toBeLessThan(at('critic'));
  });

  it('prices an unsourceable edge as weak even though it carries a tier', () => {
    const unsourceable = { citation: undefined, citationStatus: 'unsourceable', sourceTier: 'reported' } as const;
    const cited = { citation: 'x', citationStatus: undefined, sourceTier: 'reported' } as const;
    expect(hopCost(unsourceable)).toBeGreaterThan(hopCost(cited));
  });
});

describe('findBestSourcedPath', () => {
  it('avoids an unsourced hop the shortest path walks straight through', () => {
    // Fewest hops goes via Nico, whose edge nobody stated on the record.
    const shortest = findConnectionPath('velvet-underground', 'big-thief', graphData.edges)!;
    const best = findBestSourcedPath('velvet-underground', 'big-thief', graphData.edges)!;
    expect(shortest).toContain('nico');
    expect(best).not.toContain('nico');

    // and every hop of the route it picked instead is the artist's own words
    for (const hop of resolvePathHops(best, graphData.edges)!) {
      expect(hop.edge.sourceTier).toBe('first-person');
    }
  });

  it('returns a real, resolvable chain between its endpoints', () => {
    const path = findBestSourcedPath('turnstile', 'alvvays', graphData.edges);
    expect(path).not.toBeNull();
    expect(path![0]).toBe('turnstile');
    expect(path![path!.length - 1]).toBe('alvvays');
    expect(resolvePathHops(path!, graphData.edges)).not.toBeNull();
  });

  it('never costs more than the shortest path does, by its own measure', () => {
    const ids = graphData.artists.map(a => a.id);
    const total = (p: string[]) =>
      resolvePathHops(p, graphData.edges)!.reduce((sum, h) => sum + hopCost(h.edge), 0);
    for (let i = 0; i < ids.length; i += 37) {
      for (let j = 5; j < ids.length; j += 53) {
        if (ids[i] === ids[j]) continue;
        const shortest = findConnectionPath(ids[i], ids[j], graphData.edges);
        const best = findBestSourcedPath(ids[i], ids[j], graphData.edges);
        expect(best).not.toBeNull();
        expect(total(best!)).toBeLessThanOrEqual(total(shortest!) + 1e-9);
      }
    }
  });

  it('returns a single-element path for the same node', () => {
    expect(findBestSourcedPath('slowdive', 'slowdive', graphData.edges)).toEqual(['slowdive']);
  });
});
