// Hand-authored genre-story page content — deliberately NOT part of
// seed-data.ts/GraphData. This is presentation prose keyed by genre id, read
// directly by app/(graph)/genre/[genre]/page.tsx; it never touches
// scripts/build-graph.ts or public/graph.json, so editing this file needs no
// build:data run. artistIds are resolved against the live graph at render
// time — this file only supplies the grouping and the prose around it.
//
// Every artistId in every genre's `sections` must be exactly the full set of
// artists carrying that genre tag in data/seed-data.ts, each appearing in
// exactly one section — no orphans, no duplicates. Verify with:
//   npx tsx -e "..." (filter graphData.artists by genres.includes(id), diff
//   against the flattened section artistIds) before trusting an edit here.
//
// `definingAlbums` is a single curated list PER PAGE, not per section — see
// the cautionary case that prompted the curation rule: Wednesday carries
// the shoegaze tag (their sound draws on it), but their classicAlbum, Rat
// Saw God, is an alt-country/indie-rock record with no shoegaze in it. The
// test for inclusion is the ALBUM, not the artist: does this specific
// classicAlbum genuinely define the genre, not just does the artist carry
// the tag.
//
// A per-section version of this field was tried and reverted — sections
// divide artists into meaningful groups, but the defining-album canon is a
// small curated set that doesn't distribute evenly across them, and several
// sections ended up with a single lonely cover that read as broken rather
// than curated. One page-level list, rendered as one grid, is correct.

export interface GenrePageSection {
  title: string;
  blurb: string;
  artistIds: string[];
}

export interface GenrePageContent {
  deck: string;
  originParagraphs: string[];
  soundParagraph: string;
  // Curated artist ids whose classicAlbums[0] is genuinely definitional for
  // this genre — see the file-level comment above. NOT derived from section
  // membership; an artist can appear in `sections` (correctly tagged) while
  // being absent here (their classic album isn't the right genre).
  definingAlbums: string[];
  sections: GenrePageSection[];
}

