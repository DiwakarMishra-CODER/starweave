import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { resolveSceneTimelineScenes, computeAxis } from '@/lib/scenes-timeline';
import ScenesTimeline from '@/components/scenes/ScenesTimeline';
import ArtistBackground from '@/components/artist/ArtistBackground';

// Derived, not hand-written. Both the count and the axis range used to be
// spelled out here ("Twelve … 1976 to 2020") and both silently went stale the
// moment a scene was added or removed — the axis in particular is computed
// from the scenes' own year range, so adding one early scene moves it.
const COUNT_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
];
const spellCount = (n: number) => COUNT_WORDS[n] ?? String(n);

export const metadata: Metadata = {
  title: 'Scenes — Starweave',
  description: 'Real-world music scenes in the Starweave influence graph, placed on a shared timeline.',
};

export default function ScenesIndexPage() {
  const graphData = loadGraphData();
  const scenes = resolveSceneTimelineScenes(graphData);
  const { axisStart, axisEnd } = computeAxis(scenes);

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
            {spellCount(scenes.length)} real times and places on one shared axis, {axisStart} to{' '}
            {axisEnd} — bar height by how many artists were part of each. Hover a bar for the full
            roster, click to open it.
          </p>
        </header>

        <ScenesTimeline scenes={scenes} />
      </div>
    </div>
  );
}
