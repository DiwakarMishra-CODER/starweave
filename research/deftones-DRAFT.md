# Deftones: Layer 1 research (DRAFT, 30 Oct 2026)

Research only. Nothing here is written to `seed-data.ts`, `edge-sources.json` or any code. Edge direction follows the data model: `source -> target` means source was influenced BY target.

## Tool status

- WebSearch: 21 calls used of the 25 allowed. Never refused or capped. (The pool is shared with another agent running at the same time.)
- WebFetch: 4 calls. One Spin page gave a 403 and was read through `r.jina.ai`.
- `scripts/source-pass/ledger.ts read`: every quote below was read on its page with this script, apart from the two WebFetch reads marked as such. The Quietus Baker's Dozen was read slide by slide (`/2/` to `/14/`). The 2011 Revolver list came from its Internet Archive copy. The 2020 Revolver interview 403'd directly and opened through the Internet Archive.
- No YouTube or video sources were opened.

## Roster correction

`research/source-pass/roster.txt` is out of date. **Hum and Silversun Pickups are no longer on the map.** Both were removed on 26 Oct 2026 as orphans (see the comment at `data/seed-data.ts` ~line 216 and commit 27c30ee). The live graph has 302 artists and 973 edges; I checked with `graphData`. Every other target id below is confirmed in the live `graphData`.

The Hum finding still matters, and it cuts the other way: **`deftones -> hum` is the source Hum was missing.** Adding Deftones lets Hum come back with a first-person link (see Placement).

---

## Upstream: who shaped Deftones

### Influence

