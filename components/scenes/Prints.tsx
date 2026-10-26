'use client';

import Link from 'next/link';
import { onAir, usePlayer } from '@/lib/player';
import { sizedImageUrl } from '@/lib/image-url';

// Under the lightbox, the history as prints drying on a line: one band from
// every room, oldest room first -- the same band "Play the history" plays
// (historyQueue) -- each pegged to a sagging line. While the history plays,
// the print of the band on air swings on its peg; pointing at a print sets
// it swinging a little. Each print opens its scene. No words on a print, so
// a swinging one never tilts any.

export interface HungPrint {
  sceneId: string;
  sceneName: string;
  era: string;
  bandId: string;
  bandName: string;
  imageUrl: string;
}

const SAG = 26; // how far the line hangs at its middle, px

export default function Prints({ prints }: { prints: HungPrint[] }) {
  const now = usePlayer();
  const airing = now.at !== null && !now.paused ? onAir(now)?.id ?? null : null;
  const n = prints.length;
  return (
    <section className="prints" aria-label="The history, one band from every room, oldest first">
      <svg className="prints__line" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden focusable="false">
        <path d={`M0 6Q500 ${6 + SAG * 2} 1000 6`} fill="none" stroke="#d8cbb0" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <ol className="prints__list">
        {prints.map((p, i) => {
          // Where the line is at this print: a parabola, low in the middle.
          const x = (i + 0.5) / n;
          const drop = SAG * (1 - (2 * x - 1) ** 2);
          return (
            <li key={p.sceneId} className="prints__item" style={{ '--drop': `${drop.toFixed(1)}px`, '--i': i } as React.CSSProperties}>
              <Link
                href={`/scene/${p.sceneId}`}
                className="prints__print"
                data-on={airing === p.bandId || undefined}
                aria-label={`${p.bandName}, ${p.sceneName}, ${p.era}`}
              >
                <span className="prints__peg" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sizedImageUrl(p.imageUrl, 160)} alt="" loading="lazy" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
