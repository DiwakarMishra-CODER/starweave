import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { buildLineup } from '@/lib/browse-lineup';
import BrowseClient from '@/components/browse/BrowseClient';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Browse — Starweave',
  description: 'Every artist on the Starweave map as one festival bill, billed by how many artists on the map name them as an influence.',
};

// The bill is built here, on the server, so the page stays crawlable and
// the client gets only what the poster draws and filters on -- no bios,
// album write-ups or citations. See lib/browse-lineup.
export default function BrowsePage() {
  const data = loadGraphData();
  const lineup = buildLineup(data);
  const genres = data.genres.map(g => ({ id: g.id, name: g.name }));
  const scenes = data.scenes.map(s => ({ id: s.id, name: s.name, memberIds: s.memberIds }));
  const lastYear = new Date().getFullYear();

  return (
    <div className="browse-overlay">
      <div className="browse-page" role="region" aria-labelledby="browse-title">
        <article className="lineup-poster">
          <header className="lineup-poster__head">
            <p className="lineup-poster__presents">Starweave presents</p>
            <h1 id="browse-title" className="lineup-poster__title">Every artist on the map</h1>
            <p className="lineup-poster__dates">
              <span>{lineup.first} &mdash; {lastYear}</span>
              <span aria-hidden> &middot; </span>
              <span>{lineup.artists.length} artists</span>
              <span aria-hidden> &middot; </span>
              <span>{lineup.links.toLocaleString('en-GB')} influence links</span>
            </p>
          </header>
          <BrowseClient lineup={lineup} genres={genres} scenes={scenes} />
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}
