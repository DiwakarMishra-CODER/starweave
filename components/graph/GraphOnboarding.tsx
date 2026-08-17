'use client';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

// The interactions this card names, in the order a first-timer needs them.
// Zoom leads because it's the one gesture the graph can't hint at on its own:
// pulled out, every artist is an anonymous dot, and nothing on screen says
// that scrolling in resolves faces and names. The "Jump to…" row names the
// top-left control, which GraphView also auto-opens on a first visit.
const HINTS: { key: string; action: string }[] = [
  { key: 'Scroll', action: 'zoom out for the whole constellation, in for faces and names' },
  { key: 'Click', action: 'a node to focus it — click again to open the artist' },
  { key: 'Drag', action: 'to pan · click empty space to deselect' },
  { key: 'Jump to…', action: 'fly the camera to a realm, genre, or scene' },
];

// Persistent until dismissed — no auto-hide timer. Dismissal happens either
// via the close button here, or by clicking a node (see GraphView's
// handleNodeClick), which is treated as "the user has understood." Once
// dismissed the choice is remembered (localStorage, see GraphView) so it
// never comes back on later visits.
export default function GraphOnboarding({ open, onDismiss }: Props) {
  if (!open) return null;

  return (
    <div className="graph-onboarding" role="note" aria-label="How Starweave works">
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
        {HINTS.map(hint => (
          <li key={hint.key} className="graph-onboarding__hint">
            <span className="graph-onboarding__key">{hint.key}</span>
            <span className="graph-onboarding__action">{hint.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
