import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { posterTint, readableInk, resolveNodeColor, risoInk } from '@/lib/colors';
import { countryName } from '@/lib/format';
import { buildPortrait, introLine } from '@/lib/family-portrait';
import BackButton from '@/components/ui/BackButton';
import FamilyPhoto from '@/components/artist/FamilyPhoto';
import RecordSleeve from '@/components/artist/RecordSleeve';
import RisoPrint from '@/components/artist/RisoPrint';
import SiteFooter from '@/components/layout/SiteFooter';

interface Props {
  params: Promise<{ slug: string }>;
}

// The page's dark, behind the riso print (.artist-overlay--family in globals.css).
const PAGE_DARK = '#1a1520';

export async function generateStaticParams() {
  const data = loadGraphData();
  return data.artists.map(a => ({ slug: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = loadGraphData();
  const artist = data.artists.find(a => a.id === slug);
  if (!artist) return {};
  return {
    title: `${artist.name} — Starweave`,
    description: artist.bio ?? `Explore ${artist.name}'s place in the indie influence graph.`,
  };
}

// An artist's page, most important first: who they are, standing in the
// middle of their family photo (who shaped them behind, who they shaped in
// front -- the part only Starweave has); then their record laid open, front
// and back: the record to start with on the front, their story as the
// sleeve notes on the back, and the scene they were part of as a flyer. All
// of it over a riso print of their own photo.
export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const data = loadGraphData();
  const artist = data.artists.find(a => a.id === slug);
  if (!artist) notFound();

  const genreMap = Object.fromEntries(data.genres.map(g => [g.id, g.name]));
  const color = resolveNodeColor(artist);
  const backdrop = posterTint(color);
  const album = artist.classicAlbums?.[0];
  const scene = data.scenes.find(s => s.memberIds.includes(artist.id)) ?? null;
  const role = scene?.memberRoles.find(r => r.artistId === artist.id)?.role ?? null;
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const portrait = buildPortrait(data, artist.id);
  const country = artist.country ? countryName(artist.country) : null;
  const credits = [artist.activeFrom ? `Since ${artist.activeFrom}` : null, country].filter(Boolean).join(' · ') || null;

  return (
    <div
      className="artist-overlay artist-overlay--family"
      style={{
        '--layer-color': color,
        '--backdrop': backdrop,
        '--spot': readableInk(color, backdrop),
      } as React.CSSProperties}
    >
      <RisoPrint
        imageUrl={artist.imageUrl ?? null}
        ink={risoInk(color, PAGE_DARK, 1.7, 2)}
        lit={risoInk(color, PAGE_DARK, 4, 4.6)}
      />
      <BackButton />
      <div className="artist-family">
        <FamilyPhoto
          artist={{
            id: artist.id,
            name: artist.name,
            imageUrl: artist.imageUrl,
            imageCredit: artist.imageCredit,
            activeFrom: artist.activeFrom,
            previewUrl: artist.previewUrl,
            previewTrack: artist.previewTrack,
            signatureSong: artist.signatureSong,
          }}
          intro={artist.bio ? introLine(artist.bio) : null}
          genres={artist.genres.map(g => ({ id: g, name: genreMap[g] ?? g }))}
          country={country}
          portrait={portrait}
        />

        <RecordSleeve
          album={album ?? null}
          artist={{ id: artist.id, name: artist.name }}
          bio={artist.bio ?? null}
          credits={credits}
          scene={scene ? {
            id: scene.id,
            name: scene.name,
            city: scene.city,
            yearStart: scene.yearStart,
            yearEnd: scene.yearEnd,
            role,
            members: scene.memberIds.flatMap(id => {
              const m = byId.get(id);
              return m ? [{ id: m.id, name: m.name, imageUrl: m.imageUrl ?? null }] : [];
            }),
          } : null}
        />
      </div>
      <SiteFooter />
    </div>
  );
}