| # | Edge | Source | Exact sentence (as read on the page) | Speaker | Tier | Conf. | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | `deftones -> hum` (Hum is off the map now, see above) | The Quietus, Baker's Dozen, "Beauty & Dirt: Chino Moreno's Favourite Albums", 23 Nov 2010, slide 7: https://thequietus.com/interviews/bakers-dozen/deftones-chino-interview-favourite-records/7/ | "This is a heavy record, and it's where Deftones get a big part of our influence from, tone-wise. There are these huge chords going on, a huge backbeat, rolling basslines going on underneath, a lot of that has directly inspired certain songs." Later in the same entry: "I knew I had to pick some records that inspired us that were older records, and this is one – I listen to this now and it's stood the test of time, and Deftones were definitely influenced by it." | Chino Moreno | first-person | 0.85 | **influence.** He names the record (*You'd Prefer an Astronaut*, 1995) and says it shaped the band's tone and songs. The order works: Around the Fur is 1997 and White Pony 2000. |
| 2 | `deftones -> my-bloody-valentine` | Revolver, "Deftones Frontman Chino Moreno Recommends Five Non-Metal Albums for Metalheads", Brandon Geist, 15 Jun 2011 (Internet Archive copy): https://web.archive.org/web/20130827093828/http://www.revolvermag.com/lists-2/five-non-metal-albums-that-rock-deftones-frontman-chino-moreno%E2%80%99s-world.html | "When were doing White Pony, I played Loveless for Terry; I was like, 'I want to get the record to sound like this!' After the first song, he looks over and goes, 'Are you kidding me? That's the most coked-out fucking mix I've ever heard!' It's just a wall of guitar, and it's beautiful for that reason." | Chino Moreno (Terry = producer Terry Date) | first-person | 0.85 | **influence.** This is owner lead #2 settled: he played *Loveless* (1991) to his producer as the model for White Pony (2000). That makes it more than a favourite. Kerrang!'s "12 bands who wouldn't be here without Deftones" quotes the same Revolver line. |
| 3 | `deftones -> the-cure` | Same Revolver 2011 list. The intro says these are albums "that he loves and that have influenced his music, both in the Deftones and in his side project Team Sleep". On *Pornography*: | "That's my favorite Cure record; lyrically, that record has influenced me through a lot of the things that I've done. I was like 15 and living with my Grandma, and one day I sat and listened to it and wrote out all the lyrics for the record." | Chino Moreno | first-person | 0.85 | **influence** (lyrics, formative years). Backed up by Stereogum, "We've Got A File On You: Chino Moreno", Michael Tedder, 13 Oct 2023 (https://stereogum.com/2238512/chino-moreno-deftones-crosses-team-sleep/interviews/weve-got-a-file-on-you): "I didn't start to sing until Deftones started. And then I would just try to figure it out. I was listening to the Cure and Morrissey. So I kind of brought that influence into metal, which didn't make sense really." Also there: "it's definitely come full circle from me being a kid and being inspired by him and the Cure in general, for my whole life and for my whole musical life, really." The Robert Smith collaborations (the Crosses track, the Black Stallion remix) are collaboration, not evidence for this link. |
| 4 | `deftones -> depeche-mode` | Rolling Stone, "Are Depeche Mode Metal's Biggest Secret Influence?", Kory Grow, 11 Aug 2015, page 2: https://www.rollingstone.com/music/music-features/are-depeche-mode-metals-biggest-secret-influence-56191/2/ | "I fought my way to the front to be against the barricade," he tells Rolling Stone. "I have a feeling it's what launched me into wanting to make music, just by seeing the energy. It was just something else, one of my fondest and greatest memories of coming of age." | Chino Moreno, on the World Violation tour, his first concert | first-person | 0.85 | **influence.** He ties it to wanting to make music. Page 4 of the same piece has him trying "Fly on the Windscreen" while making *Adrenaline*: "It was our first try at doing something not so typical for a heavy band." Also backed by Revolver 2020 (row 6). The DM covers ("To Have and to Hold", "Sweetest Perfection") don't count by themselves. Note: the Violator tour was 1990, and Chino was already in the band then (it formed in 1988). He still frames it as coming of age and as the start of wanting to make music, before any record came out (*Adrenaline*, 1995). |
| 5 | `deftones -> the-smiths` | NPR, "Deftones' Chino Moreno On Surviving, Evolving And Gore", 3 May 2016: https://www.npr.org/sections/therecord/2016/05/03/476636845/deftones-chino-moreno-on-surviving-evolving-and-gore | "I mean, even the fact that I was the singer in a metal band and my favorite band was like The Smiths or The Cure — the other guys in the band couldn't understand the music I liked at all. They introduced me to metal at that point, so were basically just figuring it all out while we were also creating music." | Chino Moreno | first-person | 0.8 | **influence.** By the owner's rule, being a fan counts here because he ties his favourite band to the years the band was forming and finding its sound. Backed by Stereogum 2023 ("And I was into that and the Smiths") and by NME, Andrew Trendell, 20 Jun 2020 (https://www.nme.com/features/deftones-white-pony-20-year-anniversary-interview-chvrches-fever-333-chino-radiohead-2692262), reported tier: "Forming in 1988, the band bonded over a love of The Cure, The Smiths, Depeche Mode…". Do NOT use the 2015 NME/FACT "Morrissey kick" quote for this link. That is about his **solo** records ("totally obsessing over his solo records") feeding *Gore*. The *Adrenaline*-era cover of "Please, Please, Please, Let Me Get What I Want" (owner lead #3) is a cover and doesn't count alone. |
| 6 | `deftones -> omd` and `deftones -> the-human-league` | Revolver, "Deftones Talk 'Ohms' Album of the Year Nod, 'Black Stallion,' Fave Music of 2020", Emma Madden, 11 Dec 2020 (Internet Archive copy: https://web.archive.org/web/2021/https://www.revolvermag.com/music/deftones-talk-ohms-album-year-nod-black-stallion-fave-music-2020) | "Also, all the early New Wave stuff, from OMD to Depeche Mode. That's always been my wheelhouse, stuff that bridges that gap between melodies and drumbeats. I remember the first time I heard the Thompson Twins or the Human League, the early records. It was so brand new to me because all of this early electronic music had all these romantic lyrics and things that, to me, sounded so odd, but really spoke to me and made sense. They've been a constant influence in pretty much all the music I've made throughout my life, I think." | Chino Moreno (the piece says "Revolver spoke to Chino Moreno") | first-person | 0.8 | **influence** for both. "They" covers OMD, Depeche Mode, the Thompson Twins and the Human League. It also backs up row 4. Thompson Twins aren't on the map. Slightly lower than 0.85 because the claim covers a group of bands rather than naming one. |
| 7 | `deftones -> portishead` | Same Revolver 2020 interview | Q: "WHAT ARTISTS IN PARTICULAR INFLUENCED YOU TO GET THAT ROCK-MEETS-TRIP-HOP SOUND ON WHITE PONY?" A: "DJ Shadow, of course, and even earlier stuff from the Nineties, like Portishead and other stuff that used drum samples from old records — all that breakbeat stuff, which to me, bridged the gap between early hip-hop music and music with melody." | Chino Moreno | first-person | 0.8 | **influence.** He names Portishead for a specific record. The order works: *Dummy* is 1994 and White Pony 2000. DJ Shadow isn't on the map. |
| 8 | `deftones -> radiohead` | ticketone.it magazine, "Deftones come i Radiohead? Grazie per il paragone, ma non credo" (Sept 2025): https://www.ticketone.it/magazine/news/deftones-come-i-radiohead-grazie-per-il-paragone-ma-non-credo. It reports, in Italian, Chino's July 2025 conversation with Zane Lowe (Apple Music). | "Onestamente, quella band è stata un'enorme influenza. Proprio oggi ho letto che sono passati 30... 28 anni da quando è uscito "OK Computer", quel disco è uscito mentre stavamo scrivendo "Around The Fur", o almeno quando uscì il singolo "Paranoid Android", il video del cartone animato e tutto il resto. Ricordo che eravamo in studio, stavamo letteralmente scrivendo "Around The Fur" e ho guardato sbalordito quel video per la prima volta, mi sono sentito come se la musica potesse essere qualsiasi cosa." (Roughly: "Honestly, that band was a huge influence… we were literally writing Around the Fur and I watched that video for the first time, stunned; I felt like music could be anything.") | Chino Moreno, in translation | reported (a translated secondary report of a video interview) | 0.65 | **influence, provisional.** The words are first-person, but I've only read them in an Italian translation on a ticket-seller's magazine. I didn't open the English original (the Zane Lowe video), and two searches found no English print copy. Ideally, open the Apple Music / Zane Lowe interview (July 2025) and upgrade to first-person 0.85. The order works: the "Paranoid Android" single came out in May 1997 and *Around the Fur* in Oct 1997. Not a denial: in The Irish Times (6 Sep 2025, https://www.irishtimes.com/culture/music/2025/09/06/deftones-i-definitely-think-weve-followed-the-madonna-model/) he only declines the "Radiohead of metal" *resemblance*: "I'm a big Radiohead fan… Do I think that we are? Not necessarily." That is a denial of sounding alike, not of influence, so it doesn't belong in `rejectedEdges`. |
| 9 | `deftones -> mogwai` | Revolver 2011 list (row 2). Intro framing: "non-metal albums that he loves and that have influenced his music, both in the Deftones and in his side project Team Sleep". On *EP+2*: | "I went to see Mogwai at the Fillmore, and that was both the loudest and quietest concert I've ever been to. They'll start from a teeny little melody, and then build this wall of delayed-out guitars—by the end of the song, the shit's caving your chest in! I love that extreme, combination of violent guitar shit and beautiful shit." | Chino Moreno; the "influenced his music" framing is the editor's (Brandon Geist) | reported | 0.6 | **influence, weaker.** Chino's own words are fandom. The link to the music comes from Revolver's framing, plus the obvious fit with "beauty and dirt", which he names as his own aim elsewhere. The order works: *EP+2* is 1999 and White Pony 2000. It would be fine to hold this one. |
| 10 | `deftones -> bad-brains` | encyclopedia.com (Gale, *Contemporary Musicians*), "Deftones": https://www.encyclopedia.com/education/news-wires-white-papers-and-books/deftones | "Vocalist Moreno claims that he was initially influenced by Bad Brains but lyrically inspired by Depeche Mode." | Gale's writer, reporting Moreno | reported | 0.55 | **influence, weak; hold until a better source turns up.** No interview is named. Wikipedia lists H.R. among his "biggest vocal influences" and cites a 2010 Banger TV video (Sam Dunn, "Raw & Uncut"; https://bangertv.com/deftones-chino-moreno-interviewed-about-vocal-influences-and-nu-metal-raw-uncut/), which I didn't watch. Saudade (2016, with Dr. Know) is a collaboration and isn't evidence. Touring with Bad Brains in 1996 isn't evidence either. |

### Favourites (real, but not tied to the music; don't write)

| Candidate | Source | Sentence | Why not |
|---|---|---|---|
| `deftones -> kraftwerk` | Interview Magazine, "Sound Advice", Ernesto Macias, 29 Mar 2023: https://interviewmagazine.com/music/chino-moreno-of-deftones-knows-what-song-theyre-playing-in-heaven | "Who most inspired your music taste? Kraftwerk. Most shit I love stems from them." (The magazine's intro calls this "the influence of Kraftwerk on his music".) | Borderline. His answer is about his *taste*, not his music-making. The tie to the music is only the magazine's paraphrase. Owner's call. If taste-origin counts, it's reported at 0.6. |
| `deftones -> brian-eno` | Quietus Baker's Dozen, slide 2 (*Small Craft on a Milk Sea*) | "Of course, we'd love to work with Eno one day." | A favourite from 2010, and a wish to collaborate. |
| `deftones -> interpol` | Baker's Dozen slide 6 (*Turn On the Bright Lights*) | "This is one of my favourite records to listen to on vinyl when I'm at home." | Favourite only. The record is from 2002, after the band's formative years, and he names no effect on Deftones. |
| `deftones -> tortoise` | Baker's Dozen slide 14 (*Standards*) | "I definitely feel an affinity with post rock groups like Tortoise, maybe people like Shellac as well." | "Affinity", not influence. *Standards* came out in 2001, after White Pony. |
| `deftones -> fugazi`, `deftones -> minor-threat` | Baker's Dozen slide 5 (on Girls Against Boys) | "They were from DC, where a lot of my favourite bands are from, like Fugazi, Minor Threat, these bands who started a lot of scenes in music." | A bare favourites mention. |
| `deftones -> mary-timony` (Helium) | Revolver 2011 list, on Helium's *No Guitars* | "Every morning, I'd wake up and listen to that CD… I was like, 'Damn! I want this girl to sing on our album!'" (Revolver adds: "Mary Timony appears on Team Sleep's self-titled debut".) | Fandom that led to a **collaboration** on a side project. Neither counts as influence on Deftones. Reject. |

### Reject

| Candidate | Why |
|---|---|
| `deftones -> cocteau-twins` (owner lead #3) | The only evidence is the "Wax and Wane" cover (B-Sides & Rarities, 2005) and Apple Music's **editorial** artist bio ("citing influences ranging from … My Bloody Valentine, and Cocteau Twins"). The Apple bio is excluded, the same as the Apple "Influences" playlists. The nearest first-person line points the other way. NPR 2016: "If anything, while we're writing a song if someone says something like, 'Oh, that sounds like Cocteau Twins' or something, then it kind of deters us from doing it". Stereogum 2023 says only that Stephen "didn't really listen to My Bloody Valentine or Cocteau Twins", which implies Chino did but never says they shaped him. Hold until a real statement is found. |
| `deftones -> sonic-youth`, `-> bjork`, `-> slowdive`, `-> the-jesus-and-mary-chain` | Nothing found. Stereogum's long 2023 interview names none of them. Wikipedia's long "Other inspirations" list in the Chino Moreno article is marked `[citation needed]` and isn't usable. |
| Duran Duran, Weezer, Faith No More, Helmet, Jawbox, Smashing Pumpkins, Sade, Prince, Morrissey (solo), Girls Against Boys, DJ Shadow, Thompson Twins | Not on the map. For the record: the Smashing Pumpkins (Revolver 2011: Corgan "definitely influenced Team Sleep in the beginning") and Weezer (NME "Soundtrack of My Life", 2016: "we used to soundcheck to that whole record") would be real candidates if they're ever added. |

Not usable as citations (noted so nobody re-reads them): the Yamaha artist bio (adapted from Wikipedia: "Chino Moreno's influences spawn from such bands as The Cure, Duran Duran, Depeche Mode and Weezer"); the many content-farm "Chino Moreno" pages that come up in search (hawaii.gov, cuhk.edu.hk, seoscout and similar); Shazam/last.fm bios.

---

## Downstream: who on the map says Deftones shaped them

| # | Edge | Source | Exact sentence | Speaker | Tier | Conf. | Verdict |
|---|---|---|---|---|---|---|---|
| D1 | `fontaines-dc -> deftones` | Guitar World, "'Shredding is an amazing thing…': Conor Curley of Fontaines D.C. on his love of Deftones and why he's writing riffs like a beginner", 2024 (*Romance* era): https://guitarworld.com/artists/guitarists/conor-curley-fontaines-dc-romance | "One of the ideas for this record was to not rely on such a reverb-y guitar sound. That changes how you play, and I was a lot more inspired by early 2000s, heavier rock music like Deftones. When we were teenagers, that was the big guitar sound, and it was exciting to have a more modern, digital feel, rather than the 'in the room'-type sound that we'd been trying in the past." | Conor Curley (guitar) | first-person | 0.85 | **influence.** It's tied to one record (*Romance*, 2024) and to the band members' teenage years. Backed by Monster Children, Naz Kawakami, 2024 (https://www.monsterchildren.com/articles/carlos-oconnel-on-fontaines-dcs-new-album-romance), Carlos O'Connell: "We can still be as excited about the music that we were excited about as teenagers, today… so we went back to being really excited by bands like Korn, Deftones, Alice In Chains, Nirvana." Louder's review says the same in its own words (critic). Wikipedia says "Starburster" had O'Connell "inspired by Deftones and Alice in Chains"; don't cite that. |
| D2 | `wolf-alice -> deftones` | NME, "Wolf Alice interview on their eagerly awaited debut album…", 2015: https://www.nme.com/features/wolf-alice-interview-on-their-eagerly-awaited-debut-album-the-simpsons-life-lessons-and-not-wanting-319 | "Their soft-loud seems to come from a different place to that of the Pixies or Nirvana, driven by the sheer taste clashes of the various members. This, after all, is a band who, as Joff points out, 'are into both Deftones and Miley Cyrus'." | Joff Oddie (the quote) and the NME writer (the link to their sound) | critic/reported | 0.45 | **favourite, hold.** The band only says they're "into" Deftones. The link to their soft-loud sound is the journalist's. |

### Downstream: searched, nothing found

Jane Remover (artist name, plus the *Census Designated* album title); Ethel Cain (search, plus Rolling Stone 2023, Crack 2022 cover story and Nylon, all read for "Deftones"); Turnstile (search, plus NME 2022 cover, Crack, Spin Artist of the Year 2021 and an Antimatter interview, all read); yeule (search, plus Clash, FLOOD and DIY softscars interviews, all read); Wednesday / Karly Hartzman; underscores; Silversun Pickups (off the map anyway). Caroline Polachek: only Chino's 2020 remix work on "Hit Me Where It Hurts" turned up. That is collaboration and can't be an edge in either direction.

Not searched (budget): Snail Mail, Japanese Breakfast, Alex G, Car Seat Headrest, Parannoul, Have A Nice Life, Deerhunter, beabadoobee, IDLES, Brand New, La Dispute, George Clanton, Porter Robinson. The most-documented Deftones descendants are all off the map: Nothing, Deafheaven, Loathe, Fightstar/Charlie Simpson, Architects, Karnivool, Slipknot, Suicide Silence, Linkin Park (Mike Shinoda, Spin 2020), Sleigh Bells' Derek Miller, CHVRCHES. If the owner wants more downstream, Snail Mail and Parannoul are the best next tries. Search their own interviews with an album title in the query.

## Denials

None found. Chino's Irish Times line on Radiohead (row 8) declines the resemblance, not the influence, so it is not a `rejectedEdges` entry. The Stereogum 2023 remark that Stephen Carpenter "didn't really listen to My Bloody Valentine or Cocteau Twins" is about Stephen's listening. It denies nothing.

---

## Placement proposal

**Realm and layer.** I recommend `realm` omitted (region-one), `layer: 'shoegaze-dreampop'`, `country: 'US'`, `activeFrom: 1988`. This is how the map already handles American bands whose case for being here is their shoegaze/dream-pop side: Deerhunter (US) and Sweet Trip (US) both sit in region-one as `shoegaze-dreampop` with no realm, and Wolf Alice (UK, `['shoegaze','alt-rock']`) is the closest equivalent. Deftones' sourced upstream also sits mostly in region-one: the Cure, the Smiths, My Bloody Valentine and Radiohead. The rest is Depeche Mode, OMD, the Human League and Portishead in electronic, plus Mogwai in post-rock.

Alternative: `realm: 'american-underground'`, `lineage: 'noise-alt'`. That is where Hum sat before it was removed, and Mudhoney (`['grunge','noise-rock','punk']`) is set up that way. It puts Deftones beside Hum geographically. But the noise-alt neighbourhood (Dinosaur Jr., Mudhoney) isn't where the band's sourced network is, and it reads Deftones as grunge-adjacent alt-metal, which is the reading the owner wants to avoid.

**Genres.** I propose `['alt-rock', 'shoegaze']`. Both ids exist. There is no metal genre, so none is needed.
- `alt-rock`: add `deftones` to the section "Alt-rock as marketing category, 1997–2010s" in `data/genre-pages.ts` (`'alt-rock'`, ~line 2907; currently radiohead, the-strokes, the-white-stripes, the-flaming-lips). White Pony (2000) fits that era exactly.
- `shoegaze`: add to the "Modern torchbearers" section (`shoegaze`, ~line 120). **One thing to weigh first:** the shoegaze page's own comment left Hum out as "space rock/alt-metal with shoegaze color, not the genre itself". The same argument could be made against Deftones. If the owner agrees with it, tag `['alt-rock', 'dream-pop']` or `alt-rock` alone, and let the MBV and Hum edges carry the shoegaze connection. Whichever is chosen, the test requires every tagged artist to appear in that genre page's groups.
- `trip-hop` was considered and not proposed. Portishead is an influence on White Pony, but Deftones isn't a trip-hop band.

**Major album.** *White Pony* (2000). It is the record where the shoegaze and trip-hop side came through. Chino played *Loveless* to Terry Date as the model for it, and he names Portishead and DJ Shadow for its rock-meets-trip-hop sound, so it's the album the edges above are about. A possible `signatureSong`: "Change (In the House of Flies)" (White Pony), or "Be Quiet and Drive (Far Away)" (1997), which Stereogum calls the moment heavy music and shoegaze/dream-pop first met.

**Hum comes back with it.** `deftones -> hum` is first-person at 0.85 (Quietus 2010). Hum was removed on 26 Oct only because none of its links had a source. If Deftones is added, Hum's old literal can be restored from git history (before 27c30ee: `american-underground` / `noise-alt`), with this edge as its sourced link. Hum's own old upstream links stay out unless they are re-sourced.

## Summary of proposed edges

| Edge | Tier | Conf. | Verdict |
|---|---|---|---|
| deftones -> hum (with Hum restored) | first-person | 0.85 | influence |
| deftones -> my-bloody-valentine | first-person | 0.85 | influence |
| deftones -> the-cure | first-person | 0.85 | influence |
| deftones -> depeche-mode | first-person | 0.85 | influence |
| deftones -> the-smiths | first-person | 0.8 | influence |
| deftones -> omd | first-person | 0.8 | influence |
| deftones -> the-human-league | first-person | 0.8 | influence |
| deftones -> portishead | first-person | 0.8 | influence |
| deftones -> radiohead | reported (translated) | 0.65 | influence, provisional |
| deftones -> mogwai | reported | 0.6 | influence, weaker (could hold) |
| deftones -> bad-brains | reported | 0.55 | hold |
| deftones -> kraftwerk | reported | (0.6) | owner's call (taste vs music) |
| fontaines-dc -> deftones | first-person | 0.85 | influence |
| wolf-alice -> deftones | critic/reported | 0.45 | favourite, hold |
| deftones -> cocteau-twins, brian-eno, interpol, tortoise, fugazi, minor-threat, mary-timony | — | — | favourite / cover / collaboration: don't write |

## Update (30 Oct 2026): `deftones -> radiohead` resolved, first-person, 0.8

The owner found the English original: Zane Lowe's interview with Chino
Moreno, https://www.youtube.com/watch?v=Z__YyKbkZmY at 41:48-43:10, and sent
the video's own transcript (it carries YouTube's `[__]` bleep mark). It
corrects the Italian write-up: "that band was a huge influence" is **Zane
Lowe's** line, not Chino's. Chino's own words carry the link anyway:

> "I remember we were in the studio literally writing Around the Fur and
> watching that video for the first time and just having my mind blown, like
> how music can be anything... I was already in love with The Bends, it's
> probably one of my favorite records... when I watched them do that, I was
> like, 'You know, we could do anything,' right?"

Tied to Deftones' own records (Around the Fur, then White Pony). Chronology:
OK Computer June 1997; Around the Fur October 1997. Captions could not be
re-fetched here (YouTube's bot wall); the ledger entry should say the
transcript came from the owner.
