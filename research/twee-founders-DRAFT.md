# Twee pop founders: Layer-1 research (DRAFT, 25 Oct 2026)

**Research only.** Nothing here is written to `seed-data.ts`. The question: which founders of a planned **Twee pop** genre (child of `indie-pop`, born around 1986: the NME C86 tape, Sarah Records, K Records) can be added as artists under the no-orphans rule, meaning at least one real, sourced influence link to an artist **already on the map**.

Map ids checked against `public/graph.json` (297 artists). None of the candidates is on the map yet.

**Tool status:** 16 WebSearch calls, all working. Direct fetches 403'd on clashmusic.com and medium.com and 404'd on two pages (guitar.com, the Drowned in Sound Black Tambourine piece). `r.jina.ai` got past Clash, Ink 19, The Quietus, Pennyblack and Substack. medium.com refuses it too ("AbuseAlleviationError"). aestheticsforbirds.com gave jina a captcha, but plain WebFetch went through.

## Summary

| Candidate | Verdict | Best link to the map | Tier / conf |
|---|---|---|---|
| The Pastels | **ADD** | `the-pastels → velvet-underground`: *"This record was such a big influence on The Pastels, as was all The Velvet Underground's music."* (Quietus, 2013) | first-person / 0.9 |
| Black Tambourine | **ADD** | `black-tambourine → the-jesus-and-mary-chain`: *"The Jesus And Mary Chain were an enormous influence on us"* (Clash, 2010) | first-person / 0.85 |
| Talulah Gosh | **ADD** | `talulah-gosh → ramones`: *"our two main influences, 1960s girl groups and the Ramones"* (Aesthetics for Birds, 2014) | first-person / 0.85 |
| Heavenly | **ADD** (adjacency flag) | `heavenly → bikini-kill` and `→ bratmobile`: *"we were inspired by the slightly more aggressive sound of riot grrrl"* (2024) | first-person / 0.75 |
| Beat Happening | **ADD** | `nirvana → beat-happening`: in Cobain's 1992 Rolling Stone list of bands he likes, and *Jamboree* at #31 on his handwritten favourite-albums list | first-person, favourites tier / 0.75 |
| Marine Girls (optional) | **ADD, if wanted** | `nirvana → marine-girls`: *Beach Party* at #44 on the same list; `the-radio-dept → marine-girls` (FLOOD) | favourites / 0.6–0.75 |
| Dolly Mixture, The Field Mice | not researched | (stopped once the five priority candidates had resolved) | |

Links between candidates (worth writing only if both ends are added): `black-tambourine → beat-happening`, `talulah-gosh → the-pastels`.

---

## 1. The Pastels: ADD

### Links to the map
1. **`the-pastels → velvet-underground`**: first-person, **0.9**.
   Stephen McRobbie, The Quietus Baker's Dozen, "Chance-Taking: Stephen McRobbie Of The Pastels' Favourite Albums", John Freeman, 3 June 2013. Pick #12, *The Velvet Underground & Nico*: https://thequietus.com/interviews/bakers-dozen/the-pastels-stephen-mcrobbie-favourite-albums/13/
   > "This record was such a big influence on The Pastels, as was all The Velvet Underground's music. We loved the crazed mayhem of The Velvet Underground mixed up with these incredible melodies, the sad sound of Nico's voice bringing a kind of European influence and the fantastic youthful energy they had as a group."

   Also: *"Brian [Superstar nee Taylor], who played guitar in The Pastels, was a really big fan… I might have first heard it in 1980."* Chronology is fine: heard around 1980, band formed 1981/82.
2. **`the-pastels → kraftwerk`**: first-person, **0.7**. Same feature, pick #4, *Ralf & Florian* (".../5/"):
   > "This is early Kraftwerk but technically it came out as Ralf & Florian… The Ralf & Florian record has got really beautiful inventiveness to it and there is a lot of fluid electronics on it. To a certain extent, that has influenced some of Tom Crossley's – who plays with us – flute playing."

   This is a sound-specific claim, but it is about a later-era member's playing, not the 1980s band. Hence 0.7.
