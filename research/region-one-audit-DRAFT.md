# Region One — Research Brief Results: the 27 missing artists

**Status: Layer 1 (research) only.** No code or `seed-data.ts` changes made. This file is pre-sourced research output for a Layer 2 reviewer to apply rulings against (confidence tiers already suggested per-edge; summon/cut/hold decisions and the same-person call on Geordie Greep still need a human ruling), per the three-layer process in `CLAUDE.md`.

Researched via two parallel single-agent passes (14 + 13 artists), each doing one-artist-per-search-query research, verified against the live `data/seed-data.ts` (existing ids, `rejectedEdges`) before finalizing. **22 of 27 cleared the 2-edge bar; 5 did not** — reported honestly below rather than padded.

---

## Proto-punk / art-rock roots

### Patti Smith — proposed id: `patti-smith`
genres: [punk, proto-punk, art-rock]
scene: none
edges:
- sonic-youth → patti-smith [bridge]: "Thurston Moore has described seeing the Patti Smith Group live as a teenager as the moment he'd been waiting for, and singled out one of her less verse-chorus, almost-improvised songs as directly formative to Sonic Youth's own break from traditional song structure." (first-person, 0.8) — Rolling Stone
- the-sound → patti-smith [bridge]: "Adrian Borland's own listening as a teenager ran through Iggy Pop and the Stooges, David Bowie, Patti Smith, Can and Kraftwerk — the acts that shaped The Sound's sound before the band existed." (reported, 0.6) — corroborated across Uncut's Borland profile and Fast 'n' Bulbous's piece on The Sound's roots
notes: Siouxsie and the Banshees do NOT belong here — Steve Severin has explicitly said the Banshees deliberately took a different path from Patti Smith/Television/the Ramones/Heartbreakers, reaching instead for Bowie/Roxy Music/Can/Kraftwerk/Neu. Real, useful negative data point, but not a formal denial of a specific claimed edge (nobody had proposed one) — not logged as a `rejectedEdge`, just flagged so it isn't re-proposed later. Nick Cave references Patti Smith admiringly (Red Hand Files, citing "Gloria" as an example of lyrical force) but that's songwriting-craft commentary/admiration, not a stated influence — not used.
edge count: 2 — **CLEARS BAR**

### Ramones — proposed id: `ramones`
genres: [punk, proto-punk, pop-punk]
scene: none
edges:
- nirvana → ramones [bridge]: "Discussing the new-wave strand of his own record collection, Kurt Cobain named the B-52's, Devo, and the Ramones in the same breath." (first-person, 0.6)
- the-strokes → ramones [bridge]: "Spin described The Strokes as 'almost like the Ramones,' and NME's 'Roots Of' piece places the Ramones — 'the ultimate gang, beautifully ugly, masters of melodic dissonance' — alongside the Velvet Underground and Talking Heads as the New York lineage the Strokes drew their sound and self-presentation from." (critic, 0.6)
notes: Violent Femmes → Ramones already exists in the graph (uDiscover) — not re-derived here. Buzzcocks was considered but NOT written: Pete Shelley has said directly he wasn't aware of the Ramones when Buzzcocks formed (he and Devoto went to London on the strength of an NME review of the Sex Pistols, not a Ramones show), naming the Stooges/Alice Cooper instead as his own actual early listening — the commonly assumed "Ramones inspired the UK punk bands who saw them" chain doesn't hold up as a first-person Buzzcocks claim.
edge count: 2 — **CLEARS BAR**

### The Clash — proposed id: `the-clash`
genres: [punk, post-punk]
scene: none
edges:
- jeff-rosenstock → the-clash [bridge]: "Rosenstock has called out the Clash by name as inspiring precisely because 'they were so open to taking risks... they wouldn't adhere to any formula and I find that really inspiring.'" (first-person, 0.85)
- idles → the-clash [internal]: "Joe Talbot has said that if a band is genuinely subversive, it's probably influenced by the Clash in some way — their bravery in pushing boundaries, and their celebration of different cultures, is something IDLES built on even for listeners who don't personally like the Clash's music." (first-person, 0.85) — Irish News, 2019
notes: The Jewcy critic comparison of Rosenstock's songwriting to Strummer's (flagged in the original brief) was found but not used — Rosenstock's own first-person quote above is stronger and makes the critic comparison redundant. The Replacements drawing on "the punk rage of the Clash and the Damned" is a single AV Club critic framing with no located Westerberg quote — flagged as a weaker third candidate (`replacements → the-clash`, critic, 0.5) for a human to add if wanted, not written above the bar-clearing two.
edge count: 2 — **CLEARS BAR**

---

## Post-punk

