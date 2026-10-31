'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { sizedImageUrl } from '@/lib/image-url';
import { useMusicMotion } from '@/components/genre/useMusicMotion';
import { useTape } from './TapePage';

// Under the orbit of their listening (same track, Rotation): two records,
// two kinds of day. It asks how you're feeling, pulls that record out of
// the orbit (its place there empties, globals) and takes you into it while
// its song plays:
// - really down: Heaven or Las Vegas, the section taking on the sleeve's
//   iridescent colours, slow lights rising;
// - stressed or tired: Loveless, the real sleeve layered four deep, each
//   layer drifting and bending like glide guitar until it fills the section;
//   while it plays you read every line but the last; when the song stops or
//   you scroll on, the layers part and the last line, coming out
//   "refreshed", appears.
// The words always sit on a solid card, crisp. Colour changes are slow;
// nothing flashes.

type Day = 'down' | 'tired';
const MOTES = 14;
const LAYERS = 4;

export default function TwoDays() {
  const { tape, play, onAir } = useTape();
  const { tired, genres } = tape.constants;
  const [day, setDay] = useState<Day | null>(null);
  const [parted, setParted] = useState(false);
  const heard = useRef(false);
  const worldRef = useRef<HTMLDivElement>(null);
  const record = day ? tape.constants[day] : null;
  // Each day's song, by its place on the tape, for its button.
  const songOf = (d: Day) => tape.tracks.flatMap(t => t.songs).find(s => s.at === tape.constants[d].at)?.title ?? '';
  const sounding = record !== null && onAir === record.at;
  useMusicMotion(worldRef, sounding);

  const choose = (d: Day) => {
    setDay(d);
    setParted(false);
    heard.current = false;
    const at = tape.constants[d].at!;
    if (onAir !== at) play(at);
  };

  // Loveless lets you go when its song stops, or when you scroll on.
  useEffect(() => { if (sounding) heard.current = true; }, [sounding]);
  useEffect(() => {
    if (day === 'tired' && heard.current && !sounding) setParted(true);
  }, [day, sounding]);
  useEffect(() => {
    const el = worldRef.current;
    if (!el || day !== 'tired') return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting && heard.current) setParted(true); });
    io.observe(el);
    return () => io.disconnect();
  }, [day]);

  return (
    <div className="tdays" data-day={day ?? undefined}>
      <p className="tdays__ask">{tape.constants.question}</p>
      <div className="tdays__choices">
        {(['down', 'tired'] as const).map(d => {
          const c = tape.constants[d];
          const on = onAir === c.at;
          return (
            <button key={d} type="button" className="tdays__choice" aria-pressed={day === d} onClick={() => choose(d)}>
              {c.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sizedImageUrl(c.imageUrl, 120)} alt="" width={56} height={56} />
              )}
              <span className="tdays__choice-text">
                <span className="tdays__choice-day">{c.ask}</span>
                <span className="tdays__choice-song">
                  <span className="tbutton__icon" data-pause={on || undefined} aria-hidden />
                  {songOf(d)} &middot; {c.title}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {day && (
      <div ref={worldRef} className={`tworld tworld--${day}`} data-parted={parted || undefined} data-live={sounding || undefined}>
        {day === 'down' && (
          <div className="tworld__heaven" aria-hidden>
            {Array.from({ length: MOTES }, (_, k) => (
              <span key={k} className="tworld__mote" style={{ '--k': k } as React.CSSProperties} />
            ))}
          </div>
        )}
        {day === 'tired' && tired.imageUrl && (
          <div className="tworld__layers" aria-hidden>
            {Array.from({ length: LAYERS }, (_, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} className="tworld__layer" src={sizedImageUrl(tired.imageUrl!, 1000)} alt="" style={{ '--k': k } as React.CSSProperties} />
            ))}
          </div>
        )}

        <div className="tworld__records">
          {[day].map(d => {
            const c = tape.constants[d];
            return (
              <figure key={d} className="tworld__record" data-on>
                {/* The record itself plays and pauses its song. */}
                <button type="button" className="tworld__play" onClick={() => c.at !== null && play(c.at)} aria-label={`${sounding ? 'Pause' : 'Play'} ${c.title}`}>
                  {c.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sizedImageUrl(c.imageUrl, 500)} alt="" width={220} height={220} />
                  )}
                  <span className="trot__play trot__play--big" aria-hidden><span className="tbutton__icon" data-pause={sounding || undefined} /></span>
                </button>
                <figcaption>{c.title}</figcaption>
              </figure>
            );
          })}
        </div>

        {record && (
          <div className="tworld__card" key={day}>
            <p className="tworld__when">{record.when}</p>
            <p className="tworld__title">{record.title}</p>
            {(day === 'tired' ? record.words.slice(0, parted ? undefined : -1) : record.words).map((w, i) => (
              <p key={i} className="tworld__words">{w}</p>
            ))}
          </div>
        )}
      </div>
      )}

      <p className="tdays__genres">
        {genres.links.map((g, i) => (
          <Fragment key={g.id}>
            {i > 0 && ' and '}
            <Link href={`/genre/${g.id}`}>{i === 0 ? g.name : g.name.toLowerCase()}</Link>
          </Fragment>
        ))}
        {genres.after}
      </p>
    </div>
  );
}