3. **`the-pastels → faust`**, **`→ brian-eno`**, **`→ stereolab`**: favourites tier, about **0.5**. These are Baker's Dozen picks #1 (*The Faust Tapes*), #7 (*Another Green World*) and #2 (Stereolab's *Cobra and Phases*). The intro says the 13 albums "defined his taste" and inspired his band. The text praises each record but makes no shaping claim. Chronology for Stereolab: they formed in 1990, so the link could only apply to later Pastels records (*Illumination* 1997, *Slow Summits* 2013).
4. **`the-pastels → the-modern-lovers`**: reported, **0.6**. Encyclopedia.com (Gale, *Contemporary Musicians*), "The Pastels": https://encyclopedia.com/education/news-wires-white-papers-and-books/pastels
   > "The band's two greatest influences include the Swell Maps and the Modern Lovers, two bands known for endearing simplicity and a sense of adventure, respectively."

   This is a reference-work claim with no quote behind it. Use it only alongside the Velvet Underground link.
5. **`the-pastels → ramones`**: reported, **0.5**. Albumism, *Truckload of Trouble* anniversary feature: https://albumism.com/features/the-pastels-truckload-of-trouble-album-anniversary
   > "one of his favorite bands was the Ramones"

   McRobbie's label 53rd & 3rd was "named after the Ramones song… featuring a logo styled after Joey Ramone's head". This is favourites plus naming, not a sound claim. Optional.
6. *Weak, do not write:* "It led to groups like The Velvet Underground and Love and Big Star, to an extent" (same VU page). That is McRobbie tracing roots back from Orange Juice. `→ big-star` would sit on "to an extent". Leave it out.

### Downstream leads (unverified)
- Encyclopedia.com: *"Groups such as Nirvana, Teenage Fan-club, and Belle and Sebastian have considered the Pastels a significant inspiration."* This is unattributed and has no quote. One search for a Stuart Murdoch statement found nothing. HOLD `belle-and-sebastian → the-pastels` and `nirvana → the-pastels` until a first-person source turns up. Cobain's journal favourites list (see Beat Happening) does **not** include the Pastels.

### Rejected / false leads
- **Camera Obscura "grew up on the Velvet Underground, the Pastels and Yo La Tengo"**: the known Grokipedia fabrication (CLAUDE.md, and the comment at `seed-data.ts` around line 3265). It did not come up this pass and must not be used.
- Pastels friendships with Mogwai, Teenage Fanclub and Belle and Sebastian (Cafébabel interview: "We're friends with…") are scene, not influence.
- Calvin Johnson being a Pastels fan, and the Pastels playing his 1991 International Pop Underground Convention (Albumism), are scene and label ties. No `beat-happening ↔ the-pastels` edge without a first-person claim.
- Stephen Pastel's label 53rd & 3rd released Talulah Gosh's first singles. That is label adjacency (see Talulah Gosh).

### Basic facts
- Country **GB** (Glasgow). Formed **1981** per Wikipedia and Albumism; Encyclopedia.com says **1982** (first single "Songs for Children", 1982). Use 1981 and note the conflict.
- Major album: ***Up for a Bit with The Pastels* (1987)**, their debut and the C86-era record. Alternative: *Illumination* (1997).

---

## 2. Black Tambourine: ADD

### Links to the map
1. **`black-tambourine → the-jesus-and-mary-chain`**: first-person, **0.85**.
   - Brian Nelson (guitar), ClashMusic, "Black Tambourine", 31 March 2010: https://www.clashmusic.com/?p=202734 (read via r.jina.ai)
     > "But as well, The Jesus And Mary Chain were an enormous influence on us and they took a lot from the girl group, 60s sound. They could carry that 60s sound with a lot of noise and distortion, and we just wanted to do the same thing."
   - Corroborated by Archie Moore (drums/guitar), Ink 19, "Black Tambourine: Barbed Wire Kisses Goodbye", Matthew Moyer, 25 June 2010: https://ink19.com/2010/06/magazine/interviews/nucemb-black-tambourine. Asked *"What were some of the big influences on your sound at first…? The Jesus and Mary Chain probably loomed large…"*, he answered:
     > "Well, Psychocandy for sure."

   Chronology: *Psychocandy* came out in 1985; the band formed in 1989.
