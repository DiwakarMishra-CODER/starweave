'use client';

import { useEffect, useRef } from 'react';

// The record section's arrivals (RecordSleeve): each part marked
// data-arrive gets `is-in` once it's well into view (a quarter of the way up
// the screen, where the eye is, not as it peeks in at the bottom), and CSS
// plays its entrance -- the record rising out of its crate and the vinyl
// spinning out, the "Start here" sticker slapping on and the listen buttons
// popping in, the sleeve notes' name highlighted and the paragraphs
// printing in, the flyer dropping in and its tape pressing on. The section
// is only "armed" (parts held back until they arrive) once this has run and
// motion is allowed, so without it everything simply shows.

export default function SleeveArrivals() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>('.sleeve');
    if (!section || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    section.classList.add('sleeve--armed');
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -25% 0px' });
    section.querySelectorAll('[data-arrive]').forEach(el => io.observe(el));
    return () => { io.disconnect(); section.classList.remove('sleeve--armed'); };
  }, []);

  return <span ref={ref} hidden />;
}
