import { sizedImageUrl } from '@/lib/image-url';

// The wall the issue's pull-out poster (the city) is pasted on, and its back
// page beside it: a brick wall at night, flyposted -- wheatpasted posters
// edge to edge round it, showing in every margin and gap. All from the map:
// each genre's record to start with as a promo poster, two-colour band
// posters of the most-named artists, a flyer for each scene (its name, city
// and years; no gig is invented), and big type posters of genre names.
// Drawn once on the server from a seeded layout across a fixed-width
// canvas; the page clips it. Decoration, hidden from screen readers; dimmed
// a touch for night, so the city and the index stay in front.

export type StreetPoster =
  | { kind: 'record'; imageUrl: string }
  | { kind: 'band'; imageUrl: string; name: string }
  | { kind: 'flyer'; name: string; city: string; years: string }
  | { kind: 'type'; words: string };

const INKS = ['#e8463a', '#2f6fb3', '#f2b42c', '#2e8b57', '#e3609a', '#8a5bd1', '#ff7a1a', '#16a3a3'];
const WALL_W = 1680;  // the canvas the posters are laid across; it's centred and clipped
const WALL_H = 3600;  // tall enough for the city and the back page

function seeded(seed: number) {
  let h = seed >>> 0;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const fit = (words: string, w: number, h: number) => Math.round(Math.min(h, (w / Math.max(4, words.length)) * 1.8));

export default function StreetWall({ posters }: { posters: StreetPoster[] }) {
  const rand = seeded(1979);
  const placed: { p: StreetPoster; x: number; y: number; w: number; h: number; ink: string; torn: boolean }[] = [];
  let n = 0;
  for (let x = -20; x < WALL_W; ) {
    const w = Math.round(150 + rand() * 80);
    for (let y = -Math.round(rand() * 120); y < WALL_H; ) {
      const p = posters[n % posters.length];
      const h = p.kind === 'record' ? w : p.kind === 'type' ? Math.round(w * 0.72) : Math.round(w * 1.38);
      placed.push({ p, x, y, w, h, ink: INKS[(n * 5) % INKS.length], torn: rand() < 0.22 });
      n++;
      y += h - Math.round(rand() * 18) + 2;
    }
    x += w - Math.round(rand() * 14);
  }

  return (
    <div className="street" aria-hidden>
      <div className="street__canvas" style={{ width: WALL_W, height: WALL_H }}>
        {placed.map(({ p, x, y, w, h, ink, torn }, i) => {
          const style = { left: x, top: y, width: w, height: h, '--ink': ink } as React.CSSProperties;
          const cls = `room__poster street__poster${torn ? ' street__poster--torn' : ''}`;
          if (p.kind === 'record') return (
            <span key={i} className={`${cls} room__poster--record`} style={style}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sizedImageUrl(p.imageUrl, 300)} alt="" loading="lazy" />
            </span>
          );
          if (p.kind === 'band') return (
            <span key={i} className={`${cls} room__poster--band`} style={style}>
              <span className="room__duo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sizedImageUrl(p.imageUrl, 250)} alt="" loading="lazy" />
              </span>
              <span className="room__bill" style={{ fontSize: fit(p.name, w - 14, 30) }}>{p.name}</span>
            </span>
          );
          if (p.kind === 'flyer') return (
            <span key={i} className={`${cls} room__poster--flyer`} style={style}>
              <span className="room__flyer-kicker">The scene</span>
              <span className="room__flyer-name" style={{ fontSize: fit(p.name, w - 20, 40) }}>{p.name}</span>
              <span className="room__flyer-rule" />
              <span className="room__flyer-where">{p.city}</span>
              <span className="room__flyer-where">{p.years}</span>
            </span>
          );
          return (
            <span key={i} className={`${cls} room__poster--type`} style={style}>
              <span style={{ fontSize: fit(p.words, w - 16, 44) }}>{p.words}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
