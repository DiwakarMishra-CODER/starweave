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
  "agent": "retry1",
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
  "key": "alex-g>elliott-smith",
  "from": "Alex G",
  "to": "Elliott Smith",
  "fromYear": 2010,
  "toYear": 1994,
  "citation": "Consequence (2015), \"Ruining Alex G\": \"I've been really influenced by Elliott Smith's singing style. When you sing like that, in a kind of whispery way... I do it for no other reason than it makes it easier to sing in tune, to hit all the notes correctly. And also I didn't want to wake my roommates.\" Corroborated in OndaRock: \"I listened to Elliott Smith a lot when I was younger, so it seems natural that my music might reflect his sound.\"",
  "sourceTier": "first-person",
  "lastTry": "One search for the Consequence (2015) 'Ruining Alex G' piece and the OndaRock quote; neither came up. Wikipedia's Alex G page says Smith 'is an influence of his' with no usable footnote found here. Not exhausted."
 },
 {
  "key": "arca>aphex-twin",
  "from": "Arca",
  "to": "Aphex Twin",
  "fromYear": 2012,
  "toYear": 1992,
  "citation": "FADER's \"Arca Finds Xen\" (2014): her teenage project Nuuro consisted of \"glitchy, Aphex Twin-inspired beat compositions\"; GRAMMY.com quote: \"I have a brother seven years older... He had a lot of Aphex Twin, Squarepusher.\"",
  "sourceTier": "first-person",
  "lastTry": "Out of search share (25 used) before this link. Only tried: Wikipedia for the artist where relevant; no page found. Sources named: FADER 'Arca Finds Xen' (2014) and a GRAMMY.com piece. Not searched."
 },
 {
  "key": "arca>squarepusher",
  "from": "Arca",
  "to": "Squarepusher",
  "fromYear": 2012,
  "toYear": 1995,
  "citation": "GRAMMY.com, Arca on her teenage listening: \"I have a brother seven years older... He had a lot of Aphex Twin, Squarepusher.\"",
  "sourceTier": "first-person",
  "lastTry": "One search for GRAMMY.com and FADER. Neither page came up. Wikipedia's Arca page says her childhood listening to her brother's music (Aphex Twin, Squarepusher, Björk) was an influence, with footnote [8] I did not follow. Not exhausted."
 },
 {
  "key": "depeche-mode>gary-numan",
  "from": "Depeche Mode",
  "to": "Gary Numan",
  "fromYear": 1980,
  "toYear": 1977,
  "citation": "Depeche Mode's Wikipedia biography describes the band's synth sound as \"inspired by acts like Gary Numan and the Human League.\"",
  "sourceTier": "first-person",
  "lastTry": "Current Wikipedia Depeche Mode article has no 'inspired by acts like Gary Numan and the Human League' sentence; it only says Numan cited DM. Not searched further: budget."
 },
 {
  "key": "geese>interpol",
  "from": "Geese",
  "to": "Interpol",
  "fromYear": 2017,
  "toYear": 1997,
  "citation": "Rolling Stone feature/interview on Geese.",
  "sourceTier": "first-person",
  "lastTry": "Rolling Stone feature not located in 1 search (Rolling Stone Italia/Brazil hits, Wikipedia pages for Geese and Cameron Winter, Kaput opened: Interpol appears only in a Kaput line comparing debut-album legacies, not influence). Citation names no article title or date."
 },
 {
  "key": "geese>yeah-yeah-yeahs",
  "from": "Geese",
  "to": "Yeah Yeah Yeahs",
  "fromYear": 2017,
  "toYear": 2000,
  "citation": "Foster Bassin, Still Listening: \"I was a big Strokes fan in middle school and high school. And you know, same with Interpol and the Yeah Yeah Yeahs.\"",
  "sourceTier": "first-person",
  "lastTry": "Out of search share (25 used) before this link. Only tried: Wikipedia for the artist where relevant; no page found. Source named: Foster Bassin on the Still Listening podcast. Not searched."
 },
 {
  "key": "mogwai>fugazi",
  "from": "Mogwai",
  "to": "Fugazi",
  "fromYear": 1995,
  "toYear": 1986,
  "citation": "Slugmag, Justin Burch interview (Aug 13, 2004). Slugmag, Justin Burch interview (Aug 13, 2004).",
  "sourceTier": "first-person",
  "lastTry": "Slugmag Aug 2004 (read in full) has no Fugazi. Wikipedia lists Fugazi among Mogwai's incorporated influences only via The Rough Guide (Simmonds, 2003 Buckley ed.), not first-person. Not searched further."
 },
 {
  "key": "my-bloody-valentine>the-jesus-and-mary-chain",
  "from": "My Bloody Valentine",
  "to": "The Jesus and Mary Chain",
  "fromYear": 1983,
  "toYear": 1983,
  "citation": "Kevin Shields has called the Cocteau Twins/JAMC comparison \"garbage,\" but concedes Psychocandy as \"the shared record\" between the two bands' sounds.",
  "sourceTier": "first-person",
  "lastTry": "One search. The Shields quote about the Cocteau Twins/JAMC comparison being 'garbage' and Psychocandy as 'the shared record' was not found anywhere. Closest lead, only seen in search results and not opened: Westword's Shields Q&A (https://www.westword.com/music/my-bloody-valentines-kevin-shields-talks-loveless-and-the-influence-of-bands-like-sonic-youth-and-dinosaur-jr-5103473), where he discusses the Cocteau Twins comparison, but no JAMC statement was visible. Encyclopedia.com's MBV bio says The New Record EP showed a JAMC influence; that is a reported claim with no Shields words."
 },
 {
  "key": "nick-cave-and-the-bad-seeds>david-bowie",
  "from": "Nick Cave & The Bad Seeds",
  "to": "David Bowie",
  "fromYear": 1983,
  "toYear": 1969,
  "citation": "Nick Cave told the German magazine Spex in 2013 that David Bowie was his idol, and that he owned all of Bowie's early albums along with the three Berlin records.",
  "sourceTier": "first-person",
  "lastTry": "Spex 2013 not found (1 search). Wikipedia says only that Cave's school band covered Bowie, Reed, Roxy. Far Out has a Cave piece on Bowie ('a certain kind of immortality', https://faroutmagazine.co.uk/the-star-nick-cave-hailed-as-immortal/) that was not checked for an influence statement."
 },
 {
  "key": "siouxsie-and-the-banshees>david-bowie",
  "from": "Siouxsie & The Banshees",
  "to": "David Bowie",
  "fromYear": 1976,
  "toYear": 1969,
  "citation": "NPR: Siouxsie Sioux grew up on Bowie and Lou Reed. AllMusic's prose bio recounts her head being turned seeing Bowie perform on television.",
  "sourceTier": "first-person",
  "lastTry": "One search. Not opened: thisisdig.com's Starman Top of the Pops article (the fetch redirected to the Rhino homepage) credits Siouxsie, aged 15, with \"I just couldn’t believe how striking he was\"; and indiehoy.com quotes a 2016 Mojo interview, \"I can say hand on heart I don't know where I'd be without David Bowie\". Both are secondhand. Suggested next step: find Siouxsie's own Mojo 2016 piece or the original Bowie-on-TV quote. The NPR / AllMusic items in the original citation were not located."
 },
 {
  "key": "sonic-youth>black-flag",
  "from": "Sonic Youth",
  "to": "Black Flag",
  "fromYear": 1981,
  "toYear": 1976,
  "citation": "Lee Ranaldo, Wikipedia/Sonic Youth -- SST-label admiration rather than a direct sound-influence claim, flagged weaker-tier.",
  "sourceTier": "first-person",
  "lastTry": "One search. The cited Ranaldo line is Wikipedia's 'It was the first record company we were on that we really would have given anything to be on', which is about the SST label, not influence. Not opened (only seen on a Last.fm/Seymour Duncan mirror, which are barred). Leads, not opened: Tidal 'How to Embrace Your Influences' (https://tidal.com/magazine/article/how-to-embrace-your-influences/1-95824), where Moore talks about hardcore and Black Flag's Jealous Again, and Far Out's Thurston Moore favourite-albums piece, which lists Damaged. Neither was confirmed as Moore saying Black Flag shaped Sonic Youth. Rescue (26 Oct): the archived Tidal page has Moore saying Black Flag was the primary influence on the young hardcore bands, not on Sonic Youth. The current citation text also breaks the citation rule (pipeline words) and should be rewritten or the link reconsidered."
 },
 {
  "key": "xiu-xiu>this-mortal-coil",
  "from": "Xiu Xiu",
  "to": "This Mortal Coil",
  "fromYear": 2002,
  "toYear": 1983,
  "citation": "Jamie Stewart, Sun 13 (2024): \"They were really into the '80s... 4AD records like Bauhaus, This Mortal Coil, Cocteau Twins. The Wolfgang Press was another huge one for me.\"",
  "sourceTier": "first-person",
  "lastTry": "Out of search share (25 used) before this link. Only tried: Wikipedia for the artist where relevant; no page found. Source named: Jamie Stewart, Sun 13 (2024). Not searched."
 },
 {
  "key": "arca>autechre",
  "from": "Arca",
  "to": "Autechre",
  "fromYear": 2012,
  "toYear": 1987,
  "citation": "FADER (2014): \"Aided partly by his older brother's CD collection, he went through a series of musical obsessions... Aaliyah, Autechre, Nine Inch Nails, Marilyn Manson.\"",
  "sourceTier": "first-person",
  "lastTry": "One search for the FADER 2014 piece. Not found. Not exhausted."
 },
 {
  "key": "arcade-fire>neutral-milk-hotel",
  "from": "Arcade Fire",
  "to": "Neutral Milk Hotel",
  "fromYear": 2001,
  "toYear": 1989,
  "citation": "Red Bull Music Academy lecture, Win Butler: Merge had In the Aeroplane Over the Sea, \"a complete classic\"; he says Magnetic Fields and Neutral Milk were about as good as anything, and their dream was to be on Merge partly because of this record. rs500albums adds Butler has said this was the primary reason they signed with Merge.",
  "sourceTier": "first-person",
  "lastTry": "One search for the Red Bull Music Academy lecture; the page did not come up. A Treble piece and a Popshifter piece say Butler signed to Merge partly because it was Neutral Milk Hotel's label, which is a label reason, not an influence statement."
 },
 {
  "key": "explosions-in-the-sky>tortoise",
  "from": "Explosions in the Sky",
  "to": "Tortoise",
  "fromYear": 1999,
  "toYear": 1990,
  "citation": "Epigram Q&A (2023): \"it gave us a lot of inspiration to see bands like Mogwai and Tortoise making really cool music that had no vocals.\"",
  "sourceTier": "first-person",
  "lastTry": "1 search for the Epigram Q&A (2023) quote; no page found; epigram.org.uk site search page showed nothing. Search budget used up before a second try. Related finding: Chris Hrasky has named Mogwai and Dirty Three (not Tortoise) in other interviews per search summary only (unread)."
 },
 {
  "key": "kurt-vile>velvet-underground",
  "from": "Kurt Vile",
  "to": "The Velvet Underground",
  "fromYear": 2003,
  "toYear": 1965,
  "citation": "Kurt Vile said in an interview with Under the Radar in April 2022 that he grew up listening to the Velvet Underground.",
  "sourceTier": "first-person",
  "lastTry": "One search. The Under the Radar (April 2022) interview did not come up; an Under the Radar review of (watch my moves) did, with no VU quote. Other April 2022 interviews found (SPIN, Stereogum, Flood) and an AP piece say Vile signed to Verve, the VU's label, but do not carry him saying he grew up on the VU. An AP quote saying 'Verve was Velvet Underground’s home' is from someone else (a Verve executive or fan, not Vile)."
 },
 {
  "key": "mazzy-star>nick-drake",
  "from": "Mazzy Star",
  "to": "Nick Drake",
  "fromYear": 1988,
  "toYear": 1968,
  "citation": "David Roback, 1990: \"I've listened to Nick Drake -- there is a certain feeling in his music that I find very tangible and sad.\"",
  "sourceTier": "first-person",
  "lastTry": "1 search for the 1990 Roback quote; Westword 1997 and 'Mother of Invention' pages and Uncut 2013 opened, none mention Nick Drake as Roback's influence (Westword only says Jansch's songs were covered by Drake). Search budget used up."
 },
 {
  "key": "perfume-genius>liz-phair",
  "from": "Perfume Genius",
  "to": "Liz Phair",
  "fromYear": 2008,
  "toYear": 1991,
  "citation": "The Quietus's Baker's Dozen: on Exile in Guyville, Hadreas said \"this album changed music for me when I was about 12... hearing someone sing about it without apology and with power was just really helpful.\"",
  "sourceTier": "first-person",
  "lastTry": "1 search (Quietus Baker's Dozen, quote words); no Quietus page surfaced; guessed URL returned 'Page not found'. Search budget used up."
 },
 {
  "key": "ride>mudhoney",
  "from": "Ride",
  "to": "Mudhoney",
  "fromYear": 1988,
  "toYear": 1988,
  "citation": "Neil Halstead, quoted in Magnet, same account of Ride/Slowdive's shared touchstones naming Mudhoney and Dinosaur Jr.",
  "sourceTier": "first-person",
  "lastTry": "Citation attributes it to Neil Halstead (Slowdive) in Magnet; one search found no such page and Mudhoney is on no Ride page read (Under the Radar, Premier Guitar, FACT, Fused). Likely wrong band; propose remove unless owner has the Magnet page."
 },
 {
  "key": "the-postal-service>kraftwerk",
  "from": "The Postal Service",
  "to": "Kraftwerk",
  "fromYear": 2001,
  "toYear": 1970,
  "citation": "Ben Gibbard, SPIN (Aug 2024): \"I grew up a huge Depeche Mode fan, a huge Kraftwerk fan... New Order.\"",
  "sourceTier": "first-person",
  "lastTry": "1 search; SPIN Gibbard interview (Sept 2023) opened with read: no 'Kraftwerk' anywhere in it (it names OMD, Depeche Mode, Human League only in the writer's voice). Quote and date (Aug 2024) not located."
 },
 {
  "key": "wolf-alice>the-replacements",
  "from": "Wolf Alice",
  "to": "The Replacements",
  "fromYear": 2010,
  "toYear": 1979,
  "citation": "In Pitchfork's \"Perfect 10\" video series, Wolf Alice chose the Replacements' Tim, and one of the band described Paul Westerberg as \"super influential to me.\"",
  "sourceTier": "first-person",
  "lastTry": "One search for the Pitchfork 'Perfect 10' video. No Pitchfork page or transcript came up, so the 'super influential to me' line is unconfirmed."
 },
 {
  "key": "xiu-xiu>cocteau-twins",
  "from": "Xiu Xiu",
  "to": "Cocteau Twins",
  "fromYear": 2002,
  "toYear": 1979,
  "citation": "Jamie Stewart, Sun 13 (2024): \"They were really into the '80s... 4AD records like Bauhaus, This Mortal Coil, Cocteau Twins. The Wolfgang Press was another huge one for me.\"",
  "sourceTier": "first-person",
  "lastTry": "One search ('4AD records like Bauhaus, This Mortal Coil, Cocteau Twins' Sun 13). The Sun 13 (2024) page did not come up. Not exhausted."
 },
 {
  "key": "xiu-xiu>joy-division",
  "from": "Xiu Xiu",
  "to": "Joy Division",
  "fromYear": 2002,
  "toYear": 1976,
  "citation": "The sticker on Xiu Xiu's debut album Knife Play lists what Jamie Stewart was listening to when his mother died -- Henry Cowell, Joy Division, Detroit techno, the Smiths, Takemitsu, Sabbath, Gamelan, \"Black Angels,\" and Cecil Taylor.",
  "sourceTier": "first-person",
  "lastTry": "One search for the group of four Xiu Xiu links, aimed at the Sun 13 quote. The Knife Play sticker was not found. Not exhausted."
 },
 {
  "key": "xiu-xiu>nico",
  "from": "Xiu Xiu",
  "to": "Nico",
  "fromYear": 2002,
  "toYear": 1967,
  "citation": "Stewart described the sonic direction of Angel Guts: Red Classroom as \"a mean, tight hearted, blackness of Neubauten vs Suicide vs Nico.\" (Vice)",
  "sourceTier": "first-person",
  "lastTry": "Not searched separately. Try the Vice page on Angel Guts: Red Classroom (a mean, tight hearted, blackness of Neubauten vs Suicide vs Nico). Note this quote describes the album's sound, not necessarily an influence statement."
 },
 {
  "key": "xiu-xiu>swans",
  "from": "Xiu Xiu",
  "to": "Swans",
  "fromYear": 2002,
  "toYear": 1982,
  "citation": "Jamie Stewart on Michael Gira, The Beijinger (2014): \"I admire that he has never given up, has never relented in his intensity, and that he continues, after 30 years, to change and grow his music... It is good to have that model before you.\"",
  "sourceTier": "first-person",
  "lastTry": "Not searched separately; the single Xiu Xiu search did not surface The Beijinger (2014). Try a direct search for the Jamie Stewart/Michael Gira Beijinger piece."
 },
 {
  "key": "bark-psychosis>wire",
  "from": "Bark Psychosis",
  "to": "Wire",
  "fromYear": 1986,
  "toYear": 1976,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched for the Sutton/Audrie's Diary list in two searches. Wire appears only in Wikipedia's 'Other early influences' sentence (no Sutton quote). The article that quotes the zine (In Sheep's Clothing HiFi) does not mention Wire. The zine itself is at post-rock.lv/bark2.htm, which I could not open. The archived zine page (post-rock.lv/bark2.htm, read) mentions Wire only as a song they covered on Game Over; a cover isn't influence."
 }
]
```
