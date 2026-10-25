'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CLIP_H, HEAD_W, RULER_H, SKY_H, JACK_W, lineageOf, type GenreSession as Session, type SessionClip } from '@/lib/genre-session';
import { buildSkyline, WINDOW } from '@/lib/skyline';
import MagazineCover from './MagazineCover';
import { useIssue } from './Issue';
import type { CoverStar, Issue } from '@/lib/genre-issue';

// The /genres page: fifty years of sound as a city at night, the pull-out
// centrefold of today's issue of a music paper (MagazineCover.tsx is the
// cover, Issue.tsx runs the opening and the cover story). Layout in
// lib/genre-session.ts. Each family of sound is a group of roads, each genre
// a lit sign on its road in the year it was born; a road lit on ahead means
// the next sign grew out of the one before it, and an overpass means it grew
// out of a sign on another road. Along the top: the skyline, the title on a
// rooftop sign, and the years on a lit ticker.
//
// Point at a sign, or tap it, and its road back to the family's founder
// lights up with a light running down it, its years light on the ticker,
// the dotted "also borrowed from" lines appear for it alone, everything else
// goes quiet, and a note pins beside it with the year's story and the way
// into its page. Lines and the city are SVG; every word is HTML, so text is
// always real CSS size. Too wide for the window? The spread zooms down to
// fit, but never below FIT_MIN; past that it keeps its size and scrolls
// sideways, the family heads staying put.

interface Props {
  session: Session;
  /** For the cover lines: the whole map's artists and genres. */
  counts: { artists: number; genres: number };
  /** Each cover story's cover star (lib/genre-issue's coverStars), worked out on the server. */
  stars: Record<string, CoverStar>;
}

const FIT_MIN = 0.86;
const NOTE_W = 240;
const LEAVE_MS = 180; // time to move from a clip onto its note

const splicePen = (count: number) => Math.min(5, 2.4 + Math.sqrt(count) * 0.5);
const overpassPen = (count: number) => Math.min(4, 3 + Math.sqrt(count) * 0.2);
const RUN_STEP_S = 0.26; // the solo's light, from one link of the line to the next
// The sky band: the rooftop sign runs to SIGN_END and how to read it to
// WORDS_END; the skyline stays low under both and stands tall past them.
const SIGN_END = 392;
const WORDS_END = 1215;
const MOON_R = 11;