### The Fall — proposed id: `the-fall`
genres: [post-punk, art-punk]
scene: none
edges:
- parquet-courts → the-fall [internal]: "Andrew Savage told Louder Than War by email that Pavement wasn't a big influence on Parquet Courts and that the band instead shares similar influences, naming the Velvet Underground, Roxy Music and the Fall." (first-person, 0.75) — already-sourced from prior research; just needed the target written
- pavement → the-fall [internal]: "Malkmus has described one Pavement song outright as 'Fall-influenced,' calling its beat 'a mid-period Fall approximation.'" (first-person, 0.75) — Guitar World
- lcd-soundsystem → the-fall [bridge]: "James Murphy has called the Fall his Beatles, and in a 2005 interview singled out why: 'the guitars are as ego-less as the bass. And that's a rare fucking thing.'" (first-person, 0.85)
notes: Checked the Windmill bands for a real Fall connection per the brief's cross-batch flag — nothing turned up in the interviews surfaced for black midi specifically. Black Country, New Road's Tyler Hyde did name the Fall in a Quietus "Baker's Dozen" favourites list (see batch-2 section below) but that's thinner and unverified for wording — kept separate, not folded in here. Mark E. Smith's own "Pavement is a rip-off" complaint is the mirror-image gripe, not a Pavement admission — Malkmus's "Fall-influenced" quote stands independently of it.
edge count: 3 — **CLEARS BAR**

