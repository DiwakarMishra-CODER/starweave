'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storyControl, storyFrame, useStory } from '@/lib/story-store';
import { useGraphData } from '@/components/graph/GraphDataProvider';
import { dayNumber, isSunday, pickRecordId, recordCard, type RecordCard } from '@/lib/home-story';
import { player, usePlayer } from '@/lib/player';
import { todaysRoad } from '@/lib/player-library';
import Intro from './Intro';
import TodayStar from './TodayStar';

interface Props {
  initial: RecordCard;
  artistCount: number;
  years: [number, number];
}

// The home page's story, played over the persistent graph from
// app/(graph)/layout.tsx: the opening (Intro) for a visit that arrives at `/`
// from outside, then today's record turning on the map (TodayStar) whenever
// the visitor has nothing else selected. See lib/story-store.ts for who
// decides which.
export default function HomeStory({ initial, artistCount, years }: Props) {
  const { mode, todayOpen, todayShown, mapBusy } = useStory();
  const record = useTodaysRecord(initial);
  const { data } = useGraphData();
  const router = useRouter();
  // Today's record plays through the site's player (lib/player), as a road
  // through its family -- where it came from, the record, what it started --
  // with the map lighting each line as the music crosses it.
  const now = usePlayer();
  const playing = now.at !== null && now.queue?.id === `today:${record.id}`;
  const listen = () => {
    const road = data && todaysRoad(data, record);
    if (!road) return;
    // Pressed before the opening was over: end it the way a skip would.
    storyControl.finish?.();
    router.push(`/?artist=${encodeURIComponent(record.id)}`, { scroll: false });
    player.play(road, 0);
  };
  const tagUp = todayOpen && !mapBusy && !playing && (mode === 'map' || todayShown);

  // The canvas draws today's star as a turning record while its tag is up
  // or its song is playing.
  useEffect(() => {
    storyFrame.todayId = record.id;
    storyFrame.todayTarget = tagUp || playing ? 1 : 0;
  }, [record.id, tagUp, playing]);
  useEffect(() => () => { storyFrame.todayTarget = 0; }, []);

  return (
    // Outside the layout's <main> (see app/(graph)/layout.tsx), so it names
    // itself as a landmark.
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="sr-only">Starweave: a map of who influenced whom in indie music</h1>
      {/* Each mounts fresh when it opens, so a replay starts clean. */}
      {mode === 'story' && <Intro record={record} artistCount={artistCount} years={years} />}
      {tagUp && <TodayStar record={record} onListen={listen} />}
    </section>
  );
}

// The server picks by its own (UTC) date. A visitor whose day differs — near
// midnight, or a Sunday that has started for them and not for the server —
// gets their own day's record once the graph data is in.
function useTodaysRecord(initial: RecordCard): RecordCard {
  const { data } = useGraphData();
  const [record, setRecord] = useState(initial);
  useEffect(() => {
    if (!data) return;
    const now = new Date();
    const id = pickRecordId(data, dayNumber(now, 'local'), isSunday(now, 'local'));
    const local = id !== initial.id ? recordCard(data, id) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: depends on the visitor's clock, unknown on the server
    if (local) setRecord(local);
  }, [data, initial.id]);
  return record;
}
