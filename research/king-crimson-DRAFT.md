# King Crimson: Layer 1 research (DRAFT, 30 Oct 2026)

Research only. Nothing here is written to `data/seed-data.ts`, `data/edge-sources.json` or code.
Edge direction follows the data model: `source -> target` = source was influenced BY target.

## Tool status

- **WebSearch: working.** 21 calls used this pass (budget asked: under 25).
- **Page reads: working** via `npx tsx scripts/source-pass/ledger.ts read` (pages now cached in `research/source-pass/.pages/`).
  - theface.com came back as a 5-paragraph stub, live and through r.jina.ai. The Internet Archive copy read in full.
  - undertheradarmag.com could not be opened, direct or proxied (two pages: Slint track-by-track, Squid "My Firsts").
- **Free sources checked first:** `research/source-pass/off-map.json` (Wire, Guided by Voices), `research/source-pass/series/judged-*.json`, and every King Crimson / Fripp mention in `bakers-dozen/picks.json`.
  - Baker's Dozens already scraped with **no** King Crimson mention: Geordie Greep (black midi), David Pajo (Slint), Stuart Braithwaite (Mogwai), Doug McCombs (Tortoise), Wayne Coyne (Flaming Lips), Jamie Stewart (Xiu Xiu), Ed O'Brien (Radiohead), Stephen Morris (Joy Division/New Order), Frantz/Weymouth (Talking Heads), Colin Newman, Graham Lewis (Wire).

Every quote below was read on the page that carries it. Nothing comes from a search summary.

---

## 1. Links found: King Crimson's descendants (`X -> king-crimson`)

### 1a. Influence (recommend writing)

| # | Edge | Speaker | Tier | Conf. |
|---|---|---|---|---|
| 1 | `wilco -> king-crimson` | Nels Cline | first-person | 0.85 |
| 2 | `wire -> king-crimson` | Colin Newman | first-person | 0.85 |
| 3 | `guided-by-voices -> king-crimson` | Robert Pollard | first-person | 0.7 |
| 4 | `radiohead -> king-crimson` | Philip Selway | first-person | 0.6 |
| 5 | `everything-everything -> king-crimson` | Jonathan Higgs | first-person | 0.6 (borderline) |
| 6 | `black-midi -> king-crimson` | Cameron Picton | first-person | 0.55 (borderline) |

**1. `wilco -> king-crimson`** (influence, 0.85)
- **Source:** Gary Graff, "Nels Cline: 10 records that changed my life", *Guitar Player*, 8 Feb 2025: https://www.guitarplayer.com/guitarists/nels-cline-10-records-that-changed-my-life
- **Found** (entry "Paul Bley, Open, To Love (1972)/King Crimson, Larks' Tongues in Aspic (1973)"):
  > "And Larks' Tongues in Aspic: My brother and I went to see that band every time they played in southern California. Pretty much the mood of the music, the amount of improvisation they did, the mastering of their various instruments and language — along with, in my case, listening to Wayne Shorter and Joe Zawinul compositions with Weather Report — made me want to write music that sounded like that, in my way."
- **Speaker:** Nels Cline, Wilco's lead guitarist since 2004.
- **Why:** He says it made him want to write music like it, while he was forming as a musician in the early 1970s.
- **Precedent:** `wilco -> television` is already written on a Cline claim, in the same magazine series format.
- **Chronology:** 1973 record, Cline in his teens; Wilco formed 1994.

**2. `wire -> king-crimson`** (influence, 0.85)
- **Source:** Robert Ham, "Wire's Colin Newman on the Music That Made Him", *Pitchfork* 5-10-15-20, 31 Jan 2017: https://pitchfork.com/features/5-10-15-20/10015-wires-colin-newman-on-the-music-that-made-him/
- **Found** (entry "King Crimson: In the Court of the Crimson King"):
  > "In the period before I was living in London, I saw King Crimson more than any other band, and they had the biggest effect on me."
- **Context:** The paragraph before says he learned of them from Island's sampler records. The one after: "The combination of heaviness, technical brilliance, and sheer bonkers arrangements was unbelievable."
- **Speaker:** Newman himself.
- **Why:** "The biggest effect on me" in his pre-Wire formative years.
- **Chronology:** He saw them c. 1969-74; Wire formed 1976.

