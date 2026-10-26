THIS IS A RETRY PACK. Every link below was already tried once and marked not-found. Each one carries "lastTry": what the last checker searched and the leads it saw but never opened. Start from those leads (open the pages, follow the footnotes, try the Internet Archive copies) and don't repeat the searches already listed. If you find nothing new, return "not-found" with a note that says what YOU tried this time.

You're helping check sources for Starweave, a map of who influenced whom in indie music. Below is a list of influence links. Each `key` is `source>target`: the first artist was influenced by the second. Each has a `citation` saying who said it and where. For every link, find the web page that actually carries the claim, open it, and read it.

Precision beats speed: an honest "not-found" is far better than a wrong "ok".

RULES
1. Open the actual page and read it. A search result's snippet or summary is NEVER evidence: search tools have invented quotes before.
2. `found` = one or two consecutive sentences copied EXACTLY from the page (including any quote the citation uses). Don't retype, tidy, shorten or join paragraphs. A script will re-open every page and look for this exact text, so a paraphrase fails.
3. The quote must be the right person speaking: the artist, not the interviewer or the journalist's own listening.
4. It must say INFLUENCE, in the right direction (first artist shaped by the second). Being a fan counts: the artist saying they loved, grew up on, were big fans of, or kept listening to the other artist while forming or making their own music is first-person influence. Fandom someone else reports counts too, at tier "reported": a journalist saying the artist loved X, a bandmate or the other artist saying so, the band's own ad. These are NOT influence: a bare favourites list with no comment, a "what I'm listening to now" answer, covering a song, sharing a member, a producer, a label, a collaboration, being listed in the same genre, and a critic saying they sound alike ("recalls", "sounds like", "the X of its generation"): mark that "decide". Tier "critic" is only for a critic arguing the first artist drew on the second.
5. Never use Grokipedia. Never use AllMusic's bare "influences" panel, The Student Playlist's "Influenced by" lists, Apple Music editorial "Influences" playlists, or bio blurbs copied across Last.fm-type sites.
6. Wikipedia only as a last resort: follow its footnote to the real source and use that. A Wikipedia claim with no footnote is tier "reported" at best.
7. Per link: at most two searches. Then stop and mark it "not-found" with what you tried.
8. If you know the exact page but can't open it (paywall, login, bot wall), mark it "blocked" with the page's direct URL and what to look for on it.
9. Opening Internet Archive copies: if your fetch tool refuses an archive URL you built yourself, search for the page first so the URL appears in a result, or say so in the note; never call a page unopenable without trying.
10. Before marking anything "not-found" or "blocked" when you know the page: try the Internet Archive copy (https://web.archive.org/web/2020/<the page URL>, and older years). Walled or deleted pages are very often there. Only after that fails is it not-found or blocked.
11. A page you can't open in any form (Under the Radar's live site, PressReader, the Quietus paywall, the Telegraph): try the Internet Archive first; if that fails too, it's "not-found" with the URL in the note, not "blocked".

12. If your fetch tool refuses an Internet Archive URL, do not call the link blocked or not-found for that reason: give the archive URL (and what to look for) in "note" with verdict "blocked". I can open archive copies on my side.

