# Judging Baker's Dozen picks

Starweave is a map of who influenced whom in indie music. The Quietus's
Baker's Dozen asks an artist for 13 favourite records and prints what they
say about each. These have been pulled for every artist on the map (a band
member speaks for their band: Alan Wilder for Depeche Mode). Your job: read
each pick and decide whether the speaker says it **shaped them**, or only
that they **like it**. No searches, no other pages: everything you need is in
your batch.

## Your files

- Batch: `research/source-pass/bakers-dozen/judge-<n>.json`. Each pick has
  `speaker` (the map's id for the artist talking), `target` (the map's id for
  the picked artist, or null when they're not on the map), `artist`, `kind`
  (`new` = no link on the map yet, `existing` = the map already has this link;
  picks of artists off the map aren't in your batch), `ledger` (for an existing link: how the source pass left it;
  `not-found`/`decide`/null are the ones that most need a source), `url` (the
  pick's own slide), `heading` and `text` (the speaker's words, as printed).
- Write `research/source-pass/bakers-dozen/judged-<n>.json`, rewriting it as
  you go, `"finished": true` in the last write.
- Every artist on the map: `research/source-pass/roster.txt` (id, name, year).
- Touch nothing else. No builds, no git, no searches. If a pick's text looks
  cut short or garbled, you may open its slide with
  `npx tsx scripts/source-pass/ledger.ts read "<url>" <word> <word>` (cached,
  costs nothing); never WebFetch or WebSearch.

## The test (the owner's rulings)

- **influence**: the speaker says the record or artist shaped, changed,
  inspired or taught them, or made them want to make music, or that they
  loved / were obsessed with / grew up on it **while forming or making their
  own music** ("I was 15 and it changed everything", "we listened to it
  constantly while making our first album", "it's why I picked up a guitar",
  "I stole that drum sound"). Being a fan counts when it's tied to their own
  making or formative years. Hearing about a record from a bandmate in the
  band's early days counts.
- **favourite**: praise with nothing about their own music or formative
  years ("a brilliant album", "I love the second side"), a record they came
  to after their own music was formed, or something they admire from a
  distance. This is most picks. Be strict: a wrong "influence" puts a false
  line on the map; a missed one costs nothing.
- **denial**: they say it did not influence them, or they never heard it
  until later.
- **Dates**: the influence has to run forward. If the picked record came out
  after the speaker's band was already making the music in question, it is
  `favourite` unless they say it changed their later work (then `influence`,
  and say which work in the citation).
- **Whose words**: the speaker only. A quoted bandmate or producer inside the
  text doesn't count for the speaker unless it's about the speaker's band.
- **A solo record isn't the band**: a pick of Lou Reed's *Berlin* is Lou
  Reed, not the Velvet Underground; Morrissey's solo album is not the Smiths.
  The batch already keeps them apart; don't merge them.
- Covers, collaborations, being produced by or touring with someone are not
  influence by themselves.

## What to write

For every pick with `target` (on the map), one entry:

```json
{ "speaker": "depeche-mode", "target": "brian-eno", "artist": "Brian Eno",
  "kind": "new", "url": "<the slide url>", "verdict": "influence",
  "found": "<one or two consecutive sentences copied exactly from text>",
  "citation": "Alan Wilder, choosing Brian Eno's Taking Tiger Mountain (By Strategy) for his Quietus Baker's Dozen: \"...\"",
  "note": "<optional: anything the owner should know>" }
```

- `found`: copied exactly from `text`, character for character (curly
  quotes and all), one or two consecutive sentences that carry the claim.
- `citation` (influence and denial only): a finished sentence for a reader:
  who (name the speaker, and their band if it isn't obvious), "for The
  Quietus's Baker's Dozen", what was said, with straight double quotes around
  verbatim words (cut with `...` inside a quote if needed). No year unless the
  text gives one. Never project words (graph, node, edge, link, map).
- `favourite` entries need only `speaker`, `target`, `artist`, `kind`, `url`,
  `verdict`.

## Results file

```json
{ "agent": "judge-1", "finished": true, "entries": [ ... ] }
```

Report back briefly: how many picks you judged, how many `influence` by kind
(new / existing), any denials, and anything odd (garbled text,
picks that look misattributed).
