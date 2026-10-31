// The About page: "I made you a tape". The maker's own story, in their own
// words (Oct 2026), laid out as a mixtape for the visitor: each part of the
// story is a track, paired with one of the songs on their tape. This file is
// the page's words and songs; lib/about-tape.ts resolves them against the
// map, and components/about draws them.
//
// Edit the words here. Keep them the maker's: lightly tidied, never
// rewritten into somebody else's voice.

/** A song on the tape. The build (scripts/build-graph.ts) fetches a preview
 *  of exactly this recording into graph.json's `songs`, keyed by `key`. */
export interface TapeSong {
  key: string;
  /** The artist on the map; or, for one who isn't, their name. */
  artistId?: string;
  artistName?: string;
  song: string;
  /** The record it's from, so the build finds this recording, not another. */
  album: string;
  /** The store to look in, when the US one doesn't carry it. */
  country?: 'us' | 'gb' | 'jp';
  /** Shown instead of the store's title. */
  label?: string;
  /** The record's name as shown, when `album` is only enough to find it. */
  albumLabel?: string;
  /** false: not on the tape itself, played only when pressed. */
  onTape?: false;
  /** How loud, against the rest (1 = as usual). */
  gain?: number;
}

export const TAPE_SONGS: TapeSong[] = [
  { key: 'disappear', artistId: 'radiohead', song: 'How to Disappear Completely', album: 'Kid A' },
  { key: 'weird-fishes', artistId: 'radiohead', song: 'Weird Fishes / Arpeggi', album: 'In Rainbows' },
  { key: 'cherry', artistId: 'cocteau-twins', song: 'Cherry-Coloured Funk', album: 'Heaven or Las Vegas' },
  { key: 'when-you-sleep', artistId: 'my-bloody-valentine', song: 'When You Sleep', album: 'Loveless', country: 'gb' },
  { key: 'joga', artistId: 'bjork', song: 'Jóga', album: 'Homogenic' },
  { key: 'andromeda', artistId: 'weyes-blood', song: 'Andromeda', album: 'Titanic Rising' },
  { key: 'emily', artistId: 'joanna-newsom', song: 'Emily', album: 'Ys' },
  { key: 'dreams-tonite', artistId: 'alvvays', song: 'Dreams Tonite', album: 'Antisocialites' },
  { key: 'get-me-away', artistId: 'belle-and-sebastian', song: "Get Me Away from Here, I'm Dying", album: "If You're Feeling Sinister" },
  // Mathcore, and loud: it never plays by itself on the tape, only when
  // pressed, and comes in at half volume. On the map since Oct 2026, under
  // the same loud rule.
  { key: 'prancer', artistId: 'dillinger-escape-plan', song: 'Prancer', album: 'One of Us Is the Killer', onTape: false, gain: 0.5 },
  // Black metal and blackgaze: loud too, so the same care.
  { key: 'transilvanian-hunger', artistName: 'Darkthrone', song: 'Transilvanian Hunger', album: 'Transilvanian Hunger', onTape: false, gain: 0.5 },
  { key: 'dream-house', artistName: 'Deafheaven', song: 'Dream House', album: 'Sunbather', onTape: false, gain: 0.5 },
  // Why the map has scenes: the Windmill, then DC's straight edge movement.
  { key: 'sugar-tzu', artistId: 'black-midi', song: 'Sugar/Tzu', album: 'Hellfire' },
  { key: 'straight-edge', artistId: 'minor-threat', song: 'Straight Edge', album: 'First Two Seven Inches' },
  { key: 'waiting-room', artistId: 'fugazi', song: 'Waiting Room', album: '13 Songs' },
  { key: 'alison', artistId: 'slowdive', song: 'Alison', album: 'Souvlaki' },
  { key: 'story-ends', artistId: 'the-sundays', song: "Here's Where the Story Ends", album: 'Reading, Writing and Arithmetic' },
  // Radio City, the Big Star record Todd Jones picked: in the dig crate only.
  { key: 'september-gurls', artistId: 'big-star', song: 'September Gurls', album: 'Radio City', onTape: false },
];

export interface TapeTrack {
  id: string;
  side: 'A' | 'B';
  /** The chapter's name on the inlay card. */
  title: string;
  /** Its songs, by key: the first is the one scrolling into it plays. */
  songs: string[];
  heading: string;
  words: string[];
}