VERDICTS
- "ok": page carries it, citation stands. Needs url + found.
- "fixed": page carries it but you corrected the citation (outlet, year, the quote's exact words) and/or tier. Needs url + found + the new "citation" and/or "sourceTier".
- "not-found": needs "note" (what you searched).
- "blocked": needs "url" (the page itself) + "note" (what to look for).
- "decide": the page exists but doesn't support the link (only a resemblance, wrong direction, a cover, a denial, the wrong speaker). Don't fix it: "note" says what the page says and proposes remove / flip / record as denial / keep as critic.

Tiers: "first-person" = the artist's own words; "reported" = a publication states it, no quote; "critic" = a critic's comparison.

A rewritten citation is a finished sentence: who, where, when, what was said, with straight double quotes around verbatim words. Example: Andy Bell to Under the Radar (2013): "Early on in Ride, it was Spacemen 3, House of Love, My Bloody Valentine..."

Rewrite nothing into a citation that is a note to me ("could not be checked", "the page misprints", "not the BBC"): those go in "note". A citation is only what a reader should see.

ANSWER with only this JSON, in one code block, every link included:

{
  "agent": "retry6",
  "searches": <how many searches you ran>,
  "toolStatus": "<any sites you couldn't open, any search problems>",
  "entries": {
    "<key>": { "url": "...", "found": "...", "checked": "2026-10-26", "verdict": "ok" }
  },
  "candidates": [],
  "offMap": [],
  "finished": true
}

(Optional, no extra searching: if a passage you're already reading has the artist naming another influence, add it to "offMap" as {"name", "namedBy": "<the artist's id from the key>", "sentence", "url"}.)

If you can't finish all of them in one reply, do as many as you can properly, return the JSON for those, and say so.

THE LINKS
```json
[
 {
  "key": "beck>nick-drake",
  "from": "Beck",
  "to": "Nick Drake",
  "fromYear": 1988,
  "toYear": 1968,
  "citation": "A biography: from the late 1990s he merged his junkyard style with psychedelic rock, electronic music, tropicalia, and the music of Nick Drake and Serge Gainsbourg.",
  "sourceTier": "critic",
  "lastTry": "Two searches for the biography sentence and a Beck interview naming Nick Drake: nothing readable. Wikipedia Nick Drake page has no Beck paragraph via read. Search summaries say Beck covered Pink Moon songs (2005) and Sea Change had Drake-like strings, unverified."
 },
 {
  "key": "bikini-kill>siouxsie-and-the-banshees",
  "from": "Bikini Kill",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1990,
  "toYear": 1976,
  "citation": "PopMatters: Siouxsie and the Banshees, the Slits and X-Ray Spex \"all boasted singers that introduced new tones and techniques\" and had \"an even greater influence on later Riot Grrrl successors.\"",
  "sourceTier": "critic",
  "lastTry": "PopMatters article not found; the quoted sentence names no Bikini Kill member. No Bikini Kill member naming Siouxsie found in one search. Propose remove unless a first-person source appears."
 },
 {
  "key": "bikini-kill>x-ray-spex",
  "from": "Bikini Kill",
  "to": "X-Ray Spex",
  "fromYear": 1990,
  "toYear": 1976,
  "citation": "PopMatters: Siouxsie and the Banshees, the Slits and X-Ray Spex \"all boasted singers that introduced new tones and techniques\" and had \"an even greater influence on later Riot Grrrl successors.\"",
  "sourceTier": "critic",
  "lastTry": "PopMatters article not found in three searches. The quoted sentence, as cited, is about the three bands' influence on 'later Riot Grrrl successors' in general; it doesn't name Bikini Kill. Search summaries (unread) say Tobi Vail has talked about hearing the Slits at 12-13. Needs a Bikini Kill member's own words; propose remove if none."
 },
 {
  "key": "broken-social-scene>galaxie-500",
  "from": "Broken Social Scene",
  "to": "Galaxie 500",
  "fromYear": 1999,
  "toYear": 1987,
  "citation": "AV Club: On Fire cast a wide shadow over Beach House, Deerhunter, Pains of Being Pure at Heart, Broken Social Scene.",
  "sourceTier": "critic",
  "lastTry": "Searched AV Club On Fire + band names; no AV Club page found. Read rockandrollglobe Galaxie 500 On Fire at 30 and Wikipedia Galaxie 500: no Broken Social Scene mention. Also a 'cast a shadow over' sentence is at most a resemblance claim; propose remove if the AV Club page cannot be produced."
 },
 {
  "key": "descendents>dead-kennedys",
  "from": "Descendents",
  "to": "Dead Kennedys",
  "fromYear": 1977,
  "toYear": 1978,
  "citation": "Wikipedia's Dead Kennedys page, via an AllMusic-sourced footnote rather than any member statement.",
  "sourceTier": "critic",
  "lastTry": "Wikipedia Descendents (rendered and raw) has no Dead Kennedys sentence; Rolling Stone 9th & Walnut interview and The Note feature have none either; one search on Descendents interviews found no Dead Kennedys mention (search summary said Stevenson named Ramones, Television, the Last). Propose remove unless an AllMusic prose sentence is produced."
 },
 {
  "key": "pulp>david-bowie",
  "from": "Pulp",
  "to": "David Bowie",
  "fromYear": 1978,
  "toYear": 1969,
  "citation": "Apple Music's editorial \"Pulp: Influences\": inspirations run well beyond the Kinks, from ABBA's Swedish disco to the glam-rock strut of Bowie and T. Rex.",
  "sourceTier": "critic",
  "lastTry": "Apple Music editorial page excluded by rule. One search for Jarvis Cocker on Bowie: NME page (read) says Bowie 'saved' him after the 1996 Brit Awards, which is not influence on Pulp's music. No Pulp-bio or Cocker interview line on Bowie as formative opened. Still open if owner wants a further search."
 },
 {
  "key": "spiritualized>talk-talk",
  "from": "Spiritualized",
  "to": "Talk Talk",
  "fromYear": 1990,
  "toYear": 1981,
  "citation": "Music Musings names Talk Talk as an influence on Spiritualized, a connection that recurs across critical writing on Talk Talk's Hex-era work.",
  "sourceTier": "critic",
  "lastTry": "Music Musings page not located. Far Out piece on J. Spaceman's five albums has no Talk Talk. Wikipedia Spiritualized only has a footnote title 'Do Make Say Think Members on Tortoise, Spiritualized, Talk Talk Classics', which is not Pierce. No Pierce statement on Talk Talk found in one search."
 },
 {
  "key": "the-walkmen>bjork",
  "from": "The Walkmen",
  "to": "Björk",
  "fromYear": 2000,
  "toYear": 1977,
  "citation": "AllMusic's band biography names their influences as a diverse set including the Pogues, Joy Division, Bruce Springsteen, Bjork, U2 and New Order.",
  "sourceTier": "critic",
  "lastTry": "Same as the-walkmen>joy-division: AllMusic bio not opened."
 },
 {
  "key": "the-walkmen>joy-division",
  "from": "The Walkmen",
  "to": "Joy Division",
  "fromYear": 2000,
  "toYear": 1976,
  "citation": "AllMusic's band biography names their influences as a diverse set including the Pogues, Joy Division, Bruce Springsteen, Bjork, U2 and New Order. No first-person corroboration found.",
  "sourceTier": "critic",
  "lastTry": "AllMusic biography not opened: guessed URL resolved to another artist; Wikipedia Walkmen page (read) has no Pogues/Joy Division influences sentence; one search found only Encyclopedia.com (U2, Pixies, Dylan, Tom Waits). Propose remove or re-check with the correct AllMusic URL from the owner."
 },
 {
  "key": "the-walkmen>new-order",
  "from": "The Walkmen",
  "to": "New Order",
  "fromYear": 2000,
  "toYear": 1980,
  "citation": "AllMusic's band biography names their influences as a diverse set including the Pogues, Joy Division, Bruce Springsteen, Bjork, U2 and New Order. No first-person corroboration found.",
  "sourceTier": "critic",
  "lastTry": "Same as the-walkmen>joy-division: AllMusic bio not opened."
 },
 {
  "key": "turnstile>black-flag",
  "from": "Turnstile",
  "to": "Black Flag",
  "fromYear": 2010,
  "toYear": 1976,
  "citation": "Hypebeast's hardcore-lineage piece places Turnstile downstream of Black Flag, though this framing is general hardcore history rather than a Turnstile-specific citation.",
  "sourceTier": "critic",
  "lastTry": "Vice/Noisey interview, Grammy.com, Crack, Wikipedia read: none names Black Flag as Turnstile's influence. Hypebeast page not located."
 }
]
```
