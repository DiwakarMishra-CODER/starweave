import type { Artist, Edge, Genre, GraphData, Scene } from './types';
import { BIOS } from './bios';

// ─────────────────────────────────────────────────────────────
// SEED DATA — v1 "shoegaze / dream-pop, rooted at the Velvet Underground"
//
// This is a hand-curated backbone drawn from Shweta's library. Edges are the
// real value here. STATUS meanings:
//   verified     = a widely-documented influence relationship. citation is
//                  currently null — add a real source (interview, AllMusic,
//                  Wikipedia ref) before treating it as gospel.
//   ai-suggested = a plausible inference that has NOT been confirmed. Render
//                  it dashed/muted and confirm before trusting.
//
// spotifyId / musicbrainzId are intentionally omitted — enrich them from the
// Spotify + MusicBrainz APIs at build time (they key the audio previews).
// bios are omitted on purpose — generate via the AI-draft / human-verify
// pipeline; a few classicAlbums are included as worked examples.
// ─────────────────────────────────────────────────────────────

const genres: Genre[] = [
  { id: 'underground', name: 'Underground', parent: null },       // future top parent
  { id: 'indie', name: 'Indie', parent: 'underground' },
  { id: 'art-rock', name: 'Art rock', parent: 'indie' },
  { id: 'proto-punk', name: 'Proto-punk', parent: 'indie' },
  { id: 'post-punk', name: 'Post-punk', parent: 'indie' },
  { id: 'goth', name: 'Gothic rock', parent: 'post-punk' },
  { id: 'dance-punk', name: 'Dance-punk', parent: 'post-punk' },
  { id: 'jangle-pop', name: 'Jangle pop', parent: 'indie' },
  { id: 'power-pop', name: 'Power pop', parent: 'indie' },
  { id: 'shoegaze', name: 'Shoegaze', parent: 'indie' },
  { id: 'dream-pop', name: 'Dream pop', parent: 'indie' },
  { id: 'noise-rock', name: 'Noise rock', parent: 'indie' },
  { id: 'alt-rock', name: 'Alternative rock', parent: 'indie' },
  { id: 'indie-rock', name: 'Indie rock', parent: 'indie' },
];

const V1: Artist['scope'] = ['shoegaze-dreampop-v1', 'indie'];

const ca = (id: string, title: string, year: number, classicReason: string) =>
  ({ id, title, year, isClassic: true as const, classicReason });

