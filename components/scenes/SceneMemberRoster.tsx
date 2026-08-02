import Link from 'next/link';
import type { Artist } from '@/data/types';

interface Props {
  members: Array<{ artist: Artist; role: string }>;
}

// Scenes top out at 7 members — large photos read as "these are the people
// who were there," where the small overlapping-circle grid genre pages use
// (ArtistCircleGrid) reads as a long list to skim. Not reused here on
// purpose.
export default function SceneMemberRoster({ members }: Props) {
  return (
    <div className="scene-roster">
      {members.map(({ artist, role }) => (
        <Link key={artist.id} href={`/artist/${artist.id}`} className="scene-roster__card">
          <div className="scene-roster__photo">
            {artist.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artist.imageUrl} alt="" width={160} height={160} />
            ) : (
              <span className="scene-roster__initial">{artist.name.charAt(0)}</span>
            )}
          </div>
          <span className="scene-roster__name">{artist.name}</span>
          <p className="scene-roster__role">{role}</p>
        </Link>
      ))}
    </div>
  );
}
