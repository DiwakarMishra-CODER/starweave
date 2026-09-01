# Wikipedia citation audit

Aug 2026. Data pass, no search budget spent. Triggered by noticing Wikipedia was the
single largest source in the `reported` tier.

**Scope:** Wikipedia appears in **119 edges** — 73 `reported`, 38 `first-person`, 8 `critic`.
All 73 `reported` were read and classified against the project's own panel-vs-prose test
(a claim with reasoning is citable; a bare name in a list is not).

## Headline

**43 of 73 (59%) are bare-name lists** — structurally identical to the AllMusic influences
panel the project blocks on sight. The rule was being enforced **by domain rather than by the
shape of the claim**, which is the thing the rule is actually about.

| Shape | Count |
|---|---|
| Bare-name list — fails panel-vs-prose | 43 |
| Real prose claim (mechanism, or a concrete fact) | 20 |
| Borderline / weak claim | 7 |
| Conflicts with an existing hard rule | 3 |

### Why deletion is the wrong response

An AllMusic panel is an uncited widget. A Wikipedia influences line is *supposed* to carry a
footnote — and several of these citations say "Wikipedia's **sourced** influence line," meaning
the footnote exists and nobody opened it. Chasing it converts a bare list into whatever the
real source is, which is often a genuine interview, and would move the edge **up** to
first-person. The worklist below is a research target, not a deletion queue.

Concrete proof of that: the two content-free Yeah Yeah Yeahs citations were chased this pass in
one fetch, and the footnote turned out to be Ethan Brown's "Oh, yeah?" in New York magazine.
That did not rescue them (see below) but it took one call to find out.

---

## Applied this pass

**Final state: 293 artists, 1,037 edges (−1), 30 `rejectedEdges` (+1).** `tsc` clean, no orphans
created. Tier movement across the whole pass: first-person 559 → 545, reported 218 → 224,
critic 121 → 122, unsourceable 140 → 146. Invariants: `sourceTier` set without a citation = 0,
pipeline-vocabulary leaks = 0, citations shorter than 40 characters = 0.

The single deletion is `fugazi → gang-of-four`, on a recorded artist denial — see below.

**Content-free citations rewritten (2).** `yeah-yeah-yeahs → sonic-youth` and
`→ the-birthday-party` both read only *"Wikipedia's sourced influence line for Yeah Yeah Yeahs."*
— which tells a reader nothing and also fails the finished-sentence rule. Chased to source: the
line is a **twenty-name list** running from John Zorn and PJ Harvey to Blondie, ESG, the Ramones
and Van Halen. That is the most extreme bare list in the audit, so both were rewritten to say so
plainly and **dropped 0.65 → 0.5**.

**Over-weighted bare lists re-scored (5).** These were scoring above genuinely-sourced prose
claims elsewhere in the graph:

| Edge | Was | Now | Why |
|---|---|---|---|
| `sonic-youth → rhys-chatham` | 0.85 | 0.6 | bare list, own page |
| `slint → minutemen` | 0.8 | 0.6 | bare list of 7, own page |
| `slint → big-black` | 0.8 | 0.6 | same list (also had garbled duplicated text, cleaned) |
| `interpol → fugazi` | 0.75 | 0.5 | bare name on the **target's** page |
| `underscores → 100-gecs` | 0.75 | 0.6 | bare pair of names |

**Rule conflicts ruled (3), each with the reasoning written at the edge:**

- `talking-heads → brian-eno` — the citation was **Eno produced *Remain in Light***. Production
  credit is an excluded category, so it could not support the edge regardless of how real the
  edge is. The influence is undisputed, which is exactly what `unsourceable` is for: **kept**,
  citation cleared, `sourceTier` cleared with it, 0.7 → 0.6. On the worklist.
- `neu → kraftwerk` — rests on **personnel overlap**, normally excluded. **Kept as a documented
  exception**: the rule exists to stop shared membership standing in as a *proxy* for influence,
  and here the successor band is constituted directly out of the predecessor, so the personnel
  overlap *is* the transmission. Commented so it isn't "fixed" later by analogy.
