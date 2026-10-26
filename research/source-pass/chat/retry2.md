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
  "agent": "retry2",
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
  "key": "joy-division>the-stooges",
  "from": "Joy Division",
  "to": "The Stooges",
  "fromYear": 1976,
  "toYear": 1967,
  "citation": "Hook: \"Ian gave me Metallic K.O. and it blew my mind. I'd never heard of Iggy or the Velvets; he introduced me to it all.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched the exact quote and Hook + Louder Than War top-10; no page carries 'Ian gave me Metallic K.O.' Only lead: Louder Than War 2012 'Peter Hook: my top 10 favourite albums' (opened via web.archive.org copy) lists 'Iggy & The Stooges - Metallic KO' with no commentary at all (favourites list only, and it names no Ian Curtis gift). Quote may come from a Hook book (Unknown Pleasures / Substance) - unverified."
 },
 {
  "key": "new-order>the-stooges",
  "from": "New Order",
  "to": "The Stooges",
  "fromYear": 1980,
  "toYear": 1967,
  "citation": "Peter Hook: \"Ian gave me Metallic K.O. and it blew my mind\" -- though this predates Joy Division/New Order.",
  "sourceTier": "first-person",
  "lastTry": "Searched the exact quote and Hook + Louder Than War top-10; no page carries 'Ian gave me Metallic K.O.' Only lead: Louder Than War 2012 'Peter Hook: my top 10 favourite albums' (opened via web.archive.org copy) lists 'Iggy & The Stooges - Metallic KO' with no commentary at all (favourites list only, and it names no Ian Curtis gift). Quote may come from a Hook book (Unknown Pleasures / Substance) - unverified. Also the Joy Division link carries the same quote."
 },
 {
  "key": "rem>big-star",
  "from": "R.E.M.",
  "to": "Big Star",
  "fromYear": 1980,
  "toYear": 1971,
  "citation": "Buck: \"I was hoping we might get as popular as Big Star.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches (exact quote; Buck + Big Star + 'as popular'); no page carries 'I was hoping we might get as popular as Big Star.' Related line that IS sourced: Wikipedia's Big Star page quotes Peter Buck: \"We've sort of flirted with greatness, but we've yet to make a record as good as Revolver or Highway 61 Revisited or Exile on Main Street or Big Star's Third.\" (footnote is a book, Jovanovic p.247 per the rp tag) - an admiration/comparison, not a hope to be as popular; could replace the caption if the owner wants it."
 },
 {
  "key": "snail-mail>st-vincent",
  "from": "Snail Mail",
  "to": "St. Vincent",
  "fromYear": 2015,
  "toYear": 2007,
  "citation": "Lindsey Jordan told Modern Girls in 2017 that she and St. Vincent shared classical guitar training, calling her \"the first artist I saw myself in.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched the exact quote with Modern Girls/2017, then Snail Mail + St. Vincent + 'saw myself in'; no page found. Wikipedia's Snail Mail page raw wikitext has no St. Vincent or 'saw myself' text. Modern Girls Magazine page not located."
 },
 {
  "key": "dinosaur-jr>husker-du",
  "from": "Dinosaur Jr.",
  "to": "Hüsker Dü",
  "fromYear": 1984,
  "toYear": 1979,
  "citation": "J Mascis: \"our ambition was to tour like they did and sign to SST Records.\"",
  "sourceTier": "first-person",
  "lastTry": "Page known but closed to bots and to the owner too (26 Oct 2026): https://www.pressreader.com/uk/mojo-uk/20210501/281496459032582. Mascis in MOJO, May 2021 oral history (PressReader: https://www.pressreader.com/uk/mojo-uk/20210501/281496459032582, found by search; summary said: 'We loved the Minutemen, Hüsker Dü and the Meat Puppets, and our ambition was to tour like they did and sign to SST Records, the label they were on'). read gets only PressReader's paywall shell. Look for that sentence and that Mascis speaks. Note the old Hüsker Dü citation quoted only the tail 'our ambition was to tour like they did...' which names no one; use the full sentence."
 },
 {
  "key": "dinosaur-jr>minutemen",
  "from": "Dinosaur Jr.",
  "to": "Minutemen",
  "fromYear": 1984,
  "toYear": 1980,
  "citation": "MOJO oral history, May 2021: J Mascis: \"We loved the Minutemen, Hüsker Dü and the Meat Puppets, and our ambition was to tour like they did and sign to SST Records.\"",
  "sourceTier": "first-person",
  "lastTry": "Page known but closed to bots and to the owner too (26 Oct 2026): https://www.pressreader.com/uk/mojo-uk/20210501/281496459032582. Mascis in MOJO, May 2021 oral history (PressReader: https://www.pressreader.com/uk/mojo-uk/20210501/281496459032582, found by search; summary said: 'We loved the Minutemen, Hüsker Dü and the Meat Puppets, and our ambition was to tour like they did and sign to SST Records, the label they were on'). read gets only PressReader's paywall shell. Look for that sentence and that Mascis speaks. Note the old Hüsker Dü citation quoted only the tail 'our ambition was to tour like they did...' which names no one; use the full sentence."
 },
 {
  "key": "modest-mouse>drive-like-jehu",
  "from": "Modest Mouse",
  "to": "Drive Like Jehu",
  "fromYear": 1992,
  "toYear": 1990,
  "citation": "Isaac Brock (2007): \"Jehu is one of my favorite all-time bands actually.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched exact quote (3 searches); Wikipedia's Drive Like Jehu article states Brock said in 2007: \"I love [Drive Like] Jehu. Jehu is one of my favorite all-time bands actually.\" with a footnote I could not read from the page text. No page carrying it opened (AV Club Random Rules, Rolling Stone Q&A, Spin 2004, Herald 2007 checked: no Jehu). Citation names no outlet."
 },
 {
  "key": "lcd-soundsystem>can",
  "from": "LCD Soundsystem",
  "to": "Can",
  "fromYear": 2002,
  "toYear": 1968,
  "citation": "James Murphy, RBMA lecture: \"When I found Can I was in heaven 'cause they were just like, 'Here's this for 30 minutes.'\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches (exact quotes, RBMA transcript). RBMA lecture is a video (Vimeo 67135948 / RBMA New York 2013, 90 min; London 2012 also exists) with no transcript text found; redbullmusicacademy.com lecture URLs guessed return 404. Fused, NME and Spin Murphy interviews opened: no Gang of Four / Can-heaven line. Citation names no date or venue; owner may need to watch the video."
 },
 {
  "key": "lcd-soundsystem>gang-of-four",
  "from": "LCD Soundsystem",
  "to": "Gang of Four",
  "fromYear": 2002,
  "toYear": 1976,
  "citation": "James Murphy, RBMA lecture: \"later on I got into like Gang Of Four and stuff like that.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches (exact quotes, RBMA transcript). RBMA lecture is a video (Vimeo 67135948 / RBMA New York 2013, 90 min; London 2012 also exists) with no transcript text found; redbullmusicacademy.com lecture URLs guessed return 404. Fused, NME and Spin Murphy interviews opened: no Gang of Four / Can-heaven line. Citation names no date or venue; owner may need to watch the video."
 },
 {
  "key": "boards-of-canada>my-bloody-valentine",
  "from": "Boards of Canada",
  "to": "My Bloody Valentine",
  "fromYear": 1986,
  "toYear": 1983,
  "citation": "Pitchfork interview (2005): \"even if we don't sound like them, there's a connection in terms of the approach to music.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches. The 2005 Pitchfork interview exists (Wikipedia cites it for the brothers reveal) but search never returned its URL (pitchfork.com is closed to the search tool) and guessed URLs are 404. twoism.org Age interview, Wikipedia: no MBV line. Owner could find the Pitchfork 2005 BoC interview and look for 'connection in terms of the approach to music'."
 },
 {
  "key": "wednesday>unwound",
  "from": "Wednesday",
  "to": "Unwound",
  "fromYear": 2017,
  "toYear": 1991,
  "citation": "The Forty-Five (2023), Karly Hartzman: \"We are listening to a lot of music and lyricists and noise and shoegaze bands like our favourite bands Unwound and Swirlies.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches (outlet+quote, thefortyfive.com Hartzman 2023). The Forty-Five page never surfaced; guessed URL 404. DIY (Apr 2023) and two Clash Hartzman interviews opened: no Unwound. Her NTS show (30 Apr 2026) lists Unwound tracks but that is a playlist, not an influence statement."
 },
 {
  "key": "black-country-new-road>godspeed-you-black-emperor",
  "from": "Black Country, New Road",
  "to": "Godspeed You! Black Emperor",
  "fromYear": 2018,
  "toYear": 1994,
  "citation": "Saxophonist Lewis Evans to the Line of Best Fit, qualified: \"I don't know much about them but I love the way they sound.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches (exact quote; Evans+Line of Best Fit+Godspeed). No Line of Best Fit Evans interview surfaced; Best Fit's Stewart Lee conversation snippet and Wikipedia pages have no Godspeed line. Quietus 'Frenz Experiments' BCNR interview opened: no Godspeed. Even if found, the quote is Evans saying he doesn't know them, so the link would likely be a decide (not influence). Revisited after owner's ruling: 'We like Slint' / 'I love the way they sound' would count as fan statements if the pages are found; still not-found."
 },
 {
  "key": "black-country-new-road>slint",
  "from": "Black Country, New Road",
  "to": "Slint",
  "fromYear": 2018,
  "toYear": 1986,
  "citation": "Lewis Evans to the Line of Best Fit, on the constant Slint comparisons: \"We like Slint, but we'd be on more common ground with post-rock I think.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched the exact quote and Evans/Line of Best Fit; no page. Wikipedia only says critics compared them to Slint. Quote itself reads as a mild denial of the comparison, so owner may want to treat the link as critic-only or remove. Revisited after owner's ruling: 'We like Slint' / 'I love the way they sound' would count as fan statements if the pages are found; still not-found."
 },
 {
  "key": "ethel-cain>imogen-heap",
  "from": "Ethel Cain",
  "to": "Imogen Heap",
  "fromYear": 2019,
  "toYear": 1998,
  "citation": "Ethel Cain told Crack Magazine in a December 2022 cover story that friends she met on Tumblr as a teenager introduced her to artists who \"influence her to this day,\" naming Daughter, Banks, Susanne Sundfor and Imogen Heap; she told Vice in July 2024 that discovering that side of pop made her think, \"that's what I want to make.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches (Vice July 2024 quote; Crack Magazine Dec 2022 cover story): no Cain/Heap page surfaced. Crack's Ethel Cain cover feature (Issue 132, Emma Garland) exists and is where the Heap/Daughter/Banks line should be; its URL was not found. Wikipedia Ethel Cain has no Heap line. Also the caption 'that's what I want to make.' is only 6 words and comes from the Vice piece."
 },
 {
  "key": "drive-by-truckers>neil-young",
  "from": "Drive-By Truckers",
  "to": "Neil Young",
  "fromYear": 1996,
  "toYear": 1966,
  "citation": "The Bluegrass Situation, Hood: \"I'm sure part of that influence was Todd Rundgren and Neil Young, too, 'cause he's all over the map. A lot of the artists I love tend to go all over the map.\"",
  "sourceTier": "first-person",
  "lastTry": "2 searches (Bluegrass Situation + Hood + the quote words); no page. Found only Cover Me and Slant pages with nothing on Neil Young as influence in these words. Speaker is Patterson Hood."
 },
 {
  "key": "porter-robinson>ninajirachi",
  "from": "Porter Robinson",
  "to": "Ninajirachi",
  "fromYear": 2010,
  "toYear": 2017,
  "citation": "Robinson, in a triple j interview with Ninajirachi, on two things he took from her into his own studio practice: her approach to lyrics -- \"she would just kind of like come up with stuff and not overthink it and go for it and sell it really. And I've been trying to carry that with me in the studio\" -- and her \"glitch generation\" technique of recording long files of experimental sound to draw on, which he says \"led to so many breakthroughs.\"",
  "sourceTier": "first-person",
  "lastTry": "2 searches for the triple j interview (quote words, WannaCry/Abby and Tyrone); only news coverage, no transcript. Possibly a video/radio segment; the owner may know the page."
 },
 {
  "key": "the-human-league>kraftwerk",
  "from": "The Human League",
  "to": "Kraftwerk",
  "fromYear": 1977,
  "toYear": 1970,
  "citation": "Philip Oakey, on co-founder Martyn Ware: \"Martyn came around, and under his arm he had Kraftwerk's Trans-Europe Express and I Feel Love by Donna Summer\" (Oakey interview, FLOOD/Reybee); corroborated by Wikipedia: \"The Sheffield scene in which The Human League formed... took more influence from Kraftwerk.\"",
  "sourceTier": "first-person",
  "lastTry": "2 searches (Oakey/Ware/Trans-Europe Express/I Feel Love; the exact 'Martyn came around' line); nothing. Wikipedia's Human League page says only that the Sheffield scene 'took more influence from Kraftwerk' (critic-level). Tier first-person unsupported by any open page."
 },
 {
  "key": "my-bloody-valentine>siouxsie-and-the-banshees",
  "from": "My Bloody Valentine",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1983,
  "toYear": 1976,
  "citation": "Kevin Shields to Karen Leng, Double J / ABC (8 Apr 2021), on the dark post-punk bands the band drew from: \"the best of all was Siouxsie and the Banshees, the Cure and Killing Joke.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches ('Double J Karen Leng Kevin Shields' with the quote, and an abc.net.au variant) turned up no Double J / ABC page and no 'the best of all was Siouxsie and the Banshees, the Cure and Killing Joke' line. Lead, from search snippets only and not opened: Wikipedia's Kevin Shields page says his 1981 band A Life in the Day was 'influenced by Siouxsie and the Banshees and Joy Division'. Follow its footnote for a real source. Tier would be reported at best."
 },
 {
  "key": "my-bloody-valentine>the-cure",
  "from": "My Bloody Valentine",
  "to": "The Cure",
  "fromYear": 1983,
  "toYear": 1978,
  "citation": "Kevin Shields to Karen Leng, Double J / ABC (8 Apr 2021), same answer: \"the best of all was Siouxsie and the Banshees, the Cure and Killing Joke.\"",
  "sourceTier": "first-person",
  "lastTry": "Same two searches as the Siouxsie link; the Double J / Karen Leng page was not found, so the quote could not be verified. In the Arthur 2003 interview (opened) Shields names Joy Division, Birthday Party/Cramps, Einsturzende Neubauten and the Byrds, but not the Cure. No other source for this link was found."
 },
 {
  "key": "fugazi>sonic-youth",
  "from": "Fugazi",
  "to": "Sonic Youth",
  "fromYear": 1986,
  "toYear": 1981,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person",
  "lastTry": "Two searches ('Cultural Glitch Guy Picciotto Fugazi influences...' and '\"Cultural Glitch\" Fugazi Picciotto 2011'). No Cultural Glitch page appeared. The sentence 'Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex' reads like a third-person summary, not Picciotto speaking; treat the quote as unverified. Picciotto-related pages found (Wikipedia, Last.fm mirrors, Apple) are barred or give no first-person influence quote."
 },
 {
  "key": "fugazi>bad-brains",
  "from": "Fugazi",
  "to": "Bad Brains",
  "fromYear": 1986,
  "toYear": 1977,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person",
  "lastTry": "Same two Cultural Glitch searches as fugazi>sonic-youth; no page found. One lead from a search snippet, not opened: a Shadowproof article quotes Picciotto in a 2002 interview 'What, like the Bad Brains weren't emotional?', which is not an influence statement."
 },
 {
  "key": "fugazi>minutemen",
  "from": "Fugazi",
  "to": "Minutemen",
  "fromYear": 1986,
  "toYear": 1980,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person",
  "lastTry": "Same two Cultural Glitch searches as fugazi>sonic-youth; no page found and no other source for Minutemen turned up."
 },
 {
  "key": "fugazi>black-flag",
  "from": "Fugazi",
  "to": "Black Flag",
  "fromYear": 1986,
  "toYear": 1976,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person",
  "lastTry": "Same two Cultural Glitch searches as fugazi>sonic-youth; no page found and no other source for Black Flag turned up."
 },
 {
  "key": "mogwai>kraftwerk",
  "from": "Mogwai",
  "to": "Kraftwerk",
  "fromYear": 1995,
  "toYear": 1970,
  "citation": "Stuart Braithwaite, The Line of Best Fit, Andrew Hannah, \"From Young Team to Atomic: Stuart Braithwaite on twenty years of Mogwai\" (Apr 11, 2016).",
  "sourceTier": "first-person",
  "lastTry": "Line of Best Fit 'From Young Team to Atomic' (Apr 2016): live URL 404s, archive copy (web.archive.org/web/20160413052640/http://www.thelineofbestfit.com/news/latest-news/from-young-team-to-atomic-stuart-braithwaite-on-twenty-years-of-mogwai) opens but has no 'Kraftwerk'. Wikipedia Mogwai says 'Braithwaite also listed Nirvana, Kraftwerk, and guitarist John McGeoch as personal influences' with footnotes 65, 67, 69 (not followed: out of searches). Drowned in Sound mixtape has no Kraftwerk. Rescue (26 Oct): the archived Line of Best Fit copy names Kraftwerk only in a sidebar headline, not in the interview."
 },
 {
  "key": "nirvana>neil-young",
  "from": "Nirvana",
  "to": "Neil Young",
  "fromYear": 1987,
  "toYear": 1966,
  "citation": "Kurt Cobain told Les Inrockuptibles in 1993 that he had unbounded admiration for Neil Young, calling his career exemplary -- he did everything, tried everything, and never gave people what they expected.",
  "sourceTier": "first-person",
  "lastTry": "Searched Les Inrockuptibles 1993 Cobain Neil Young; nothing carrying the quote. Far Out/thrasherswheat pages opened had no first-person Cobain statement."
 },
 {
  "key": "nirvana>ramones",
  "from": "Nirvana",
  "to": "Ramones",
  "fromYear": 1987,
  "toYear": 1974,
  "citation": "Discussing the new-wave strand of his own record collection, Kurt Cobain named the B-52's, Devo, and the Ramones in the same breath.",
  "sourceTier": "first-person",
  "lastTry": "Searched B-52's/Devo/Ramones Cobain; no page. livenirvana Jan 1991 and Far Out new wave pages have no Ramones."
 },
 {
  "key": "pavement>slint",
  "from": "Pavement",
  "to": "Slint",
  "fromYear": 1989,
  "toYear": 1986,
  "citation": "Bob Nastanovich (Pavement) ranked Spiderland among his favorite albums -- Rob Jovanovic, Perfect Sound Forever (2004).",
  "sourceTier": "first-person",
  "lastTry": "Searched Perfect Sound Forever / Nastanovich / Jovanovic / Spiderland; no page found."
 },
 {
  "key": "ride>the-jesus-and-mary-chain",
  "from": "Ride",
  "to": "The Jesus and Mary Chain",
  "fromYear": 1988,
  "toYear": 1983,
  "citation": "Bell, MusicRadar: \"We were basically translating our version of a certain crop of 60s bands... and putting that through a filter of what was going on right then. The Mary Chain, the Valentines, the House Of Love and Spacemen 3.\"",
  "sourceTier": "first-person",
  "lastTry": "MusicRadar quote (Mary Chain, the Valentines, House Of Love, Spacemen 3) not found: 2 searches; opened musicradar.com Andy Bell Rickenbacker piece and Gardener interview, neither carries it. Speaker would be Andy Bell, not Mark. FACT 2015 says in its own voice Ride smashed together MBV, House of Love and the Mary Chain (critic) but that is not the Bell quote."
 },
 {
  "key": "snail-mail>liz-phair",
  "from": "Snail Mail",
  "to": "Liz Phair",
  "fromYear": 2015,
  "toYear": 1991,
  "citation": "Lindsey Jordan named Liz Phair in the same 2016 9:30 Club interview in which she named Grouper, Broadcast, Joni Mitchell, Psychic TV and Beat Happening as artists she was listening to while writing Habit.",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>grouper",
  "from": "Snail Mail",
  "to": "Grouper",
  "fromYear": 2015,
  "toYear": 2005,
  "citation": "Lindsey Jordan said in a 2016 interview at the 9:30 Club, posted to Tumblr, that while writing Habit she was listening to a lot of Grouper, Broadcast, Joni Mitchell, Psychic TV, Beat Happening and Liz Phair, adding that not all of them influenced the album stylistically but she had learned from their songwriting, which she called articulate and inspirational.",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>broadcast",
  "from": "Snail Mail",
  "to": "Broadcast",
  "fromYear": 2015,
  "toYear": 1995,
  "citation": "The same 2016 9:30 Club interview names Broadcast alongside Grouper, Joni Mitchell, Psychic TV, Beat Happening and Liz Phair as artists Lindsey Jordan was listening to while writing Habit.",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>sleater-kinney",
  "from": "Snail Mail",
  "to": "Sleater-Kinney",
  "fromYear": 2015,
  "toYear": 1994,
  "citation": "Lindsey Jordan told Modern Girls in 2017 that she got into punk in middle school and was \"really into Sleater-Kinney and Bratmobile.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>beach-house",
  "from": "Snail Mail",
  "to": "Beach House",
  "fromYear": 2015,
  "toYear": 2004,
  "citation": "In the same Modern Girls interview, Jordan named Beach House among the indie bands with \"thorough songwriting\" that will \"always be faves.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>bratmobile",
  "from": "Snail Mail",
  "to": "Bratmobile",
  "fromYear": 2015,
  "toYear": 1991,
  "citation": "The same Modern Girls quote in which Jordan names Sleater-Kinney also names Bratmobile as a band she got into during middle school.",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>sharon-van-etten",
  "from": "Snail Mail",
  "to": "Sharon Van Etten",
  "fromYear": 2015,
  "toYear": 2005,
  "citation": "The same Modern Girls interview in which Jordan named Beach House also named Sharon Van Etten among her lasting favorites.",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 },
 {
  "key": "snail-mail>joni-mitchell",
  "from": "Snail Mail",
  "to": "Joni Mitchell",
  "fromYear": 2015,
  "toYear": 1964,
  "citation": "Lindsey Jordan named Joni Mitchell in the same 2016 9:30 Club interview in which she named Grouper, Broadcast and Liz Phair as artists she was listening to while writing Habit.",
  "sourceTier": "first-person",
  "lastTry": "Searched for the 2016 9:30 Club/Tumblr interview and the 2017 Modern Girls interview by exact phrases and names; neither found. Opened Fader 2017, SPIN 2018, Interview Magazine, Highsnobiety, Honeycombers, Emily Elhaj, KALX and Wikipedia: none name these artists as Jordan's influences."
 }
]
```
