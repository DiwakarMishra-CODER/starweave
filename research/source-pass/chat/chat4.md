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
  "agent": "chat4",
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
  "key": "la-dispute>refused",
  "from": "La Dispute",
  "to": "Refused",
  "fromYear": 2004,
  "toYear": 1991,
  "citation": "From The Garage interview (Dec 13, 2010): \"Post-hardcore bands like Thursday, Refused, At the Drive-In and Glassjaw.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "la-dispute>at-the-drive-in",
  "from": "La Dispute",
  "to": "At The Drive-In",
  "fromYear": 2004,
  "toYear": 1994,
  "citation": "From The Garage interview (Dec 13, 2010): \"Post-hardcore bands like Thursday, Refused, At the Drive-In and Glassjaw.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "la-dispute>modest-mouse",
  "from": "La Dispute",
  "to": "Modest Mouse",
  "fromYear": 2004,
  "toYear": 1992,
  "citation": "BBC Radio 1 \"Under the Influence with La Dispute\": \"influences from Joanna Newsom, The Mountain Goats and Modest Mouse.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "la-dispute>joanna-newsom",
  "from": "La Dispute",
  "to": "Joanna Newsom",
  "fromYear": 2004,
  "toYear": 2002,
  "citation": "BBC Radio 1 \"Under the Influence with La Dispute\": \"influences from Joanna Newsom, The Mountain Goats and Modest Mouse.\" BBC Radio 1 \"Under the Influence with La Dispute,\".",
  "sourceTier": "first-person"
 },
 {
  "key": "la-dispute>the-mountain-goats",
  "from": "La Dispute",
  "to": "The Mountain Goats",
  "fromYear": 2004,
  "toYear": 1991,
  "citation": "BBC Radio 1 \"Under the Influence with La Dispute\": \"influences from Joanna Newsom, The Mountain Goats and Modest Mouse.\" BBC Radio 1 \"Under the Influence with La Dispute,\".",
  "sourceTier": "first-person"
 },
 {
  "key": "mitski>bjork",
  "from": "Mitski",
  "to": "Björk",
  "fromYear": 2012,
  "toYear": 1977,
  "citation": "The Skinny reported that Mitski discovered Bjork at a listening station in a Japanese record store at age fifteen and was terrified -- it viscerally scared her; she has said Vespertine especially helped her look further into herself, and that she wasn't ready for it at fifteen, and that Bjork opened up a world of music and taught her there are a million ways to put sounds and thoughts together.",
  "sourceTier": "first-person"
 },
 {
  "key": "mitski>sheena-ringo",
  "from": "Mitski",
  "to": "Sheena Ringo",
  "fromYear": 2012,
  "toYear": 1998,
  "citation": "Mitski has named Sheena Ringo's Kalk Samen Kuri no Hana as the album she wishes she had made.",
  "sourceTier": "first-person"
 },
 {
  "key": "patti-smith>bob-dylan",
  "from": "Patti Smith",
  "to": "Bob Dylan",
  "fromYear": 1974,
  "toYear": 1961,
  "citation": "Patti Smith told PBS's American Masters in 1997 that she identified with Bob Dylan more than anyone, and SPIN has reported on her own memoir drawing a direct line between Dylan and Rimbaud in her work.",
  "sourceTier": "first-person"
 },
 {
  "key": "sophie>depeche-mode",
  "from": "SOPHIE",
  "to": "Depeche Mode",
  "fromYear": 2013,
  "toYear": 1980,
  "citation": "SOPHIE, The Face (2017), singled out \"Just Can't Get Enough\" (1981) as formative: it \"established one part of the sound of the decade that followed,\" calling it \"an amazing achievement.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "the-national>violent-femmes",
  "from": "The National",
  "to": "Violent Femmes",
  "fromYear": 1999,
  "toYear": 1981,
  "citation": "The Scenestar 2007, Berninger: the bands he first fell in love with were the Smiths, Violent Femmes, Tom Waits and Nick Cave.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-national>nick-cave-and-the-bad-seeds",
  "from": "The National",
  "to": "Nick Cave & The Bad Seeds",
  "fromYear": 1999,
  "toYear": 1983,
  "citation": "The Scenestar 2007: the bands he first fell in love with were the Smiths, Violent Femmes, Tom Waits and Nick Cave. Corroborated by Q at Reading 2011 and a 2023 talk on Cave as an inspiration.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-national>the-smiths",
  "from": "The National",
  "to": "The Smiths",
  "fromYear": 1999,
  "toYear": 1982,
  "citation": "The Scenestar 2007: the bands he first fell in love with were the Smiths, Violent Femmes, Tom Waits and Nick Cave. Corroborated by Q at Reading 2011 and a 2023 talk on Cave as an inspiration.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-national>joy-division",
  "from": "The National",
  "to": "Joy Division",
  "fromYear": 1999,
  "toYear": 1976,
  "citation": "The Scenestar: pressed on Ian Curtis comparisons he partly deflects to vocal range, then confirms Joy Division directly and says it's been a big influence on drummer Bryan Devendorf.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-national>nirvana",
  "from": "The National",
  "to": "Nirvana",
  "fromYear": 1999,
  "toYear": 1987,
  "citation": "Q 2011 via a fan transcription: discusses Nirvana alongside Waits, Cave and the Smiths as artists he'd named. Flagged for verification given the secondary source.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-national>tom-waits",
  "from": "The National",
  "to": "Tom Waits",
  "fromYear": 1999,
  "toYear": 1971,
  "citation": "Matt Berninger named the Smiths, Violent Femmes, Tom Waits and Nick Cave as the first bands he fell in love with, in an interview with The Scenestar in 2007 -- corroborated by a 2011 Q at Reading appearance where Waits and Cave topped his list again.",
  "sourceTier": "first-person"
 },
 {
  "key": "underscores>jane-remover",
  "from": "underscores",
  "to": "Jane Remover",
  "fromYear": 2018,
  "toYear": 2019,
  "citation": "NME profile (on U): \"she reels off Jane Remover, 2hollis and Osamason as equally inspiring as Brandy, Britney Spears and Justin Timberlake while making 'U'.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "underscores>oklou",
  "from": "underscores",
  "to": "Oklou",
  "fromYear": 2018,
  "toYear": 2014,
  "citation": "NME, 2026: for her new album underscores said she took inspiration from Oklou and Mk.gee and how they use their instruments as a \"sound bed.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "wolf-alice>the-replacements",
  "from": "Wolf Alice",
  "to": "The Replacements",
  "fromYear": 2010,
  "toYear": 1979,
  "citation": "In Pitchfork's \"Perfect 10\" video series, Wolf Alice chose the Replacements' Tim, and one of the band described Paul Westerberg as \"super influential to me.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "wolf-alice>yeah-yeah-yeahs",
  "from": "Wolf Alice",
  "to": "Yeah Yeah Yeahs",
  "fromYear": 2010,
  "toYear": 2000,
  "citation": "Line of Best Fit feature/interview on Wolf Alice.",
  "sourceTier": "first-person"
 },
 {
  "key": "xiu-xiu>joy-division",
  "from": "Xiu Xiu",
  "to": "Joy Division",
  "fromYear": 2002,
  "toYear": 1976,
  "citation": "The sticker on Xiu Xiu's debut album Knife Play lists what Jamie Stewart was listening to when his mother died -- Henry Cowell, Joy Division, Detroit techno, the Smiths, Takemitsu, Sabbath, Gamelan, \"Black Angels,\" and Cecil Taylor.",
  "sourceTier": "first-person"
 },
 {
  "key": "xiu-xiu>cocteau-twins",
  "from": "Xiu Xiu",
  "to": "Cocteau Twins",
  "fromYear": 2002,
  "toYear": 1979,
  "citation": "Jamie Stewart, Sun 13 (2024): \"They were really into the '80s... 4AD records like Bauhaus, This Mortal Coil, Cocteau Twins. The Wolfgang Press was another huge one for me.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "xiu-xiu>swans",
  "from": "Xiu Xiu",
  "to": "Swans",
  "fromYear": 2002,
  "toYear": 1982,
  "citation": "Jamie Stewart on Michael Gira, The Beijinger (2014): \"I admire that he has never given up, has never relented in his intensity, and that he continues, after 30 years, to change and grow his music... It is good to have that model before you.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "xiu-xiu>nico",
  "from": "Xiu Xiu",
  "to": "Nico",
  "fromYear": 2002,
  "toYear": 1967,
  "citation": "Stewart described the sonic direction of Angel Guts: Red Classroom as \"a mean, tight hearted, blackness of Neubauten vs Suicide vs Nico.\" (Vice)",
  "sourceTier": "first-person"
 },
 {
  "key": "alex-g>elliott-smith",
  "from": "Alex G",
  "to": "Elliott Smith",
  "fromYear": 2010,
  "toYear": 1994,
  "citation": "Consequence (2015), \"Ruining Alex G\": \"I've been really influenced by Elliott Smith's singing style. When you sing like that, in a kind of whispery way... I do it for no other reason than it makes it easier to sing in tune, to hit all the notes correctly. And also I didn't want to wake my roommates.\" Corroborated in OndaRock: \"I listened to Elliott Smith a lot when I was younger, so it seems natural that my music might reflect his sound.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "arca>squarepusher",
  "from": "Arca",
  "to": "Squarepusher",
  "fromYear": 2012,
  "toYear": 1995,
  "citation": "GRAMMY.com, Arca on her teenage listening: \"I have a brother seven years older... He had a lot of Aphex Twin, Squarepusher.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "arca>autechre",
  "from": "Arca",
  "to": "Autechre",
  "fromYear": 2012,
  "toYear": 1987,
  "citation": "FADER (2014): \"Aided partly by his older brother's CD collection, he went through a series of musical obsessions... Aaliyah, Autechre, Nine Inch Nails, Marilyn Manson.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "arcade-fire>neutral-milk-hotel",
  "from": "Arcade Fire",
  "to": "Neutral Milk Hotel",
  "fromYear": 2001,
  "toYear": 1989,
  "citation": "Red Bull Music Academy lecture, Win Butler: Merge had In the Aeroplane Over the Sea, \"a complete classic\"; he says Magnetic Fields and Neutral Milk were about as good as anything, and their dream was to be on Merge partly because of this record. rs500albums adds Butler has said this was the primary reason they signed with Merge.",
  "sourceTier": "first-person"
 },
 {
  "key": "arcade-fire>talking-heads",
  "from": "Arcade Fire",
  "to": "Talking Heads",
  "fromYear": 2001,
  "toYear": 1975,
  "citation": "Maclean's 2013, Win Butler: New Order and Bowie and Talking Heads are all primal influences for many of them. NME's \"Roots Of\" independently traces Talking Heads' \"This Must Be The Place\" into \"Wake Up.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "arcade-fire>new-order",
  "from": "Arcade Fire",
  "to": "New Order",
  "fromYear": 2001,
  "toYear": 1980,
  "citation": "Maclean's: Butler arrives at New Order via hearing the Rapture's \"House of Jealous Lovers\" and noticing it was not worlds away from their own \"Headlights Look Like Diamonds.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "arcade-fire>david-bowie",
  "from": "Arcade Fire",
  "to": "David Bowie",
  "fromYear": 2001,
  "toYear": 1969,
  "citation": "Maclean's; NME traces Bowie's \"Queen Bitch\" into the early songs; Butler told Zane Lowe and Billboard in 2022 that Bowie shaped \"Age of Anxiety II,\" borrowing Bowie's own \"plastic soul\" term.",
  "sourceTier": "first-person"
 },
 {
  "key": "arcade-fire>echo-and-the-bunnymen",
  "from": "Arcade Fire",
  "to": "Echo & the Bunnymen",
  "fromYear": 2001,
  "toYear": 1978,
  "citation": "Win Butler's \"unholy amount of B's\" -- Bowie, Bono, Brecht, Byrne, the Bunnymen -- named among his heroes around Ocean Rain.",
  "sourceTier": "first-person"
 }
]
```
