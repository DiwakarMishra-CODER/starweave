'use client';

import { useState } from 'react';
import { LAYER_COLORS, LAYER_LABELS, LAYERS } from '@/lib/colors';
import type { Layer } from '@/data/types';

interface Props {
  activeLayers?: Set<Layer>;
}

export default function Legend({ activeLayers }: Props) {
  const [open, setOpen] = useState(true);

  return (
    // Position is bottom-anchored, so the toggle stays fixed at the bottom-left
    // and the body grows upward when expanded.
    <div className="legend" role="complementary" aria-label="Graph legend">
      {open && (
        <div className="legend__body">
          <ul className="legend__items">
            {LAYERS.map(layer => {
              const dimmed = activeLayers && activeLayers.size > 0 && !activeLayers.has(layer);
              return (
                <li key={layer} className="legend__item" style={{ opacity: dimmed ? 0.35 : 1 }}>
                  <span
                    className="legend__dot"
                    style={{ background: LAYER_COLORS[layer] }}
                    aria-hidden
                  />
                  {LAYER_LABELS[layer]}
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
        Layers
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
