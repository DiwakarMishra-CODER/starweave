import type { Artist, Edge } from '../data/types';

export function validateEdges(artists: Artist[], edges: Edge[]): string[] {
  const ids = new Set(artists.map(a => a.id));
  const errors: string[] = [];
  for (const edge of edges) {
    if (!ids.has(edge.source))
      errors.push(`Dangling source: "${edge.source}" in edge → "${edge.target}"`);
    if (!ids.has(edge.target))
      errors.push(`Dangling target: "${edge.target}" in edge "${edge.source}" →`);
  }
  return errors;
}

export function computeInfluenceScores(artists: Artist[], edges: Edge[]): Map<string, number> {
  const scores = new Map<string, number>(artists.map(a => [a.id, 0]));
  for (const edge of edges) {
    if (edge.type !== 'influence') continue;
    scores.set(edge.target, (scores.get(edge.target) ?? 0) + 1);
  }
  return scores;
}
