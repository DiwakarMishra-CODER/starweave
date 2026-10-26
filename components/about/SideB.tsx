'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { player, usePlayer } from '@/lib/player';
import { sizedImageUrl } from '@/lib/image-url';
import { useMusicMotion } from '@/components/genre/useMusicMotion';
import type { Cover, Face, ForkSign } from '@/lib/about-tape';
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
  return { x: CX + side * rx * Math.cos(a), y: CY + ry * Math.sin(a) };
};

/** 7. Sounding alike isn't influence: Alvvays, with the bands an app shows
 *  beside them in grey on one side (a shared sound, not one line to them on
 *  the map) and the bands they actually learned from drawn in on the other
 *  (the map's own links); then Fugazi and Elliott Smith, nothing alike and
 *  still a line. */
export function Learned() {
  const { tape } = useTape();
  const { band, from, soundsLike, notSound } = tape.learned;
  const now = usePlayer();
  const listening = now.queue?.id === notSound.listen.id && now.at !== null;
  const learned = from.map((f, i) => ({ f, ...arc(from.length, i, 380, 238, 1, 164) }));
  const alike = soundsLike.map((f, i) => ({ f, ...arc(soundsLike.length, i, 290, 210, -1, 120) }));
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div className="tlearn">
      <div className="tlearn__stage">
        <svg className="tlearn__lines" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="none" aria-hidden>
          {learned.map(({ f, x, y }, i) => (
            <line key={f.id} x1={CX} y1={CY} x2={x} y2={y} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </svg>
        <p className="tlearn__tag tlearn__tag--like" style={{ left: pct(CX - 270, STAGE_W) }}>sounds like<span>no line to them</span></p>
        <p className="tlearn__tag tlearn__tag--from" style={{ left: pct(CX + 380, STAGE_W) }}>learned from<span>a line, with its source</span></p>
        {alike.map(({ f, x, y }, i) => (
          <Link key={f.id} href={`/artist/${f.id}`} className="tlearn__like" style={{ left: pct(x, STAGE_W), top: pct(y, STAGE_H), '--i': i } as React.CSSProperties}>
            <Photo f={f} size={52} />
            <span className="tface__name">{f.name}</span>
          </Link>
        ))}
        <Link href={`/artist/${band.id}`} className="tlearn__band" style={{ left: pct(CX, STAGE_W), top: pct(CY, STAGE_H) }}>
          <Photo f={band} size={120} />
          <span className="tface__name">{band.name}</span>
        </Link>
        {learned.map(({ f, x, y }, i) => (
          <Link key={f.id} href={`/artist/${f.id}`} className="tlearn__from" style={{ left: pct(x, STAGE_W), top: pct(y, STAGE_H), '--i': i } as React.CSSProperties}>
            <Photo f={f} size={60} />
            <span className="tface__name">{f.name}</span>
          </Link>
        ))}
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

/** 8. Between my two constants: Cocteau Twins and My Bloody Valentine as two
 *  records sliding together; the bands on the map that learned from both sit
 *  in the overlap. Then how the map knows: two of those lines' sources, and
 *  the tallies for all of them. */
export function Between() {
  const { tape, onAir } = useTape();
  const { ct, mbv, ctCount, mbvCount, both, cards } = tape.between;
  const alison = tape.tracks.find(t => t.id === 'between')!.songs[0];
  const ref = useRef<HTMLDivElement>(null);
  const live = onAir === alison.at;
  useMusicMotion(ref, live);
  const c = tape.counts;
  return (
    <div className="tbetween">
      <div ref={ref} className="tvenn" data-live={live || undefined}>
        <div className="tvenn__disc tvenn__disc--a" style={{ '--glow': ct.color } as React.CSSProperties}>
          <span className="tvenn__label" />
          <p className="tvenn__count"><b>{ctCount}</b> learned from {ct.name}</p>
        </div>
        <div className="tvenn__disc tvenn__disc--b" style={{ '--glow': mbv.color } as React.CSSProperties}>
          <span className="tvenn__label" />
          <p className="tvenn__count"><b>{mbvCount}</b> learned from {mbv.name}</p>
        </div>
        <ul className="tvenn__both">
          {both.map((f, i) => (
            <li key={f.id} style={{ '--i': i } as React.CSSProperties}>
              <Link href={`/artist/${f.id}`} title={f.name} aria-label={f.name}>
                <Photo f={f} size={46} />
              </Link>
            </li>
          ))}
        </ul>
        <p className="tvenn__both-label">{both.length} learned from both</p>
      </div>

      <p className="tknow__lead">{tape.between.lead}</p>
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
        <li style={{ '--i': 0 } as React.CSSProperties}><b>{c.links.toLocaleString()}</b> influences on the map, {c.cited.toLocaleString()} of them with a named source</li>
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
        <p className="tend__sign">&mdash; {tape.label.from}</p>
      </div>
    </div>
    <div className="tkey">
      <p className="tkey__title">Reading the map</p>
      <ul>{KEY.map(k => <li key={k}>{k}</li>)}</ul>
      <Link href="/?tour" className="tkey__tour">Take the tour on the map &rarr;</Link>
    </div>
    <aside className="thidden" aria-labelledby="hidden-track">
      <p className="thidden__no" id="hidden-track">Hidden track &middot; How it&rsquo;s made</p>
      {tape.liner.lines.map((l, i) => <p key={i}>{l}</p>)}
      <a href={tape.liner.code} target="_blank" rel="noopener noreferrer" className="thidden__code">The code is on GitHub &rarr;</a>
    </aside>
    </>
  );
}
