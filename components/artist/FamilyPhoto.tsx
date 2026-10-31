'use client';

import Link from 'next/link';
import {
  Fragment, ViewTransition, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore,
} from 'react';
import StreamingLinks from '@/components/ui/StreamingLinks';
import PhotoCredit from '@/components/ui/PhotoCredit';
import PlayerDevice from '@/components/player/PlayerDevice';
import { moveWithMusic } from '@/lib/music-motion';
import { SONG_MS, onAir as trackOnAir, player, usePlayer, type Queue } from '@/lib/player';
import { toTrack } from '@/lib/player-library';
import Crossfader from './Crossfader';
import { sizedImageUrl, imageSrcSet } from '@/lib/image-url';
import { familyRunningOrder, standInRow, type Denial, type Member, type Portrait } from '@/lib/family-portrait';
import type { Artist } from '@/data/types';
import SourceLink from '@/components/ui/SourceLink';

// The top of the artist page: their family as a group photo (lib/family-portrait).
// Who shaped them stand in the back row, the artist in the middle with their
// name, a line about them and their song, who they shaped in front. The
// bigger the face and the nearer the middle, the stronger the proof.
// - Every face is a button (its name plate is a pressable chip). Tapping one
//   opens a card right under that face's line, pointing at it.
// - A thread draws from the face you point at to the artist, the way the
//   influence ran: down into the artist from behind, down out of them in front.
// - The music is the site's player (lib/player), docked here as a pocket
//   player (PlayerDevice) and offering the family first, oldest first: whole
//   songs one after another, or "Play the family", a few seconds of each.
//   Whoever in the family is on air -- however it was started -- steps
//   forward in the photo and their thread lights; the faces sway with the
//   song, the one on air bumps on its beats, and the photo's light swells
//   with it (--energy, --beat: lib/music-motion).
// - A face's card has a crossfader (Crossfader) between them and the artist.
// - The first time an artist's page opens in a visit, the photo is taken:
//   their family walks in from the sides and squeezes into the rows -- who
//   shaped them dropping into the back row, who they shaped coming up into
//   the front, the strongest (nearest the middle) first, each one bobbing as
//   it walks and jostling into its place -- while the name stamps on and the
//   pocket player is set down and plugged in; then a viewfinder's corners
//   close in round the group and lock, and colour floods into the faces,
//   which walked in faded like an unprocessed print. (It was a camera flash
//   once: a full-frame flash of light can set off photosensitive epilepsy,
//   so nothing here changes brightness suddenly.) Any click, key, scroll or tap ends it;
//   none of it under reduced motion. Later visits that visit just develop
//   the faces like a print, back row first, as before.
// - Each photo carries a view-transition name, so going to a face's page
//   flies that face into the middle of their own photo.

/** Anyone in the photo, as the player needs them. */
type Stop = {
  id: string;
  name: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  previewTrack?: string | null;
  activeFrom: number | null;
};

type Self = Pick<Artist, 'id' | 'name' | 'imageUrl' | 'imageCredit' | 'activeFrom' | 'previewUrl' | 'previewTrack' | 'signatureSong'>;

interface Props {
  artist: Self;
  intro: string | null;
  genres: { id: string; name: string }[];
  country: string | null;
  portrait: Portrait;
}

const FAMILY_STOP_MS = 6000; // each face's turn in Play the family
const FACE_PX = { said: 96, reported: 78, other: 64 } as const;
const PROOF_WORDS = { said: 'said it themselves', reported: 'reported', other: 'a critic, or widely accepted' } as const;
const DEVELOP_STEP_MS = 50;  // between one face developing and the next
// The photo being taken, in ms from the page opening (CSS keys the name,
// labels, player and hint to the same run).
const WALK_AT = 260;         // the first of the family sets off (clear of the page's start-up work)
const WALK_STEP_MS = 42;     // and each after them, strongest first
const WALK_SPREAD_MS = 650;  // however big the family, all set off within this
const WALK_MS = 760;
const PHOTO_WAIT_MS = 400;   // the longest the family waits for its photos
const SHUTTER_GAP_MS = 120;  // everyone in place, then the viewfinder locks
const DEVELOP_MS = 1100;     // colour floods in (CSS fp-tone; the finder runs 450ms before)
const THREAD_DRAW_MS = 420;
const THREAD_DOT_MS = 900;