2. **`black-tambourine → galaxie-500`**: first-person, **0.8**. Nelson, same Clash piece:
   > "We always knew of American bands like Beat Happening, Galaxie 500, The Feelies – any of those bands were also hugely influential to us… Galaxie 500, Yo La Tengo and things equally influenced us like that."

   Galaxie 500's *Today* came out in 1988. A Drowned in Sound piece in which Archie Moore reportedly calls Galaxie 500 "the main sonic inspiration for 'Black Car'" now 404s, so that claim is unverified. Don't cite it.
3. **`black-tambourine → yo-la-tengo`**: first-person, **0.75**. Same Nelson sentence as above. Yo La Tengo's *Ride the Tiger* came out in 1986.
4. **`black-tambourine → velvet-underground`**: first-person, **0.7**. Moore, same Ink 19 answer about early influences:
   > "Some '60s rock like the Velvet Underground, Love, and the Byrds."
5. **`black-tambourine → big-black`**, **`→ the-birthday-party`**: first-person, **0.65**. Same Moore answer:
   > "Lots of noisy stuff like Big Black, Head of David, Pussy Galore and the Birthday Party."
6. **`black-tambourine → swans`**, **`→ glenn-branca`**, **`→ sonic-youth`**: first-person, **0.65**. Mike Schulman, same Ink 19 exchange:
   > "For the noise stuff, I was especially interested in the NYC scene: Swans, Glenn Branca, Sonic Youth, Unsane, Dustdevils, Drunk Tank. While we were consciously trying to explore the more pop-influenced side of the spectrum, I think our collective interest in noise was big factor in how BT sounded."
7. *Favourites only:* Moore, Ink 19: *"We loved Buddy Holly for the same reasons we loved the Ramones, JAMC, and Galaxie 500: they each took two or three simple chords and created a sound that they owned."* That supports `→ ramones` at about 0.6 if wanted.

### Rejected / false leads
- **`→ ramones` from the 2012 Ramones covers EP**: cover-derived, excluded. Use the Buddy Holly quote above if anything.
- **`→ suicide`**: Schulman says *"Suicide were total favorites of mine"*, but only while explaining why they **covered** "Dream Baby Dream". That is a cover plus favourites, so excluded.
- **`→ the-pastels`**: Pam Berry's "Throw Aggi Off the Bridge" is a crush song about Stephen Pastel, and Berry only met the Pastels after the band ended (Ink 19). That is fandom, not influence.
- Downstream claims (Vivian Girls, Crystal Stilts, The Pains of Being Pure at Heart) are all off the map, and Nelson himself says those bands are "more influenced by the same people we were".
- Shared label (Slumberland, run by Schulman) and Velocity Girl personnel (Moore, Nelson) are not influence.

### Basic facts
- Country **US** (Silver Spring, Maryland / the Washington DC area). Formed **1989** (Ink 19: "came together in 1989").
- Major album: no studio LP exists, only singles and compilation tracks from 1989–91. Use the compilation ***Black Tambourine* (Slumberland, 2010)**, the expanded reissue the 2010 interviews were about. Alternative: *Complete Recordings* (1999).
- Genre fit: closer to noise pop (Mary Chain plus girl groups) than to twee proper. Layer 2 may prefer tagging it `indie-pop` / noise-pop, with twee secondary.

---

## 3. Talulah Gosh: ADD

### Links to the map
1. **`talulah-gosh → ramones`**: first-person, **0.85**. Peter Momtchiloff (guitar in Talulah Gosh and Heavenly), "Editor-Artist Interview: Peter Momtchiloff", Christy Mag Uidhir, *Aesthetics for Birds*, 29 August 2014: https://aestheticsforbirds.com/?p=673
   > "The basis of our music was the bringing-together of our two main influences, 1960s girl groups and the Ramones."

   Corroborated by a critic (The Quietus, 2014, below), who hears *"the Ramones-romp through 'Break Your Face'"*. Chronology: Ramones 1976, Talulah Gosh 1986.