- `slowdive → brian-eno` — rewritten so the citable part carries the edge. Halstead's admiration
  is a real statement; Eno playing synth on two *Souvlaki* tracks is collaboration and was doing
  most of the work in the old wording. 0.65 → 0.6 (favourites tier).

**Also caught, outside the original scope:** `underscores → imogen-heap` carries **its own partial
denial** — underscores deflected the comparison in NME. Scored to the floor (0.7 → 0.5) and
flagged as a `rejectedEdges` candidate if a second pass finds the deflection is flat rejection
rather than a hedge.

---

## A verification gap in the previous cleanup

CLAUDE.md records that "citations referencing another edge" reads **zero**. It does not. The
check was written against the phrase `"same quote as"` and misses the bare `"same quote"`
variant. Three Ride edges were sitting on it:

- `ride → pixies` — the entire citation was *"Bell, Under the Radar, same quote."*
- `ride → dinosaur-jr`, `ride → the-fall` — *"…same quote naming…"*

All three **fixed this pass**, and honestly: the real Andy Bell quote was sitting on
`ride → the-stone-roses` twelve lines away, so each edge now carries the source independently,
which is the intended end state.

**But the three Ride edges were not the whole problem.** The true count, once the pattern was
widened far enough (`same quote|same source|same interview|same passage|same citation|same
RBMA`), was **23** — and each widening found more, which is itself the lesson: the invariant was
only ever as good as the phrase someone guessed.

**All 21 real instances are now fixed.** Each names its own source and carries its own quote.
Where the quote lived on a sibling — Halstead/Under the Radar, Bell/MusicRadar — the actual text
was pulled across rather than paraphrased. The clusters were Depeche Mode (5), OMD (4), Cabaret
Voltaire (2), plus scattered singles.

The 2 remaining matches are **false positives and should stay**: `alvvays → the-smiths` and
`the-dismemberment-plan → bad-brains` say "the same interview," meaning the one named inside
their *own* citation. A future check should expect 2, not 0.

## The five top-tier content-free citations — RESOLVED, and three were wrong

These were `first-person` at **0.85**, the graph's highest confidence, with citations naming a
publication but not what was said. I initially declined to re-score them, reasoning that the
defect was the citation and not the claim. **That was wrong for three of the five.** A
content-free citation is not a cosmetic problem — it is the place an unchecked claim hides.

### `fugazi → gang-of-four` — DELETED, denied by Ian MacKaye

The citation was *"DMY feature/interview on Fugazi."* MacKaye, to Gothamist: *"I remember in the
beginning of Fugazi everyone was saying 'Oh clearly these guys have listened to a lot of Gang of
Four.' But I had never listened to Gang of Four so it wasn't actually accurate."* He adds that
the songs being compared were his own, written before Picciotto began contributing: *"Guy was a
fan of Gang of Four but the stuff people were comparing to Gang of Four was written by me before
Guy started contributing compositions."*

A **never-listened-to-them** denial — categorically stronger than the "we don't sound like X"
pattern the rules already warn is *not* a denial, and the same shape as Cobain on Joy Division.
Logged to `rejectedEdges` as **contested** rather than clean, precisely because MacKaye confirms
Picciotto's fandom: the denial covers the songs at issue and MacKaye's own listening, not every
member. Fugazi keeps 25 edges. **This is also the fifth instance of the pattern CLAUDE.md already
records — the denied edge is the band's single most-repeated critical comparison.**

Verified on the Gothamist page directly, not from the search summary that surfaced it — the
fabricated-quote rule applies to exactly this situation.

### `pixies → sonic-youth` — unsourceable

The named Kerrang piece is Frank Black on Nirvana and never mentions Sonic Youth. Joey
Santiago's own five-influences feature names the Bee Gees, the Cars, Link Wray, the Ventures and
the Beach Boys — no Sonic Youth. Kept at 0.5 `unsourceable`; absence of a located source is not
a denial, and the rule against inferring `unsourceable` from one pass's silence applies.

