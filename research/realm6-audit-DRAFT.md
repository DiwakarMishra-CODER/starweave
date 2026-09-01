> **Provenance note (added during the citationStatus/rejectedEdges schema pass):** this file was recovered verbatim from this session's chat transcript, not from disk — the original `realm6-edges.md` / `realm6-handoff.md` files referenced throughout the text below were never saved to the repo; they existed only as content pasted inline in a chat message during the american-underground (Realm 6) write pass. This is that pasted content, reconstituted so it stops existing only in a chat log. Everything below this line is the original text, unedited.

---

# Realm 6 — Operation 2: WRITE the new `american-underground` nodes

This is a **WRITE task on pre-sourced research**, not a research task. Every edge below is already sourced in `realm6-edges.md` (the pre-sourced edge file) and `realm6-handoff.md` §4. **Do not re-research. Do not add edges that aren't in those files.**

Read `data/types.ts`, `data/seed-data.ts`, and the pre-sourced edge file FIRST. **Verify every node id and every edge target against seed-data before writing** — the id lists in the research files were working notes, not a fresh read. If an id doesn't match, STOP and report rather than guessing.

No bios, no albums, no songs — content is a separate later pass.

---

## 1. RULINGS — apply these, they resolve the research file's open questions

**1.1 Confidence, not exclusion.** The research file agonised over whether single-source critic comparisons are writable (§14.7). They are — at low confidence. The schema already carries a `confidence` parameter: `inf(source, target, confidence, status, citation)`.

Map the research file's tags to confidence:
- `first-person` (artist said it, quoted) → **high**
- `reported` (publication reports the artist saying it) → **high**
- `critic`, convergent across independent sources → **medium**
- `critic`, single-source → **low**
- `WEAK` → **low**, and note the weakness in the citation text

A first-person quote and a reviewer's stylistic sketch must not end up as identical edges. Put the tier in the citation string so it stays auditable.

**1.2 Bare names in sidebars are still excluded entirely.** The claim-vs-bare-name rule stands. Do NOT mine: AllMusic's *influences panel* (distinct from its prose biography, which IS citable), TV Tropes' *Influences* field, The Student Playlist's *"Influenced by:"* header. ~45 in-graph names across those, several straight contemporaries, one contradicting a recorded artist denial.

**1.3 Frontman name maps to band node.** Iggy Pop → `the-stooges` · Lou Reed → `velvet-underground` · Mark Hollis → `talk-talk` · Bryan Ferry → `roxy-music` (if it ever exists). Put the *person's* name in the citation text so the mapping stays auditable. **This unblocks the two pending Of Montreal edges** (`of-montreal → the-stooges`, `of-montreal → velvet-underground`) from the *DCist* influence list.

**1.4 Non-influence relationship types — do NOT encode as influence edges** (research file §9):
personnel overlap · production credit · shared label · simultaneity/co-presence in a scene · collaboration · covers · praise/fandom · interviewer suggestions.
Before writing, **verify no existing seed-data convention contradicts this.** If the graph already encodes genealogical relationships some other way, report it.

---

## 2. NODES TO WRITE — 29

All get `realm: 'american-underground'`. Lineages: `noise-alt` · `college-rock` · `indie-rock` · `psych` · `neo-psych` — match existing seed-data lineage values if they differ.

### noise-alt
`nirvana` (12 edges) · `sebadoh` (3)

### college-rock
`guided-by-voices` (2 firm) · `wilco` (3) · `sleater-kinney` (2) · `violent-femmes` (4) · `women` (5) · `superchunk` (4)

### indie-rock
`parquet-courts` (5) · `spoon` (6) · `car-seat-headrest` (4) · `the-national` (6) · `destroyer` (5) · `the-walkmen` (3) · `the-white-stripes` (2) · `pulp` (3) · `the-shins` (4)

### psych
`neutral-milk-hotel` (9) · `of-montreal` (5 + 2 unblocked by §1.3) · `the-flaming-lips` (8) · `mgmt` (6) · `grizzly-bear` (2)

### neo-psych
`stereolab` (5) · `beck` (2) · `st-vincent` (4) · `arcade-fire` (4) · `tame-impala` (4) · `king-gizzard-and-the-lizard-wizard` (2) · `vampire-weekend` (5)

### Already researched in the prior handoff — write these too
`animal-collective` (~15 edges, `psych`) · `panda-bear` (`psych`) · `olivia-tremor-control` (`psych`) — edges in `realm6-handoff.md` §4.

---

## 3. DO NOT WRITE

- **`the-apples-in-stereo`** — 0 encodable edges. Its entire E6 relationship set is production, membership and simultaneity (§1.4 categories). Upstream is 100% scope-excluded. Hold.
- **`broken-social-scene`** — 1 edge. Kevin Drew's own "influences" list names frequency work, trees, and his bandmate. Hold.
- **`ween`** — treat as FAILING despite the roll-up table showing 2. Its second and third edges are Prince and the Beatles, **neither in the graph**. In practice 1 in-graph edge. Hold.
- **`the-breeders`** — **HELD for the end-stage pass** (human decision). 2 edges, the second being an indie blog asserting St. Vincent was "inspired by" them; two targeted attempts to firm it up failed. Do not write.

---

## 4. RE-HOME: `galaxie-500` → `folk-confessional`

Write it with `realm: 'folk-confessional'`, lineage `slowcore`, NOT `american-underground`.

Reason: 8 edges, exactly 1 internal to american-underground, and that one arrives via a genre-shadow sentence. Three of its downstream nodes (`low`, `codeine`, `red-house-painters`) already live in folk-confessional, and the `low → galaxie-500` edge is the best-sourced link the node has in either direction. It's a slowcore headwater.

Its edges (from the research file): upstream `→ velvet-underground` [core], `→ big-star` [region-one]. Downstream `low →`, `codeine →`, `red-house-painters →` [all folk], `beach-house →`, `deerhunter →` [region-one], `broken-social-scene →` — **drop the last one, that node isn't being written.**

---

## 5. EDGES TO ACTIVELY DROP OR NOT WRITE

- **`stereolab → olivia-tremor-control`** — chronologically backwards. Stereolab formed 1990 with four albums out before *Dusk at Cubist Castle* (1996). If it exists in seed-data, remove it.
- **`radiohead → olivia-tremor-control`** — same Stereogum sentence, same problem (Radiohead predates OTC). Do not write; remove if present.
- **`stereolab → kraftwerk`** — verified ABSENT across eight results. Gane's krautrock is consistently Faust/Neu!/Can plus Cabaret Voltaire, never Kraftwerk. Do not write.
- **`stereolab → tortoise`** — John McEntire is a *producer*. §1.4.
- **`rem → guided-by-voices`** — direction conflict; keep only `guided-by-voices → rem`. The reverse rests on publisher marketing copy.
- **`car-seat-headrest → sebadoh`** — writable under §1.1 but dropped on counter-evidence: Toledo enumerates his lo-fi debts across seven interviews and never mentions Sebadoh.
- **`mgmt → spacemen-3`** — production (Sonic Boom), not influence. Never write, even if that node appears later.
- **`the-breeders → pixies`** — personnel (Kim Deal). §1.4.
- **Car Seat Headrest denials:** do NOT write `→ pavement`, `→ sonic-youth`, `→ dinosaur-jr`, `→ the-strokes`. Toledo explicitly denies all four.
- **Parquet Courts:** do NOT write `→ pavement`. Savage explicitly denies it.
- **The National:** do NOT write `→ the-strokes` or `→ arcade-fire`. Praise, not influence.
- **Destroyer:** do NOT write `→ gary-numan`. That came from the interviewer's question; Bejar's answer replaced the list.

---

## 6. ARTIST DENIALS — add a data structure for these

Six recorded denials that must be storable, or the next research pass re-proposes all of them off the same critic comparisons and "confirms" them:

| source | rejects | strength |
|---|---|---|
| `parquet-courts` | `pavement` | clean |
| `car-seat-headrest` | `pavement`, `sonic-youth`, `dinosaur-jr`, `the-strokes` | clean, emphatic |
| `destroyer` | `gary-numan` | clean |
| `st-vincent` | `kate-bush` | **contested** — she deflects the lineage framing but is listed elsewhere as influenced |
| `the-national` | `the-strokes`, `arcade-fire` | praise misread as influence |
| `ween` | (Frank Zappa — target not in graph) | clean |

Propose a minimal schema addition (e.g. a `rejectedEdges` array carrying source, target, citation, and `clean` vs `contested`). **Report the proposal before implementing it** — this is a schema change, not a data write. It's also future UI value: "critics claim this, the artist denies it" is content no other music map has.

---

## 7. SUMMONS — write these two

Both clear the bar on first-person-or-near-it edges from unrelated artists.

**`echo-and-the-bunnymen`** — 4 edges: `the-shins →` · `destroyer →` · `arcade-fire →` · `superchunk →`. Place in **`region-one`** (British post-punk spine), not this realm. Citations in the research file's off-map notes per artist.

