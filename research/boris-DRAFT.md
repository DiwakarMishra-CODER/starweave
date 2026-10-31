# Boris (JP, 1992): Layer 1 research DRAFT

Research only. Nothing here has been written to `data/seed-data.ts`, `data/edge-sources.json` or code. Started 30 Oct 2026.

**Tool status.** WebSearch worked on every call: 21 of the 25 allowed were used. Pages were opened with `ledger.ts read`, which reached most of them directly or through r.jina.ai. Invisible Oranges returned 403 on every live attempt. Its pages were recovered from Wayback snapshots found through the CDX API (`/interview-takeshi-boris/` and `/interview-taka-goto-mono/`). Pages that could not be opened: Drowned in Sound ("Page unavailable"), theglow.jp/selector/boris (404), the Alternative Press Mono interview (not needed in the end) and the Invisible Oranges Have a Nice Life interview. No Grokipedia result came up. Every quote below was read on the page that carries it, not taken from a search summary.

**Earlier pass.** `research/postrock-audit-DRAFT.md` §8 ruled Boris "FAILS-BAR / out of scope". That pass had no WebSearch and AllMusic was blocked, and it asked for a retry. This retry finds two strong first-person upstream links and one first-person downstream link, so that verdict is superseded.

**Off-map names, so not edges:** Melvins (the name comes from "Boris" on *Bullhead*; "Melvins-inspired"), Earth (*Earth 2*), Venom, Sleep, Dale Crover, Ted Nugent, Carmine Appice, Deep Purple, Zigyaku (Gudon / Bastard), YMO, Guitar Wolf, Sunn O))), Merzbow, Keiji Haino, Michio Kurihara, Envy.

---

## Candidate links

### 1. `boris -> nick-drake`: INFLUENCE (strongest)
- **URL:** https://web.archive.org/web/20051024095418/http://www.radcompany.net/Storys/NewsStorys/BORIS/BORIS.html (Rad Company, phone interview with Atsuo, c. 2005. Wikipedia's Boris page cites it.)
- **Speaker:** Atsuo, answering "Why the spoof on *Akuma No Uta* of Nick Drake? Do you like him?"
- **Exact sentences:** "I love Nick Drake. I respect him. That song is an homage." / "Boris fans maybe can't imagine listening to folk music, but it's something important to us. [...] So people might understand Nick Drake's music has influenced our music. Maybe a lot of people don't know that."
- **Tier:** first-person. **Suggested confidence:** 0.85.
- **Reasoning:** The band says outright that Drake's music influenced their own. This is more than the cover homage: the US *Akuma no Uta* sleeve copies *Bryter Layter*, as The Stranger, the Austin Chronicle and Wikipedia all note, and on its own a sleeve homage would not count. Chronology: Drake 1969-74, Boris from 1992. Fine.

### 2. `boris -> nick-cave-and-the-bad-seeds`: INFLUENCE
- **URL:** same Rad Company interview.
- **Speaker:** Atsuo, asked for a favourite drummer.
- **Exact sentences:** "Of course, I love Dale Crover from the Melvins, and Ian Page from Deep Purple, eh, Carmine Appice from Vanilla Fudge and Cactus. But aside from drummers, Iggy Pop, Ted Nugent, Nick Cave. Those people influenced me more than any drummers. I'm influenced by drummers for drumming technique of course, but as a musician, I'm influenced by people like Nick Cave." / "I want to be Nick Cave as a drummer."
- **Tier:** first-person. **Suggested confidence:** 0.8.
- **Reasoning:** He says outright that Cave shapes him as a musician. Which node: he names the person, not a band. In 2005 Cave meant the Bad Seeds, and the map's solo-Cave node is `nick-cave-and-the-bad-seeds`. `the-birthday-party` is defensible but less likely what he meant. Owner's call.
- A bare blog line ("With influences as deep as Nick Cave, Venom, Sleep, and Nick Drake", buffablog.com/tonight-boris) repeats links 1 and 2 with no origin. Per the aggregator rule it adds nothing; the Rad Company interview is the source.

