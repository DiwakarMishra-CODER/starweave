# Roster backlog (25 Oct 2026) — banked, not researched

Agreed with the owner, then banked to be done together with the other data work. Nothing here is written to `seed-data.ts`; every artist and scene change goes through the usual research → rule → write layers first, and the no-orphans rule applies (at least one sourced edge to an artist already on the map).

## Artists to add (research each)

How they were found: artists the map's own citations and bios already name, counted by how many map artists name them. Counts are mentions, not proof of influence; the research decides.

| Artist | Map artists naming them | Notes |
|---|---|---|
| Kate Bush | 8 (Caroline Polachek, Sharon Van Etten, of Montreal, Björk, St. Vincent, The Knife, Kero Kero Bonito, The Last Dinner Party) | `folk-audit-DRAFT.md`: "recurs constantly alongside Björk but isn't a Starweave node." St. Vincent's bio says she has denied the Kate Bush influence critics assume: check for a `rejectedEdges` entry. |
| PJ Harvey | 1 (in a Yeah Yeah Yeahs list of twenty) | A blind spot of the mention method, not a weak case. Research from scratch. |
| Throwing Muses | 3 (Sleater-Kinney first-person, Jonny Greenwood went to see them, Tanya Donelly co-founded the Breeders) | 4AD, so also a candidate for the `4ad` scene. Donelly → Breeders is personnel, not influence. |
| The Byrds | 6 (Ride, Belle and Sebastian, Slowdive first-person; R.E.M. and Fleet Foxes bios; Talking Heads) | The jangle-pop genre has no founder on the map. |
| Roxy Music | 5 (Human League, Parquet Courts first-person; Depeche Mode, OMD lists) | Eno was a member: personnel, not influence. |
| Captain Beefheart | 5 (Ween, Coil first-person; Tom Waits bio; Pinback lyric; White Stripes critic) | |
| Beat Happening | 4 (Trail of Dead first-person; Nirvana likes list; Snail Mail listening; Mount Eerie mentored by Calvin Johnson) | K Records / Olympia. Mentoring needs a check: is it influence or personnel? |
| Cluster / Harmonia | 4 (Mogwai first-person on Harmonia; Massive Attack first-person on Cluster; Coil reported) | Decide one node or two. Rother/Neu! → Harmonia is personnel. |
| Spacemen 3 (plus Loop) | 3 (Ride first-person twice; Galaxie 500 critic; Slowdive names Loop) | Spiritualized is Jason Pierce's later band: personnel. |
| PiL | 3 (Spoon first-person; Clairo; The Rapture critic) | John Lydon → Sex Pistols is personnel. |
| Smashing Pumpkins | 3 (beabadoobee first-person; Silversun Pickups bio; yeule offhand) | Borderline on scope (arena-sized), kept: the evidence is real, and it gives Silversun Pickups a sourced link. |
| Peter Cat Recording Co. | 0 | Owner's pick (Delhi). Their stated influences may sit mostly outside the roster (old Hindi film music, jazz, chanson), so find an in-map link first; held under no-orphans if there is none. |

Optional, after that: **a lineage review** of the genres' parents (Hyperpop <- IDM and Drone <- Ambient are the most debatable; see CLAUDE.md's /genres notes). Not urgent: the drawing matches the data and the dates all run forward.

Still to run: **a genre sweep.** For each of the map's 53 genres, list its founders and key artists from proper references and check who's missing. The mention method above can't see artists nobody on the map was asked about, which is how PJ Harvey and The Raincoats (0 mentions, a known influence on Nirvana and riot grrrl) were missed.

## Decided against

- **Pink Floyd / Syd Barrett:** our sources only name Pink Floyd in taste lists ("a liking for…", "sources of inspiration"), never as a shaping influence, and nobody names Barrett. Most of the band is arena prog.
- **Throbbing Gristle:** every mention is something else: a Wikipedia list of bands Faust influenced (TG as a Faust fan), and Coil's members having been in TG (personnel).
- **The Beatles (15 artists name them), Prince, the Beach Boys, the Kinks:** everyone's influence; they would become giant hubs pulling lines off the Velvet Underground. A deliberate scope choice; the owner can overrule it.

## Artists on the map to review

- **Steve Roach:** drop. New-age ambient, 2 links, neither first-person; the one sound that's out of place.
- **Fishmans:** 1 link, no source, no road back to the Velvet Underground. Drop unless research finds a real link.
- **Silversun Pickups:** 1 link, no source. Fixed by Smashing Pumpkins; otherwise drop.
- **Harold Budd, Do Make Say Think, Dead Can Dance, Get Up Kids, Angel Olsen:** belong, but every link is `unsourceable`. Source them.
- **Realm name:** "American underground" holds Radiohead, Blur, Pulp, Arcade Fire, Broken Social Scene, Destroyer, Tame Impala and King Gizzard. A rename, not a move.

## Scenes — DONE (25 Oct 2026)

Done as listed below: `glasgow` removed, `detroit` and `lower-east-side` written from sourced research, `greenwich-village` kept.


- **Drop `glasgow`.** Two acts over 14 years; its own text says the one link is Stuart Murdoch producing Camera Obscura's early records.
- **Add New York, early 2000s:** the Strokes, Yeah Yeah Yeahs, Interpol, LCD Soundsystem, the Rapture (all on the map, none in a scene). Research the rooms (Lower East Side clubs, DFA's studio), the years and who shared bills; *Meet Me in the Bathroom* (Lizzy Goodman, 2017) is the oral history. Raises electronic's scene coverage from 3 to 5 of 59.
- **Add Detroit, late 1960s:** MC5 and the Stooges (Grande Ballroom; Elektra signed both on the same trip). Was held only for want of research.
- **Keep `greenwich-village`:** a real single room, and Dylan's own words name Dalton his favourite singer there; 2 of the folk realm's 3 scene members.
- `/scenes` (the lightbox) is drawn from the data, so these changes flow in without layout work.
