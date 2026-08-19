import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { GENRE_COLORS, DEFAULT_GENRE_COLOR } from '@/lib/colors';
import { getGenreLineage } from '@/lib/genre-lineage';
import { GENRE_PAGES } from '@/data/genre-pages';
import ArtistBackground from '@/components/artist/ArtistBackground';
import BackButton from '@/components/ui/BackButton';
import ArtistCircleGrid from '@/components/artist/ArtistCircleGrid';
import AlbumGrid from '@/components/artist/AlbumGrid';
import IgniteGraphButton from '@/components/artist/IgniteGraphButton';
import GenreLineageStrip from '@/components/artist/GenreLineageStrip';

interface Props {
  params: Promise<{ genre: string }>;
}

// Genres with a full story page live in data/genre-pages.ts; others render a stub.
const BUILT_GENRES = new Set(Object.keys(GENRE_PAGES));

export function generateStaticParams() {
  const data = loadGraphData();
  return data.genres.map(g => ({ genre: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const data = loadGraphData();
  const g = data.genres.find(x => x.id === genre);
  if (!g) return {};
  return { title: `${g.name} — Starweave` };
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;
  const data = loadGraphData();
  const genreData = data.genres.find(g => g.id === genre);
  if (!genreData) notFound();

  const genreColor = GENRE_COLORS[genre] ?? DEFAULT_GENRE_COLOR;

  if (!BUILT_GENRES.has(genre)) {
    return (
      <div
        className="genre-overlay"
        style={{ '--genre-color': genreColor, '--layer-color': genreColor } as React.CSSProperties}
      >
        <ArtistBackground layerColor={genreColor} boost={1.7} />
        <div className="artist-bg-scrim" aria-hidden />
        <BackButton />
        <div className="genre-stub">
          <p className="genre-stub__title">{genreData.name}</p>
          <p className="genre-stub__text">
            This genre story is coming in a future update. The graph already includes{' '}
            {genreData.name.toLowerCase()} artists — explore them on the{' '}
            <Link href="/" style={{ color: 'var(--genre-color)' }}>graph</Link>.
          </p>
          <Link href="/" className="genre-page__graph-btn" style={{ display: 'inline-flex' }}>
            Open graph →
          </Link>
        </div>
      </div>
    );
  }

  // --- Content-defined genre story (see data/genre-pages.ts) ---
  const content = GENRE_PAGES[genre]!;
  const lineage = getGenreLineage(data.genres, genre);

  // "View in graph" highlights every artist in this genre as a cluster.
  const graphHref = `/?genre=${genre}`;
  const graphLabel = `See ${genreData.name} light up the graph`;

  // Curated, not derived — see the file-level comment in data/genre-pages.ts.
  // An artist can carry this genre's tag while their classicAlbum belongs to
  // a different one; content.definingAlbums is the hand-picked subset whose
  // album genuinely fits.
  const definingAlbums = content.definingAlbums
    .map(id => data.artists.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined && !!a.classicAlbums?.length)
    .map(a => ({ artist: a, album: a.classicAlbums![0] }))
    .sort((a, b) => (a.album.year ?? 0) - (b.album.year ?? 0));

  const resolvedSections = content.sections.map(section => ({
    ...section,
    artists: section.artistIds
      .map(id => data.artists.find(a => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined),
  }));

  return (
    <div
      className="genre-overlay"
      style={{ '--genre-color': genreColor, '--layer-color': genreColor } as React.CSSProperties}
    >
      <ArtistBackground layerColor={genreColor} boost={1.7} />
      <div className="artist-bg-scrim" aria-hidden />
      <BackButton />

      {/* Prose — 700px reading width */}
      <article className="genre-page">
        <header className="genre-page__header">
          <p className="genre-page__super">Genre story</p>
          <h1 className="genre-page__title">{genreData.name}</h1>
          <p className="genre-page__deck">{content.deck}</p>
          <IgniteGraphButton href={graphHref} label={graphLabel} />
        </header>

        {lineage && (
          <GenreLineageStrip lineage={lineage} />
        )}

        <section className="genre-page__section">
          <h2>Origin</h2>
          {content.originParagraphs.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        <section className="genre-page__section">
          <h2>The sound</h2>
          <p>{content.soundParagraph}</p>
        </section>
      </article>

      {/* Defining albums — wider section, breaks out of prose column. Placed
          right after "The sound" (and before the artist sections below) so
          the covers — the most visually arresting element on the page —
          appear before a reader has scrolled through four blocks of prose
          with nothing to look at. */}
      <AlbumGrid heading="Defining albums" items={definingAlbums} />

      {/* Lower prose — 700px reading width, no top padding */}
      <div className="genre-page genre-page--lower">
        {resolvedSections.map(section => (
          <section className="genre-page__section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.blurb}</p>
            <div className="genre-page__section-artists">
              <ArtistCircleGrid artists={section.artists} />
            </div>
          </section>
        ))}

        <IgniteGraphButton href={graphHref} label={graphLabel} secondary />
      </div>
    </div>
  );
}