const artists: Artist[] = [
  // ── Roots (foundational) ────────────────────────────────────
  { id: 'velvet-underground', name: 'The Velvet Underground', layer: 'root', genres: ['art-rock', 'proto-punk'], scope: V1, country: 'US', activeFrom: 1965, signatureSong: 'Sunday Morning',
    classicAlbums: [ca('vu-nico', 'The Velvet Underground & Nico', 1967, "The album built a sonic vocabulary around drone, noise, and abjection that no rock record had previously attempted. 'Heroin' accelerates and collapses to mirror a rush; 'Venus in Furs' deploys Cale's viola as a kind of tuned punishment; 'Sunday Morning' floats above it all in opiated calm. Nothing about it has dated, because it was never tied to a contemporary sound in the first place.")] },
  { id: 'nico', name: 'Nico', layer: 'root', genres: ['art-rock', 'dream-pop'], scope: V1, country: 'DE', activeFrom: 1967, signatureSong: 'These Days',
    classicAlbums: [ca('desertshore', 'Desertshore', 1970, "Built on harmonium drones, bowed strings, and Nico's baritone pressing down like a change in barometric pressure, Desertshore is the darkest and most sustained entry in her solo catalog. 'Janitor of Lunacy' became a reference point for industrial and gothic music alike, its oscillating minor melody lodged in the ear long after the record ends. Cale's arrangements are orchestral in implication but spare in practice, leaving vast negative space around each song.")] },
  { id: 'television', name: 'Television', layer: 'root', genres: ['art-rock', 'proto-punk'], scope: V1, country: 'US', activeFrom: 1973, signatureSong: 'Marquee Moon',
    classicAlbums: [ca('marquee-moon', 'Marquee Moon', 1977, "Tom Verlaine and Richard Lloyd developed a counterpoint guitar style that owed more to jazz improvisation than any rock tradition, and the eight-minute title track is where it reaches its apex — two guitars spiraling around each other in a final stretch that neither musician appears to dominate. Engineer Andy Johns captured the guitars with such clarity that the record sounds as live today as any recent release. No punk record from the same year sounds as technically accomplished or as emotionally controlled.")] },
  { id: 'talking-heads', name: 'Talking Heads', layer: 'root', genres: ['art-rock', 'post-punk'], scope: V1, country: 'US', activeFrom: 1975, signatureSong: 'This Must Be the Place (Naive Melody)',
    classicAlbums: [ca('remain-in-light', 'Remain in Light', 1980, "Brian Eno and David Byrne stripped the band's rhythms to their cellular components and rebuilt them from the outside in, layering polyrhythmic African guitar patterns over Adrian Belew's alien lead work and a rhythm guitar that functions more as percussion than harmony. 'Once in a Lifetime' — a talking-blues meditation on subconscious anxiety, delivered by Byrne like a televangelist losing his nerve — is the obvious touchstone, but 'Crosseyed and Painless' hits harder as a pure rhythmic proposition. The album invented a template for the post-punk dance floor and for indie rock's engagement with African music simultaneously.")] },
  { id: 'big-star', name: 'Big Star', layer: 'root', genres: ['power-pop', 'jangle-pop'], scope: V1, country: 'US', activeFrom: 1971, signatureSong: 'September Gurls',
    classicAlbums: [ca('number-1-record', '#1 Record', 1972, "Alex Chilton and Chris Bell wrote every song in a kind of British Invasion dream — jangling guitars and melancholic harmonies with a distinctly American warmth — yet the album was commercially invisible on release, distributed so poorly it barely circulated outside Memphis. 'Thirteen' is the most nakedly beautiful teenage love song of the decade; 'In the Street' launched a dozen later bands before The Strokes rediscovered it. What the record established, though audiences didn't hear it in time, was the template for every college-radio and jangle-pop scene that followed.")] },

  // ── Post-punk / goth (the connective generation) ────────────
  { id: 'joy-division', name: 'Joy Division', layer: 'post-punk', genres: ['post-punk'], scope: V1, country: 'UK', activeFrom: 1976, signatureSong: 'Love Will Tear Us Apart',
    classicAlbums: [ca('unknown-pleasures', 'Unknown Pleasures', 1979, "Martin Hannett separated the band's instruments into isolated sonic chambers, adding reverb, echoed drums, and tape manipulation until the record sounded like it was being transmitted from underground rather than recorded in Manchester. Ian Curtis's bass-register vocals over Peter Hook's high melodic basslines — heard most clearly on 'She's Lost Control' — is a configuration that remains unusual in rock. A statement of claustrophobic urban alienation that no subsequent act has entirely superseded.")] },
  { id: 'new-order', name: 'New Order', layer: 'post-punk', genres: ['post-punk', 'dance-punk'], scope: V1, country: 'UK', activeFrom: 1980, signatureSong: 'Blue Monday',
    classicAlbums: [ca('power-corruption-lies', 'Power, Corruption & Lies', 1983, "Two years after Joy Division's dissolution, New Order arrived at something unprecedented — electronic dance rhythms underneath post-punk guitar textures, polished to a surface that invites the body rather than closing off the world. 'Age of Consent' opens with Peter Hook's melodic bass in counterpoint to the guitars, a technique carried over from Joy Division but deployed here with earned optimism. It taught the entire 1980s underground how synthesisers and guitars could coexist without compromise.")] },
  { id: 'the-cure', name: 'The Cure', layer: 'post-punk', genres: ['post-punk', 'goth'], scope: V1, country: 'UK', activeFrom: 1978, signatureSong: 'Pictures of You',
    classicAlbums: [ca('disintegration', 'Disintegration', 1989, "The album where the Cure's layered guitar aesthetic reached its fullest expression — Smith's acoustic and electric parts multiplied and panned into a shimmering density that fills the stereo image completely. 'Plainsong' opens with a synthesiser swell that takes ninety seconds to resolve into a song; 'Lovesong,' the closest the record comes to pop, reached number one in America against all odds. Disintegration defined an entire aesthetic register — big, sorrowful, beautiful — that the shoegaze generation built upon.")] },
  { id: 'siouxsie-and-the-banshees', name: 'Siouxsie & The Banshees', layer: 'post-punk', genres: ['post-punk', 'goth'], scope: V1, country: 'UK', activeFrom: 1976, signatureSong: 'Cities in Dust',
    classicAlbums: [ca('juju', 'Juju', 1981, "Siouxsie & The Banshees distilled everything that made their early records intense and made it more controlled and surgical — the guitars sharper, the arrangements darker and more theatrical. John McGeoch's guitar work is some of the most inventive post-punk playing ever committed to tape, moving between scraped percussive textures and full melodic leads within the same song. Juju established the template for gothic rock as a coherent aesthetic — dramatic, physical, and sophisticated.")] },
  { id: 'the-smiths', name: 'The Smiths', layer: 'post-punk', genres: ['jangle-pop', 'indie-rock'], scope: V1, country: 'UK', activeFrom: 1982, signatureSong: 'There Is a Light That Never Goes Out',
    classicAlbums: [ca('queen-is-dead', 'The Queen Is Dead', 1986, "Stephen Street's production gave The Queen Is Dead a rawer, more direct sound than Meat Is Murder, and it suits the material: Morrissey had never been more nakedly literary or more sharply funny, and Marr had never played with more rhythmic momentum. The title track careens through a guitar attack with Morrissey raging at the monarchy and his own desolation simultaneously; 'There Is a Light That Never Goes Out' is the pop apex, making teenage yearning feel enormous and universal. Frequently cited as the greatest British album ever made — and unlike most such claims, that is not obviously wrong.")] },
  { id: 'gang-of-four', name: 'Gang of Four', layer: 'post-punk', genres: ['post-punk', 'dance-punk'], scope: V1, country: 'UK', activeFrom: 1976, signatureSong: 'Damaged Goods',
    classicAlbums: [ca('entertainment', 'Entertainment!', 1979, "Gang of Four's debut is both a musical manifesto and a Marxist textbook — the funk rhythms stripped of all decorative excess, the lyrics annotating the commodity relationships inside everyday desire with a precision no other rock band has matched. Hugo Burnham's drums and Dave Allen's bass lock together like machine components while Andy Gill's guitar attacks in sharp, percussive stabs; 'Damaged Goods' is the most concentrated expression of this, four minutes of controlled aggression set to a jagged riff. Its tension — between dancing and thinking, pleasure and critique — has never been resolved because the band deliberately refused to resolve it.")] },
  { id: 'nick-cave-and-the-bad-seeds', name: 'Nick Cave & The Bad Seeds', layer: 'post-punk', genres: ['post-punk', 'art-rock'], scope: V1, country: 'AU', activeFrom: 1983, signatureSong: 'Into My Arms',
    classicAlbums: [ca('let-love-in', 'Let Love In', 1994, "'Red Right Hand' opens with a churning organ figure that became one of rock's most recognizable riffs — menacing, hypnotic, and definitively Cave. The album marks the mature form of the Bad Seeds' sound: dark cabaret arrangements of obsession and violence, held together by Cave's baritone and Mick Harvey's precise orchestrations. It is the pivot in Cave's catalog, darker and more confrontational than what came before and the direct foundation for the literary murder-ballad phase that followed.")] },

  // ── Shoegaze / dream-pop (the heart) ────────────────────────
  { id: 'the-jesus-and-mary-chain', name: 'The Jesus and Mary Chain', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'noise-rock'], scope: V1, country: 'UK', activeFrom: 1983, signatureSong: 'Just Like Honey',
    classicAlbums: [ca('psychocandy', 'Psychocandy', 1985, "The Jesus and Mary Chain buried the most straightforwardly melodic songwriting impulses in British music under a wall of feedback and cassette-quality distortion — and the melodies are good enough to survive the treatment. 'Just Like Honey' carries one of the decade's most immediately affecting vocal melodies on a drum-machine thump and feedback wash; 'Never Understand' demonstrates the more aggressive pole. It created the template for noise-pop — aggressive sound design as a vehicle for romantic songwriting — that My Bloody Valentine and two decades of indie bands would inherit.")] },
  { id: 'cocteau-twins', name: 'Cocteau Twins', layer: 'shoegaze-dreampop', genres: ['dream-pop', 'shoegaze'], scope: V1, country: 'UK', activeFrom: 1979, signatureSong: 'Cherry-coloured Funk',
    classicAlbums: [ca('heaven-or-las-vegas', 'Heaven or Las Vegas', 1990, "Robin Guthrie's guitar — treated with chorus, reverb, and delay until individual notes bloomed into clouds of harmonics — constructed an entirely self-contained sonic environment around Elizabeth Fraser's voice. Fraser's vocals on the title track and 'Iceblink Luck' approach pure texture, her syllables more impressionistic sound than language, though the emotional communication remains visceral and specific. It stands as the fullest realization of dream-pop's central premise: that atmosphere itself can carry emotional weight without narrative support.")] },
  { id: 'this-mortal-coil', name: 'This Mortal Coil', layer: 'shoegaze-dreampop', genres: ['dream-pop'], scope: V1, country: 'UK', activeFrom: 1983, signatureSong: 'Song to the Siren',
    classicAlbums: [ca('itll-end-in-tears', "It'll End in Tears", 1984, "Ivo Watts-Russell assembled This Mortal Coil as a 4AD collective, inviting rotating vocalists to perform covers chosen for their resonance with the label's aesthetic — the result is less a record than a sustained mood, each track bleeding into the next in an atmosphere of tenderness and grief. The cover of Tim Buckley's 'Song to the Siren' — sung by Elizabeth Fraser — is one of the most haunting recordings in the 4AD catalog, her voice stretching over reverb-soaked arrangements so spacious the song seems to be happening at a great distance. It established 4AD's sonic identity — fragile, reverberant, emotionally extreme — more completely than any single artist release.")] },
  { id: 'julee-cruise', name: 'Julee Cruise', layer: 'shoegaze-dreampop', genres: ['dream-pop'], scope: V1, country: 'US', activeFrom: 1989, signatureSong: 'Falling',
    classicAlbums: [ca('floating-into-night', 'Floating into the Night', 1989, "David Lynch and Angelo Badalamenti constructed the album as the sound of the Red Room made vocal — slow, reverb-saturated instrumentals underneath Julee Cruise's floating soprano, pitched at the exact register between lullaby and nightmare. 'Falling' (the Twin Peaks theme) and 'Mysteries of Love' (from Blue Velvet) frame the album as a companion to Lynch's visual world, but 'Into the Night' and 'The Nightingale' hold up entirely outside that context. The record created the template for dream-pop's theatrical wing and directly influenced everyone from Beach House to Grouper.")] },
  { id: 'the-sundays', name: 'The Sundays', layer: 'shoegaze-dreampop', genres: ['jangle-pop', 'dream-pop'], scope: V1, country: 'UK', activeFrom: 1987, signatureSong: "Here's Where the Story Ends",
    classicAlbums: [ca('reading-writing-arithmetic', 'Reading, Writing and Arithmetic', 1990, "Harriet Wheeler's voice is the album's governing force — she conveyed emotional directness without sentimentality, a clarity that made every melody feel confided rather than performed. 'Here's Where the Story Ends' is the breakthrough, a perfect jangle-pop song with a guitar figure instantly recognizable from the first bar; 'Can't Be Sure' announces the band's ambitions with a circular guitar pattern and Wheeler's completely unaffected delivery. It arrived at the end of jangle pop's first wave and served as its clearest and most emotionally intelligent statement.")] },
  { id: 'mazzy-star', name: 'Mazzy Star', layer: 'shoegaze-dreampop', genres: ['dream-pop'], scope: V1, country: 'US', activeFrom: 1988, signatureSong: 'Fade Into You',
    classicAlbums: [ca('so-tonight', 'So Tonight That I Might See', 1993, "Hope Sandoval's voice — barely more than a murmur against Dave Roback's orchestral production — is what makes this record unlike anything else in the dream-pop tradition: the volume of both vocals and accompaniment turned down so low that the emotional effect concentrates rather than dissipates. 'Fade into You' is a seven-minute wash of reverb and half-breathed delivery that has appeared in more film soundtracks than any other song from the era. The album invented a distinct subgenre — intimate, immersive, nocturnal — that runs from Grouper to Weyes Blood.")] },
  { id: 'my-bloody-valentine', name: 'My Bloody Valentine', layer: 'shoegaze-dreampop', genres: ['shoegaze'], scope: V1, country: 'IE', activeFrom: 1983, signatureSong: 'When You Sleep',
    classicAlbums: [ca('loveless', 'Loveless', 1991, "Kevin Shields spent approximately £250,000 to achieve a guitar sound that had never previously existed — the 'glide guitar' technique, using the tremolo arm to detune and retune mid-strum while heavy reverb smoothed the pitch variation into a blur. 'Only Shallow' opens with a drum attack that suggests a more aggressive record before the guitars swell into that characteristic warmth; 'Sometimes' is so gossamer that notes dissolve before they fully arrive. The record remains the most technically radical statement in guitar music made since Jimi Hendrix.")] },
  { id: 'slowdive', name: 'Slowdive', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'dream-pop'], scope: V1, country: 'UK', activeFrom: 1989, signatureSong: 'Alison',
    classicAlbums: [ca('souvlaki', 'Souvlaki', 1993, "Produced with Mark Freegard specifically to achieve clarity rather than noise, Souvlaki sounds cleaner and more spatial than Loveless — the guitars dry enough that individual chord voicings register rather than smearing into each other. 'Alison' and 'Souvlaki Space Station' demonstrate the band's gift for melody unobscured by effects; Brian Eno's contribution on three tracks pushed the album beyond conventional shoegaze into textural experimentation. Pitchfork's retrospective reassessment effectively launched the shoegaze revival of the mid-2000s.")] },
  { id: 'ride', name: 'Ride', layer: 'shoegaze-dreampop', genres: ['shoegaze'], scope: V1, country: 'UK', activeFrom: 1988, signatureSong: 'Vapour Trail',
    classicAlbums: [ca('nowhere', 'Nowhere', 1990, "Ride's debut stands apart from most shoegaze by virtue of its rhythmic aggression — the drums mixed higher and hitting harder than on any MBV or Slowdive record, giving songs like 'Vapour Trail' and 'Polar Bear' a physical impact that the genre's hazy textures often softened away. 'Vapour Trail' became the definitive statement, its overlapping vocal harmonies and chiming guitar layers producing a sweetness that was entirely Ride's own. Nowhere holds up as the most exhilarating entry point into the scene.")] },
  { id: 'lush', name: 'Lush', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'dream-pop'], scope: V1, country: 'UK', activeFrom: 1987, signatureSong: 'Sweetness and Light',
    classicAlbums: [ca('spooky', 'Spooky', 1992, "Produced by Robin Guthrie of the Cocteau Twins, Spooky is Lush at their most directly dreamy — Guthrie's guitar processing blurring the edges of Miki Berenyi and Emma Anderson's dual vocals while the rhythm section keeps the songs moving forward rather than dissolving into pure texture. Berenyi and Anderson's harmonies — both singing lead simultaneously in different registers — give the album a duality that no other shoegaze record matched. The Guthrie connection situates it sonically between 4AD's existing dream-pop aesthetic and the grungier shoegaze emerging from Creation Records.")] },
  { id: 'broadcast', name: 'Broadcast', layer: 'shoegaze-dreampop', genres: ['dream-pop', 'art-rock'], scope: V1, country: 'UK', activeFrom: 1995, signatureSong: 'Come On Let\'s Go',
    classicAlbums: [ca('tender-buttons', 'Tender Buttons', 2005, "With Tender Buttons, Broadcast shed their rhythm section entirely — just Trish Keenan and James Cargill, using synthesisers, drum machines, and tape loops to construct an electronic landscape that sounds less like pop music than library music recorded by aliens. 'Tears in the Typing Pool' achieves something remarkable: a song with a hook, built entirely from synthesiser tones and drum machine patterns that nonetheless carries the emotional weight of a personal lyric. The album distilled Broadcast's entire aesthetic into its essential components and influenced the wave of UK electronic music that followed, from Ghost Box Records to Panda Bear's studio approach.")] },
  { id: 'beach-house', name: 'Beach House', layer: 'shoegaze-dreampop', genres: ['dream-pop'], scope: V1, country: 'US', activeFrom: 2004, signatureSong: 'Space Song',
    classicAlbums: [ca('teen-dream', 'Teen Dream', 2010, "Victoria Legrand and Alex Scally recorded Teen Dream after three years developing their approach in near-total obscurity, and the album sounds like something perfected in private — every reverb tail exactly calibrated, every drum pattern precisely weighted between the deliberate and the hypnotic. 'Norway' and 'Used to Be' demonstrate Legrand's gift for vocals that seem to be remembering something rather than addressing the listener directly; 'Silver Soul' became the band's most replayed track in the decade that followed. It made Beach House unavoidable for everyone who built their record collection around Mazzy Star and the Cocteau Twins.")] },
  { id: 'deerhunter', name: 'Deerhunter', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'indie-rock'], scope: V1, country: 'US', activeFrom: 2001, signatureSong: 'Helicopter',
    classicAlbums: [ca('halcyon-digest', 'Halcyon Digest', 2010, "Bradford Cox's songwriting operates through deliberate obscurity — lyrics that feel confessional but resist paraphrase, images that accumulate emotional charge without resolving into narrative — and the production matches that ambiguity with arrangements that blur the line between retro and contemporary. 'Helicopter' sounds like it was recorded in 1966 and 2010 simultaneously; 'He Would Have Laughed' is a tribute to Jay Reatard that operates as elegy and celebration at once. It established Cox as one of the most distinctly literary lyricists in contemporary indie rock.")] },
  { id: 'alvvays', name: 'Alvvays', layer: 'shoegaze-dreampop', genres: ['jangle-pop', 'dream-pop'], scope: V1, country: 'CA', activeFrom: 2011, signatureSong: 'Archie, Marry Me',
    classicAlbums: [ca('blue-rev', 'Blue Rev', 2022, "Alvvays made their most sonically ambitious record by adding more noise — the guitars louder and more distorted than on their first two albums, but the melodic architecture underneath is stronger too, as if the band calculated exactly how much abrasion the hooks could absorb. 'Belinda Says' opens with a guitar figure and vocal melody that each complete and complicate the other; 'After the Earthquake' is the closest the band has come to pure noise-pop, its central riff buried under enough feedback to qualify as wall-of-sound. Molly Rankin's voice remains the record's constant — clear and almost conversational above the distortion, a technical feat that few vocalists in guitar music have matched.")] },
  { id: 'wolf-alice', name: 'Wolf Alice', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'alt-rock'], scope: V1, country: 'UK', activeFrom: 2010, signatureSong: "Don't Delete the Kisses",
    classicAlbums: [ca('visions-of-a-life', 'Visions of a Life', 2017, "Wolf Alice's second album announced an expansion in every dimension — the quieter songs more nakedly emotional, the louder songs more physically overwhelming, and Ellie Rowsell's voice moving between registers with a confidence their debut had only hinted at. The title track is the defining statement: a seven-minute piece that begins almost acoustically and ends in a full feedback roar, Rowsell's voice rising with the guitars until the song resolves into something close to catharsis. 'Don't Delete the Kisses' works from the opposite premise — slow, minimal, as exposed as the title track is enormous.")] },
  { id: 'silversun-pickups', name: 'Silversun Pickups', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'alt-rock'], scope: V1, country: 'US', activeFrom: 2000, signatureSong: 'Lazy Eye',
    classicAlbums: [ca('carnavas', 'Carnavas', 2006, "Nikki Monninger's bass plays lead melodic lines rather than bottom-end support, Brian Aubert's guitar achieves a density that resembles MBV's glide technique at a harder American rock tempo, and the interplay between the two creates a propulsive quality that their shoegaze influences largely avoided. 'Lazy Eye' became the album's breakthrough, its central riff one of the most immediately recognizable in mid-2000s American indie rock; 'Well Thought Out Twinkles' demonstrates the band's range, a slower piece that builds the same density through patience rather than velocity. The band made the MBV/Slowdive aesthetic work in an American rock radio context without diluting it into pure alternative pop.")] },
  { id: 'fishmans', name: 'Fishmans', layer: 'shoegaze-dreampop', genres: ['dream-pop'], scope: V1, country: 'JP', activeFrom: 1987, signatureSong: 'Long Season',
    classicAlbums: [ca('long-season', 'Long Season', 1996, "Fishmans recorded their magnum opus as four extended compositions totaling nearly seventy minutes — dub reggae rhythms, krautrock repetition, and dream-pop texture fused into something entirely Japanese and entirely unprecedented. The title track runs to thirty-five minutes and functions as a continuous meditation, its rhythmic cycles creating a hypnotic state that the production's extraordinary spatial separation amplifies rather than disperses. Sato died in 1999 from an accidental head injury and Long Season became a posthumous cult object, circulating mostly on cassette before overseas discovery in the streaming era.")] },
  { id: 'sweet-trip', name: 'Sweet Trip', layer: 'shoegaze-dreampop', genres: ['shoegaze', 'dream-pop'], scope: V1, country: 'US', activeFrom: 1998, signatureSong: 'Dsco',
    classicAlbums: [ca('velocity-design-comfort', 'Velocity : Design : Comfort', 2003, "Sweet Trip built their sophomore album from a collision of shoegaze texture and abstract electronic composition — guitar washes that fade into glitch processing that transitions back into melodic pop that dissolves into ambient field recordings, the sequence flowing so naturally that the genre switches only become apparent in retrospect. 'Dsco' achieves a warmth usually associated with analogue instruments entirely from processed synthesizer patches; 'Chocolate Matter' demonstrates the pop pole, a straightforward melodic piece buried under enough processing to qualify as experimental. It took two decades to find its audience, but that audience proved enormous and devoted.")] },
  { id: 'parannoul', name: 'Parannoul', layer: 'shoegaze-dreampop', genres: ['shoegaze'], scope: V1, country: 'KR', activeFrom: 2017, signatureSong: 'Analog Sentimentalism',
    classicAlbums: [ca('to-see-next-part', 'To See the Next Part of the Dream', 2021, "Parannoul recorded the album alone, in his childhood bedroom in Seoul, using cracked software and a consumer-grade interface — guitars distort into static, the mix is dense to the point of incoherence, and everything sounds slightly underwater. But the songs inside the noise are immaculate: 'Beautiful World' and 'White Ceiling' carry melodic ideas strong enough to have survived any production treatment, their burial under noise giving them an emotional weight that a clean recording would have dissipated. It proved that the shoegaze aesthetic is not bound to any particular studio budget, geography, or decade.")] },

  // ── Indie / alt-rock bridge (dense hubs to the wider web) ────
  { id: 'pixies', name: 'Pixies', layer: 'indie-alt', genres: ['alt-rock', 'noise-rock'], scope: V1, country: 'US', activeFrom: 1986, signatureSong: 'Where Is My Mind?',
    classicAlbums: [ca('doolittle', 'Doolittle', 1989, "The compromise between Steve Albini's raw approach on Surfer Rosa and Gil Norton's more polished production gave Doolittle the band's most commercially accessible sound without sacrificing the extremity that made Surfer Rosa essential. Black Francis's compositional approach — verses at a whisper, choruses at a scream, structures that expand and contract without warning — is most explicitly showcased on 'Here Comes Your Man' and 'Gouge Away.' Kurt Cobain cited the record directly when explaining Nirvana's quiet-loud dynamic.")] },
  { id: 'sonic-youth', name: 'Sonic Youth', layer: 'indie-alt', genres: ['noise-rock', 'alt-rock'], scope: V1, country: 'US', activeFrom: 1981, signatureSong: 'Teen Age Riot',
    classicAlbums: [ca('daydream-nation', 'Daydream Nation', 1988, "Thurston Moore and Lee Ranaldo's guitars operate as a single extended system rather than rhythm/lead — two instruments creating interlocking drone and harmonic fields that the rhythm section navigates through rather than anchors — and the double album's seventy-plus minutes give that system room to develop in real time. 'Teen Age Riot' opens as the most fully formed example, a slow-building eight-minute piece with a guitar coda that sounds like two different songs playing simultaneously; Ranaldo's 'Eric's Trip' is the album's most purely emotional moment. It legitimized noise rock as high art in the eyes of the critical establishment — giving Sonic Youth a reputation that their major-label work both expanded and slightly complicated.")] },
  { id: 'dinosaur-jr', name: 'Dinosaur Jr.', layer: 'indie-alt', genres: ['alt-rock', 'noise-rock'], scope: V1, country: 'US', activeFrom: 1984, signatureSong: 'Little Fury Things',
    classicAlbums: [ca('youre-living-all-over-me', "You're Living All Over Me", 1987, "Dinosaur Jr. made the record that established J Mascis's guitar sound as a singular force in American rock — massive, distorted, melodically articulate even at full volume, owing equal debts to Neil Young and to heavy metal while belonging entirely to neither. 'Little Fury Things' is a compact hook-driven piece demonstrating Mascis's ability to write a pop song inside a noise framework; 'The Lung' is a sprawling showcase where the lead line is simultaneously a riff, a solo, and a melody. The record invented the template for 1990s lo-fi indie guitar rock, a lineage running through Pavement, Sebadoh, and Guided by Voices.")] },
  { id: 'husker-du', name: 'Hüsker Dü', layer: 'indie-alt', genres: ['alt-rock'], scope: V1, country: 'US', activeFrom: 1979, signatureSong: 'Makes No Sense at All',
    classicAlbums: [ca('zen-arcade', 'Zen Arcade', 1984, "Hüsker Dü's double album came from a continuous recording session, largely improvised and self-produced, which gives it an urgency no major-label production could have achieved — the songs feel captured rather than constructed. Bob Mould and Grant Hart are equal songwriting forces across 23 tracks, Mould pushing toward melody and Hart toward emotional directness, including Hart's 'Pink Turns to Blue,' a devastating account of a friend's overdose. It effectively ended hardcore as the dominant mode of American underground music by demonstrating that its energy could accommodate complexity.")] },
  { id: 'the-replacements', name: 'The Replacements', layer: 'indie-alt', genres: ['alt-rock', 'power-pop'], scope: V1, country: 'US', activeFrom: 1979, signatureSong: 'Bastards of Young',
    classicAlbums: [ca('tim', 'Tim', 1985, "The Replacements' most polished record was also their most fully realized — Tommy Stinson's bass locked in tighter than on any previous release, Paul Westerberg's songwriting reaching a clarity of emotional expression that the band's characteristic sloppiness had previously obscured. 'Bastards of Young' is the manifesto, a mid-tempo anthem about generational disappointment that became the unofficial anthem of disaffected mid-80s American youth; 'Left of the Dial' is the tender pole, a tribute to college radio delivered with a directness Westerberg rarely allowed himself. It remains the entry point through which most listeners discover the band.")] },
  { id: 'pavement', name: 'Pavement', layer: 'indie-alt', genres: ['indie-rock', 'alt-rock'], scope: V1, country: 'US', activeFrom: 1989, signatureSong: 'Range Life',
    classicAlbums: [ca('slanted-and-enchanted', 'Slanted and Enchanted', 1992, "Pavement's debut is deliberately fractured — verses fray into tape hiss, hooks arrive slightly out of focus, and Stephen Malkmus's guitar lines slouch instead of resolve, turning lo-fi limitation into a stylistic signature rather than an excuse. 'Summer Babe (Winter Version)' is the entry point, a woozy, melodic non sequitur that somehow still functions as a single; 'Here' and 'Trigger Cut' show the same sleight of hand — real songcraft smuggled under a scuzzy, indifferent surface. It set the template for a decade of American indie rock that treated irony and melody as compatible instincts, not opposing ones.")] },
  { id: 'yo-la-tengo', name: 'Yo La Tengo', layer: 'indie-alt', genres: ['indie-rock', 'noise-rock'], scope: V1, country: 'US', activeFrom: 1984, signatureSong: 'Autumn Sweater',
    classicAlbums: [ca('heart-beating-as-one', 'I Can Hear the Heart Beating as One', 1997, "Yo La Tengo's fifth album was the record where their range became fully audible in a single listen — the seven-minute motorik drone of 'Moby Octopad,' the Velvet Underground-influenced pop of 'Stockholm Syndrome,' the full feedback assault of 'The Lie and How We Told It,' all without the shifts feeling discontinuous. Ira Kaplan and Georgia Hubley's vocal interplay creates an intimacy that the more aggressive tracks never fully dissipate; 'Sugarcube' became the band's closest approach to a radio hit, a deadpan guitar pop song with a hook so efficient it sounded accidental. The album demonstrated that the Velvet Underground's legacy could be developed rather than just imitated, that noise and tenderness could coexist within a single sustained artistic project.")] },
  { id: 'rem', name: 'R.E.M.', layer: 'indie-alt', genres: ['jangle-pop', 'alt-rock'], scope: V1, country: 'US', activeFrom: 1980, signatureSong: 'Losing My Religion',
    classicAlbums: [ca('murmur', 'Murmur', 1983, "Produced by Mitch Easter and Don Dixon at a studio in Winston-Salem, Murmur established R.E.M.'s sonic identity with unusual completeness for a debut — Michael Stipe's deliberately obscured vocals over Peter Buck's chiming Rickenbacker guitar created a texture that sounded like no other American band then operating. 'Radio Free Europe' is the definitive statement; 'Talk About the Passion' and 'Perfect Circle' demonstrate the band's range between urgency and atmosphere. Murmur served as the bridge between punk energy and pop songcraft that American independent rock needed, with a precision that seemed effortless.")] },
  { id: 'radiohead', name: 'Radiohead', layer: 'indie-alt', genres: ['alt-rock', 'art-rock'], scope: V1, country: 'UK', activeFrom: 1985, signatureSong: 'Paranoid Android',
    classicAlbums: [ca('ok-computer', 'OK Computer', 1997, "Jonny Greenwood's arrangements — orchestral strings, ondes Martenot, and studio manipulation deployed as readily as guitar — transformed Thom Yorke's anxieties about technological dystopia into one of the most sonically overwhelming albums in mainstream rock's history. 'Paranoid Android' alone justifies the album's canonical status: a six-minute suite moving through three distinct movements without ever feeling assembled rather than composed. The record reset the parameters of what a mainstream guitar album could aspire to.")] },
  { id: 'the-stone-roses', name: 'The Stone Roses', layer: 'indie-alt', genres: ['jangle-pop', 'indie-rock'], scope: V1, country: 'UK', activeFrom: 1983, signatureSong: 'I Wanna Be Adored',
    classicAlbums: [ca('stone-roses-st', 'The Stone Roses', 1989, "John Squire's guitar — borrowing a figure from Led Zeppelin's 'Fool in the Rain' and transforming it into a defining British hook — and Reni's drumming give the album a rhythmic sophistication that most shoegaze and indie albums of the era deliberately avoided. 'She Bangs the Drums' and 'I Wanna Be Adored' are the pop peaks; the ten-minute closer 'I Am the Resurrection' demonstrates the band's capacity for extended improvisation, its funk breakdown transforming a guitar pop song into something closer to krautrock. The album announced the end of post-punk's dominance over British indie music and the beginning of Britpop's foundation.")] },
  { id: 'interpol', name: 'Interpol', layer: 'indie-alt', genres: ['post-punk', 'indie-rock'], scope: V1, country: 'US', activeFrom: 1997, signatureSong: 'Obstacle 1',
    classicAlbums: [ca('turn-on-bright-lights', 'Turn On the Bright Lights', 2002, "Interpol arrived fully formed with an album that absorbed Joy Division's aesthetic completely and then made something original from the residue — Paul Banks's baritone, Daniel Kessler's clean guitar, and Carlos Dengler's melodic bass created a sound recognizably post-punk but too controlled and too American to be mistaken for a pastiche. 'Obstacle 1' is the signature: a rolling bass figure and ascending guitar line that creates forward motion before the verse resolves it into something darker and suspended. The record proved that post-punk's emotional vocabulary could survive transplant to a different geography and decade with its power entirely intact.")] },
  { id: 'the-strokes', name: 'The Strokes', layer: 'indie-alt', genres: ['indie-rock', 'alt-rock'], scope: V1, country: 'US', activeFrom: 1998, signatureSong: 'Last Nite',
    classicAlbums: [ca('is-this-it', 'Is This It', 2001, "Nick Valensi and Albert Hammond Jr.'s interlocking guitar parts — clean, relatively un-effected, drawing from Television and Lou Reed's solo work — gave the album a clarity that felt almost retro in 2001 but turned out to be as contemporary as anything released that decade. 'Last Nite' is the canonical example: a chord progression lifted from Tom Petty's 'American Girl,' recontextualized inside a New York attitude that made it feel entirely of its moment. It reinvented rock for a generation that had grown up on hip-hop and electronic music and needed the guitar translated into a register they could inhabit.")] },
  { id: 'yeah-yeah-yeahs', name: 'Yeah Yeah Yeahs', layer: 'indie-alt', genres: ['indie-rock', 'dance-punk'], scope: V1, country: 'US', activeFrom: 2000, signatureSong: 'Maps',
    classicAlbums: [ca('fever-to-tell', 'Fever to Tell', 2003, "Karen O's vocal performance — her screams and yelps as much a musical instrument as Nick Zinner's guitar — is the record's most distinctive element, a physical presence that separates the album from its No Wave and post-punk predecessors. 'Maps' is the emotional anchor, a slow love song delivered with a directness that Karen O has said she found almost unbearably vulnerable to release; 'Y Control' is the opposite, a controlled demolition with a guitar figure that cuts through the mix like a blade. It effectively closed the post-punk revival's first wave with a statement that exceeded its peers in physical intensity.")] },
  { id: 'geese', name: 'Geese', layer: 'indie-alt', genres: ['art-rock', 'indie-rock'], scope: V1, country: 'US', activeFrom: 2017, signatureSong: 'Taxes',
    classicAlbums: [ca('getting-killed', 'Getting Killed', 2025, "Produced by Kenny Beats — known primarily for hip-hop, which is directly audible in the emphasis on drums and the weight of the low-end — Getting Killed builds its post-punk and art-rock framework over a rhythmic foundation more indebted to funk than to Ian Curtis's Manchester. 'Trinidad,' the opener, announces the record's ambitions immediately: a 13/8 time signature, Cameron Winter's vocals pitched between crooner and scream, guitars cutting in and out like a malfunctioning circuit. The New Yorker and Stereogum both named it their album of the year for 2025.")] },

  // ── Outside root (summoned by edges, not hand-added to a genre) ──
  { id: 'david-bowie', name: 'David Bowie', layer: 'outside', genres: ['art-rock'], scope: V1, country: 'UK', activeFrom: 1969, signatureSong: 'Heroes',
    classicAlbums: [ca('ziggy-stardust', 'The Rise and Fall of Ziggy Stardust and the Spiders from Mars', 1972, "Mick Ronson's guitar — simultaneously orchestral (his string arrangements for 'Lady Stardust') and viscerally physical (the opening riff of 'Hang On to Yourself') — gives the album a range that Bowie's theatrical concept required but couldn't guarantee. 'Starman' is the moment that changed British pop culture: Bowie's Top of the Pops performance in June 1972 functions as a before/after marker for an entire generation's sense of what rock music could do or be. The concept — rock star as extraterrestrial — created the precedent for every subsequent pop persona, from Prince to Lady Gaga.")] },
];

