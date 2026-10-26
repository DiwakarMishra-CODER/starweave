import { useMemo } from 'react';
import { sizedImageUrl } from '@/lib/image-url';
import type { Backline, Face, ShelfRecord } from '@/lib/backline';
import Cassette from '@/components/about/Cassette';

// The room's walls, the way a Tiny Desk office is crammed: a wooden bookcase
// floor to ceiling in each side column, every shelf filled differently --
// dense runs of records spine-out, their family's records face-out, singles,
// stacked books with cassettes on top, framed photos -- and between them, the
// wall behind the page plastered with posters, showing through every gap
// between the page's sheets: band posters printed in two colours from their
// family's photos, records pinned up as promo posters, their scene's flyer,
// and type posters of the sounds they're filed under. Every picture is real
// (the map's own photos and covers); no gig is invented. Upright throughout:
// only tape, a leaning record and a photo without words ever tilt.
//
// On the big low hits of a song, a few things rattle and settle (Room moves
// whatever is marked `data-rattle`, by its own --rx/--ry/--rr): the records
// turned face-out and the leaning ones, the cassettes, the framed photos.
// Never the dense runs of spines: stripes jittering are hard on the eyes.

const VINYL = ['#141214', '#1e1b20', '#26232a', '#e9e1d0', '#2b2a2e', '#7a2e2a', '#c9a24a', '#33415c', '#d7cdb8', '#4a5d3a', '#8c5a7a', '#141214', '#1e1b20'];
const BOOKS = ['#7a2e2a', '#33415c', '#c9a24a', '#2f4a3a', '#d7cdb8', '#5a3d5c', '#a6542f', '#1f2b3a'];
const INKS = ['#e8463a', '#2f6fb3', '#f2b42c', '#2e8b57', '#e3609a', '#8a5bd1', '#ff7a1a', '#16a3a3'];

function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

type Thing =
  | { kind: 'spines'; x: number; y: number; spines: { w: number; h: number; c: string; lean: number }[] }
  | { kind: 'cover'; x: number; y: number; s: number; record: ShelfRecord; out?: boolean }
  | { kind: 'books'; x: number; y: number; books: { w: number; h: number; c: string; dx: number }[] }
  | { kind: 'cassette'; x: number; y: number; w: number; name: string; side: 'A' | 'B' }
  | { kind: 'frame'; x: number; y: number; w: number; h: number; face: Face; tilt: number };

type Poster =
  | { kind: 'band'; x: number; y: number; w: number; h: number; face: Face; ink: string }
  | { kind: 'record'; x: number; y: number; w: number; record: ShelfRecord }
  | { kind: 'flyer'; x: number; y: number; w: number; h: number; name: string; city: string; years: string; ink: string }
  | { kind: 'type'; x: number; y: number; w: number; h: number; words: string; ink: string };

interface Case { x: number; w: number; shelves: number[]; things: Thing[] }

