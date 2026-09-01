# Folk & Confessional Realm: Influence Audit — FINAL (Layer 2 of 3)

**Status: LAYER 2 (assistant flags), post reviewer verdict.** This document applies your Layer-1 decisions, runs the second research pass you specified (chasing unpinned edges, re-verifying flagged citations, and sourcing the two new root summons), and re-runs the 2-edge bar. **Still no code, no seed-data.** Layer 3 (final human sign-off on this document) is next.

Read together with `folk-audit-DRAFT.md` (Layer 1) — this document does not re-print every unchanged artist's full citation list; where nothing changed, it says so and points back to the DRAFT section. Every artist whose count, status, or citations changed gets full detail here.

**Hard rule enforcement note:** per your instruction, the "no critic-comparison-as-influence" tightening was applied specifically to this pass's NEW work — the two root summons (Dylan, Neil Young) and the five near-miss chases (Cat Power, Codeine, John Prine, Jonathan Richman, Beat Happening) contain **zero** critic-comparison edges; every one of the confirmed edges below is either the artist's own first-person statement or a specific documented fact (a cover recording, a named mentorship, a demo/tape exchange). Your explicit "KEEP AS-IS" list is honored as-is, including whatever critic-comparison edges were already baked into those Layer-1 counts (e.g. Angel Olsen's Cocteau Twins/Cure/Siouxsie trio, Julia Holter's Nico/Siouxsie lines) — those aren't relitigated here, per your own sign-off. Your explicit direction to rescue Big Thief via "Bridgers + MBV" is honored even though the MBV edge is critic-comparison — you named that combination yourself.

**Tooling note, stated honestly:** the five second-pass research agents lost WebSearch access partway through (session quota) and fell back to direct WebFetch against Wikipedia, named outlets, and text-extraction proxies for a few paywalled/blocked sites (Variety, Reverb, GQ). This worked well for most chases but left a handful of leads genuinely unresolved rather than confirmed-false (flagged individually below) — a from-scratch re-run with full search access could still turn up a few more of the "NOT CONFIRMED" items.

---

## A. FINAL CUT LIST (with reasons)

| Artist | Reason | Prior edge count |
|---|---|---|
| **Amy Winehouse** | Reviewer decision — 0 edges, jazz/soul lineage, zero connection either direction to this graph. | 0 |
| **Natalia Lafourcade** | Reviewer decision — Latin nueva-canción/bolero tradition, structurally isolated, off-lineage. | 1 |
| **Lana Del Rey** | Reviewer decision — do not summon, even though she cleared the bar (Ethel Cain + Jeff Buckley). | 2 (as summon) |
| **Tori Amos** | Reviewer's conditional cut. Second-pass chase (brief, per instruction) found **NOT CONFIRMED** — no first-person quote in either direction to any of the 106 existing nodes or 43 folk-realm candidates. Her own Wikipedia "Legacy" list (Alanis Morissette, Amy Lee, Jewel, Halsey, Olivia Rodrigo, St. Vincent...) contains no roster match. Cut per your stated condition. | 0 |
| **Ethel Cain** | Orphaned by the Lana Del Rey cut — her only edge was `→ lana-del-rey`. Second-pass chase for an independent second edge (Florence Welch, Chelsea Wolfe, King Woman, Nicole Dollanganger, Karen Carpenter, Mazzy Star, Nine Inch Nails) came back **NOT CONFIRMED against any of the 106 existing nodes or the folk roster** — her real, sourced influences exist, they just don't map anywhere in this graph. Orphan rule applies. | 0 (after Lana cut) |
| **Songs: Ohia** | 0 edges in Layer 1; not independently rescued by the Dylan/Neil Young sweeps (both checked, found nothing — Molina's own account runs through Black Sabbath/metal, and Will Oldham, his one real mentorship connection, isn't a valid node). Orphan. | 0 |
| **Purple Mountains** | Same-artist successor to Silver Jews (David Berman) — not an influence edge per your explicit rule. No independent edges found for the Purple Mountains project itself in either pass. Orphan. | 0 (excluding the disallowed successor relationship) |
| **Mount Eerie** | Same-artist rename of The Microphones (Phil Elverum) — not an influence edge. The one candidate independent edge (Beat Happening/Calvin Johnson) is documented for the Microphones era specifically; the second-pass chase for a Mount-Eerie-era restatement of that influence came back **NOT CONFIRMED**. Orphan. | 0 |
| **Giles Corey** | Same-member relationship with Have a Nice Life (Dan Barrett) — not an influence edge. Barrett's own stated influences for this specific project (Hank Williams, Johnny Cash, Merle Haggard) are all off-roster/off-graph. No independent edges found. Orphan. | 0 |

