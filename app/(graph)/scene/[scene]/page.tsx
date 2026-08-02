import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { SCENE_COLORS, DEFAULT_SCENE_COLOR } from '@/lib/colors';
import ArtistBackground from '@/components/artist/ArtistBackground';
import SceneMemberRoster from '@/components/scenes/SceneMemberRoster';
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
  return { title: `${s.name} — Starweave`, description: s.blurb };
}

// Scene pages are deliberately short — 3-7 artists, a few years, one room —
// see CLAUDE.md's 2026 scene-page pass. Four parts only: place and time
// (the physical circumstances a genre page can never give you), the members
// (large photos, one line on their role IN THIS SCENE), what came out of it
// (2-3 sentences), and the graph CTA. No defining albums (genre pages own
// that), no lineage strip (scenes don't descend from each other), no
// sub-sections (a 4-artist scene doesn't subdivide).
export default async function ScenePage({ params }: Props) {
  const { scene } = await params;
  const data = loadGraphData();
  const sceneData = data.scenes.find(s => s.id === scene);
  if (!sceneData) notFound();

  const sceneColor = SCENE_COLORS[scene] ?? DEFAULT_SCENE_COLOR;
  const artistById = new Map(data.artists.map(a => [a.id, a]));

  const members = sceneData.memberRoles
    .map(({ artistId, role }) => {
      const artist = artistById.get(artistId);
      return artist ? { artist, role } : null;
    })
    .filter((m): m is { artist: NonNullable<typeof m>['artist']; role: string } => m !== null);

  // "See the scene in the graph" highlights every member artist as a cluster.
  const graphHref = `/?scene=${scene}`;
  const graphLabel = `See the ${sceneData.name} constellation ignite`;

  return (
    <div
      className="genre-overlay"
      style={{ '--genre-color': sceneColor, '--layer-color': sceneColor } as React.CSSProperties}
    >
      <ArtistBackground layerColor={sceneColor} boost={1.1} className="scene-bg" />
      <div className="artist-bg-scrim" aria-hidden />

      {/* Hero + Place and time — 700px reading width, same as a genre page's
          opening beat. Scene pages stay short: no lineage strip (scenes
          don't descend from each other), no defining albums (genre pages
          own that). */}
      <article className="genre-page">
        <header className="genre-page__header">
          <p className="genre-page__super">Scene</p>
          <h1 className="genre-page__title">{sceneData.name}</h1>
          <div className="scene-page__stamp">
            <span className="scene-page__stamp-place">{sceneData.place}</span>
            <span className="scene-page__stamp-sep" aria-hidden>·</span>
            <span className="scene-page__stamp-era">{sceneData.era}</span>
          </div>
          <p className="genre-page__deck">{sceneData.blurb}</p>
          <IgniteGraphButton href={graphHref} label={graphLabel} />
        </header>

        <section className="genre-page__section">
          <h2>Place and time</h2>
          {sceneData.placeAndTime.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      </article>

      {/* Who was there — large photos, 900px so 3-7 members get real room to
          breathe instead of a cramped small grid. */}
      <div className="genre-page genre-page--lower">
        <section className="genre-page__section">
          <h2>Who was there</h2>
          <SceneMemberRoster members={members} />
        </section>
      </div>

      {/* What came out of it + CTA — back to the narrow reading column. */}
      <div className="genre-page genre-page--lower scene-page--epilogue">
        <section className="genre-page__section">
          <h2>What came out of it</h2>
          <p>{sceneData.legacy}</p>
        </section>

        <IgniteGraphButton href={graphHref} label={graphLabel} secondary />
      </div>
    </div>
  );
}
