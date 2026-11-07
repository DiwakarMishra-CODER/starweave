// A source link that opens on its sentence, highlighted. Browsers that
// support text fragments (Chrome, Edge, Safari, recent Firefox) scroll to
// `#:~:text=start,end` and mark it; any other browser, or a page whose
// wording has since changed, just opens the page as before, so it can't
// break a link. The sentence is the one the source pass read on that page
// (`found` in data/edge-sources.json).
//
// It matches on the first and last few words rather than the whole
// sentence: a long sentence is more likely to differ somewhere in the middle
// (a footnote mark, a line break, a link) than at its two ends.

const EDGE_WORDS = 4;
// Pages where a text fragment can't work: video (YouTube links carry their
// own time instead) and PDFs.
const SKIP = /(?:youtube\.com|youtu\.be|vimeo\.com)|\.pdf(?:$|[?#])/i;

// Fragment directives treat these as syntax, so they must be escaped.
const enc = (s: string) => encodeURIComponent(s).replace(/-/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%26');

// The ends are trimmed of quotes and punctuation, since curly and straight
// marks are a common mismatch; inside them the page's own characters stay,
// since a fragment must match them exactly.
const trim = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}]+$/u, '');

export function highlightUrl(url: string, found: string | undefined): string {
  if (!found || url.includes('#') || SKIP.test(url)) return url;
  const words = found.trim().split(/\s+/);
  const text = words.length <= EDGE_WORDS * 2 + 1
    ? enc(trim(words.join(' ')))
    : `${enc(trim(words.slice(0, EDGE_WORDS).join(' ')))},${enc(trim(words.slice(-EDGE_WORDS).join(' ')))}`;
  return /text=(?:,|$)|,$/.test(`text=${text}`) ? url : `${url}#:~:text=${text}`;
}

/** The address a source link was built from, without its highlight. */
export const withoutHighlight = (url: string) => url.replace(/#:~:text=.*$/, '');
