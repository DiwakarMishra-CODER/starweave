'use client';

import { useEffect, useRef } from 'react';

export interface SortOption {
  id: string;
  label: string;
}

interface Props {
  label: string;
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Same trigger/panel language as FilterDropdown (genre/scene/era), but
// single-select: no checkboxes/counts, and picking an option closes the
// panel immediately instead of staying open for further ticks.
export default function SortDropdown({ label, options, value, onChange, isOpen, onOpenChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.id === value);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className="browse-dropdown" ref={ref}>
      <button
        type="button"
        className="browse-dropdown__button"
        onClick={() => onOpenChange(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {label}: {current?.label ?? value}
        <svg className="browse-dropdown__chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="browse-dropdown__panel browse-dropdown__panel--sort" role="listbox" aria-label={label}>
          <div className="browse-dropdown__options">
            {options.map(opt => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={opt.id === value}
                className={`browse-dropdown__option browse-dropdown__option--radio${opt.id === value ? ' browse-dropdown__option--selected' : ''}`}
                onClick={() => {
                  onChange(opt.id);
                  onOpenChange(false);
                }}
              >
                <span className="browse-dropdown__option-label">{opt.label}</span>
                {opt.id === value && (
                  <span className="browse-dropdown__option-check" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
