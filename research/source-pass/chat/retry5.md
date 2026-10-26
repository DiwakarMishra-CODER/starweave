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
  "agent": "retry5",
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
  "key": "bon-iver>tom-waits",
  "from": "Bon Iver",
  "to": "Tom Waits",
  "fromYear": 2007,
  "toYear": 1971,
  "citation": "PopMatters wrote in 2008 that Justin Vernon named Tom Waits among the touchstones he moved away from while making For Emma, Forever Ago.",
  "sourceTier": "reported",
  "lastTry": "PopMatters review of For Emma, Forever Ago (popmatters.com/bon-iver-for-emma-forever-ago-2496184847.html) read in full: no mention of Tom Waits. Searched PopMatters+Vernon+Waits and Vernon+Tom Waits+For Emma interview: no page. Citation looks unsupported."
 },
 {
  "key": "four-tet>aphex-twin",
  "from": "Four Tet",
  "to": "Aphex Twin",
  "fromYear": 1998,
  "toYear": 1992,
  "citation": "Kieran Hebden (2011 interview, Medium/MJ O'Neill) calls Aphex Twin's \"Windowlicker\" \"truly experimental and truly kind of natural and human at the same time\"; corroborated by his 1999 Aphex Twin remix (Warp compilation), widely described as his career breakout.",
  "sourceTier": "reported",
  "lastTry": "Pitchfork's Four Tet interview (Andy Beta, 2013; Internet Archive 2015/2016) only says a breakout remix of Aphex Twin and a generation 'weaned on... the likes of Aphex and Boards of Canada'. The Medium/MJ O'Neill 'Windowlicker' quote was searched once (no page found) and not on Pitchfork. A remix is not an influence claim by itself."
 },
 {
  "key": "have-a-nice-life>dead-kennedys",
  "from": "Have A Nice Life",
  "to": "Dead Kennedys",
  "fromYear": 2000,
  "toYear": 1978,
  "citation": "Steel for Brains reported that Tim Macuga said the default music of his youth was Dead Kennedys, Descendents and Operation Ivy.",
  "sourceTier": "reported",
  "lastTry": "Searched Steel for Brains + Macuga + Dead Kennedys/Descendents/Operation Ivy, and Macuga interview 'default' music growing up: no Steel for Brains page surfaced. Treble piece (treblezine.com/?p=96754) mentions Macuga sending youth crew hardcore, not opened for these bands."
 },
 {
  "key": "have-a-nice-life>descendents",
  "from": "Have A Nice Life",
  "to": "Descendents",
  "fromYear": 2000,
  "toYear": 1977,
  "citation": "The same Steel for Brains account of Tim Macuga's youth names Descendents alongside Dead Kennedys and Operation Ivy.",
  "sourceTier": "reported",
  "lastTry": "Same as dead-kennedys: Steel for Brains page not found in two searches."
 },
 {
  "key": "lcd-soundsystem>the-birthday-party",
  "from": "LCD Soundsystem",
  "to": "The Birthday Party",
  "fromYear": 2002,
  "toYear": 1976,
  "citation": "The Independent described James Murphy as an avid student of the Birthday Party, alongside Can, the Velvet Underground and what it called \"weird punk rock.\"",
  "sourceTier": "reported",
  "lastTry": "Independent profile not found in 2 searches (results returned only Wikipedia/Qobuz/AOL syndication of a different Independent piece, which has no Birthday Party); Wikipedia pages for Murphy and LCD have no Birthday Party mention."
 },
 {
  "key": "lcd-soundsystem>velvet-underground",
  "from": "LCD Soundsystem",
  "to": "The Velvet Underground",
  "fromYear": 2002,
  "toYear": 1965,
  "citation": "The same Independent profile named the Velvet Underground among the artists James Murphy studied closely, alongside the Birthday Party and Can.",
  "sourceTier": "reported",
  "lastTry": "Independent profile not found (2 searches shared with the Birthday Party link). A Qobuz bio snippet lists the Velvet Underground among Murphy's influences but that is a search summary, not read; Wikipedia pages for Murphy/LCD don't mention it. Possible first-person source: Rolling Stone / Reverb 2013 'James Murphy talks influences' (Reverb page opened only via archive and shows Bowie, not VU)."
 },
 {
  "key": "low>velvet-underground",
  "from": "Low",
  "to": "The Velvet Underground",
  "fromYear": 1993,
  "toYear": 1965,
  "citation": "Stereogum wrote that Low's first two records were equally beholden to the hushed balladry of the Velvet Underground as to the elegiac drone of Joy Division; Zak Sally told MOJO that his and Alan Sparhawk's pre-Low band 12:38 used to play the Velvet Underground's \"Sister Ray\" far longer than anyone should.",
  "sourceTier": "critic",
  "lastTry": "One search (Zak Sally, Low, Velvet Underground, 'Sister Ray', MOJO). It returned only general Velvet Underground and Zak Sally pages. The Stereogum and MOJO sources in the citation were not located. A lead worth opening is the AV Club interview with Zak Sally, https://www.avclub.com/article/interview-zak-sally-of-la-mano-low-16609, which Wikipedia lists but which I did not open. One search remains for this link."
 },
 {
  "key": "modest-mouse>built-to-spill",
  "from": "Modest Mouse",
  "to": "Built to Spill",
  "fromYear": 1992,
  "toYear": 1992,
  "citation": "Mark Richardson, \"Built to Spill,\" Pitchfork (7 May 2006): Built to Spill's work \"has been said to have been an influence on alternative rock acts such as Modest Mouse and Death Cab for Cutie.\"",
  "sourceTier": "critic",
  "lastTry": "One search (Isaac Brock on Built to Spill). Isaac Brock praises Doug Martsch as a person in a Nashville Scene interview, and other pages only say the bands toured together, so I found nothing on musical influence. The Pitchfork 'has been said to have been an influence' line from Mark Richardson (2006) was not located or opened. One search remains for this link if you want it."
 },
 {
  "key": "pavement>the-replacements",
  "from": "Pavement",
  "to": "The Replacements",
  "fromYear": 1989,
  "toYear": 1979,
  "citation": "The Quietus, \"Organised Chaos: Swell Maps Interviewed\" (24 May 2021), which records the Replacements and Swell Maps among the influences Scott Kannberg has cited.",
  "sourceTier": "reported",
  "lastTry": "The Quietus Swell Maps piece (thequietus.com/articles/30006-swell-maps-interview, the page Wikipedia footnotes) names Kannberg and Swell Maps but never mentions the Replacements, so the old citation is wrong on that page. Searched Kannberg+Replacements; only Bandsintown/AllAboutJazz copies of a claim of a 1992 interview where he 'preferred the Replacements to the Fall' (no primary page). Relix, Bandcamp Daily and Free Press Houston Kannberg interviews carry no Replacements mention. Kannberg->Swell Maps is real if Swell Maps is ever on the roster; Quietus text: 'namechecked by ... Pavement's Scott Kannberg'."
 },
 {
  "key": "sonic-youth>this-heat",
  "from": "Sonic Youth",
  "to": "This Heat",
  "fromYear": 1981,
  "toYear": 1976,
  "citation": "AllMusic bio, Fred Thomas -- a single shared critic-attributed citation rather than an individual quote, flagged weaker-tier.",
  "sourceTier": "critic",
  "lastTry": "Two searches (Thurston Moore on This Heat; This Heat with Thurston Moore and Charles Hayward) found no statement that This Heat shaped Sonic Youth. The pages show only collaboration: the Moore/Hayward 2017 album Improvisations, and Moore guesting in This Is Not This Heat. NPR (https://www.npr.org/2020/08/21/904291487/understanding-the-impossibly-far-reaching-influence-of-this-heat) names Moore only as a guest. Wikipedia's This Heat page says critics recognise influence on Sonic Youth. I did not follow its footnote."
 },
 {
  "key": "the-cranberries>siouxsie-and-the-banshees",
  "from": "The Cranberries",
  "to": "Siouxsie & The Banshees",
  "fromYear": 1989,
  "toYear": 1976,
  "citation": "O'Riordan named Sinead O'Connor and Siouxsie Sioux among the singers whose vocal effects -- including yodeling -- shaped her own technique.",
  "sourceTier": "reported",
  "lastTry": "Wikipedia's Dolores O'Riordan article puts Siouxsie and the Banshees and New Order in a sentence footnoted to Steve Baltin, Forbes (15 Jan 2018), a 1999 interview. Opened the Internet Archive copy (2026) of the Forbes page: no Siouxsie, no 'yodel', no O'Connor. The yodel line is not on the page. No other page found."
 },
 {
  "key": "yeah-yeah-yeahs>sonic-youth",
  "from": "Yeah Yeah Yeahs",
  "to": "Sonic Youth",
  "fromYear": 2000,
  "toYear": 1981,
  "citation": "Wikipedia's inspirations line for the band, sourced to Ethan Brown's \"Oh, yeah?\" in New York magazine, names Sonic Youth within a list of twenty artists running from John Zorn and PJ Harvey to Blondie, ESG, the Ramones and Van Halen.",
  "sourceTier": "reported",
  "lastTry": "Wikipedia's 'Their inspirations include...' list (Sonic Youth, Birthday Party, Siouxsie, etc.) is footnoted to Ethan Brown's NY Magazine 'Oh, yeah?' (nymag.com/nymetro/arts/music/features/music2002/n_7749/); that page opened and holds no Sonic Youth, Zorn, Ramones or Birthday Party. The list has no source of its own."
 },
 {
  "key": "yeah-yeah-yeahs>the-birthday-party",
  "from": "Yeah Yeah Yeahs",
  "to": "The Birthday Party",
  "fromYear": 2000,
  "toYear": 1976,
  "citation": "Wikipedia's inspirations line for the band, sourced to Ethan Brown's \"Oh, yeah?\" in New York magazine, names the Birthday Party within a list of twenty artists running from John Zorn and PJ Harvey to Blondie, ESG, the Ramones and Van Halen.",
  "sourceTier": "reported",
  "lastTry": "Same: Wikipedia's inspirations list, footnoted to the NY Magazine 'Oh, yeah?' piece, which opened and does not name the Birthday Party. No page carries the claim."
 }
]
```
