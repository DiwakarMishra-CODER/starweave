'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useTape } from './TapePage';
import Cassette from './Cassette';

// The opening: a cassette case on the dark room beside the card that says
// what this is. The lid swings open, the tape slides out of its tray, and
// under them both the inlay card unfolds panel by panel into the track list
// (the page's contents: each track a link), ready.
// The first time in a visit only; after that the case is simply open. Any
// click, key, scroll or tap ends it. None under reduced motion.

type Stage = 'pending' | 'open' | 'done';
const OPEN_MS = 2300;
let openedThisVisit = false; // set when the run ends, not on mount (React's development mode mounts twice)

export default function TapeCase() {
  const { tape, start, loaded, onAir } = useTape();
  const [stage, setStage] = useState<Stage>('pending');

  useLayoutEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the visit and reduced motion are only known in the browser
    setStage(still || openedThisVisit ? 'done' : 'open');
  }, []);

  useEffect(() => {
    if (stage !== 'open') return;
    const end = () => { openedThisVisit = true; setStage('done'); };
    const t = window.setTimeout(end, OPEN_MS);
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, end, { capture: true, passive: true }));
    return () => {
      window.clearTimeout(t);
      events.forEach(e => window.removeEventListener(e, end, { capture: true }));
    };
  }, [stage]);

  const sides = (['A', 'B'] as const).map(side => ({ side, tracks: tape.tracks.filter(t => t.side === side) }));

  return (
    <header className="tcase" data-stage={stage}>
      <div className="tcase__box" aria-hidden>
        <div className="tcase__tray" />
        <div className="tcass">
          <Cassette side="A" to={tape.label.to} title={tape.sides.A} wound={0.04} />
        </div>
        <div className="tcase__lid">
          <div className="tcase__front">
            <span className="tcase__to">{tape.label.to}</span>
            <span className="tcase__from">&mdash; {tape.label.from}</span>
          </div>
        </div>
      </div>

      <div className="tcard">
        <p className="tcard__kicker">About Starweave &middot; a tape</p>
        <h1 className="tcard__title">
          {tape.label.headline.map(l => <span key={l} className="tcard__title-line">{l}</span>)}
        </h1>
        <p className="tcard__line">{tape.label.to} &mdash; {tape.label.from}</p>
        <p className="tcard__intro">{tape.label.intro}</p>
        <button type="button" className="tcard__play" onClick={start}>
          <span className="tcard__play-icon" data-pause={onAir !== null || undefined} aria-hidden />
          {onAir !== null ? 'Pause the tape' : loaded ? 'Carry on' : 'Play the tape'}
          <span className="tcard__play-sub">then just scroll: the music follows you</span>
        </button>
      </div>

      <nav className="tinlay" aria-label="The tracks">
        <div className="tcard__panels">
          {sides.map(({ side, tracks }, p) => (
            <div key={side} className="tcard__panel" style={{ '--p': p } as React.CSSProperties}>
              <p className="tcard__side">Side {side}: <span>{tape.sides[side]}</span></p>
              <ol className="tcard__tracks">
                {tracks.map(t => (
                  <li key={t.id}>
                    <a href={`#track-${t.id}`}>
                      <span className="tcard__n">{String(t.n).padStart(2, '0')}</span>
                      <span className="tcard__what">
                        <span className="tcard__name">{t.title}</span>
                        {t.songs.length > 0 && (
                          <span className="tcard__songs"><span aria-hidden>&#9835; </span>{t.songs.map(s => `${s.title} (${s.artistName})`).join(' · ')}</span>
                        )}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
}
