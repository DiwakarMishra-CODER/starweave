# Checker's brief: the source pass

You are checking influence links on Starweave, a map of who influenced whom
in indie music. Each link is `source>target`: **source was influenced by
target**. Each carries a `citation` (a sentence saying who said it, where)
and a `sourceTier`. Your job, for every link in your batch: find the page
that actually carries the claim, open it, read it, and record the proof.
Precision beats speed. A wrong "ok" is worse than an honest "not-found".

## Your files

- Your batch: `research/source-pass/batches/<name>.json` (groups of links;
  a group shares a speaker, and often one interview covers several links:
  read it once, check them all).
- Write your results to `research/source-pass/results/<name>.json`, and
  rewrite it after **every group** so nothing is lost if you stop early.
- Every artist on the map: `research/source-pass/roster.txt` (id, name, year).
- Touch no other file. No builds, no dev server, no git, and never run
  `ledger.ts merge` (the coordinator merges; a finished results file is
  moved away when merged, so don't worry if it disappears after you finish).
- Other checkers run beside you and share the scratchpad folder: keep any
  helper files of your own in `<scratchpad>/<your name>/`, never loose.

## Tools

- **Open pages only with:**
  `npx tsx scripts/source-pass/ledger.ts read "<url>" <word> <word> ...`
  It fetches the page's own text (through r.jina.ai when a site refuses) and
  prints each paragraph holding all the words, exactly as on the page. Use
  two or three distinctive words from the quote. No words: the first 60
  paragraphs. Add `--raw` to keep links (to follow a Wikipedia footnote).
- **Search with WebSearch.** Count every call. A search result's summary or
  snippet is **never** evidence: the search tool has fabricated quotes
  before, and has put a real quote under the wrong outlet. Only what `read`
  prints from a page counts.
- Don't use WebFetch for evidence (it hands back a model's summary, not the
  page). Only if `read` cannot open a page at all may you WebFetch it and
  ask for the passage verbatim; then say so in `note`
  ("read could not open it; passage via WebFetch").

## Tricks that worked (round one)

- Wikipedia's raw wikitext shows each footnote's URL next to the claim:
  `read "https://en.wikipedia.org/w/index.php?title=<Name>&action=raw" <words>`.
- A Wikipedia footnote's page that's gone often opens as a web.archive.org
  copy through `read` (the archive.org URL itself, as Wikipedia gives it).
- If `read` says it can't open a page, try it once more before giving up:
  the proxy rate-limits now and then.
- A Quietus Baker's Dozen is a slideshow, but every pick has its own URL:
  `read` the article with `--raw` to list them
  (`.../bakers-dozen/<slug>/2/` to `/14/`; page 1 is the intro), then
  `read` the pick's own slide. Cite that slide's URL.
- undertheradarmag.com, the Quietus's paywalled body text, PressReader and
  telegraph.co.uk can't be opened by any tool, and the owner can't open them
  either: if that's where the claim is, it's `not-found` (note the page's
  URL), no more attempts. Keep `blocked` for pages a person with a normal
  browser could open (a bot wall, a page that renders only in a browser).
- `found` should name the influence (include the sentence with the band's
  name, not only the sentence after it).

## Per link, cheapest path first

