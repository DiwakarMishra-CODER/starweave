# Heavy strand: The Dillinger Escape Plan, Converge, Mr. Bungle (Layer 1 research, DRAFT)

Research only. Nothing here is written to `data/seed-data.ts`, `data/edge-sources.json` or any code.
Scope (owner, 31 Oct 2026): Dillinger, Converge and Mr. Bungle only. NAILS and Knocked Loose were dropped mid-pass and not researched.

## Tool status

- WebSearch: 18 of the 25 allowed searches used. All worked. Every search summary was treated as a lead only; every quote below was read on the page that carries it (fetched with curl, `r.jina.ai`, or `scripts/source-pass/ledger.ts read`).
- WebFetch: not used. Pages were fetched with curl / `r.jina.ai` so the exact sentence could be grepped from raw text.
- Walls hit: Guitar World "Art of Shredding: Benjamin Weinman" (now a tag page; the Wayback copies returned no article text). The Rockpit 2015 Weinman interview (archive copy unreadable). negele.org 1992 *Guitar Magazine* "Get the Funk Out" (dead; the archive.today copy would not render through jina). therockfather.com 1992 Patton cable-access interview (404). These are listed under leads for the owner.
- YouTube was not fetched (bot wall). Video leads are listed with URLs and timestamps.
- Free local sources checked first. Nothing in `research/source-pass/off-map.json`, `bakers-dozen/off-map-tally.json`, the Baker's Dozen picks or the series files names any of the three bands as an influence. Cached pages mention only covers and touring: Converge covering Depeche Mode (Rolling Stone), Dillinger with Chino on "Behind the Wheel", Puciato singing "Passenger" with Deftones. None of these is influence.
- Roster ids were checked against `data/seed-data.ts` directly (305 artists at time of writing), not against the stale `roster.txt`.

---

## 1. The Dillinger Escape Plan (`the-dillinger-escape-plan`, US, formed 1997; *Calculating Infinity* 1999)

### Upstream: links to artists on the map