### 3. `boris -> the-stooges`: INFLUENCE (weaker)
- **URL / speaker / sentence:** the same Atsuo passage as link 2: "Iggy Pop, Ted Nugent, Nick Cave. Those people influenced me more than any drummers."
- **Tier:** first-person. **Suggested confidence:** 0.6.
- **Reasoning:** "Influenced me" is a first-person claim. But he names Iggy Pop the person in a passing list, and the follow-up only develops Cave. Matching Iggy to `the-stooges` has precedent on the map (`joy-division -> the-stooges` "Iggy", `the-white-stripes -> the-stooges`), so it is acceptable, but this is the thinnest of the three upstream links. Chronology is fine.

### 4. `the-flaming-lips -> boris`: INFLUENCE (the downstream link, and the one that brought Boris up)
- **URL:** https://thequietus.com/interviews/bakers-dozen/flaming-lips-wayne-coyne-interview-favourite-albums/5/ (Stewart Smith, The Quietus Baker's Dozen, 13 June 2011). Re-opened.
- **Speaker:** Wayne Coyne, in the entry for Yo La Tengo's *Popular Songs*.
- **Exact sentences:** "There have been a couple of times where we would do these long drives and we'd put on a record like Boris or Yo La Tengo, and they'll have songs that go on for ten minutes, and you're getting into these big soundscapes that just dig into oblivion. We've really embraced that in the past couple of years: to find this perfect goal, a sound you can play over and over, and not necessarily get to a crescendo and back, but to get to the edge and stay there. And they do that great."
- **Supporting passage, slide /7/, his No. 6 pick, Boris's *Smile*:** "I've heard their new album about six times on our trips together [...] There's probably something in one of those eight minute long jams that I picked out and thought 'Oh yeah! Cool! Let's hear that again'. There's something about these long passages [...] It's just holding you out there on the edge [...]". The "edge" phrasing is the same as in the YLT entry.
- **Critic framing (supporting only, critic tier, intro page):** "His enthusiasm for heavy, drugged-out jams (Boris, Tobacco) [...] makes perfect sense in the light of 2009's Embryonic and this year's Gummy Song Skull EP."
- **Tier:** first-person. **Suggested confidence:** 0.65.
- **Reasoning:** This is not bare praise. "We've really embraced that in the past couple of years" ties the long-soundscape listening, Boris named first, to the Lips' own recent music. The interview's critic connects it to *Embryonic*. **Precedent:** the ledger already accepts this same passage as first-person influence for `the-flaming-lips -> yo-la-tengo` (`data/edge-sources.json`, verdict "fixed", by owner1). Accepting it for Boris is consistent. The confidence sits a notch below 0.85 for two reasons: "And they do that great" grammatically refers to YLT, and Boris shares the sentence rather than having it alone. **Chronology:** *Smile* 2008, *Embryonic* 2009, interview 2011. It runs forward.

### 5. `mono -> boris`: REJECT (peers and friends, not influence)
- **URL:** https://nwasianweekly.com/2015/06/mono-two-new-albums-japanese-experimental-rock-explores-the-dark-and-seeing-light (Northwest Asian Weekly, 2015).
- **Speaker:** Takaakira "Taka" Goto (Mono), asked "What bands, Japanese and/or otherwise, were crucial to the band's inspiration, and why?"
- **Exact sentence:** "Envy and Boris are really good friends. They are releasing and touring like us. We hang out together often when we are in Tokyo."
- **Tier:** first-person, but about friendship.
- **Reasoning:** The question asks about inspiration, but the answer describes peers who release and tour the same way and hang out together. That is a scene and friendship tie, which the rules exclude. A search summary called this "named Envy and Boris as bands that inspired Mono"; the page itself does not say that.
- Note: on a re-run, the summary's quoted phrase "Envy and Boris are really good friends" returned zero results as an exact-phrase search, but the page does carry it. This is the "summary accurate in substance, wrong in framing" trap: the quote is real, and the "inspired" reading is the summary's.

### Critic comparisons (not influence, listed so nobody re-proposes them)
- Phoenix New Times (Atsuo interview intro): *Heavy Rocks* (2011) / *Attention Please* / *New Album* drew "comparisons to Sonic Youth, My Bloody Valentine, and Mazzy Star". Critic resemblance only.
- Denver Westword (Atsuo interview intro): *New Album* "drew immediate comparisons to My Bloody Valentine". Critic only. In the same piece Atsuo declines to name similar bands.
- The Line of Best Fit review, as reported in a search summary (not opened): Boris as "natural successors to My Bloody Valentine and the Melvins, Sleep and Sonic Youth, Swans and Sabbath". Critic lineage, and unverified.
- Invisible Oranges (Takeshi interview intro, 2016) says *Pink* combined sludge, shoegaze and ambient "even before Deafheaven". Deafheaven is not on the map.

