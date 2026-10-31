// Match Amoeba "What's In My Bag?" episode guests against the map's artists.
import { readFileSync, writeFileSync } from 'fs';
import { graphData } from '../../../data/seed-data';

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, 'and').replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();

const byName = new Map(graphData.artists.map(a => [norm(a.name), a.id]));

// Guests filed under a member's own name, or "Member (Band)": what they say speaks for the band.
// Lenny Kaye is left out on purpose: he plays in Patti Smith's band, and his taste isn't hers.
const MEMBERS: Record<string, string> = {
  'Lee Ranaldo': 'sonic-youth', 'Kim Gordon': 'sonic-youth', 'Bradford Cox': 'deerhunter', 'Avey Tare': 'animal-collective',
  'Lou Barlow': 'dinosaur-jr', 'J Mascis (Dinosaur Jr)': 'dinosaur-jr', 'Stephen Malkmus': 'pavement', 'Stephen Malkmus and the Jicks': 'pavement',
  'Johnny Marr': 'the-smiths', 'Kathleen Hanna': 'bikini-kill', 'Simon Raymonde': 'cocteau-twins', 'Tweedy': 'wilco', 'Nels Cline': 'wilco',
  'Geordie Greep': 'black-midi', 'Rostam': 'vampire-weekend', 'Brendan Canning': 'broken-social-scene', 'Conor Oberst': 'bright-eyes',
  'Bob Mould': 'husker-du', 'Krist Novoselic': 'nirvana', 'Dave Grohl': 'nirvana', 'Henry Rollins': 'black-flag', 'Keith Morris': 'black-flag',
  'David Pajo': 'slint', 'Jeff Parker': 'tortoise', 'Wild Flag': 'sleater-kinney', 'David Byrne': 'talking-heads', 'Jim Ward': 'at-the-drive-in',
  'At The Drive-In (Cedric Bixler-Zavala)': 'at-the-drive-in', 'Jody Stephens (Big Star)': 'big-star', 'Matt Berninger (The National)': 'the-national',
  'Jimmy Tamborello (Dntel/Postal Service)': 'the-postal-service', 'Flaming Lips (Kliph Scurlock)': 'the-flaming-lips',
  'Flaming Lips (Michael Ivins)': 'the-flaming-lips',
  'Gerald Casale (DEVO)': 'devo',
};
const rows = readFileSync(`${__dirname}/channel.tsv`, 'utf8').trim().split('\n')
  .map(l => l.split('\t')).filter(([, t]) => /in my bag/i.test(t));

const episodes = rows.map(([id, title]) => {
  const guest = title.replace(/[’']s?\s*[“"].*$/, '').replace(/\s*\|.*$/, '').trim();
  // A guest can be several acts ("X & Y") or "Member of Band".
  const parts = [guest, ...guest.split(/\s+(?:and|&|x|\+)\s+|,\s*/i)];
  const artistIds = [...new Set([...parts.map(p => byName.get(norm(p))), MEMBERS[guest]].filter(Boolean))] as string[];
  return { id, title, guest, artistIds, url: `https://www.youtube.com/watch?v=${id}` };
});

writeFileSync(`${__dirname}/episodes.json`, JSON.stringify(episodes, null, 1));
const hits = episodes.filter(e => e.artistIds.length);
console.log(`${episodes.length} episodes, ${hits.length} by artists on the map`);
for (const e of hits) console.log(`${e.artistIds.join(',')}\t${e.guest}`);
