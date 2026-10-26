'use client';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import type { GenreFeature } from '@/lib/genre-feature';
import { onAir, usePlayer } from '@/lib/player';
import { useMusicMotion } from '@/components/genre/useMusicMotion';
import { sizedImageUrl } from '@/lib/image-url';

// Who plays it: each group of the genre's artists as a scene report, its
// faces their real photos as small prints ringed in the family's colour.
// When a group scrolls into view (Reveal on the section) a roller sweeps
// across it and the faces come up one after another, like ink going down.
// While one of them is playing (the tape, a record, or anywhere on the
// site), their face steps forward and bumps on the beat, its ring swelling
// with the song, and everyone else steps back.
export default function Players({ groups }: { groups: GenreFeature['groups'] }) {
  const now = usePlayer();
  const here = useMemo(() => new Set(groups.flatMap(g => g.artists.map(a => a.id))), [groups]);
  const sounding = now.at !== null && !now.paused ? onAir(now)?.id ?? null : null;
  const airId = sounding && here.has(sounding) ? sounding : null;
  const ref = useRef<HTMLDivElement>(null);
  useMusicMotion(ref, airId !== null);
  return (
    <div ref={ref} className="fplayers" data-live={airId ? true : undefined}>
      {groups.map((g, gi) => (
        <section key={g.title} className="fgroup" style={{ '--g': gi } as React.CSSProperties}>
          <h3 className="fgroup__title">{g.title}</h3>
          <p className="fgroup__blurb">{g.blurb}</p>
          <div className="fgroup__press">
          <span className="fgroup__roller" aria-hidden />
          <ul className="fgroup__faces">
            {g.artists.map((a, k) => (
              <li key={a.id} style={{ '--k': k } as React.CSSProperties} data-air={airId === a.id || undefined}>
                <Link href={`/artist/${a.id}`} className="fface">
                  <span className="fface__print">
                    {a.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sizedImageUrl(a.imageUrl, 250)} alt="" loading="lazy" decoding="async" width={84} height={84} />
                    )}
                  </span>
                  <span className="fface__name">{a.name}</span>
                  {a.activeFrom && <span className="fface__year">{a.activeFrom}</span>}
                </Link>
              </li>
            ))}
          </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
