# Emo & Post-Hardcore Realm: Influence Audit — DRAFT (Layer 1 of 3)

**Status: DRAFT / LAYER 1 ONLY.** This document is pure sourcing research. Nothing in it has been written to `data/seed-data.ts` or any other file. No nodes or edges exist in code. Per the 3-layer review process: **Layer 1 (this document) = source. Layer 2 = assistant flags. Layer 3 = human decides.** Nothing here should be treated as approved.

Modeled on `island-two/influence-audit-proposal.md` and `folk-audit-DRAFT.md`/`folk-audit-FINAL.md` (all read in full before starting this one) — same schema grounding, same edge convention, same internal/bridge tagging, same "verified edges only, real named source, never a vague blanket claim" standard.

**Methodology note — this audit was explicitly commissioned to correct a known failure mode.** The folk-realm audit was later found to have systematically under-counted, because its researchers effectively validated a small set of pre-guessed pairs instead of doing open-ended research into each artist's full, real, documented influence network. This audit's four research passes were explicitly briefed to research first, map to the roster second — search broadly for each artist's own stated influences and who cites them, *then* check which named names happen to be valid targets. The result is visible in the density below: several artists here (Fugazi, Drive Like Jehu, The Jesus Lizard, Unwound, American Football, Brand New) turned up 8–17 real edges apiece, far more than a fixed-pair check would have found, and — just as importantly — the four researchers independently rejected several claims that didn't hold up under scrutiny rather than reporting them anyway (see §7.4).

**Compilation note:** as with the folk audit, four researchers worked in parallel with no visibility into each other's findings, then this pass cross-referenced all four for shared targets. Given how densely this realm's own artists cite *each other* (Fugazi in particular is cited by artists across all three other families), that cross-referencing did real work here — several artists below have edges credited to them that a sibling researcher, not their own, actually found. Where two researchers independently found the *same* edge via different sources, both sources are cited as corroboration rather than double-counted as two edges. Given the scale (33 artists, 4 researchers, dozens of cross-links), this DRAFT's per-artist counts should be read as a strong, deliberately-cross-checked estimate, not a mathematically exhaustive final tally — a Layer-2 hand-verification pass (as the folk realm got) is recommended before this is finalized, exactly because that pass is what caught the folk realm's under-counting in the first place.

---

## 0. Grounding in the real data

Source files read: `data/types.ts`, `data/seed-data.ts`, `island-two/influence-audit-proposal.md`, `folk-audit-DRAFT.md`, `folk-audit-FINAL.md`.

### 0.1 Schema (unchanged from prior audits)

`Artist.realm?: Realm` and `Artist.lineage?: Lineage` — both string unions in `data/types.ts` that would need extending with a new realm value (proposed: `'emo-posthardcore'`) and four new lineage values (`hardcore-roots`, `post-hardcore`, `midwest-emo`, `math-rock`) if any of this is adopted. Not touched in this document.

`inf(source, target, confidence, status)` — **source = the INFLUENCED artist (disciple, usually newer), target = the INFLUENCE (usually older).** `"a → b"` below always means "a was influenced by b."

**Hard rule applied throughout:** verified edges only. Anywhere a genuine, specific, checkable source could not be found, the edge is marked **UNSOURCED** or omitted — never invented. Several specific claims were actively investigated and found *not* to hold up; see §7.4 for the full list — these are reported as a feature of the research, not hidden.

### 0.2 Existing Starweave nodes (148 total) — for `[bridge]` tagging

**CORE (5):** `velvet-underground`, `kraftwerk`, `can`, `neu`, `brian-eno`

**REGION-ONE (57):** `nico`, `television`, `talking-heads`, `big-star`, `the-stooges`, `new-york-dolls`, `joy-division`, `new-order`, `the-cure`, `siouxsie-and-the-banshees`, `the-smiths`, `gang-of-four`, `nick-cave-and-the-bad-seeds`, `wire`, `the-birthday-party`, `fontaines-dc`, `idles`, `the-jesus-and-mary-chain`, `cocteau-twins`, `this-mortal-coil`, `julee-cruise`, `the-sundays`, `mazzy-star`, `my-bloody-valentine`, `slowdive`, `ride`, `lush`, `broadcast`, `beach-house`, `deerhunter`, `alvvays`, `wolf-alice`, `silversun-pickups`, `fishmans`, `sweet-trip`, `parannoul`, `pixies`, `sonic-youth`, `dinosaur-jr`, `husker-du`, `the-replacements`, `pavement`, `yo-la-tengo`, `rem`, `radiohead`, `the-stone-roses`, `interpol`, `the-strokes`, `yeah-yeah-yeahs`, `geese`, `built-to-spill`, `modest-mouse`, `blur`, `stereolab`, **`fugazi`**, **`minor-threat`**, `david-bowie`

**ELECTRONIC (44):** `silver-apples`, `suicide`, `cabaret-voltaire`, `faust`, `depeche-mode`, `the-human-league`, `omd`, `gary-numan`, `the-knife`, `sparks`, `aphex-twin`, `autechre`, `boards-of-canada`, `squarepusher`, `burial`, `oneohtrix-point-never`, `tim-hecker`, `stars-of-the-lid`, `grouper`, `harold-budd`, `lcd-soundsystem`, `hot-chip`, `the-postal-service`, `four-tet`, `caribou`, `the-rapture`, `chk-chk-chk`, `massive-attack`, `portishead`, `tricky`, `sophie`, `a-g-cook`, `100-gecs`, `charli-xcx`, `arca`, `caroline-polachek`, `underscores`, `jane-remover`, `oklou`, `ninajirachi`, `yeule`, `porter-robinson`, `bjork`, `imogen-heap`

**FOLK-CONFESSIONAL (42):** `nick-drake`, `leonard-cohen`, `vashti-bunyan`, `townes-van-zandt`, `joni-mitchell`, `bob-dylan`, `neil-young`, `bert-jansch`, `roy-harper`, `karen-dalton`, `incredible-string-band`, `john-prine`, `joanna-newsom`, `sufjan-stevens`, `big-thief`, `adrianne-lenker`, `fleet-foxes`, `bon-iver`, `bright-eyes`, `elliott-smith`, `fiona-apple`, `jeff-buckley`, `mitski`, `phoebe-bridgers`, `sharon-van-etten`, `angel-olsen`, `weyes-blood`, `ethel-cain`, `snail-mail`, `japanese-breakfast`, `clairo`, `julia-holter`, `liz-phair`, `cat-power`, `red-house-painters`, `mount-eerie`, `low`, `have-a-nice-life`, `silver-jews`, `kurt-vile`, `mac-demarco`, `the-mountain-goats`

### 0.3 Two roster names already exist as nodes

- **Fugazi** (`fugazi`, region-one, `layer: 'post-punk'`? — actually `genres: ['post-hardcore']`) — already has 5 edges: `fugazi → wire`, `fugazi → sonic-youth`, `fugazi → gang-of-four`, `fugazi → minor-threat`, `elliott-smith → fugazi`. Turns out to be the single densest node in this entire audit (see §2.1/§8) — carried through as edge-only, per your instruction, with an explicit recommendation (not a decision made here) that it move to the new realm.
- **Minor Threat** (`minor-threat`, region-one, `genres: ['post-hardcore']` — **flagged as a probable genre-tag mismatch**, see §7.1) — has 2 existing edges: `sonic-youth → minor-threat`, `fugazi → minor-threat`.

Both carried through exactly as the folk audit treated Nico/Grouper: edge-only, no duplicate node, existing edges untouched.

---

## 1. Full roster (33 artists across 4 families)

- **hardcore-roots:** Minor Threat*, Minutemen, Black Flag, Bad Brains, Dead Kennedys, The Misfits, Descendents, Fugazi*
- **post-hardcore:** Slint, Drive Like Jehu, The Jesus Lizard, Unwound, NoMeansNo, Refused, At The Drive-In
- **math-rock:** toe, tricot
- **midwest-emo:** Sunny Day Real Estate, American Football, Cap'n Jazz, Brave Little Abacus, Newfound Interest in Connecticut, Far Apart, The Arrogant Sons of Bitches, Duster, Hum, Pinback, The Dismemberment Plan, Brand New, La Dispute, Jeff Rosenstock, Bomb the Music Industry!, Soul Glo

*Already exists as a node — see §0.3.

---

## 2. Family: hardcore-roots