### The Chameleons — proposed id: `the-chameleons`
genres: [post-punk, gothic-rock]
scene: none
edges:
- the-chameleons → buzzcocks [internal]: "Among Manchester bands, Mark Burgess has said the Buzzcocks had a definitive impact on him." (first-person, 0.75) — Louder Than War
notes: Genuinely thin, as flagged going in. The most commonly assumed downstream edge (Interpol) is directly denied by Paul Banks on record (see new denials below). Editors' Tom Smith DOES cite the Chameleons directly and by name — a genuinely strong first-person quote — but Editors isn't a graph node (see "targets pending" below). Off-map upstream (real per Burgess's own account, not encodable): the Beatles, the Doors/Jim Morrison, Julian Cope, Paul Weller.
edge count: 1 — **FAILS BAR**

### The Sound — proposed id: `the-sound`
genres: [post-punk]
scene: none
edges:
- the-sound → can [bridge]: "Adrian Borland's own account of what shaped him as a teenager runs through Iggy Pop and the Stooges, David Bowie, Patti Smith, Can and Kraftwerk." (reported, 0.6) — corroborated across Uncut's Borland profile and Fast 'n' Bulbous
- the-sound → kraftwerk [bridge]: "Same account — Can and Kraftwerk named alongside Bowie, Patti Smith and the Stooges as what Borland was listening to before the Sound existed." (reported, 0.6)
- the-sound → joy-division [internal]: "Borland recorded 'Silent Air' as a tribute to Ian Curtis, and by his own admission Joy Division had an important influence on his own work." (reported, 0.65)
- the-sound → david-bowie [internal]: "Bowie is named, alongside Patti Smith and the Stooges, among the artists whose records shaped Borland before he formed the Sound." (reported, 0.6)
notes: Couldn't get past a 403 on Uncut's own site or the artist's official Brittle Heaven archive to pull a single unbroken first-person quote block, so these run at the `reported` tier (corroborated across two independent secondhand pieces) rather than a direct interview transcript — flagged for a human to strengthen if they can get past the access issue. Downstream (Editors, Interpol) is real per critics but not codeable — neither is a graph node, and Interpol denies the closely-related Chameleons claim anyway.
edge count: 4 — **CLEARS BAR**

### Buzzcocks — proposed id: `buzzcocks`
genres: [punk, pop-punk]
scene: none
edges:
- rites-of-spring → buzzcocks [bridge]: "Rites of Spring's own account of their influences, per Stop Smiling, named the Smiths, the Birthday Party, Buzzcocks, the Mob, the Fall, Television, Bob Dylan, the Saints, Wire, the Undertones and the Adverts." (first-person, 0.75) — already-sourced from prior research; just needed the target written
- the-chameleons → buzzcocks [internal]: "Mark Burgess has named the Buzzcocks as having a definitive impact on him." (first-person, 0.75) — Louder Than War
- buzzcocks → velvet-underground [internal]: "Pete Shelley has said flatly that 'even now, I think the Velvet Underground are more influential than they're given credit for' — the connection runs back to Howard Devoto advertising for bandmates who liked the Velvets' 'Sister Ray' on a college noticeboard, which is how he and Shelley met in the first place." (first-person, 0.85) — Far Out Magazine
- buzzcocks → the-stooges [internal]: "Shelley and Devoto 'knew all of them back to front' — the Stooges and the Velvet Underground both — well before Buzzcocks existed." (first-person, 0.8) — Far Out Magazine
notes: none beyond the above.
edge count: 4 — **CLEARS BAR**

### X-Ray Spex — proposed id: `x-ray-spex`
genres: [punk, art-punk]
scene: none
edges:
- sleater-kinney → x-ray-spex [bridge]: "A Salon review by Stephanie Zacharek traces threads in Sleater-Kinney's 'Ironclad' back to Eddie Cochran and X-Ray Spex." (critic, 0.5)
notes: Genuinely thin. Real cultural influence on riot grrrl and post-punk feminism is well documented but almost entirely lands on non-graph artists (Bikini Kill/Kathleen Hanna, Amyl and the Sniffers — already scope-guarded out, Neneh Cherry) or on fandom rather than stated influence (Corin Tucker calling herself "a huge, huge fan"). Siouxsie Sioux and Poly Styrene were contemporaries photographed together in the same 1980 punk-women lineup — correctly excluded as scene co-presence, not an oversight.
edge count: 1 — **FAILS BAR**

### Wipers — proposed id: `wipers`
genres: [punk, proto-grunge]
scene: none
edges:
- nirvana → wipers [bridge]: "Cobain named Is This Real?, Youth of America and Over the Edge among his favorite records outright, saying of the Wipers' first two albums specifically: 'The first two were totally classic and influenced the Melvins and all the other punk rock bands. They're another band I tried to assimilate.'" (first-person, 0.85) — already documented from prior research; just needed the target written
- dinosaur-jr → wipers [bridge]: "J Mascis named Greg Sage among the guitarists who shaped his sound, and has pointed to the 'Kracked' intro on Dinosaur Jr.'s 'You're Living All Over Me' as a Wipers-styled thing." (first-person, 0.8) — Guitar World
notes: Mudhoney's Mark Arm and Steve Turner have an even more vivid first-person Wipers origin story, but Mudhoney isn't a graph node (see "targets pending" below).
edge count: 2 — **CLEARS BAR**

### The Cranberries — proposed id: `the-cranberries`
genres: [alt-rock, jangle-pop]
scene: none
edges:
- the-cranberries → the-smiths [internal]: "Wikipedia's Dolores O'Riordan page states that by age sixteen, the Smiths, the Cure, R.E.M. and Depeche Mode had become her primary musical influences." (reported, 0.6)
- the-cranberries → the-cure [internal]: "Same source and claim — the Cure named alongside the Smiths, R.E.M. and Depeche Mode." (reported, 0.6)
- the-cranberries → rem [bridge]: "Same source and claim — R.E.M. named alongside the Smiths, the Cure and Depeche Mode." (reported, 0.6)
- the-cranberries → depeche-mode [bridge]: "Same source and claim — Depeche Mode named alongside the Smiths, the Cure and R.E.M." (reported, 0.6)
- the-cranberries → siouxsie-and-the-banshees [internal]: "O'Riordan named Sinéad O'Connor and Siouxsie Sioux among the singers whose vocal effects — including yodeling — shaped her own technique." (reported, 0.6)
notes: Flagged going in as a borderline scope call likely to be thin — it wasn't. Off-map, confirmed but not encodable: Elvis Presley, Sinatra/Bing Crosby/Jim Reeves, Gregorian chant, the Kinks, Magazine, the Pogues, Morrissey (solo), Led Zeppelin, Metallica. A genuine NEW DENIAL was found (Noel Hogan on the Sundays comparison — see below).
edge count: 5 — **CLEARS BAR**

---

## Shoegaze / dream-pop tail

### Airiel — proposed id: `airiel`
genres: [shoegaze, dream-pop]
scene: none
edges:
- airiel → my-bloody-valentine [internal]: "Jeremy Wrenn: 'My Bloody Valentine was definitely something that I was listening to when Airiel started.' Asked whether the comparison was lazy or an honest influence, he said, 'to be perfectly honest, it's both.'" (first-person, 0.85)
- airiel → cocteau-twins [internal]: "Same interview — Wrenn describes getting into the Cocteau Twins, Lush, My Bloody Valentine, Ride and 'all those great British bands' as Airiel's formative listening." (first-person, 0.75)
- airiel → lush [internal]: "Same interview and quote as above." (first-person, 0.75)
- airiel → ride [internal]: "Same interview and quote as above." (first-person, 0.75)
notes: Kitchens of Distinction also came up strongly in the same interview but isn't a graph node (see "targets pending" below).
edge count: 4 — **CLEARS BAR**

### Ozean — proposed id: `ozean`
genres: [shoegaze, dream-pop]
scene: none
edges:
- ozean → slowdive [internal]: "Eric Shea: the flyer that led to Ozean's formation named 'bands like Slowdive, Cocteau Twins, RIDE, the Byrds, Pale Saints' as the common ground." (first-person, 0.8) — SOMEWHERECOLD interview, 2017
- ozean → cocteau-twins [internal]: "Same flyer/quote; Lisa Baer separately said she 'loved Cocteau Twins, Jesus and Mary Chain, MBV, and the Cure and the Beach Boys.'" (first-person, 0.8)
- ozean → ride [internal]: "Same flyer/quote as above." (first-person, 0.75)
- ozean → my-bloody-valentine [internal]: "Eric Shea separately named 'bands like RIDE, Slowdive and MBV that really grabbed me'; Lisa Baer's quote above names MBV too." (first-person, 0.8)
- ozean → the-jesus-and-mary-chain [internal]: "Lisa Baer's quote above: 'loved Cocteau Twins, Jesus and Mary Chain, MBV, and the Cure and the Beach Boys.'" (first-person, 0.75)
notes: none beyond the above — cleared the bar comfortably against expectations going in.
edge count: 5 — **CLEARS BAR**

### Panchiko — proposed id: `panchiko`
genres: [shoegaze, indietronica]
scene: none
edges:
- panchiko → radiohead [bridge]: "Owain Davies cites Radiohead as one of Panchiko's biggest influences; Wikipedia's page on the D>E>A>T>H>M>E>T>A>L EP independently notes the record 'has inspirations from Radiohead and Joy Division.'" (first-person, 0.75) — Bandcamp Daily
- panchiko → joy-division [internal]: "Wikipedia's page on the D>E>A>T>H>M>E>T>A>L EP states it 'has inspirations from Radiohead and Joy Division.'" (reported, 0.6)
notes: The genuine internet-revival backstory (the D>E>A>T>H>M>E>T>A>L CD found in a charity shop 15+ years after release, tracked down online, band reunited) is real and worth a bio sentence but isn't an influence claim, so not encoded here. Super Furry Animals also came up but isn't a graph node.
edge count: 2 — **CLEARS BAR**

### beabadoobee — proposed id: `beabadoobee`
genres: [indie-rock, bedroom-pop]
scene: none
edges:
- beabadoobee → pavement [bridge]: "'My influencers are Sonic Youth, Pavement – this shit that totally shaped me. They shaped the way I dress, how I speak, act and just everything I am.'" (first-person, 0.85) — NME
- beabadoobee → sonic-youth [bridge]: "Same NME quote as above." (first-person, 0.85)
- beabadoobee → elliott-smith [internal]: "She's named Elliott Smith among her first big influences, tattooed 'XO' (his fourth album's title) on her arm, and has said she took the chords from his song 'Bled White' directly for her own song 'Take a Bite.'" (first-person, 0.85)
notes: Smashing Pumpkins — also commonly cited by her — correctly skipped per the existing scope guard. Her song "I Wish I Was Stephen Malkmus" is a Pavement tribute, corroborating but not the primary citation. Kimya Dawson also named alongside Elliott Smith but isn't a graph node.
edge count: 3 — **CLEARS BAR**

### The Radio Dept. — proposed id: `the-radio-dept`
genres: [dream-pop, shoegaze, electronic, indie]
scene: none
edges:
- the-radio-dept → my-bloody-valentine [bridge]: "Asked in a Labrador Records interview about press comparisons to My Bloody Valentine and the Jesus and Mary Chain, Johan Duncanson said he liked My Bloody Valentine specifically for their genuine interest in both melody and sound." (first-person, 0.5)
- the-radio-dept → kraftwerk [bridge]: "Johan Duncanson told Labrador Records that a lot of what he listens to is electronic in some fashion — house, electronica, or old records like Kraftwerk and the KLF." (first-person, 0.5)
- the-radio-dept → the-blue-nile [internal]: "In a FLOOD Magazine interview, Duncanson said that while making the record they were listening to '80s acts like Marine Girls, Young Marble Giants and Antena, but also the Blue Nile, the Style Council and Saint Etienne." (first-person, 0.6)
notes: Same Labrador interview has Duncanson explicitly rejecting the Jesus and Mary Chain comparison (see new denials below) — do not encode JAMC as an influence. Off-map: Pet Shop Boys, Saint Etienne, Style Council, the KLF, Marine Girls, Young Marble Giants, Antena — none are graph nodes.
edge count: 3 — **CLEARS BAR**

---

## Jangle / twee / indie-pop

### Belle and Sebastian — proposed id: `belle-and-sebastian`
genres: [jangle-pop, indie-rock, chamber-pop]
scene: none
edges:
- vampire-weekend → belle-and-sebastian [internal]: "On the LSQ podcast, Ezra Koenig called Belle and Sebastian a 'mega favourite.'" (first-person, 0.85) — already-sourced from prior research; previously dropped only because the target didn't exist
- belle-and-sebastian → velvet-underground [internal]: "In a 2014 interview, Stuart Murdoch said Belle and Sebastian's sound was a combination of post-punk and embracing the beauty of the '60s and '70s: the Velvets, the Monkees, the Byrds, Love." (first-person, 0.85)
- belle-and-sebastian → cocteau-twins [internal]: "Denver Westword reported that during his years housebound with chronic fatigue, Murdoch mostly listened to '60s and '70s records and only occasionally to contemporaries like Felt, Cocteau Twins and the Sundays, calling it 'pretty gentle music for being lost when you didn't have much energy.'" (reported, 0.5)
- belle-and-sebastian → the-sundays [internal]: "Same Denver Westword account of Murdoch's illness-era listening, alongside Felt and Cocteau Twins." (reported, 0.5)
notes: Checked specifically for a Nick Drake quote per the brief — found only critic paraphrases lumping Donovan/Simon & Garfunkel/Nick Drake together, never traced to a real first-person Murdoch statement naming Drake specifically, so NOT encoded. Felt, the Monkees, the Byrds, Love are real, repeatedly-cited but aren't graph nodes.
edge count: 4 — **CLEARS BAR**

### Camera Obscura — proposed id: `camera-obscura`
genres: [jangle-pop, indie-rock, chamber-pop]
scene: none
edges:
- alvvays → camera-obscura [internal]: "Asked by KEXP what appeals to her as a songwriter about Camera Obscura, Molly Rankin said Tracyanne Campbell is 'so good at longing and poetry and being endearing without being annoying,' with a voice that's 'so unique and pure.' In a separate SPIN interview about the same comparison, Rankin called Camera Obscura's polish 'a really nice reference' next to Alvvays' sparser, tape-hiss sound." (first-person, 0.65)
notes: Checked hard for a second real edge given the brief's specific warning about the Stuart Murdoch production-credit trap (he produced two tracks on their debut — correctly NOT encoded). Found none: the Cocteau Twins/Pixies mention from Campbell is 4AD-roster fandom, not a sound-influence claim; a bandmate's description of Gavin's enthusiasm for Joy Division/New Order is third-hand and explicitly framed as taste rather than sound-shaping. One widely-repeated "grew up on the Velvet Underground, the Pastels and Yo La Tengo" claim could not be traced to any real interview or to Wikipedia — it traces to an AI-generated-wiki (Grokipedia) fabrication echoed by search summaries, and was discarded rather than used. Campbell's actual stated influences (Tammy Wynette, Patsy Cline, Motown, Nancy Sinatra/Lee Hazlewood, the Sleepy Jackson) are all off-map.
edge count: 1 — **FAILS BAR**

### The Blue Nile — proposed id: `the-blue-nile`
genres: [art-pop, chamber-pop]
scene: none
edges:
- the-radio-dept → the-blue-nile [internal]: (see The Radio Dept. entry above)
- geordie-greep → the-blue-nile [internal]: "Geordie Greep told The Needle Drop that the Blue Nile's Hats was a reference point for The New Sound, describing it as an album where 'each song builds on this atmosphere and builds on this sense of character and sense of time, place... scenarios.'" (first-person, 0.85)
- the-blue-nile → talking-heads [internal]: "In a PopMatters interview, Paul Buchanan recalled that the first time the band heard Talking Heads, 'we were thinking, I could do that' — part of what drew them to punk and new wave's stripped-down accessibility over 'ridiculous hair' and long solos." (first-person, 0.85)
notes: Downstream fans found (Matty Healy/The 1975, Duncan Sheik, Wild Beasts, Phil Collins) are off-map, not graph nodes.
edge count: 3 — **CLEARS BAR**

### Prefab Sprout — proposed id: `prefab-sprout`
genres: [art-pop, chamber-pop]
scene: none
edges:
- prefab-sprout → bob-dylan [internal]: "In Uncut's 2009 'My Life In Music' feature, Paddy McAloon named Dylan's 'Lay Lady Lay' as his first record purchase, at 13, prizing 'the gorgeousness of the record and the finger-breaking possibilities... for a 13-year-old learning barre chords.' He also singled out 'Sad-Eyed Lady of the Lowlands' for being grateful it ran 11 minutes rather than three and a half." (first-person, 0.85)
- prefab-sprout → david-bowie [internal]: "Same Uncut feature — McAloon called Bowie's Station to Station the LP that sounds mysterious to him: 'It sounds like Bowie's mid-way between two things and I like that. The music is mysterious — chilly and passionate at the same time.'" (first-person, 0.85)
notes: Confirmed the `destroyer → prefab-sprout` / `→ gary-numan` non-edge from the brief — already correctly recorded in the existing `rejectedEdges` array (interviewer-suggested reference point Bejar redirected away from). No action needed there.
edge count: 2 — **CLEARS BAR**

---

## Modern UK post-punk — the Windmill scene

### black midi — proposed id: `black-midi`
genres: [art-rock, noise-rock, math-rock, post-punk]
scene: windmill
edges:
- black-midi → godspeed-you-black-emperor [internal]: "Geordie Greep told Rolling Stone their early sound was 'a droney, Godspeed, Swans, Boredoms thing.'" (first-person, 0.85)
- black-midi → swans [internal]: "Same Rolling Stone quote naming Godspeed You! Black Emperor, Swans and Boredoms as touchstones for their early sound." (first-person, 0.85)
- black-midi → talking-heads [internal]: "Cameron Picton told FLOOD Magazine: 'We used to say Talking Heads, Deerhoof, and Danny Brown were our three main reference points.'" (first-person, 0.85)
notes: Carefully avoided TV Tropes' Influences list per the brief. Documented press interest in Can, Slint and King Crimson is real and widely reported, but no first-person quote naming any of the three was found in this pass — NOT encoded, flagged for a future pass rather than guessed at. Deerhoof and Danny Brown are real touchstones but aren't graph nodes. King Crimson is explicitly out-of-scope.
edge count: 3 — **CLEARS BAR**

### Black Country, New Road — proposed id: `black-country-new-road`
genres: [post-rock, art-rock, chamber-pop]
scene: windmill
edges:
- black-country-new-road → arcade-fire [internal]: "Drummer Charlie Wayne told Dork: 'We did invite that. We knew we wanted to do something which was not dissimilar to Arcade Fire, but most people just thought we were joking. Having a touchpoint is important.'" (first-person, 0.85)
- black-country-new-road → american-football [internal]: "Saxophonist Lewis Evans told The Line of Best Fit: 'Everyone [in the band] appreciates American Football, a bit of Godspeed You! Black Emperor, all the classics you know?'" (first-person, 0.6)
- black-country-new-road → godspeed-you-black-emperor [internal]: "Same Line of Best Fit quote, qualified: 'I don't know much about them but I love the way they sound.'" (first-person, 0.5)
- black-country-new-road → slint [internal]: "Same interview, Evans on the constant Slint comparisons: 'We like Slint, but we'd be on more common ground with post-rock I think.'" (first-person, 0.55)
notes: Talk Talk keeps appearing in critic descriptions but could not be confirmed as a band member's own words rather than reviewer framing — NOT encoded. A Slint/BC,NR joint Ninja Tune Podcast episode reads as mutual conversation between the two bands, not a one-way influence statement — not used as its own edge. (Tyler Hyde's Fall namecheck is reported separately below, under targets-pending, since it's thinner/unverified.)
edge count: 4 — **CLEARS BAR**

### Squid — proposed id: `squid`
genres: [dance-punk, post-punk, art-rock, krautrock]
scene: windmill
edges:
- squid → neu [internal]: "Guitarist Louis Borlase told Loud And Quiet that Neu! 'was rubbing off on us a lot, especially with Ollie's style of drumming' — the motorik, monotonous beat began to define the sound." (first-person, 0.85)
- squid → stereolab [internal]: "Borlase, in an interview specifically about the band's influences, praised Stereolab's Tim Gane: 'I think he's just one of the best guitar players in that he's managed to kind of make that band's music so memorable and unique for them.'" (first-person, 0.65)
- squid → tortoise [internal]: "In the same interview, naming Tortoise's Millions Now Living Will Never Die among five albums he'd listen to forever, Borlase said it 'has this cool electronic sound, without vocals, and it kind of challenged a lot of the boundaries that they had at the time.'" (first-person, 0.5)
- squid → burial [bridge]: "Same interview — Borlase named Burial's Untrue as 'my first real introduction to electronic music.'" (first-person, 0.55)
notes: Checked specifically for Gang of Four/Talking Heads/This Heat per the brief — found only critic descriptions with no first-person band quote traced, NOT encoded. A widely-repeated "Squid bonded over Neu! and This Heat" claim only checked out for the Neu! half against the actual Crack Magazine source text — This Heat wasn't actually in it, dropped rather than used on a search-summary's say-so.
edge count: 4 — **CLEARS BAR**

### Jockstrap — proposed id: `jockstrap`
genres: [electronic, art-pop, experimental-pop]
scene: windmill
edges:
- jockstrap → cocteau-twins [bridge]: "Asked by NME to name their influences, Taylor Skye and Georgia Ellery jointly answered: 'Skrillex, Madonna and Cocteau Twins.'" (first-person, 0.85)
- jockstrap → bob-dylan [internal]: "Taylor Skye told Loud And Quiet: 'I'm just turning into my dad basically. He was such a big Bob Dylan fan, and I just wasn't interested [when I was younger] but my parents have really influenced my music taste now.'" (first-person, 0.5)
notes: Checked the electronic-realm bridge specifically per the brief — SOPHIE and Aphex Twin surface repeatedly in critic descriptions of Jockstrap's production but could not be confirmed as a first-person Ellery/Skye quote in this pass; flagged for follow-up. Georgia Ellery's overlap with Black Country, New Road is personnel, not influence — correctly not touched. James Blake is a real shared-taste connection but isn't a graph node.
edge count: 2 — **CLEARS BAR**

### Geordie Greep — proposed id: `geordie-greep`
genres: [art-rock, experimental-pop, art-pop]
scene: windmill
edges:
- geordie-greep → the-blue-nile [internal]: (see The Blue Nile entry above)
notes: **Same-person question flagged, not resolved — human decision needed.** black midi disbanded in 2024; this is Greep's distinct post-band solo body of work (The New Sound, 2024). Unlike Panda Bear/Animal Collective (stayed concurrent, correctly kept as separate nodes), this is closer to Mount Eerie succeeding The Microphones (a rename that WAS merged into one node). Arguments for keeping separate: (a) black midi's cited touchstones are collective three-way-writer statements, not Greep alone; (b) his solo interviews cite an almost entirely different, non-overlapping reference set (Naná Vasconcelos, Astor Piazzolla, salsa, Frank Sinatra/Nat King Cole, Peter Gabriel, Tom Waits, Milton Nascimento, Steely Dan, Scott Walker) — none of which are graph nodes and none of which overlap black midi's own touchstones (Godspeed, Swans, Talking Heads). Sourcing for Greep as a standalone node came up thin in this pass — only Blue Nile cleared with a real first-person quote; the rest of his solo-era namechecks are off-map.
edge count: 1 — **FAILS BAR**

### Everything Everything — proposed id: `everything-everything`
genres: [art-pop, alt-rock, art-rock]
scene: none — confirmed NOT Windmill (Manchester, formed 2007, wrong place/era)
edges:
- everything-everything → radiohead [internal]: "Drummer Michael Spearman told NME: 'Kid A was a massive album for us because we were just the right age when it came out, and [Radiohead] have always loomed large as an influence for us.'" (first-person, 0.85)
notes: Higgs has separately called Radiohead "the biggest influence on me" in other coverage (corroborating, but I couldn't pin that exact phrasing to one traceable publication so didn't cite it independently). Talking Heads, David Bowie, Slint, Mogwai, Kraftwerk, Aphex Twin and Steve Reich all show up in aggregated "influences include" descriptions, and a real Quietus Baker's Dozen feature with Higgs almost certainly substantiates several of these — but the page 403'd on fetch and wording/attribution couldn't be verified in this pass. Flagged as a strong follow-up target rather than guessed at.
edge count: 1 — **FAILS BAR**

### The Last Dinner Party — proposed id: `the-last-dinner-party`
genres: [art-pop, chamber-pop, goth]
scene: none — confirmed NOT Windmill (different scene/era per the brief)
edges:
- the-last-dinner-party → david-bowie [internal]: "Guitarist Emily Roberts told Guitar.com: 'The music is very David Bowie and Queen-influenced... It's very Florence and The Machine and euphoric.'" (first-person, 0.85)
- the-last-dinner-party → siouxsie-and-the-banshees [internal]: "The Irish Times' review of Prelude to Ecstasy described the band as having 'borrowed from 1980s acts such as Kate Bush and Siouxsie and the Banshees.'" (critic, 0.5)
notes: Kate Bush and Queen are real, heavily-repeated touchstones — Kate Bush confirmed not a graph node (per the existing st-vincent `rejectedEdges` entry), Queen is off-map classic-rock canon. Fleetwood Mac and Arcade Fire appear only in critic-description form without a band-member quote behind them — NOT encoded, though worth another look given Arcade Fire is a graph node.
edge count: 2 — **CLEARS BAR**

### Die Spitz — proposed id: `die-spitz`
genres: [grunge, noise-rock, garage-rock, alt-rock]
scene: none — confirmed NOT Windmill (Austin, TX, unrelated scene)
edges:
- die-spitz → pixies [internal]: "Ava Schrobilgen: 'I just love all of their energy and the weird-ass noises that they make. We were trying to be like them when we first started.'" (first-person, 0.85)
- die-spitz → nirvana [internal]: "Asked by Kerrang! which live performers inspire them, the band named Nirvana and Black Sabbath alongside 'post-hardcore cult heroes Unwound and mellow alt-rockers Mazzy Star.'" (reported, 0.6)
- die-spitz → unwound [internal]: "Same Kerrang! answer, naming Unwound among their live-performance touchstones." (reported, 0.6)
- die-spitz → mazzy-star [internal]: "Same Kerrang! answer, naming Mazzy Star among their live-performance touchstones." (reported, 0.6)
notes: Black Sabbath is off-map metal canon, logged but not encoded.
edge count: 4 — **CLEARS BAR**

---

## FAILS-BAR (5 of 27)

- **The Chameleons** (1 edge) — genuinely thin. The one real in-graph connection is upstream (→ Buzzcocks). The obvious downstream claim (Interpol) is directly denied on record; Editors' Tom Smith does cite them by name but Editors isn't a graph node.
- **X-Ray Spex** (1 edge) — genuinely thin. Real cultural influence on riot grrrl and post-punk feminism is well documented but lands almost entirely on non-graph artists or on fandom rather than stated influence.
- **Camera Obscura** (1 edge, incoming from Alvvays) — researched hard specifically because of the Stuart Murdoch production-credit trap; found no second real influence claim, only fandom, thin third-hand description, and off-map artists.
- **Geordie Greep** (1 edge) — the bigger deliverable here is the same-person flag against black midi, not the edge count; his solo-era reference set is real but almost entirely off-map.
- **Everything Everything** (1 edge) — a rich further vein (Talking Heads, Bowie, Slint, Mogwai, Kraftwerk, Aphex Twin, Steve Reich, via a Quietus Baker's Dozen) almost certainly exists but the source 403'd on fetch; flagged for a retry rather than invented.

None of these 5 are recommended for exclusion from the roster — they're legitimate artists whose real influence claims just happen to be thin from the in-graph-target angle available right now. Hold or write-with-a-thin-edge-count is a Layer 2 call.

## Out-of-scope (scope-guard cuts confirmed / reconfirmed)

Per the original brief, not researched or added: Amyl and The Sniffers, Sky Ferreira, Poppy, YMO, Pet Shop Boys, Tears for Fears.

Classic-rock-canon / mainstream names that came up repeatedly across this research and were correctly NOT encoded as edges or proposed as nodes, per the existing scope guard: The Beatles, The Beach Boys, The Zombies, Led Zeppelin, Pink Floyd, King Crimson, Queen, Black Sabbath, Metallica.

## Summon candidates (2+ real in-scope edges, scope-guard applied)

**None cleared the 2-edge bar.** Artists that came up as real, sourced connections but aren't graph nodes each only cleared a single edge in this pass — reported honestly rather than summoned prematurely:
- **Editors** (1 edge: Tom Smith's strong first-person Chameleons citation, would also strengthen Echo and the Bunnymen/Joy Division ties already in-graph)
- **Mudhoney** (1 edge: Mark Arm/Steve Turner's vivid first-person Wipers discovery story)

Both are worth a dedicated future research pass if either realm's roster grows — starting from a real single edge each, not zero.

## Edges dropped because a target doesn't exist in the graph

- **Editors** ← the-chameleons (Tom Smith, first-person, strong)
- **Mudhoney** ← wipers (Mark Arm/Steve Turner, first-person, strong)
- **Smashing Pumpkins** ← beabadoobee, ← the-chameleons (critic) — correctly not proposed as a node either, per existing scope-guard precedent
- **Kitchens of Distinction** ← airiel (Jeremy Wrenn, first-person)
- **Kimya Dawson** ← beabadoobee (named alongside Elliott Smith)
- **black-country-new-road → the-fall** (target now exists via this same pass, but the edge itself is thin/unverified — Tyler Hyde named the Fall in a Quietus "Baker's Dozen" favourites list; the explanatory quote couldn't be recovered past a 403, only the aggregated album list. Needs a direct-fetch retry before writing.)

## New artist denials found

```
{
  source: 'interpol',
  target: 'the-chameleons',
  strength: 'clean',
  citation: "Westword: asked whether the Chameleons, Comsat Angels and the Sound informed Interpol's sound alongside Joy Division, Paul Banks said he'd never heard any of those bands before starting Interpol, and has only heard the Chameleons since the band put out records.",
},
{
  source: 'the-chameleons',
  target: 'joy-division',
  strength: 'contested',
  citation: "Louder Than War: Mark Burgess says he saw Joy Division live five or six times and found them 'a bit of a mess early on' without feeling musically influenced by them, though he took notice once Closer came out, calling it 'on a different level.'",
},
{
  source: 'the-cranberries',
  target: 'the-sundays',
  strength: 'clean',
  citation: "Rolling Stone, 'The Cranberries: The Hidden Power of Dreams': Noel Hogan says 'If we do sound like other bands, like the Sundays, then that's coincidence.'",
},
{
  source: 'the-radio-dept',
  target: 'the-jesus-and-mary-chain',
  strength: 'clean',
  citation: "Labrador Records interview: Johan Duncanson, asked about the constant My Bloody Valentine/Jesus and Mary Chain comparisons, dismissed the latter directly — 'jamc is a boring and very heterosexual rock band that wrote a few good songs' — while affirming a genuine appreciation for My Bloody Valentine in the same breath.",
},
```

## Proposed `windmill` Scene record

```
{
  id: 'windmill',
  name: 'The Windmill Scene',
  era: '2016–2020',
  place: 'Brixton, South London, UK',
  deck: "In the years around 2016 to 2020, a run of art-literate, genre-restless bands converged on one small Brixton pub venue — the Windmill — where a permissive booker and a rotating cast of overlapping members turned a 150-capacity room into a genuine incubator. Unlike the American Underground's DIY infrastructure built out of necessity, this was a scene built out of proximity and curiosity: prog, jazz, no-wave, post-punk and krautrock all treated as equally fair game by musicians who mostly met each other on that stage.",
  sections: [
    {
      heading: 'The Venue',
      paragraphs: [
        "The Windmill wasn't a genre venue so much as a room that would book almost anything, run by promoters willing to give unformed, unsigned bands a regular slot and an audience of other musicians. That informality let a small circle of acts trade members, ideas and stage time long before any of them had a record deal.",
        "The bands that came out of it shared almost no fixed sound — jazz-inflected post-punk, glitchy chamber-pop, krautrock-motorik dance music, prog-scrambled art-rock — but they shared the room, the lineup overlaps, and a critical mass of press attention that arrived all at once around 2019.",
      ],
    },
    {
      heading: 'The Bands',
      paragraphs: [
        "black midi's controlled-chaos guitar interplay, Black Country, New Road's klezmer-inflected post-rock, Squid's motorik dance-punk, and Jockstrap's collision of chamber-pop and glitch electronics all trace back to the same handful of stages and the same small audience of other musicians watching from the crowd.",
        "Below is the community that built it — the artists in Starweave's graph who came out of this world.",
      ],
    },
    {
      heading: 'The Breakthrough',
      paragraphs: [
        "Mercury Prize nominations for black midi and Black Country, New Road, and widespread critical attention for Squid and Jockstrap, took the scene from a single pub circuit to an internationally-covered story within a couple of years.",
        "As black midi wound down in 2024, frontman Geordie Greep's solo turn showed the scene's restlessness carrying past its original venue and its original bands.",
      ],
    },
  ],
  memberIds: ['black-midi', 'black-country-new-road', 'squid', 'jockstrap', 'geordie-greep'],
}
```

Fontaines D.C. and IDLES deliberately excluded per the brief — post-punk-revival, not Windmill, left untouched. Everything Everything, The Last Dinner Party, and Die Spitz confirmed NOT Windmill (wrong place/era/scene in each case) and left scene-untagged.

---

## Summary for Layer 2 review

27 researched, 22 clear the 2-edge bar, 5 don't (all legitimate holds, not research failures). 4 new artist denials found for the `rejectedEdges` array. 1 new Scene (`windmill`, 5 members) proposed. 1 unresolved same-person question (Geordie Greep vs. black midi) needs a human ruling before Layer 3 write. 1 thin/unverified edge (`black-country-new-road → the-fall`) flagged for a retry rather than written as-is. 5 summon-adjacent artists found with real sourcing (Editors, Mudhoney, Smashing Pumpkins — scope-guarded out, Kitchens of Distinction, Kimya Dawson) but none clear a 2-edge summon bar this pass.