### Link to another candidate
- **`talulah-gosh → the-pastels`**: first-person aesthetic claim plus a reported fact, **0.65**. Source: "Talulah Gosh: The Pussy Riot Connection, An Interview & A Review", April Welsh (interview) and Helen King (review), The Quietus, 7 January 2014: https://thequietus.com/?p=14200
  > "Talulah Gosh also ingested a heavy dose of their beloved Pastels – Amelia Fletcher and Elizabeth Price were both wearing badges advertising their love for the Scottish indie band when they met." (journalist)
  >
  > Fletcher: "What was interesting was at that time bands like that The Pastels, for instance, twinned leather trousers with anoraks; it was that combination of seeing the world through a child's eye but also having a darker, harsher side which we wanted to get across."

  **Adjacency flag:** Talulah Gosh's first singles came out on 53rd & 3rd, the label Stephen Pastel co-ran. The badge fandom predates the band, so the claim does not rest on the label. Still, check it against the label rule.

### Rejected / false leads
- **`ride → talulah-gosh`**: same Quietus piece. Fletcher says Andy Bell came to watch them: *"I think he saw that you could be in a band who were successful when you really couldn't play anything, and that was inspiring."* That is Fletcher guessing at Bell's reaction, not Bell speaking. Not an edge unless Bell is found saying it.
- **`talulah-gosh → my-bloody-valentine`**: a search summary attributed to Fletcher (Pennyblack Tender Trap interview) the line that the Shop Assistants and My Bloody Valentine "were, I guess, some of the bands that originally influenced Talulah Gosh". The fetched page (Pennyblack Id=11013) did not carry that sentence; the reader output was cut short. **Unverified**: do not write it until the sentence is found on a page.
- Fletcher, Momtchiloff, Rob Pursey and Mathew Fletcher were in both Talulah Gosh and Heavenly. That is personnel, so no edge between the two.
- Fletcher on lineage to riot grrrl (*"even though we were way earlier than riot grrrl, there's still a bit of a lineage"*) is the band about itself, not a descendant's claim. Not an edge.

### Basic facts
- Country **GB** (Oxford). Formed **February 1986** (Quietus 2014). Split 1988.
- Major album: no studio album. Options are *Rock Legends: Volume 69* (53rd & 3rd, 1987), *They've Scoffed the Lot* (Sarah, 1991), ***Backwash* (K Records, 1996)** and *Was It Just a Dream?* (Damaged Goods, 2013). Recommend ***Backwash* (1996)**, the long-standing complete collection; fall back to *Was It Just a Dream?* if the cover or preview enrichment fails.

---

## 4. Heavenly: ADD (with an adjacency flag for Layer 2)

### Links to the map
1. **`heavenly → bikini-kill`** and **`heavenly → bratmobile`**: first-person, **0.75** each. Amelia Fletcher, "5/29/24: An Interview with Heavenly", Quinn Moreland's Substack newsletter, 29 May 2024: https://quinnmoreland.substack.com/p/52924-an-interview-with-heavenly
   > "We went over to Olympia to play some shows and discovered Bratmobile and Bikini Kill… They were putting that stuff into their music and I was like, *Oh, we could do that too.* So there's a lyrical difference but also a musical one because we were inspired by the slightly more aggressive sound of riot grrrl, even though we never really sounded like a riot grrrl band."

   Corroborated for Bratmobile by Momtchiloff, *Aesthetics for Birds*, 29 Aug 2014 (URL above):
   > "we met and played with Bratmobile and other riot grrrl acts, and found them kindred spirits… This reawakened our punk rock tendencies, which had been to the fore in our previous band Talulah Gosh… so our music became noisier from our 1993 releases till we finished in 1996."

   Chronology: Bikini Kill formed in 1990, Bratmobile in 1991. The change shows on Heavenly's records from 1993 on: the *P.U.N.K. Girl* EP, *The Decline and Fall of Heavenly* (1994).

   **Adjacency flag:** these are peers met on tour, and Heavenly's US label was K Records in the same small town. That is exactly the scene and label hazard the rules warn about. The edge survives only because both members state a specific musical and lyrical effect in their own words. Layer 2 should decide. If it is ruled scene rather than influence, Heavenly drops to HOLD, since it has no other link to the map.

