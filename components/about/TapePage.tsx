'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AboutRoom, AboutTape, TapeTrackView } from '@/lib/about-tape';
import Room from '@/components/artist/backline/Room';
import { player, usePlayer } from '@/lib/player';
import { IN_VIEW } from '@/components/ui/Reveal';
import TapeCase from './TapeCase';
import { Static, Disappear, RoadIn, Rotation } from './SideA';
import TwoDays from './TwoDays';
import { Dig, Learned, OneFamily, Between, TapeEnd } from './SideB';

// The About page: the maker's story as a mixtape for the visitor. Each part
// of the story is a track; pressing play once starts the tape, and from then
// on the music follows the reader down the page: scrolling into a track
// fades into its song (lib/player glide), the silent first track fades the
// music down (hush). A pause from anywhere -- the pocket player included --
// holds the tape until play is pressed again.

const FOLLOW_MS = 650; // a track must stay in the middle of the screen this long before its song takes over

interface TapeCtl {
  tape: AboutTape;
  /** Which track of the tape is sounding (queue index), or null. */
  onAir: number | null;
  loaded: boolean;
  /** Start the tape at a song, or pause/resume it if that song is on. */
  play: (at: number) => void;
  /** Start the tape where the reader is. */
  start: () => void;
}

const Ctx = createContext<TapeCtl | null>(null);
export const useTape = () => useContext(Ctx)!;

export default function TapePage({ tape, room }: { tape: AboutTape; room: AboutRoom }) {
  const now = usePlayer();
  const loaded = now.queue?.id === tape.queue.id && now.at !== null;
  const onAir = loaded && !now.paused ? now.at : null;
  const [current, setCurrent] = useState(0);
  // Past the opening, the reader is reading: the room's lights go down
  // until the band plays (globals, .tape[data-reading]).
  const [reading, setReading] = useState(false);
  useEffect(() => {
    const caseEl = document.querySelector('.tcase');
    if (!caseEl) return;
    const io = new IntersectionObserver(([e]) => setReading(!e.isIntersecting), { rootMargin: '-120px 0px 0px 0px' });
    io.observe(caseEl);
    return () => io.disconnect();
  }, []);
  const hushed = useRef(false);
  const nowRef = useRef(now);
  useEffect(() => { nowRef.current = now; });

  // Which track is in the middle of the screen, held a moment so a quick
  // scroll past doesn't skip through songs.
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-track]')];
    let timer = 0;
    const io = new IntersectionObserver(entries => {
      const hit = entries.filter(e => e.isIntersecting).pop();
      if (!hit) return;
      const n = Number((hit.target as HTMLElement).dataset.track);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCurrent(n), FOLLOW_MS);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    els.forEach(el => io.observe(el));
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, []);

  // The tape follows the reader.
  useEffect(() => {
    const n = nowRef.current;
    if (n.queue?.id !== tape.queue.id || n.at === null) return;
    if (n.paused && !hushed.current) return; // paused by the visitor: leave it be
    const track = tape.tracks[current];
    // Only the silent opening track hushes the tape; a later track with no
    // song of its own (How I find new music, whose crate plays its own
    // records) lets the song before it play on.
    if (track.songs.length === 0) {
      if (current === 0 && !n.paused) { hushed.current = true; player.hush(); }
      return;
    }
    if (n.paused) { hushed.current = false; player.glide(track.songs[0].at); return; }
    if (!track.songs.some(s => s.at === n.at)) player.glide(track.songs[0].at);
  }, [current, tape]);

  // A pause pressed while the tape plays is the visitor's own.
  useEffect(() => { if (loaded && !now.paused) hushed.current = false; }, [loaded, now.paused]);

  const ctl: TapeCtl = {
    tape,
    onAir,
    loaded,
    play: at => {
      if (loaded && now.at === at) { if (now.paused) player.resume(); else player.pause(); return; }
      hushed.current = false;
      if (loaded) player.glide(at); else player.play(tape.queue, at);
    },
    start: () => {
      if (loaded) { if (now.paused) player.resume(); else player.pause(); return; }
      const here = tape.tracks[current].songs[0] ?? tape.tracks.find(t => t.songs.length)!.songs[0];
      hushed.current = false;
      player.play(tape.queue, here.at);
    },
  };

  const section = (id: string, body: ReactNode) => {
    const t = tape.tracks.find(x => x.id === id)!;
    return <TrackSection key={id} track={t} index={tape.tracks.indexOf(t)}>{body}</TrackSection>;
  };

  return (
    <Ctx.Provider value={ctl}>
      {/* Their room, round the tape: a tap on the bass or the guitar starts
          the tape where the reader is, and the band plays along with it. */}
      <Room
        backline={room.backline}
        genres={room.genres}
        finish={room.finish}
        ribbon={room.ribbon}
        seed="about"
        page=".tape"
        soundcheck={false}
        onPlay={ctl.start}
        hint="Tap the bass or the guitar to start the tape: the band plays along."
      />
      <div className="tape__dim" aria-hidden />
      <div className="tape" data-playing={onAir !== null || undefined} data-reading={reading || undefined}>
        <TapeCase />
        <TrackLabel current={tape.tracks[current]} />
        <div className="tape__side tape__side--a">
          {section('static', <Static />)}
          {section('disappear', <Disappear />)}
          {section('expanding', <RoadIn />)}
          {section('rotation', <><Rotation /><TwoDays /></>)}
        </div>
        <div className="tape__side tape__side--b">
          <div className="tape__why">
            <p className="tape__flip">Side B <span>{tape.sides.B}</span></p>
            {tape.sideBWhy.map((w, i) => <p key={i} className="tape__why-words">{w}</p>)}
          </div>
          {section('dig', <Dig />)}
          {section('learned', <Learned />)}
          {section('one-family', <OneFamily />)}
          {section('between', <Between />)}
          {section('end', <TapeEnd />)}
        </div>
      </div>
    </Ctx.Provider>
  );
}