// Every name says plainly what its part is about, so it reads on its own:
// on the inlay card, in the sticky label, landing mid-page. (They were
// riddles once -- "Static", "The only constants", "Still the line" -- that
// only made sense after reading the part; the owner rightly called them
// weird out of context.) The mood comes from the songs and the page.
export const SIDES = { A: 'How I got into music', B: 'Why I made this map' } as const;

export const TAPE_TRACKS: TapeTrack[] = [
  {
    id: 'static',
    side: 'A',
    title: 'Before: nothing stuck',
    songs: [],
    heading: 'Before: nothing stuck',
    words: [
      "I'd hear songs on streaming apps. They were fine the first time; by the fourth or fifth listen I was bored. Everything sounded the same. No artist had anything of their own, nothing I couldn't hear in someone else's music.",
      "I thought music just wasn't for me.",
    ],
  },
  {
    id: 'disappear',
    side: 'A',
    title: 'The song that changed it',
    songs: ['disappear'],
    heading: 'The song that changed it',
    words: [
      "I hadn't slept all night. It was 5am, the sun was just coming up, and I was looking out of the window with \"How to Disappear Completely\" playing.",
      "Thom Yorke sang \"I'm not here, this isn't happening,\" and something in me changed. It made sense.",
      'After that it was all of Radiohead: OK Computer, Kid A, In Rainbows, each one different from the last.',
    ],
  },
  {
    id: 'expanding',
    side: 'A',
    title: 'One band led to another',
    songs: ['weird-fishes'],
    heading: 'One band led to another',
    words: [
      "Rate Your Music's list of the greatest albums of all time had the Cure's Disintegration in its top 25. I'd heard the Cure pioneered gothic rock, so I put it on.",
      "Then I read that Robert Smith got ready for his wedding listening to Cocteau Twins' Treasure, and called it the most romantic music he'd ever heard. That's how I got to Cocteau Twins.",
      "From there it was a short step to My Bloody Valentine. Shoegaze grew out of dream pop: turn the guitars up and distort them until the noise becomes a wall of sound. Cocteau Twins pioneered dream pop; My Bloody Valentine pioneered shoegaze.",
    ],
  },
  {
    // Once two tracks (the two bands, then their two records), merged so
    // each point is made once: the orbit, then "What kind of day is it?".
    id: 'rotation',
    side: 'A',
    title: 'My two favourite bands, and their records',
    songs: ['cherry', 'when-you-sleep', 'joga', 'andromeda', 'emily'],
    heading: 'My two favourite bands, and their records',
    words: [
      "My taste runs from dream pop to black metal, depending on how I feel and how I want to feel. But Cocteau Twins and My Bloody Valentine are the two I always come back to.",
      "In both, the voice is an instrument: Liz Fraser's, and Kevin Shields' and Bilinda Butcher's. The guitars and the atmosphere come first; the voice is one more layer, melting into the song.",
      "Liz Fraser's voice has been called the voice of God. I don't understand anything she sings, but I feel everything.",
      "I can't choose between Heaven or Las Vegas and Loveless. Each is for a different kind of day.",
    ],
  },
  {
    id: 'dig',
    side: 'B',
    title: 'How I find new music',
    songs: [],
    heading: 'How I find new music',
    words: [
      "I don't trust the recommendations on music apps much. For every creative artist they give you, they follow with a less creative copy of them. And they narrow your taste.",
      'I want to widen mine.',
      "So I dig: Rate Your Music and Album of the Year, where listeners rate and review records, and Amoeba's \"What's in My Bag?\", videos of musicians picking records in a record shop.",
    ],
  },
  {
    id: 'learned',
    side: 'B',
    title: "Sounding alike isn't influence",
    songs: ['dreams-tonite'],
    heading: "Sounding alike isn't influence",
    words: [
      "Look Alvvays up on a streaming app and you're shown bands that sound like them. You don't see the bands they actually learned from, and those are the bands I love.",
    ],
  },
  {
    id: 'one-family',
    side: 'B',
    title: 'How genres split, and how they merge',
    songs: ['get-me-away'],
    heading: 'How genres split, and how they merge',
    words: [
      'One day I was listening to Belle and Sebastian, and then to the Dillinger Escape Plan. Twee pop, then mathcore. And it hit me: they both came from punk. I was shocked.',
      "I'd read that twee pop was a rebellion against punk getting faster, heavier and more aggressive. It chose to be soft, innocent, slow and comforting.",
      'On the other side, hardcore punk met metal and became metalcore, and metalcore met math rock and became mathcore: the Dillinger Escape Plan. Fast, heavy, aggressive, complex. It sounds like having a panic attack.',
    ],
  },
  {
    id: 'scenes',
    side: 'B',
    title: 'Why the map has scenes',
    songs: ['sugar-tzu', 'straight-edge', 'waiting-room'],
    heading: 'Why the map has scenes',
    words: [
      'Genres divide bands by sound. Scenes bring them back together: divided by sound, united by a venue, a label, a community. Two scenes are why this map has them.',
    ],
  },
  {
    id: 'between',
    side: 'B',
    title: 'How the map knows who influenced whom',
    songs: ['alison'],
    heading: 'How the map knows who influenced whom',
    words: [
      'Every band on this map is linked to the bands that influenced them, and every link says where we know it from. Here are my two favourite bands, and everyone on the map who learned from them.',
    ],
  },
  {
    id: 'end',
    side: 'B',
    title: 'The end: your turn',
    songs: ['story-ends'],
    heading: 'The end: your turn',
    words: [
      'Somewhere on this map is your 5am song. Go find it.',
    ],
  },
];

