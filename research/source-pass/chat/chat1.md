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

ANSWER with only this JSON, in one code block, every link included:

{
  "agent": "chat1",
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
  "key": "sonic-youth>velvet-underground",
  "from": "Sonic Youth",
  "to": "The Velvet Underground",
  "fromYear": 1981,
  "toYear": 1965,
  "citation": "Thurston Moore has said he met his scene in a record shop while hunting for Velvet Underground records.",
  "sourceTier": "first-person"
 },
 {
  "key": "sonic-youth>black-flag",
  "from": "Sonic Youth",
  "to": "Black Flag",
  "fromYear": 1981,
  "toYear": 1976,
  "citation": "Lee Ranaldo, Wikipedia/Sonic Youth -- SST-label admiration rather than a direct sound-influence claim, flagged weaker-tier.",
  "sourceTier": "first-person"
 },
 {
  "key": "sonic-youth>glenn-branca",
  "from": "Sonic Youth",
  "to": "Glenn Branca",
  "fromYear": 1981,
  "toYear": 1977,
  "citation": "Thurston Moore told Rolling Stone that seeing Glenn Branca play guitars tuned outside of standard tunings \"really is what informed a lot of what happened in Sonic Youth.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "sonic-youth>patti-smith",
  "from": "Sonic Youth",
  "to": "Patti Smith",
  "fromYear": 1981,
  "toYear": 1974,
  "citation": "Thurston Moore has described seeing the Patti Smith Group live as a teenager as the moment he'd been waiting for, and singled out one of her less verse-chorus, almost-improvised songs as directly formative to Sonic Youth's own break from traditional song structure.",
  "sourceTier": "first-person"
 },
 {
  "key": "my-bloody-valentine>the-jesus-and-mary-chain",
  "from": "My Bloody Valentine",
  "to": "The Jesus and Mary Chain",
  "fromYear": 1983,
  "toYear": 1983,
  "citation": "Kevin Shields has called the Cocteau Twins/JAMC comparison \"garbage,\" but concedes Psychocandy as \"the shared record\" between the two bands' sounds.",
  "sourceTier": "first-person"
 },
 {
  "key": "my-bloody-valentine>ramones",
  "from": "My Bloody Valentine",
  "to": "Ramones",
  "fromYear": 1983,
  "toYear": 1974,
  "citation": "NME's \"Roots of MBV\": hearing the Ramones was when Shields realised the guitar could be more than a melodic cosh -- in his words, \"a noise generator.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "my-bloody-valentine>siouxsie-and-the-banshees",
  "from": "My Bloody Valentine",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1983,
  "toYear": 1976,
  "citation": "Kevin Shields to Karen Leng, Double J / ABC (8 Apr 2021), on the dark post-punk bands the band drew from: \"the best of all was Siouxsie and the Banshees, the Cure and Killing Joke.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "my-bloody-valentine>the-cure",
  "from": "My Bloody Valentine",
  "to": "The Cure",
  "fromYear": 1983,
  "toYear": 1978,
  "citation": "Kevin Shields to Karen Leng, Double J / ABC (8 Apr 2021), same answer: \"the best of all was Siouxsie and the Banshees, the Cure and Killing Joke.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "siouxsie-and-the-banshees>david-bowie",
  "from": "Siouxsie & The Banshees",
  "to": "David Bowie",
  "fromYear": 1976,
  "toYear": 1969,
  "citation": "NPR: Siouxsie Sioux grew up on Bowie and Lou Reed. AllMusic's prose bio recounts her head being turned seeing Bowie perform on television.",
  "sourceTier": "first-person"
 },
 {
  "key": "cocteau-twins>siouxsie-and-the-banshees",
  "from": "Cocteau Twins",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1979,
  "toYear": 1976,
  "citation": "Robin Guthrie's page on the band's own site names Siouxsie and the Banshees among the artists who made the beautiful noise that drew a teenage Fraser and Guthrie together.",
  "sourceTier": "first-person"
 },
 {
  "key": "cocteau-twins>sex-pistols",
  "from": "Cocteau Twins",
  "to": "Sex Pistols",
  "fromYear": 1979,
  "toYear": 1975,
  "citation": "Guthrie's page on the band's own site: an alienated teenager who loved the Sex Pistols, the Birthday Party, and Siouxsie and the Banshees.",
  "sourceTier": "first-person"
 },
 {
  "key": "cocteau-twins>the-birthday-party",
  "from": "Cocteau Twins",
  "to": "The Birthday Party",
  "fromYear": 1979,
  "toYear": 1976,
  "citation": "Robin Guthrie, on the band's own site: they were \"influenced by guitarists who made a beautiful noise, like Roland S. Howard... it's because of them that we sent a demo to 4AD.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "david-bowie>the-stooges",
  "from": "David Bowie",
  "to": "The Stooges",
  "fromYear": 1969,
  "toYear": 1967,
  "citation": "Iggy Pop: \"David had said something in Melody Maker about his favorite songs, and he said he liked the Stooges\" -- 1971, before the two men had met.",
  "sourceTier": "first-person"
 },
 {
  "key": "joy-division>velvet-underground",
  "from": "Joy Division",
  "to": "The Velvet Underground",
  "fromYear": 1976,
  "toYear": 1965,
  "citation": "Hook, in Jon Savage's oral history: \"Ian was much better educated for things like Can, Kraftwerk, Velvet Underground.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "joy-division>kraftwerk",
  "from": "Joy Division",
  "to": "Kraftwerk",
  "fromYear": 1976,
  "toYear": 1970,
  "citation": "Peter Hook: \"Ian was much better educated for things like Can, Kraftwerk, Velvet Underground.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "joy-division>can",
  "from": "Joy Division",
  "to": "Can",
  "fromYear": 1976,
  "toYear": 1968,
  "citation": "Peter Hook, Jon Savage's oral history: \"Ian was much better educated for things like Can, Kraftwerk, Velvet Underground.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "neil-young>bob-dylan",
  "from": "Neil Young",
  "to": "Bob Dylan",
  "fromYear": 1966,
  "toYear": 1961,
  "citation": "Neil Young has described first hearing Bob Dylan in Winnipeg around 1963, the same year he named Dylan directly in his own lyric on \"Flags of Freedom.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "fugazi>sonic-youth",
  "from": "Fugazi",
  "to": "Sonic Youth",
  "fromYear": 1986,
  "toYear": 1981,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "fugazi>bad-brains",
  "from": "Fugazi",
  "to": "Bad Brains",
  "fromYear": 1986,
  "toYear": 1977,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "fugazi>minutemen",
  "from": "Fugazi",
  "to": "Minutemen",
  "fromYear": 1986,
  "toYear": 1980,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "fugazi>black-flag",
  "from": "Fugazi",
  "to": "Black Flag",
  "fromYear": 1986,
  "toYear": 1976,
  "citation": "Guy Picciotto, Cultural Glitch (Nov 3, 2011): \"Fugazi's influences include Bad Brains, the Faith, Void, Minutemen, Black Flag, Sonic Youth, the Ex.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "the-cure>siouxsie-and-the-banshees",
  "from": "The Cure",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1978,
  "toYear": 1976,
  "citation": "Robert Smith, in Mark Paytress's Siouxsie & the Banshees: The Authorised Biography (2003), p.96, on playing with the Banshees: \"On stage that first night with the Banshees, I was blown away by how powerful I felt playing that kind of music. It was so different to what we were doing with the Cure... Being a Banshee really changed my attitude to what I was doing.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "the-cure>nick-drake",
  "from": "The Cure",
  "to": "Nick Drake",
  "fromYear": 1978,
  "toYear": 1968,
  "citation": "Robert Smith named Nick Drake among his five favorite songs for the BBC, saying it embodied \"everything I would aspire to in understated mood songwriting,\" and told Clash that Drake's \"Time Has Told Me\" gave the band its name.",
  "sourceTier": "first-person"
 },
 {
  "key": "the-cure>sex-pistols",
  "from": "The Cure",
  "to": "Sex Pistols",
  "fromYear": 1978,
  "toYear": 1975,
  "citation": "Smith's BBC five-songs list: \"Anarchy in the UK\" was \"the last time something really major happened to me and changed me.\"",
  "sourceTier": "first-person"
 },
 {
  "key": "the-cure>buzzcocks",
  "from": "The Cure",
  "to": "Buzzcocks",
  "fromYear": 1978,
  "toYear": 1976,
  "citation": "Smith, Rolling Stone Q&A: \"when I first saw the Stranglers, I thought, 'This is it.' And I saw the Buzzcocks the following week, and I thought, 'This is definitely it.'\"",
  "sourceTier": "first-person"
 },
 {
  "key": "the-cure>mogwai",
  "from": "The Cure",
  "to": "Mogwai",
  "fromYear": 1978,
  "toYear": 1995,
  "citation": "Smith, in the Bambarger interview: \"When I first got hold of Mogwai's Young Team album, I played it endlessly\" -- audible, he has said, on Bloodflowers.",
  "sourceTier": "first-person"
 }
]
```
