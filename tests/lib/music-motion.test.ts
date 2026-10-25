import { describe, it, expect } from 'vitest';
import { musicReader } from '@/lib/music-motion';

// A song as the level meter sees it, 60 frames a second: a bed that rises
// and falls over a few seconds (verses and choruses), a kick drum every
// half second, and a little jitter.
function song({ bed, swing, kick, seconds = 12 }: { bed: number; swing: number; kick: number; seconds?: number }) {
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: seconds * 60 }, (_, i) => {
    const t = i / 60;
    const section = Math.sin((t / 6) * Math.PI * 2) * swing;
    const hit = t % 0.5 < 0.05 ? kick : 0;
    return Math.min(1, Math.max(0, bed + section + hit + (rnd() - 0.5) * 0.02));
  });
}

function listen(levels: number[]) {
  const reader = musicReader();
  const out = levels.map((level, i) => reader.step(level, i * (1000 / 60)));
  const settled = out.slice(180); // after the first three seconds
  const energies = settled.map(r => r.energy);
  return {
    beatsPerSecond: settled.filter(r => r.onset).length / (settled.length / 60),
    energySpread: Math.max(...energies) - Math.min(...energies),
    meanEnergy: energies.reduce((a, b) => a + b, 0) / energies.length,
  };
}

describe('musicReader', () => {
  it('finds the beat and the swell in a loud, compressed master', () => {
    // Near the top of the meter the whole time, and clipped at 1 on the hits
    // -- the shape that used to pin the background at full and find no beats.
    const loud = listen(song({ bed: 0.82, swing: 0.08, kick: 0.25 }));
    expect(loud.beatsPerSecond).toBeGreaterThan(1.2);
    expect(loud.beatsPerSecond).toBeLessThan(2.6);
    expect(loud.energySpread).toBeGreaterThan(0.3);
    expect(loud.meanEnergy).toBeLessThan(0.8);
  });

  it('reads a quiet song the same way', () => {
    const quiet = listen(song({ bed: 0.12, swing: 0.04, kick: 0.08 }));
    expect(quiet.beatsPerSecond).toBeGreaterThan(1.2);
    expect(quiet.beatsPerSecond).toBeLessThan(2.6);
    expect(quiet.energySpread).toBeGreaterThan(0.3);
  });

  it('finds no beats in a steady drone, and comes to rest after the song', () => {
    const drone = listen(song({ bed: 0.5, swing: 0, kick: 0 }));
    expect(drone.beatsPerSecond).toBeLessThan(0.4);

    const reader = musicReader();
    song({ bed: 0.6, swing: 0.1, kick: 0.2, seconds: 4 }).forEach((l, i) => reader.step(l, i * 16.7));
    for (let i = 0; i < 600; i++) reader.step(0, 4000 + i * 16.7);
    expect(reader.still()).toBe(true);
  });
});
