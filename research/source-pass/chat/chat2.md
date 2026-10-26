You're helping check sources for Starweave, a map of who influenced whom in indie music. Below is a list of influence links. Each `key` is `source>target`: the first artist was influenced by the second. Each has a `citation` saying who said it and where. For every link, find the web page that actually carries the claim, open it, and read it.

Precision beats speed: an honest "not-found" is far better than a wrong "ok".

RULES
1. Open the actual page and read it. A search result's snippet or summary is NEVER evidence: search tools have invented quotes before.
2. `found` = one or two consecutive sentences copied EXACTLY from the page (including any quote the citation uses). Don't retype, tidy, shorten or join paragraphs. A script will re-open every page and look for this exact text, so a paraphrase fails.
3. The quote must be the right person speaking: the artist, not the interviewer or the journalist's own listening.
4. It must say INFLUENCE, in the right direction (first artist shaped by the second). Being a fan counts: the artist saying they loved, grew up on, were big fans of, or kept listening to the other artist while forming or making their own music is first-person influence. These are NOT influence: a bare favourites list with no comment, a "what I'm listening to now" answer, covering a song, sharing a member, a producer, a label, a collaboration, being listed in the same genre, and a critic saying they sound alike ("recalls", "sounds like", "the X of its generation"): mark that "decide". Tier "critic" is only for a critic arguing the first artist drew on the second.
5. Never use Grokipedia. Never use AllMusic's bare "influences" panel, The Student Playlist's "Influenced by" lists, Apple Music editorial "Influences" playlists, or bio blurbs copied across Last.fm-type sites.
6. Wikipedia only as a last resort: follow its footnote to the real source and use that. A Wikipedia claim with no footnote is tier "reported" at best.
7. Per link: at most two searches. Then stop and mark it "not-found" with what you tried.
8. If you know the exact page but can't open it (paywall, login, bot wall), mark it "blocked" with the page's direct URL and what to look for on it.

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
  "agent": "chat2",
  "searches": <how many searches you ran>,
  "toolStatus": "<any sites you couldn't open, any search problems>",
  "entries": {
    "<key>": { "url": "...", "found": "...", "checked": "2026-10-26", "verdict": "ok" }
  },
  "candidates": [],
  "offMap": []
}

