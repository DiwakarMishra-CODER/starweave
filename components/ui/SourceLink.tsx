import { sourcePlace } from '@/lib/source-place';

// The proof under a citation, as a ticket: a red SOURCE stamp, the
// publication's name, an arrow out. Every influence on the map rests on one
// of these, so it is drawn as an object of its own -- the site's paper
// button language (ink outline, hard shadow, lifts when pointed at) -- not
// as a link lost at the end of the sentence. A page read from the Internet
// Archive says so; a source only in print is the same ticket, dashed, with
// nothing to click. Renders nothing for a link the source pass hasn't
// checked yet. `size="small"` for the compact today's-record tag.
export default function SourceLink({ url, print, size, className }: {
  url?: string | null;
  print?: string | null;
  size?: 'small';
  className?: string;
}) {
  const cls = ['source-ticket', size === 'small' && 'source-ticket--small', className].filter(Boolean).join(' ');
  if (url) {
    const place = sourcePlace(url);
    return (
      <a
        className={cls}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Source: ${place.name}${place.archived ? ', archived copy' : ''} (opens in a new tab)`}
      >
        <span className="source-ticket__stamp" aria-hidden>Source</span>
        <span className="source-ticket__place" aria-hidden>
          <span className="source-ticket__name">{place.name}</span>
          {place.archived && <span className="source-ticket__note">archived copy</span>}
          <svg className="source-ticket__arrow" viewBox="0 0 12 12" aria-hidden>
            <path d="M3.5 2.5h6v6M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </a>
    );
  }
  if (print) {
    return (
      <span className={`${cls} source-ticket--print`}>
        <span className="source-ticket__stamp">In print</span>
        <span className="source-ticket__place"><span className="source-ticket__name">{print}</span></span>
      </span>
    );
  }
  return null;
}

// The icon on a "Source" stamp (the artist panel's rows, Connect two's
// stops): an "i" while the citation is unchecked, a tick once the source
// pass has read it on its page, so a reader can tell at a glance which links
// open onto their proof.
export function SourceStampIcon({ checked }: { checked: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <circle cx="5" cy="5" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {checked
        ? <path d="M2.9 5.2 4.4 6.6 7.2 3.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        : <>
            <rect x="4.4" y="4.2" width="1.2" height="3.3" rx="0.6" fill="currentColor" />
            <circle cx="5" cy="2.8" r="0.7" fill="currentColor" />
          </>}
    </svg>
  );
}
