'use client';

import { useCoarsePointer } from '@/lib/use-media-query';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

// The interactions this card names, in the order a first-timer needs them.
// Zoom leads because it's the one gesture the graph can't hint at on its own:
// pulled out, every artist is an anonymous dot, and nothing on screen says
// that zooming in resolves faces and names. The "Jump to…" row names the
// top-left control, which GraphView also auto-opens on a first visit.
//
// Two sets, because naming a gesture the device doesn't have is worse than
// naming none: a phone has no scroll wheel, no cursor and no hover, and its
// version of "click again to open" is a second tap. Same four rows, same
// order, same closing "Jump to…" row either way.
const POINTER_HINTS: { key: string; action: string }[] = [
  { key: 'Scroll', action: 'zoom out for the whole constellation, in for faces and names' },
  { key: 'Click', action: 'a node to focus it — click again to open the artist' },
  { key: 'Drag', action: 'to pan · click empty space to deselect' },
  { key: 'Jump to…', action: 'fly the camera to a realm, genre, or scene' },
];

// Three rows, not four. On a 390px screen every floating box is competing with
// the graph for the same 798px, and panning is the one gesture people find by
// accident -- so the swipe row is the cheapest to lose. "Jump to…" stays and
// matters more here than on desktop, because on a phone that panel no longer
// opens itself (see initialOpen in GraphView).
const TOUCH_HINTS: { key: string; action: string }[] = [
  { key: 'Pinch', action: 'out for the whole map, in for faces and names' },
  { key: 'Tap', action: 'a node to focus it — tap again to open the artist' },
  { key: 'Jump to…', action: 'fly the camera to a realm, genre, or scene' },
];

// Persistent until dismissed — no auto-hide timer. Dismissal happens either
// via the close button here, or by clicking a node (see GraphView's
// handleNodeClick), which is treated as "the user has understood." Once
// dismissed the choice is remembered (localStorage, see GraphView) so it
// never comes back on later visits.
export default function GraphOnboarding({ open, onDismiss }: Props) {
  const isCoarsePointer = useCoarsePointer();
  if (!open) return null;
  const hints = isCoarsePointer ? TOUCH_HINTS : POINTER_HINTS;

  return (
    <div className="graph-onboarding" data-onboarding-open role="note" aria-label="How Starweave works">
      <button
        className="graph-onboarding__close"
        onClick={onDismiss}
        aria-label="Dismiss hint"
      >
        ×
      </button>
      <p className="graph-onboarding__title">Welcome to Starweave</p>
      <p className="graph-onboarding__lede">
        An interactive map of who influenced whom in indie music.
      </p>
      <ul className="graph-onboarding__hints">
        {hints.map(hint => (
          <li key={hint.key} className="graph-onboarding__hint">
            <span className="graph-onboarding__key">{hint.key}</span>
            <span className="graph-onboarding__action">{hint.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
