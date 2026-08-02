// ISO 2-letter -> full English name (e.g. 'DE' -> 'Germany'). Artist.country
// stores the raw code, but a code like 'DE' isn't recognizable to most
// readers the way 'US'/'UK' are — spelling it out is legible with zero
// hand-maintained lookup table. Falls back to the raw code if the value
// isn't a real region (Intl.DisplayNames throws RangeError on those).
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}
