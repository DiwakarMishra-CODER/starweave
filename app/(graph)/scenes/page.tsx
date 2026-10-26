import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { resolveScenes, buildLightbox, historyQueue } from '@/lib/scenes-lightbox';
import Lightbox from '@/components/scenes/Lightbox';
import PlayHistory from '@/components/scenes/PlayHistory';
import Desk from '@/components/scenes/Desk';
import Prints, { type HungPrint } from '@/components/scenes/Prints';
import Binder from '@/components/scenes/Binder';
import SiteFooter from '@/components/layout/SiteFooter';

// The count and the first year are read from the data, never written out:
// both went stale by hand before, every time a scene was added.
const COUNT_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
];
const spellCount = (n: number) => COUNT_WORDS[n] ?? String(n);

export const metadata: Metadata = {
  title: 'Scenes — Starweave',
  description: 'The places where the music happened: every scene on the map as a strip of film on a lightbox, as long as it lasted, one frame per band.',
};

export default function ScenesIndexPage() {
  const scenes = resolveScenes(loadGraphData());
  const layout = buildLightbox(scenes);
  // The prints drying under the lightbox: the band "Play the history" plays
  // from each room (historyQueue's pick), so the one on air is the one that swings.
  const prints: HungPrint[] = scenes.flatMap(s => {
    const m = s.members.find(x => x.id === s.starId && x.previewUrl) ?? s.members.find(x => x.previewUrl);
    return m?.imageUrl ? [{ sceneId: s.id, sceneName: s.name, era: s.era, bandId: m.id, bandName: m.name, imageUrl: m.imageUrl }] : [];
  });
  const stray = [scenes[0], scenes[scenes.length - 1]].flatMap(s => s?.members.find(m => m.imageUrl)?.imageUrl ?? []).map(imageUrl => ({ imageUrl }));

  return (
    <div className="scenes-overlay">
      <div className="scenes-page" role="region" aria-labelledby="scenes-title">
        <Desk prints={stray} at="lightbox" />
        <header className="scenes-head">
          <h1 id="scenes-title" className="scenes-head__title">Scenes</h1>
          <p className="scenes-head__key">
            <span>{spellCount(scenes.length)} scenes: the places where the music happened, {layout.axisStart} to now.</span>
            {/* The how-to-read lives on the key card taped to the sheet; only
                if there's no room for it does it go up here instead. */}
            {!layout.keySpot && (
              <>
                {' '}<span>Each strip of film is one scene, one frame per band; the pencil line beside its name runs as long as it lasted.</span>{' '}
                <span>Point at a frame for a closer look; click to open the scene.</span>
              </>
            )}
          </p>
          <PlayHistory history={historyQueue(scenes)} />
        </header>

        <Lightbox layout={layout} />

        <Prints prints={prints} />
        <Binder scenes={scenes} />
      </div>
      <SiteFooter />
    </div>
  );
}
