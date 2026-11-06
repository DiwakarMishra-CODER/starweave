'use client';

import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { player, usePlayer } from '@/lib/player';
import { sizedImageUrl } from '@/lib/image-url';
import { useMusicMotion } from '@/components/genre/useMusicMotion';
import type { Cover, Face, ForkSign, Thread } from '@/lib/about-tape';
import SourceLink from '@/components/ui/SourceLink';
import { sourcePlace } from '@/lib/source-place';
import Reveal from '@/components/ui/Reveal';
import { useTape } from './TapePage';
import Cassette from './Cassette';

// Side B, "Why I drew the map": how they dig, why "sounds like" isn't
// "learned from", the bands between their two constants (and how the map
// knows), and the end of the tape.

function Photo({ f, size }: { f: Face; size: number }) {
  return (
    <span className="tface__photo" style={{ '--glow': f.color } as React.CSSProperties}>
      {f.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sizedImageUrl(f.imageUrl, size > 90 ? 250 : 160)} alt="" width={size} height={size} loading="lazy" />
      )}
    </span>
  );
}

/** How much higher each thing in the crate stands than the one in front, px. */
const BIN_STEP: Record<string, number> = { 'record-record': 30, 'record-divider': 12, 'divider-record': 64, 'divider-divider': 30 };

/** 6. How I dig: a real crate, with hand-lettered dividers
 *  for where they dig, each standing behind what they found there. Beside
 *  it, each find's staff-pick card stays pinned up -- where they found it and
 *  why, in their own words -- in the crate's order, top to bottom, so all of
 *  it is read without hunting for it. When the crate comes into view the
 *  records come up one at a time as their cards are clipped on. Pointing at
 *  a card pulls its record out and pointing at a record lights its card;
 *  either plays it. */
