import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import BrowseClient, { type ConnectionCounts } from '@/components/browse/BrowseClient';
import ArtistBackground from '@/components/artist/ArtistBackground';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Browse — Starweave',
  description: 'Browse and search all artists in the Starweave influence graph.',
};

export default function BrowsePage() {
  const data = loadGraphData();

  // Slimmed server-side rather than shipping the full artists/genres/scenes/
  // edges arrays into BrowseClient's props -- this page stays server-rendered
  // (and crawlable) for SEO, but the RSC payload only needs to carry what the
  // grid actually renders/filters/sorts on, not bios, album write-ups, full
  // genre/scene prose, or 1,053 edges' worth of citations. See BrowseClient's
  // BrowseArtist/BrowseGenre/BrowseScene/ConnectionCounts types.
  const artists = data.artists.map(a => ({
    id: a.id,
    name: a.name,
    imageUrl: a.imageUrl,
    genres: a.genres,
    activeFrom: a.activeFrom,
    influenceScore: a.influenceScore,
    layer: a.layer,
    realm: a.realm,
    lineage: a.lineage,
  }));
  const genres = data.genres.map(g => ({ id: g.id, name: g.name }));
  const scenes = data.scenes.map(s => ({ id: s.id, name: s.name, memberIds: s.memberIds }));

  // One pass over the full edge set here instead of inside the client bundle
  // -- roots = who shaped them (outgoing), descendants = who they shaped
  // (incoming), same split the artist pages label with those words. A plain
  // object rather than a Map: Maps don't serialize across the Server/Client
  // Component boundary, plain objects do.
  const connectionCounts: ConnectionCounts = {};
  const bump = (id: string, key: 'roots' | 'descendants') => {
    const cur = connectionCounts[id] ?? { roots: 0, descendants: 0 };
    cur[key] += 1;
    connectionCounts[id] = cur;
  };
  for (const e of data.edges) {
    if (e.type !== 'influence') continue;
    bump(e.source, 'roots');
    bump(e.target, 'descendants');
  }

  return (
    <div className="browse-overlay">
      {/* Canvas and scrim are siblings of browse-page, not children.
          This keeps them in browse-overlay's stacking context at z:1/2,
          so browse-page at z:3 correctly renders above them. */}
      <ArtistBackground layerColor="#8891F2" />
      <div className="artist-bg-scrim" aria-hidden />

      <div className="browse-page">
        <header className="browse-page__header">
          <h1 className="browse-page__title">Browse artists</h1>
          <p className="browse-page__subtitle">
            {data.artists.length} artists, {data.edges.length.toLocaleString()} documented influences
          </p>
        </header>

        <BrowseClient artists={artists} genres={genres} scenes={scenes} connectionCounts={connectionCounts} />
      </div>
      <SiteFooter />
    </div>
  );
}
