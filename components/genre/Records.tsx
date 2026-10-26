'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { FeatureRecord } from '@/lib/genre-feature';
import { onAir, player, usePlayer, type Queue } from '@/lib/player';
import { sizedImageUrl } from '@/lib/image-url';
import DealList from '@/components/ui/DealList';

// The paper's reviews page: each essential record as a review, its real
// cover with the disc peeking from the sleeve, the title, who made it (a
// proper link to their page, with their photo) and when, and why it matters.
// Dealt onto the page off a pile the first time it scrolls into view
// (DealList), then each disc slides partly out in turn; pointing at a record
// pulls its disc further out.
//
// Each record plays a song from itself -- the one its review names, where the
// store has it -- through the site's player: press the sleeve or the play
// button, and the disc comes most of the way out and spins until it stops.
// "Play the records" runs them all in order. The records are ranked, most
// essential first (data/genre-pages.ts), and the first is printed bigger as
// the one to start with. While the free tape plays,
// the record of whoever's on air comes out too.
export default function Records({ records, tapeId, queue }: { records: FeatureRecord[]; tapeId: string; queue: Queue }) {
  const now = usePlayer();
  const sounding = now.at !== null && !now.paused ? onAir(now) : null;
  const tapeAir = now.queue?.id === tapeId ? sounding?.id ?? null : null;
  const loaded = now.queue?.id === queue.id && now.at !== null;
  const loadedId = loaded ? queue.tracks[now.at!]?.id ?? null : null;
  const spinning = loaded && !now.paused ? loadedId : null;

  // Esc stops the records.
  useEffect(() => {
    if (!loaded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') player.stop(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loaded]);

  const play = (artistId: string) => {
    if (loadedId === artistId) {
      if (now.paused) player.resume(); else player.pause();
      return;
    }
    const at = queue.tracks.findIndex(t => t.id === artistId);
    if (at >= 0) player.play(queue, at);
  };
  const playable = queue.tracks.length;

  return (
    <>
      {playable > 1 && (
        <div className="frecords__deck">
          <button
            type="button"
            className="frecords__all"
            data-on={loaded || undefined}
            onClick={() => (loaded ? (now.paused ? player.resume() : player.pause()) : player.play(queue, 0))}
          >
            <span className="frecords__all-icon" data-pause={(loaded && !now.paused) || undefined} aria-hidden />
            <span className="frecords__all-text">
              <span>{loaded && !now.paused ? 'Pause the records' : loaded ? 'Carry on' : 'Play the records'}</span>
              <span className="frecords__all-sub">{playable} songs, in this order</span>
            </span>
          </button>
        </div>
      )}
      <DealList className="frecords">
        {records.map((r, i) => {
          const isLoaded = loadedId === r.artistId;
          const isSpinning = spinning === r.artistId;
          return (
            <li
              key={r.artistId}
              className="frecord"
              data-air={tapeAir === r.artistId || undefined}
              data-spin={isSpinning || undefined}
              data-loaded={isLoaded || undefined}
              data-lead={i === 0 || undefined}
              style={{ '--i': i } as React.CSSProperties}
            >
              {r.song ? (
                // The sleeve is a big target for the same thing the play button does.
                <button type="button" className="frecord__sleeve" tabIndex={-1} aria-hidden onClick={() => play(r.artistId)}>
                  <Sleeve r={r} />
                </button>
              ) : (
                <span className="frecord__sleeve" aria-hidden><Sleeve r={r} /></span>
              )}
              <div className="frecord__text">
                <p className="frecord__rank">{i === 0 ? 'Start here' : `No. ${i + 1}`}</p>
                <h3 className="frecord__title">{r.title}</h3>
                <p className="frecord__by">
                  <Link href={`/artist/${r.artistId}`} className="frecord__artist">
                    {r.artistImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sizedImageUrl(r.artistImage, 64)} alt="" loading="lazy" decoding="async" width={24} height={24} />
                    )}
                    <span className="frecord__artist-name">{r.artistName}</span>
                    <span className="frecord__artist-arrow" aria-hidden>&rarr;</span>
                  </Link>
                  {r.year && <span className="frecord__year">{r.year}</span>}
                </p>
                {r.song && (
                  <button
                    type="button"
                    className="frecord__play"
                    aria-label={`${isSpinning ? 'Pause' : 'Play'} "${r.song}", from ${r.title}`}
                    onClick={() => play(r.artistId)}
                  >
                    <span className="frecord__play-icon" data-pause={isSpinning || undefined} aria-hidden />
                    <span className="frecord__play-song">&ldquo;{r.song}&rdquo;</span>
                    <span className="frecord__eq" aria-hidden><i /><i /><i /></span>
                  </button>
                )}
                <p className="frecord__review">{r.review}</p>
              </div>
            </li>
          );
        })}
      </DealList>
    </>
  );
}

function Sleeve({ r }: { r: FeatureRecord }) {
  return (
    <>
      <span className="frecord__disc">
        <span className="frecord__label" />
      </span>
      {r.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sizedImageUrl(r.imageUrl, 500)} alt="" loading="lazy" decoding="async" width={180} height={180} />
      )}
    </>
  );
}
