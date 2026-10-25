'use client';

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FRAME_GAP, LABEL_H, LEADER, TOP_REBATE, type Lightbox } from '@/lib/scenes-lightbox';
import type { RoomLink } from '@/lib/scene-page';
import { sizedImageUrl } from '@/lib/image-url';
import { BLUE, RED, arrowPath, starPath, type Pt } from '@/components/scenes/pencil';

// Room to room, on a scene's page: the real /scenes sheet with this scene's
// strip ringed in its ink, the scenes it's linked to at full strength and
// the rest faded back, and grease-pencil arrows between the actual bands --
// red to the bands it shaped, blue from the ones that shaped it. Unlike the
// lightbox, the arrows stay drawn once they're in; pointing at a band leaves
// only its own.
//
// The first time the sheet scrolls into view, history unfolds from this
// room: the sheet's tubes flicker on, this scene's strip pops in, the other
// scenes' strips fly out from it to their places -- the nearest in time
// first -- their names write on, then the arrows draw.
// A phone gets the same links as a list (which is also what a screen reader
// reads on a desktop).

const STAR = 13;
const LINE_GAP = 8; // between a scene's name and its pencil line
// The unfolding, in ms from the sheet coming into view (CSS keys the tubes,
// names and stars to the same stage).
const DEAL_AT = 320;      // the first strip leaves this one
const DEAL_STEP = 45;     // each next-nearest in time
const DEAL_MS = 620;
const DRAW_AFTER = 0.75;  // the arrows start once the last strip has nearly landed
const SETTLE_MS = 1400;   // and everything's still this long after that
const FLY_EASE = 'cubic-bezier(0.3, 1.22, 0.5, 1)';

interface Props {
  sheet: Lightbox;
  sceneId: string;
  links: RoomLink[];
}

