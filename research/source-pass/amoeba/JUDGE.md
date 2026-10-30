# Judging Amoeba "What's In My Bag?" picks

Starweave is a map of who influenced whom in indie music. In Amoeba Music's
*What's In My Bag?* an artist walks round the shop picking records and talks
about each one. You get YouTube's caption transcripts of the episodes by
artists on the map. Your job: find every record or artist they pick or talk
about, and decide whether the speaker says it **shaped them**, or only that
they **like it**. No searches, no other pages: everything is in your batch.

## Your files

- Batch: `research/source-pass/amoeba/judge-<n>.json`. Each episode has `id`
  (YouTube id), `guest` and `title`, `speakers` (the map's id for the artist
  talking; a band member speaks for their band), `transcript` (the path of a
  text file, one caption line per row as `[m:ss] words`), and `alreadyLinked`
  (for each speaker, the map ids they already have a line to).
- Every artist on the map: `research/source-pass/roster.txt` (id, name, year).
- Write `research/source-pass/amoeba/judged-<n>.json`, rewriting it as you
  go, `"finished": true` in the last write.
- Touch nothing else. No builds, no git, no searches, no WebFetch.

## These are machine captions

YouTube's automatic captions mishear names and titles, drop punctuation and
never say who is talking. *Bend Sinister* by the Fall came out as "The Falls
Ben Sinister". So:
- Work out what was picked from the whole passage (artist, album, song, what
  they say about it). Count it as an artist on the map only when you're sure;
  if you can't tell, say so in `note` and use `verdict: "unclear"`.
- Only the guest's words count. Some episodes have two guests ("Courtney
  Barnett and Kurt Vile"): attribute a passage to the on-map guest only when
  it's clear it's them (they name their band, "my record", the other guest
  addresses them). Otherwise `unclear`.
- A guest filed under a member's name (Kim Gordon, Johnny Marr) speaks for the
  band in `speakers`.

## The test (the owner's rulings, same as the Baker's Dozens)

- **influence**: the speaker says the record or artist shaped, changed,
  inspired or taught them, or made them want to make music, or that they
  loved / were obsessed with / grew up on it **while forming or making their
  own music** ("I was 15 and it changed everything", "we listened to it
  constantly while making our first album", "it's why I picked up a guitar",
  "I stole that drum sound"). Being a fan counts when it's tied to their own
  making or formative years.
- **favourite**: praise with nothing about their own music or formative
  years ("a brilliant album", "I'm a big fan, happy to finally get it on
  wax"), a record they came to after their own music was formed, or something
  they admire from a distance. This is most picks. Be strict: a wrong
  "influence" puts a false line on the map; a missed one costs nothing.
- **denial**: they say it did not influence them, or they never heard it
  until later.
- **Dates**: the influence has to run forward. A record that came out after
  the speaker's band was already making the music in question is `favourite`
  unless they say it changed their later work.
- **A solo record isn't the band**: Lou Reed's *Berlin* is Lou Reed, not the
  Velvet Underground. Check the roster for which one is on the map.
- Covers, collaborations, being produced by, touring with or being friends
  with someone are not influence by themselves.

## What to write

For every pick of an artist on the map (other than the speaker themselves):

```json
{ "episode": "0lcSdEublRI", "speaker": "alvvays", "speakerName": "Molly Rankin",
  "target": "the-fall", "artist": "The Fall", "record": "Bend Sinister",
  "kind": "new", "verdict": "favourite", "t": 363,
  "link": "https://youtu.be/0lcSdEublRI?t=360",
  "heard": "I'm a big fan of of the fall and uh this is probably my favorite record from them",
  "quote": "I'm a big fan of the Fall, and this is probably my favorite record from them.",
  "citation": "", "note": "" }
```

- `kind`: `existing` if `target` is in `alreadyLinked[speaker]`, else `new`.
- `t`: seconds where the passage starts; `link` starts ~3s earlier.
- `speakerName`: who is talking, if you can tell (else the band's name).
- `heard`: the caption words exactly as in the transcript, consecutive lines
  joined with single spaces, timestamps removed. One to four lines, the ones
  that carry the claim.
- `quote`: your clean reading of `heard`: fix misheard names and titles, add
  punctuation, drop "uh"/stutters. Never add, reword or reorder words. Put
  `[?]` where you can't make a word out. The owner checks this by ear.
- `citation` (influence and denial only): a finished sentence for a reader:
  who (the speaker, and their band if it isn't obvious), "on Amoeba Music's
  What's In My Bag?", what was said, with straight double quotes round the
  `quote` words (cut with `...` inside if needed). No year. Never project
  words (graph, node, edge, link, map).
- `favourite` and `unclear` entries still need everything but `citation`.

Picks of artists **not** on the map go in a separate `offMap` list, one per
artist: `{ "episode", "speaker", "artist", "verdict", "t", "quote" }`, with
`quote` only for `influence`. Keep it to artists a reader would know as
musicians (not films, comedy, soundtracks by unknown composers).

## Results file

```json
{ "agent": "judge-1", "finished": true, "entries": [ ... ], "offMap": [ ... ] }
```

Report back briefly: episodes read, picks judged, how many `influence` by
kind (new / existing), any denials, and anything odd (transcripts too garbled
to use, episodes where you couldn't tell who was talking).
