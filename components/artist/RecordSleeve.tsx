import StreamingLinks from '@/components/ui/StreamingLinks';
import type { Album } from '@/data/types';
import RecordObject from './RecordObject';
import SceneFlyer, { type FlyerScene } from './SceneFlyer';
import SleeveArrivals from './SleeveArrivals';

// Under the family photo: their record laid open the way a shop lays one out,
// front and back side by side, nothing to flip.
// - The front: the record (RecordObject -- it rises out of a crate as it
//   scrolls in, its vinyl slides out; tilt the cover, spin the vinyl), and
//   the shop's "Start here" card -- the title, where to hear it, why it
//   matters -- its sticker slapping on as it arrives.
// - The back: their story set as sleeve notes (#sleeve-notes, which the
//   photo's intro line points to), printing in as you reach them.
// - The scene they were part of, as a gig flyer taped underneath.
// The arrivals are SleeveArrivals; everything is there without them.

interface Props {
  album: Album | null;
  artist: { id: string; name: string; loud?: boolean };
  bio: string | null;
  /** "Since 1976 · United Kingdom", the back sleeve's small print. */
  credits: string | null;
  scene: FlyerScene | null;
}

// A barcode for the back sleeve, made from the artist's id so each is its
// own: alternating bars and gaps, 1-3 units wide.
function barcode(id: string): { bars: { x: number; w: number }[]; width: number } {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; i < 29; i++) {
    const w = 1 + ((id.charCodeAt(i % id.length) * (i + 7)) % 3);
    if (i % 2 === 0) bars.push({ x, w });
    x += w;
  }
  return { bars, width: x };
}

export default function RecordSleeve({ album, artist, bio, credits, scene }: Props) {
  const code = barcode(artist.id);

  return (
    <section className="sleeve" aria-label={album ? `${album.title}, front and back` : 'Their story'}>
      <SleeveArrivals />
      <div className={`sleeve__spread${album ? '' : ' sleeve__spread--back-only'}`}>
        {album && (
          <div className="sleeve__front">
            <RecordObject album={album} artistId={artist.id} artistName={artist.name} loud={artist.loud} />

            <div className="sleeve__card" data-arrive>
              <p className="sleeve__tag">Start here</p>
              <h2 className="sleeve__title">
                {album.title}
                {album.year ? <span className="sleeve__year"> ({album.year})</span> : null}
              </h2>
              <div className="zine__apps sleeve__apps">
                <StreamingLinks query={`${artist.name} ${album.title}`} label="Hear it on" named />
              </div>
              {album.classicReason && <p className="sleeve__note">{album.classicReason}</p>}
            </div>
          </div>
        )}

        {bio && (
          <article className="sleeve__back" id="sleeve-notes" aria-labelledby="sleeve-notes-title" data-arrive>
            <p className="sleeve__kicker">Sleeve notes</p>
            <h2 id="sleeve-notes-title" className="sleeve__artist">{artist.name}</h2>
            {album && <p className="sleeve__album">{album.title}{album.year ? ` · ${album.year}` : ''}</p>}
            <div className="sleeve__notes">
              {bio.split('\n\n').map((para, i) => (
                <p key={i} style={{ '--i': i } as React.CSSProperties}>{para}</p>
              ))}
            </div>
            <footer className="sleeve__small-print">
              {credits && <span>{credits}</span>}
              <svg className="sleeve__barcode" viewBox={`0 0 ${code.width} 30`} preserveAspectRatio="none" aria-hidden>
                {code.bars.map(b => <rect key={b.x} x={b.x} y={0} width={b.w} height={30} />)}
              </svg>
            </footer>
          </article>
        )}
      </div>

      {scene && (
        <div className="sleeve__flyer" data-arrive>
          <SceneFlyer scene={scene} artistId={artist.id} />
        </div>
      )}
    </section>
  );
}
