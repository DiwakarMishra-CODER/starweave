'use client';

/* eslint-disable @next/next/no-img-element -- small faces on the player's screen, sized by lib/image-url */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useGraphData } from '@/components/graph/GraphDataProvider';
import StreamingLinks from '@/components/ui/StreamingLinks';
import { sizedImageUrl } from '@/lib/image-url';
import { onAir, player, usePlayer, type Queue, type Track } from '@/lib/player';
import { artistThenFamily, searchArtists, shuffled, stations, wholeStory } from '@/lib/player-library';
import { BackIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from './icons';

// The site's music player (lib/player) as a pocket player with a click
// wheel, the kind people carried their whole record collection on. One
// device, two places: docked in an artist's family photo, and floating in
// the corner of every page (FloatingPlayer), opened from its folded puck.
// - The screen: now playing, or the library -- this page's family (on an
//   artist page), the whole story oldest first, a station per realm,
//   shuffle, search -- and any list's songs. Tap a row to play it.
// - The wheel: turn it (drag round, or the arrow keys on it) to move
//   through a list; the middle button plays, pauses or chooses; MENU goes
//   back, and so does the ‹ on the screen; ⏮ ⏭ skip.

type Screen =
  | { kind: 'now' }
  | { kind: 'menu' }
  | { kind: 'stations' }
  | { kind: 'search' }
  | { kind: 'list'; queue: Queue; from: 'menu' | 'stations' };

interface Row {
  key: string;
  label: string;
  sub?: string;
  /** On air right now. */
  current?: boolean;
  act: () => void;
}

interface Props {
  variant: 'docked' | 'floating';
  /** Under the device: the docked player's note and "Play the family". */
  children?: React.ReactNode;
}

const STEP_DEG = 28; // how far round the wheel moves the selection one place

export default function PlayerDevice({ variant, children }: Props) {
  const s = usePlayer();
  const { data } = useGraphData();
  // Opened from the corner to choose something: the library, unless
  // something's already playing.
  const [screen, setScreen] = useState<Screen>(() =>
    variant === 'floating' && onAir(s) === null ? { kind: 'menu' } : { kind: 'now' });
  const [sel, setSel] = useState(0);
  const [query, setQuery] = useState('');
  const deviceRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const drag = useRef<{ angle: number; spun: number } | null>(null);

  const story = useMemo(() => (data ? wholeStory(data.artists) : null), [data]);
  const allStations = useMemo(() => (data ? stations(data.artists) : []), [data]);

  // One player, one state: docked or floating, it shows and controls
  // whatever is on air. (Docked, it used to treat music that wasn't this
  // artist's family as not playing: its ⏭ only flipped through the family
  // on the screen, while the real song played on with nothing to skip it
  // -- the floating player steps aside while this one is on screen.) The
  // family is still what it offers when nothing plays, and "Play the
  // family" switches to it.
  const current = onAir(s);
  const playing = current !== null;
  const live = playing && !s.paused;
  // While its song is still on its way, it says so instead of pretending to play.
  const loading = live && s.loading;
  // What play starts when nothing is on: a "keep going" offer if there is
  // one, else this page's family at the artist, else the whole story.
  const offer = (s.offer && { queue: s.offer.queue, start: 0 }) ?? s.context ?? (story ? { queue: story, start: 0 } : null);
  // Before anything plays, ⏮ ⏭ step through what's on offer, and play
  // plays whoever is on the screen (kept per list, so a new page starts
  // at its own artist).
  const [pick, setPick] = useState<{ id: string; at: number } | null>(null);
  const offerAt = offer ? (pick && pick.id === offer.queue.id ? pick.at : offer.start) : 0;
  const shown: Track | null = current ?? (offer ? offer.queue.tracks[offerAt] : null);
  // Whoever's on the screen links to their page, if they're on the map.
  const shownOnMap = !!shown && !!data?.artists.some(a => a.id === shown.id);

  const go = (next: Screen, at = 0) => { setScreen(next); setSel(at); };
  const playFrom = (queue: Queue, from: number) => { player.play(queue, from); go({ kind: 'now' }); };
  const toggle = () => {
    if (!playing) { if (offer) player.play(offer.queue, offerAt); }
    else if (s.paused) player.resume();
    else player.pause();
  };

  // The rows on the screen, for whichever list it shows.
  const results = screen.kind === 'search' && data ? searchArtists(data.artists, query, 6) : [];
  let rows: Row[] = [];
  if (screen.kind === 'menu') {
    rows = [
      ...(s.context ? [{
        key: 'context',
        label: s.context.queue.title,
        sub: `${s.context.queue.tracks.length}`,
        act: () => go({ kind: 'list', queue: s.context!.queue, from: 'menu' }, s.context!.start + 1),
      }] : []),
      ...(story ? [{
        key: 'story',
        label: 'The whole story',
        sub: `${story.tracks.length}`,
        act: () => go({ kind: 'list', queue: story, from: 'menu' }),
      }] : []),
      { key: 'stations', label: 'Stations', sub: `${allStations.length}`, act: () => go({ kind: 'stations' }) },
      { key: 'shuffle', label: 'Shuffle everything', act: () => { if (data) playFrom(shuffled(data.artists), 0); } },
      { key: 'search', label: 'Search', act: () => { setQuery(''); go({ kind: 'search' }); } },
    ];
  } else if (screen.kind === 'stations') {
    rows = allStations.map(q => ({
      key: q.id,
      label: q.title,
      sub: `${q.tracks.length}`,
      act: () => go({ kind: 'list', queue: q, from: 'stations' }),
    }));
  } else if (screen.kind === 'list') {
    const q = screen.queue;
    rows = [
      { key: '#all', label: 'Play all', act: () => playFrom(q, 0) },
      ...q.tracks.map((t, i) => ({
        key: t.id,
        label: t.name,
        sub: t.activeFrom ? String(t.activeFrom) : '',
        current: s.queue?.id === q.id && s.at === i,
        act: () => playFrom(q, i),
      })),
    ];
  } else if (screen.kind === 'search') {
    rows = results.map(a => ({
      key: a.id,
      label: a.name,
      sub: a.previewUrl ? (a.activeFrom ? String(a.activeFrom) : '') : 'no song',
      act: () => {
        const q = data && artistThenFamily(data, a.id);
        if (q) playFrom(q, 0);
      },
    }));
  }

  // The docked player tells the floating one when it's on screen, so there's
  // only ever one player in view.
  useEffect(() => {
    const el = deviceRef.current;
    if (variant !== 'docked' || !el) return;
    const io = new IntersectionObserver(([e]) => player.setDocked(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => { io.disconnect(); player.setDocked(false); };
  }, [variant]);

  // The screen's progress bar (--player-progress, set every frame by lib/player).
  useEffect(() => {
    const el = screenRef.current;
    return el ? player.showProgressOn(el) : undefined;
  }, []);

  // Keep the selected row in view on the screen's list.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.children[sel] as HTMLElement | undefined;
    if (!list || !item) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [sel, screen]);

  // Turning the wheel moves through the list on screen; on the now-playing
  // screen it opens what's playing (or on offer) at the song on air.
  const move = (by: number) => {
    if (screen.kind === 'now') {
      const q = playing ? s.queue : offer?.queue;
      if (!q) return;
      const at = (playing ? s.at ?? 0 : offerAt) + 1;
      go({ kind: 'list', queue: q, from: 'menu' }, Math.min(q.tracks.length, Math.max(1, at + by)));
      return;
    }
    setSel(i => Math.min(rows.length - 1, Math.max(0, i + by)));
  };
  const back = () => {
    if (screen.kind === 'now') go({ kind: 'menu' });
    else if (screen.kind === 'menu') go({ kind: 'now' });
    else if (screen.kind === 'list' && screen.from === 'stations') {
      go({ kind: 'stations' }, Math.max(0, allStations.findIndex(q => q.id === screen.queue.id)));
    } else go({ kind: 'menu' });
  };
  const centre = () => {
    if (screen.kind === 'now') toggle();
    else rows[sel]?.act();
  };
  const skip = (by: 1 | -1) => {
    if (playing) { if (by > 0) player.next(); else player.prev(); }
    else if (screen.kind !== 'now') move(by);
    else if (offer) {
      const n = offer.queue.tracks.length;
      setPick({ id: offer.queue.id, at: (offerAt + by + n) % n });
    }
  };

  const angleOf = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { angle: angleOf(e), spun: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = angleOf(e);
    let delta = a - d.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.angle = a;
    d.spun += delta;
    while (d.spun >= STEP_DEG) { move(1); d.spun -= STEP_DEG; }
    while (d.spun <= -STEP_DEG) { move(-1); d.spun += STEP_DEG; }
  };
  const onUp = () => { drag.current = null; };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); centre(); }
  };

  const title =
    screen.kind === 'now' ? (!playing ? null : s.paused ? 'Paused' : loading ? 'Loading…' : current?.note ?? s.queue!.title)
    : screen.kind === 'menu' ? 'Music'
    : screen.kind === 'stations' ? 'Stations'
    : screen.kind === 'search' ? 'Search'
    : screen.queue.title;
  const count = screen.kind === 'now'
    ? (playing ? `${s.at! + 1} of ${s.queue!.tracks.length}` : '')
    : rows.length > 0 && screen.kind === 'list' ? `${Math.max(1, sel)} of ${rows.length - 1}` : '';
  const centrePlays = screen.kind !== 'now' || !live;
  const sliderText = screen.kind === 'now' ? (shown?.name ?? '') : (rows[sel]?.label ?? '');

  const list = (
    <ol className="pocket__list" ref={listRef}>
      {rows.map((r, i) => (
        <li key={r.key} className={i === sel ? 'is-chosen' : undefined}>
          <button type="button" className="pocket__list-item" onClick={() => { setSel(i); r.act(); }} aria-current={r.current ? 'true' : undefined}>
            <span className="pocket__list-name">
              {r.current && <span aria-hidden>♪ </span>}
              {r.label}
            </span>
            {r.sub && <span className="pocket__list-year">{r.sub}</span>}
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={`pocket pocket--${variant}${s.heard ? '' : ' pocket--fresh'}${live ? ' pocket--live' : ''}${loading ? ' pocket--loading' : ''}`}>
      <div className="pocket__device" ref={deviceRef}>
        <div className="pocket__screen" ref={screenRef}>
          <p className="pocket__status">
            {screen.kind !== 'now' && (
              <button type="button" className="pocket__back" onClick={back} aria-label={screen.kind === 'menu' ? 'Back to now playing' : 'Back'}>
                <BackIcon className="pocket__back-icon" />
              </button>
            )}
            <span className="pocket__status-now">
              {screen.kind === 'now' && live && !loading && <span className="pocket__eq" aria-hidden><i /><i /><i /><i /></span>}
              {/* One line, cut with an ellipsis: a long title ("From For Your
                  Pleasure") wrapping to two lines pushed the name and track
                  down into the Full song links. */}
              <span className="pocket__status-text">
                {title ?? <span>Press <span className="pocket__blink">▶&#xFE0E;</span> to play</span>}
              </span>
            </span>
            {count && <span>{count}</span>}
          </p>

          {screen.kind === 'now' ? (
            <div className="pocket__now">
              <span className="pocket__face">
                {shown?.imageUrl && <img src={sizedImageUrl(shown.imageUrl, 250)} alt="" width={46} height={46} />}
              </span>
              <span className="pocket__what">
                {/* To their page, when they're on the map. */}
                {shownOnMap ? (
                  <Link href={`/artist/${shown!.id}`} className="pocket__name pocket__name--link">{shown!.name} <span aria-hidden>&rsaquo;</span></Link>
                ) : (
                  <span className="pocket__name">{shown?.name ?? 'Loading…'}</span>
                )}
                {shown && (
                  <span className="pocket__track">
                    {shown.previewUrl ? (shown.previewTrack ?? 'A song') : 'No song to play'}
                    {shown.activeFrom ? ` · ${shown.activeFrom}` : ''}
                  </span>
                )}
                {/* The previews are 30 seconds: the whole song is a tap away. */}
                {shown?.previewUrl && shown.previewTrack && (
                  <span className="pocket__full">
                    <StreamingLinks query={`${shown.name} ${shown.previewTrack}`} size="xs" label="Full song" />
                  </span>
                )}
              </span>
            </div>
          ) : screen.kind === 'search' ? (
            <div className="pocket__search">
              <input
                className="pocket__search-input"
                type="search"
                value={query}
                autoFocus
                placeholder="Type a name"
                aria-label="Search for an artist to play"
                onChange={e => { setQuery(e.target.value); setSel(0); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); rows[sel]?.act(); }
                  else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
                  else if (e.key === 'Escape') { e.preventDefault(); back(); }
                }}
              />
              {list}
            </div>
          ) : list}

          {screen.kind === 'now' && playing && <span className="pocket__progress" aria-hidden />}
        </div>

        <div className="pocket__wheel">
          {/* The ring itself: turn it (drag round, or arrow keys). The keys
              sit on it as siblings, so a slider never holds buttons. */}
          <div
            className="pocket__ring"
            role="slider"
            tabIndex={0}
            aria-label="Click wheel: turn to move through the list, Enter to choose"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, rows.length - 1)}
            aria-valuenow={screen.kind === 'now' ? 0 : sel}
            aria-valuetext={sliderText}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
          />
          <button type="button" className="pocket__key pocket__key--menu" onClick={back} aria-label={screen.kind === 'now' ? 'Menu' : 'Back'}>
            Menu
          </button>
          <button type="button" className="pocket__key pocket__key--prev" onClick={() => skip(-1)} aria-label="Previous">
            <PrevIcon className="pocket__icon" />
          </button>
          <button type="button" className="pocket__key pocket__key--next" onClick={() => skip(1)} aria-label="Next">
            <NextIcon className="pocket__icon" />
          </button>
          {/* The wheel's own play/pause, kept so it looks like the real
              thing; the middle button is the one announced. */}
          <button type="button" className="pocket__key pocket__key--play" onClick={toggle} aria-hidden tabIndex={-1}>
            <PlayIcon className="pocket__icon pocket__icon--small" />
            <PauseIcon className="pocket__icon pocket__icon--small" />
          </button>
          <button
            type="button"
            className="pocket__centre"
            onClick={centre}
            aria-label={screen.kind !== 'now' ? `Choose ${rows[sel]?.label ?? ''}` : live ? 'Pause' : `Play ${shown?.name ?? ''}`}
          >
            {centrePlays ? <PlayIcon className="pocket__centre-icon" /> : <PauseIcon className="pocket__centre-icon" />}
          </button>
        </div>

        {variant === 'docked' && (
          <svg className="pocket__cable" viewBox="0 0 120 90" aria-hidden>
            <path d="M60 0 C60 30 20 28 18 56 C16 76 36 84 52 86" />
            <circle cx="56" cy="86" r="4" />
          </svg>
        )}
      </div>

      {children && <div className="pocket__extras">{children}</div>}
    </div>
  );
}
