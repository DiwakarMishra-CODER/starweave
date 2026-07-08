'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'starweave:onboarding-seen';
const VISIBLE_MS = 5000;
const FADE_MS = 600; // must match the CSS transition duration below

// Shown once, ever, per browser — a first-time-visitor orientation, not a
// recurring nag. Tagline + hint appear and fade together as one block.
export default function GraphOnboarding() {
  const [shouldRender, setShouldRender] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // Storage unavailable (private browsing, disabled, etc.) — treat as
      // unseen rather than crash; the write below is guarded the same way.
      seen = false;
    }
    if (seen) return;

    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Nothing we can do — worst case it shows again next visit.
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: visibility depends on reading localStorage, an external system that can't be read during render
    setShouldRender(true);
    // Defer to the next frame so the initial (opacity: 0) state actually
    // paints before flipping the class — otherwise there's nothing to
    // transition from and the fade-in never animates.
    const raf = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    const removeTimer = setTimeout(() => setShouldRender(false), VISIBLE_MS + FADE_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`graph-onboarding${visible ? ' graph-onboarding--visible' : ''}`}>
      <p className="graph-tagline">
        An interactive map of who influenced whom in indie music —{' '}
        <span className="graph-tagline__cta">click any artist</span> to explore.
      </p>
      <p className="graph-hint">
        Click a node to focus · click again to open · click empty space to deselect
      </p>
    </div>
  );
}
