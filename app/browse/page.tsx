import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import BrowseClient from '@/components/browse/BrowseClient';
import ArtistBackground from '@/components/artist/ArtistBackground';

export const metadata: Metadata = {
  title: 'Browse — Starweave',
  description: 'Browse and search all artists in the Starweave influence graph.',
};

export default function BrowsePage() {
  const data = loadGraphData();

  return (
    <>
      {/* Canvas and scrim are siblings of browse-page, not children.
          This keeps them in the root stacking context at z:1/2,
          so browse-page at z:3 correctly renders above them. */}
      <ArtistBackground layerColor="#8891F2" />
      <div className="artist-bg-scrim" aria-hidden />

      <div className="browse-page">
        <header className="browse-page__header">
          <h1 className="browse-page__title">Browse artists</h1>
          <p className="browse-page__subtitle">
            {data.artists.length} artists across {data.edges.length} influence edges
          </p>
        </header>

        <BrowseClient artists={data.artists} genres={data.genres} />
      </div>
    </>
  );
}
