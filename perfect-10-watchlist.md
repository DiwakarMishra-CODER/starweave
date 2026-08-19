# Pitchfork "My Perfect 10" pass - watch-list

Working artifact. Layer 1 (research) only - nothing here is written to `seed-data.ts` yet.

## Scope

The graph has **293 artists**. The series only features artists on a live press cycle,
so the real candidate pool is **68** (`activeFrom >= 2005`). Kraftwerk and the Velvet
Underground are not making Pitchfork shorts.

## The evidence rule (decided before searching, so it can't be bent to fit a find)

A "perfect 10" pick is an **admiration** claim, not an influence claim. Three outcomes:

| What the clip contains | Verdict |
|---|---|
| Just the pick, nothing else in the graph | **Not an edge.** Do not write it. |
| The pick, plus an edge that already exists on other evidence | **Corroboration.** Bump confidence, append to citation. |
| The pick *plus* a volunteered influence statement | **New edge.** `first-person`, ~0.85. |

Precedent for row 2: `alvvays -> cocteau-twins`. Precedent for row 3: `wolf-alice -> the-replacements`.

## Division of labour

The complete index exists at the two links below and is **Cloudflare-walled to me**
(403 to both WebFetch and curl; YouTube is JS-rendered; TikTok is blocked from this
region). You can read it in a browser in ten seconds.

- RYM, 8+ pages: https://rateyourmusic.com/list/auriyashanee/pitchforks-my-perfect-10-album-artists-picks/
- AOTY: https://www.albumoftheyear.org/user/birch-tcs/list/288690/pitchfork-my-perfect-10-wip/

Captions name the artist and sometimes the album. They **never** carry the artist's own
words - Pitchfork writes them to make you watch. So: you watch and report wording, I
verify what is checkable and write the citations.

## Confirmed episodes so far

| Artist | Pick | Graph node? | Status |
|---|---|---|---|
| Alvvays (Molly Rankin) | Cocteau Twins - *Heaven or Las Vegas* | YES | Edge exists at 0.75. Real quoted wording now available - upgrade candidate. |
| Wolf Alice | The Replacements - *Tim* | YES | Already written, first-person 0.85. |
| Modest Mouse (Isaac Brock) | not in caption | YES | **Highest-value unwatched.** Modest Mouse roots are thin and 3 of its edges failed the citation audit. |
| Fontaines D.C. (Conor Curley) | unnamed "beautiful crooner record" from 2005 | unknown | Needs watching. Not Leonard Cohen - he has no 2005 record. |
| underscores | not in caption | unknown | Needs watching. |
| Turnstile (Daniel Fang) | Title Fight - *Floral Green* | no | Dead end. |
| Japanese Breakfast (Michelle Zauner) | Billy Joel - *The Stranger* | no | Dead end. |

Non-roster episodes seen in passing (Wavves, Real Estate, ANOHNI, Ryan Davis, Joyce
Manor, Vybz Kartel, Quadeca) - the series population is far broader than this graph.
**Of 5 identified picks, 2 landed on graph nodes.**

## Priority order - check these names against the index first

### Tier A - a hit could create the first real edge (10 artists)
100 gecs (0 roots) · Burial (0 roots) · Adrianne Lenker · The Marías · Turnstile [done,
dead end] · 2814 · Jane Remover · Mid-Air Thief · Angel Olsen · Kero Kero Bonito

All have **zero first-person roots**. Angel Olsen and Kero Kero Bonito carry 6 roots
each with not one artist quote behind them.

### Tier B - a hit could tier existing untiered edges (12 artists)
Weyes Blood · Julia Holter · Sharon Van Etten · Anna von Hausswolff · Japanese Breakfast
[done, dead end] · Mitski · Parannoul · Wolf Alice [done] · Ethel Cain · Geese · Alvvays
[done] · Snail Mail

### Tier C - already well sourced, low upside (46 artists)
Skip unless the index shows them for free. Wednesday (7 first-person), Phoebe Bridgers,
Fleet Foxes, Waxahatchee, Vampire Weekend, Squid, Perfume Genius, Charli XCX, Caroline
Polachek, Candy Claws, Black Country New Road, Big Thief, St. Vincent, Parquet Courts,
MJ Lenderman, IDLES, Everything Everything, Clairo, Car Seat Headrest, Bon Iver, black
midi, beabadoobee, Arca, underscores, Slayyyter, Oneohtrix Point Never, Oklou,
Ninajirachi, Magdalena Bay, Mac DeMarco, Jockstrap, Grouper, Grimes, Fontaines D.C.,
FKA twigs, death's dynamic shroud, A.G. Cook, yeule, Women, The Last Dinner Party,
Tame Impala, SOPHIE, Porter Robinson, King Gizzard, George Clanton, Alex G

## What to write down while watching

1. Who is speaking (the band member, not just the band - Fontaines was Curley, Turnstile was Fang).
2. The album picked, exactly.
3. **Verbatim wording of anything beyond the pick.** This is the whole ballgame. "I love
   this record" is row 1. "This is why I started playing" is row 3.
4. Whether they say it changed how they make music, or only that it is great.

## Trap to check before writing any of these

Picks skew canonical, and canonical picks are each band's most-repeated critic
comparison - which the denial pass found is exactly what artists reject on record most
often. Every candidate gets checked against `rejectedEdges` first. Car Seat Headrest
already denies Pavement, Sonic Youth, Dinosaur Jr. and the Strokes; Parquet Courts
denies Pavement; Weyes Blood denies Nico; St. Vincent denies Kate Bush; Perfume Genius
denies Talk Talk.
