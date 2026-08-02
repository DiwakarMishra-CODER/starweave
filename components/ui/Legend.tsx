'use client';

import { useState } from 'react';
import { REALMS, REALM_LABELS, REALM_COLORS } from '@/lib/colors';
import type { Realm } from '@/data/types';

interface Props {
  activeRealms?: Set<Realm>;
}

export default function Legend({ activeRealms }: Props) {
  const [open, setOpen] = useState(true);

  return (
    // Position is bottom-anchored, so the toggle stays fixed at the bottom-left
    // and the body grows upward when expanded.
    <div className="legend" role="complementary" aria-label="Graph legend">
      {open && (
        <div className="legend__body">
          {/* One row per realm — this is the axis the graph actually renders
              distinguishably (node color). The finer per-lineage shading
              inside a realm isn't a legend-worthy distinction: every
              lineage within one realm renders as a near-identical shade of
              that realm's single hue (see lib/colors.ts's lineage color
              comments), so listing all ~20 of them here was claiming
              visual differences that don't exist and eating a third of
              the panel doing it. */}
          <p className="legend__group-label">Realms</p>
          <ul className="legend__items">
            {REALMS.map(realm => {
              const dimmed = activeRealms && activeRealms.size > 0 && !activeRealms.has(realm);
              return (
                <li key={realm} className="legend__item" style={{ opacity: dimmed ? 0.35 : 1 }}>
                  <span
                    className="legend__dot"
                    style={{ background: REALM_COLORS[realm] }}
                    aria-hidden
                  />
                  {REALM_LABELS[realm]}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        className="legend__toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={open ? 'Collapse legend' : 'Expand legend'}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="1.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
          <circle cx="10.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
        </svg>
        Realms
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }}
        >
          <path
            d="M1 5.5L4 2.5L7 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
