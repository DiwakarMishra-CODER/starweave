import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import BrowseClient from '@/components/browse/BrowseClient';

export const metadata: Metadata = {
  title: 'Browse — Starweave',
  description: 'Browse and search all artists in the Starweave influence graph.',
};

export default function BrowsePage() {
  const data = loadGraphData();

  return (
    <div className="browse-page">
      <header className="browse-page__header">
        <h1 className="browse-page__title">Browse artists</h1>
        <p className="browse-page__subtitle">
          {data.artists.length} artists · {data.edges.length} influence edges · sorted by influence score
        </p>
      </header>

      <BrowseClient artists={data.artists} genres={data.genres} />
    </div>
  );
}