/** On the inlay card, hand-lettered. */
export const TAPE_LABEL = {
  to: 'for you',
  from: 'Diwakar',
  /** The page's headline: their story's first line and its turn, in one
   *  breath. (The first line alone, with the dedication repeating it, read
   *  as a contradiction on a music site's About page.) */
  headline: ['I was never interested in music.', 'Then I heard Radiohead.'],
  /** What this page is, in one plain line. */
  intro: 'Why I made Starweave, told as a mixtape: each part comes with a song.',
};

/** Their road in: each band, in the order they found them, and what led
 *  them there (written over the road before the stop). */
export const ROAD_IN: { id: string; via?: string }[] = [
  { id: 'radiohead' },
  { id: 'the-cure', via: 'a Rate Your Music top-albums list' },
  { id: 'cocteau-twins', via: "Robert Smith's wedding-day record" },
  { id: 'my-bloody-valentine', via: 'dream pop, turned up into shoegaze' },
];

/** The two records that never leave the rotation, and the two kinds of day
 *  they're for. */
export const TWO_DAYS = {
  ask: 'What kind of day is it?',
  down: {
    artistId: 'cocteau-twins',
    song: 'cherry',
    ask: 'Really down',
    when: "When I'm feeling very down",
    words: [
      '"Cherry-Coloured Funk" goes on first. Heavenly, otherworldly: listening to it feels like my ears have been blessed.',
    ],
  },
  tired: {
    artistId: 'my-bloody-valentine',
    song: 'when-you-sleep',
    ask: 'Stressed, or tired',
    when: "When I'm very stressed or tired",
    // The rest from their own Album of the Year review of Loveless.
    words: [
      'I step into the world of Loveless. Its layers of guitar overwhelm me, consume me.',
      "The first time, I didn't get it. A year later I put it on in the background while writing my practicals, and it put me in a trance. I stopped writing. It was overloading my brain and calming it at the same time.",
      'Someone called it angels singing in a black hole. It\u2019s noisy and heavenly at once, like soft music played heavily. "When You Sleep" is my favourite: a perfect indie pop song inside layers of noisy guitar. "To Here Knows When" can make me cry.',
      'I play it at 90% volume; it\u2019s meant to be loud.',
      // Shown once the song stops or you scroll on (TwoDays): coming out of it.
      'When I come out, I feel alive and refreshed.',
    ],
  },
  /** Dream pop and shoegaze, each linking to its genre's page, then this. */
  genres: {
    ids: ['dream-pop', 'shoegaze'],
    after: ' are my favourite genres for the same reason: no other genre does it the way these two do.',
  },
};

/** Where they dig, and what they found there: a song on the tape, or an
 *  artist's record on the map (it plays a song from itself). Rate Your
 *  Music's and Album of the Year's top albums of the 2020s (by Album of the
 *  Year's user score, Oct 2026); Big Star's Radio City from Todd Jones of
 *  Nails' "What's in My Bag?" (3:59-4:34: "I'm kind of starting to dive into
 *  a little bit of power pop stuff... The NAILS bassist, John, he always
 *  talks about Big Star"). */