(Optional, no extra searching: if a passage you're already reading has the artist naming another influence, add it to "offMap" as {"name", "namedBy": "<the artist's id from the key>", "sentence", "url"}.)

If you can't finish all of them in one reply, do as many as you can properly, return the JSON for those, and say so.

THE LINKS
```json
[
 {
  "key": "bjork>nico",
  "from": "Björk",
  "to": "Nico",
  "fromYear": 1977,
  "toYear": 1967,
  "citation": "Far Out, on Björk's own published list of favorite albums, which includes Nico alongside Kate Bush and Joni Mitchell.",
  "sourceTier": "first-person"
 },
 {
  "key": "bjork>aphex-twin",
  "from": "Björk",
  "to": "Aphex Twin",
  "fromYear": 1977,
  "toYear": 1992,
  "citation": "Far Out's account of Bjork's own published favourites list, which includes Aphex Twin.",
  "sourceTier": "first-person"
 },
 {
  "key": "modest-mouse>pixies",
  "from": "Modest Mouse",
  "to": "Pixies",
  "fromYear": 1992,
  "toYear": 1986,
  "citation": "Isaac Brock told Far Out Magazine in 2021 that finding Pixies' Doolittle in eighth grade gave him everything he wanted from a record -- hypnotic, deeply strange, with lyrics he could read a dozen ways.",
  "sourceTier": "first-person"
 },
 {
  "key": "modest-mouse>talking-heads",
  "from": "Modest Mouse",
  "to": "Talking Heads",
  "fromYear": 1992,
  "toYear": 1975,
  "citation": "Isaac Brock has described More Songs About Buildings and Food as the record that made him notice production at all -- he had heard it about forty thousand times before he started listening to how it was made.",
  "sourceTier": "first-person"
 },
 {
  "key": "sharon-van-etten>joy-division",
  "from": "Sharon Van Etten",
  "to": "Joy Division",
  "fromYear": 2005,
  "toYear": 1976,
  "citation": "Sharon Van Etten told the Irish Times in August 2025 that she listened to \"dandies of doom\" as an angst-ridden adolescent, including the Cure, Joy Division and Nine Inch Nails, recalling shutting her bedroom door and upsetting her mother; Billboard reported in January 2025 that her Attachment Theory demos read as UK-influenced, citing Joy Division and Kate Bush.",
  "sourceTier": "first-person"
 },
 {
  "key": "sharon-van-etten>nick-cave-and-the-bad-seeds",
  "from": "Sharon Van Etten",
  "to": "Nick Cave & The Bad Seeds",
  "fromYear": 2005,
  "toYear": 1983,
  "citation": "When producer John Congleton asked Sharon Van Etten about her influences before Remind Me Tomorrow (2019), she named Nick Cave's Skeleton Tree; Stereogum separately put to her that Cave was a big influence on the record, which she didn't dispute. She has repeated the connection across at least six interviews, including Billboard.",
  "sourceTier": "first-person"
 },
 {
  "key": "sharon-van-etten>suicide",
  "from": "Sharon Van Etten",
  "to": "Suicide",
  "fromYear": 2005,
  "toYear": 1970,
  "citation": "Sharon Van Etten named Suicide in the same reference conversation with producer John Congleton before Remind Me Tomorrow (2019), a connection she has repeated across at least six interviews, including Billboard.",
  "sourceTier": "first-person"
 },
 {
  "key": "sharon-van-etten>portishead",
  "from": "Sharon Van Etten",
  "to": "Portishead",
  "fromYear": 2005,
  "toYear": 1991,
  "citation": "Sharon Van Etten named Portishead in the same reference conversation with producer John Congleton before Remind Me Tomorrow (2019), a connection she has repeated across at least six interviews, including Billboard.",
  "sourceTier": "first-person"
 },
 {
  "key": "sharon-van-etten>the-cure",
  "from": "Sharon Van Etten",
  "to": "The Cure",
  "fromYear": 2005,
  "toYear": 1978,
  "citation": "Sharon Van Etten discussed The Cure's influence on her adolescence in the same Irish Times passage covering Joy Division.",
  "sourceTier": "first-person"
 },
 {
  "key": "stereolab>neu",
  "from": "Stereolab",
  "to": "Neu!",
  "fromYear": 1990,
  "toYear": 1971,
  "citation": "Tim Gane, Tape Op #98: \"in the early and mid-'80s he was a big fan of krautrock music -- like Faust, Neu! and Can.\" Corroborated by ele-king: early records \"infused with a gushing enthusiasm for Neu!'s motorik rhythms.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "stereolab>can",
  "from": "Stereolab",
  "to": "Can",
  "fromYear": 1990,
  "toYear": 1968,
  "citation": "Tim Gane, Tape Op #98: \"in the early and mid-'80s he was a big fan of krautrock music -- like Faust, Neu! and Can.\" Corroborated by ele-king: early records \"infused with a gushing enthusiasm for Neu!'s motorik rhythms.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "stereolab>faust",
  "from": "Stereolab",
  "to": "Faust",
  "fromYear": 1990,
  "toYear": 1971,
  "citation": "Tape Op #98; Electronic Sound dates the epiphany precisely to a 1980 Sounds review of a Faust reissue, which Tim Gane says \"knocked him out.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "stereolab>cabaret-voltaire",
  "from": "Stereolab",
  "to": "Cabaret Voltaire",
  "fromYear": 1990,
  "toYear": 1973,
  "citation": "Electronic Sound, Tim Gane: on why the Faust review landed, \"he was a big fan of bands like Cabaret Voltaire, so his ears had already been opened to bolder, more experimental electronic music.\" New edge.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-jesus-lizard>the-birthday-party",
  "from": "The Jesus Lizard",
  "to": "The Birthday Party",
  "fromYear": 1987,
  "toYear": 1976,
  "citation": "David Yow: the band was \"four white guys who liked to play a cross between Led Zeppelin and the Birthday Party.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "the-jesus-lizard>gang-of-four",
  "from": "The Jesus Lizard",
  "to": "Gang of Four",
  "fromYear": 1987,
  "toYear": 1976,
  "citation": "Duane Denison, on his own guitar influences (Andy Gill's playing).",
  "sourceTier": "first-person"
 },
 {
  "key": "the-jesus-lizard>siouxsie-and-the-banshees",
  "from": "The Jesus Lizard",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1987,
  "toYear": 1976,
  "citation": "Duane Denison, on his own guitar influences (John McGeoch's playing).",
  "sourceTier": "first-person"
 },
 {
  "key": "the-jesus-lizard>husker-du",
  "from": "The Jesus Lizard",
  "to": "Hüsker Dü",
  "fromYear": 1987,
  "toYear": 1979,
  "citation": "Duane Denison, guitarguitar.co.uk (Apr 2, 2021): compositional approach drew on \"bands of the US underground scenes like Black Flag, Husker Du, Butthole Surfers and Big Black.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "alvvays>the-smiths",
  "from": "Alvvays",
  "to": "The Smiths",
  "fromYear": 2011,
  "toYear": 1982,
  "citation": "Tape Op, Geoff Stanfield (May 2023). Molly Rankin on writing \"Pressed\": \"We were trying to do a Smiths' verse and an R.E.M. chorus, and then it morphs into whatever it is by the end of the song.\" Producer Shawn Everett confirms it in the same interview -- \"They were going for The Smiths' reference.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "alvvays>cocteau-twins",
  "from": "Alvvays",
  "to": "Cocteau Twins",
  "fromYear": 2011,
  "toYear": 1979,
  "citation": "Ilana Kaplan, SPIN (11 Mar 2015) and Rebecca Schiller, Diffuser.fm (21 Nov 2014) independently list Cocteau Twins among Molly Rankin's named influences. Asked separately by Pitchfork to name a perfect 10 album, she chose their Heaven or Las Vegas -- \"I think it flows very well and it's also just otherworldly beauty and also menacing at the same time\" -- which speaks to how deeply she holds the record rather than to influence on its own.",
  "sourceTier": "first-person"
 },
 {
  "key": "alvvays>the-replacements",
  "from": "Alvvays",
  "to": "The Replacements",
  "fromYear": 2011,
  "toYear": 1979,
  "citation": "Asked by Allston Pudding who she had been listening to while making Alvvays' debut, Molly Rankin said she had little young influence growing up somewhere with no record store within two hours, but that at university she discovered \"typical seminal bands The Replacements and The Smiths.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "alvvays>yo-la-tengo",
  "from": "Alvvays",
  "to": "Yo La Tengo",
  "fromYear": 2011,
  "toYear": 1984,
  "citation": "Stereogum \"Under The Influence,\" Rachel Brodsky (3 Oct 2022). Molly Rankin: \"I know Al has a lot of love for Yo La Tengo, as do I. I've seen them performing in many formations.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "alvvays>my-bloody-valentine",
  "from": "Alvvays",
  "to": "My Bloody Valentine",
  "fromYear": 2011,
  "toYear": 1983,
  "citation": "Tape Op, Geoff Stanfield (May 2023). Alec O'Hanley: \"One thing we loved about Kevin Shields was the limitations he put on his stuff that's My Bloody Valentine\" -- discussed as a working method, down to reusing the reverse reverb on a Yamaha SPX90.",
  "sourceTier": "first-person"
 },
 {
  "key": "alvvays>camera-obscura",
  "from": "Alvvays",
  "to": "Camera Obscura",
  "fromYear": 2011,
  "toYear": 1996,
  "citation": "Asked by KEXP what appeals to her as a songwriter about Camera Obscura, Molly Rankin said Tracyanne Campbell is \"so good at longing and poetry and being endearing without being annoying,\" with a voice that's \"so unique and pure.\" In a separate SPIN interview, Rankin called Camera Obscura's polish \"a really nice reference\" next to Alvvays' sparser, tape-hiss sound.",
  "sourceTier": "first-person"
 },
 {
  "key": "cat-power>the-replacements",
  "from": "Cat Power",
  "to": "The Replacements",
  "fromYear": 1992,
  "toYear": 1979,
  "citation": "CityBeat: Marshall saw the Replacements in high school and watched Paul Westerberg come out alone at the end to sing \"Answering Machine,\" throwing his guitar off his body and running -- \"It impacted me so much.\" She later covered the song on Covers.",
  "sourceTier": "first-person"
 },
 {
  "key": "cat-power>nico",
  "from": "Cat Power",
  "to": "Nico",
  "fromYear": 1992,
  "toYear": 1967,
  "citation": "CityBeat interview: Marshall on Nico breaking the mould as a female icon -- \"That European classical way of singing... is very influential.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "drive-like-jehu>slint",
  "from": "Drive Like Jehu",
  "to": "Slint",
  "fromYear": 1990,
  "toYear": 1986,
  "citation": "Vish Khanna podcast (Oct 8, 2015): stated influences include \"Mission of Burma, the Gories, Bastro, Slint, Sonic Youth, the Wipers, and krautrock bands such as Neu!\"",
  "sourceTier": "first-person"
 },
 {
  "key": "drive-like-jehu>sonic-youth",
  "from": "Drive Like Jehu",
  "to": "Sonic Youth",
  "fromYear": 1990,
  "toYear": 1981,
  "citation": "Vish Khanna podcast (Oct 8, 2015): stated influences include \"Mission of Burma, the Gories, Bastro, Slint, Sonic Youth, the Wipers, and krautrock bands such as Neu!\"",
  "sourceTier": "first-person"
 },
 {
  "key": "drive-like-jehu>neu",
  "from": "Drive Like Jehu",
  "to": "Neu!",
  "fromYear": 1990,
  "toYear": 1971,
  "citation": "Vish Khanna podcast (Oct 8, 2015): stated influences include \"Mission of Burma, the Gories, Bastro, Slint, Sonic Youth, the Wipers, and krautrock bands such as Neu!\"",
  "sourceTier": "first-person"
 },
 {
  "key": "drive-like-jehu>wipers",
  "from": "Drive Like Jehu",
  "to": "Wipers",
  "fromYear": 1990,
  "toYear": 1977,
  "citation": "Vish Khanna podcast (Oct 8, 2015): stated influences include \"Mission of Burma, the Gories, Bastro, Slint, Sonic Youth, the Wipers, and krautrock bands such as Neu!\" Stated influences include \"Mission of Burma, the Gories, Bastro, Slint, Sonic Youth, the Wipers, and krautrock bands such as Neu!\"",
  "sourceTier": "first-person"
 }
]
```
