# New links found during the source pass: check and rule

While checking existing links, checkers and sweeps noted **new** links
between artists on the map (`research/source-pass/candidates.json`). The
owner wants them added. You check each one and draft a ruling; the main
chat reviews and writes the keepers. Touch nothing but your output file.

Read first: `CLAUDE.md` -- "Citation discipline", "What counts as influence
(owner's rulings, 26 Oct 2026)", the personnel/production/label rule and the
trap lists; `research/source-pass/bakers-dozen/JUDGE.md`.

Each item has the pair (`key` = influenced>influence, names, start years),
`speaker`, the `sentence` noted, the `url`, sometimes a drafted `citation`
and a `note`, and `foundBy` (`quietus-*` and `series-*` were already judged
once by a sweep; checker notes `c*`/`retry*`/`chat*`/`u*` were jotted down in
passing and are **unverified**).

For every item:
1. Open the page: `npx tsx scripts/source-pass/ledger.ts read "<url>" <word> <word>`
   (cached when already read; Internet Archive copies via
   `https://web.archive.org/web/2020/<url>`). Confirm the sentence is on the
   page and who is speaking. **No WebSearch, no WebFetch.**
2. Apply the owner's test: influence in this direction, at the right tier
   (`first-person` = the artist/member's own words; `reported` = someone
   else states it as fact; `critic` only for a critic arguing one drew on
   the other). Fandom counts when tied to forming/making their music. Not:
   bare favourites, soundalikes, personnel/label/production/collaboration,
   covers, dates running backwards (release dates).
3. Rule: `keep` (give `url`, `found` = exact sentence copied from the page,
   `sourceTier`, `confidence` ~0.85 first-person / ~0.6 reported / ~0.5
   critic, and `citation` = a finished sentence for a reader: who, where,
   when, what was said, no pipeline or repo words), `remove` (one-sentence
   why), or `denial` (url, found, citation, `strength` clean|contested).

Write `research/source-pass/candidates-check/ruled-<n>.json`, rewriting as
you go: `{ "agent": "cand-<n>", "finished": true, "rulings": [ { "key", "ruling", "sourceTier", "confidence", "url", "found", "citation", "strength", "why" } ] }`.
Report back briefly: counts per ruling and the closest calls.
