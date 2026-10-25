'use client';

import type { Issue } from '@/lib/genre-issue';
import type { Stage } from './Issue';
import CoverPrint from './CoverPrint';

// Today's issue: the cover of a music paper that opens onto the city as its
// pull-out centrefold (Issue.tsx runs the opening). Set like a print: the
// dateline, the masthead over a double rule, the cover star as a two-drum
// risograph on the cream stock (CoverPrint) with registration marks at its
// corners and a credit under it, a "free poster" flash, and the cover story
// below -- kicker, headline, an italic standfirst -- with the small print
// and a barcode along the foot. Every word on it is true (lib/genre-issue).
//
// The count-in is the cover's heartbeat: on each of 1, 2, 3, 4! a huge
// numeral is knocked out of the photo (the paper showing through the ink)
// and the photo's dots pump; on the 4 the paper opens. Before the visitor's day is known the
// cover is dark and says nothing, so nothing on it ever visibly changes.

const W = 460;
const H = 650;
const DAY_FMT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

export default function MagazineCover({ issue, stage, color, zoom, onOpen }: {
  issue: Issue | null;
  stage: Stage;
  /** The cover story's family colour: the colour drum, and the overprint. */
  color: string;
  /** The spread's fit-to-window zoom; on a phone it's left to CSS. */
  zoom?: number;
  onOpen: () => void;
}) {
  const label = issue ? `Open today's issue: ${issue.story.headline}` : 'Open the paper';
  return (
    <button
      type="button"
      className="gmag"
      data-stage={stage}
      style={{ width: W, height: H, zoom, '--spot': color } as React.CSSProperties}
      onClick={onOpen}
      aria-label={label}
    >
      <span className="gmag__dateline" aria-hidden>
        {issue && (
          <>
            <span>The daily of where sound came from</span>
            <span>No. {issue.number} &mdash; {new Date().toLocaleDateString('en-GB', DAY_FMT)} &mdash; 50p</span>
          </>
        )}
      </span>
      <span className="gmag__mast" aria-hidden>Starweave</span>
      <span className="gmag__rule" aria-hidden />

      <span className="gmag__photo" aria-hidden>
        {issue?.star && <CoverPrint imageUrl={issue.star.imageUrl} color={color} />}
        <span className="gmag__reg gmag__reg--tl" />
        <span className="gmag__reg gmag__reg--tr" />
        <span className="gmag__reg gmag__reg--bl" />
        <span className="gmag__reg gmag__reg--br" />
        <span className="gmag__count">
          <span className="gmag__n gmag__n1">1</span>
          <span className="gmag__n gmag__n2">2</span>
          <span className="gmag__n gmag__n3">3</span>
          <span className="gmag__n gmag__n4">4!</span>
        </span>
        <span className="gmag__flash">Free<br />pull-out<br />poster<br />inside</span>
      </span>
      {issue?.star && <span className="gmag__credit" aria-hidden>Cover: {issue.star.name}</span>}

      {issue && (
        <span className="gmag__story" aria-hidden>
          <span className="gmag__kicker">Cover story &middot; {issue.story.kicker}</span>
          <span className="gmag__headline">{issue.story.headline}</span>
          <span className="gmag__standfirst">{issue.standfirst}</span>
        </span>
      )}

      {issue && (
        <span className="gmag__foot" aria-hidden>
          <span className="gmag__facts">{issue.facts.join(' · ')}</span>
          <svg className="gmag__barcode" width="70" height="30">
            {[...issue.barcode].flatMap((d, i) => {
              const n = Number(d);
              return [0, 1].map(k => (
                <rect key={`${i}:${k}`} x={1 + i * 5.6 + k * 2.7} y="0" width={((n + k * 3) % 3) * 0.6 + 0.8} height="22" />
              ));
            })}
            <text x="35" y="29" textAnchor="middle">{issue.barcode}</text>
          </svg>
        </span>
      )}

      <span className="gmag__shade" aria-hidden />
    </button>
  );
}
