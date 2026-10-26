'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CLIP_H, HEAD_W, NOTE_W, RULER_H, SKY_H, JACK_W, YEAR_LABEL_GAP, lineageOf, placeNote, spreadYears, type GenreSession as Session, type SessionClip } from '@/lib/genre-session';
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
// sideways, the family heads staying put. On a bigger screen it grows to
// fill the first screen (up to FIT_MAX), leaving room under it for the
// index's tab.

interface Props {
  session: Session;
  /** For the cover lines: the whole map's artists and genres. */
  counts: { artists: number; genres: number };
  /** Each cover story's cover star (lib/genre-issue's coverStars), worked out on the server. */
  stars: Record<string, CoverStar>;
}

const FIT_MIN = 0.86;
const FIT_MAX = 1.4;
const CUE_ROOM = 56; // under the city, for the index's tab (/genres)
// The leftmost a year's label can be centred and still clear the sticky
// family heads (the first year's "1" hid under them).
const YEAR_MIN_X = HEAD_W + 20;
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
  // Where the lit years' labels go, spread apart where they crowd; any
  // other year label they'd land on steps aside while they're lit.
  const litYearAt = useMemo(
    () => spreadYears(session.years.filter(yr => litYears.has(yr.year)), YEAR_MIN_X, session.timeEnd),
    [session, litYears],
  );
  const yearShown = (yr: Session['years'][number]) =>
    litYears.has(yr.year) || (yr.labelled && [...litYearAt.values()].every(x => Math.abs(x - yr.x) >= YEAR_LABEL_GAP));

  const city = useMemo(() => buildSkyline(session.width, SKY_H, {
    seed: 7,
    minHeight: 4,
    stars: 26,
    maxHeight: x => (x < SIGN_END ? 8 : x < WORDS_END ? 10 : x > session.width - 70 ? 22 : SKY_H - 8),
  }), [session.width]);
  const opened = stage !== 'dark' && stage !== 'lit' && stage !== 'counting';


  // Fit the sheet to the window: down when it nearly fits, sideways scroll
  // when it doesn't, and up to fill the first screen when there's room to
  // spare (never taller than the window less the index tab's strip).
  const frameRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ zoom: 1, scroll: false });
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const room = frame.parentElement?.clientWidth ?? frame.clientWidth;
      const scroller = frame.closest('.genres-overlay');
      const top = frame.getBoundingClientRect().top + (scroller?.scrollTop ?? 0);
      const roomH = window.innerHeight - top - CUE_ROOM;
      const grow = Math.max(1, Math.min(FIT_MAX, roomH / session.height));
      const z = Math.min(room / session.width, grow);
      setFit(z >= FIT_MIN ? { zoom: z, scroll: false } : { zoom: 1, scroll: true });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(frame.parentElement ?? frame);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [session.width, session.height]);

  // On a phone the city scrolls sideways: bring the cover story's road into
  // view before it lights.
  useEffect(() => {
    if (stage !== 'story' || !fit.scroll || !issue) return;
    const leaf = byId.get(issue.story.leafId);
    frameRef.current?.scrollTo({ left: Math.max(0, (leaf?.left ?? 0) - 140), behavior: 'smooth' });
  }, [stage, fit.scroll, issue, byId]);

  // The note pins beside the sign wherever it hides none of what's lit with
  // it (placeNote); its height is measured once it's drawn, in the sheet's
  // own pixels, before the browser paints.
  const noteRef = useRef<HTMLDivElement>(null);
  const [noteH, setNoteH] = useState(200);
  useLayoutEffect(() => {
    const el = noteRef.current;
    const sheet = el?.closest('.gsession__sheet');
    if (!el || !sheet) return;
    const h = Math.round(el.getBoundingClientRect().height / (sheet.getBoundingClientRect().height / session.height));
    if (h > 0 && Math.abs(h - noteH) > 2) setNoteH(h);
  }, [active, stage, noteH, session.height]);
  const notePlace = useMemo(() => {
    if (!activeClip) return null;
    return placeNote(session, activeClip.id, new Set([...(lineage ?? []), ...touched]), noteH);
  }, [session, activeClip, lineage, touched, noteH]);

  const note = activeClip && notePlace && (() => {
    const family = familyOf.get(activeClip.familyId);
    const parent = activeClip.parentId ? byId.get(activeClip.parentId) : undefined;
    const also = activeClip.alsoFromIds.map(id => byId.get(id)?.name).filter(Boolean) as string[];
    return (
      <div
        ref={noteRef}
        className="gsession-note"
        style={{
          left: notePlace.left,
          top: notePlace.top,
          width: NOTE_W,
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
            {/* The districts: each family's rows on a ground of its own
                colour, alternate decades a shade darker like city blocks,
                then the family's name big and faint in the emptiest stretch
                of its rows -- all under the roads and lines. */}
            <svg className="gsession__ink" width={session.width} height={session.height} aria-hidden>
              {session.families.map(f => (
                <rect
                  key={f.id}
                  className="gsession__ground"
                  x={session.timeStart - 8}
                  y={f.top + 1}
                  width={session.timeEnd - session.timeStart + 16}
                  height={f.bottom - f.top - 2}
                  rx={6}
                  style={{ '--glow': f.color } as React.CSSProperties}
                />
              ))}
              {session.decades.map((d, i) => i % 2 === 1 && (
                <rect
                  key={d.label}
                  className="gsession__block"
                  x={d.x}
                  y={top - 12}
                  width={(session.decades[i + 1]?.x ?? session.timeEnd + 8) - d.x}
                  height={session.height - top + 8}
                />
              ))}
            </svg>
            {session.families.map(f => f.district && (
              <span
                key={f.id}
                className="gsession__district"
                style={{ left: f.district.x, top: f.district.y, width: f.district.w, fontSize: f.district.px, '--glow': f.color } as React.CSSProperties}
                aria-hidden
              >
                {f.name}
              </span>
            ))}
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
              {/* The faint lanes the roads are laid on, then the roads: one
                  per line, breaking where the next sign didn't grow out of
                  the one before it, edged in the family's colour. */}
              {session.trackYs.map(y => (
                <line key={y} className="gsession__lane" x1={session.timeStart - 4} x2={session.timeEnd + 6} y1={y} y2={y} />
              ))}
              {session.roads.map(r => (
                <g key={`${r.y}:${r.x1}`} className="gsession__road" style={{ '--glow': familyOf.get(r.familyId)?.color } as React.CSSProperties}>
                  <rect x={r.x1} y={r.y - CLIP_H / 2 - 3} width={r.x2 - r.x1} height={CLIP_H + 6} rx={4} />
                  <line x1={r.x1 + 4} x2={r.x2 - 4} y1={r.y} y2={r.y} />
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
                        d={`M ${l.jack.x} ${l.jack.y} V ${l.jack.y + l.jack.dir * (JACK_W - 1)} M ${l.jack.x - 3.6} ${l.jack.y + l.jack.dir * (JACK_W - 5.5)} L ${l.jack.x} ${l.jack.y + l.jack.dir * (JACK_W - 1)} L ${l.jack.x + 3.6} ${l.jack.y + l.jack.dir * (JACK_W - 5.5)}`}
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
              <h1 className="gsession-sign">The family tree of genres</h1>
            </div>
            <div className="gsession__intro" style={{ left: SIGN_END + 18 }}>
              {stage === 'story' && issue && <StoryBanner issue={issue} />}
              <HowToRead />
            </div>

            <span className="gsession__display" style={{ left: session.timeStart - 10, width: span + 22 }} aria-hidden />
            {session.decades.map(d => (
              <span key={d.label} className="gsession__decade" style={{ left: d.x }}>{d.label.replace('the ', '\u2019')}</span>
            ))}
            {session.years.filter(yearShown).map(yr => (
              <span
                key={yr.year}
                className={`gsession__year${litYears.has(yr.year) ? ' is-lit' : ''}${active && !litYears.has(yr.year) ? ' is-quiet' : ''}`}
                style={{ left: litYearAt.get(yr.year) ?? Math.max(YEAR_MIN_X, yr.x) }}
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
          {/* As on the map: the line runs along the gap and drops onto the sign. */}
          <svg width="34" height="20" aria-hidden>
            <path d="M 2 4 H 19 Q 23 4 23 8 V 9" className="gsession-key__edge" strokeWidth="5.6" />
            <path d="M 2 4 H 19 Q 23 4 23 8 V 9" stroke="#C77DD1" strokeWidth="3.4" fill="none" />
            <path d="M 2 4 H 19 Q 23 4 23 8 V 9" className="gsession__rail-core" strokeWidth="1.2" fill="none" />
            <path d="M 23 9 V 13 M 20 10.5 L 23 13 L 26 10.5" stroke="#C77DD1" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="16" y="14" width="16" height="5" rx="1" fill="#C77DD1" opacity="0.7" />
          </svg>
          grew out of a genre in another row
        </span>
        <span className="gsession-key__item" style={{ '--i': 3 } as React.CSSProperties}>
          <svg width="30" height="12" aria-hidden><path d="M 1 9 Q 15 0 29 9" className="gsession-key__pencil" /></svg>
          also borrowed from
        </span>
      </p>
      <p className="gsession-key__do">
        <span>Every genre sits in the year it was born, joined to the one it grew out of; each colour is a family. {phone ? 'Tap' : 'Point at'} a genre to light up its line back to where it began.</span>
        {phone && <span> Swipe to travel through time.</span>}{' '}
        <a href="#index" className="gsession__az">The index, A&ndash;Z &darr;</a>
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