const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export default function RoomToRoom({ sheet, sceneId, links }: Props) {
  const { strips, frameW, frameH, stripH } = sheet;
  const pitch = frameW + FRAME_GAP;
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [drawn, setDrawn] = useState(false);
  const [stage, setStage] = useState<'off' | 'return' | 'on'>('off');
  const [pointed, setPointed] = useState<string | null>(null);
  const stripRefs = useRef<(HTMLElement | null)[]>([]);

  const linked = useMemo(() => new Set(links.map(l => l.scene)), [links]);
  const inLinks = useMemo(() => new Set(links.flatMap(l => [l.here, l.there])), [links]);

  const centres = useMemo(() => {
    const m = new Map<string, Pt>();
    for (const s of strips) s.members.forEach((b, k) => {
      if (!m.has(b.id)) m.set(b.id, { x: s.left + LEADER + k * pitch + frameW / 2, y: s.top + TOP_REBATE + frameH / 2 });
    });
    return m;
  }, [strips, pitch, frameW, frameH]);

  // Each band in another room an arrow reaches, ringed once in its colour.
  const rings = useMemo(() => {
    const seen = new Map<string, boolean>();
    for (const l of links) if (!seen.has(l.there)) seen.set(l.there, l.out);
    return [...seen];
  }, [links]);

  // The links grouped by the other scene, for the list.
  const groups = useMemo(() => {
    const by = new Map<string, { name: string; lines: Map<string, { here: string; out: boolean; there: string[] }> }>();
    for (const l of links) {
      if (!by.has(l.scene)) by.set(l.scene, { name: l.sceneName, lines: new Map() });
      const g = by.get(l.scene)!;
      const key = `${l.here}:${l.out}`;
      if (!g.lines.has(key)) g.lines.set(key, { here: l.hereName, out: l.out, there: [] });
      g.lines.get(key)!.there.push(l.thereName);
    }
    return [...by].map(([id, g]) => ({ id, name: g.name, lines: [...g.lines.values()] }));
  }, [links]);

  // The sheet keeps its real size and scales to the column.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setScale(Math.min(1, frame.clientWidth / sheet.width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [sheet.width]);

  // The first time a good part of it shows: unfold (or, with reduced motion,
  // just be there).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setStage('on');
        setDrawn(true);
        return;
      }
      setStage('return');
      const drawAt = DEAL_AT + (strips.length - 2) * DEAL_STEP + DEAL_MS * DRAW_AFTER;
      timers.push(setTimeout(() => setDrawn(true), drawAt));
      timers.push(setTimeout(() => setStage('on'), drawAt + SETTLE_MS));
    }, { threshold: 0.3 });
    io.observe(frame);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, [strips.length]);

  // History unfolds from this room: every other strip flies out from this
  // one to its place, nearest in time first. Set up before the stage paints.
  useLayoutEffect(() => {
    if (stage !== 'return') return;
    const here = strips.find(s => s.id === sceneId);
    if (!here) return;
    const order = strips
      .map((s, i) => ({ s, i, d: Math.abs(s.yearStart - here.yearStart) + Math.abs(s.top - here.top) / 1000 }))
      .filter(o => o.s.id !== sceneId)
      .sort((a, b) => a.d - b.d);
    const anims: Animation[] = [];
    const hereEl = stripRefs.current[strips.indexOf(here)];
    const pop = hereEl?.animate(
      [{ transform: 'scale(1.35)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 420, delay: 120, easing: FLY_EASE, fill: 'backwards' },
    );
    if (pop) anims.push(pop);
    order.forEach(({ s, i }, n) => {
      const el = stripRefs.current[i];
      if (!el) return;
      const to = getComputedStyle(el).opacity;
      anims.push(el.animate([
        { transform: `translate(${here.left - s.left}px, ${here.top - s.top}px) scale(0.55)`, opacity: 0 },
        { offset: 0.2, opacity: to },
        { transform: 'none', opacity: to },
      ], { duration: DEAL_MS, delay: DEAL_AT + n * DEAL_STEP, easing: FLY_EASE, fill: 'backwards' }));
    });
    return () => anims.forEach(a => a.cancel());
  }, [stage, strips, sceneId]);

  return (
    <>
      <div ref={frameRef} className="rooms__frame" style={{ height: sheet.height * scale }} aria-hidden>
        <div
          className="lightbox rooms__sheet"
          data-stage={stage}
          data-pointed={pointed || undefined}
          onPointerLeave={() => setPointed(null)}
          style={{
            width: sheet.width,
            height: sheet.height,
            transform: scale === 1 ? undefined : `scale(${scale})`,
            '--frame-w': `${frameW}px`,
            '--frame-h': `${frameH}px`,
            '--strip-h': `${stripH}px`,
          } as React.CSSProperties}
        >
          <div className="lightbox__light" />
          {strips.map((s, i) => {
            const here = s.id === sceneId;
            const tone = here ? 'here' : linked.has(s.id) ? 'linked' : 'other';
            const lineX = s.left + s.nameWidth + LINE_GAP;
            const film = (
              <>
                <span className="lightbox__holes" />
                <span className="lightbox__frames">
                  {s.members.map(m => (
                    <span
                      key={m.id}
                      className="lightbox__frame"
                      data-hit={pointed === m.id || undefined}
                      onPointerEnter={e => { if (e.pointerType === 'mouse') setPointed(inLinks.has(m.id) ? m.id : null); }}
                    >
                      {m.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sizedImageUrl(m.imageUrl, 120)} alt="" draggable={false} loading="lazy" decoding="async" />
                      )}
                      {m.id === s.starId && (
                        <svg className="lightbox__star" width={STAR} height={STAR}><path d={starPath(STAR)} /></svg>
                      )}
                    </span>
                  ))}
                </span>
                <span className="lightbox__edge">{s.edge}</span>
              </>
            );
            const style = { '--x': `${s.left}px`, '--y': `${s.top}px`, '--w': `${s.width}px`, '--i': i, '--ink': s.ink } as React.CSSProperties;
            return (
              <Fragment key={s.id}>
                <span
                  className="lightbox__name rooms__name"
                  data-tone={tone}
                  style={{ '--x': `${s.left + 1}px`, '--y': `${s.top - LABEL_H}px`, '--i': i, color: s.ink } as React.CSSProperties}
                >
                  {s.name}
                </span>
                {s.spanEnd - lineX >= 14 && (
                  <span
                    className="lightbox__span rooms__span"
                    data-tone={tone}
                    data-open-ended={s.isOpenEnded || undefined}
                    style={{ '--x': `${lineX}px`, '--y': `${s.top - LABEL_H / 2}px`, '--w': `${s.spanEnd - lineX}px`, '--i': i, color: s.ink } as React.CSSProperties}
                  />
                )}
                {here
                  ? <div ref={el => { stripRefs.current[i] = el; }} className="lightbox__strip rooms__strip" data-tone={tone} style={style}>{film}</div>
                  : (
                    <Link ref={el => { stripRefs.current[i] = el; }} href={`/scene/${s.id}`} className="lightbox__strip rooms__strip" data-tone={tone} style={style} tabIndex={-1}>
                      {film}
                    </Link>
                  )}
                <span className="lightbox__tape rooms__tape" data-tone={tone} style={{ '--x': `${s.left + s.width - 17}px`, '--y': `${s.top - 4}px`, '--i': i } as React.CSSProperties} />
              </Fragment>
            );
          })}

          <div className="lightbox__ruler" style={{ top: sheet.rulerTop }}>
            {sheet.ticks.map(t => (
              <span key={t.year} className={`lightbox__tick${t.label ? ' lightbox__tick--label' : ''}`} style={{ left: t.x }}>
                {t.label && <span>{t.year}</span>}
              </span>
            ))}
          </div>

          {drawn && (
            <svg className="lightbox__threads rooms__threads" width={sheet.width} height={sheet.height}>
              {links.map((l, n) => {
                const a = centres.get(l.here), b = centres.get(l.there);
                if (!a || !b) return null;
                const { d, head } = l.out ? arrowPath(a, b) : arrowPath(b, a);
                const hit = pointed === l.here || pointed === l.there;
                return (
                  <g key={`${l.here}:${l.there}:${l.out}`} data-hit={hit || undefined} style={{ color: l.out ? RED : BLUE, '--n': n } as React.CSSProperties}>
                    <path d={d} pathLength={1} className="lightbox__thread" />
                    <polygon points={head} className="lightbox__thread-head" />
                  </g>
                );
              })}
              {rings.map(([id, out], n) => {
                const c = centres.get(id);
                if (!c) return null;
                const hit = pointed === id || links.some(l => l.there === id && l.here === pointed);
                return (
                  <g key={id} data-hit={hit || undefined} style={{ color: out ? RED : BLUE, '--n': Math.min(links.length, 12) + n } as React.CSSProperties}>
                    <rect
                      x={c.x - frameW / 2 - 3}
                      y={c.y - frameH / 2 - 3}
                      width={frameW + 6}
                      height={frameH + 6}
                      rx={3}
                      className="lightbox__thread-ring"
                    />
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      <ul className="rooms__list">
        {groups.map(g => (
          <li key={g.id} className="rooms__list-item">
            <Link href={`/scene/${g.id}`} className="rooms__list-scene">{g.name}</Link>
            {g.lines.map(line => (
              <span key={`${line.here}:${line.out}`} className={`rooms__list-line rooms__list-line--${line.out ? 'out' : 'in'}`}>
                {line.here} {line.out ? 'shaped' : 'learned from'} {joinNames(line.there)}.
              </span>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
