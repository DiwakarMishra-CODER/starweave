/** A small cassette, drawn in its text's own colour. */
export default function TapeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 13" aria-hidden focusable="false">
      <rect x="0.75" y="0.75" width="18.5" height="11.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6.5" cy="5.5" r="1.9" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13.5" cy="5.5" r="1.9" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 12.25L6.5 9.25H13.5L15 12.25" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
