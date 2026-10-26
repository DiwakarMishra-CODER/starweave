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

THIS PACK: every link below is currently tier "critic" (a writer or critic said it, not the artist). Best result: a page where the FIRST artist says it themselves (then tier "first-person"), or a publication stating it as fact (tier "reported"). If the only support is a critic saying they sound alike ("recalls", "sounds like", "echoes", "the X of its generation"), mark "decide". Keep "critic" only for a critic arguing the first artist drew on, learned from or came out of the second.

12. If your fetch tool refuses an Internet Archive URL, don't give up on it: give the archive URL (and what to look for) in "note" with verdict "blocked". I can open archive copies on my side.

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
  "agent": "chat6",
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
  "key": "sonic-youth>this-heat",
  "from": "Sonic Youth",
  "to": "This Heat",
  "fromYear": 1981,
  "toYear": 1976,
  "citation": "AllMusic bio, Fred Thomas -- a single shared critic-attributed citation rather than an individual quote, flagged weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "cocteau-twins>joy-division",
  "from": "Cocteau Twins",
  "to": "Joy Division",
  "fromYear": 1979,
  "toYear": 1976,
  "citation": "Bill Prince, \"New 2 U: Cocteau Twins,\" Sounds (11 Sept 1982), describing the band as \"mixing strong Siouxsie and the Banshees and Joy Division influences\" -- a contemporary reviewer's reading rather than the band's own account.",
  "sourceTier": "critic"
 },
 {
  "key": "radiohead>silver-apples",
  "from": "Radiohead",
  "to": "Silver Apples",
  "fromYear": 1985,
  "toYear": 1967,
  "citation": "Wikipedia/Silver Apples lists Radiohead among influenced artists in a general reference-work sentence; no direct quote found.",
  "sourceTier": "critic"
 },
 {
  "key": "radiohead>this-heat",
  "from": "Radiohead",
  "to": "This Heat",
  "fromYear": 1985,
  "toYear": 1976,
  "citation": "AllMusic bio, Fred Thomas -- a single shared critic-attributed citation rather than an individual quote, flagged weaker-tier. AllMusic bio, Fred Thomas -- critic-attributed, weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "radiohead>guided-by-voices",
  "from": "Radiohead",
  "to": "Guided by Voices",
  "fromYear": 1985,
  "toYear": 1983,
  "citation": "Grove Atlantic's publisher copy for the authorised GBV biography: P.J. Harvey, Radiohead, R.E.M., the Strokes and U2 have cited Pollard as an influence. Publisher marketing copy, not a primary interview.",
  "sourceTier": "critic"
 },
 {
  "key": "aphex-twin>can",
  "from": "Aphex Twin",
  "to": "Can",
  "fromYear": 1992,
  "toYear": 1968,
  "citation": "Simon Reynolds (1993): Richard D. James had \"recently explored avant-classical and left-field rock artists including Cage, Stockhausen, Eno, Steve Reich, Terry Riley, and Can.\"",
  "sourceTier": "critic"
 },
 {
  "key": "elliott-smith>sebadoh",
  "from": "Elliott Smith",
  "to": "Sebadoh",
  "fromYear": 1994,
  "toYear": 1986,
  "citation": "A music-directory retrospective asserts Sebadoh's lo-fi approach influenced Modest Mouse, Elliott Smith, the Microphones/Mount Eerie, and Car Seat Headrest.",
  "sourceTier": "critic"
 },
 {
  "key": "mogwai>slint",
  "from": "Mogwai",
  "to": "Slint",
  "fromYear": 1995,
  "toYear": 1986,
  "citation": "Glide Magazine (2011): early Mogwai songs \"sounded like God Machine or Joy Division or Slint.\"",
  "sourceTier": "critic"
 },
 {
  "key": "mogwai>bark-psychosis",
  "from": "Mogwai",
  "to": "Bark Psychosis",
  "fromYear": 1995,
  "toYear": 1986,
  "citation": "Spectrum Culture names Bark Psychosis as an influence on Mogwai's sound.",
  "sourceTier": "critic"
 },
 {
  "key": "american-football>drive-like-jehu",
  "from": "American Football",
  "to": "Drive Like Jehu",
  "fromYear": 1997,
  "toYear": 1990,
  "citation": "Crack Magazine, in the writer's own list of the band's touchstones rather than a quote from Steve Holmes.",
  "sourceTier": "critic"
 },
 {
  "key": "american-football>low",
  "from": "American Football",
  "to": "Low",
  "fromYear": 1997,
  "toYear": 1993,
  "citation": "Crack Magazine -- journalist's list rather than a direct Holmes quote, flagged weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "american-football>tortoise",
  "from": "American Football",
  "to": "Tortoise",
  "fromYear": 1997,
  "toYear": 1990,
  "citation": "The Daily Illini and Bandcamp Daily both trace American Football's instrumental post-rock leanings to the members' exposure to Tortoise's music in the Chicago scene where both bands were based.",
  "sourceTier": "critic"
 },
 {
  "key": "snail-mail>fiona-apple",
  "from": "Snail Mail",
  "to": "Fiona Apple",
  "fromYear": 2015,
  "toYear": 1996,
  "citation": "The Forty-Five described Snail Mail's Lush as a throwback that \"worshipped at the altar of Liz Phair and Fiona Apple.\"",
  "sourceTier": "critic"
 },
 {
  "key": "snail-mail>duster",
  "from": "Snail Mail",
  "to": "Duster",
  "fromYear": 2015,
  "toYear": 1996,
  "citation": "AllMusic's prose biography of Duster credits the band's patient, minimal approach as an influence on artists including Snail Mail and Alex G.",
  "sourceTier": "critic"
 },
 {
  "key": "the-jesus-and-mary-chain>kraftwerk",
  "from": "The Jesus and Mary Chain",
  "to": "Kraftwerk",
  "fromYear": 1983,
  "toYear": 1970,
  "citation": "LA Times: their sound is where \"the Shangri-Las, the Velvet Underground, the Beach Boys, Kraftwerk and the Stooges harmoniously converged.\"",
  "sourceTier": "critic"
 },
 {
  "key": "the-replacements>new-york-dolls",
  "from": "The Replacements",
  "to": "New York Dolls",
  "fromYear": 1979,
  "toYear": 1971,
  "citation": "One anonymous blog is the only source found.",
  "sourceTier": "critic"
 },
 {
  "key": "unwound>sonic-youth",
  "from": "Unwound",
  "to": "Sonic Youth",
  "fromYear": 1991,
  "toYear": 1981,
  "citation": "Fred Thomas, AllMusic bio -- critic-sourced rather than a member quote.",
  "sourceTier": "critic"
 },
 {
  "key": "unwound>television",
  "from": "Unwound",
  "to": "Television",
  "fromYear": 1991,
  "toYear": 1973,
  "citation": "Fred Thomas, AllMusic bio -- critic-sourced rather than a member quote. Fred Thomas, AllMusic bio -- critic-sourced and weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "unwound>can",
  "from": "Unwound",
  "to": "Can",
  "fromYear": 1991,
  "toYear": 1968,
  "citation": "Fred Thomas, AllMusic bio -- critic-sourced rather than a member quote. Fred Thomas, AllMusic bio -- critic-sourced and weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "swans>this-heat",
  "from": "Swans",
  "to": "This Heat",
  "fromYear": 1982,
  "toYear": 1976,
  "citation": "AllMusic bio, Fred Thomas -- a single shared critic-attributed citation rather than an individual quote, flagged weaker-tier. AllMusic bio, Fred Thomas -- critic-attributed, weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "modest-mouse>built-to-spill",
  "from": "Modest Mouse",
  "to": "Built to Spill",
  "fromYear": 1992,
  "toYear": 1992,
  "citation": "Mark Richardson, \"Built to Spill,\" Pitchfork (7 May 2006): Built to Spill's work \"has been said to have been an influence on alternative rock acts such as Modest Mouse and Death Cab for Cutie.\"",
  "sourceTier": "critic"
 },
 {
  "key": "modest-mouse>sebadoh",
  "from": "Modest Mouse",
  "to": "Sebadoh",
  "fromYear": 1992,
  "toYear": 1986,
  "citation": "A music-directory retrospective asserts Sebadoh's lo-fi approach influenced Modest Mouse, Elliott Smith, the Microphones/Mount Eerie, and Car Seat Headrest.",
  "sourceTier": "critic"
 },
 {
  "key": "stereolab>velvet-underground",
  "from": "Stereolab",
  "to": "The Velvet Underground",
  "fromYear": 1990,
  "toYear": 1965,
  "citation": "Jim Sullivan, The Boston Globe (5 Nov 1997), on a band \"often pegged as Velvet Underground-influenced retro-futurists\"; Barney Hoskyns in Rolling Stone (Oct 1997) similarly described Dots and Loops moving \"ever further away from the one-chord Velvets drone-mesh of its early days.\" Critics' framing throughout -- Tim Gane has spoken about Neu!, not the Velvet Underground.",
  "sourceTier": "critic"
 },
 {
  "key": "stereolab>this-heat",
  "from": "Stereolab",
  "to": "This Heat",
  "fromYear": 1990,
  "toYear": 1976,
  "citation": "AllMusic bio, Fred Thomas -- a single shared critic-attributed citation rather than an individual quote, flagged weaker-tier. AllMusic bio, Fred Thomas -- critic-attributed, weaker-tier.",
  "sourceTier": "critic"
 },
 {
  "key": "low>velvet-underground",
  "from": "Low",
  "to": "The Velvet Underground",
  "fromYear": 1993,
  "toYear": 1965,
  "citation": "Stereogum wrote that Low's first two records were equally beholden to the hushed balladry of the Velvet Underground as to the elegiac drone of Joy Division; Zak Sally told MOJO that his and Alan Sparhawk's pre-Low band 12:38 used to play the Velvet Underground's \"Sister Ray\" far longer than anyone should.",
  "sourceTier": "critic"
 },
 {
  "key": "low>galaxie-500",
  "from": "Low",
  "to": "Galaxie 500",
  "fromYear": 1993,
  "toYear": 1987,
  "citation": "Strongest edge this node has -- DiS Slowcore Week: cited as an influence by Low, specifically for paring down the Velvet Underground and the Modern Lovers.",
  "sourceTier": "critic"
 },
 {
  "key": "this-heat>can",
  "from": "This Heat",
  "to": "Can",
  "fromYear": 1976,
  "toYear": 1968,
  "citation": "Perfect Sound Forever's essay on This Heat argues for Can's influence on the band, though the claim is the writer's own analysis rather than a quote from Charles Hayward himself.",
  "sourceTier": "critic"
 },
 {
  "key": "brand-new>the-jesus-lizard",
  "from": "Brand New",
  "to": "The Jesus Lizard",
  "fromYear": 2000,
  "toYear": 1987,
  "citation": "CHARTattack (Nov 25, 2009): \"Tierney's bass playing emulated Husker Du and The Jesus Lizard.\"",
  "sourceTier": "critic"
 },
 {
  "key": "brand-new>husker-du",
  "from": "Brand New",
  "to": "Hüsker Dü",
  "fromYear": 2000,
  "toYear": 1979,
  "citation": "CHARTattack (Nov 25, 2009): \"Tierney's bass playing emulated Husker Du and The Jesus Lizard.\"",
  "sourceTier": "critic"
 },
 {
  "key": "galaxie-500>velvet-underground",
  "from": "Galaxie 500",
  "to": "The Velvet Underground",
  "fromYear": 1987,
  "toYear": 1965,
  "citation": "Wikipedia's Slowcore article, Drowned In Sound and Treble: the Velvets' third self-titled album as direct template. DiS calls VU their most immediate influence.",
  "sourceTier": "critic"
 },
 {
  "key": "galaxie-500>big-star",
  "from": "Galaxie 500",
  "to": "Big Star",
  "fromYear": 1987,
  "toYear": 1971,
  "citation": "Wikipedia Slowcore: formative influences named as VU, Modern Lovers, Big Star, Spacemen 3.",
  "sourceTier": "critic"
 },
 {
  "key": "galaxie-500>the-modern-lovers",
  "from": "Galaxie 500",
  "to": "The Modern Lovers",
  "fromYear": 1987,
  "toYear": 1970,
  "citation": "Wikipedia Slowcore: formative influences named as VU, Modern Lovers, Big Star, Spacemen 3.",
  "sourceTier": "critic"
 }
]
```
