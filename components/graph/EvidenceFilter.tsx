'use client';

import type { EvidenceFilter } from '@/data/types';

interface Props {
  value: EvidenceFilter;
  onChange: (next: EvidenceFilter) => void;
  /** Connection count surviving each mode, computed once by the caller. */
  counts: Record<EvidenceFilter, number>;
}

// The graph's whole argument is that its connections are checkable. This is how
// a visitor tests that instead of taking it on faith: hide everything except
// what the artists said themselves, and see what survives.
//
// Two visible options rather than a single checkbox. A lone tickbox states an
// action but not that there is a choice, so there is no reason to click it; two
// rows with one lit shows both states at once and reads as a control on sight.
//
// The words name the SOURCE OF THE CLAIM, because that is the only thing
// separating the two sets. An earlier version said "Evidence — Everything / In
// their own words · 1,041 edges", which named the axis but never the thing:
// "edges" is graph vocabulary to someone who came here for music, and neither
// mode said what picking it would do.
const MODES: { value: EvidenceFilter; label: string }[] = [
  { value: 'all', label: 'All influences' },
  { value: 'first-person', label: 'Said by the artist' },
];

export default function EvidenceFilterControl({ value, onChange, counts }: Props) {
  // Derived, never typed: the caption can't drift from the data behind it.
  const fromOthers = counts.all - counts['first-person'];

  return (
    <div className="evidence-filter" role="radiogroup" aria-label="Which influences to show">
      <p className="evidence-filter__eyebrow">Show</p>

      <div className="evidence-filter__options">
        {MODES.map(mode => {
          const active = value === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`evidence-filter__option${active ? ' evidence-filter__option--active' : ''}`}
              onClick={() => onChange(mode.value)}
            >
              <span className="evidence-filter__option-label">{mode.label}</span>
              <span className="evidence-filter__option-count">{counts[mode.value].toLocaleString()}</span>
            </button>
          );
        })}
      </div>

      {/* Teaches the distinction once, so the two numbers above mean something
          rather than reading as trivia. */}
      <p className="evidence-filter__note">
        The other {fromOthers.toLocaleString()} come from critics and press.
      </p>
    </div>
  );
}