**3. `guided-by-voices -> king-crimson`** (influence, 0.7)
- **Source:** "The Records That Changed My Life: Robert Pollard of Guided by Voices", *SPIN*, Sept 2004: https://www.spinmagazine.com/2004/09/records-changed-my-life-robert-pollard-guided-voices/
- **Found** (entry "KING CRIMSON IN THE COURT OF THE CRIMSON KING (Island, 1969)"):
  > "My dad joined the Columbia Record Club and I got this. First, I couldn't get into it because the songs were so long and jazzy, but after a while I got into a complete prog-rock phase. Later, when things started happening for Guided by Voices, people were like, 'What do you mean you like Genesis?' But that's all I knew about; we didn't have hip record stores in the Midwest. I've tried to write epics, but I've got a short attention span ..."
- **Speaker:** Pollard himself. The piece's intro calls it "his unique prog-punk past".
- **It is about King Crimson:** that is the record under the heading.
- **It is formative:** he got it as a boy through his dad's record club.
- **Why:** He ties the record to his own writing ("I've tried to write epics").
- **Why not higher:** the music-making link runs through prog in general, not King Crimson by name, and the off-map sentence alone would read as a favourite.

**4. `radiohead -> king-crimson`** (influence, 0.6)
- **Source:** Rob Hughes, "Philip Selway: 'Crimson, Floyd... Radiohead have drawn on that ambition'", *Prog* #138 (2023), via Louder: https://www.loudersound.com/features/philip-selway-crimson-floyd-radiohead-have-drawn-on-that-ambition
  - Louder splits the paragraph around an ad.
  - The full paragraph is in the fan archive transcription: https://citizeninsane.eu/media/uk/etc/10/pt_2023-05-23_prog.html
- **Question asked:** "When it comes to formative influences, was prog on your radar much when you were growing up?"
- **Found:**
  > "They listened to everything from King Crimson and Pink Floyd through to The Clash. I favoured more that kind of post-punk thing, the new wave thing. ... Having said that, even at that age, everything was very tribal. So anything prog I probably rejected. But that very formative stage with King Crimson, Pink Floyd and everything else was still in there. Also, with Radiohead, I guess we've kind of drawn on those elements as well at various points – that kind of musical ambition, the scope and the soundscapes."
