# Layer 1 research — Kelela / The Breeders / Natural Snow Buildings

Aug 2026. Pure research, per the three-layer rule. Nothing written to `seed-data.ts`.
~9 WebSearch calls; most pages reached through `r.jina.ai`.

---

## 1. Kelela — SETTLED NEGATIVE. Close this out.

The open question was her Björk edge, held because two pages were blocked. Both were
reached this pass. Neither carries the claim.

**The Björk claim has an origin, and it is not Kelela.** It traces to Afropop Worldwide's
*Take Me Apart* feature: *"Moreover, art-pop artist Bjork was instrumental in her artistic
development as well, serving as one of her biggest influences."* That is the **writer's
assertion with no source cited** — the piece's only named interview is a Beats 1 appearance
and it does not attribute the claim there. This single unsourced sentence is why "Björk
influenced Kelela" reads as well-sourced across search summaries. Same shape as the
honeydip/4AD aggregator-blurb case already in CLAUDE.md.

Four real interviews read in full, zero first-person Björk statement:

| Source | Result |
|---|---|
| The Quietus, *Power In Vulnerability* | Björk appears **only in the journalist's framing** (a "Tinder album" comparison). Kelela does not affirm it. Classic "whose 'I' is it." |
| The FADER cover story (Oct 2017) | Björk **absent entirely**. Writer names Makeba, Sarah Vaughan, Bobby Womack, Janet Jackson, Tracy Chapman — writer's words, not hers. |
| NPR, *Kelela On Taking Herself Apart* | Björk absent. Her own named influences: **Erykah Badu** (*Mama's Gun*), **Lauryn Hill** (*MTV Unplugged No. 2.0*). Neither on roster. |
| Rolling Stone, *In the Blue Light* (the blocked page) | Björk absent. |

**Rolling Stone / Joni Mitchell also resolves negative, and more strongly than "no source."**
Kelela *defuses it herself*: she came to Mitchell **in her twenties**, drawn to the jazz era,
and explicitly notes she did not grow up with her as a second-generation Ethiopian American.
So the edge fails twice — cover-derived (the existing false-positive rule) **and** contradicted
by the artist. Her real enthusiasms there are Betty Carter (*"I'm obsessed with Betty Carter"*)
and Amel Larrieux. Neither on roster.

**Quietus Baker's Dozen: does not exist.** The notes flagged this as the cheapest high-yield
check. Answered: negative. Do not spend budget on it again.

**Verdict: Kelela is settled-not-unchecked.** Her testimony is abundant and points consistently
off-roster — same disposition as Sampha, reached by a different route. The only Björk fact that
survives is the reverse and non-encodable: Björk was an early *fan* of *Cut 4 Me*. Endorsement,
wrong direction, and Kelela is not a node.

---

## 2. The Breeders — 1 strong edge, not 3. Writable as thin-but-real.

Citations recovered. The three candidates in `seed-data.ts` do **not** survive equally.

### WRITE — `nirvana → the-breeders`, 0.85, first-person
Cobain in **Melody Maker, 1992**: *"I wish Kim was allowed to write more songs for the Pixies,
because 'Gigantic' is the best Pixies song, and Kim wrote it."* And with a stated mechanism —
*"The main reason I like them is for their songs, for the way they structure them, which is
totally unique, very atmospheric…"* Surfaced via KEXP's *Cobain 50* series on **Pod** (1990).
Corroborated from the other side: Kim Deal has said *"I think they got Steve Albini to record
In Utero because they really liked Pod."*

This is a mechanism claim, not a favourites mention — the strongest tier. Note the repo already
carries the adjacent 1992 list quote (*"Breeders, Pixies, R.E.M., the Jesus Lizard, Urge
Overkill, Beat Happening, Dinosaur Jr and Flipper"*) on four other Nirvana edges.

### DO NOT WRITE — `st-vincent → the-breeders`
No influence statement found. What exists is **professional adjacency only**: Clark guesting
with the reformed Nirvana lineage alongside Kim Gordon and Joan Jett, and Kim Deal separately
admiring the *New York* video and hiring its director. Personnel/collaboration — excluded.
The "weak" tag in the handover was correct.

### DO NOT WRITE — `beabadoobee → the-breeders`
**The claim collapses on inspection.** A search summary asserts she cites the Breeders as an
influence "specifically mentioning their stage fashion" — i.e. *clothes*, not music, and the
underlying page could not be produced. The Boar's *Fake It Flowers* interview, the piece where
she enumerates her influences, **does not mention the Breeders or Kim Deal at all**.

### `liz-phair → the-breeders` — still not citable
Sourced only to AllMusic's **influences panel** (16 names). Blocked at source by the existing
panel-vs-prose rule. Unchanged.

### `courtney-barnett → the-breeders` — actively excluded, not merely unsourced
Worth recording because it looks like the easiest edge in the set and is a clean trap. Every
tie is a **non-influence category, all four at once**: she covers "Cannonball" live (cover),
she sang on the Breeders' *All Nerve* and the Deals sang on *Tell Me How You Really Feel*
(collaboration, both directions), and they interviewed each other for Talkhouse (peer
conversation). The earlier AllMusic 403 was a lucky escape.

### Bonus, if the node is written — upstream
Kim Deal names **Neil Young** (node, in-degree 23): *Harvest* on constant cassette rotation in
her Volvo while writing *Fate to Fatal*. First-person and specific, but it is "what I was
listening to while writing" — favourites tier, ~0.6, and the source page was not opened
directly this pass. Her other named frontwomen (Chrissie Hynde, Nancy Wilson, Debbie Harry,
Grace Slick) and country roots (Kitty Wells, Dolly Parton, Patsy Cline, Loretta Lynn) are all
off-roster. **Pixies and Throwing Muses are personnel overlap — not edges.**

**Verdict:** 1 solid edge clears the no-orphans bar, same handling as Wilco, The Chameleons and
trail-of-dead. Write thin-and-flagged, or keep held — but the "2–3 edges" in the handover was
optimistic and should be corrected to 1.

---

## 3. Natural Snow Buildings — CLEARS. 2 roster edges, both first-person.

French drone/free-folk duo, Mehdi Ameziane and Solange Gularte. Never researched before.

**Their OndaRock interview enumerates influences directly**, and two land on the roster:

- `natural-snow-buildings → neil-young` — ~0.7, first-person
- `natural-snow-buildings → stars-of-the-lid` — ~0.7, first-person

Quote: *"Kath Bloom and Loren Mazzacane Connors to Tarentel, Neil Young, Six Organs Of
Admittance, Charalambides, Alice Coltrane, Stars Of The Lid, film scores, music from all parts
of the world."* A named list without a per-artist mechanism, so favourites-to-influence tier,
not 0.85. Off-roster in that list: Kath Bloom, Loren Mazzacane Connors, Tarentel, Six Organs of
Admittance, Charalambides, Alice Coltrane.

**Stars of the Lid is currently at in-degree 1** — this would double it, which is worth more to
the graph than the edge count suggests.

The one influence they state emphatically is **Fursaxa** — *"Fursaxa is definitely a big
influence (where is she, by the way?)"* — not a node, and not worth adding for one edge.
Also named, but as **current listening rather than influence**, so a weaker tier and not
recommended: Swans (node), Angel Olsen (node), plus Wolvserpent, Horseback, Komeda, Fabio
Frizzi, The Haxan Cloak, Deux Filles, Mamiffer, Eat Skull, LAFMS, Joanna Gruesome, Jessica Pratt.

**Do not re-run their Brainwashed interview for influences.** They decline the question there on
principle: *"Our music is open to any influence… They can come from France, Sudan, Ethiopia,
India, USA, Japan, Indonesia."* That is an artist-level refusal to name names, not a gap — the
OndaRock piece is the one that answers it.

**Downstream not researched** (expensive, and 2 upstream edges already clear the bar). RYM hosts
two user-compiled "NSB influences" lists — **user lists, not citable**, lead-only.

**Verdict: writable.** Realm `post-rock-drone-noise`, lineage `drone`, on the colour model.

---

## Bonus edges found incidentally — beabadoobee

Both from The Boar (Nov 2020), *"my biggest influences are girls who rock"*, first-person,
neither currently in the graph:

- `beabadoobee → lush` — *"girls who rock like Lush and Veruca Salt."* Lush is a node; Veruca Salt is not.
- `beabadoobee → dinosaur-jr` — named among the *Fake It Flowers* influences alongside Sonic Youth, Smashing Pumpkins and Stephen Malkmus (of her four, only Dinosaur Jr and the already-written Sonic Youth are nodes).

Confirm the exact sentence before writing; found via a fetch answering a targeted question, not by reading the full page.

---

## Method notes

- **Grokipedia surfaced twice** (Kelela, Natural Snow Buildings). Discarded unread both times. Now 15+ encounters.
- **The recurring-summary trap fired twice in one pass**, and both times the fix was the same: chase the sentence to the page that carries it. Kelela/Björk traced to one unsourced Afropop line; beabadoobee/Breeders traced to nothing at all. Neither would have been catchable at the domain level.
- `r.jina.ai` again did the heavy lifting — it recovered the Rolling Stone page that had been recorded as blocked, and Quietus, FADER, NPR, The Boar, Brainwashed and OndaRock all came back clean through it.
