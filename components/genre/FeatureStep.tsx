'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FeatureStep as Step } from '@/lib/genre-feature';
import { TURN_MS, noteTurn } from '@/lib/feature-arrival';

// The feature before or after this one, in the city's order. Going there
// turns the page: this spread's page lifts and turns over (FeatureSpread),
// then the next one's lands. Pointing at it lifts its corner, the next
// feature's colour showing underneath, like a page you're about to turn. The page changes a beat after the click so the
// turn shows; a click with a modifier key still opens a new tab as usual.
export default function FeatureStep({ step, dir, big = false }: { step: Step; dir: 'prev' | 'next'; big?: boolean }) {
  const router = useRouter();
  const href = `/genre/${step.id}`;
  return (
    <Link
      href={href}
      className={`fstep fstep--${dir}${big ? ' fstep--big' : ''}`}
      style={{ '--under': step.color } as React.CSSProperties}
      onClick={e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        // Back up to the spread first, so the turn is seen from wherever the link was.
        document.querySelector('.feature-overlay')?.scrollTo({ top: 0 });
        noteTurn(dir, step.id);
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(() => router.push(href), still ? 0 : TURN_MS);
      }}
    >
      {dir === 'prev' && <span className="fstep__arrow" aria-hidden>&larr;</span>}
      <span className="fstep__text">
        <span className="fstep__label">{dir === 'next' ? 'Next feature' : 'Previous feature'}</span>
        <span className="fstep__name">{step.name}</span>
      </span>
      {dir === 'next' && <span className="fstep__arrow" aria-hidden>&rarr;</span>}
    </Link>
  );
}