### Rejected / false leads
- Momtchiloff: *"we did have musical sympathy with some of the groups involved (Blur and Elastica perhaps)"*. That is sympathy, not influence, so no `heavenly → blur`.
- Heavenly signing to K (Calvin Johnson and Candice Pedersen) is label, not influence on or from Beat Happening.
- Personnel overlap with Talulah Gosh (above): no edge between them.

### Basic facts
- Country **GB** (Oxford). Formed **1989** (from general reference, not re-checked this pass). Split 1996 after drummer Mathew Fletcher's death.
- Major album: ***The Decline and Fall of Heavenly* (1994)**, the record the riot grrrl change shows up on, so it ties to the edges. Alternative: *Le Jardin de Heavenly* (1992).

---

## 5. Beat Happening: ADD

### Links to the map
1. **`nirvana → beat-happening`**: first-person, favourites tier, **0.75**. This matches the repo's existing `nirvana → swans` (0.75, from the same journal list).
   - Rolling Stone cover story "Nirvana: Inside the Heart and Mind of Kurt Cobain", 16 April 1992, page 3: https://www.rollingstone.com/music/music-news/nirvana-inside-the-heart-and-mind-of-kurt-cobain-2-235093/3/
     > "Cobain is happier to reel off a list of some of the bands he *does* like: the Breeders, the Pixies, R.E.M., Jesus Lizard, Urge Overkill, Beat Happening, Dinosaur Jr and Flipper."

     This is the same source the repo already uses at 0.85 for `nirvana → dinosaur-jr`, `→ rem` and `→ the-jesus-lizard`. Strictly, it is a journalist reporting a list. That supports 0.75 rather than 0.85 here.
   - Cobain's handwritten list of his 50 favourite albums (*Journals*, 2002), as transcribed by Far Out, 30 July 2022: https://faroutmagazine.co.uk/kurt-cobain-50-favourite-albums-list/
     > "31. Beat Happening – *Jamboree* (1988)"
   - Chronology: *Jamboree* (1988) predates *Bleach* (1989) and *Nevermind* (1991).
   - **Unverified:** *"I like a lot of clean pop like the Vaselines and Beat Happening"*, which Flavorwire attributes to a 1989 Cuepoint/Medium piece. medium.com blocked both WebFetch and jina. A stronger quote if someone can open it.
2. **`snail-mail → beat-happening`**: first-person, **0.8**, by parity. Lindsey Jordan, 2016 9:30 Club interview posted to Tumblr. That source already carries three written edges (`snail-mail → grouper`, `→ broadcast`, `→ liz-phair`, seed-data around lines 2086–2089):
   > "while writing Habit she was listening to a lot of Grouper, Broadcast, Joni Mitchell, Psychic TV, Beat Happening and Liz Phair… not all of them influenced the album stylistically but she had learned from their songwriting"

   **Not re-opened this pass.** One search for the Tumblr page failed, and the repo stores no URL for it. It is safe to write by parity with the three existing edges. Ideally Layer 2 recovers the URL.

### Link to another candidate
- **`black-tambourine → beat-happening`**: first-person, **0.7**. Nelson, Clash 2010 (Black Tambourine section above): *"We always knew of American bands like Beat Happening, Galaxie 500, The Feelies – any of those bands were also hugely influential to us."*

