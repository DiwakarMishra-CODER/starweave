// Every image host this graph uses resizes by URL, so one stored URL can be
// served at any size. public/graph.json keeps artist photos at 250px — the
// canvas draws ~300 of them, and 250 is plenty for a node — while the pages
// ask for what they actually render: a 240px hero on a 2x screen needs 500,
// a full-width phone card needs 1000. Before this, every surface got the
// 250px file, stretched.
//
// Each host has a ceiling (what its source files actually hold); asking past
// it returns the same pixels at a bigger download, so sizes are clamped.
//
//   Deezer photos    …/250x250-000000-80-0-0.jpg   up to 1000
//   Apple (mzstatic) …/600x600bb.jpg, …/250x250cc.jpg   up to 1200
//   Cover Art Archive …-500.jpg   250 / 500 / 1200 exist — but see below
//
// Anything else is returned unchanged.
//
// The Cover Art Archive answers through two redirects into archive.org: 4–8s
// per cover, and intermittent 500s on any size, including the 500px files
// the site has always used (measured Oct 2026, ~60 covers affected). So its
// covers go through Next's image optimiser instead (images.remotePatterns in
// next.config.ts): fetched once, kept at the edge for a month, served
// resized. The optimiser only accepts its own list of widths.

const DEEZER = /\/(\d+)x\d+-000000-80-0-0\.jpg$/;
const MZSTATIC = /\/(\d+)x\d+(bb|cc)\.(jpg|png|webp)$/;
const CAA = /^https:\/\/coverartarchive\.org\/.*-(250|500|1200)\.jpg$/;
const OPTIMIZER_WIDTHS = [256, 384, 640, 750, 828, 1080, 1200];

function viaOptimizer(caaUrl: string, px: number): string {
  const w = OPTIMIZER_WIDTHS.find(n => n >= px) ?? OPTIMIZER_WIDTHS[OPTIMIZER_WIDTHS.length - 1];
  // The 500px file for anything up to 640 — it's the one that has always
  // been served — and 1200 only where the extra pixels show.
  const source = caaUrl.replace(/-(250|500|1200)\.jpg$/, w <= 640 ? '-500.jpg' : '-1200.jpg');
  return `/_next/image?url=${encodeURIComponent(source)}&w=${w}&q=75`;
}

export function sizedImageUrl(url: string, px: number): string {
  if (DEEZER.test(url)) {
    const s = Math.min(px, 1000);
    return url.replace(DEEZER, `/${s}x${s}-000000-80-0-0.jpg`);
  }
  if (MZSTATIC.test(url)) {
    const s = Math.min(px, 1200);
    return url.replace(MZSTATIC, `/${s}x${s}$2.jpg`);
  }
  if (CAA.test(url)) return viaOptimizer(url, px);
  return url;
}

// A srcSet for <img>, so the browser picks by rendered size and pixel
// density. Pair it with a `sizes` that describes the layout. Undefined for a
// host that can't resize, which makes the <img> fall back to its plain src.
export function imageSrcSet(url: string, widths: number[] = [250, 500, 1000]): string | undefined {
  if (!DEEZER.test(url) && !MZSTATIC.test(url) && !CAA.test(url)) return undefined;
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const w of widths) {
    const u = sizedImageUrl(url, w);
    if (seen.has(u)) continue; // clamped to the same file as a smaller width
    seen.add(u);
    parts.push(`${u} ${w}w`);
  }
  return parts.join(', ');
}
