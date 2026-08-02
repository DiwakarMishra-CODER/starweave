'use client';

import { useState } from 'react';
import type { Realm } from '@/data/types';
import { REALMS, REALM_LABELS, REALM_COLORS } from '@/lib/colors';

interface Props {
  activeRealms: Set<Realm>;
  onToggleRealm: (realm: Realm) => void;
}

export default function GraphControls({ activeRealms, onToggleRealm }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="graph-controls">
      <button
        className="graph-controls__toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Toggle realm filters"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="1.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
          <circle cx="10.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
        </svg>
        Filter realms
      </button>

      {open && (
        <div className="graph-controls__panel" role="group" aria-label="Realm filters">
          <p className="graph-controls__group-label">Realms</p>
          {REALMS.map(realm => {
            const checked = activeRealms.size === 0 || activeRealms.has(realm);
            return (
              <label key={realm} className="graph-controls__check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleRealm(realm)}
                  className="sr-only"
                />
                <span
                  className="graph-controls__swatch"
                  style={{
                    background: REALM_COLORS[realm],
                    opacity: checked ? 1 : 0.3,
                  }}
                  aria-hidden
                />
                <span style={{ opacity: checked ? 1 : 0.45 }}>{REALM_LABELS[realm]}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
