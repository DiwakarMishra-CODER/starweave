import type { Artist, GraphData, ImageCredit } from '@/data/types';
import {
  DIGGING, type DigNote, HOW_WE_KNOW, LINER_NOTES, NOT_SOUND, ONE_FAMILY, ROAD_IN, SCENE_STORIES, SIDE_B_WHY, SIDES, SOUNDS_LIKE, TAPE_LABEL, TAPE_SONGS, TAPE_TRACKS, TWO_DAYS, type TapeTrack,
} from '@/data/about';
import { DEFAULT_GENRE_COLOR, GENRE_COLORS, resolveNodeColor, risoInk, roomWall } from '@/lib/colors';
import { SHELF_RECORDS, type Backline, type ShelfRecord } from '@/lib/backline';
import type { Queue, Track } from '@/lib/player';
import { genreFamilyColor } from '@/lib/genre-family';

// The About page, "I made you a tape": the maker's story as a mixtape for
// the visitor (data/about.ts holds the words and songs). Pure, worked out on
// the server; components/about draws it.

// The player's own module is browser-only, so its whole-preview length is
// repeated here (lib/player SONG_MS).
const SONG_MS = 30000;
const ROAD_STOP_MS = 12000; // "Play my road": a little of each stop

export interface TapeSongView {
  key: string;
  /** Empty for an artist who isn't on the map. */
  artistId: string;
  artistName: string;
  title: string;
  album: string;
  imageUrl: string | null;
  /** Where it sits in the tape's queue (-1: not on the tape). */
  at: number;
}

/** A sign on the one-family fork: a genre on the map, or one that isn't. */
export interface ForkSign {
  id: string | null;
  name: string;
  emerged: number | null;
  color: string;
}

export interface TapeTrackView extends Omit<TapeTrack, 'songs'> {
  n: number;
  songs: TapeSongView[];
}

export interface SceneStory {
  id: string;
  title: string;
  /** The scene's own name, city and years, as on /scenes. */
  name: string;
  where: string;
  /** credit: the photo's licence credit, for the Commons photos that ask for one. */
  bands: (Face & { credit: ImageCredit | null; sounds: { id: string; name: string; color: string }[] })[];
  words: string[];
}

export interface Face {
  id: string;
  name: string;
  imageUrl: string | null;
  color: string;
}

export interface Cover {
  title: string;
  artistId: string;
  artistName: string;
  imageUrl: string | null;
  /** Its song on the tape, if it has one. */
  at: number | null;
  /** Otherwise, a song from the record to play on its own. */
  track: Track | null;
}

export interface SourceCard {
  who: string;
  quote: string;
  source: string;
}

export interface AboutTape {
  tracks: TapeTrackView[];
  queue: Queue;
  label: typeof TAPE_LABEL;
  sides: typeof SIDES;
  /** Their road in: each band, the colour it adds to the page. */
  road: (Face & { via: string | null })[];
  /** "Play my road": a few seconds of each stop, in order. */
  roadQueue: Queue;
  /** The three Radiohead records that ended the grey. */
  radiohead: Cover[];
  /** Their rotation, orbiting the two records that never move. */
  rotation: Cover[];
  constants: {
    question: string;
    down: Cover & { when: string; words: string[]; ask: string };
    tired: Cover & { when: string; words: string[]; ask: string };
    /** The two genres, each a link to its page, and what's said of them. */
    genres: { links: { id: string; name: string }[]; after: string };
  };
  /** Where they dig, each with what they found there. */
  dig: { name: string; tab: string; href: string; finds: (Cover & { note: DigNote[]; song: string })[] }[];
  learned: {
    band: Face;
    from: Face[];
    /** The bands an app shows beside them: a shared sound, no line between. */
    soundsLike: Face[];
    notSound: { from: Face; to: Face; words: string; quote: string; source: string; listen: Queue };
  };
  between: { ct: Face; mbv: Face; ctCount: number; mbvCount: number; both: Face[]; lead: string; cards: SourceCard[] };
  /** Side B opens with why. */
  sideBWhy: string[];
  /** Why the map has scenes: each scene's strip, every band with its sounds. */
  scenes: SceneStory[];
  /** Twee pop and mathcore, both from punk. */
  oneFamily: {
    root: ForkSign;
    soft: { road: ForkSign[]; end: ForkSign; band: Face; listen: TapeSongView };
    loud: { road: ForkSign[]; end: ForkSign; band: Face; listen: Queue; title: string };
    /** The other way: shoegaze and black metal meeting in blackgaze. */
    merge: {
      words: string[];
      /** Each side's line back, outermost first, ending at its end sign. */
      road: ForkSign[]; from: ForkSign; otherRoad: ForkSign[]; other: ForkSign; to: ForkSign;
      soft: { band: Face; listen: TapeSongView };
      loud: { band: Face; listen: Queue; title: string };
      band: Face; listen: Queue; title: string;
    };
    last: string;
  };
  liner: typeof LINER_NOTES;
  counts: { artists: number; links: number; cited: number; firstPerson: number; denied: number };
}

