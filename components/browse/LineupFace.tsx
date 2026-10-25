'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { LineupArtist } from '@/lib/browse-lineup';
import { sizedImageUrl } from '@/lib/image-url';

// One face on the bill: the photo printed one-ink in its realm's colour on
// the poster's paper (full colour when lit), and the name under it, always
// shown. Pointing at it shows its family in the strip at the top; clicking
// it (or Enter) opens its own bill. It stays a real link to the artist's
// page, so a new tab or a middle click still goes there. `state` comes from
// the bill: the star of their own bill, the ones who shaped them, the ones
// they shaped, or dimmed.

export type FaceState = 'rest' | 'focus' | 'shaped' | 'by' | 'dim';

export interface FaceHandlers {
  onPoint: (i: number) => void;
  onLeave: (i: number) => void;
  onActivate: (i: number, e: React.MouseEvent) => void;
}

interface Props extends FaceHandlers {
  artist: LineupArtist;
  index: number;
  size: number;
  nameSize: number;
  state: FaceState;
  eager: boolean;
  order: number;
}

function LineupFace({ artist, index, size, nameSize, state, eager, order, onPoint, onLeave, onActivate }: Props) {
  return (
    <li
      className="lineup-face"
      data-state={state}
      data-key={index}
      style={{
        '--size': `${size}px`,
        '--name-size': `${nameSize}px`,
        '--tint': artist.color,
        '--ink': artist.ink,
        '--o': order,
      } as React.CSSProperties}
    >
      <Link
        href={`/artist/${artist.id}`}
        className="lineup-face__link"
        data-face={index}
        onPointerEnter={e => { if (e.pointerType === 'mouse') onPoint(index); }}
        onPointerLeave={e => { if (e.pointerType === 'mouse') onLeave(index); }}
        onFocus={() => onPoint(index)}
        onBlur={() => onLeave(index)}
        onClick={e => onActivate(index, e)}
        aria-label={`${artist.name}: see their family, who shaped them and who they shaped`}
      >
        <span className="lineup-face__photo">
          {artist.imageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={sizedImageUrl(artist.imageUrl, size * 2 > 250 ? 500 : 250)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />
            : <span className="lineup-face__initials" aria-hidden>{artist.name.replace(/^The /, '').slice(0, 2)}</span>}
        </span>
        <span className="lineup-face__name">{artist.name}</span>
      </Link>
    </li>
  );
}

export default memo(LineupFace);
