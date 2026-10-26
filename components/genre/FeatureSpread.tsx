'use client';

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { GenreFeature } from '@/lib/genre-feature';
import CoverPrint from '@/components/genres/CoverPrint';
import { imageSrcSet, sizedImageUrl } from '@/lib/image-url';
import Tape from '@/components/genre/Tape';
import { usePlayer } from '@/lib/player';
import { useMusicMotion } from '@/components/genre/useMusicMotion';
import {
  clearLeaving, getLeaving, markRead, subscribeLeaving, turnedTo, wasRead, TURN_MS,
} from '@/lib/feature-arrival';

// The opening spread of a genre's feature: on the left page the genre's
// most-named artist as a two-colour print -- the photo itself sharp in black
// ink, the family's colour laid over it as a halftone screen a hair off
// register -- with the free tape stuck on; on the right the kicker, the headline, the
// standfirst and the folio, as in today's issue (/genres).
//
// How it opens depends on how you came (lib/feature-arrival):
// - fresh: the paper opens to the feature (the right page swings open on
//   the spine), the photo prints -- the colour screen wipes down the page,
//   then the black, settling a hair off register -- the headline stamps on,
//   the words set in, and the tape is slapped onto the photo;
// - turned to from the feature before or after: the page lands (the left
//   one going forward, the right going back) and the photo prints quickly;
// - a feature already read this visit: as it is, the tape giving a wobble.
// Any click, key, scroll or tap ends it early; none of it under reduced
// motion, and nothing changes brightness suddenly.
// Leaving for the next feature, the right page lifts and turns over (the
// left one, going back) before the route changes (FeatureStep).

type Stage = 'pending' | 'open' | 'turn' | 'quick' | 'done';

const OPEN_MS = 2000;
const TURN_IN_MS = 950;
const QUICK_MS = 450;
const LAND_MS = 520;

type Props = Pick<GenreFeature,
  'id' | 'name' | 'emerged' | 'emergedBasis' | 'familyName' | 'folio' | 'headlinePx' | 'deck' | 'lead' | 'artistCount' | 'color' | 'ink' | 'queue'