**9 entries total: 8 roster artists cut, plus Lana Del Rey rejected as a summon** (she was never one of the original 45 roster names — she only existed in this document as a proposed off-roster root, which the reviewer explicitly declined).

---

## B. FINAL KEEP LIST (by family, with edge counts)

### folk-roots

| Artist | Count (was → now) | Change |
|---|---|---|
| **Nick Drake** | 5 → **8** | +`bob-dylan` (see Section C) |
| **Leonard Cohen** | 2 → **2** | Fontaines D.C. edge re-verified, now fully solid own-words (Section D) — count unchanged |
| **Vashti Bunyan** | 5 → **7** | +`bob-dylan`, +`neil-young` |
| **Townes Van Zandt** | 2 → **3** | +`bob-dylan` (weaker source, see caveat below) |
| **Joni Mitchell** | 3 → **3** | Bright Eyes edge re-sourced (NPR → GQ), now solid own-words — count unchanged |

*Nico — no change; still edge-only/existing-node, still 0 new folk edges found. Not tagged folk-roots. See DRAFT Section 2.*

### freak-folk

| Artist | Count (was → now) | Change |
|---|---|---|
| **Joanna Newsom** | 4 → **4** | unchanged |
| **Sufjan Stevens** | 1 → **3** | **RESCUED.** +`bob-dylan` (cover), +`neil-young` (own words) |
| **Big Thief** | 1 → **2** | **RESCUED.** +`phoebe-bridgers` (confirmed) |
| **Adrianne Lenker** | 0 → **3** | **RESCUED.** +`elliott-smith`, +`joni-mitchell`, +`leonard-cohen` (all one Stereogum quote) |
| **Fleet Foxes** | 2 → **5** | +`bob-dylan`, +`neil-young`, +`john-prine` |
| Bon Iver | 1 (unchanged) | **Still FAILS-BAR** — see Section E |

### confessional

| Artist | Count (was → now) | Change |
|---|---|---|
| **Elliott Smith** | 7 → **8** | +`bob-dylan` |
| **Fiona Apple** | 1 → **2** | **RESCUED.** +`neil-young` (cover) |
| **Jeff Buckley** | 3 → **3** | `lana-del-rey` removed (cut), +`bob-dylan` (cover) — net unchanged |
| **Mitski** | 3 → **3** | unchanged |
| **Phoebe Bridgers** | 3(+1 provisional) → **4** | `big-thief` edge now confirmed |
| **Sharon Van Etten** | 6 → **7** | +`neil-young` (cover) |
| **Angel Olsen** | 4 → **4** | unchanged |
| **Weyes Blood** | 5 → **5** | unchanged |
| **Snail Mail** | 6 → **6** | unchanged |
| **Clairo** | 2 → **2** | unchanged |
| **Julia Holter** | 4 → **5** | +`neil-young` |
| Japanese Breakfast | 1 (unchanged) | **Still FAILS-BAR** — not part of this pass's chase list, see Section E |
| Liz Phair | 1 (unchanged) | **Still FAILS-BAR** — not part of this pass's chase list, see Section E |

*(Ethel Cain, Tori Amos, Amy Winehouse: cut — Section A.)*

### slowcore-sadcore

