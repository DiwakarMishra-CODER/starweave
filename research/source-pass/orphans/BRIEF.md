# Orphan rescue (26 Oct 2026)

After the source pass dropped every unsourced link and ruled the decide list,
these artists have no links left. The project's no-orphans rule says an
artist with no sourced link leaves the map. Before that happens, try to find
**one or two sourced links** for each, to or from any artist on the map
(`research/source-pass/roster.txt`, minus julee-cruise, fishmans, sebadoh;
plus kate-bush, pj-harvey, scott-walker, spacemen-3, roxy-music, the-slits,
peter-cat-recording-co).

Your batch file lists each artist's removed links with why they went (don't
re-propose those on the same evidence). Method (CLAUDE.md "Search method"):
search the artist's **own** interviews first (upstream is cheap): Quietus
Baker's Dozens, Pitchfork 5-10-15-20, gear interviews; anchor on album
titles. Then, if needed, an artist on the map naming them. Open every page
with `npx tsx scripts/source-pass/ledger.ts read "<url>" <words>`; the
sentence must be on the page you opened, the right speaker, influence in the
right direction under the owner's rules (CLAUDE.md "What counts as
influence"; `research/source-pass/bakers-dozen/JUDGE.md`). No personnel,
label, production, covers or soundalikes. Never Grokipedia.

**At most 2 searches per artist (about 12 for your batch).** If nothing
solid turns up, say so: the artist leaves, and that's a fine answer.

Write `research/source-pass/orphans/found-<n>.json`:
```json
{ "agent": "orphans-<n>", "finished": true, "searches": 0, "toolStatus": "...",
  "found": [ { "source": "...", "target": "...", "sourceTier": "first-person|reported|critic",
              "confidence": 0.8, "url": "...", "found": "<exact sentence>",
              "citation": "<finished sentence: who, where, when, what was said>" } ],
  "none": [ { "artist": "...", "tried": "..." } ] }
```
Report back briefly. Touch nothing else.
