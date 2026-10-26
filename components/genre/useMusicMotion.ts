'use client';

import { useEffect, type RefObject } from 'react';
import { moveWithMusic } from '@/lib/music-motion';

/** While `on`, the element gets --energy and --beat from whatever is playing
 *  (lib/music-motion, read against the song's own range); off, they go. */
export function useMusicMotion(ref: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !on) return;
    return moveWithMusic(el);
  }, [ref, on]);
}
