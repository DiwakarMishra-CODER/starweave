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
// sensitivity: 'variant' keeps case and accents significant at the lowest
// level, which leaves lowercase-styled names (toe, yeule) in their alphabetical
// position instead of exiling them to the end.
const nameCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'variant' });

/** Locale-stable comparison for display names. Use instead of localeCompare. */
export function compareNames(a: string, b: string): number {
  return nameCollator.compare(a, b);
}
