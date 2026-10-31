'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GraphData } from '@/data/types';
import { LOUD_GAIN, isLoudArtist } from '@/lib/player';
import { requestFullIntro, storyCamera, storyFrame } from '@/lib/story-store';
import { readMs, roadToRoot, stepWords, TOUR_DEFAULT, TOUR_PICKS } from '@/lib/tour';
import { findBestSourcedPath } from '@/lib/graph-utils';
import { familyDrawMs, familyOf, FAMILY_DRAW_STAGGER_FAST_MS } from '@/lib/family';
import { sizedImageUrl } from '@/lib/image-url';
import { useCoarsePointer } from '@/lib/use-media-query';
import { useAudioFocus } from '@/lib/audio-focus';
import { resolveNodeColor } from '@/lib/colors';
import { PlayIcon, StopIcon } from '@/components/player/icons';

// "How it works": a visitor picks an artist and walks their music back, one
// influence at a time, to the Velvet Underground — and learns the map by
// using it on the way. Zooming in to find them, tapping a star, reading a
// family, following a line, the side panel, zooming back out to see the
// realms, then a look at the tools -- and last, the music player in the
// corner, which holds every song on the map.
//
// Show, don't tell: each step is one plain instruction while the visitor
// acts, or one line while the picture holds still. The map itself points
// (rings round a star, a pulsing line, a lit road — drawn by ForceGraph from
// storyFrame), and a ghost of the gesture shows how.
//
// The map does the real work: the tour selects and clears through GraphView's
// own handlers, so what the visitor learns is exactly what clicking does.

type Step =
  | 'pick'     // choose someone
  | 'find'     // zoom in to them
  | 'tap'      // tap them
  | 'family'   // their family draws itself (no words while it moves)
  | 'named'    // …then what it is
  | 'walk'     // tap the one who shaped them
  | 'said'     // what that link is, in somebody's words
  | 'arrive'   // the road's end
  | 'panel'    // every star has its story
  | 'dive'     // the camera goes in close on where they arrived
  | 'zoomout'  // zoom back out
  | 'realms'   // the worlds light one at a time, then together (no words while they do)
  | 'worlds'   // …each colour is a world
  | 'ask'      // still: how do you get from their artist to one from another world?
  | 'connect'  // Connect two, running by itself: the answer, one artist at a time
  | 'linked'   // …how many steps, and the button that does it
  | 'music'    // every song on the map is in the player in the corner
  | 'done';    // your turn

interface Props {
  data: GraphData;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
  /** The side panel: open only for the step that shows it. */
  onPanel: (open: boolean) => void;
  /** The map's own controls: hidden while the tour points elsewhere. */
  onChrome: (shown: boolean) => void;
  /** Connect two artists, as the map's own control does. */
  onFindPath: (from: string, to: string) => void;
  onEnd: () => void;
}

const FIND_ZOOM = 3.5;        // close enough that dots have become faces
const ZOOMED_OUT = 2.3;       // back at the whole map
const ZOOM_FOR_ME = 4.4;
const HELP_AFTER_MS = 7000;   // then offer to do it for them
const DIVE_ZOOM = 4.2;
const SAID_DELAY_MS = 900;    // the camera arrives before the words do
const FLOW_MS = 1500;
const REALMS_MS = 4200;
const HOP_MS = 650;           // the thread reaching one more artist
const PREVIEW_MS = 5000;      // the picker's taste of a song

// Who Connect two reaches for: someone from another corner of the map, so
// the thread crosses worlds. The first that fits wins.
const CONNECT_TO = ['charli-xcx', 'bon-iver', 'aphex-twin', 'fugazi', 'joni-mitchell', 'slowdive', 'kraftwerk'];
// A thread worth watching: long enough to cross the map, short enough to follow.
const THREAD_MIN = 3;
const THREAD_MAX = 6;

