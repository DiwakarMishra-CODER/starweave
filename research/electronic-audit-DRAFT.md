# Electronic — Research Brief Results: the missing artists

**Status: Layer 1 (research) only.** No code or `seed-data.ts` changes made. This file is pre-sourced research output for a Layer 2 reviewer to apply rulings against, per the three-layer process in `CLAUDE.md`.

**Roster note:** the brief's header says "~22" then "Total: 20 artists" after the Poppy correction, but the actual roster as listed (ambient/drone 2 + trip-hop 2 + hyperpop/PC Music tail 4 + art-pop 13) sums to **21**, not 20 — the same off-by-one pattern as the region-one brief's "24" vs. actual 25. All 21 named artists were researched rather than arbitrarily dropping one to hit the stated total.

Researched via two parallel single-agent passes (11 + 10 artists), each doing one-artist-per-search-query research. **14 of 21 cleared the 2-edge bar; 7 did not** — reported honestly below, several explicitly flagged as language-barrier or media-shy-subject gaps rather than genuine absence of real connections. Grokipedia surfaced in search results multiple times (Magdalena Bay, Lamp, Mid-Air Thief, Grouper) and was discarded on sight every time, per the hard rule.

---

## Ambient / drone

### Coil — proposed id: `coil`
genres: [industrial, ambient, drone]
edges:
- coil → can [bridge]: "Peter Christopherson traced Coil's early musical interests back to Stockhausen, Captain Beefheart, Can and Amon Düül, in a 1998 Wire magazine interview." (first-person, 0.85)
- coil → kraftwerk [internal]: "A 1983 Grok fanzine profile of the band describes Coil's active interest in krautrock groups including Cluster, Amon Düül II, Can, Kraftwerk and Tangerine Dream." (reported, 0.6)
- coil → velvet-underground [bridge]: "In a 2001 Radio Inferno / Dutch Radio 4 interview, Coil discussed the Velvet Underground among the rock acts that shaped their listening." (reported, 0.55)
notes: Off-map upstream not encoded: Throbbing Gristle (a personal relationship, not a graph node anyway), William Burroughs, Terence McKenna, occult sources. Balance's fanzine writing about Throbbing Gristle and Cabaret Voltaire was journalism about those acts, not a stated personal influence on Coil's own sound — left as a note, not an edge. **Downstream, off-map but strong and worth a human look:** Trent Reznor/Nine Inch Nails, on record, called Horse Rotorvator "deeply influential on me" — surfaced independently for death's dynamic shroud too (see summon candidates below). Autechre: Balance's own words about them ("they're kids... hard-wired into computers at the age of four") are dismissive, not an influence acknowledgment — correctly not encoded.
edge count: 3 — **CLEARS BAR**

### Steve Roach — proposed id: `steve-roach`
genres: [ambient, electronic]
edges:
- steve-roach → brian-eno [bridge]: "Roach's documented formative period describes him as a teenager greatly influenced by electronic music, particularly Klaus Schulze's Timewind and the work of Tangerine Dream and Brian Eno." (reported, 0.55)
- 2814 → steve-roach [internal]: "Rolling Stone's Christopher R. Weingarten wrote that Birth of a New Day's production was shaped on David Russo's side by musicians including Steve Roach, Vangelis, Burial and Sigur Rós." (critic, 0.5)
notes: Genuinely thin, as flagged going in. His primary lineage (Klaus Schulze, Tangerine Dream) is off-map — neither is a graph node. Pink Floyd (also a stated touchstone) is explicitly scope-guarded out. No stated-influence source found connecting him to Stars of the Lid, Tim Hecker, Grouper or Boards of Canada despite constant genre-adjacency — those read as critic/"similar artists" groupings, not stated influence.
edge count: 2 — **CLEARS BAR** (thin, flagged)

---

## Trip-hop / downtempo

### Beth Gibbons — proposed id: `beth-gibbons`
genres: n/a — see recommendation below
edges: none found
notes: **Same-person question — see recommendation at end, flagged not decided.** Solo interview material is extremely sparse; she's documented as giving very few interviews and disliking them. Coverage of Lives Outgrown (2024) and Out of Season (2002) is almost entirely critic-written mood description (compared to A Moon Shaped Pool-era Radiohead), not a stated influence from her or a stated influence citing her solo work specifically (as opposed to Portishead).
edge count: 0 — **FAILS BAR**