// Edge factory. source = influenced, target = influence (arrow -> root).
const inf = (
  source: string,
  target: string,
  confidence = 0.8,
  status: Edge['status'] = 'verified',
): Edge => ({ source, target, type: 'influence', status, confidence, citation: null });

const edges: Edge[] = [
  // roots
  inf('nico', 'velvet-underground', 0.9),
  inf('television', 'velvet-underground', 0.85),
  inf('talking-heads', 'velvet-underground', 0.8),

  // post-punk -> roots / Bowie
  inf('joy-division', 'velvet-underground', 0.75),
  inf('joy-division', 'david-bowie', 0.75),
  inf('new-order', 'joy-division', 0.95),
  inf('the-cure', 'velvet-underground', 0.7),
  inf('the-cure', 'david-bowie', 0.7),
  inf('siouxsie-and-the-banshees', 'velvet-underground', 0.7),
  inf('siouxsie-and-the-banshees', 'david-bowie', 0.75),
  inf('the-smiths', 'velvet-underground', 0.65),
  inf('the-smiths', 'david-bowie', 0.6),
  inf('gang-of-four', 'velvet-underground', 0.6),
  inf('nick-cave-and-the-bad-seeds', 'velvet-underground', 0.65),

  // shoegaze / dream-pop
  inf('the-jesus-and-mary-chain', 'velvet-underground', 0.9),
  inf('cocteau-twins', 'siouxsie-and-the-banshees', 0.7),
  inf('this-mortal-coil', 'cocteau-twins', 0.85),
  inf('julee-cruise', 'cocteau-twins', 0.6),
  inf('the-sundays', 'the-smiths', 0.7),
  inf('the-sundays', 'cocteau-twins', 0.6),
  inf('mazzy-star', 'velvet-underground', 0.75),
  inf('mazzy-star', 'the-jesus-and-mary-chain', 0.65),
  inf('my-bloody-valentine', 'the-jesus-and-mary-chain', 0.9),
  inf('my-bloody-valentine', 'cocteau-twins', 0.8),
  inf('my-bloody-valentine', 'sonic-youth', 0.65),
  inf('slowdive', 'my-bloody-valentine', 0.9),
  inf('slowdive', 'cocteau-twins', 0.8),
  inf('ride', 'my-bloody-valentine', 0.85),
  inf('ride', 'the-jesus-and-mary-chain', 0.75),
  inf('lush', 'cocteau-twins', 0.75),
  inf('lush', 'my-bloody-valentine', 0.75),
  inf('broadcast', 'velvet-underground', 0.45, 'ai-suggested'),
  inf('beach-house', 'cocteau-twins', 0.85),
  inf('beach-house', 'mazzy-star', 0.75),
  inf('beach-house', 'slowdive', 0.7),
  inf('beach-house', 'broadcast', 0.6),
  inf('deerhunter', 'my-bloody-valentine', 0.8),
  inf('deerhunter', 'sonic-youth', 0.75),
  inf('deerhunter', 'broadcast', 0.55, 'ai-suggested'),
  inf('alvvays', 'the-sundays', 0.7),
  inf('alvvays', 'slowdive', 0.7),
  inf('wolf-alice', 'my-bloody-valentine', 0.7),
  inf('wolf-alice', 'slowdive', 0.65),
  inf('wolf-alice', 'pixies', 0.6),
  inf('silversun-pickups', 'my-bloody-valentine', 0.75),
  inf('fishmans', 'talking-heads', 0.4, 'ai-suggested'),
  inf('sweet-trip', 'my-bloody-valentine', 0.8),
  inf('sweet-trip', 'cocteau-twins', 0.65),
  inf('parannoul', 'slowdive', 0.85),
  inf('parannoul', 'my-bloody-valentine', 0.8),
  inf('parannoul', 'fishmans', 0.7),
  inf('parannoul', 'sweet-trip', 0.7),

  // indie / alt bridge
  inf('pixies', 'velvet-underground', 0.65),
  inf('pixies', 'husker-du', 0.6),
  inf('sonic-youth', 'velvet-underground', 0.8),
  inf('sonic-youth', 'television', 0.65),
  inf('dinosaur-jr', 'husker-du', 0.75),
  inf('dinosaur-jr', 'sonic-youth', 0.65),
  inf('husker-du', 'velvet-underground', 0.45, 'ai-suggested'),
  inf('the-replacements', 'big-star', 0.85),
  inf('the-replacements', 'velvet-underground', 0.6),
  inf('pavement', 'sonic-youth', 0.75),
  inf('pavement', 'velvet-underground', 0.65),
  inf('pavement', 'rem', 0.6),
  inf('yo-la-tengo', 'velvet-underground', 0.75),
  inf('yo-la-tengo', 'big-star', 0.6),
  inf('rem', 'velvet-underground', 0.7),
  inf('rem', 'big-star', 0.75),
  inf('rem', 'television', 0.55),
  inf('radiohead', 'pixies', 0.75),
  inf('radiohead', 'talking-heads', 0.65),
  inf('radiohead', 'rem', 0.65),
  inf('radiohead', 'my-bloody-valentine', 0.6),
  inf('the-stone-roses', 'the-jesus-and-mary-chain', 0.7),
  inf('the-stone-roses', 'the-smiths', 0.6),
  inf('interpol', 'joy-division', 0.85),
  inf('interpol', 'television', 0.65),
  inf('the-strokes', 'velvet-underground', 0.7),
  inf('the-strokes', 'television', 0.75),
  inf('yeah-yeah-yeahs', 'sonic-youth', 0.7),
  inf('yeah-yeah-yeahs', 'siouxsie-and-the-banshees', 0.6),
  inf('yeah-yeah-yeahs', 'pixies', 0.6),
  inf('geese', 'television', 0.7),
  inf('geese', 'talking-heads', 0.65),
  inf('geese', 'the-strokes', 0.6),
];