function buildCases(b: Backline, W: number, H: number, L: number, R: number, rand: () => number) {
  const records = [...b.records];
  const faces = [...b.badges, ...b.stickers];
  let r = 0;
  let f = 0;
  const nextRecord = () => (records.length ? records[r++ % records.length] : null);
  const nextFace = () => (faces.length ? faces[f++ % faces.length] : null);
  const cases: Case[] = [];
  const F = 10; // the case's frame
  const cell = Math.round(Math.max(118, Math.min(150, H / 5.2)));
  for (const [x0, gw] of [[0, L], [W - R, R]] as const) {
    if (gw < 90) continue;
    const x = x0 + 6;
    const w = gw - 12;
    const iw = w - 2 * F;
    const shelves: number[] = [];
    for (let y = 40 + cell; y < H + cell; y += cell) shelves.push(y);
    const things: Thing[] = [];
    shelves.forEach((floor, i) => {
      const ch = cell - 12; // the room above this shelf
      const left = x + F + 4;
      const right = x + F + iw - 4;
      const run = (from: number, to: number, tall = 0.86) => {
        const spines: { w: number; h: number; c: string; lean: number }[] = [];
        let at = from;
        while (at < to - 3) {
          const sw = 2 + Math.round(rand() * 3);
          spines.push({ w: sw, h: Math.round(ch * (rand() < 0.15 ? 0.55 : tall + rand() * 0.06)), c: VINYL[Math.floor(rand() * VINYL.length)], lean: 0 });
          at += sw + 0.5;
        }
        // The last few lean over where the run stops short.
        if (spines.length > 4 && rand() < 0.7) spines.slice(-3).forEach((s, j) => { s.lean = 6 + j * 4; });
        things.push({ kind: 'spines', x: from, y: floor, spines });
      };
      const pattern = (i + (x0 > 0 ? 2 : 0)) % 5;
      if (pattern === 0) {
        // Spines either side of a record turned face-out.
        const rec = nextRecord();
        const s = Math.round(Math.min(ch * 0.86, iw * 0.62));
        const at = left + Math.round(iw * (0.12 + rand() * 0.18));
        run(left, at + 6);
        run(at + s - 6, right);
        if (rec) things.push({ kind: 'cover', x: at, y: floor - s, s, record: rec, out: rand() < 0.4 });
      } else if (pattern === 1) {
        // Books laid flat with cassettes on top; a framed photo beside them.
        const bw = Math.round(iw * (0.52 + rand() * 0.12));
        const books: { w: number; h: number; c: string; dx: number }[] = [];
        let h = 0;
        for (let k = 0; k < 3 + Math.floor(rand() * 3); k++) {
          const bh = 9 + Math.round(rand() * 6);
          books.push({ w: bw - Math.round(rand() * 14), h: bh, c: BOOKS[Math.floor(rand() * BOOKS.length)], dx: Math.round(rand() * 6) });
          h += bh;
        }
        things.push({ kind: 'books', x: left, y: floor, books });
        const face = nextFace();
        const cw = Math.min(bw - 6, 70);
        things.push({ kind: 'cassette', x: left + 2, y: floor - h - cw * 0.636, w: cw, name: face?.name ?? b.self?.name ?? 'side A', side: rand() < 0.5 ? 'A' : 'B' });
        if (face) {
          const fw = Math.min(right - left - bw - 10, 64);
          if (fw > 34) things.push({ kind: 'frame', x: left + bw + 8, y: floor - fw * 1.26, w: fw, h: Math.round(fw * 1.26), face, tilt: Math.round((rand() - 0.5) * 8) });
        }
      } else if (pattern === 2) {
        // A dense run of records, wall to wall.
        run(left, right);
      } else if (pattern === 3) {
        // Two singles in front of a run.
        run(left, right, 0.8);
        const s = Math.round(ch * 0.48);
        for (let k = 0; k < 2; k++) {
          const rec = nextRecord();
          if (rec) things.push({ kind: 'cover', x: left + 6 + k * (s * 0.62), y: floor - s, s, record: rec });
        }
      } else {
        // A framed photo, then spines.
        const face = nextFace();
        const fw = Math.round(Math.min(iw * 0.42, ch * 0.62));
        if (face) things.push({ kind: 'frame', x: left + 4, y: floor - fw * 1.26, w: fw, h: Math.round(fw * 1.26), face, tilt: Math.round((rand() - 0.5) * 6) });
        run(left + (face ? fw + 12 : 0), right);
      }
    });
    cases.push({ x, w, shelves, things });
  }
  return cases;
}

function buildPosters(b: Backline, genres: string[], W: number, H: number, L: number, R: number, rand: () => number) {
  const from = L > 40 ? L - 4 : 0;
  const to = R > 40 ? W - R + 4 : W;
  const faces = [b.self, ...b.badges, ...b.stickers].filter((x): x is Face => !!x);
  const records = b.records;
  const posters: Poster[] = [];
  let fi = 0;
  let ri = 0;
  let gi = 0;
  let flyered = false;
  let n = 0;
  let x = from - 10;
  while (x < to) {
    const cw = Math.round(140 + rand() * 70);
    let y = -Math.round(rand() * 90);
    while (y < H) {
      const ink = INKS[(n * 3 + Math.floor(rand() * 2)) % INKS.length];
      const roll = n % 7;
      let p: Poster | null = null;
      if (b.scene && !flyered && n === 3) {
        p = { kind: 'flyer', x, y, w: cw, h: Math.round(cw * 1.3), ...b.scene, ink };
        flyered = true;
      } else if ((roll === 1 || roll === 4) && records.length) {
        p = { kind: 'record', x, y, w: cw, record: records[ri++ % records.length] };
      } else if (roll === 5 && genres.length) {
        p = { kind: 'type', x, y, w: cw, h: Math.round(cw * 0.7), words: genres[gi++ % genres.length], ink };
      } else if (faces.length) {
        p = { kind: 'band', x, y, w: cw, h: Math.round(cw * 1.36), face: faces[fi++ % faces.length], ink };
      } else if (records.length) {
        p = { kind: 'record', x, y, w: cw, record: records[ri++ % records.length] };
      }
      if (!p) break;
      posters.push(p);
      n++;
      y += (p.kind === 'record' ? cw + 12 : p.h) - Math.round(rand() * 14) + 6;
    }
    x += cw - Math.round(rand() * 10) + 4;
  }
  return posters;
}

/** How far a thing rattles, px and degrees at the peak; neighbours (`n`)
 *  each their own way. */
