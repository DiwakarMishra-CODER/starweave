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
   they stay, honestly marked. Measured 26 Oct: none carries any citation
   text; they're mostly old "obvious" links never sourced, many among the
   map's most famous (the Smiths > Bowie, MBV > Cocteau Twins, the Sundays >
   the Smiths), so expect a better hit rate than not-found retries. Some
   are likely wrong (`nico>velvet-underground` is personnel: decide).
   Owner's order (26 Oct):
   1. Free first: Quietus Baker's Dozen picks that back them, and
      Wikipedia footnotes opened with `read` (no searches).
   2. Then search the ones visitors see most: links between well-known
      artists (rank by both ends' in-degree) and today's-record artists.
   3. Leave the obscure tail honestly marked `unsourceable`; don't spend a
      search on each.
   Checkers do these, not Claude chat (see session 3 lessons).
5. **The decide list,** shown to the owner once: links that should go, change
   direction, or be recorded as a denial.
6. **Readable for a visitor (owner said yes, 26 Oct; no searches).** Measured:
   citations run a median ~230 characters (10% over 330, max 510), and many
   name a speaker a visitor can't place ("Max Bassin to Still Listening").
   - Clean-up over the ledger, rewriting only from what's recorded (quotes stay
     verbatim, cut with `...`): say who the speaker is when they aren't the
     band ("Max Bassin, Geese's drummer"), one claim from one page (drop
     "He also names..." tails and unlinked second sources, e.g.
     `nirvana>sonic-youth`'s *Journals*), aim for ~200 characters. Folds
     into the `reworded` clean-up for unsourced links. Scan the rewrites
     before merging; re-run `check`.
   - A plain label beside "Source ↗" from `sourceTier`: "In their words" /
     "Reported" / "A critic's view". Show the owner a mock-up before building.

## How long

- Setup: about an hour, no searches.
- Verification: about 750 sources at ~1 search each -> **5 sessions** of ~170
  searches, plus 1 for the unsourceable ones. With three agents a session
  takes roughly 1.5-2 hours, so **about 6-7 sessions, 10-14 hours in all**,
  across several days with usage limits in between.
- Then the additions pass: the candidates found on the way, the roster
  backlog (`research/roster-backlog.md`) and the twee pop founders.

---

## The Quietus Baker's Dozen sweep (owner said yes, 26 Oct) -- in progress

For the additions pass (and as a source for existing links), no searches.
Files in `research/source-pass/bakers-dozen/`; tool
`scripts/source-pass/bakers-dozen.ts`.
- Done: the 624 Baker's Dozens on the Quietus sitemap matched to the map;
  `speakers.json` lists the 89 by artists on it (a band member counts for the
  band; false matches like Nicky Wire or Sophie Ellis-Bextor dropped).
- Running when the chat ended: `npx tsx scripts/source-pass/bakers-dozen.ts
  fetch` (four at a time, ~6s a slide). It resumes where it stopped: dozens
  already in `picks.json` are skipped and slides are cached in `.pages/`.
  Re-run it until the log says `done`, then check `failed.json`.
  Some dozens come back with 0 picks (the Fall's, Brix Smith): probably an
  older layout with no slide links; open one with `ledger.ts read` and adapt
  `parse` before judging.
- Then: `bakers-dozen.ts sort 3` (writes `sorted.json` and `judge-1..3.json`),
  and three Sonnet checkers (medium effort, no searches) following
  `bakers-dozen/JUDGE.md`, each writing `judged-<n>.json`.
- Then by hand: `influence` picks of kind `new` go to `candidates.json`,
  `existing` ones become ledger entries (verdict `fixed`, url = the slide,
  for links whose ledger entry is missing, `not-found` or `decide`), and
  off-map `influence` picks go to `off-map.json`. Scan citations before
  merging, as with checkers.

## After the pass: publish the dataset (owner said yes, 26 Oct) -- for the resume

Once the decide list is settled (not before: unchecked claims shouldn't go
out under the owner's name), about an hour:
- Export `data/export/`: artists.csv (id, name, realm, genres, years),
  influences.csv (source, target, tier, citation, source URL, the quoted
  sentence), denials.csv, and a README on method (the rules, what counts as
  influence, the verification pipeline). No photos or cover art (Deezer's and
  Apple's); quotes kept short as now. CC BY 4.0 for the owner's own work.
- Publish on Kaggle with a short notebook (most-cited artists, influence
  chains, how many old citations held up), then Zenodo for a DOI. Optional:
  first-person links to Wikidata as "influenced by" with references.
- The resume line is the method, under the Starweave project, with the final
  numbers filled in: "Built a source-verified dataset of ~1,000
  music-influence claims: multi-agent LLM pipeline that checks each claim
  against the original page, with automated re-verification of every quote;
  corrected N% of legacy citations and flagged N% as unsupported. Published
  on Kaggle (CC BY 4.0)." Keep the measured numbers as the pass goes
  (fixed vs ok vs decide counts from `ledger.ts status`).

## Owner's optional list -- remind the owner only at the very end of the pass, or when they ask

Optional, owner's call (26 Oct): don't raise these session by session; bring
the whole list up once at the end (or when the owner asks for it).
- Pages to open (live list: `ledger.ts status`, "for the owner to open"):
  Clairo's Apple Music "Influences" playlist (her notes on Elliott Smith and
  Joni Mitchell), FKA twigs' 2014 Mercury Prize Q&A on YouTube (X-Ray Spex),
  the LSQ podcast ep. 105 with Ezra Koenig (Radiohead, Neil Young, Belle and
  Sebastian), R.E.M.'s 1983 Alternative America interview on Rock's Backpages
  (Velvet Underground).
- The Candy Claws Break Yr Legs interview on Tumblr (a bot wall to `check`):
  confirm "you got me really into The Knife" and "I listened to Starflyer and
  My Bloody Valentine" are on it.
- Whether to build the no-search Quietus Baker's Dozen sweep for the
  additions pass, and whether to add Boris (named by Wayne Coyne).

## Progress (session 4, 26 Oct 2026) -- read this first in the next chat

**Where it stands: all 1,053 links worked.** Verdicts: 634 fixed, 75 ok,
23 print, 152 decide, 160 not-found (84 of them old unsourceable links that
stay honestly marked), 9 blocked. Searches: ~157 here (c21-c23, u1), 29 on
the owner's chat (retry5, retry6); retry7 (15 not-founds from c21/c22) was
handed to the owner's chat and not yet pasted back when this was written.

**Done this session:**
- Critic and the last reported links (c21-c23), the unsourceable phase (u1:
  56 best-known, 36 searches; u2: 78, free routes only). Before u1/u2 the
  owner screened the list: 5 sent straight to decide unsearched (Nico>VU,
  Harold Budd>Eno, Dirty Three>Bad Seeds, Talking Heads>Eno, Mono>Explosions
  in the Sky), cautions in the prompts for label/scene/soundalike pairs.
- **The Quietus Baker's Dozen sweep is finished.** 89 dozens fetched (a 2012
  layout with "# 2." and the pick in bold on the next line is now parsed);
  three judges read the 281 on-map picks. 15 existing links got the artist's
  own words (6 had no source; OMD x3, Slowdive>Siouxsie, Deerhunter>
  Stereolab, B&S>Cocteau Twins lifted to first-person; Eno>VU off the decide
  list; New Order>Sparks off print). 61 new links went to `candidates.json`
  (foundBy `quietus-judge-n`, each with its citation). Off-map tally: 598
  names, the Beatles first; the owner wants **no mainstream additions**
  (no Beatles, jazz or classical minimalists) -- indie only.
- `ledger.ts merge [names…]` now merges only the named results files (a bare
  `merge` pulled in running checkers' partial files unreviewed).

**Next:**
1. retry7's chat was refused mid-run; its two good leads were verified and
   merged (Yo La Tengo>Big Star, King Gizzard>Kraftwerk). Its other 13 stay
   not-found (Snail Mail>Duster's only lead is "I really like Duster right
   now", Spin Dec 2018: current listening, not influence).
2. `check` ran: 784 found + 18 via archive, 7 owner-pasted, 9 missing, 2
   unreachable (check-report.json). Re-open the 11 (Candy Claws Tumblr,
   two PressReader, Alvvays>Pavement on Wikipedia, philnel.com, the Clash
   archive, premierrockforum, Las Vegas Sun x2).
2b. **Owner's order (26 Oct): sweep first, then drop.** Fetch more no-search
   influence series to find new links and rescue not-found/decide ones:
   Pitchfork's 5-10-15-20 (sitemap.xml opens with curl but covers only ~5
   years: 22 features; list older ones via the Internet Archive), Spin's
   "Records That Changed My Life" (Cloudflare wall: archive copies), Fender
   "Under the Influence", Stereogum interviews. Judge like the Quietus. Then
   drop what's still unsourced (owner leans to keeping only sourced links;
   dropping not-found alone orphans 5 artists, dropping decide too orphans 22).
3. **The decide list (152), shown to the owner once** (Order step 5), then
   step 6 (readability clean-up + tier label, mock-up first).
4. Owner's flagged roster questions for the decide pass: Silversun Pickups
   and Editors (thin, mainstream); Charli XCX, Imogen Heap, Porter Robinson
   (hyperpop lineage, keep likely); Sheena Ringo stays (art rock), needs her
   own words on influences (Japanese interviews) in the additions pass.
5. CLAUDE.md's "search tool fabricated a quote" example (Matt Pryor, "My
   guitar is attempting to channel Drive Like Jehu") is wrong: the 2011
   Alternative Press track-by-track carries it (archive 20110128074729).
   Correct it with the owner's OK.

## Progress (session 3, 26 Oct 2026)

**Where it stands:** first-person 494/494 and today's-record 68/68 done;
reported 209/224; critic 15/122; unsourceable 0/145. Verdicts: 539 fixed,
67 ok, 86 decide, 20 print, 66 not-found, 8 blocked. `ledger.ts status` is
live. Searches: 115 here (c15-c20), 63 on the owner's Claude chat (retry3,
retry4, chat6).

**Next session, in order** (owner's plan: a fresh chat, three checkers in
parallel, ~55 searches each):
1. `status`. If `research/source-pass/bakers-dozen/fetch.log` doesn't end in
   `done`: first `ps aux | grep bakers-dozen` (session 3's re-fetch may still
   be running; two fetches would both write `picks.json`), and only if none
   is running, re-run `bakers-dozen.ts fetch` (it was re-fetching 50 dozens whose
   slides failed while the checkers shared the proxy; pages are cached).
   Check `failed.json`; a dozen with failed slides can be dropped from
   `picks.json` and fetched again.
2. Quietus judging (no searches; can run beside the checkers):
   `bakers-dozen.ts sort 3`, then three Sonnet judges (medium) on
   `judge-1..3.json` per `bakers-dozen/JUDGE.md`. **Only picks of artists on
   the map are judged** (owner, 26 Oct); off-map picks are only counted, in
   `off-map-tally.json`, and the top ~30 names can be judged later on their
   own (~100 picks). Then by hand: `new` influence picks to
   `candidates.json`; `existing` ones become ledger entries when the link is
   missing, not-found, decide, **or below first-person** (owner, 26 Oct:
   lift reported/critic/unsourceable links to the artist's words for free).
   Brix Smith Start's dozen (the Fall) uses an old layout; `fetch` now
   counts its slides from `/2/` ("Page 1 of 13").
3. Checkers on `critic` (107 left, incl. the 17 chat6 never started), the
   last ~15 `reported`, then the famous `unsourceable` ones (step 4 of Order).
4. Then `check` (re-opens every page this session added; not run yet).

**Session 3 lessons:**
- **`merge` takes unfinished results files too** (it merges whatever's
  there). Review a checker's file before merging: move it out of
  `results/` into the scratchpad, read the rewrites, then copy it back
  and merge. A stopped checker's partial file: set `finished: true`, merge,
  then trim its batch to the merged keys (or the rest stay "taken").
- What the review caught: years a checker guessed (2024, 2009, 2016 not on
  the page), a second page's sentence folded into a citation, a quote about
  which bands to tour with read as influence (Pavement/Ibold), a quote cut
  so the link's artist fell out (Brand New "Possibly the Stone Roses"),
  bare favourites and "discovered later" kept as influence (Rites of Spring).
- `print` entries need a `print` field (author, title, year, page) or the
  merge refuses them.
- **Claude chat is good for not-found retries** (retry3 13/32 with my
  archive opens, retry4 11/29) **and bad for fresh critic links**: chat6 did
  15 of 32 over four replies (huge page fetches), quoting only short
  fragments. Use checkers for fresh links. Chat can't open web.archive.org
  URLs; its packs now say to hand those back as `blocked` with the archive
  URL, and `read` opens them here at no search cost (Brand New, The
  National, Blonde Redhead's Pitchfork original all came back that way).
- Unsourceable links carry no citation text at all; many are the map's
  most famous lines (see Order step 4).

## Progress (session 2, 26 Oct 2026)

**Where it stands:** first-person 472 / 494 worked, all 68 today's-record
links done; reported, critic, unsourceable not started. Verdicts: 343 fixed,
56 ok, 82 not-found (61 never retried), 49 decide, 7 for the owner to open, 3
print. Page check: 401 found + 10 on archive copies; the misses are pages a
bot can't open (a Tumblr bot wall, owner-pasted pages, one flaky site).

**Session 2 ran:** six checkers (c9-c14, Sonnet medium, 157 searches between
them, about 55-90% sourced), two Claude chat packs (chat5, retry2: 55
searches on the owner's side) and two pages the owner opened (Coyne's Quietus
picks, Strummer's Record Collector interview).

**Session 2 lessons:**
- Quietus Baker's Dozens are not walled: every pick has its own URL
  (`.../bakers-dozen/<slug>/2/` to `/14/`), readable with `read`. Now in
  BRIEF.md. A no-search sweep of every Baker's Dozen by a roster artist is a
  cheap source of new candidates (offered to the owner for the additions pass).
- Checkers share one scratchpad: c11's helper `m.js` swallowed c9's results.
  BRIEF.md now says helper files go in `<scratchpad>/<name>/` and checkers
  never run `merge`. Running `merge` also merges any other finished file, so a
  results file vanishing into `results/merged/` is normal.
- `merge` used to delete the old not-found entries before checking the file
  and then refuse it, so a refused retry file dropped them (caught and
  restored the same session). Fixed: the file is checked first.
- Claude chat sometimes leaves `checked` off not-found/decide entries; fill
  it in before merging.
- Repeated traps from CLAUDE.md showed up again and were caught: Wikipedia
  resting on the Noisey journalist's own listening (Mountain Goats), Iggy Pop
  / Lou Reed named as people rather than the band, a makeup compliment read as
  musical influence (Polachek/Bowie).

**Owner preferences this session:** hand chat packs over by clipboard
(`pbcopy`), one at a time, the next only once the last one's answer is back.

## Progress (session 1, 26 Oct 2026)

**Where it stands:** 340 of 1,053 links worked. 250 proven (217 fixed, 30 ok,
1 print and the rest of the owner-read ones), ~68 not-found, 21 decide, 2
blocked. All 68 today's-record links done; first-person ~275 / 494. Reported,
critic and unsourceable not started. `npx tsx scripts/source-pass/ledger.ts
status` gives the live numbers.

**What was built (setup, done):** `lib/edge-sources.ts` (types, merge,
`ledgerProblems`, `TIER_CONFIDENCE_CAP`), `data/edge-sources.json` (the
ledger; the build refuses an unsound one), `Edge.sourceUrl`/`sourcePrint`,
`components/ui/SourceLink.tsx` ("Source ↗" on the artist panel, the family
photo card, today's record and Connect two), `tests/lib/edge-sources.test.ts`,
and `scripts/source-pass/ledger.ts`:
`queue` (built once) · `next <name> <n> [phase]` · `merge` · `status` ·
`check [--all]` · `read <url> <words> [--raw]` · `rescue [key]`.
Checkers follow `research/source-pass/BRIEF.md`; Claude chat packs are in
`research/source-pass/chat/` (copy the newest as the template).

**The owner's rulings (26 Oct), already in BRIEF.md:**
- Being a fan counts: an artist saying they loved, grew up on, were big fans
  of, kept listening to someone while forming or making their own music is
  first-person influence. A bare favourites list with no comment doesn't.
- Fandom someone else reports (journalist, bandmate, the other artist, the
  band's own ad) counts at `reported`.
- Sounding alike is not influence: a critic's "sounds like / recalls / the X
  of its generation" goes to `decide`; `critic` tier is only for a critic
  arguing one drew on the other.
- Never give up a known page: try its Internet Archive copies (`read` takes
  web.archive.org URLs and fetches them raw; `rescue` sweeps them) before
  not-found. The owner was rightly angry when five Slowdive links were marked
  not-found while the 2014 archive copy had all six quotes.
- `blocked` only for pages a person with a browser can open; the owner can't
  open Under the Radar live, PressReader, the Quietus paywall or the
  Telegraph. The owner happily opens walled pages: give them the direct link
  and what to look for.
- Home page: keep all 77 today's-record quotes for now (owner's call); the
  "every why line has a link" test waits until the pass reaches them all.
- A corrected tier caps the link's confidence (first-person 0.9, reported
  0.7, critic 0.55), applied in the merge.

**Measured (for the estimate):** ~1 search per link, ~10-14 min per agent
for 20-35 links; this session worked ~340 links with ~170 searches here plus
~150 on the owner's Claude chat. Agents here sourced 57-81% of their batches;
chat packs 32-70%; a retry pack in chat turned 21 of 32 not-found around.
About 6 in 7 sourced links needed their citation corrected (words, outlet,
speaker, tier) but only ~6% were actually unsupported (the decide list).

**Lessons (traps found this session):**
- Claude chat sometimes calls a quote "not found" that is on the page (the
  About page's Alvvays/MBV line): when a fixed entry swaps out a quote another
  page uses (About tests, today's record), re-read the original first.
- A checker or I will occasionally add a plausible detail the page doesn't
  carry (a year, a song name): every sentence of a rewritten citation must be
  on the page. Scan rewrites before merging.
- Merge only when a checker's file says `"finished": true`; a checker's own
  later file replaces its earlier entries; a found result replaces anyone's
  not-found.
- Off-map names from checkers are often on the map: convert them to
  candidates (the merge snippets in this session did it by roster lookup).

**Next session, in order:**
1. `status`; the last 22 first-person links in one checker batch, then
   `next` batches of `reported` (Wikipedia ones mostly need no search).
2. Retry packs for the 61 not-found never retried (build them as retry2 was:
   the batch file by hand from the ledger's not-found entries plus each
   note as `lastTry`; chat/retry2.md is the template).
3. The owner's 7 pages to open (`status` lists them).
3. Then reported, critic, unsourceable.
4. At the end: `reworded` clean-up for unsourced links whose old citation
   carries commentary (~80, e.g. "-- a critic's comparison rather than..."),
   the decide list shown to the owner once, then the today's-record test.
