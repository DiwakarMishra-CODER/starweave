import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadGraphData } from '@/lib/graph-data';
import { resolveScenePage } from '@/lib/scene-page';
import SceneTable from '@/components/scenes/SceneTable';
import RoomToRoom from '@/components/scenes/RoomToRoom';
import SceneCircle from '@/components/scenes/SceneCircle';
import SceneStep from '@/components/scenes/SceneStep';
import Desk from '@/components/scenes/Desk';
import Reveal from '@/components/ui/Reveal';
import SiteFooter from '@/components/layout/SiteFooter';

interface Props {
  params: Promise<{ scene: string }>;
}

export function generateStaticParams() {
  const data = loadGraphData();
  return data.scenes.map(s => ({ scene: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scene } = await params;
  const data = loadGraphData();
  const s = data.scenes.find(x => x.id === scene);
  if (!s) return {};
  return { title: `${s.name} — Starweave`, description: s.blurb };
}

// A scene's page: its strip lifted off the lightbox (/scenes) and laid under
// the loupe, then the room itself, the links to other rooms, and everyone
// on the map who learned from it or taught it. Scenes are a minor axis (two
// to seven bands, a few years, one room), so the page stays short. The data
// is lib/scene-page.ts; the moves are described in SceneTable.
export default async function ScenePage({ params }: Props) {
  const { scene: id } = await params;
  const page = resolveScenePage(loadGraphData(), id);
  if (!page) notFound();
  const { scene } = page;
  const from = { start: scene.yearStart, end: scene.yearEnd, open: scene.isOpenEnded };

  return (
    <div className="scenes-overlay scene-overlay" style={{ '--ink': scene.ink, '--color': scene.color } as React.CSSProperties}>
      <div className="scene-page">
        <Desk prints={scene.members.flatMap(m => (m.imageUrl ? [{ imageUrl: m.imageUrl }] : [])).slice(-2)} at="table" />
        <SceneTable
          scene={scene}
          place={page.place}
          bands={page.bands}
          frameW={page.frameW}
          frameH={page.frameH}
          filmW={page.filmW}
          prev={page.prev}
          next={page.next}
          queue={page.queue}
        />

        <Reveal className="scene-room" aria-labelledby="scene-room-title">
          <h2 id="scene-room-title" className="scene-section__title">The room</h2>
          <div className="scene-room__cards" data-count={page.placeAndTime.length}>
            {page.placeAndTime.map((p, i) => (
              <div key={i} className="room-card" style={{ '--i': i } as React.CSSProperties}>
                <span className="room-card__tape room-card__tape--l" aria-hidden />
                <span className="room-card__tape room-card__tape--r" aria-hidden />
                {i === 0 && <p className="room-card__title">{page.place} &middot; {scene.era}</p>}
                <p className="room-card__text">{p}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="rooms" aria-labelledby="rooms-title">
          <h2 id="rooms-title" className="scene-section__title">Room to room</h2>
          <p className="rooms__summary">{page.linkSummary}</p>
          <p className="rooms__key">
            <span className="rooms__key-out">Red: who a band here shaped</span>
            <span className="rooms__key-in">Blue: who a band here learned from</span>
            <span className="rooms__key-how">Point at a band to see only its links; click a scene to go there.</span>
          </p>
          <RoomToRoom sheet={page.sheet} sceneId={scene.id} links={page.links} />
        </Reveal>

        <Reveal className="scene-after" aria-labelledby="scene-after-title">
          <h2 id="scene-after-title" className="scene-section__title">What came out of it</h2>
          <p className="scene-after__text">{page.legacy}</p>
          <SceneCircle
            learnedFrom={page.learnedFrom}
            passedTo={page.passedTo}
            learnedFromEmpty={page.learnedFromEmpty}
            passedToEmpty={page.passedToEmpty}
          />
        </Reveal>

        <Reveal as="nav" className="scene-end" aria-label="More scenes">
          {page.prev ? <SceneStep step={page.prev} dir="prev" from={from} big /> : <span />}
          <Link href={`/?scene=${scene.id}`} className="scene-end__map">See this scene on the map &rarr;</Link>
          {page.next ? <SceneStep step={page.next} dir="next" from={from} big /> : <span />}
        </Reveal>
      </div>
      <SiteFooter />
    </div>
  );
}
