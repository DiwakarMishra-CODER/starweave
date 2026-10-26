import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Edge, GraphData } from '@/data/types';
import { applyEdgeSources, ledgerProblems, hasProof, type EdgeSources } from '@/lib/edge-sources';

const ledger = JSON.parse(readFileSync(resolve(__dirname, '../../data/edge-sources.json'), 'utf-8')) as EdgeSources;
const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;

const edge = (over: Partial<Edge> = {}): Edge => ({
  source: 'a', target: 'b', type: 'influence', status: 'verified', confidence: 0.8,
  citation: 'A to B, 2001: "words".', sourceTier: 'first-person', ...over,
});

describe('applyEdgeSources', () => {
  it('adds the link, and any corrected citation and tier', () => {
    const [e] = applyEdgeSources([edge()], {
      'a>b': { url: 'https://x.org/a', found: 'words', citation: 'A to X (2001): "words".', sourceTier: 'reported', checked: '2026-10-26', verdict: 'fixed' },
    });
    expect(e.sourceUrl).toBe('https://x.org/a');
    expect(e.citation).toBe('A to X (2001): "words".');
    expect(e.sourceTier).toBe('reported');
  });

  it('brings the rating down with a lowered tier', () => {
    const [e] = applyEdgeSources([edge({ confidence: 0.85 })], {
      'a>b': { url: 'https://x.org/a', found: 'w', sourceTier: 'reported', checked: '2026-10-26', verdict: 'fixed' },
    });
    expect(e.confidence).toBe(0.7);
  });

  it('keeps a print source as print', () => {
    const [e] = applyEdgeSources([edge()], { 'a>b': { print: 'Book (2004), p. 12', checked: '2026-10-26', verdict: 'print' } });
    expect(e.sourcePrint).toBe('Book (2004), p. 12');
    expect(e.sourceUrl).toBeUndefined();
  });

  it('cleans an unsourced link\'s wording without giving it a source', () => {
    const [e] = applyEdgeSources([edge({ citation: 'A to B: "words" -- a critic\'s reading.' })],
      { 'a>b': { reworded: 'A to B: "words".', checked: '2026-10-26', verdict: 'not-found', note: 'tried x' } });
    expect(e.citation).toBe('A to B: "words".');
    expect(e.sourceUrl).toBeUndefined();
  });

  it('leaves a link unproven by not-found or decide exactly as it was', () => {
    const before = edge();
    for (const verdict of ['not-found', 'decide'] as const) {
      const [e] = applyEdgeSources([before], { 'a>b': { citation: 'changed', checked: '2026-10-26', verdict, note: 'tried x' } });
      expect(e).toEqual(before);
    }
  });
});

describe('ledgerProblems', () => {
  it('catches an entry for a link that does not exist, and a verdict missing its proof', () => {
    const problems = ledgerProblems([edge()], {
      'a>c': { url: 'https://x.org', found: 'w', checked: '2026-10-26', verdict: 'ok' },
      'a>b': { checked: '2026-10-26', verdict: 'ok' },
    });
    expect(problems).toContain('a>c: no such link');
    expect(problems).toContain('a>b: ok needs url and found');
  });

  it('refuses Grokipedia and proxy addresses', () => {
    expect(ledgerProblems([edge()], { 'a>b': { url: 'https://grokipedia.com/x', found: 'w', checked: '2026-10-26', verdict: 'ok' } }))
      .toContain('a>b: Grokipedia is never a source');
    expect(ledgerProblems([edge()], { 'a>b': { url: 'https://r.jina.ai/https://x.org', found: 'w', checked: '2026-10-26', verdict: 'ok' } }))
      .toContain('a>b: record the page itself, not the proxy');
  });
});

describe('the ledger', () => {
  it('is sound against the links on the map', () => {
    expect(ledgerProblems(data.edges, ledger)).toEqual([]);
  });

  it('is merged into graph.json', () => {
    const byKey = new Map(data.edges.map(e => [`${e.source}>${e.target}`, e]));
    for (const [k, s] of Object.entries(ledger)) {
      if (!hasProof(s)) continue;
      const e = byKey.get(k)!;
      expect(e.sourceUrl ?? e.sourcePrint, k).toBe(s.url ?? s.print);
      if (s.citation) expect(e.citation, k).toBe(s.citation);
    }
  });
});
