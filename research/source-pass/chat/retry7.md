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
  "agent": "retry7",
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
  "key": "elliott-smith>sebadoh",
  "from": "Elliott Smith",
  "to": "Sebadoh",
  "fromYear": 1994,
  "toYear": 1986,
  "citation": "A music-directory retrospective asserts Sebadoh's lo-fi approach influenced Modest Mouse, Elliott Smith, the Microphones/Mount Eerie, and Car Seat Headrest.",
  "sourceTier": "critic",
  "lastTry": "one search (Sebadoh lo-fi influenced Modest Mouse/Elliott Smith/Microphones/CSH) gave aggregator and LLM-encyclopedia pages only; Wikipedia raw for Sebadoh, Elliott Smith, Modest Mouse (and Isaac Brock) has no Sebadoh claim in the right direction. Directory page not identified."
 },
 {
  "key": "explosions-in-the-sky>bark-psychosis",
  "from": "Explosions in the Sky",
  "to": "Bark Psychosis",
  "fromYear": 1999,
  "toYear": 1986,
  "citation": "Spectrum Culture and Stereogum both name Bark Psychosis's \"Absent Friend\" as a blueprint for Explosions in the Sky's sound.",
  "sourceTier": "critic",
  "lastTry": "Searched Spectrum Culture/Stereogum + Absent Friend blueprint, and band interviews (Hrasky names Mogwai and Dirty Three; nothing on Bark Psychosis). Wikipedia pages for EITS, Bark Psychosis, Hex checked, no link. Proposal: remove unless the two pieces turn up."
 },
 {
  "key": "interpol>siouxsie-and-the-banshees",
  "from": "Interpol",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1997,
  "toYear": 1976,
  "citation": "Will Hodgkinson, \"Interpol: misery loves a comeback,\" The Times (9 Jul 2022), on songs \"recalling the post-punk iciness of Echo & the Bunnymen and Siouxsie and the Banshees\" -- a critic's comparison, not a claim the band makes.",
  "sourceTier": "critic",
  "lastTry": "The Times (9 Jul 2022, Will Hodgkinson) is paywalled; page URL not found and no search spent. The citation's own wording ('recalling the post-punk iciness of ...') is a comparison, so proposal: remove unless another source is found."
 },
 {
  "key": "king-gizzard-and-the-lizard-wizard>kraftwerk",
  "from": "King Gizzard and the Lizard Wizard",
  "to": "Kraftwerk",
  "fromYear": 2010,
  "toYear": 1970,
  "citation": "Loudwire/Full Metal Jackie: the host says \"You mentioned Kraftwerk and Devo... that type of thing definitely has influenced Gizz a lot over the years.\" Mackenzie raised the names; the host supplied the influence framing.",
  "sourceTier": "reported",
  "lastTry": "two searches (Loudwire/Full Metal Jackie + Mackenzie; Mackenzie Kraftwerk); no Loudwire page found; Wikipedia pages for band and Mackenzie have no Kraftwerk mention. Tape Op blog only speculates."
 },
 {
  "key": "modest-mouse>sebadoh",
  "from": "Modest Mouse",
  "to": "Sebadoh",
  "fromYear": 1992,
  "toYear": 1986,
  "citation": "A music-directory retrospective asserts Sebadoh's lo-fi approach influenced Modest Mouse, Elliott Smith, the Microphones/Mount Eerie, and Car Seat Headrest.",
  "sourceTier": "critic",
  "lastTry": "one search (Sebadoh lo-fi influenced Modest Mouse/Elliott Smith/Microphones/CSH) gave aggregator and LLM-encyclopedia pages only; Wikipedia raw for Sebadoh, Elliott Smith, Modest Mouse (and Isaac Brock) has no Sebadoh claim in the right direction. Directory page not identified."
 },
 {
  "key": "mount-eerie>sebadoh",
  "from": "The Microphones / Mount Eerie",
  "to": "Sebadoh",
  "fromYear": 1996,
  "toYear": 1986,
  "citation": "A music-directory retrospective asserts Sebadoh's lo-fi approach influenced Modest Mouse, Elliott Smith, the Microphones/Mount Eerie, and Car Seat Headrest.",
  "sourceTier": "critic",
  "lastTry": "Two searches (directory retrospective claim; Elverum + Sebadoh interviews): no page naming Sebadoh as an influence on Mount Eerie/Microphones. Proposal: remove unless Elverum's own words turn up."
 },
 {
  "key": "phoebe-bridgers>neutral-milk-hotel",
  "from": "Phoebe Bridgers",
  "to": "Neutral Milk Hotel",
  "fromYear": 2014,
  "toYear": 1989,
  "citation": "Music-directory retrospective naming Bon Iver, Sufjan Stevens and Phoebe Bridgers among its citers.",
  "sourceTier": "critic",
  "lastTry": "one search for a Bridgers statement on Neutral Milk Hotel (Rolling Stone, Far Out, Line of Best Fit, Talkhouse results) found none; Wikipedia pages for Bridgers and NMH do not name her. The 'music-directory retrospective' was not identified. Propose remove."
 },
 {
  "key": "snail-mail>duster",
  "from": "Snail Mail",
  "to": "Duster",
  "fromYear": 2015,
  "toYear": 1996,
  "citation": "AllMusic's prose biography of Duster credits the band's patient, minimal approach as an influence on artists including Snail Mail and Alex G.",
  "sourceTier": "critic",
  "lastTry": "searched Lindsey Jordan + Duster (Spin, Red Bull, Stereogum, Fender pieces name other bands, not Duster); AllMusic's Duster biography URL (guessed id) did not carry it; Wikipedia Duster page has no Snail Mail line (only Alex G show). Owner could open AllMusic's Duster biography in a browser to see the sentence."
 },
 {
  "key": "swans>this-heat",
  "from": "Swans",
  "to": "This Heat",
  "fromYear": 1982,
  "toYear": 1976,
  "citation": "AllMusic bio, Fred Thomas -- a single shared critic-attributed citation rather than an individual quote, flagged weaker-tier. AllMusic bio, Fred Thomas -- critic-attributed, weaker-tier.",
  "sourceTier": "critic",
  "lastTry": "Wikipedia's This Heat page lists Swans among bands influenced, but its footnotes (AllMusic bio via Internet Archive 2020, The Quietus 2011 Deceit anniversary) both read: no Swans. One search for a Gira statement found none (Gira in Scene Point Blank 2014 says early influences from other groups, now 'ourself'; names CAN, early Kraftwerk, Popul Vuh elsewhere). Propose remove unless a source appears."
 },
 {
  "key": "the-jesus-and-mary-chain>kraftwerk",
  "from": "The Jesus and Mary Chain",
  "to": "Kraftwerk",
  "fromYear": 1983,
  "toYear": 1970,
  "citation": "LA Times: their sound is where \"the Shangri-Las, the Velvet Underground, the Beach Boys, Kraftwerk and the Stooges harmoniously converged.\"",
  "sourceTier": "critic",
  "lastTry": "two searches for the LA Times 'harmoniously converged' sentence; no page found (a 1992 LAT Hilburn review on a Usenet archive does not mention Kraftwerk); Wikipedia's JAMC page has no Kraftwerk. Even if found, 'converged' is a sound comparison. Propose remove unless the owner can supply the LAT page."
 },
 {
  "key": "unwound>can",
  "from": "Unwound",
  "to": "Can",
  "fromYear": 1991,
  "toYear": 1968,
  "citation": "Fred Thomas, AllMusic bio -- critic-sourced rather than a member quote. Fred Thomas, AllMusic bio -- critic-sourced and weaker-tier.",
  "sourceTier": "critic",
  "lastTry": "Wikipedia lists Can among Unwound's influences with no footnote of its own; Scaruffi interview, Stereogum Sara Lund Turntable, Treble, Clrvynt and Midwest Action Trosper interviews all read: no Can. A Wikipedia mirror ties Can to the side project Replikants only."
 },
 {
  "key": "women>caribou",
  "from": "Women",
  "to": "Caribou",
  "fromYear": 2007,
  "toYear": 2000,
  "citation": "A radio-show writeup lists comparisons to Caribou, the Velvet Underground, Deerhoof and Abe Vigoda.",
  "sourceTier": "critic",
  "lastTry": "The 'radio-show writeup' was not identified; a comparison list is not influence. Proposal: remove."
 },
 {
  "key": "women>velvet-underground",
  "from": "Women",
  "to": "The Velvet Underground",
  "fromYear": 2007,
  "toYear": 1965,
  "citation": "A radio-show writeup lists comparisons to Caribou, the Velvet Underground, Deerhoof and Abe Vigoda.",
  "sourceTier": "critic",
  "lastTry": "The 'radio-show writeup' was not identified; searches found only comparisons (Westword: 'compared to ... the drone-heavy noise rock pioneered by the Velvet Underground'). Comparison only; proposal: remove."
 },
 {
  "key": "women>wire",
  "from": "Women",
  "to": "Wire",
  "fromYear": 2007,
  "toYear": 1976,
  "citation": "Treble: Public Strain is \"more Sonic Youth or Wire, or perhaps a mutant offspring of The Zombies' gorgeous melodies and This Heat's menacing post-punk.\"",
  "sourceTier": "critic",
  "lastTry": "Treble Public Strain review (archive.org 2016 copy) does not mention Wire; the quoted sentence was not found there or in a search. Proposal: remove."
 },
 {
  "key": "yo-la-tengo>big-star",
  "from": "Yo La Tengo",
  "to": "Big Star",
  "fromYear": 1984,
  "toYear": 1971,
  "citation": "Ira Kaplan discovered Big Star via Chris Stamey and an Alex Chilton gig at CBGB.",
  "sourceTier": "reported",
  "lastTry": "searched Kaplan/Big Star/Stamey/CBGB twice; only Third tribute concerts (Rolling Stone 2011, Kaplan sang Chilton songs) and a testimonial in the Big Star documentary 'Nothing Can Hurt Me'; no page for the discovery anecdote. Rolling Stone page read: no discovery claim."
 }
]
```
