import type { Metadata } from 'next';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { resolveScenes, buildLightbox, historyQueue } from '@/lib/scenes-lightbox';
import Lightbox from '@/components/scenes/Lightbox';
import PlayHistory from '@/components/scenes/PlayHistory';
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

  return (
    <div className="scenes-overlay">
      <div className="scenes-page" role="region" aria-labelledby="scenes-title">
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

        <section className="scenes-log" aria-labelledby="scenes-log-title">
          <h2 id="scenes-log-title" className="scenes-log__title">The log</h2>
          <ol className="scenes-log__list">
            {scenes.map(s => (
              <li key={s.id} className="scenes-log__item">
                <span className="scenes-log__when">{s.era}</span>
                <span>
                  <Link
                    href={`/scene/${s.id}`}
                    className="scenes-log__name"
                    style={{ '--row-color': s.color } as React.CSSProperties}
                  >
                    {s.name}
                  </Link>
                </span>
                <span className="scenes-log__who">
                  <span>{s.city}</span> &middot; <span>{s.members.map(m => m.name).join(', ')}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
