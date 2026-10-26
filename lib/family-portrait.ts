import type { Artist, Edge, GraphData } from '@/data/types';
import { compareEdgesByEvidence, resolveCitationStatus } from '@/data/types';
import { hopEvidence } from '@/lib/graph-utils';

// An artist's family as a group photo (the artist page's first screen,
// components/artist/FamilyPhoto): who shaped them stand in the back row, who
// they shaped in front. The stronger the proof, the bigger the face and the
// nearer the middle it stands -- said it themselves, then reported, then a
// critic's view or widely accepted without a source. Influences someone has
// publicly denied stay out of the photo ("Not in the photo").

/** How strong the proof is: said it themselves, reported, or anything less. */
export type Proof = 'said' | 'reported' | 'other';

export interface Member {
  id: string;
  name: string;
  imageUrl: string | null;
  previewUrl: string | null;
  previewTrack: string | null;
  activeFrom: number | null;
  proof: Proof;
  /** 0 for the strongest proof on their side of the photo, then 1, 2… */
  rank: number;
  /** Who said it, in words: "Radiohead said so themselves". */
  tier: string;
  /** The source, ready to read; null for a widely accepted, unsourced link. */
  citation: string | null;
  /** Where it can be read (or the book it's in), once the source pass has checked it. */
  sourceUrl: string | null;
  sourcePrint: string | null;
}

export interface Denial {
  id: string;
  name: string;
  citation: string;
  contested: boolean;
}

export interface Portrait {
  /** Who shaped them, in lines; [0] stands nearest the artist. Each line
   *  runs left to right as they stand. */
  back: Member[][];
  /** Who they shaped (the strongest `frontLimit` only), in lines the same way. */
  front: Member[][];
  /** Everyone else they shaped, strongest first: named in the caption. */
  frontMore: Member[];
  /** Influences they've denied. */
  deniedBack: Denial[];
  /** Artists who've denied being shaped by them. */
  deniedFront: Denial[];
}

export function proofOf(edge: Pick<Edge, 'citation' | 'citationStatus' | 'sourceTier'>): Proof {
  const tier = hopEvidence(edge);
  return tier === 'first-person' ? 'said' : tier === 'reported' ? 'reported' : 'other';
}

function tierWords(edge: Edge, speaker: string): string {
  const tier = hopEvidence(edge);
  if (tier === 'first-person') return `${speaker} said so themselves`;
  if (tier === 'reported') return 'Reported in the press';
  if (tier === 'critic') return "A critic's view";
  return 'Widely accepted; no source on record';
}

/** Strongest in the middle, the rest alternating outward to either side. */
export function standInRow<T>(strongestFirst: T[]): T[] {
  const row: T[] = [];
  strongestFirst.forEach((m, i) => (i % 2 === 0 ? row.push(m) : row.unshift(m)));
  return row;
}

/** A big row in balanced lines of at most `perLine`: the strongest line
 *  first (it stands nearest the artist), each line strongest in the middle. */
export function standInLines<T>(strongestFirst: T[], perLine: number): T[][] {
  const count = Math.ceil(strongestFirst.length / perLine);
  const lines: T[][] = [];
  let from = 0;
  for (let i = 0; i < count; i++) {
    const size = Math.ceil((strongestFirst.length - from) / (count - i));
    lines.push(standInRow(strongestFirst.slice(from, from + size)));
    from += size;
  }
  return lines;
}

export function buildPortrait(
  data: Pick<GraphData, 'artists' | 'edges' | 'rejectedEdges'>,
  artistId: string,
  { frontLimit = 12, perLine = 8 }: { frontLimit?: number; perLine?: number } = {},
): Portrait {
  const byId = new Map(data.artists.map(a => [a.id, a]));

  const members = (side: 'back' | 'front'): Member[] =>
    data.edges
      .filter(e => e.type === 'influence' && (side === 'back' ? e.source === artistId : e.target === artistId))
      .sort(compareEdgesByEvidence)
      .flatMap((edge): Member[] => {
        const other: Artist | undefined = byId.get(side === 'back' ? edge.target : edge.source);
        const speaker = byId.get(edge.source)?.name ?? 'They';
        if (!other) return [];
        return [{
          id: other.id,
          name: other.name,
          imageUrl: other.imageUrl ?? null,
          previewUrl: other.previewUrl ?? null,
          previewTrack: other.previewTrack ?? null,
          activeFrom: other.activeFrom ?? null,
          proof: proofOf(edge),
          rank: 0,
          tier: tierWords(edge, speaker),
          citation: resolveCitationStatus(edge) === 'cited' ? edge.citation ?? null : null,
          sourceUrl: edge.sourceUrl ?? null,
          sourcePrint: edge.sourcePrint ?? null,
        }];
      })
      .map((m, rank) => ({ ...m, rank }));

  const denials = (side: 'back' | 'front'): Denial[] =>
    data.rejectedEdges
      .filter(r => (side === 'back' ? r.source === artistId : r.target === artistId))
      .flatMap(r => {
        const other = byId.get(side === 'back' ? r.target : r.source);
        return other ? [{ id: other.id, name: other.name, citation: r.citation, contested: r.strength === 'contested' }] : [];
      });

  const after = members('front');
  return {
    back: standInLines(members('back'), perLine),
    front: standInLines(after.slice(0, frontLimit), perLine),
    frontMore: after.slice(frontLimit),
    deniedBack: denials('back'),
    deniedFront: denials('front'),
  };
}

/** Play the family's running order: back row oldest first, the artist, then the front row. */
export function familyRunningOrder<T extends { id: string; activeFrom: number | null }>(back: T[], artist: T, front: T[]): T[] {
  const byYear = (a: T, b: T) => (a.activeFrom ?? 0) - (b.activeFrom ?? 0);
  // Two artists who shaped each other stand in both rows; they play once,
  // with who shaped them.
  const behind = new Set(back.map(m => m.id));
  return [...[...back].sort(byYear), artist, ...front.filter(m => !behind.has(m.id)).sort(byYear)];
}

const INTRO_MIN = 40;   // shorter than this is a name ending in "!" ("Neu!"), not a sentence
const INTRO_LONG = 200; // longer than this gets cut at its first clause break
const CLAUSE_BREAK = /:\s| — /;

/** The bio's first sentence, for the one-line intro under their name. "R.E.M."
 *  and "Neu!" don't end it; a long one is cut at its first colon or dash
 *  (with "…" -- the whole story follows further down the page). */
export function introLine(text: string): string {
  const para = text.split('\n\n')[0].trim();
  let line = '';
  for (const { segment } of new Intl.Segmenter('en', { granularity: 'sentence' }).segment(para)) {
    line += segment;
    if (line.trim().length >= INTRO_MIN) break;
  }
  line = line.trim();
  if (line.length > INTRO_LONG) {
    const at = line.slice(INTRO_MIN).search(CLAUSE_BREAK);
    if (at >= 0) line = `${line.slice(0, INTRO_MIN + at).replace(/[,;]$/, '')}…`;
  }
  return line;
}
