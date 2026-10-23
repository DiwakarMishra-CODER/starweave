'use client';

import { useEffect, useRef, useState } from 'react';
import type { EvidenceFilter, Realm } from '@/data/types';
import { REALM_COLORS, REALM_LABELS_SHORT } from '@/lib/colors';
import { storyFrame } from '@/lib/story-store';
import EvidenceFilterControl from './EvidenceFilter';

// The lighting desk: the room's lamps (see lib/room-lights.ts) on a cheap
// little fader board, the kind with a strip of masking tape down the side and
// each channel's name written on it in marker. One fader per realm: pull it
// down and that part of the map dims; Solo lights only that one. The "Show"
// switch (which influences count) sits on the same board, so the map's
// controls are one thing, not two.
//
// Levels live in storyFrame.realmLevel, which the canvas reads every frame —
// sliding a fader never re-renders the graph. They also outlive the desk
// (it's hidden during the opening and the tour), so it reads them back when
// it returns.

interface Props {
  evidence: EvidenceFilter;
  onEvidence: (next: EvidenceFilter) => void;
  counts: Record<EvidenceFilter, number>;
}

const CHANNELS: Realm[] = [
  'region-one',
  'american-underground',
  'electronic',
  'folk-confessional',
  'emo-posthardcore',
  'post-rock-drone-noise',
];

const FLOOR = 0.1;      // a realm pulled right down still shows, just
const SOLO_REST = 0.12; // everything but the soloed realm
const OPEN_KEY = 'starweave:desk-open';

const levelOf = (v: number) => FLOOR + (1 - FLOOR) * (v / 100);
const faderOf = (level: number | undefined) => Math.round(((level ?? 1) - FLOOR) / (1 - FLOOR) / 0.05) * 5;

export default function LightingDesk({ evidence, onEvidence, counts }: Props) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(CHANNELS.map(r => [r, storyFrame.realmLevel[r] === undefined ? 100 : faderOf(storyFrame.realmLevel[r])])),
  );
  const [solo, setSolo] = useState<Realm | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Open on a roomy screen the first time; after that, as it was left.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(OPEN_KEY); } catch { /* storage blocked */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: the starting state depends on the window and the visitor's own choice, neither known on the server
    setOpen(saved === null ? window.innerWidth >= 1100 && window.innerHeight >= 1000 : saved === '1');
  }, []);
  const toggle = () => {
    setOpen(o => {
      try { localStorage.setItem(OPEN_KEY, o ? '0' : '1'); } catch { /* storage blocked */ }
      return !o;
    });
  };

  // Each realm's level as the map shows it, and what the canvas reads.
  const levelFor = (r: Realm) => {
    const level = levelOf(values[r]);
    return solo && r !== solo ? Math.min(level, SOLO_REST) : level;
  };
  useEffect(() => {
    const next: Record<string, number> = {};
    for (const r of CHANNELS) {
      const level = levelOf(values[r]);
      next[r] = solo && r !== solo ? Math.min(level, SOLO_REST) : level;
    }
    storyFrame.realmLevel = next;
  }, [values, solo]);

  // The canvas keeps the realms' names clear of the desk: tell it how much
  // room the desk takes.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      storyFrame.deskBox = { w: r.width, h: r.height };
    });
    ro.observe(el);
    return () => { ro.disconnect(); storyFrame.deskBox = null; };
  }, []);

  const touched = solo !== null || CHANNELS.some(r => values[r] !== 100);
  const allUp = () => { setValues(Object.fromEntries(CHANNELS.map(r => [r, 100]))); setSolo(null); };

  return (
    <div ref={boxRef} className={`desk${open ? ' desk--open' : ' desk--compact'}`}>
      <button
        type="button"
        className="desk__head"
        aria-expanded={open}
        aria-controls="desk-channels"
        onClick={toggle}
      >
        <span className="desk__title">Lights</span>
        <span className="desk__leds" aria-hidden>
          {CHANNELS.map(r => (
            <i
              key={r}
              style={{ background: REALM_COLORS[r], color: REALM_COLORS[r], opacity: 0.25 + 0.75 * levelFor(r) }}
            />
          ))}
        </span>
        {open && <span className="desk__hint">Hide</span>}
        <span className="desk__chev" aria-hidden>{open ? '▾' : '▴'}</span>
        {!open && <span className="sr-only">Dim a part of the map</span>}
      </button>

      {open && (
        <div id="desk-channels" className="desk__channels" role="group" aria-label="Light each part of the map">
          {CHANNELS.map(r => {
            const name = REALM_LABELS_SHORT[r];
            const soloed = solo === r;
            return (
              <div key={r} className={`desk__channel${solo && !soloed ? ' desk__channel--muted' : ''}`}>
                <label className="desk__tape" htmlFor={`desk-${r}`}>{name}</label>
                <input
                  id={`desk-${r}`}
                  className="desk__fader"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={values[r]}
                  aria-valuetext={`${values[r]}%`}
                  style={{ '--cap': REALM_COLORS[r] } as React.CSSProperties}
                  onChange={e => setValues(v => ({ ...v, [r]: Number(e.target.value) }))}
                />
                <button
                  type="button"
                  className={`desk__solo${soloed ? ' desk__solo--on' : ''}`}
                  aria-pressed={soloed}
                  aria-label={`Solo ${name}`}
                  onClick={() => setSolo(soloed ? null : r)}
                >
                  Solo
                </button>
              </div>
            );
          })}
          {touched && (
            <button type="button" className="desk__reset" onClick={allUp}>
              All lights up
            </button>
          )}
        </div>
      )}

      <EvidenceFilterControl value={evidence} onChange={onEvidence} counts={counts} compact={!open} />
    </div>
  );
}