// The colour each stop on their road adds to the page, from its record's
// sleeve: Kid A's ice blue, Disintegration's night teal, Heaven or Las
// Vegas's iridescent pink, Loveless's red-pink.
const ROAD_COLOR: Record<string, string> = {
  radiohead: '#6f9fd8',
  'the-cure': '#3f9e9a',
  'cocteau-twins': '#e7a2c6',
  'my-bloody-valentine': '#e0457b',
};

// The two sources behind Alvvays' lines to the two constants, quoted from
// the map's own citations (tests check every phrase is in them).
const BETWEEN_CARDS: (SourceCard & { edge: [string, string] })[] = [
  {
    edge: ['alvvays', 'cocteau-twins'],
    who: 'Molly Rankin, Alvvays',
    quote: 'otherworldly beauty and also menacing at the same time',
    source: 'Asked by Pitchfork for a perfect album, she chose Heaven or Las Vegas',
  },
  {
    edge: ['alvvays', 'my-bloody-valentine'],
    who: "Alec O'Hanley, Alvvays",
    quote: 'One thing we loved about Kevin Shields was the limitations he put on his stuff',
    source: 'Tape Op, May 2023',
  },
];

const NOT_SOUND_QUOTE = 'really super-obsessed';
const NOT_SOUND_SOURCE = "Benjamin Nugent's biography, Elliott Smith and the Big Nothing (2009)";

export const aboutCards = BETWEEN_CARDS;
export const notSoundQuote = { quote: NOT_SOUND_QUOTE, source: NOT_SOUND_SOURCE };

