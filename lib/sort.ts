// Shared name collation.
//
// Every alphabetical list in this app used bare `a.name.localeCompare(b.name)`,
// which resolves against the BROWSER'S locale rather than a fixed one. That is
// not a stable sort across users: punctuation and symbol weighting differ
// between locales, so "!!!" (the band) and "...And You Will Know Us by the
// Trail of Dead" sort first for some visitors and last for others. It was
// reported as the symbol- and number-named artists sitting at the bottom of the
// path picker, and it could not be reproduced locally because Node resolved to
// a locale where they sort first.
//
// Pinning the locale is the fix. 'en' is correct here regardless of who is
// reading: the roster is romanised throughout, and the alternative -- a list
// whose order depends on the reader's browser settings -- is worse than a list
// that is consistently English-collated.
//
// numeric: true so "100 gecs" precedes "2814" rather than sorting as the
// strings "1..." and "2..." would coincidentally also do -- it matters for any
// future name where the digits run to different lengths (e.g. "2814" vs "99").
//
// ignorePunctuation: true so a name's punctuation does not decide its place.
// Without it "A.G. Cook" sorts ahead of "Adrianne Lenker", because the period
// outranks every letter -- which puts Cook first in the whole roster and
// separates him from where anyone would look for him. Ignoring punctuation
// collates him as "AG Cook", i.e. after "Ad...", which is where a reader
// scanning for him would actually check.
//
// Sensitivity is left at its 'variant' default, so case still matters at the
// lowest level and lowercase-styled names (toe, yeule) keep their alphabetical
// position instead of being exiled to the end.
const nameCollator = new Intl.Collator('en', { numeric: true, ignorePunctuation: true });

// Names that do not start with a letter sort to the END, not the start.
// Default collation puts "!!!", "...And You Will Know Us by the Trail of Dead",
// "100 gecs" and "2814" -- the only four in the roster -- above every A-name,
// so the first thing anyone scanning an alphabetical picker sees is four
// entries that are not alphabetised at all. Someone hunting for an artist
// reads A-Z; the punctuation and number cases are the tail, not the header.
//
// This has to stay a separate step rather than lean on the collator: with
// ignorePunctuation on, "!!!" collates as an empty string and would sort to
// the very front, which is the opposite of what is wanted.
function initialBucket(name: string): number {
  return /^\p{L}/u.test(name.trim()) ? 0 : 1;
}

/** Locale-stable comparison for display names. Use instead of localeCompare. */
export function compareNames(a: string, b: string): number {
  const bucketDiff = initialBucket(a) - initialBucket(b);
  return bucketDiff !== 0 ? bucketDiff : nameCollator.compare(a, b);
}