### `idles → gang-of-four` and `idles → joy-division` — unsourceable

NME's 2020 cover interview names no influences at all. Talbot's own favourites list, given as
guest DJ on NPR's *All Songs Considered* (2019), names Radiohead, Lee Moses, Leikeli47, The
Pharcyde, Van Morrison, Crows and Slowthai — neither band. **The list that does pair IDLES with
both traces to TV Tropes**, an excluded source. Both kept at 0.5 `unsourceable`.

Incidental lead: Talbot's NPR list names **Radiohead**, and no `idles → radiohead` edge exists.

### `neu → velvet-underground` — the one that held up, downgraded anyway

Uncut's "lost" Neu! interview, recorded 2000 around the reissues. Klaus Dinger: *"Velvet
Underground was in there. Also The Beatles, several years before, like Michael said, also The
Stones, all the big ones I would say."* Rother adds only *"That was in the background too, yeah."*
Real and first-person, but an acknowledgement of background listening rather than a claim about
shaping Neu!'s sound — **0.85 → 0.7**, with the hedge stated in the citation.

---

## Second sweep: the 38 Wikipedia-sourced `first-person` edges

Prompted by the Fugazi find — `first-person` is the highest-trust tier and therefore the worst
place for an unchecked citation. Two distinct defects, both now fixed.

### Mis-tiering (7 edges)

`first-person` should mean the artist's own words are in hand. These had none — the source is
Wikipedia *summarising* what members cited, which is reported speech.

- **Six Depeche Mode edges** (`→ david-bowie`, `velvet-underground`, `cabaret-voltaire`,
  `siouxsie-and-the-banshees`, `talking-heads`, `the-clash`) retiered to `reported`. Three of
  them rest on *"Gahan's and Gore's **favourite artists** included…"* — a favourites list, not a
  stated influence, so also dropped 0.75 → 0.6.
- **`gary-numan → david-bowie`** retiered to `critic`: both halves are a writer's assertion
  (AllMusic prose plus Wikipedia), no Numan quote. Flagged at the edge that Numan is a
  documented denial risk on this exact framing — he has disputed the Kraftwerk attribution and
  credited Ultravox instead.

### Excluded-category edges sitting at first-person 0.8 (3 edges)

- **`harold-budd → cocteau-twins`** and **`harold-budd → brian-eno`** — Budd's *only* two edges,
  and **both** rest on excluded categories: a co-recorded collaborative album (*The Moon and the
  Melodies*) and a production/co-composition credit respectively. Deleting both would orphan the
  node, so both are kept as `unsourceable` with citation and `sourceTier` cleared — same
  disposition as `talking-heads → brian-eno`. **The Cocteau Twins edge also has a direction
  problem**: Budd's ambient work predates the Cocteau Twins entirely, so if anything the
  influence runs the other way. Flagged as a deletion-or-reversal candidate, not acted on, since
  a collaboration is not evidence of influence in either direction.
- **`tricky → massive-attack`** — rests on membership and was mis-tagged first-person. Retiered
  to `reported` and **kept as a documented exception**, same reasoning as `neu → kraftwerk`:
  Tricky came up inside the Wild Bunch as it became Massive Attack and rapped on two of their
  albums before going solo, so the membership is the transmission rather than a proxy for it.

### Left alone deliberately

`sonic-youth → black-flag` (SST-label admiration — label adjacency, but already self-flagged at
0.5) and `sigur-ros → cocteau-twins` (Jónsi says he hadn't heard them until Alex Somers played
them to him, which undercuts formative influence — already self-flagged at 0.5). Both are honest
about their own weakness in the citation text; noted here so a later pass doesn't re-derive them.

---

## Footnote chase — the four multi-edge lists, opened