export function resolveAboutTape(data: GraphData): AboutTape {
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const artist = (id: string): Artist => {
    const a = byId.get(id);
    if (!a) throw new Error(`About tape: no artist ${id} on the map`);
    return a;
  };
  const face = (id: string): Face => {
    const a = artist(id);
    return { id, name: a.name, imageUrl: a.imageUrl ?? null, color: resolveNodeColor(a) };
  };

  // The songs, in the tape's order; each one's place in the queue. A song
  // that's off the tape (the loud one) has no place in it.
  const onTape = TAPE_SONGS.filter(s => s.onTape !== false);
  const songs = TAPE_SONGS.map((s): TapeSongView => {
    const found = data.songs?.[s.key];
    return {
      key: s.key,
      artistId: s.artistId ?? '',
      artistName: s.artistName ?? artist(s.artistId!).name,
      title: s.label ?? s.song,
      album: s.albumLabel ?? s.album,
      imageUrl: found?.imageUrl ?? null,
      at: onTape.indexOf(s),
    };
  });
  const song = new Map(songs.map(s => [s.key, s]));
  const trackOf = (s: (typeof TAPE_SONGS)[number]): Track => {
    const v = song.get(s.key)!;
    return {
      id: s.artistId ?? s.key,
      name: v.artistName,
      imageUrl: v.imageUrl ?? (s.artistId ? byId.get(s.artistId)?.imageUrl ?? null : null),
      previewUrl: data.songs?.[s.key]?.previewUrl ?? null,
      previewTrack: v.title,
      activeFrom: null,
      note: `From ${v.album}`,
      gain: s.gain,
    };
  };
  const queue: Queue = {
    id: 'about:tape',
    title: 'I made you a tape',
    stopMs: SONG_MS,
    tracks: onTape.map(trackOf),
  };

  const tracks = TAPE_TRACKS.map((t, i): TapeTrackView => ({
    ...t,
    n: i + 1,
    songs: t.songs.map(k => song.get(k)!).filter(Boolean),
  }));

  // A record on the tape plays on the tape; one off it, its song on its own.
  const cover = (key: string): Cover => {
    const s = song.get(key)!;
    const off = s.at < 0;
    return {
      title: s.album, artistId: s.artistId, artistName: s.artistName, imageUrl: s.imageUrl,
      at: off ? null : s.at, track: off ? trackOf(TAPE_SONGS.find(t => t.key === key)!) : null,
    };
  };
  const classic = (id: string): Cover => {
    const a = artist(id);
    const album = a.classicAlbums?.[0];
    const previewUrl = album?.previewUrl ?? a.previewUrl ?? null;
    return {
      title: album?.title ?? a.name, artistId: id, artistName: a.name, imageUrl: album?.imageUrl ?? null, at: null,
      track: previewUrl ? {
        id, name: a.name, imageUrl: album?.imageUrl ?? a.imageUrl ?? null, previewUrl,
        previewTrack: (album?.previewUrl ? album.previewTrack : a.previewTrack) ?? null,
        activeFrom: a.activeFrom ?? null, note: album ? `From ${album.title}` : undefined,
      } : null,
    };
  };

  const road = ROAD_IN.map(({ id, via }) => ({ ...face(id), color: ROAD_COLOR[id] ?? face(id).color, via: via ?? null }));
  // Each stop plays its song on the tape, or the map's song for the band.
  const roadQueue: Queue = {
    id: 'about:road',
    title: 'My road in',
    stopMs: ROAD_STOP_MS,
    tracks: ROAD_IN.map(({ id }): Track => {
      const a = artist(id);
      const onTape = TAPE_SONGS.find(s => s.artistId === id);
      const tapeSong = onTape ? data.songs?.[onTape.key] : undefined;
      return {
        id, name: a.name, imageUrl: a.imageUrl ?? null,
        previewUrl: tapeSong?.previewUrl ?? a.previewUrl ?? null,
        previewTrack: onTape ? (onTape.label ?? onTape.song) : a.previewTrack ?? null,
        activeFrom: a.activeFrom ?? null,
        note: 'My road in',
      };
    }),
  };

  const learnedFrom = data.edges
    .filter(e => e.type === 'influence' && e.source === 'alvvays' && byId.has(e.target))
    .sort((a, b) => b.confidence - a.confidence)
    .map(e => face(e.target));
  const soundsLike = SOUNDS_LIKE.map(id => {
    if (data.edges.some(e => (e.source === id && e.target === 'alvvays') || (e.source === 'alvvays' && e.target === id))) {
      throw new Error(`About tape: ${id} is linked to Alvvays, so it can't stand for "sounds like, no line"`);
    }
    return face(id);
  });

  const nsEdge = data.edges.find(e => e.source === NOT_SOUND.to && e.target === NOT_SOUND.from);
  const listen: Queue = {
    id: 'about:listen',
    title: 'Listen: nothing alike',
    stopMs: SONG_MS,
    tracks: [NOT_SOUND.from, NOT_SOUND.to].map(id => {
      const a = artist(id);
      return { id, name: a.name, imageUrl: a.imageUrl ?? null, previewUrl: a.previewUrl ?? null, previewTrack: a.previewTrack ?? null, activeFrom: a.activeFrom ?? null };
    }),
  };

  // The fork's signs: a genre on the map (linking to its page), or the name
  // of one that isn't on it yet.
  const sign = (id: string): ForkSign => {
    const g = data.genres.find(x => x.id === id);
    if (!g) throw new Error(`About tape: no genre ${id} on the map`);
    return { id, name: g.name, emerged: g.emerged ?? null, color: GENRE_COLORS[id] ?? DEFAULT_GENRE_COLOR };
  };
  const offMap = (name: string): ForkSign => ({ id: null, name, emerged: null, color: '#9a99a0' });
  // A band who isn't on the map: their name and photo, nothing to link to.
  const offMapFace = (name: string, key: string): Face => ({ id: '', name, imageUrl: data.songs?.[key]?.artistImageUrl ?? null, color: '#e0457b' });
  // A loud song, on its own: only when pressed, and quieter (its gain).
  const loudQueue = (id: string, key: string): Queue => ({
    id, title: 'Listen (it\u2019s loud)', stopMs: SONG_MS, tracks: [trackOf(TAPE_SONGS.find(x => x.key === key)!)],
  });

  const learnersOf = (id: string) => new Set(data.edges.filter(e => e.type === 'influence' && e.target === id).map(e => e.source));
  const ct = learnersOf('cocteau-twins');
  const mbv = learnersOf('my-bloody-valentine');
  const both = [...ct].filter(id => mbv.has(id)).sort((a, b) => artist(a).name.localeCompare(artist(b).name)).map(face);

  return {
    tracks,
    queue,
    label: TAPE_LABEL,
    sides: SIDES,
    road,
    roadQueue,
    radiohead: [classic('radiohead'), cover('disappear'), cover('weird-fishes')],
    rotation: [
      cover('disappear'), cover('joga'), cover('andromeda'), classic('the-cure'),
      cover('emily'), cover('weird-fishes'), cover('alison'), cover('dreams-tonite'), classic('radiohead'), cover('story-ends'),
    ],
    constants: {
      question: TWO_DAYS.ask,
      down: { ...cover(TWO_DAYS.down.song), when: TWO_DAYS.down.when, words: TWO_DAYS.down.words, ask: TWO_DAYS.down.ask },
      tired: { ...cover(TWO_DAYS.tired.song), when: TWO_DAYS.tired.when, words: TWO_DAYS.tired.words, ask: TWO_DAYS.tired.ask },
      genres: {
        links: TWO_DAYS.genres.ids.map(id => ({ id, name: data.genres.find(g => g.id === id)?.name ?? id })),
        after: TWO_DAYS.genres.after,
      },
    },
    dig: DIGGING.map(({ name, tab, href, finds }) => ({
      name,
      tab: tab ?? name,
      href,
      finds: finds.map(f => {
        const c = 'song' in f ? cover(f.song) : classic(f.record);
        return { ...c, note: f.note, song: 'song' in f ? song.get(f.song)!.title : c.track?.previewTrack ?? '' };
      }),
    })),
    learned: {
      band: face('alvvays'),
      from: learnedFrom,
      soundsLike,
      notSound: {
        from: face(NOT_SOUND.from),
        to: face(NOT_SOUND.to),
        words: NOT_SOUND.words,
        quote: nsEdge?.citation?.includes(NOT_SOUND_QUOTE) ? NOT_SOUND_QUOTE : '',
        source: NOT_SOUND_SOURCE,
        listen,
      },
    },
    between: {
      // Their own colours, not the realm's: both are shoegaze pink on the map.
      ct: { ...face('cocteau-twins'), color: ROAD_COLOR['cocteau-twins'] },
      mbv: { ...face('my-bloody-valentine'), color: ROAD_COLOR['my-bloody-valentine'] },
      ctCount: ct.size,
      mbvCount: mbv.size,
      both,
      lead: HOW_WE_KNOW,
      cards: BETWEEN_CARDS.map(({ who, quote, source }) => ({ who, quote, source })),
    },
    liner: LINER_NOTES,
    sideBWhy: SIDE_B_WHY,
    scenes: SCENE_STORIES.map(({ sceneId, title, bands, words }) => {
      const scene = data.scenes.find(s => s.id === sceneId);
      if (!scene) throw new Error(`About tape: no scene ${sceneId}`);
      for (const id of bands) if (!scene.memberIds.includes(id)) throw new Error(`About tape: ${id} isn't in ${sceneId}`);
      const genreName = new Map(data.genres.map(g => [g.id, g.name]));
      return {
        id: sceneId,
        title,
        name: scene.name,
        where: `${scene.city} \u00b7 ${scene.yearStart}\u2013${scene.yearEnd ?? 'now'}`,
        bands: bands.map(id => ({
          ...face(id),
          credit: artist(id).imageCredit ?? null,
          sounds: artist(id).genres.slice(0, 3).map(g => ({ id: g, name: genreName.get(g) ?? g, color: genreFamilyColor(data.genres, g) })),
        })),
        words,
      };
    }),
    oneFamily: {
      root: sign(ONE_FAMILY.root),
      soft: {
        road: ONE_FAMILY.soft.road.map(sign),
        end: offMap(ONE_FAMILY.soft.end),
        band: face(ONE_FAMILY.soft.band),
        listen: song.get(ONE_FAMILY.soft.song)!,
      },
      loud: {
        road: ONE_FAMILY.loud.road.map(sign),
        end: offMap(ONE_FAMILY.loud.end),
        band: face(ONE_FAMILY.loud.band),
        title: song.get(ONE_FAMILY.loud.song)!.title,
        listen: loudQueue('about:loud', ONE_FAMILY.loud.song),
      },
      merge: {
        words: ONE_FAMILY.merge.words,
        road: ONE_FAMILY.merge.road.map(sign),
        from: sign(ONE_FAMILY.merge.from),
        otherRoad: ONE_FAMILY.merge.otherRoad.map(offMap),
        other: offMap(ONE_FAMILY.merge.other),
        to: offMap(ONE_FAMILY.merge.to),
        soft: { band: face(ONE_FAMILY.merge.softBand), listen: song.get(ONE_FAMILY.merge.softSong)! },
        loud: {
          band: offMapFace(ONE_FAMILY.merge.loudBandName, ONE_FAMILY.merge.loudSong),
          title: song.get(ONE_FAMILY.merge.loudSong)!.title,
          listen: loudQueue('about:black-metal', ONE_FAMILY.merge.loudSong),
        },
        band: offMapFace(ONE_FAMILY.merge.bandName, ONE_FAMILY.merge.song),
        title: song.get(ONE_FAMILY.merge.song)!.title,
        listen: loudQueue('about:blackgaze', ONE_FAMILY.merge.song),
      },
      last: ONE_FAMILY.last,
    },
    counts: {
      artists: data.artists.length,
      links: data.edges.length,
      cited: data.edges.filter(e => e.citation && e.citation.trim()).length,
      firstPerson: data.edges.filter(e => e.sourceTier === 'first-person').length,
      denied: data.rejectedEdges.length,
    },
  };
}

