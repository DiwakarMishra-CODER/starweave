# The source pass: every existing connection, properly sourced

Written 2026-10-26, to start in a fresh chat. Additions (new artists, new
connections) come after, in their own pass; this one makes the 1,053 links
already on the map correct and one click from their source.

## Where we start (measured 2026-10-26)

- 1,053 links: 908 cited (562 first-person, 224 reported, 122 critic), 145
  marked `unsourceable`. **0 carry a link to their source.**
- 554 of the cited ones quote someone; 561 name no year; ~730 distinct
  sources (114 of them used by two or more links).
- Sampling shows real fixes are needed, not just links: 116 cite Wikipedia
  (often with no footnote behind it), ~92 open on a vague source ("A
  biography", "AllMusic", "Far Out" lists), ~30 still leak internal words
  ("graph node", "Wikipedia/X"), and some don't say what the link says at
  all (e.g. `red-house-painters -> galaxie-500` cites an AV Club line that
  only lists both as slowcore bands; `pulp -> david-bowie` cites an Apple
  Music editorial playlist, which our rules exclude). Expect roughly one in
  six to need rewording, re-tiering or a decision.

## The bar for "done" (one link)

1. A link to the page that actually carries the claim, opened and read --
   never a search summary (CLAUDE.md: the search tool has fabricated quotes).
   Print-only sources: book, edition, page, marked as print.
2. Any quote is verbatim on that page, and it's the right person speaking
   (whose "I"; interviewer vs subject; the right band member).
3. It says influence, in the right direction, at the right tier
   (first-person / reported / critic), and the dates work (release dates).
4. The citation reads as a finished sentence: who, where, when, what was
   said. No pipeline words.
5. Wikipedia only as a last resort: follow its footnote to the real source
   and cite that; a Wikipedia claim with no footnote is reported-tier at best.

## How it runs

**The ledger, not seed-data.** Each link's evidence goes in a new file,
`data/edge-sources.ts`, keyed `source>target`: `url`, `found` (the exact
sentence on the page), the revised `citation`/`sourceTier` when they change,
`checked` (date) and a `verdict` (`ok`, `fixed`, `print`, `not-found`,
`decide`). The build merges it onto the edges in `graph.json`. Why: 900
hand edits to `seed-data.ts` would take days, and CLAUDE.md forbids
scripting them. `seed-data.ts` keeps who-influenced-whom; the ledger keeps the
proof. Only links that must go (or change direction) are edited in
`seed-data.ts`, by hand, after the owner's yes.

**Never verify twice.** A link with a ledger entry is done. Each session
takes the next batch from `research/source-pass/queue.json` (built once:
links grouped by shared source, so one interview is read once for all its
links) and appends to the ledger. A script reports what's left.

**Cheapest path first, per source:**
1. No search at all when the URL is predictable: Wikipedia articles (follow
   the footnote), artist-curated sites (cocteautwins.com, the Red Hand Files,
   Björk's site), Quietus Baker's Dozens by name.
2. One search for the exact quote (or outlet + artist + year), open the hit
   (`r.jina.ai/<url>` for 403s), confirm.
3. A second search only if the first found the outlet but not the page.
4. Then stop: verdict `not-found` with what was tried. No third search, no
   digging. These go to a short list at the end.

**A machine double-check instead of re-verifying by hand.** A script fetches
every recorded `url` and checks `found` is really on the page. It uses no
searches. Mismatches are re-opened; everything else stands.

**Search budget and stopping.** WebSearch allows ~200 calls per session,
shared by every agent (measured in the R&B pass). Plan ~170 per session.
At 170, or the first "budget exhausted", the session stops: agents finish
the source they're on, the ledger is written, the check script runs, and
the next chat picks up from the queue. No pushing on with workarounds.

**Agents.** Three in parallel per session, each with its own batch and a
~55-search share, each reporting its own search count and tool status (so a
thin result can be told from a blocked one). Their brief: this file's bar,
the CLAUDE.md source rules (Grokipedia, aggregators, AllMusic panels, the
Student Playlist, covers, personnel/label/production, editorial playlists),
and the ledger format.

**More connections, for free.** While a source is open, the agent also
notes any other roster artist the speaker names as an influence, and any
denial, with the sentence and URL, into `research/source-pass/candidates.json`.
No extra searches. They're written in the additions pass, after rulings.

**Missing artists, tallied for free.** Likewise, any artist *not on the
map* whom the speaker names as an influence (a real influence statement,
not a passing mention) goes into `research/source-pass/off-map.json`: the
name, who named them, the sentence, the URL. Nothing is researched or added
during this pass. Both kinds of note come only from the passage already
being read for the quote -- no scanning the rest of the page or the whole
interview for names -- so they cost no searches and seconds per source. At the end the tally ranks the most-named missing artists
-- what the artists themselves point to -- as the shortlist for the
additions pass, checked against `research/roster-backlog.md` (Kate Bush, PJ
Harvey and the rest) and catching gaps nobody thought of, the way PJ Harvey
was missed.

## Order

0. **Setup (no searches):** the ledger type and build merge; "Source ↗" on
   the artist panel, the artist page and today's record (print shown as
   print); the queue builder; the check script; a test that every today's
   record "why" line has a link.
1. **Today's record "why" lines (~83):** the most-seen quotes, and some read
   badly; pick a better line from the same source where needed.
2. **First-person (562),** most-connected artists first.
3. **Reported (224), then critic (122).** Wikipedia ones mostly need no search.
4. **The 145 `unsourceable`:** one try each to find a real source; otherwise
   they stay, honestly marked.
5. **The decide list,** shown to the owner once: links that should go, change
   direction, or be recorded as a denial.

## How long

- Setup: about an hour, no searches.
- Verification: about 750 sources at ~1 search each -> **5 sessions** of ~170
  searches, plus 1 for the unsourceable ones. With three agents a session
  takes roughly 1.5-2 hours, so **about 6-7 sessions, 10-14 hours in all**,
  across several days with usage limits in between.
- Then the additions pass: the candidates found on the way, the roster
  backlog (`research/roster-backlog.md`) and the twee pop founders.