export function Dig() {
  const { tape, play, onAir } = useTape();
  const now = usePlayer();
  const [shown, setShown] = useState<string | null>(null);
  const keyOf = (c: Cover) => `${c.artistId}:${c.title}`;
  const recordQueue = (c: Cover) => `about:record:${c.artistId}`;
  const isOn = (c: Cover) => (c.at !== null ? onAir === c.at : now.queue?.id === recordQueue(c) && now.at !== null && !now.paused);
  // A song on the tape plays on the tape; a record from the map, a song from itself.
  const playFind = (c: Cover) => {
    if (c.at !== null) { play(c.at); return; }
    if (!c.track) return;
    if (now.queue?.id === recordQueue(c) && now.at !== null) { if (now.paused) player.resume(); else player.pause(); return; }
    player.play({ id: recordQueue(c), title: c.title, stopMs: 30000, tracks: [c.track] });
  };
  // The cards, top to bottom: each place in turn, as the text names them.
  const picks = tape.dig.flatMap(place => place.finds.map(c => ({ c, place: place.name })));
  const order = new Map(picks.map((p, n) => [keyOf(p.c), n]));
  // The crate, front to back, so it reads top to bottom in the cards' order:
  // the last place's records in front, each place's divider behind its own.
  // Each sits a step higher than the one in front (BIN_STEP): a divider just
  // clears the record in front of it, and the record behind a divider rises
  // clear of its tab, so every label has its records showing under it.
  const bin: ({ kind: 'divider'; p: number } | { kind: 'record'; p: number; i: number })[] = [];
  for (let p = tape.dig.length - 1; p >= 0; p--) {
    for (let i = tape.dig[p].finds.length - 1; i >= 0; i--) bin.push({ kind: 'record', p, i });
    bin.push({ kind: 'divider', p });
  }
  const rise = bin.map((b, k) => bin.slice(0, k + 1).reduce((y, x, j) => (j === 0 ? 0 : y + BIN_STEP[`${bin[j - 1].kind}-${x.kind}`]), 0));
  const point = (c: Cover) => ({ onPointerEnter: () => setShown(keyOf(c)), onPointerLeave: () => setShown(null) });
  return (
    <div className="tdig">
      <figure className="tcrate tcrate--dig">
        <figcaption className="tcrate__name">Where I look instead</figcaption>
        <div className="tcrate__shop">
          <div className="tcrate__stand">
            <div className="tcrate__bin">
              {bin.map((b, k) => {
                const style = { '--k': k, '--y': rise[k] } as React.CSSProperties;
                if (b.kind === 'divider') {
                  const d = tape.dig[b.p];
                  return (
                    <a key={d.name} className="tcrate__divider" href={d.href} target="_blank" rel="noopener noreferrer" style={style} aria-label={d.name}>
                      <span>{d.tab}</span>
                    </a>
                  );
                }
                const c = tape.dig[b.p].finds[b.i];
                // The cards below carry the words and a play button, so the
                // records themselves are for the mouse only.
                return (
                  <button
                    key={keyOf(c)}
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    className="tcrate__rec"
                    style={{ ...style, '--n': order.get(keyOf(c)) } as React.CSSProperties}
                    data-on={isOn(c) || undefined}
                    data-up={shown === keyOf(c) || undefined}
                    onClick={() => playFind(c)}
                    {...point(c)}
                  >
                    <span className="tcrate__lift">
                      {c.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sizedImageUrl(c.imageUrl, 250)} alt="" width={150} height={150} loading="lazy" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <ol className="tcrate__picks">
            {picks.map(({ c, place }, n) => {
              const on = isOn(c);
              return (
                <li key={keyOf(c)} className="tcrate__card" style={{ '--n': n } as React.CSSProperties} data-lit={shown === keyOf(c) || on || undefined} {...point(c)}>
                  <span className="tcrate__stamp">Found on {place}</span>
                  <div className="tcrate__card-head">
                    {c.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sizedImageUrl(c.imageUrl, 120)} alt="" width={54} height={54} loading="lazy" />
                    )}
                    <span>
                      <b className="tcrate__card-title">{c.title}</b>
                      <span className="tcrate__card-by">{c.artistName}</span>
                    </span>
                  </div>
                  {c.note.map((w, i) => (typeof w === 'string' ? <p key={i} className="tcrate__card-note">{w}</p> : (
                    <blockquote key={i} className="tcrate__card-quote">
                      <p>&ldquo;{w.quote}&rdquo;</p>
                      <footer>{w.who}</footer>
                    </blockquote>
                  )))}
                  <button type="button" className="tbutton tbutton--small tcrate__card-play" onClick={() => playFind(c)}>
                    <span className="tbutton__icon" data-pause={on || undefined} aria-hidden />
                    {c.song}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </figure>
    </div>
  );
}

// Where the faces sit around Alvvays, as fractions of the stage (W x H):
// the bands they learned from on an arc to the right, drawn to them; the
// bands an app shows beside them on an arc to the left, in grey, with no
// line to them at all.
const STAGE_W = 920;
const STAGE_H = 560;
const CX = 330;
const CY = 280;
const arc = (n: number, i: number, rx: number, ry: number, side: 1 | -1, span = 150) => {
  const a = ((-span / 2 + (n > 1 ? (span * i) / (n - 1) : span / 2)) * Math.PI) / 180;
  // Rounded: the server and the browser can differ in a sine's last digit,
  // and an unrounded position then fails hydration.
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return { x: r2(CX + side * rx * Math.cos(a)), y: r2(CY + ry * Math.sin(a)) };
};

/** 7. Sounding alike isn't influence: Alvvays, with the bands an app shows
 *  beside them in grey on one side (a shared sound, not one line to them on
 *  the map) and the bands they actually learned from drawn in on the other
 *  (the map's own links); then Fugazi and Elliott Smith, nothing alike and
 *  still a line. */
/** A line's paper tag. Pointing at a face (or a first tap) hangs a small
 *  tag off it on a string, naming where we know the line from; clicking the
 *  tag (or the face again) turns it over to the line itself, in the
 *  citation's words, with its Source ticket. A band with no line gets a tag
 *  that says so and doesn't turn. Shared by "Sounding alike isn't influence"
 *  and the threads. (A card under each diagram did this first; nobody saw
 *  it appear.) */
type TagRow = { key: string; label: string; color: string; citation?: string; url?: string | null; print?: string | null; note?: string };
type Align = 'start' | 'center' | 'end';
const alignAt = (x: number, of: number): Align => (x / of < 0.16 ? 'start' : x / of > 0.84 ? 'end' : 'center');
const placeOf = (r: TagRow) => (r.url ? sourcePlace(r.url).name : r.print ?? '');

function Tag({ rows, open, page, align, onTurn, hold }: {
  rows: TagRow[];
  open: boolean;
  page?: string;
  align: Align;
  onTurn: () => void;
  hold: { onPointerEnter: () => void; onPointerLeave: () => void; onFocus: () => void; onBlur: () => void };
}) {
  const turns = rows.some(r => r.citation);
  const front = rows.map(r => (
    <span key={r.key} className="ttag__row" style={{ '--glow': r.color } as React.CSSProperties}>
      <span className="ttag__label">{r.label}</span>
      <span className="ttag__place">{r.note ?? placeOf(r)}</span>
    </span>
  ));
  return (
    <div className={`ttag ttag--${align}`} data-open={open || undefined} {...hold}>
      {!open ? (
        turns ? (
          <button type="button" className="ttag__card" onClick={onTurn}>
            {front}
            <span className="ttag__turn">Turn over for their words &#8635;</span>
          </button>
        ) : (
          <div className="ttag__card">{front}</div>
        )
      ) : (
        <div className="ttag__card ttag__card--back">
          {rows.map(r => (
            <div key={r.key} className="ttag__line" style={{ '--glow': r.color } as React.CSSProperties}>
              <p className="ttag__label">{r.label}</p>
              <p className="ttag__cite">{r.citation}</p>
              <SourceLink url={r.url} print={r.print} size="small" />
            </div>
          ))}
          <div className="ttag__foot">
            {page && <Link href={`/artist/${page}`}>Their page &rarr;</Link>}
            <button type="button" onClick={onTurn}>Turn back</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Which face's tag is out, and whether it's turned over. A mouse shows the
 *  tag while it points (with a moment's grace to reach the tag) and a click
 *  turns it; a tap hangs it and a second tap turns it; a click anywhere else
 *  or Esc puts it away. `initial` hangs one tag to begin with, on a wide
 *  screen only: on a phone the tag is fixed above the pocket player, so it
 *  would follow the reader down the page; there, scrolling on puts it away. */
function useTags(initial: string | null) {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const ptr = useRef('mouse');
  const narrow = () => window.matchMedia('(max-width: 760px)').matches;
  const timer = useRef<number | undefined>(undefined);
  const enter = (id: string) => { window.clearTimeout(timer.current); setHover(id); };
  const leave = (id: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHover(h => (h === id ? null : h)), 240);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // After hydration, so the server's page and the first paint agree.
  useEffect(() => {
    if (!initial || narrow()) return;
    const t = window.setTimeout(() => setPinned(p => p ?? initial), 0);
    return () => window.clearTimeout(t);
  }, [initial]);
  useEffect(() => {
    if ((!open && !pinned) || !narrow()) return;
    let start: number | null = null;
    const scrolled = (e: Event) => {
      const el = e.target instanceof Element ? e.target : document.scrollingElement;
      const top = el?.scrollTop ?? 0;
      if (start === null) start = top;
      else if (Math.abs(top - start) > 120) { setOpen(null); setPinned(null); setHover(null); }
    };
    document.addEventListener('scroll', scrolled, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', scrolled, { capture: true });
  }, [open, pinned]);
  useEffect(() => {
    if (!open && !pinned) return;
    const away = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('.tspot')) { setOpen(null); setPinned(null); }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open, pinned]);
  const shown = hover && hover !== open ? hover : open ?? pinned;
  const turn = (id: string) => { setPinned(id); setOpen(o => (o === id ? null : id)); };
  const face = (id: string) => ({
    'aria-expanded': shown === id,
    onPointerDown: (e: React.PointerEvent) => { ptr.current = e.pointerType; },
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') enter(id); },
    onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') leave(id); },
    onFocus: () => enter(id),
    onBlur: () => leave(id),
    onClick: () => {
      if (open === id) setOpen(null);
      else if (pinned === id || (hover === id && ptr.current === 'mouse')) turn(id);
      else { setPinned(id); setOpen(null); }
    },
  });
  const hold = (id: string) => ({ onPointerEnter: () => enter(id), onPointerLeave: () => leave(id), onFocus: () => enter(id), onBlur: () => leave(id) });
  const clear = () => { setHover(null); setPinned(null); setOpen(null); };
  return { shown, isOpen: (id: string) => open === id && shown === id, face, hold, turn, clear };
}

export function Learned() {
  const { tape } = useTape();
  const { band, from, soundsLike, notSound } = tape.learned;
  const now = usePlayer();
  const listening = now.queue?.id === notSound.listen.id && now.at !== null;
  const learned = from.map((f, i) => ({ f, ...arc(from.length, i, 380, 238, 1, 164) }));
  const alike = soundsLike.map((f, i) => ({ f, ...arc(soundsLike.length, i, 290, 210, -1, 120) }));
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const tags = useTags('cocteau-twins');
  const shownId = tags.shown;
  const spot = (f: Face, x: number, y: number, i: number, kind: 'from' | 'like', rows: TagRow[]) => (
    <div key={f.id} className="tspot" data-shown={shownId === f.id || undefined} style={{ left: pct(x, STAGE_W), top: pct(y, STAGE_H), '--i': i } as React.CSSProperties}>
      <button type="button" className={`tlearn__${kind}`} data-on={shownId === f.id || undefined} aria-label={`${f.name}: how the map knows`} {...tags.face(f.id)}>
        <Photo f={f} size={kind === 'from' ? 60 : 52} />
        <span className="tface__name">{f.name}</span>
      </button>
      {shownId === f.id && (
        <Tag key={tags.isOpen(f.id) ? 'back' : 'front'} rows={rows} open={tags.isOpen(f.id)} page={f.id} align={kind === 'from' ? 'start' : alignAt(x, STAGE_W)} onTurn={() => tags.turn(f.id)} hold={tags.hold(f.id)} />
      )}
    </div>
  );
  return (
    <div className="tlearn" onKeyDown={e => { if (e.key === 'Escape') tags.clear(); }}>
      <div className="tlearn__stage">
        <svg className="tlearn__lines" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="none" aria-hidden>
          {learned.map(({ f, x, y }, i) => (
            <line key={f.id} x1={CX} y1={CY} x2={x} y2={y} data-on={shownId === f.id || undefined} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </svg>
        <p className="tlearn__tag tlearn__tag--like" style={{ left: pct(CX - 270, STAGE_W) }}>sounds like<span>no line to them</span></p>
        <p className="tlearn__tag tlearn__tag--from" style={{ left: pct(CX + 380, STAGE_W) }}>learned from<span>a line, with its source</span></p>
        {alike.map(({ f, x, y }, i) => spot(f, x, y, i, 'like', [
          { key: 'like', label: `Sounds like ${band.name}`, color: '#8a8992', note: 'No line: just a similar sound' },
        ]))}
        <Link href={`/artist/${band.id}`} className="tlearn__band" style={{ left: pct(CX, STAGE_W), top: pct(CY, STAGE_H) }}>
          <Photo f={band} size={120} />
          <span className="tface__name">{band.name}</span>
        </Link>
        {learned.map(({ f, x, y }, i) => spot(f, x, y, i, 'from', [
          { key: 'from', label: `${band.name} learned from them`, color: 'var(--vfd)', citation: f.citation, url: f.url, print: f.print },
        ]))}
      </div>

      <div className="tnot">
        <p className="tnot__words">{notSound.words}</p>
        <div className="tnot__pair">
          {[notSound.from, notSound.to].map((f, i) => {
            const on = listening && now.at === i && !now.paused;
            const t = notSound.listen.tracks[i];
            return (
              <div key={f.id} className="tnot__band">
                <Link href={`/artist/${f.id}`} className="tnot__face">
                  <Photo f={f} size={96} />
                  <span className="tface__name">{f.name}</span>
                </Link>
                {t.previewUrl && (
                  <button
                    type="button"
                    className="tbutton tbutton--small"
                    onClick={() => (listening && now.at === i ? (now.paused ? player.resume() : player.pause()) : player.play(notSound.listen, i))}
                  >
                    <span className="tbutton__icon" data-pause={on || undefined} aria-hidden />
                    {t.previewTrack}
                  </button>
                )}
              </div>
            );
          })}
          <p className="tnot__line">
            <span className="tnot__quote">&ldquo;{notSound.quote}&rdquo;</span>
            <span className="tnot__source">{notSound.source}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** How genres split, and how they merge, drawn as mirror images on one
 *  axis so the contrast reads as deliberate. Soft and beautiful always on
 *  the left, heavy and brutal on the right. (They were labelled "Split
 *  apart" and "Come together" once, which meant nothing out of context.)
 *  - One genre, split in two: punk in the middle, arrows pointing out; the
 *    light runs from the centre to both ends at once (twee pop, mathcore).
 *  - Two genres, merged into one: shoegaze and black metal at the ends, arrows pointing
 *    in; the light runs from both ends and meets at blackgaze (Deafheaven).
 *  Every genre on the map is a sign linking to its page; one that isn't on
 *  the map says so. Each half lights when it scrolls into view. The loud
 *  songs never play by themselves, say they're loud, and come in quieter. */
export function OneFamily() {
  const { tape, play, onAir } = useTape();
  const f = tape.oneFamily;
  const now = usePlayer();
  const queueOn = (id: string) => now.queue?.id === id && now.at !== null;
  const toggle = (q: typeof f.loud.listen) =>
    queueOn(q.id) ? (now.paused ? player.resume() : player.pause()) : player.play(q, 0);
  const softOn = onAir === f.soft.listen.at;

  const sign = (s: ForkSign, centre = false) =>
    s.id ? (
      <Link href={`/genre/${s.id}`} className={`froad__sign tfork__sign${centre ? ' tfork__sign--centre' : ''}`} style={{ '--glow': s.color } as React.CSSProperties}>
        <span className="froad__name">{s.name}</span>
        {s.emerged && <span className="froad__year">{s.emerged}</span>}
      </Link>
    ) : (
      <span className={`tfork__sign tfork__sign--off${centre ? ' tfork__sign--centre' : ''}`}>
        <span className="froad__name">{s.name}</span>
        <span className="froad__year">not on the map</span>
      </span>
    );
  // A half of the axis: signs with an arrow before each, counted by their
  // distance from the centre (--d), which sets when each lights.
  const half = (signs: ForkSign[], arrow: string, side: 'soft' | 'loud') => (
    <ol className={`tfork__half tfork__half--${side}`}>
      {signs.flatMap((s, i) => [
        <li key={`a${i}`} className="tfork__arrow" style={{ '--d': i * 2 } as React.CSSProperties} aria-hidden>{arrow}</li>,
        <li key={s.name} style={{ '--d': i * 2 + 1 } as React.CSSProperties}>{sign(s)}</li>,
      ])}
    </ol>
  );
  const listen = (on: boolean, label: string, onClick: () => void, loud = false) => (
    <button type="button" className={`tbutton tbutton--small${loud ? ' tbutton--loud' : ''}`} onClick={onClick}>
      <span className="tbutton__icon" data-pause={on || undefined} aria-hidden />
      {label}
    </button>
  );
  const band = (face: Face) => (
    <span className="tnot__face">
      <Photo f={face} size={96} />
      <span className="tface__name">{face.name}</span>
    </span>
  );
  const splitDepth = Math.max(f.soft.road.length, f.loud.road.length) + 1;
  // A half of the merge: its line back, outermost first, running in to the
  // centre; counted so both halves' light reaches the centre together.
  const mergeDepth = Math.max(f.merge.road.length, f.merge.otherRoad.length) + 1;
  const inward = (signs: ForkSign[], arrow: string, side: 'soft' | 'loud', depth: number) => {
    const lead = (depth - signs.length) * 2;
    const items = signs.flatMap((s, i) => [
      <li key={s.name} style={{ '--d': lead + i * 2 } as React.CSSProperties}>{sign(s)}</li>,
      <li key={`a${i}`} className="tfork__arrow" style={{ '--d': lead + i * 2 + 1 } as React.CSSProperties} aria-hidden>{arrow}</li>,
    ]);
    return <ol className={`tfork__half tfork__half--${side} tfork__half--in`}>{side === 'soft' ? items : items.reverse()}</ol>;
  };

  return (
    <div className="tfork">
      <Reveal as="div" className="tsplit">
        <p className="tfork__label">One genre, split in two <span>punk became both twee pop and mathcore</span></p>
        <div className="tfork__road" style={{ '--n': splitDepth * 2 } as React.CSSProperties}>
          {half([...f.soft.road, f.soft.end], '\u2190', 'soft')}
          <div className="tfork__centre">{sign(f.root, true)}</div>
          {half([...f.loud.road, f.loud.end], '\u2192', 'loud')}
        </div>
        <div className="tfork__dirs" aria-hidden>
          <span>&larr; soft, innocent, slow</span>
          <span>fast, heavy, complex &rarr;</span>
        </div>
        <div className="tfork__ends">
          <div className="tfork__end">
            <Link href={`/artist/${f.soft.band.id}`} className="tnot__face">
              <Photo f={f.soft.band} size={96} />
              <span className="tface__name">{f.soft.band.name}</span>
            </Link>
            {listen(softOn, `Listen: ${f.soft.listen.title}`, () => play(f.soft.listen.at))}
          </div>
          <div className="tfork__end">
            {band(f.loud.band)}
            {listen(queueOn(f.loud.listen.id) && !now.paused, `Listen (it\u2019s loud): ${f.loud.title}`, () => toggle(f.loud.listen), true)}
          </div>
        </div>
      </Reveal>

      <Reveal as="div" className="tmerge">
        <p className="tfork__label">Two genres, merged into one <span>shoegaze and black metal became blackgaze</span></p>
        <div className="tmerge__words">{f.merge.words.map((w, i) => <p key={i}>{w}</p>)}</div>
        <div className="tfork__road" style={{ '--n': mergeDepth * 2 } as React.CSSProperties}>
          {inward([...f.merge.road, f.merge.from], '\u2192', 'soft', mergeDepth)}
          <div className="tfork__centre">{sign(f.merge.to, true)}</div>
          {inward([...f.merge.otherRoad, f.merge.other], '\u2190', 'loud', mergeDepth)}
        </div>
        <div className="tfork__dirs" aria-hidden>
          <span>heaven: beauty &rarr;</span>
          <span>&larr; hell: brutality</span>
        </div>
        <div className="tfork__ends tfork__ends--three">
          <div className="tfork__end">
            <Link href={`/artist/${f.merge.soft.band.id}`} className="tnot__face">
              <Photo f={f.merge.soft.band} size={96} />
              <span className="tface__name">{f.merge.soft.band.name}</span>
            </Link>
            {listen(onAir === f.merge.soft.listen.at, `Listen: ${f.merge.soft.listen.title}`, () => play(f.merge.soft.listen.at))}
          </div>
          <div className="tfork__end tfork__end--meet">
            {band(f.merge.band)}
            {listen(queueOn(f.merge.listen.id) && !now.paused, `Listen (it\u2019s loud): ${f.merge.title}`, () => toggle(f.merge.listen), true)}
          </div>
          <div className="tfork__end">
            {band(f.merge.loud.band)}
            {listen(queueOn(f.merge.loud.listen.id) && !now.paused, `Listen (it\u2019s loud): ${f.merge.loud.title}`, () => toggle(f.merge.loud.listen), true)}
          </div>
        </div>
      </Reveal>

      <p className="tfork__last"><Link href="/genres">{f.last} &rarr;</Link></p>
    </div>
  );
}

/** Why the map has scenes: the Windmill and DC's straight edge movement,
 *  each as its strip of film from /scenes -- one frame per band, its sounds
 *  under it in their families' colours, so the strip shows bands divided by
 *  sound in one room -- then the story in the owner's words. */
export function Scenes() {
  const { tape, onAir } = useTape();
  // The band on air, if a song of theirs is playing (the track's own songs:
  // black midi, Minor Threat, Fugazi).
  const onAirId = onAir === null ? null : tape.tracks.flatMap(t => t.songs).find(x => x.at === onAir)?.artistId ?? null;
  return (
    <div className="tscenes">
      {tape.scenes.map(s => <SceneStrip key={s.id} s={s} onAirId={onAirId} />)}
    </div>
  );
}

/** One scene: when it scrolls into view the film runs in through the gate,
 *  frame after frame, each photo developing from grey into colour; the
 *  scene's name gets a pencil stroke; then the words rise in. Pointing at a
 *  frame lifts it off the film. The band on air steps up and bumps on the
 *  beat (everyone else stays as they are). */
function SceneStrip({ s, onAirId }: { s: ReturnType<typeof useTape>['tape']['scenes'][number]; onAirId: string | null }) {
  const strip = useRef<HTMLOListElement>(null);
  const live = !!onAirId && s.bands.some(b => b.id === onAirId);
  useMusicMotion(strip, live);
  return (
    <Reveal className="tscene" aria-labelledby={`tscene-${s.id}`}>
      <p id={`tscene-${s.id}`} className="tfork__label tscene__title">
        {s.title}
        <span>
          <Link href={`/scene/${s.id}`} className="tscene__link">{s.name}, {s.where} <span aria-hidden>&rarr;</span></Link>
        </span>
      </p>
      <ol ref={strip} className="tscene__strip" data-live={live || undefined} style={{ '--n': s.bands.length } as React.CSSProperties}>
        {s.bands.map((b, k) => (
          <li key={b.id} className="tscene__frame" data-on={onAirId === b.id || undefined} style={{ '--k': k } as React.CSSProperties}>
            <Link href={`/artist/${b.id}`} className="tscene__shot" aria-label={b.name}>
              {b.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sizedImageUrl(b.imageUrl, 250)} alt="" width={128} height={160} loading="lazy" />
              )}
            </Link>
            <Link href={`/artist/${b.id}`} className="tscene__band">{b.name}</Link>
            <ul className="genre-tags tscene__sounds" aria-label={`${b.name}'s sounds`}>
              {b.sounds.map(g => (
                <li key={g.id}>
                  <Link href={`/genre/${g.id}`} className="genre-tag" style={{ '--tag': g.color } as React.CSSProperties}>{g.name}</Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <SceneCredits bands={s.bands} />
      <div className="tmerge__words tscene__words">{s.words.map((w, i) => <p key={i} style={{ '--w': i } as React.CSSProperties}>{w}</p>)}</div>
    </Reveal>
  );
}

/** The credit the Commons photos' licence asks for, as one line under the
 *  strip (under each frame it crowded the names): the bands by photographer
 *  and licence, each band linking to its photo's page. */
function SceneCredits({ bands }: { bands: ReturnType<typeof useTape>['tape']['scenes'][number]['bands'] }) {
  const groups = new Map<string, { author: string; license: string; bands: { name: string; url: string }[] }>();
  for (const b of bands) {
    if (!b.credit) continue;
    const k = `${b.credit.author}|${b.credit.license}`;
    const g = groups.get(k) ?? { author: b.credit.author, license: b.credit.license, bands: [] };
    g.bands.push({ name: b.name, url: b.credit.url });
    groups.set(k, g);
  }
  if (groups.size === 0) return null;
  return (
    <p className="tscene__credits">
      {[...groups.values()].map((g, i) => (
        <span key={i}>
          {i > 0 && ' \u00b7 '}
          Photos of{' '}
          {g.bands.map((b, j) => (
            <Fragment key={b.url}>
              {j > 0 && (j === g.bands.length - 1 ? ' and ' : ', ')}
              <a href={b.url} target="_blank" rel="noopener noreferrer">{b.name}</a>
            </Fragment>
          ))}
          : {g.author}, {g.license}
        </span>
      ))}
    </p>
  );
}


/** 8. Between my two constants: Cocteau Twins and My Bloody Valentine at
 *  either side, everyone on the map who learned from them hanging round them
 *  on a thread -- the map's own picture, a line for each influence -- and the
 *  five who learned from both in the middle, held by a thread from each.
 *  Pointing at anyone lights their thread(s) and shows how we know it (the
 *  citation and its source); a click or tap pins them. Slowdive is pinned to
 *  begin with: their line names both bands. Then two more in their own
 *  words, and the tallies. */
const TW = 1000;
const TH = 720;
const CT_AT = { x: 235, y: 355 };
const MBV_AT = { x: 760, y: 355 };
// Rounded: the server's and the browser's Math.cos can differ in the last
// digit, which React reports as a hydration mismatch.
const r2 = (v: number) => Math.round(v * 100) / 100;
type Spot = { t: Thread; x: number; y: number; i: number };
function threadSpots(th: { ct: Thread[]; both: Thread[]; mbv: Thread[] }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  // Each band's own learners round it, leaving open the side facing the
  // middle, where the threads to the five run. MBV's 18 alternate between
  // two rings, so a thread to the outer ring passes between inner faces.
  const ct = th.ct.map((t, i): Spot => {
    const a = rad(45 + ((i + 0.5) * 270) / th.ct.length);
    return { t, i, x: r2(CT_AT.x + 185 * Math.cos(a)), y: r2(CT_AT.y + 215 * Math.sin(a)) };
  });
  const mbv = th.mbv.map((t, i): Spot => {
    const a = rad(225 + ((i + 0.5) * 270) / th.mbv.length);
    const [rx, ry] = i % 2 ? [240, 300] : [168, 192];
    return { t, i: i + th.ct.length, x: r2(MBV_AT.x + rx * Math.cos(a)), y: r2(MBV_AT.y + ry * Math.sin(a)) };
  });
  // Newest at the top, so the oldest (Slowdive, whose tag is out to begin
  // with) hangs at the bottom, its tag over empty space rather than a face.
  const both = [...th.both].reverse().map((t, i): Spot => ({ t, i: i + th.ct.length + th.mbv.length, x: 500, y: MBV_AT.y + (i - (th.both.length - 1) / 2) * 96 }));
  return { ct, mbv, both };
}

/** A thread from a band to a face, sagging a little like a real one. */
const threadPath = (from: { x: number; y: number }, to: { x: number; y: number }) =>
  `M${from.x} ${from.y} Q${r2((from.x + to.x) / 2)} ${r2(Math.max(from.y, to.y) + 24)} ${to.x} ${to.y}`;

export function Between() {
  const { tape, onAir } = useTape();
  const { ct, mbv, ctCount, mbvCount, both, cards, threads } = tape.between;
  const alison = tape.tracks.find(t => t.id === 'between')!.songs[0];
  const ref = useRef<HTMLDivElement>(null);
  const live = onAir === alison.at;
  useMusicMotion(ref, live);
  const c = tape.counts;
  const spots = threadSpots(threads);
  const all = [...spots.ct, ...spots.both, ...spots.mbv];
  const tags = useTags(threads.both.some(t => t.id === 'slowdive') ? 'slowdive' : null);
  const shown = all.find(s => s.t.id === tags.shown)?.t ?? null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const bandOf = (to: 'ct' | 'mbv') => (to === 'ct' ? ct : mbv);
  const lines = (s: Spot) => s.t.links.map(l => ({ key: `${s.t.id}-${l.to}`, to: l.to, d: threadPath(l.to === 'ct' ? CT_AT : MBV_AT, s) }));

  const face = (s: Spot, group: string) => (
    <div key={s.t.id} className="tspot" data-shown={shown?.id === s.t.id || undefined} style={{ left: pct(s.x, TW), top: pct(s.y, TH), '--i': s.i } as React.CSSProperties}>
      <button
        type="button"
        className={`tthreads__face tthreads__face--${group}`}
        data-on={shown?.id === s.t.id || undefined}
        aria-label={`${s.t.name}: how the map knows`}
        {...tags.face(s.t.id)}
      >
        <Photo f={s.t} size={52} />
        <span className="tface__name">{s.t.name}</span>
      </button>
      {shown?.id === s.t.id && (
        <Tag
          key={tags.isOpen(s.t.id) ? 'back' : 'front'}
          rows={s.t.links.map(l => ({ key: l.to, label: `Learned from ${bandOf(l.to).name}`, color: bandOf(l.to).color, citation: l.citation, url: l.url, print: l.print }))}
          open={tags.isOpen(s.t.id)}
          page={s.t.id}
          align={alignAt(s.x, TW)}
          onTurn={() => tags.turn(s.t.id)}
          hold={tags.hold(s.t.id)}
        />
      )}
    </div>
  );

  const anchor = (f: Face, at: { x: number; y: number }, count: number, side: string) => (
    <Link href={`/artist/${f.id}`} className={`tthreads__band tthreads__band--${side}`} data-lit={shown?.links.some(l => l.to === side) || undefined} style={{ left: pct(at.x, TW), top: pct(at.y, TH), '--glow': f.color } as React.CSSProperties}>
      <Photo f={f} size={104} />
      <span className="tface__name">{f.name}</span>
      <span className="tthreads__count"><b>{count}</b> learned from them</span>
    </Link>
  );

  return (
    <div className="tbetween">
      <p className="tknow__lead">{tape.between.lead}</p>
      <div
        ref={ref}
        className="tthreads"
        data-live={live || undefined}
        data-active={shown ? true : undefined}
        style={{ '--ct': ct.color, '--mbv': mbv.color } as React.CSSProperties}
        onKeyDown={e => { if (e.key === 'Escape') tags.clear(); }}
      >
        <svg className="tthreads__lines" viewBox={`0 0 ${TW} ${TH}`} aria-hidden>
          {all.flatMap(s => lines(s).map(l => (
            <path key={l.key} d={l.d} className={`tthreads__line tthreads__line--${l.to}`} data-on={shown?.id === s.t.id || undefined} style={{ '--i': s.i } as React.CSSProperties} />
          )))}
        </svg>
        <p className="tthreads__both-label" style={{ left: pct(500, TW), top: pct(MBV_AT.y - ((threads.both.length - 1) / 2) * 96 - 74, TH) }}>
          {both.length} learned from both
        </p>
        {anchor(ct, CT_AT, ctCount, 'ct')}
        {anchor(mbv, MBV_AT, mbvCount, 'mbv')}
        <div className="tthreads__group tthreads__group--ct">
          <p className="tthreads__group-label">Only {ct.name}</p>
          {spots.ct.map(s => face(s, 'ct'))}
        </div>
        <div className="tthreads__group tthreads__group--both">
          <p className="tthreads__group-label">Learned from both</p>
          {spots.both.map(s => face(s, 'both'))}
        </div>
        <div className="tthreads__group tthreads__group--mbv">
          <p className="tthreads__group-label">Only {mbv.name}</p>
          {spots.mbv.map(s => face(s, 'mbv'))}
        </div>
      </div>

      <div className="tknow__cards">
        {cards.map((card, i) => (
          <blockquote key={card.who} className="tknow__card" style={{ '--i': i } as React.CSSProperties}>
            <span className="tknow__stamp">In their own words</span>
            <p className="tknow__quote">&ldquo;{card.quote}&rdquo;</p>
            <footer className="tknow__who">{card.who}<span>{card.source}</span></footer>
          </blockquote>
        ))}
      </div>
      <ul className="tknow__tally">
        <li style={{ '--i': 0 } as React.CSSProperties}><b>{c.links.toLocaleString()}</b> influences on the map, {c.cited === c.links ? 'every one' : `${c.cited.toLocaleString()} of them`} with a named source</li>
        <li style={{ '--i': 1 } as React.CSSProperties}><b>{c.firstPerson.toLocaleString()}</b> of those sources are the artist, in their own words</li>
        <li style={{ '--i': 2 } as React.CSSProperties}><b>{c.denied}</b> times an artist denied an influence people assume; those are kept too</li>
      </ul>
    </div>
  );
}

const DOORS = [
  { label: 'Cocteau Twins on the map', href: '/?artist=cocteau-twins' },
  { label: 'My Bloody Valentine on the map', href: '/?artist=my-bloody-valentine' },
  { label: 'Genres: fifty years of sounds', href: '/genres' },
  { label: 'Scenes: the rooms it happened in', href: '/scenes' },
  { label: 'Browse: everyone on the map', href: '/browse' },
];

// How to read the map, in plain words (it isn't explained anywhere else on
// this page, and an About page is where people look).
const KEY = [
  'Every star is an artist.',
  'Every line runs from who shaped them to who they shaped, with its source.',
  'The colour is the family of sound they belong to.',
  'The bigger the star, the more artists name them.',
];

/** 9. Here's where the story ends: doors out to the rest of the site, how to
 *  read the map, and the tape running out, its clear leader showing, the
 *  reels stopping. After the run-out, a hidden track: how it's made. */
export function TapeEnd() {
  const { tape } = useTape();
  return (
    <>
    <div className="tend">
      <ul className="tend__doors">
        {DOORS.map((d, i) => (
          <li key={d.href} style={{ '--i': i } as React.CSSProperties}>
            <Link href={d.href} className="tend__door">{d.label} <span aria-hidden>&rarr;</span></Link>
          </li>
        ))}
      </ul>
      <div className="tend__tape" aria-hidden>
        <div className="tcass tcass--end">
          <Cassette side="B" to={tape.label.to} title={tape.sides.B} wound={1} leader />
        </div>
        <p className="tend__sign">from {tape.label.from}</p>
      </div>
    </div>
    <div className="tkey">
      <p className="tkey__title">Reading the map</p>
      <ul>{KEY.map(k => <li key={k}>{k}</li>)}</ul>
      <Link href="/?tour" className="tkey__tour">Take the tour on the map &rarr;</Link>
    </div>
    <aside className="thidden" aria-labelledby="hidden-track">
      <p className="thidden__no" id="hidden-track">How it&rsquo;s made</p>
      {tape.liner.lines.map((l, i) => <p key={i}>{l}</p>)}
      <a href={tape.liner.code} target="_blank" rel="noopener noreferrer" className="thidden__code">The code is on GitHub &rarr;</a>
    </aside>
    </>
  );
}