export const GENRE_PAGES: Record<string, GenrePageContent> = {
  shoegaze: {
    deck:
      "Guitar-pedal haze, oceanic walls of distortion, and vocals buried so deep in the mix " +
      "they become texture. Shoegaze emerged from the UK in the late 1980s as a reaction " +
      "against the studied cool of post-punk — something more overwhelming, more ambiguous, " +
      "harder to hold at arm's length.",
    originParagraphs: [
      "The name came from a dismissive joke — these guitarists spent their live sets " +
        "staring at their pedalboards, lost in the sound they were making. The Jesus and " +
        "Mary Chain sparked the template in 1985 with Psychocandy: Velvet Underground " +
        "drones run through walls of feedback, with melodies buried underneath.",
      "By 1988, My Bloody Valentine's Isn't Anything had turned that noise into a genre of " +
        "its own, and a cluster of Oxford and Reading acts — Ride, Slowdive, Chapterhouse — " +
        "formed around Creation and 4AD, the two labels that would define the first wave. " +
        "My Bloody Valentine's own Loveless (1991) set a ceiling nobody has convincingly " +
        "matched since.",
    ],
    soundParagraph:
      "Guitar is the instrument, but the effects chain is the composition — chorus, flange, " +
      "and reverb stacked until individual notes dissolve into one moving wall, with tremolo " +
      "picking and whammy-bar dives (My Bloody Valentine's so-called \"glide guitar\") doing " +
      "the work a solo would elsewhere. Vocals are mixed low and often doubled, another layer " +
      "in the wash rather than a focal point, while the drums stay simple and driving " +
      "underneath so the chaos above has something solid to push against.",
    // Excluded: cocteau-twins (Heaven or Las Vegas is a dream-pop record —
    // see dream-pop's own definingAlbums); hum (You'd Prefer an Astronaut is
    // space rock/alt-metal with shoegaze color, not the genre itself);
    // deerhunter, wolf-alice, silversun-pickups, sweet-trip, have-a-nice-
    // life, airiel, panchiko, the-radio-dept, candy-claws, wednesday (all
    // real shoegaze-adjacent artists — Wednesday's Rat Saw God in
    // particular is alt-country, the case that prompted this whole curation
    // pass — cut for space or off-genre).
    // Normalization pass: cut from 6 to 4 (grid is 4-across, so counts must
    // land on 4/8/12). Lush and Parannoul dropped — both genuinely fit, but
    // the four kept here are the unimpeachable classic-era pillars; this
    // does mean the grid loses its only modern-era (2020s) representation,
    // a real tradeoff of the cut rather than a costless one.
    definingAlbums: ['the-jesus-and-mary-chain', 'my-bloody-valentine', 'ride', 'slowdive'],
    sections: [
      {
        title: 'Pioneers',
        blurb:
          "The genre's first wave, most active between 1979 and 1995. Many were dismissed " +
          "as derivative by the press at the time and commercially overlooked — all are now " +
          "considered essential.",
        artistIds: [
          'the-jesus-and-mary-chain',
          'cocteau-twins',
          'my-bloody-valentine',
          'slowdive',
          'ride',
          'lush',
          'hum',
        ],
      },
      {
        title: 'Modern torchbearers',
        blurb:
          "After a mid-90s backlash quieted the original wave, shoegaze never fully " +
          "disappeared — it went underground and global. Deerhunter, Wolf Alice, and " +
          "Korea's Parannoul absorbed the template and pushed it forward, often in entirely " +
          "different cultural contexts, while a whole undercurrent of bedroom and internet-era " +
          "acts kept the wall of sound alive outside the industry's notice.",
        artistIds: [
          'deerhunter',
          'wolf-alice',
          'silversun-pickups',
          'sweet-trip',
          'parannoul',
          'have-a-nice-life',
          'airiel',
          'panchiko',
          'the-radio-dept',
          'candy-claws',
          'wednesday',
        ],
      },
    ],
  },

  'dream-pop': {
    deck:
      "A hazier, more melodic sibling to shoegaze — reverb-drenched guitars, unhurried tempos, " +
      "and vocals that float clear of the mix instead of drowning in it. Where shoegaze buries " +
      "the voice in noise, dream-pop keeps it legible, just distant, like something heard " +
      "underwater or half-remembered from a dream.",
    originParagraphs: [
      "The sound predates the name. Nico's solo records in the early 1970s already had the " +
        "chilled, cavernous quality the genre would later chase, and This Mortal Coil's 4AD " +
        "art-project covers treated the studio itself as an instrument. But the term dates to " +
        "1984, when Cocteau Twins' Treasure paired Elizabeth Fraser's wordless, glossolalic " +
        "vocals with Robin Guthrie's chorus-soaked guitar washes — voice as texture, lyrics as " +
        "an afterthought.",
      "By the late 1980s the style had split into two audiences: a jangly, hook-forward wing " +
        "(The Sundays) and a heavier, more abrasive one that would break off entirely into its " +
        "own genre. Shoegaze is dream-pop's loudest descendant — the same haze turned up past " +
        "the point of comfort — and it gets its own telling elsewhere on this site.",
    ],
    soundParagraph:
      "The guitar textures overlap with shoegaze's — chorus, reverb, delay — but the intent is " +
      "different: dream-pop wants the notes to ring clearly, not collapse into noise, so the " +
      "gain stays low and the picking stays clean. Drums are often slow and cavernous, sometimes " +
      "drum-machine-flat, giving the songs a floating, tempo-agnostic quality, and vocal melodies " +
      "lean on major-to-minor seventh movement that never quite resolves — the harmonic source " +
      "of the genre's built-in wistfulness.",
    // Excluded — off-genre album despite a correct tag: nico (Desertshore is
    // chilled chamber-drone/chanson, not dream-pop — it predates and only
    // loosely prefigures the sound); ride, lush, airiel, sweet-trip (all
    // genuinely shoegaze records, not dream-pop ones — see shoegaze's own
    // list); broadcast (Tender Buttons is a stark, minimal art-rock turn,
    // colder than the band's dreamiest work); oklou (Choke Enough reads as
    // electronic art-pop); japanese-breakfast (Jubilee is maximalist chamber-
    // pop/synth-pop, not dream-pop's hazier register).
    // Cut for space — genuinely dream-pop, just short of the top 8: the-
    // sundays, alvvays, fishmans, ethel-cain, blonde-redhead, candy-claws,
    // the-marias.
    definingAlbums: [
      'cocteau-twins',
      'this-mortal-coil',
      'julee-cruise',
      'mazzy-star',
      'galaxie-500',
      'beach-house',
      'slowdive',
      'the-radio-dept',
    ],
    sections: [
      {
        title: 'The founding hush',
        blurb:
          "Dream-pop's first generation, working before the genre had settled into a single " +
          "sound — from Nico's icy chamber-drone to Cocteau Twins' glossolalia to Japan's " +
          "Fishmans building an entirely parallel version of the same idea.",
        artistIds: ['nico', 'cocteau-twins', 'this-mortal-coil', 'julee-cruise', 'the-sundays', 'fishmans'],
      },
      {
        title: 'Into shoegaze',
        blurb:
          "The point where dream-pop's haze turns to noise. These artists carry both tags in " +
          "the graph, and most of them get fuller treatment on shoegaze's own page — this is " +
          "just where the two genres actually overlap.",
        artistIds: ['slowdive', 'ride', 'lush', 'airiel', 'the-radio-dept', 'sweet-trip', 'candy-claws'],
      },
      {
        title: 'Pop-facing dream-pop',
        blurb:
          "Artists who kept the atmosphere but foregrounded the song — clearer hooks, steadier " +
          "structure, the haze as mood rather than the entire point.",
        artistIds: ['mazzy-star', 'broadcast', 'beach-house', 'alvvays', 'the-marias'],
      },
      {
        title: 'Where dream-pop blurs',
        blurb:
          "Artists who use dream-pop as one ingredient among several — gothic Americana, " +
          "chamber-pop, no-wave noise, slowcore, hyperpop-adjacent production — rather than as " +
          "a home genre.",
        artistIds: ['ethel-cain', 'japanese-breakfast', 'blonde-redhead', 'galaxie-500', 'oklou'],
      },
    ],
  },

  'post-punk': {
    deck:
      "Punk with the three chords replaced by dub bass, angular funk, and synthesizers — art-" +
      "school seriousness applied to a form that had, by 1978, already burned through its own " +
      "simplicity. Post-punk kept punk's confrontational energy and threw out almost everything " +
      "else about how a rock band was supposed to sound.",
    originParagraphs: [
      "Punk's first wave collapsed almost as fast as it arrived — by 1978 the Sex Pistols had " +
        "already split, and a generation of art-school and university-educated musicians moved " +
        "into the space punk had cleared without any interest in repeating it. Wire's Chairs " +
        "Missing and Public Image Ltd.'s early work that same year pointed the way: choppy, " +
        "off-kilter guitar, dub-influenced bass pushed to the front, and a general distrust of " +
        "the verse-chorus song.",
      "The scene organized around a handful of independent labels — Factory in Manchester, 4AD " +
        "and Rough Trade in London — that let bands like Joy Division and Siouxsie & The " +
        "Banshees build entire sonic worlds without a major label smoothing the edges. A " +
        "parallel, less connected scene was doing something similar in New York around the " +
        "same time, led by Talking Heads' nervier, funkier take on the same basic idea.",
    ],
    soundParagraph:
      "The guitar goes angular and rhythmic instead of riff-driven — muted, funk-inflected " +
      "strumming more than lead lines — while the bass often carries the actual melody, thick " +
      "and upfront in a way punk's guitar-first mix never allowed. Vocals are typically deadpan " +
      "or half-spoken rather than shouted or sung sweet, and dub's cavernous reverb and echo get " +
      "used as compositional tools, not just atmosphere, alongside early drum machines and " +
      "synthesizers that read as cold rather than futuristic-glossy.",
    // Excluded — off-genre album despite a correct tag: the-cure
    // (Disintegration is 1989 goth/dream-pop, not the band's 1980–82 post-
    // punk run); nick-cave-and-the-bad-seeds (Let Love In is 1994 gothic
    // balladry, years past his post-punk Birthday Party era); wire (Pink
    // Flag is punk minimalism — our own emergedBasis for this genre cites
    // Wire's Chairs Missing, not Pink Flag, as the post-punk marker);
    // have-a-nice-life (Deathconsciousness is drone/doom); sleater-kinney
    // (Dig Me Out is riot-grrrl/indie-rock); the-clash (London Calling is
    // punk's genre-spanning landmark, not post-punk's angularity);
    // black-midi (Hellfire reads as math-rock/prog); fontaines-dc and idles
    // (Dogrel and Joy as an Act of Resistance are post-punk *revival*
    // rather than post-punk itself — this genre is a period genre, and the
    // grid stays entirely 1978–84 as a result).
    // Normalization pass: post-punk is one of the handful of genres that
    // genuinely carries 8 essential records, so this grid goes UP from 6 to
    // 8 rather than being cut — New Order and The Birthday Party added back
    // from the earlier cut-for-space list. Still cut for space: interpol,
    // women, parquet-courts, the-sound, the-chameleons, squid, editors.
    definingAlbums: [
      'joy-division',
      'gang-of-four',
      'siouxsie-and-the-banshees',
      'echo-and-the-bunnymen',
      'the-fall',
      'talking-heads',
      'new-order',
      'the-birthday-party',
      'the-cure',
    ],
    sections: [
      {
        title: 'The UK wave, 1976–1984',
        blurb:
          "The genre's founding scene — Manchester, London, and beyond — working out how far a " +
          "rock band could bend before it stopped being one.",
        artistIds: [
          'joy-division',
          'new-order',
          'the-cure',
          'siouxsie-and-the-banshees',
          'gang-of-four',
          'wire',
          'echo-and-the-bunnymen',
          'the-clash',
          'the-fall',
          'the-chameleons',
          'the-sound',
          'nick-cave-and-the-bad-seeds',
          'the-birthday-party',
        ],
      },
      {
        title: 'The 21st-century UK and Irish revival',
        blurb:
          "Three decades on, a new generation of UK and Irish bands picked the same angularity " +
          "back up — sharper production, but the same distrust of the comfortable chord change.",
        artistIds: ['fontaines-dc', 'idles', 'black-midi', 'squid', 'editors'],
      },
      {
        title: 'The American strand',
        blurb:
          "A smaller but real American lineage, running from Talking Heads' original CBGB-era " +
          "art-funk through a 2000s New York revival and into the genre's more recent noise and " +
          "riot-grrrl-adjacent corners.",
        artistIds: ['talking-heads', 'interpol', 'have-a-nice-life', 'sleater-kinney', 'women', 'parquet-courts'],
      },
    ],
  },

  'art-pop': {
    deck:
      "Pop songcraft filtered through art-school ambition — theatrical persona, unconventional " +
      "structure, and a studio treated as an instrument in its own right. Art-pop isn't a sound " +
      "so much as a stance: pop's hooks and pleasures, refusing to apologize for wanting to be " +
      "taken seriously as art.",
    originParagraphs: [
      "The label crystallized around 1979, when Talking Heads' Fear of Music and the emerging " +
        "art-pop wing of British music (Kate Bush chief among them, working outside this " +
        "graph) proved that conceptual ambition and chart appeal weren't opposites. David " +
        "Bowie had already spent the decade demonstrating the same thing — a different " +
        "persona and sonic palette per album, glam theater applied to genuinely strange music " +
        "— and Brian Eno, moving between Bowie's Berlin records and his own ambient " +
        "experiments, gave the whole idea a production philosophy: treat the studio as the " +
        "compositional instrument, not just the place you record one.",
      "What followed wasn't a scene so much as a standing invitation — any genre could be " +
        "run through art-pop's filter of persona, artifice, and structural unpredictability. " +
        "That elasticity is why the artists below span glam-rock elders, orchestral British " +
        "sophisti-pop, confessional singer-songwriters, and a large, distinctly 21st-century " +
        "wing built entirely out of electronic production.",
    ],
    soundParagraph:
      "Art-pop resists a single sonic signature — that's close to the point — but a few habits " +
      "recur across all four sections below: vocal delivery as performed character rather than " +
      "unguarded confession, song structures that avoid a straightforward verse-chorus-verse, " +
      "and production that stays audibly, deliberately artificial no matter the instrumentation " +
      "underneath it. An art-pop record almost never sounds like it was simply captured live in " +
      "a room.",
    // The hardest curation call in this batch — 32 tagged artists for a
    // still-generous 12 slots (three rows of four, appropriate for the
    // largest genre in this project). Excluded — off-genre album despite a
    // correct tag: pulp (Different Class is a Britpop record); vampire-
    // weekend (Modern Vampires of the City reads as indie rock/baroque
    // pop); ariel-pink (Before Today is hypnagogic pop, his own coined
    // micro-genre); broken-social-scene (You Forgot It in People is an
    // indie-rock/post-rock collective record).
    // Cut for space — genuinely art-pop, just short of the top 12:
    // stereolab, the-knife, sparks, arca, imogen-heap, fiona-apple,
    // destroyer's peers of-montreal, prefab-sprout, jockstrap, the-last-
    // dinner-party, everything-everything, sheena-ringo, magdalena-bay,
    // kero-kero-bonito, oklou, perfume-genius.
    definingAlbums: [
      'david-bowie',
      'brian-eno',
      'destroyer',
      'st-vincent',
      'the-blue-nile',
      'grizzly-bear',
      'weyes-blood',
      'julia-holter',
      'bjork',
      'grimes',
      'fka-twigs',
      'caroline-polachek',
    ],
    sections: [
      {
        title: 'The glam and art-rock lineage',
        blurb:
          "The throughline running from Bowie's persona-driven glam through Britpop's own art-" +
          "school wing and into a generation of 2010s guitar bands who kept the theatrical " +
          "instinct alive.",
        artistIds: [
          'david-bowie',
          'brian-eno',
          'destroyer',
          'pulp',
          'ariel-pink',
          'st-vincent',
          'vampire-weekend',
          'everything-everything',
          'the-last-dinner-party',
        ],
      },
      {
        title: 'Chamber and baroque pop',
        blurb:
          "Artists working with orchestration, arrangement, and collective studio-craft rather " +
          "than glam persona — sophisti-pop yearning, psych-pop collectives, and collage-built " +
          "records built more like compositions than performances.",
        artistIds: ['the-blue-nile', 'prefab-sprout', 'grizzly-bear', 'of-montreal', 'broken-social-scene', 'jockstrap'],
      },
      {
        title: 'Confessional art-pop',
        blurb:
          "Singer-songwriter intimacy stretched into art-pop's structural and production " +
          "ambition — the confessional lyric kept, the plain-folk arrangement discarded.",
        artistIds: ['fiona-apple', 'weyes-blood', 'julia-holter', 'perfume-genius'],
      },
      {
        title: 'Electronic art-pop',
        blurb:
          "The genre's largest and most contemporary wing — production-forward avant-pop where " +
          "the studio isn't just a tool but the entire compositional starting point.",
        artistIds: [
          'stereolab',
          'the-knife',
          'sparks',
          'arca',
          'caroline-polachek',
          'oklou',
          'bjork',
          'imogen-heap',
          'kero-kero-bonito',
          'fka-twigs',
          'sheena-ringo',
          'grimes',
          'magdalena-bay',
        ],
      },
    ],
  },

  ambient: {
    deck:
      "Music built from sustained tone and slow harmonic drift rather than rhythm or melody — " +
      "designed, in Brian Eno's own words, to be \"as ignorable as it is interesting.\" Ambient " +
      "has no real waves of its own; it's been a continuous, quietly expanding tradition since " +
      "the late 1970s.",
    originParagraphs: [
      "Brian Eno coined the term outright with 1978's Music for Airports, defining ambient in " +
        "the sleeve notes as music that could reward attention or ignore it entirely without " +
        "losing anything. The record itself grew out of his krautrock-adjacent collaborations " +
        "with Cluster and Harmonia earlier in the decade — the same German scene's patience and " +
        "distrust of verse-chorus form, stripped down further until rhythm disappeared almost " +
        "completely.",
      "Because it was never built around a scene or a single geography, ambient didn't have a " +
        "backlash or a revival — it just kept absorbing new tools. Digital sampling and granular " +
        "synthesis in the 1990s and 2000s gave it a second life without displacing the first, " +
        "and its own children — drone and trip-hop, both genres in their own right — split off " +
        "to chase specific pieces of what ambient does.",
    ],
    soundParagraph:
      "Sustained tones and slowly shifting harmony replace melody and rhythm as the main event " +
      "— a chord can hang, essentially unchanged, for minutes at a time. Percussion is minimal " +
      "or absent, texture matters more than any individual note, and the compositional tools are " +
      "often generative or process-based — tape loops, granular synthesis, systems set running " +
      "and left to unfold — rather than anything played start to finish by hand.",
    // Excluded — off-genre album despite a correct tag: burial (Untrue is
    // 2-step-rhythmed dubstep, not beatless ambient); four-tet (Rounds is
    // rhythmic folktronica, not ambient); sigur-ros (Ágætis byrjun is a
    // full-band post-rock record with real song structure and dynamic
    // crescendos, not ambient's textural drift); boards-of-canada and
    // aphex-twin (both IDM records more than ambient ones — Aphex Twin in
    // particular is IDM's own central node and shouldn't anchor two grids).
    // Normalization pass: cut from 7 to 4. Steve Roach, Grouper, and 2814
    // all dropped — genuine picks, but the four kept here are the founding
    // pair (Eno, Budd) plus the two most critically load-bearing modern
    // drone-ambient records. This does undo 2814's earlier addition (it had
    // been the grid's only vaporwave representative) — vaporwave now has
    // its own dedicated page instead, which is the more honest home for it.
    definingAlbums: [
      'brian-eno',
      'harold-budd',
      'tim-hecker',
      'stars-of-the-lid',
      'grouper',
    ],
    sections: [
      {
        title: 'Founding minimalism',
        blurb:
          "The genre's originators, working out what music with almost nothing happening in it " +
          "could still do.",
        artistIds: ['brian-eno', 'harold-budd', 'steve-roach'],
      },
      {
        title: 'Drone and atmosphere',
        blurb:
          "Ambient pushed toward its heaviest, most physical extreme — long-form drone, " +
          "industrial-adjacent texture, and post-rock's widescreen calm.",
        artistIds: ['tim-hecker', 'stars-of-the-lid', 'coil', 'grouper', 'sigur-ros'],
      },
      {
        title: 'The digital generation',
        blurb:
          "Ambient remade with samplers, granular synthesis, and — in its most recent, internet-" +
          "native corner — the chopped-and-slowed nostalgia of vaporwave.",
        artistIds: [
          'aphex-twin',
          'boards-of-canada',
          'burial',
          'oneohtrix-point-never',
          'four-tet',
          'deaths-dynamic-shroud',
          '2814',
        ],
      },
    ],
  },

  'hardcore-punk': {
    deck:
      "Punk sped up, stripped down, and made even more hostile to the mainstream — shorter " +
      "songs, faster tempos, and a DIY touring circuit built out of necessity after almost no " +
      "club would book the bands. Hardcore is where punk's original confrontation got even more " +
      "literal.",
    originParagraphs: [
      "Black Flag's Nervous Breakdown EP in 1980 set the template: songs under two minutes, " +
        "barked vocals, and a relentless, self-booked national touring circuit that ran through " +
        "basements and VFW halls because nothing else was available. That DIY infrastructure — " +
        "more than any single sound — is what actually defines the genre; it's how a scene this " +
        "confrontational sustained itself without radio or major labels.",
      "A parallel, tightly connected scene was doing much the same thing in Washington, DC, " +
        "centered on Ian MacKaye's Dischord label and Minor Threat's straight-edge discipline. " +
        "Hardcore's most direct descendants — post-hardcore and emo, both genres in this graph " +
        "in their own right — grew straight out of these same DC and LA circles. Its wider " +
        "downstream, pop-punk and metalcore, is real but deliberately outside this graph's scope.",
    ],
    soundParagraph:
      "Tempos run faster than punk's and songs run shorter, often under two minutes, built from " +
      "a narrow vocabulary of downstroked power chords rather than anything melodic. Vocals are " +
      "barked or shouted rather than sung, drums drive at or near a constant sprint, and the " +
      "production aesthetic favors a live-in-a-room rawness over polish — the recording is meant " +
      "to sound like the show, not improve on it.",
    // No off-genre exclusions here — every hardcore-punk-tagged artist's
    // classicAlbum genuinely is a hardcore record (this genre's data is
    // clean). Cut for space: minutemen (Double Nickels on the Dime stretches
    // far enough into punk-jazz to read as less purely hardcore-defining),
    // husker-du (Zen Arcade is the genre's own melodic turn away from
    // itself), refused (The Shape of Punk to Come is 1998, already post-
    // hardcore), rites-of-spring, nomeansno.
    // Normalization pass: cut from 6 to 4. Descendents and Turnstile both
    // dropped — real picks, but by pure historical-canon weight the four
    // kept here (Black Flag, Bad Brains, Minor Threat, Dead Kennedys) are
    // hardcore's actual four cornerstone records. This does undo Turnstile's
    // earlier addition, which had been the grid's only 21st-century record
    // — the page is now weighted entirely toward the 1980s wave again, a
    // real tradeoff worth naming rather than hiding.
    definingAlbums: ['black-flag', 'bad-brains', 'minor-threat', 'dead-kennedys'],
    sections: [
      {
        title: 'DC and its lineage',
        blurb:
          "Ian MacKaye's Dischord scene and the straight-edge discipline it built — a lineage " +
          "that runs unbroken enough to reach Turnstile's Baltimore-adjacent update decades " +
          "later.",
        artistIds: ['minor-threat', 'rites-of-spring', 'bad-brains', 'turnstile'],
      },
      {
        title: 'LA and the SST circuit',
        blurb:
          "Greg Ginn's SST Records and the Southern California scene that built hardcore's " +
          "national touring circuit out of nothing.",
        artistIds: ['black-flag', 'minutemen', 'descendents'],
      },
      {
        title: 'Beyond the coasts',
        blurb:
          "Hardcore took hold everywhere the touring circuit reached — San Francisco, " +
          "Minneapolis, Vancouver, Umeå — proof the sound never needed a single hometown.",
        artistIds: ['dead-kennedys', 'husker-du', 'nomeansno', 'refused'],
      },
    ],
  },

  hyperpop: {
    deck:
      "Pop pushed past the point of good taste on purpose — pitched-up vocals, deliberately " +
      "abrasive compression, and a maximalist, internet-native production style that treats " +
      "genre boundaries as something to splice through mid-song rather than respect.",
    originParagraphs: [
      "The term traces to PC Music, the London collective A.G. Cook founded in 2013 to make " +
        "pop music that was sincere and satirical at the same time — bubblegum melodies run " +
        "through aggressively synthetic, almost painful production. SOPHIE was there from " +
        "nearly the start, and her solo work pushed the label's ideas into something stranger " +
        "and more physical, closer to body horror than pop parody.",
      "A second wave arrived once Spotify's own \"hyperpop\" playlist gave the loose, internet-" +
        "native scene around Discord and SoundCloud a name and an audience it hadn't asked for " +
        "— artists who'd been making what they called digicore or just their own thing found " +
        "themselves filed under the same label as PC Music's much more deliberate art project.",
    ],
    soundParagraph:
      "Vocals are pitched up into a helium register or chopped and stacked into inhuman " +
      "harmonies, and compression is pushed until clipping and digital artifacts become part of " +
      "the sound rather than a flaw to fix. Songs favor abrupt structural whiplash — a beat, " +
      "key, or entire genre can lurch sideways mid-track — over the sustained, dance-club groove " +
      "its production techniques originally came from.",
    // Excluded — off-genre album despite a correct tag: charli-xcx (Brat is
    // a 2024 minimalist club-pop/electropop record with none of the pitched-
    // up, deliberately-clipped hallmarks described above; her actual
    // hyperpop-defining work, Pop 2 and Vroom Vroom, isn't the classicAlbum
    // on file). Slayyyter dropped — real but a notch below the other 6.
    // Normalization pass: cut from 6 to 4 — Jane Remover and Ninajirachi
    // dropped, leaving the PC Music pair plus the two records (100 gecs,
    // underscores) that carry the digicore generation's actual breakout
    // moments.
    definingAlbums: ['sophie', 'a-g-cook', '100-gecs', 'underscores'],
    sections: [
      {
        title: 'PC Music and its circle',
        blurb:
          "The genre's original, more deliberate art-project wing, centered on A.G. Cook's label " +
          "and the artists closest to it.",
        artistIds: ['sophie', 'a-g-cook', 'charli-xcx', 'slayyyter'],
      },
      {
        title: 'The digicore generation',
        blurb:
          "A looser, younger, internet-native second wave — Discord and SoundCloud rather than " +
          "a London studio — that absorbed the hyperpop label after the fact.",
        artistIds: ['100-gecs', 'underscores', 'jane-remover', 'ninajirachi'],
      },
    ],
  },

  krautrock: {
    deck:
      "West Germany's postwar generation refusing to inherit Anglo-American blues-rock — hypnotic, " +
      "motorik rhythm and studio experimentation in its place. Krautrock is a single, compact " +
      "scene, but its downstream runs through nearly every electronic genre in this graph.",
    originParagraphs: [
      "Can and Amon Düül both formed in 1968, assembled out of a generation with one foot in " +
        "experimental composition — Can's Irmin Schmidt and Holger Czukay had studied under " +
        "Karlheinz Stockhausen — and no interest in reproducing American or British rock's blues " +
        "scales and song forms. Neu! (1971) and Faust (also 1971) pushed the same instinct " +
        "toward starker extremes: Neu! down to a single relentless drumbeat, Faust into tape " +
        "collage and studio demolition.",
      "Kraftwerk started in this same scene before moving fully electronic, and that pivot is " +
        "the real hinge of krautrock's legacy — synth-pop, ambient, and industrial all descend " +
        "from it directly, with IDM, hyperpop, and post-rock several steps further down the same " +
        "tree. The scene itself was brief and German, but its motorik pulse resurfaced decades " +
        "later in artists like Stereolab, Tortoise, and Squid, none of whom were within a " +
        "generation of the original bands.",
    ],
    soundParagraph:
      "The defining rhythm is the motorik beat — a steady, mechanical 4/4 pulse with almost no " +
      "fills, played more like a machine than a drummer — laid under music that avoids blues-" +
      "scale soloing and verse-chorus structure in favor of long, hypnotic vamping on a single " +
      "idea. Synthesizers and tape manipulation were treated as compositional tools from the " +
      "start, not embellishments added to a guitar-band template.",
    // The cleanest illustration of the album-vs-artist test in this batch:
    // stereolab, tortoise, and squid are exactly the "heirs, not
    // participants" the section blurb below describes, and none of their
    // classicAlbums is itself a krautrock record. Stereolab's Dots and Loops
    // is a lounge/post-rock/art-pop hybrid (it's on art-pop's own list
    // instead); Tortoise's TNT is post-rock's own genre-defining album;
    // Squid's Bright Green Field is post-punk/art-rock. That leaves exactly
    // the 4 actual 1968–73 originators — no padding was needed to get there.
    definingAlbums: ['kraftwerk', 'can', 'neu', 'faust'],
    sections: [
      {
        title: 'The scene and its heirs',
        blurb:
          "Can, Neu!, and Faust are the actual 1968–73 originators, all German and all working " +
          "within a few years of each other; Kraftwerk started alongside them before turning " +
          "fully electronic. Stereolab, Tortoise, and Squid arrived decades later and from " +
          "entirely different countries, absorbing the motorik pulse as an influence rather than " +
          "living inside the original scene — heirs, not participants.",
        artistIds: ['kraftwerk', 'can', 'neu', 'faust', 'stereolab', 'tortoise', 'squid'],
      },
    ],
  },

  punk: {
    deck:
      "Rock and roll stripped back to its studs — three chords, two-minute songs, and a sneer " +
      "where a guitar solo used to go. Punk arrived in 1976 on both sides of the Atlantic within " +
      "months of the other, and burned through its own novelty almost as fast as it caught on.",
    originParagraphs: [
      "Ramones' self-titled debut, released in early 1976, did the actual stripping-back: " +
        "fourteen songs in under thirty minutes, no solos, a cartoon-simple production aesthetic " +
        "that made a studio album sound like a garage rehearsal. The Sex Pistols arrived that " +
        "same year from a different instinct entirely — less musical minimalism than pure " +
        "confrontation, built around Johnny Rotten's sneer and Malcolm McLaren's gift for " +
        "provocation.",
      "New York's CBGB scene (Patti Smith's Horses, a year earlier in 1975, already fusing " +
        "punk's rawness with beat poetry) and London's art-school and working-class scenes " +
        "developed in parallel rather than in sequence — Buzzcocks brought real melody to the " +
        "template, X-Ray Spex brought a saxophone. Punk's most direct descendant, hardcore, sped " +
        "the tempo up and stripped the songs down even further within a few years — that story " +
        "belongs to hardcore-punk's own page rather than a repeat here.",
    ],
    soundParagraph:
      "The chord vocabulary rarely goes past simple major-key power chords played at a driving, " +
      "straight-eighth tempo, and songs stay short — two minutes is generous, not stingy. Vocals " +
      "are sneered, shouted, or barked rather than sung pretty, guitar solos are mostly absent on " +
      "principle, and the production aesthetic favors an unpolished, almost deliberately " +
      "amateurish rawness that hardcore would later push even further.",
    // Excluded — off-genre album despite a correct tag: idles (Joy as an Act
    // of Resistance is post-punk, already claimed on that page); fugazi
    // (Repeater is post-hardcore, claimed on that page); jeff-rosenstock
    // (WORRY. is modern DIY punk, real but a notch below the others);
    // bratmobile, mudhoney (genuine candidates, cut for space).
    // Sex Pistols led with Never Mind the Bollocks once the band's
    // bio/classicAlbum content was written (it previously had none — see
    // the old note this replaced); Buzzcocks dropped from the grid to make
    // room, though Buzzcocks stays tagged and still appears in the UK
    // section below.
    definingAlbums: [
      'sex-pistols',
      'ramones',
      'the-clash',
      'patti-smith',
      'fugazi',
      'wire',
    ],
    sections: [
      {
        title: 'The first wave, UK',
        blurb:
          "The London and Manchester scene — three chords and a confrontation, equal parts " +
          "art-school irony and working-class fury.",
        artistIds: ['the-clash', 'buzzcocks', 'wire', 'x-ray-spex', 'sex-pistols'],
      },
      {
        title: 'The first wave, US',
        blurb:
          "A parallel American strand, running from Detroit's proto-punk holdouts through CBGB's " +
          "poetry-inflected scene to the Pacific Northwest, where Wipers were laying groundwork " +
          "grunge would later borrow wholesale.",
        artistIds: ['patti-smith', 'ramones', 'mc5', 'wipers'],
      },
      {
        title: "Punk's later inheritors",
        blurb:
          "Hardcore — Black Flag, Bad Brains, Minor Threat, Dead Kennedys — is punk's most direct " +
          "and best-known descendant, and it gets a full page of its own rather than a repeat " +
          "here. This is everything else that carried punk's tag forward: riot grrrl's feminist " +
          "second wave, a grunge crossover, and two artists (Fugazi, IDLES) who show up more " +
          "fully on post-hardcore's and post-punk's own pages.",
        artistIds: ['idles', 'fugazi', 'jeff-rosenstock', 'bikini-kill', 'bratmobile', 'mudhoney'],
      },
    ],
  },

  'post-hardcore': {
    deck:
      "Hardcore's own art-school turn — the same DIY intensity, aimed at something more " +
      "structurally adventurous than a two-minute blast. Post-hardcore kept the volume and the " +
      "confrontation but let in dissonance, start-stop dynamics, and songs that don't " +
      "necessarily resolve.",
    originParagraphs: [
      "Big Black's Atomizer (1986) and Rites of Spring's self-titled EP (1985) — the latter a " +
        "Dischord release by musicians who'd already been through DC's hardcore scene once — " +
        "pointed in different but related directions: Big Black toward mechanized, " +
        "industrial-tinged noise, Rites of Spring toward something more emotionally exposed. " +
        "That second direction eventually split off entirely into emo, covered on its own page; " +
        "this one follows the harder, more angular half of the split.",
      "The Dischord label kept threading through the genre's next decade via Fugazi, while an " +
        "entirely separate noise-rock-adjacent scene in Chicago (Steve Albini's Big Black, then " +
        "The Jesus Lizard) and math-rock-inflected bands in Louisville (Slint) and San Diego " +
        "(Drive Like Jehu) pushed the sound in harder, more dissonant directions with little " +
        "direct contact between them.",
    ],
    soundParagraph:
      "Start-stop dynamics replace punk's straight-through drive — a song can lurch from " +
      "near-silence to full volume without warning, often more than once. Guitars favor " +
      "dissonant, non-blues intervals and rhythmic tension over riffs, vocals range from a " +
      "talk-singing near-monotone to a full scream, and the mood stays tense and controlled even " +
      "at full volume — more clenched fist than release.",
    // Excluded — already claimed elsewhere: minor-threat (Complete
    // Discography is hardcore, not post-hardcore — it's the record hardcore
    // came FROM, and it's already hardcore-punk's own DC-lineage pick);
    // turnstile (Glow On is already used, prominently, on hardcore-punk's
    // page — reusing it here felt like leaning on the same handful of
    // records rather than curating this page on its own terms). Brand New
    // and La Dispute reserved for emo's own definingAlbums instead. Cut for
    // space: unwound, nomeansno, the-dismemberment-plan.
    definingAlbums: [
      'fugazi',
      'big-black',
      'at-the-drive-in',
      'slint',
      'drive-like-jehu',
      'the-jesus-lizard',
      'refused',
      'trail-of-dead',
      'rites-of-spring',
    ],
    sections: [
      {
        title: 'The Dischord wing',
        blurb:
          "Ian MacKaye's DC label stayed the genre's throughline for a decade — Fugazi took " +
          "hardcore's discipline and slowed it into something more dub-influenced and " +
          "controlled, while The Dismemberment Plan pushed the same scene toward something " +
          "quirkier and more danceable.",
        artistIds: ['rites-of-spring', 'fugazi', 'minor-threat', 'the-dismemberment-plan'],
      },
      {
        title: 'Noise and math-rock crossover',
        blurb:
          "The genre's harder, more dissonant wing — Chicago noise (Big Black, The Jesus " +
          "Lizard), Louisville and San Diego's math-rock-adjacent bands (Slint, Drive Like " +
          "Jehu), and a scattering of others who arrived at the same jagged intensity " +
          "independently.",
        artistIds: [
          'slint',
          'drive-like-jehu',
          'the-jesus-lizard',
          'unwound',
          'big-black',
          'at-the-drive-in',
          'trail-of-dead',
          'nomeansno',
          'refused',
        ],
      },
      {
        title: 'The modern chapter',
        blurb:
          "Post-hardcore's most recent, genre-blurring update — Turnstile folds in R&B and " +
          "shoegaze without losing the genre's physical intensity.",
        artistIds: ['turnstile'],
      },
      {
        title: 'Into emo',
        blurb:
          "Where post-hardcore's angularity turns melodic and confessional. These three carry " +
          "both tags, and the fuller story of that turn is told on emo's own page.",
        artistIds: ['far-apart', 'brand-new', 'la-dispute'],
      },
    ],
  },

  emo: {
    deck:
      "Post-hardcore's melodic, confessional turn — the same DC-and-Dischord DNA, redirected " +
      "from political anger toward something more personal and unguarded. Emo traded " +
      "post-hardcore's clenched-fist tension for open emotional vulnerability, often over the " +
      "same basic chord voicings.",
    originParagraphs: [
      "Rites of Spring's 1985 Dischord EP is retroactively cited as the genre's true starting " +
        "point — hardcore's speed and intensity turned toward heartbreak and vulnerability " +
        "instead of politics — but the name itself didn't stick until Sunny Day Real Estate's " +
        "Diary in 1994, an album that gave the emotional intensity a more melodic, less " +
        "hardcore-indebted sound.",
      "A whole second generation grew up around Champaign-Urbana and Chicago in the mid-90s — " +
        "American Football and Cap'n Jazz chief among them — building a specific, " +
        "twinkly-guitar variant that would eventually earn its own name, midwest emo, and its " +
        "own page on this site. This page stays with emo more broadly: its DC origins, its " +
        "Diary-era self-definition, and the wider 2000s scene that grew out of both.",
    ],
    soundParagraph:
      "Vocals carry the emotional weight directly — often more shouted-sung than technically " +
      "pretty, prioritizing rawness of feeling over polish. Guitars frequently pair clean, " +
      "arpeggiated or twinkling patterns with distorted crescendos, song structures build toward " +
      "a cathartic peak rather than repeating a chorus, and lyrics stay specific and diaristic " +
      "rather than universal.",
    // American Football and Cap'n Jazz deliberately left without album
    // representation here — both are real candidates, but midwest emo gets
    // its own page in a later batch and they're its two headline names.
    // Jeff Rosenstock excluded (WORRY. is closer to punk, already
    // considered there); La Dispute and Far Apart reserved for
    // post-hardcore's own framing of the overlap; Christie Front Drive cut
    // for space.
    definingAlbums: ['rites-of-spring', 'sunny-day-real-estate', 'brand-new', 'get-up-kids'],
    sections: [
      {
        title: 'The founding wave',
        blurb:
          "The two records that define the genre's before-and-after: Rites of Spring's raw " +
          "hardcore-turned-confessional EP, and Sunny Day Real Estate's Diary, the album that " +
          "gave the sound its name.",
        artistIds: ['rites-of-spring', 'sunny-day-real-estate'],
      },
      {
        title: 'The midwest emo wing',
        blurb:
          "A specific, twinkly-guitar Midwestern strand grew up alongside and after the DC " +
          "originators — American Football and Cap'n Jazz are its best-known names, and get a " +
          "fuller telling once midwest emo has its own page. This is everything else emo grew " +
          "into once the sound spread beyond DC: 2000s mainstream emo, DIY punk crossover, and " +
          "the genre's heavier, more recent turns.",
        artistIds: [
          'american-football',
          'cap-n-jazz',
          'far-apart',
          'brand-new',
          'la-dispute',
          'jeff-rosenstock',
          'get-up-kids',
          'christie-front-drive',
        ],
      },
    ],
  },

  'noise-rock': {
    deck:
      "Rock instrumentation pushed toward noise — detuned or heavily processed guitars, feedback " +
      "treated as a compositional element rather than an accident, and song structures that " +
      "often abandon verse-chorus form entirely. Noise-rock grew directly out of no-wave's " +
      "confrontational art-scene minimalism and spent the next two decades spreading into nearly " +
      "every corner of American underground rock.",
    originParagraphs: [
      "No New York (1978), Brian Eno's document of four confrontational New York bands, is the " +
        "genre's actual point of origin, even though the term \"noise-rock\" wasn't applied " +
        "until Sonic Youth and Swans took the same instincts and stretched them across full " +
        "albums rather than art-scene singles in the early 1980s.",
      "By the mid-to-late 1980s the sound had split in two directions at once — Chicago's " +
        "Steve-Albini-produced scene (Big Black, The Jesus Lizard) pushed it toward mechanized " +
        "brutality, while a wider American underground (Pixies, Dinosaur Jr., Sonic Youth " +
        "themselves) folded noise-rock's dissonance into something closer to conventional song " +
        "structure, feeding directly into what the mainstream would later call alternative rock.",
    ],
    soundParagraph:
      "Guitars are frequently detuned, played with unconventional objects, or run through heavy " +
      "distortion and feedback used as a compositional layer rather than an accident to avoid. " +
      "Song structure often drifts from standard verse-chorus form toward extended noise " +
      "passages or sudden dynamic shifts, and vocals range from a flat, deadpan drawl to an " +
      "unhinged scream — rarely anything in between.",
    // The batch's broadest genre, and it holds together only via a 4-way
    // split, similar to art-pop's own breadth. Excluded — off-genre album
    // despite a correct tag: swans (Soundtracks for the Blind, 1996, is
    // later-era drone/industrial-ambient, not the band's noise-rock-
    // defining early work); wipers (Is This Real? is melodic punk, already
    // used on punk's own page); mogwai (post-rock is the better home,
    // claimed there instead); black-flag (hardcore-punk already covers this
    // artist in full). Mars excluded as a duplicate of Teenage Jesus and
    // the Jerks' shared No New York compilation credit. Cut for space:
    // yo-la-tengo, superchunk, unwound, trail-of-dead, blonde-redhead,
    // black-midi — all real, all already claimed or better-represented
    // elsewhere.
    definingAlbums: ['sonic-youth', 'pixies', 'dinosaur-jr', 'big-black', 'the-jesus-lizard', 'mudhoney', 'women', 'dna'],
    sections: [
      {
        title: 'No wave origins',
        blurb:
          "The four bands on 1978's No New York compilation — three of them here — did the " +
          "actual founding, years before anyone called it noise-rock.",
        artistIds: ['teenage-jesus-and-the-jerks', 'mars', 'dna'],
      },
      {
        title: 'The American 80s wave',
        blurb:
          "The generation that gave the genre its name, stretching no-wave's confrontation " +
          "across full albums — Sonic Youth and Swans in New York, Big Black and The Jesus " +
          "Lizard in Chicago, Wipers on their own in Portland.",
        artistIds: ['sonic-youth', 'swans', 'big-black', 'the-jesus-lizard', 'wipers'],
      },
      {
        title: 'College rock crossover',
        blurb:
          "Noise-rock folded into the wider American college-rock underground — the dissonance " +
          "stayed, but real pop songcraft came with it.",
        artistIds: ['pixies', 'dinosaur-jr', 'yo-la-tengo', 'mudhoney', 'superchunk', 'women'],
      },
      {
        title: 'Where noise-rock blurs',
        blurb:
          "Artists for whom noise-rock is one real ingredient among several — post-hardcore, " +
          "post-rock, dream-pop, and art-rock all get fuller tellings on their own pages.",
        artistIds: ['unwound', 'trail-of-dead', 'mogwai', 'blonde-redhead', 'black-midi', 'black-flag'],
      },
    ],
  },

  'synth-pop': {
    deck:
      "Pop songwriting rebuilt entirely from synthesizers and drum machines — melodic, " +
      "danceable, and deliberately cold-sounding at first, before the coldness itself became a " +
      "kind of romance. Synth-pop's whole toolkit descends directly from Kraftwerk's own pivot " +
      "to electronics a few years earlier.",
    originParagraphs: [
      "Kraftwerk had already spent most of the 1970s proving a band could be built entirely " +
        "from synthesizers, but synth-pop as its own genre dates to 1978, when Gary Numan's " +
        "early singles and The Human League's earliest lineup started writing actual pop songs " +
        "— verses, choruses, hooks — with that same electronic toolkit rather than treating it " +
        "as an avant-garde instrument.",
      "The genre split almost immediately into two audiences: a colder, more art-damaged wing " +
        "(Numan's own persona, later The Knife and Sparks' theatrical reinvention) and a " +
        "warmer, chart-facing one (The Human League's Dare, Depeche Mode's eventual " +
        "stadium-scale run, OMD). Both descend from the same krautrock pivot, and the genre has " +
        "kept absorbing new tools ever since — its own child, IDM, split off in the 1990s to " +
        "chase the more experimental end specifically.",
    ],
    soundParagraph:
      "Synthesizers and drum machines aren't embellishment here, they're the entire " +
      "instrumentation — real drums and guitars are rare or absent. Melodies stay direct and " +
      "hook-forward despite the electronic palette, basslines are often the most propulsive " +
      "element in the mix, and vocals range from detached and deadpan (the genre's early, " +
      "colder mode) to full pop belting (its later, warmer one).",
    // Excluded — off-genre album despite a correct tag: sparks (Kimono My
    // House, 1974, is glam rock — years before the band's synth-pop-era
    // Moroder collaboration that actually earns them this tag). Grimes and
    // Magdalena Bay left for art-pop's own page, where their albums are
    // already claimed. Cut for space: porter-robinson, sharon-van-etten,
    // george-clanton.
    definingAlbums: ['new-order', 'depeche-mode', 'the-human-league', 'omd', 'gary-numan', 'the-knife', 'hot-chip', 'the-postal-service'],
    sections: [
      {
        title: 'The founding wave, 1978–1983',
        blurb:
          "The genre's first chart-facing generation — some (Numan, The Human League's early " +
          "records) colder and more art-damaged, others (OMD, Depeche Mode, New Order arriving " +
          "from post-punk) building toward something warmer and more danceable.",
        artistIds: ['gary-numan', 'the-human-league', 'omd', 'new-order', 'depeche-mode'],
      },
      {
        title: 'Art-damaged synth-pop',
        blurb:
          "A theatrical, deliberately strange strand — Sparks predates synth-pop by years but " +
          "found a second life within it; The Knife pushed the genre's coldness toward outright " +
          "menace.",
        artistIds: ['the-knife', 'sparks'],
      },
      {
        title: 'The 2000s–2010s revival',
        blurb:
          "A generation of indietronica and internet-native artists rediscovered the genre's " +
          "warmth, often filtered through nostalgia for its own earliest records.",
        artistIds: ['hot-chip', 'the-postal-service', 'george-clanton'],
      },
      {
        title: 'Where synth-pop blurs',
        blurb:
          "Artists for whom synth-pop is one ingredient rather than a home genre — EDM, " +
          "art-pop, and folk-turned-electronic all get fuller tellings elsewhere on this site.",
        artistIds: ['porter-robinson', 'grimes', 'magdalena-bay', 'sharon-van-etten'],
      },
    ],
  },

  'lo-fi': {
    deck:
      "Music that treats its own recording limitations as a feature rather than an obstacle — " +
      "four-track tape hiss, off-mic vocals, and deliberately rough edits left audibly in place. " +
      "Lo-fi is a recording aesthetic first and a songwriting style second, distinct from — " +
      "though closely related to — indie-pop's more polished melodic tradition.",
    originParagraphs: [
      "Pavement's Slanted and Enchanted, Guided by Voices' early cassette-only records, and " +
        "Sebadoh's home-4-track output all arrived within a couple of years of each other in " +
        "the early 1990s, none of them coordinating with the others, all of them treating a " +
        "Portastudio's limitations as an aesthetic choice rather than a budget compromise — " +
        "Robert Pollard and Lou Barlow in particular built entire discographies almost entirely " +
        "out of that constraint.",
      "The aesthetic never really went away — a second American generation (Alex G, Car Seat " +
        "Headrest, Mac DeMarco) picked it back up in the Bandcamp and early-streaming era, this " +
        "time as a deliberate throwback rather than a genuine budget limitation, and the tag now " +
        "also covers artists for whom it's one texture among several rather than a whole " +
        "identity.",
    ],
    soundParagraph:
      "The recording chain itself is audible — tape hiss, room noise, a vocal that's slightly " +
      "too quiet or too close to the mic, an edit or a mistake left in rather than fixed. Song " +
      "structures are usually simple and melodic underneath the noise floor, arrangements stay " +
      "minimal by necessity as much as choice, and the rough surface is the point rather than " +
      "something a bigger budget would have sanded off.",
    // Excluded — off-genre album despite a correct tag: beck (Sea Change is
    // his lushest, most orchestrated record — the opposite of lo-fi; his
    // actual 4-track work isn't the classicAlbum on file). Pavement,
    // Sebadoh, Guided by Voices, and Car Seat Headrest's albums stay here
    // rather than also appearing on indie-pop's page, where these same four
    // artists are deliberately framed as a secondary "American wing" rather
    // than given their own album cards. Cut for space: mj-lenderman.
    definingAlbums: ['pavement', 'sebadoh', 'guided-by-voices', 'liz-phair', 'olivia-tremor-control', 'alex-g', 'mac-demarco', 'car-seat-headrest'],
    sections: [
      {
        title: 'The American 90s wave',
        blurb:
          "The genre's actual founding generation, all working within a couple of years of each " +
          "other without much direct contact — home-4-track recording as a genuine budget " +
          "necessity that became a defining sound.",
        artistIds: ['pavement', 'sebadoh', 'guided-by-voices', 'liz-phair', 'beck', 'olivia-tremor-control'],
      },
      {
        title: 'The 2010s bedroom revival',
        blurb:
          "A second generation picked the aesthetic back up in the Bandcamp era, this time as a " +
          "deliberate choice rather than a real constraint.",
        artistIds: ['alex-g', 'mac-demarco', 'car-seat-headrest', 'mj-lenderman'],
      },
      {
        title: 'Where lo-fi blurs',
        blurb:
          "Artists for whom the lo-fi recording aesthetic is one real ingredient rather than a " +
          "home genre — shoegaze, hypnagogic pop, and alt-country all get fuller tellings on " +
          "their own pages.",
        artistIds: ['parannoul', 'panchiko', 'ariel-pink', 'songs-ohia'],
      },
    ],
  },

  'post-rock': {
    deck:
      "Rock instrumentation used to build long, largely instrumental compositions that borrow " +
      "structure from classical music or electronic production rather than the verse-chorus " +
      "song. Post-rock's origin story is genuinely contested — two very different 1991 albums, " +
      "and a critic's term coined three years later reviewing neither of them.",
    originParagraphs: [
      "Talk Talk's Laughing Stock and Slint's Spiderland both arrived in 1991, from opposite " +
        "directions — Talk Talk had spent the 1980s as an increasingly art-damaged pop band " +
        "before dissolving into something closer to free-form chamber music, while Slint (whose " +
        "own fuller story belongs to post-hardcore's page) built something tense and " +
        "math-rock-adjacent out of hardcore's leftover intensity. Neither record used the words " +
        "\"post-rock,\" and neither band stuck around to see what came next.",
      "Simon Reynolds coined the actual term in 1994, reviewing Bark Psychosis's Hex — a " +
        "British band self-consciously building on exactly the two records above. From there " +
        "the genre split into a few real camps: a Montreal-centered, string-and-crescendo school " +
        "around Godspeed You! Black Emperor; a widescreen, festival-friendly mode (Mogwai, " +
        "Sigur Rós, Explosions in the Sky) that's probably what most listeners picture when they " +
        "hear the term; and a more rhythmic, jazz-inflected strand (Tortoise) that owes as much " +
        "to krautrock and dub as to Talk Talk.",
    ],
    soundParagraph:
      "Compositions are usually long — five minutes is short by this genre's standards — and " +
      "mostly or entirely instrumental, built on repetition and gradual dynamic build rather " +
      "than a sung verse-chorus structure. A quiet, contemplative passage will often erupt into " +
      "a distorted, cathartic climax and back down again, sometimes more than once per song, and " +
      "studio production itself — reverb, layering, careful mixing — is as compositionally " +
      "important as any single instrument.",
    // Resolves two tensions flagged in earlier batches: Sigur Rós's Ágætis
    // byrjun was excluded from ambient's definingAlbums specifically because
    // it's a post-rock record, and Tortoise's TNT was excluded from
    // krautrock's for the same reason — both land here instead, on their
    // actual home page. Excluded here: spiritualized, toe, black-country-
    // new-road (all real, but post-rock is a secondary ingredient for each,
    // not their primary identity). Cut for space: mono, do-make-say-think,
    // dirty-three.
    definingAlbums: [
      'talk-talk',
      'this-heat',
      'bark-psychosis',
      'godspeed-you-black-emperor',
      'mogwai',
      'sigur-ros',
      'explosions-in-the-sky',
      'tortoise',
      'swans',
      'slint',
    ],
    sections: [
      {
        title: 'The originators, 1979–1994',
        blurb:
          "This Heat's 1981 Deceit predates the genre by a decade; Talk Talk's Laughing Stock " +
          "and Bark Psychosis's Hex — the album that gave the genre its name — did the actual " +
          "founding a decade later.",
        artistIds: ['this-heat', 'talk-talk', 'bark-psychosis', 'slint'],
      },
      {
        title: 'Crescendo and widescreen post-rock',
        blurb:
          "The mode most people picture when they hear \"post-rock\" — long, mostly wordless " +
          "builds from near-silence to distorted catharsis, whether from Montreal's " +
          "string-laden orchestras, Scotland's and Iceland's more guitar-forward versions, or " +
          "Japan's own widescreen answer to both.",
        artistIds: ['godspeed-you-black-emperor', 'mogwai', 'sigur-ros', 'explosions-in-the-sky', 'do-make-say-think', 'mono'],
      },
      {
        title: 'Rhythmic and jazz-inflected post-rock',
        blurb:
          "A groove-driven alternative to the crescendo model, owing as much to krautrock, dub, " +
          "and jazz as to Talk Talk's chamber-pop dissolution.",
        artistIds: ['tortoise', 'dirty-three'],
      },
      {
        title: 'Where post-rock blurs',
        blurb:
          "Artists for whom post-rock is one real ingredient rather than a home genre — " +
          "space-rock, no-wave, math-rock, and chamber-pop all get fuller tellings on their own pages.",
        artistIds: ['swans', 'spiritualized', 'toe', 'black-country-new-road'],
      },
    ],
  },

  'indie-pop': {
    deck:
      "Melodic, guitar-led pop that treats an unpolished, un-slick recording as a badge of honor " +
      "— the tradition running from Scotland's Postcard Records and the C86 cassette through The " +
      "Smiths and into an enormous, still-expanding present. Indie-pop is broad enough to " +
      "contain jangle-pop, much of dream-pop, and lo-fi's own American wing rather than standing " +
      "apart from any of them.",
    originParagraphs: [
      "Glasgow's Postcard Records (Orange Juice, Aztec Camera) had already made a case for " +
        "melodic, unpretentious guitar pop as an alternative to post-punk's angularity when the " +
        "NME's C86 cassette compilation gave the wider movement a name and a scene in 1986. The " +
        "Smiths, forming in Manchester in 1982 and releasing their debut the following year, " +
        "weren't strictly part of either scene but became the genre's defining reference point " +
        "almost immediately — Johnny Marr's jangling, melodic guitar work paired with " +
        "Morrissey's literate, miserable persona.",
      "The sound crossed the Atlantic almost immediately and mutated on contact — American " +
        "college radio built its own, rougher-edged version around R.E.M.'s jangle and, a few " +
        "years later, Pavement and Sebadoh's four-track lo-fi (lo-fi gets its own fuller page as " +
        "a recording aesthetic in its own right). The tradition has kept absorbing new tools " +
        "ever since, from Scotland's deliberately twee 1990s scene through 2010s and 2020s " +
        "bedroom-pop.",
    ],
    soundParagraph:
      "Guitars are melodic and usually clean or lightly chorused rather than distorted, built " +
      "around real chord changes and hooks instead of riffs. Production stays intentionally " +
      "modest — indie-pop rarely reaches for a big, expensive studio sound even when the budget " +
      "exists — and vocals favor an unaffected, conversational delivery over technical range, " +
      "letting the melody carry the song.",
    // The genre's four American lo-fi originators (Pavement, Sebadoh,
    // Guided by Voices, Car Seat Headrest) deliberately have no album card
    // here — their records are already claimed on lo-fi's own page, and
    // this page frames them as a secondary wing rather than reaching for
    // the same four covers twice. Lush, The Radio Dept., and Beach House
    // excluded the same way (already claimed by shoegaze/dream-pop).
    // Waxahatchee excluded via the album test: Saint Cloud is her
    // alt-country turn, not the earlier lo-fi-indie-pop work that actually
    // earns her this tag. of Montreal excluded the same way: Hissing Fauna
    // is glam art-pop, not the early twee records that earn the tag.
    definingAlbums: ['the-smiths', 'the-stone-roses', 'belle-and-sebastian', 'the-sundays', 'rem', 'the-shins', 'clairo', 'snail-mail'],
    sections: [
      {
        title: 'The originators',
        blurb:
          "The Manchester and Glasgow lineage that defines the genre by example — The Smiths' " +
          "jangle and persona, Belle and Sebastian and Camera Obscura's deliberately twee 1990s " +
          "revival of the same template.",
        artistIds: ['the-smiths', 'the-stone-roses', 'belle-and-sebastian', 'camera-obscura'],
      },
      {
        title: 'Into dream-pop and shoegaze',
        blurb:
          "Where indie-pop's melody meets dream-pop's haze. These artists carry both tags, and " +
          "the fuller telling of that overlap lives on dream-pop's and shoegaze's own pages.",
        artistIds: ['the-sundays', 'lush', 'alvvays', 'the-radio-dept', 'the-marias'],
      },
      {
        title: 'The American underground wing',
        blurb:
          "R.E.M.'s jangle crossed the Atlantic first; a rougher, four-track-recorded American " +
          "answer followed a decade later, alongside a stranger, more psychedelic " +
          "Elephant-6-adjacent strand. Several of these get fuller treatment on lo-fi's own " +
          "page, as specifically a recording aesthetic rather than a songwriting tradition.",
        artistIds: [
          'pavement',
          'sebadoh',
          'guided-by-voices',
          'car-seat-headrest',
          'yo-la-tengo',
          'rem',
          'of-montreal',
          'the-shins',
        ],
      },
      {
        title: 'The modern bedroom-pop generation',
        blurb:
          "A 2010s–2020s generation absorbed indie-pop's melodic instinct into bedroom-pop's " +
          "laptop-and-webcam production — the tradition's newest chapter, not a break from it.",
        artistIds: ['beach-house', 'clairo', 'snail-mail', 'japanese-breakfast', 'mac-demarco', 'waxahatchee', 'beabadoobee'],
      },
    ],
  },

  'midwest-emo': {
    deck:
      "Emo's twinkly, technically intricate Midwestern branch — clean, interlocking guitar lines " +
      "closer to math-rock than to hardcore's shout, paired with the same diaristic, heart-on-" +
      "sleeve lyrics. The name is more sonic lineage than literal map: some of its most important " +
      "records were made outside the actual Midwest.",
    originParagraphs: [
      "Cap'n Jazz, formed by teenage members of Chicago's Kinsella family in the northern " +
        "suburbs, spent the mid-1990s writing hardcore-fast songs already threaded through with " +
        "clean, chiming guitar interplay closer to a conversation than a riff. When the band " +
        "dissolved in 1995, its members scattered into a small constellation of related projects " +
        "— the most important of them American Football, formed in Urbana in 1997 around Mike " +
        "Kinsella, who made exactly one album before splitting: a quiet, jazz-chorded, trumpet-" +
        "inflected record that went on to define the entire genre's sound for a generation of " +
        "bands who came after it.",
      "The genre owes an equally real debt to a band that never set foot in the Midwest: Sunny " +
        "Day Real Estate's Diary, recorded in Seattle in 1994, established the melodic, unguarded " +
        "vocal approach and the clean-to-distorted dynamic swing that Cap'n Jazz and American " +
        "Football would apply their own intricate guitar vocabulary to — the fuller story of " +
        "Diary's place in emo more broadly is told on emo's own page. What Champaign-Urbana added " +
        "was the guitar interplay itself, interlocking and contrapuntal enough that it eventually " +
        "needed a name separate from emo's wider story.",
    ],
    soundParagraph:
      "Two or more clean electric guitars weave arpeggiated, contrapuntal lines around each other " +
      "rather than one carrying a riff and the other backing it — a texture closer to math-rock's " +
      "interlocking meters than to punk's rhythm-guitar tradition. Songs favor a quiet-to-loud " +
      "build over a straightforward chorus, time signatures shift more often than they settle, and " +
      "vocals stay conversational and often cracked rather than technically clean.",
    // Excluded — off-genre album despite a correct tag: duster (Stratosphere
    // reads as hazy, home-recorded slowcore, not the genre's twinkling
    // guitar-interplay sound — Duster's own lineage tag elsewhere in the
    // graph is slowcore, and this is that case showing up in the album).
    // Normalization pass: cut from 5 to 4 — Christie Front Drive dropped,
    // the least-known of the five, leaving the Champaign-Urbana founding
    // trio plus Get Up Kids as the "wider circle" representative.
    definingAlbums: ['sunny-day-real-estate', 'cap-n-jazz', 'american-football', 'get-up-kids'],
    sections: [
      {
        title: 'The Champaign-Urbana axis',
        blurb:
          "The genre's actual founding sound — Cap'n Jazz's manic twinkle, American Football's " +
          "quiet jazz-chord version of the same idea, and Sunny Day Real Estate's Seattle-made " +
          "template for the vocal and dynamic side of it, which gets its own fuller telling on " +
          "emo's page.",
        artistIds: ['sunny-day-real-estate', 'cap-n-jazz', 'american-football'],
      },
      {
        title: 'The wider circle',
        blurb:
          "Contemporaries who carried the same twinkling-guitar, confessional sound in different " +
          "directions and different cities — Get Up Kids toward pop hooks and a major-label " +
          "audience, Christie Front Drive toward Denver's own version of the Midwest sound, Duster " +
          "toward something hazier and closer to slowcore.",
        artistIds: ['get-up-kids', 'christie-front-drive', 'duster'],
      },
    ],
  },

  'math-rock': {
    deck:
      "Rock rebuilt around interlocking, irregular-meter guitar geometry instead of riffs or " +
      "hooks — precision and unusual time signatures treated as the point, not an obstacle to a " +
      "song. Math-rock grew out of post-hardcore's harder edge and has kept resurfacing wherever a " +
      "band gets more interested in counting than in choruses.",
    originParagraphs: [
      "The sound predates its name by a few years — Slint's Spiderland (1991), whisper-quiet " +
        "verses breaking into abruptly counted riffs, is retroactively cited as close to a " +
        "founding document, even though nobody called it math-rock at the time. The term itself " +
        "dates to 1994, applied to San Diego's Drive Like Jehu and their album Yank Crime, whose " +
        "knotted, start-stop guitar interplay and irregular meters made the label's implication " +
        "— a rock band doing arithmetic — feel literal rather than jokey.",
      "The style has never settled into one geography or era, resurfacing from Texas's post-" +
        "hardcore scene (At the Drive-In) through Japan's own instrumental tradition (toe) and " +
        "into 2010s–2020s London (black midi). Its closest relative, midwest emo's twinkly guitar " +
        "interplay, shares real DNA with math-rock and gets its own page rather than a repeat here " +
        "— American Football carries both tags.",
    ],
    soundParagraph:
      "Time signatures shift constantly and rarely settle into a plain 4/4 for long, with riffs " +
      "built from interlocking guitar parts that function more like counterpoint than lead-and-" +
      "rhythm. Dynamics swing hard between hushed, clean-toned passages and abrupt bursts of " +
      "distortion, and the style prizes rhythmic precision over hooks or conventional song " +
      "structure — a listener is meant to notice the arithmetic.",
    // American Football's own album is deliberately left off this grid —
    // it's midwest-emo's centerpiece, and that page gives it the fuller
    // telling (see the "into midwest emo" section below). Slint's Spiderland
    // and Drive Like Jehu's Yank Crime are already used on post-hardcore's
    // own page; reusing them here is precedented, not padding — both
    // records genuinely define both genres at once.
    // Normalization pass: cut from 6 to 4 — black midi and Pinback dropped;
    // math-rock is more a secondary tag than a primary identity for either
    // (art-rock/post-punk for black midi, indie-rock for Pinback).
    definingAlbums: ['slint', 'drive-like-jehu', 'at-the-drive-in', 'toe'],
    sections: [
      {
        title: 'The founding wave',
        blurb:
          "Math-rock's actual originators, all working out of post-hardcore's harder edge between " +
          "1991 and 2000 — Slint's hushed dread, Drive Like Jehu's knotted San Diego riffing, At " +
          "the Drive-In's more song-structured update a decade later.",
        artistIds: ['slint', 'drive-like-jehu', 'at-the-drive-in'],
      },
      {
        title: 'Global and later variations',
        blurb:
          "The sound scattered well past its American post-hardcore roots — Japan's toe built an " +
          "entire instrumental tradition around it, San Diego's Pinback folded it into something " +
          "poppier, and London's black midi pushed the same geometry toward 2020s art-rock excess.",
        artistIds: ['toe', 'black-midi', 'pinback'],
      },
      {
        title: 'Into midwest emo',
        blurb:
          "Where math-rock's interlocking guitar work crosses into emo's confessional territory. " +
          "American Football carries both tags, and gets the fuller telling on midwest emo's own " +
          "page.",
        artistIds: ['american-football'],
      },
    ],
  },

  'no-wave': {
    deck:
      "New York's most confrontational art-scene experiment — atonal guitar, no interest in " +
      "conventional song structure, and a deliberate hostility to rock's own pleasures. No-wave " +
      "was brief and small even by underground standards, but almost everything abrasive in the " +
      "American underground since traces back to it.",
    originParagraphs: [
      "Brian Eno's No New York (1978), a compilation documenting four confrontational Lower East " +
        "Side bands, is the genre's actual point of origin — a reaction against punk itself " +
        "already feeling like a formula only two years after it broke. Teenage Jesus and the " +
        "Jerks and Mars pushed toward pure dissonance and noise, while James Chance and the " +
        "Contortions spliced James Brown's funk directly into the same confrontational stance, a " +
        "different mutation of the same instinct.",
      "The scene's guitar-orchestra wing ran in parallel — Glenn Branca and Rhys Chatham, both " +
        "working with massed, detuned electric guitars as a compositional tool closer to " +
        "minimalist composition than to rock, gave no-wave's noise a more structured, almost " +
        "orchestral outlet. No-wave itself lasted barely five years as a going scene, but its " +
        "confrontational DNA fed directly into noise-rock, which gets its own fuller page.",
    ],
    soundParagraph:
      "Guitars are tuned atonally or played with deliberate disregard for conventional technique, " +
      "prizing texture and dissonance over melody or riff. Song structure is minimal to " +
      "nonexistent — pieces are built from repetition, drone, and abrupt dynamic shifts rather " +
      "than verse and chorus — and vocals range from a flat, disaffected sneer to a full, funk-" +
      "inflected yelp, with almost nothing conventionally \"sung\" in between.",
    // Excluded — off-genre album despite a correct tag: swans (Soundtracks
    // for the Blind, 1996, is the band's later-era industrial-ambient/drone
    // work, well past their early Lower East Side no-wave years — see
    // noise-rock's own page, which excludes the same album for the same
    // reason); xiu-xiu (Fabulous Muscles, 2004, is a real no-wave-indebted
    // record but arrives more than two decades after the scene itself —
    // covered in prose below, not as a defining album).
    // Normalization pass: cut from 6 to 4 — Mars dropped (its No New York
    // credit duplicates Teenage Jesus and the Jerks' own, so keeping both
    // added nothing distinct) and Rhys Chatham dropped in favor of Glenn
    // Branca alone representing the guitar-orchestra wing.
    definingAlbums: ['teenage-jesus-and-the-jerks', 'dna', 'james-chance-and-the-contortions', 'glenn-branca'],
    sections: [
      {
        title: 'The No New York scene and its outgrowths',
        blurb:
          "The four No New York bands (Teenage Jesus and the Jerks, Mars, DNA, and James Chance " +
          "and the Contortions — the last two also carrying a genuine dance-punk tag for the same " +
          "funk-splicing instinct), plus the guitar-orchestra wing (Glenn Branca, Rhys Chatham) " +
          "and Swans, who emerged from the same Lower East Side scene a few years later before " +
          "leaving no-wave behind entirely for industrial and drone.",
        artistIds: [
          'teenage-jesus-and-the-jerks',
          'mars',
          'dna',
          'james-chance-and-the-contortions',
          'glenn-branca',
          'rhys-chatham',
          'swans',
        ],
      },
      {
        title: 'Where no-wave echoes today',
        blurb:
          "A real chronological outlier: Xiu Xiu formed in 2002, decades after the original scene " +
          "dissolved, and absorbed its dissonance and confrontation as an inherited influence " +
          "rather than as a participant in it.",
        artistIds: ['xiu-xiu'],
      },
    ],
  },

  'dance-punk': {
    deck:
      "Punk's rhythm section fused to disco and funk groove — bass and drums built to make a " +
      "crowd move, guitar left sharp and scratchy on top. Dance-punk arrived alongside the rest of " +
      "post-punk in 1979 and has resurfaced in waves ever since, whenever a generation of guitar " +
      "bands rediscovers the dancefloor.",
    originParagraphs: [
      "Gang of Four's Entertainment! (1979) set the actual template: a rhythm section drilled " +
        "tight enough to function as disco, layered under Andy Gill's scraping, funk-inflected " +
        "guitar and Jon King's political sloganeering — punk's confrontation, repurposed for a " +
        "body that wanted to move rather than just pogo. James Chance and the Contortions were " +
        "doing something adjacent and even more extreme in New York at almost the same moment, " +
        "splicing James Brown's funk directly into no-wave's noise.",
      "The style went quiet through most of the 1980s and 90s before New York's DFA Records — " +
        "James Murphy's label and production outfit — revived it wholesale around 2002, with LCD " +
        "Soundsystem, The Rapture, and !!! all drawing the same line back to Gang of Four's " +
        "rhythm-first template, filtered now through house and disco's own four-on-the-floor " +
        "discipline. Yeah Yeah Yeahs arrived from the same downtown New York scene with a rawer, " +
        "more guitar-forward version, and the sound has kept surfacing since, most recently in the " +
        "UK's Windmill-adjacent scene via Squid.",
    ],
    soundParagraph:
      "The bass, not the guitar, carries the song's hook — thick, funk- or disco-derived basslines " +
      "drive the track while the guitar plays scratchy, rhythmic fragments rather than riffs or " +
      "chords. Drums lock into a four-on-the-floor or tightly syncopated groove built for the " +
      "dancefloor as much as the mosh pit, and vocals range from Gang of Four's sloganeering half-" +
      "shout to a more detached, ironic falsetto in the genre's 2000s revival.",
    // Normalization pass: cut from 7 to 4 — !!!, Yeah Yeah Yeahs, and Squid
    // dropped, keeping the two 1979 co-originators plus the two records
    // (LCD Soundsystem, The Rapture) most directly credited with the DFA
    // revival.
    definingAlbums: [
      'gang-of-four',
      'james-chance-and-the-contortions',
      'lcd-soundsystem',
      'the-rapture',
      'chk-chk-chk',
    ],
    sections: [
      {
        title: 'The 1979 originators',
        blurb:
          "The two acts who actually founded the sound within months of each other — Gang of " +
          "Four's UK post-punk-funk and James Chance's New York no-wave-funk mutation.",
        artistIds: ['gang-of-four', 'james-chance-and-the-contortions'],
      },
      {
        title: 'The 2000s DFA revival',
        blurb:
          "James Murphy's DFA Records brought the sound back wholesale in the early 2000s, " +
          "filtered through house and disco's own rhythmic discipline — Yeah Yeah Yeahs arrived " +
          "from the same downtown scene with a rawer, more guitar-first take.",
        artistIds: ['lcd-soundsystem', 'the-rapture', 'chk-chk-chk', 'yeah-yeah-yeahs'],
      },
      {
        title: 'Beyond New York',
        blurb:
          "The sound's most recent resurfacing — the UK's Windmill-adjacent scene folded dance-" +
          "punk's rhythm-first instinct into its own art-rock and krautrock leanings.",
        artistIds: ['squid'],
      },
    ],
  },

  goth: {
    deck:
      "Post-punk's morbid, theatrical wing — minor-key doom, funereal drums, and death-imagery " +
      "romanticism where punk's anger curdled into something more gothic and glamorous. Goth split " +
      "off from the rest of post-punk within the same UK scene, around one Bauhaus single.",
    originParagraphs: [
      "Bauhaus's 1979 single \"Bela Lugosi's Dead\" — nine minutes of dub-cavernous bass, sparse " +
        "guitar scratches, and Peter Murphy's vampiric drawl, named after the Dracula actor " +
        "outright — is the genre's usual origin point, even though Bauhaus themselves aren't a " +
        "graph node here. Siouxsie and the Banshees and The Birthday Party arrived from the same " +
        "UK post-punk scene at almost the same moment, both trading post-punk's angularity for " +
        "something more theatrical and explicitly morbid, Nick Cave's Birthday Party detouring " +
        "into outright blues-damaged menace.",
      "The Cure crossed over from their own more angular post-punk beginnings into goth's defining " +
        "mainstream statement, Disintegration (1989), while The Chameleons worked the same UK " +
        "scene with less commercial reward and a more devoted cult following. The genre never " +
        "stayed confined to the UK or the 1980s — Dead Can Dance took it toward neoclassical and " +
        "world-music territory from Australia, and a 2020s London band, The Last Dinner Party, " +
        "has recently picked the same theatrical instinct back up wrapped in chamber-pop " +
        "orchestration.",
    ],
    soundParagraph:
      "Basslines sit high in the mix and often carry the melody, played with a driving, post-" +
      "punk-derived urgency under sparse, echo-drenched guitar. Vocals favor a deep, theatrical " +
      "croon or wail over anything conversational, minor keys and modal melodies dominate, and " +
      "tom-heavy, reverb-soaked drums replace punk's straight backbeat with something more " +
      "funereal.",
    // Normalization pass: cut from 6 to 4 — The Chameleons and The Last
    // Dinner Party dropped, keeping the three UK founders plus Dead Can
    // Dance representing goth's reach beyond the UK (Dead Can Dance's album
    // is genuinely dual-fitting — it's also darkwave's own central pick).
    definingAlbums: ['the-cure', 'siouxsie-and-the-banshees', 'the-birthday-party', 'dead-can-dance'],
    sections: [
      {
        title: 'The UK founding wave',
        blurb:
          "The scene that actually invented the genre, all working out of the UK's late-70s post-" +
          "punk moment — The Cure and Siouxsie and the Banshees crossing over from more angular " +
          "beginnings, The Birthday Party pushing toward blues-damaged menace, The Chameleons " +
          "working the same territory with a smaller audience.",
        artistIds: ['the-cure', 'siouxsie-and-the-banshees', 'the-birthday-party', 'the-chameleons'],
      },
      {
        title: 'Beyond the UK',
        blurb:
          "Goth's theatrical instinct outliving its original scene by decades and continents — " +
          "Dead Can Dance's neoclassical turn from Australia, The Last Dinner Party's 2020s London " +
          "chamber-pop update.",
        artistIds: ['dead-can-dance', 'the-last-dinner-party'],
      },
    ],
  },

  darkwave: {
    deck:
      "Goth's electronic cousin — the same funereal atmosphere and theatrical dread, built from " +
      "synthesizers and drones as much as guitars. It's a small, specialist lineage rather than a " +
      "wide-reaching scene, and this page is honestly sized to match: only two artists in the " +
      "graph carry the tag.",
    originParagraphs: [
      "Darkwave grew out of European goth in the mid-1980s once synthesizers and drum machines " +
        "started replacing guitars as the genre's primary color. Dead Can Dance, formed in " +
        "Australia in 1981 before relocating to London and signing to 4AD, is one of the style's " +
        "defining acts — Within the Realm of a Dying Sun (1987) pairs Lisa Gerrard's operatic, " +
        "wordless vocals with dark neoclassical arrangement, pushing goth's theatricality toward " +
        "something closer to sacred music than rock.",
      "The style has had little visible continuity since — this remains a small lineage compared " +
        "to goth's broader reach — but Swedish organist Anna von Hausswolff picked up its " +
        "combination of drone, church-organ scale, and gothic dread decades later, on 2018's Dead " +
        "Magic, without any direct scene connecting the two.",
    ],
    soundParagraph:
      "Synthesizers and drum machines take over much of the work guitars do in goth proper, laid " +
      "under vocals that favor an operatic or wordless, almost sacred delivery over a rock " +
      "frontperson's phrasing. Tempos run slower and arrangements sit more spacious than goth's, " +
      "with reverb-heavy organ or synthesizer drones doing the atmospheric work a wall of guitars " +
      "would elsewhere.",
    // Only 2 artists carry this tag in the graph — the list below is
    // necessarily short, not padded. Don't force it to 4.
    definingAlbums: ['dead-can-dance', 'anna-von-hausswolff'],
    sections: [
      {
        title: 'A small, electronic lineage',
        blurb:
          "Two artists, separated by three decades and no direct scene connecting them, both " +
          "reaching for the same combination of drone, dread, and operatic or wordless vocal " +
          "delivery.",
        artistIds: ['dead-can-dance', 'anna-von-hausswolff'],
      },
    ],
  },

  'proto-punk': {
    deck:
      "Rock stripped of psychedelia's polish and blues-rock's showmanship, years before punk had a " +
      "name — the root the entire punk lineage grows from. Proto-punk isn't one scene but several " +
      "parallel ones, unified mostly in hindsight.",
    originParagraphs: [
      "The Velvet Underground's 1967 debut, with its detuned drone, deadpan vocals, and open " +
        "indifference to musicianship-as-virtue, is the usual starting point — a New York art-" +
        "scene answer to psychedelia's excess that almost nobody heard at the time but that " +
        "reshaped everything downstream of it. The Stooges arrived two years later from Michigan " +
        "with a cruder, more physical version of the same nihilism, Iggy Pop's feral stage " +
        "presence doing as much of the work as the music itself.",
      "By the mid-1970s the sound had scattered into several barely-connected regional pockets " +
        "that would all later get folded under the same retroactive label: Detroit's MC5 married " +
        "the Stooges' aggression to radical politics, New York Dolls brought glam drag and " +
        "Rolling Stones swagger to the same CBGB circuit that Television and Patti Smith were " +
        "using for something more literary and art-damaged, and Boston's Modern Lovers ran the " +
        "Velvet Underground's flat, deadpan drone through a suburban teenager's obsessions. Ramones " +
        "and the Sex Pistols arrived a few years later still working from the same stripped-down " +
        "template, right at the point where \"proto-punk\" becomes simply \"punk\" — the two " +
        "genres share several artists, and punk gets its own fuller page.",
    ],
    soundParagraph:
      "The songwriting strips back psychedelic rock's studio ambition and blues-rock's guitar " +
      "heroics in favor of something plainer and more aggressive — simple chord vocabularies, " +
      "minimal soloing, and a deliberately amateurish or deadpan vocal delivery rather than " +
      "technical singing. Distortion and feedback are used for confrontation rather than texture, " +
      "and the whole style reads, in hindsight, as everything punk would need already present " +
      "except the name.",
    // Excluded — no classicAlbum on file: mc5, sex-pistols (two of the three
    // artists in the whole graph with no bio/album content — see the
    // pending list; punk's own page notes the same gap for these two).
    // Normalization pass: cut from 7 to 4 — Television, New York Dolls, and
    // The Modern Lovers dropped, keeping the two actual co-founders (Velvet
    // Underground, The Stooges) plus Patti Smith and Ramones marking the
    // handoff into punk proper.
    definingAlbums: [
      'velvet-underground',
      'the-stooges',
      'patti-smith',
      'ramones',
      'new-york-dolls',
    ],
    sections: [
      {
        title: "New York's art-damaged wing",
        blurb:
          "The Velvet Underground's founding drone and the CBGB-era scene that grew out of its " +
          "shadow — glam drag, beat-poetry, and a general refusal to play rock straight.",
        artistIds: ['velvet-underground', 'television', 'patti-smith', 'new-york-dolls'],
      },
      {
        title: "Detroit's harder answer",
        blurb:
          "A cruder, more physical Midwestern counterpart to New York's art-school scene — The " +
          "Stooges' feral nihilism, MC5's radical-politics aggression.",
        artistIds: ['the-stooges', 'mc5'],
      },
      {
        title: 'Where proto-punk becomes punk',
        blurb:
          "Released within a year or two of each other in the mid-70s, these three mark the actual " +
          "handoff — Modern Lovers' Velvet Underground-indebted deadpan, then Ramones and the Sex " +
          "Pistols stripping the template down to its final, fastest form. Punk's own page picks " +
          "the story up from here.",
        artistIds: ['the-modern-lovers', 'ramones', 'sex-pistols'],
      },
    ],
  },

  'garage-rock': {
    deck:
      "American teenage bands, cheap equipment, and a three-chord snarl — rock and roll's rawest, " +
      "least ambitious wing, present years before punk or proto-punk had a name for the same " +
      "impulse. Garage rock has gone quiet and come back at least twice since, each time as a " +
      "reaction against whatever the mainstream had gotten too polished.",
    originParagraphs: [
      "The Kingsmen's 1963 recording of \"Louie Louie\" — three chords, a deliberately sloppy " +
        "vocal take, and a regional hit that outran its own budget — set the template teenage " +
        "American bands would spend the rest of the decade copying: cheap gear, a battle-of-the-" +
        "bands mentality, and a snarling energy punk would later claim as a direct ancestor. The " +
        "Stooges and MC5, both Michigan bands working a few years later, pushed that same raw " +
        "teenage aggression harder and louder than the original garage scene ever had, close " +
        "enough to the era's proto-punk explosion that the two genres share several artists " +
        "outright — proto-punk's own page gives The Stooges' founding role the fuller telling.",
      "Garage rock went quiet as a going concern for almost three decades before a 2000s revival — " +
        "The Strokes' Is This It and The White Stripes' White Blood Cells, both released in 2001 — " +
        "brought its stripped-down urgency back as a reaction against nu-metal and post-grunge " +
        "bloat. More recently, Australia's King Gizzard and the Lizard Wizard folded the same raw " +
        "three-chord snarl into a wilder, more psychedelic and prolific project of their own.",
    ],
    soundParagraph:
      "Instrumentation stays minimal and the recording deliberately unpolished — a cheap amp " +
      "pushed into distortion counts as production. Songs are simple and riff-driven rather than " +
      "lyrically ambitious, played with a teenage band's raw enthusiasm rather than technical " +
      "control, and the whole style prizes energy and attitude over precision.",
    // The Stooges' album is deliberately left off this grid — proto-punk's
    // own page centers The Stooges as one of its two founding acts, and
    // that's where the fuller telling of their record belongs. MC5 excluded
    // for having no classicAlbum on file (see proto-punk's own note on the
    // same gap).
    definingAlbums: [
      'the-strokes',
      'the-white-stripes',
      'king-gizzard-and-the-lizard-wizard',
      'the-modern-lovers',
      'the-stooges',
    ],
    sections: [
      {
        title: 'The 1960s originators',
        blurb:
          "The Stooges and MC5 pushed the original garage-band snarl into something harder and " +
          "more aggressive; The Modern Lovers ran the same raw, cheap-gear approach through a " +
          "quieter, more deadpan sensibility a few years later.",
        artistIds: ['the-stooges', 'mc5', 'the-modern-lovers'],
      },
      {
        title: 'The revival, 2001 to now',
        blurb:
          "Three decades of near-silence, then a sudden return — The Strokes and The White " +
          "Stripes brought the sound back within months of each other in 2001, and King Gizzard " +
          "and the Lizard Wizard have since folded it into a far more prolific, psychedelic " +
          "project of their own.",
        artistIds: ['the-strokes', 'the-white-stripes', 'king-gizzard-and-the-lizard-wizard'],
      },
    ],
  },

  'jangle-pop': {
    deck:
      "The chiming, ringing guitar sound descended from The Byrds' folk-rock jangle — indie-pop's " +
      "most identifiable and enduring mode, not merely a satellite of it. Where indie-pop names a " +
      "whole songwriting tradition, jangle-pop names a specific guitar technique and tone: bright, " +
      "treble-forward, built on arpeggios and open chords rather than power chords or distortion.",
    originParagraphs: [
      "Big Star's #1 Record (1972) laid the actual template over a decade before the genre had a " +
        "name — Alex Chilton's Byrds-descended chime married to power-pop's melodic discipline, " +
        "commercially ignored at the time and canonized only in retrospect. The genre itself dates " +
        "to 1983, the year R.E.M.'s Murmur and The Smiths' earliest singles arrived within months " +
        "of each other on opposite sides of the Atlantic: Peter Buck's arpeggiated Rickenbacker " +
        "figures gave American college radio its defining guitar sound, while Johnny Marr's more " +
        "ornate, interlocking lines did the same for the UK.",
      "The two scenes ran on separate tracks for most of the decade — Manchester's baggy " +
        "crossover (The Stone Roses) folding the jangle into dance rhythm, a quieter British " +
        "guitar-pop lineage (Echo & the Bunnymen, The Sundays) keeping it more atmospheric — before " +
        "converging again in the 1990s, when The Cranberries took the same chiming vocabulary into " +
        "radio-friendly territory and Belle and Sebastian's revival made explicit what had always " +
        "been implicit: that jangle-pop was as much a mood as a technique.",
    ],
    soundParagraph:
      "The guitar is always clean or barely overdriven, picked in ringing arpeggios or full open " +
      "chords rather than muted or distorted, with a treble-forward, chorus-light tone that leaves " +
      "plenty of headroom above the bass. Rhythm sections stay uncomplicated and driving — a " +
      "steady pulse under Madchester's baggier variants, a tighter pop-rock backbeat elsewhere — " +
      "so the guitar's melody, not the groove, carries the song, and vocal melodies favor clear, " +
      "major-key hooks over the deadpan or shouted delivery found in the genre's punkier neighbors.",
    // Excluded — off-genre album despite a correct tag: echo-and-the-bunnymen
    // (Ocean Rain is orchestral, atmospheric post-punk, already the pick on
    // post-punk's own page — not jangle-pop's chiming, verse-chorus sound);
    // alvvays (Blue Rev is the band's shoegaze-facing record, not their
    // earlier, more straightforward jangle-pop work). Belle and Sebastian's
    // and Camera Obscura's albums are used here rather than repeated on
    // chamber-pop's page, where both artists also carry a tag.
    definingAlbums: ['big-star', 'rem', 'the-smiths', 'the-stone-roses', 'the-sundays', 'the-cranberries', 'belle-and-sebastian', 'camera-obscura'],
    sections: [
      {
        title: 'American roots',
        blurb:
          "Big Star predates the genre by over a decade, working out the Byrds-descended chime " +
          "as a power-pop footnote; R.E.M. picked the same tone back up in 1983 and gave American " +
          "college radio its defining guitar sound.",
        artistIds: ['big-star', 'rem'],
      },
      {
        title: 'The UK wave',
        blurb:
          "The genre's main scene — The Smiths' persona-and-jangle template, Manchester's baggy " +
          "crossover, and a quieter, more atmospheric strand running through Liverpool and Dublin.",
        artistIds: ['the-smiths', 'the-stone-roses', 'the-sundays', 'the-cranberries', 'echo-and-the-bunnymen'],
      },
      {
        title: "Twee and indie-pop's chiming inheritors",
        blurb:
          "Later custodians of the same chime, filtered through Scotland's deliberately twee 1990s " +
          "scene and a 2010s–2020s revival of the same guitar tone.",
        artistIds: ['belle-and-sebastian', 'camera-obscura', 'alvvays'],
      },
    ],
  },

  'chamber-pop': {
    deck:
      "Indie-rock songwriting dressed in real or synthesized orchestration — strings, horns, " +
      "woodwinds, harpsichord — rather than the standard guitar-bass-drums trio. Chamber-pop " +
      "treats arrangement itself as the point of ambition, closer to a small classical ensemble's " +
      "palette than a rock band's.",
    originParagraphs: [
      "The instinct predates the name by a decade — The Blue Nile's Hats (1989) and Prefab " +
        "Sprout's Steve McQueen (1985) had already proven a British pop song could carry orchestral " +
        "synth-strings and still function as pop, working in a sophisti-pop tradition that had no " +
        "name of its own at the time. Chamber-pop as a genre dates to 1996, when Belle and " +
        "Sebastian's earliest records paired hushed, twee songwriting with real string and horn " +
        "arrangements rather than just electric guitars — a small, DIY-scaled orchestration most " +
        "indie bands hadn't attempted.",
      "Sufjan Stevens scaled the same idea up considerably a decade later — banjo, glockenspiel, " +
        "full horn and woodwind sections stacked into something closer to a chamber orchestra than " +
        "a backing band — and that maximalist version is what most listeners now picture when they " +
        "hear the term. From there it split two ways: full bands (Arcade Fire, The National, Black " +
        "Country, New Road) who folded the orchestration into an anthemic, festival-scale sound, " +
        "and individual artists (Fiona Apple, Weyes Blood, Perfume Genius) who kept it closer to " +
        "art-song scale.",
    ],
    soundParagraph:
      "Real or sampled orchestral instruments — strings, brass, woodwinds, harpsichord, " +
      "glockenspiel — sit alongside or instead of electric guitar, arranged with a classical ear " +
      "for counter-melody rather than as background pads. Song structures stay pop-scaled (verses, " +
      "choruses, bridges), but the arrangement swells and thins with real dynamic range, and " +
      "production favors a warm, room-recorded intimacy over rock's amp-and-drum-kit directness " +
      "even when the ensemble grows large.",
    // Excluded — already claimed elsewhere: belle-and-sebastian and camera-
    // obscura (both artists' albums are used on jangle-pop's own page — this
    // page frames them as chamber-pop's founding wave in prose without also
    // reaching for the same two covers). Cut for space — genuinely chamber-
    // pop, just short of the top 8: the-national, perfume-genius.
    definingAlbums: [
      'the-blue-nile',
      'prefab-sprout',
      'sufjan-stevens',
      'arcade-fire',
      'fleet-foxes',
      'black-country-new-road',
      'fiona-apple',
      'weyes-blood',
    ],
    sections: [
      {
        title: 'The sophisti-pop precursors',
        blurb:
          "1980s British orchestral pop, years before the genre had a name of its own — synth-" +
          "strings and yearning arrangement treated as seriously as any guitar part.",
        artistIds: ['the-blue-nile', 'prefab-sprout'],
      },
      {
        title: 'The founding wave',
        blurb:
          "The genre's actual 1996 anchor — Belle and Sebastian and Camera Obscura's Scottish " +
          "twee orchestration, and Sufjan Stevens' American baroque-folk maximalism a decade later.",
        artistIds: ['belle-and-sebastian', 'camera-obscura', 'sufjan-stevens'],
      },
      {
        title: '2000s indie orchestral maximalism',
        blurb:
          "Full bands who scaled chamber-pop's orchestration up to anthemic, festival-size " +
          "arrangements without losing the genre's arranged, counter-melodic detail.",
        artistIds: ['arcade-fire', 'the-national', 'fleet-foxes', 'black-country-new-road'],
      },
      {
        title: 'Art and confessional chamber-pop',
        blurb:
          "Individual artists who kept the orchestration closer to art-song scale — theatrical, " +
          "confessional, and often stranger than the full-band wing above.",
        artistIds: ['fiona-apple', 'weyes-blood', 'perfume-genius', 'japanese-breakfast', 'the-last-dinner-party'],
      },
    ],
  },

  'singer-songwriter': {
    deck:
      "One person, one guitar or piano, and lyrics written in the first person — the most " +
      "enduring, least genre-bound tradition in this graph. Singer-songwriter isn't defined by a " +
      "sound so much as by an authorial stance: the writer is presumed to be singing about their " +
      "own life.",
    originParagraphs: [
      "The mode crystallized around 1967 — Leonard Cohen's debut turning a poet's craft toward " +
        "song, Joni Mitchell's earliest writing doing something similar from inside the folk clubs " +
        "— though its most mythologized document, Nick Drake's hushed, guitar-and-string Pink Moon, " +
        "didn't arrive until 1972, by which point Bob Dylan (Highway 61 Revisited, 1965) and the " +
        "British folk-baroque scene around Bert Jansch had already been working the same basic idea " +
        "from opposite ends: Dylan toward electric, image-dense wordplay, Jansch toward intricate " +
        "acoustic fingerstyle.",
      "The template proved durable enough that it barely needed reinventing — Townes Van Zandt and " +
        "John Prine brought a plainer, more narrative American vernacular to it in the same handful " +
        "of years, and it survived nearly intact through decades of surrounding genres rising and " +
        "falling. Its most direct later descendants — Elliott Smith in the 1990s, then Sharon Van " +
        "Etten and Adrianne Lenker — inherited the same first-person confession, just recorded with " +
        "a rock band's dynamics or, in Lenker's case, almost no production at all.",
    ],
    soundParagraph:
      "Voice and a single chordal instrument — acoustic guitar most often, occasionally piano — " +
      "carry the entire song, with full-band arrangement, if it appears at all, staying in service " +
      "of the lyric rather than announcing itself. Melodies favor natural, conversational phrasing " +
      "over technical range, and the lyric is almost always written and delivered in the first " +
      "person, presumed autobiographical even when it isn't.",
    // Cut for space — genuinely singer-songwriter, just short of the top 8:
    // vashti-bunyan, bert-jansch, roy-harper, karen-dalton, sharon-van-etten,
    // adrianne-lenker. No off-genre exclusions — every candidate album here
    // is a real, undisputed singer-songwriter record.
    definingAlbums: ['bob-dylan', 'leonard-cohen', 'joni-mitchell', 'nick-drake', 'neil-young', 'townes-van-zandt', 'john-prine', 'elliott-smith'],
    sections: [
      {
        title: 'The originators, 1965–1972',
        blurb:
          "A remarkably tight cluster — American and British folk clubs, working within a handful " +
          "of years of each other, that defined the entire mode almost on the first try.",
        artistIds: [
          'bob-dylan',
          'leonard-cohen',
          'joni-mitchell',
          'nick-drake',
          'neil-young',
          'townes-van-zandt',
          'bert-jansch',
          'roy-harper',
          'karen-dalton',
          'john-prine',
          'vashti-bunyan',
        ],
      },
      {
        title: 'Later inheritors',
        blurb:
          "A real gap — decades, not years — separates these three from the originators above, " +
          "but the stance carries over unchanged: the same first-person confession, recorded in " +
          "very different studio contexts.",
        artistIds: ['elliott-smith', 'sharon-van-etten', 'adrianne-lenker'],
      },
    ],
  },

  'indie-folk': {
    deck:
      "Folk's traditional forms filtered through indie rock's dynamics, DIY recording, and a " +
      "generation raised on lo-fi as much as on the Greenwich Village folk revival. Indie-folk " +
      "keeps folk's acoustic core but adds a rock band's structure, texture, and volume.",
    originParagraphs: [
      "Silver Jews' American Water (1998) and The Mountain Goats' early boombox-recorded records " +
        "had already found a plainspoken, literate register between folk and indie rock years " +
        "before the genre had a name — David Berman's and John Darnielle's songwriting drawing as " +
        "much on rock lyricism as on folk tradition. The genre itself dates to 2004, once Sufjan " +
        "Stevens' and Iron & Wine's records (the latter outside this graph) made the combination " +
        "legible as its own thing: hushed, acoustic-based songwriting recorded with an indie band's " +
        "studio ambition rather than a folk revivalist's minimalism.",
      "Bon Iver's For Emma, Forever Ago (2007), recorded alone in a Wisconsin cabin, became the " +
        "genre's most influential single record, and a wide 2010s–2020s generation — Big Thief, " +
        "Phoebe Bridgers, Waxahatchee, Kurt Vile — built distinct, individual variations on the " +
        "same basic promise: real folk songwriting, indie rock's studio and dynamic range.",
    ],
    soundParagraph:
      "Acoustic guitar or plainly picked electric forms the songwriting core, but the arrangement " +
      "around it — reverb-heavy production, full-band dynamics, occasional distortion or drone — " +
      "comes from indie rock rather than folk tradition. Vocals stay close-mic'd and intimate, " +
      "often multi-tracked into thick harmony, and lyrics favor a specific, narrative or diaristic " +
      "detail over folk's more universal, communal register.",
    // Excluded — already claimed elsewhere: waxahatchee (Saint Cloud is the
    // same alt-country-facing record already framed that way on indie-pop's
    // own page, not indie-folk's chamber-scaled songwriting).
    // Normalization pass: cut from 6 to 4 — The Mountain Goats and Kurt Vile
    // dropped, keeping Silver Jews as the pre-genre-name anchor alongside
    // the three most influential 2000s–2020s records.
    definingAlbums: [
      'silver-jews',
      'bon-iver',
      'big-thief',
      'phoebe-bridgers',
      'sufjan-stevens',
    ],
    sections: [
      {
        title: 'Pre-genre roots',
        blurb:
          "Working before indie-folk had a name of its own — a plainspoken, literate register " +
          "closer to indie rock's lyricism than to folk-revival earnestness.",
        artistIds: ['silver-jews', 'the-mountain-goats'],
      },
      {
        title: 'The 2000s–2020s wave',
        blurb:
          "The generation that grew up with the genre already named — five distinct, individual " +
          "answers to the same basic promise of folk songwriting inside indie rock's dynamic range.",
        artistIds: ['bon-iver', 'kurt-vile', 'big-thief', 'phoebe-bridgers', 'waxahatchee', 'sufjan-stevens'],
      },
    ],
  },

  'alt-country': {
    deck:
      "Country's twang and storytelling run through indie rock's guitars and volume — a reaction " +
      "against Nashville's slick mainstream, named for the magazine that chronicled it. Alt-" +
      "country keeps country's plainspoken narrative sense while trading pedal-steel polish for " +
      "distortion, tape hiss, or shoegaze haze.",
    originParagraphs: [
      "The genre takes its name from the same source twice over: Uncle Tupelo's 1990 debut No " +
        "Depression (itself named for a Carter Family song), and the alt-country fanzine that later " +
        "took its own name from that album. Uncle Tupelo, outside this graph, fused punk volume and " +
        "DIY recording with straight country songwriting, rejecting Nashville's polished mainstream " +
        "in favor of something rougher and more indebted to Gram Parsons' original cosmic-American-" +
        "music fusion.",
      "Lucinda Williams and Drive-By Truckers carried the same instinct through the 1990s and 2000s " +
        "as Southern rock's own more literate wing, while Bright Eyes and Angel Olsen brought it " +
        "into indie rock proper — country's plainspoken narrative voice delivered with an indie " +
        "singer-songwriter's confessional intensity. A newer generation, MJ Lenderman and Wednesday, " +
        "grew up around the same North Carolina scene and pushed the sound toward lo-fi distortion " +
        "and shoegaze haze respectively, without losing the genre's storytelling backbone.",
    ],
    soundParagraph:
      "Pedal steel, twang, and country's narrative songwriting sit inside an indie-rock or punk-" +
      "descended production — real distortion, feedback, or lo-fi tape hiss where Nashville country " +
      "would use polish. Vocal delivery stays plain and conversational rather than showing off " +
      "vocal runs, and lyrics favor specific, often Southern, narrative detail — a place, a person, " +
      "a small true thing — over pop's generalized sentiment.",
    // No off-genre exclusions here — all 6 alt-country-tagged artists'
    // classicAlbums are genuinely alt-country records, including Wednesday's
    // Rat Saw God, whose exclusion from shoegaze's own definingAlbums is
    // exactly what flagged it as this genre's real home instead.
    // Normalization pass: cut from 6 to 4 — MJ Lenderman and Wednesday
    // dropped, which removes the North Carolina revival's own grid
    // representation (both remain full section members; Rat Saw God simply
    // isn't in the top 4 by pure canonical weight against the genre's
    // 1990s–2010s Americana generation).
    // Repetition across pages is explicitly allowed -- see the policy note on the
    // folk page. Songs: Ohia's Magnolia Electric Co. is close to the definitive
    // alt-country record in this roster and was missing because the artist was
    // not even tagged alt-country (now fixed in seed-data.ts); Lenderman and
    // Wednesday were tagged, had albums, and were simply never picked.
    definingAlbums: [
      'lucinda-williams',
      'drive-by-truckers',
      'songs-ohia',
      'angel-olsen',
      'bright-eyes',
      'wednesday',
      'mj-lenderman',
      'silver-jews',
    ],
    sections: [
      {
        title: 'The Americana generation',
        blurb:
          "The genre's first two decades — Southern rock's literate wing meeting indie rock's " +
          "confessional intensity, all working under the same No Depression banner.",
        artistIds: ['lucinda-williams', 'drive-by-truckers', 'songs-ohia', 'bright-eyes', 'angel-olsen', 'silver-jews'],
      },
      {
        title: 'The North Carolina revival',
        blurb:
          "A newer generation from the same regional scene, pushing alt-country's twang toward lo-" +
          "fi tape distortion and shoegaze haze while keeping its narrative backbone intact.",
        artistIds: ['mj-lenderman', 'wednesday'],
      },
    ],
  },

  slowcore: {
    deck:
      "Indie rock slowed to a crawl — hushed vocals, minimal arrangement, and tempos that dare a " +
      "listener's patience. Slowcore takes rock instrumentation and empties out almost everything " +
      "but space and dynamics.",
    originParagraphs: [
      "Codeine's Frigid Stars LP established the basic method in 1990: rock's standard trio, " +
        "played at a fraction of the expected tempo, with reverb and empty space doing as much work " +
        "as any note played. Low, forming in Duluth, Minnesota that same year, pushed the " +
        "minimalism furthest — hushed harmony vocals over a barely-there drum kit, volume kept " +
        "deliberately low even live. Galaxie 500 is often named alongside both as a third founding " +
        "reference, though in this graph they carry a dream-pop tag rather than a slowcore one.",
      "Mark Kozelek's Red House Painters brought a more baroque, string-laden version of the same " +
        "patience, and the sound has stayed a small, quietly persistent undercurrent since — " +
        "resurfacing in Cat Power's hushed early records and, decades later, in Phil Elverum's " +
        "Mount Eerie, which pushed the minimalism toward something closer to drone.",
    ],
    soundParagraph:
      "Tempos stay slow enough that a song can run past six or seven minutes on a handful of " +
      "chords, with drums often reduced to a bare pulse or dropped out for long stretches. Vocals " +
      "are hushed, close-mic'd, and usually quiet even at a song's loudest point, and reverb-heavy " +
      "guitar or piano fills the space a faster band would fill with rhythm — dynamics move " +
      "through volume and silence rather than tempo.",
    // Normalization pass: cut from 5 to 4 — Cat Power dropped; Moon Pix
    // reads more broadly as indie/lo-fi folk-rock than pure slowcore,
    // making it the least central of the five even though it's a real
    // pick. The other four are the genre's founders plus its main baroque
    // and drone-leaning extensions.
    definingAlbums: [
      'codeine',
      'low',
      'red-house-painters',
      'galaxie-500',
      'duster',
    ],
    sections: [
      {
        title: "Slowcore's core lineage",
        blurb:
          "A small, coherent scene rather than a genre with real internal factions — Codeine and " +
          "Low set the template in 1990, Red House Painters gave it strings, and Cat Power and " +
          "Mount Eerie carried the same patience into the following two decades.",
        artistIds: ['codeine', 'low', 'red-house-painters', 'cat-power', 'mount-eerie', 'galaxie-500', 'duster'],
      },
    ],
  },

  'bedroom-pop': {
    deck:
      "Bedroom pop is a recording circumstance as much as a sound — hooks, laptop production, and " +
      "a deliberately unpolished, DIY intimacy that name-checks Bandcamp and SoundCloud rather than " +
      "a studio. It's the newest chapter of a much older DIY-recording impulse, dated to the mid-" +
      "2010s rather than to indie-pop's 1980s originators.",
    originParagraphs: [
      "The genre dates to 2016, when Clairo's breakout single \"Pretty Girl\" — recorded on a " +
        "laptop in her childhood bedroom and posted straight to YouTube — became the reference " +
        "point for a streaming-era generation making finished-sounding pop songs without a studio, " +
        "a label, or much more than a laptop and a cheap interface. It's less a sound than a " +
        "production circumstance: hooks and melody as direct as any indie-pop record, built " +
        "entirely inside a bedroom rather than a rehearsal space.",
      "Three of this graph's four bedroom-pop artists — Clairo, Snail Mail, beabadoobee — also " +
        "carry the indie-pop tag, and the overlap is real: bedroom-pop is best understood as indie-" +
        "pop's most recent recording generation, distinguished mainly by where and how the record " +
        "was actually made. Alex G, the fourth, sits closer to lo-fi's rougher, more experimental " +
        "home-recording tradition instead.",
    ],
    soundParagraph:
      "Production stays audibly home-made — a laptop DAW, a cheap interface, headphone mixing — " +
      "even when the songwriting itself is polished and hook-forward. Vocals are close, unaffected, " +
      "and often doubled or pitched for texture rather than range, and arrangements lean on a " +
      "small, personal palette — a nylon-string guitar, a drum machine, bedroom-scale synths — " +
      "rather than a full studio band.",
    // Only 4 artists carry this tag, so 4 is the correct, non-padded count —
    // not a cap being undershot. All four albums are genuinely bedroom-pop-
    // defining.
    definingAlbums: ['clairo', 'beabadoobee', 'alex-g'],
    sections: [
      {
        title: 'The streaming-era bedroom scene',
        blurb:
          "A small, tightly contemporary group rather than a genre with real internal history — " +
          "three of the four also carry the older indie-pop tag; Alex G leans closer to lo-fi's " +
          "rougher home-recording tradition instead.",
        artistIds: ['clairo', 'beabadoobee', 'alex-g'],
      },
    ],
  },

  'psychedelic-pop': {
    deck:
      "Pop songcraft turned inward and strange — the Beach Boys' and Beatles' mid-60s studio " +
      "experiments, reinterpreted across six decades by anyone chasing a bright melody through a " +
      "haze of studio effects, backwards tape, or electronic production. Psychedelic-pop keeps " +
      "pop's hooks while treating the studio itself as a hallucinogen.",
    originParagraphs: [
      "1966 is the hinge year on both sides of the Atlantic — the Beach Boys' and Beatles' own " +
        "studio turn (both outside this graph) proved a pop song could carry orchestral ambition " +
        "and backwards, treated sound and still function as a single. The Incredible String Band " +
        "took the same impulse toward British folk-psychedelia that same year, while Silver Apples, " +
        "working in New York, arrived at a stranger, purely electronic version of the same idea a " +
        "couple of years later — oscillators and homemade synthesizers standing in for a full band.",
      "The Elephant 6 collective picked the thread back up in the 1990s (Neutral Milk Hotel, " +
        "Olivia Tremor Control, of Montreal), consciously chasing 1960s studio techniques on a " +
        "fraction of the original budget, and a wider 2000s indie generation — The Shins, MGMT, " +
        "Animal Collective, Tame Impala — brought the sound to festival scale. Its most recent wing " +
        "runs through electronic production entirely: Caribou and Mid-Air Thief arrive at " +
        "psychedelic-pop's disorientation through sampling and production rather than guitars and " +
        "tape.",
    ],
    soundParagraph:
      "Studio effects — backwards tape, phasing, layered vocal harmony, unconventional " +
      "instrumentation — sit on top of straightforward, hook-driven pop songwriting rather than " +
      "replacing it, so the strangeness never fully swallows the melody. Arrangements favor dense, " +
      "maximalist layering over a clean mix, and production choices like tape saturation, pitch-" +
      "shifting, and deliberately blown-out samples do a lot of the same disorienting work a " +
      "hallucinogen's visual distortion would.",
    // Excluded — off-genre album despite a correct tag: caribou (Swim is a
    // dance-club/IDM-facing record, not psych-pop's guitar-and-studio-haze
    // sound). Excluded — already claimed elsewhere: mac-demarco and olivia-
    // tremor-control (Salad Days and Dusk at Cubist Castle are both already
    // used on lo-fi's own page). Cut for space: of-montreal.
    definingAlbums: [
      'silver-apples',
      'incredible-string-band',
      'the-shins',
      'neutral-milk-hotel',
      'mgmt',
      'tame-impala',
      'animal-collective',
      'mid-air-thief',
    ],
    sections: [
      {
        title: '1960s originators',
        blurb:
          "The two founding directions, a couple of years apart — the Incredible String Band's " +
          "British folk-psychedelia and Silver Apples' stranger, purely electronic answer to it.",
        artistIds: ['incredible-string-band', 'silver-apples'],
      },
      {
        title: 'Elephant 6 psych-pop',
        blurb:
          "A 1990s Georgia-based collective consciously chasing 1960s studio techniques on a " +
          "fraction of the original budget — homemade orchestration, tape collage, and a shared, " +
          "porous roster of musicians.",
        artistIds: ['neutral-milk-hotel', 'olivia-tremor-control', 'of-montreal'],
      },
      {
        title: '2000s indie psych-pop',
        blurb:
          "The sound brought to festival scale — five artists, otherwise unconnected, who each " +
          "found their own way to pop hooks wrapped in studio haze.",
        artistIds: ['the-shins', 'mgmt', 'animal-collective', 'mac-demarco', 'tame-impala'],
      },
      {
        title: 'Electronic-adjacent psych-pop',
        blurb:
          "Psychedelic-pop's most recent wing, reached through sampling and electronic production " +
          "rather than guitars and tape.",
        artistIds: ['caribou', 'mid-air-thief'],
      },
    ],
  },

  'idm': {
    deck:
      "Electronic music built for listening rather than dancing — knotty, deliberately inhuman " +
      "rhythm programming applied with a composer's patience rather than a DJ's. IDM took " +
      "techno's machinery and pointed it inward, chasing timbral detail and rhythmic complexity " +
      "a dancefloor has no real use for.",
    originParagraphs: [
      "The name is a compromise nobody especially likes — \"Intelligent Dance Music\" implies " +
        "everything else is unintelligent — but it stuck after Warp Records released the " +
        "Artificial Intelligence compilation in 1992, pitching a set of British and American " +
        "electronic producers as headphone music, chairs rather than a dancefloor. Warp had " +
        "already built its reputation on rave-adjacent bleep techno; Artificial Intelligence was " +
        "a deliberate turn toward the living room.",
      "Aphex Twin (Richard D. James) became the genre's most visible and prolific figure almost " +
        "immediately, releasing Selected Ambient Works 85–92 that same year and spending the " +
        "next decade alternating between that record's title and a much harsher, more abrasive " +
        "extreme. Autechre and Squarepusher pushed the same Warp-adjacent scene toward " +
        "increasingly granular rhythm programming through the mid-90s, treating the drum " +
        "machine itself as an instrument to be broken apart and reassembled rather than a beat " +
        "to be kept.",
    ],
    soundParagraph:
      "Rhythm is the genre's real subject — breakbeats chopped, resequenced, and layered into " +
      "polyrhythms no human drummer could physically play, run through the same granular, " +
      "glitch-attentive production that later fed into glitch and hyperpop. Melody and harmony " +
      "stay simple, often just a single held synth pad or arpeggio, so the ear has somewhere to " +
      "rest while the drum programming does the actual composing.",
    // Boards of Canada's Music Has the Right to Children and Aphex Twin's
    // Selected Ambient Works were both explicitly excluded from ambient's
    // own page for being IDM records first — this is where they actually
    // belong. Caribou's Swim, closer to house and dance music than IDM's
    // headphone-listening tradition despite the tag, is left off the grid.
    // Normalization pass: cut from 5 to 4 — Four Tet dropped, which removes
    // the "folktronica turn" section's own grid representation in favor of
    // the four hardest, most canonically IDM-defining records.
    definingAlbums: ['aphex-twin', 'autechre', 'boards-of-canada', 'squarepusher'],
    sections: [
      {
        title: 'The Warp generation',
        blurb:
          "The scene that actually built the genre in the 1990s, revolving around Warp Records " +
          "and a small circle of British producers pushing rhythm programming toward the " +
          "genuinely abstract.",
        artistIds: ['aphex-twin', 'autechre', 'boards-of-canada', 'squarepusher'],
      },
      {
        title: "IDM's folktronica turn",
        blurb:
          "A later generation folded IDM's production complexity into warmer, more song-based " +
          "and acoustic-adjacent material — the machinery stayed intricate, but the mood " +
          "softened.",
        artistIds: ['four-tet', 'caribou'],
      },
    ],
  },

  'industrial': {
    deck:
      "Music that treats the factory floor as an instrument — scrap metal, tape loops, and " +
      "synthesizers pushed toward deliberately harsh, mechanized noise. Industrial took punk's " +
      "confrontation and stripped out anything that could be mistaken for entertainment.",
    originParagraphs: [
      "Throbbing Gristle, forming in Hull in 1975 and coining the term itself via their own " +
        "Industrial Records label, treated the studio as a machine for producing calculated " +
        "unpleasantness — tape manipulation, distorted electronics, and deliberately abrasive " +
        "live performance art rather than songs in any conventional sense. Throbbing Gristle " +
        "isn't a node in this graph, but the scene's basic instinct — noise as confrontation, " +
        "the factory rather than the stage as the guiding image — runs through every artist " +
        "below.",
      "Suicide, working in New York around the same years with nothing but a drum machine and a " +
        "synthesizer, arrived at a parallel minimal, menacing electronic-punk sound with no " +
        "direct link to the UK scene; Cabaret Voltaire in Sheffield split the difference, closer " +
        "to Throbbing Gristle's tape-collage instinct but with more of a groove underneath it. " +
        "By the mid-80s the term had loosened enough to cover anything that treated distortion " +
        "and repetition as compositional tools rather than texture, which is how a British " +
        "free-improv-adjacent band like This Heat and a much later, stranger project like Coil " +
        "both ended up carrying the tag.",
    ],
    soundParagraph:
      "Repetition and distortion are structural, not decorative — a sequencer loop or a wall of " +
      "scraping noise can carry an entire track with almost no melodic development. Vocals are " +
      "often processed, shouted, or buried in the mix rather than sung conventionally, and the " +
      "palette draws as readily from tape manipulation, found sound, and non-musical noise " +
      "sources as from synthesizers or guitars.",
    // This Heat's Deceit is already claimed, in full, by post-rock's own
    // page (it's that genre's earliest founding record) — reusing it here
    // would just be leaning on the same cover twice, so This Heat appears
    // as a section member only. The remaining four are each artist's own
    // clearest industrial-defining record.
    definingAlbums: [
      'suicide',
      'cabaret-voltaire',
      'coil',
    ],
    sections: [
      {
        title: 'The founding wave, 1975–1981',
        blurb:
          "Suicide's stripped-down synth-punk menace and Cabaret Voltaire's tape-collage " +
          "electronics arrived from opposite ends of the Atlantic within a few years of " +
          "Throbbing Gristle coining the term itself.",
        artistIds: ['suicide', 'cabaret-voltaire', 'this-heat'],
      },
      {
        title: "Industrial's harsher descendants",
        blurb:
          "Swans took the scene's mechanized repetition into full-band, physically punishing " +
          "extremes; Coil, decades later, pushed the same source material toward something " +
          "stranger and more occult.",
        artistIds: ['swans', 'coil'],
      },
    ],
  },

  'drone': {
    deck:
      "Music reduced to sustained tone and almost nothing else — a single chord, or even a " +
      "single note, allowed to hang and slowly mutate for the length of an entire piece. Drone " +
      "takes ambient's patience and removes the last of its melodic incident, asking a listener " +
      "to sit inside one sound rather than follow it anywhere.",
    originParagraphs: [
      "Drone as a technique predates any genre built around it by decades — La Monte Young's " +
        "minimalist sustained-tone experiments in the early 1960s and centuries of raga and " +
        "Indian classical practice did the same thing long before rock or electronic music " +
        "picked it up. As its own recognizable current within this graph's world, though, drone " +
        "dates to around 1990, when Stars of the Lid began stretching guitar and tape loops " +
        "into pieces that could run twenty minutes on a single, barely-moving chord.",
      "The style spread in two directions from there: an electronic wing (Tim Hecker's " +
        "processed, physically overwhelming tone clouds) and a rock-adjacent one, where " +
        "slowcore's already glacial tempos (Low, Mount Eerie) and post-rock's quietest passages " +
        "(Mono, Dirty Three, Spiritualized) simply kept slowing down until incident disappeared " +
        "almost entirely.",
    ],
    soundParagraph:
      "A chord or drone tone is sustained far past the point a conventional song would resolve " +
      "it, with harmonic movement, if it happens at all, arriving gradually enough to notice " +
      "only in retrospect. Rhythm and percussion are minimal or absent, dynamics build through " +
      "volume and layering rather than a change in tempo, and the recording's own texture — " +
      "tape hiss, room tone, processed guitar feedback — often carries as much information as " +
      "any note being played.",
    // Coil's The Ape of Naples is already used, prominently, on industrial's
    // own page — repeating it here would lean on the same handful of
    // records rather than curate this page on its own terms. Mono's Hymn to
    // the Immortal Wind and Dirty Three's Ocean Songs, both genuinely
    // drone-adjacent, are cut for space in favor of picks that sit more
    // centrally in the genre; both are still represented as section members
    // below.
    definingAlbums: [
      'tim-hecker',
      'stars-of-the-lid',
      'grouper',
      'low',
      'anna-von-hausswolff',
    ],
    sections: [
      {
        title: "Ambient's outer edge",
        blurb:
          "Drone's most directly ambient-descended wing — tone and texture stretched past the " +
          "point where \"song\" is even the right word.",
        artistIds: ['tim-hecker', 'stars-of-the-lid', 'grouper', 'coil'],
      },
      {
        title: "Slowcore's drone wing",
        blurb:
          "Slowcore's already glacial tempos, taken all the way to a full stop — these three " +
          "carry both tags, and the slower of the two eventually wins out entirely.",
        artistIds: ['mount-eerie', 'low', 'have-a-nice-life'],
      },
      {
        title: "Post-rock's droniest edge",
        blurb:
          "Artists whose post-rock leans on sustained tone and volume rather than crescendo and " +
          "release — the quietest, least song-shaped corner of that genre.",
        artistIds: ['mono', 'spiritualized', 'dirty-three'],
      },
      {
        title: 'Gothic and orchestral drone',
        blurb:
          "Anna von Hausswolff builds drone out of pipe organ and gothic scale rather than " +
          "guitar or synthesizer — a stranger, more liturgical register than anywhere else on " +
          "this page.",
        artistIds: ['anna-von-hausswolff'],
      },
    ],
  },

  'trip-hop': {
    deck:
      "Hip-hop's sampled breakbeats slowed to a crawl and soaked in dub bass and cinematic " +
      "strings — a Bristol-born sound built for late nights and comedowns rather than the " +
      "dancefloor or the block party. Trip-hop is one of the few genres here genuinely tied to a " +
      "single city.",
    originParagraphs: [
      "Massive Attack's Blue Lines, released in Bristol in 1991, set almost the entire template " +
        "at once: hip-hop's sampling and breakbeat foundation, slowed down and layered with dub " +
        "reggae's bass weight and soul-inflected vocal features, all wrapped in a moody, " +
        "cinematic production sheen. The name itself came a little later, coined by the UK music " +
        "press to describe the wider Bristol scene the record helped kick off.",
      "Portishead (Dummy, 1994) and Tricky (Maxinquaye, 1995 — Tricky had been part of Massive " +
        "Attack's own collective) pushed the same Bristol sound toward starker, more paranoid " +
        "extremes within a few years of Blue Lines, while Sneaker Pimps carried a slicker, more " +
        "song-based version of it into the mid-90s British charts. More than a decade later, " +
        "Burial's Untrue (2007) revived the mood — hip-hop and 2-step garage slowed and " +
        "submerged in reverb — for a UK garage-adjacent generation with no direct link to " +
        "Bristol at all.",
    ],
    soundParagraph:
      "Breakbeats and samples run at hip-hop tempos or slower, with dub reggae's deep, spacious " +
      "bass and echo treated as load-bearing rather than incidental. Vocals, when present, are " +
      "often hushed, soulful, or half-spoken rather than rapped, and the mix stays dark, " +
      "reverberant, and unhurried — mood and atmosphere carry the track more than any single " +
      "hook.",
    // Normalization pass: cut from 5 to 4 — Sneaker Pimps dropped, the
    // slickest and least essential of the five, keeping the Bristol
    // founding trio plus Burial's modern revival.
    definingAlbums: ['massive-attack', 'portishead', 'tricky', 'burial'],
    sections: [
      {
        title: 'The Bristol sound, 1991–1996',
        blurb:
          "The scene that actually built the genre — a small, tightly linked circle of Bristol " +
          "producers slowing hip-hop down and soaking it in dub.",
        artistIds: ['massive-attack', 'portishead', 'tricky', 'sneaker-pimps'],
      },
      {
        title: 'A later revival',
        blurb:
          "Burial revived trip-hop's hushed, reverberant mood over a decade later, filtered " +
          "through 2-step garage rather than Bristol's original dub and soul influences.",
        artistIds: ['burial'],
      },
    ],
  },

  'neo-psychedelia': {
    deck:
      "60s psychedelia's studio experimentation and cosmic ambition, revived by artists with no " +
      "direct link to the original scene beyond a shared record collection. Neo-psychedelia " +
      "treats the 1960s not as a place to return to but as a toolkit — vintage synths, backwards " +
      "tape, maximalist arrangement — for building something new.",
    originParagraphs: [
      "The Flaming Lips and Mercury Rev both emerged around 1990 pushing American indie rock " +
        "toward the 1960s' most extravagant studio techniques — layered tape effects, orchestral " +
        "arrangement, songs that swelled rather than just played — at a moment when the wider " +
        "indie underground was mostly moving the opposite direction, toward lo-fi minimalism. " +
        "Mercury Rev isn't a node in this graph, but the Flaming Lips' own arc from noisy guitar " +
        "band toward The Soft Bulletin's symphonic maximalism follows exactly that same " +
        "instinct.",
      "Mazzy Star, working slightly earlier out of Los Angeles's Paisley Underground scene, " +
        "carried a quieter, more Southern-gothic version of the same 60s inheritance. A much " +
        "larger second wave arrived in the 2010s, once Tame Impala's bedroom-studio take on the " +
        "sound proved a single producer with vintage gear and a laptop could chase the same " +
        "cosmic scale the Flaming Lips had needed a full band and a real budget for.",
    ],
    soundParagraph:
      "Vintage analog synthesizers, phased and flanged guitar, and dense, layered studio " +
      "production stand in for the actual 1960s gear the originators mostly couldn't afford or " +
      "didn't have — the psychedelic textures are usually rebuilt from scratch, not genuinely " +
      "vintage. Songs favor long instrumental passages, sudden tempo or key shifts, and a " +
      "general studio-as-instrument ambition over anything approaching a lean three-minute pop " +
      "structure.",
    // Mazzy Star's So Tonight That I Might See is already claimed, as a
    // definingAlbum, on dream-pop's own page — reusing it here would just
    // be the same cover on two different genre pages. She's still
    // represented as a section member below.
    // Normalization pass: cut from 5 to 4 — Candy Claws dropped, the most
    // niche of the five, keeping the genre's co-founder plus its three
    // biggest 2010s-revival names.
    definingAlbums: ['the-flaming-lips', 'tame-impala', 'king-gizzard-and-the-lizard-wizard', 'mid-air-thief'],
    sections: [
      {
        title: 'The first wave, 1988–1990',
        blurb:
          "Mazzy Star's Paisley Underground haze and the Flaming Lips' early art-damaged " +
          "noise-pop both revived the 1960s' studio ambition before the term \"neo-psychedelia\" " +
          "had really caught on.",
        artistIds: ['mazzy-star', 'the-flaming-lips'],
      },
      {
        title: 'The 2010s revival',
        blurb:
          "A much larger second wave, built mostly out of bedroom studios rather than full bands " +
          "— Tame Impala's solo-recorded cosmic pop, King Gizzard's relentless genre-hopping " +
          "prolificacy, and a quieter, more internet-native strand in Mid-Air Thief and Candy " +
          "Claws.",
        artistIds: ['tame-impala', 'king-gizzard-and-the-lizard-wizard', 'mid-air-thief', 'candy-claws'],
      },
    ],
  },

  'experimental-pop': {
    deck:
      "Pop songcraft used as a container for whatever the artist actually wants to do with it — " +
      "collage, noise, extreme production manipulation, structural left turns — without ever " +
      "quite abandoning the hook. Experimental-pop keeps pop's basic promise of a memorable " +
      "melody while breaking almost every other rule around it.",
    originParagraphs: [
      "Silver Apples, building entire 1968 pop songs out of homemade oscillators years before " +
        "synthesizers were an off-the-shelf instrument, is the genre's clearest early ancestor — " +
        "melody and hook fully intact, the actual sound source almost unrecognizable as a rock " +
        "band. But the term itself dates to the mid-90s, when Stereolab's lounge-and-krautrock " +
        "collage and the Olivia Tremor Control's tape-loop maximalism (both get fuller tellings " +
        "elsewhere on this site) proved a pop song could survive almost any amount of studio " +
        "interference.",
      "Animal Collective picked up that same instinct in the 2000s, wrapping genuinely strange, " +
        "layered production around real, often gorgeous melodies, and a more recent, " +
        "internet-native generation — Jockstrap's genre-splicing production, Kero Kero Bonito's " +
        "hyper-bright maximalism, yeule's glitch-damaged intimacy — has kept pushing the same " +
        "basic bargain into stranger territory since.",
    ],
    soundParagraph:
      "Production techniques and structural choices that would derail a straightforward pop " +
      "song — abrupt genre or tempo shifts, heavily processed or distorted vocals, collaged and " +
      "sample-based arrangement — are deployed in service of a melody that still, eventually, " +
      "resolves into something hummable. The tension between the two is the whole point: this " +
      "is meant to sound both approachable and genuinely strange at once.",
    // Stereolab and the Olivia Tremor Control, the genre's own emergedBasis
    // reference, don't actually carry the experimental-pop tag in the
    // graph's data (Stereolab is filed under krautrock/art-pop/indie-rock,
    // Olivia Tremor Control under psychedelic-pop/lo-fi) — real, foundational
    // influences on the sound, mentioned above for that reason, but not
    // eligible for a definingAlbums card here. Julia Holter's Have You in My
    // Wilderness is already claimed, as a definingAlbum, on art-pop's own
    // page.
    // Normalization pass: cut from 6 to 4 — Kero Kero Bonito and yeule
    // dropped, keeping Silver Apples and Animal Collective as the
    // originator/major-figure pair alongside Jockstrap and Xiu Xiu as the
    // most substantial of the 21st-century generation.
    definingAlbums: [
      'silver-apples',
      'animal-collective',
      'jockstrap',
      'xiu-xiu',
      'stereolab',
      'olivia-tremor-control',
    ],
    sections: [
      {
        title: 'Studio-as-instrument originators',
        blurb:
          "Silver Apples built the template decades before the genre had a name; Xiu Xiu, " +
          "Animal Collective, and Julia Holter each found their own way to wrap genuinely " +
          "strange production around real melody.",
        artistIds: ['silver-apples', 'xiu-xiu', 'animal-collective', 'julia-holter', 'stereolab', 'olivia-tremor-control'],
      },
      {
        title: 'The 21st-century pop-collage generation',
        blurb:
          "A younger, hyper-online generation pushed the same bargain toward glitch, " +
          "genre-splicing, and hyper-bright maximalism.",
        artistIds: ['jockstrap', 'kero-kero-bonito', 'yeule'],
      },
    ],
  },

  'art-rock': {
    deck:
      "Rock ambition borrowed from the art gallery rather than the blues bar — conceptual " +
      "seriousness, theatrical persona, and a studio treated as a compositional tool in its own " +
      "right. Art-rock is this graph's oldest root genre, running in an unbroken line from 1967 " +
      "to the present.",
    originParagraphs: [
      "The Velvet Underground & Nico, released in 1967, is as close to a single founding " +
        "document as this graph's genres get — Lou Reed and John Cale's fusion of pop songcraft " +
        "with Cale's classical-avant-garde training and Andy Warhol's art-world backing, " +
        "treating a rock record as something that could carry the same seriousness as a gallery " +
        "show. Nico's own solo work extended the same instinct into something colder and more " +
        "chamber-like within a few years.",
      "The idea proved durable rather than a single moment — David Bowie spent the 1970s " +
        "demonstrating that a new persona and sonic palette could arrive with every record, " +
        "Television and Talking Heads brought a more angular, art-school version of the same " +
        "seriousness to CBGB's stage a few years later, and the whole tradition has kept " +
        "absorbing new scenes ever since, from 1980s British post-punk's own art-damaged wing " +
        "through a genuinely global 21st-century revival.",
    ],
    soundParagraph:
      "There's no single defining riff or rhythm here — art-rock is a stance more than a sound " +
      "— but a few habits recur: a studio used compositionally rather than just to capture a " +
      "live performance, structures that avoid straightforward verse-chorus repetition, and " +
      "lyrics or personas that read as authored and self-aware rather than unguarded. Where the " +
      "genre does get loud, the intensity tends to build gradually and deliberately rather than " +
      "arrive as a straightforward rock riff.",
    // Excluded — already claimed as a definingAlbum on another page:
    // talking-heads (post-punk), can (krautrock), david-bowie and st-vincent
    // (art-pop), patti-smith and x-ray-spex (punk), the-fall (post-punk),
    // godspeed-you-black-emperor and talk-talk (post-rock). Wire's Pink Flag
    // is also left off — post-punk's own page already makes the case that
    // it reads as punk minimalism rather than art-rock's own thing. Spoon's
    // Kill the Moonlight and The Walkmen's Bows + Arrows are genuinely
    // art-rock-adjacent but claimed instead on indie-rock's own page (this
    // same batch), which needed them more. Cut for space, real candidates:
    // fishmans, geese, black-midi, black-country-new-road, squid,
    // everything-everything.
    definingAlbums: [
      'velvet-underground',
      'nico',
      'television',
      'nick-cave-and-the-bad-seeds',
      'broadcast',
      'radiohead',
      'jeff-buckley',
      'tom-waits',
      'david-bowie',
      'can',
      'talking-heads',
    ],
    sections: [
      {
        title: 'The founding wave, 1967–1980',
        blurb:
          "The genre's actual originators — American art-school seriousness (Velvet Underground, " +
          "Television, Talking Heads), Bowie's persona-driven glam, and a UK post-punk wing " +
          "(Wire, X-Ray Spex) that carried the same ambition into a rawer, more confrontational " +
          "register.",
        artistIds: ['velvet-underground', 'nico', 'david-bowie', 'can', 'television', 'talking-heads', 'patti-smith', 'wire', 'x-ray-spex'],
      },
      {
        title: "Art-rock's 1980s and 90s turn",
        blurb:
          "A second generation took the same seriousness in gothic, chamber, and " +
          "post-rock-adjacent directions — Nick Cave's baroque menace, Talk Talk's dissolution " +
          "into near-classical calm, Godspeed's orchestral maximalism, and a handful of artists " +
          "(Fishmans, Broadcast, Tom Waits) building entirely idiosyncratic versions of the " +
          "same idea.",
        artistIds: ['the-fall', 'nick-cave-and-the-bad-seeds', 'talk-talk', 'jeff-buckley', 'godspeed-you-black-emperor', 'fishmans', 'broadcast', 'tom-waits'],
      },
      {
        title: 'The 21st-century UK wing',
        blurb:
          "A new generation of UK bands — Radiohead chief among them — kept art-rock's " +
          "structural ambition alive well past the genre's supposed expiration date, feeding " +
          "directly into the 2020s Windmill-scene wave of black midi, Black Country New Road, " +
          "and Squid.",
        artistIds: ['radiohead', 'everything-everything', 'black-midi', 'black-country-new-road', 'squid'],
      },
      {
        title: 'The 21st-century American wing',
        blurb:
          "An American answer running in parallel — Wilco and Spoon's studio-experimental turn " +
          "on straightforward rock songwriting, The Walkmen's brooding grandeur, St. Vincent's " +
          "persona-driven guitar theatrics, and Geese's recent, deliberately unclassifiable " +
          "arrival.",
        artistIds: ['wilco', 'spoon', 'the-walkmen', 'st-vincent', 'geese'],
      },
    ],
  },

  'alt-rock': {
    deck:
      "Not a sound so much as a decades-long argument about what counted as an alternative to " +
      "the mainstream — American college-radio bands who wanted nothing to do with arena rock, " +
      "then, after Nirvana's Nevermind made \"alternative\" a chart category, a marketing label " +
      "stretched over almost anything guitar-based that wasn't classic rock or metal. There is " +
      "no single alt-rock sound; that absence is the actual story.",
    originParagraphs: [
      "The term predates Nirvana by years — American college radio in the mid-to-late 1980s " +
        "built an entire circuit (R.E.M., Hüsker Dü, The Replacements, Sonic Youth, the Pixies, " +
        "Dinosaur Jr.) out of bands the major labels and commercial rock radio had no use for, " +
        "unified by where they got played and how they toured rather than by a shared riff or " +
        "tempo. That circuit is \"alternative\" in the term's original, literal sense: an " +
        "alternative to the mainstream, not yet a genre of its own.",
      "Nirvana's Nevermind (1991) collapsed the distinction almost overnight — a record built " +
        "out of the same underground's vocabulary (the Pixies' loud-quiet-loud dynamics chief " +
        "among its acknowledged influences) sold itself straight into the mainstream it had " +
        "defined itself against, and \"alternative\" became a radio format and a record-store bin " +
        "as much as a description of anything specific. Everything that followed — a wave of 90s " +
        "bands signed in Nevermind's wake, Britpop's own UK answer to the same moment, and a " +
        "2000s-onward revival that kept reaching for the label — inherited the name without " +
        "inheriting a single sound to go with it.",
    ],
    soundParagraph:
      "Because alt-rock is a category built from chart position, label marketing, and radio " +
      "format rather than a shared musical technique, describing \"the alt-rock sound\" would be " +
      "dishonest — a jangly R.E.M. record, Nirvana's guitar violence, Beck's genre-collage, and " +
      "Radiohead's studio experimentation have almost nothing sonically in common beyond guitars " +
      "and a rough contemporaneity. What actually unifies the artists below is a shared " +
      "relationship to the mainstream — outside it, then briefly inside it, then a label applied " +
      "retroactively to whatever came next that wasn't quite pop, metal, or classic rock.",
    // Excluded — already claimed as a definingAlbum elsewhere: R.E.M.
    // (indie-pop), Pixies, Sonic Youth, and Dinosaur Jr. (noise-rock),
    // Bikini Kill (punk), Radiohead (art-rock's own page, this same batch),
    // The Flaming Lips (neo-psychedelia's own page, this same batch).
    // Everything Everything is a real, if more marginal, candidate cut for
    // space.
    definingAlbums: [
      'husker-du',
      'the-replacements',
      'nirvana',
      'built-to-spill',
      'modest-mouse',
      'hum',
      'the-cranberries',
      'blur',
      'beck',
      'the-strokes',
      'the-white-stripes',
      'sonic-youth',
      'pixies',
      'rem',
      'radiohead',
    ],
    sections: [
      {
        title: 'The college-radio wave, 1983–1991',
        blurb:
          "The actual originators of \"alternative\" as a description — bands who built a " +
          "self-sufficient touring and radio circuit specifically because commercial rock radio " +
          "and MTV had no use for them.",
        artistIds: ['rem', 'husker-du', 'the-replacements', 'pixies', 'sonic-youth', 'dinosaur-jr'],
      },
      {
        title: 'The 1990s alternative explosion',
        blurb:
          "Nevermind's crossover pulled a whole underground into the mainstream at once — some " +
          "of it (Nirvana itself, Beck) genuinely mainstream-scale, some of it (Bikini Kill, " +
          "Pavement) still resolutely independent despite carrying the same new label.",
        artistIds: ['nirvana', 'pavement', 'built-to-spill', 'modest-mouse', 'hum', 'the-cranberries', 'blur', 'bikini-kill', 'beck'],
      },
      {
        title: 'Alt-rock as marketing category, 1997–2010s',
        blurb:
          "Once \"alternative\" had become a radio format rather than a real description, it " +
          "stretched to cover almost anything guitar-based and not-quite-mainstream — a 2000s " +
          "rock revival, Radiohead's studio ambition, and a decade-plus of bands that inherited " +
          "the shelf label without inheriting a sound.",
        artistIds: ['radiohead', 'the-strokes', 'the-white-stripes', 'the-flaming-lips', 'silversun-pickups'],
      },
      {
        title: 'The 21st-century wing',
        blurb:
          "A newer, mostly British generation — plus Washington DC's Mary Timony, a 90s veteran " +
          "carrying the tag into her later solo work — kept reaching for the same loose umbrella " +
          "decades after it stopped describing anything specific.",
        artistIds: ['wolf-alice', 'everything-everything', 'mary-timony'],
      },
    ],
  },

  'indie-rock': {
    deck:
      "The word \"indie\" started as a description of who released a record, not what it sounded " +
      "like — an independent label, outside the major-label system, however that label's actual " +
      "sound varied. Indie-rock is this graph's broadest genre by far, and honestly, there's no " +
      "single indie-rock sound underneath the label — the narrower genres nested beneath it " +
      "(lo-fi, indie-pop, noise-rock, chamber-pop, and more) are where the real sonic " +
      "distinctions actually live.",
    originParagraphs: [
      "The word predates any specific sound — \"independent\" originally described a record's " +
        "distribution and financing, not its genre, and stayed that way through the UK's " +
        "Postcard/C86 scene and the American college-radio circuit of the 1980s. What changed " +
        "around 1990 was consolidation: Sub Pop's grunge breakthrough proved an independent " +
        "label could actually compete commercially, and \"indie\" started hardening into a " +
        "recognizable identity and an implied stance — DIY infrastructure, an arm's-length " +
        "relationship with the mainstream industry, guitar-based songwriting — even as major " +
        "labels immediately began signing away the scene's most successful bands.",
      "From there indie-rock stopped being a coherent sound and became something closer to a " +
        "family tree with dozens of branches, each eventually specific enough to earn its own " +
        "name and its own page on this site: lo-fi's four-track aesthetic, indie-pop's jangling " +
        "melodicism, noise-rock's dissonance, chamber-pop's orchestration, and so on. What " +
        "follows is the trunk those branches grew from — a genuinely enormous, thirty-year span " +
        "of bands whose only reliable common thread is an independent, guitar-centered " +
        "relationship to the music industry rather than any one riff, tempo, or production " +
        "choice.",
    ],
    soundParagraph:
      "There isn't an \"indie-rock sound\" any more than there's an \"alt-rock sound\" — this " +
      "genre's own artists run from The Smiths' jangle to Sleater-Kinney's punk urgency to " +
      "Grizzly Bear's chamber-pop orchestration to Alex G's bedroom four-track, with almost " +
      "nothing sonically uniting them. What unites them instead is a shared relationship to " +
      "independent labels and DIY infrastructure, a general (if inconsistently applied) " +
      "skepticism toward major-label polish, and, later, an ethos more than an industry " +
      "structure — a stance a band could hold even signed to a major, once \"indie\" stopped " +
      "being a literal description of distribution and became a genre label in its own right.",
    // Excluded — already claimed as a definingAlbum elsewhere: Pavement,
    // Sebadoh, Guided by Voices, Liz Phair, Alex G, Mac DeMarco, and Car
    // Seat Headrest (all lo-fi's own page); The Smiths, The Stone Roses,
    // Belle and Sebastian, and The Shins (indie-pop); Destroyer and Grizzly
    // Bear (art-pop); Built to Spill, Modest Mouse, Hum, Blur, and The
    // Strokes (alt-rock's own page, this same batch); Galaxie 500
    // (dream-pop). Mary Timony has no album on file. A dozen genuinely
    // defining records remain even after all of that — this page alone
    // couldn't fit every one of the 51 artists tagged here, and the twelve
    // below were picked to span the genre's full thirty-year, four-section
    // range rather than cluster in any one era.
    definingAlbums: [
      'stereolab',
      'fontaines-dc',
      'neutral-milk-hotel',
      'the-dismemberment-plan',
      'violent-femmes',
      'wilco',
      'arcade-fire',
      'vampire-weekend',
      'broken-social-scene',
      'wednesday',
      'waxahatchee',
      'mitski',
      'snail-mail',
    ],
    sections: [
      {
        title: 'The UK and Irish wing',
        blurb:
          "A parallel, non-American indie-rock lineage — Manchester and Glasgow's " +
          "jangle-and-Britpop tradition, an art-rock/lounge strand in Stereolab, and a " +
          "2010s–2020s Irish and English revival.",
        artistIds: ['the-smiths', 'the-stone-roses', 'blur', 'stereolab', 'belle-and-sebastian', 'camera-obscura', 'editors', 'fontaines-dc'],
      },
      {
        title: 'The 90s American underground',
        blurb:
          "The genre's actual founding generation and its widest, most varied section — lo-fi " +
          "four-trackers, riot grrrl's DC/Olympia wing, alt-country's early crossover, and a " +
          "scattering of college-radio bands who never fit any narrower label.",
        artistIds: [
          'pavement',
          'yo-la-tengo',
          'built-to-spill',
          'modest-mouse',
          'liz-phair',
          'duster',
          'hum',
          'the-dismemberment-plan',
          'sebadoh',
          'guided-by-voices',
          'wilco',
          'sleater-kinney',
          'violent-femmes',
          'superchunk',
          'spoon',
          'neutral-milk-hotel',
          'galaxie-500',
          'drive-by-truckers',
          'mary-timony',
        ],
      },
      {
        title: 'The 2000s indie wave',
        blurb:
          "The post-Strokes \"rock revival\" and blog-rock era — New York's garage-adjacent " +
          "scene, a wave of orchestral and chamber-pop-leaning bands, and a Toronto collective " +
          "that became indie-rock's clearest 2000s crossover success.",
        artistIds: [
          'deerhunter',
          'interpol',
          'the-strokes',
          'yeah-yeah-yeahs',
          'the-national',
          'destroyer',
          'the-walkmen',
          'the-shins',
          'grizzly-bear',
          'arcade-fire',
          'vampire-weekend',
          'pinback',
          'broken-social-scene',
        ],
      },
      {
        title: 'The 2010s–2020s generation',
        blurb:
          "The genre's most recent chapter — bedroom-pop and lo-fi-adjacent production, an " +
          "alt-country-leaning Southern wing, and a math-rock-adjacent fringe — proof " +
          "\"indie-rock\" still means something even after three decades of absorbing everything " +
          "nearby.",
        artistIds: [
          'geese',
          'mitski',
          'japanese-breakfast',
          'mac-demarco',
          'parquet-courts',
          'car-seat-headrest',
          'beabadoobee',
          'alex-g',
          'mj-lenderman',
          'wednesday',
          'waxahatchee',
          'snail-mail',
        ],
      },
    ],
  },

  'riot-grrrl': {
    deck:
      "Feminist punk's most explicitly political wave — DIY zines, confrontational live sets, and " +
      "lyrics that made gendered violence and access to the stage central subject matter rather " +
      "than subtext. Riot grrrl grew out of one specific place and moment, Olympia, Washington in " +
      "the early 1990s, before spreading into a loose, self-organized national network.",
    originParagraphs: [
      "Bikini Kill formed in Olympia in 1990, and Kathleen Hanna's zine writing the following year " +
        "gave the movement its name and its founding document — a call for girls to start bands, " +
        "start zines, and route around the punk scene's boy's-club gatekeeping rather than " +
        "politely ask to join it. Bratmobile, forming in Olympia that same year, ran a parallel " +
        "track, releasing 1993's Pottymouth as a scrappier, more overtly pop-damaged take on the " +
        "same confrontational instinct.",
      "Sleater-Kinney arrived slightly later, in 1994, growing directly out of that Olympia scene's " +
        "DIY, explicitly feminist tradition without ever quite settling inside its boundaries — " +
        "Corin Tucker and Carrie Brownstein's interlocking guitars pushed the sound toward something " +
        "more structurally ambitious than riot grrrl's founding bands had attempted. The movement's " +
        "reach extended well beyond what this graph currently tracks: Huggy Bear carried the UK's " +
        "own answer to the scene, and Heavens to Betsy — Corin Tucker's band before Sleater-Kinney " +
        "— worked the same Olympia circuit from its earliest days, both real riot grrrl acts sitting " +
        "outside this graph's current roster.",
    ],
    soundParagraph:
      "Guitars stay simple and driving, closer to hardcore's economy than to punk's own melodic " +
      "wing, with vocals shouted, screamed, or half-spoken rather than sung pretty. Recording " +
      "quality is often deliberately rough — an aesthetic shared with the movement's zine culture, " +
      "where an unpolished surface read as honesty rather than a budget limitation — and lyrics " +
      "confront sexual violence, body politics, and who gets to hold the microphone as directly as " +
      "the music itself does.",
    // All 3 riot-grrrl-tagged artists' classicAlbums are genuinely riot-
    // grrrl-defining — no exclusions, no padding needed at this size.
    definingAlbums: ['bikini-kill', 'bratmobile', 'sleater-kinney'],
    sections: [
      {
        title: "Olympia's founding network",
        blurb:
          "Riot grrrl was never one band so much as a scene organized entirely on its own terms — " +
          "Bikini Kill's founding manifesto, Bratmobile's parallel Olympia circuit, and Sleater-" +
          "Kinney's slightly later, more structurally ambitious arrival, all growing out of the same " +
          "DIY network.",
        artistIds: ['bikini-kill', 'bratmobile', 'sleater-kinney'],
      },
    ],
  },

  vaporwave: {
    deck:
      "A hauntological, internet-native genre built almost entirely from other music — corporate " +
      "soft-rock, elevator jazz, and 80s/90s consumer-culture ephemera slowed, looped, and pitched " +
      "down until it reads as memory rather than source material. Vaporwave arrived fully formed on " +
      "the internet in 2010, with no touring circuit or physical scene in the traditional sense.",
    originParagraphs: [
      "The genre's actual starting point is a single, anonymously released project: Chuck Person's " +
        "Eccojams Vol. 1 (2010), a collection of pitched-down, chopped, and endlessly looped samples " +
        "of soft-rock and R&B radio staples. \"Chuck Person\" was revealed to be Daniel Lopatin's " +
        "own alias — the same Daniel Lopatin who records as Oneohtrix Point Never — meaning the " +
        "genre's founding document and one of its most celebrated ambient artists are, quite " +
        "literally, the same person working under two names.",
      "The style spread almost entirely through Bandcamp and small online labels rather than any " +
        "venue circuit, splitting into a more ambient, atmosphere-first wing (death's dynamic " +
        "shroud, the duo 2814) and a more song-based, synth-pop-facing one that George Clanton's " +
        "Slide (2018) represents — vaporwave's nostalgia turned into actual verse-chorus songwriting " +
        "rather than pure sample collage.",
    ],
    soundParagraph:
      "Samples are pitched down, slowed, and looped past the point of easy recognition, with tape " +
      "hiss, chorus, and reverb layered on to suggest a half-remembered VHS tape rather than a clean " +
      "digital source. Structure favors extended, repetitive vamps over verse-chorus form — mood " +
      "and nostalgia carry the track more than melodic development does — though the genre's more " +
      "recent, pop-facing wing has folded the same washed-out palette into actual song structure.",
    // All 4 vaporwave-tagged artists' classicAlbums are genuinely vaporwave-
    // defining — no exclusions needed at this size. Oneohtrix Point Never's
    // Replica (2011), released under his own name rather than the Chuck
    // Person alias, is still the right pick here: it's the record where the
    // genre's chopped-sample technique became a fully composed album rather
    // than a loop collection.
    definingAlbums: ['oneohtrix-point-never', 'deaths-dynamic-shroud', '2814', 'george-clanton'],
    sections: [
      {
        title: 'An internet-native lineage',
        blurb:
          "Vaporwave never had a physical scene to organize around — Oneohtrix Point Never's " +
          "anonymous Chuck Person alias effectively founded it, death's dynamic shroud and 2814 " +
          "pushed its ambient, atmosphere-first wing forward, and George Clanton brought the same " +
          "nostalgia into actual pop songwriting.",
        artistIds: ['oneohtrix-point-never', 'deaths-dynamic-shroud', '2814', 'george-clanton'],
      },
    ],
  },

  'power-pop': {
    deck:
      "British Invasion melody and Beatles-scale hooks run through a harder, more economical rock " +
      "band — verse-chorus-bridge discipline, big vocal harmonies, and almost no interest in a " +
      "guitar solo outstaying its welcome. Power-pop is one of this graph's oldest root genres, and " +
      "its own direct descendant, jangle-pop, gets a full page of its own.",
    originParagraphs: [
      "Big Star's #1 Record, released in Memphis in 1972, set the template over a decade before " +
        "most of the genre's later names arrived: Alex Chilton and Chris Bell married Beatles-" +
        "descended melody to real rock crunch, to almost no commercial notice at the time and full " +
        "canonization only in retrospect. The name itself was applied retroactively, to a scattered " +
        "handful of bands who'd been chasing the same hooks-first instinct independently.",
      "Buzzcocks, forming in Manchester in 1976, ran the same melodic discipline through punk's " +
        "speed and confrontation, proving the hooks-first approach could survive a much faster " +
        "tempo. The Replacements, arriving from Minneapolis a few years later, folded power-pop's " +
        "economy into a rawer, more chaotic college-rock sensibility — a lineage that runs from " +
        "Memphis through Manchester to Minneapolis with barely any direct contact between the three " +
        "scenes. The genre's own most direct descendant, jangle-pop, split off in 1983 to chase one " +
        "specific piece of that toolkit — the ringing, arpeggiated guitar tone — and gets its own " +
        "fuller page.",
    ],
    soundParagraph:
      "Songs stay tightly structured — verse, chorus, bridge, rarely much longer — built on big " +
      "major-key hooks and vocal harmonies borrowed straight from the British Invasion. Guitars " +
      "alternate between ringing arpeggios and real rock crunch depending on the band, but the " +
      "guitar solo, where it exists at all, stays short and serves the song rather than showcasing " +
      "the player.",
    // All 3 power-pop-tagged artists' classicAlbums are genuinely power-pop-
    // defining — no exclusions needed. Big Star's #1 Record also anchors
    // jangle-pop's own page; the album genuinely earns both tags — jangle-
    // pop's page frames it as the guitar-tone template, this page as the
    // genre's founding hooks-first record — different angles on the same
    // record, not a duplicate.
    definingAlbums: ['big-star', 'buzzcocks', 'the-replacements'],
    sections: [
      {
        title: 'Memphis to Manchester to Minneapolis',
        blurb:
          "Three scenes, decades apart in reach but barely in contact with each other directly — " +
          "Big Star wrote the template in Memphis, Buzzcocks ran it through punk's speed in " +
          "Manchester, and The Replacements folded it into college-rock chaos in Minneapolis.",
        artistIds: ['big-star', 'buzzcocks', 'the-replacements'],
      },
    ],
  },

  'freak-folk': {
    deck:
      "Folk's mystical, psychedelic wing — harp and banjo drone, communal outsider aesthetics, and " +
      "a deliberate embrace of the strange over the plainspoken. The name was coined in 2003 for a " +
      "specific early-2000s scene built around Devendra Banhart, who isn't a node in this graph but " +
      "whose records are the reason the genre has a name at all.",
    originParagraphs: [
      "Devendra Banhart's earliest records — recorded lo-fi, steeped in outsider folk and a self-" +
        "consciously backwoods aesthetic — gave critics a term to reach for by 2003, the same year " +
        "Joanna Newsom's harp-based, asymmetrically melodic songwriting arrived as the movement's " +
        "other defining voice. Newsom's Ys (2006), a five-song, orchestrally arranged record built " +
        "on her own harp playing, pushed the genre's ambition well past the loose, campfire " +
        "informality its name suggests.",
      "Bonnie Prince Billy's I See a Darkness predates the coined term by four years, but Will " +
        "Oldham's craggy, plainspoken Appalachian-gothic songwriting was absorbed into the freak-" +
        "folk conversation almost immediately once the label existed — an elder influence claimed " +
        "retroactively rather than a founding member by chronology. Animal Collective took the same " +
        "communal, outsider spirit toward something stranger and more electronic — Merriweather " +
        "Post Pavilion (2009) folds freak-folk's hand percussion and layered vocal harmony into " +
        "dense, psychedelic pop production. Vetiver, Devendra Banhart's frequent collaborator, " +
        "worked the same circuit from close to its center — another real freak-folk act sitting " +
        "outside this graph's current roster.",
    ],
    soundParagraph:
      "Acoustic instruments — harp, banjo, fingerpicked guitar — carry the songs, but the " +
      "arrangements borrow psychedelia's studio patience and drone's sense of space rather than " +
      "staying inside folk's plainer tradition. Vocal delivery ranges from Newsom's high, unusually " +
      "phrased asymmetry to Oldham's near-spoken drawl, and song structures favor incantation and " +
      "repetition over a clean verse-chorus shape.",
    // All 3 freak-folk-tagged artists' classicAlbums are genuinely freak-
    // folk-defining — no exclusions needed at this size.
    definingAlbums: ['joanna-newsom', 'bonnie-prince-billy', 'animal-collective'],
    sections: [
      {
        title: 'A small, deliberately strange lineage',
        blurb:
          "Devendra Banhart's early records gave the scene its name in 2003, and Joanna Newsom's " +
          "harp-driven ambition, Bonnie Prince Billy's Appalachian-gothic elder status, and Animal " +
          "Collective's electronic-psych turn show just how wide the genre's actual range runs.",
        artistIds: ['joanna-newsom', 'bonnie-prince-billy', 'animal-collective'],
      },
    ],
  },

  britpop: {
    deck:
      "Mid-90s British guitar-pop, self-consciously English in its reference points and its accent, " +
      "arriving as a direct answer to American grunge's chart dominance. This graph covers only its " +
      "arty, lyrically observational half — Britpop's biggest chart-topping names sit outside its " +
      "current scope.",
    originParagraphs: [
      "Suede's 1993 debut is often credited with sparking the movement, but Britpop crystallized as " +
        "a named phenomenon in 1994, when Blur's Parklife and Oasis' Definitely Maybe both arrived " +
        "within months of each other, each claiming a very different version of English identity — " +
        "Blur's arch, observational suburbia against Oasis' widescreen, working-class swagger. Pulp, " +
        "already a decade into an overlooked career by that point, found their commercial moment a " +
        "year later with Different Class (1995), Jarvis Cocker's class-conscious character studies " +
        "giving the movement its sharpest lyrical eye.",
      "Blur and Oasis' rivalry became the era's defining spectacle, reaching a head in August 1995 " +
        "when both bands released singles on the same day — a chart event British tabloids covered " +
        "as a genuine culture war. Elastica brought a more angular, Wire-indebted edge to the same " +
        "scene, and Oasis themselves became Britpop's biggest global export by some distance; both, " +
        "along with Suede, sit outside this graph's current roster, which covers only Blur and Pulp.",
    ],
    soundParagraph:
      "Guitars stay chiming and hook-forward, closer to the Kinks and the Small Faces' British " +
      "Invasion tradition than to grunge's distorted heaviness, and vocals lean hard into a " +
      "distinctly English accent rather than the mid-Atlantic phrasing most rock singers default " +
      "to. Lyrics turn toward specific, often class-conscious observation of English life — a " +
      "council estate, a package holiday, a particular kind of aspirational tackiness — rather than " +
      "American alt-rock's more introspective focus.",
    // Both britpop-tagged artists' classicAlbums are genuinely Britpop-
    // defining — no exclusions needed. Oasis, Suede, and Elastica would be
    // obvious additions if they were graph nodes; they aren't, and no
    // substitute has been reached for in their place.
    definingAlbums: ['blur', 'pulp'],
    sections: [
      {
        title: "The graph's half of the story",
        blurb:
          "Blur's arch suburban observation and Pulp's class-conscious character studies represent " +
          "Britpop's more art-school half — its bigger, more chart-dominant wing (Oasis chief among " +
          "them) isn't yet part of this graph.",
        artistIds: ['blur', 'pulp'],
      },
    ],
  },

  grunge: {
    deck:
      "Seattle's fusion of punk's speed, metal's weight, and classic-rock melody, incubated on Sub " +
      "Pop's shoestring budget before breaking worldwide almost by accident. This graph covers " +
      "grunge's more underground, independent half — its arena-rock wing sits outside its current " +
      "scope.",
    originParagraphs: [
      "Sub Pop built the sound's early identity as much through marketing as through any one record " +
        "— the label's grimy Pacific Northwest branding gave a loose cluster of Seattle bands a " +
        "shared identity before they had much else in common. Mudhoney's Superfuzz Bigmuff EP " +
        "(1988) is the clearest early document of the actual sound: fuzz-pedal distortion, a slow, " +
        "sludgy tempo, and a scuzzy production aesthetic that became the label's signature.",
      "Nirvana's Bleach, also on Sub Pop, arrived in 1989 still working inside that same " +
        "underground, DIY register; Nevermind (1991), on a major label two years later, is the " +
        "record that took the sound global and effectively ended grunge's run as an underground " +
        "genre. The wing that followed on its commercial success — Pearl Jam, Soundgarden, Alice in " +
        "Chains — turned grunge into an arena-scale radio format; all three are real, major grunge " +
        "acts that sit outside this graph's current roster, which tracks Nirvana's earlier Sub Pop " +
        "years and Mudhoney's continued run instead.",
    ],
    soundParagraph:
      "Guitars run heavily distorted and often detuned, closer to metal's low-end weight than " +
      "punk's thinner buzz, laid under song structures that lean on abrupt loud-quiet-loud dynamic " +
      "shifts rather than a steady drive. Vocals swing between a melodic, classic-rock-indebted " +
      "croon and a raw, unguarded scream, sometimes within the same song, and the production stays " +
      "deliberately unpolished — Sub Pop's whole early identity depended on it sounding cheap.",
    // Both grunge-tagged artists' classicAlbums are genuinely grunge-
    // defining — no exclusions needed. Pearl Jam, Soundgarden, and Alice in
    // Chains would be the obvious additions if they were graph nodes; they
    // aren't, and this page names that gap directly rather than implying by
    // omission that the genre stops at these two.
    definingAlbums: ['nirvana', 'mudhoney'],
    sections: [
      {
        title: 'The underground half',
        blurb:
          "Nirvana's Sub Pop years and Mudhoney's continued fuzzed-out run represent grunge's " +
          "independent, DIY half — its bigger, arena-scale wing (Pearl Jam, Soundgarden, Alice in " +
          "Chains) isn't yet part of this graph.",
        artistIds: ['nirvana', 'mudhoney'],
      },
    ],
  },

  'noise-pop': {
    deck:
      "Pop melody run straight through a wall of guitar feedback — hooks intact, but coated in " +
      "distortion instead of polished clean. Noise-pop is a small, tightly-sourced lineage in " +
      "this graph: two artists, one shared point of origin.",
    originParagraphs: [
      "The Jesus and Mary Chain's Psychocandy (1985) is the record that essentially invents the " +
        "genre in one move — Velvet Underground-style drones and Phil Spector-style pop " +
        "structure, both submerged under a level of guitar feedback that was closer to " +
        "provocation than production polish at the time. Hüsker Dü were working a related but " +
        "independent angle a year earlier: Zen Arcade (1984) took a hardcore-punk band's speed " +
        "and volume and pointed it, unexpectedly, at real melody and pop songcraft.",
      "The two records share almost nothing in scene or geography — Scottish art-school " +
        "provocateurs versus a Minneapolis hardcore band pushing past its own genre's limits — " +
        "but both arrive at the same idea from opposite directions: bury a genuine pop song " +
        "under more noise than pop is supposed to tolerate. Shoegaze, the wall-of-sound genre " +
        "noise-pop is most often mentioned alongside, descends in this graph from dream-pop's " +
        "hazier lineage rather than directly from noise-pop — but Psychocandy is the record both " +
        "genres point back to as a starting shot, whichever branch of the tree they're filed " +
        "under.",
    ],
    soundParagraph:
      "A real pop song sits underneath the noise — verses, choruses, a hook you could hum with " +
      "the distortion stripped away — rather than noise being the entire point. Guitars are " +
      "pushed into feedback and distortion territory that a straightforward pop or punk " +
      "recording would treat as a mistake, but the drums and vocal melody stay driving and " +
      "direct, keeping the songs anchored even as the guitars threaten to swallow them.",
    // Only 2 artists carry this tag in the graph — the list below is
    // necessarily short, not padded. Don't force it to 4.
    definingAlbums: ['the-jesus-and-mary-chain', 'husker-du'],
    sections: [
      {
        title: 'Two roads to the same wall of sound',
        blurb:
          "Separated by scene, geography, and starting genre — Scottish art-provocation versus " +
          "Minneapolis hardcore — but arriving within a year of each other at the same basic " +
          "move: real pop songs, buried under more distortion than pop is supposed to carry.",
        artistIds: ['the-jesus-and-mary-chain', 'husker-du'],
      },
    ],
  },

  minimalism: {
    deck:
      "Not the classical downtown-composition tradition the name usually calls to mind — no " +
      "Terry Riley, Steve Reich, or Philip Glass here. In this graph, minimalism means a " +
      "specific, later branch: massed electric guitars droning and pulsing in place of an " +
      "orchestra, grown out of no-wave rather than out of a conservatory.",
    originParagraphs: [
      "The term's usual reference point is real and worth naming: Terry Riley's In C (1964) is " +
        "the piece that gives classical minimalism its starting date, a set of short melodic " +
        "cells repeated and layered by a variable ensemble until the overlapping patterns became " +
        "the entire composition. Riley, Reich, and Glass built a whole downtown-composition " +
        "tradition from that idea over the following decade — but none of them are nodes in " +
        "this graph, and that tradition isn't what the artists tagged with this genre here " +
        "actually represent.",
      "What the graph actually has is Glenn Branca and Rhys Chatham, two composers who came up " +
        "through New York's no-wave scene at the turn of the 1980s and pointed minimalism's " +
        "repetition-and-drift logic at massed electric guitars instead of an ensemble of " +
        "acoustic or orchestral instruments — a dozen or more guitars, all detuned and " +
        "overdriven, built into a single wall of harmonic overtone. Branca's The Ascension " +
        "(1981) and Chatham's Die Donnergötter (1985) are the two records that define this " +
        "branch: minimalism's structural idea, transplanted into a rock club instead of a " +
        "concert hall.",
    ],
    soundParagraph:
      "Dozens of guitars, sometimes literally, are tuned to the same droning open interval and " +
      "layered until individual notes disappear into a single mass of ringing overtones — the " +
      "compositional unit is the overall drone and its slow harmonic drift, not a melody any " +
      "one guitarist is playing. Rhythms tend toward a steady, motorik pulse underneath the " +
      "wall of sound, giving these long-form pieces a physical, almost orchestral weight that " +
      "has more in common with a symphony's crescendo than with a rock song's structure.",
    // Only 2 artists carry this tag in the graph, both from the same no-wave-
    // adjacent massed-guitar branch rather than the classical tradition the
    // genre name usually implies — see the deck and Origin above. The list
    // below is necessarily short, not padded.
    definingAlbums: ['glenn-branca', 'rhys-chatham'],
    sections: [
      {
        title: 'Massed-guitar minimalism',
        blurb:
          "Two composers, both working out of New York's no-wave scene circa 1979–81, who took " +
          "minimalism's repetition-and-drone logic and rebuilt it out of overdriven electric " +
          "guitars rather than an ensemble of conventional instruments.",
        artistIds: ['glenn-branca', 'rhys-chatham'],
      },
    ],
  },

  'folk-punk': {
    deck:
      "Punk's confrontational energy and DIY ethos, played on acoustic instruments instead of " +
      "distorted electric ones. In this graph it's a genre of exactly one artist — the one who " +
      "actually defines it.",
    originParagraphs: [
      "Violent Femmes' self-titled 1983 debut is the record the genre traces back to: nervy, " +
        "confessional lyrics about teenage frustration and desire, delivered over an acoustic " +
        "guitar, upright bass, and snare-and-brushes setup that owed nothing to punk's usual " +
        "electric-guitar-and-drums arsenal, but carried the same restless, confrontational " +
        "energy anyway.",
      "The genre proper — the folk-punk scenes and squats that would spring up around acts like " +
        "Against Me! and Defiance, Ohio a generation later — grew out of that template but sits " +
        "outside this graph's roster. Here, folk-punk is represented by its own real point of " +
        "origin and nothing else: one artist, one record, no scene to build sections around.",
    ],
    soundParagraph:
      "Acoustic instrumentation — guitar, upright bass, brushed drums — carries all the " +
      "rhythmic drive an electric punk band would get from distortion and volume, so the " +
      "energy comes from tempo and delivery instead: fast strumming, a snapping bassline, and " +
      "vocals that stay confrontational and unguarded rather than polite. Lyrics lean toward " +
      "blunt, adolescent honesty about desire, frustration, and social discomfort, the folk " +
      "tradition's storytelling instinct redirected toward punk's refusal to be tasteful about " +
      "it.",
    // Only 1 artist carries this tag in the graph — the single section below
    // is that one artist, not a manufactured scene.
    definingAlbums: ['violent-femmes'],
    sections: [
      {
        title: 'The genre in one record',
        blurb:
          "Violent Femmes' 1983 debut is folk-punk's entire representation in this graph — " +
          "acoustic instrumentation, punk's confrontational nerve, and no other artist here " +
          "carries the tag alongside it.",
        artistIds: ['violent-femmes'],
      },
    ],
  },

  'hypnagogic-pop': {
    deck:
      "Half-remembered pop, filtered through the blur of a dream just before waking — 1980s " +
      "soft-rock and radio-pop textures smeared with tape hiss and lo-fi murk until nostalgia " +
      "itself becomes the instrument. A critic coined the name for one artist's sound in 2009, " +
      "and that artist is still the genre's only representative here.",
    originParagraphs: [
      "Critic David Keenan coined the term in a 2009 issue of The Wire, describing a small " +
        "cluster of artists (Ariel Pink chief among them) whose music sounded like half-" +
        "remembered 1970s and 80s FM radio and soft-rock, smeared and degraded as if being " +
        "recalled from a dream rather than played back from a clean recording. Ariel Pink had " +
        "already been making that music for most of the preceding decade on cassette-only, " +
        "self-recorded albums — the name arrived years after the sound did, attached after the " +
        "fact to work already in progress.",
      "Before Today (2010) is the record where that murky, tape-warped aesthetic met an actual " +
        "studio budget and a full band for the first time, sharpening the songwriting without " +
        "losing the hazy nostalgia underneath it. The style's most direct descendant is " +
        "vaporwave — a later, more internet-native mutation that took hypnagogic pop's " +
        "chopped-and-warped nostalgia for old media and pushed it into explicitly sampled, " +
        "chopped-and-screwed source material — and it gets its own page elsewhere on this site.",
    ],
    soundParagraph:
      "Production is deliberately degraded — tape hiss, wobble, and murky low fidelity stand in " +
      "for the clean sheen of the soft-rock and radio-pop the songs are nostalgic for, so a " +
      "hook can feel simultaneously catchy and half-erased. Structures and melodies lean on " +
      "genuine 1970s-80s AM-radio songcraft underneath the murk, and the whole effect works " +
      "because the two layers — a real pop song, a degraded playback of it — never quite " +
      "resolve into either one cleanly.",
    // Only 1 artist carries this tag in the graph — the single section below
    // is that one artist, not a manufactured scene.
    definingAlbums: ['ariel-pink'],
    sections: [
      {
        title: 'The genre in one artist',
        blurb:
          "Ariel Pink's music is what the term was coined to describe in the first place — no " +
          "other artist in this graph carries the tag, and Before Today is the record where the " +
          "sound met a real studio for the first time.",
        artistIds: ['ariel-pink'],
      },
    ],
  },

  electronic: {
    deck:
      "Sixty years of artists who share almost nothing sonically — Silver Apples' homemade " +
      "oscillators, Kraftwerk's man-machine minimalism, Depeche Mode's stadium synth-pop, " +
      "Burial's submerged 2-step, and SOPHIE's deliberately painful hyperpop have no single " +
      "\"electronic sound\" running between them. What actually unifies the 61 artists below is " +
      "a changing relationship to the tools themselves — the instrument keeps getting " +
      "reinvented, and each reinvention pulls the music in a completely different direction.",
    originParagraphs: [
      "Electronic music's earliest chapter here is a story of people building the instrument " +
        "before there was one to buy off a shelf — Silver Apples' Simeon Coxe wired together a " +
        "homemade bank of oscillators by hand, Suicide made a synthesizer and a drum machine " +
        "sound like a threat rather than a novelty, and Kraftwerk, working in Düsseldorf, made " +
        "the machine itself the actual subject of the music rather than a texture layered over " +
        "a rock band. Cabaret Voltaire, coming out of the same industrial moment in Sheffield, " +
        "treated tape manipulation as a compositional tool in its own right — cutting, looping, " +
        "and collaging sound the way a guitarist would play a riff.",
      "From there the same underlying technology split into directions that barely speak to " +
        "each other: synthesizers and drum machines went mainstream, turning into standard " +
        "chart-pop equipment across four decades (Gary Numan and Depeche Mode's stadium runs, " +
        "a 2010s–2020s generation picking the same gear back up as a deliberate throwback); the " +
        "sampler, borrowed wholesale from hip-hop and dub, built an entirely separate lineage " +
        "running through trip-hop's cinematic gloom, IDM's headphone-listening complexity, and " +
        "a run of 2000s dance-punk bands who plugged a dancefloor's rhythm section into guitar " +
        "music instead of replacing it; and, most recently, a laptop and a DAW made the whole " +
        "question of equipment moot. Every one of those directions has its own fuller page in " +
        "this graph — synth-pop, ambient, industrial, krautrock, IDM, hyperpop, trip-hop, and " +
        "drone among them — even though the tree's actual parent-child pointers run through " +
        "krautrock rather than through this page directly; this one is the trunk they all " +
        "ultimately trace back to, whatever the literal lineage strip above shows.",
    ],
    soundParagraph:
      "There's no single \"electronic sound\" spanning Kraftwerk's rigid motorik pulse, Massive " +
      "Attack's dub-soaked gloom, Aphex Twin's headphone-only rhythm complexity, and 100 gecs' " +
      "deliberately clipped maximalism — describing one would be dishonest, the same way an " +
      "\"alt-rock sound\" or \"indie-rock sound\" would be. What actually unifies the artists " +
      "below is a shared relationship to technology rather than to any resulting timbre — each " +
      "era picked up whatever tool was newly available (homemade oscillators, the affordable " +
      "synthesizer, the sampler, the laptop and DAW) and let that tool's specific capabilities " +
      "and limits shape the music, rather than starting from a genre and reaching for " +
      "electronics to decorate it.",
    // Excluded — already claimed as a definingAlbum elsewhere: Kraftwerk and Faust
    // (krautrock); David Bowie and Brian Eno (art-pop); Suicide and Cabaret Voltaire
    // (industrial); Depeche Mode, The Human League, OMD, Gary Numan, The Knife, Hot Chip, and
    // The Postal Service (synth-pop); Aphex Twin, Autechre, Boards of Canada, and Squarepusher
    // (IDM); Massive Attack, Portishead, Tricky, and Burial (trip-hop); LCD Soundsystem and The
    // Rapture (dance-punk); Silver Apples and MGMT (psychedelic-pop); SOPHIE, A.G. Cook, 100
    // gecs, and underscores (hyperpop); Tim Hecker, Stars of the Lid, and Harold Budd (ambient);
    // Grouper (drone); Björk, Grimes, FKA twigs, and Caroline Polachek (art-pop); Jockstrap
    // (experimental-pop); The Radio Dept. (dream-pop). That's 39 of the 61 artists tagged here —
    // nearly every canonical, most-covered name in the genre's history already anchors one of
    // electronic's own more specific children. The 12 below are drawn from what's left instead
    // of reprinting the same covers a fourth or fifth time, which honestly skews this
    // particular grid toward the 2000s–2020s art-electronic and hyperpop-adjacent wing (the
    // least individually page-covered stretch of the realm) rather than the 1970s originators
    // most readers would expect to see first — a real tradeoff, not an oversight.
    definingAlbums: [
      'sparks',
      'magdalena-bay',
      'four-tet',
      'caribou',
      'oneohtrix-point-never',
      'steve-roach',
      'imogen-heap',
      'arca',
      'porter-robinson',
      'charli-xcx',
      'kero-kero-bonito',
      'kraftwerk',
      'brian-eno',
      'aphex-twin',
    ],
    sections: [
      {
        title: 'From homemade oscillators to the chart machine, 1968–2024',
        blurb:
          "Kraftwerk making the synthesizer the entire subject of the music rather than a " +
          "texture on top of it, Silver Apples and Suicide building their own oscillator rigs " +
          "because nothing you could buy did what they wanted, and Cabaret Voltaire treating " +
          "tape as a compositional material — then three-plus decades of the same instrument " +
          "settling into standard chart-pop equipment, from Gary Numan and Depeche Mode's " +
          "stadium runs to a 2010s–2020s generation picking the same synthesizers back up as a " +
          "deliberate throwback.",
        artistIds: [
          'kraftwerk',
          'silver-apples',
          'suicide',
          'cabaret-voltaire',
          'faust',
          'brian-eno',
          'david-bowie',
          'sparks',
          'depeche-mode',
          'the-human-league',
          'omd',
          'gary-numan',
          'the-knife',
          'hot-chip',
          'the-postal-service',
          'grimes',
          'magdalena-bay',
          'mgmt',
        ],
      },
      {
        title: 'The sampler and the dancefloor, 1988–2010s',
        blurb:
          "A different tool entirely — the sampler and the drum machine, borrowed wholesale " +
          "from hip-hop and dub — running through genres that share equipment but rarely a " +
          "mood: trip-hop's cavernous, dub-soaked productions (Massive Attack, Portishead, " +
          "Tricky, Sneaker Pimps), IDM's headphone-only rhythmic complexity (Aphex Twin, " +
          "Autechre, Boards of Canada, Squarepusher, Burial), and a run of rock and post-punk " +
          "bands who plugged a dancefloor's rhythm section into guitar music rather than " +
          "replacing it (LCD Soundsystem, !!!, The Rapture, Four Tet, Caribou).",
        artistIds: [
          'massive-attack',
          'portishead',
          'tricky',
          'sneaker-pimps',
          'aphex-twin',
          'autechre',
          'boards-of-canada',
          'squarepusher',
          'burial',
          'lcd-soundsystem',
          'chk-chk-chk',
          'the-rapture',
          'four-tet',
          'caribou',
        ],
      },
      {
        title: 'Ambient, drone, and the room as instrument',
        blurb:
          "A third tool that isn't really a machine at all so much as an absence of rhythm — " +
          "treating duration, reverb, and near-silence as the actual instrument. Harold Budd " +
          "and Steve Roach's 1980s ambient records, Tim Hecker and Stars of the Lid's " +
          "physically overwhelming drone, Grouper's tape-hissed bedroom recordings, and " +
          "Oneohtrix Point Never and vaporwave duo 2814 pulling the same idea through a laptop " +
          "instead of a mixing desk.",
        artistIds: [
          'oneohtrix-point-never',
          'tim-hecker',
          'stars-of-the-lid',
          'grouper',
          'harold-budd',
          'steve-roach',
          'deaths-dynamic-shroud',
          '2814',
        ],
      },
      {
        title: 'The bedroom becomes the studio: hyperpop, PC Music, and the DAW generation',
        blurb:
          "This realm's largest and most recent wave, unified by one fact rather than a sound: " +
          "a laptop and a DAW replaced the need for a studio, a label, or even a band. SOPHIE " +
          "and PC Music's early-2010s circle (A.G. Cook, 100 gecs, Charli XCX) pushed pitch-" +
          "correction and clipping into the foreground instead of hiding them; a wider " +
          "art-electronic generation (Björk, Imogen Heap, FKA twigs, Sheena Ringo, Kero Kero " +
          "Bonito, Arca, Caroline Polachek, Oklou) used the same production toolkit for pop " +
          "rather than provocation; and Panchiko, The Radio Dept., and Jockstrap carried an " +
          "identical bedroom-laptop approach into genres — shoegaze, dream-pop, art-pop — that " +
          "aren't primarily \"electronic\" at all.",
        artistIds: [
          'sophie',
          'a-g-cook',
          '100-gecs',
          'charli-xcx',
          'arca',
          'caroline-polachek',
          'underscores',
          'jane-remover',
          'oklou',
          'ninajirachi',
          'yeule',
          'porter-robinson',
          'bjork',
          'imogen-heap',
          'fka-twigs',
          'sheena-ringo',
          'kero-kero-bonito',
          'panchiko',
          'the-radio-dept',
          'jockstrap',
          'slayyyter',
        ],
      },
    ],
  },

  folk: {
    deck:
      "Folk began as a tradition-bearing form — songs collected from oral tradition and passed " +
      "down, essentially authorless — and the word now means close to the opposite: one " +
      "person's specific, often painfully personal life, sung in the first person over an " +
      "acoustic guitar. That reversal, not any shared sound, is what actually unifies the 39 " +
      "artists below; in this graph, \"folk\" mostly means confession, not tradition.",
    originParagraphs: [
      "The word originally described a process, not a sound or an author — songs gathered from " +
        "rural, oral tradition and passed down through generations, revised and re-sung by " +
        "whoever carried them next, with no single writer to credit. Britain's folk revival " +
        "(Bert Jansch's fingerstyle guitar, the Incredible String Band's psych-folk, Vashti " +
        "Bunyan's pastoral debut) still carried a trace of that original sense — interpreting " +
        "older material, or writing new songs steeped in the older tradition's modal harmony " +
        "and communal address — even as the ground was shifting under it.",
      "The American singer-songwriter generation that emerged alongside it — Bob Dylan, Joni " +
        "Mitchell, Leonard Cohen, Nick Drake — took the same acoustic vocabulary and pointed it " +
        "inward: the songs were now unambiguously about the writer's own life, not a tradition " +
        "being carried forward. That turn never reversed. Everything that followed — alt-" +
        "country's regional inheritors, a 2000s freak-folk revival, and a wide 2010s–2020s " +
        "indie and bedroom lineage — kept the confessional stance and, in most cases, dropped " +
        "the tradition-bearing half of the word's original meaning almost entirely. Folk has " +
        "five real descendants of its own in this graph (singer-songwriter, alt-country, freak-" +
        "folk, indie-folk, folk-punk), each chasing a different piece of what's left of the " +
        "original tradition; this page is the trunk they all grew from.",
    ],
    soundParagraph:
      "There's no single \"folk sound\" running through Nick Drake's hushed fingerpicking, " +
      "Joanna Newsom's harp-driven mythology, Ethel Cain's Southern-gothic dream-pop, and " +
      "Grouper's tape-hissed ambient drone — describing one would flatten four genuinely " +
      "different records into a lie. What actually unifies the artists below is the " +
      "confessional stance: a first-person voice, presumed autobiographical, usually still " +
      "carrying at least a trace of acoustic instrumentation even when the production around it " +
      "(Sharon Van Etten's synths, Ethel Cain's reverb-soaked guitars) has moved well past " +
      "anything an actual folk tradition would recognize.",
    // Excluded — already claimed as a definingAlbum elsewhere: Bob Dylan, Leonard Cohen, Joni
    // Mitchell, Nick Drake, Neil Young, Townes Van Zandt, John Prine, and Elliott Smith (all
    // singer-songwriter's own page); Silver Jews, Bon Iver, Big Thief, and Phoebe Bridgers
    // (indie-folk); Lucinda Williams, Angel Olsen, and Bright Eyes (alt-country); Sufjan
    // Stevens, Fleet Foxes, and Weyes Blood (chamber-pop); Incredible String Band (psychedelic-
    // pop); Grouper (drone); Jeff Buckley and Tom Waits (art-rock); Waxahatchee and Mitski
    // (indie-rock); Clairo and Snail Mail (indie-pop/bedroom-pop). That's 26 of the 39 artists
    // tagged here — this page's own 12 are deliberately drawn from the remaining pool instead
    // of reprinting covers already carrying weight elsewhere, which skews the picks toward some
    // of the roster's less individually-famous names (Karen Dalton, Roy Harper, Songs: Ohia)
    // rather than the artists most readers would expect on a folk "greatest hits" list. Vashti
    // Bunyan is the one otherwise-clean, unclaimed candidate cut for space.
    //
    // POLICY CHANGE: that no-repeat rule is now relaxed for canonical cases.
    // It optimised for variety across all 53 pages, but nobody reads 53 pages
    // -- each one is read standalone, and a reader landing here has no idea
    // Blue is printed on singer-songwriter. The comment above already
    // predicted the failure ("rather than the artists most readers would
    // expect"), and Joni Mitchell absent from the folk page is exactly it.
    // Repeat an album where it genuinely belongs on both pages; keep the rule
    // as a tiebreaker for artists whose album fits several pages equally.
    definingAlbums: [
      'joni-mitchell',
      'bert-jansch',
      'roy-harper',
      'karen-dalton',
      'kurt-vile',
      'the-mountain-goats',
      'songs-ohia',
      'joanna-newsom',
      'adrianne-lenker',
      'bonnie-prince-billy',
      'sharon-van-etten',
      'ethel-cain',
      'cat-power',
      'neil-young',
      'nick-drake',
      'leonard-cohen',
    ],
    sections: [
      {
        title: 'The turn to the first person, 1965–1974',
        blurb:
          "The generation that took a tradition-bearing form — songs collected and passed " +
          "down, essentially authorless — and turned it into a vehicle for one specific " +
          "person's life: Dylan's turn from protest-song interpreter to confessional " +
          "surrealist, Joni Mitchell and Leonard Cohen writing directly about their own " +
          "relationships and interior lives, and a British folk-revival wing (Bert Jansch, " +
          "Incredible String Band, Vashti Bunyan, Roy Harper) still closer to the older, " +
          "tradition-interpreting sense of the word even as the American branch pulled away " +
          "from it.",
        artistIds: [
          'bob-dylan',
          'joni-mitchell',
          'leonard-cohen',
          'nick-drake',
          'neil-young',
          'bert-jansch',
          'roy-harper',
          'karen-dalton',
          'townes-van-zandt',
          'john-prine',
          'incredible-string-band',
          'vashti-bunyan',
        ],
      },
      {
        title: 'Extending the tradition: heartland and alt-country heirs, 1985–2020',
        blurb:
          "A second wave that kept the first-person confession but changed its regional " +
          "accent — Tom Waits' junkyard theatricality, Lucinda Williams' Southern narrative " +
          "songwriting, and a run of American indie artists (Silver Jews, Kurt Vile, The " +
          "Mountain Goats, Waxahatchee, Songs: Ohia) who kept \"folk\" as a genre tag mostly by " +
          "virtue of an acoustic guitar and a first-person lyric, not by any real relationship " +
          "to a folk tradition.",
        artistIds: [
          'tom-waits',
          'lucinda-williams',
          'silver-jews',
          'kurt-vile',
          'the-mountain-goats',
          'waxahatchee',
          'songs-ohia',
        ],
      },
      {
        title: 'Freak-folk and the 2000s revival: tradition as texture, confession as content',
        blurb:
          "A 2000s wave that borrowed the older tradition's surface — hand percussion, harp, " +
          "chamber arrangement, an invented-mythology lyricism (Joanna Newsom) — while writing " +
          "lyrics as personal as anything the confessional wing produced; Bon Iver, Fleet " +
          "Foxes, Big Thief, Adrianne Lenker, and Bright Eyes all reach for folk instrumentation " +
          "in service of intensely first-person songwriting, not communal or traditional " +
          "material.",
        artistIds: [
          'joanna-newsom',
          'sufjan-stevens',
          'big-thief',
          'adrianne-lenker',
          'fleet-foxes',
          'bon-iver',
          'bright-eyes',
          'bonnie-prince-billy',
        ],
      },
      {
        title: 'Folk as confession, full stop',
        blurb:
          "By the 2010s \"folk\" in this graph has almost nothing to do with the word's " +
          "original meaning — it means a quiet, first-person, often acoustic-adjacent mode of " +
          "direct emotional address, whether that's Elliott Smith's whispered confession, " +
          "Mitski's and Phoebe Bridgers' generation of it, or Grouper's confession dissolved " +
          "into tape hiss and reverb until the words are barely legible at all. This is the " +
          "opposite of tradition-bearing folk music, and the word survives here mostly as " +
          "genre-tag inertia rather than a real description.",
        artistIds: [
          'elliott-smith',
          'jeff-buckley',
          'mitski',
          'phoebe-bridgers',
          'sharon-van-etten',
          'angel-olsen',
          'weyes-blood',
          'ethel-cain',
          'cat-power',
          'grouper',
        ],
      },
    ],
  },
};
