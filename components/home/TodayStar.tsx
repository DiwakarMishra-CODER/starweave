'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { markTodaySeen, setTodayOpen, storyCamera } from '@/lib/story-store';

// Closing it lets go of the camera's lean toward it, back to the whole map.
const close = () => {
  setTodayOpen(false);
  storyCamera.overview?.(900);
};
import type { RecordCard } from '@/lib/home-story';

// Today's record, on the map itself: its star turns as a little record
// (drawn by ForceGraph, see storyFrame.todayId) and this tag rides beside it
// — whose record, why it matters in somebody's own words, and a way to hear
// it. Repositioned every frame, so it follows the star as the map moves.

const GAP_PX = 34;    // between the star's centre and the tag
const MARGIN_PX = 12; // kept clear of the screen's edges

export default function TodayStar({ record, onListen }: { record: RecordCard; onListen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Once it's been up, it's been seen for today.
  useEffect(() => { markTodaySeen(); }, []);

  useEffect(() => {
    let raf = 0;
    const place = () => {
      const el = ref.current;
      const star = storyCamera.nodeScreen?.(record.id);
      if (el) {
        const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const onScreen = star && star.x > 0 && star.x < vw && star.y > nav && star.y < vh;
        if (!star || !onScreen) {
          el.style.visibility = 'hidden';
        } else {
          // Beside the star, right if there's room, else left, else below.
          let x = star.x + GAP_PX;
          let y = star.y - h / 2;
          if (x + w > vw - MARGIN_PX) x = star.x - GAP_PX - w;
          if (x < MARGIN_PX) {
            x = Math.min(Math.max(star.x - w / 2, MARGIN_PX), vw - w - MARGIN_PX);
            y = star.y + GAP_PX;
          }
          y = Math.min(Math.max(y, nav + MARGIN_PX), vh - h - MARGIN_PX);
          el.style.visibility = 'visible';
          el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        }
      }
      raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [record.id]);

  const why = record.why;
  const listenLabel = why?.direction === 'parent' && why.other.previewUrl
    ? 'Hear where it came from'
    : why ? 'Hear what it started' : 'Hear it';

  return (
    <div ref={ref} className="today-tag" role="group" aria-label={`Today's record: ${record.name}`}>
      {/* A ticket for today: the stub carries the date. */}
      <span className="today-tag__stub" aria-hidden suppressHydrationWarning>
        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </span>
      <button type="button" className="today-tag__close" onClick={close} aria-label="Hide today's record">
        ×
      </button>
      <p className="today-tag__eyebrow">Today&apos;s record</p>
      <Link href={`/?artist=${encodeURIComponent(record.id)}`} scroll={false} className="today-tag__name">
        {record.name}
      </Link>
      {why && (
        <figure className="today-tag__why">
          {/* A passage that stops mid-sentence trails off rather than ending
              on a comma; one that ends in "!" is said plainly. */}
          <blockquote>“{why.quote.replace(/[,;:]$/, '…').replace(/!$/, '')}”</blockquote>
          <figcaption>
            {why.speaker} on {why.direction === 'parent' ? why.other.name : record.name}
          </figcaption>
        </figure>
      )}
      <button type="button" className="today-tag__play" onClick={onListen}>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4 2.5v11l9.5-5.5z" fill="currentColor" />
        </svg>
        <span>{listenLabel}</span>
      </button>
    </div>
  );
}
