'use client';

import { useEffect, useRef, useState } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface Props {
  label: string;
  options: FilterOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  isOpen,
  onOpenChange,
  searchable,
  searchPlaceholder,
}: Props) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

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

  const visibleOptions =
    searchable && search.trim()
      ? options.filter(o => o.label.toLowerCase().includes(search.trim().toLowerCase()))
      : options;

  return (
    <div className="browse-dropdown" ref={ref}>
      <button
        type="button"
        className={`browse-dropdown__button${selected.size > 0 ? ' browse-dropdown__button--active' : ''}`}
        onClick={() => onOpenChange(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        {selected.size > 0 && <span className="browse-dropdown__count">{selected.size}</span>}
        <svg className="browse-dropdown__chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="browse-dropdown__panel" role="group" aria-label={`${label} filters`}>
          {searchable && (
            <input
              type="search"
              className="browse-dropdown__search"
              placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          )}
          <div className="browse-dropdown__options">
            {visibleOptions.length === 0 && <p className="browse-dropdown__empty">No matches</p>}
            {visibleOptions.map(opt => (
              <label key={opt.id} className="browse-dropdown__option">
                <input type="checkbox" checked={selected.has(opt.id)} onChange={() => onToggle(opt.id)} />
                <span className="browse-dropdown__option-label">{opt.label}</span>
                <span className="browse-dropdown__option-count">{opt.count}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