- **Speaker:** Selway, Radiohead's drummer.
- **Why:** He says it was formative listening (his sisters' records, late 1970s) and that the band drew on it.
- **Why only 0.6:** he hedges ("anything prog I probably rejected", "I guess"), and he speaks for the band about Crimson and Floyd together.
- **Interviews checked that do not name Crimson:** PopMatters (Counterbalance No. 131) notes Radiohead never cited King Crimson as a major influence. Selway's Prog interview postdates that.

**5. `everything-everything -> king-crimson`** (influence, borderline, 0.6)
- **Source:** Interview Magazine, "The Center of Everything Everything": https://www.interviewmagazine.com/music/everything-everything
- **Question asked:** "What are some of your biggest influences? Who did you listen to as kids?"
- **Found:**
  > "HIGGS: All sorts, but I guess we all meet in the middle with a shared passion for stuff like Radiohead, The Beatles, Aphex Twin, Kraftwerk, King Crimson, Dr Dre."
- **Is it a bare list?** It is a list, but an answer to "biggest influences / who did you listen to as kids", not a favourites list.
- **Precedent:** the same sentence already carries three edges: `everything-everything -> radiohead`, `-> kraftwerk` and `-> aphex-twin`. Source-pass checker c13 noted it as "Borderline ... but it is the band's own words about what unites them".
- **Recommendation:** for consistency, either write this fourth edge at the same tier or downgrade all four together. Writing King Crimson alone at a different standard would be inconsistent.

**6. `black-midi -> king-crimson`** (influence, borderline, 0.55)
- **Source:** Tzvi Gluckin, "Black Midi's 'Cavalcade': A Radical Relativity Album", *Premier Guitar*, 1 Jul 2021: https://www.premierguitar.com/artists/black-midi
- **Found:**
  > "'That bit in 'John L' … that's like King Crimson with the stops. That was a way to get a rhythm that we'll play that's, like, crazy in every set,' Picton says."
- **Speaker:** Cameron Picton (bass/vocals).
- **For:** the artist himself names King Crimson as the model for a specific passage in his own song. That is not a critic's "sounds like".
- **Against:** it is one sentence, and could be read as self-description of a resemblance.
- **Supporting, not sufficient alone:**
  - black midi covered "21st Century Schizoid Man" on the *Cavalcovers* EP (2022). A cover is not an influence claim.
  - Morgan Simpson's Talkhouse podcast with Bill Bruford (https://talkhouse.com/morgan-simpson-of-black-midi-talks-with-bill-bruford-king-crimson-yes-on-the-talkhouse-podcast) is audio only. The show notes say only that Simpson can "recognize his playing within a couple of seconds", which is not influence. It might hold a real quote. Owner to listen if wanted (Bruford's playing is King Crimson's, but the influence would still need saying).
- **Owner's call.**

### 1b. Favourite only (do not write)

| Edge | Source | Found | Why not |
|---|---|---|---|
| `black-country-new-road -> king-crimson` | Tyler Hyde on *Red* (already judged, PLAN.md) | "I think a perfect rock song" | Praise with no tie to her music-making. Not re-chased, as asked. |
| `bikini-kill -> king-crimson` | Kathleen Hanna, Quietus Baker's Dozen, Aretha Franklin entry: https://thequietus.com/interviews/bakers-dozen/kathleen-hanna-favourite-albums-interview/6/ | "when they started dating he had a bunch of records and I learnt about King Crimson, Van Morrison and Aretha Franklin." | Learning a band exists via her mum's boyfriend's records; nothing said about King Crimson itself. |
| `st-vincent -> king-crimson` | AV Club interview: https://www.avclub.com/st-vincent-1798227628 | AVC: "you have a very Robert Fripp approach to playing guitar." AC: "Oh yeah, thanks. I love Robert Fripp. ... He always dresses appropriately for the occasion." | The comparison is the interviewer's; her reply is praise of Fripp's dress sense. It is about Fripp, not the band. |

### 1c. Reject

| Candidate | Source | What it is | Verdict |
|---|---|---|---|
| `black-midi -> king-crimson` via Geoff Travis | Rolling Stone 2019: https://www.rollingstone.com/music/music-features/black-midi-schlagenheim-interview-947251/ — "He said that we reminded of him when he saw King Crimson in the Sixties" | A label boss's comparison | Reject: sounding alike |
| `black-midi -> king-crimson` via Greep's father's CDs | Wikipedia (Geordie Greep) says his father lent him CDs by "Pink Floyd, Genesis, and King Crimson", citing *The Face* | **The cited page names only "Genesis and Pink Floyd"** (archived: https://web.archive.org/web/2023/https://theface.com/music/black-midi-cavalcade-diamond-stuff-cameron-picton-geordie-greep-morgan-simpson-interview). King Crimson was added by the Wikipedia editor. | Reject; don't cite. Same page's own King Crimson line is a critic comparison ("sounds like Kamasi Washington meets King Crimson"). |
| `talking-heads <-> king-crimson` | Quietus, Discipline at 40 (https://thequietus.com/?p=30584); Ultimate Classic Rock (https://ultimateclassicrock.com/king-crimson-discipline-album/) | Fripp played on "I Zimbra"; Belew toured with Talking Heads then joined Crimson; UCR says Belew "sounds an awful lot like" Byrne | Reject, both directions: personnel, collaboration and a critic resemblance. No one says one band drew on the other. |
| `the-human-league -> king-crimson` | Martyn Ware Baker's Dozen: "We'd already been through the whole Eno and Fripp and No Pussyfooting thing" | Fripp & Eno's duo record, not King Crimson | Reject for King Crimson. It is arguably a Brian Eno point, already on the map. |
| `nirvana -> king-crimson` | Folklore that *Red* shaped *In Utero* or was in Cobain's CD player | Neither of Cobain's Far Out list pages names King Crimson; no source found | Reject as unsourced. Do not chase. |

### 1d. Searched, nothing found (one honest pass each; not settled)

- **Slint:** full *Life of the Record* transcript, Rolling Stone *Spiderland* oral history, FACT 2014 — no King Crimson. Only critic Will Hermes's *Tweez* comparison (per Wikipedia).
- **Squid:** Guitar.com, Loud and Quiet — none.
- **Geese:** DIY, Our Culture, Paste — none. DIY's headline says "Radiohead meets Yes".
- **This Heat** (Charles Hayward): Psychedelic Baby, Mack Hagood podcast page — none.
- **NoMeansNo:** Quietus, Vice — none.
- **No usable hit from one search each:** Tortoise, King Gizzard (an unverifiable claim about Joey Walker on a content-farm site), Black Country, New Road beyond Tyler Hyde, Unwound.
- **Not searched (budget):** Joy Division/New Order beyond Morris's Baker's Dozen, Mogwai beyond Braithwaite's, Flaming Lips beyond Coyne's, At the Drive-In, Ween, Hüsker Dü, toe, Mono.

## 2. King Crimson's own influences (`king-crimson -> X`)

**None on the map.** Fripp's documented influences, from Wikipedia's Robert Fripp page and many interviews, are all off-map:
- the Beatles (*Sgt. Pepper*, "A Day in the Life")
- Jimi Hendrix ("What would Jimi Hendrix have sounded like playing a Béla Bartók string quartet?")
- Bartók and Stravinsky
- John Mayall's Bluesbreakers
- Charlie Parker and Charles Mingus

Fripp has also said that in 1969 the band's main musical influences were its own members Ian McDonald and Michael Giles.

Later eras are personnel or collaboration, not influence:
- Belew from Talking Heads' touring band
- Fripp with Eno and Bowie

I found no Fripp statement naming the Velvet Underground or any other roster artist. Treat upstream as a real zero, like Bob Dylan's.

## 3. Denials (rejectedEdges candidates)

**None found.** No roster artist was found saying King Crimson did not influence them.

The nearest are not denials:
- Selway: "anything prog I probably rejected", which he then qualifies himself.
- PopMatters' critic: Radiohead "have never cited King Crimson". That is a critic's observation, now overtaken by Selway.

## 4. Placement proposal

**Note first:** `research/region-one-audit-DRAFT.md` (line 220) and its scope-guard list (line 306) recorded King Crimson as "explicitly out-of-scope" alongside Pink Floyd, Led Zeppelin and others. Adding it reverses that guard, which is the owner's decision. The case for it is 4-6 sourced first-person children, against zero for most classic-rock names.

**Proposed literal** (fields only; bio and album write-up come later):

```
{ id: 'king-crimson', name: 'King Crimson', layer: 'root', genres: ['art-rock'],
  scope: ['underground'], country: 'UK', activeFrom: 1968, realm: 'region-one',
  signatureSong: '21st Century Schizoid Man', classicAlbums: [ /* later pass */ ] }
```

- **`layer: 'root'`, `realm: 'region-one'`:** same as the Stooges and MC5 (British 1960s root, like the Stooges' US one). The Stooges get `realm` by backfill (`a.realm ?? 'region-one'`); MC5, a later addition, sets `realm: 'region-one'` explicitly. Do the same here.
  - Not `core`: core is the five foundational artists (`CORE_IDS`), and King Crimson's in-degree here wouldn't justify a sixth.
  - No `lineage`: region-one artists don't carry one.
- **`activeFrom: 1968`:** the band formed in London in late 1968; the first gig and the debut were 1969. Use 1969 if the map dates by first record.
- **`genres: ['art-rock']`:** `art-rock` (root, 1967) is the only existing fit; Radiohead and Wire already carry it. There is no `progressive-rock` genre. Adding one would move the whole `/genres` city and its features, so do it only as its own genre pass, as CLAUDE.md says for lineage changes.
  - Tagging `art-rock` also means adding King Crimson to the art-rock genre page's groups in `data/genre-pages.ts`: the test fails if a tagged artist is missing.
- **Scenes:** none (no room-together scene on the map fits).

**Major album: *In the Court of the Crimson King* (1969).** It is the record both of the strongest first-person children name (Newman and Pollard both list exactly this album), and the 1969 debut a `root` node should stand on. The alternative is *Red* (1974), which Tyler Hyde praises. Cline's record is *Larks' Tongues in Aspic*.

## 5. Traps met in this pass

- **Wikipedia added a band its own source doesn't name** (Greep's father's CDs: *The Face* says Genesis and Pink Floyd; Wikipedia adds King Crimson). This is the substitution failure CLAUDE.md describes for Grokipedia, arriving through a Wikipedia editor. Open the footnote.
- **Search summaries kept offering "secondhand" King Crimson links** that the pages didn't support: Cobain's *Red*, Gizzard's Joey Walker, St. Vincent "derived from Fripp". None survived reading.
- **Fripp-the-collaborator is not King Crimson.** Talking Heads, Bowie, Eno, the Roches, Peter Gabriel and Fripp & Eno all involve Fripp, not the band, and are personnel or collaboration in any case.
