'use client';

import Link from 'next/link';
import { useSyncExternalStore, type CSSProperties } from 'react';

// The footer's genre sticker: a different genre each visit, in its family's
// colour, linking to its feature. The pages are prerendered, so the pick is
// made in the browser, once per visit (it stays put while you move between
// pages); the server draws an empty slot.

export interface StickerGenre {
  id: string;
  name: string;
  color: string;
  ink: string;
}

let pick: number | null = null;
const roll = () => (pick ??= Math.random());
const subscribe = () => () => {};

export default function GenreSticker({ genres }: { genres: StickerGenre[] }) {
  const at = useSyncExternalStore(subscribe, roll, () => null);
  if (at === null || genres.length === 0) return <span className="site-foot__sticker site-foot__sticker--genre site-foot__sticker--empty" aria-hidden />;
  const g = genres[Math.floor(at * genres.length)];
  return (
    <Link
      href={`/genre/${g.id}`}
      className="site-foot__sticker site-foot__sticker--genre"
      style={{ '--sticker': g.color, '--sticker-ink': g.ink } as CSSProperties}
    >
      {g.name}
    </Link>
  );
}