function rattle(x: number, y: number, r: number, n: number): React.CSSProperties {
  const sign = n % 2 ? 1 : -1;
  return { '--rx': x * sign, '--ry': y, '--rr': r * sign } as React.CSSProperties;
}

const fit = (words: string, w: number, h: number) => Math.round(Math.min(h, (w / Math.max(4, words.length)) * 1.8));

export default function Wall({ backline, genres, W, H, L, R, seed }: {
  backline: Backline;
  genres: string[];
  W: number;
  H: number;
  L: number;
  R: number;
  seed: string;
}) {
  const { cases, posters } = useMemo(() => {
    const rand = seeded(seed);
    return { posters: buildPosters(backline, genres, W, H, L, R, rand), cases: buildCases(backline, W, H, L, R, rand) };
  }, [backline, genres, W, H, L, R, seed]);

  return (
    <>
      {posters.map((p, i) => {
        const tape = <><span className="room__tape" style={{ left: -6, rotate: '-9deg' }} /><span className="room__tape" style={{ right: -6, rotate: '8deg' }} /></>;
        if (p.kind === 'record') return (
          <span key={i} className="room__poster room__poster--record" style={{ left: p.x, top: p.y, width: p.w, height: p.w }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sizedImageUrl(p.record.imageUrl, 300)} alt="" loading="lazy" />
            {tape}
          </span>
        );
        if (p.kind === 'band') return (
          <span key={i} className="room__poster room__poster--band" style={{ left: p.x, top: p.y, width: p.w, height: p.h, '--ink': p.ink } as React.CSSProperties}>
            <span className="room__duo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sizedImageUrl(p.face.imageUrl, 250)} alt="" loading="lazy" />
            </span>
            <span className="room__bill" style={{ fontSize: fit(p.face.name, p.w - 14, 30) }}>{p.face.name}</span>
            {tape}
          </span>
        );
        if (p.kind === 'flyer') return (
          <span key={i} className="room__poster room__poster--flyer" style={{ left: p.x, top: p.y, width: p.w, height: p.h, '--ink': p.ink } as React.CSSProperties}>
            <span className="room__flyer-kicker">The scene</span>
            <span className="room__flyer-name" style={{ fontSize: fit(p.name, p.w - 20, 40) }}>{p.name}</span>
            <span className="room__flyer-rule" />
            <span className="room__flyer-where">{p.city}</span>
            <span className="room__flyer-where">{p.years}</span>
            {tape}
          </span>
        );
        return (
          <span key={i} className="room__poster room__poster--type" style={{ left: p.x, top: p.y, width: p.w, height: p.h, '--ink': p.ink } as React.CSSProperties}>
            <span style={{ fontSize: fit(p.words, p.w - 16, 44) }}>{p.words}</span>
            {tape}
          </span>
        );
      })}

      {cases.map((c, ci) => (
        <div key={ci} className="room__case" style={{ left: c.x, width: c.w }}>
          {c.shelves.map(y => <span key={y} className="room__shelf" style={{ top: y }} />)}
          {c.things.map((t, i) => {
            const at = { left: t.x - c.x - 10, top: t.y }; // inside the case's frame
            if (t.kind === 'spines') return (
              <span key={i} className="room__spines" style={at}>
                {t.spines.map((s, j) => (
                  <span
                    key={j}
                    data-rattle={s.lean ? '' : undefined}
                    style={{ width: s.w, height: s.h, background: s.c, rotate: s.lean ? `${s.lean}deg` : undefined, ...(s.lean ? rattle(0, 0, 2.4, j) : {}) }}
                  />
                ))}
              </span>
            );
            if (t.kind === 'cover') return (
              <span key={i} className="room__rec" data-out={t.out || undefined} data-rattle="" style={{ ...at, width: t.s, height: t.s, ...rattle(1.4, -1.6, 0, i) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sizedImageUrl(t.record.imageUrl, 200)} alt="" loading="lazy" />
              </span>
            );
            if (t.kind === 'books') return (
              <span key={i} className="room__books" style={at}>
                {t.books.map((bk, j) => <span key={j} style={{ width: bk.w, height: bk.h, background: bk.c, marginLeft: bk.dx }} />)}
              </span>
            );
            if (t.kind === 'cassette') return (
              <span key={i} className="room__cassette" data-rattle="" style={{ ...at, width: t.w, ...rattle(0.6, -2.6, 0, i) }}>
                <Cassette side={t.side} to={t.name} title="" wound={0.5} />
              </span>
            );
            return (
              <span key={i} className="room__frame" data-rattle="" style={{ ...at, width: t.w, height: t.h, rotate: `${t.tilt}deg`, ...rattle(0.4, -1.2, 1.3, i) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sizedImageUrl(t.face.imageUrl, 160)} alt="" loading="lazy" />
              </span>
            );
          })}
        </div>
      ))}
    </>
  );
}