const artistsWithBios = artists.map(a => ({ ...a, bio: BIOS[a.id] ?? a.bio }));

// Scenes are a time + place, not a sound — see data/types.ts. Prose below is a
// draft placeholder; final copy to be dropped in later without touching structure.
const scenes: Scene[] = [
  {
    id: 'american-underground',
    name: 'American Underground',
    era: '1980–1991',
    place: 'US',
    deck: "Between 1980 and 1991, a scattered network of American bands built its own infrastructure — vans, college radio, all-ages clubs, and independent labels — because the mainstream music industry offered nothing for music this loud, this strange, or this indifferent to commercial polish. It became known simply as the underground, and it rewired what American rock could sound like.",
    sections: [
      {
        heading: 'The Circuit',
        paragraphs: [
          "There was no single scene so much as a circuit: a loose, self-organized touring network stitched together by word of mouth, zines, and college radio stations willing to play what commercial rock stations would not. Bands slept on floors, split gas money, and booked their own shows in VFW halls and basements because no promoter would touch them.",
          "Labels like SST, Twin/Tone, and Homestead ran the business side of this economy — pressing records on shoestring budgets, trading tour dates and studio time, and treating national exposure as a byproduct of persistence rather than a marketing plan. It was DIY not as an aesthetic choice but as the only available option.",
        ],
      },
      {
        heading: 'The Bands',
        paragraphs: [
          "The bands that emerged from this network shared almost nothing sonically — the sludgy melodicism of Hüsker Dü, the amp-worshipping sprawl of Dinosaur Jr., Sonic Youth's detuned art-noise, the ragged tunefulness of The Replacements, R.E.M.'s jangling mystery, Pixies' loud-quiet-loud tension, Pavement's shambling irony — but they shared the circuit, the labels, and a refusal to sound like anything on the radio.",
          "Below is the community that built it — the artists in Starweave's graph who came out of this world.",
        ],
      },
      {
        heading: 'The Breakthrough',
        paragraphs: [
          "By the end of the decade, the underground's influence had outgrown its infrastructure. Nirvana — who toured the same clubs and released their debut on the same independent label system — carried the sound to the top of the charts in 1991, and major labels scrambled to sign anything that resembled it.",
          "The circuit didn't survive its own success intact, but its DNA did: the idea that a band could build an audience without radio, without a major label, and without changing what it sounded like to get there became the founding myth of American indie rock for the next three decades.",
        ],
      },
    ],
    memberIds: ['husker-du', 'dinosaur-jr', 'sonic-youth', 'the-replacements', 'rem', 'pixies', 'pavement'],
  },
];

export const graphData: GraphData = { artists: artistsWithBios, genres, scenes, edges };
