// One sound at a time across the site: whatever starts playing claims the
// audio, and everything else that was playing hears about it and stops (the
// site's player, lib/player, pauses instead, so it can pick up again). Used
// by every player: the site's player, the crossfader, and the map's own --
// the radio dial, today's record, Connect two's road, the tour, the opening.

import { useCallback, useEffect, useRef, useState } from 'react';

type Listener = (owner: symbol) => void;

const listeners = new Set<Listener>();

/** Call just before starting to play. */
export function claimAudio(owner: symbol): void {
  listeners.forEach(l => l(owner));
}

/** `stop` runs whenever someone other than `owner` claims the audio. */
export function onAudioClaimed(owner: symbol, stop: () => void): () => void {
  const listener: Listener = by => { if (by !== owner) stop(); };
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** For a component that plays: `stop` runs when anyone else starts playing;
 *  call the returned `claim` just before this one starts. */
export function useAudioFocus(stop: () => void): () => void {
  const [owner] = useState(() => Symbol('audio'));
  const stopRef = useRef(stop);
  useEffect(() => { stopRef.current = stop; });
  useEffect(() => onAudioClaimed(owner, () => stopRef.current()), [owner]);
  return useCallback(() => claimAudio(owner), [owner]);
}