---

## Searched, nothing found
- **Boris upstream, on-map names:** My Bloody Valentine, Sonic Youth, Swans, the Jesus and Mary Chain, Slowdive, Can, Neu!, Brian Eno, the Cure, Nirvana, Mudhoney, Black Flag, Big Black, Velvet Underground, Fishmans. Pages read: Quietus "Noise Is Japanese Blues" (2013), Premier Guitar "Boris Wields the Hammer of Doom", Invisible Oranges Takeshi (2016, via Wayback), Sound on Sound "Talkback: Boris", Lollipop "Mabura No Ura", Phoenix New Times, Westword, Post-Trash (2023), Bristol24/7, Philthy Mag (Takeshi), Steel for Brains (via Wayback), Decibel's *Pink* piece, Sleeping Shaman, Echoes and Dust, CREEM, Orlando Weekly. What the band themselves name is Melvins, Earth (*Earth 2*: "pretty much changed our outlook on life", Takeshi), punk and hardcore, Zigyaku, and metal / new wave / punk / hardcore in general (Takeshi, Bristol24/7). None of these is on the map.
- **Downstream, by the descendant's own interviews:** Wednesday / Karly Hartzman / MJ Lenderman, Jane Remover, Parannoul, Anna von Hausswolff (she names Earth and Barn Owl; the Sunn O)))/Boris link runs through producer Randall Dunn, which is production, not influence), Have a Nice Life (Scene Point Blank, Machine Music, Bandcamp Daily: no Boris), Deerhunter / Bradford Cox (Quietus favourite LPs: no Boris), Low / Alan Sparhawk, Mogwai / Stuart Braithwaite, King Gizzard / Stu Mackenzie, Turnstile / Brendan Yates, Mono (only the friendship answer above). Nothing found for any of them.
- **Not attempted for lack of budget (likely low-yield):** Grouper, Geese, Deaths Dynamic Shroud, Silversun Pickups, Explosions in the Sky, the Jesus Lizard, Sigur Rós. A follow-up could check whether any member of Deafheaven, Nothing or Jesu, all off-map, is on the map in another form; none appears to be.

## Denials
None found. No one on the map is on record denying a Boris influence.

---

## Verdict: clears the no-orphans bar

Four links survive as influence: three upstream (`nick-drake` 0.85, `nick-cave-and-the-bad-seeds` 0.8, `the-stooges` 0.6), all first-person from Atsuo in one interview, plus one downstream (`the-flaming-lips -> boris` 0.65), first-person. One is rejected (`mono -> boris`, friendship).

### Placement proposal
- `id: 'boris'`, `name: 'Boris'`, `country: 'JP'`, `activeFrom: 1992`, `layer: 'outside'` (as for every other post-rock-drone-noise artist), `realm: 'post-rock-drone-noise'`, `lineage: 'drone'` (alongside `anna-von-hausswolff` and `natural-snow-buildings`). `mono` is the realm's other Japanese band, on `lineage: 'post-rock'`.
- `genres`: `['drone', 'noise-rock']` at minimum. The vocabulary has no doom, sludge or metal genre, so drone (debut *Absolutego* 1996, *Flood*) and noise-rock are the honest fits. Adding `'shoegaze'` is defensible for the *Pink* / *Smile* / *New Album* run, but every tag needs a matching spot in that genre page's groups in `data/genre-pages.ts` (the test fails otherwise), so only add it if the shoegaze page should carry Boris. Suggest drone + noise-rock, with shoegaze as the owner's call.
- `scope: ['underground']`. Scenes: none. Boris's Tokyo circle (Envy, Mono, Church of Misery) is not a scene on the map.
- Signature song suggestion: "Farewell" (opener of *Pink*; Invisible Oranges calls it "the band's best-known song").

### Proposed major album
**Pink (2005; Southern Lord US reissue 2006).** It is the record that carried Boris into indie and shoegaze listening: sludge riffs fused with shoegaze walls and post-rock length. It is their commercial and critical breakthrough, and the album the 10th- and 20th-anniversary reissues and tours celebrate. Alternative: *Akuma no Uta* (2003), which would tie the record to the Nick Drake link through its *Bryter Layter* sleeve, but *Pink* is the album the indie audience knows.
