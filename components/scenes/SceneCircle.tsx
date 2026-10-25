import Link from 'next/link';
import type { CircleFace } from '@/lib/scene-page';
import { sizedImageUrl } from '@/lib/image-url';
import DealList from '@/components/scenes/DealList';

// Everyone on the map the bands in a room name as an influence, and everyone
// who names them, rooms or not: two rows of small prints, oldest first, each
// with the band here it's linked to, dealt onto the table as they scroll
// into view (DealList). An empty row says so in plain words.

interface Props {
  learnedFrom: CircleFace[];
  passedTo: CircleFace[];
  learnedFromEmpty: string;
  passedToEmpty: string;
}

const via = (names: string[]) => (names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0]);

function Row({ title, tone, faces, empty, note }: {
  title: string;
  tone: 'in' | 'out';
  faces: CircleFace[];
  empty: string;
  note: (f: CircleFace) => string;
}) {
  return (
    <div className={`circle__row circle__row--${tone}`}>
      <h3 className="circle__title">
        <span>{title}</span> <span className="circle__count">{faces.length}</span>
      </h3>
      {faces.length > 0 ? (
        <DealList className="circle__faces">
          {faces.map(f => (
            <li key={f.id}>
              <Link href={`/artist/${f.id}`} className="circle__face">
                <span className="circle__photo">
                  {f.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sizedImageUrl(f.imageUrl, 120)} alt="" loading="lazy" decoding="async" width={60} height={78} />
                  )}
                </span>
                <span className="circle__name">{f.name}</span>
                <span className="circle__via">{note(f)}</span>
              </Link>
            </li>
          ))}
        </DealList>
      ) : (
        <p className="circle__empty">{empty}</p>
      )}
    </div>
  );
}

export default function SceneCircle({ learnedFrom, passedTo, learnedFromEmpty, passedToEmpty }: Props) {
  return (
    <div className="circle">
      <Row title="Who they learned from" tone="in" faces={learnedFrom} empty={learnedFromEmpty} note={f => `named by ${via(f.via)}`} />
      <Row title="Who learned from them" tone="out" faces={passedTo} empty={passedToEmpty} note={f => `names ${via(f.via)}`} />
    </div>
  );
}
