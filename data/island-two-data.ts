// ─────────────────────────────────────────────────────────────
// Island Two — Electronic Lineage Cluster (SANDBOX DATA)
//
// Source: island-two/influence-audit-proposal.md, Sections 2–8, with the
// modifications specified in the follow-up task (6 edges removed, 13 edges
// requested — only 12 were actually enumerated — added, 5 nodes summoned).
//
// This file is data ONLY. It is not imported by seed-data.ts, any route,
// or any component, and it does not modify data/types.ts or
// data/seed-data.ts. Nothing here is wired into the live graph.
// ─────────────────────────────────────────────────────────────

import type { Artist, Edge } from './types';

// ── Additive tagging (does not touch the real Artist type in types.ts) ──

export type IslandTwoRealm = 'core' | 'electronic' | 'region-one';

export type IslandTwoLineage =
  | 'krautrock'
  | 'synth-pop'
  | 'idm'
  | 'ambient-drone'
  | 'electronic-indie-dancepunk'
  | 'trip-hop-downtempo'
  | 'hyperpop-pcmusic'
  | 'art-electronic';

// A full island-two node is a real Artist (so it would slot into GraphData
// unmodified) plus the two new optional tags.
export interface IslandTwoArtist extends Artist {
  realm?: IslandTwoRealm;
  lineage?: IslandTwoLineage;
}

// Stub anchors are placeholders for region-one / core nodes that island-two
// edges point at. Id + name only — never copy their real bios/edges here.
export interface StubAnchor extends Pick<Artist, 'id' | 'name'> {
  realm: IslandTwoRealm;
  lineage?: IslandTwoLineage;
}

// Edge factory — copied verbatim from data/seed-data.ts (lines 180–185) so
// the shape matches exactly. source = influenced, target = influence.
const inf = (
  source: string,
  target: string,
  confidence = 0.8,
  status: Edge['status'] = 'verified',
): Edge => ({ source, target, type: 'influence', status, confidence, citation: null });

// Album factory — copied verbatim from data/seed-data.ts so classicAlbums
// entries match the region-one shape exactly.
const ca = (id: string, title: string, year: number, classicReason: string) =>
  ({ id, title, year, isClassic: true as const, classicReason });

// ─────────────────────────────────────────────────────────────
// Island-two nodes (44) — grouped by lineage per the task's assignment
// table. layer/genres/scope are filled with the closest existing schema
// values (layer 'outside' — "influences from beyond the indie tradition,"
// which is exactly what these are; scope 'underground' — the schema's own
// future top-level parent) since Artist requires them and types.ts is not
// to be modified.
// ─────────────────────────────────────────────────────────────

const islandTwoBase = { layer: 'outside' as const, genres: ['electronic'], scope: ['underground' as const] };

