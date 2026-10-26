# Bringing back the 11 (deeper search, 26 Oct 2026)

These artists were removed from the map because none of their links had a
source. The owner wants them sourced so they can come back. Find **real,
sourced links** for each, in either direction, to artists on the map
(`research/source-pass/roster.txt`, minus julee-cruise, fishmans, sebadoh and
the 11 being researched; plus kate-bush, pj-harvey, scott-walker, spacemen-3,
roxy-music, the-slits, peter-cat-recording-co). Two or three good links per
artist is the goal; one is enough to bring them back.

Follow `research/source-pass/orphans/BRIEF.md` for the rules (owner's
influence test, whose words, no personnel/label/production/covers/
soundalikes, never Grokipedia, open every page with
`npx tsx scripts/source-pass/ledger.ts read`), with a bigger budget: **up to
8 searches per artist, 30 for your batch.** Your batch file lists what was
removed and why: don't re-propose the same evidence, but a better page for
the same pair is welcome (e.g. Darnielle's own words on the goth bands
behind *Goths*).

Search both ways:
- **Their own influences** (cheap): the artist's or a member's interviews
  -- Quietus, Pitchfork, Stereogum, Guardian, NPR, Bandcamp Daily, gear
  interviews, podcasts with transcripts, books quoted on a page. Anchor on
  album titles.
- **Who on the map names them**: search the likely descendants' own
  interviews (e.g. "Phoebe Bridgers Mountain Goats", "Anna von Hausswolff
  Dead Can Dance", "Joanna Newsom Incredible String Band").

Write `research/source-pass/orphans/deep-found-<n>.json` in the same shape
as `found-<n>.json` (fields: source, target, sourceTier, confidence, url,
found, citation; plus `none` with what was tried). Report back briefly:
per artist, links found or not, and searches used. Touch nothing else.