**`the-modern-lovers`** (Jonathan Richman) — 3 edges: `galaxie-500 →` · `low →` · `violent-femmes →` (uDiscover: the Femmes' acoustic approach partly inspired by them). Placement: **`region-one`** proto-punk roots, alongside Television/Talking Heads/NY Dolls.

**Do NOT summon:** `black-dice` (one citer after three passes) · `kate-bush` (one solid edge plus one contested — the St. Vincent deflection) · Roxy Music, Butthole Surfers, Tom Waits (viable at 2 but deferred) · everything at 1 edge in §11 of the research file.

---

## 8. CITATIONS

Populate the `citation` field on **every** edge — publication + roughly what was said + the tier tag. This realm continues the citations-in-data pattern from emo and post-rock.

Where an edge's citation says "PRE-EXISTING," verify it actually exists in seed-data and leave it alone. Where it says "CARRY-OVER, not re-verified" (`sleater-kinney → liz-phair`, `st-vincent → liz-phair`), write it and mark the citation as needing verification — both targets now exist.

---

## 9. FINISH

- Drop any edge whose target doesn't exist and **log it** for the end-stage bridge pass.
- Run `validateEdges`, then `build:data`.
- **Report:** nodes written per lineage · total edges added · confidence distribution (how many high/medium/low) · **internal vs external edge ratio for `american-underground`, and the same ratio for the other five realms** so we can see whether this realm's gravity genuinely sits elsewhere or whether that was an artefact of counting only outward bridges · any dropped edges · any id mismatches · the `rejectedEdges` schema proposal.

STOP before deploy. No Playwright.# Realm 6 — `american-underground` · Pre-sourced Edge File

**Consolidated. Supersedes the five batch files.**
**33 of 33 artists researched.** ~33 single-artist queries, both directions, every edge cited.

**Nothing written to seed-data. No code run. Edge ids NOT verified against seed-data** — the id list in the brief was working notes. Re-check before writing.

**Direction convention:** `source → target` means **"source was influenced by target."** (Matches the pre-existing `car-seat-headrest → animal-collective`.)

**Tags:** `first-person` = artist said it · `reported` = publication reports the artist saying it · `critic` = a writer's comparison · `WEAK` = source quality insufficient to write on.

---

## CONTENTS
1. Headline findings
1B. Sourcing standard (ruled)
2. Artists — noise/alt (4)
3. Artists — college rock / 90s indie (10)
4. Artists — 00s indie-rock (6)
5. Artists — psych / Elephant 6 (6 + 3 prior)
6. Artists — neo-psych / art-pop (8)
6B. Roll-up — edge counts
7. Fails-bar
8. Zero-internal-edge nodes
9. Rules the research established
10. Artist denials
11. Summon candidates
12. Edges dropped — target doesn't exist
13. Out of scope
14. Open questions
15. State of play — research debt closed

---

## 1. HEADLINE FINDINGS

**Six assumed edges were false, caught by first-person quotes.** The brief's "artist research, not edge validation" method is what caught them. A pair-list approach would have written all six. See §10.

**The single most useful rule to emerge: unsourced sidebar lists are never citations.** Four instances (AllMusic's *influences panel*, TV Tropes' *Influences* field ×2, a blog's *"Influenced by:"* header) contained ~45 in-graph names between them with almost no prose support, several of them straight contemporaries. Ween would have "cleared comfortably" on nothing. AllMusic's *prose biography* remains citable; its panel is a different artefact.

**Three non-influence relationship types kept generating plausible false edges:** personnel overlap, production credit, and shared label. Each hit 5+ times. See §9.

**Predictions that held:** Nirvana is a delta (12 incoming). Neutral Milk Hotel and Stereolab are headwaters. Ween and Women are thin. Galaxie 500 belongs in slowcore.

**Predictions that didn't:** Violent Femmes is dense, not thin. Beck is thin, not dense. The Apples in Stereo has zero encodable edges. Kraftwerk is absent from Stereolab.

---

## 1B. SOURCING STANDARD — **ruled, and applied throughout this file**

**A small source suffices, provided it makes a claim.**

- **WRITABLE:** prose that asserts an influence relationship, regardless of outlet size. A blog sentence saying "Codeine was another Galaxie-influenced slowcore band" is a claim someone can be wrong about. Single-source is fine. Tag the tier; don't discard the information.
- **NOT WRITABLE:** a bare name in a sidebar, infobox or header list with no assertion attached. That isn't a small source, it's not a source.

The distinction is **claim vs. bare name**, not source size. The four excluded lists are kept out for a demonstrable reason: they contain errors. TV Tropes lists Sonic Youth as an Arcade Fire influence. The Student Playlist lists Beck, Yeah Yeah Yeahs, LCD Soundsystem, Animal Collective and of Montreal as MGMT influences — every one a contemporary, not an antecedent. AllMusic's Beck panel lists Nirvana. One of them contradicts a first-person denial already on record. Admitting them would add roughly 45 edges, mostly wrong.

**Effect of the ruling:** `women` 0 → 5 · `the-breeders` 1 → 2 · `wilco` 1 → 3 · `sebadoh` 0 → 3 · `spoon` 4 → 6 · `neutral-milk-hotel` 4 → 7 · `the-walkmen`'s caveat drops. **Fails-bar goes from 7 nodes to 2.** See §7.

**One exception applied by hand:** the ruling makes `car-seat-headrest → sebadoh` writable, and I've **dropped it anyway.** Toledo enumerates his lo-fi debts across seven interviews and never once mentions Sebadoh. That's active counter-evidence, not mere absence.

---

## 2. NOISE / ALT

### `nirvana` — DELTA confirmed
`noise-alt` · grunge, alternative rock, punk · scene `sub-pop`

| edge | type | citation | tag |
|---|---|---|---|
| → `pixies` | internal | *Rolling Stone* 1994 on "Smells Like Teen Spirit": Cobain says he was aiming at the ultimate pop song and was basically trying to rip off the Pixies, and admits it outright. | **first-person** |
| → `sonic-youth` | internal | Live Nirvana archive, Apr 1992: asked who he'd put on a bill, names Mudhoney, Sonic Youth, Pixies or Breeders, Shonen Knife, Jesus Lizard, Melvins. Also NPR's "50 Artists Who Inspired Kurt Cobain." | **first-person** |
| → `dinosaur-jr` | internal | 1992 interview: lists bands he likes — Breeders, Pixies, R.E.M., Jesus Lizard, Urge Overkill, Beat Happening, Dinosaur Jr, Flipper. | **first-person** |
| → `the-breeders` | internal | Same list; plus Wikipedia (sourcing Stereogum 2007) that he named *Pod* an all-time favourite album. | **first-person** |
| → `rem` | internal | Same 1992 list. NPR adds Stipe was set to collaborate with him. | **first-person** |
| → `the-jesus-lizard` | →emo-posthardcore | Same list; also the Apr 1992 festival answer. | **first-person** |
| → `velvet-underground` | →core | Roy Trakin asked about Iggy/Stooges/Velvets/Lou Reed; Cobain affirmed and called it some of his favourite music. | **first-person** |
| → `the-stooges` | →region-one | Same exchange. | **first-person** |
| → `black-flag` | →emo-posthardcore | *Interview* 1991: sold off his hard-rock records and got into MDC and Black Flag. | **first-person** |
| → `swans` | →post-rock-drone-noise | NPR list. | critic |
| → `joy-division` | →region-one | NPR list. | critic |
| → `neil-young` | →folk-confessional | NPR list. | critic |

**Downstream not researched, by instruction** (post-grunge, out of scope). Cobain draws the same line himself: in Apr 1992 he objects to being bracketed with Pearl Jam and calls the surrounding scene false alternative macho metal.
**Off-map upstream:** Melvins (his most emphatic — they lived in Aberdeen and he watched their practices), Vaselines, Beat Happening, Mudhoney (named his favourite band), Tad, The Fluid, Young Marble Giants, Flipper, Scratch Acid, Butthole Surfers, The Raincoats, The Slits, Shonen Knife, Wipers, Meat Puppets, Daniel Johnston, Half Japanese, Killing Joke, Bikini Kill, Earth, Germs, Sex Pistols, MDC, Leadbelly, John Fahey, Leo Kottke, Talulah Gosh.
**12 edges → CLEARS.** Densest upstream node in the realm.

### `the-breeders` — **CLEARS under the §1B ruling, narrowly**
`noise-alt` · alternative rock, indie rock, noise pop · scene `4ad`

| edge | type | citation | tag |
|---|---|---|---|
| `nirvana →` | internal | As above. | **first-person** |
| `st-vincent →` | internal | An indie blog asserts modern indie acts including St. Vincent and Courtney Barnett were inspired by the Breeders. | critic · **low-tier but a prose claim** |

**A targeted query for a better citer failed.** I searched Mitski, Snail Mail and Japanese Breakfast specifically; results returned tour-history and Kim Deal solo-album coverage, nothing linking any of them to the Breeders. So this node clears **on the ruling, not on new evidence** — and its second edge is the weakest thing carrying a passing node in the realm.

**Personnel overlap is not an edge.** Kim Deal from Pixies, Tanya Donelly from Throwing Muses, Britt Walford from Slint. AllMusic hears both parent bands' "shifting dynamics and warped pop sensibilities" on *Pod* — genealogy plus a critic's ear. **No `the-breeders → pixies`.**
**Off-map downstream:** Courtney Barnett, Speedy Ortiz, Lucy Dacus (AllMusic); Olivia Rodrigo and The Prodigy's "S.O.S." sample (out of scope regardless).
**2 edges → CLEARS narrowly**, on the ruling. Two separate attempts to firm up the second edge (via St. Vincent, then via Mitski/Snail Mail/Japanese Breakfast) both came back empty. The downstream is real — AllMusic names three off-graph citers — it simply doesn't intersect this graph.

### `sebadoh` — **CLEARS under the §1B ruling**
`college-rock` (lo-fi) · lo-fi, indie rock, slacker rock

| edge | type | citation | tag |
|---|---|---|---|
| `modest-mouse →` | internal | A music-directory retrospective asserts Sebadoh's lo-fi approach influenced Modest Mouse, Elliott Smith, The Microphones/Mount Eerie and Car Seat Headrest. | critic · **low-tier but a prose claim** |
| `elliott-smith →` | →folk-confessional | Same. | critic · low-tier |
| `mount-eerie →` | →folk-confessional | Same. | critic · low-tier |

**`car-seat-headrest → sebadoh` DROPPED despite being writable.** Same sentence, same tier as the three above — but Toledo enumerates his lo-fi debts across seven interviews (GBV four times, Nirvana, Green Day, TMBG, Jandek, New Pornographers) and never mentions Sebadoh once. **Active counter-evidence beats a low-tier assertion.** The other three have no such contradiction.
A second weak pointer exists — a radio host stating he considers Sebadoh an influence on Neutral Milk Hotel. Direction is odd and it's one person's framing; noted, not written.
Barlow confirms a downstream exists but names nobody (*Dazed* 2009: jokes he influenced a lot of young men making badly recorded love songs; refers to DIY bedroom bands who cite Sebadoh and Dinosaur Jr).
**Personnel overlap is not an edge:** Barlow founded Dinosaur Jr and was pushed out; Sebadoh was the outlet he built instead. **No `sebadoh → dinosaur-jr`.** Deep Wound is genealogy.
**Shared label is not an edge:** he cites the Dischord and Touch and Go *labels*, not artists.
**Contemporaries not forced:** Wikipedia groups Sebadoh with Pavement, Beat Happening and GBV as co-pioneers of lo-fi. Parallel emergence.
**3 edges → CLEARS.** Note this node passes entirely on one low-tier source. If a better citation for the Modest Mouse or Mount Eerie link ever surfaces, it's worth replacing rather than supplementing.

### `galaxie-500` — **CLEARS, WRONG REALM**
`noise-alt` as filed · dream pop, slowcore, indie rock

**Upstream**

| edge | type | citation | tag |
|---|---|---|---|
| → `velvet-underground` | →core | Unanimous across Wikipedia's Slowcore article, Drowned In Sound and Treble — the Velvets' third self-titled album as direct template. DiS calls VU their most immediate influence. | critic (unanimous) |
| → `big-star` | →region-one | Wikipedia Slowcore names formative influences as VU, Modern Lovers, Big Star, Spacemen 3. | critic |

**Downstream**

| edge | type | citation | tag |
|---|---|---|---|
| `low →` | →folk-confessional | DiS Slowcore Week: cited as an influence by Low, specifically for paring down the Velvet Underground and the Modern Lovers. | critic reporting a citation — **strongest edge this node has** |
| `codeine →` | →folk-confessional | Guitar-Muse describes Codeine as another Galaxie-influenced slowcore band. | critic |
| `red-house-painters →` | →folk-confessional | AV Club: helped kick off slowcore, whose sound was defined by Low, RHP, Codeine, Bedhead. | critic — genre-level, weakest |
| `beach-house →` | →region-one | AV Club: *On Fire* cast a wide shadow over Beach House, Deerhunter, Pains of Being Pure at Heart, Broken Social Scene. | critic |
| `deerhunter →` | →region-one | Same. | critic |
| `broken-social-scene →` | internal | Same. | critic |

**RE-HOMING RECOMMENDATION.** 8 edges, exactly **1 internal** — and that one arrives via a genre-shadow sentence, not a citation. Three downstream nodes (`low`, `codeine`, `red-house-painters`) already live in `folk-confessional`, and the Low edge is the best-sourced link the node has in either direction. **Recommend `folk-confessional`.** Second choice: `region-one` dream-pop. Human call.
**Off-map:** Modern Lovers, Spacemen 3.

---

## 3. COLLEGE ROCK / 90s INDIE

### `guided-by-voices`
`college-rock` · lo-fi, indie rock, power pop · scene dayton

| edge | type | citation | tag |
|---|---|---|---|
| → `rem` | internal | Far Out: heavily influenced by contemporaries such as R.E.M.; *Spin*'s 1995 album guide ties the post-lo-fi shift to touring with R.E.M. | critic · **contemporary — flag** |
| `parquet-courts →` | internal | *The L Magazine*, "Inspiration Drills: On the Influence of Guided by Voices and Robert Pollard" — Andrew Savage on GBV's songwriting: melodies that read as simple but aren't, songs that feel like navigating Pollard's brain. | **first-person** (quoted under his pre-Parquet band) |
| `radiohead →` | internal | Grove Atlantic's publisher copy for the authorised GBV biography: P.J. Harvey, Radiohead, R.E.M., the Strokes and U2 have cited Pollard as an influence. | **WEAK — publisher marketing** |
| `rem →` | internal | Same. | **WEAK + DIRECTION CONFLICT** |
| `the-strokes →` | internal | Same. | **WEAK** |
| `car-seat-headrest →` | internal | See §4 — four separate first-person statements. | **first-person** |

**Direction conflict to resolve.** Far Out has GBV influenced *by* R.E.M.; Grove Atlantic has R.E.M. citing Pollard. Both can't be encoded. My read: keep `guided-by-voices → rem` (GBV formed 1983, jangle plus fake English accent; *Spin* ties the shift to the R.E.M. tour) and drop the reverse absent a primary source.
**Rejected:** Encyclopedia.com claims GBV's lo-fi influenced Pavement, the Breeders and Sonic Youth. Chronologically incoherent.
**Off-map:** British Invasion, garage, psych, prog; Pollard's stated ambition to out-write the Beatles (scope-excluded, bio only).
**2 firm + 3 weak → CLEARS** on the Savage and Toledo edges alone.

### `wilco` — **CLEARS under the §1B ruling**
`college-rock` (alt-country→art rock) · alt-country, indie rock, art rock · scene chicago

| edge | type | citation |
|---|---|---|
| `japanese-breakfast →` | →folk-confessional | **PRE-EXISTING** (*Summerteeth*). Not re-verified. |

**Unsourced candidate:** a personal blog hears the Kinks, Pere Ubu, the Minutemen, the Stones, Big Star and Robyn Hitchcock across *Being There* and *Summerteeth*. `minutemen` and `big-star` would both be in-graph. **Not citable.**
**Off-map:** Uncle Tupelo (Tweedy's own prior band — genealogy), Son Volt, Kinks, Stones, Beatles, Beach Boys, Pere Ubu, Robyn Hitchcock, Springsteen, Jonathan Richman, Ray Davies.
**Note for future researchers:** the Brian Eno co-occurrence in NPR results is an All Songs Considered episode featuring both. **Not** a Wilco/Eno connection. The *Kid A* and *Remain in Light* comparisons in reviews are structural analogies.
**1 edge → FAILS.** Fix: Tweedy on the art-rock turn in a real publication, or a folk-realm citer (Big Thief, Fleet Foxes, Kurt Vile, Bon Iver).

### `sleater-kinney`
`college-rock` · punk rock, riot grrrl, indie rock · scene `riot-grrrl` / `kill-rock-stars`

| edge | type | citation | tag |
|---|---|---|---|
| → `sonic-youth` | internal | Band profile: Sleater-Kinney have named their influences as Bikini Kill, Mecca Normal, Bratmobile, Throwing Muses and Sonic Youth. | reported first-person |
| → `liz-phair` | →folk-confessional | **CARRY-OVER** — previously dropped for a missing target; `liz-phair` now exists. Original citation in earlier realm notes. **Not re-verified.** | — |

**Off-map:** Bikini Kill, Mecca Normal, Bratmobile, Throwing Muses; Heavens to Betsy and Excuse 17 are genealogy.
**Downstream:** nothing. The 2024 *Little Rope* press cycle is dominated by Brownstein's bereavement; no lineage content.
**2 edges (1 carry-over) → CLEARS narrowly.**

### `parquet-courts`
`indie-rock` (post-punk revival) · post-punk, indie rock, punk

| edge | type | citation | tag |
|---|---|---|---|
| → `velvet-underground` | →core | *Louder Than War* 2014, Savage by email: says Pavement isn't a big influence and that they share similar influences instead — naming the Velvet Underground, Roxy Music and the Fall. | **first-person** |
| → `the-fall` | →region-one | Same quote. He also references the Fall's own derivativeness accusations ("New Face In Hell") — deep familiarity. | **first-person** |
| → `guided-by-voices` | internal | *The L Magazine* (above). | **first-person** |
| → `television` | →region-one | Grantland 2014 deconstructs the sound: the Velvets' urban grime, Television's spazzy solos, the Fall's rigid repetition, Pavement's ironic detachment, GBV's brevity, Sonic Youth's candy-coated noisiness. | critic |
| → `sonic-youth` | internal | Same Grantland list. Savage separately tells *Tape Op* he hears hip-hop influence in the Fall and Sonic Youth — close listening, not an influence claim. | critic |

**REJECTED: `parquet-courts → pavement`.** On the brief's expected list; the sources contradict it. Savage states directly that Pavement is not a big influence, attributing the resemblance to shared sources. Malkmus's remark that he briefly mistook a Parquet Courts song for his own band is a **third-party comparison**, and Savage's response in *Hot Press* is bemusement. Grantland lists Pavement only inside a critic's deconstruction whose author explicitly warns against that reflex.
**Off-map:** Roxy Music, Beastie Boys (one specific track), Houston hip-hop, the painter John Wesley. A last.fm blurb calls the debut "The Fall meets Neil Young" — a descriptor, and `neil-young` is in-graph, so noted and not encoded.
**5 edges → CLEARS comfortably.**

### `superchunk`
`college-rock` · indie rock, punk rock, noise pop · scene chapel hill / `merge-records`

| edge | type | citation | tag |
|---|---|---|---|
| → `new-order` | →region-one | *Baltimore Sun*: McCaughan on why certain '80s records still resonate, working from "Temptation" and "Bizarre Love Triangle" and then "other '80s influences like Cocteau Twins, Echo and the Bunnymen, or The Cure." | **first-person** |
| → `cocteau-twins` | →region-one | Same. | **first-person** |
| → `the-cure` | →region-one | Same. | **first-person** |
| → `depeche-mode` | →electronic | Songwriters on Process: for *Non-Believers* he listened to '80s new wave and post-punk, bands like Yaz and Depeche Mode from his school days, analysing how space and instrumental density combined. | **first-person** |

**⚠️ Attribution caveat.** All four come from press around **McCaughan's 2015 solo album *Non-Believers***, not Superchunk records. Same songwriter, and the *Baltimore Sun* frames them as his general high-school influences — but if the graph is strict about project boundaries these belong to a solo/Portastatic node that doesn't exist. My call: attribute to `superchunk`, note provenance. Related to Open Question 1.
**Shared label is not an edge.** Merge releases Superchunk, Arcade Fire and Neutral Milk Hotel alike, and *Tape Op* has McCaughan explaining that engineer Howard Bilerman is why Arcade Fire is on the label. This node would otherwise hoover up half the realm.
**Off-map:** Yaz, Bow Wow Wow, Psychedelic Furs (grew up with, went to see), Echo & the Bunnymen.
**Downstream: nothing found** — the Merge story crowds it out of every interview, despite the band's institutional weight.
**4 edges, all bridges out, zero internal → CLEARS comfortably.**

### `spoon`
`indie-rock` · indie rock, post-punk revival, art rock · scene austin

| edge | type | citation | tag |
|---|---|---|---|
| → `wire` | →region-one | *American Songwriter* 2021, Britt Daniel: starting out he was very much into bands like Wire and Talking Heads and was shooting for that kind of lyric; still plays those Wire records to find the spirit. | **first-person** |
| → `talking-heads` | →region-one | Same quote. | **first-person** |
| → `gang-of-four` | →region-one | Encyclopedia.com's Spoon biography (drawing on *Austin Chronicle*): around *A Series of Sneaks* he was listening to and learning from Wire, Gang of Four and Public Image Ltd. | reported first-person |
| → `pixies` | internal | *Rolling Stone* 2025, on touring with the Pixies: describes them as a huge influence on Daniel growing up. | reported first-person |

**Weak candidates not encoded:** a Shmoop page lists the Kinks, Damned, Cure, Pavement, Prince, Pixies, Wire, Beatles, Everlys. `the-cure` and `pavement` would be in-graph. Not citable.
Encyclopedia.com notes he learned about Wire and the Velvet Underground DJing at KVRX — **discovery, not a stated influence.** Would not write `spoon → velvet-underground` on it. A critic compares his literacy to Bowie's; `david-bowie` is in-graph, so that deserves a dedicated check rather than encoding a comparison.
**Off-map:** PiL, Kinks, Damned, Prince, Everly Brothers, Elvis Costello, Motown, ZZ Top, Dale Watson, Jonathan Richman, Springsteen, Ray Davies, *Plastic Ono Band*.
**4 edges → CLEARS comfortably.**

### `violent-femmes` — **brief predicted thin; it's dense**
`college-rock` · folk punk, alternative rock, indie rock · scene milwaukee

| edge | type | citation | tag |
|---|---|---|---|
| → `velvet-underground` | →core | Three routes. uDiscover: Gano's teenage discovery of bands like the Ramones and the Velvet Underground sealed his fate as a rocker. Please Kill Me: the Velvets are named among the band's influences and Reed's influence on Gano's songwriting is called clear, in both its simplicity and disaffected sentiment. A Gano biography: his garage-band covers moved through to Lou Reed and VU songs by 1979. | **first-person + critic, convergent** |
| → `patti-smith` | →region-one | Gano biography: began writing mid-'70s influenced by Lou Reed's vocal stylings, Hank Williams Sr's storytelling and the poetics of Patti Smith's "Babelogue." Names the actual piece. | reported first-person |
| → `ramones` | →region-one | uDiscover, same sentence as the Velvets. | reported first-person |
| → `brian-eno` | →core | Same biography lists Eno among what Gano's older NYC-based siblings exposed him to (with VU, Lou Reed, Patti Smith, Jonathan Richman, the B-52's). | reported · **WEAK source (wiki-scraper)** |
| `the-national →` | internal | *The Scenestar* 2007, Berninger: the bands he first fell in love with were the Smiths, Violent Femmes, Tom Waits and Nick Cave. | **first-person** |

**Nuance to carry in the notes.** Please Kill Me contains a bandmate's counter-testimony — he never once saw Gano put on a Velvets or Lou Reed tape — in the same article that affirms Reed's influence on the songwriting. Both can be true; don't present the Velvets link as uncomplicated.
**Off-map:** **Sun Ra** (Gano: one of the biggest influences on the band, which most people wouldn't know — affecting their approach to music, to the show, and their stretching of tonalities; out by genre and one of the best bio details in the realm), Hank Williams Sr., the Carter Family, Roger Miller, Kris Kristofferson, Captain Beefheart, Nick Drake (Ritchie's "listening to lately"), **Jonathan Richman's Modern Lovers** (uDiscover: the acoustic approach was partly inspired by them), Johnny Thunders' Heartbreakers, the B-52's, Plasticland.
**Not an edge:** the Pretenders discovered them busking in 1981 — career-making, not influence.
**Rejected:** an AllMusic interviewer proposes that the Femmes, Pixies and Cure paved the way for 1991. Interviewer framing, no named citer.
**4 upstream (1 weak) + 1 downstream → CLEARS comfortably.**

### `ween` — **1 in-graph edge; effectively still failing**
`college-rock` · experimental rock, alternative rock, neo-psychedelia · scene new hope, PA

| edge | type | citation | tag |
|---|---|---|---|
| → `velvet-underground` | →core | Berklee interview, Dean Ween on the two record collections that made the band: Aaron had everything from Nina Simone to the first two Velvet Underground records to Richie Havens' *Alarm Clock* to Beefheart — and says those influences together are basically what Ween is. | **first-person**, specific |

**REJECTED — the sidebar rule doing its job.** TV Tropes lists fourteen "Influenced by:" artists, of which **Dead Kennedys, Sparks, The Residents, Butthole Surfers and Devo** are in or near the graph. Zero prose support. **Five plausible edges rejected wholesale.** Without the standing rule this node would have "cleared comfortably" on nothing.
**Off-map:** **Prince** is the dominant documented influence — Dean Ween told *Rolling Stone* he was his John Lennon, that as young kids it was attainable to imitate Prince and once they got better they could actually sound a little like him; the debut has an outright Prince ode. Out by genre. Also the Beatles (Dean: the Beatles without the humour isn't the Beatles at all), Captain Beefheart, Nina Simone, Richie Havens, George Clinton, Led Zeppelin, Pink Floyd, Billy Joel, Allman Brothers, Earth Wind & Fire, Motörhead, Dr. Demento.
**Downstream:** Phish (TV Tropes, unsourced, not in graph). **Stephen Hillenburg cited *The Mollusk* as a major artistic influence on SpongeBob SquarePants** — real and well-attested, but an animator. Bio material, not an edge.
**1 edge → FAILS.** Brief called this correctly: insular in-graph, richly influenced off-graph.

### `women` — **CLEARS under the §1B ruling**
`college-rock` / noise-pop · post-punk, noise rock, art rock · scene calgary

**No first-person influence statements found in 7 results.** Candidates, all critic and all single-source:

| candidate | type | citation |
|---|---|---|
| → `sonic-youth` | internal | Treble: *Public Strain* is "more Sonic Youth or Wire, or perhaps a mutant offspring of The Zombies' gorgeous melodies and This Heat's menacing post-punk." |
| → `wire` | →region-one | Same sentence. |
| → `this-heat` | →post-rock-drone-noise | Same sentence. |
| → `velvet-underground` | →core | A radio-show writeup lists comparisons to Caribou, the Velvet Underground, Deerhoof and Abe Vigoda. |
| → `caribou` | →electronic | Same. |

**Honest verdict.** Five in-graph names from **two sentences in two sources**, and the Treble sentence is a reviewer's stylistic sketch, not a lineage claim. By the standard applied everywhere else — first-person, or critic comparison convergent across independent sources — **this fails.** `this-heat` is the most striking and the one I'd least want to write on one source.
**Personnel succession is not an edge:** Matt Flegel and Mike Wallace formed Preoccupations (initially Viet Cong), routinely called a successor to Women's sound.
**Production is not an edge:** Chad VanGaalen produced both albums.
**Downstream real but entirely off-graph:** the Hecks, Ice Baths, and a message-board subgenre ("Flegel-core" / the "Calgary Sound"). PopMatters quotes their label head calling them a Velvet Underground for the internet age — everyone who saw Women went and started a Bandcamp.
**Bio detail:** Flegel says the only concept for *Public Strain* was to re-record U2's *The Joshua Tree*. It bears no resemblance to it.
**5 edges → CLEARS under the §1B ruling.** All five are writable: each is a prose comparison making a claim, not a bare name in a list. Tag them all `critic / single-source` so the tier is visible.
**The `this-heat` edge is the one to watch.** It's the most specific and most interesting claim about this band — Treble hearing the Zombies' melodies crossed with This Heat's menacing post-punk — and it's also the one where a reviewer's stylistic sketch is most likely to be doing literary work rather than reporting lineage. Writable, but I'd want a second source before treating it as load-bearing for the `post-rock-drone-noise` bridge.

---

## 4. 00s INDIE-ROCK

### `car-seat-headrest`
`indie-rock` (lo-fi/bedroom) · indie rock, lo-fi, power pop

| edge | type | citation | tag |
|---|---|---|---|
| → `guided-by-voices` | internal | Four separate attestations. *Westword* 2016: he was certainly influenced by lo-fi music, like Guided by Voices. *CityBeat*: growing up on '60s music leads you naturally toward '90s lo-fi like GBV, where you can't hear every detail but there's a compelling energy. *DIY* 2016 lists GBV among what paved the way. *Austin Chronicle* frames the project through GBV. | **first-person, repeated** |
| → `nirvana` | internal | *NOW Magazine* 2016, asked directly rather than guessed at: Nirvana and Green Day were his two favourites for a long time, and they shaped his songwriting style specifically because he heard them while learning guitar. | **first-person** |
| → `destroyer` | internal | *Loud And Quiet* 2016 quotes the "Cute Thing" lyric asking to be given Dan Bejar's voice and John Entwistle's stage presence. A named influence inside the songs. | **first-person** |
| → `animal-collective` | internal | **PRE-EXISTING.** | — |

**FOUR REJECTED EDGES — the press assumes them, Toledo denies them.**
*NOW Magazine* asked precisely because every review was guessing:
- **`→ pavement` rejected.** He grew up on the Beatles, the Who, the Kinks and the Beach Boys, explicitly *not* Pavement, Sonic Youth or Dinosaur Jr, and attributes the resemblance to those bands having listened to the same older music he did.
- **`→ sonic-youth` rejected.** Same quote.
- **`→ dinosaur-jr` rejected.** Same quote.
- **`→ the-strokes` rejected, emphatically.** *Westword*: a pet peeve he's heard since 2011; he never really listened to them; a commonality of influence, not descent.

He separately grants the GBV and Pavement *comparisons* are audible — but only GBV converts to a stated influence. **"X sounds like Pavement" should be treated as a red flag, not a lead** — this is the second artist to deny that specific edge.
**Off-map, all first-person:** **They Might Be Giants** (a very helpful teacher for his musical "studies"; he had to boost his listening skills to work out their weird chords and structures), **Jandek** (influenced how he released albums with no artist info), **The New Pornographers** (named alongside GBV as paving the way — reinforces the Destroyer edge), Green Day, Beatles, Who, Kinks, Beach Boys, Pink Floyd, DEVO, Frank Sinatra (via James Kaplan's biography), Ernest Becker's *The Denial of Death*. Jonathan Richman appears as a critic's nod, not his claim.
**Note:** the 60s canon is the *whole* of his self-reported upbringing. Encoding none of it makes his upstream look thinner than it is — worth a sentence in the bio.
**4 edges → CLEARS comfortably.** Also the most useful node in the realm for pruning false edges elsewhere.

### `the-national`
`indie-rock` · indie rock, post-punk revival, chamber rock · scene brooklyn

| edge | type | citation | tag |
|---|---|---|---|
| → `nick-cave-and-the-bad-seeds` | →region-one | *The Scenestar* 2007: the bands he first fell in love with were the Smiths, Violent Femmes, Tom Waits and Nick Cave. Corroborated by Q at Reading 2011 (Waits and Cave top his list) and a 2023 talk on Cave as an inspiration. | **first-person, repeated** |
| → `the-smiths` | →region-one | Same. | **first-person** |
| → `violent-femmes` | internal | Same. | **first-person** |
| → `joy-division` | →region-one | *The Scenestar*: pressed on Ian Curtis comparisons he partly deflects to vocal range, then confirms Joy Division directly and says it's been a big influence on drummer Bryan Devendorf. | **first-person, with caveat** |
| → `nirvana` | internal | Q 2011 via a fan transcription: discusses Nirvana alongside Waits, Cave and the Smiths as the artists he'd named. | first-person, **secondary transcription — verify** |
| → `leonard-cohen` | →folk-confessional | NPR: melancholy rock in the spirit of Joy Division or Leonard Cohen; Far Out frames the literary sensibility as building on Dylan and Cohen. | critic |

**REJECTED — praise misread as influence.**
- **`→ the-strokes`.** His much-quoted line is that the Strokes influenced more bands in ten years than the artists he named did in twenty-five. A claim about *their* importance, not his descent.
- **`→ arcade-fire`.** He calls them hugely influential to aspiring musicians with a direct connection to people's hearts. A compliment about reach. Also chronologically awkward.
- **`→ radiohead`.** He calls them the greatest band in the world because you never know what they'll do next — a model for *how to have a career*, not a sonic influence. Arguable; I'd leave it out.

**Off-map:** **Tom Waits** (co-tops his list across interviews; the biggest absent node for this artist), **The Afghan Whigs** (substantive first-person on Greg Dulli articulating his own dark side without wallowing), Tindersticks, Simon & Garfunkel, Grateful Dead, and via Bryce Dessner's classical work Philip Glass, Steve Reich, Arvo Pärt.
**Bio:** Berninger volunteers that the band has a hard time tracing its own influences because the five members' tastes diverge so widely. A caution against over-encoding.
**6 edges → CLEARS comfortably.**

### `destroyer`
`indie-rock` (art pop) · indie rock, art pop, chamber pop · scene vancouver

| edge | type | citation | tag |
|---|---|---|---|
| → `new-order` | →region-one | *INDY Week*: the interviewer proposes Prefab Sprout, Thomas Dolby and Gary Numan for *ken*; Bejar redirects to something more basic — New Order, the Cure, Echo & the Bunnymen. | **first-person** |
| → `the-cure` | →region-one | Same exchange. | **first-person** |
| → `david-bowie` | →region-one | *Uncut* 2015: classic rock has always been Destroyer's comfort zone and is the music that got him out of the basement and into singing in a band in 1997, and Bowie's "Where Are We Now?" sparked him revisiting the early-'70s records pivotal to him. *DMY*: Bowie was a frequent early comparison because the band had a glam sound. | **first-person** |
| `car-seat-headrest →` | internal | The "Cute Thing" lyric naming Dan Bejar. | **first-person** |
| `japanese-breakfast →` | →folk-confessional | **PRE-EXISTING** (*Kaputt*'s sax). | — |

**Nuance on the Bowie edge.** Bejar *declines* the obvious version: asked in *ALARM* which artists led to *Kaputt*'s funk/electronic turn via a *Station to Station* comparison, he says Bowie sounds uptight on that record and he didn't listen to it or the Berlin albums while making *Kaputt*. **The edge points at early-'70s glam Bowie, not Berlin-era Bowie.** Don't let a bio imply the wrong period.
**REJECTED: `→ gary-numan`.** `gary-numan` is in-graph, and a careless read grabs him from the *interviewer's question*. Bejar's answer replaces that list. **Interviewer suggestions are not artist statements.**
**Personnel overlap is not an edge.** Bejar wrote three songs per album for The New Pornographers across six records and is in Swan Lake. He draws the line himself: he likes singing with the Pornographers but it doesn't reflect him the way Destroyer does, and a song is much more their baby than his.
**Off-map:** Bryan Ferry / Roxy Music (paired with Bowie as his heroes), Echo & the Bunnymen, Prefab Sprout, Thomas Dolby, Sinatra, Springsteen, Wim Wenders' *Until the End of the World*.
**Not encoded:** *Arts Fuse* says he "frequently draws comparisons to" Robyn Hitchcock, Bob Dylan and Lou Reed. `bob-dylan` is in-graph — a live temptation the sourcing doesn't support.
**5 edges → CLEARS comfortably.**

### `the-walkmen`
`indie-rock` · indie rock, post-punk revival, art rock · scene 00s NYC

| edge | type | citation | tag |
|---|---|---|---|
| → `joy-division` | →region-one | AllMusic's band biography names their influences as a diverse set including the Pogues, Joy Division, Bruce Springsteen, Björk, U2 and New Order. | critic / editorial |
| → `new-order` | →region-one | Same sentence. | critic / editorial |
| → `bjork` | →electronic | Same sentence. Unexpected, but stated — and the only route this node has into `electronic`. | critic / editorial |

**⚠️ Single-source warning.** All three come from **one sentence in one AllMusic biography**. AllMusic's prose is citable so these are writable, but there's no first-person corroboration and no independent second source. If the graph has a source-diversity standard, this node doesn't meet it. (See §14 — the same ruling that governs `women`.)
**Candidate not written:** a music blog frames Leithauser's twenties as riding the fumes of a D.C. scene populated by Minor Threat and Bad Brains, and *Westword* has him recalling seeing Nation of Ulysses young. Both in-graph, and tempting — but "riding the fumes of a scene" is **geographic proximity**, and the source is weak. Two emo-posthardcore bridges would materially change this node; worth one query.
**Personnel is not an edge.** Formed from the wreckage of Jonathan Fire\*Eater and The Recoys; Leithauser and Walter Martin are cousins. Leithauser says he deliberately sang "singerly and strong" to *differentiate* from Fire\*Eater's Stewart Lupton — even the plausible influence claim is framed as reaction against.
**Downstream: none, and be careful.** Leithauser names Deerhunter, The Antlers and Vampire Weekend as bands he admires. That's him liking contemporaries; the direction is wrong and it isn't influence either way.
**3 edges, one source → CLEARS with a caveat.**

### `the-white-stripes` — honest report, as requested
`indie-rock` (garage revival) · garage rock, blues rock, punk blues · scene detroit garage

| edge | type | citation | tag |
|---|---|---|---|
| → `the-stooges` | →region-one | *Rolling Stone*, "Blues Genes: 15 of Jack White's Biggest Influences": Iggy Pop is a key idol for White, who anoints the Stooges' *Fun House* the greatest rock and roll record ever made. | **first-person**, major publication |
| → `bob-dylan` | →folk-confessional | *Louder*: White's path to the blues ran through study of the Gun Club, Captain Beefheart, Bob Dylan and Led Zeppelin. | critic-reported |

**It clears 2 — barely, and both point out of the realm. Zero internal edges.** The brief's named risk is what the sources show. White's documented upstream is **overwhelmingly off-graph and off-scope**: the Flat Duo Jets are named first in both *Rolling Stone* and The Conversation's Rock Hall piece and are the most direct model (same guitar/drums/vocals configuration, same rockabilly-blues fusion); then Son House, Blind Willie McTell, Robert Johnson, Leadbelly, Captain Beefheart, the Gun Club, Led Zeppelin, Deep Purple; then the Detroit garage scene — Detroit Cobras, Dirtbombs, Paybacks, Rocket 455, the Go.
The downstream is worse. *Louder* names Gary Clark Jr., Kill It Kid and Fantastic Negrito, and **the article itself calls that influence debatable.** Beck and Laura Marling recorded at Third Man — production, and the wrong direction.
**Recommendation:** defensible on the Stooges edge alone, which is strong and first-person. But it's the thinnest node in the realm, contributes nothing internally, and its centre of gravity is pre-war blues — which the graph excludes by design. **Kept as instructed; flagged for reconsideration.**

### `pulp` — NEW NODE
`indie-rock` (Britpop-era art pop) · britpop, art pop, indie pop · scene sheffield

| edge | type | citation | tag |
|---|---|---|---|
| → `leonard-cohen` | →folk-confessional | *Washington Post* names Scott Walker and Leonard Cohen as Cocker's chief influences and ties his class-conscious existentialism to them. *Hot Press*: Cocker recounts Cohen warning him personally to be careful exploring "these sacred mechanics" in case someone throws a wrench in and neither writes another line. NPR frames Cohen's advice as something he's followed across his career. | **first-person, three publications** |
| → `velvet-underground` | →core | *Hot Press*: Cocker enumerates the influences behind *More*, naming the Beatles, the Velvet Underground and Lisa O'Neill. | **first-person** |
| → `david-bowie` | →region-one | Apple Music's editorial "Pulp: Influences": inspirations run well beyond the Kinks, from ABBA's Swedish disco to the glam-rock strut of Bowie and T. Rex. | critic / editorial |

**Placement note.** The brief's rationale (R1 is the post-punk→shoegaze spine and Pulp isn't that) is sound, but the result is **three edges, all bridges out, none internal.** The Quietus argues that of all the Britpop-lumped bands Pulp's roots were most firmly in the 1980s UK indie underground — which supports *a* British placement more than an American one, though it names no artists. See §8.
**Off-map:** **Scott Walker** (co-named with Cohen as a chief influence; the most important absent node for Cocker's vocal approach), the Kinks, ABBA, T. Rex, the Beatles (scope-excluded — but Cocker's line that it's incalculable how much the Beatles did to encourage ordinary people to be creative is good bio material), Lisa O'Neill, the visual artist Tony Hill.
**Rejected:** Wham! appears as *label advice* — Red Rhino's Tony Perrin telling Cocker he could write commercial songs like them. Not an influence, and it failed anyway.
**3 edges → CLEARS.**

---

## 5. PSYCH / ELEPHANT 6

### E6 shared context — two citations serving five nodes

**The Grammy statement, confirmed verbatim.** Grammy.com's "Inside Elephant 6: 8 Takeaways From A New Documentary" states the collective — part label, part ethos, part art collective, birthing Neutral Milk Hotel, Elf Power, Of Montreal and the Minders — **has inspired acts like Arcade Fire, the Shins, and Tame Impala.** All three are in this realm. **Collective-level, pins to no specific band**, so per the brief these attach to `neutral-milk-hotel`.

**Louisiana House Resolution 35 (2023)** — a legislative commendation, and a better bio citation than expected. Confirms the founding trio (Schneider→Apples in Stereo; Doss, Hart, Mangum→Olivia Tremor Control; Mangum→Neutral Milk Hotel), the Ruston→Athens/Denver geography, and states that although the acts come from many backgrounds they share an interest in 1960s psychedelic pop, **many taking particular influence from the Beach Boys, the Beatles and the Zombies.** That's the scope-excluded upstream, citable to a legislative record. Encode nothing.

Kevin Barnes gives the same first-person (*The Aquarian*): he moved to Athens to find people making music he identified with and fell in with a group doing bedroom recordings who were into the Beatles, the Beach Boys and the Kinks. **Best single quote for the E6 bio.**

### `neutral-milk-hotel` — HEADWATER, **now first-person sourced**
`psych` · indie rock, psychedelic folk, lo-fi · scene `elephant-6`

| edge | type | citation | tag |
|---|---|---|---|
| `arcade-fire →` | internal | **FIRST-PERSON FOUND.** Red Bull Music Academy lecture, Win Butler on Merge's roster: they had *In the Aeroplane Over the Sea*, which is just a complete classic — people will be buying that record every year forever, like the first Violent Femmes record; he says he thought Magnetic Fields and Neutral Milk were about as good as anything, that he didn't know any better songwriters than those guys, and that his dream was to be on Merge. rs500albums adds that Butler has said the primary reason they signed with Merge was this album. Plus Classic Album Sundays, NME's "Roots Of" and the Grammy statement. | **first-person** |
| `the-shins →` | internal | Grammy E6 statement, pinned here. | critic · **double-count warning** |
| `tame-impala →` | internal | Grammy E6 statement, pinned here. | critic · **double-count warning** |
| `bright-eyes →` | →folk-confessional | Named as a citer in three independent retrospectives, each listing Arcade Fire, the Decemberists, Beirut and Bright Eyes together. | critic, convergent |
| `fleet-foxes →` | →folk-confessional | Ball State Daily's 20th-anniversary piece: the album caught the attention of those who would start bands like Arcade Fire, the Decemberists and Fleet Foxes, all of whom are indebted in some way to its sound. | critic |
| `caribou →` | →electronic | A record-shop reissue write-up states the album has been sparking inspiration in its listeners and influencing bands including Arcade Fire, Caribou and even Franz Ferdinand. | critic · **low-tier**, and an unexpected cross-realm bridge |
| `bon-iver →` | →folk-confessional | Music-directory retrospective naming Bon Iver, Sufjan Stevens and Phoebe Bridgers among its citers. | critic · low-tier |
| `sufjan-stevens →` | →folk-confessional | Same. | critic · low-tier |
| `phoebe-bridgers →` | →folk-confessional | Same. | critic · low-tier |

**Double-count warning.** `the-shins` and `tame-impala` each carry another edge sourced to a Grammy/E6-collective statement. If both of their edges to this cluster trace to the *same sentence*, that's one piece of evidence, not two. (Tame Impala's is now resolved — it has independent support via the Flaming Lips. The Shins' is not.)

**RESOLVED — the sourcing gap is closed.** Across five batches this was the realm's most-asserted influence and its worst-*cited*: universally agreed, never quoted. The Red Bull Music Academy lecture fixes it. Butler's statement is unusually strong for this kind of edge — not "we liked them" but a ranking ("about as good as anything… I didn't know any better songwriters") plus a concrete career consequence (signing to Merge because of it). **The realm's key headwater now rests on a first-person primary source rather than a Grammy sentence.**

Note the Merge detail cuts *against* the shared-label rule rather than triggering it: Butler wanted the label **because of the roster**, which is influence expressing itself as a business decision, not a label association manufacturing a resemblance.

One further first-person testimonial, still not written: Classic Album Sundays quotes **Jamey Huggins of Of Montreal** saying he's cried listening to it, still hears new things, and that it can't be heard casually. Suggestive of `of-montreal → neutral-milk-hotel`, but it's one member's listening experience, not a claim about Of Montreal's music. **Flag, don't write.**

**Upstream: in-graph-empty**, as predicted. Mangum's documented influences are the off-map 60s material plus **Tall Dwarfs** (weak source). **Anne Frank's *Diary of a Young Girl*** is the album's central stated inspiration — Mangum first-person in *Puncture* about dreaming of a time machine to save her. Non-musical, unencodable, and the single most important thing about the record. Bio.
**REJECTED:** `guided-by-voices → neutral-milk-hotel` (a radio host's personal view, and backwards — *Bee Thousand* 1994 vs *Aeroplane* 1998). `neutral-milk-hotel → sebadoh` (same host's framing; noted only because it's the second unsourced Sebadoh pointer).
**9 edges → CLEARS comfortably.** Now the second-densest node in the realm and correctly shaped as a headwater: nine downstream, zero in-graph upstream. Also the node with the widest reach — it bridges into `folk-confessional` five times and `electronic` once.

### `of-montreal`
`psych` · indie pop, psychedelic pop, art pop · scene `elephant-6`

| edge | type | citation | tag |
|---|---|---|---|
| → `david-bowie` | →region-one | *DCist*, asked which bands influenced how he makes music, Barnes lists: Bowie, Prince, Kate Bush, Iggy Pop, Lou Reed, John Lennon, Leonard Cohen, Ray Davies, Skip Spence, Patti Smith, Sly Stone, Fairport Convention, George Clinton, Richard Hell, Wayne County, Screaming Jay Hawkins. Corroborated in *The Aquarian* 2025 (Bowie, Kate Bush, Prince as theatrical models). | **first-person, doubly attested** |
| → `patti-smith` | →region-one | Same list. | **first-person** |
| → `leonard-cohen` | →folk-confessional | Same list. | **first-person** |
| → `bob-dylan` | →folk-confessional | *Diffuser* 2015 on *Lousy With Sylvianbriar*: rock-inspired in the late-'60s/early-'70s sense, naming the Flying Burrito Brothers, early-ish Grateful Dead, Bob Dylan and the Stones — what he calls almost outlaw rock and roll. | **first-person**, album-specific |
| → `arca` | →electronic | *Under the Radar* and *The Aquarian*: for *Innocence Reaches* he was inspired by modern electronic music and EDM, citing Chairlift, Arca and Jack Ü — the first time he'd worked from contemporary sources. | **first-person, two publications** |

**`of-montreal → arca` is the most interesting single edge in the realm.** A 1990s E6 psych-pop band citing a 2010s experimental electronic producer — a genuine cross-realm bridge no pair-guessing would propose. Worth checking whether `arca` has other incoming edges from outside `electronic`.
**⚠️ Two edges pending a convention.** Barnes names **Iggy Pop** and **Lou Reed** as individuals; the graph has `the-stooges` and `velvet-underground`. Encoding those requires deciding a frontman's name maps to his band's node. Probably right, but it needs a one-time ruling applied everywhere. See §14.
**Off-map:** Prince, **Kate Bush** (§11), John Lennon, Ray Davies, Skip Spence, Sly Stone, Fairport Convention, George Clinton, Richard Hell, Wayne County, Screaming Jay Hawkins, ABBA, Cyndi Lauper, Annette Peacock, Chairlift, Jack Ü, Flying Burrito Brothers, Grateful Dead, Rolling Stones, Sylvia Plath.
**Bio:** Barnes's influence set **rotates by album** — psych early, Prince/Bowie electro for *False Priest*, late-60s rock for *Sylvianbriar*, EDM for *Innocence Reaches*. If the graph ever wants per-album edges, this is the node that benefits most.
**5 firm + 2 pending → CLEARS comfortably.**

### `the-apples-in-stereo` — **FAILS BAR, structurally**
`psych` · indie pop, psychedelic pop, power pop, neo-psychedelia · scene `elephant-6`

**Zero in-graph edges in either direction.** The brief expected this to clear "on the internal E6 weave alone." **It doesn't — and not because I searched badly.** The E6 weave is the wrong shape to produce influence edges:

- **Production.** Schneider *recorded and produced* Neutral Milk Hotel and Olivia Tremor Control records (Tape Op, SonicScoop, Sound Opinions). He says he was recording Mangum's and Doss's music alongside his own in high school and was as obsessed with his friends' music as his own.
- **Membership.** Wikipedia lists **Jeff Mangum and Bill Doss as past members of The Apples in Stereo.**
- **Simultaneity.** Sound Opinions characterises the three founders as complementary, not sequential — Schneider the pop craftsman, Mangum the soul child, OTC the trippiest. Peers dividing a shared aesthetic.

All three are relationships the graph rules non-edges (§9). An E6 exception would be special-pleading **and** would make the cluster look internally hierarchical when the documentary's thesis is that it wasn't.
**Upstream 100% scope-excluded:** Encyclopedia.com on Schneider's affinity for the melodies of his idols the Beach Boys, Beatles and Kinks and their arrangement/harmony textures; later records add ELO, Michael Jackson, Hall & Oates, 70s Bee Gees, Alan Parsons Project, Motown (SonicScoop, first-person on what he tries to absorb).
**Two options, both human calls:** (1) one downstream query — "who cites the Apples in Stereo" — with MGMT, Tame Impala and Of Montreal the plausible citers. (2) Accept it as a genealogical hub with an explicit rule exception. **I'd try (1) first.** If empty, the honest position is that Apples in Stereo is central to the *scene* and peripheral to the *influence graph* — which is a real and interesting thing for the visualisation to show, not a failure.

### `the-flaming-lips` — the batched-search failure, fixed
`psych` / neo-psych · neo-psychedelia, alternative rock, noise pop · scene oklahoma

| edge | type | citation | tag |
|---|---|---|---|
| → `husker-du` | internal | Coyne, 2013: asked about the bands around them, says not many appealed — Hüsker Dü and Black Flag were the bands that really influenced them in the early days, and they'd go to punk shows and everyone wondered why the long-haired hippies were there. | **first-person, unambiguous** |
| → `black-flag` | →emo-posthardcore | Same quote; also in the Weirdo Music Forever list. | **first-person, doubly attested** |
| → `sonic-youth` | internal | *Weirdo Music Forever*, Coyne: they weren't a normal band, and were very inspired by American punk rock like Sonic Youth, Black Flag, Minutemen and the Replacements — bands they'd go and see. | **first-person** |
| → `minutemen` | →emo-posthardcore | Same quote. | **first-person** |
| → `the-replacements` | internal | Same quote. | **first-person** |
| → `yo-la-tengo` | internal | *Quietus* Baker's Dozen: Coyne's 13 favourite albums include the Beatles, Led Zeppelin, **Yo La Tengo**, Miles Davis and the *Wizard of Oz* soundtrack. | **first-person**, but a favourites list |
| → `olivia-tremor-control` | internal | **PRE-EXISTING.** | — |
| `animal-collective →` | internal | **PRE-EXISTING.** | — |

**Note the shape.** Five of six new edges are hardcore/80s-indie, two of them bridges into `emo-posthardcore`. Filed under `psych`, and the *sound* justifies it — but the *lineage* runs through Black Flag and Hüsker Dü. Coyne says the weirdness was partly reactive: making weird music was both a statement and a reaction against everything they didn't like. **Don't assume a neo-psych band has neo-psych parents.**
**Off-map:** **Butthole Surfers** — Coyne lists them a major influence and inspiration (Pioneer Works, in conversation with Gibby Haynes), noting the Lips didn't have the same guts (§11). Also the Beatles (recurs constantly; Coyne likens Dave Fridmann to their George Martin), Pink Floyd, The Who, Led Zeppelin, Miles Davis, Stravinsky, Tom Jones, Jean Cocteau, *Wizard of Oz*.
**Not encoded:** Fridmann is a producer. Jonathan Donahue (Mercury Rev) played in the band 1989–91. Coyne names Beach House as a current favourite — wrong direction anyway.
**8 edges → CLEARS very comfortably.** Best return on a single query in the project.

### `mgmt`
`psych` / neo-psych · psychedelic pop, synth-pop, indie rock

| edge | type | citation | tag |
|---|---|---|---|
| → `brian-eno` | →core | AllMusic: *Congratulations* contains a song dedicated to two of their heroes, Dan Treacy of Television Personalities and **Brian Eno**. Apple Music's editorial and BrooklynVegan both describe the tracklist as a love letter to their influences, with tracks named for Treacy and Eno; the Eno track is a tribute. There is literally a song called "Brian Eno." | **explicit tribute**, three publications |
| → `david-bowie` | →region-one | The Student Playlist on *Oracular Spectacular*: in love with the bombastic end of 1970s rock — Bowie, Marc Bolan, Fleetwood Mac — alongside acid rock, psychedelia and garage pop. | critic |
| → `new-order` | →region-one | Same site on *Congratulations*, contrasting the albums: the Anglo-European synth pop of New Order, Daft Punk and the Human League had informed *Oracular Spectacular*. | critic |
| → `the-human-league` | →electronic | Same sentence. | critic |
| → `the-flaming-lips` | internal | The Student Playlist lists them among *Oracular*'s influences; Time Out describes *Congratulations* as Flaming Lips-style psych odes. **Caveat below.** | critic |
| → `animal-collective` | internal | **PRE-EXISTING.** | — |

**⚠️ The obvious mechanism is wrong.** **Dave Fridmann produced *Oracular Spectacular* and is the Flaming Lips' longtime producer** — so the resemblance may be a shared producer. Same error as `mgmt → spacemen-3` would be (Sonic Boom of Spacemen 3 produced *Congratulations*). The Flaming Lips edge stands on the critic comparisons alone; **I would not write a Spacemen 3 edge at all.**
**Rejected as a source:** The Student Playlist's "Influenced by:" header lists nineteen artists, ten in-graph — Bowie, Sparks, Suicide, New Order, Flaming Lips, Beck, Yeah Yeah Yeahs, Animal Collective, of Montreal, LCD Soundsystem. **Unsourced, and it mixes real antecedents with straight contemporaries** (Beck, YYYs, LCD, AC and of Montreal were peers). Encoding from it would break the contemporaries rule five times. Flagged so nobody mines it later.
**Off-map:** **Television Personalities / Dan Treacy** (co-hero with Eno, the other half of the tribute), Syd Barrett, Pink Floyd, Daft Punk, T. Rex, Fleetwood Mac, Phil Spector, the Stranglers, Beach Boys, Beatles.
*Under the Radar*: VanWyngarden describes *Congratulations*' inspiration as coming from members of successful psych bands who made solo records and went too far out and never came back. Evocative, names nobody.
**5 + 1 pre-existing → CLEARS.** Needed a second query; the first returned only career/process interviews.

### `grizzly-bear`
`psych` / art pop · indie rock, art pop, psychedelic folk · scene brooklyn

| edge | type | citation | tag |
|---|---|---|---|
| → `talk-talk` | →post-rock-drone-noise | *The Line of Best Fit*, Daniel Rossen's nine favourite songs — framed explicitly as the songs and sounds that have inspired Grizzly Bear, in chronological order, some shared between bandmates in youth. He picks from *Laughing Stock*, says he wanted something from that, *Spirit of Eden* or Mark Hollis's solo record which he loves, and notes Chris Taylor loves it too. | **first-person** |
| → `animal-collective` | internal | **PRE-EXISTING.** | — |

The Line of Best Fit piece is the right *kind* of source — a member walking through what shaped the band. Unfortunately Rossen's other picks traverse classical, jazz, blues, samba, soul and metal, and the named artists (Elvis Presley's *Jailhouse Rock* period, Peter Green–era Fleetwood Mac) are off-map. **Talk Talk is the only in-graph name in a nine-song list.**
**Not encoded:** a fan blog notes Droste's vocal suggests an affinity with former touring partner **Thom Yorke**. `radiohead` is in-graph — a touring relationship plus a critic's "affinity" is not an influence claim. Beach Boys harmonies (Red Bull) are scope-excluded.
**Genealogy/collaboration, not edges:** began as Droste's solo project; Rossen also leads Department of Eagles and has collaborated with Robin Pecknold (Fleet Foxes) and **The National** — both in-graph.
**2 edges → CLEARS narrowly.** The weakest passing node in the group; one downstream query would help.

### Already done before this pass
`animal-collective`, `panda-bear`, `olivia-tremor-control` — findings in `realm6-handoff.md` §4. Not re-researched. **Panda Bear's one-node-or-two question remains open** (§14).

---

## 6. NEO-PSYCH / ART-POP

### `stereolab` — HEADWATER confirmed; one predicted edge doesn't exist
`neo-psych` / avant-pop · post-rock, avant-pop, krautrock-pop, indie pop

| edge | type | citation | tag |
|---|---|---|---|
| → `neu` | →core | *Tape Op* #98, Tim Gane: in the early and mid-'80s he was a big fan of krautrock music — like Faust, Neu! and Can. Corroborated by ele-king: the early records were infused with a gushing enthusiasm for Neu!'s motorik rhythms. | **first-person, corroborated** |
| → `can` | →core | Same *Tape Op* quote. | **first-person** |
| → `faust` | →electronic | Same quote. Also *Electronic Sound*, which dates the epiphany precisely: a 1980 review in *Sounds* of a Faust reissue, which he says knocked him out. | **first-person, two publications** |
| → `cabaret-voltaire` | →electronic | *Electronic Sound*, on why the Faust review landed: he was a big fan of bands like Cabaret Voltaire, so his ears had already been opened to bolder, more experimental electronic music. | **first-person** |
| `mount-eerie →` | →folk-confessional | **PRE-EXISTING** (Exclaim!, Elverum names Stereolab a direct inspiration). | — |

**`stereolab → kraftwerk` — NOT FOUND. Do not write it.** The brief said verify rather than assume; Neu! and Can are confirmed repeatedly, and **Kraftwerk appears in none of eight results** — not in either Tape Op interview, not in Electronic Sound's long-read on his krautrock history, not in Fact, not in the PRS interview. Gane's krautrock is consistently the *rock* wing (Faust, Neu!, Can) and the *industrial-electronic* wing (Cabaret Voltaire), not the synth-pop wing. **The cleanest vindication of the brief's method in the project.**

**⚠️ Direction error in the brief, catch before writing.** The brief lists Stereolab in "OTC's downstream list" via the Stereogum line about OTC's experimentalism being audible in bigger bands including Radiohead, the Flaming Lips, Stereolab and the Shins. **`stereolab → olivia-tremor-control` is backwards** — Stereolab formed in 1990 and had four albums out before *Dusk at Cubist Castle* (1996). Recommend dropping. **The same sentence's Radiohead claim deserves the same scrutiny.**
**Not an edge:** McCarthy is Gane and Sadier's own prior band. Collaborators John McEntire (Tortoise), Jim O'Rourke, Mouse on Mars, Sean O'Hagan are production/collaboration — and `tortoise` is in-graph, so **do not write `stereolab → tortoise`.**
**Off-map:** Neue Deutsche Welle, kosmische, Sky Records, the Residents, Burt Bacharach, yé-yé/French chanson, tropicália, jazz, classical minimalism, radiophonics, Surrealism/Situationism (lyrical). Fact names **Broadcast** as inspired by them — not in graph.
**4 upstream + 1 downstream → CLEARS very comfortably.** The `core` bridges are the most valuable structural edges in the realm.

### `beck` — thinner than predicted
`neo-psych` / art-pop · alternative rock, lo-fi, sampledelia, folk rock

| edge | type | citation | tag |
|---|---|---|---|
| → `sonic-youth` | internal | **Now four independent routes.** *Rolling Stone*'s Mark Kemp, quoted in uDiscover: before he was a midnight vulture, Beck was a subversive folkie inspired equally by Sonic Youth and Mississippi John Hurt. AllMusic's prose: *Stereopathetic Soulmanure* hewed closer to the aural assault of art-minded bands like Sonic Youth. A biography: during his teens Beck discovered the music of Sonic Youth, Pussy Galore and X. Plus the "has cited… Sonic Youth" biography line. | critic, **convergent — incl. Rolling Stone** |
| → `nick-drake` | →folk-confessional | Biography: from the late 1990s he merged his junkyard style with psychedelic rock, electronic music, tropicália, and the music of Nick Drake and Serge Gainsbourg. | critic |

**The follow-up query gained confidence, not edges.** A second pass at the early K-Records / anti-folk period turned the Sonic Youth edge from single-source to convergent-across-four (one of them Rolling Stone), which is a real improvement — but produced **no new in-graph names**, and **still zero downstream citers**. The brief expected "dense both ways"; two well-sourced edges and an empty downstream is the honest answer, not a query artefact after all.
**Not an edge, though tempting:** Calvin Johnson of **Beat Happening** produced *One Foot in the Grave* at his own Dub Narcotic studio and sang on it. That's production plus collaboration. Beat Happening isn't in the graph, and this is its second pointer (Nirvana first-person is the other) — but a production credit doesn't count toward summoning either.
**Rejected as a source:** AllMusic's **influences sidebar panel** lists 25+ names, ten in-graph (Sonic Youth, Talking Heads, Nirvana, Neil Young, Bob Dylan, Kraftwerk, Meat Puppets, Thurston Moore…). **An unsourced sidebar, not prose.** AllMusic's prose biography is citable (it's the sole source for The Walkmen); the panel is a different artefact. See §9.7.
**Not encoded:** Thurston Moore wrote *Odelay*'s deluxe liner-notes essay, and Beck toured Lollapalooza 1995 alongside Sonic Youth, Hole and Pavement. Both corroborate the *affinity*; endorsement and touring aren't influence. Dust Brothers and Nigel Godrich are producers.
**Off-map:** Beastie Boys (repeatedly the template for his hip-hop side; out by genre regardless), Pussy Galore, the Cars, Mantronix, Gary Wilson, Willie Dixon, Big Bill Broonzy, Serge Gainsbourg, tropicália, Os Mutantes, Gram Parsons, Johnny Cash, Prince, James Brown, Run-D.M.C.
**2 edges, both critic-tier → CLEARS by the narrowest margin in the project.** I'd treat this as a bad-query artefact, not the truth about the node. See §15.

### `st-vincent`
`neo-psych` / art-pop · art rock, art pop, indie rock

| edge | type | citation | tag |
|---|---|---|---|
| → `sonic-youth` | internal | *Georgia Straight* 2024: over the years Clark has listed Sonic Youth, Kate Bush, Jimi Hendrix and Siouxsie and the Banshees as invaluable influences. | reported first-person |
| → `siouxsie-and-the-banshees` | →region-one | Same. | reported first-person |
| → `nirvana` | internal | *Guitar Player* (syndicated twice): a Berklee grad inspired to learn electric guitar by grunge acts like Nirvana and Soundgarden. | reported first-person |
| → `liz-phair` | →folk-confessional | **CARRY-OVER**; `liz-phair` now exists. **Not re-verified.** | — |

**The Kate Bush finding — summon candidate downgraded.** The brief noted St. Vincent is cited as a Kate Bush descendant. **Clark contests it.** *Westword* 2010, asked about Tori Amos and Kate Bush comparisons: she loves Kate Bush but doesn't feel she's trying to carry on her tradition, and was probably more influenced by **Stravinsky** on that record. She then discusses "Wuthering Heights" admiringly and technically — the harmony, the bar of fifths in the chorus, how angular it is — and calls it a valuable lesson. Deep admiration, technical study, **and an explicit refusal of the lineage framing.** Meanwhile *Georgia Straight* does list Kate Bush, but that's a journalist's fourteen-year summary. **First case where the evidence is genuinely mixed rather than a clean denial.** See §10, §11.
**`→ the-breeders` did not firm up** — nothing in 7 results connects Clark to Kim Deal.
**⚠️ The largest collaboration trap in the realm.** She recorded *Love This Giant* with **David Byrne**, was a touring member of the **Polyphonic Spree**, performed live with **Sufjan Stevens**, and has collaborated with **Swans**. `talking-heads`, `sufjan-stevens` and `swans` are all in-graph. **Three free edges available by breaking the rule. Held.**
**Also not encoded:** she has *covered* Nine Inch Nails and Lipps Inc. Covers aren't influence, and NIN is out of scope.
**Off-map:** Stravinsky (her own counter-example; quote it in the bio), Jimi Hendrix, Tori Amos, PJ Harvey, Prince, Bowie (the last three are critic comparisons in the same breath as Kate Bush), jazz, country and western, Soundgarden.
**3 firm + 1 carry-over → CLEARS.**

### `arcade-fire`
`neo-psych` / art-pop · indie rock, art rock, baroque pop · scene montreal / `merge-records`

| edge | type | citation | tag |
|---|---|---|---|
| → `talking-heads` | internal | *Maclean's* 2013, Win Butler: New Order and Bowie and Talking Heads are all primal influences for many of them. NME's "Roots Of" independently traces Talking Heads' "This Must Be The Place" into "Wake Up." | **first-person**, uses the word *influences* |
| → `new-order` | →region-one | Same quote. He arrives at it via hearing the Rapture's "House of Jealous Lovers" and noticing it wasn't worlds away from their own "Headlights Look Like Diamonds." | **first-person** |
| → `david-bowie` | →region-one | Same quote; NME traces Bowie's "Queen Bitch" into the early songs; and Butler tells Zane Lowe (*Billboard* 2022) that Bowie shaped "Age of Anxiety II," which borrows Bowie's own "plastic soul" term for his *Young Americans* period. | **first-person, three publications** |
| → `neutral-milk-hotel` | internal | Grammy E6 statement **plus** NME's Roots piece independently naming NMH. | critic, **doubly sourced** |

**Rejected**
- **`→ yeah-yeah-yeahs`.** NME notes "Maps" is a huge Win favourite. A favourite, and direct contemporaries.
- **`→ the-clash`.** NME: big fans, but they treat how the band were "screwed" as a business cautionary tale. Fandom plus a career lesson.
- **`→ neil-young` / `joni-mitchell` / `leonard-cohen`.** NME's framing is that it's impossible for a Canadian songwriter to avoid these three — the journalist generalising about nationality. All three in-graph, so a tempting three-for-one the sourcing doesn't support.
- **The TV Tropes list** — thirteen influences, eleven in-graph. Unsourced wiki sidebar. Rejected wholesale.

**⚠️ Careful with the Bowie relationship.** Bowie was an early fan, attended their first NY headlining show with David Byrne, guested on "Reflektor," and Butler led a memorial parade for him. **Friendship and collaboration — separate from the influence claim**, which stands on *Maclean's* and NME independently. Same for Byrne, Springsteen and U2 as fans.
**Off-map:** **Echo & the Bunnymen** (*Ocean Rain*, part of Butler's "unholy amount of B's" — Bowie, Bono, Brecht, Byrne, the Bunnymen — see §11), U2/Bono, Brecht, Springsteen, Terry Gilliam, and significantly **Haitian music**: Régine Chassagne grew up on kompa and voodoo lullabies, and exposure to rara street music and voodoo drumming shaped *Reflektor*. The largest off-map influence on this node. Bio.
**4 edges → CLEARS comfortably.**

### `tame-impala`
`neo-psych` · neo-psychedelia, psychedelic pop, psychedelic rock · scene perth

| edge | type | citation | tag |
|---|---|---|---|
| → `the-flaming-lips` | internal | Far Out on Parker's psychedelic roots: he takes huge inspiration from the Flaming Lips, quoting him to *Entertainment Weekly* that he was a fanboy first and they later became good friends, which he finds strange to look back on. | **first-person** |
| → `my-bloody-valentine` | →region-one | A pop-music retrospective reports Supertramp, the Beatles, Pink Floyd, Daft Punk and My Bloody Valentine as sources of inspiration, noting he's particularly enthusiastic about MBV's wall of sound. | reported · **mid-tier source** |
| → `animal-collective` | internal | **PRE-EXISTING.** | — |
| → `neutral-milk-hotel` | internal | Grammy E6 statement. | critic |

**Double-count risk resolved** — the Flaming Lips edge is independent of the Grammy sentence, so this node no longer depends on it.
**⚠️ The Fridmann trap, third occurrence.** **Fridmann mixed *Lonerism***, produces the Flaming Lips, and produced MGMT's *Oracular Spectacular*. Part of the audible Tame Impala/Flaming Lips resemblance is plausibly a shared engineer. **The edge survives only because Parker's fanboy statement is independent of the production link.** Three nodes now sit inside one engineer's orbit.
**Parker's own caveat, for the bio.** He credits the influence of everything he's ever heard including things he wasn't aware were influencing him, offering the Beatles and Britney Spears as examples — while admitting he's never listened to a full album by either. An unusually candid warning against over-weighting any single Parker influence claim.
**Off-map:** **Todd Rundgren** (the most specific claim available — he named *A Wizard, A True Star* a prime influence around *Lonerism*, and Rundgren later remixed "Elephant"), **Air**, Supertramp (he laughingly assents to a *Spin* interviewer's comparison — assent, not a claim), Beatles, Pink Floyd, Cream, Daft Punk, Britney Spears, Kylie Minogue, Emitt Rhodes, Prince, Stevie Wonder. Pond shares most of the touring membership — personnel.
**4 edges → CLEARS.**

### `king-gizzard-and-the-lizard-wizard`
`neo-psych` · psychedelic rock, garage rock, progressive rock · scene melbourne

| edge | type | citation | tag |
|---|---|---|---|
| → `kraftwerk` | →core | Loudwire / *Full Metal Jackie*: the host says "You mentioned Kraftwerk and Devo, that type of thing definitely has influenced Gizz a lot over the years and I think found its way into the sound of this record." Mackenzie raised the names; the host supplied the influence framing. | **mixed** |
| → `bob-dylan` | →folk-confessional | Radio Milwaukee, Mackenzie on *Flight b741*'s layered influences: the obvious ones are the Band, Dylan, Steve Miller, CCR, early-'70s Stones, even the Faces and the Who, probably T. Rex. | **first-person** |

**A nice irony:** Kraftwerk was the one predicted Stereolab edge that didn't exist. It shows up here instead.
**⚠️ Scope concern.** The scope-guard says metal is out, but metal is a *stated formative influence* here — Mackenzie says several of them, himself included, very much grew up on heavy metal and it completely altered the way they thought about music, and *Infest the Rats' Nest* (2019) is a straight thrash album. Not downstream creep; it's in the node's own lineage. The node clears on two non-metal bridges so nothing needs encoding — but **King Gizzard's bio can't be told honestly without a genre the graph excludes.** Worth a deliberate decision rather than silence.
**Off-map:** the Band, Steve Miller, CCR, Rolling Stones, the Faces, the Who, T. Rex, Devo, heavy metal, Turkish/microtonal and North African music. Kyuss and Sleep are the *Tape Op* writer's reference points. The Grateful Dead comparison in Relix is about onstage configuration.
**2 edges, zero internal → CLEARS narrowly.**

### `broken-social-scene` — **FAILS BAR**
`neo-psych` / art-pop · indie rock, chamber pop · scene toronto

| edge | type | citation |
|---|---|---|
| → `galaxie-500` | internal | **PRE-EXISTING** (AV Club). |

**Nothing else, and the reason is almost funny.** Kevin Drew released a 2021 album *literally titled* **Influences** and did a Brooklyn Vegan "top 10 influences" feature for it. The list is: frequency work, trees, and his own bandmate Charles Spearin. Not one external artist.
The closest thing to lineage in 7 results: FLOOD notes that Drew and Spearin, in their pre-BSS band KC Accidental, found safety and inspiration in the **early Thrill Jockey and Drag City catalogs**. **Label-level, not artist-level** — and Thrill Jockey is Tortoise's label, `tortoise` is in-graph, making it the same shared-label error as Superchunk/Merge.
**The personnel trap is severe here.** A collective of 20+ credited contributors including Feist, Emily Haines and Amy Millan (none in graph), and Drew's own framing is entirely membership — he never thought the doors should close, and describes trying the taste of this person and that person. Lou Reed appears in a Stereogum anecdote list.
**1 edge → FAILS.** Fix: a downstream query; Grizzly Bear and Arcade Fire are plausible in-realm citers.

### `the-shins`
`indie-rock` (psych-pop) · indie rock, indie pop, psychedelic pop · scene `sub-pop`; E6-adjacent by affinity

| edge | type | citation | tag |
|---|---|---|---|
| → `olivia-tremor-control` | internal | **PRE-EXISTING** (Stereogum: OTC's experimentalism audible in bigger bands including Radiohead, the Flaming Lips, Stereolab and the Shins). | critic |
| → `the-cure` | →region-one | *Montana Kaimin* 2017, Mercer on what still shapes the records: bands he loved in high school — Echo and the Bunnymen, the Cure, the Smiths. | **first-person** |
| → `the-smiths` | →region-one | Same quote. | **first-person** |
| → `neutral-milk-hotel` | internal | Grammy E6 statement. **Double-count caution** — may trace to the same evidence as the OTC edge. | critic |

Mercer's appearance in the Elephant 6 documentary as a notable fan is bio colour reinforcing the OTC edge, not a second citation.
**Off-map:** **Echo & the Bunnymen** (his most emphatic name, §11), **Ariel Pink** (he describes an attitude influence from falling for Ariel Pink's music over six years — a strong first-person statement), the Carpenters ("Top of the World" as his earliest musical memory), ABBA, Beatles, Pink Floyd. His *Line of Best Fit* Nine Songs list is heavily classic-pop and mostly off-map, but is where to look for more.
**3–4 edges → CLEARS.**

### `vampire-weekend` — **Talking Heads root now confirmed**
`neo-psych` / art-pop · indie rock, afropop-influenced, art pop · scene 00s NYC / Columbia

| edge | type | citation | tag |
|---|---|---|---|
| → `belle-and-sebastian` | →region-one | LSQ podcast (2024), Koenig on his "mega favourites": the host notes they have a few in common — the Kinks and Belle and Sebastian among those he talks about. | **first-person** (favourites episode) |
| → `radiohead` | internal | Same: his tastes shifted from 50s/60s oldies-radio pop into discovering Scott Walker, Neil Young, 90s hip-hop and early-aughts Radiohead. | **first-person** (formative discovery) |
| → `neil-young` | →folk-confessional | Same. | **first-person** |
| → `talking-heads` | internal | **CONFIRMED on a second query.** Earwolf's *U Talkin' U2 To Me?* / Scott Aukerman archive: Koenig appears as a guest to discuss Talking Heads' *True Stories*, and the episode covers when he first heard of Talking Heads, the moment he realised Talking Heads were punk, and **how Talking Heads influenced him as a musician.** | **first-person**, via episode summary |
| → `animal-collective` | internal | **PRE-EXISTING.** | — |

**On the Talking Heads edge — how it was nearly written wrong.** The brief keeps this node partly on "roots: Talking Heads," and the first query found only a *press cliché*: *Westword* (2008) describes the Q&A as covering "repetitious comparisons of the Weekenders' self-titled debut album to previous recordings by Talking Heads and Paul Simon." That's the Pavement pattern — the most-repeated comparison, flagged as repetitious. **The edge is real, but the source that makes it real is Koenig spending an hour on the record himself, not the comparison every reviewer reached for.** Worth writing the citation to the podcast, not the Westword line.
**Related caution:** Variety notes the international press compared them to **the National and Animal Collective** in the 2000s. Both in-graph, both contemporaries — and it raises the question whether the pre-existing `vampire-weekend → animal-collective` edge itself rests on a press comparison. **Worth checking its original citation.**
**Note:** three of the four edges above rest on a single podcast episode description. Thinner sourcing than the "CONFIRMED IN" status implies.
**Off-map — and the second query surfaced the real answer to "what shaped this band."** Far Out (2024), Koenig naming his fundamental British influences: he remembers thinking and talking a lot about **Squeeze, Elvis Costello and XTC**, says there always was this English thing, and that like any good American music fan he grew up on so much English music. He singles out Squeeze as an amazing songwriting team whose lyrics he's always loved. **None of the three is in the graph** — so the most emphatic first-person influence statement Koenig has given is entirely unencodable. Worth recording prominently in the bio; the graph will otherwise imply his roots are American indie when he says they're English new wave.
Also off-map: afropop / worldbeat (the defining sonic influence), Paul Simon, the Kinks, Scott Walker, M.I.A., Souls of Mischief, 90s hip-hop, dancehall, smooth jazz, John Lennon, ska, Caribbean fusion, classical (Rostam: he thought it would be interesting to play classical music on rock instruments), the poet Derek Walcott.
**Not encoded:** a crossover Earwolf episode covers *Father of the Bride* "and all things R.E.M." `rem` is in-graph, but a podcast *topic* is not an influence claim.
**Bio:** Koenig — "The basis of our whole band is not playing modern rock."
**5 edges → CLEARS.** Three of the five still rest on podcast episode descriptions, which is thinner than "CONFIRMED IN" implied, but the Talking Heads edge is now solid.

---

## 6B. ROLL-UP — edge counts after the ruling

**Clears the 2-edge bar: 30 of 33.**

`nirvana` 12 · `neutral-milk-hotel` 9 · `galaxie-500` 8 (**wrong realm**) · `the-flaming-lips` 8 · `the-national` 6 · `mgmt` 6 · `spoon` 6 · `parquet-courts` 5 · `destroyer` 5 · `of-montreal` 5 (+2 pending §14.6) · `stereolab` 5 · `women` 5 · `vampire-weekend` 5 · `car-seat-headrest` 4 · `arcade-fire` 4 · `tame-impala` 4 · `st-vincent` 4 · `violent-femmes` 4 · `superchunk` 4 · `the-shins` 4 · `wilco` 3 · `sebadoh` 3 · `the-walkmen` 3 · `pulp` 3 · `sleater-kinney` 2 · `grizzly-bear` 2 · `king-gizzard` 2 · `the-white-stripes` 2 · `the-breeders` 2 · `guided-by-voices` 2 firm

Plus `animal-collective`, `panda-bear` and `olivia-tremor-control` from the prior handoff (not re-researched).

**Movement from the ruling and the follow-up queries:** `neutral-milk-hotel` 4→9 · `women` 0→5 · `spoon` 4→6 · `vampire-weekend` 4→5 · `the-shins` 3→4 · `wilco` 1→3 · `sebadoh` 0→3 · `the-breeders` 1→2.

---

## 7. FAILS-BAR — **2 nodes** after the §1B ruling

| artist | edges | nature |
|---|---|---|
| `the-apples-in-stereo` | 0 | **Structural, and the ruling doesn't help.** Its entire E6 relationship set is production, membership and simultaneity — categories excluded on grounds of *type*, not source quality. Upstream is 100% scope-excluded. Needs a downstream query or a data-model exception. |
| `broken-social-scene` | 1 | **Structural too.** Kevin Drew released an album titled *Influences* and named frequency work, trees and his own bandmate. The only lineage-adjacent material is label-level (Thrill Jockey, Drag City). Nothing for the ruling to admit. |

**Resolved by the ruling:** `sebadoh` 0 → 3 · `the-breeders` 1 → 2 · `wilco` 1 → 3 · `women` 0 → 5 · `ween` 1 → 2.
**Resolved by new evidence:** `neutral-milk-hotel` 4 → 9 (Win Butler first-person) · `vampire-weekend` 4 → 5 (Talking Heads confirmed) · `beck` unchanged at 2 but now convergent.

**Note that the two remaining failures are the two where the problem was never sourcing.** Both fail on *relationship type* — collaboration and co-presence in a scene — which is exactly the distinction §9 exists to protect. That's a reassuring result: loosening the source standard cleared out the research artefacts and left only the genuine structural cases.

**`ween` under the ruling:** TV Tropes remains excluded (bare-name sidebar, §1B), but the Quietus prose does make a claim — Dean Ween citing the Beatles as a key Ween influence who balanced humour and sincerity better than Zappa. The Beatles are scope-excluded, so that doesn't help. It reaches 2 via the Velvet Underground edge plus the *Avocado* prose claim that Gene and Dean cite **Prince** as one of their biggest influences — and Prince isn't in the graph either. **Ween in practice stays at 1 in-graph edge and should be treated as still failing**, despite the table above. Its influences are real, well-documented, and almost entirely outside this graph's scope.

---

## 8. ZERO-INTERNAL-EDGE NODES — 5, **one combined decision please**

`galaxie-500` (re-home to `folk-confessional` recommended) · `the-white-stripes` · `pulp` · `king-gizzard` · `superchunk`

Each was placed by genre logic; each turns out to bridge entirely outward. That's roughly a fifth of the realm's passing nodes. A realm can host outward-bridging nodes — but deciding this five separate times will produce five inconsistent answers.

---

## 9. RULES THE RESEARCH ESTABLISHED
*(All need verification against seed-data — I couldn't read it. Confirm no existing convention is contradicted.)*

1. **Personnel overlap is not influence.** Breeders/Pixies+Throwing Muses · Sebadoh/Dinosaur Jr · Destroyer/New Pornographers+Swan Lake · Walkmen/Jonathan Fire\*Eater+Recoys · Women/Preoccupations · Apples in Stereo/Mangum+Doss · Grizzly Bear/Dept of Eagles · Stereolab/McCarthy · Tame Impala/Pond · BSS/everyone. **Three artists draw the line themselves** — Bejar on the Pornographers, Leithauser on Fire\*Eater, Barlow on Dinosaur Jr.
2. **Production is not influence.** Schneider→NMH & OTC · **Fridmann→Flaming Lips, MGMT, Tame Impala** · Sonic Boom→MGMT · McEntire→Stereolab · VanGaalen→Women · Dust Brothers & Godrich→Beck. The Fridmann case is the dangerous one: three nodes in one engineer's orbit.
3. **Shared label is not influence.** Merge (Superchunk/Arcade Fire/NMH) · Thrill Jockey & Drag City (BSS) · Dischord & Touch and Go (Sebadoh) · K Records (Nirvana).
4. **Simultaneity is not influence.** The E6 founders were peers dividing an aesthetic. Also Sebadoh/Pavement/GBV/Beat Happening as co-pioneers of lo-fi.
5. **Collaboration and covers are not influence.** St. Vincent/Byrne+Swans+Sufjan+NIN cover · Beck/Thurston Moore liner notes · Grizzly Bear/The National+Pecknold · Arcade Fire/Bowie+Byrne.
6. **Praise is not influence.** Berninger on the Strokes and Arcade Fire · Coyne on Beach House · Leithauser on Deerhunter, the Antlers, Vampire Weekend.
7. **Unsourced sidebar lists are never citations.** AllMusic's *influences panel* (Beck) · TV Tropes' *Influences* field (Arcade Fire, Ween) · The Student Playlist's *"Influenced by:"* header (MGMT). ~45 in-graph names across four instances, almost no prose support, several straight contemporaries. **The single largest source of plausible false edges in the project.** Note the distinction: AllMusic's *prose biography* is citable (sole source for The Walkmen); its panel is not.
8. **Interviewer suggestions are not artist statements.** Bejar and Gary Numan; the AllMusic interviewer on Violent Femmes paving the way for 1991.

---

## 10. ARTIST DENIALS — 6 · **recommend seed-data can hold these**

| artist | rejects | strength |
|---|---|---|
| Andrew Savage (Parquet Courts) | Pavement | clean |
| Will Toledo (Car Seat Headrest) | Pavement, Sonic Youth, Dinosaur Jr, **The Strokes** | clean, emphatic |
| Dan Bejar (Destroyer) | Gary Numan | clean (interviewer's suggestion) |
| Annie Clark (St. Vincent) | Kate Bush | **contested** — deflects the lineage, elsewhere listed as an influence |
| Dean Ween | Frank Zappa | clean (target not in graph) |
| Matt Berninger (The National) | The Strokes, Arcade Fire | praise misread as influence |

**Six false edges caught.** Without a way to record a rejection, the next research pass re-proposes every one of them off the same critic comparisons and "confirms" them. Recommend a field that distinguishes a **clean denial** from a **contested** one.

---

## 11. SUMMON CANDIDATES — final ranking

| candidate | edges | recommendation |
|---|---|---|
| **Echo & the Bunnymen** | **4** — `the-shins →` · `destroyer →` · `arcade-fire →` · `superchunk →` | **Summon.** All four first-person or near it, four unrelated artists, plus an obvious upstream into the `region-one` post-punk spine. Clearest case in the project. |
| **The Modern Lovers / Jonathan Richman** | **3** — `galaxie-500 →` · `low →` · `violent-femmes →` | **Summon.** uDiscover: the Femmes' acoustic approach was partly inspired by them. Britt Daniel and Will Toledo also touch Richman as critic-nods. |
| **Roxy Music / Bryan Ferry** | 2 — `parquet-courts →` · `destroyer →` | Viable, both first-person. |
| **Butthole Surfers** | 2 — `nirvana →` · `the-flaming-lips →` | Viable, scope-clean. (Ween's link is TV Tropes only — rejected.) |
| **Tom Waits** | 1 — `the-national →` | Cheap to check; likely more in `folk-confessional`. |
| **Kate Bush** | 1 solid + 1 **contested** | **Do not summon on two.** See the Clark deflection. |
| Television Personalities · Todd Rundgren · Ariel Pink · Spacemen 3 · Tall Dwarfs · Broadcast · They Might Be Giants · Jandek · New Pornographers · Flat Duo Jets · Scott Walker · Afghan Whigs · Mudhoney · Melvins · Vaselines · Beat Happening · Bikini Kill · Throwing Muses | 1 each | Skip. |
| **Black Dice** | 1 (Panda Bear's statement) | **Recommend dropping.** Flagged in the brief as Open Question 3 and carried through five batches. The three passes most likely to surface a second citer — noise/alt, psych/E6, neo-psych — are all now complete and none did. If you'd rather keep it, it needs one dedicated single-artist query. |

---

## 12. EDGES DROPPED — TARGET DOESN'T EXIST

Recorded so the same ground isn't re-covered.

**`nirvana`:** melvins · vaselines · mudhoney · beat-happening · young-marble-giants · the-raincoats · the-slits · killing-joke · the-wipers · meat-puppets · daniel-johnston · half-japanese · flipper · scratch-acid · butthole-surfers · shonen-knife · tad · the-fluid · bikini-kill · earth · the-germs · sex-pistols · mdc · leadbelly · john-fahey · leo-kottke
**`the-breeders`:** throwing-muses · courtney-barnett · lucy-dacus · speedy-ortiz
**`galaxie-500`:** the-modern-lovers · spacemen-3
**`sleater-kinney`:** bikini-kill · mecca-normal · bratmobile · throwing-muses
**`guided-by-voices`:** pj-harvey · u2
**`wilco`:** uncle-tupelo · pere-ubu · robyn-hitchcock · the-kinks
**`parquet-courts`:** roxy-music · beastie-boys
**`superchunk`:** yaz · bow-wow-wow · psychedelic-furs · echo-and-the-bunnymen
**`spoon`:** public-image-ltd · the-kinks · the-damned · elvis-costello · the-everly-brothers
**`violent-femmes`:** sun-ra · hank-williams · the-carter-family · captain-beefheart · jonathan-richman · johnny-thunders · the-b-52s · plasticland
**`ween`:** prince · captain-beefheart · nina-simone · richie-havens · george-clinton · dr-demento
**`women`:** deerhoof · abe-vigoda · the-hecks · ice-baths
**`car-seat-headrest`:** they-might-be-giants · jandek · the-new-pornographers · green-day · the-who · the-kinks · devo
**`the-national`:** tom-waits · the-afghan-whigs · tindersticks · simon-and-garfunkel · grateful-dead · philip-glass · steve-reich · arvo-part
**`destroyer`:** roxy-music · bryan-ferry · echo-and-the-bunnymen · prefab-sprout · thomas-dolby
**`the-walkmen`:** the-pogues · bruce-springsteen · u2 · nation-of-ulysses
**`the-white-stripes`:** flat-duo-jets · son-house · blind-willie-mctell · robert-johnson · leadbelly · captain-beefheart · the-gun-club · led-zeppelin · deep-purple · the-detroit-cobras · the-dirtbombs · the-go
**`pulp`:** scott-walker · the-kinks · abba · t-rex · lisa-oneill
**`neutral-milk-hotel`:** tall-dwarfs · the-decemberists · beirut · franz-ferdinand · elf-power
**`of-montreal`:** prince · kate-bush · john-lennon · ray-davies · skip-spence · sly-stone · fairport-convention · george-clinton · richard-hell · wayne-county · screaming-jay-hawkins · abba · cyndi-lauper · annette-peacock · chairlift · jack-u · the-flying-burrito-brothers · the-grateful-dead · the-rolling-stones
**`the-apples-in-stereo`:** the-beach-boys · the-beatles · the-kinks · elo · the-bee-gees · hall-and-oates · the-alan-parsons-project · michael-jackson
**`the-flaming-lips`:** butthole-surfers · pink-floyd · the-who · led-zeppelin · miles-davis · tom-jones · stravinsky · mercury-rev
**`mgmt`:** television-personalities · syd-barrett · pink-floyd · daft-punk · t-rex · fleetwood-mac · phil-spector · the-stranglers · **spacemen-3 (production, not influence — do not add even if the node appears later)**
**`grizzly-bear`:** fleetwood-mac · elvis-presley
**`stereolab`:** the-residents · burt-bacharach · broadcast
**`beck`:** pussy-galore · the-cars · mantronix · gary-wilson · willie-dixon · big-bill-broonzy · serge-gainsbourg · os-mutantes · gram-parsons · johnny-cash · the-beastie-boys
**`st-vincent`:** kate-bush (**contested**) · jimi-hendrix · tori-amos · pj-harvey · the-polyphonic-spree
**`arcade-fire`:** echo-and-the-bunnymen · u2 · bruce-springsteen · bertolt-brecht
**`tame-impala`:** todd-rundgren · air · supertramp · cream · emitt-rhodes
**`king-gizzard`:** the-band · steve-miller · ccr · the-faces · the-who · t-rex · devo
**`the-shins`:** echo-and-the-bunnymen · ariel-pink · the-carpenters · pink-floyd
**`vampire-weekend`:** paul-simon · the-kinks · scott-walker · m-i-a · souls-of-mischief · derek-walcott

---

## 13. OUT OF SCOPE (found, deliberately not encoded)

- **Nirvana's entire downstream** — post-grunge and mainstream alt. Cobain draws the same line himself.
- Pearl Jam, Soundgarden, Smashing Pumpkins, Nine Inch Nails, Hole — per scope-guard.
- **The E6 shared 60s upstream** — Beach Boys, Beatles, Zombies, Kinks. Now citable to Louisiana HR 35 and to Barnes first-person. The largest single block of excluded material in the realm, and load-bearing for the cluster's story. **Bios should carry it properly.**
- **Jack White's blues lineage in full** — Son House, Blind Willie McTell, Robert Johnson, Leadbelly. The bulk of the White Stripes' documented upstream.
- **King Gizzard's heavy metal** — a stated formative influence and an entire album. See §6.
- Classic rock throughout: Pink Floyd, Led Zeppelin, The Who, Fleetwood Mac, T. Rex, Supertramp, Todd Rundgren, ELO, Bee Gees, Alan Parsons Project, U2, Springsteen, Cream, Deep Purple, Elvis Presley.
- Soul/funk: Prince, Sly Stone, George Clinton, James Brown, Stevie Wonder, Motown, Screaming Jay Hawkins.
- Jazz/classical: **Sun Ra** (Violent Femmes' own biggest stated influence), Miles Davis, Stravinsky, Philip Glass, Steve Reich, Arvo Pärt.
- Hip-hop: Beastie Boys, Run-D.M.C., Mantronix, Souls of Mischief, Houston hip-hop, 90s hip-hop.
- Chart-facing: Olivia Rodrigo, Taylor Swift, Dua Lipa, Britney Spears, Kylie Minogue, ABBA, Cyndi Lauper, The Prodigy, Billy Joel.
- Non-musical but bio-essential: **Anne Frank's diary** (NMH), Haitian rara/kompa/voodoo drumming (Arcade Fire), Jean Cocteau, Sylvia Plath, Bertolt Brecht, Derek Walcott, the *Wizard of Oz*, Frank Sinatra biography, Stephen Hillenburg/SpongeBob (Ween).

---

## 14. OPEN QUESTIONS

1. **Panda Bear — one node or two?** Unchanged across all five batches. Every other same-person case got merged (Mount Eerie/Microphones, Silver Jews/Purple Mountains, Rosenstock), but *Person Pitch* and *Tomboy* are a genuinely distinct body of work. **Related:** Superchunk's four edges all come from McCaughan's *solo* record, which is the same question wearing different clothes. **Human decision.**
2. **The five zero-internal-edge nodes** (§8). **One combined ruling.**
3. **Black Dice.** Recommend dropping — see §11.
4. **Personnel / production / label / simultaneity are not influence.** Confirmed across all five batches (§9). **Needs seed-data verification** that no existing genealogical-edge convention is contradicted.
5. **Can seed-data hold an artist denial?** Six instances (§10), one of them contested. Without this, the work gets redone wrong.
6. **Frontman name vs band node.** Barnes names Iggy Pop and Lou Reed; the graph has `the-stooges` and `velvet-underground`. **Two Of Montreal edges are waiting on this.** Recurs with Bryan Ferry/Roxy Music, Mark Hollis/Talk Talk, Dan Treacy/Television Personalities. **One-time convention, applied everywhere.**
7. **Are single-source critic comparisons writable?** This is the highest-leverage unresolved question. It flips `women` from 0 edges to 5, governs `the-walkmen` (3 edges resting on one AllMusic sentence), and affects several `neutral-milk-hotel` edges. **A ruling, not more research.**
8. **Sidebar lists.** Recommend a standing rule per §9.7.

---

## 15. STATE OF PLAY — research debt closed

**The five gap-filling queries are done.** Results:

| # | query | outcome |
|---|---|---|
| 1 | NMH downstream, first-person | **✅ Solved.** Win Butler, Red Bull Music Academy. Best single find of the follow-up pass. Also added `fleet-foxes`, `caribou`, and three folk-realm citers. |
| 2 | Sebadoh downstream | **Resolved by the ruling instead.** No better source found; three low-tier edges admitted, the Car Seat Headrest one dropped on counter-evidence. |
| 3 | Vampire Weekend → Talking Heads | **✅ Confirmed**, via Koenig's own podcast appearance rather than the press cliché. Bonus: Squeeze/Costello/XTC as his stated British roots — all off-graph. |
| 4 | Beck, early period | **Partial.** Sonic Youth upgraded to convergent-across-four. No new edges, still no downstream. The thinness is real. |
| 5 | The Breeders citer | **❌ Failed.** Two attempts, nothing. Clears on the ruling alone. |

**Still open — three edges to actively drop or fix, not write:**
- `stereolab → olivia-tremor-control` — **chronologically backwards** (§6). Check the Radiohead claim from the same Stereogum sentence, which has the same problem.
- `stereolab → kraftwerk` — predicted by the brief, **verified absent** across eight results (§6).
- One of `guided-by-voices → rem` / `rem → guided-by-voices` — **direction conflict** (§3). Recommend keeping the former.

**Still open — decisions, not research:**
- **The five zero-internal-edge nodes** (§8). One combined ruling. My recommendation: re-home `galaxie-500` to `folk-confessional`, keep the other four. Superchunk pointing entirely at New Order, Cocteau Twins, the Cure and Depeche Mode isn't a defect — it's the finding. American underground rock is substantially downstream of British post-punk, and a graph that hides that is less true than one that shows it.
- **Panda Bear, one node or two** (§14.1) — and note `superchunk` is the same question wearing different clothes, since all four of its edges come from McCaughan's solo record.
- **Frontman name vs band node** (§14.6) — two Of Montreal edges are waiting.
- **Can seed-data hold a denial** (§14.5) — six instances, one contested.
- **Black Dice** — recommend dropping (§11).

**One structural observation that isn't in the per-artist entries.** Across 31 passing nodes, a large share of this realm's edges land in `region-one`, `core` and `folk-confessional`. Stereolab's five all do. Superchunk's four. Pulp's three. Spoon has one internal out of four. Neutral Milk Hotel now bridges outward six times.

That may mean `american-underground` is functioning as a **hub** rather than a **cluster** — and if Starweave's zoom system reveals realms as visually coherent neighbourhoods, a realm whose gravity sits elsewhere will look wrong on screen even when every edge is correctly sourced. Worth checking the other realms' internal/external edge ratios before writing, because it's a data-model question rather than a research one.