'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// A section that knows when it has scrolled into view: it carries
// data-reveal="wait" until a good part of it shows, then "in", once. The
// moves themselves are CSS keyed on that (globals, "A scene's page"), and
// only under no-preference for reduced motion: with reduced motion nothing
// is ever hidden. (These sections sit below the first screen, so their
// waiting state is never seen on arrival.)

type Tag = 'section' | 'div' | 'nav';

export default function Reveal({ as = 'section', threshold = 0.2, children, ...rest }: {
  as?: Tag;
  threshold?: number;
  children: ReactNode;
  className?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'wait' | 'in'>('wait');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setState('in');
        io.disconnect();
      }
    }, { threshold, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const setRef = (el: HTMLElement | null) => { ref.current = el; };
  if (as === 'nav') return <nav ref={setRef} data-reveal={state} {...rest}>{children}</nav>;
  if (as === 'div') return <div ref={setRef} data-reveal={state} {...rest}>{children}</div>;
  return <section ref={setRef} data-reveal={state} {...rest}>{children}</section>;
}
