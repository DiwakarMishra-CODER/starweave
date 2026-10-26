'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { IN_VIEW } from './Reveal';

// A row of prints dealt onto the table the first time it scrolls into view:
// each one flies off a pile at the row's start to its place, oldest first,
// turning as it goes and landing straight. FLIP by the Web Animations API --
// every print's place is measured, then it starts from the pile -- set up
// before the frame paints, so none shows in place first. Reduced motion:
// they're simply there.

const DEAL_MS = 560;
const STAGGER_MS = 28;

export default function DealList({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<'wait' | 'in'>('wait');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setState('in');
        io.disconnect();
      }
    }, IN_VIEW);
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const ul = ref.current;
    if (state !== 'in' || !ul || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pile = ul.getBoundingClientRect();
    const anims = ([...ul.children] as HTMLElement[]).map((li, i) => {
      const r = li.getBoundingClientRect();
      const turn = ((i * 37) % 17) - 8; // a different lean for each, the same every time
      return li.animate([
        { transform: `translate(${pile.left - r.left}px, ${pile.top - r.top}px) rotate(${turn}deg) scale(0.92)`, opacity: 0 },
        { offset: 0.12, opacity: 1 },
        { transform: 'none', opacity: 1 },
      ], { duration: DEAL_MS, delay: i * STAGGER_MS, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.08)', fill: 'backwards' });
    });
    return () => anims.forEach(a => a.cancel());
  }, [state]);

  // `deal-list` hides the cards until they're dealt (globals), whatever list it is.
  return <ul ref={ref} className={`deal-list${className ? ` ${className}` : ''}`} data-reveal={state}>{children}</ul>;
}
