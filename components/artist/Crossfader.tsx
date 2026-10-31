'use client';

/* eslint-disable @next/next/no-img-element -- two small faces at the fader's ends */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { sizedImageUrl } from '@/lib/image-url';
import { claimAudio, onAudioClaimed } from '@/lib/audio-focus';
import { LOUD_GAIN, isLoudArtist } from '@/lib/player';

// "Hear the link", in a face's card on the artist page: a DJ's crossfader
// between the influence (left) and the artist they shaped (right) -- time
// runs left to right. Press play and both songs start together; slide the
// fader and one turns into the other, so the link is something you hear, not
// just read. Equal-power curve, so the middle isn't a dip in volume.
// Starting it stops anything else playing on the page (lib/audio-focus);
// `onStart` runs first, so the card holding it can stay open.

interface Side {
  /** The artist, so a loud one comes in at half volume (the loud rule). */
  id?: string;
  name: string;
  imageUrl?: string | null;
  previewUrl: string;
}

const VOLUME = 0.85;

export default function Crossfader({ left, right, onStart }: { left: Side; right: Side; onStart?: () => void }) {
  const id = useId();
  const [on, setOn] = useState(false);
  const [mix, setMix] = useState(0);
  const decks = useRef<HTMLAudioElement[] | null>(null);
  const [owner] = useState(() => Symbol('crossfader'));

  const level = (m: number) => {
    const x = m / 100;
    const [ga, gb] = [left, right].map(s => (isLoudArtist(s.id) ? LOUD_GAIN : 1));
    return [Math.cos((x * Math.PI) / 2) * VOLUME * ga, Math.sin((x * Math.PI) / 2) * VOLUME * gb];
  };

  const stop = useCallback(() => {
    decks.current?.forEach(a => { a.pause(); a.removeAttribute('src'); a.load(); });
    decks.current = null;
    setOn(false);
  }, []);

  useEffect(() => onAudioClaimed(owner, stop), [owner, stop]);
  useEffect(() => stop, [stop]);

  const start = () => {
    onStart?.();
    claimAudio(owner);
    const [a, b] = [new Audio(left.previewUrl), new Audio(right.previewUrl)];
    const [va, vb] = level(mix);
    a.volume = va;
    b.volume = vb;
    a.onended = stop;
    decks.current = [a, b];
    void a.play().catch(() => {});
    void b.play().catch(() => {});
    setOn(true);
  };

  const slide = (m: number) => {
    setMix(m);
    const [va, vb] = level(m);
    if (decks.current) {
      decks.current[0].volume = va;
      decks.current[1].volume = vb;
    }
  };

  const heard = mix < 15 ? left.name : mix > 85 ? right.name : `${left.name} and ${right.name}, mixed`;

  return (
    <div className="xfade">
      <p className="xfade__title" id={`${id}-t`}>Hear the link</p>
      <div className="xfade__deck">
        <span className="xfade__end">
          {left.imageUrl && <img src={sizedImageUrl(left.imageUrl, 250)} alt="" width={30} height={30} />}
          <span>{left.name}</span>
        </span>
        <input
          type="range"
          className="xfade__fader"
          min={0}
          max={100}
          value={mix}
          onChange={e => slide(Number(e.target.value))}
          aria-labelledby={`${id}-t`}
          aria-valuetext={heard}
        />
        <span className="xfade__end xfade__end--right">
          <span>{right.name}</span>
          {right.imageUrl && <img src={sizedImageUrl(right.imageUrl, 250)} alt="" width={30} height={30} />}
        </span>
      </div>
      <button type="button" className="xfade__play" onClick={on ? stop : start}>
        {on ? '■ Stop' : '▶ Play both, then slide from one to the other'}
      </button>
    </div>
  );
}
