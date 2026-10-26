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
9. Before marking anything "not-found" or "blocked" when you know the page: try the Internet Archive copy (https://web.archive.org/web/2020/<the page URL>, and older years). Walled or deleted pages are very often there. Only after that fails is it not-found or blocked.
10. A page you can't open in any form (Under the Radar's live site, PressReader, the Quietus paywall, the Telegraph): try the Internet Archive first; if that fails too, it's "not-found" with the URL in the note, not "blocked".

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
  "agent": "chat3",
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
  "key": "lcd-soundsystem>david-bowie",
  "from": "LCD Soundsystem",
  "to": "David Bowie",
  "fromYear": 2002,
  "toYear": 1969,
  "citation": "Murphy to Rolling Stone, cited \"the B-52's, the Fall, Yes, David Bowie and Can\" (via LCD Soundsystem Wikipedia).",
  "sourceTier": "first-person"
 },
 {
  "key": "lcd-soundsystem>the-fall",
  "from": "LCD Soundsystem",
  "to": "The Fall",
  "fromYear": 2002,
  "toYear": 1976,
  "citation": "James Murphy has called the Fall his Beatles, and in a 2005 interview singled out why: \"the guitars are as ego-less as the bass. And that's a rare fucking thing.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "low>joy-division",
  "from": "Low",
  "to": "Joy Division",
  "fromYear": 1993,
  "toYear": 1976,
  "citation": "Alan Sparhawk named Brian Eno and Joy Division as inspirations in a 1995 Billboard interview, alongside the boredom of living in Duluth -- quoted in Rolling Stone's obituary for Mimi Parker in November 2022.",
  "sourceTier": "first-person"
 },
 {
  "key": "low>brian-eno",
  "from": "Low",
  "to": "Brian Eno",
  "fromYear": 1993,
  "toYear": 1971,
  "citation": "Alan Sparhawk named Brian Eno in the same Billboard interview from 1995 in which he discussed Joy Division's influence on Low.",
  "sourceTier": "first-person"
 },
 {
  "key": "suicide>silver-apples",
  "from": "Suicide",
  "to": "Silver Apples",
  "fromYear": 1970,
  "toYear": 1967,
  "citation": "Wikipedia/Silver Apples: \"Alan Vega of Suicide listed Silver Apples as one of his core inspirations that led him to form the group,\" reciprocally confirmed on Suicide's own page.",
  "sourceTier": "first-person"
 },
 {
  "key": "this-heat>faust",
  "from": "This Heat",
  "to": "Faust",
  "fromYear": 1976,
  "toYear": 1971,
  "citation": "Charles Hayward told Perfect Sound Forever that Faust were a direct influence on This Heat, describing how one musical movement could interact with the whole in their music; he specified the Uwe Nettelbeck-produced era of Faust in a separate 2014 interview with Freq.",
  "sourceTier": "first-person"
 },
 {
  "key": "bad-brains>ramones",
  "from": "Bad Brains",
  "to": "Ramones",
  "fromYear": 1977,
  "toYear": 1974,
  "citation": "H.R. (in Juice) and Darryl Jenifer (in Classic Rock, 1985) both recount Sid McCray bringing Ramones records to the house in 1977, and the band's own name comes from the Ramones song \"Bad Brain.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "bark-psychosis>sonic-youth",
  "from": "Bark Psychosis",
  "to": "Sonic Youth",
  "fromYear": 1986,
  "toYear": 1981,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "bark-psychosis>talk-talk",
  "from": "Bark Psychosis",
  "to": "Talk Talk",
  "fromYear": 1986,
  "toYear": 1981,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "bark-psychosis>wire",
  "from": "Bark Psychosis",
  "to": "Wire",
  "fromYear": 1986,
  "toYear": 1976,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "bark-psychosis>big-black",
  "from": "Bark Psychosis",
  "to": "Big Black",
  "fromYear": 1986,
  "toYear": 1981,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "bark-psychosis>joy-division",
  "from": "Bark Psychosis",
  "to": "Joy Division",
  "fromYear": 1986,
  "toYear": 1976,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "bark-psychosis>swans",
  "from": "Bark Psychosis",
  "to": "Swans",
  "fromYear": 1986,
  "toYear": 1982,
  "citation": "Audrie's Diary zine, 1994, Graham Sutton interview (per Wikipedia citation): \"Other early influences included Sonic Youth, Talk Talk, Wire, Butthole Surfers, Big Black, Swans and Joy Division.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "boards-of-canada>incredible-string-band",
  "from": "Boards of Canada",
  "to": "Incredible String Band",
  "fromYear": 1986,
  "toYear": 1965,
  "citation": "Boards of Canada's Michael Sandison, in a rare Pitchfork interview, on melody: \"listen to Jerry Goldsmith or The Incredible String Band.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "brand-new>fugazi",
  "from": "Brand New",
  "to": "Fugazi",
  "fromYear": 2000,
  "toYear": 1986,
  "citation": "Jesse Lacey, DrownedInSound (Sept 17, 2009): \"influenced by Polvo, Archers of Loaf, Fugazi and Modest Mouse.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "brand-new>modest-mouse",
  "from": "Brand New",
  "to": "Modest Mouse",
  "fromYear": 2000,
  "toYear": 1992,
  "citation": "Jesse Lacey, DrownedInSound (Sept 17, 2009): \"influenced by Polvo, Archers of Loaf, Fugazi and Modest Mouse.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "kurt-vile>john-prine",
  "from": "Kurt Vile",
  "to": "John Prine",
  "fromYear": 2003,
  "toYear": 1970,
  "citation": "Kurt Vile told Rolling Stone in September 2020 that he began listening to John Prine in his early twenties after a fan told him he sounded like Prine, and spent what he called \"one cool summer\" on the greatest hits.",
  "sourceTier": "first-person"
 },
 {
  "key": "kurt-vile>velvet-underground",
  "from": "Kurt Vile",
  "to": "The Velvet Underground",
  "fromYear": 2003,
  "toYear": 1965,
  "citation": "Kurt Vile said in an interview with Under the Radar in April 2022 that he grew up listening to the Velvet Underground.",
  "sourceTier": "first-person"
 },
 {
  "key": "kurt-vile>pavement",
  "from": "Kurt Vile",
  "to": "Pavement",
  "fromYear": 2003,
  "toYear": 1989,
  "citation": "Kurt Vile told Under the Radar in April 2022 that signing to Matador was a lifelong dream because it was \"home of Pavement, Yo La Tengo, Cat Power, so many people I grew up listening to\"; Russh magazine reported in 2023 that his high-school idols were Pavement and Dinosaur Jr.",
  "sourceTier": "first-person"
 },
 {
  "key": "kurt-vile>yo-la-tengo",
  "from": "Kurt Vile",
  "to": "Yo La Tengo",
  "fromYear": 2003,
  "toYear": 1984,
  "citation": "Kurt Vile named Yo La Tengo in the same Under the Radar quote about signing to Matador Records in April 2022.",
  "sourceTier": "first-person"
 },
 {
  "key": "kurt-vile>dinosaur-jr",
  "from": "Kurt Vile",
  "to": "Dinosaur Jr.",
  "fromYear": 2003,
  "toYear": 1984,
  "citation": "Kurt Vile named Dinosaur Jr. among his high-school idols in a 2023 Russh interview, alongside Pavement; AllMusic's prose biography and Wikipedia's sourced influence line both describe him as taking notes from masters including Neil Young, Sonic Youth and Dinosaur Jr.",
  "sourceTier": "first-person"
 },
 {
  "key": "kurt-vile>cat-power",
  "from": "Kurt Vile",
  "to": "Cat Power",
  "fromYear": 2003,
  "toYear": 1992,
  "citation": "Kurt Vile has described Matador Records as \"home of Pavement, Yo La Tengo, Cat Power, so many people I grew up listening to.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "rites-of-spring>the-fall",
  "from": "Rites of Spring",
  "to": "The Fall",
  "fromYear": 1984,
  "toYear": 1976,
  "citation": "John Dugan, Stop Smiling: Rites of Spring \"cited influences including the Smiths, the Birthday Party, Buzzcocks, the Mob, the Fall, Television, Bob Dylan, the Saints, Wire, the Undertones and the Adverts.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "rites-of-spring>buzzcocks",
  "from": "Rites of Spring",
  "to": "Buzzcocks",
  "fromYear": 1984,
  "toYear": 1976,
  "citation": "John Dugan, Stop Smiling: Rites of Spring \"cited influences including the Smiths, the Birthday Party, Buzzcocks, the Mob, the Fall, Television, Bob Dylan, the Saints, Wire, the Undertones and the Adverts.\" Rites of Spring \"cited influences including the Smiths, the Birthday Party, Buzzcocks, the Mob, the Fall, Television, Bob Dylan, the Saints, Wire, the Undertones and the Adverts.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "sufjan-stevens>nick-drake",
  "from": "Sufjan Stevens",
  "to": "Nick Drake",
  "fromYear": 2000,
  "toYear": 1968,
  "citation": "The same Uncut account names Nick Drake among the artists Lowell Brams introduced Sufjan Stevens to that summer; Stevens later covered Drake's \"Pink Moon\" for a 2021 single.",
  "sourceTier": "first-person"
 },
 {
  "key": "sufjan-stevens>bob-dylan",
  "from": "Sufjan Stevens",
  "to": "Bob Dylan",
  "fromYear": 2000,
  "toYear": 1961,
  "citation": "Sufjan Stevens told Uncut in February 2015 that there was no music, art or television at home growing up -- his stepfather Lowell Brams introduced him and his siblings to the Beatles, the Rolling Stones, Ry Cooder, Bob Dylan, Nick Drake and Frank Zappa the summer they moved to Eugene, an experience Stevens described as Brams opening a Pandora's box.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-fall>can",
  "from": "The Fall",
  "to": "Can",
  "fromYear": 1976,
  "toYear": 1968,
  "citation": "Far Out and Dazed both report Mark E. Smith telling Irmin Schmidt that Can \"saved my life,\" recalling how he bought Tago Mago by mail order as a teenager and later phoned Schmidt directly to ask Can to play with The Fall.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-fall>velvet-underground",
  "from": "The Fall",
  "to": "The Velvet Underground",
  "fromYear": 1976,
  "toYear": 1965,
  "citation": "Mark E. Smith named the Velvet Underground among the few artists he rated in the same conversation where he described Can's Tago Mago as formative, and told Crack Magazine he preferred the repetition of the Velvet Underground and Can to the Sex Pistols'.",
  "sourceTier": "first-person"
 }
]
```