1. **No search** when the URL is predictable: the artist's Wikipedia
   article (`https://en.wikipedia.org/wiki/<Name>`, `_(band)` /
   `_(musician)` variants; follow the footnote behind the claim with
   `--raw` and cite the real source it points to), artist-curated sites
   (cocteautwins.com, the Red Hand Files, an artist's own site), a Quietus
   Baker's Dozen by name.
2. **One search** for the exact quote in quotation marks, or outlet + artist
   + year. Open the hit with `read`, confirm.
3. **A second search** only if the first found the outlet but not the page.
4. **Before you call it `not-found` or `blocked` when you know the page**
   (from a search result, a footnote, the citation): try its Internet
   Archive copies, which cost no search:
   `npx tsx scripts/source-pass/ledger.ts read "https://web.archive.org/web/2016/<page URL>" <words>`
   (try a few years: 2012, 2016, 2020). Walled, paywalled and deleted pages
   are very often there. The owner's rule: a link is never given up while a
   known page for it might still be readable somewhere.
5. **Then stop**: verdict `not-found`, `note` says what you tried, including
   the page URLs and archive years. No third search. Moving on is the right
   call.

## The bar for a link to pass

1. A link to the page that actually carries the claim, opened and read.
2. Any quote is verbatim on that page, and it's the right person speaking:
   whose "I" is it (interviewer or subject; the journalist's own listening
   versus the artist's; the right band member).
3. It says **influence**, in the right direction (the source artist shaped
   by the target), and the dates work (test release dates, not formation
   dates).
4. The tier is right: `first-person` = the artist's own quoted or directly
   reported words; `reported` = a publication states it as fact, no quote
   from them; `critic` = a critic or writer arguing that one drew on the
   other. (A critic saying they sound alike is not a tier at all; see
   "What counts as influence" below.)
5. Wikipedia only as a last resort: follow its footnote and cite the real
   source. A Wikipedia claim with no footnote behind it is `reported` at best
   (then `url` is the Wikipedia article and `found` its sentence).

## What counts as influence (the owner's ruling, 26 Oct 2026)

- **Being a fan counts.** Artists rarely say "influenced". An artist saying
  they loved, grew up on, were obsessed with, were big fans of, or kept
  listening to another artist **while forming or making their own music**
  is a first-person influence: "grew up on Bowie", "driving around
  endlessly listening to Cocteau Twins tapes", "we were big fans of that
  band", "my absolute heroes as a teenager". Verdict `ok` (or `fixed` to
  the page's words).
- **Fandom someone else reports counts too, at `reported` tier** (owner's
  ruling, 26 Oct 2026): a journalist saying the artist loved X, a bandmate
  or the other artist saying so ("he liked the Stooges when few would admit
  it"), the band's own ad asking for a bassist "into Hüsker Dü". Verdict
  `fixed` with `sourceTier: "reported"`, not `decide`.
- Still not influence: a bare list of favourites with no comment, a
  "what are you listening to now" answer, "I like their new record", one
  name dropped in a list with nothing said about it.
- **Sounding alike is not influence.** A critic saying A "sounds like",
  "recalls", "echoes", "is the X of its generation", or "worships at the
  altar of" B is a comparison. Verdict `decide`, proposing remove, unless
  the same page also says A drew on, learned from or came out of B (then
  it's `critic`, citing that sentence).

## Not influence, and not sources (from the project's rules)

- **Grokipedia: never a source.** Discard it on sight; it invents credible
  influence claims.
- Bio blurbs repeated word for word across aggregator sites (Last.fm,
  RYM-adjacent): one unsourced claim, not corroboration.
- AllMusic's influences **panel** (bare names) is not a source; AllMusic
  **prose** biography is (critic or reported tier).
- The Student Playlist's "Influenced by:" lists: excluded on sight.
- Editorially curated playlists (Apple Music "Influences") are excluded;
  an artist's own written playlist notes are fine (favourites, so tier
  `first-person` only if they say it shaped them).
- A cover version, or a covers album, is not an influence claim by itself.
- Personnel overlap, a production credit, a shared label, a collaboration or
  a guest spot is not influence.
- A list naming both artists as the same genre is not influence.
- "We don't sound like X" denies resemblance, not influence.
- Watch for page collisions: read the paragraphs around the sentence, not
  just the sentence.

## Verdicts

- `ok`: the page carries the claim and the citation stands as written.
  Needs `url` and `found`.
- `fixed`: the page carries the claim, and you corrected the citation
  (outlet, year, who, the quote's exact words) and/or the tier. Needs
  `url`, `found`, and `citation` and/or `sourceTier`. Lowering a tier,
  correcting a quote to the page's words, or naming the real outlet is yours
  to do. Raising a tier needs the page to show the artist's own words.
- `print`: only in a book with no text online. `print` = author, title,
  year, page (from the citation, or from a Wikipedia footnote you read).
  Prefer a Google Books or archive.org page you can `read` (then it's `ok`).
- `not-found`: two searches, no page. `note` says what was tried.
- `blocked`: you've found the page that should carry it (from a search
  result, a Wikipedia footnote, the outlet's own index) but neither `read`
  nor WebFetch can open it: a paywall, a login, a bot wall. The owner will
  open it in a browser and send the passage. Needs `url` (the page itself)
  and `note` (what to look for on it: the quote, or the speaker and band).
  Use it only when you know which page it is; if you don't, it's
  `not-found`.
- `decide`: the page exists but doesn't support the link as it stands (only
  a resemblance, wrong direction, a cover, personnel, an editorial playlist,
  the artist denies it, wrong speaker with nothing better on the page).
  **Don't fix these**: `note` says what the page says and proposes one of
  remove / flip direction / record as denial / lower to critic, with `url`
  and `found` if you have them. The owner decides.

## Writing `found`

Copy it from `read`'s output: one or two consecutive sentences that carry
the claim, including any quote the citation uses, exactly as printed. Don't
retype, don't tidy, don't join paragraphs, don't add "...". A script later
re-opens every page and looks for this text, so a paraphrase fails.

## Writing a `citation` (when you fix one)

A finished sentence for a reader: who, where, when, what was said.
Straight double quotes `"` around quoted words, which are verbatim (you may
cut with `...` inside a quote). Year when the page gives one.
Example: `Andy Bell to Under the Radar (2013): "Early on in Ride, it was
Spacemen 3, House of Love, My Bloody Valentine, Loop..."`
Never: a tier word (HIGH, MEDIUM, single-source, weak), this project's
words (graph, node, edge, audit, pipeline, "same quote as..."), a note about
the research ("not independently verified", "403"). Those go in `note`.

## Today's-record links (they carry `why`)

These are shown on the home page as a caption: `why.quote`, said by
`why.speaker`. The caption is taken from the citation: its first quoted
passage of six or more words that contains the longest word of the other
artist's name (e.g. "Velvet"), or failing that its first quoted passage of
six or more words. Check that this line is verbatim on the page, that it is
`why.speaker`'s own words, and that it reads well on its own (under 120
characters reads best). If it doesn't, choose a better line **from the same
page, by the same speaker, about this influence**, and rewrite the citation
so that line is its first quoted passage (verdict `fixed`). Keep its tier
`first-person`.

## While a page is open: new links and missing artists (no extra searches)

Only from the passage you're already reading for the quote, not the rest of
the page:
- **candidates**: the speaker names another artist **on the roster** as an
  influence on them (or denies one), and that link isn't already on the map
  (`grep '"<source>><target>"' research/source-pass/queue.json`). Record
  `source`, `target` (roster ids), `kind` (`influence` or `denial`),
  `speaker`, the exact `sentence`, `url`.
- **offMap**: the speaker names an artist **not on the roster** as a real
  influence (a statement of influence, not a passing mention). Record
  `name`, `namedBy` (roster id of the artist speaking), `sentence`, `url`.

## Results file

```json
{
  "agent": "<name>",
  "searches": 12,
  "toolStatus": "WebSearch fine; thequietus.com 403 direct, opened via read",
  "entries": {
    "ride>the-fall": {
      "url": "https://www.undertheradarmag.com/interviews/...",
      "found": "Early on in Ride, it was Spacemen 3, House of Love, My Bloody Valentine, Loop, Sonic Youth, Dinosaur Jr., The Fall, Pixies, and Stone Roses.",
      "checked": "2026-10-26",
      "verdict": "ok"
    },
    "x>y": { "checked": "2026-10-26", "verdict": "not-found", "note": "searched \"...\" and outlet+artist+year; no page" }
  },
  "candidates": [],
  "offMap": []
}
```

Every link in your batch gets an entry. In your **last** write, when the
batch is done, add `"finished": true` at the top level (never before). Use `checked` = today's date.
JSON-escape quotes inside strings (`\"`).

## Budget and stopping

Your search share is given in your task. Stop when you reach it, or at the
first sign the search tool is exhausted or failing: finish the group you're
on, write the results file, report. Don't work around a dead search tool.

## Your report back (short)

Links done by verdict, searches used, tool status (blocked sites, errors,
any search-budget message), anything the owner must decide, and anything in
this brief that got in your way.
