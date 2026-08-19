'use client';
import { useRouter } from 'next/navigation';

// Shared by the artist, genre and scene overlay pages — all three use the same
// fixed/inset-0 overlay, so one absolutely-positioned button anchors identically
// on each. Lives in ui/ rather than artist/ for that reason.
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="page-back"
      onClick={() => router.back()}
      aria-label="Go back"
    >
      ‹
    </button>
  );
}
