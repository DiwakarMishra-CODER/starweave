import type { Metadata } from 'next';
import { loadGraphData } from '@/lib/graph-data';
import { resolveAboutRoom, resolveAboutTape } from '@/lib/about-tape';
import TapePage from '@/components/about/TapePage';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'I made you a tape - Starweave',
  description: 'I made you a tape: how the person who drew this map fell for indie music, as a mixtape.',
};

// The About page, "I made you a tape": the maker's story as a mixtape for
// the visitor (data/about.ts for the words and songs, lib/about-tape.ts for
// how they meet the map, components/about for the tape itself).
export default function AboutPage() {
  const data = loadGraphData();
  const tape = resolveAboutTape(data);
  const room = resolveAboutRoom(data, tape);
  return (
    <div className="tape-overlay" style={{ '--wall': room.backline.wall } as React.CSSProperties}>
      <TapePage tape={tape} room={room} />
      <SiteFooter />
    </div>
  );
}
