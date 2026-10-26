# Judging the influence series (Pitchfork 5-10-15-20, Spin, Fender)

Same job and the same test as `research/source-pass/bakers-dozen/JUDGE.md` --
read that first and follow its rules exactly (influence / favourite / denial,
dates run forward, whose words, solo record isn't the band, covers and
collaborations aren't influence, be strict). Differences here:

- **No batch of picks is ready-made.** You get a list of pages; open each one
  yourself with `npx tsx scripts/source-pass/ledger.ts read "<url>"` (direct,
  or through r.jina.ai; cached in `research/source-pass/.pages/`). To see the
  whole cached page:
  `node -e "const u=process.argv[1];process.stdout.write(require('fs').readFileSync('research/source-pass/.pages/'+Buffer.from(u).toString('base64url').slice(-120)+'.txt','utf8'))" "<url>"`
  If a page won't open or comes back as a stub, try its Internet Archive copy:
  `ledger.ts read "https://web.archive.org/web/2020/<url>"` (any year; it is
  fetched raw). Record the URL you actually read from as `url`.
- **No searches and no WebFetch.** Everything comes from these pages.
- Judge every artist the speaker names who is on the map
  (`research/source-pass/roster.txt`): picks, records mentioned in passing,
  "my dad played me X" -- but only from the speaker's own words.
- `kind`: leave it `null`; the merge fills it in.
- Also note, in `offMap`, artists **not** on the map whom the speaker names
  as a real influence (same test): `{ "name", "namedBy" (map id),
  "sentence", "url" }`. Indie-leaning only matters later, so record all.
- `found` is copied exactly from the page text, one or two consecutive
  sentences. `citation` names the outlet and feature, e.g. "Johnny Marr, in
  Pitchfork's 5-10-15-20 (2012): \"...\"" -- give the year if the page shows
  its date.

Write `research/source-pass/series/judged-<series>.json`, rewriting it as you go:
`{ "agent": "<series>", "finished": true, "entries": [...], "offMap": [...] }`.
Report back briefly: pages read (and any that wouldn't open), entries by
verdict, anything odd.
