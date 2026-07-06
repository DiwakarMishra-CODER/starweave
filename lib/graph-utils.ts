import type { Edge } from '@/data/types';

export type AdjList = Map<string, string[]>;

export function buildAdjacencyList(edges: Edge[]): AdjList {
  const adj: AdjList = new Map();
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }
  return adj;
}

export function buildReverseAdjacencyList(edges: Edge[]): AdjList {
  const adj: AdjList = new Map();
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    if (!adj.has(edge.target)) adj.set(edge.target, []);
    adj.get(edge.target)!.push(edge.source);
  }
  return adj;
}

// BFS over directed influence graph (source → target, i.e. toward the root).
// Returns array of node IDs from src to dst, or null if no path exists.
export function findShortestPath(
  src: string,
  dst: string,
  adjList: AdjList,
): string[] | null {
  if (src === dst) return [src];
  const visited = new Set<string>([src]);
  const queue: string[][] = [[src]];
  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    for (const neighbor of adjList.get(node) ?? []) {
      if (neighbor === dst) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

// Returns set of IDs directly connected to a node (in either direction).
export function getNeighbors(nodeId: string, edges: Edge[]): Set<string> {
  const neighbors = new Set<string>();
  for (const edge of edges) {
    if (edge.source === nodeId) neighbors.add(edge.target);
    if (edge.target === nodeId) neighbors.add(edge.source);
  }
  return neighbors;
}

// For a path [A, B, C], returns a Set of "A→B", "B→C" edge keys.
export function pathEdgeKeys(path: string[]): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    keys.add(`${path[i]}→${path[i + 1]}`);
  }
  return keys;
}
