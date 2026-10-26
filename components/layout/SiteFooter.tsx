import { statSync } from 'fs';
import { resolve } from 'path';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { resolveCitationStatus } from '@/data/types';

// The footer on every content page (not the map, which is all canvas): a
// full-width band at the very bottom, set like the back of a record sleeve,
// in small print. Credits -- who compiled it and
// where to find them; sources -- the map's one big claim, that its links
// have named sources, with the real counts, and where the pictures and the
// previews come from; and the track list, the site's pages. Along the
// bottom, a way to say a link is wrong, and a barcode.
//
// Every number is read from the map itself, and "last pressed" is when the
// map's data was last built, so none of it can go stale.

const PORTFOLIO = 'https://diwakar-mishra-portfolio.vercel.app/';
const GITHUB = 'https://github.com/DiwakarMishra-CODER';
const LINKEDIN = 'https://www.linkedin.com/in/diwakar-mishra-dev';
const REPO = 'https://github.com/DiwakarMishra-CODER/starweave';

const TRACKS: { label: string; href: string }[] = [
  { label: 'The map', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Genres', href: '/genres' },
  { label: 'Scenes', href: '/scenes' },
  { label: 'How it works', href: '/?tour' },
  { label: 'Mixtape', href: '/about' },
];

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
  const catalogue = `SW-${data.artists.length}`;
  const year = new Date().getFullYear();

  return (
    <footer className="site-foot">
      <div className="site-foot__inner">
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
          <p className="site-foot__small">
            {when && <>Map last pressed {when} &middot; </>}Cat. no. {catalogue}
          </p>
        </section>

        <section className="site-foot__col" aria-labelledby="site-foot-sources">
          <h2 id="site-foot-sources" className="site-foot__head">Sources</h2>
          <p className="site-foot__lead">
            <b>{links.length.toLocaleString('en-GB')}</b> influence links, <b>{cited.toLocaleString('en-GB')}</b> with a named
            source: an interview, a review or a book.
          </p>
          <p className="site-foot__small">
            Photos: Deezer and Apple Music, and {commons} from Wikimedia Commons, credited where they appear.
            Covers: Apple Music and the Cover Art Archive. Song previews: Apple Music.
          </p>
        </section>

        <nav className="site-foot__col" aria-labelledby="site-foot-tracks">
          <h2 id="site-foot-tracks" className="site-foot__head">Track list</h2>
          <ol className="site-foot__tracks">
            {TRACKS.map((t, i) => (
              <li key={t.href}>
                <span className="site-foot__no" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                <Link href={t.href}>{t.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="site-foot__bottom">
        <a className="site-foot__report" href={`${REPO}/issues/new`} target="_blank" rel="noreferrer">
          Spotted a wrong link? Tell us &rarr;
        </a>
        <span className="site-foot__copy">&copy; {year} Diwakar Mishra</span>
        <svg className="site-foot__barcode" width="64" height="26" aria-hidden>
          {[...catalogue.replace(/\D/g, '').padStart(6, '0') + String(links.length).padStart(4, '0') + String(cited).padStart(4, '0')].flatMap((d, i) => {
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
