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
  "agent": "chat5",
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
  "key": "airiel>my-bloody-valentine",
  "from": "Airiel",
  "to": "My Bloody Valentine",
  "fromYear": 1996,
  "toYear": 1983,
  "citation": "Jeremy Wrenn: \"My Bloody Valentine was definitely something that I was listening to when Airiel started.\" Asked whether the comparison was lazy or an honest influence, he said, \"to be perfectly honest, it's both.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "airiel>cocteau-twins",
  "from": "Airiel",
  "to": "Cocteau Twins",
  "fromYear": 1996,
  "toYear": 1979,
  "citation": "Jeremy Wrenn describes getting into the Cocteau Twins, Lush, My Bloody Valentine, Ride and \"all those great British bands\" as Airiel's formative listening.",
  "sourceTier": "first-person"
 },
 {
  "key": "airiel>lush",
  "from": "Airiel",
  "to": "Lush",
  "fromYear": 1996,
  "toYear": 1987,
  "citation": "Jeremy Wrenn describes getting into the Cocteau Twins, Lush, My Bloody Valentine, Ride and \"all those great British bands\" as Airiel's formative listening.",
  "sourceTier": "first-person"
 },
 {
  "key": "airiel>ride",
  "from": "Airiel",
  "to": "Ride",
  "fromYear": 1996,
  "toYear": 1988,
  "citation": "Jeremy Wrenn describes getting into the Cocteau Twins, Lush, My Bloody Valentine, Ride and \"all those great British bands\" as Airiel's formative listening.",
  "sourceTier": "first-person"
 },
 {
  "key": "beabadoobee>pavement",
  "from": "beabadoobee",
  "to": "Pavement",
  "fromYear": 2017,
  "toYear": 1989,
  "citation": "NME: \"My influencers are Sonic Youth, Pavement -- this shit that totally shaped me. They shaped the way I dress, how I speak, act and just everything I am.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "beabadoobee>sonic-youth",
  "from": "beabadoobee",
  "to": "Sonic Youth",
  "fromYear": 2017,
  "toYear": 1981,
  "citation": "NME: \"My influencers are Sonic Youth, Pavement -- this shit that totally shaped me. They shaped the way I dress, how I speak, act and just everything I am.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "beabadoobee>elliott-smith",
  "from": "beabadoobee",
  "to": "Elliott Smith",
  "fromYear": 2017,
  "toYear": 1994,
  "citation": "She has named Elliott Smith among her first big influences, tattooed \"XO\" (his fourth album's title) on her arm, and has said she took the chords from his song \"Bled White\" directly for her own song \"Take a Bite.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "belle-and-sebastian>velvet-underground",
  "from": "Belle and Sebastian",
  "to": "The Velvet Underground",
  "fromYear": 1996,
  "toYear": 1965,
  "citation": "In a 2014 interview, Stuart Murdoch said Belle and Sebastian's sound was a combination of post-punk and embracing the beauty of the '60s and '70s: the Velvets, the Monkees, the Byrds, Love.",
  "sourceTier": "first-person"
 },
 {
  "key": "blonde-redhead>sonic-youth",
  "from": "Blonde Redhead",
  "to": "Sonic Youth",
  "fromYear": 1993,
  "toYear": 1981,
  "citation": "Kazu Makino has cited Sonic Youth as a key inspiration",
  "sourceTier": "first-person"
 },
 {
  "key": "blonde-redhead>my-bloody-valentine",
  "from": "Blonde Redhead",
  "to": "My Bloody Valentine",
  "fromYear": 1993,
  "toYear": 1983,
  "citation": "Kazu Makino cites My Bloody Valentine alongside Sonic Youth as a key inspiration.",
  "sourceTier": "first-person"
 },
 {
  "key": "broken-social-scene>talk-talk",
  "from": "Broken Social Scene",
  "to": "Talk Talk",
  "fromYear": 1999,
  "toYear": 1981,
  "citation": "SPIN's \"My Favorite Things,\" Kevin Drew: \"Laughing Stock by Talk Talk and Whatever You Love, You Are by the Dirty Three. These two records are tied for the most authentic human emotion ever captured on an album. Both will come with me to the next life.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "broken-social-scene>dirty-three",
  "from": "Broken Social Scene",
  "to": "Dirty Three",
  "fromYear": 1999,
  "toYear": 1992,
  "citation": "SPIN's \"My Favorite Things,\" Kevin Drew: \"Laughing Stock by Talk Talk and Whatever You Love, You Are by the Dirty Three. These two records are tied for the most authentic human emotion ever captured on an album. Both will come with me to the next life.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "candy-claws>blonde-redhead",
  "from": "Candy Claws",
  "to": "Blonde Redhead",
  "fromYear": 2007,
  "toYear": 1993,
  "citation": "Ryan Hoover, on making Ceres & Calypso, FLOOD Magazine: \"We were also listening to a lot of Blonde Redhead's album 23, which also skirts shoegaze, though it's really washy.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "candy-claws>my-bloody-valentine",
  "from": "Candy Claws",
  "to": "My Bloody Valentine",
  "fromYear": 2007,
  "toYear": 1983,
  "citation": "Ryan Hoover, Break Yr Legs: \"I listened to Starflyer and My Bloody Valentine during my high school years.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "candy-claws>the-knife",
  "from": "Candy Claws",
  "to": "The Knife",
  "fromYear": 2007,
  "toYear": 1999,
  "citation": "Ryan Hoover, Break Yr Legs: \"I was actually reading through your blog and you got me really into The Knife and I've been listening to lots of Boards of Canada, so that might come off in our future work.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "candy-claws>boards-of-canada",
  "from": "Candy Claws",
  "to": "Boards of Canada",
  "fromYear": 2007,
  "toYear": 1986,
  "citation": "Ryan Hoover, Break Yr Legs: \"I was actually reading through your blog and you got me really into The Knife and I've been listening to lots of Boards of Canada, so that might come off in our future work.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "duster>velvet-underground",
  "from": "Duster",
  "to": "The Velvet Underground",
  "fromYear": 1996,
  "toYear": 1965,
  "citation": "Clay Parton, La Linea Mason & Dixon interview (Aug 7, 2020): \"codeine but also like Rorshach and Thelonius Monk and The Velvet Underground.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "duster>codeine",
  "from": "Duster",
  "to": "Codeine",
  "fromYear": 1996,
  "toYear": 1989,
  "citation": "Clay Parton, La Linea Mason & Dixon interview (Aug 7, 2020): \"codeine but also like Rorshach and Thelonius Monk and The Velvet Underground.\" Clay Parton, La Linea Mason & Dixon interview (Aug 7, 2020).",
  "sourceTier": "first-person"
 },
 {
  "key": "mudhoney>wipers",
  "from": "Mudhoney",
  "to": "Wipers",
  "fromYear": 1988,
  "toYear": 1977,
  "citation": "Life of the Record (2024), Mark Arm and Steve Turner on making Superfuzz Bigmuff: \"When we were kind of forming the song ['No One Has'], it kind of reminded us a little bit of the Wipers, another Northwest influence on us.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "mudhoney>black-flag",
  "from": "Mudhoney",
  "to": "Black Flag",
  "fromYear": 1988,
  "toYear": 1976,
  "citation": "Steve Turner, Popwell (2023), on Black Flag's My War: \"I swear, that record instantly made the Melvins slow down to a crawl... And I know it was a huge influence on us as well.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "perfume-genius>xiu-xiu",
  "from": "Perfume Genius",
  "to": "Xiu Xiu",
  "fromYear": 2008,
  "toYear": 2002,
  "citation": "The Fader (2021): \"there's some music like Xiu Xiu, who I love, where their songs are so intense and visceral and over the top.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "perfume-genius>stars-of-the-lid",
  "from": "Perfume Genius",
  "to": "Stars of the Lid",
  "fromYear": 2008,
  "toYear": 1992,
  "citation": "The Quietus's Baker's Dozen: on And Their Refinement of the Decline, Mike Hadreas said he listened to it before writing his first album and credits it with unlocking his creative process, describing it as a \"calming wash\" he could use in a \"lucid dreaming kind of way.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "perfume-genius>low",
  "from": "Perfume Genius",
  "to": "Low",
  "fromYear": 2008,
  "toYear": 1993,
  "citation": "The Quietus's Baker's Dozen: on Things We Lost in the Fire, Hadreas praises its \"hymnal quality,\" calling it \"really minimal but full at the same time.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "spoon>wire",
  "from": "Spoon",
  "to": "Wire",
  "fromYear": 1993,
  "toYear": 1976,
  "citation": "American Songwriter 2021, Britt Daniel: starting out he was very much into bands like Wire and Talking Heads, shooting for that kind of lyric; still plays those Wire records.",
  "sourceTier": "first-person"
 },
 {
  "key": "spoon>talking-heads",
  "from": "Spoon",
  "to": "Talking Heads",
  "fromYear": 1993,
  "toYear": 1975,
  "citation": "American Songwriter 2021, Britt Daniel: starting out he was very much into bands like Wire and Talking Heads, shooting for that kind of lyric; still plays those Wire records.",
  "sourceTier": "first-person"
 },
 {
  "key": "spoon>gang-of-four",
  "from": "Spoon",
  "to": "Gang of Four",
  "fromYear": 1993,
  "toYear": 1976,
  "citation": "Encyclopedia.com's Spoon biography (drawing on Austin Chronicle): around A Series of Sneaks he was listening to and learning from Wire, Gang of Four and Public Image Ltd.",
  "sourceTier": "first-person"
 },
 {
  "key": "spoon>pixies",
  "from": "Spoon",
  "to": "Pixies",
  "fromYear": 1993,
  "toYear": 1986,
  "citation": "Rolling Stone 2025, on touring with the Pixies: describes them as a huge influence on Daniel growing up.",
  "sourceTier": "first-person"
 },
 {
  "key": "squid>stereolab",
  "from": "Squid",
  "to": "Stereolab",
  "fromYear": 2015,
  "toYear": 1990,
  "citation": "Borlase praised Stereolab's Tim Gane: \"I think he's just one of the best guitar players in that he's managed to kind of make that band's music so memorable and unique for them.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "squid>tortoise",
  "from": "Squid",
  "to": "Tortoise",
  "fromYear": 2015,
  "toYear": 1990,
  "citation": "Naming Tortoise's Millions Now Living Will Never Die among five albums he'd listen to forever, Borlase said it \"has this cool electronic sound, without vocals, and it kind of challenged a lot of the boundaries that they had at the time.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "squid>burial",
  "from": "Squid",
  "to": "Burial",
  "fromYear": 2015,
  "toYear": 2005,
  "citation": "Guitarist Louis Borlase told Loud And Quiet that Burial's Untrue was \"my first real introduction to electronic music.\"",
  "sourceTier": "first-person"
 }
]
```
