'use client';

import { useState } from 'react';
import type { EvidenceFilter } from '@/data/types';

interface Props {
  value: EvidenceFilter;
  onChange: (next: EvidenceFilter) => void;
  /** Edge count surviving each mode, computed once by the caller. */
  counts: Record<EvidenceFilter, number>;
}

// The graph's whole argument is that its edges are checkable. This control is
// how a visitor tests that rather than taking it on faith: drop everything
// except what the artists said themselves, and look at what survives.
//
// Two modes, not three — see the note on EvidenceFilter in data/types.ts for
// why the middle "has a citation" tier was cut. Labels are written as things a
// person would say out loud; "first-person", "sourceTier" and "cited" are the
// data model's vocabulary and have no business on screen.
const MODES: { value: EvidenceFilter; label: string; hint: string }[] = [
  {
    value: 'all',
    label: 'Everything',
    hint: 'Every documented influence, however it was sourced',
  },
  {
    value: 'first-person',
    label: 'In their own words',
    hint: 'Only where the artist said it themselves, on the record',
  },
];

export default function EvidenceFilterControl({ value, onChange, counts }: Props) {
  // Starts open: this is the control that explains what the project is, and a
  // collapsed bar gives a first-time visitor no reason to look for it. Once
  // they know it is there, collapsing hands the corner of the canvas back.
  const [open, setOpen] = useState(true);
  const active = MODES.find(m => m.value === value) ?? MODES[0];

  return (
    <div
      className={`evidence-filter${open ? ' evidence-filter--open' : ''}`}
      role="group"
      aria-label="Filter connections by evidence"
    >
      {/* The header is the toggle in both states, so the count and the control
          never separate — collapsed, this whole bar is the only thing left. */}
      <button
        className="evidence-filter__head"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={open ? 'Collapse evidence filter' : 'Expand evidence filter'}
      >
        <span className="evidence-filter__title">Evidence</span>
        <span className="evidence-filter__count">
          <strong>{counts[value].toLocaleString()}</strong> edges
        </span>
        {/* Collapsed, the count alone doesn't say WHICH mode produced it. */}
        {!open && value !== 'all' && (
          <span className="evidence-filter__badge">{active.label}</span>
        )}
        <span className="evidence-filter__chevron" aria-hidden>⌄</span>
      </button>

      {open && (
        <div className="evidence-filter__body">
          <div className="evidence-filter__options">
            {MODES.map(mode => (
              <button
                key={mode.value}
                className={`evidence-filter__option${value === mode.value ? ' evidence-filter__option--active' : ''}`}
                onClick={() => onChange(mode.value)}
                aria-pressed={value === mode.value}
                title={`${mode.hint} — ${counts[mode.value].toLocaleString()} edges`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <p className="evidence-filter__hint">{active.hint}</p>
        </div>
      )}
    </div>
  );
}
