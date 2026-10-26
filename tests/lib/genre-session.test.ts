import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { GraphData } from '@/data/types';
import { CLIP_H, NOTE_W, PLAYER_CORNER, buildGenreSession, letterLines, lineageOf, placeNote, signTextWidth, spreadYears, YEAR_LABEL_GAP } from '@/lib/genre-session';

const data = JSON.parse(readFileSync(resolve(__dirname, '../../public/graph.json'), 'utf-8')) as GraphData;
const session = buildGenreSession(data);
const byId = new Map(session.clips.map(c => [c.id, c]));

// Points along a drawn path (its straight runs; rounded corners skipped).
function samples(d: string): { x: number; y: number }[] {
  const tokens = d.match(/[MLVHQ]|-?\d+(\.\d+)?/g)!;
  const pts: { x: number; y: number }[] = [];
  let x = 0, y = 0, i = 0;
  const num = () => Number(tokens[i++]);
  const run = (nx: number, ny: number) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(nx - x, ny - y) / 2));
    for (let k = 1; k < steps; k++) pts.push({ x: x + ((nx - x) * k) / steps, y: y + ((ny - y) * k) / steps });
    x = nx; y = ny;
  };
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M') { x = num(); y = num(); }
    else if (cmd === 'L') run(num(), num());
    else if (cmd === 'V') run(x, num());
    else if (cmd === 'H') run(num(), y);
    else if (cmd === 'Q') { num(); num(); x = num(); y = num(); }
  }
  return pts;
}