### Rejected / false leads
- **`trail-of-dead → beat-happening`: REJECT.** The only Reece quote found is Michael Corcoran, "...And You Will Know Us By the Trail of Dead", originally 2002 and republished on Corcoran's Substack *Truth Is Stranger* on 4 Mar 2022: https://michaelcorcoran.substack.com/p/and-you-will-know-us-by-the-trail
  > "There were some great bands, especially the Melvins and Beat Happening, but the (hype) was suffocating… It bugs me to no end when I read that the band started in Olympia. Man, we couldn't leave that shithole fast enough."

  That is praise for local bands plus a rejection of Olympia as an origin, not an influence claim.

  **Side finding (no edit made):** the existing `trail-of-dead → unwound` citation in `seed-data.ts` (around line 2223) says Reece *"has said the years he and Conrad Keely spent in Olympia shaped the band, naming Beat Happening, Bikini Kill and Unwound as big influences on their lives"*. No source for that wording could be found. The repo's research files carry no note of it, and this Reece quote points the other way. The edge itself also rests on Keely's MusicRadar *Fake Train* pick, which should be enough on its own. The Reece half of that citation deserves a check.
- **`mount-eerie → beat-happening`: HOLD.** Bret Lunsford mentored Phil Elverum: he gave him work at his record store, the drum seat in D+, and the first Microphones tapes on his label, Knw-Yr-Own. That is personnel and scene. Rolling Stone's 2020 Elverum interview (https://www.rollingstone.com/music/music-features/phil-elverum-microphones-2020-interview-1036673/) mentions Lunsford only as a friend and festival co-runner. No first-person statement that Beat Happening shaped Elverum's music was found. `research/folk-audit-FINAL.md` treated the mentorship as an edge; under the personnel rule it should not be one without such a quote.
- **Nirvana's K Records tattoo, Cobain on Calvin Johnson's KAOS show (1990), the Go Team release**: label, scene and collaboration. Not edges.
- *Loud and Quiet*, "Inspiration Jamboree: The story of Beat Happening" (Daniel Dylan Wray, 20 Oct 2015) has no first-person influence quotes from descendants. Ben Gibbard calling "Indian Summer" *"the indie Freebird"* is a cover-era compliment, and Gibbard is not on the map anyway.

### Basic facts
- Country **US** (Olympia, Washington). Formed **1982**.
- Major album: ***Jamboree* (1988)**, the one on Cobain's list. Alternative: *You Turn Me On* (1992).

---

## 6. Optional: Marine Girls: ADD if wanted (cheap, two links)

1. **`nirvana → marine-girls`**: favourites, **0.75** (parity with `nirvana → swans`). Cobain's journal list, Far Out (URL above):
   > "44. Marine Girls – *Beach Party* (1981)"
2. **`the-radio-dept → marine-girls`**: first-person, **0.6**. This is the FLOOD Magazine quote that already carries `the-radio-dept → the-blue-nile` (seed-data around line 2782): *"while making the record they were listening to '80s acts like Marine Girls, Young Marble Giants and Antena…"*. Not re-opened this pass.

Facts: **GB** (Hatfield, Hertfordshire), formed **1980** (general reference, not re-checked). Major album ***Beach Party* (1981)**. Fit: a precursor to twee rather than part of the 1986 wave. A judgement call for the genre's "founders" list.

## Not researched
- **Dolly Mixture**, **The Field Mice**: no searches spent; the brief said to stop at 3–4 artists.
- **Upstream of Beat Happening** (Calvin Johnson's own influences): skipped because two downstream links already clear the bar.

## Notes for Layer 2
- **Five priority candidates clear the bar.** That is more than the 3–4 the brief aimed for. If only some are wanted, the strongest by source quality are the Pastels, Black Tambourine and Talulah Gosh. Beat Happening's links are favourites-tier, though numerous. Heavenly hinges on the adjacency ruling.
- **Links between candidates** (`black-tambourine → beat-happening`, `talulah-gosh → the-pastels`) are only worth writing if both ends are added. Neither is needed for no-orphans.
- **Realm placement** is not decided here. The UK bands (Pastels, Talulah Gosh, Heavenly, Marine Girls) fit `region-one`, next to Belle and Sebastian and Camera Obscura. The US bands could go in `region-one` or `american-underground`: Beat Happening (lo-fi, K Records) and Black Tambourine (Slumberland noise pop).
- **Shared-member and shared-label pairs to keep edge-free:** Talulah Gosh/Heavenly (members), Pastels/Talulah Gosh (53rd & 3rd label), Beat Happening/Heavenly (K Records), Black Tambourine/Velocity Girl (members).