> & {
  recordCount: number;
  /** The headline's size per 1% of the page's width, for when the page is
   *  narrower than the 520px it was sized for. */
  headlineFit: number;
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function FeatureSpread(f: Props) {
  const [stage, setStage] = useState<Stage>('pending');
  const [turn] = useState(() => turnedTo(f.id));
  const leaving = useSyncExternalStore(subscribeLeaving, getLeaving, () => null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // While the tape or the records play, the print moves with the music: the
  // colour screen kicks a hair out of register on each beat and swells with
  // the song (CSS on --beat and --energy; transforms only, nothing flashes).
  const now = usePlayer();
  const live = (now.queue?.id === f.queue.id || now.queue?.id === `records:${f.id}`) && now.at !== null && !now.paused;
  const photoRef = useRef<HTMLDivElement>(null);
  useMusicMotion(photoRef, live);

  // How to open: only known in the browser (the visit, reduced motion), and
  // decided before the first paint, so nothing shows in place first.
  useLayoutEffect(() => {
    clearLeaving();
    const next: Stage = reducedMotion() ? 'done' : turn ? 'turn' : wasRead(f.id) ? 'quick' : 'open';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the visit and reduced motion are only known in the browser; the spread waits until then
    setStage(next);
  }, [f.id, turn]);

  // Each opening runs its course, then the page is read (marked then, not on
  // mount: React's development mode mounts twice). Input ends it early.
  useEffect(() => {
    if (stage === 'pending') return;
    if (stage === 'done') { markRead(f.id); return; }
    const end = () => setStage('done');
    const t = setTimeout(end, stage === 'open' ? OPEN_MS : stage === 'turn' ? TURN_IN_MS : QUICK_MS);
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    if (stage !== 'quick') events.forEach(e => window.addEventListener(e, end, { capture: true, passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach(e => window.removeEventListener(e, end, { capture: true }));
    };
  }, [stage, f.id]);

  // Turned to: the page lands -- the left one going forward (the turned
  // page coming down on the left), the right one going back.
  useLayoutEffect(() => {
    if (stage !== 'turn' || !turn) return;
    const page = turn === 'next' ? leftRef.current : rightRef.current;
    const anim = page?.animate(
      [{ transform: `rotateY(${turn === 'next' ? 100 : -100}deg)` }, { transform: 'none' }],
      { duration: LAND_MS, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' },
    );
    return () => anim?.cancel();
  }, [stage, turn]);

  // Leaving: this page lifts and turns over before the route changes.
  useLayoutEffect(() => {
    if (!leaving || reducedMotion()) return;
    const page = leaving === 'next' ? rightRef.current : leftRef.current;
    const anim = page?.animate(
      [{ transform: 'none' }, { transform: `rotateY(${leaving === 'next' ? -100 : 100}deg)` }],
      { duration: TURN_MS + 60, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
    );
    return () => anim?.cancel();
  }, [leaving]);

  const kicker = f.emerged ? `Born ${f.emerged}` : 'A family of sounds';

  return (
    <section
      className="fspread"
      data-stage={stage}
      aria-labelledby="feature-title"
      style={{ '--spot': f.color, '--spot-ink': f.ink, '--headline': `${f.headlinePx}px`, '--fitcq': f.headlineFit.toFixed(3) } as React.CSSProperties}
    >
      <div className="fspread__frame">
        <div ref={leftRef} className="fspread__page fspread__page--left">
          <div ref={photoRef} className="fspread__photo" data-live={live || undefined}>
            {f.lead?.imageUrl && (
              <>
                {/* The black: the photo itself, sharp, inked onto the paper. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="fspread__ink"
                  src={sizedImageUrl(f.lead.imageUrl, 1000)}
                  srcSet={imageSrcSet(f.lead.imageUrl, [500, 1000])}
                  sizes="(max-width: 700px) 92vw, 600px"
                  alt=""
                />
                {/* The colour: a halftone screen over it. */}
                <CoverPrint imageUrl={f.lead.imageUrl} color={f.color} colorOnly samples={320} />
              </>
            )}
            <span className="fspread__reg fspread__reg--tl" aria-hidden />
            <span className="fspread__reg fspread__reg--tr" aria-hidden />
            <span className="fspread__reg fspread__reg--bl" aria-hidden />
            <span className="fspread__reg fspread__reg--br" aria-hidden />
            <div className="fspread__tape">
              <Tape name={f.name} queue={f.queue} />
            </div>
          </div>
          {f.lead && (
            <p className="fspread__credit">
              Pictured: <Link href={`/artist/${f.lead.id}`}>{f.lead.name}</Link>
            </p>
          )}
        </div>

        <span className="fspread__fold" aria-hidden />

        <div ref={rightRef} className="fspread__page fspread__page--right">
          <p className="fspread__top">
            <Link href="/genres" className="fspread__back">&larr; Today&rsquo;s issue</Link>
            <span className="fspread__paper">The daily of where sound came from</span>
            <span className="fspread__folio">p. {f.folio}</span>
          </p>
          <p className="fspread__kicker">
            <span>{kicker}</span>
            {f.emergedBasis && <span className="fspread__basis"> &middot; {f.emergedBasis}</span>}
          </p>
          <h1 id="feature-title" className="fspread__headline">{f.name}</h1>
          <p className="fspread__standfirst">{f.deck}</p>
          <p className="fspread__meta">
            <span>{f.artistCount} {f.artistCount === 1 ? 'artist' : 'artists'} on the map</span>
            <span aria-hidden> &middot; </span>
            <span>{f.recordCount} essential {f.recordCount === 1 ? 'record' : 'records'}</span>
            {f.familyName && (
              <>
                <span aria-hidden> &middot; </span>
                <span>the {f.familyName} family</span>
              </>
            )}
          </p>
          <Link href={`/?genre=${f.id}`} className="fspread__map">See it on the map &rarr;</Link>
        </div>
      </div>
    </section>
  );
}
