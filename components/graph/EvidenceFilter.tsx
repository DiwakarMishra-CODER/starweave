'use client';

import type { EvidenceFilter } from '@/data/types';
import { useNarrowLayout } from '@/lib/use-media-query';

interface Props {
  value: EvidenceFilter;
  onChange: (next: EvidenceFilter) => void;
  /** Connection count surviving each mode, computed once by the caller. */
  counts: Record<EvidenceFilter, number>;
  /** One slim row: short labels, no title or note (the lighting desk, closed). */
  compact?: boolean;
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
// Short forms on a phone. The full pair plus their counts runs ~272px of a
// 390px screen -- 70% of the width for a secondary control, and the second one
// wrapped to two lines. The counts sit right beside them, so "All" and
// "Artist's own" stay unambiguous in context.
const MODES: { value: EvidenceFilter; label: string; short: string }[] = [
  { value: 'all', label: 'All influences', short: 'All' },
  { value: 'first-person', label: 'Said by the artist', short: "Artist's own" },
];

export default function EvidenceFilterControl({ value, onChange, counts, compact = false }: Props) {
  const isNarrowLayout = useNarrowLayout();
  const short = isNarrowLayout || compact;
  // Derived, never typed: the caption can't drift from the data behind it.
  const fromOthers = counts.all - counts['first-person'];

  return (
    <div
      className={`evidence-filter${compact ? ' evidence-filter--compact' : ''}`}
      role="radiogroup"
      aria-label="Which influences to show"
      title={compact ? `Show all influences, or only what the artists said themselves. The other ${fromOthers.toLocaleString()} come from critics and press.` : undefined}
    >
      {!compact && <p className="evidence-filter__eyebrow">Show</p>}

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
              <span className="evidence-filter__option-label">
                {short ? mode.short : mode.label}
              </span>
              <span className="evidence-filter__option-count">{counts[mode.value].toLocaleString()}</span>
            </button>
          );
        })}
      </div>

      {/* Teaches the distinction once, so the two numbers above mean something
          rather than reading as trivia. */}
      {!compact && (
        <p className="evidence-filter__note">
          The other {fromOthers.toLocaleString()} come from critics and press.
        </p>
      )}
    </div>
  );
}
