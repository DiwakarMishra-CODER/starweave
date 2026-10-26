# The decide list: one ruling per link

Starweave is a map of who influenced whom in indie music. During the source
pass, checkers found the page behind each of these links but couldn't settle
it: the page didn't clearly say influence, or said something else (a
critic's comparison, a favourites list, a shared label, a denial). The owner
has asked for each to be decided properly. You draft the ruling; the main
chat reviews and applies it. Touch nothing but your output file.

Read first: `CLAUDE.md` -- "Citation discipline", "What counts as influence
(owner's rulings, 26 Oct 2026)", the personnel/production/label rule, and
the trap lists; `research/source-pass/bakers-dozen/JUDGE.md` (the
influence/favourite test).

## Your batch

`research/source-pass/decide/batch-<n>.json`: each item has the link
(`key` = influenced>influence, names and start years), its current
citation/tier, and `ledger`: the page found (`url`), the sentence on it
(`found`), and the checker's `note` with their reasoning and proposal.

Re-open a page whenever the note leaves the answer unclear:
`npx tsx scripts/source-pass/ledger.ts read "<url>" <word> <word>` (cached,
free; Internet Archive copies via `https://web.archive.org/web/2020/<url>`).
**No WebSearch, no WebFetch.**

## The rulings

- `keep`: the page supports influence in this direction, at some tier.
  - `first-person`: the artist (or a band member) says it shaped them, or
    loved/grew up on/kept playing it while forming or making their music.
  - `reported`: someone else (journalist, bandmate, label) states that
    influence or that fandom as fact.
  - `critic`: a critic **arguing** one drew on the other (not "sounds like",
    "recalls", "in the vein of": those are comparisons -> remove).
  Give `found` (exact sentence from the page), `url`, a `citation` (a
  finished sentence for a reader: who, where, when, what was said; no
  pipeline words, no repo ids) and `sourceTier`.
- `remove`: no page says influence in this direction (soundalike, favourite
  with no tie to their own music, personnel/production/label/collaboration,
  a cover, dates running backwards, an unsourced claim). Say why in a
  sentence.
- `flip`: the page clearly says the influence ran the other way; give the
  keep fields for the flipped link (`key` written the new way round).
- `denial`: the artist says it did not influence them (or they hadn't heard
  it). Give `url`, `found`, `citation`, `strength` (`clean` = an outright
  denial; `contested` = denies but other evidence says otherwise). A denial
  removes the link and records the denial. "We don't sound like X" denies
  resemblance, not influence: that is not a denial.

Be strict but fair: a wrong keep puts a false line on the map; a wrong
remove loses a true one. When it's genuinely 50/50, `remove` with a note
saying what would change it.

## Output

`research/source-pass/decide/ruled-<n>.json`, rewritten as you go:

```json
{ "agent": "decide-1", "finished": true, "rulings": [
  { "key": "a>b", "ruling": "keep|remove|flip|denial",
    "sourceTier": "...", "url": "...", "found": "...", "citation": "...",
    "strength": "clean|contested", "flippedKey": "b>a", "why": "<one sentence>" } ] }
```

Report back briefly: counts per ruling, and the closest calls.