// Each find's `note` is its staff-pick card, pinned beside the crate: how
// and why they found it, in their own words (the stories live here, not in
// the track's text, so nothing is said twice).
export type DigNote = string | { quote: string; who: string };
export const DIGGING: { name: string; tab?: string; href: string; finds: (({ song: string } | { record: string }) & { note: DigNote[] })[] }[] = [
  {
    name: 'Rate Your Music', href: 'https://rateyourmusic.com/',
    finds: [
      {
        record: 'black-country-new-road',
        note: [
          "Rate Your Music's top album of the 2020s.",
          "Black Country, New Road don't have one genre: post-rock, noise, chamber pop, prog pop. Their sound changes with every record.",
          // Isaac Wood left in January 2022, days before it came out.
          'Isaac Wood, who sang on this one and left just before it came out, is technically a bad singer. His voice cracks, and he half-speaks his lines, the way Slint did. But it\u2019s so emotional, and it matches the music.',
          'They play like a classical ensemble more than a rock band: violin, piano, saxophone, flute. You rarely hear those in rock now. While people in indie try to be cool, they bring back emotion, complexity and grand, huge-sounding music.',
        ],
      },
    ],
  },
  {
    name: 'Album of the Year', href: 'https://www.albumoftheyear.org/',
    finds: [{
      record: 'magdalena-bay',
      note: [
        "Album of the Year's top album of the 2020s.",
        // The story, as the duo call it, is a loose concept: True has the
        // disk implanted in her forehead to become her ideal self, and her
        // body rejects it (Wikipedia's Imaginal Disk page).
        "A loose concept album about True, who isn't happy with her life. She sees an ad for the Imaginal Disk, put into your head to become the perfect you, the one you want to be. She gets it put in, then feels trapped: her body rejects it. Someone keeps asking for help, and I'm not sure who. Maybe her true self, not wanting to be changed.",
        'It\u2019s synth pop, but prog-influenced: I didn\u2019t know synth pop could be done this way. Every song grows, layer on layer, and in the second half the songs flow into each other, with amazing transitions. Existential, but cohesive and fun, and very otherworldly. A modern classic, with one of the coolest album covers.',
      ],
    }],
  },
  {
    name: 'Amoeba: What’s in My Bag?', tab: 'What’s in My Bag?', href: 'https://www.youtube.com/@amoeba',
    finds: [{
      song: 'september-gurls',
      note: [
        "I didn't know Big Star, but I kept seeing their records picked in \"What's in My Bag?\" videos. Then Todd Jones, who fronts NAILS, picked Radio City:",
        {
          // His own words, from the video (3:59-4:34).
          quote: "I'm kind of starting to dive into a little bit of power pop stuff... The NAILS bassist, John, he always talks about Big Star, so I'm going to buy a Big Star record to check it out.",
          who: 'Todd Jones, NAILS',
        },
        'Very interesting: NAILS make some of the heaviest, most hateful, brutal music there is, and their taste is wide enough for soft, happy power pop.',
        "So I listened. It was ahead of its time: it doesn't sound like 1974, it sounds like an 80s or 90s indie record.",
      ],
    }],
  },
];

/** Why the map has scenes: the two that made it need them, each drawn as
 *  its strip of film from /scenes (one frame per band, each band's sounds
 *  under its frame, from the map's own genres), then the story in the
 *  owner's words. Bands in the order the story names them. */
export const SCENE_STORIES: { sceneId: string; title: string; bands: string[]; words: string[] }[] = [
  {
    sceneId: 'windmill',
    title: 'The Windmill',
    bands: ['black-country-new-road', 'black-midi', 'jockstrap', 'squid'],
    words: [
      'The Windmill is a small pub in Brixton, South London. Black Country, New Road, black midi, Squid and Jockstrap all came up playing there, and each sounds like no one else.',
      "Take the two at its heart, called two of the most creative bands of this decade. Black Country, New Road are slow, emotional and orchestral (their record is in my crate). black midi are the opposite: complex, prog and math rock, and funny. The riff changes every few seconds and the song sounds like it could fall apart at any moment, but it never does. Controlled chaos.",
      // A livestream in December 2020 to help save the Windmill, where they
      // also covered "Born to Run" together (Stereogum, NME).
      "They're close friends, and they've even played as one band, to help save the Windmill.",
      "Georgia Ellery, Black Country, New Road's violinist, makes inventive prog pop as half of Jockstrap. Squid play Talking Heads-style post-punk.",
    ],
  },
  {
    sceneId: 'dc-hardcore',
    title: 'The straight edge movement',
    bands: ['minor-threat', 'fugazi', 'rites-of-spring', 'bad-brains', 'the-dismemberment-plan'],
    words: [
      'In Washington DC there was Ian MacKaye, a legend in hardcore. At a time when drinking, smoking and drugs were what was cool, his band Minor Threat put out a 46-second song, "Straight Edge", saying he didn\u2019t do any of them, and that being in control of yourself was the cool thing. It started the straight edge movement.',
      // Atlantic's Ahmet Ertegun offered "anything you want", their own label
      // and more than $10 million (Wikipedia's Fugazi page, from Friedman).
      'Then Fugazi, on his own label, Dischord: $5 shows, cheap records, benefit shows, and never signing to a major, even when Atlantic offered over $10 million. He showed you could make music, not starve, and stay fiercely independent. So much of indie, punk and hardcore still tries to live by that.',
      'Hardcore is still one of the most community-based kinds of music there is: the fans are part of the music.',
    ],
  },
];