export default function GenreSession({ session, counts, stars }: Props) {
  const byId = useMemo(() => new Map(session.clips.map(c => [c.id, c])), [session]);
  const familyOf = useMemo(() => new Map(session.families.map(f => [f.id, f])), [session]);
  const span = session.timeEnd - session.timeStart;
  const tOf = useCallback((x: number) => Math.max(0, Math.min(1, (x - session.timeStart) / span)), [session.timeStart, span]);

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const leaveTimer = useRef(0);
  const { stage, issue, open: openIssue, release, keyOn } = useIssue(session, counts, stars);
  const storyId = stage === 'story' ? issue?.story.leafId ?? null : null;
  const active = hoverId ?? pinnedId ?? storyId;
  const activeClip = active ? byId.get(active) ?? null : null;

  const enter = useCallback((id: string) => {
    window.clearTimeout(leaveTimer.current);
    setHoverId(id);
  }, []);
  const leave = useCallback(() => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHoverId(null), LEAVE_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      release();
      if (e.key === 'Escape') { setPinnedId(null); setHoverId(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [release]);

  // Its line back to the founder, and the genres it borrowed from or lent to.
  const lineageList = useMemo(() => (active ? lineageOf(active, byId) : []), [active, byId]);
  const lineage = useMemo(() => (active ? new Set(lineageList) : null), [active, lineageList]);
  // How far down the line from the founder each lit link is, for the order
  // the solo's light runs in.
  const runOrder = useMemo(
    () => new Map(lineageList.map((id, i) => [id, lineageList.length - 1 - i])),
    [lineageList],
  );
  const borrowed = useMemo(() => {
    if (!activeClip) return [];
    const pairs: { from: SessionClip; to: SessionClip }[] = [];
    for (const id of activeClip.alsoFromIds) {
      const from = byId.get(id);
      if (from) pairs.push({ from, to: activeClip });
    }
    for (const c of session.clips) {
      if (c.alsoFromIds.includes(activeClip.id)) pairs.push({ from: activeClip, to: c });
    }
    return pairs;
  }, [activeClip, byId, session]);
  const touched = useMemo(() => new Set(borrowed.flatMap(p => [p.from.id, p.to.id])), [borrowed]);
  // The years of its line, lit on the display: the line as a path through time.
  const litYears = useMemo(
    () => new Set(lineageList.map(id => byId.get(id)?.emerged).filter((y): y is number => y !== undefined)),
    [lineageList, byId],
  );
  const yearX = useMemo(() => new Map(session.years.map(yr => [yr.year, yr.x])), [session.years]);

  const city = useMemo(() => buildSkyline(session.width, SKY_H, {
    seed: 7,
    minHeight: 4,
    stars: 26,
    maxHeight: x => (x < SIGN_END ? 8 : x < WORDS_END ? 10 : x > session.width - 70 ? 22 : SKY_H - 8),
  }), [session.width]);
  const opened = stage !== 'dark' && stage !== 'lit' && stage !== 'counting';


  // Fit the sheet to the window when it nearly fits; scroll sideways when not.
  const frameRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ zoom: 1, scroll: false });
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const room = frame.parentElement?.clientWidth ?? frame.clientWidth;
      const z = Math.min(1, room / session.width);
      setFit(z >= FIT_MIN ? { zoom: z, scroll: false } : { zoom: 1, scroll: true });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(frame.parentElement ?? frame);
    return () => ro.disconnect();
  }, [session.width]);

  // On a phone the city scrolls sideways: bring the cover story's road into
  // view before it lights.
  useEffect(() => {
    if (stage !== 'story' || !fit.scroll || !issue) return;
    const leaf = byId.get(issue.story.leafId);
    frameRef.current?.scrollTo({ left: Math.max(0, (leaf?.left ?? 0) - 140), behavior: 'smooth' });
  }, [stage, fit.scroll, issue, byId]);

  const note = activeClip && (() => {
    const left = Math.max(HEAD_W, Math.min(activeClip.left, session.width - NOTE_W - 8));
    const below = activeClip.y + CLIP_H / 2 + 8;
    const fitsBelow = below + 200 < session.height;
    const family = familyOf.get(activeClip.familyId);
    const parent = activeClip.parentId ? byId.get(activeClip.parentId) : undefined;
    const also = activeClip.alsoFromIds.map(id => byId.get(id)?.name).filter(Boolean) as string[];
    return (
      <div
        className="gsession-note"
        style={{
          left,
          width: NOTE_W,
          top: fitsBelow ? below : undefined,
          bottom: fitsBelow ? undefined : session.height - (activeClip.y - CLIP_H / 2 - 8),
          '--ink': family?.ink,
          '--glow': family?.color,
        } as React.CSSProperties}
        onPointerEnter={e => { if (e.pointerType === 'mouse') window.clearTimeout(leaveTimer.current); }}
        onPointerLeave={e => { if (e.pointerType === 'mouse') leave(); }}
      >
        {storyId === activeClip.id && issue && (
          <p className="gsession-note__stamp">
            <span>Cover story</span> {issue.story.headline}
          </p>
        )}
        <p className="gsession-note__name">{activeClip.name}</p>
        <p className="gsession-note__when">
          <span className="gsession-note__year">{activeClip.emerged}</span> {activeClip.emergedBasis}
        </p>
        <p className="gsession-note__rel">
          {parent
            ? <>Grew out of <b>{parent.name}</b></>
            : <>Starts the {family?.name} family</>}
        </p>
        {also.length > 0 && <p className="gsession-note__rel">Also borrowed from <b>{also.join(', ')}</b></p>}
        <p className="gsession-note__count">{activeClip.count} {activeClip.count === 1 ? 'artist' : 'artists'} on the map</p>
        <Link href={`/genre/${activeClip.id}`} className="gsession-note__open">Open {activeClip.name} &rarr;</Link>
      </div>
    );
  })();

  const top = SKY_H + RULER_H; // where the roads start
  return (
    <div className="gsession" data-key-on={keyOn || undefined} data-story={stage === 'story' || undefined}>
      {/* On a phone the sky's words sit off to the right of the swipe, so
          they're said here first instead (and hidden up there). */}
      <div className="gsession__intro-phone">
        {stage === 'story' && issue && <StoryBanner issue={issue} />}
        <HowToRead phone />
      </div>
      {!opened || stage === 'opening' ? (
        <MagazineCover
          issue={issue}
          stage={stage}
          color={familyOf.get(byId.get(issue?.story.leafId ?? '')?.familyId ?? '')?.color ?? '#E8C87A'}
          zoom={fit.scroll ? undefined : fit.zoom}
          onOpen={openIssue}
        />
      ) : null}
      <div ref={frameRef} className={`gsession__frame${fit.scroll ? ' gsession__frame--scroll' : ''}`}>
        <div
          className={`gsession__sheet${active ? ' gsession__sheet--focus' : ''}`}
          data-issue={stage}
          data-opened={opened || undefined}
          style={{ width: session.width, height: session.height, zoom: fit.zoom, '--sky': `${SKY_H}px` } as React.CSSProperties}
        >
          <div
            className="gsession__inside"
            onClick={e => { release(); if (e.target === e.currentTarget) setPinnedId(null); }}
            onWheel={release}
            onTouchStart={release}
          >
            <svg className="gsession__ink" width={session.width} height={session.height} aria-hidden>
              {/* The city along the top. */}
              {city.stars.map((st, i) => <circle key={i} className="gsession__star" cx={st.x} cy={st.y} r={st.r} />)}
              <circle className="gsession__moon" cx={session.width - 40} cy={MOON_R + 7} r={MOON_R} />
              {city.buildings.map(b => (
                <g key={b.x}>
                  <rect className="gsession__building" x={b.x} y={SKY_H - b.h} width={b.w} height={b.h} />
                  {b.lit.map(w => <rect key={`${w.x}:${w.y}`} className="gsession__window" x={w.x} y={w.y} width={WINDOW} height={WINDOW} />)}
                  {b.tower !== undefined && <WaterTower x={b.tower} y={SKY_H - b.h} />}
                </g>
              ))}
              {/* The rooftop sign's posts, and the billboard's. */}
              <line className="gsession__post" x1={40} x2={40} y1={44} y2={SKY_H - 5} />
              <line className="gsession__post" x1={SIGN_END - 70} x2={SIGN_END - 70} y1={44} y2={SKY_H - 5} />
              <line className="gsession__post" x1={SIGN_END + 70} x2={SIGN_END + 70} y1={48} y2={SKY_H - 4} />
              <line className="gsession__post" x1={WORDS_END - 90} x2={WORDS_END - 90} y1={48} y2={SKY_H - 4} />

              {session.decades.map(d => (
                <line key={d.label} className="gsession__bar" x1={d.x} x2={d.x} y1={top - 12} y2={session.height - 4} />
              ))}
              {/* The roads, each with its centre line. */}
              {session.trackYs.map(y => (
                <g key={y} className="gsession__road">
                  <rect x={session.timeStart - 8} y={y - CLIP_H / 2 - 3} width={span + 18} height={CLIP_H + 6} rx={3} />
                  <line x1={session.timeStart - 4} x2={session.timeEnd + 6} y1={y} y2={y} />
                </g>
              ))}
              {session.years.map(yr => (
                <line
                  key={yr.year}
                  className={`gsession__tick${litYears.has(yr.year) ? ' is-lit' : ''}`}
                  x1={yr.x}
                  x2={yr.x}
                  y1={top - 7}
                  y2={top - (yr.labelled || litYears.has(yr.year) ? 2 : 4)}
                />
              ))}
              {activeClip && (
                // From its year on the ticker straight down to it.
                <line
                  className="gsession__year-drop"
                  x1={yearX.get(activeClip.emerged) ?? activeClip.left}
                  x2={yearX.get(activeClip.emerged) ?? activeClip.left}
                  y1={top - 1}
                  y2={activeClip.y - CLIP_H / 2 - 1}
                />
              )}
              {session.links.map(l => {
                const lit = lineage?.has(l.childId) && lineage.has(l.parentId);
                const child = byId.get(l.childId)!;
                const t = tOf(child.left);
                const color = familyOf.get(child.familyId)?.color ?? l.ink;
                const w = l.kind === 'splice' ? splicePen(l.count) : overpassPen(l.count);
                return (
                  <g
                    key={l.childId}
                    className={`gsession__link gsession__link--${l.kind}${lit ? ' is-lit' : ''}`}
                    style={{ '--t': t.toFixed(3) } as React.CSSProperties}
                  >
                    {/* The road lit on ahead; or an overpass, its two rails
                        a colour stroke with a dark core, ending in an arrow
                        into the sign it grew into. */}
                    <path className="gsession__cord-edge" d={l.d} strokeWidth={w + 2.4} />
                    <path d={l.d} stroke={color} strokeWidth={w} />
                    {l.kind === 'cable'
                      ? <path className="gsession__rail-core" d={l.d} strokeWidth={Math.max(0.8, w - 2.2)} />
                      : <path className="gsession__cord-shine" d={l.d} strokeWidth={Math.max(1, w * 0.3)} />}
                    {l.jack && (
                      <path
                        className="gsession__arrow"
                        d={`M ${l.jack.x} ${l.jack.y} H ${l.jack.x + JACK_W - 1} M ${l.jack.x + JACK_W - 5.5} ${l.jack.y - 3.6} L ${l.jack.x + JACK_W - 1} ${l.jack.y} L ${l.jack.x + JACK_W - 5.5} ${l.jack.y + 3.6}`}
                        stroke={color}
                      />
                    )}
                    {lit && (
                      <path
                        key={active}
                        className="gsession__run"
                        d={l.d}
                        pathLength={1}
                        style={{ animationDelay: `${((runOrder.get(l.parentId) ?? 0) * RUN_STEP_S).toFixed(2)}s` }}
                      />
                    )}
                  </g>
                );
              })}
              {borrowed.map(({ from, to }) => {
                // A pencil curve from the older genre's end to the borrower's
                // start, bowed so it never lies along a track or a cable, with
                // an arrowhead near the borrower.
                const a = { x: from.left + from.w, y: from.y };
                const b = { x: to.left, y: to.y };
                const dx = b.x - a.x, dy = b.y - a.y;
                const len = Math.hypot(dx, dy) || 1;
                const bow = Math.min(50, len * 0.2);
                const cx = (a.x + b.x) / 2 + (dy / len) * bow;
                const cy = (a.y + b.y) / 2 - (dx / len) * bow;
                const t = 0.85, mt = 1 - t;
                const px = mt * mt * a.x + 2 * mt * t * cx + t * t * b.x;
                const py = mt * mt * a.y + 2 * mt * t * cy + t * t * b.y;
                const tx = 2 * mt * (cx - a.x) + 2 * t * (b.x - cx);
                const ty = 2 * mt * (cy - a.y) + 2 * t * (b.y - cy);
                const tl = Math.hypot(tx, ty) || 1;
                const ux = tx / tl, uy = ty / tl;
                return (
                  <g key={`${from.id}>${to.id}`} className="gsession__borrow">
                    <path d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`} />
                    <path
                      className="gsession__borrow-head"
                      d={`M ${px - ux * 7 - uy * 4.5} ${py - uy * 7 + ux * 4.5} L ${px} ${py} L ${px - ux * 7 + uy * 4.5} ${py - uy * 7 - ux * 4.5}`}
                    />
                  </g>
                );
              })}
            </svg>

            {/* The family heads, sticky when the spread scrolls sideways:
                each family's roads under a street sign in its colour. */}
            <div className="gsession__heads" style={{ width: HEAD_W, height: session.height - SKY_H, marginTop: SKY_H }}>
              <span className="gsession__heads-title">Families</span>
              {session.families.map(f => (
                <div
                  key={f.id}
                  className="gsession__family"
                  style={{ top: f.top - SKY_H, height: f.bottom - f.top, '--glow': f.color } as React.CSSProperties}
                >
                  <span className="gsession__street">{f.name}</span>
                  <span className="gsession__family-size">{f.size} {f.size === 1 ? 'sound' : 'sounds'}</span>
                </div>
              ))}
            </div>

            {/* The sky: the title on a rooftop sign, and how to read it. */}
            <div className="gsession__rooftop">
              <h1 className="gsession-sign">Where every sound came from</h1>
            </div>
            <div className="gsession__intro" style={{ left: SIGN_END + 18 }}>
              {stage === 'story' && issue && <StoryBanner issue={issue} />}
              <HowToRead />
            </div>

            <span className="gsession__display" style={{ left: session.timeStart - 10, width: span + 22 }} aria-hidden />
            {session.decades.map(d => (
              <span key={d.label} className="gsession__decade" style={{ left: d.x }}>{d.label.replace('the ', '\u2019')}</span>
            ))}
            {session.years.filter(yr => yr.labelled || litYears.has(yr.year)).map(yr => (
              <span
                key={yr.year}
                className={`gsession__year${litYears.has(yr.year) ? ' is-lit' : ''}${active && !litYears.has(yr.year) ? ' is-quiet' : ''}`}
                style={{ left: yr.x }}
              >
                {yr.year}
              </span>
            ))}

            <span className="gsession__playhead" style={{ left: session.timeStart, '--run': `${span}px` } as React.CSSProperties} aria-hidden />
            {session.clips.map(c => {
              const family = familyOf.get(c.familyId);
              const state = !active ? '' : c.id === active ? ' is-active'
                : lineage?.has(c.id) ? ' is-lineage' : touched.has(c.id) ? ' is-touched' : ' is-faded';
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`gsession__clip${c.isFounder ? ' gsession__clip--founder' : ''}${state}`}
                  style={{
                    left: c.left,
                    top: c.y - CLIP_H / 2,
                    width: c.w,
                    height: CLIP_H,
                    '--ink': family?.ink,
                    '--glow': family?.color,
                    '--t': tOf(c.left).toFixed(3),
                    '--kick': `${((runOrder.get(c.id) ?? 0) * RUN_STEP_S).toFixed(2)}s`,
                  } as React.CSSProperties}
                  aria-label={`${c.name}, ${c.emerged}, ${c.count} ${c.count === 1 ? 'artist' : 'artists'}`}
                  aria-expanded={c.id === pinnedId}
                  onPointerEnter={e => { if (e.pointerType === 'mouse') enter(c.id); }}
                  onPointerLeave={e => { if (e.pointerType === 'mouse') leave(); }}
                  onFocus={() => enter(c.id)}
                  onBlur={leave}
                  onClick={() => setPinnedId(id => (id === c.id ? null : c.id))}
                >
                  {c.lines.map(line => <span key={line} className="gsession__clip-line">{line}</span>)}
                </button>
              );
            })}

            {note}
          </div>

        </div>
      </div>
    </div>
  );
}

/**
 * While the cover story plays: a red banner in the billboard's place
 * carrying its headline, so the road lighting up below has a caption -- the
 * billboard and its key take over when the story's done.
 */
function StoryBanner({ issue }: { issue: Issue }) {
  return (
    <p className="gsession-banner" role="status">
      <span className="gsession-banner__tag">Today&rsquo;s cover story</span>
      <span className="gsession-banner__headline">{issue.story.headline}</span>
      <span className="gsession-banner__road">{issue.story.line.map(s => s.year).join(' \u2192 ')}</span>
    </p>
  );
}

/**
 * How to read it, always in the same place: a lit billboard on the skyline
 * beside the title on a laptop, above the city on a phone -- the one bright
 * panel in the night, so it can't be missed. Its lamps stutter on once the
 * city's lights are up, then each mark in the key gets a highlighter swipe
 * in turn, left to right, walking the eye through it. The key's marks are
 * drawn exactly as the things they name.
 */
function HowToRead({ phone = false }: { phone?: boolean }) {
  return (
    <div className="gsession-board">
      <p className="gsession-key" aria-label="How to read it">
        <span className="gsession-key__label">How to read it</span>
        <span className="gsession-key__item" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="gsession-key__clip">Punk</span>
          a genre, in its year
        </span>
        <span className="gsession-key__item" style={{ '--i': 1 } as React.CSSProperties}>
          <svg width="30" height="12" aria-hidden>
            <path d="M 1 6 H 29" className="gsession-key__edge" strokeWidth="5.6" />
            <path d="M 1 6 H 29" stroke="#E8C87A" strokeWidth="3.4" fill="none" />
          </svg>
          grew out of the one before
        </span>
        <span className="gsession-key__item" style={{ '--i': 2 } as React.CSSProperties}>
          <svg width="34" height="16" aria-hidden>
            <path d="M 3 2 V 7 Q 3 11 7 11 H 24" className="gsession-key__edge" strokeWidth="5.6" />
            <path d="M 3 2 V 7 Q 3 11 7 11 H 24" stroke="#C77DD1" strokeWidth="3.4" fill="none" />
            <path d="M 3 2 V 7 Q 3 11 7 11 H 24" className="gsession__rail-core" strokeWidth="1.2" fill="none" />
            <path d="M 24 11 H 31 M 27 7.5 L 31 11 L 27 14.5" stroke="#C77DD1" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          grew out of another road
        </span>
        <span className="gsession-key__item" style={{ '--i': 3 } as React.CSSProperties}>
          <svg width="30" height="12" aria-hidden><path d="M 1 9 Q 15 0 29 9" className="gsession-key__pencil" /></svg>
          also borrowed from
        </span>
      </p>
      <p className="gsession-key__do">
        <span>Each road is a family of sound. {phone ? 'Tap' : 'Point at'} a sign to light up its road back to where it came from.</span>
        {phone && <span> Swipe to travel through time.</span>}{' '}
        <a href="#all-genres" className="gsession__az">All genres A&ndash;Z &darr;</a>
      </p>
      {/* The lamps lighting it, along its bottom edge. */}
      <span className="gsession-board__lamps" aria-hidden><i /><i /><i /></span>
    </div>
  );
}

/** A rooftop water tower: legs, a tank, a cone. */
function WaterTower({ x, y }: { x: number; y: number }) {
  return (
    <g className="gsession__tower">
      <line x1={x - 3} x2={x - 3} y1={y} y2={y - 3} />
      <line x1={x + 3} x2={x + 3} y1={y} y2={y - 3} />
      <rect x={x - 4.5} y={y - 8} width={9} height={5} />
      <path d={`M ${x - 5} ${y - 8} L ${x} ${y - 11} L ${x + 5} ${y - 8} Z`} />
    </g>
  );
}
