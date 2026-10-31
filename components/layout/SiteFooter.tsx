import { statSync } from 'fs';
import { resolve } from 'path';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { resolveCitationStatus } from '@/data/types';
import { buildGenreSession } from '@/lib/genre-session';
import { readableInk } from '@/lib/colors';
import { sizedImageUrl } from '@/lib/image-url';
import { GENRE_PAGES } from '@/data/genre-pages';
import GenreSticker, { type StickerGenre } from './GenreSticker';

// The footer on every content page (not the map, which is all canvas): a
// full-width band at the very bottom, in small print, on the lid of a band's
// flight case (owner, Oct 2026: the plain band read as bland, and a zine
// sheet in its place no longer read as a footer). Credits -- who compiled it
// and where to find them, when the map was last updated as a rubber stamp;
// sources -- the map's one big claim, that its links have named sources,
// in plain words (the count is the sticker's, said once), and where the pictures and the previews come from;
// and the site's pages as a setlist taped to the lid. Stickers on the case's
// top edge: on the left, by the credits, the compiler's two favourite records
// (their own words, on the Mixtape page); on the right, the count of sourced
// links, a genre (a different one each visit) and an ask for missing links.
// Along the bottom, a way to say a link is wrong, and a barcode.
//
// Every number is read from the map itself, and "last updated" is when the
// map's data was last built, so none of it can go stale.

const PORTFOLIO = 'https://diwakar-mishra-portfolio.vercel.app/';
const GITHUB = 'https://github.com/DiwakarMishra-CODER';
const LINKEDIN = 'https://www.linkedin.com/in/diwakar-mishra-dev';
const REPO = 'https://github.com/DiwakarMishra-CODER/starweave';

// The two favourite bands, and their records, from data/about.ts ("Cocteau
// Twins and My Bloody Valentine are the two I always come back to"; "I can't
// choose between Heaven or Las Vegas and Loveless"): each band's major album.
const FAVOURITES = ['cocteau-twins', 'my-bloody-valentine'];

const TRACKS: { label: string; href: string }[] = [
  { label: 'The map', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Genres', href: '/genres' },
  { label: 'Scenes', href: '/scenes' },
  { label: 'How it works', href: '/?tour' },
  { label: 'Mixtape', href: '/about' },
];

// Every genre with a feature page, in its family's colour, for the sticker.
function stickerGenres(data: ReturnType<typeof loadGraphData>): StickerGenre[] {
  const session = buildGenreSession(data);
  const colour = new Map(session.families.map(f => [f.id, f.color]));
  return session.clips
    .filter(c => GENRE_PAGES[c.id])
    .map(c => {
      const color = colour.get(c.familyId)!;
      return { id: c.id, name: c.name, color, ink: readableInk('#1c1724', color) };
    });
}

function pressed(): string | null {
  try {
    const at = statSync(resolve(process.cwd(), 'public', 'graph.json')).mtime;
    return at.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function SiteFooter() {
  const data = loadGraphData();
  const links = data.edges.filter(e => e.type === 'influence');
  const cited = links.filter(e => resolveCitationStatus(e) === 'cited').length;
  const commons = data.artists.filter(a => a.imageCredit).length;
  const when = pressed();
  const year = new Date().getFullYear();
  const n = (x: number) => x.toLocaleString('en-GB');
  const favourites = FAVOURITES.flatMap(id => {
    const artist = data.artists.find(a => a.id === id);
    const album = artist?.classicAlbums?.[0];
    return artist && album?.imageUrl ? [{ id, name: artist.name, title: album.title, cover: album.imageUrl }] : [];
  });

  return (
    <footer className="site-foot">
      <span className="site-foot__corner site-foot__corner--left" aria-hidden />
      <span className="site-foot__corner site-foot__corner--right" aria-hidden />
      <div className="site-foot__inner">
      <div className="site-foot__stickers">
        {favourites.map(f => (
          <Link key={f.id} href={`/artist/${f.id}`} className="site-foot__sticker site-foot__sticker--cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sizedImageUrl(f.cover, 160)} alt={`${f.title}, ${f.name}`} loading="lazy" />
          </Link>
        ))}
        <p className="site-foot__sticker site-foot__sticker--hype">
          <b>{n(links.length)}</b> links
          <span>{cited === links.length ? 'Every one sourced' : `${n(cited)} sourced`}</span>
        </p>
        <GenreSticker genres={stickerGenres(data)} />
        <a
          className="site-foot__sticker site-foot__sticker--ask"
          href={`${REPO}/issues/new?title=${encodeURIComponent('Missing link: ')}`}
          target="_blank"
          rel="noreferrer"
        >
          Know a missing link? &rarr;
        </a>
      </div>
      <div className="site-foot__card">
        <section className="site-foot__col" aria-labelledby="site-foot-credits">
          <h2 id="site-foot-credits" className="site-foot__head">Credits</h2>
          <p className="site-foot__lead">
            Compiled by <a href={PORTFOLIO} target="_blank" rel="noreferrer">Diwakar Mishra</a>
          </p>
          <p className="site-foot__links">
            <a href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
            <span aria-hidden> &middot; </span>
            <a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a>
            <span aria-hidden> &middot; </span>
            <a href={REPO} target="_blank" rel="noreferrer">The code</a>
          </p>
          <p className="site-foot__stamp">
            {when && <span>Last updated {when}</span>}
            <span>{n(data.artists.length)} artists</span>
          </p>
        </section>

        <nav className="site-foot__col" aria-labelledby="site-foot-tracks">
          <h2 id="site-foot-tracks" className="site-foot__head">Set list</h2>
          <div className="site-foot__setlist">
            <ol className="site-foot__tracks">
              {TRACKS.map(t => (
                <li key={t.href}>
                  <Link href={t.href}>{t.label}</Link>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <section className="site-foot__col" aria-labelledby="site-foot-sources">
          <h2 id="site-foot-sources" className="site-foot__head">Sources</h2>
          {/* The count is on the sticker above; this says what a source is. */}
          <p className="site-foot__lead">
            {cited === links.length ? 'Every link' : `${n(cited)} of ${n(links.length)} links`} names where it comes from: an
            interview, a review or a book.
          </p>
          <p className="site-foot__small">
            Photos: Deezer and Apple Music, and {commons} from Wikimedia Commons, credited where they appear.
            Covers: Apple Music and the Cover Art Archive. Song previews: Apple Music.
          </p>
        </section>
      </div>

      <div className="site-foot__bottom">
        <a className="site-foot__report" href={`${REPO}/issues/new`} target="_blank" rel="noreferrer">
          Spotted a wrong link? Tell us &rarr;
        </a>
        <span className="site-foot__copy">&copy; {year} Diwakar Mishra</span>
        <svg className="site-foot__barcode" width="64" height="26" aria-hidden>
          {[...String(data.artists.length).padStart(6, '0') + String(links.length).padStart(4, '0') + String(cited).padStart(4, '0')].flatMap((d, i) => {
            const n = Number(d);
            return [0, 1].map(k => (
              <rect key={`${i}:${k}`} x={1 + i * 4.4 + k * 2.1} y="0" width={((n + k * 3) % 3) * 0.5 + 0.7} height="20" />
            ))
          })}
        </svg>
      </div>
      </div>
    </footer>
  );
}
