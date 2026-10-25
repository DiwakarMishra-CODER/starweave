'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SceneStep as Step } from '@/lib/scene-page';
import { LEAVE_MS, noteArrival } from '@/lib/scene-arrival';

// The scene before or after this one in time, as a strip of film leader.
// Going there advances the film: this strip runs out to one side, then the
// next page's feeds in from the other and the years roll on from these
// (SceneTable). The page changes a beat after the click so the run-out
// shows; a click with a modifier key still opens a new tab as usual.
export default function SceneStep({ step, dir, from, big = false }: {
  step: Step;
  dir: 'prev' | 'next';
  /** This scene's years, for the rolling years on the next page. */
  from: { start: number; end: number; open: boolean };
  big?: boolean;
}) {
  const router = useRouter();
  const href = `/scene/${step.id}`;
  return (
    <Link
      href={href}
      className={`scene-leader scene-leader--${dir}${big ? ' scene-leader--big' : ''}`}
      onClick={e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        noteArrival({ kind: dir, scene: step.id, from });
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(() => router.push(href), still ? 0 : LEAVE_MS);
      }}
    >
      {dir === 'prev' && <span className="scene-leader__arrow" aria-hidden>&lsaquo;</span>}
      <span className="scene-leader__text">
        <span className="scene-leader__label">{dir === 'next' ? 'Next scene' : 'Previous scene'}</span>
        <span className="scene-leader__name">{step.name}</span>
        <span className="scene-leader__year">{step.yearStart}</span>
      </span>
      {dir === 'next' && <span className="scene-leader__arrow" aria-hidden>&rsaquo;</span>}
    </Link>
  );
}
