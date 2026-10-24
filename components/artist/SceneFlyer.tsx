import Link from 'next/link';
import { sizedImageUrl } from '@/lib/image-url';

// The scene they were part of, as a photocopied gig flyer: the scene's name
// in poster type, where and when, and "On the bill" -- every member's face,
// with this artist circled in marker. Then their part in it, and the way to
// the whole scene. Taped under the record on the artist page (RecordSleeve).

export interface FlyerScene {
  id: string;
  name: string;
  city: string;
  yearStart: number;
  yearEnd?: number;
  role: string | null;
  members: { id: string; name: string; imageUrl: string | null }[];
}

export default function SceneFlyer({ scene, artistId }: { scene: FlyerScene; artistId: string }) {
  const years = scene.yearEnd === undefined ? `${scene.yearStart}–now` : `${scene.yearStart}–${scene.yearEnd}`;
  return (
    <div className="flyer">
      <p className="flyer__tag">Played at</p>
      <h3 className="flyer__name">{scene.name}</h3>
      <p className="flyer__where">{scene.city === scene.name ? years : `${scene.city} · ${years}`}</p>
      <p className="flyer__bill-label">On the bill</p>
      <ul className="flyer__bill">
        {scene.members.map(m => {
          const face = (
            <>
              <span className="flyer__face">
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sizedImageUrl(m.imageUrl, 250)} alt="" width={52} height={52} />
                )}
                {m.id === artistId && (
                  <svg className="flyer__circle" viewBox="0 0 100 100" aria-hidden>
                    <path d="M50 4 C78 3 96 22 95 50 C94 79 74 97 48 96 C21 95 4 76 5 49 C6 24 24 7 54 6" pathLength={1} />
                  </svg>
                )}
              </span>
              <span className="flyer__member">{m.name}</span>
            </>
          );
          return (
            <li key={m.id}>
              {m.id === artistId ? (
                <span className="flyer__act flyer__act--self">{face}</span>
              ) : (
                <Link href={`/artist/${m.id}`} className="flyer__act">{face}</Link>
              )}
            </li>
          );
        })}
      </ul>
      {scene.role && <p className="flyer__role">{scene.role}</p>}
      <Link href={`/scene/${scene.id}`} className="flyer__link">
        The whole scene <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