/** The room behind the tape, as behind an artist's page
 *  (components/artist/backline/Room): their bass wears badges of the bands
 *  on their road in and the first of the tape's others, the guitar stickers
 *  of the rest; the tape's own records fill the shelves first. The walls
 *  are the tape's own plum-ink dark, a shade lighter, so the page and the
 *  room are one colour (MBV's pink gone dark, as they were at first,
 *  clashed with the page); the bass and the ribbon keep MBV's pink. */
export interface AboutRoom {
  backline: Backline;
  genres: string[];
  finish: string;
  ribbon: string;
}

const ROOM_BADGES = 10;
const ROOM_PLUM = '#3a2f48'; // the page's #1a1520, with a little more colour: the wall comes out #2b2138
const ROOM_STICKERS = 10;

export function resolveAboutRoom(data: GraphData, tape: AboutTape): AboutRoom {
  const byId = new Map(data.artists.map(a => [a.id, a]));
  const faceOf = (id: string) => {
    const a = byId.get(id);
    return a?.imageUrl ? [{ id, name: a.name, imageUrl: a.imageUrl }] : [];
  };
  const road = tape.road.map(r => r.id);
  const others = [...new Set(tape.tracks.flatMap(t => t.songs.map(s => s.artistId)))].filter(id => id && !road.includes(id));
  const worn = [...road, ...others].flatMap(faceOf);
  const badges = worn.slice(0, ROOM_BADGES);
  const stickers = worn.slice(ROOM_BADGES, ROOM_BADGES + ROOM_STICKERS);

  const records: ShelfRecord[] = [];
  const seen = new Set<string>();
  const shelve = (r: ShelfRecord) => {
    if (seen.has(r.imageUrl) || records.length >= SHELF_RECORDS) return;
    seen.add(r.imageUrl);
    records.push(r);
  };
  for (const s of tape.tracks.flatMap(t => t.songs)) {
    if (s.imageUrl) shelve({ artistId: s.artistId || s.artistName, title: s.album, imageUrl: s.imageUrl, family: true });
  }
  for (const id of [...road, ...others]) {
    const album = byId.get(id)?.classicAlbums?.[0];
    if (album?.imageUrl) shelve({ artistId: id, title: album.title, imageUrl: album.imageUrl, family: true });
  }
  // The rest of the shelves: whoever learned from either of their two constants.
  const learners = data.edges
    .filter(e => e.type === 'influence' && (e.target === 'cocteau-twins' || e.target === 'my-bloody-valentine'))
    .map(e => e.source);
  for (const id of learners) {
    const album = byId.get(id)?.classicAlbums?.[0];
    if (album?.imageUrl) shelve({ artistId: id, title: album.title, imageUrl: album.imageUrl, family: false });
  }

  const color = ROAD_COLOR['my-bloody-valentine'];
  const wall = roomWall(ROOM_PLUM);
  const genreName = (id: string) => data.genres.find(g => g.id === id)?.name ?? id;
  return {
    backline: { kit: 'band', self: null, scene: null, wall, badges, stickers, records },
    genres: [...tape.constants.genres.links.map(l => l.name), genreName('post-punk'), tape.oneFamily.merge.to.name],
    finish: risoInk(color, wall, 3.2, 6),
    ribbon: risoInk(color, wall, 7, 10),
  };
}
