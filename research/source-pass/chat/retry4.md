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
  "agent": "retry4",
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
  "key": "grouper>this-mortal-coil",
  "from": "Grouper",
  "to": "This Mortal Coil",
  "fromYear": 2005,
  "toYear": 1983,
  "citation": "Liz Harris named It'll End in Tears among her five favorite albums of all time (Digital in Berlin interview).",
  "sourceTier": "first-person",
  "lastTry": "Searched Digital in Berlin + Grouper favourite albums, and quoted album titles; digitalinberlin.info pages and search not openable by read; Wikipedia, Norman Records, emilyelhaj interview don't carry it."
 },
 {
  "key": "grouper>siouxsie-and-the-banshees",
  "from": "Grouper",
  "to": "Siouxsie & The Banshees",
  "fromYear": 2005,
  "toYear": 1976,
  "citation": "Digital in Berlin interview: Liz Harris names Juju among her five favourite albums of all time.",
  "sourceTier": "first-person",
  "lastTry": "Same as grouper>this-mortal-coil: no page found carrying Harris naming Juju."
 },
 {
  "key": "mj-lenderman>silver-jews",
  "from": "MJ Lenderman",
  "to": "Silver Jews",
  "fromYear": 2019,
  "toYear": 1989,
  "citation": "In a WUVT/The Woove interview with Michael Haddad, Lenderman said Silver Jews is a band he loves \"so lyrically\" that it's been \"really helpful,\" calling himself a student of songwriters like David Berman.",
  "sourceTier": "first-person",
  "lastTry": "WUVT/The Woove interview not found by 3 searches; woove.wuvt.vt.edu returns 403 to read. No exact page URL known."
 },
 {
  "key": "mj-lenderman>bonnie-prince-billy",
  "from": "MJ Lenderman",
  "to": "Bonnie Prince Billy",
  "fromYear": 2019,
  "toYear": 1993,
  "citation": "WUVT/The Woove interview -- the \"Palace Music\" Lenderman names as a formative influence on his earlier sound is Will Oldham's early-career moniker, predating the Bonnie \"Prince\" Billy name.",
  "sourceTier": "first-person",
  "lastTry": "Palace Music claim lives in the WUVT/Woove interview, which could not be found or opened; Stereogum page has no Oldham mention."
 },
 {
  "key": "parquet-courts>guided-by-voices",
  "from": "Parquet Courts",
  "to": "Guided by Voices",
  "fromYear": 2010,
  "toYear": 1983,
  "citation": "The L Magazine, \"Inspiration Drills: On the Influence of Guided by Voices and Robert Pollard\": Andrew Savage on GBV's songwriting -- melodies that read as simple but aren't, songs that feel like navigating Pollard's brain.",
  "sourceTier": "first-person",
  "lastTry": "L Magazine piece 'Inspiration Drills' not found in 2 searches. Grantland (Sunbathing Animal) only lists GBV's 'brevity' as a critic's reference point and Savage calls such deconstruction 'spoiling'."
 },
 {
  "key": "parquet-courts>velvet-underground",
  "from": "Parquet Courts",
  "to": "The Velvet Underground",
  "fromYear": 2010,
  "toYear": 1965,
  "citation": "Louder Than War 2014, Savage by email: says Pavement isn't a big influence and they share similar influences instead -- naming the Velvet Underground, Roxy Music and the Fall.",
  "sourceTier": "first-person",
  "lastTry": "Louder Than War 2014 Savage email not found (2 searches, LTW search/guess URLs, Wikipedia footnotes, McSweeney's/KRLX/Yorkshire Post/Southwest Review interviews don't carry it). Grantland lists the Velvets as critic reference only."
 },
 {
  "key": "parquet-courts>the-fall",
  "from": "Parquet Courts",
  "to": "The Fall",
  "fromYear": 2010,
  "toYear": 1976,
  "citation": "Andrew Savage told Louder Than War by email that Pavement wasn't a big influence on Parquet Courts and that the band instead shares similar influences, naming the Velvet Underground, Roxy Music and the Fall.",
  "sourceTier": "first-person",
  "lastTry": "Same as parquet-courts>velvet-underground."
 },
 {
  "key": "women>this-heat",
  "from": "Women",
  "to": "This Heat",
  "fromYear": 2007,
  "toYear": 1976,
  "citation": "Women's Pat Flegel told Exclaim! that This Heat and Swell Maps provided the primary inspiration for the band's makeshift home-recording techniques.",
  "sourceTier": "first-person",
  "lastTry": "Exclaim 'Women Indulge Themselves' (exclaim.ca/music/article/women_indulge_themselves) opened: only 'a sound resting between Swell Maps and Syd Barrett', no This Heat; Jagjaguwar release notes name This Heat but as the label's comparison. Wikipedia Women/Public Strain, PopMatters feature, 2 searches: no first-person This Heat statement. treblezine interview could not be opened."
 },
 {
  "key": "blonde-redhead>sonic-youth",
  "from": "Blonde Redhead",
  "to": "Sonic Youth",
  "fromYear": 1993,
  "toYear": 1981,
  "citation": "Kazu Makino has cited Sonic Youth as a key inspiration",
  "sourceTier": "first-person",
  "lastTry": "Two searches. The only lead is a Pitchfork conversation with Kazu Makino (her influential albums), which I never reached. A FarOut Magazine article paraphrasing it has her saying Sonic Youth, Beck and Nirvana were 'bands I loved but definitely didn't identify with', so that page may not support SY as an influence. Another page I found, a BmoreArt interview (bmoreart.com/2024/04/standing-firm-at-thirty-an-interview-with-blonde-redheads-kazu-makino.html), only has the interviewer saying the band was compared to Sonic Youth. To check: open the Pitchfork page and look for a first-person Sonic Youth line; if there is none, mark it 'decide' (comparison only)."
 },
 {
  "key": "blonde-redhead>my-bloody-valentine",
  "from": "Blonde Redhead",
  "to": "My Bloody Valentine",
  "fromYear": 1993,
  "toYear": 1983,
  "citation": "Kazu Makino cites My Bloody Valentine alongside Sonic Youth as a key inspiration.",
  "sourceTier": "first-person",
  "lastTry": "Two searches. The Pitchfork Kazu Makino page never surfaced. FarOut Magazine says Makino told Pitchfork about hitting a 'wall of noise sound' during her early New York years: 'It was Lush and My Bloody Valentine.' That is probably the right first-person influence source, but I haven't opened the original. A TIDAL Magazine interview (tidal.com/magazine/article/blonde-redhead-its-almost-too-personal/1-8869) has her saying 'And of course My Bloody Valentine – they're so soothing', but that is an admired-sound answer, not influence. To check: open the Pitchfork page and copy the exact sentence."
 },
 {
  "key": "mudhoney>wipers",
  "from": "Mudhoney",
  "to": "Wipers",
  "fromYear": 1988,
  "toYear": 1977,
  "citation": "Life of the Record (2024), Mark Arm and Steve Turner on making Superfuzz Bigmuff: \"When we were kind of forming the song ['No One Has'], it kind of reminded us a little bit of the Wipers, another Northwest influence on us.\"",
  "sourceTier": "first-person",
  "lastTry": "One search. The Life of the Record (Talkhouse) podcast page (talkhouse.com/the-making-of-superfuzz-bigmuff-by-mudhoney-featuring-mark-arm-and-steve-turner) is a summary with no transcript, and the quote would be in the audio. Lead: Rolling Stone Italia, 'Senza i Wipers non ci sarebbero stati i Nirvana' (rollingstone.it/?p=529722), reports in Italian that Steve Turner called 'No One Has' the 'Wipers song' and that Turner and Arm formed Green River partly inspired by the Wipers. That would be tier 'reported', and I haven't opened it. Better to find the English original of that piece, or a transcript of the podcast."
 },
 {
  "key": "spoon>talking-heads",
  "from": "Spoon",
  "to": "Talking Heads",
  "fromYear": 1993,
  "toYear": 1975,
  "citation": "American Songwriter 2021, Britt Daniel: starting out he was very much into bands like Wire and Talking Heads, shooting for that kind of lyric; still plays those Wire records.",
  "sourceTier": "first-person",
  "lastTry": "Two searches for the American Songwriter (2021) Britt Daniel interview; it never surfaced. Nothing I read carried a Talking Heads link. Searched: Britt Daniel with Wire, Talking Heads, American Songwriter. Needs the American Songwriter page opened."
 },
 {
  "key": "the-postal-service>new-order",
  "from": "The Postal Service",
  "to": "New Order",
  "fromYear": 2001,
  "toYear": 1980,
  "citation": "SPIN, Ben Gibbard naming New Order alongside Kraftwerk and Depeche Mode.",
  "sourceTier": "first-person",
  "lastTry": "SPIN 2023 Gibbard interview (spinmagazine.com/2023/09/ben-gibbard-postal-service-death-cab-interview/) opened: only the writer's sentence that the project filtered OMD, Depeche Mode and Human League-style synth-pop; no Kraftwerk or New Order. MusicRadar Give Up oral history also lacks both. 2 searches, no page."
 },
 {
  "key": "the-postal-service>depeche-mode",
  "from": "The Postal Service",
  "to": "Depeche Mode",
  "fromYear": 2001,
  "toYear": 1980,
  "citation": "SPIN, Ben Gibbard naming Depeche Mode alongside Kraftwerk and New Order; corroborated by Jimmy Tamborello (XLR8R \"Rewind\"), whose side project Figurine's aesthetic came from \"love for bands like Kraftwerk and Depeche Mode.\"",
  "sourceTier": "first-person",
  "lastTry": "SPIN 2023 page has only the writer's sentence 'filtered OMD, Depeche Mode, and Human League-style synth-pop through the artists' more homespun sensibilities' (not Gibbard's words). XLR8R Rewind (Tamborello) not located. 2 searches. Could be lowered to reported on that SPIN sentence if owner wishes: url https://www.spinmagazine.com/2023/09/ben-gibbard-postal-service-death-cab-interview/"
 },
 {
  "key": "black-midi>godspeed-you-black-emperor",
  "from": "black midi",
  "to": "Godspeed You! Black Emperor",
  "fromYear": 2017,
  "toYear": 1994,
  "citation": "Geordie Greep told Rolling Stone their early sound was \"a droney, Godspeed, Swans, Boredoms thing.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched the quote (2 searches + read of Rolling Stone's 'Artist You Need to Know' / Schlagenheim review, Rolling Stone AU copy, Interview Magazine, KALX, Stereogum Greep solo interview, Wikipedia for black midi and Greep): no page carries it. The Rolling Stone feature (rollingstone.com/music/music-features/black-midi-schlagenheim-interview-947251/) only says Kwasniewski-Kelvin liked Japanese noise bands like the Boredoms and writer says Greep's vocal is reminiscent of David Byrne."
 },
 {
  "key": "black-midi>swans",
  "from": "black midi",
  "to": "Swans",
  "fromYear": 2017,
  "toYear": 1982,
  "citation": "Rolling Stone, naming Godspeed You! Black Emperor, Swans and Boredoms as touchstones for their early sound.",
  "sourceTier": "first-person",
  "lastTry": "Searched the quote (2 searches + read of Rolling Stone's 'Artist You Need to Know' / Schlagenheim review, Rolling Stone AU copy, Interview Magazine, KALX, Stereogum Greep solo interview, Wikipedia for black midi and Greep): no page carries it. The Rolling Stone feature (rollingstone.com/music/music-features/black-midi-schlagenheim-interview-947251/) only says Kwasniewski-Kelvin liked Japanese noise bands like the Boredoms and writer says Greep's vocal is reminiscent of David Byrne."
 },
 {
  "key": "black-midi>talking-heads",
  "from": "black midi",
  "to": "Talking Heads",
  "fromYear": 2017,
  "toYear": 1975,
  "citation": "Cameron Picton told FLOOD Magazine: \"We used to say Talking Heads, Deerhoof, and Danny Brown were our three main reference points.\"",
  "sourceTier": "first-person",
  "lastTry": "FLOOD Picton quote ('Talking Heads, Deerhoof, and Danny Brown were our three main reference points') not found; a search only returned retailer/venue blurbs saying the band bonded over liking Danny Brown, Death Grips, Deerhoof, Miles Davis and Talking Heads (unattributed boilerplate, not usable). Rolling Stone Schlagenheim feature only has the writer comparing Greep's vocal to David Byrne."
 },
 {
  "key": "fontaines-dc>joy-division",
  "from": "Fontaines D.C.",
  "to": "Joy Division",
  "fromYear": 2017,
  "toYear": 1976,
  "citation": "Guitar World feature/interview on Fontaines D.C.",
  "sourceTier": "first-person",
  "lastTry": "Guitar World feature (guitarworld.com/features/fontaines-dc-were-not-great-musicians-...) opened: no Joy Division. NME 2020 cover piece only lists JD as an influence people assume (journalist, not the band). NME 2022/2024, Hot Press, Vice also opened: nothing. Searches: 3 total on Fontaines."
 },
 {
  "key": "fontaines-dc>pixies",
  "from": "Fontaines D.C.",
  "to": "Pixies",
  "fromYear": 2017,
  "toYear": 1986,
  "citation": "Paste feature/interview on Fontaines D.C.",
  "sourceTier": "first-person",
  "lastTry": "Searched Fontaines + Pixies twice; opened Guitar World, NME 2020/2022/2024, Hot Press, Vice, Wikipedia raw: no Pixies mention. Paste piece never located."
 },
 {
  "key": "oklou>arca",
  "from": "Oklou",
  "to": "Arca",
  "fromYear": 2014,
  "toYear": 2012,
  "citation": "I-D magazine interview (around Galore): Oklou called Arca \"the REAL star of current experimental music.\"",
  "sourceTier": "first-person",
  "lastTry": "Searched i-D + Oklou + Arca quote twice; no i-D Oklou interview found in results. No page opened carrying the 'REAL star of current experimental music' line."
 },
 {
  "key": "prefab-sprout>bob-dylan",
  "from": "Prefab Sprout",
  "to": "Bob Dylan",
  "fromYear": 1982,
  "toYear": 1961,
  "citation": "Uncut's 2009 \"My Life In Music\" feature: Paddy McAloon named Dylan's \"Lay Lady Lay\" as his first record purchase, at 13, prizing \"the gorgeousness of the record and the finger-breaking possibilities... for a 13-year-old learning barre chords.\" He also singled out \"Sad-Eyed Lady of the Lowlands\" for being grateful it ran 11 minutes rather than three and a half.",
  "sourceTier": "first-person",
  "lastTry": "Uncut 2009 'My Life In Music' not found: 3 searches; sproutology.co.uk interviews page (archive 2020) lists Uncut items but none could be opened by title; live sproutology 503. Substack Alternating Currents interview and Creem 1988 opened: no Dylan/Bowie."
 },
 {
  "key": "prefab-sprout>david-bowie",
  "from": "Prefab Sprout",
  "to": "David Bowie",
  "fromYear": 1982,
  "toYear": 1969,
  "citation": "Uncut: McAloon called Bowie's Station to Station the LP that sounds mysterious to him -- \"It sounds like Bowie's mid-way between two things and I like that. The music is mysterious -- chilly and passionate at the same time.\"",
  "sourceTier": "first-person",
  "lastTry": "Same as prefab-sprout>bob-dylan: Uncut feature not located; Creem 1988 and Substack interview have no Bowie."
 },
 {
  "key": "deaths-dynamic-shroud>julee-cruise",
  "from": "death's dynamic shroud",
  "to": "Julee Cruise",
  "fromYear": 2012,
  "toYear": 1989,
  "citation": "James Webster said he'd been trying to sound like Julee Cruise from Twin Peaks for years.",
  "sourceTier": "first-person",
  "lastTry": "Not in the VWMusic interview (read), Bandcamp Daily Jan 2024 feature (read) or Wikipedia. No search spent on it (search share used up)."
 },
 {
  "key": "george-clanton>the-human-league",
  "from": "George Clanton",
  "to": "The Human League",
  "fromYear": 2010,
  "toYear": 1977,
  "citation": "George Clanton told Seven Days he got really into the Human League and made a song that sounded like them, playing it for friends who found it hilarious but also awesome.",
  "sourceTier": "first-person",
  "lastTry": "Seven Days page not found; no search spent (share used up). Wikipedia raw for George Clanton has no Human League text."
 },
 {
  "key": "grizzly-bear>talk-talk",
  "from": "Grizzly Bear",
  "to": "Talk Talk",
  "fromYear": 2002,
  "toYear": 1981,
  "citation": "The Line of Best Fit, Daniel Rossen's nine favourite songs, framed explicitly as what inspired Grizzly Bear: picks from Laughing Stock, Spirit of Eden, or Mark Hollis's solo record, which he loves and which Chris Taylor loves too.",
  "sourceTier": "first-person",
  "lastTry": "Line of Best Fit Rossen nine-favourites list: one search found nothing; guessed URL .../features/lists/daniel-rossen-my-nine-favourite-songs is a 404. Wikipedia raw for Grizzly Bear/Rossen has nothing on Talk Talk."
 },
 {
  "key": "jockstrap>cocteau-twins",
  "from": "Jockstrap",
  "to": "Cocteau Twins",
  "fromYear": 2018,
  "toYear": 1979,
  "citation": "Asked by NME to name their influences, Taylor Skye and Georgia Ellery jointly answered: \"Skrillex, Madonna and Cocteau Twins.\"",
  "sourceTier": "first-person",
  "lastTry": "NME interview not located; no search spent on it. Guessed nme.com URL 404. Loud And Quiet interview https://www.loudandquiet.com/interview/jockstrap/ read: Skye says 'we didn't have any specific influences' and has no Cocteau Twins."
 },
 {
  "key": "jockstrap>bob-dylan",
  "from": "Jockstrap",
  "to": "Bob Dylan",
  "fromYear": 2018,
  "toYear": 1961,
  "citation": "Taylor Skye told Loud And Quiet: \"I'm just turning into my dad basically. He was such a big Bob Dylan fan, and I just wasn't interested [when I was younger] but my parents have really influenced my music taste now.\"",
  "sourceTier": "first-person",
  "lastTry": "One search for the Skye 'turning into my dad' quote found nothing. Loud And Quiet interview at https://www.loudandquiet.com/interview/jockstrap/ is a different piece with no Dylan or 'dad'. If found, note he says he wasn't interested in Dylan when younger, so it is weak as influence."
 },
 {
  "key": "king-gizzard-and-the-lizard-wizard>bob-dylan",
  "from": "King Gizzard and the Lizard Wizard",
  "to": "Bob Dylan",
  "fromYear": 2010,
  "toYear": 1961,
  "citation": "Radio Milwaukee, Mackenzie on Flight b741's layered influences: \"the obvious ones are the Band, Dylan, Steve Miller, CCR, early-70s Stones, even the Faces and the Who, probably T. Rex.\"",
  "sourceTier": "first-person",
  "lastTry": "Radio Milwaukee Mackenzie quote on Flight b741 not searched (search share used up)."
 },
 {
  "key": "mac-demarco>neil-young",
  "from": "Mac DeMarco",
  "to": "Neil Young",
  "fromYear": 2008,
  "toYear": 1966,
  "citation": "Mac DeMarco has described himself as an obsessive Neil Young listener who played Harvest several times a day for months, telling The Guardian he wanted his album 2 to sound \"really dry, really crisp '70s style\" like it; he discussed the same ambition again in a 2023 Weekly Neil interview, recalling recording it broke in Montreal and digging through a thrift-store dollar bin.",
  "sourceTier": "first-person",
  "lastTry": "Guardian and 2023 Weekly Neil pieces not found (no search left). Wikipedia's only support is a Pitchfork 2012 guest list naming Neil Young as a favourite (bare list, not citable). Citation's thrift-store dollar bin detail is the Grokipedia-substitution warning case in CLAUDE.md; do not feature it without a page."
 }
]
```