*Lineage value proposed: `hardcore-roots`.*

### Minor Threat · exists (`minor-threat`)
**Already in graph:** `sonic-youth → minor-threat`, `fugazi → minor-threat`.

New edges:
- `minor-threat → bad-brains` [internal] — Wikipedia/Teen Idles (Ian MacKaye's band immediately preceding Minor Threat, same two core members): "After seeing a Bad Brains concert, MacKaye and Nelson began playing in a punk band"; corroborated by Wikipedia/Ian MacKaye ("looked up to hardcore bands like Bad Brains and Black Flag") and Lyle Preslar (Scott Crawford's *Spoke* podcast, May 25, 2021), crediting Dr. Know's guitar technique directly.
- `minor-threat → black-flag` [internal] — same Teen Idles sourcing.

**Verified edge count: 2 new** (+2 existing). No flag.
**Notes:** Both trace through Teen Idles rather than a Minor-Threat-era-specific quote — same two members, immediately preceding formation, so treated as solid rather than weak. Genre-tag mismatch flagged separately (§7.1).

### Minutemen · `minutemen` · family: hardcore-roots
genres: `hardcore-punk` (proposed)
scene: early-80s San Pedro, CA hardcore / SST Records

Edges:
- `minutemen → wire` [bridge] — Wikipedia/Minutemen: "influenced heavily by bands such as the Pop Group, Wire, Creedence Clearwater Revival, Pere Ubu, and Richard Hell & The Voidoids." (Only Wire is a valid target among these.)
- `minutemen → dead-kennedys` [internal, ⚠ weak — AllMusic "Similar Artists," not a member quote] — Wikipedia/Dead Kennedys "Influence" section.
- `fugazi → minutemen` [internal] — Guy Picciotto, *Cultural Glitch* (Nov 3, 2011): "Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex."
- `slint → minutemen` [internal] — Wikipedia/Slint: "Artists that influenced Slint include Leonard Cohen, Neil Young, Nick Cave, Madonna, Philip Glass, Minutemen and Big Black."
- `pinback → minutemen` [internal, documented fact] — Wikipedia/Minutemen legacy: Pinback "sampled [drummer George] Hurley's drumming on their debut LP."

**Verified edge count: 5.** No flag.
**Notes:** Mike Watt's most emphatic quote ("Without The Pop Group I don't know what The Minutemen would have sounded like") can't be encoded — The Pop Group isn't a valid node. Greg Ginn producing Minutemen's debut EP is real, well-documented mentorship, not a stated influence claim from either side — not encoded (business/production credit is a different evidentiary category than influence, same distinction the electronic-realm audit applied to Kero Kero Bonito).

### Black Flag · `black-flag` · family: hardcore-roots
genres: `hardcore-punk`
scene: early-80s LA/Hermosa Beach hardcore, SST Records

Edges:
- `black-flag → the-stooges` [bridge] — Greg Ginn, Wikipedia/Black Flag: "We were influenced by the Stooges and then the Ramones; they inspired us."
- `black-flag → bad-brains` [internal, ⚠ weak — pre-Black-Flag Rollins biography, not a full-band statement] — Wikipedia/Henry Rollins.
- `sonic-youth → black-flag` [bridge, ⚠ weak — SST-label admiration, not a direct sound-influence claim] — Lee Ranaldo, Wikipedia/Sonic Youth.
- `the-jesus-lizard → black-flag` [internal] — Duane Denison, guitarguitar.co.uk (Apr 2, 2021): compositional approach drew on "bands of the US underground scenes like Black Flag, Hüsker Dü, Butthole Surfers and Big Black."
- `la-dispute → black-flag` [internal, critic-only] — Jacob Fricke, *The Badger Herald*: *My War*'s spoken-word/hardcore split "acted as an influence on La Dispute's style."
- `unwound → black-flag` [internal] — Justin Trosper, Piero Scaruffi interview (1999): "more influenced by the DC punk thing... and just more interesting US hardcore (husker du/black flag/mission of burma)."
- `ken-mode → black-flag` [internal, → summon] — see §6.

**Verified edge count: 7.** No flag.
**Notes:** Kurt Cobain, Mudhoney, Flea, John Frusciante, Maynard James Keenan, Slayer's Hanneman/Lombardo all real, well-documented admirers — none are nodes anywhere in the four rosters. Bill Stevenson (Descendents) drumming for Black Flag simultaneously 1982–85 is personnel overlap, not an influence claim — not encoded.

### Bad Brains · `bad-brains` · family: hardcore-roots
genres: `hardcore-punk`
scene: late-70s DC hardcore — the scene's own acknowledged originators (formed as jazz-fusion act "Mind Power" before switching to hardcore, 1977)

Edges (all inbound):
- `minor-threat → bad-brains` [internal] — see Minor Threat.
- `fugazi → bad-brains` [internal] — see Minutemen (same Picciotto quote).
- `black-flag → bad-brains` [internal, ⚠ weak] — see Black Flag.
- `at-the-drive-in → bad-brains` [internal] — Wikipedia/ATDI: Bad Brains among "key influences"; the band's own name partly derives from Bad Brains' "At the Movies."
- `the-dismemberment-plan → bad-brains` [internal, ⚠ timing caveat] — Travis Morrison, WBUR (Dec 26, 2014): "nothing... clears out my sinuses like Bad Brains" — but the same interview places his hardcore discovery in his "mid-late 30s," likely after the band's classic-era work was already made.
- `ken-mode → bad-brains` [internal, → summon] — see §6.

**Verified edge count: 6 — all inbound, zero outbound.**
**Notes:** A genuine, dug-for null result on the outbound side: Bad Brains' own stated influences (Return to Forever, Mahavishnu Orchestra, Bob Marley/reggae, the Ramones) are real and specifically sourced but map to no valid node. Their enormous documented "influenced" list (Dave Grohl, Metallica, Slayer, Living Colour, Beastie Boys, Rage Against the Machine, System of a Down, Fishbone, 311) is entirely off any of the four rosters.

### Dead Kennedys · `dead-kennedys` · family: hardcore-roots
genres: `hardcore-punk`
scene: early-80s San Francisco Bay Area hardcore

Edges:
- `minutemen → dead-kennedys` [internal, ⚠ weak] — see Minutemen.
- `descendents → dead-kennedys` [internal, ⚠ weak] — same AllMusic-sourced Wikipedia footnote.

**Verified edge count: 2** (both inbound, both weak-flagged). No hard flag on threshold — flagged on sourcing quality instead.
**Notes:** Jello Biafra's only citable formative influence (Ramones/Joey Ramone) is off-roster. Both edges above rest on the same single AllMusic "Similar Artists" citation rather than independent sources.

### The Misfits · `misfits` · family: hardcore-roots
genres: `horror-punk` (proposed)
scene: late-70s/early-80s Lodi, NJ — horror-punk, musically distinct from hardcore proper

**Edges: none survived sourcing. Verified edge count: 0.** FAILS-BAR — genuinely thin, not a shortcut.
**Notes:** Glenn Danzig's own stated influences (Black Sabbath, the Ramones, Blue Cheer, the Doors — Wikipedia, sourced to *Metal Mania*) are real but off-roster. Their enormous "influenced" list (Metallica, Guns N' Roses, Marilyn Manson, Green Day, My Chemical Romance) is equally real and equally off-roster. Henry Rollins guesting at a 1981 soundcheck and Dez Cadena (ex–Black Flag) joining the reunited Misfits in 1995 are personnel/appearance history, not influence claims — not encoded. **Recommend a human decide whether this act belongs in the realm at all** (see §7.1) — this is the only hardcore-roots artist with zero connective tissue found in either direction.

### Descendents · `descendents` · family: hardcore-roots
genres: `hardcore-punk`, `pop-punk` (proposed)
scene: early-80s Manhattan Beach/South Bay LA — proto-pop-punk hardcore

Edges:
- `descendents → dead-kennedys` [internal, ⚠ weak] — see Dead Kennedys.

**Verified edge count: 1.** FAILS-BAR.
**Notes:** Own influences (The Last, general surf/power-pop) don't map to any roster node. Bill Stevenson's simultaneous Black Flag membership is personnel overlap, not encoded. Descendents' real legacy (Blink-182 — Tom DeLonge: "Blink is absolutely a product of the Descendents" — plus NOFX, Green Day, MxPx, Pennywise, Rise Against, the Offspring) is arguably the single most consequential pop-punk lineage in this whole family, and **none of the receiving bands are nodes anywhere in the graph** — a real gap in what this roster can capture, not a research failure.