/** One track of the tape: its number, its name, its songs, then the part of
 *  the story it tells. `data-reveal` goes to "in" once its top is in view. */
function TrackSection({ track, index, children }: { track: TapeTrackView; index: number; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'wait' | 'in'>('wait');
  const { play, onAir } = useTape();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setState('in'); io.disconnect(); }
    }, IN_VIEW);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      id={`track-${track.id}`}
      className={`ttrack ttrack--${track.id}`}
      data-track={index}
      data-reveal={state}
      aria-labelledby={`track-${track.id}-title`}
    >
      <header className="ttrack__head">
        <h2 id={`track-${track.id}-title`} className="ttrack__title">{track.heading}</h2>
        {track.songs.length > 0 && (
          <ul className="ttrack__songs">
            {track.songs.map(s => (
              <li key={s.key}>
                <button type="button" className="ttrack__song" data-on={onAir === s.at || undefined} onClick={() => play(s.at)}>
                  <span className="ttrack__song-icon" data-pause={onAir === s.at || undefined} aria-hidden />
                  <span><b>{s.title}</b> &middot; {s.artistName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </header>
      {track.words.length > 0 && (
        <div className="ttrack__words">
          {track.words.map((w, i) => <p key={i}>{w}</p>)}
        </div>
      )}
      {children}
    </section>
  );
}

/** Where you are on the tape, stuck under the nav once the case has
 *  scrolled away: the side and track, a counter that runs with the scroll
 *  (written straight to the page, not through React), and the tape's play
 *  button. Tapping the name opens the track list. */
function TrackLabel({ current }: { current: TapeTrackView }) {
  const { tape, start, loaded, onAir } = useTape();
  const counter = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const caseEl = document.querySelector('.tcase');
    if (!caseEl) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { rootMargin: '-120px 0px 0px 0px' });
    io.observe(caseEl);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('.tape-overlay');
    if (!scroller) return;
    let raf = 0;
    const write = () => {
      raf = 0;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const v = max > 0 ? Math.round((scroller.scrollTop / max) * 999) : 0;
      if (counter.current) counter.current.textContent = String(v).padStart(3, '0');
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(write); };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    write();
    return () => { scroller.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="tlabel" data-shown={shown || undefined} aria-hidden={!shown || undefined}>
      <button type="button" className="tlabel__play" onClick={start} aria-label={onAir !== null ? 'Pause the tape' : loaded ? 'Carry on with the tape' : 'Play the tape'}>
        <span className="tlabel__icon" data-pause={onAir !== null || undefined} aria-hidden />
      </button>
      <button type="button" className="tlabel__now" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="tlabel__side">Side {current.side} &middot; {String(current.n).padStart(2, '0')}</span>
        <span className="tlabel__name">{current.title}</span>
      </button>
      <span className="tlabel__counter" aria-hidden><span ref={counter}>000</span></span>
      {open && (
        <ol className="tlabel__list">
          {tape.tracks.map(t => (
            <li key={t.id}>
              <a href={`#track-${t.id}`} onClick={() => setOpen(false)}>
                <span>{t.side}{t.n}</span> {t.title}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