// On a phone each row is one strip you swipe, so a card goes under the whole
// strip rather than under a line, and there are no threads.
const NARROW = '(max-width: 700px)';
const subscribeNarrow = (cb: () => void) => {
  const mq = matchMedia(NARROW);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useNarrow = () => useSyncExternalStore(subscribeNarrow, () => matchMedia(NARROW).matches, () => false);

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

type Open = { kind: 'member'; side: 'back' | 'front'; id: string } | { kind: 'denial'; id: string } | null;

// Whose page this was before, across client-side navigations: their face may
// have just flown into this photo (the view transition), so it arrives
// developed rather than going pale and developing again.
let lastArtistId: string | null = null;
// Whose photo has been taken this visit: they get the quick version after.
// Marked when the run ends, not on mount -- React's development mode mounts
// twice, and the second mount would find it already taken.
const photographed = new Set<string>();

export default function FamilyPhoto({ artist, intro, genres, country, portrait }: Props) {
  const uid = useId();
  const narrow = useNarrow();
  const [open, setOpen] = useState<Open>(null);
  // The face being pointed at (hover or keyboard focus), for its thread.
  const [pointed, setPointed] = useState<string | null>(null);
  const [cameFrom] = useState(() => lastArtistId);
  useEffect(() => {
    lastArtistId = artist.id;
  }, [artist.id]);
  const photoRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const finderRef = useRef<HTMLSpanElement>(null);
  // The photo being taken: waiting (the server's render, family out of
  // frame), running, taken (colour flooded in, so the faces don't
  // develop again), or done (no photo this time: the faces develop as usual).
  const [arrive, setArrive] = useState<'pending' | 'run' | 'taken' | 'done'>('pending');

  // On a phone, open each strip scrolled to its middle, where the strongest stand.
  useEffect(() => {
    photoRef.current?.querySelectorAll<HTMLElement>('.family-photo__lines').forEach(el => {
      if (el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
  }, []);

  // The photo as it stands, top to bottom: the back row's strongest line
  // nearest the artist (so last), the front row's strongest line first.
  const backLines = useMemo(() => [...portrait.back].reverse(), [portrait.back]);
  const backFlat = useMemo(() => backLines.flat(), [backLines]);
  const frontFlat = useMemo(() => portrait.front.flat(), [portrait.front]);
  const inBack = useMemo(() => new Set(backFlat.map(m => m.id)), [backFlat]);

  // The player's list: everyone in the photo, oldest first, the artist in the middle.
  const self = useMemo(() => ({ ...artist, activeFrom: artist.activeFrom ?? null }), [artist]);
  const running = useMemo(() => familyRunningOrder<Stop>(backFlat, self, frontFlat), [backFlat, self, frontFlat]);
  const selfIndex = running.findIndex(s => s.id === artist.id);

  // The family as the player's queues: whole songs, or a few seconds each.
  // Offered first by the player while this page is up.
  const familyQueue = useMemo<Queue>(() => ({
    id: `family:${artist.id}`, title: `${artist.name}'s family`, tracks: running.map(toTrack), stopMs: SONG_MS,
  }), [artist.id, artist.name, running]);
  const samplerQueue = useMemo<Queue>(() => ({
    ...familyQueue, id: `sampler:${artist.id}`, title: 'The family, a few seconds each', stopMs: FAMILY_STOP_MS,
  }), [familyQueue, artist.id]);
  useEffect(() => {
    player.setContext({ queue: familyQueue, start: selfIndex });
    return () => player.clearContext(familyQueue.id);
  }, [familyQueue, selfIndex]);

  const now = usePlayer();
  const current = trackOnAir(now);
  // Whoever in the photo is on air, whatever queue is playing.
  const onAir = current ? running.find(m => m.id === current.id) ?? null : null;
  const playing = onAir !== null;
  const paused = now.paused;
  const sampler = now.at !== null && now.queue?.id === samplerQueue.id;
  // A face pressed is a choice, so it plays even if it's loud (the loud rule).
  const playSongs = (from: number) => player.play(familyQueue, from, true);
  const playFamily = (from = 0, chosen = false) => player.play(samplerQueue, from, chosen);
  // Tapping a face while something plays moves the music to them.
  const playFrom = (i: number) => (sampler ? playFamily(i, true) : playSongs(i));

  // The page listens (lib/music-motion): --energy and --beat on the photo
  // while music plays; the faces dance only to their own family's music.
  const live = playing && !paused;
  // Someone in the family is sounding: they step forward and the rest wait
  // in grey. Not while paused (the players only pause, so a grey that held
  // through a pause never went away), and not for the artist's own song (it
  // greyed the whole family around them).
  const spotlight = live && onAir !== null && onAir.id !== artist.id;
  useEffect(() => {
    const el = photoRef.current;
    return el ? moveWithMusic(el) : undefined;
  }, []);

  // While the family plays, the card shows why whoever's on air is in the photo.
  const onAirSide = onAir && onAir.id !== artist.id
    ? (backFlat.some(m => m.id === onAir.id) ? 'back' : 'front')
    : null;
  const shown: Open = onAir && onAirSide ? { kind: 'member', side: onAirSide, id: onAir.id } : open;
  const shownMember = shown?.kind === 'member' ? shown.id : null;
  const shownSide = shown?.kind === 'member' ? shown.side : null;

  // Whose thread is drawn: whoever's on air, else the face pointed at, else the open one.
  const threadId = playing ? (onAirSide ? onAir!.id : null) : pointed ?? shownMember;

  const toggle = (want: Open) =>
    setOpen(o => (o && want && o.kind === want.kind && o.id === want.id ? null : want));

  // Escape closes the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Whether this is the first time this visit: only known here (reduced
  // motion too), before the first paint, so nothing shows in place first.
  // A first time waits (briefly) for the family's photos to be decoded, so
  // none pops in or stalls the walk halfway; cached ones are ready at once.
  useLayoutEffect(() => {
    if (photographed.has(artist.id) || reducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the visit and reduced motion are only known in the browser; the family waits out of frame until then
      setArrive('done');
      return;
    }
    let live = true;
    const imgs = [...(backdropRef.current?.querySelectorAll<HTMLImageElement>('.face__photo img') ?? [])];
    const ready = Promise.all(imgs.map(img => img.decode().catch(() => {})));
    const waited = new Promise(resolve => setTimeout(resolve, PHOTO_WAIT_MS));
    void Promise.race([ready, waited]).then(() => { if (live) setArrive('run'); });
    return () => { live = false; };
  }, [artist.id]);

  // The family walks in and squeezes into the rows, then the shutter. Each face
  // starts just outside the photo on its own side and walks to its place in
  // a few bobbing steps, overshooting a touch and squashing as it squeezes
  // in. On a phone (rows are strips you swipe) they simply come up into place.
  useLayoutEffect(() => {
    const box = backdropRef.current, photo = photoRef.current;
    if (arrive !== 'run' || !box || !photo) return;
    const b = box.getBoundingClientRect();
    const midX = b.left + b.width / 2;
    const rows = (['back', 'front'] as const).map(side => ({
      side,
      faces: [...box.querySelectorAll<HTMLElement>(`.family-photo__row--${side} .family-photo__faces > li`)]
        .filter(li => !li.querySelector('.face--came-from'))
        .map(li => ({ li, r: li.getBoundingClientRect() }))
        .sort((p, q) => Math.abs(p.r.left + p.r.width / 2 - midX) - Math.abs(q.r.left + q.r.width / 2 - midX)),
    }));
    const count = rows[0].faces.length + rows[1].faces.length;
    const step = count > 1 ? Math.min(WALK_STEP_MS, WALK_SPREAD_MS / (count - 1)) : 0;
    const anims: Animation[] = [];
    let n = 0;
    for (const { side, faces } of rows) {
      for (const { li, r } of faces) {
        const fromLeft = r.left + r.width / 2 < midX;
        const dx = narrow ? 0 : fromLeft ? b.left - r.right - 24 : b.right - r.left + 24;
        const dy = side === 'back' ? -44 : 44;
        const at = WALK_AT + n * step;
        // Three smooth motions layered on one face: the glide to its place
        // (easing out, a touch past it and back), a soft bob for the steps
        // while it travels, and a squash as it squeezes in. Separate curves,
        // so it never changes direction in a jerk.
        anims.push(li.animate(
          [{ transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }, { offset: 0.15, opacity: 1 }, { transform: 'none', opacity: 1 }],
          { duration: WALK_MS, delay: at, easing: 'cubic-bezier(0.22, 0.75, 0.3, 1.06)', fill: 'backwards' },
        ));
        if (!narrow) {
          anims.push(li.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }],
            { duration: WALK_MS * 0.24, delay: at, iterations: 3, easing: 'ease-in-out', composite: 'add' },
          ));
        }
        anims.push(li.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.07, 0.93)' }, { transform: 'scale(1)' }],
          { duration: 280, delay: at + WALK_MS * 0.72, easing: 'ease-in-out', composite: 'add' },
        ));
        n++;
      }
    }
    // Everyone in place: the viewfinder locks and colour floods in (CSS,
    // timed from --shutter-at).
    const shutterAt = (count ? WALK_AT + (count - 1) * step + WALK_MS : 420) + SHUTTER_GAP_MS;
    photo.style.setProperty('--shutter-at', `${shutterAt}ms`);

    const end = () => {
      anims.forEach(a => a.finish());
      photographed.add(artist.id);
      setArrive('taken');
    };
    const timer = setTimeout(end, shutterAt + DEVELOP_MS);
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, end, { capture: true, passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, end, { capture: true }));
      anims.forEach(a => a.cancel());
    };
  }, [arrive, narrow, artist.id]);

  // The card sits under the face it's about, its notch pointing at it, and
  // comes into view when someone opens it (not while the family plays, or
  // the page would jump at every turn).
  useLayoutEffect(() => {
    const card = cardRef.current;
    const host = card?.parentElement;
    // Scoped to the card's own row: two artists who shaped each other stand in both.
    const face = shownMember
      ? photoRef.current?.querySelector<HTMLElement>(`.family-photo__row--${shownSide} [data-face="${shownMember}"] .face__photo`)
      : null;
    if (!card || !host || !face) return;
    const h = host.getBoundingClientRect();
    const f = face.getBoundingClientRect();
    const w = card.offsetWidth;
    const cx = f.left + f.width / 2 - h.left;
    const x = Math.max(0, Math.min(h.width - w, cx - w / 2));
    card.style.marginLeft = `${x}px`;
    card.style.setProperty('--notch-x', `${Math.max(20, Math.min(w - 20, cx - x))}px`);
    if (!playing) card.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [shownMember, shownSide, narrow, playing]);

  // The thread: measured from the face and the portrait as they stand, drawn
  // the way the influence ran, with a dot travelling along it (looping while
  // that face is on air). Set straight on the DOM -- it changes on every hover.
  useLayoutEffect(() => {
    const box = backdropRef.current;
    const path = threadRef.current;
    const dot = dotRef.current;
    if (!box || !path || !dot) return;

    const draw = (animate: boolean) => {
      path.getAnimations().forEach(a => a.cancel());
      dot.getAnimations().forEach(a => a.cancel());
      const face = threadId ? box.querySelector<HTMLElement>(`[data-face="${threadId}"] .face__photo`) : null;
      const me = box.querySelector<HTMLElement>('.family-photo__portrait img');
      if (narrow || !face || !me) {
        path.setAttribute('d', '');
        dot.style.opacity = '0';
        return;
      }
      const b = box.getBoundingClientRect();
      const circle = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top, r: r.width / 2 };
      };
      const f = circle(face);
      const p = circle(me);
      const [from, to] = f.y < p.y ? [f, p] : [p, f];
      const rim = (c: typeof f, toward: typeof f) => {
        const dx = toward.x - c.x;
        const dy = toward.y - c.y;
        const d = Math.hypot(dx, dy) || 1;
        return { x: c.x + (dx / d) * (c.r + 5), y: c.y + (dy / d) * (c.r + 5) };
      };
      const a = rim(from, to);
      const z = rim(to, from);
      const midY = (a.y + z.y) / 2;
      const d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${midY.toFixed(1)}, ${z.x.toFixed(1)} ${midY.toFixed(1)}, ${z.x.toFixed(1)} ${z.y.toFixed(1)}`;
      path.setAttribute('d', d);
      dot.style.offsetPath = `path('${d}')`;
      if (!animate || reducedMotion()) {
        path.style.strokeDasharray = '';
        dot.style.opacity = '0';
        return;
      }
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: THREAD_DRAW_MS, easing: 'ease-out', fill: 'both' });
      dot.animate(
        [{ offsetDistance: '0%', opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { offsetDistance: '100%', opacity: 0 }],
        { duration: THREAD_DOT_MS, delay: THREAD_DRAW_MS / 2, easing: 'ease-in-out', iterations: playing ? Infinity : 1, fill: 'both' },
      );
    };

    draw(true);
    const ro = new ResizeObserver(() => draw(false));
    ro.observe(box);
    return () => ro.disconnect();
  }, [threadId, narrow, playing]);

  const cardId = `${uid}-card`;
  const when = [artist.activeFrom && `Since ${artist.activeFrom}`, country].filter(Boolean).join(' · ');
  const everyone = [...backFlat, ...frontFlat];
  const denials = [...portrait.deniedBack, ...portrait.deniedFront];

  // When each face develops on arrival: the back row, then the front row.
  const developAt = (side: 'back' | 'front', i: number) =>
    (side === 'back' ? i : backFlat.length + 3 + i) * DEVELOP_STEP_MS;

  const card = (m: Member) => (
    <div
      id={cardId}
      ref={cardRef}
      className="family-card"
      role="region"
      aria-live="polite"
      aria-label={`Why ${m.name} is in the photo`}
    >
      <p className="family-card__head">
        <span className="family-card__name">{m.name}</span>
        <span className="family-card__tier">{m.tier}</span>
      </p>
      {m.citation && <p className="family-card__quote">{m.citation}</p>}
      <SourceLink url={m.sourceUrl} print={m.sourcePrint} className="family-card__source" />
      {/* Also while the family plays: starting it stops the player, so it
          first opens this card for real (it may only be up because this
          face is on air), or the card would close under it. */}
      {m.previewUrl && artist.previewUrl && (
        backFlat.includes(m)
          ? <Crossfader left={{ id: m.id, name: m.name, imageUrl: m.imageUrl, previewUrl: m.previewUrl }} right={{ id: artist.id, name: artist.name, imageUrl: artist.imageUrl, previewUrl: artist.previewUrl }} onStart={() => setOpen({ kind: 'member', side: 'back', id: m.id })} />
          : <Crossfader left={{ name: artist.name, imageUrl: artist.imageUrl, previewUrl: artist.previewUrl }} right={{ name: m.name, imageUrl: m.imageUrl, previewUrl: m.previewUrl }} onStart={() => setOpen({ kind: 'member', side: 'front', id: m.id })} />
      )}
      <p className="family-card__actions">
        <Link href={`/artist/${m.id}`} className="family-card__page">
          Their page <span aria-hidden>→</span>
        </Link>
        {m.previewUrl && onAir?.id !== m.id && (
          <button type="button" className="family-card__play" onClick={() => playFamily(running.findIndex(s => s.id === m.id), true)}>
            ▶ Play the family from here
          </button>
        )}
      </p>
    </div>
  );

  const row = (side: 'back' | 'front', lines: Member[][]) => {
    const label = side === 'back' ? 'Who shaped them' : 'Who they shaped';
    const members = lines.flat();
    // Where each face stands in the phone's single strip (strongest in the middle).
    const stripAt = new Map(standInRow([...members].sort((a, b) => a.rank - b.rank)).map((m, i) => [m.id, i]));
    const startOf = (line: number) => lines.slice(0, line).reduce((n, l) => n + l.length, 0);
    const openHere = shown?.kind === 'member' && shown.side === side ? members.find(m => m.id === shown.id) ?? null : null;
    const openLine = openHere ? lines.findIndex(l => l.includes(openHere)) : -1;
    return (
      <div className={`family-photo__row family-photo__row--${side}`}>
        <p className="family-photo__row-label">
          {side === 'front' && <span aria-hidden>↓ </span>}
          {label}
          {side === 'back' && <span aria-hidden> ↓</span>}
        </p>
        {members.length === 0 ? (
          <p className="family-photo__bench">
            {side === 'back'
              ? "Nobody on the map came before them: they're where this line starts."
              : 'Nobody on the map lists them as an influence yet.'}
          </p>
        ) : (
          <div className="family-photo__lines">
            {lines.map((line, li) => (
              <Fragment key={li}>
                <ul className="family-photo__faces">
                  {line.map((m, j) => (
                    <li key={m.id} style={{ '--strip-at': stripAt.get(m.id) } as React.CSSProperties}>
                      <button
                        type="button"
                        data-face={m.id}
                        className={`face face--${m.proof}${onAir?.id === m.id ? ' face--on-air' : ''}${m.id === cameFrom ? ' face--came-from' : ''}`}
                        style={{ '--face': `${FACE_PX[m.proof]}px`, '--develop-at': `${developAt(side, startOf(li) + j)}ms` } as React.CSSProperties}
                        aria-expanded={openHere?.id === m.id}
                        aria-controls={cardId}
                        aria-label={`${m.name}, ${side === 'back' ? 'shaped them' : 'shaped by them'} (${PROOF_WORDS[m.proof]}). Show why`}
                        onClick={() => (playing
                          ? playFrom(running.findIndex(s => s.id === m.id))
                          : toggle({ kind: 'member', side, id: m.id }))}
                        onPointerEnter={() => setPointed(m.id)}
                        onPointerLeave={() => setPointed(p => (p === m.id ? null : p))}
                        onFocus={() => setPointed(m.id)}
                        onBlur={() => setPointed(p => (p === m.id ? null : p))}
                      >
                        {/* One face per name may fly to their page: two artists
                            who shaped each other stand in both rows, and only
                            the back-row face carries the name. */}
                        <ViewTransition name={side === 'front' && inBack.has(m.id) ? undefined : `portrait-${m.id}`} share="morph" default="none">
                          <span className="face__photo">
                            {m.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sizedImageUrl(m.imageUrl, 250)} alt="" width={FACE_PX[m.proof]} height={FACE_PX[m.proof]} />
                            )}
                          </span>
                        </ViewTransition>
                        <span className="face__name">
                          {m.name}
                          <span className="face__go" aria-hidden>›</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {!narrow && li === openLine && openHere && card(openHere)}
              </Fragment>
            ))}
          </div>
        )}
        {narrow && openHere && card(openHere)}
      </div>
    );
  };

  const names = (members: Member[]) =>
    members.map((m, i) => (
      <Fragment key={m.id}>
        {i > 0 && ', '}
        <Link href={`/artist/${m.id}`}>{m.name}</Link>
      </Fragment>
    ));

  const openDenial: Denial | null = shown?.kind === 'denial' ? denials.find(d => d.id === shown.id) ?? null : null;

  return (
    <section ref={photoRef} className={`family-photo${spotlight ? ' family-photo--spotlight' : ''}${live ? ' family-photo--live' : ''}`} data-arrive={arrive} aria-labelledby={`${uid}-name`}>
      <div className="family-photo__print">
        <span ref={finderRef} className="family-photo__finder" aria-hidden><i /><i /><i /><i /></span>
        <div className="family-photo__backdrop" ref={backdropRef}>
          <svg className="family-thread" aria-hidden>
            <path ref={threadRef} />
          </svg>
          <span ref={dotRef} className="family-thread__dot" aria-hidden />

          {everyone.length > 0 && (
            <p className="family-photo__hint">Tap any face to see why they&apos;re in the photo</p>
          )}

          {row('back', backLines)}

          <div className={`family-photo__self${onAir?.id === artist.id ? ' family-photo__self--on-air' : ''}`}>
            <figure className="family-photo__portrait">
              {artist.imageUrl && (
                <ViewTransition name={`portrait-${artist.id}`} share="morph" default="none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sizedImageUrl(artist.imageUrl, 500)}
                    srcSet={imageSrcSet(artist.imageUrl)}
                    sizes="(max-width: 700px) 60vw, 240px"
                    alt={artist.name}
                    width={240}
                    height={240}
                  />
                </ViewTransition>
              )}
              <PhotoCredit credit={artist.imageCredit} className="photo-credit--portrait" />
            </figure>

            <div className="family-photo__about">
              <h1 id={`${uid}-name`} className="family-photo__name">{artist.name}</h1>
              {when && <p className="family-photo__when">{when}</p>}
              {genres.length > 0 && (
                <p className="family-photo__genres">
                  {genres.map((g, i) => (
                    <span key={g.id}>
                      {i > 0 && <span aria-hidden> · </span>}
                      <Link href={`/genre/${g.id}`}>{g.name}</Link>
                    </span>
                  ))}
                </p>
              )}
              {intro && (
                <p className="family-photo__intro">
                  {intro}{' '}
                  <a href="#sleeve-notes" className="family-photo__more">
                    Their story <span aria-hidden>↓</span>
                  </a>
                </p>
              )}

              <div className="zine__apps family-photo__apps">
                <StreamingLinks
                  query={artist.signatureSong ? `${artist.name} ${artist.signatureSong}` : artist.name}
                  label="Full songs on"
                  named
                />
              </div>
              <Link href={`/?artist=${artist.id}`} className="family-photo__map">
                See them on the map <span aria-hidden>→</span>
              </Link>
            </div>

            <PlayerDevice variant="docked">
              {!now.heard && (
                <p className="pocket__note">
                  <svg className="pocket__note-arrow" viewBox="0 0 32 34" aria-hidden>
                    <path d="M12 32 C7 22 9 12 17 4 M9 7 L17 4 L20 12" />
                  </svg>
                  It really plays! Press the middle
                </p>
              )}
              <button type="button" className="pocket__family" onClick={() => (sampler ? player.stop() : playFamily(0))}>
                {sampler ? '■ Stop the family' : '▶ Play the family'}
                <span>{sampler ? 'a few seconds each' : `${running.length} artists, a few seconds each, oldest first`}</span>
              </button>
            </PlayerDevice>
          </div>

          {row('front', portrait.front)}
        </div>

        <div className="family-photo__caption">
          {backFlat.length > 0 && (
            <p><span className="family-photo__caption-row">Behind them, left to right:</span> {names(backFlat)}.</p>
          )}
          {frontFlat.length > 0 && (
            <p>
              <span className="family-photo__caption-row">In front, left to right:</span> {names(frontFlat)}.
              {portrait.frontMore.length > 0 && (
                <> <span className="family-photo__caption-row">And {portrait.frontMore.length} more:</span> {names(portrait.frontMore)}.</>
              )}
            </p>
          )}
          {denials.length > 0 && (
            <p>
              <span className="family-photo__caption-row">Not in the photo:</span>{' '}
              {denials.map((d, i) => (
                <Fragment key={d.id}>
                  {i > 0 && ', '}
                  <button
                    type="button"
                    className="family-photo__denied"
                    aria-expanded={openDenial?.id === d.id}
                    aria-controls={`${cardId}-no`}
                    onClick={() => toggle({ kind: 'denial', id: d.id })}
                  >
                    <s>{d.name}</s>
                  </button>
                </Fragment>
              ))}
              . Often assumed; they&apos;ve said no.
            </p>
          )}
          {openDenial && (
            <div id={`${cardId}-no`} className="family-card family-card--denial" role="region" aria-label={`Why ${openDenial.name} is not in the photo`}>
              <p className="family-card__head">
                <span className="family-card__name">{openDenial.name}</span>
                <span className="family-card__tier">{openDenial.contested ? 'Denied, though contested' : 'Denied'}</span>
              </p>
              <p className="family-card__quote">{openDenial.citation}</p>
            </div>
          )}
          {everyone.length > 0 && (
            <p className="family-photo__legend">
              The bigger the face, the stronger the proof: <span className="family-photo__legend-big">they said it themselves</span>
              <span aria-hidden> · </span>reported<span aria-hidden> · </span>
              <span className="family-photo__legend-small">a critic, or widely accepted</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
