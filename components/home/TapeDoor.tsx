import Link from 'next/link';
import TapeIcon from '@/components/ui/TapeIcon';

// On the map, under its buttons: the way into the mixtape (the About page,
// which visitors skipped when it was called About), "A tape for you" like
// the cassette's own label. One button like
// the ones above it, with a small cassette; a drawn cassette and a tag
// under it filled the map's corner. Over the plain map only, like "How it
// works".

export default function TapeDoor() {
  return (
    <Link href="/about" className="graph-replay tape-door" aria-label="A tape for you: why I made this map, told as a mixtape">
      <TapeIcon className="tape-door__icon" />
      <span>A tape for you</span>
    </Link>
  );
}