Each of these was **one footnote paying for 3–4 edges**. All four were opened this pass. **None
resolved to a first-person source, and none justified an upgrade** — which is the opposite of
what the "chasing footnotes moves edges up" theory predicted, and worth recording as the actual
result rather than the hoped-for one.

1. **Wikipedia/Faust** — 3 edges (`radiohead`, `sonic-youth`, `cabaret-voltaire` → `faust`).
   The sentence — *"They have been cited as an influence by Radiohead, Swell Maps, Throbbing
   Gristle, Cabaret Voltaire, Stereolab, Simple Minds, Sonic Youth, Mark E. Smith, Nurse with
   Wound and Madlib"* — carries **two footnotes for ten names**: a Quietus piece on The Fall's
   *Perverted By Language* (which can only support Mark E. Smith) and Alexis Petridis's 2021
   Guardian interview with Faust. Neither is about Radiohead, Sonic Youth or Cabaret Voltaire.
   **All three edges are unsupported by the footnotes they inherit.** Next step is the Petridis
   piece, then the descendants' own interviews.
2. **Wikipedia/Have A Nice Life** — 3 edges (`→ new-order`, `→ swans`, `→ kraftwerk`).
   Footnote is a **RateYourMusic page**, archived 2008, titled "Have A Nice Life - Middletown, US
   - Gothic / Industrial / Shoegaze" — which is RYM's *artist-page* title format, not an
   interview. If that reading is right these fall under the excluded **RYM user list** category
   rather than the permitted Sonemic *interview* category, and the distinction decides all three
   edges. Not settled: `web.archive.org` is blocked to the fetch tool, so the archived page could
   not be opened. **This is the single highest-value unresolved item in the audit.**
3. **Wikipedia/Dolores O'Riordan** — 4 edges (`the-cranberries →` `the-smiths`, `the-cure`,
   `rem`, `depeche-mode`). The sentence is a **writer's assertion**, not a quote: *"When she had
   reached the age of 16, O'Riordan had started listening to the Smiths, the Cure, R.E.M., and
   Depeche Mode, which constituted her primary musical influences."* Footnote resolves only to a
   short-form book key ("DIGT"), not expanded in the page body.
4. **Wikipedia/OMD** — 4 edges (`omd →` `neu`, `velvet-underground`, `david-bowie`, `brian-eno`).
   Also a **writer's assertion**: *"Other formative influences included the Velvet Underground,
   Neu!, Roxy Music, Brian Eno and David Bowie."* Footnote is a book key ("Maxwell 2010"). Note
   the separate `omd → kraftwerk` edge is much stronger and unaffected — it has McCluskey
   crediting *Autobahn* directly.

**Pattern across all four: the Wikipedia influence line is a writer's summary, and the footnote
underneath is either a book key, a thin ref, or a user-editable page.** The "sourced influence
line" phrasing used in several of our own citations implied more than the footnotes deliver.

Remaining, lower yield: `talking-heads → brian-eno` (a first-person Byrne statement almost
certainly exists), and `idles → radiohead`, a plausible new edge surfaced by Talbot's NPR list.

### The weakest sub-shape, for future reference

**Eight edges are downstream lists on the ancestor's page** — "Can were referenced by… Gary
Numan, JAMC, Primal Scream", "cited as an influence by Radiohead, Swell Maps, Throbbing
Gristle…". Nobody checked the descendant's own testimony; the claim is an aggregation sitting on
the target. This is the same failure the search-method rule already names — *never search "who
cites X", search the suspected descendant's own interviews* — showing up in the data rather than
in the search log.

Two of these eight touch nodes with recorded denial history: `gary-numan → can` (Numan is
documented elsewhere disputing exactly this framing, crediting Ultravox) and the Yeah Yeah Yeahs
pair (denial-prone node per the unchecked-edges pass). Check those against `rejectedEdges`
before spending a fetch.

Also self-flagged in its own citation and worth an early look: `at-the-drive-in → fugazi`, whose
underlying footnote is a **dead link**.
