'use client';

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
  const active = MODES.find(m => m.value === value) ?? MODES[0];

  return (
    <div className="evidence-filter" role="group" aria-label="Filter connections by evidence">
      <div className="evidence-filter__head">
        <span className="evidence-filter__title">Evidence</span>
        {/* The count is the payoff — watching 1,041 fall to 544 is the point
            of the control, so it is given the emphasis, not the label. */}
        <span className="evidence-filter__count">
          <strong>{counts[value].toLocaleString()}</strong> edges
        </span>
      </div>

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
  );
}
