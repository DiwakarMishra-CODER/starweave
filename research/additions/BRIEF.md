# Additions batch 1 (Oct 2026): research brief

Starweave maps who influenced whom in indie music. The owner has asked for
seven artists to be added: Kate Bush, PJ Harvey, Scott Walker, Spacemen 3,
Roxy Music, The Slits, Peter Cat Recording Co. Your job is **Layer 1:
research only** for the artists you're given. Nothing in `data/` is touched;
the main chat rules on your findings and writes them.

Read first: `CLAUDE.md` sections "Citation discipline", "What counts as
influence (owner's rulings)", "Search method" and the trap lists after it;
`research/source-pass/bakers-dozen/JUDGE.md` (the influence/favourite test).

## What to find, per artist

1. **Their own influences on the map** (upstream; the cheap direction):
   the artist (or a band member) saying an artist on the map shaped them,
   or loving/growing up on them while forming. These give the new artist a
   road back towards the Velvet Underground. Search the artist's own
   interviews (Quietus Baker's Dozen by them, Uncut/Mojo/Guardian/Pitchfork
   interviews, gear interviews), anchoring on album titles.
2. **Artists on the map they shaped** (downstream). Start from what's
   already collected (free):
   - `research/source-pass/off-map.json`: entries whose `name` is your
     artist were judged as real influence statements by someone on the map
     (`namedBy`); re-open each `url` with `ledger.ts read` and confirm the
     sentence and whose words it is.
   - `research/source-pass/bakers-dozen/sorted.json`: entries with
     `kind: "off-map"` and `artist` = your artist are Quietus picks by
     artists on the map, **not yet judged**: judge each with JUDGE.md.
   - `grep -n "<Artist name>" data/seed-data.ts`: existing citations and
     bios that mention them (often a lead, never a source by itself).
   Then search only to fill gaps (the descendant's own interviews).
3. **Denials**: anyone on the map who denies them (e.g. St. Vincent has
   denied Kate Bush: find her words).
4. **Traps** (record and reject): personnel (Eno was in Roxy Music; Jason
   Pierce/Spacemen 3 -> Spiritualized; band members' other bands),
   production, label, covers, critic soundalikes, dates running backwards
   (release dates, not formation), Grokipedia, aggregator bios, AllMusic
   panels, search-summary quotes you didn't see on a page.

Every edge needs a page you opened (`npx tsx scripts/source-pass/ledger.ts
read "<url>" <word> <word>`; it falls back to r.jina.ai; Internet Archive
copies via `https://web.archive.org/web/2020/<url>`), the exact sentence
copied from it, and the right speaker. Direction: `source` is the one
influenced, `target` the influence. Ids of artists on the map:
`research/source-pass/roster.txt`. Use these ids for the new ones:
`kate-bush`, `pj-harvey`, `scott-walker`, `spacemen-3`, `roxy-music`,
`the-slits`, `peter-cat-recording-co`.

**Searches: at most 22 for your whole batch** (the session shares ~200 and
some are spent). Report how many you used and whether any tool failed.
No WebFetch of Grokipedia. No builds, no git, touch nothing outside your
output files.

## Also propose (for the write)

- `realm` / `lineage` / `layer`, `genres` (ids from the genre list in
  `data/seed-data.ts`, top of file), `country` (ISO 2), `activeFrom`,
  `signatureSong`, any `scene` it truly belongs to (the test is a shared
  room, see CLAUDE.md "Scenes"). Compare with similar artists already on
  the map (e.g. `x-ray-spex`, `patti-smith`, `the-raincoats` if present,
  `nico`, `david-bowie`, `spiritualized`).
- **Content drafts**, plain words for a visitor (never "graph", "node",
  "edge", "map"): `bio` (two short paragraphs, ~150-220 words, like
  `x-ray-spex`'s), one major album `{ title, year, classicReason }` where
  classicReason is 3-4 tight sentences (one on sound, one on a standout
  track or technique, why it endures; straight ASCII double quotes).

## Output

`research/additions/<id>.json`, one per artist:

```json
{ "id": "spacemen-3", "name": "Spacemen 3",
  "place": { "realm": "...", "lineage": "...", "layer": "...", "genres": [], "country": "GB", "activeFrom": 1982, "signatureSong": "...", "scenes": [] },
  "edges": [ { "source": "spacemen-3", "target": "velvet-underground", "sourceTier": "first-person",
              "confidence": 0.85, "url": "...", "found": "<exact sentence>",
              "citation": "<finished sentence for a reader: who, where, when, what was said>",
              "note": "<optional>" } ],
  "denials": [ { "source": "...", "target": "...", "url": "...", "found": "...", "citation": "...", "strength": "clean|contested" } ],
  "rejected": [ { "pair": "x>y", "why": "..." } ],
  "content": { "bio": "...", "album": { "title": "...", "year": 0, "classicReason": "..." } },
  "searches": 0, "toolStatus": "...", "notes": "..." }
```

Report back briefly: per artist, edges found (up/down, by tier), denials,
anything the owner should rule on.