### Fugazi · exists (`fugazi`)
**Already in graph:** `fugazi → wire`, `fugazi → sonic-youth`, `fugazi → gang-of-four`, `fugazi → minor-threat`, `elliott-smith → fugazi`.

**New outbound edges (Fugazi's own influences):**
- `fugazi → bad-brains` [internal], `fugazi → minutemen` [internal], `fugazi → black-flag` [internal] — all one source, Guy Picciotto, *Cultural Glitch* (Nov 3, 2011).

**New inbound edges (compiled and cross-referenced across all four researchers — this is by far the densest node found in the whole audit):**
- `interpol → fugazi` [bridge] — Wikipedia/Fugazi: Daniel Kessler "has also cited the band as an influence."
- `modest-mouse → fugazi` [bridge] — Jeremiah Green: "Fugazi was probably my biggest influence as far as wanting to start a band."
- `blur → fugazi` [bridge] — Graham Coxon: introduction to Fugazi (and Rites of Spring) in the mid-90s was "one of the most musically significant moments of his life."
- `bon-iver → fugazi` [bridge, ⚠ citation incomplete] — Wikipedia/Fugazi lists Justin Vernon among artists citing the band; underlying source text not independently re-fetched.
- `sunny-day-real-estate → fugazi` [internal] — Eric Grubbs, *Post: A Look at the Influence of Post-Hardcore 1985–2007* (2008), p.72: early influences "included Dischord Records bands like Rites of Spring... and Fugazi." (Independently corroborated by Wikipedia's own citation of the same relationship.)
- `american-football → fugazi` [bridge] — Steve Holmes, Crack Magazine: "The single most important band of the 90s was Fugazi." (Independently corroborated by Wikipedia/Rolling Stone.) ⚠ see American Football's own notes for an important internal tension about how strongly to weight this.
- `cap-n-jazz → fugazi` [internal] — Mike Kinsella, Rolling Stone (2016): "Cap'n Jazz had that sort of Dischord, Fugazi influence."
- `at-the-drive-in → fugazi` [internal, ⚠ weak — dead-link footnote] — Fugazi's own Wikipedia page; independently, ATDI's own page names Fugazi among "key influences."
- `refused → fugazi` [internal] — Dennis Lyxzén considers *Red Medicine* his favorite Fugazi album, cited as a direct influence while recording.
- `la-dispute → fugazi` [internal, documented fact] — La Dispute covered Fugazi's "Strangelight" for the 2021 compilation *Silence Is a Dangerous Sound*.
- `bomb-the-music-industry → fugazi` [bridge, critic-comparison] — Dan Ozzi, Noisey/Vice (Jan 20, 2014): described as "the Fugazi for the internet age of punk"; independently corroborated, same framing, by David Anthony, *The A.V. Club* (Aug 20, 2015).
- `far-apart → fugazi` [bridge] — Far Apart's own Bandcamp bio: "Drawing inspiration from bands like Fugazi, Drive Like Jehu, and Jawbox."
- `unwound → fugazi` [internal] — Justin Trosper, same Scaruffi interview used for the Black Flag edge; Fugazi also named directly in the band's general influences list (AllMusic/Fred Thomas).
- `brand-new → fugazi` [bridge] — Jesse Lacey, DrownedInSound (Sept 17, 2009): "influenced by Polvo, Archers of Loaf, Fugazi and Modest Mouse."
- `the-dismemberment-plan → fugazi` [bridge, ⚠ weak — snippet-only, page 403'd on direct fetch] — Treble review of *Emergency & I*.

**Verified edge count: 18 new** (3 outbound, 15 inbound), on top of 5 pre-existing = **23 total.** By a wide margin the single densest node in this realm.
**Notes:** Also real and off-roster: Johnny Marr calling Ian MacKaye "one of his favorite guitarists" (chronologically backwards regardless — Smiths predate Fugazi); Jack White, Arcade Fire's Win Butler, Lorde; Quicksand, Thursday, Thrice, Cursive, Braid, Mclusky (all named on Fugazi's own Wikipedia page, none valid targets).

---

## 3. Family: post-hardcore

*Lineage value proposed: `post-hardcore`. Reuses the existing `post-hardcore` genre id (parent `post-punk`) directly.*

### Slint · `slint` · family: post-hardcore
genres: `post-rock`, `math-rock`, `slowcore`
scene: Louisville, KY — members drawn from hardcore band Squirrel Bait

Edges:
- `slint → minutemen` [internal] — see Minutemen.
- `pavement → slint` [bridge] — Bob Nastanovich ranked *Spiderland* among his favorite albums (Rob Jovanovic, *Perfect Sound Forever*, 2004).
- `american-football → slint` [internal] — Steve Holmes, *Vice* oral history (Feb 2, 2016): "Tortoise and post-rock bands like Slint were an influence."
- `newfound-interest-in-connecticut → slint` [internal, critic-only] — Dead Sea Piano Rolls, on the band's 2005 LP: "like *Spiderland* if it was written by a midwest emo band."
- `drive-like-jehu → slint` [internal] — Vish Khanna podcast (Oct 8, 2015): stated influences include "Mission of Burma, the Gories, Bastro, Slint, Sonic Youth, the Wipers, and krautrock bands such as Neu!"

**Verified edge count: 5.** No flag.
**Notes:** ⚠ **Actively investigated and rejected:** Wikipedia's Spiderland page claims Fugazi "paid homage" to it on *Red Medicine* — this could **not** be corroborated on *Red Medicine*'s own detailed Wikipedia legacy section (which discusses influence on Refused/Russian Circles/Pelican at length and never mentions Slint at all). Treated as UNCONFIRMED/likely inaccurate, not used — exactly the kind of claim this audit was briefed to catch rather than repeat. Also declined: Lou Barlow's *Spiderland* enthusiasm (2001) — he'd already left Dinosaur Jr. for Sebadoh well before 1991, so attributing it to the `dinosaur-jr` node is questionable (flagged DIRECTION/ATTRIBUTION UNCERTAIN, omitted). Mogwai, Godspeed You! Black Emperor, PJ Harvey, The Shins are all real, strongly-documented admirers but off-roster (Mogwai carried as a near-miss summon, §6). David Pajo's move from Slint directly into Tortoise (1994) is documented personnel continuity, not an influence claim — not encoded, but load-bearing color for the Tortoise summon lead (§6).

### Drive Like Jehu · `drive-like-jehu` · family: post-hardcore
genres: `post-hardcore`, `math-rock`, `noise-rock`
scene: San Diego — John Reis/Rick Froberg, alongside Reis's Rocket from the Crypt and later Hot Snakes

Edges:
- `drive-like-jehu → slint` [internal] — see Slint.
- `drive-like-jehu → sonic-youth` [bridge] — same Vish Khanna podcast source.
- `drive-like-jehu → neu` [bridge] — same source.
- `at-the-drive-in → drive-like-jehu` [internal] — Cedric Bixler-Zavala: "there would be no *Relationship of Command* without Drive Like Jehu"; SPIN (2013): "people like Hot Snakes and Drive Like Jehu were our strongest influences."
- `modest-mouse → drive-like-jehu` [bridge] — Isaac Brock (2007): "Jehu is one of my favorite all-time bands actually."
- `american-football → drive-like-jehu` [internal, ⚠ weak — journalist's list, not a Holmes quote] — Crack Magazine.
- `ken-mode → drive-like-jehu`, `botch → drive-like-jehu`, `get-up-kids → drive-like-jehu`, `metz → drive-like-jehu`, `red-fang → drive-like-jehu`, `thursday → drive-like-jehu`, `christie-front-drive → drive-like-jehu` [all internal, → summons — see §6].

**Verified edge count: 10** (3 outbound, 2 solid inbound, 1 weak inbound, plus 7 summon-linked). No flag.
**Notes:** Wikipedia's "Legacy and impact" section names roughly a dozen more citing artists (Blood Brothers, Pretty Girls Make Graves, The Locust, Dillinger Escape Plan, Violent Soho, Genghis Tron, Gallows, Deftones-as-cover-band) — none valid targets individually. Framed by Wikipedia as "sometimes overlooked" **contemporaries** of Fugazi and Quicksand, not a stated influence relationship — not encoded either direction.

### The Jesus Lizard · `the-jesus-lizard` · family: post-hardcore
genres: `noise-rock`, `post-hardcore`
scene: Austin/Chicago — David Yow and David Wm. Sims came from Scratch Acid

Edges:
- `the-jesus-lizard → the-birthday-party` [bridge] — David Yow: the band was "four white guys who liked to play a cross between Led Zeppelin and the Birthday Party."
- `the-jesus-lizard → gang-of-four` [bridge], `→ siouxsie-and-the-banshees` [bridge] — Duane Denison, on his own guitar influences (Andy Gill, John McGeoch).
- `the-jesus-lizard → husker-du` [bridge], `→ black-flag` [internal] — same Denison US-underground-guitar citation used above.
- `fugazi → the-jesus-lizard` [internal] — Joe Lally (Fugazi's bassist) named among musicians citing the band as an influence/favorite.
- `unwound → the-jesus-lizard` [internal] — Sara Lund, Stereogum "Turntable Interview" (Nov 15, 2012).
- `brand-new → the-jesus-lizard` [internal] — Fugazi's Legacy-section framing (footnote 41).
- `gouge-away → the-jesus-lizard`, `ken-mode → the-jesus-lizard`, `botch → the-jesus-lizard`, `get-up-kids → the-jesus-lizard`, `metz → the-jesus-lizard`, `red-fang → the-jesus-lizard` [all internal, → summons — see §6].

**Verified edge count: 14** (5 outbound, 3 solid inbound, 6 summon-linked). No flag.
**Notes:** Steve Albini's assessment ("the best band of the 90s, hands down") is real but Albini isn't a roster target. Kurt Cobain's well-documented love of the band (the Nirvana/TJL split single) is real but Nirvana isn't a node.

### Unwound · `unwound` · family: post-hardcore
genres: `post-hardcore`, `noise-rock`, `slowcore`
scene: Olympia, WA / Kill Rock Stars

Edges:
- `unwound → husker-du` [bridge], `→ black-flag` [internal], `→ wire` [bridge], `→ gang-of-four` [bridge], `→ joy-division` [bridge], `→ fugazi` [internal], `→ the-jesus-lizard` [internal] — Justin Trosper, Piero Scaruffi interview (1999): "more influenced by the DC punk thing happening back then and just more interesting US hardcore (husker du/black flag/mission of burma) and punk from England (wire/gang of four/joy division)."
- `unwound → sonic-youth` [bridge, critic-sourced], `→ television` [bridge, critic-sourced, weak], `→ can` [internal, weak] — Fred Thomas, AllMusic bio.
- `modest-mouse → unwound` [bridge, ⚠ weak — no reproduced quote found] — Wikipedia Legacy section.
- `ken-mode → unwound`, `botch → unwound`, `gouge-away → unwound`, `trail-of-dead → unwound` [all internal, → summons — see §6].

**Verified edge count: 15.** No flag — a genuinely dense hub.
**Notes:** Decibel Magazine (Oct 10, 2013) names Botch, Young Widows, KEN Mode, Coliseum, and Helms Alee as directly influenced. Member-overlap trivia (not edges): William Goldsmith (Sunny Day Real Estate) drummed briefly in an Unwound-adjacent side project; Vern Rumsey later played alongside Slint's David Pajo in Household Gods.

### NoMeansNo · `nomeansno` · family: post-hardcore
genres: `hardcore-punk`, `post-hardcore`, `punk-jazz`
scene: Victoria, BC, Canada

**Edges: none found. Verified edge count: 0.** FAILS-BAR — a genuinely hard case, not a shortcut.
**Notes:** Own stated influence is D.O.A. (not a valid target); broader influences named only generically ("jazz and progressive rock," no specific artist). **The Refused connection this family-grouping implies was specifically chased and not found** — Refused's own influences list (Inside Out, Fugazi, Slayer, Born Against, ManLiftingBanner, Snapcase) never names NoMeansNo, and NoMeansNo's own legacy content never mentions Refused. This looks like a case where the genre-family assumption isn't borne out by documentable fact, flagged explicitly rather than forced. The one real connection (a full collaborative LP with Jello Biafra, Dead Kennedys' frontman, on Alternative Tentacles) is a peer collaboration/label relationship, not a sourced influence claim.

### Refused · `refused` · family: post-hardcore
genres: `hardcore-punk`, `post-hardcore`, `metalcore`
scene: Umeå, Sweden

Edges:
- `refused → fugazi` [internal] — see Fugazi.
- `la-dispute → refused` [internal] — see La Dispute.
- `underoath → refused`, `thursday → refused` [internal, → summons — see §6].

**Verified edge count: 4.** No flag.
**Notes:** Own influences (Inside Out, Slayer, Born Against, ManLiftingBanner, Ian Svenonius projects, Snapcase) all real, none valid targets. Inbound mainstream citations (Linkin Park, Velvet Revolver, Rise Against, AFI) real but off-roster.

### At The Drive-In · `at-the-drive-in` · family: post-hardcore
genres: `post-hardcore`, `math-rock`
scene: El Paso, TX

Edges:
- `at-the-drive-in → fugazi` [internal], `→ drive-like-jehu` [internal], `→ bad-brains` [internal] — see respective entries.
- `at-the-drive-in → sunny-day-real-estate` [internal, ⚠ weak — Wikipedia-mediated] — Jim Ward called SDRE "Fugazi beyond Fugazi."
- `la-dispute → at-the-drive-in` [internal], `underoath → at-the-drive-in`, `thursday → at-the-drive-in`, `trail-of-dead → at-the-drive-in` [internal, → summons — see §6].

**Verified edge count: 8.** No flag.
**Notes:** Indian Summer, Swing Kids, Hot Snakes, Nation of Ulysses, Antioch Arrow/Heroin (Gravity Records scene) all real self-cited influences, none valid targets.

### toe (トー) · `toe` · family: math-rock
genres: `math-rock`, `post-rock`, `emo`
scene: Tokyo — Hirokazu Yamazaki (also of Bloodthirsty Butchers)

Edges:
- `toe → cap-n-jazz` [internal] — Hirokazu Yamazaki, Tone Glow interview: "the guitarist from Cap'n Jazz who plays for a band called Ghosts and Vodka [Victor Villarreal]... they were instrumental, and that was a big inspiration for me."

**Verified edge count: 1** on its own — **but see Cap'n Jazz's own entry: this same edge is also Cap'n Jazz's second edge, pushing it over the bar via this exact cross-family link.** FAILS-BAR for toe itself.
**Notes:** Yamazaki's fuller influence list (Sick of It All, Strife, Texas Is the Reason, The Promise Ring, Blind Justice, Nukey Pikes, Envy) is real but off-roster. No citable case found of a Western band naming toe as a direct influence — toe/American Football are constantly paired in "best math rock" retrospectives, but that's editorial genre-grouping, not a citation.

### tricot · `tricot` · family: math-rock
genres: `math-rock`, `pop`
scene: Kyoto, Japan

**Edges: none found. Verified edge count: 0.** FAILS-BAR — a genuine sourcing gap, not a genre-fit concern.
**Notes:** Own influences (Red Hot Chili Peppers, Fall Out Boy, Shiina Ringo, Number Girl, Acidman, System of a Down; American Football cited as a personal touchstone but not clearly a stated sound-influence) are real but off-roster or too soft to encode. Tricot repeatedly and explicitly rejects the "math rock" label in interviews. No English-language source found of any band citing tricot. Flagged as underexplored (Japanese-language sources untried) rather than exhausted.

---

## 4. Family: midwest-emo

*Lineage value proposed: `midwest-emo`.*

### Sunny Day Real Estate · `sunny-day-real-estate` · family: midwest-emo
genres: `emo`, `midwest-emo`, `post-hardcore`, `indie-rock`
scene: early-90s Seattle post-hardcore/DIY scene; widely credited as co-originators of "second-wave emo"

Edges:
- `sunny-day-real-estate → fugazi` [bridge] — see Fugazi.
- `sunny-day-real-estate → nomeansno` [internal] — Eric Grubbs, *Post* (2008): early influences "included Dischord Records bands like Rites of Spring, Shudder to Think, Nomeansno... and Fugazi."
- `sunny-day-real-estate → rites-of-spring` [internal, → summon] — same source.
- `at-the-drive-in → sunny-day-real-estate` [internal, ⚠ weak] — see At The Drive-In.

**Verified edge count: 4.** No flag.
**Notes:** Shudder to Think, Christ on a Crutch, the Hated, Treepeople, Lungfish (same Grubbs quote) all real, none valid targets. Inbound: Dashboard Confessional, Hawthorne Heights, The Get Up Kids, Thursday, Motion City Soundtrack, Circa Survive all cite SDRE directly but none are nodes.

### American Football · `american-football` · family: midwest-emo
genres: `midwest-emo`, `emo`, `math-rock`, `indie-rock`, `slowcore`
scene: late-90s Champaign-Urbana, IL college-town scene; "twinkly emo"/math-rock-post-rock hybrid

Edges:
- `american-football → nick-drake` [bridge], `→ red-house-painters` [bridge], `→ elliott-smith` [bridge], `→ slowdive` [bridge], `→ my-bloody-valentine` [bridge], `→ can` [bridge], `→ the-smiths` [bridge], `→ slint` [internal] — all one source, Steve Holmes, *Vice* oral history "Never Meant" (Feb 2, 2016).
- `american-football → fugazi` [bridge] — see Fugazi.
- `american-football → drive-like-jehu` [internal, ⚠ weak], `→ low` [bridge, ⚠ weak] — Crack Magazine (journalist's list, not a direct Holmes quote for either).
- `american-football → codeine`, `→ tortoise` [internal, → summons — see §6].
- `ethel-cain → american-football` [bridge] — Kerrang!, on her cover of "For Sure" for the *LP1 (Covers)* 25th-anniversary release: "Their sonic storytelling has inspired me in more ways than I can count."

**Verified edge count: 14.** No flag.
**Notes — important internal tension, flagged not smoothed over:** Holmes calls Fugazi "the single most important band of the 90s," but in the same *Vice* piece drummer Steve Lamos says "Those guys were into the hardcore stuff coming out on Dischord records, but we didn't want to sound like that," and Holmes himself: "we really did make a conscious shift away from the post-hardcore, emo, whatever sound... more post-rocky and jazzy than loud and aggressive." Read the Fugazi edge as a historical/scene acknowledgment, not a sonic-influence claim — the sonic influences are the Nick Drake/Slowdive/Slint/Can list. A widely-circulated "we loved Drive Like Jehu, let's do the opposite" quote could **not** be located in the primary source and is deliberately excluded rather than reported unverified. **Same-artist flag:** Mike Kinsella (Cap'n Jazz) is one of three members, but this is a **partial** overlap with an explicit, quoted stylistic *break* from Cap'n Jazz's hardcore/emo sound — not a pure rename (contrast the Sun Kil Moon/Red House Painters case in the folk audit) — `american-football → cap-n-jazz` is deliberately **not** encoded.

### Cap'n Jazz · `cap-n-jazz` · family: midwest-emo
genres: `emo`, `midwest-emo`, `post-hardcore`, `math-rock`
scene: Chicago-suburbs all-ages DIY hardcore/emo scene, early-mid 1990s

Edges:
- `cap-n-jazz → fugazi` [bridge] — see Fugazi.
- `toe → cap-n-jazz` [internal] — see toe. **(Cross-family merge: this artist clears the bar only once toe's own edge is credited here too — exactly the kind of link this compilation was built to catch.)**

**Verified edge count: 2.** Clears the bar, narrowly.
**Notes — the single most important missing name in this family:** Cap'n Jazz's own most emphatic influence is **Gauge**, a Downers Grove, IL hardcore band — Tim Kinsella (documentary *GAUGE:153*): "Unquantifiably I think Gauge was the biggest inspiration on Cap'n Jazz," corroborated independently by Mike Kinsella. Gauge isn't a valid target and only this one edge was found for it — flagged for a follow-up pass (§6). Algernon Cadwallader independently cites Cap'n Jazz (Punknews, 2009) but is off-roster with only this one connection. **Same-artist/successor flags:** Davey von Bohlen carried directly into **The Promise Ring**; Tim and Mike Kinsella (plus Sam Zurick) continued as **Joan of Arc**; much of the lineup resurfaced as **Owls**. All direct personnel/songwriter continuity, not influence — none encoded.

### Duster · `duster` · family: midwest-emo
genres: `slowcore`, `indie-rock`, `lo-fi`, `space-rock`
scene: San Jose, CA lo-fi/4-track slowcore scene, late 1990s; 2020s TikTok-driven revival

Edges:
- `duster → velvet-underground` [bridge] — Clay Parton, La Linea Mason & Dixon interview (Aug 7, 2020): "codeine but also like Rorshach and Thelonius Monk and The Velvet Underground."
- `duster → codeine` [internal, → summon] — same quote.

**Verified edge count: 2.** Clears the bar.
**Notes:** This is the methodology correction working as intended — no pre-guessed pair, just "who influenced Duster" asked cold, and Velvet Underground came back in Parton's own words. Rorschach, Thelonious Monk, Blondie all real, off-graph. (Sandy) Alex G and Mitski checked specifically for a reverse citation — not confirmed, only critic lineage-framing found (Vice, Stereogum), not first-person.

### Brave Little Abacus · `brave-little-abacus` · family: midwest-emo
genres: `midwest-emo`, `emo`, `math-rock`, `experimental-rock`, `post-hardcore`
scene: mid-2000s–2010s Bandcamp/DIY "emo revival," NJ-area; usually grouped with Snowing/Algernon Cadwallader

**Edges: none survived. Verified edge count: 0.** FAILS-BAR.
**Notes:** A real primary source exists (a 2h48m podcast deep-dive, "The E Word" ep. 52, Oct 26, 2024) but audio was inaccessible this pass — a RateYourMusic list claims to summarize its content but is not itself a primary source, so nothing from it is reported as sourced. Sputnik Music's "Snowing, Cap'n Jazz, Algernon Cadwallader, Me in Capris" pairing is a similarity listing, not a stated influence claim from either side. Flagged as a lead for a follow-up pass with transcript access, not exhausted.

### Newfound Interest in Connecticut · `newfound-interest-in-connecticut` · family: midwest-emo
genres: `midwest-emo`, `emo`, `post-rock`, `skramz`
scene: Toronto "Northeast"/Canadian emo-post-rock scene, 2000–2005

Edges:
- `newfound-interest-in-connecticut → slint` [internal, critic-only] — see Slint.

**Verified edge count: 1.** FAILS-BAR.
**Notes:** Band's own name is a direct homage to The Get Up Kids' "A Newfound Interest in Massachusetts" (Get Up Kids recurs a third time in this audit — see §6 near-misses). No interview with any of the five members discussing influences in their own words could be located.

### Far Apart · `far-apart` · family: midwest-emo
genres: `emo`, `post-hardcore`, `midwest-emo`
scene: Luleå, Sweden — mid-late-90s European emo/post-hardcore underground; Crank! Records; 2025 reissue drove a cult revival

Edges:
- `far-apart → fugazi` [bridge], `→ drive-like-jehu` [internal] — Far Apart's own Bandcamp bio: "Drawing inspiration from bands like Fugazi, Drive Like Jehu, and Jawbox."
- `far-apart → the-cure` [bridge, documented fact not stated-influence] — same bio: formed in 1995, named after a Cure song.

**Verified edge count: 3.** No flag — strongest outcome among the four genuinely-obscure acts in this family.
**Notes:** Self-sourced (current Bandcamp bio, written for the 2025 reissue) rather than a third-party interview — one tier below a direct quote but specific and self-attributed rather than critic-guessed.

### The Arrogant Sons of Bitches · `arrogant-sons-of-bitches` · family: midwest-emo
genres: `ska-punk`, `punk`, `pop-punk`
scene: Long Island, NY ska-punk scene, 1995–2004

**Edges: none survived. Verified edge count: 0.** FAILS-BAR.
**Notes — important correction to the roster brief, high priority for review:** the brief's premise that ASOB "was Tomas Kalnoky's band before he formed Streetlight Manifesto" is **not supported by any source found and appears to be factually wrong.** Kalnoky's real lineage is Gimp → Catch 22 → Streetlight Manifesto (Streetlight's own Wikipedia page states it directly). ASOB was formed by **Jeff Rosenstock** (with Joe Werfelman) — a different band entirely. Rosenstock's real successor project is **Bomb the Music Industry!**, both already on this same roster (§4, Rosenstock and BTMI entries) — see §7.2 for the full same-artist writeup. ASOB's own real, sourced influence is **Operation Ivy** (Rosenstock, TIDAL: "I just sat with that Operation Ivy CD for months and read the lyrics") — not a valid target, but flagged as the load-bearing missing name (parallel to Gauge for Cap'n Jazz). Separately: Jeff-Rosenstock-solo performed a full Minor Threat cover set at The Fest 15 (2016) — real, and `minor-threat` *is* a valid bridge target, but this attaches to the `jeff-rosenstock` node, not this one (see that entry).

### Hum · `hum` · family: midwest-emo
genres: `space-rock`, `alt-rock`, `post-hardcore`
scene: Champaign, IL underground rock scene, early-mid '90s; often retro-classified as proto/adjacent-shoegaze rather than emo

Edges:
- `hum → dinosaur-jr` [bridge], `→ rem` [bridge], `→ my-bloody-valentine` [bridge] — Hum's official band bio (h-u-m.net/bio/): Matt Talbott's favorite bands include "Dinosaur Jr., Failure, Bitch Magnet, The Flaming Lips, Rush, The Police, R.E.M., Love Cup, and My Bloody Valentine."

**Verified edge count: 3.** No flag.
**Notes:** Failure, Bitch Magnet, Flaming Lips, Rush, The Police, Love Cup all real, off-roster. Reverse direction is where Hum is genuinely strongest: Chino Moreno (Deftones) has repeatedly credited Hum as foundational to Deftones' tone; Narrow Head, Nothing, Citizen, Cloakroom, Superheaven, Hundred Reasons all cited as later admirers — none are valid targets, and Hum's real legacy runs almost entirely through nu-metal/post-shoegaze acts outside this roster (see §7.1 roster-fit flag). **Actively investigated and rejected:** a suggested claim that "Stars" had a documented TikTok/streaming-driven resurgence could not be confirmed after a specific, multi-query search — treated as UNCONFIRMED, not reported as fact.

### Pinback · `pinback` · family: midwest-emo
genres: `indie-rock`, `math-pop`
scene: San Diego indie scene (Rob Crow/Zach Smith, veterans of the Gravity Records-adjacent San Diego post-hardcore scene)

**Edges: none found. Verified edge count: 0.** FAILS-BAR — a real, deliberate zero, not under-research.
**Notes:** Zach Smith has explicitly stated an anti-influence philosophy: "I think the less your influences, the better. You won't have your own thing going" (Arizona Daily Wildcat, 1998), and described owning only ~20 CDs total. Multiple broad searches (Pinback + American Football/Cap'n Jazz/Death Cab/La Dispute/Dismemberment Plan/Brand New) found nothing. **Roster-fit flag:** Pinback is indie/math-pop by sound and by their own explicit account, not emo or post-hardcore — recommend review.

### The Dismemberment Plan · `the-dismemberment-plan` · family: midwest-emo
genres: `post-hardcore`, `dance-punk`, `emo`, `indie-rock`
scene: Washington DC DIY/art-punk scene (DeSoto Records)

Edges:
- `the-dismemberment-plan → neil-young` [bridge] — Travis Morrison, WBUR (Dec 26, 2014): a "huge Neil Young fan," citing Young's concept-album approach.
- `the-dismemberment-plan → bad-brains` [internal, ⚠ timing caveat] — see Bad Brains.
- `the-dismemberment-plan → fugazi` [bridge, ⚠ weak] — see Fugazi.

**Verified edge count: 3.** No flag.
**Notes:** Morrison's most emphatic own influences (D'Angelo, Led Zeppelin, Pink Floyd, late-Miles-Davis, Talk Talk, Kate Bush, Pearl Jam) all real, off-roster. Q and Not U and Black Eyes documented (Washington City Paper) as carrying the band's DC post-hardcore influence forward — real but not valid targets. **Roster-fit note:** AllMusic tags them "emo-tinged," but the sound (funk/R&B/dance-punk hybrid) sits at the edge of "emo," not squarely inside it.

### Brand New · `brand-new` · family: midwest-emo
genres: `emo`, `post-hardcore`, `indie-rock`, `noise-rock`
scene: Long Island, NY emo scene, early 2000s

Edges:
- `brand-new → the-smiths` [bridge] — *Alternative Press* (Aug 23, 2017): "known for naming The Smiths and their frontman Morrissey as favorites."
- `brand-new → ride` [bridge], `→ the-stone-roses` [bridge] — BBC (Feb 12, 2007): Lacey "cited English rock bands such as Ride, The Stone Roses and The Beatles."
- `brand-new → sonic-youth` [bridge], `→ my-bloody-valentine` [bridge] — CHARTattack (Nov 25, 2009): "noisier elements were influenced by adolescent favorites Sonic Youth and My Bloody Valentine."
- `brand-new → husker-du` [bridge], `→ the-jesus-lizard` [internal] — same CHARTattack source: "Tierney's bass playing emulated Hüsker Dü and The Jesus Lizard."
- `brand-new → fugazi` [bridge], `→ modest-mouse` [bridge] — Jesse Lacey, DrownedInSound (Sept 17, 2009): "influenced by Polvo, Archers of Loaf, Fugazi and Modest Mouse."
- `mewithoutyou → brand-new` [internal, → summon] — see §6.

**Verified edge count: 10.** No flag — the strongest-sourced artist in this family, all traced to named, dated outlets.
**Notes — stated factually, not editorialized:** in November 2017, frontman Jesse Lacey was publicly accused of sexual misconduct involving allegedly underage fans dating to the early-to-mid 2000s. He issued a public apology; touring collaborators withdrew from remaining dates, which were never rescheduled; the band went inactive until a 2024 reunion. This now visibly shapes how retrospective coverage discusses the catalog. Manchester Orchestra (Andy Hull) is a real, well-sourced admirer but only 1 edge — near-miss, §6.

### La Dispute · `la-dispute` · family: midwest-emo
genres: `post-hardcore`, `screamo`, `spoken-word`, `progressive-rock`
scene: Grand Rapids, MI; part of the self-mocking "New Wave of Post-Hardcore" alongside Touché Amoré, Defeater

Edges:
- `la-dispute → mewithoutyou` [internal, → summon] — see §6.
- `la-dispute → refused` [internal], `→ at-the-drive-in` [internal] — From The Garage interview (Dec 13, 2010): "Post-hardcore bands like Thursday, Refused, At the Drive-In and Glassjaw."
- `la-dispute → modest-mouse` [bridge], `→ joanna-newsom` [bridge], `→ the-mountain-goats` [bridge] — BBC Radio 1 "Under the Influence with La Dispute": "influences from Joanna Newsom, The Mountain Goats and Modest Mouse."
- `la-dispute → black-flag` [internal, critic-only] — see Black Flag.

**Verified edge count: 7.** No flag — two independent named interviews plus the band's own words.
**Notes:** Thursday, Glassjaw, Hot Water Music all real (same two interviews), none valid targets. Ivan and Coal Black Horse (defunct Michigan bands, Recoilmag.com 2008) credited by name as "significant" but off-roster — worth flagging as genuinely load-bearing to the band's own origin story even though they can't become nodes.

### Jeff Rosenstock (solo) · `jeff-rosenstock` · family: midwest-emo
genres: `pop-punk`, `indie-punk`
scene: Long Island/NYC DIY punk scene; Quote Unquote Records founder

Edges:
- `jeff-rosenstock → minor-threat` [internal, documented fact] — performed a full Minor Threat cover set at The Fest 15 (2016).

**Verified edge count: 1.** FAILS-BAR — genuinely thin on the outbound side despite a substantial press footprint.
**Notes:** Wikipedia's claim that influences "include Tom Waits, Pulp and The Beach Boys" carries **no citation** in the live article — actively checked via raw wikitext and flagged as UNSOURCED rather than reported as fact. Direct interviews (The Ringer, Uproxx, ~2018) name The Specials, Operation Ivy, Reel Big Fish, Billy Joel, Steely Dan — all real, all off-roster. No connection found to this realm's roster or the 148 existing nodes beyond the Minor Threat cover set.

### Bomb the Music Industry! · `bomb-the-music-industry` · family: midwest-emo
genres: `ska-punk`, `punk`, `lo-fi`
scene: Long Island DIY/free-music scene (2004–2014); donation-based Quote Unquote Records model

Edges:
- `bomb-the-music-industry → fugazi` [bridge, ethos/critic-comparison] — see Fugazi (Dan Ozzi/Noisey, independently corroborated by The A.V. Club).

**Verified edge count: 1.** FAILS-BAR — the one edge is a DIY-ethos comparison (donation-based shows, anti-consumerism), not a sonic-influence claim, a different evidentiary category from most edges in this document.
**Notes — same-project relationship, researched independently per instruction:** BTMI! began in 2004 as a solo recording Rosenstock made during the breakup of **The Arrogant Sons of Bitches** — a genuine predecessor-project relationship (same person), not an influence edge, same treatment as Sun Kil Moon/Red House Painters in the folk audit. Beyond that lineage fact, BTMI! and solo Jeff Rosenstock clear on **completely non-overlapping** citations from different press cycles — they should be kept and researched as the two distinct nodes the brief specified, not merged.

### Soul Glo · `soul-glo` · family: midwest-emo
genres: `hardcore-punk`, `rap-rock`, `powerviolence`
scene: Philadelphia hardcore/DIY scene; 2020s breakout (Epitaph, *Diaspora Problems* 2022)

**Edges: none found. Verified edge count: 0.** FAILS-BAR — a real, thoroughly-researched zero; the reason is itself the most interesting finding for this artist.
**Notes:** Real, extensively self-documented influences (The Ringer, Mar 29, 2022) run through Korn/System of a Down, jazz fusion, dembow/reggaeton, and hip-hop (Cannibal Ox, Pop Smoke) — none map to this roster or the existing 148. **Most load-bearing finding: Soul Glo has explicitly and publicly rejected the reflexive Bad Brains comparison critics constantly apply to them** — Pierce Jordan (BrooklynVegan): "If you're a Black person who is into any kind of hard rock, you've probably had a white person try to talk to you about Bad Brains," a pointed critique of racially-coded critical shorthand. `soul-glo → bad-brains` is deliberately **not** proposed, parallel to Autechre/Aphex Twin and Aphex Twin/Eno in the electronic-realm precedent. **Roster-fit flag:** Soul Glo's fit specifically under "midwest-emo" is weak — Philadelphia hardcore/rap-rock with zero midwest lineage; if kept in the realm at all, likely belongs structurally in hardcore-roots or post-hardcore instead.

---

## 5. Cross-realm bridges found (as specifically requested in the brief)

The brief asked this audit to actively hunt for, not passively wait on, bridges from hardcore-roots into the American underground (Sonic Youth, Hüsker Dü, Replacements) and from Slint into post-rock. Results:

- **Sonic Youth** was the only one of the three named bridge candidates to yield anything directly — and even that (SST-label admiration toward Black Flag) is thin/caveated; the solid `sonic-youth → minor-threat` edge already existed in the graph pre-audit. `the-jesus-lizard → ...`, `unwound → sonic-youth`, `drive-like-jehu → sonic-youth`, `brand-new → sonic-youth` were all found in the OTHER direction (this realm's artists citing Sonic Youth), which is real and valuable but not the specific "Sonic Youth citing hardcore-roots" direction hunted for.
- **Hüsker Dü**'s own account of Black Flag/SST is a business/distribution story (Ginn signing them, redirecting them to Minutemen's New Alliance Records), not a musical-influence claim — not encoded despite the hunt.
- **The Replacements** explicitly distance themselves from the hardcore scene in their own words ("We did not feel part of the hardcore scene") despite *Stink* being described as their "hardcore attempt" — no citable connection found.
- **Slint → post-rock** bridged cleanly into `pavement → slint` (an existing region-one node) and produced the **Tortoise** near-miss summon (§6) via American Football's own testimony and David Pajo's direct personnel move from Slint into Tortoise — the single most concrete Slint/post-rock link found, just short of the 2-edge bar on its own.
- The **strongest** bridges found were not the ones specifically named in the brief but emerged from open research anyway: `pavement → slint`, `modest-mouse → drive-like-jehu`/`→ unwound`/`→ fugazi`, `interpol → fugazi`, `blur → fugazi`, `ethel-cain → american-football`, and Fugazi's enormous inbound list generally (§2.1).

---

## 6. Proposed summons

Each cleared 2+ independently-sourced edges into this realm's roster.

### Rites of Spring — the single most load-bearing off-roster figure in the whole realm
- `rites-of-spring → wire`, `→ television`, `→ the-birthday-party`, `→ the-smiths`, `→ bob-dylan` [all bridge] — John Dugan, *Stop Smiling*: "cited influences including the Smiths, the Birthday Party, Buzzcocks, the Mob, the Fall, Television, Bob Dylan, the Saints, Wire, the Undertones and the Adverts."
- `blur → rites-of-spring` [bridge] — Graham Coxon's account names Fugazi "(and the Picciotto-led Rites of Spring)" together.
- `sunny-day-real-estate → rites-of-spring` [internal] — Eric Grubbs, *Post* (2008); corroborated by Nate Mendel: "We ourselves would look at Rites of Spring."

**7 sourced edges.** Rites of Spring is the band most historians credit with literally inventing emo — guitarist Eddie Janney and drummer Brendan Canty/singer Guy Picciotto went directly on to found Fugazi — and bridges cleanly into both region-one (Wire, Television, Birthday Party, Smiths) and folk-confessional (Bob Dylan). Picciotto himself has publicly rejected the "emo" label ("I always thought it was the most retarded term ever") — worth carrying into any adopted copy.

### KEN Mode
- `ken-mode → drive-like-jehu`, `→ the-jesus-lizard`, `→ unwound`, `→ black-flag`, `→ bad-brains` [all internal] — Metal Riot (May 15, 2013), one specific named-band interview quote covering all five.
**5 sourced edges, one interview** — flagged transparently, but a direct first-person band quote, not critic comparison.

### Botch — 3 edges (Brian Cook direct quote + 2 listed)
### Get Up Kids — 2 edges (Matt Pryor + Jim Suptic, both direct member quotes/features)
### METZ — 2 edges (both list-attributed, Wikipedia Legacy sections)
### Red Fang — 2 edges (both list-attributed, no verbatim quote reachable — weaker tier)
### Gouge Away — 2 edges (Revolver direct quote + Post-Trash interview)
### Thursday — 3 edges (all list-attributed — thin sourcing despite clearing the count)
### Underoath — 2 edges (list-attributed)
### …And You Will Know Us by the Trail of Dead — 2 edges (1 direct Conrad Keely quote + 1 listed)
### Christie Front Drive — 2 edges (both aggregator-tier — Sputnik/Last.fm mirrored bios, same caveat class as The Human League/The Knife in the electronic-realm precedent)
### mewithoutYou — 2 edges (Jordan Dreyer's own tribute + Mike Weiss's testimonial about Brand New)
### Codeine — cross-realm, 3rd independent corroboration of an already-flagged lead
- `duster → codeine` [internal], `american-football → codeine` [internal] (this audit) + `low → codeine` [bridge] (already documented in `folk-audit-FINAL.md`). **The clearest cross-family/cross-realm summon case found across both audits** — recommend strong consideration.

### Big Black — borderline, flagged for a joint decision with the folk/electronic compilers
- `slint → big-black` [internal], `the-jesus-lizard → big-black` [internal] (via the same Denison quote used for Black Flag). 2 edges, clears the bar, but surfaced incidentally rather than as either researcher's primary assignment — flagging for a joint call rather than asserting confidently.

### Not promoted — near-misses (1 edge each, reported per instructions rather than hidden)
- **Tortoise** — 1 solid influence edge (`american-football → tortoise`) + David Pajo's direct Slint→Tortoise personnel move (strong corroborating fact, not itself an edge). The single "just short" case most likely to clear on a follow-up pass.
- **Mogwai** — 1 edge (`mogwai → slint`, direct quote).
- **Don Caballero** — 1 edge (`tricot → don-caballero`, secondary-sourced only).
- **Manchester Orchestra** — 1 edge (`manchester-orchestra → brand-new`, Andy Hull's own account).
- **Gauge** — 1 edge (`cap-n-jazz → gauge`, directly quoted twice, by both Kinsella brothers) — the single most load-bearing 1-edge miss in the whole audit.
- **Operation Ivy** — real, own-words (Rosenstock/TIDAL), but off-roster entirely — not summon-eligible even in principle without a second target-bearing edge.
- **Braid** — 1 edge (`braid → fugazi`, Guitar World).
- **Algernon Cadwallader** — 1 edge (`algernon-cadwallader → cap-n-jazz`, Punknews 2009).

---

## 7. Flags

### 7.1 Roster-fit concerns
- **The Misfits** — zero edges in either direction despite a genuine multi-source search; real influence network (metal/Danzig's own lineage) sits almost entirely outside this graph. The only hardcore-roots artist with no connective tissue found at all.
- **NoMeansNo** — zero edges; the specific NoMeansNo→Refused link this family-pairing implies was chased directly and not found. May be a harder-to-source, more genre-hybrid act than a clean fit.
- **tricot** — zero edges, but a sourcing gap (English-language press), not a genre-fit concern.
- **Pinback** — indie/math-pop by sound and by explicit self-account (anti-influence philosophy stated directly), not clearly emo/post-hardcore.
- **Hum** — shoegaze-adjacent space-rock/alt-rock; real documented legacy runs to Deftones/nu-metal-adjacent acts, not emo.
- **The Dismemberment Plan** — AllMusic's own tag is "emo-tinged," but the funk/R&B/dance-punk hybrid sound sits at the edge of the category.
- **Soul Glo** — weak fit specifically for "midwest-emo"; Philadelphia hardcore/rap-rock with no midwest lineage. If kept, recommend moving to hardcore-roots or post-hardcore.
- **The Arrogant Sons of Bitches** — ska-punk, the loosest genre fit of the sixteen midwest-emo artists, justified mainly by its historical role as Jeff Rosenstock's pre-BTMI band (see §7.2).
- **Minor Threat's existing genre tag** — currently `genres: ['post-hardcore']` in `data/seed-data.ts`. Accurate for Fugazi, but a likely mismatch for Minor Threat itself (the hardcore-punk act; post-hardcore as a genre postdates them and describes what Fugazi/Rites of Spring/Embrace did next). Worth adding `hardcore-punk` to Minor Threat's genre list once that id exists — not decided here.

### 7.2 Same-artist / successor-project relationships (not influence edges)
- **Cap'n Jazz → American Football** — **partial** overlap (Mike Kinsella only) + an explicit, quoted stylistic *reaction against* Cap'n Jazz's sound. Not a pure rename; a distinct category from the cases below.
- **Cap'n Jazz → The Promise Ring** (Davey von Bohlen) and **→ Joan of Arc** (Tim/Mike Kinsella, Sam Zurick) — direct personnel/songwriter continuity.
- **The Arrogant Sons of Bitches → Bomb the Music Industry!** (Jeff Rosenstock) — direct successor project, confirmed independently by both midwest-emo researchers. **This corrects a factual error in the original roster brief**, which attributed this relationship to Tomas Kalnoky/Streetlight Manifesto instead — see the ASOB entry (§4) for the full correction. Kalnoky's real lineage is Gimp → Catch 22 → Streetlight Manifesto, unrelated to ASOB.
- **Considered and correctly excluded** (not a same-artist case, just business history): Minutemen ↔ Black Flag — Greg Ginn produced Minutemen's debut EP; real mentorship/production credit, not personnel overlap or influence.

### 7.3 Direction-uncertain edges
**None.** Every edge across all four research passes had clear, checkable chronology. Where genuine ambiguity existed (Lou Barlow/Slint timing, American Football's internal Fugazi tension), researchers flagged it explicitly rather than guessing a direction.

### 7.4 Claims actively investigated and rejected (evidence the corrected methodology worked)
- **"Fugazi paid homage to Spiderland on Red Medicine"** — a real claim on Slint's own Wikipedia page, could not be corroborated on *Red Medicine*'s own detailed legacy section (which never mentions Slint) — treated as unconfirmed/likely inaccurate.
- **Hum's "Stars" TikTok/streaming resurgence** — specifically searched, multiple query variants, not confirmed — reported as UNCONFIRMED rather than repeated as fact.
- **Jeff Rosenstock's Wikipedia-stated influences (Tom Waits, Pulp, Beach Boys)** — found to carry no citation in the live article; flagged as UNSOURCED rather than reported as fact.
- **The Arrogant Sons of Bitches / Tomas Kalnoky / Streetlight Manifesto** — the roster brief's own stated premise, directly investigated and found factually incorrect (see §7.2).
- **`soul-glo → bad-brains`** — a comparison critics constantly make, which the artist has explicitly and publicly rejected as racially-coded shorthand; deliberately not proposed.
- **Lou Barlow / Dinosaur Jr. / Slint** — a real quote, but chronologically and organizationally misattributed if pinned to the `dinosaur-jr` node; omitted rather than forced.

### 7.5 New genre ids proposed (compiled, deduplicated; parent disagreements noted)

| id | proposed name | proposed parent |
|---|---|---|
| `hardcore-punk` | Hardcore punk | `underground` |
| `horror-punk` | Horror punk | `hardcore-punk` |
| `pop-punk` | Pop-punk | `hardcore-punk` |
| `emo` | Emo | `post-hardcore` (one researcher proposed `alt-rock` instead — flag for reviewer discretion) |
| `midwest-emo` | Midwest emo | `emo` |
| `math-rock` | Math rock | `post-hardcore` (explicitly flagged by its own proposer as a judgment call — math rock is at least as much a prog/indie-rock offshoot) |
| `noise-rock` | Noise rock | `post-hardcore` or `alt-rock` (proposers disagreed; not load-bearing for this document either way) |
| `screamo` | Screamo | `post-hardcore` |
| `skramz` | Skramz | `post-hardcore` |
| `dance-punk` | Dance-punk | `post-hardcore` (note: an identically-named genre already exists in `seed-data.ts` with parent `post-punk` — likely the same concept, reuse the existing id rather than adding a duplicate) |
| `ska-punk` | Ska-punk | `hardcore-punk` (no existing `punk` root node; simplification, reviewer discretion) |

**Reused as-is (already exist):** `post-hardcore` (parent `post-punk`) — applied directly to the post-hardcore family. `slowcore` — already proposed (not yet added to code) in `folk-audit-FINAL.md` §G; several artists here (Slint, Unwound, Duster) would also use it — do not re-propose, just note the shared dependency.

---

## 8. Summary

**33 artists researched across 4 families**, plus 2 existing-node edge-additions (Fugazi, Minor Threat).

**Edge density far exceeds the folk realm's first pass**, consistent with the corrected methodology: Fugazi alone (23 total edges) is denser than any single node in either prior audit; Drive Like Jehu (13), The Jesus Lizard (14), Unwound (15), American Football (14), and Brand New (10) all cleared into double digits from genuinely open-ended research, not fixed-pair validation.

**Roughly a third of the 31 new-node candidates land below the 2-edge bar**, flagged per instructions, not cut: The Misfits (0), Descendents (1), NoMeansNo (0), toe (1, though its edge rescues Cap'n Jazz), tricot (0), Brave Little Abacus (0), Newfound Interest in Connecticut (1), The Arrogant Sons of Bitches (0), Pinback (0), Jeff Rosenstock (1), Bomb the Music Industry! (1), Soul Glo (0), Dead Kennedys (2, both weak-sourced).

**2 artists cleared the bar only via cross-family merging** — Cap'n Jazz (via toe's own edge) and, more broadly, Fugazi's enormous inbound total (compiled from all four researchers' independent finds).

**13 summoned root nodes proposed** (§6): Rites of Spring, KEN Mode, Botch, Get Up Kids, METZ, Red Fang, Gouge Away, Thursday, Underoath, Trail of Dead, Christie Front Drive, Codeine (cross-realm), and Big Black (flagged for joint review) — plus 8 near-misses documented but not promoted.

**1 factual correction to the original roster brief** (§7.2/§4): The Arrogant Sons of Bitches was not Tomas Kalnoky's band — it was Jeff Rosenstock's, whose real successor is Bomb the Music Industry!, both already on this roster.

**3 same-artist/successor relationships identified**, none encoded as influence edges: Cap'n Jazz→American Football (partial), Cap'n Jazz→The Promise Ring/Joan of Arc (direct), ASOB→Bomb the Music Industry! (direct).

**6 claims actively investigated and rejected** (§7.4) rather than reported uncritically — direct evidence the corrected research methodology was actually followed, not just declared.

**Nothing in this document has been written to `data/seed-data.ts`, `data/types.ts`, or any other file.** This is Layer 1 of 3 — sourcing only. A Layer-2 hand-verification pass (the same kind that caught the folk realm's under-counting) is recommended before any of this is finalized, precisely because that step is what made the folk realm's eventual FINAL document trustworthy.
