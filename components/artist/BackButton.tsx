'use client';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="artist-page__back"
      onClick={() => router.back()}
      aria-label="Go back"
    >
      ‹
    </button>
  );
}