export default function Tour({ data, selectedId, onSelect, onClear, onPanel, onChrome, onFindPath, onEnd }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [artist, setArtist] = useState<string | null>(null);
  const [road, setRoad] = useState<string[]>([]);
  const [hop, setHop] = useState(0);
  const [help, setHelp] = useState(false);
  const coarse = useCoarsePointer();

  const hintRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  const endedRef = useRef(false);

  const byId = useMemo(() => new Map(data.artists.map(a => [a.id, a])), [data]);
  const songCount = useMemo(() => data.artists.filter(a => a.previewUrl).length, [data]);
  const name = useCallback((id: string | null | undefined) => (id ? byId.get(id)?.name ?? id : ''), [byId]);

  const end = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    storyFrame.pulse = [];
    storyFrame.pulseLine = null;
    storyFrame.route = null;
    storyFrame.realms = -1;
    storyFrame.flow = null;
    document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));
    document.querySelector('.player-float')?.classList.remove('tour-spotlight', 'tour-shown');
    storyFrame.tour = false;
    onPanel(true);
    onChrome(true);
    onEnd();
  }, [onPanel, onChrome, onEnd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') end(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [end]);

  // The map's heartbeat rests for the whole tour, not just while a step
  // has something lit (ForceGraph's ambient level reads storyFrame.tour).
  useEffect(() => {
    storyFrame.tour = true;
    return () => { storyFrame.tour = false; };
  }, []);

  // Leaving mid-tour (a nav link): tidy up after it. GraphView ends the tour
  // itself when the visitor leaves the map.
  useEffect(() => () => {
    storyFrame.pulse = [];
    storyFrame.pulseLine = null;
    storyFrame.route = null;
    storyFrame.realms = -1;
    storyFrame.flow = null;
    document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));
    document.querySelector('.player-float')?.classList.remove('tour-spotlight', 'tour-shown');
  }, []);

  // The map's own controls come back for the last word, where the one that
  // finds threads is pointed at.
  useEffect(() => { onChrome(step === 'linked' || step === 'done'); }, [step, onChrome]);
  useEffect(() => { onPanel(step === 'panel'); }, [step, onPanel]);
  // Words go to the top when what they're about sits low on the screen.
  const [captionTop, setCaptionTop] = useState(false);

  // Who the finale connects their artist to, and the thread between them.
  const finale = useMemo(() => {
    if (!artist) return null;
    const realm = byId.get(artist)?.realm;
    for (const id of CONNECT_TO) {
      if (id === artist || !byId.has(id) || byId.get(id)?.realm === realm) continue;
      const thread = findBestSourcedPath(artist, id, data.edges);
      if (thread && thread.length >= THREAD_MIN && thread.length <= THREAD_MAX) return thread;
    }
    return null;
  }, [artist, byId, data]);

  const choose = (id: string) => {
    setArtist(id);
    setRoad(roadToRoot(data, id) ?? [id]);
    setHop(0);
    onClear();
    storyCamera.overview?.(700);
    setStep('find');
  };

  // Each step's clock: what the map points at, what counts as done, and the
  // ghost of the gesture placed beside its target. Checks run per frame and
  // read the selection through a ref, so moving on is a plain state change
  // from an animation callback.
  useEffect(() => {
    if (step === 'pick' || !artist) return;
    const started = performance.now();
    let raf = 0;
    let moved = false;
    let offered = false;
    let dived = false;
    let started2 = false; // a step's one-off action has run
    const cur = road[hop];
    const next = road[hop + 1];
    const root = road[road.length - 1];
    const go = (s: Step) => {
      if (moved) return;
      moved = true;
      setHelp(false);
      setStep(s);
    };
    const offer = (t: number) => {
      if (!offered && t > HELP_AFTER_MS) { offered = true; setHelp(true); }
    };
    const onScreen = (p: { x: number; y: number } | null) =>
      !!p && p.x > 40 && p.x < window.innerWidth - 40 && p.y > 80 && p.y < window.innerHeight - 40;
    const placeHint = (p: { x: number; y: number } | null) => {
      const el = hintRef.current;
      if (!el) return;
      if (!p) { el.style.opacity = '0'; return; }
      el.style.opacity = '1';
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    };

    storyFrame.pulse = step === 'find' || step === 'tap' ? [artist]
      : step === 'walk' && next ? [next]
      : step === 'ask' && finale ? [finale[0], finale[finale.length - 1]]
      : [];
    let top: boolean | null = null;
    const keepClear = (p: { x: number; y: number } | null) => {
      const low = !!p && p.y > window.innerHeight * 0.6;
      if (low !== top) { top = low; setCaptionTop(low); }
    };
    storyFrame.pulseLine = step === 'walk' && next ? { from: cur, to: next } : null;
    storyFrame.route = step === 'dive' || step === 'zoomout' || step === 'realms' || step === 'worlds' ? road : null;
    if (step === 'dive') onClear();

    const family = familyOf(data.edges, artist);
    const familyMs = familyDrawMs(family.parents.length, family.children.length, FAMILY_DRAW_STAGGER_FAST_MS) + 200;
    const said = hop > 0 ? stepWords(data, road[hop - 1], cur) : null;

    const tick = (now: number) => {
      const t = now - started;
      const sel = selectedRef.current;
      const zoom = storyCamera.zoom?.() ?? 0;
      switch (step) {
        case 'find': {
          const p = storyCamera.nodeScreen?.(artist) ?? null;
          placeHint(p);
          keepClear(p);
          if (sel === artist) return go('named');
          if (sel) onClear();
          if (zoom >= FIND_ZOOM && onScreen(p)) return go('tap');
          offer(t);
          break;
        }
        case 'tap': {
          const p = storyCamera.nodeScreen?.(artist) ?? null;
          placeHint(p);
          keepClear(p);
          if (sel === artist) return go('family');
          if (sel) onClear();
          break;
        }
        case 'family':
          if (t > familyMs) return go('named');
          break;
        case 'named':
          if (t > readMs(captionFor('named')?.big, captionFor('named')?.small)) return go(road.length > 1 ? 'walk' : 'panel');
          break;
        case 'walk': {
          placeHint(next ? storyCamera.nodeScreen?.(next) ?? null : null);
          if (next && sel === next) { setHop(h => h + 1); return go('said'); }
          if (sel !== cur) onSelect(cur);
          break;
        }
        case 'said': {
          // The light runs down the line just walked, from the one who shaped
          // into the one they shaped.
          const f = (t - SAID_DELAY_MS) / FLOW_MS;
          storyFrame.flow = f > 0 && f < 1 ? { from: cur, to: road[hop - 1], t: f } : null;
          const hold = SAID_DELAY_MS + readMs(said?.quote ?? said?.credit, said?.quote ? said.credit : said?.source);
          if (t > hold) return go(hop >= road.length - 1 ? 'arrive' : 'walk');
          break;
        }
        case 'arrive':
          if (t > readMs(captionFor('arrive')?.big, captionFor('arrive')?.small) + 800) return go('panel');
          break;
        case 'panel':
          if (t > 2800) return go('dive');
          break;
        case 'dive':
          // Close in on where the road ended, so there's somewhere to zoom
          // back out from. After the deselect's own camera move settles.
          if (!dived && t > 1300) { dived = true; storyCamera.zoomOn?.(root, DIVE_ZOOM, 1200); }
          if (t > 2700) return go('zoomout');
          break;
        case 'zoomout': {
          placeHint({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          if (zoom > 0 && zoom <= ZOOMED_OUT) return go('realms');
          offer(t);
          break;
        }
        case 'realms':
          storyFrame.realms = Math.min(1, t / REALMS_MS);
          if (t > REALMS_MS) return go('worlds');
          break;
        case 'worlds':
          // All six still glowing while the words are read.
          storyFrame.realms = 1;
          if (t > readMs(captionFor('worlds')?.big)) { storyFrame.realms = -1; return go(finale ? 'ask' : 'music'); }
          break;
        case 'ask':
          // The question first, on a still map: both ends ringed, far apart.
          if (t > readMs(captionFor('ask')?.big)) return go('connect');
          break;
        case 'connect': {
          // Connect two, run by itself: their artist to someone from another
          // world, and a thread of light reaching one more artist at a time.
          if (!finale) return go('music');
          if (!started2) { started2 = true; onFindPath(finale[0], finale[finale.length - 1]); }
          const reached = Math.min(finale.length, 1 + Math.floor(Math.max(0, t - 900) / HOP_MS));
          storyFrame.route = finale.slice(0, reached);
          if (t > 900 + finale.length * HOP_MS + 600) return go('linked');
          break;
        }
        case 'linked': {
          storyFrame.route = finale;
          // The button that does this, glowing as the words name it. (It
          // mounts a frame or two after the map's controls are asked back.)
          const button = started2 ? null : document.querySelector('.path-finder');
          if (button) { started2 = true; button.classList.add('tour-glow'); }
          if (t > readMs(captionFor('linked')?.big, captionFor('linked')?.small) + 600) {
            storyFrame.route = null;
            document.querySelectorAll('.tour-glow').forEach(el => el.classList.remove('tour-glow'));
            onClear();
            return go('music');
          }
          break;
        }
        case 'music': {
          // The player in the corner -- out of sight for the rest of the
          // tour -- arrives in the spotlight while the words name it.
          const player = document.querySelector('.player-float');
          if (player && !player.classList.contains('tour-spotlight')) player.classList.add('tour-shown', 'tour-spotlight');
          if (t > readMs(captionFor('music')?.big, captionFor('music')?.small) + 1200) {
            player?.classList.remove('tour-spotlight');
            return go('done');
          }
          break;
        }
        case 'done':
          if (t > 2000) { end(); return; }
          break;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      storyFrame.flow = null;
    };
    // captionFor reads only state already listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hop, artist, road, data, onClear, onSelect, onFindPath, finale, end]);

  // The words for each step, plain and short. Null while something moves.
  function captionFor(s: Step): { big: string; small?: string; late?: boolean } | null {
    const who = name(artist);
    const cur = road[hop];
    switch (s) {
      case 'find':
        return { big: `Find ${who}.`, small: 'Zoom in on the ring.' };
      case 'tap':
        return { big: `Tap ${who}.` };
      case 'named':
        return { big: `${who}'s musical family.`, small: 'Above: who shaped them. Below: who they shaped.' };
      case 'walk':
        return { big: `Who shaped ${name(cur)}?`, small: 'Tap the glowing star.' };
      case 'said': {
        const w = hop > 0 ? stepWords(data, road[hop - 1], cur) : null;
        if (!w) return null;
        return w.quote
          ? { big: `“${w.quote.replace(/!$/, '')}”`, small: w.credit, late: true }
          : { big: w.credit, small: w.source ?? undefined, late: true };
      }
      case 'arrive': {
        const rootArtist = byId.get(road[road.length - 1]);
        const steps = road.length - 1;
        return {
          big: `${who}'s music came from here.`,
          small: `${steps} ${steps === 1 ? 'step' : 'steps'} back · ${rootArtist?.name ?? ''}${rootArtist?.activeFrom ? `, ${rootArtist.activeFrom}` : ''}`,
        };
      }
      case 'panel':
        return { big: 'Every star opens like this.' };
      case 'zoomout':
        return { big: 'Zoom out.', small: 'See where you travelled.' };
      case 'worlds':
        return { big: 'Each colour is a world of music.' };
      case 'ask':
        return finale ? { big: `How do you get from ${name(finale[0])} to ${name(finale[finale.length - 1])}?` } : null;
      case 'linked':
        return finale
          ? { big: `Connected in ${finale.length - 1} steps.`, small: 'Connect two artists finds the road between any two.' }
          : null;
      case 'music':
        return { big: 'And every song is in your pocket.', small: `The player in the corner holds all ${songCount}, oldest first, and keeps playing as you explore. Press Menu.` };
      case 'done':
        return { big: 'Your turn.' };
      default:
        return null;
    }
  }

  const caption = captionFor(step);
  const hint = step === 'find' ? 'in' : step === 'tap' || step === 'walk' ? 'tap' : step === 'zoomout' ? 'out' : null;
  const rootArtist = byId.get(road[road.length - 1] ?? '');
  const rootCover = rootArtist?.classicAlbums?.[0]?.imageUrl;

  const doItForMe = () => {
    if (step === 'find' && artist) storyCamera.zoomOn?.(artist, ZOOM_FOR_ME, 1000);
    if (step === 'zoomout') storyCamera.overview?.(1000);
  };

  return (
    <div className={`tour tour--${step}`} role="region" aria-label="How Starweave works">
      {step === 'pick' && (
        <Picker data={data} onChoose={choose} onClose={end} />
      )}

      {hint && (
        <div ref={hintRef} className={`tour-hint tour-hint--${hint}${coarse ? ' tour-hint--touch' : ''}`} aria-hidden>
          {hint === 'tap' ? <span className="tour-hint__tap" /> : (
            <>
              <span className="tour-hint__finger tour-hint__finger--a" />
              <span className="tour-hint__finger tour-hint__finger--b" />
              <span className="tour-hint__mouse"><span className="tour-hint__wheel" /></span>
            </>
          )}
        </div>
      )}

      {step === 'music' && (
        <p className="tour-music-note" aria-hidden>
          Every song, right here
          <svg className="tour-music-note__arrow" viewBox="0 0 38 46">
            <path d="M6 3 C22 6 30 20 26 42 M18 35 L26 43 L33 34" />
          </svg>
        </p>
      )}

      {step === 'arrive' && rootCover && (
        <div className="tour-disc" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sizedImageUrl(rootCover, 300)} alt="" />
        </div>
      )}

      {/* A dark pool under long words over a crowded family — only where the
          family has been framed above the words, so it never hides a star. */}
      <div className={`tour__scrim${caption && (step === 'named' || step === 'said' || step === 'arrive') ? ' tour__scrim--on' : ''}`} aria-hidden />

      {caption && (
        <div key={`${step}-${hop}`} className={`intro__caption tour__caption${caption.late ? ' tour__caption--late' : ''}${captionTop && (step === 'find' || step === 'tap') ? ' tour__caption--top' : ''}`} aria-live="polite">
          <p className="intro__caption-big">
            {caption.big.split(' ').map((word, i) => (
              <span key={i} className="intro__word" style={{ '--i': i } as React.CSSProperties}>{word} </span>
            ))}
          </p>
          {caption.small && (
            <p className="intro__caption-small" style={{ '--n': caption.big.split(' ').length } as React.CSSProperties}>
              {caption.small}
            </p>
          )}
        </div>
      )}

      <div className="intro__controls tour__controls">
        {help && (
          <button type="button" className="intro__button" onClick={doItForMe}>
            {step === 'find' ? 'Zoom in for me' : 'Zoom out for me'}
          </button>
        )}
        {step !== 'pick' && (
          <button type="button" className="intro__button" onClick={end}>
            <span>Exit</span> <span aria-hidden>×</span>
          </button>
        )}
      </div>
    </div>
  );
}

// The first step: whose music to follow. Faces people might know, each with
// the song they'd most likely recognise, five seconds of it a tap away.
function Picker({ data, onChoose, onClose }: { data: GraphData; onChoose: (id: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef(0);

  const picks = useMemo(
    () => TOUR_PICKS.map(id => data.artists.find(a => a.id === id)).filter(a => a?.imageUrl),
    [data],
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return data.artists.filter(a => a.name.toLowerCase().includes(q)).slice(0, 5);
  }, [data, query]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    window.clearTimeout(timerRef.current);
    setPlaying(null);
  }, []);
  useEffect(() => stop, [stop]);
  // One sound at a time across the site: anything else starting stops this.
  const claim = useAudioFocus(stop);

  const preview = (id: string, url: string | null | undefined) => {
    if (!url) return;
    if (playing === id) { stop(); return; }
    stop();
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = url;
    audio.volume = 0.8 * (isLoudArtist(id) ? LOUD_GAIN : 1); // the loud rule: half volume
    claim();
    void audio.play().catch(() => {});
    setPlaying(id);
    timerRef.current = window.setTimeout(stop, PREVIEW_MS);
  };

  const pick = (id: string) => { stop(); onChoose(id); };

  return (
    <div className="tour-pick">
      <div className="tour-pick__card">
        <button type="button" className="tour-pick__close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="tour-pick__title">Where did their music come from?</h2>
        <p className="tour-pick__lede">Pick one.</p>
        <ul className="tour-pick__faces" role="list">
          {picks.map(a => a && (
            <li key={a.id} className="tour-pick__face" style={{ '--row-color': resolveNodeColor(a) } as React.CSSProperties}>
              <button type="button" className="tour-pick__choose" onClick={() => pick(a.id)}>
                {/* A taped polaroid, like the stops on a road. */}
                <span className="tour-pick__photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sizedImageUrl(a.imageUrl!, 250)} alt="" />
                </span>
                <span className="tour-pick__name">{a.name}</span>
                {a.previewTrack && <span className="tour-pick__song">{a.previewTrack}</span>}
              </button>
              {a.previewUrl && (
                <button
                  type="button"
                  className="tour-pick__play"
                  aria-label={playing === a.id ? `Stop ${a.previewTrack ?? a.name}` : `Hear ${a.previewTrack ?? a.name}`}
                  aria-pressed={playing === a.id}
                  onClick={() => preview(a.id, a.previewUrl)}
                >
                  {playing === a.id ? <StopIcon className="tour-pick__play-icon" /> : <PlayIcon className="tour-pick__play-icon" />}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="tour-pick__more">
          <button type="button" className="tour-pick__for-me" onClick={() => pick(TOUR_DEFAULT)}>Pick for me</button>
          <div className="tour-pick__search">
            <input
              type="search"
              placeholder="Or type a name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Find an artist"
            />
            {matches.length > 0 && (
              <ul className="tour-pick__matches" role="list">
                {matches.map(a => (
                  <li key={a.id}><button type="button" onClick={() => pick(a.id)}>{a.name}</button></li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <audio ref={audioRef} preload="none" />
        <button type="button" className="tour-pick__replay" onClick={() => { stop(); onClose(); requestFullIntro(); }}>
          Replay the intro
        </button>
      </div>
    </div>
  );
}
