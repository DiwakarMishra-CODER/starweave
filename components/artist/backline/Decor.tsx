import { sizedImageUrl } from '@/lib/image-url';
import type { Face } from '@/lib/backline';

// What bands put on their instruments (the room behind the artist's page):
// pin badges, die-cut stickers, and plain sewing buttons where there's no
// one to wear. Spots are in the instrument's own units; the overlay places
// them by percentage, so they scale with the drawing.

export interface Spot {
  x: number;
  y: number;
  /** A badge's radius, or half a sticker's side. */
  r: number;
  /** Degrees: stickers are slapped on at an angle; badges turn too (no text on either). */
  tilt: number;
}

const BUTTONS = ['#e9dcc0', '#c84b3a', '#3e6b8a', '#e3b341', '#2f2a33', '#7aa37a', '#d98fae', '#f2efe6'];

function place(spot: Spot, w: number, h: number): React.CSSProperties {
  return {
    left: `${(spot.x / w) * 100}%`,
    top: `${(spot.y / h) * 100}%`,
    width: `${((spot.r * 2) / w) * 100}%`,
    '--tilt': `${spot.tilt}deg`,
  } as React.CSSProperties;
}

/** Pin badges of who shaped them, then buttons in the spots left over. */
export function Badges({ faces, spots, w, h, onAir }: { faces: Face[]; spots: Spot[]; w: number; h: number; onAir: string | null }) {
  return (
    <>
      {spots.map((spot, i) => {
        const f = faces[i];
        if (!f) {
          // A plain sewing button, a little smaller than a badge.
          const small = { ...spot, r: spot.r * (0.45 + ((i * 37) % 20) / 100) };
          return <span key={i} className="bline__button" style={{ ...place(small, w, h), '--btn': BUTTONS[(i * 5) % BUTTONS.length] } as React.CSSProperties} />;
        }
        return (
          <span key={f.id} className="bline__badge" style={place(spot, w, h)} data-on={onAir === f.id || undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sizedImageUrl(f.imageUrl, 120)} alt="" loading="lazy" />
          </span>
        );
      })}
    </>
  );
}

/** Stickers of who they shaped; none where they've shaped no one yet. */
export function Stickers({ faces, spots, w, h, onAir }: { faces: Face[]; spots: Spot[]; w: number; h: number; onAir: string | null }) {
  return (
    <>
      {faces.slice(0, spots.length).map((f, i) => (
        <span key={f.id} className="bline__sticker" style={place(spots[i], w, h)} data-on={onAir === f.id || undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sizedImageUrl(f.imageUrl, 120)} alt="" loading="lazy" />
        </span>
      ))}
    </>
  );
}
