import Link from 'next/link';

interface Props {
  href: string;
  label: string;
  // Calmer end-of-read copy — no pulse, softer glow. Default is the
  // prominent, pulsing hero placement.
  secondary?: boolean;
}

// The payoff CTA for genre/scene pages — see this cluster ignite in the
// graph. Tinted to the page's own --genre-color (set by the genre or scene
// wrapper) and, unless the user prefers reduced motion, breathes with a
// pulsing glow so it reads as alive and clickable rather than static —
// deliberately distinct from the artist page's static gold graph link.
export default function IgniteGraphButton({ href, label, secondary }: Props) {
  return (
    <Link
      href={href}
      className={`genre-ignite-btn${secondary ? ' genre-ignite-btn--secondary' : ''}`}
    >
      <svg className="genre-ignite-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <line x1="6" y1="18" x2="12" y2="7" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
        <line x1="12" y1="7" x2="19" y2="12" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
        <line x1="6" y1="18" x2="19" y2="12" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
        <circle cx="6" cy="18" r="2.2" fill="currentColor" />
        <circle cx="12" cy="7" r="2.6" fill="currentColor" />
        <circle cx="19" cy="12" r="2" fill="currentColor" />
      </svg>
      {label}
      <span className="genre-ignite-btn__arrow" aria-hidden>→</span>
    </Link>
  );
}
