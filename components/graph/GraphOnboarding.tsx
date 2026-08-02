'use client';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

// Persistent until dismissed — no auto-hide timer. Dismissal happens either
// via the close button here, or by clicking a node (see GraphView's
// handleNodeClick), which is treated as "the user has understood." Once
// dismissed the choice is remembered (localStorage, see GraphView) so it
// never comes back on later visits.
export default function GraphOnboarding({ open, onDismiss }: Props) {
  if (!open) return null;

  return (
    <div className="graph-onboarding" role="note">
      <button
        className="graph-onboarding__close"
        onClick={onDismiss}
        aria-label="Dismiss hint"
      >
        ×
      </button>
      <p className="graph-onboarding__line graph-onboarding__line--primary">
        An interactive map of who influenced whom in indie music.
      </p>
      <p className="graph-onboarding__line graph-onboarding__line--secondary">
        Click a node to focus · click again to open · click empty space to deselect
      </p>
    </div>
  );
}
