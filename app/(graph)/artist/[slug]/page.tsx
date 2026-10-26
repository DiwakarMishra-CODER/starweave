import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { posterTint, readableInk, resolveNodeColor, risoInk } from '@/lib/colors';
import { countryName } from '@/lib/format';
import { buildPortrait, introLine } from '@/lib/family-portrait';
import BackButton from '@/components/ui/BackButton';
import FamilyPhoto from '@/components/artist/FamilyPhoto';
import RecordSleeve from '@/components/artist/RecordSleeve';
import Room from '@/components/artist/backline/Room';
import { resolveBackline } from '@/lib/backline';
import SiteFooter from '@/components/layout/SiteFooter';

interface Props {
  params: Promise<{ slug: string }>;
}


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
// sleeve notes on the back, and the scene they were part of as a flyer. All of
// it in a room: shelves of their family's records, and instruments that play
// along with whatever's on (components/artist/backline).
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
  const backline = resolveBackline(data, artist.id, color);

  return (
    <div
      className="artist-overlay artist-overlay--family"
      style={{
        '--layer-color': color,
        '--backdrop': backdrop,
        '--spot': readableInk(color, backdrop),
        '--wall': backline.wall,
      } as React.CSSProperties}
    >
      <Room
        backline={backline}
        genres={artist.genres.map(g => genreMap[g] ?? g)}
        finish={risoInk(color, backline.wall, 3.2, 6)}
        ribbon={risoInk(color, backline.wall, 7, 10)}
        seed={artist.id}
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