export const islandTwoNodes: IslandTwoArtist[] = [
  // realm: electronic, lineage: krautrock
  {
    ...islandTwoBase,
    id: 'silver-apples',
    name: 'Silver Apples',
    realm: 'electronic',
    lineage: 'krautrock',
    signatureSong: 'Oscillations',
    bio: `Silver Apples began in New York in the mid-1960s when Simeon Coxe, playing a home-built rig of oscillators and radio parts he called The Simeon, took over a garage band called the Overland Stage Electric Band so completely that the other members quit rather than share a stage with it. What remained was a duo: Coxe's oscillators and drummer Danny Taylor, making a music with almost no precedent — burbling analog tones locked to a steady, propulsive beat, years before synthesizers were an instrument any other rock band trusted.\n\nTheir self-titled 1968 debut on Kapp Records found little commercial footing at the time, and a dispute over the cover art of the 1969 follow-up, Contact, effectively ended the group's original run. Silver Apples spent decades as a private obsession for listeners who stumbled onto the records, before a wave of reissues and a Coxe-led reactivation in the 1990s introduced the duo to an audience shaped by the electronic music their sound had quietly anticipated. Coxe kept performing as Silver Apples into his final years, until his death in 2020.`,
    classicAlbums: [
      ca(
        'silver-apples-st',
        'Silver Apples',
        1968,
        `Built entirely from Simeon's homemade oscillator rig and Danny Taylor's steady, near-martial drumming, Silver Apples sounds like a rock record beamed in from a future nobody else had reached yet. "Oscillations" opens the album on a burbling, insistent pulse that functions as both melody and rhythm section — a sound with no real analog in 1968 outside experimental electronic music. "Program" pushes the duo's minimalism further, letting repetition stand in for the hooks a conventional band would have reached for. It's a record built from constraint — two men, one drum kit, one bank of oscillators — that still sounds stranger than most music made with unlimited resources.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'suicide',
    name: 'Suicide',
    realm: 'electronic',
    lineage: 'krautrock',
    signatureSong: 'Ghost Rider',
    bio: `Suicide formed in New York in 1970 around vocalist Alan Vega and keyboardist/programmer Martin Rev, stripping rock down to a drum machine, a cheap synthesizer, and Vega's confrontational, Elvis-inflected sneer. Their live shows through the mid-1970s were less performances than provocations — audiences sometimes walked out, sometimes fought, and Vega treated the hostility as part of the material rather than an obstacle to it. By the time the duo's self-titled debut appeared in 1977, they had built one of the coldest, most minimal sounds in American music out of almost nothing.\n\nThat record found few listeners on release but became a reference point across the following decade for synth-pop and industrial artists, several of whom sought the duo out directly once they'd found an audience of their own. Vega and Rev kept recording together intermittently for years afterward, refining the same basic tension between machine repetition and human menace that the first album had already stated in full. Alan Vega died in 2016, having lived to see a sound once dismissed as unlistenable become foundational.`,
    classicAlbums: [
      ca(
        'suicide-st',
        'Suicide',
        1977,
        `Suicide's debut strips rock and roll to a drum machine pulse, a two-note synth line, and Alan Vega's voice — and somehow the result feels more menacing than anything built from guitars. "Ghost Rider" compresses the whole aesthetic into three minutes of monotone dread, Vega repeating the title like a threat rather than a lyric. "Frankie Teardrop" pushes the same minimal palette to a ten-minute extreme, a bare account of a man's collapse that ends in unscripted-sounding screams. It's a genuinely frightening record, made with almost no equipment, that still unsettles decades on.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'cabaret-voltaire',
    name: 'Cabaret Voltaire',
    realm: 'electronic',
    lineage: 'krautrock',
    signatureSong: 'Nag Nag Nag',
    bio: `Cabaret Voltaire formed in Sheffield in 1973 around Richard H. Kirk, Stephen Mallinder, and Chris Watson, building tape loops and treated instruments in a home studio years before "industrial music" had a name to give them. Watson, a keen sound recordist even then, left the group in the early 1980s for a long career recording wildlife and environments for the BBC — an unlikely second act for one of the more disorienting record collections of the era. Kirk and Mallinder carried the band forward as a duo through the early '80s, its records growing colder and more rhythmically insistent as the decade's political mood darkened.\n\nTheir 1979 single "Nag Nag Nag," released two years before Red Mecca and still their most recognizable track, did more than any single album to define the queasy, danceable menace industrial music would run with for the next decade. Cabaret Voltaire kept mutating for another decade after that, moving toward electro and house rhythms as dance music absorbed textures the band had spent the '70s inventing almost alone. Mallinder eventually departed, leaving Kirk to carry the name into the 1990s before retiring it.`,
    classicAlbums: [
      ca(
        'red-mecca',
        'Red Mecca',
        1981,
        `Red Mecca is Cabaret Voltaire at their coldest — tape loops, treated voice, and a rhythm section that sounds like machinery rather than musicians, made amid a genuinely tense mood in the band's home city. "Split Second Feeling" and "Sluggin' Fer Jesus" build dread out of repetition rather than melody, voices looping and degrading until they stop resembling language. There's no relief built into the record — no chorus, no release — which is exactly the point of an album more interested in atmosphere than songcraft. It remains one of the starkest documents of early British industrial music, years before the term had settled into a genre.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'faust',
    name: 'Faust',
    realm: 'electronic',
    lineage: 'krautrock',
    signatureSong: 'Krautrock',
    bio: `Faust formed in 1971 in the German town of Wumme, assembled somewhat artificially by producer Uwe Nettelbeck and bankrolled by Polydor on the theory that Germany needed its own answer to the counterculture excess American and British labels were selling. The label built the band an actual studio to work in, and Faust used it to make some of the strangest records of the era — tape edits, found sound, and abrupt genre collisions spliced together with none of rock's usual respect for a finished take. Their self-titled debut arrived on clear vinyl in a clear sleeve, a gesture as much about anti-commercial provocation as music.\n\nBy Faust IV (1973), recorded in England after the band's move to Richard Branson's fledgling Virgin label, the group had sharpened the chaos into something more listenable without losing its contrariness. Commercial failure and internal breakdown ended the group's original run soon after, but Faust's members and various later lineups have continued to record and perform on and off for decades, treating the band's name as a loose banner rather than a fixed lineup.`,
    classicAlbums: [
      ca(
        'faust-iv',
        'Faust IV',
        1973,
        `Faust IV opens with "Krautrock," a nearly twelve-minute wall of drone and motorik rhythm that turns a term critics used dismissively into a statement of purpose. The record moves between that kind of extended abstraction and surprisingly direct songwriting — "Jennifer" and "Just a Second (Starts Like That!)" are almost pop songs, played by a band that clearly didn't trust pop songs to stay simple for long. Recorded in England for Virgin at the tail end of the band's most productive run, it's the most accessible entry point into a catalog otherwise defined by its refusal of accessibility. Decades on, it still reads as an argument about what a rock record is allowed to be.`,
      ),
    ],
  },

  // realm: electronic, lineage: synth-pop
  {
    ...islandTwoBase,
    id: 'depeche-mode',
    name: 'Depeche Mode',
    realm: 'electronic',
    lineage: 'synth-pop',
    signatureSong: 'Enjoy the Silence',
    bio: `Depeche Mode formed in Basildon, Essex in 1980, initially built around Vince Clarke's melodic synth-pop songwriting and Dave Gahan's voice. Clarke wrote nearly all of the material on the group's 1981 debut, Speak & Spell, then left to form Yazoo before the band had even toured behind it — a defection that could have ended things, but instead handed songwriting duties to Martin Gore, whose interests ran darker and stranger than the group's chart-pop beginnings suggested.\n\nAcross the 1980s, Gore, Gahan, Andy Fletcher, and later Alan Wilder built a catalog that moved steadily toward the synthesized rock the band is now identified with — industrial textures, sampled percussion, sex and religion as recurring subjects — without abandoning the pop instincts Clarke had left behind. Violator (1990), made with producer Flood, is generally treated as the point where those two halves of the band's identity fully reconciled. Depeche Mode remained active and commercially significant for decades afterward; Fletcher's death in 2022 left Gore and Gahan as the group's only constants.`,
    classicAlbums: [
      ca(
        'violator',
        'Violator',
        1990,
        `Violator is where Depeche Mode's gothic, industrial-leaning instincts and their pop songwriting finally sat comfortably in the same record. "Enjoy the Silence" builds a colossal hook from almost nothing — a single strummed chord sample, a walking bassline, and Dave Gahan's voice carrying the melody alone — while "Personal Jesus" turns religious longing into a strutting blues-rock riff played entirely on synthesizers. Flood's production gives the whole album a weight and clarity the band's earlier records didn't have, without sanding down Martin Gore's stranger impulses. It's the album most listeners point to when they describe a Depeche Mode record changing how they heard synth-pop.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'the-human-league',
    name: 'The Human League',
    realm: 'electronic',
    lineage: 'synth-pop',
    signatureSong: "Don't You Want Me",
    bio: `The Human League formed in Sheffield in 1977 around synthesizer players Martyn Ware and Ian Craig Marsh, whose early records under that name were austere, self-consciously avant-garde electronic music with almost none of the accessible pop the band would later become known for. When Ware and Marsh left in 1980 to form Heaven 17, singer Philip Oakey was left holding a band name and a management contract with no other members — he responded by recruiting two teenagers, Joanne Catherall and Susan Ann Sulley, off a Sheffield dancefloor, and bringing in musician Jo Callis to help write songs.\n\nThat rebuilt lineup, working with producer Martin Rushent, made Dare (1981), the record that turned the Human League from a cult electronic act into a genuine pop phenomenon. Oakey's flat, deadpan baritone and the group's bright, hook-driven synth arrangements became a template other synth-pop acts spent the rest of the decade adapting. The band's commercial fortunes cooled through the later '80s, but Oakey, Catherall, and Sulley have continued performing and recording as the Human League for decades since.`,
    classicAlbums: [
      ca(
        'dare',
        'Dare',
        1981,
        `Dare is the record where synth-pop stopped sounding like an experiment and started sounding like the pop mainstream. "Don't You Want Me" carries the album — a call-and-response duet between Philip Oakey and Susan Ann Sulley set against one of the era's most instantly memorable synth hooks, framed as a bitter breakup narrative rather than a straightforward love song. Producer Martin Rushent's arrangements are bright and uncluttered, built to let melody carry weight that guitars usually would. Its combination of accessible songwriting and fully synthetic production gave a generation of British pop acts a template to work from.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'omd',
    name: 'Orchestral Manoeuvres in the Dark',
    realm: 'electronic',
    lineage: 'synth-pop',
    signatureSong: 'Enola Gay',
    bio: `OMD formed on Merseyside in 1978 around Andy McCluskey and Paul Humphreys, who built early songs from a shared record collection heavy on Kraftwerk and cheap synthesizers neither of them could really afford. Their early singles, including "Electricity," were self-funded before Factory Records and then Virgin picked the pair up, and the band's lineup grew to include Martin Cooper and Malcolm Holmes as the songwriting settled into a partnership between McCluskey's pop instincts and Humphreys's more textural approach.\n\nOrganisation (1980) carried the hit "Enola Gay," an unlikely dancefloor song about the aircraft that dropped the Hiroshima bomb, and Architecture & Morality (1981) pushed the band toward a more orchestral, melodic synth-pop that became their commercial peak. Dazzle Ships (1983), a colder and more experimental record, cost them some of that audience, and by the late 1980s McCluskey and Humphreys had drifted into separate projects — McCluskey kept the OMD name through the rest of the decade before the two reunited with the original lineup in the mid-2000s and have continued recording since.`,
    classicAlbums: [
      ca(
        'architecture-and-morality',
        'Architecture & Morality',
        1981,
        `Architecture & Morality is where OMD's early art-school austerity opened out into something warmer and more orchestral, built around choral synth pads, the Mellotron, and melodies indebted as much to church music as to Kraftwerk. "Souvenir" and "Maid of Orleans" carry the record's emotional weight, drifting, hymn-like songs that trade the band's earlier detachment for real tenderness. "Joan of Arc" extends the same instincts into something more explicitly mournful, matching subject and sound with unusual precision for a synth-pop record. It's the album where the band's two songwriting temperaments — McCluskey's directness, Humphreys's atmosphere — fully met in the middle.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'gary-numan',
    name: 'Gary Numan',
    realm: 'electronic',
    lineage: 'synth-pop',
    signatureSong: 'Cars',
    bio: `Gary Numan built his early sound in the London post-punk scene of the late 1970s, first as the singer of Tubeway Army before deciding, almost overnight, that guitars were no longer necessary. Replicas (1979), released under the Tubeway Army name but effectively a solo record, introduced the detached, replicant-like persona and Philip K. Dick-inflected themes that would define his early work — synthesizers doing the job guitars once did, played with a coldness that felt genuinely alien on pop radio at the time.\n\nThe Pleasure Principle, released later the same year fully under his own name, dropped guitars almost entirely and built its sound instead from synthesizers, viola, and a tight, mechanical rhythm section. Numan's commercial fortunes cooled through the 1980s as his sound became less fashionable, but a run of darker, more industrial-leaning albums beginning in the 1990s found him newly championed by a generation of American industrial and metal acts who'd grown up on his early records. He has continued recording and touring steadily since.`,
    classicAlbums: [
      ca(
        'pleasure-principle',
        'The Pleasure Principle',
        1979,
        `The Pleasure Principle is the record where Gary Numan committed fully to the synthesizer, building an entire album with no guitars at all — just banks of keyboards, Chris Payne's viola, and a rhythm section drilled into something close to machine precision. "Cars" is the obvious anchor, a paranoid, claustrophobic song about the isolation of driving that became one of the era's most recognizable synth hooks almost by accident. "Metal" pushes the same detachment further, Numan's voice flattened into something between confession and readout. It's a record that treats the synthesizer as a genuinely new instrument rather than a substitute for old ones, and a good deal of synth-pop's early vocabulary comes directly from it.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'the-knife',
    name: 'The Knife',
    realm: 'electronic',
    lineage: 'synth-pop',
    signatureSong: 'Heartbeats',
    bio: `The Knife are the Swedish sibling duo of Karin Dreijer and Olof Dreijer, who began releasing music from Gothenburg in 1999 through their own label rather than wait for outside interest that wasn't coming. Deep Cuts (2003), their second album, produced "Heartbeats," a song that found a much wider audience a year later through José González's stripped-down acoustic cover — a strange, secondhand route to recognition for a duo who had little interest in conventional visibility themselves.\n\nSilent Shout (2006) pushed the group's sound into colder, more minimal electronic territory, Karin's vocals pitched and processed until gender and identity became explicitly unstable elements of the music rather than incidental ones. The Knife performed rarely and almost always masked, treating anonymity as a deliberate refusal of the pop industry's usual demands. After the elaborate, dance-theater staging of their final album, Shaking the Habitual (2013), the duo effectively disbanded, with Karin continuing to record as Fever Ray.`,
    classicAlbums: [
      ca(
        'silent-shout',
        'Silent Shout',
        2006,
        `Silent Shout is The Knife at their most austere — minimal techno rhythms, icy synth pads, and Karin Dreijer's voice pitched down into something genderless and unsettling. The title track sets the tone immediately, a queasy, minor-key pulse under vocals that sound like they're being transmitted rather than sung. "Marble House" and "Forest Families" extend the same palette into something closer to horror-film scoring than pop music. It's a deliberately cold, alienating record, and that coldness is the source of its lasting power rather than an obstacle to it.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'sparks',
    name: 'Sparks',
    realm: 'electronic',
    lineage: 'synth-pop',
    signatureSong: "This Town Ain't Big Enough for the Both of Us",
    bio: `Sparks are the Los Angeles brothers Ron and Russell Mael, who formed the band that became Sparks in the early 1970s and found more success in Britain than in their own country almost immediately. Ron's clipped, mordantly funny lyrics and stone-faced stage presence paired with Russell's operatic falsetto to make a genuinely odd kind of glam pop that owed as much to musical theater as to rock and roll.\n\nKimono My House (1974), made after the brothers relocated to London, was their commercial breakthrough and remains the record most listeners associate with the band. Sparks kept reinventing their sound across the decades that followed, including a pivot toward electronic disco with Giorgio Moroder in 1979 that anticipated synth-pop's rise by several years. The brothers have continued recording new material well into their seventies, a longevity eventually documented in Edgar Wright's 2021 film The Sparks Brothers. Even by that point in their career the brothers were still writing and recording new material rather than simply touring on the strength of an existing catalog, a work rate unusual for a band by then several decades into its run.`,
    classicAlbums: [
      ca(
        'kimono-my-house',
        'Kimono My House',
        1974,
        `Kimono My House is Sparks at their most immediate — glammy, theatrical rock songs delivered at a nervous, breathless pace that few other bands of the era attempted. "This Town Ain't Big Enough for the Both of Us" is the record's centerpiece, Russell Mael's falsetto vaulting over a galloping arrangement while Ron's lyrics turn a breakup into something closer to a farce. "Amateur Hour" and "Talent Is an Asset" apply the same wit to smaller targets, funny in a way that never undercuts the songs' actual craft. It's the sound of a band treating pop music as a stage for character acting rather than self-expression, and it made them stars in Britain almost overnight.`,
      ),
    ],
  },

  // realm: electronic, lineage: idm
  {
    ...islandTwoBase,
    id: 'aphex-twin',
    name: 'Aphex Twin',
    realm: 'electronic',
    lineage: 'idm',
    signatureSong: 'Xtal',
    bio: `Richard D. James began releasing music as Aphex Twin from Cornwall in the early 1990s, after years of making tracks alone as a teenager on whatever equipment he could get his hands on. Selected Ambient Works 85–92 (1992), assembled largely from that earlier home-recorded material, arrived at a moment when British dance music was moving toward harder, more commercial territory, and made the opposite case: that electronic music could be patient, melodic, and strange all at once.\n\nJames kept working under the Aphex Twin name and a rotating cast of aliases — AFX, Polygon Window, Caustic Window — releasing music that ranged from the gentler ambient of Selected Ambient Works Volume II (1994) to the aggressive, intricately programmed drill-and-bass of the Come to Daddy and Windowlicker EPs later in the decade. A long public silence through the 2000s and early 2010s ended with Syro (2014), released with the same mix of technical density and mischief that had defined his earlier work. He remains one of the most widely studied producers in electronic music, in part because he's revealed so little about his own process.`,
    classicAlbums: [
      ca(
        'selected-ambient-works-85-92',
        'Selected Ambient Works 85–92',
        1992,
        `Selected Ambient Works 85–92 collects tracks Richard D. James made largely alone, over several years, before electronic music had many established ambient conventions to draw on. "Xtal" opens the record on a hazy, pitched-vocal loop over a soft breakbeat, setting a tone — melodic, slightly melancholy, unhurried — that the rest of the album maintains without repeating itself. "Ageispolis" and "Green Calx" show the same instincts pushed into stranger, more abstract territory. Decades on, it still functions as a kind of entry point for ambient techno, precise and personal in a genre that can otherwise feel anonymous.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'autechre',
    name: 'Autechre',
    realm: 'electronic',
    lineage: 'idm',
    signatureSong: 'Second Bad Vilbel',
    bio: `Autechre are Sean Booth and Rob Brown, who met as teenagers in the Manchester area through electro and early hip-hop culture before turning that shared record collection into music of their own. Their early records for Warp — Incunabula (1993), Amber (1994) — were melodic and relatively accessible by the duo's later standards, closer to the electro and ambient techno their contemporaries were also making at the time.\n\nTri Repetae (1995) marked a turn toward something harder and more mechanical, industrial textures and off-kilter rhythm programming replacing the earlier records' warmth. From there the duo pushed steadily further into abstraction, eventually building custom software to generate and manipulate rhythm in ways a human programmer working by hand couldn't easily replicate. Booth and Brown have said relatively little publicly about their methods over three decades of records, letting the increasingly difficult, algorithmic music speak for a project that resists easy summary. The duo have also maintained a long-running residency on the radio station NTS, another outlet for the same exploratory, largely unannounced approach to releasing music that defines their studio albums.`,
    classicAlbums: [
      ca(
        'tri-repetae',
        'Tri Repetae',
        1995,
        `Tri Repetae is the record where Autechre's early melodic electro hardened into something colder and more mechanical, rhythms built from clanking, industrial-sounding samples rather than conventional drum machines. "Second Bad Vilbel" rides a lurching, off-grid beat that never quite resolves into a stable pulse, forcing the listener to adjust to it rather than the other way around. "Dael" and "Rotar" push the same instincts into more abrasive territory, texture standing in for melody almost entirely. It's widely treated as a turning point in the IDM genre's move away from its more dancefloor-friendly beginnings.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'boards-of-canada',
    name: 'Boards of Canada',
    realm: 'electronic',
    lineage: 'idm',
    signatureSong: 'Roygbiv',
    bio: `Boards of Canada are Michael Sandison and Marcus Eoin, two Scottish musicians who took their name from the National Film Board of Canada, whose nature documentaries they'd grown up watching and whose warm, slightly degraded film stock became a sonic touchstone. What started as a larger, loosely defined collective in their teens narrowed over time into the duo who signed to Warp and Skam in the late 1990s.\n\nMusic Has the Right to Children (1998) established the sound the duo is still known for: pitch-bent synths, tape hiss, and children's-television nostalgia curdled into something quietly unsettling. Geogaddi (2002) pushed that unease further, layering numerological references and darker textures under the same warm surfaces. The Campfire Headphase (2005) and Tomorrow's Harvest (2013), released after a long gap, extended the project in more guitar-inflected and more overtly dystopian directions respectively. Boards of Canada have released music rarely and given almost no interviews over three decades, treating scarcity and ambiguity as part of the work rather than an obstacle to promoting it.`,
    classicAlbums: [
      ca(
        'music-has-the-right-to-children',
        'Music Has the Right to Children',
        1998,
        `Music Has the Right to Children sounds like a childhood half-remembered — warm analog synths deliberately detuned and wobbling, drum patterns that shuffle rather than snap, samples of children's voices surfacing and receding without context. "Roygbiv" is the clearest distillation, a short, major-key piece built from a simple bassline and a haze of pitch-bent chords that manages to feel both comforting and faintly wrong. "Aquarius" pairs a stuttering vocal sample with one of the duo's most memorable melodic hooks. The album's specific brand of hazy, nostalgic dread became one of the most widely imitated textures in electronic music over the following decade.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'squarepusher',
    name: 'Squarepusher',
    realm: 'electronic',
    lineage: 'idm',
    signatureSong: 'Come On My Selector',
    bio: `Tom Jenkinson began recording as Squarepusher in the mid-1990s from Essex. His 1996 debut, Feed Me Weird Things, appeared on Aphex Twin's Rephlex label and already showed what set him apart from other producers working in similar drill-and-bass territory at the time: Jenkinson was also a genuinely skilled jazz bassist, and much of his music treats the bass guitar as a lead instrument rather than a foundation for someone else's melody.\n\nHard Normal Daddy (1997), his first album for Warp, brought that fusion-inflected bass playing into closer alignment with breakneck, intricately edited drum programming. Jenkinson's catalog since has moved between that approach and more purely electronic, occasionally much harsher material, resisting any single description of what a Squarepusher record is supposed to sound like. He has continued releasing music steadily, including work with the "virtual band" Shobaleader One, a live setup built around masked, robot-like stage personas that extends his interest in blurring human performance and machine precision into the visual side of his shows.`,
    classicAlbums: [
      ca(
        'hard-normal-daddy',
        'Hard Normal Daddy',
        1997,
        `Hard Normal Daddy is the record where Squarepusher's two obsessions — breakneck, digitally chopped breakbeats and genuinely accomplished jazz-fusion bass playing — sit most comfortably side by side. The rhythm programming is dense almost to the point of overload, drum edits arriving faster than a human drummer could physically play them, while Jenkinson's bass lines underneath sound completely live and melodically fluent. "Beep Street" is the clearest example of that tension working, virtuoso playing riding a breakbeat that refuses to settle into a groove. It remains one of the most technically demanding records to come out of the mid-'90s Warp/Rephlex scene, and one of the least imitated simply because so few other producers can play like Jenkinson does.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'burial',
    name: 'Burial',
    realm: 'electronic',
    lineage: 'idm',
    signatureSong: 'Archangel',
    bio: `Burial is William Bevan, a producer from South London who released his self-titled debut in 2006 on Hyperdub, the label run by Kode9, without any promotional apparatus or public identity attached to the name. The music itself — heavily processed garage and 2-step rhythms, pitched vocal samples, vinyl crackle standing in for the ambience of a London night bus — sounded like it was arriving from somewhere just adjacent to the dance music scenes it drew from rather than squarely inside them.\n\nUntrue (2007) refined that approach into something more melodic and considerably more widely heard, its hazy, rain-soaked atmosphere and lonely, processed vocal fragments becoming one of the defining textures of that period's UK bass music. Bevan's identity became public against his own preference not long after, but he has continued to give only occasional, mostly written interviews and has rarely performed live. He has kept releasing music steadily in the years since, extending the same melancholic, ambient-leaning sound across a series of singles and EPs.`,
    classicAlbums: [
      ca(
        'untrue',
        'Untrue',
        2007,
        `Untrue takes the vinyl crackle, pitched-up vocal samples, and skeletal 2-step rhythms of Burial's debut and turns them into something closer to pop songwriting, without sacrificing any of the fog the earlier record was built from. "Archangel" is the clearest case — a chopped, helium-pitched vocal sample looped over a slow, melancholic beat that somehow reads as genuinely emotional rather than as a production trick. "Ghost Hardware" and the title track extend the same palette into more skeletal, unresolved territory. It's a record that made isolation and bad weather sound like a legitimate genre unto itself, and a good deal of the UK bass and ambient-adjacent music that followed still carries its influence.`,
      ),
    ],
  },

  // realm: electronic, lineage: ambient-drone
  {
    ...islandTwoBase,
    id: 'oneohtrix-point-never',
    name: 'Oneohtrix Point Never',
    realm: 'electronic',
    lineage: 'ambient-drone',
    signatureSong: 'Sleep Dealer',
    bio: `Daniel Lopatin began releasing music as Oneohtrix Point Never in the late 2000s, initially through cassettes and small-run vinyl built from vintage synthesizers and a fascination with the specific, slightly degraded warmth of analog gear from his childhood. His early records were patient, drone-based ambient music, closer in spirit to the genre's classic minimalist practitioners than to anything happening in dance music at the time.\n\nReplica (2011) shifted his method significantly, built largely from sampled television commercials chopped and warped into disorienting, hazy loops rather than pure synthesis. Lopatin kept moving in the years after — toward the MIDI-orchestral textures of R Plus Seven, the harsher industrial persona of Garden of Delete, the baroque digital pop of Age Of — treating each album as a chance to dismantle whatever palette the last one had settled into. He has also composed film scores, including work with directors Josh and Benny Safdie, extending the same interest in beautiful, unstable textures into a different medium.`,
    classicAlbums: [
      ca(
        'replica',
        'Replica',
        2011,
        `Replica is built almost entirely from sampled television advertisements — jingles, spoken fragments, canned emotional cues — slowed, pitched, and layered until the original source material becomes unrecognizable as commerce and starts to feel like memory. "Sleep Dealer" loops a warm, melancholic vocal fragment over a queasy, shifting bed of tones that never resolves into a conventional chord progression. "Andro" and "Nassau" work the same technique at different speeds, one hypnotic and slow-moving, the other more agitated. The album's central idea — that advertising's discarded emotional language could be repurposed into something genuinely affecting — became one of the more influential moves in 2010s ambient and experimental music.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'tim-hecker',
    name: 'Tim Hecker',
    realm: 'electronic',
    lineage: 'ambient-drone',
    signatureSong: 'The Piano Drop',
    bio: `Tim Hecker began releasing music in the early 2000s, first under the name Jetone and then under his own name, building dense, physically overwhelming drone music from heavily processed guitar, organ, and synthesizer textures. His records treat distortion and saturation as compositional tools in their own right, pushing sound past the point where individual instruments remain identifiable.\n\nRavedeath, 1972 (2011), recorded partly on a church organ in Reykjavik and named for a well-known photograph of a piano being pushed off an MIT building, is generally treated as the fullest realization of that approach — vast, corroded-sounding pieces that blur the line between the organ's source recordings and the studio treatments applied afterward. Hecker has continued exploring different collaborators and contexts since, including recording with a Japanese gagaku ensemble on Konoyo (2018) and Anoyo (2019), while keeping the same basic interest in beauty produced through degradation rather than despite it. He has also contributed to film and installation work at points in his career, extending the same interest in overwhelming, physically felt sound into settings well beyond a conventional album release.`,
    classicAlbums: [
      ca(
        'ravedeath-1972',
        'Ravedeath, 1972',
        2011,
        `Ravedeath, 1972 was built from recordings made on the pipe organ of a church in Reykjavik, later layered, pitch-shifted, and buried under distortion until the source instrument becomes almost unrecognizable. "The Piano Drop" — its title referencing the album's cover photo of an MIT prank gone slightly wrong — rides a queasy, detuned melodic figure through waves of saturation that keep threatening to swallow it entirely. "In the Fog" extends the same idea across a longer, more patient arc. It's a record about beauty surviving heavy damage, and its scale and physical intensity set a high bar for the ambient and drone records that followed it.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'stars-of-the-lid',
    name: 'Stars of the Lid',
    realm: 'electronic',
    lineage: 'ambient-drone',
    signatureSong: "Even If You're Never Awake",
    bio: `Stars of the Lid are Brian McBride and Adam Wiltzie, who formed in Austin, Texas in the early 1990s and spent the following decade slowly building one of ambient music's most patient catalogs for the Chicago label Kranky. Their method involves layering guitars, strings, and brass and processing out the instruments' attack, so individual notes blur into long, continuous tones rather than remaining identifiable as performances.\n\nThe Tired Sounds of Stars of the Lid (2001) widened the duo's audience considerably, and And Their Refinement of the Decline (2007) — a more fully orchestral, string-and-brass-heavy record — became their most expansive statement before the pair largely stepped back from making new music together. McBride and Wiltzie have each continued working in ambient and neoclassical contexts separately since, Wiltzie most visibly through A Winged Victory for the Sullen, while occasionally reuniting for live performances of the older material. Their records are frequently used in film and television scoring contexts, a testament to how effectively the duo's long, slow-moving pieces function as mood and atmosphere rather than as songs built around a clear beginning or end.`,
    classicAlbums: [
      ca(
        'refinement-of-the-decline',
        'And Their Refinement of the Decline',
        2007,
        `And Their Refinement of the Decline is Stars of the Lid at their most orchestral, layering strings, brass, and processed guitar into long, slow-moving pieces with almost no percussive element to mark time. "Even If You're Never Awake" unfolds over several minutes without a clear beginning or end, individual instruments impossible to isolate inside the overall haze. "Dungtitled (In A Major)" pushes the same approach across an even longer arc, patience functioning as the record's central technique rather than an incidental quality. It remains one of the more fully realized documents of drone as a genuinely orchestral, rather than purely electronic, practice.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'grouper',
    name: 'Grouper',
    realm: 'electronic',
    lineage: 'ambient-drone',
    signatureSong: 'Alien Observer',
    bio: `Grouper is Liz Harris, a musician from the Pacific Northwest whose records bury voice and melody so deep in tape hiss and reverb that individual words often become impossible to make out. Dragging a Dead Deer Up a Hill (2008) established that method for a wider audience — hushed, blurred songs that felt private in a way most recorded music doesn't manage, closer to overheard than performed.\n\nAIA: Alien Observer and its companion release, AIA: Dream Loss, both appeared in 2011 as a linked two-part project, extending the same hushed, tape-saturated language across a longer, more sustained listen. Harris pulled back from that density on Ruins (2014), a comparatively stripped, piano-led record made during a stay in rural Portugal. She has kept releasing music steadily since, moving between the two poles — dense, obscured guitar pieces and sparer, more exposed ones — without settling permanently into either. Harris has also worked as a visual artist alongside her music, and the hand-assembled, lo-fi packaging of her early physical releases reflects the same interest in intimacy and imperfection that defines the recordings themselves.`,
    classicAlbums: [
      ca(
        'aia-alien-observer',
        'AIA: Alien Observer',
        2011,
        `AIA: Alien Observer buries Liz Harris's voice and guitar so deep in reverb and tape hiss that the songs function more as weather than as narrative — melody is present throughout, but it arrives filtered through so much haze that it registers as mood before it registers as tune. The title track sets the pattern immediately, a slow, layered wash where individual chords blur into each other rather than resolving cleanly. The tracks around it favor repetition and duration over conventional song structure, asking the listener to sit inside the sound rather than follow it. It's one of the more fully immersive records in the drone-adjacent end of the dream-pop and ambient continuum Grouper works between.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'harold-budd',
    name: 'Harold Budd',
    realm: 'electronic',
    lineage: 'ambient-drone',
    signatureSong: 'Late October',
    bio: `Harold Budd came to ambient music from an unusual direction — trained as a composer in Southern California, he had worked in free jazz and academic minimalism before settling on the soft, reverb-treated piano pieces that became his signature. His music largely avoided the "New Age" label critics sometimes reached for, favoring instead a kind of purposeful simplicity: single notes and small clusters of them, given room to decay fully before the next one arrives.\n\nBudd's two full-length collaborations with Brian Eno, Ambient 2: The Plateaux of Mirror (1980) and The Pearl (1984), sit among the defining records of ambient music's early formal identity, extending Eno's own conceptual framework through Budd's more overtly melodic, pianistic sensibility. He continued recording prolifically into his final years, working with a range of collaborators across dozens of albums that rarely deviated from the patient, uncrowded aesthetic he'd established decades earlier. Budd died in 2020, having spent almost fifty years refining essentially one idea with remarkable consistency.`,
    classicAlbums: [
      ca(
        'the-pearl',
        "The Pearl",
        1984,
        `The Pearl extends the hushed, reverb-soaked piano language Harold Budd and Brian Eno developed on Ambient 2 into something warmer and more overtly melodic, produced with Daniel Lanois's careful attention to space and decay. "Late October" is characteristic of the whole record — a handful of piano phrases, spaced out and allowed to ring, with synthesizer textures filling in around them rather than underneath them. "The Silvered Tongue" and "Against the Sky" work the same restrained palette at slightly different tempos. It remains a foundational record in ambient music's early formal identity, precise and unhurried in a way few artists have matched since.`,
      ),
    ],
  },

  // realm: electronic, lineage: electronic-indie-dancepunk
  {
    ...islandTwoBase,
    id: 'lcd-soundsystem',
    name: 'LCD Soundsystem',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'All My Friends',
    bio: `LCD Soundsystem began as largely a solo studio project for James Murphy, who co-founded the New York label DFA Records in the early 2000s and released the wry, list-driven single "Losing My Edge" in 2002 before ever putting together a full band. The song's anxious, funny take on record-collector one-upmanship set the tone for much of what followed: dance music made by someone who'd spent more time thinking about music history than about the dancefloor itself.\n\nSound of Silver (2007), the project's second album and its critical high point, balanced that self-aware wit against genuinely moving songwriting, especially on the extended, elegiac "All My Friends." Murphy disbanded LCD Soundsystem after a widely covered farewell concert at Madison Square Garden in 2011, only to reconvene the group a few years later for American Dream (2017) and further records since. The band's sound — post-punk rhythm sections filtered through disco and house structures — became one of the most widely cited templates for 2000s dance-punk.`,
    classicAlbums: [
      ca(
        'sound-of-silver',
        'Sound of Silver',
        2007,
        `Sound of Silver is LCD Soundsystem's most emotionally direct record, pairing James Murphy's dry, list-making wit with songs that are unexpectedly moving underneath the dance-rock chassis. "All My Friends" builds a single piano riff into an eight-minute meditation on aging and friendship, gaining urgency without ever changing its basic pattern. "North American Scum" and "Someone Great" show the album's range, one a sardonic, groove-heavy jab, the other a quietly devastating song about loss disguised as a synth-pop track. It's the record that convinced listeners who'd dismissed dance-punk as a passing revival that Murphy was working toward something more lasting.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'hot-chip',
    name: 'Hot Chip',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'Over and Over',
    bio: `Hot Chip formed in London in the early 2000s around Alexis Taylor and Joe Goddard, who had known each other since attending Elliott School in Putney — a comprehensive school that, by coincidence, produced several other electronic musicians of their generation. Their early records mixed deadpan, almost bedroom-pop vocal melodies with dance and R&B production, a combination that read as more sincere than ironic despite the band's evident sense of humor about itself.\n\nThe Warning (2006) turned that mixture into something considerably more physical, built around thicker, clubbier productions without losing the melodic core. Hot Chip have kept recording steadily since, moving between records that lean toward song-based electronic pop and others that push further into dance music proper, while Goddard and Taylor have also pursued production and DJ work outside the band. Few groups from the same period have sustained that particular balance of warmth and rhythm for as long.`,
    classicAlbums: [
      ca(
        'the-warning',
        'The Warning',
        2006,
        `The Warning is where Hot Chip's early bedroom-pop melodicism met a much more confident, clubby production sensibility. "Over and Over" rides a simple, insistent cowbell pattern and a chanted vocal hook that turns repetition itself into the song's main event, a deadpan nod to Kraftwerk's own motorik pulse. "Boy from School" slows things down into something more melancholic, proving the band could sustain a mood as well as a groove. The album's blend of wit, warmth, and genuinely danceable production made it one of the more purely enjoyable records to come out of mid-2000s British electronic-pop.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'the-postal-service',
    name: 'The Postal Service',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'Such Great Heights',
    bio: `The Postal Service was a side project formed in the early 2000s by Ben Gibbard of Death Cab for Cutie and producer Jimmy Tamborello, who worked separately in Seattle and Los Angeles and traded tracks back and forth by mail — a working method literal enough to give the project its name. Jenny Lewis of Rilo Kiley contributed guest vocals throughout, adding a second melodic voice to Gibbard's own.\n\nGive Up (2003) paired Tamborello's glitchy, IDM-inflected electronic production with Gibbard's straightforwardly emotional indie-pop songwriting, a combination that found an unusually wide audience for a side project on an independent label. The real-world United States Postal Service objected to the band's name not long after, and the dispute was resolved with a promotional tie-in rather than a lawsuit. The Postal Service never released a proper follow-up album, reconvening only for anniversary tours, which has left Give Up standing as the group's entire studio statement.`,
    classicAlbums: [
      ca(
        'give-up',
        'Give Up',
        2003,
        `Give Up pairs Jimmy Tamborello's glitchy, IDM-derived production — clicking drum programming, warm analog synth pads — with Ben Gibbard's direct, melodically confident indie-pop songwriting, a combination neither had really attempted before. "Such Great Heights" is the clear centerpiece, a bright, yearning love song whose synth melody became as recognizable as the vocal line itself. "Nothing Better," a bickering duet with guest vocalist Jenny Lewis, shows the album's more playful, conversational side. It remains one of the clearest and most listenable bridges between early-2000s indie rock and the electronic music its audience wasn't necessarily already listening to.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'four-tet',
    name: 'Four Tet',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'She Moves She',
    bio: `Kieran Hebden began making music as a teenager in the post-rock band Fridge before starting a solo project, Four Tet, that combined live-sounding instrumentation — flute, strings, harp-like samples — with electronic beats and production techniques drawn from hip-hop and IDM. Critics reached for the word "folktronica" to describe the results, a label Hebden has never much embraced but that stuck to his early work regardless.\n\nRounds (2003) became the record most listeners associate with him, its warm, intricately layered production finding an audience well beyond the electronic scenes Hebden had come from. He went on to collaborate directly with several artists connected to this same lineage, including a string of recordings with jazz drummer Steve Reid and a handful of tracks made with Burial. Hebden has continued releasing solo albums steadily since, alongside running his own label, Text, and experimenting with unconventional, low-key ways of putting records into the world.`,
    classicAlbums: [
      ca(
        'rounds',
        'Rounds',
        2003,
        `Rounds is built from warm, granular samples — plucked strings, flute-like tones, found percussion — arranged with a clarity and warmth that set Kieran Hebden apart from the colder end of British electronic music at the time. "She Moves She" layers a simple vocal fragment and a loose, almost live-sounding beat into something that feels handmade despite being entirely programmed. "Hands" and "Spirit Fingers" show the same instinct for turning small, organic-sounding fragments into a full arrangement without the seams showing. The album's blend of acoustic warmth and electronic structure gave a name and a real audience to what critics were already calling folktronica.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'caribou',
    name: 'Caribou',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'Odessa',
    bio: `Dan Snaith began recording as Manitoba in the early 2000s while completing a mathematics PhD in London, before a naming dispute with the American punk musician Richard "Handsome Dick" Manitoba forced a change to Caribou partway through his career. His early records mixed psychedelic pop songwriting with dense, sample-based production, warmer and more melodic than most of the electronic music he'd cited as an influence growing up.\n\nSwim (2010) marked a deliberate turn toward club music, Snaith having said he wanted to make dance tracks that still sounded distinctly like songs rather than functional tools for DJs. Andorra (2007), the album released just before that shift, had already won Canada's Polaris Music Prize and expanded his audience considerably. Snaith has continued alternating between song-focused Caribou albums and more straightforwardly club-oriented material released under the alias Daphni, treating the two as related but distinct outlets for the same underlying interests. He has also worked as a remixer and occasional live collaborator for a range of other electronic musicians, keeping Caribou's audience connected to scenes well beyond the one he first emerged from.`,
    classicAlbums: [
      ca(
        'swim',
        'Swim',
        2010,
        `Swim is the record where Dan Snaith pushed Caribou's sound toward the dancefloor without abandoning the melodic, slightly wistful songwriting that had defined his earlier work as Manitoba and early Caribou. "Odessa" opens the album on a squelchy, rubbery bassline and a vocal melody that stays plaintive even as the rhythm section insists on movement. "Sun" pushes the same tension further, a repeated vocal loop riding an increasingly heavy, physical groove. Snaith has said he built the record around the specific sound of vocals and instruments processed to feel like they were recorded underwater, and that idea holds the album together as much as any single track does.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'the-rapture',
    name: 'The Rapture',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'House of Jealous Lovers',
    bio: `The Rapture formed in the late 1990s, with members meeting in San Francisco before relocating to New York and connecting with James Murphy and Tim Goldsworthy's fledgling DFA production outfit. The 2002 single "House of Jealous Lovers," produced by Murphy and Goldsworthy, fused post-punk guitar tension with a four-on-the-floor dance beat in a way that felt genuinely startling at the time and helped establish DFA's reputation before the label had released much else.\n\nEchoes (2003), the album that followed, extended that fusion across a full record, adding saxophonist Gabriel Andruzzi's parts to Luke Jenner's tense vocals and guitar. The band's later records moved toward a more conventional, polished indie-pop sound, and a lineup change and extended hiatus followed before a partial reunion years later. Echoes remains the record most closely identified with the early-2000s dance-punk moment DFA did so much to shape. Vito Roccoforte and Matt Safer, the band's other founding members, remained its rhythmic backbone even as guitarists and additional players moved in and out of the lineup over the years that followed.`,
    classicAlbums: [
      ca(
        'echoes',
        'Echoes',
        2003,
        `Echoes is the fullest studio statement of the dance-punk sound The Rapture helped kick into gear with their DFA-produced singles. "House of Jealous Lovers" anchors the record, Luke Jenner's yelped vocals and scraping guitar riding a four-on-the-floor beat and cowbell pattern lifted as much from disco as from post-punk. "Olio" and "Killing" show the same tension between rock instrumentation and dance rhythm applied to slower, moodier material. The album captures a specific moment when post-punk revivalism and DFA's disco-not-disco aesthetic briefly looked like the same genre.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'chk-chk-chk',
    name: '!!!',
    realm: 'electronic',
    lineage: 'electronic-indie-dancepunk',
    signatureSong: 'Must Be the Moon',
    bio: `!!! formed in Sacramento in the mid-1990s among a loose group of musicians who also played in the related band Out Hud, with singer Nic Offer's manic, half-spoken vocal style becoming the group's most immediately identifiable feature. Their sound combines dance-punk's angular guitar and bass with a much deeper commitment to actual dance-music structure — long, percussion-heavy grooves indebted as much to disco and house as to any punk lineage.\n\nMyth Takes (2007) is generally considered the fullest realization of that approach, extending the band's live-heavy, percussion-forward sound across a tighter set of songs than their earlier, more sprawling releases. !!! have continued recording and touring steadily since, maintaining an unusually large and rotating live lineup built to reproduce the density of their studio percussion arrangements. The band's commitment to actually functioning as dance music, rather than just referencing it, set them apart from many of their more strictly rock-oriented dance-punk peers.`,
    classicAlbums: [
      ca(
        'myth-takes',
        'Myth Takes',
        2007,
        `Myth Takes tightens !!!'s sprawling, percussion-heavy dance-punk into a more focused set of songs without losing the live-band physicality that set them apart from more strictly electronic acts. "Must Be the Moon" rides a loose, conga-driven groove under Nic Offer's half-sung, half-muttered vocal, treating repetition and rhythm as the song's actual hook. "All My Heroes Are Weirdos" pushes the same idea into a sparer, more skeletal arrangement. The album makes the band's underlying argument plainly: that a band built around guitars and drums could function as genuine dance music rather than a rock approximation of it.`,
      ),
    ],
  },

  // realm: electronic, lineage: trip-hop-downtempo
  {
    ...islandTwoBase,
    id: 'massive-attack',
    name: 'Massive Attack',
    realm: 'electronic',
    lineage: 'trip-hop-downtempo',
    signatureSong: 'Teardrop',
    bio: `Massive Attack formed in Bristol in the late 1980s out of the Wild Bunch, a sprawling local sound-system collective whose members went in several different musical directions once it dissolved. Robert "3D" Del Naja, Grant "Daddy G" Marshall, and Andrew "Mushroom" Vowles built the core group around slow, bass-heavy productions that pulled from hip-hop, dub, and soul without committing fully to any of them, working with a rotating cast of guest vocalists rather than a single frontperson.\n\nBlue Lines (1991) is widely treated as a foundational record for what critics later labeled trip-hop, a term the band has never been fond of. Mezzanine (1998) pushed the sound toward something colder and more guitar-driven, incorporating industrial textures and reggae singer Horace Andy's vocals alongside a widely noted guest turn from Cocteau Twins' Elizabeth Fraser. Vowles left the group not long after that album, and Del Naja and Marshall have continued recording and touring as Massive Attack in the years since, at a considerably slower and more selective pace.`,
    classicAlbums: [
      ca(
        'mezzanine',
        'Mezzanine',
        1998,
        `Mezzanine is Massive Attack's coldest, most guitar-heavy record, layering industrial textures and dub bass under a set of vocal performances pulled from very different traditions. "Teardrop" is the clear centerpiece, Elizabeth Fraser's vocal — reportedly recorded after the band turned down a bigger-name singer for the part — floating over a heartbeat-like rhythm and a harpsichord figure that gives the song its unusual gravity. "Angel" and "Inertia Creeps" show the album's darker register, closer to industrial rock than to the hip-hop-inflected sound of the band's earlier records. It remains the point where Massive Attack's music turned decisively toward dread rather than the warmer melancholy of their earlier work.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'portishead',
    name: 'Portishead',
    realm: 'electronic',
    lineage: 'trip-hop-downtempo',
    signatureSong: 'Glory Box',
    bio: `Portishead formed in Bristol in the early 1990s around Geoff Barrow and Beth Gibbons, after Barrow had spent time as a studio assistant on Massive Attack's Blue Lines sessions and used the spare studio hours he was given there to start developing his own material. Guitarist Adrian Utley joined soon after, bringing a background in jazz and film-score arranging that shaped the group's noirish, cinematic sound as much as Barrow's sampling did.\n\nDummy (1994), the trio's debut, won the UK's Mercury Music Prize the following year and became one of the defining records of the mid-'90s British trip-hop moment, built around Gibbons's aching, torch-singer vocals and Barrow's crackling, library-music-inspired production. Portishead's self-titled second album (1997) pushed further into difficult, dissonant territory, and Third (2008), released after an eleven-year gap, abandoned much of the group's earlier sound for something colder and more motorik. The band has released very little since, with Gibbons and Barrow both pursuing separate projects in the years between records.`,
    classicAlbums: [
      ca(
        'dummy',
        'Dummy',
        1994,
        `Dummy sounds like a film score for a movie that doesn't exist, built from crackling vinyl samples, jazz-inflected guitar, and Beth Gibbons's aching, vulnerable vocal performances. "Glory Box," built around a sampled Isaac Hayes guitar line, is the album's emotional peak, Gibbons's voice moving from weary resignation to something closer to demand across the song's four minutes. "Sour Times" pairs a tense, cinematic arrangement with one of the record's most immediately memorable vocal hooks. Its combination of hip-hop production technique and torch-song emotional register gave the trip-hop label its clearest and most widely cited musical template.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'tricky',
    name: 'Tricky',
    realm: 'electronic',
    lineage: 'trip-hop-downtempo',
    signatureSong: 'Hell Is Round the Corner',
    bio: `Tricky, born Adrian Thaws, grew up in Bristol and was part of the Wild Bunch sound-system scene as a teenager, later contributing guest vocals to Massive Attack's Blue Lines (1991) and Protection (1994) before starting a solo career of his own. His debut, Maxinquaye (1995), took its title from his mother, Maxine Quaye, who died when he was a young child, and its songs draw heavily on that loss alongside more oblique, paranoid lyrics delivered in his distinctive murmured half-rap.\n\nMuch of the album's actual singing was done by Martina Topley-Bird rather than Tricky himself, his lyrics filtered through her voice to create a deliberately unsettled, androgynous effect that became one of the record's most distinctive features. Tricky continued recording prolifically through the following decades, moving through denser, more abrasive material on records like Pre-Millennium Tension (1996) and later returning to sparer, more reflective songwriting. His catalog is large and uneven by his own admission, but Maxinquaye remains the record most listeners return to first.`,
    classicAlbums: [
      ca(
        'maxinquaye',
        'Maxinquaye',
        1995,
        `Maxinquaye pairs Tricky's murmured, paranoid lyrics with Martina Topley-Bird's voice, which carries most of the album's actual singing and gives the record an androgynous, unsettled quality rare in mid-'90s British music. "Hell Is Round the Corner" builds its menace from a slowed, warped sample and Tricky's own half-spoken verses, dread arriving through atmosphere rather than volume. "Black Steel," a cover of a Public Enemy track rebuilt as sludgy rock, shows the record's willingness to pull from entirely unrelated genres without softening the source material. It's a claustrophobic, deeply personal record that helped define trip-hop's darker, more paranoid edge alongside Portishead's more cinematic version of the same moment.`,
      ),
    ],
  },

  // realm: electronic, lineage: hyperpop-pcmusic
  {
    ...islandTwoBase,
    id: 'sophie',
    name: 'SOPHIE',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Immaterial',
    bio: `SOPHIE, born Sophie Xeon in Scotland, began releasing music anonymously in the early 2010s, revealing almost nothing about her identity while singles like "Bipp" and "Lemonade" built a devoted following among a small, London-adjacent scene of producers experimenting with exaggerated, candy-colored electronic pop. She worked closely with A.G. Cook and the artists around his PC Music label without ever formally being one of them, and produced or co-produced tracks for pop artists including Charli XCX as her profile grew.\n\nOil of Every Pearl's Un-Insides (2018), her only studio album released during her lifetime, combined the hyper-artificial textures of her early singles with a newly personal, emotionally direct set of lyrics, and earned wide critical acclaim including a Grammy nomination. SOPHIE came out publicly as a transgender woman around the same period, an act that added further weight to the album's recurring themes of transformation and self-invention. She died in 2021 after an accident in Athens, at the height of her influence on pop and electronic music that had absorbed her sound faster than most listeners realized.`,
    classicAlbums: [
      ca(
        'oil-of-every-pearls-un-insides',
        "Oil of Every Pearl's Un-Insides",
        2018,
        `Oil of Every Pearl's Un-Insides pushes SOPHIE's exaggerated, synthetic textures — pitched vocals, rubbery basslines, sounds that seem to melt and reform mid-song — into service of genuinely personal songwriting rather than pure sonic provocation. "Immaterial" is the clearest distillation, a giddy, maximalist pop song about identity as something chosen and rebuilt rather than fixed. "It's Okay to Cry," the album's lead single, paired an unusually tender vocal performance with SOPHIE's first public appearance as herself. The record argues that hyperpop's most artificial-sounding textures could carry as much genuine feeling as any conventional pop production, and much of the genre's subsequent decade took that argument as a starting point.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'a-g-cook',
    name: 'A.G. Cook',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Oh Yeah',
    bio: `A.G. Cook founded the PC Music label in England in the early 2010s as a home for a small group of producers pushing pop's most artificial-sounding elements — pitch-shifted vocals, overtly synthetic drums, bubblegum melodies rendered slightly uncanny — further than mainstream pop dared to. He became a close, prolific collaborator with SOPHIE and with Charli XCX, producing and co-writing across several of her mixtapes and albums as her sound moved closer to the PC Music aesthetic he'd helped define.\n\n7G (2020), a sprawling, multi-disc solo release, functioned as a kind of statement of range, moving between genres and production styles across dozens of tracks rather than settling into a single mode. Cook has continued working prolifically both under his own name and as a producer for other artists, treating PC Music's original aesthetic less as a fixed sound than as a starting point other pop music could be built from. His influence on 2010s and 2020s pop production is considerable, even when his own name isn't the one listeners recognize.`,
    classicAlbums: [
      ca(
        '7g',
        '7G',
        2020,
        `7G is less a conventional album than a demonstration of range, a sprawling, multi-disc release moving between glitchy pop, ambient interludes, and straightforwardly pretty songwriting without settling into any single mode for long. "Oh Yeah" is one of the record's more accessible moments, a bright, hooky pop song that still carries the slightly uncanny, over-processed quality running through Cook's production generally. Elsewhere the record swings into much stranger territory, treating its own scale as license to try nearly everything at once. It's a useful map of A.G. Cook's actual range, released at a moment when most listeners only knew him through his work for other artists.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: '100-gecs',
    name: '100 gecs',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'money machine',
    bio: `100 gecs are Dylan Brady and Laura Les, who began making music together after connecting online and built 1000 gecs (2019) from a deliberately overloaded mix of hyperpop, nightcore, ska, dubstep, and pop-punk, released independently before it spread largely through online meme culture rather than any conventional promotion. The record's aggressively distorted, maximalist production and Les's pitch-shifted vocals made it sound unlike anything charting at the time, closer to an internet in-joke than to any single genre lineage.\n\nA remix collection, 1000 gecs and the Tree of Clues (2020), brought in an unusually wide range of guest artists, from pop stars to hardcore and pop-punk musicians, reflecting how broadly the duo's sound had already traveled. 10,000 gecs (2023) pulled back some of the extremity in favor of a more straightforwardly pop-punk-leaning sound, while keeping the duo's sense of humor intact. 100 gecs are often cited as a foundational act in hyperpop's mainstream visibility, despite the duo's own account of their influences running mostly through metal, dubstep, and novelty pop rather than through the PC Music scene they're frequently grouped with.`,
    classicAlbums: [
      ca(
        '1000-gecs',
        '1000 gecs',
        2019,
        `1000 gecs crams half a dozen genres into songs that rarely last past the two-minute mark, distortion pushed so far past comfortable levels that it becomes the point rather than a flaw. "money machine" is the clearest entry point, Laura Les's pitch-shifted vocal riding a beat that swings between ska guitar, dubstep bass drops, and pop-punk shout-along energy without any of it feeling like a transition. "stupid horse" and "745 sticky" show the same instinct for genre collision applied even more aggressively. The album's sheer density and refusal to resolve into one sound became a genuine reference point for hyperpop as it moved from internet niche to a term major labels started using.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'charli-xcx',
    name: 'Charli XCX',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Track 10',
    bio: `Charli XCX began as a fairly conventional pop artist, scoring big early hits with "I Love It" and "Boom Clap" before pivoting hard toward a stranger, more experimental sound through a run of mixtapes made with SOPHIE and A.G. Cook starting in 2016. Pop 2 (2017) in particular became a touchstone for the emerging hyperpop scene, pairing Charli's pop songwriting instincts with heavily distorted, maximalist PC Music production, a long list of guest features, and deeper cuts like "Track 10" that fans singled out despite its deliberately blank title.\n\nCharli continued moving between mainstream pop albums and more experimental side releases through the years that followed, treating the two modes as complementary rather than contradictory. Brat (2024) folded much of what she'd absorbed from the PC Music and hyperpop scenes into a bigger pop framework, and the album became a genuine cultural moment, its aesthetic and attitude widely discussed well beyond her existing fanbase. Charli has been consistently vocal about her debt to SOPHIE specifically, crediting her directly as a foundational influence on the direction her music took after their early collaborations.`,
    classicAlbums: [
      ca(
        'brat',
        'Brat',
        2024,
        `Brat compresses years of Charli XCX's hyperpop-adjacent experimentation into a tighter, more immediate pop framework, loud, brash production sitting alongside lyrics that are unusually candid about ambition, insecurity, and her own place in pop's pecking order. "360" opens the record on a strutting, self-mythologizing note that sets the tone for much of what follows. "Girl, so confusing" turns an actual, specific interpersonal conflict into a song rather than a vague concept, an unusually direct move for a pop record built otherwise on outsized confidence. Brat became a genuine cultural touchstone in the year of its release, extending the hyperpop aesthetic she'd helped popularize into a much larger pop audience.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'arca',
    name: 'Arca',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Piel',
    bio: `Arca, born Alejandra Ghersi in Caracas, Venezuela, first became widely known as a producer, working on Kanye West's Yeezus (2013) and on a run of albums by Björk beginning with Vulnicura (2015) before her own solo career drew comparable attention. Her early instrumental albums, Xen (2014) and Mutant (2015), built dense, structurally unstable electronic music out of abrupt textural shifts and sounds that seemed to be actively falling apart mid-track.\n\nHer self-titled 2017 album marked a significant turn: her first record built primarily around her own singing voice, largely in Spanish, and considerably more direct about identity and vulnerability than her earlier, more abstract instrumental work. The sprawling Kick series (2020–2021) that followed moved between club-facing reggaeton-adjacent material and some of her most extreme, abrasive sound design yet, often within the same release. Arca has continued to work prolifically both as a producer for other artists and under her own name, treating genre boundaries as something to be actively dismantled rather than respected.`,
    classicAlbums: [
      ca(
        'arca-st',
        'Arca',
        2017,
        `Arca's self-titled third album is her most vocally driven record, built around operatic, often multi-tracked singing in Spanish rather than the purely instrumental abstraction of her earlier work. "Piel" pairs a fragile, exposed vocal melody with production that keeps threatening to dissolve underneath it, tension between voice and instability running through the whole song. "Anoche" and "Reverie" apply the same approach at different emotional registers, one more urgent, the other closer to lullaby. It's the record where Arca's structural interest in collapse and reformation became explicitly personal rather than purely sonic.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'caroline-polachek',
    name: 'Caroline Polachek',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: "So Hot You're Hurting My Feelings",
    bio: `Caroline Polachek first became known as the singer of Chairlift, an indie synth-pop duo she led through the 2000s and 2010s, and as a credited co-writer on Beyoncé's "No Angel," a writing credit that surprised listeners who only knew her from Chairlift's smaller-scale indie records. After that band ended, she released solo material under a couple of different aliases before settling on her own name.\n\nPang (2019), her first album released under her own name and home to "So Hot You're Hurting My Feelings," paired her wide, technically striking vocal range with production touches drawn partly from PC Music-adjacent collaborators, art-pop songwriting filtered through a genuinely maximalist, hyperpop-aware production sensibility. Desire, I Want to Turn Into You (2023) extended that approach further, pulling in a wider range of instrumentation and collaborators while keeping her voice as the clear structural center of every song. Polachek has cited Cocteau Twins as a significant touchstone for her own vocal and atmospheric ambitions, a lineage that runs underneath even her most maximalist, contemporary-sounding production choices.`,
    classicAlbums: [
      ca(
        'desire-i-want-to-turn-into-you',
        'Desire, I Want to Turn Into You',
        2023,
        `Desire, I Want to Turn Into You is Caroline Polachek's most maximalist record, layering flamenco guitar, bagpipes, hyperpop-adjacent production, and her own multi-tracked voice into arrangements that shift shape constantly without losing melodic clarity. "Welcome to My Island" opens the album with a scream that immediately signals bigger, stranger ambitions relative to her earlier work. "Fly to You," a duet with Grimes and Dido, shows the record's unusual instinct for cross-generational, cross-genre collaboration. Across the album, Polachek's voice — technically extraordinary, always in service of the song rather than pure display — holds together a record that could easily have collapsed under its own scope.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'underscores',
    name: 'underscores',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Locals (Girls like us)',
    bio: `underscores is the recording name of April Harper Grey, an American musician who emerged from the same loosely connected, largely online scene of young producers — often labeled digicore — that also produced artists like Jane Remover in the early 2020s. Her early full-length, Fishmonger (2021), mixed hyperpop's distorted, maximalist production with pop-punk energy and unusually direct emotional writing.\n\nWallsocket (2023), a loose concept album set in a fictionalized version of a small Michigan town, broadened that palette considerably, pulling in country and Americana textures alongside the glitchy production that had defined her earlier work. The album was widely treated as a breakout for underscores specifically and for the broader wave of internet-native hyperpop and digicore artists she'd come up alongside. She has continued releasing music at a steady pace since, working across a wide range of collaborators from that same scene, including labelmates and peers she frequently credits directly rather than treating as mere genre neighbors.`,
    classicAlbums: [
      ca(
        'wallsocket',
        'Wallsocket',
        2023,
        `Wallsocket sets its songs in a half-real, half-invented version of a small Michigan town, using that fictional geography to hold together a record that otherwise jumps between hyperpop distortion, pop-punk energy, and country-inflected melody. "Locals (Girls like us)" is one of the clearest distillations, blending a twangy melodic hook with glitchy, maximalist production in a way that shouldn't cohere as well as it does. "Johnny Johnny" and "Uncanny Long Arms" show the record's range, one more anthemic, the other stranger and more fragmented. It's an unusually cohesive record for a genre often defined by its restlessness, held together by a concept as much as by any single sonic signature.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'jane-remover',
    name: 'Jane Remover',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Dancing with Your Eyes Closed',
    bio: `Jane Remover began releasing music as a teenager within the same online digicore and hyperpop scene that produced artists like underscores, building an early catalog defined by distorted, maximalist production and unusually candid lyrics about adolescence and mental health. Frailty (2021) established that sound for a wider audience beyond the scene's original online following.\n\nCensus Designated (2023) marked a deliberate stylistic shift, trading much of the earlier hyperpop distortion for a hazier, guitar-driven sound that critics repeatedly compared to shoegaze acts like My Bloody Valentine and Slowdive. Revengeseekerz (2025) shifted again, pulling back toward denser, more club- and hyperpop-adjacent production while keeping the more developed songwriting she'd built up across the intervening records. Still only in her early twenties as of her most recent releases, Jane Remover has already moved through several distinct sonic identities without settling permanently into any one of them. She has spoken candidly in interviews about mental health and the pressures of coming of age publicly online, themes that run through the shifting production styles as consistently as any single sonic signature does.`,
    classicAlbums: [
      ca(
        'revengeseekerz',
        'Revengeseekerz',
        2025,
        `Revengeseekerz pulls Jane Remover back toward denser, more overtly electronic production after the guitar-heavy detour of Census Designated, without abandoning the more developed songwriting she'd picked up along the way. "Dancing with Your Eyes Closed" pairs a driving, club-adjacent beat with a melodic vocal hook that stays legible even as the production around it gets more chaotic. The record moves quickly between moods and textures, treating its own restlessness as a structural principle rather than a lack of focus. It's a record that folds her hyperpop origins and her more recent guitar-based songwriting into a single, still-evolving sound.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'oklou',
    name: 'Oklou',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'blade bird',
    bio: `Oklou is the recording name of Marylou Mayniel, a French musician whose early mixtapes and EPs built a hushed, softly glitched style of ambient pop, closer in spirit to whispered lullabies than to the louder, more maximalist end of hyperpop she's sometimes grouped with. She developed those early releases largely independently before working more closely with collaborators including A.G. Cook and Danny L Harle.\n\nChoke Enough (2025), her full-length debut studio album, gathered that hushed, glitch-inflected approach into a more sustained, cohesive listen without sacrificing the intimacy of her earlier work. Oklou has pushed back publicly on comparisons to more overtly maximalist hyperpop artists, describing her own music as closer to classic pop songwriting filtered through unconventional production. She remains one of the more distinct voices to emerge from the loose, internet-connected network of producers surrounding PC Music and its associates, precisely because her music resists that scene's most obvious signatures.`,
    classicAlbums: [
      ca(
        'choke-enough',
        'Choke Enough',
        2025,
        `Choke Enough gathers Oklou's hushed, softly glitched approach to pop songwriting into her first full-length statement, prioritizing intimacy and melody over the louder, more maximalist tendencies of the scene she's often placed within. "blade bird" is characteristic of the record's tone, a fragile vocal melody set against production that glitches and stutters without ever overwhelming the song underneath it. The album favors quiet, close-mic'd vocal performances over the pitched, processed extremity found elsewhere in contemporary hyperpop-adjacent pop. It's a record that makes a genuinely persuasive case for restraint inside a scene generally associated with excess.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'ninajirachi',
    name: 'Ninajirachi',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'iPod Touch',
    bio: `Ninajirachi is the Australian producer Nina Wilson, who began releasing dance-pop and hyperpop-adjacent music while still a teenager on the Central Coast of New South Wales, building a sound heavily inflected by the maximalist, emotionally bright electronic pop of artists like Porter Robinson. She has spoken often and specifically about that influence, including in interviews describing the emotional pull of Robinson's production as a formative reference point for her own work.\n\nI Love My Computer (2025), her debut full-length studio album, extended the bright, hook-driven electronic-pop sound of her earlier singles and EPs into a longer, more sustained project. Ninajirachi's music sits at a crossing point between club-functional dance production and the more melodically maximalist end of hyperpop, informed as much by festival main-stage electronic music as by the internet-native scenes she's often associated with. She has built her career largely through steady independent releases and direct engagement with an online fanbase rather than through a single high-profile breakout moment.`,
    classicAlbums: [
      ca(
        'i-love-my-computer',
        'I Love My Computer',
        2025,
        `I Love My Computer gathers Ninajirachi's bright, hook-forward electronic pop into her first full studio statement, balancing club-ready production with the emotionally direct, maximalist songwriting she's said Porter Robinson's influence helped her develop. "iPod Touch" is a fitting centerpiece, its title and lyrics leaning into nostalgia for early-2010s digital culture while the production stays thoroughly current, all glossy synth stabs and compressed drops. The record moves between festival-scaled electronic tracks and quieter, more intimate pop moments without the shifts feeling like a loss of focus. It's a confident debut from an artist who has spent most of her life so far learning this specific craft in public.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'yeule',
    name: 'yeule',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'daisies',
    bio: `yeule is the recording name of Nat Ćmiel, a musician who grew up between Singapore and the UK and built an early following through hazy, glitch-inflected electronic pop released via SoundCloud and small labels in the late 2010s. Their music has consistently blurred the line between digital fragility and genuine emotional rawness, often built around themes of dissociation, identity, and online existence.\n\nGlitch Princess (2022) brought that sound to a wider audience, and softscars (2023) pushed further toward guitar-based, shoegaze-inflected production, a shift Ćmiel has connected in interviews to a renewed interest in '90s alternative rock alongside their electronic influences. yeule's work moves fluidly between ambient, pop, and noisier guitar textures without treating any single genre as a fixed home base, and they have continued to build a devoted, terminally online fanbase that has followed the music's shifts as closely as any single genre label. Ćmiel has also spoken about virtual identity and online avatars as a recurring theme across their work, treating the digital and the physical self as equally real rather than as opposites.`,
    classicAlbums: [
      ca(
        'softscars',
        'softscars',
        2023,
        `softscars pulls yeule's sound away from the purely digital glitch-pop of earlier releases and toward something closer to shoegaze and '90s alternative rock, guitars now sitting alongside the processed vocals and electronic textures that had defined their earlier work. "daisies" is a clear example of that blend, a fragile vocal melody riding a hazy wall of guitar that wouldn't sound out of place on an early-'90s British indie record. "x x x" and "sulky baby" show the same instincts applied at different tempos and intensities. It's a record about vulnerability rendered through genre-blur rather than through any single stylistic signature, and it marked a clear turning point in how yeule's music was described critically.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'porter-robinson',
    name: 'Porter Robinson',
    realm: 'electronic',
    lineage: 'hyperpop-pcmusic',
    signatureSong: 'Musician',
    bio: `Porter Robinson began his career as a teenager within the mainstream EDM and complextro scene of the early 2010s, scoring festival-circuit success before growing openly dissatisfied with the genre's conventions. Worlds (2014) marked a deliberate turn away from that world, trading big-room drops for more melodic, emotionally layered electronic music influenced by anime soundtracks, video games, and the shoegaze and dream-pop records he'd grown up on.\n\nHis Virtual Self project (2017) took a different detour, reviving the sound of late-'90s and early-2000s trance and hardcore rave music with a mix of genuine reverence and critical distance. Nurture (2021), made partly during a period of serious creative block, pulled back further from dance-music convention toward something closer to intimate, singer-songwriter-adjacent electronic pop, and was widely treated as his most personal and fully realized record. Robinson has continued to build a devoted following through both his music and large-scale virtual and live events built around it.`,
    classicAlbums: [
      ca(
        'nurture',
        'Nurture',
        2021,
        `Nurture is Porter Robinson's most intimate record, built during a period of serious creative block and shaped by that struggle as much as by any specific production idea. "Musician" turns the anxiety of being unable to make music into the actual subject of a song, its bright, layered production working almost as a rebuttal to the despair the lyrics describe. "Look at the Sky" and "Something Comforting" show the same vulnerability applied to more directly hopeful material. It's a record that trades the scale of festival-circuit electronic music for something closer to a diary, and it's widely regarded as the fullest realization yet of the more personal direction he set out on with Worlds.`,
      ),
    ],
  },

  // realm: electronic, lineage: art-electronic (summoned this pass)
  {
    ...islandTwoBase,
    id: 'bjork',
    name: 'Björk',
    realm: 'electronic',
    lineage: 'art-electronic',
    signatureSong: 'Jóga',
    bio: `Björk Guðmundsdóttir began performing publicly as a child in Iceland and spent her teens and early twenties in a series of Icelandic punk and alternative bands before The Sugarcubes gave her an international audience in the late 1980s. She went solo with Debut (1993) and Post (1995), records that established her as a distinctive vocal presence working across dance, trip-hop, and art-pop production without settling into any single genre.\n\nHomogenic (1997) brought that range into sharper focus, pairing Icelandic string arrangements with harder, more programmed beats and cohering around a single emotional and visual idea in a way her earlier albums hadn't. Björk has continued to make each subsequent album a distinct formal project — the intimate microbeats of Vespertine, the largely vocal Medúlla, the app-based Biophilia, the raw, Arca-produced Vulnicura — treating the album as a total, self-contained artistic statement rather than a collection of songs. Her willingness to work at the technical edge of electronic production, often ahead of the producers she collaborates with, has made her a persistent reference point for art-pop and experimental electronic musicians across several generations.`,
    classicAlbums: [
      ca(
        'homogenic',
        'Homogenic',
        1997,
        `Homogenic pairs sweeping, Icelandic string arrangements with hard, distorted electronic beats, the two elements meeting in a way few other pop-adjacent records of the era attempted. "Jóga," written for a friend and doubling as a tribute to Iceland's landscape, builds from a spare string figure into a genuinely overwhelming climax without ever raising its emotional register into melodrama. "Bachelorette" and "Pluto" show the album's range, one grandly orchestral, the other closer to industrial noise. It's widely considered the moment Björk's various interests — classical arrangement, electronic programming, deeply personal songwriting — resolved into a single, fully coherent artistic identity.`,
      ),
    ],
  },
  {
    ...islandTwoBase,
    id: 'imogen-heap',
    name: 'Imogen Heap',
    realm: 'electronic',
    lineage: 'art-electronic',
    signatureSong: 'Hide and Seek',
    bio: `Imogen Heap trained as a classical musician before releasing her debut solo album, I Megaphone, in the late 1990s, and spent the early 2000s as one half of the duo Frou Frou with producer Guy Sigsworth before returning to a solo career. She has produced and engineered her own records almost entirely herself since, an unusually hands-on role for a mainstream-adjacent pop artist of her era.\n\nSpeak for Yourself (2005), self-released before a label picked it up, became her best-known work largely on the strength of "Hide and Seek," a track built almost entirely from layered, harmonized a cappella vocals that found a much wider audience after appearing on television and later being sampled in a major pop hit. Heap's later work, including Ellipse (2009), continued to foreground her production and engineering skills, and she has since become known as much for inventing new music technology — including wearable "Mi.Mu" gloves that let performers control sound through gesture — as for her own songwriting. She remains an unusually technical, self-sufficient figure among artists working in electronic-inflected pop.`,
    classicAlbums: [
      ca(
        'speak-for-yourself',
        'Speak for Yourself',
        2005,
        `Speak for Yourself was written, performed, and largely produced by Imogen Heap alone, a level of self-sufficiency that shows in how tightly the album's vocal and electronic elements are integrated. "Hide and Seek" is the clear anchor, built almost entirely from Heap's own voice run through a vocoder and layered into dense, hymn-like harmonies with no conventional instrumentation underneath it. "Goodnight and Go" and "Headlock" show a more straightforward, if still meticulously produced, pop-songwriting side. The album's mix of technical ambition and genuine emotional directness gave "Hide and Seek" a second life years later, reaching listeners who had no idea where the song actually came from.`,
      ),
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Stub anchors (24) — minimal id+name placeholders for the region-one /
// core nodes that island-two edges bridge to. Real data for these ids
// lives in data/seed-data.ts; nothing here duplicates it.
// ─────────────────────────────────────────────────────────────

export const stubAnchors: StubAnchor[] = [
  // realm: core (5) — the 3 pre-existing krautrock root nodes, Brian Eno
  // (conceptually core, tagged core/ambient-drone per this pass's
  // correction), and Velvet Underground.
  { id: 'kraftwerk', name: 'Kraftwerk', realm: 'core', lineage: 'krautrock' },
  { id: 'can', name: 'Can', realm: 'core', lineage: 'krautrock' },
  { id: 'neu', name: 'Neu!', realm: 'core', lineage: 'krautrock' },
  { id: 'brian-eno', name: 'Brian Eno', realm: 'core', lineage: 'ambient-drone' },
  { id: 'velvet-underground', name: 'The Velvet Underground', realm: 'core' },

  // realm: region-one (19) — every other region-one id an island-two
  // bridge edge actually references.
  { id: 'david-bowie', name: 'David Bowie', realm: 'region-one' },
  { id: 'the-jesus-and-mary-chain', name: 'The Jesus and Mary Chain', realm: 'region-one' },
  { id: 'joy-division', name: 'Joy Division', realm: 'region-one' },
  { id: 'stereolab', name: 'Stereolab', realm: 'region-one' },
  { id: 'the-stooges', name: 'The Stooges', realm: 'region-one' },
  { id: 'radiohead', name: 'Radiohead', realm: 'region-one' },
  { id: 'new-order', name: 'New Order', realm: 'region-one' },
  { id: 'siouxsie-and-the-banshees', name: 'Siouxsie & The Banshees', realm: 'region-one' },
  { id: 'talking-heads', name: 'Talking Heads', realm: 'region-one' },
  { id: 'sonic-youth', name: 'Sonic Youth', realm: 'region-one' },
  { id: 'my-bloody-valentine', name: 'My Bloody Valentine', realm: 'region-one' },
  { id: 'ride', name: 'Ride', realm: 'region-one' },
  { id: 'this-mortal-coil', name: 'This Mortal Coil', realm: 'region-one' },
  { id: 'gang-of-four', name: 'Gang of Four', realm: 'region-one' },
  { id: 'the-smiths', name: 'The Smiths', realm: 'region-one' },
  { id: 'cocteau-twins', name: 'Cocteau Twins', realm: 'region-one' },
  { id: 'slowdive', name: 'Slowdive', realm: 'region-one' },
  { id: 'broadcast', name: 'Broadcast', realm: 'region-one' },
  { id: 'pixies', name: 'Pixies', realm: 'region-one' },
];

// ─────────────────────────────────────────────────────────────
// Edges (126) — audit Sections 2–8, minus the 6 removals, plus the 12
// additions actually enumerated in the follow-up task (it said "13" but
// listed 12 — the 12 listed are the ones added; no 13th was invented).
// Pre-existing seed-data.ts edges (e.g. joy-division → kraftwerk) are
// deliberately NOT repeated here.
// ─────────────────────────────────────────────────────────────

export const islandTwoEdges: Edge[] = [
  // ── Krautrock & proto-electronic ──
  inf('depeche-mode', 'kraftwerk'),
  inf('david-bowie', 'kraftwerk'),
  inf('radiohead', 'can'),
  inf('the-jesus-and-mary-chain', 'can'),
  inf('gary-numan', 'can'),
  inf('joy-division', 'can'),
  inf('neu', 'kraftwerk'),
  inf('david-bowie', 'neu'),
  inf('suicide', 'silver-apples'),
  inf('stereolab', 'silver-apples'),
  inf('portishead', 'silver-apples'),
  inf('radiohead', 'silver-apples'),
  inf('suicide', 'velvet-underground'),
  inf('suicide', 'the-stooges'),
  inf('radiohead', 'suicide'),
  inf('new-order', 'suicide'),
  inf('depeche-mode', 'suicide'),
  inf('aphex-twin', 'suicide'),
  inf('cabaret-voltaire', 'kraftwerk'),
  inf('cabaret-voltaire', 'velvet-underground'),
  inf('cabaret-voltaire', 'can'),
  inf('cabaret-voltaire', 'neu'),
  inf('new-order', 'cabaret-voltaire'),
  // NOTE: aphex-twin → kraftwerk removed per this pass's edit list.

  // ── Synth-pop ──
  inf('depeche-mode', 'the-human-league'),
  inf('depeche-mode', 'gary-numan'),
  inf('depeche-mode', 'omd'),
  inf('depeche-mode', 'david-bowie'),
  inf('depeche-mode', 'velvet-underground'),
  inf('depeche-mode', 'cabaret-voltaire'),
  inf('depeche-mode', 'siouxsie-and-the-banshees'),
  inf('depeche-mode', 'talking-heads'),
  inf('the-human-league', 'kraftwerk'),
  inf('the-human-league', 'david-bowie'),
  inf('omd', 'kraftwerk'),
  inf('omd', 'neu'),
  inf('omd', 'velvet-underground'),
  inf('omd', 'david-bowie'),
  inf('omd', 'brian-eno'),
  inf('omd', 'joy-division'),
  inf('gary-numan', 'david-bowie'),
  inf('gary-numan', 'brian-eno'),
  inf('new-order', 'the-human-league'),
  inf('new-order', 'omd'),
  inf('the-knife', 'siouxsie-and-the-banshees'),
  inf('the-knife', 'sonic-youth'),
  // NOTE: gary-numan → kraftwerk removed per this pass's edit list.

  // ── IDM ──
  inf('autechre', 'kraftwerk'),
  inf('autechre', 'boards-of-canada'),
  inf('boards-of-canada', 'my-bloody-valentine'),
  inf('boards-of-canada', 'autechre'),
  inf('squarepusher', 'aphex-twin'),
  inf('aphex-twin', 'can'),

  // ── Ambient & drone ──
  inf('oneohtrix-point-never', 'my-bloody-valentine'),
  inf('oneohtrix-point-never', 'broadcast'),
  inf('brian-eno', 'velvet-underground'),
  inf('talking-heads', 'brian-eno'),
  inf('slowdive', 'brian-eno'),
  inf('tim-hecker', 'ride'),
  inf('tim-hecker', 'my-bloody-valentine'),
  inf('tim-hecker', 'brian-eno'),
  inf('stars-of-the-lid', 'brian-eno'),
  inf('grouper', 'this-mortal-coil'),
  inf('grouper', 'siouxsie-and-the-banshees'),

  // ── Electronic-indie & dance-punk ──
  inf('lcd-soundsystem', 'can'),
  inf('lcd-soundsystem', 'gang-of-four'),
  inf('lcd-soundsystem', 'david-bowie'),
  inf('lcd-soundsystem', 'talking-heads'),
  inf('lcd-soundsystem', 'kraftwerk'),
  inf('lcd-soundsystem', 'the-smiths'),
  inf('lcd-soundsystem', 'omd'),
  inf('hot-chip', 'omd'),
  inf('hot-chip', 'four-tet'),
  inf('the-postal-service', 'kraftwerk'),
  inf('the-postal-service', 'new-order'),
  inf('the-postal-service', 'depeche-mode'),
  inf('the-postal-service', 'the-human-league'),
  inf('four-tet', 'aphex-twin'),
  inf('caribou', 'boards-of-canada'),
  inf('caribou', 'aphex-twin'),
  inf('the-rapture', 'gang-of-four'),
  inf('the-rapture', 'joy-division'),
  inf('chk-chk-chk', 'depeche-mode'),
  inf('chk-chk-chk', 'omd'),
  // NOTE: hot-chip → kraftwerk removed per this pass's edit list.

  // ── Trip-hop & downtempo ──
  inf('portishead', 'massive-attack'),
  inf('portishead', 'joy-division'),
  inf('portishead', 'siouxsie-and-the-banshees'),
  inf('tricky', 'massive-attack'),
  inf('tricky', 'siouxsie-and-the-banshees'),
  // burial -> massive-attack: documented collaboration (the 2011 "Four
  // Walls" / "Paradise Circus" single, Burial remixing Massive Attack
  // tracks) plus Daddy G's stated admiration for Burial (Clash / The
  // Skinny interviews). citation stays null, per this file's inf()
  // factory convention (matches every other edge here).
  inf('burial', 'massive-attack'),
  // NOTE: massive-attack → kraftwerk removed; bonobo → portishead removed
  // and the Bonobo node dropped entirely, per this pass's edit list.

  // ── Hyperpop & PC Music ──
  inf('sophie', 'depeche-mode'),
  inf('sophie', 'aphex-twin'),
  inf('sophie', 'autechre'),
  inf('a-g-cook', 'sophie'),
  inf('charli-xcx', 'sophie'),
  inf('charli-xcx', 'arca'),
  inf('charli-xcx', 'autechre'),
  inf('charli-xcx', 'aphex-twin'),
  inf('arca', 'aphex-twin'),
  inf('arca', 'squarepusher'),
  inf('arca', 'autechre'),
  inf('caroline-polachek', 'david-bowie'),
  inf('caroline-polachek', 'cocteau-twins'),
  inf('underscores', 'jane-remover'),
  inf('underscores', '100-gecs'),
  inf('jane-remover', 'my-bloody-valentine'),
  inf('jane-remover', 'slowdive'),
  inf('jane-remover', 'yeule'),
  inf('jane-remover', 'porter-robinson'),
  inf('oklou', 'arca'),
  inf('ninajirachi', 'porter-robinson'),
  inf('ninajirachi', 'sophie'),
  inf('yeule', 'aphex-twin'),
  inf('yeule', 'pixies'),
  inf('yeule', 'radiohead'),
  inf('porter-robinson', 'aphex-twin'),
  inf('porter-robinson', 'boards-of-canada'),
  // NOTE: a-g-cook → kraftwerk removed per this pass's edit list.

  // ── This pass's additions ──
  inf('arca', 'bjork'),
  inf('caroline-polachek', 'bjork'),
  inf('underscores', 'imogen-heap'),
  inf('caroline-polachek', 'imogen-heap'),
  inf('radiohead', 'faust'),
  inf('stereolab', 'faust'),
  inf('sonic-youth', 'faust'),
  inf('cabaret-voltaire', 'faust'),
  inf('new-order', 'sparks'),
  inf('depeche-mode', 'sparks'),
  inf('harold-budd', 'cocteau-twins'),
  inf('harold-budd', 'brian-eno'),
];