| Artist | Count (was → now) | Change |
|---|---|---|
| **Red House Painters** | 2 → **3** | +`neil-young` |
| **Sun Kil Moon** | 1 → **2** | **RESCUED** on its own merits (`modest-mouse` + `neil-young`), per your explicit rule that the RHP-successor relationship itself still doesn't count |
| **Low** | 3 → **3** | `the-cure` and `codeine` edges re-verified to solid own-words (Section D) — count unchanged (the Codeine edge can't be added to the graph unless Codeine itself is promoted — see Section E) |
| **Have A Nice Life** | 2 → **2** | unchanged |
| Silver Jews | 1 (unchanged) | **Still FAILS-BAR** — see Section E |
| Carissa's Wierd | 1 (unchanged) | **Still FAILS-BAR** — see Section E |
| The Microphones | 1 (unchanged) | **Still FAILS-BAR** — see Section E |

*(Songs: Ohia, Purple Mountains, Mount Eerie, Giles Corey: cut — Section A.)*

### indie-folk-songwriter

| Artist | Count (was → now) | Change |
|---|---|---|
| **Kurt Vile** | 4 → **6** | +`bob-dylan`, +`neil-young` |
| **Mac DeMarco** | 2 → **3** | +`neil-young` (no longer dependent on the unpromoted Jonathan Richman lead alone) |
| **The Mountain Goats** | 3 → **3** | unchanged |
| Men I Trust | 1 (unchanged) | **Still FAILS-BAR** — not part of this pass's chase list, see Section E |

*Grouper — no change to node status (existing electronic-realm node); the one new edge (`→ townes-van-zandt`) stands. See DRAFT Section 6.*

*(Natalia Lafourcade: cut — Section A.)*

**28 artists now clear the bar** (up from 21 in the DRAFT), across the 5 families, plus the 2 existing-node edge-additions (Nico, Grouper).

---

## C. FINAL SUMMON LIST (sourced edges)

### Bob Dylan — NEW, promoted this pass
- `nick-drake → bob-dylan` [internal] — *Stereogum*, "Nick Drake And The Mother Of His Mysterious Sound" (2024) + *The Guardian*, "Nick Drake's producer on... Pink Moon" (2022): Drake "learned songs by Bob Dylan, Paul Simon, and Peter, Paul and Mary on guitar, having been particularly affected by Dylan's 'A Hard Rain's a-Gonna Fall.'"
- `townes-van-zandt → bob-dylan` [internal, ⚠ weaker source] — a long-running fan-maintained Townes Van Zandt FAQ (pnwpest.org), cited by Wikipedia: "Van Zandt cited Lightnin' Hopkins, Bob Dylan, and Hank Williams... as having had a major impact on his music." Named/checkable but not a mainstream outlet — flagged for a stronger replacement source if one turns up later.
- `vashti-bunyan → bob-dylan` [internal, ⚠ needs a manual spot-check] — Wikipedia, citing a 2018 *The Courier* interview: at 18, Bunyan discovered *The Freewheelin' Bob Dylan* in NYC and decided she wanted to be a musician. The researching agent could not fully confirm this exact anecdote sits in the cited Courier piece on inspection — real and plausible, but flagged rather than presented as airtight.
- `fleet-foxes → bob-dylan` [internal] — Austin Scaggs, *Rolling Stone*, "Fleet Foxes' Perfect Harmony" (Nov 13, 2008): Pecknold and Skjelset bonded over "a shared appreciation of Bob Dylan, Neil Young, and Brian Wilson."
- `elliott-smith → bob-dylan` [internal] — S.R. Shutt, "Elliott Smith: Biography," *Sweet Adeline*: Smith, in his own words — "My father taught me how to play 'Don't Think Twice, It's All Right.' I love Dylan's words, but even more than that, I love the fact that he loves words."
- `kurt-vile → bob-dylan` [internal] — *Qobuz*, "Kurt Vile: My biggest influences come from the roots of Rock and Country" (2018): Vile "cites songwriters Randy Newman, Bob Dylan, Neil Young, and Bruce Springsteen as influences."
- `sufjan-stevens → bob-dylan` [internal, documented fact] — Stevens covered Dylan's "Ring Them Bells" (per Wikipedia).
- `jeff-buckley → bob-dylan` [internal, documented fact] — Buckley performed Dylan's "Mama, You've Been On My Mind" live at Sin-é (per Wikipedia).

**8 sourced edges.** Comfortably clears the bar — this is the single highest-value root in the whole realm.

**Notes:** two genuinely interesting *reverse*-direction facts surfaced but are NOT encoded as edges (wrong direction for this graph's convention): Dylan named Karen Dalton "my favorite singer" in *Chronicles: Volume One* and occasionally backed her on harmonica; Dylan praised the Incredible String Band's "October Song" in a 1968 *Sing Out!* interview. Also surfaced: a real, sourced Dylan/Joni Mitchell public friction (Mitchell called Dylan "a fake and a plagiarist" in a 2010 *LA Times* interview, later softened) — documented antagonism, not influence, not encoded as an edge either direction.

### Neil Young — NEW, promoted this pass
- `sufjan-stevens → neil-young` [internal] — *The National*, James McNair (2015), citing his own 2006 interview with Stevens: as a 10-year-old, Stevens "would listen to cassettes of Nick Drake and Neil Young albums that Lowell had mailed to him."
- `kurt-vile → neil-young` [internal] — *The Village Voice*, "Q&A: Kurt Vile on... the Neil Young Solo That Changed His Life" (2011): on *On the Beach*'s guitar solo — "that sustained note changed my life... I can't say I wasn't influenced by that, because it would be a total lie."
- `fleet-foxes → neil-young` [internal] — Pitchfork (2009): Pecknold — "The biggest thing to me — and I mean this in a totally approach-based way — is Neil Young," citing Young's Bridge School benefit and career integrity as directly renewing his own commitment to the band.
- `red-house-painters → neil-young` [internal] — SFGate, "Mark Kozelek: All Mixed Up" (2005): "If I had to pick my biggest influence of all time it would have to be Neil Young. I remember liking Neil Young so much it became a problem," describing learning guitar from *Decade*/*Live Rust*.
- `sun-kil-moon → neil-young` [internal] — same Kozelek quote/fact as above, carried to his post-RHP recording name (his stated "biggest influence of all time," not era-specific).
- `mac-demarco → neil-young` [internal] — *The Guardian*, "Soundtrack of my life: Mac DeMarco" (2015): on *Harvest* — "I wanted to make my album sound exactly like this: really dry, really crisp '70s style," describing it as the direct sonic template for his own *2*.
- `vashti-bunyan → neil-young` [internal] — Pitchfork "Guest Lists" (2005): Bunyan describes first hearing *After the Gold Rush* ("Only Love Can Break Your Heart") after years off the grid as directly formative to her return to music.
- `fiona-apple → neil-young` [internal, documented fact] — recorded a cover of "Heart of Gold" for the *Heart of Gold: The Songs of Neil Young Volume I* tribute/benefit album (2025), per *Rolling Stone*.
- `sharon-van-etten → neil-young` [internal, documented fact, weaker] — performed a live cover of "Helpless" with Angie McMahon (Newcastle, UK, Aug 2025), per Van Etten's own accompanying post.
- `julia-holter → neil-young` [internal] — Stereogum favorite-songs feature: "Neil Young's 'Expecting to Fly' is a legendary demonstration to me of melancholy in songwriting and production."

**10 sourced edges.** Clears the bar comfortably.

**Notes:** Bon Iver was checked thoroughly and specifically for this summon (per your instruction) — **NOT CONFIRMED**. The only Vernon/Young material found is Young calling Vernon for a 2011 collaboration (NME) — Young's interest in Vernon, not the reverse — and a structural echo between Bon Iver's "Volumes" archival series and the Neil Young Archives (a stylistic homage, not a personal-influence quote). Per your hard rule, this is excluded — see Section E, Bon Iver still fails the bar.

### Bright Eyes / Conor Oberst — promoted (already cleared bar in the DRAFT; formalized here with a corrected source)
- `bright-eyes → townes-van-zandt` [internal] — **source corrected**: not the NPR piece originally cited (re-fetched in full; it does not mention Van Zandt or Mitchell at all — drop that citation). Real source: *GQ*, oral history of *I'm Wide Awake, It's Morning* (Dec 8, 2025) — Oberst, in his own words: "The idea at the time was to make this sort of purist, '70s folk record... Jackson Browne, Joni Mitchell, Gram Parsons, Townes Van Zandt. All that type of stuff."
- `bright-eyes → joni-mitchell` [internal] — same corrected GQ source/quote.
- `phoebe-bridgers → bright-eyes` [internal] — Wikipedia/Phoebe Bridgers; Better Oblivion Community Center (2019 joint album with Oberst); widely quoted: "it's kind of sexist not to like Bright Eyes."

**3 sourced edges**, now all fully solid (no remaining ⚠ caveats — the source-correction resolves the prior re-verification flag).

### Bert Jansch — promoted (unchanged from DRAFT)
- `nick-drake → bert-jansch` [internal] — see DRAFT Section 2.
- `the-smiths → bert-jansch` [bridge] — Johnny Marr: "All roads lead back to Bert Jansch."

**2 sourced edges.**

### Roy Harper — promoted (unchanged from DRAFT)
- `joanna-newsom → roy-harper` [internal] — see DRAFT Section 3.
- `fleet-foxes → roy-harper` [internal] — see DRAFT Section 3.

**2 sourced edges.**

### Karen Dalton — promoted (unchanged from DRAFT)
- `joanna-newsom → karen-dalton` [internal, ⚠ source-chain caveat] — see DRAFT Section 3.
- `nick-cave-and-the-bad-seeds → karen-dalton` [bridge] — see DRAFT Section 3.

**2 sourced edges** (2nd-pass did not additionally chase this one; the weaker `devendra-banhart → karen-dalton` lead from the DRAFT remains uncounted/uncorroborated).

### Incredible String Band — promoted (unchanged from DRAFT)
- `vashti-bunyan → incredible-string-band` [internal] — see DRAFT Section 2.
- `boards-of-canada → incredible-string-band` [bridge] — see DRAFT Section 7.

**2 sourced edges.**

### John Prine — NEW, promoted this pass
- `kurt-vile → john-prine` [internal] — *Under the Radar*; the "How Lucky" duet, recorded days before Prine's 2020 COVID death.
- `fleet-foxes → john-prine` [internal, ⚠ citation not personally re-fetched] — Wikipedia's John Prine "Influence" section: "Prine's influence is seen in the work of younger artists, whom he often mentored, including... Robin Pecknold" — footnoted to Madison Vain, *Esquire*, "John Prine Was Always There..." (April 8, 2020). The Esquire URL was blocked for direct fetch this session; this rests on Wikipedia's specifically-named, dated citation rather than a personally-verified quote. Flagged for a follow-up spot-check, but the citation is specific and checkable, not vague.

**2 sourced edges.** Clears the bar — newly promoted.

### Not promoted — near-miss summons, chased this pass, still short

- **Cat Power** — still only 1 edge (`snail-mail → cat-power`). Second-pass chase for a first-person Angel Olsen or Sharon Van Etten quote came back **NOT CONFIRMED** — both artists' own Wikipedia influence lists were checked directly and don't mention her; only vague tour-bio/journalist framing exists. **Not summoned**, per your explicit "only if the 2nd edge is REAL" instruction.
- **Codeine** — `low → codeine` is now a fully solid, first-person, re-verified edge (Vice: Sparhawk, "I was pretty in awe of them"). But the chase for an independent second connecting artist came back **NOT CONFIRMED** (tooling-limited this pass — search access was down). Still only 1 real edge. **Not summoned**, but flagged as the single most likely candidate to clear the bar on a follow-up pass with working search.
- **Jonathan Richman** — still only 1 edge (`mac-demarco → jonathan-richman`). The only lead for a second (an uncited Wikipedia claim about a Frank Black tribute song) could not be verified to actually exist. **Not summoned.**
- **Beat Happening / Calvin Johnson** — still only 1 edge (`the-microphones → beat-happening`, Bret Lunsford mentorship, already solidly documented). Chase for a Mount-Eerie-era restatement or any other roster connection came back **NOT CONFIRMED**. **Not summoned** — this is also why Mount Eerie/The Microphones don't get rescued (Section A/E).

---

## D. Re-verification results (the six `⚠` edges from the DRAFT)

| Edge | Verdict | Resolution |
|---|---|---|
| Leonard Cohen ← Fontaines D.C. | **CONFIRMED, own words** | Reverb.com (Nov 2023): Carlos O'Connell — "Leonard Cohen; Elliott Smith." Caveat lifted. |
| Bright Eyes → Townes Van Zandt / Joni Mitchell | **CONFIRMED, own words, source corrected** | Not the NPR piece (re-fetched in full, doesn't contain this) — real source is *GQ*'s Dec 2025 oral history. Citation updated in Section C. |
| Bon Iver → Radiohead | **CONFIRMED, critic-only** | Pitchfork (Amanda Petrusich, Sept 2016), reached directly. Real, but Vernon's own words, not found. This is Bon Iver's only edge — still fails the bar (Section E). |
| Silver Jews → Velvet Underground | **CONFIRMED, critic-only** | Nashville Scene (Edd Hurt, June 2008), reached directly. Real, but Berman's own words, not found. Still Silver Jews' only edge — still fails the bar (Section E). |
| Low → The Cure | **CONFIRMED, own words** | Vice ("Rank Your Records," Cam Lindsay): Sparhawk — "I was seeing early Cure and Joy Division as the early touchstones." |
| Low → Codeine | **CONFIRMED, own words** | Same Vice article: Sparhawk — "I was pretty in awe of them." (See Codeine near-miss, Section C — this edge can't be added to the live graph unless Codeine itself gets promoted.) |

---

## E. Still flagged — thin or failing, your call (cut vs. accept as thin)

Per your orphan rule ("any node with ≥1 real edge = keep, a loose realm is fine, orphans are not"), **none of these seven are orphans** — each has exactly one genuinely real, confirmed edge — but none reaches the 2-edge bar either. Recommend a explicit per-artist decision rather than a blanket rule, since the *reason* each is stuck at 1 differs:

| Artist | Edge | Why it's stuck at 1 |
|---|---|---|
| **Bon Iver** | `→ radiohead` (critic-only, Pitchfork) | Specifically chased for a Neil Young edge this pass — not confirmed. His own emphatic influences (Springsteen, Dylan's *Basement Tapes*) are off-graph. Recommend: **cut**, unless you want to keep one thin critic-sourced node. |
| **Silver Jews** | `→ velvet-underground` (critic-only, Nashville Scene) | Not independently chased this pass (Dylan/Neil Young sweeps checked, found nothing). His real connections (Malkmus/Nastanovich/Pavement) are a membership-overlap, not influence (Section F). Recommend: **cut**, or accept as thin — your call. |
| **Carissa's Wierd** | `→ low` (critic-only, Bandcamp Daily) | Never independently chased. Short-lived (1995–2003), thin interview record by nature. Recommend: **accept as thin** — the Low connection is genuinely load-bearing for the slowcore genre's own history even if not first-person. |
| **The Microphones** | `→ beat-happening` (own words/documented mentorship — real, solid) | This is actually a *strong* single edge (Beat Happening's Bret Lunsford was Elverum's direct, named mentor), just alone. Recommend: **accept as thin** — arguably the strongest 1-edge case in this whole document. |
| **Japanese Breakfast** | `→ bjork` | Not part of this pass's chase list at all — carried forward unchanged from the DRAFT. Worth a follow-up pass (Mitski/Clairo scene-adjacency was explicitly excluded in Layer 1 for lack of a quote — a fresh search might find something). |
| **Liz Phair** | `← snail-mail` (inbound only) | Same — not chased this pass. Her own outbound influence (Rolling Stones) is off-graph; no other inbound connections were found in Layer 1. |
| **Men I Trust** | `→ radiohead` | Not part of this pass's chase list. Already flagged in the DRAFT as the weakest genre-fit in their family (Section 8.1 there) independent of the edge-count question. |

---

## F. Same-artist pairs — final disposition

Per your explicit rule, none of these four are `type: 'influence'` edges, and each successor project's fate now rests entirely on its OWN independent edges:

- **Sun Kil Moon ← Red House Painters** — Sun Kil Moon clears the bar independently (`→ modest-mouse`, `→ neil-young`). **Both nodes kept.**
- **Purple Mountains ← Silver Jews** — Purple Mountains has zero independent edges. **Cut** (Section A). Silver Jews itself survives as a node candidate only insofar as its own 1 edge goes — see Section E, still thin.
- **Mount Eerie ← The Microphones** — Mount Eerie has zero independent edges (the Beat Happening connection is Microphones-era specific, and a Mount-Eerie-era restatement wasn't confirmed). **Cut** (Section A). The Microphones itself survives with its 1 real edge — see Section E.
- **Giles Corey ↔ Have a Nice Life** — Giles Corey has zero independent edges. **Cut** (Section A). Have a Nice Life is unaffected (already clears the bar on its own 2 edges).

**Also unresolved, flagged again for a schema/human decision (unchanged from the DRAFT, not re-chased this pass):** `silver-jews ↔ pavement` — genuine founding-member overlap (Malkmus/Nastanovich via the UVA band Ectoslavia), real and documented, but not an influence claim in either direction under this document's citation rule.

---

## G. Updated genre id proposals (pruned)

Removed since their only motivating artist was cut: `gothic-americana` (was Ethel Cain-specific), `latin-folk` / `bolero` (was Natalia Lafourcade-specific), `neo-soul` / `jazz-pop` (was Amy Winehouse-specific, and that gap-flag is now moot since she's cut).

Remaining proposed genre ids, unchanged from the DRAFT:

| id | proposed name | proposed parent |
|---|---|---|
| `folk` | Folk | `underground` |
| `singer-songwriter` | Singer-songwriter | `folk` |
| `confessional` | Confessional | `singer-songwriter` |
| `freak-folk` | Freak folk | `folk` |
| `chamber-folk` | Chamber folk | `folk` |
| `indie-folk` | Indie folk | `folk` |
| `country-folk` | Country folk | `folk` |
| `alt-country` | Alt-country | `folk` |
| `slowcore` | Slowcore | `indie-rock` |
| `sadcore` | Sadcore | `slowcore` |
| `art-pop` | Art pop | `indie` |
| `bedroom-pop` | Bedroom pop | `indie` |
| `lo-fi` | Lo-fi | `indie` |

---

## H. Summary

**Final tallies, this pass:**
- **8 roster artists cut**, plus Lana Del Rey rejected as a summon (Section A): Amy Winehouse, Natalia Lafourcade, Tori Amos, Ethel Cain, Songs: Ohia, Purple Mountains, Mount Eerie, Giles Corey — and Lana Del Rey, who was never one of the 45 roster names, only a declined summon proposal.
- **28 roster artists now clear the bar** (up from 21 pre-pass), across the 5 families, via a combination of newly-pinned direct quotes (Adrianne Lenker, Big Thief, Fiona Apple) and the two new root summons (Sufjan Stevens, Sun Kil Moon, plus strengthening for many already-passing nodes).
- **8 summoned root nodes total**: Bob Dylan (8 edges) and Neil Young (10 edges) as the two new high-value densifying roots you asked for, plus Bright Eyes/Conor Oberst (3), Bert Jansch (2), Roy Harper (2), Karen Dalton (2), Incredible String Band (2), and newly-promoted John Prine (2).
- **7 artists still short of the bar but not orphaned** (Section E) — each has exactly 1 real, confirmed edge: Bon Iver, Silver Jews, Carissa's Wierd, The Microphones, Japanese Breakfast, Liz Phair, Men I Trust. Recommend explicit per-artist accept-as-thin/cut decisions rather than a blanket rule, per the notes in Section E.
- **4 same-artist successor pairs resolved** per your rule (Section F): Sun Kil Moon kept independently, Purple Mountains/Mount Eerie/Giles Corey cut for lack of independent edges.
- **Codeine is the single most promising unfinished lead** — one fully solid first-person edge (Low), blocked only by a second connecting artist that a tooling-limited pass couldn't find. Worth a dedicated follow-up search before this document is finalized, if you want to try for a 9th summon.

**Nothing in this document has been written to `data/seed-data.ts`, `data/types.ts`, or any other file.** Layer 3 — your final sign-off — is next.
