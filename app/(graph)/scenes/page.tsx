import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { resolveSceneTimelineScenes } from '@/lib/scenes-timeline';
import ScenesTimeline from '@/components/scenes/ScenesTimeline';
import ArtistBackground from '@/components/artist/ArtistBackground';

export const metadata: Metadata = {
  title: 'Scenes — Starweave',
  description: 'Twelve real-world music scenes in the Starweave influence graph, placed on a shared timeline.',
};

export default function ScenesIndexPage() {
  const graphData = loadGraphData();
  const scenes = resolveSceneTimelineScenes(graphData);

  return (
    <div className="scenes-overlay">
      {/* Canvas and scrim are siblings of scenes-page, not children — same
          stacking pattern as the genres/browse/genre/artist pages. */}
      <ArtistBackground layerColor="#8891F2" />
      <div className="artist-bg-scrim" aria-hidden />

      <div className="scenes-page">
        <header className="scenes-page__header">
          <h1 className="scenes-page__title">Scenes</h1>
          <p className="scenes-page__deck">
            Twelve real times and places on one shared axis, 1976 to 2020 — bar height by how many
            artists were part of each. Hover a bar for the full roster, click to open it.
          </p>
        </header>

        <ScenesTimeline scenes={scenes} />
      </div>
    </div>
  );
}