### Sneaker Pimps — proposed id: `sneaker-pimps`
genres: [trip-hop, electronic]
edges:
- sneaker-pimps → massive-attack [internal]: "Liam Howe told HITS Magazine that Massive Attack's Blue Lines was one of his favourite albums and a huge influence on Sneaker Pimps." (first-person, 0.85)
- sneaker-pimps → portishead [internal]: "In the same HITS Magazine interview, Howe said the Portishead album was a huge influence as well." (first-person, 0.85)
notes: Howe also said Sneaker Pimps were "just as excited about Sonic Youth and alternative pop" — enthusiasm/comparison, not a stated influence claim, not encoded. The Bristol trip-hop scene's Tricky comparison was explicitly framed by Howe as something the band deliberately steered away from — scene co-presence correctly excluded.
edge count: 2 — **CLEARS BAR**

---

## Hyperpop / PC Music tail

### Slayyyter — proposed id: `slayyyter`
genres: [hyperpop, dance-pop]
edges:
- slayyyter → sophie [internal]: "Slayyyter said discovering SOPHIE and PC Music was unlike anything she'd heard before, crazy in the best way, and called the pair the kind of originators who always do it best." (first-person, 0.7)
- slayyyter → charli-xcx [internal]: "Slayyyter told Rolling Stone she didn't even know what topline songwriting was until she read an article of Charli XCX's, and that she feels all of pop now is kind of inspired by her." (first-person, 0.85)
notes: Her stated chart-pop upstream (Britney Spears, Lady Gaga, Madonna, Lorde, Lana Del Rey, Max Martin) is off-map and correctly excluded. No stated-influence connection found to 100 gecs, A.G. Cook, Jane Remover, underscores or ninajirachi beyond shared scene/genre grouping.
edge count: 2 — **CLEARS BAR**

### Kero Kero Bonito — proposed id: `kero-kero-bonito`
genres: [art-pop, experimental-pop, electronic]
edges:
- kero-kero-bonito → my-bloody-valentine [bridge]: "Coverage of Time 'n' Place reports the album's suburban-guitar-band direction was influenced by acts including My Bloody Valentine, CSS, Lush and Sweet Trip." (reported, 0.6)
- kero-kero-bonito → sweet-trip [bridge]: same source. (reported, 0.6)
- kero-kero-bonito → lush [bridge]: same source. (reported, 0.6)
- kero-kero-bonito → caroline-polachek [internal]: "Coverage of the Civilisation II EP described it as inspired by early art-pop ambassadors Kate Bush, David Byrne, Björk and Ryuichi Sakamoto alongside modern peers Grimes and Caroline Polachek." (reported, 0.55)
- kero-kero-bonito → bjork [internal]: same Civilisation II source, naming Björk directly among the early art-pop ambassadors. (reported, 0.55)
- kero-kero-bonito → grimes [internal, target written in this same pass]: same Civilisation II source, naming Grimes as a modern-peer inspiration. (reported, 0.55)
notes: **Confirms and extends the prior electronic-realm audit's finding on Kero Kero Bonito** (`island-two/influence-audit-proposal.md`) — the SOPHIE ("Burn Rubber," unreleased) and 100 gecs ("ringtone (Remix)") connections remain features/collaborations, not influence, correctly excluded, nothing new surfaced there. Kate Bush, David Byrne, Ryuichi Sakamoto are off-map. Mount Eerie: Gus Lobban named Mount Eerie's "contemporary malaise" as an emotional/thematic touchstone for Time 'n' Place (FADER) — a mood comparison, not a stated musical influence, not encoded.
edge count: 6 — **CLEARS BAR**

