import type { ImageCredit } from '@/data/types';

// The credit a freely licensed photo asks for: photographer, licence, and a
// link to the file's page (see ImageCredit). Laid over the photo's bottom
// edge by whichever surface shows it large — the artist page and the graph's
// artist panel. Renders nothing for the photos that need no credit, which is
// nearly all of them.
export default function PhotoCredit({ credit, className }: { credit?: ImageCredit | null; className?: string }) {
  if (!credit) return null;
  return (
    <a
      className={`photo-credit${className ? ` ${className}` : ''}`}
      href={credit.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* Two unbreakable runs, so a narrow photo wraps between them, never
          inside "CC BY 2.0". */}
      <span>Photo: {credit.author}</span> · <span>{credit.license}</span>
    </a>
  );
}
