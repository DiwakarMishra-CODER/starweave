'use client';

import { useState } from 'react';
import type { Layer } from '@/data/types';
import { LAYER_COLORS, LAYER_LABELS, LAYERS } from '@/lib/colors';

interface Props {
  activeLayers: Set<Layer>;
  onToggleLayer: (layer: Layer) => void;
}

export default function GraphControls({ activeLayers, onToggleLayer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="graph-controls">
      <button
        className="graph-controls__toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Toggle layer filters"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="1.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
          <circle cx="10.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
        </svg>
        Filter layers
      </button>

      {open && (
        <div className="graph-controls__panel" role="group" aria-label="Layer filters">
          <p className="graph-controls__group-label">Layers</p>
          {LAYERS.map(layer => {
            const checked = activeLayers.size === 0 || activeLayers.has(layer);
            return (
              <label key={layer} className="graph-controls__check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleLayer(layer)}
                  className="sr-only"
                />
                <span
                  className="graph-controls__swatch"
                  style={{
                    background: LAYER_COLORS[layer],
                    opacity: checked ? 1 : 0.3,
                  }}
                  aria-hidden
                />
                <span style={{ opacity: checked ? 1 : 0.45 }}>{LAYER_LABELS[layer]}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
