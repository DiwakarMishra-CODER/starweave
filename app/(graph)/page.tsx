import { loadGraphData } from '@/lib/graph-data';
import { dayNumber, isSunday, pickRecordId, recordCard } from '@/lib/home-story';
import HomeStory from '@/components/home/HomeStory';

// The graph itself is rendered by the (graph) layout. This page is the story
// laid over it (components/home/HomeStory) — server-rendered, so today's
// record is real HTML for a first paint and for search engines.
//
// Re-rendered hourly so the day's pick turns over at midnight (UTC; the client
// corrects to the visitor's own date, see TodaysRecord). Only the one record's
// card goes into the payload, never the dataset.
export const revalidate = 3600;

export default function HomePage() {
  const data = loadGraphData();
  const now = new Date();
  const record = recordCard(data, pickRecordId(data, dayNumber(now, 'utc'), isSunday(now, 'utc')));
  if (!record) return null;
  const started = data.artists.map(a => a.activeFrom).filter((y): y is number => y !== undefined);
  return (
    <HomeStory
      initial={record}
      artistCount={data.artists.length}
      years={[Math.min(...started), Math.max(...started)]}
    />
  );
}