### death's dynamic shroud — proposed id: `deaths-dynamic-shroud`
genres: [vaporwave, ambient, electronic]
edges:
- deaths-dynamic-shroud → radiohead [bridge]: "Tech Honors told VWMusic that Radiohead has had the biggest influence on death's dynamic shroud's music, adding that he and bandmate James were both very into '90s British rock." (first-person, 0.85)
- deaths-dynamic-shroud → julee-cruise [bridge]: "James Webster said he'd been trying to sound like Julee Cruise from Twin Peaks for years." (first-person, 0.8)
notes: Nine Inch Nails and Pink Floyd were also named by Tech Honors in the same interview — Pink Floyd scope-guarded out; Nine Inch Nails isn't a graph node but is a genuine summon candidate (see below — it surfaced independently for Coil too). No stated connection found to George Clanton or 2814 beyond shared vaporwave-scene/label co-presence (a Luxury Elite remix/radio-show credit) — correctly excluded per the label-relationship rule.
edge count: 2 — **CLEARS BAR**

### 2814 — proposed id: `2814`
genres: [vaporwave, ambient, electronic]
edges:
- 2814 → steve-roach [internal]: "Rolling Stone's Christopher R. Weingarten wrote that Birth of a New Day's production was shaped on David Russo's side by musicians including Steve Roach, Vangelis, Burial and Sigur Rós." (critic, 0.5)
- 2814 → burial [internal]: same source. (critic, 0.5)
- 2814 → sigur-ros [bridge]: same source. (critic, 0.5)
- 2814 → boards-of-canada [internal]: "The same Rolling Stone piece credits Luke Laurila's side of Birth of a New Day to Boards of Canada." (critic, 0.5)
notes: All four attributions trace to one Rolling Stone piece — flagged at single-source confidence rather than corroborated-critic. Vangelis isn't a graph node. George Clanton's label relationship (100% Electronica has released 2814 material) is business, not influence, correctly excluded.
edge count: 4 — **CLEARS BAR**

---

## Art-pop / experimental

