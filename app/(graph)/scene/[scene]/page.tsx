import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { SCENE_COLORS, DEFAULT_SCENE_COLOR } from '@/lib/colors';
import ArtistBackground from '@/components/artist/ArtistBackground';
import ArtistCircleGrid from '@/components/artist/ArtistCircleGrid';
import AlbumGrid from '@/components/artist/AlbumGrid';
import IgniteGraphButton from '@/components/artist/IgniteGraphButton';

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
  return { title: `${s.name} — Starweave` };
}

// Scene pages reuse the genre page's design system — same .genre-page /
// .genre-albums-* structure and CSS custom property (--genre-color) — for
// visual coherence, while being structured as a chronological story (time +
// place) rather than a genre's definitional Origin/Pioneers/Modern shape.
export default async function ScenePage({ params }: Props) {
  const { scene } = await params;
  const data = loadGraphData();
  const sceneData = data.scenes.find(s => s.id === scene);
  if (!sceneData) notFound();

  const sceneColor = SCENE_COLORS[scene] ?? DEFAULT_SCENE_COLOR;

  const members = sceneData.memberIds
    .map(id => data.artists.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  // "See the scene in the graph" highlights every member artist as a cluster.
  const graphHref = `/?scene=${scene}`;
  const graphLabel = `See the ${sceneData.name} constellation ignite`;

  // One classic album per member artist, sorted chronologically.
  const records = members
    .filter(a => a.classicAlbums && a.classicAlbums.length > 0)
    .map(a => ({ artist: a, album: a.classicAlbums![0] }))
    .sort((a, b) => (a.album.year ?? 0) - (b.album.year ?? 0));

  const [circuit, bands, breakthrough] = sceneData.sections;

  return (
    <div
      className="genre-overlay"
      style={{ '--genre-color': sceneColor, '--layer-color': sceneColor } as React.CSSProperties}
    >
      <ArtistBackground layerColor={sceneColor} boost={1.1} className="scene-bg" />
      <div className="artist-bg-scrim" aria-hidden />

      {/* Hero + first narrative beat — 700px reading width */}
      <article className="genre-page">
        <header className="genre-page__header">
          <p className="genre-page__super">Scene</p>
          <h1 className="genre-page__title">{sceneData.name}</h1>
          <div className="scene-page__stamp">
            <span className="scene-page__stamp-place">{sceneData.place}</span>
            <span className="scene-page__stamp-sep" aria-hidden>·</span>
            <span className="scene-page__stamp-era">{sceneData.era}</span>
          </div>
          <p className="genre-page__deck">{sceneData.deck}</p>
          <IgniteGraphButton href={graphHref} label={graphLabel} />
        </header>

        {circuit && (
          <section className="genre-page__section">
            <h2>{circuit.heading}</h2>
            {circuit.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        )}
      </article>

      {/* The Bands — community, framed as who was there */}
      {bands && (
        <div className="genre-page genre-page--lower">
          <section className="genre-page__section">
            <h2>{bands.heading}</h2>
            {bands.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            <div className="genre-page__section-artists">
              <ArtistCircleGrid artists={members} />
            </div>
          </section>
        </div>
      )}

      {/* The Records — reuses the genre page's album grid */}
      <AlbumGrid heading="The Records" items={records} />

      {/* The Breakthrough — culmination + graph CTA */}
      <div className="genre-page genre-page--lower">
        {breakthrough && (
          <section className="genre-page__section">
            <h2>{breakthrough.heading}</h2>
            {breakthrough.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        )}

        <IgniteGraphButton href={graphHref} label={graphLabel} secondary />
      </div>
    </div>
  );
}
