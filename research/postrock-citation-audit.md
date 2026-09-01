# Post-Rock Citation Remediation — Step 1 Audit

98 edges touch a `post-rock-drone-noise` node. Categorized per the remediation job spec, then fixed (see outcomes appended below each category — this file is now the permanent record of both the audit and the fix, matching the project's `*-audit-DRAFT.md` convention).

## Category A — excluded source (18)

| Edge | Confidence | Citation (as found) | Outcome |
|---|---|---|---|
| big-black → this-heat | 0.8 | Reddit AMA (excluded) | Re-sourced — VWMusic interview, Steve Albini names This Heat, first-person, 0.85 |
| sigur-ros → talk-talk | 0.7 | Apple Music "Influences" | Downgraded — unsourceable |
| mogwai → talk-talk | 0.75 | Apple Music "Influences" | Downgraded — unsourceable |
| sigur-ros → brian-eno | 0.7 | Apple Music "Influences" | Downgraded — unsourceable |
| godspeed-you-black-emperor → velvet-underground | 0.7 | The Student Playlist | Downgraded — unsourceable |
| godspeed-you-black-emperor → glenn-branca | 0.7 | The Student Playlist | Downgraded — unsourceable (only found: GY!BE members played Branca's 100-guitars piece, a collaboration, not citable) |
| godspeed-you-black-emperor → swans | 0.7 | The Student Playlist | Downgraded — unsourceable |
| godspeed-you-black-emperor → tortoise | 0.7 | The Student Playlist | Downgraded — unsourceable |
| godspeed-you-black-emperor → sonic-youth | 0.7 | The Student Playlist | Re-sourced — Exclaim!/podcast *155*, bassist Mauro Pezzente, first-person, 0.85 |
| godspeed-you-black-emperor → my-bloody-valentine | 0.7 | The Student Playlist | Downgraded — only found a critic sonic-comparison (NME 1999), not a stated influence |
| godspeed-you-black-emperor → slint | 0.7 | The Student Playlist | Downgraded — unsourceable |
| godspeed-you-black-emperor → low | 0.6 | The Student Playlist | Downgraded — unsourceable |
| godspeed-you-black-emperor → talk-talk | 0.7 | AllMusic influences panel | Downgraded — unsourceable |
| godspeed-you-black-emperor → the-cure | 0.6 | AllMusic influences panel | Downgraded — unsourceable |
| swans → velvet-underground | 0.65 | Heavy Blog Is Heavy + TV Tropes | Downgraded — unsourceable (a lead suggesting Gira actively distances Swans from this narrative could not be verified, source 403'd — worth a follow-up look) |
| mono → mogwai | 0.7 | Grokipedia | Downgraded — unsourceable (Goto's own cited influences are Beethoven/MBV/Morricone, not Mogwai) |
| mono → explosions-in-the-sky | 0.7 | Grokipedia | Downgraded — unsourceable (only peer/friendship framing found) |
| mono → godspeed-you-black-emperor | 0.7 | Grokipedia | Downgraded — unsourceable |

## Category B — no real citation (10)

| Edge | Confidence | Citation (as found) | Outcome |
|---|---|---|---|
| tortoise → neu | 0.75 | "same krautrock lineage" | Downgraded — a promising critic passage (Fogged Clarity) could not be independently verified via fetch, declined to cite unverified text |
| radiohead → talk-talk | 0.7 | "widely documented" | Downgraded — unsourceable |
| bon-iver → talk-talk | 0.6 | "documented influence" | Downgraded — unsourceable |
| radiohead → sigur-ros | 0.6 | "documented mutual influence/dialogue" | Re-sourced — Johns Hopkins News-Letter (2001) reports Thom Yorke naming Sigur Rós a major influence on Kid A, `reported`, 0.6 |
| spiritualized → the-jesus-and-mary-chain | 0.55 | "cited as part of... lineage" | Downgraded — only found Spacemen 3/JMC as contemporaries |
| anna-von-hausswolff → nico | 0.5 | unnamed "press bio" | Re-sourced — The Quietus's Baker's Dozen, she names Nico as an influence on her own vocal delivery, first-person, 0.75 |
| anna-von-hausswolff → siouxsie-and-the-banshees | 0.5 | unnamed "press bio" | Downgraded — only a vague "listened a little"/vocal-comparison surfaced |
| mogwai → the-cure | 0.65 | unnamed "press" | Re-sourced — Uncut's history of Come On Die Young (via Wikipedia), reported, 0.6 |
| mogwai → nick-drake | 0.6 | unnamed "press" | Re-sourced — Braithwaite to The Quietus on Pink Moon, first-person, 0.85 |
| women → this-heat | 0.5 | self-admittedly dubious hedge text | Re-sourced — Exclaim!, Pat Flegel names This Heat + Swell Maps as primary inspiration, first-person, 0.85 |

## Category C — wrong relationship type (17)

| Edge | Confidence | Citation (as found) | Outcome |
|---|---|---|---|
| do-make-say-think → godspeed-you-black-emperor | 0.5 | shared label/scene | Downgraded — unsourceable (kept; this is the node's only edge) |
| swans → glenn-branca | 0.8 | label + personnel | Re-sourced — Gira to The Line of Best Fit on Branca's shows being "really inspirational," first-person, 0.85 |
| sonic-youth → glenn-branca | 0.8 | personnel + label + hedged claim | Re-sourced — Moore to Rolling Stone on Branca's alt-tunings informing Sonic Youth, first-person, 0.85 |
| teenage-jesus-and-the-jerks → brian-eno | 0.7 | production credit (No New York) | **Deleted — claim is wrong.** Lydia Lunch is on record calling Eno's production "the worst," "he did nothing." This was the node's only outgoing edge to Eno; teenage-jesus-and-the-jerks retains its other edge (→ mars). |
| sonic-youth → teenage-jesus-and-the-jerks | 0.7 | scene co-presence | Downgraded — unsourceable |
| james-chance-and-the-contortions → brian-eno | 0.7 | production credit | **Deleted — production-credit only, no influence evidence. This was the node's only edge; james-chance-and-the-contortions is now a 0-edge orphan (flagged, not propped up).** |
| mars → brian-eno | 0.7 | production credit | **Deleted — production-credit only.** Mars retains its other edge (teenage-jesus-and-the-jerks → mars, incoming). |
| sonic-youth → mars | 0.7 | scene co-presence | Re-sourced — Far Out Magazine names Mars's No New York material as direct inspiration for Sonic Youth, `reported`, 0.55 |
| dna → brian-eno | 0.7 | production credit | **Deleted — production-credit only** (Lindsay's own account describes studio friction with Eno, not influence). DNA retains its other 2 edges. |
| sonic-youth → dna | 0.7 | scene co-presence | Downgraded — unsourceable |
| anna-von-hausswolff → swans | 0.8 | collaboration + press bio | Downgraded — unsourceable (only collaboration + unnamed press-bio comparison found) |
| dead-can-dance → this-mortal-coil | 0.75 | label + membership | **Deleted per explicit instruction**, no search |
| dead-can-dance → cocteau-twins | 0.5 | labelmates | Downgraded — unsourceable (kept — 4AD-era ethereal-wave kinship is real and widely noted, just not first-person-citable) |
| spiritualized → velvet-underground | 0.75 | Spacemen 3 genealogy + cover | Downgraded — unsourceable (real substance found — Cale collaboration, repeated critic resemblance — but no first-person Pierce quote) |
| dirty-three → nick-cave-and-the-bad-seeds | 0.6 | personnel (Ellis in both bands) | Downgraded — unsourceable (Ellis's dual membership is real; no evidence Cave's music influenced Dirty Three specifically — if anything the direction runs the other way) |
| swans → joy-division | 0.6 | cover + resemblance | **Deleted — explicit denial found.** Far Out Magazine: asked if the "Love Will Tear Us Apart" cover was a tribute, Gira "dispelled the argument that he is in any way indebted to" Curtis. Added to `rejectedEdges` as `contested` (cover + widely-noted resemblance exist; Gira denies direct debt). |
| american-football → tortoise | 0.5 | parenthetical guess | Re-sourced — Daily Illini + Bandcamp Daily trace American Football's instrumental leanings to Chicago-scene exposure to Tortoise, `critic`, 0.6 |

## Cleanup (not a category fix)

- **blonde-redhead → sonic-youth**: stripped the "produced by Steve Shelley" production-credit clause. No independently-verifiable named source found for the Makino claim on its own (a lead surfaced but was nuanced rather than a clean confirmation), so per explicit instruction the edge was kept as-is: "Kazu Makino has cited Sonic Youth as a key inspiration."

## Category D — left alone (53)

Real named publication + actual claim. Untouched: godspeed→black-flag/minutemen, sigur-ros→ride/my-bloody-valentine/cocteau-twins, mogwai→sonic-youth/joy-division/my-bloody-valentine/fugazi/aphex-twin/low/neu/kraftwerk/slint, bark-psychosis's 6 edges, mono→sonic-youth/my-bloody-valentine, explosions-in-the-sky's 3 edges, swans→can/suicide, glenn-branca→rhys-chatham, hot-chip/caribou/sonic-youth/radiohead/swans/stereolab→this-heat, sonic-youth→rhys-chatham, teenage-jesus-and-the-jerks→mars, blonde-redhead→dna/my-bloody-valentine, dirty-three→velvet-underground, tortoise→can/brian-eno, nirvana→swans, grizzly-bear→talk-talk, black-midi's 2 edges, black-country-new-road→godspeed-you-black-emperor, squid→tortoise, 2814→sigur-ros, xiu-xiu→swans, candy-claws→blonde-redhead, broken-social-scene's 2 edges.

## Final numbers

- 98 audited → 92 surviving (6 deleted: 4 wrong-relationship production/personnel claims + 1 explicit-instruction delete + 1 denial)
- 11 re-sourced to a real named citation
- 28 downgraded to `citationStatus: 'unsourceable'` (`citation` set to `null`, matching the codebase's existing convention — see fix note below)
- 1 new `rejectedEdges` entry (`swans → joy-division`, contested)
- Post-rock-drone-noise citation-state coverage: 92/92 resolve to either `cited` (64) or `unsourceable` (28) — none `unchecked`
- **Post-fix correction**: both agents initially set the downgraded edges' `citation` field to the literal string "Widely accepted; no first-person or reportable source located." instead of `null`. Since `resolveCitationStatus()` returns `'cited'` whenever `citation` is truthy (checked before `citationStatus`), this would have made all 28 downgraded edges render as ordinary cited sources with a "Source" toggle in the panel — the opposite of the intended honest "unsourceable" treatment. Fixed by setting `citation: null` on all 28, matching the existing `nico → velvet-underground` precedent. Confirmed via `ArtistPanel.tsx`'s use of `resolveCitationStatus`.
- New orphan created: `james-chance-and-the-contortions` (0 edges) — flagged, not propped up
- Pre-existing orphan confirmed unrelated to this pass: `a-silver-mt-zion` (0 edges)
- Nodes at 1 edge: `do-make-say-think`, `dead-can-dance`