### George Clanton — proposed id: `george-clanton`
genres: [vaporwave, synth-pop]
edges:
- george-clanton → the-human-league [internal]: "George Clanton told Seven Days he got really into the Human League and made a song that sounded like them, playing it for friends who found it hilarious but also awesome." (first-person, 0.85)
notes: A Wikipedia infobox-style "influences" list (311, Seal, Savage Garden, New Order, Brian Jonestown Massacre) could not be traced to any interview where Clanton states these himself — treated as a bare-name sidebar claim, not encoded, even though New Order is a graph node. One interviewer (not Clanton) described hearing "bits of New Order, some Depeche Mode, Pet Shop Boys" in his music — interviewer-suggested, not encoded. Several other interviews surfaced only off-map names (Michael Jackson, Oasis, Alanis Morissette, Seal, 311, Brian Jonestown Massacre). His label relationship with 2814/death's dynamic shroud is business, not influence, correctly excluded.
edge count: 1 — **FAILS BAR** (not thin catalogue — several interviews exist and were checked; a second real quote likely sits behind a paywall/403 the pass couldn't reach — Interview Magazine, Clash)

### FKA twigs — proposed id: `fka-twigs`
genres: [art-pop, electronic]
edges:
- fka-twigs → siouxsie-and-the-banshees [bridge]: "FKA twigs told Complex that every bit of music she made used to sound like a pastiche of Siouxsie and the Banshees or Adam Ant, before she found her own voice through that phase." (first-person, 0.85)
- fka-twigs → x-ray-spex [bridge, target written in the region-one pass]: "After being shortlisted for the 2014 Mercury Prize, FKA twigs named X-Ray Spex's Germfree Adolescents as her favorite album of all time." (first-person, 0.85)
notes: Björk comparisons are real in criticism ("R&Björk") but every source found frames it as a critic's comparison, never a first-person claim from twigs herself — correctly left unconfirmed. Adam Ant isn't a graph node. A Kraftwerk mention surfaced in one aggregated search summary but couldn't be verified on direct fetch — dropped rather than risk an uncheckable citation.
edge count: 2 — **CLEARS BAR**

### Sheena Ringo — proposed id: `sheena-ringo`
genres: n/a — see notes
edges:
- sheena-ringo → bjork [internal]: "Red Bull Music Academy's profile reports that at 15, auditioning for a talent agency, Sheena listed her tastes as including Björk, the UK girl group Eternal, Marvin Gaye and the New York freestyle singer Lisette Melendez." (reported, 0.6)
notes: **English-language search limitation, stated explicitly** — all sources found were English-language; a fuller picture almost certainly requires Japanese-language sources not reachable in this pass. No connection to Fishmans found in either direction in English sources. Admirers found (Lenny Kravitz, Courtney Love, Mika, Jack Barnett of These New Puritans) are people admiring/covering her work, not artists she's documented citing, and none are graph nodes. A "professed respect for Radiohead/Thom Yorke" claim appeared in one aggregated summary but couldn't be traced to a real named source — dropped rather than risk fabrication.
edge count: 1 — **FAILS BAR** (language barrier, not confirmed absence)

### Grimes — proposed id: `grimes`
genres: [electronic, art-pop, experimental-pop]
edges:
- grimes → cocteau-twins [bridge]: "Cocteau Twins is definitely a pretty heavy influence on me... one of the first bands I was into that was considered alternative, or artistically relevant, that was female-fronted. I feel like that was a pretty big thing for me when I was in high school." (Georgia Straight) (first-person, 0.85)
- grimes → aphex-twin [internal]: "My favourite Aphex Twin is Selected Ambient Works – the really early stuff. I'm just really into the texture of a lot of his beats and how sharp they are." (TheThousands, shortly after Visions, 2012) (first-person, 0.85)
notes: Björk comparisons: Grimes has publicly pushed back on the *comparison* as "lazy journalism" while affirming she "completely loves" Björk — too ambiguous between admiration and denial to encode either way; flagged for a human call rather than logged as a clean `rejectedEdges` denial. Mazzy Star was only a sample source on an early demo, not a stated influence — not encoded. No downstream citation found in the sources reached (Charli XCX/Caroline Polachek/100 gecs/yeule interviews checked — collaboration/feature/tour connections only).
edge count: 2 — **CLEARS BAR**

### Magdalena Bay — proposed id: `magdalena-bay`
genres: [synth-pop, art-pop, electronic]
edges:
- magdalena-bay → bjork [internal]: Matthew Lewin, on scoring Imaginal Disk: "We watched Dancer In The Dark, which was new for me... the opener track to that film score is just this beautiful horn arrangement... it really made us want to include more orchestral brass on this album." (Stereogum) (first-person, 0.75)
- magdalena-bay → fiona-apple [bridge]: Mica Tenenbaum: "I discovered her through Matt and she became my main songwriting inspiration and influence when I was a teen... she's always been my north star." (Under the Radar) (first-person, 0.85)
notes: Multiple secondary/aggregator sources repeat a claim that the duo "cite Grimes, Chairlift, St. Vincent, and Charli XCX as influences," but the one primary interview verified in full (Stereogum) shows Grimes appearing only in the journalist's own genre-comparison framing, not as an influence Magdalena Bay named themselves — not encoded, flagged as worth a targeted follow-up search specifically for a first-person Grimes quote (especially now that grimes is a graph node). St. Vincent and Chairlift aren't graph nodes. Beatles/prog-rock/ELO/Peter Gabriel/Paul McCartney/Suspiria mentions are off-map.
edge count: 2 — **CLEARS BAR**

### The Marías — proposed id: `the-marias`
genres: [dream-pop, electronic]
edges:
- the-marias → radiohead [bridge]: "The band also namechecks D'Angelo, Radiohead and Tame Impala as contemporary influences." (Vice, 2018) (reported, 0.6)
- the-marias → tame-impala [bridge]: same Vice citation. (reported, 0.6)
- the-marias → the-strokes [bridge]: "His [Josh Conway's] musical influences, spanning R&B, jazz, and indie rock, as well as Tame Impala, Radiohead, D'Angelo, and The Strokes, are evident in the dense yet transparent textures he creates in the studio." (The CU Independent) (critic, 0.5)
notes: **Genuinely borderline on scope, as flagged going in.** Their actually-stated lineage is heavily R&B/soul/Latin-pop facing (Norah Jones, Sade, Erykah Badu, Selena, Julieta Venegas, Lauryn Hill, Nina Simone, Billie Holiday, Carla Morrison — all off-map), with the three edges above as the only real bridge into the indie-electronic tradition, and even those come from paraphrase/prose rather than a direct quote in first person. D'Angelo (repeatedly named alongside all three) isn't a graph node. Reporting honestly: real and sourced, but represents stated adjacent listening, not the core of their sound — a human scope call, not a research failure.
edge count: 3 — **CLEARS BAR** (thinly, borderline scope, flagged)

### Clarence Clarity — proposed id: `clarence-clarity`
genres: n/a — not written
edges: none found
notes: Genuinely evasive interview subject. Direct quote: "Any name that I drop will just get duplicated" when pressed on influences. The one concrete taste-statement found ("I like Miley Cyrus, Iggy Azalea, Charlie XCX, even Rita Ora's got a couple of good singles") is framed as enjoyment of contemporary pop, not a stated sound-influence, and is paired with off-map names (Miley Cyrus, Iggy Azalea, Rita Ora) — doesn't clear the bar even reading it generously toward the one in-graph name (Charli XCX). Also cited: "the impeccable songwriting of Max Martin," and a five-albums list mixing metal bands (Cannibal Corpse, Carcass, Napalm Death, Exodus) with KT Tunstall — none graph-adjacent. His Rina Sawayama production credit correctly excluded. No downstream citation found either (underscores, Jane Remover checked).
edge count: 0 — **FAILS BAR** (genuinely thin/evasive subject, not a search failure)

### Dean Blunt — proposed id: `dean-blunt`
genres: n/a — not written
edges: none found
notes: Confirms the brief's caution. Blunt gives vanishingly few interviews; none surfaced with a first-person influence statement toward any in-graph artist. Cocteau Twins came up as a critic's sonic comparison for Hype Williams-era work, not a Blunt statement — excluded. No downstream citation found either (Yung Lean, Arca, A$AP Rocky, Vegyn, Frank Ocean, Panda Bear are all collaboration/feature relationships, correctly not treated as influence).
edge count: 0 — **FAILS BAR** (media-shy artist, genuinely thin sourcing, not a search failure)

### Xiu Xiu — proposed id: `xiu-xiu`
genres: [experimental-pop, no-wave]
edges:
- xiu-xiu → joy-division [bridge]: the sticker on Xiu Xiu's debut album Knife Play lists what Jamie Stewart was listening to when his mother died — Henry Cowell, Joy Division, Detroit techno, the Smiths, Takemitsu, Sabbath, Gamelan, "Black Angels," and Cecil Taylor. (first-person, 0.8)
- xiu-xiu → cocteau-twins [bridge]: "They were really into the '80s... 4AD records like Bauhaus, This Mortal Coil, Cocteau Twins. The Wolfgang Press was another huge one for me." (Sun 13, 2024) (first-person, 0.85)
- xiu-xiu → this-mortal-coil [bridge]: same Sun 13 quote as xiu-xiu → cocteau-twins. (first-person, 0.8)
- xiu-xiu → swans [bridge]: Jamie Stewart on Michael Gira: "I admire that he has never given up, has never relented in his intensity, and that he continues, after 30 years, to change and grow his music... It is good to have that model before you." (The Beijinger, 2014) (first-person, 0.7 — pulled back slightly given Stewart and Gira also have a touring/personal relationship)
- xiu-xiu → suicide [internal]: "Oh yeah, they're one of my favorite, favorite bands of all time... I think probably the next Xiu Xiu record will be really baldly influenced by Suicide." (Denver Westword) (first-person, 0.85)
- xiu-xiu → nico [bridge]: Stewart described the sonic direction of Angel Guts: Red Classroom as "a mean, tight hearted, blackness of Neubauten vs Suicide vs Nico." (Vice) (first-person, 0.75)
notes: Einstürzende Neubauten named in two separate quotes but isn't a graph node. Nina Simone came up strongly ("three records that really changed my musical life") but is off-map. Perfume Genius has a real first-person quote praising Xiu Xiu's intensity ("there's some music like Xiu Xiu, who I love, where their songs are so intense and visceral and over the top") but Perfume Genius isn't a graph node — flagged as a good future target, not a summon candidate on its own (only 1 edge). How to Dress Well covered a Xiu Xiu song — a cover, not influence, correctly excluded regardless of node status.
edge count: 6 — **CLEARS BAR**, rich upstream as expected

### Lamp — proposed id: `lamp`
genres: n/a — not written
edges: none found
notes: **Language barrier flagged explicitly.** English-language sources consistently surface only generic "Brazilian music," the Beatles, the Beach Boys, and Simon & Garfunkel — the first two scope-guarded out regardless, Simon & Garfunkel not a graph node. Lamp has a substantial Japanese-language interview archive (kumomi.org indexes several going back to 2004) almost certainly containing more specific, relevant influence statements for this 25-year-old band, but it wasn't reachable in English within this pass. A real gap from a language barrier, not evidence against real connections.
edge count: 0 — **FAILS BAR** (language barrier, not confirmed absence)

### Mid-Air Thief — proposed id: `mid-air-thief`
genres: [psychedelic-pop, neo-psychedelia]
edges:
- mid-air-thief → aphex-twin [internal]: Wikipedia states Mid-Air Thief "has spoken about being a big fan of British electronic musician Aphex Twin," elaborated elsewhere as naming Richard D. James Album specifically. (reported, 0.6 — the underlying primary interview was paywalled/unreachable, resting on the encyclopedia's sourced prose rather than a verbatim quote read directly)
- mid-air-thief → animal-collective [bridge]: "Influences from all over pop up in this album; from Animal Collective to Cocteau Twins to Real Estate and Grizzly Bear." (The Michigan Daily — the writer's own critical assessment, not a direct artist quote) (critic, 0.5)
- mid-air-thief → cocteau-twins [bridge]: same Michigan Daily citation. (critic, 0.5)
- mid-air-thief → grizzly-bear [bridge]: same Michigan Daily citation. (critic, 0.5)
notes: Andy Shauf, Metallica (first-ever album purchase, off-map), Dumbo Gets Mad, and Korean pop acts (god, Seotaiji) came up but don't map to graph targets. Real Estate is named in the same sentence as the three encoded targets but isn't a graph node. No interviews since 2019 per multiple sources, limiting corroboration.
edge count: 4 — **CLEARS BAR**

### Candy Claws — proposed id: `candy-claws`
genres: [shoegaze, dream-pop, neo-psychedelia]
edges:
- candy-claws → blonde-redhead [bridge]: Ryan Hoover, on making Ceres & Calypso: "We were also listening to a lot of Blonde Redhead's album 23, which also skirts shoegaze, though it's really washy." (FLOOD Magazine) (first-person, 0.8)
- candy-claws → my-bloody-valentine [bridge]: Ryan Hoover: "I listened to Starflyer and My Bloody Valentine during my high school years." (Break Yr Legs) (first-person, 0.8)
- candy-claws → the-knife [internal]: Ryan Hoover: "I was actually reading through your blog and you got me really into The Knife and I've been listening to lots of Boards of Canada, so that might come off in our future work." (Break Yr Legs) (first-person, 0.55 — a forward-looking discovery credited to reading someone else's blog, weaker than an established formative influence)
- candy-claws → boards-of-canada [internal]: same Break Yr Legs citation. (first-person, 0.55, same caveat)
notes: Starflyer 59 (named twice, clearly load-bearing) isn't a graph node — flagged as a good future-add candidate. The Beatles came up twice, off-map, not encoded. This roster (Blonde Redhead, My Bloody Valentine, The Knife, Boards of Canada) reads more shoegaze/dream-pop/downtempo-electronic than strictly "electronic realm" — worth a human call on lineage placement.
edge count: 4 — **CLEARS BAR**

### honeydip — proposed id: `honeydip`
genres: n/a — not written
edges: none found
notes: **Language barrier likely a real factor, flagged explicitly.** A specific, repeatedly-worded claim recurs across English aggregator sources (Last.fm, RYM-adjacent bios) that honeydip (Osaka shoegaze, 1995–2009, recently reunited) were "primarily influenced by the artists from the 4AD label (such as Bauhaus, Cocteau Twins, Lush, and Pale Saints), leaning more towards gothic rather than shoegaze music." Real and plausible — Cocteau Twins and Lush are both graph nodes — but it traces to no named interview, prose review, or even an English Wikipedia article (none exists), and reads like a mechanically-recycled bio blurb. Per the no-invented-citation rule, not encoded on an unverifiable claim. Very plausibly a genuine language-barrier gap rather than absence of real connections.
edge count: 0 — **FAILS BAR** (unverifiable secondary claim + likely language barrier, not confirmed absence)

---

## FAILS-BAR (7 of 21)

- **Beth Gibbons** (0 edges) — no sourcing found independent of Portishead; extremely sparse interview record.
- **George Clanton** (1 edge) — not thin catalogue; real interviews exist but either didn't name graph-relevant artists in his own words, or several likely-relevant ones (Interview Magazine, Clash) were paywalled/403'd.
- **Sheena Ringo** (1 edge) — **English-language search limitation**, stated explicitly; a real pass needs Japanese-language sources.
- **Clarence Clarity** (0 edges) — genuinely evasive subject ("Any name that I drop will just get duplicated"); not a search failure.
- **Dean Blunt** (0 edges) — media-shy as expected; no first-person influence statement found in either direction.
- **Lamp** (0 edges) — **language barrier**, a substantial Japanese-language interview archive exists but wasn't reachable in English.
- **honeydip** (0 edges) — **likely language barrier**; a real-sounding 4AD-influence claim recurs in secondary bios but traces to no verifiable named source.

None of these 7 are recommended for exclusion from the roster — three (Clarity, Blunt, Gibbons) are genuinely thin/media-shy subjects, and three more (Sheena Ringo, Lamp, honeydip) are explicitly flagged as language-barrier gaps rather than settled zeros, worth a follow-up pass with non-English search capability. George Clanton sits in between — worth one more targeted attempt at the paywalled sources.

## Out-of-scope (scope-guard cuts confirmed / reconfirmed)

Per the original brief, not researched or added: Daft Punk, deadmau5, Justice, The Chemical Brothers, The Prodigy, Crystal Castles, Pet Shop Boys, Tears for Fears, YMO, Sky Ferreira, Poppy, Poison Girl Friend.

Names that came up repeatedly across this research and were correctly NOT encoded as edges or proposed as nodes, per the scope guard: The Beatles, The Beach Boys, Led Zeppelin, Pink Floyd, King Crimson, Madonna, Britney Spears, Lady Gaga, Lorde, Lana Del Rey, Max Martin, Michael Jackson, Oasis, Alanis Morissette, Seal, 311, Brian Jonestown Massacre, Miley Cyrus, Iggy Azalea, Rita Ora, Kanye-adjacent names, Nina Simone, Metallica/Cannibal Corpse/Carcass/Napalm Death/Exodus (metal), D'Angelo, Sade, Erykah Badu, Selena, Julieta Venegas, Lauryn Hill, Billie Holiday, Carla Morrison, Norah Jones.

## Genre vocabulary needed

The current declared list has no `ambient`, `trip-hop`, `IDM`, `synth-pop`, `hyperpop`, `vaporwave`, or `art-pop` for the electronic realm specifically (art-pop already exists in the vocabulary from region-one, reusable here). Proposing only ids with 3+ graph-wide candidates, per instruction:

- **`vaporwave`** — death's dynamic shroud, 2814, George Clanton (even at 1 edge, still genuinely vaporwave), plus existing node Oneohtrix Point Never (genuinely part of the lineage per this research). **4 candidates.**
- **`ambient`** — Coil, Steve Roach, 2814, plus existing nodes Boards of Canada, Tim Hecker, Grouper, Stars of the Lid, Harold Budd. **8 candidates**, well over the bar.
- **`trip-hop`** — Sneaker Pimps, Beth Gibbons (even if held/merged), plus existing nodes Portishead, Massive Attack, Tricky, Burial. **5-6 candidates.**
- **`hyperpop`** — Slayyyter, Magdalena Bay (adjacent), plus existing nodes 100 gecs, SOPHIE, A.G. Cook, underscores, Jane Remover. **7 candidates.**
- **`synth-pop`** — Grimes, Magdalena Bay, George Clanton, plus existing nodes Depeche Mode, OMD, Gary Numan, the Human League, Sparks. **8 candidates**, already exists as a `Lineage` value, clear case.
- **`art-pop`** (genre id already exists graph-wide, from region-one) — FKA twigs, Sheena Ringo, Kero Kero Bonito, Grimes, Magdalena Bay, plus existing nodes Björk, Caroline Polachek, Julia Holter (previously flagged for a genre move elsewhere). **8 candidates**, reuse the existing id, no new one needed.
- **`IDM`** — not independently supported by this specific roster (no new artist here is IDM as a primary genre; existing Aphex Twin/Autechre/Squarepusher/Oneohtrix Point Never already cover it) — deferred, not proposed from this pass.

## Summon candidates (2+ real in-scope edges)

**Nine Inch Nails** clears the bar — surfaced independently twice, from two different artists in two different sources: Trent Reznor calling Coil's Horse Rotorvator "deeply influential on me" (`nine-inch-nails → coil`), and death's dynamic shroud's Tech Honors naming Nine Inch Nails as a formative influence in the same VWMusic interview used for the Radiohead/Julee Cruise edges (`deaths-dynamic-shroud → nine-inch-nails`). Two real, sourced, first-person edges — a genuine candidate for a future summon, flagged for a human decision rather than added unilaterally (it's metal-adjacent industrial, arguably closer to the scope guard's edge than a clean fit, worth a deliberate scope call).

**Below the bar, not promoted:** Starflyer 59 (1 edge, candy-claws → starflyer-59, though named twice across different Candy Claws interviews — still one target relationship); Perfume Genius (1 edge, perfume-genius → xiu-xiu).

## Beth Gibbons same-person recommendation

Flagging, not deciding: **0 edges clear independent of Portishead.** Every substantive influence/comparison found for her solo work (Out of Season, Lives Outgrown) is either about Portishead itself or a critic's mood-comparison, never a stated influence from her or a stated influence citing her solo output specifically. This is the same shape as the graph's existing Panda Bear precedent (0 confirmed independent edges → held, not written, under the "no orphans" rule) — a real argument for merging her solo work into the existing `portishead` node rather than standing up a separate `beth-gibbons` node, but the decision is left to the reviewer, consistent with how the Geordie Greep same-person question was handled in the region-one pass (flagged, not resolved unilaterally there either).

## New artist denials found

None. The one near-miss — Grimes pushing back on Björk *comparisons* as "lazy journalism" while affirming she "completely loves" Björk — reads as frustration with critical framing, not a clean denial of influence, so it's logged in Grimes' own notes above rather than formatted as a `rejectedEdges` entry. No new denials otherwise surfaced in either batch. The existing Burial/Massive Attack legacy judgement (island-two audit: "post-emergence mutual-admiration/collaboration, not stated formative influence") was checked and not touched — no new edge manufactured on top of it.

## Edges found where the target doesn't exist yet in the graph

None outside this roster itself. `kero-kero-bonito → grimes` resolves internally once both nodes from this same pass are written — not a true drop, just needs both targets written together. Every other target cited above (Cocteau Twins, Aphex Twin, Björk, Fiona Apple, Radiohead, Tame Impala, The Strokes, Joy Division, This Mortal Coil, Swans, Suicide, Nico, Animal Collective, Grizzly Bear, Blonde Redhead, My Bloody Valentine, The Knife, Boards of Canada, Can, Kraftwerk, Velvet Underground, Brian Eno, Massive Attack, Portishead, Sophie, Charli XCX, The Human League, Siouxsie and the Banshees, X-Ray Spex, My Bloody Valentine, Sweet Trip, Lush, Julee Cruise, Steve Roach, Burial, Sigur Rós, Boards of Canada) already exists in the current graph.

---

## Summary for Layer 2 review

21 researched, 14 clear the 2-edge bar, 7 don't (3 genuinely thin/media-shy subjects, 3 explicit language-barrier gaps worth a follow-up pass, 1 in-between). 0 new artist denials for `rejectedEdges` (one ambiguous Grimes/Björk near-miss flagged, not logged). 1 unresolved same-person question (Beth Gibbons vs. Portishead) needs a human ruling before Layer 3 write — research leans toward "hold, same as Panda Bear," but doesn't decide it. 6 new genre ids proposed (`vaporwave`, `ambient`, `trip-hop`, `hyperpop`, `synth-pop`, reuse existing `art-pop`), each with 4+ graph-wide candidates. 1 summon candidate clears the bar (Nine Inch Nails, 2 real edges), flagged for a scope decision given its industrial/metal-adjacency.
