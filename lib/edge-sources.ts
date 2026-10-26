// The source pass's ledger: the proof behind each influence link, kept apart
// from seed-data.ts (which keeps who influenced whom). One entry per link,
// keyed `source>target`, written once a checker has opened the page that
// carries the claim and read it there -- never from a search summary. The
// build merges each entry onto its edge (`applyEdgeSources`), so the link to
// the page, and any corrected wording or tier, only exist in graph.json.
// The plan is research/source-pass/PLAN.md.

import type { Edge, SourceTier } from '../data/types';

// ok        the citation stands as written; the page carries it
// fixed     the page carries the claim, and the citation or tier was corrected
// print     only in print: `print` names the book, edition and page
// not-found two searches found no page; `note` says what was tried
// decide    for the owner: the link may need to go, flip, or become a denial
// blocked   the page that should carry it exists but can't be opened by a
//           bot (paywall, login, bot wall): the owner opens it and sends the
//           passage, and the entry becomes ok, fixed or decide
export type SourceVerdict = 'ok' | 'fixed' | 'print' | 'not-found' | 'decide' | 'blocked';

export interface EdgeSource {
  /** The page that carries the claim. */
  url?: string;
  /** A print-only source: book, edition, page. */
  print?: string;
  /** The exact sentence on the page, copied, never retyped: the check
   *  script looks for it there. */
  found?: string;
  /** The corrected citation, only when it changes. */
  citation?: string;
  /** The corrected tier, only when it changes. */
  sourceTier?: SourceTier;
  /** When it was checked, YYYY-MM-DD. */
  checked: string;
  verdict: SourceVerdict;
  /** For the ledger's readers only, never shown: what was tried, or what
   *  the owner has to decide. */
  note?: string;
  /** For a link the pass couldn't source: its old citation with research
   *  commentary taken out (wording only, the claim unchanged), so what a
   *  reader sees is a finished sentence even before it has a source. */
  reworded?: string;
  /** Which checker wrote it: a later file from the same checker may replace
   *  it; an entry with none was settled by hand and is never replaced. */
  by?: string;
}

export type EdgeSources = Record<string, EdgeSource>;

// The most a link's confidence can be at each tier (CLAUDE.md's scale: ~0.85
// for an artist's own words, ~0.6-0.7 for a publication stating it, ~0.5 for
// a critic). When the pass corrects a tier, the rating follows it down.
export const TIER_CONFIDENCE_CAP: Record<SourceTier, number> = {
  'first-person': 0.9,
  reported: 0.7,
  critic: 0.55,
};

export const edgeKey = (e: Pick<Edge, 'source' | 'target'>) => `${e.source}>${e.target}`;

/** Whether an entry gives the reader somewhere to go. */
export const hasProof = (s: EdgeSource | undefined) =>
  !!s && (s.verdict === 'ok' || s.verdict === 'fixed' || s.verdict === 'print') && !!(s.url || s.print);

/** The edges with each one's proof merged on. Only proven entries change an
 *  edge: a `not-found` or `decide` entry leaves it exactly as it was. */
export function applyEdgeSources(edges: Edge[], sources: EdgeSources): Edge[] {
  return edges.map(e => {
    const s = sources[edgeKey(e)];
    if (!hasProof(s)) return s?.reworded ? { ...e, citation: s.reworded } : e;
    return {
      ...e,
      ...(s!.citation ? { citation: s!.citation } : {}),
      ...(s!.sourceTier ? { sourceTier: s!.sourceTier, confidence: Math.min(e.confidence, TIER_CONFIDENCE_CAP[s!.sourceTier]) } : {}),
      ...(s!.url ? { sourceUrl: s!.url } : {}),
      ...(s!.print ? { sourcePrint: s!.print } : {}),
    };
  });
}

/** Problems with the ledger itself: entries for links that don't exist, and
 *  entries missing what their verdict needs. Empty when it's sound. */
export function ledgerProblems(edges: Pick<Edge, 'source' | 'target'>[], sources: EdgeSources): string[] {
  const keys = new Set(edges.map(edgeKey));
  const out: string[] = [];
  for (const [k, s] of Object.entries(sources)) {
    if (!keys.has(k)) out.push(`${k}: no such link`);
    if ((s.verdict === 'ok' || s.verdict === 'fixed') && (!s.url || !s.found)) out.push(`${k}: ${s.verdict} needs url and found`);
    if (s.verdict === 'print' && !s.print) out.push(`${k}: print needs print`);
    if ((s.verdict === 'not-found' || s.verdict === 'decide' || s.verdict === 'blocked') && !s.note) out.push(`${k}: ${s.verdict} needs a note`);
    if (s.verdict === 'blocked' && !s.url) out.push(`${k}: blocked needs the url to open`);
    if (s.verdict === 'fixed' && !s.citation && !s.sourceTier) out.push(`${k}: fixed but nothing changed`);
    if (s.reworded && hasProof(s)) out.push(`${k}: reworded is only for unsourced links; use citation`);
    if (s.url && !/^https?:\/\//.test(s.url)) out.push(`${k}: url is not a web address`);
    if (s.url && /grokipedia/i.test(s.url)) out.push(`${k}: Grokipedia is never a source`);
    if (s.url && /r\.jina\.ai/.test(s.url)) out.push(`${k}: record the page itself, not the proxy`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked)) out.push(`${k}: checked must be YYYY-MM-DD`);
  }
  return out;
}