| # | Link | Source | Exact sentence(s) | Speaker | Tier | Conf. | Verdict |
|---|---|---|---|---|---|---|---|
| D1 | dillinger -> **bad-brains** | Machine Music, "Pillars of the 90s: An Interview With The Dillinger Escape Plan", 15 Apr 2021. https://machinemusic.net/2021/04/15/pillars-of-the-90s-an-interview-with-the-dillinger-escape-plan/ | "For me, it was about being punk and energetic and bringing to people what seemed to be the feeling and experience that people were getting from the original hardcore bands like Bad Brains and Black Flag. And I knew that in order to do that we had to create music that was pushing things way farther than those bands did in order to give people the same feeling that people got when they first saw those bands for the first time." | Ben Weinman (founder, guitar) | first-person | 0.85 | **influence**. He names them as the model for what Dillinger was built to do, in the *Calculating Infinity* era. |
| D2 | dillinger -> **black-flag** | same page, same sentence | (as D1) | Ben Weinman | first-person | 0.85 | **influence**. Same reason. |
| D3 | dillinger -> **mr-bungle** | Mondo Sonoro, "Mr. Bungle, rock alternativo experimental (Primera parte)", Adriano Mazzeo, 11 Jul 2019 (Spanish; the interview answers are printed in Spanish translation). https://www.mondosonoro.com/blog-musica/california-mr-bungle-especial/ (archive: https://web.archive.org/web/20200605033618/https://www.mondosonoro.com/blog-musica/california-mr-bungle-especial/) | Q: "¿En qué aspectos de The Dillinger Escape Plan tuvieron mayor influencia Mr. Bungle?" A: "En nuestra sed de diversidad y en la ironía en nuestra música. También estábamos muy influenciados por la forma en que manejaban la administración de sus giras." Also: "Mr. Bungle fueron una gran inspiración para nosotros y Patton es mi cantante favorito de todos los tiempos." And on *California*: "Más tarde escribí una canción llamada 'Unretrofied' que fue un homenaje a esa canción [‘Retrovertigo’]". (Translation: "In our thirst for diversity and the irony in our music. We were also very influenced by the way they ran their touring." / "Mr. Bungle were a great inspiration to us and Patton is my favourite singer of all time." / "Later I wrote a song called 'Unretrofied' that was a tribute to that song.") | Ben Weinman | first-person | 0.85 | **influence**. He names what in Dillinger's music Bungle shaped, plus a song written as an homage ("Unretrofied", *Miss Machine*, 2004, after *California*, 1999). The touring and opening-slot story is touring and isn't counted. The musical answer stands on its own. |
| D4 | dillinger -> **fugazi** | The Skinny, "Under the Influence: Dillinger Escape Plan's Ben Weinman", 30 Oct 2013. https://www.theskinny.co.uk/music/features/306232-under_influence_dillinger_escape_plans_ben_weinman (redirects to /music/playlists/under-the-influence-dillinger-escape-plans-ben-weinman) | Standfirst: "The Dillinger Escape Plan's maverick founder unearths the ten LPs that sculpted his unique guitar-playing style". No. 1, *Repeater*: "Repeater was a record that was meant to be performed. And no band put on a better show then Fugazi." | Ben Weinman (the standfirst is the magazine's) | first-person | 0.75 | **influence**. He picked it for a list of records that shaped his playing. His comment is about Fugazi's live show, which is Dillinger's own calling card. A little below 0.85 because the "shaped" framing comes from the series, not from his sentence. |
| D5 | dillinger -> **king-crimson** | same page | No. 6, *In the Court of the Crimson King*: "This band represented a time when music truly had no boundaries When this came out it was the equivalent of Calculating Infinity being on pop radio and in the top 10." | Ben Weinman | first-person | 0.75 | **influence**. Picked for the same list, and he measures it against his own record. Wikipedia's Weinman page also names Robert Fripp among his "biggest influences". That rests on a 2004 Metal Injection video (see leads), not read here. |
| D6 | dillinger -> **radiohead** | same page | No. 8, *OK Computer*: "When Radiohead put out this record, music was simply changed forever. If it wasn't for OK Computer there would be zero worth to popular music right now. It influenced absolutely everything that people are hearing in the music of the moment." | Ben Weinman | first-person | 0.65 | **influence (weaker)**. It's on the same list, but his comment is about Radiohead's effect on music at large, not on him. Chronology holds (May 1997, before *Calculating Infinity*, 1999). |
| D7 | dillinger -> **depeche-mode** | Machine Music 2021 (as D1) | "seeing Depeche Mode during the violator tour was the first time I really got really obsessed with a band." ... "I'm sure melodically it inspired me and definitely culturally. I loved everything about them." | Ben Weinman | first-person | 0.75 | **influence**. Formative (aged ~15-16), and he says it inspired him melodically. He also says the band couldn't follow its production ("All I had was a four track and the guitar"), hence 0.75 rather than 0.85. |
| D8 | dillinger -> the-cure, siouxsie-and-the-banshees | Machine Music 2021 | "So it wasn't long before I started going from Depeche Mode and The Cure, and Siouxsie and the Banshees, and things like that, into stuff like Ministry and some of the heavier stuff, Nine Inch Nails..." | Ben Weinman | first-person | — | **favourite / formative listening only**. A listening path with nothing tied to Dillinger's music. Not proposed. |
| D9 | dillinger -> my-bloody-valentine, slowdive, ride | Lambgoat, Greg Puciato fan Q&A, 18 Oct 2005. https://lambgoat.com/features/interviews/71/ | "I really like a lot of shoegazery shit like My Bloody Valentine, Slowdive, Ride, things like that, which Team Sleep seems to be into as well." | Greg Puciato (vocals 2001-2017) | first-person | — | **favourite**. Bare liking, said while talking about a possible Chino Moreno collaboration. Under the 26 Oct ruling ("kept listening ... while making their own music") the owner could choose to count it. I'd hold it unless he wants the shoegaze bridge. |
| D10 | dillinger -> **aphex-twin** | Penny Black Music, Chris Pennie interview (c. 2002). https://pennyblackmusic.co.uk/Home/Details?Id=11153 | "We did it as a personal thing. We wanted to tackle something that was basically electronic music ... For me personally, playing drums, that('Come to Daddy')'s like a whole different spectrum of music, because the guy's programming. ... I just wanted to have the challenge of playing that" | Chris Pennie (drums) | first-person | — | **reject (cover)**. This is about the reason for the cover, not an influence on Dillinger's own writing. Puciato's 2005 Lambgoat answers name Aphex Twin only as a band he'd like to tour with ("1987 Michael Jackson, Aphex Twin, 1987 Metallica") and say they never got permission for the cover. Both are favourites at most. |