describe('buildGenreSession', () => {
  it('puts every dated genre on the sheet once', () => {
    const dated = data.genres.filter(g => g.emerged !== undefined);
    expect(session.clips.map(c => c.id).sort()).toEqual(dated.map(g => g.id).sort());
  });

  it('never lets two clips on a track touch', () => {
    for (let t = 0; t < session.trackYs.length; t++) {
      const onTrack = session.clips.filter(c => c.track === t).sort((a, b) => a.left - b.left);
      for (let i = 0; i + 1 < onTrack.length; i++) {
        expect(onTrack[i].left + onTrack[i].w, `${onTrack[i].id} / ${onTrack[i + 1].id}`).toBeLessThan(onTrack[i + 1].left);
      }
    }
  });

  it('never runs time backwards', () => {
    for (const a of session.clips) {
      for (const b of session.clips) {
        if (a.emerged < b.emerged) expect(a.left, `${a.id} before ${b.id}`).toBeLessThan(b.left);
      }
    }
  });

  it('draws every "grew out of" once, as a splice only when the child follows its parent', () => {
    const withParent = session.clips.filter(c => c.parentId);
    expect(session.links.map(l => l.childId).sort()).toEqual(withParent.map(c => c.id).sort());
    for (const l of session.links) {
      const p = byId.get(l.parentId)!, c = byId.get(l.childId)!;
      const between = session.clips.some(o => o.track === c.track && o.left > p.left && o.left < c.left);
      const follows = p.track === c.track && !between;
      expect(l.kind, `${p.id} -> ${c.id}`).toBe(follows ? 'splice' : 'cable');
    }
  });

  it('never runs a cable behind a clip it does not join', () => {
    // Collected, then asserted once: an expect per sample point made this
    // slow enough to time out on CI.
    const behind: string[] = [];
    for (const l of session.links) {
      for (const pt of samples(l.d)) {
        for (const o of session.clips) {
          if (o.id === l.childId || o.id === l.parentId) continue;
          const inside = pt.x > o.left + 1 && pt.x < o.left + o.w - 1 && Math.abs(pt.y - o.y) < CLIP_H / 2 - 1;
          if (inside) behind.push(`${l.parentId} -> ${l.childId} behind ${o.id}`);
        }
      }
    }
    expect([...new Set(behind)]).toEqual([]);
  });

  it('keeps the bottom-right corner clear for the pocket player', () => {
    const under = session.clips.filter(c => c.left + c.w > session.width - PLAYER_CORNER.w && c.y + CLIP_H / 2 > session.height - PLAYER_CORNER.h);
    expect(under.map(c => c.id)).toEqual([]);
  });

  it("never prints one lit year over another, and keeps them in order", () => {
    for (const c of session.clips) {
      const lit = new Set(lineageOf(c.id, byId).map(id => byId.get(id)!.emerged));
      const at = spreadYears(session.years.filter(yr => lit.has(yr.year)), session.timeStart, session.timeEnd);
      const xs = [...lit].sort((a, b) => a - b).map(y => at.get(y)!);
      for (let i = 0; i + 1 < xs.length; i++) expect(xs[i + 1] - xs[i], c.id).toBeGreaterThanOrEqual(YEAR_LABEL_GAP - 0.01);
      for (const x of xs) {
        expect(x).toBeGreaterThanOrEqual(session.timeStart);
        expect(x).toBeLessThanOrEqual(session.timeEnd);
      }
    }
  });

  it("pins every sign's note clear of the signs on its line back to the founder", () => {
    for (const c of session.clips) {
      const line = new Set(lineageOf(c.id, byId));
      const at = placeNote(session, c.id, line, 200);
      const hidden = session.clips.filter(o => line.has(o.id)
        && o.left < at.left + NOTE_W && o.left + o.w > at.left
        && o.y + CLIP_H / 2 > at.top && o.y - CLIP_H / 2 < at.top + 200);
      expect(hidden.map(o => o.id), c.id).toEqual([]);
    }
  });

  it("letters every district's name inside its own rows, clear of every sign and cable", () => {
    for (const f of session.families) {
      const d = f.district;
      expect(d, f.id).not.toBeNull();
      expect(d!.px).toBeGreaterThanOrEqual(22);
      expect(d!.y).toBeGreaterThanOrEqual(f.top);
      expect(d!.y + d!.px).toBeLessThanOrEqual(f.bottom);
      for (const c of session.clips) {
        const apart = c.left + c.w <= d!.x || d!.x + d!.w <= c.left
          || c.y + CLIP_H / 2 <= d!.y || d!.y + d!.px <= c.y - CLIP_H / 2;
        expect(apart, `${f.id} / ${c.id}`).toBe(true);
      }
      for (const l of session.links.filter(k => k.kind === 'cable')) {
        const through = samples(l.d).filter(q => q.x > d!.x && q.x < d!.x + d!.w && q.y > d!.y && q.y < d!.y + d!.px);
        expect(through, `${f.id} / ${l.childId}`).toEqual([]);
      }
    }
  });

  // As wide as a laptop window; as tall as it needs for the rows to breathe
  // (it once had to fit a ~760px window and the rows were too cramped to
  // read), but no taller than a short scroll.
  it('fits a laptop window across, and is only a short scroll tall', () => {
    expect(session.width).toBeLessThanOrEqual(1400);
    expect(session.height).toBeLessThanOrEqual(860);
  });

  it('fits every name inside its sign', () => {
    for (const c of session.clips) {
      for (const line of c.lines) {
        // 9 + 8 padding and a 1.5px border a side, in globals.css.
        expect(signTextWidth(line) + 20, `${c.id}: "${line}"`).toBeLessThanOrEqual(c.w);
      }
    }
  });
});

describe('letterLines', () => {
  it('keeps short names whole and breaks long ones at a space or hyphen', () => {
    expect(letterLines('Punk')).toEqual(['Punk']);
    expect(letterLines('Alternative rock')).toEqual(['Alternative', 'rock']);
    expect(letterLines('Singer-songwriter')).toEqual(['Singer-', 'songwriter']);
  });

  it('draws one road per line: a road only ever joins a sign to the one it grew out of', () => {
    for (const c of session.clips) {
      const under = session.roads.filter(r => r.y === c.y && r.x1 <= c.left && c.left + c.w <= r.x2);
      expect(under).toHaveLength(1);
    }
    for (const r of session.roads) {
      const on = session.clips.filter(c => c.y === r.y && r.x1 <= c.left && c.left + c.w <= r.x2).sort((a, b) => a.left - b.left);
      expect(on.length).toBeGreaterThan(0);
      for (let i = 1; i < on.length; i++) expect(on[i].parentId).toBe(on[i - 1].id);
      expect(new Set(on.map(c => c.familyId)).size).toBe(1);
    }
    // Roads on one lane never overlap.
    for (const y of session.trackYs) {
      const rs = session.roads.filter(r => r.y === y).sort((a, b) => a.x1 - b.x1);
      for (let i = 1; i < rs.length; i++) expect(rs[i].x1).toBeGreaterThanOrEqual(rs[i - 1].x2);
    }
  });
});