/** Influence isn't only sound. */
/** Side B opens with why they made the map. */
export const SIDE_B_WHY = [
  'I made this to show influence in music. In indie, it matters more than anything: the mainstream counts sales, indie counts influence. And influence can\u2019t always be heard.',
];

/** Twee pop and mathcore: punk in the middle, a road to each, drawn from the
 *  map's own genre family tree; the ends that aren't on the map shown as
 *  such. Listening to both ends is the point. */
export const ONE_FAMILY = {
  root: 'punk',
  soft: { road: ['post-punk', 'indie-pop'], end: 'Twee pop', song: 'get-me-away', band: 'belle-and-sebastian' },
  loud: { road: ['hardcore-punk', 'post-hardcore', 'math-rock'], end: 'Mathcore', song: 'prancer', band: 'dillinger-escape-plan' },
  /** And the other way: two families meeting. The owner's own words. */
  merge: {
    words: [
      'Shoegaze is the most beautiful genre: it sounds like heaven. Black metal is the darkest: it sounds like hell. On the surface they\u2019re opposites; at their core they\u2019re the same. Both build a wall of sound, one for heaven, one for hell, and in both the voice is one more layer in it: beautiful in one, brutal in the other.',
      'Deafheaven proved it. They balance shoegaze and black metal so perfectly that their music lives in heaven and hell at once: like you\u2019re in heaven while a fallen angel screams in pain. Equally beautiful and brutal.',
    ],
    // Each side's line back: shoegaze's from the map (punk, the split's own
    // root, on down; tested to be real parent chains), black metal's off it
    // (heavy metal, then Venom's speed metal, which named it).
    road: ['punk', 'post-punk', 'dream-pop'],
    from: 'shoegaze',
    otherRoad: ['Heavy metal', 'Speed metal'],
    other: 'Black metal',
    to: 'Blackgaze',
    // A band at each end, as in the split: one from each side, meeting in one.
    softBand: 'my-bloody-valentine',
    softSong: 'when-you-sleep',
    loudBandName: 'Darkthrone',
    loudSong: 'transilvanian-hunger',
    song: 'dream-house',
    bandName: 'Deafheaven',
  },
  last: 'Every genre, and what it grew out of',
};

/** Before the two sources on the "between" track. */
export const HOW_WE_KNOW = 'How does the map know? Here\u2019s Alvvays, one of the seven who learned from both, in their own words.';

/** How it's made: the hidden track after the tape runs out. Facts only. */
export const LINER_NOTES = {
  lines: [
    'Every line on the map was put there by hand, each with a named source: the artist in their own words wherever they can be found, a report or a critic where they can\u2019t, and a denial kept wherever an artist said \u201cno, not them\u201d.',
    'Built with Next.js, TypeScript and react-force-graph, from a static data file; photos, covers and song previews come from Deezer, Apple Music, the Cover Art Archive and Wikimedia Commons.',
  ],
  code: 'https://github.com/DiwakarMishra-CODER/starweave',
};

/** The bands a streaming app shows beside Alvvays (the owner's list): they
 *  share a sound, and none is linked to Alvvays on the map (tested). */
export const SOUNDS_LIKE = ['japanese-breakfast', 'snail-mail', 'beach-house', 'big-thief', 'angel-olsen', 'weyes-blood', 'clairo'];

export const NOT_SOUND = {
  from: 'fugazi',
  to: 'elliott-smith',
  words:
    "And influence isn't only sound. Fugazi shaped people with their ethics: cheap all-ages shows, doing everything themselves. Elliott Smith sounds nothing like them, and he was obsessed with them. A “similar artists” list will never tell you that.",
};