**Aphex Twin, searched, nothing found.** Three searches plus reads of Penny Black, Lambgoat 2005, Portland Mercury, The Skinny, Machine Music and Far Out's "influence of Aphex Twin" piece turned up no interview where Puciato or Weinman ties Aphex Twin or IDM to Dillinger's writing (*Miss Machine* / *Ire Works*). Every hit was the cover. Leave `dillinger -> aphex-twin` unwritten unless the owner knows the specific interview.

**Downstream on the map: searched, nothing found.** No artist on the map was found naming Dillinger. Chino Moreno's Stereogum "We've Got A File On You" covers only Puciato singing "Passenger" on stage, which is a collaboration.

**Denials:** none found.

**Weinman's "biggest influences" (Wikipedia, `Ben_Weinman`):** McLaughlin, Fripp, Greg Ginn, Stevie Ray Vaughan, Marty Friedman, Steve Vai. The cites are a 2004 Metal Injection video (https://www.youtube.com/watch?v=UsJxfjC5DiY, 3:13-3:34; ghostarchive copy https://ghostarchive.org/varchive/youtube/20211212/UsJxfjC5DiY) and Guitar World's "Art of Shredding" (Dec 2010; https://web.archive.org/web/20180402061202/https://www.guitarworld.com/features/art-shredding-benjamin-weinman, which wouldn't render as text here). Fripp backs D5 and Ginn backs D2. The owner can check the video timestamp in a browser.

**No-orphans bar: CLEARS.** D1, D2, D3, D4, D5 and D7 are solid, D6 is weaker. Six or seven links, all upstream.

---

## 2. Converge (`converge`, US, Salem MA, formed 1990; *Halo in a Haystack* 1994, *Jane Doe* 2001)

### Upstream: links to artists on the map

| # | Link | Source | Exact sentence(s) | Speaker | Tier | Conf. | Verdict |
|---|---|---|---|---|---|---|---|
| C1 | converge -> **the-cure** | The Quietus, Baker's Dozen, "Ritual Listens: Jacob Bannon's Favourite Albums", Dan Franklin, 10 Jun 2026, No. 6 *Disintegration*. https://thequietus.com/interviews/bakers-dozen/jacob-bannon-converge-favourite-albums-interview-bakers-dozen/7/ | "When I heard that record, it made me feel like it was okay to do that – where I could write from a personal perspective and not feel like the world was going to end" ... "that was really the album that specifically got me and really opened my eyes to that band and how they were doing things, and it definitely shaped the way we are as a band." | Jacob Bannon (vocals) | first-person | 0.85 | **influence**. Stated outright for the band. *Disintegration* (1989) predates Converge (1990), and he heard it in high school. Loudersound (https://www.loudersound.com/bands-artists/converge-jacob-bannon-on-the-80s-alt-rock-album-that-changed-his-life) re-reports the same quote. Converge also covered "Disintegration" for the 2000 tribute *Disintegrate*, which supports the link but isn't evidence on its own. |
| C2 | converge -> **black-flag** | Westword, "Jacob Bannon on the accessibility of Converge's music: 'We're not made for first-level listeners'", 8 Dec 2011. https://www.westword.com/music/jacob-bannon-on-the-accessibility-of-converges-music-were-not-made-for-first-level-listeners-5673267 | Q: "Was that album [Damaged] and Black Flag an influence on what you've done in any way?" A: "Oh definitely. Any early punk and hardcore, especially the work ethic that I personally have and that I know, collectively, my band members have, is something that's inspired by people like early Black Flag members and bands that went out and had to really fight to get paid and fight for respect." | Jacob Bannon | first-person | 0.8 | **influence**. "Oh definitely", although the question leads. Supported by Kurt Ballou (Lambgoat 2005, https://lambgoat.com/features/interviews/74/Kurt-Ballou---Converge-interview): "I think we've gone back to the roots of our original influences, by creating much more raw, less-polished punk records. ... You know Black Flag would have sounded worse as a produced band". Also Bannon (Lambgoat 2008, https://lambgoat.com/features/interviews/123/converge-interview/) on the song "You Fail Me": "[the song] was more like weird, later-era Black Flag". Converge covered "Annihilate This Week" (Lambgoat 2002), which is a cover and not counted. |
| C3 | converge -> **drive-like-jehu** | Vice/Noisey, "Rank Your Records: Converge's Jacob Bannon Reflects on the Seminal Hardcore Band's Eight Albums", 2017. https://www.vice.com/en/article/rank-your-records-converge-jacob-bannon | "Even when we were a five-piece and Aaron Dalbec [of Bane] was in our band, Aaron was more of a straightedge hardcore guy. ... He wasn't listening to Drive Like Jehu at the time. He wasn't listening to some of the noise-rock bands that Kurt [Ballou, Converge guitarist] and I were starting to get into, or the DC stuff that we were obsessed with. So you had a player that was playing the same songs but was coming from an entirely different viewpoint on those songs. And you almost hear that in the songs." | Jacob Bannon | first-person | 0.75 | **influence**. Bannon and Ballou were into Drive Like Jehu while writing the mid-90s records, and he says you can hear what they were each listening to in the songs. Chronology: Jehu's first LP was 1991 and *Yank Crime* 1994, before *Petitioning the Empty Sky*, 1996. It names Jehu only by contrast with Dalbec, hence 0.75. "The DC stuff" (Dischord) names no band, so it can't carry a Fugazi or Minor Threat link. |
| C4 | converge -> **sex-pistols** | Kerrang!, Kurt Ballou interview on *Hum Of Hurt*, 2026. https://www.kerrang.com/kurt-ballou-converge-interview-hum-of-hurt-hardcore | "I got into the stuff that The Dead Milkmen or The Meatmen were doing, maybe S.O.D. too, and I guess the Sex Pistols to a degree. But yeah, my initial interest generally came from that destructive, chaotic boy energy, which metal fits so well." | Kurt Ballou (guitar) | first-person | 0.5 | **weak / favourite**. Formative listening, but hedged ("I guess ... to a degree") and not tied to Converge's music. Not proposed. |
| C5 | converge -> red-house-painters | Quietus Baker's Dozen (as C1), No. 12, Sun Kil Moon *Benji*. https://thequietus.com/interviews/bakers-dozen/jacob-bannon-converge-favourite-albums-interview-bakers-dozen/13/ | "I've been a mark for Mark Kozelek and originally Red House Painters since college. I had some friends that were really into Red House Painters at the time, and I gave it a chance, and it really connected with me." | Jacob Bannon | first-person | — | **favourite**. Personal listening (the pick is *Benji*, 2014, and Sun Kil Moon isn't on the map), with nothing tied to Converge's music. Not proposed. |

Bannon's other Baker's Dozen picks (Slayer, Judas Priest, Alice Cooper, Black Sabbath, Neurosis, Only Living Witness, Leeway, Cro-Mags, Sheer Terror, Sinéad O'Connor, Chromatics) aren't on the map. Ballou's "founding fathers of the stuff we do" (Kerrang! 2026) are Rorschach and Born Against, also off the map.

**Downstream on the map: searched, nothing found.** Three searches covered Turnstile/Brendan Yates, La Dispute, Jeff Rosenstock, Brand New, Refused and black midi with Converge/*Jane Doe*. None had a first-person citation. Puciato's "I like a lot of people we've gotten to play with in the past like Converge and Mastodon" (Lambgoat 2005) is touring-peer liking, rejected.

**Denials:** none found.

**To check by transcript:** Converge on Amoeba's *What's In My Bag?*, https://www.youtube.com/watch?v=BgWeiEQh69Y (not fetched; YouTube is bot-walled). The band picks records and talks about them, so it may give more first-person upstream links.

**No-orphans bar: CLEARS.** C1 and C2 are strong, C3 good.

---

## 3. Mr. Bungle (`mr-bungle`, US, Eureka CA, formed 1985; *Mr. Bungle* 1991, *Disco Volante* 1995, *California* 1999)

### Downstream: links from artists on the map, or from one of these three

| # | Link | Source | Verdict |
|---|---|---|---|
| B1 | the-dillinger-escape-plan -> **mr-bungle** | D3 above (Weinman, Mondo Sonoro 2019) | **influence, 0.85, first-person**. Mr. Bungle's link, live only if Dillinger is added. |
| B2 | black-midi -> mr-bungle | Search summary of a *Hellfire* review: the music "brings to mind Mr. Bungle and Fred Frith more so than the King Crimson-isms" | **reject (critic resemblance)**. No Greep/black midi first-person statement found. |
| B3 | deftones -> mr-bungle | searched, nothing found | Wikipedia's Patton page lists Deftones among bands citing *Patton* as an influence. That's Patton, not Bungle, and isn't sourced here. Not proposed. |
| B4 | 100-gecs, xiu-xiu, black-country-new-road, squid, geese -> mr-bungle | searched, nothing found | — |

### Upstream: links to artists on the map

| # | Link | Source | Verdict |
|---|---|---|---|
| B5 | mr-bungle -> **nomeansno** | Wikipedia (`Mike_Patton`): "In 1992, he cited Nomeansno and The Residents as influences", citing Lee Sherman, "Faith No More: Get the Funk Out", *Guitar Magazine*, Sep 1992 (dead negele.org page; archive.today copy: https://archive.today/20120730033501/http://negele.org/db/index.php3?band=2&year=1992&month=9&id=1079). Photo caption citing *Decibel* #101 (Mar 2013), "Smooth Operator": "The members of Mr. Bungle often traveled to watch Nomeansno play live." | **unverified, promising**. The underlying page couldn't be opened here (dead, and archive.today wouldn't render through jina), so no sentence was read. If the owner opens the archive.today link and Patton names NoMeansNo, this becomes Bungle's own upstream link at ~0.8. It would also be the 1992 Bungle-era Patton speaking (the band's first record came out in 1991). NoMeansNo is on the map (emo-posthardcore / post-hardcore, 1979). |
| B6 | mr-bungle -> **bad-brains** | Wikipedia (`Mike_Patton`): asked about influences and favourite singers in 1992, Patton named "H.R. from the Bad Brains", among others. The cite is a 1992 ZTV cable-access interview posted at therockfather.com (now 404). | **unverified**. Video-only, page gone. Even if found, it's Patton's vocal influence rather than Bungle's, so I'd count it only if the owner wants Patton to speak for Bungle here. |
| B7 | mr-bungle -> sigur-ros, scott-walker, leonard-cohen, bob-dylan | Wikipedia (Patton): Sigur Rós (2006), Cohen/Dylan (2019) | **reject**. These are Patton personally, long after Bungle's 1985-2000 run, and not tied to Bungle's music. A search on Patton and Scott Walker found nothing. |
| B8 | Bungle's documented upstream (Slayer, Mercyful Fate, The Specials, Fishbone, Oingo Boingo, Zappa, Zorn's Naked City, Venom, Possessed, Corrosion of Conformity) | Spruance quoted in Wikipedia (`Mr._Bungle`); Trevor Dunn, FNM Followers "Mr. Bungle 30" interview (https://www.fnmfollowers.com/post/mr-bungle-30-trevor-dunn-interview): "We were all appreciative of Naked City, Spillane and Spy Vs Spy" | **none on the map**. That's why Bungle's own upstream is thin. Spruance (eonmusic, Jan 2021) credits Anthrax's Scott Ian as "the guy that probably inspired us the most, with the guitar sound" (Anthrax is off the map). |

**Denials:** none found.

**No-orphans bar: CLEARS ONLY TOGETHER WITH DILLINGER** (via B1). Its own upstream (B5) needs the owner to open one archived page. If Dillinger isn't added, hold Mr. Bungle.

---

## Links among the three

- dillinger -> mr-bungle: **yes, 0.85** (D3/B1).
- dillinger <-> converge: **none**. Puciato's liking of Converge as a tour-mate (Lambgoat 2005) is a peer, not influence. No Converge member was found naming Dillinger. Contemporaries on the same circuit.
- converge <-> mr-bungle: none found.

## Placement proposals

### The Dillinger Escape Plan
- Realm **emo-posthardcore**, lineage **math-rock** (mathcore). Its links run to hardcore-roots (Black Flag, Bad Brains, Fugazi) and region-one roots (King Crimson), like Drive Like Jehu and At the Drive-In. `layer: 'outside'` (the structural placeholder Refused, Jesus Lizard and toe use). Country US, activeFrom 1997.
- Genres **`['math-rock', 'hardcore-punk']`**, matching At the Drive-In (`post-hardcore, math-rock`) and Refused (`post-hardcore, hardcore-punk`). `post-hardcore` is defensible too. Tagging means adding the band to a section's `artistIds` in `data/genre-pages.ts` for each genre. For math-rock, the "Global and later variations" group (with toe, black midi, Pinback) fits, or a new short "Into mathcore" group if the owner wants the heavy strand named.
- Major album: ***Calculating Infinity* (1999)**. It's the record Weinman measures King Crimson against, the one the Machine Music "Pillars" interview is about, and the founding mathcore LP. (The owner's mixtape plays "Prancer" from *One of Us Is the Killer*, 2013. That could be the signature song while keeping *Calculating Infinity* as the major album, or the owner may prefer the 2013 record.)
- Knock-on: `data/about.ts` treats Dillinger as off-map (the `prancer` entry uses `artistName` and says "The Dillinger Escape Plan aren't on the map"; `ONE_FAMILY.loud` uses `bandName`). If Dillinger is added, those should switch to `artistId` in the same pass, and the about-tape tests may need updating.

### Converge
- Realm **emo-posthardcore**, lineage **post-hardcore** (like Refused, a hardcore band whose links run to post-punk and noise-rock). `hardcore-roots` is the alternative (Turnstile sits there). `layer: 'outside'`, US, activeFrom 1990.
- Genres **`['hardcore-punk', 'post-hardcore']`**, the same pair as Refused. Add to the matching `artistIds` groups in `data/genre-pages.ts` on both genre pages.
- Major album: ***Jane Doe* (2001)**, the record the Quietus calls a "near-unlistenably intense genre classic" and the one every retrospective treats as the turn to metallic hardcore.

### Mr. Bungle (only if Dillinger is added)
- The strand option: realm **emo-posthardcore**, lineage **math-rock**, next to Dillinger, its only confirmed link. The alternative is **american-underground / noise-alt** beside Ween, the closest comparable (absurdist, genre-hopping, major-label 90s), if the owner would rather keep emo-posthardcore strictly hardcore-descended. The map has no metal or avant-garde-metal genre, so either way Bungle sits slightly off its true family.
- Genres: **`['art-rock']`** (black midi and King Crimson carry it), optionally `experimental-pop` (Ween's tag, fits *California*). Each needs Bungle added to a group in `data/genre-pages.ts`.
- Major album: ***California* (1999)**. It's the record Weinman names: Dillinger opened its tour, and "Retrovertigo" led to Dillinger's "Unretrofied". It's also Bungle's most-praised record.

## Leads for the owner (not followed up)

1. Converge, Amoeba *What's In My Bag?*: https://www.youtube.com/watch?v=BgWeiEQh69Y (transcript when captions can be fetched).
2. Mr. Bungle -> NoMeansNo: open https://archive.today/20120730033501/http://negele.org/db/index.php3?band=2&year=1992&month=9&id=1079 (*Guitar Magazine*, Sep 1992, "Get the Funk Out") and look for Patton naming NoMeansNo / the Residents. *Decibel* #101 (Mar 2013) "Smooth Operator" is print-only.
3. Weinman's influences video: Metal Injection 2004, https://www.youtube.com/watch?v=UsJxfjC5DiY at 3:13-3:34 (Fripp, Greg Ginn named per Wikipedia).
4. Guitar World, "The Record That Changed My Life: Ben Weinman ... 'Apocalypse' by the Mahavishnu Orchestra" (22 Jul 2014). Mahavishnu isn't on the map, so it's only useful as Weinman context.
