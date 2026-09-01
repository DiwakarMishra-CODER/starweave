# Genre re-tagging review — full roster export

Report generated from `data/seed-data.ts` for the genre re-tagging pass. Report only — no data was changed to produce this file.

## Why this exists

Genre tagging is systematically under-specified: 123 of 233 artists carry exactly one tag, and entire realms are tagged with nothing but their own umbrella genre — all 44 electronic-realm artists are `["electronic"]`, all 44 folk-realm artists are `["folk"]`. That tag restates the realm and carries no information. It also means genre pages that should exist can't be built: `ambient`, `trip-hop`, `IDM`, `synth-pop`, `hyperpop`, `slowcore` aren't in the vocabulary at all, even though the artists who'd populate them are already in the graph.

## Full roster, by realm (233 artists)

Grouped core → region-one → american-underground → electronic → folk-confessional → emo-posthardcore → post-rock-drone-noise. Within each realm, sorted by degree (total edge count, in + out) descending.

### core (5 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| The Velvet Underground | `velvet-underground` |  | ["art-rock","proto-punk"] |  | 47 |
| Brian Eno | `brian-eno` | ambient-drone | ["electronic"] |  | 17 |
| Can | `can` |  | ["krautrock"] |  | 16 |
| Kraftwerk | `kraftwerk` |  | ["krautrock"] |  | 15 |
| Neu! | `neu` |  | ["krautrock"] |  | 12 |

### region-one (41 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| My Bloody Valentine | `my-bloody-valentine` |  | ["shoegaze"] |  | 33 |
| Joy Division | `joy-division` |  | ["post-punk"] |  | 26 |
| Siouxsie & The Banshees | `siouxsie-and-the-banshees` |  | ["post-punk","goth"] |  | 26 |
| David Bowie | `david-bowie` |  | ["art-rock"] |  | 25 |
| Cocteau Twins | `cocteau-twins` |  | ["dream-pop","shoegaze"] |  | 24 |
| The Cure | `the-cure` |  | ["post-punk","goth"] |  | 17 |
| The Smiths | `the-smiths` |  | ["jangle-pop","indie-rock"] |  | 16 |
| New Order | `new-order` |  | ["post-punk","dance-punk"] |  | 15 |
| Slowdive | `slowdive` |  | ["shoegaze","dream-pop"] |  | 14 |
| The Stooges | `the-stooges` |  | ["proto-punk"] |  | 12 |
| Television | `television` |  | ["art-rock","proto-punk"] |  | 11 |
| Talking Heads | `talking-heads` |  | ["art-rock","post-punk"] |  | 11 |
| The Jesus and Mary Chain | `the-jesus-and-mary-chain` |  | ["shoegaze","noise-rock"] |  | 11 |
| Ride | `ride` |  | ["shoegaze"] |  | 10 |
| Stereolab | `stereolab` |  | ["art-rock","indie-rock"] |  | 10 |
| Gang of Four | `gang-of-four` |  | ["post-punk","dance-punk"] |  | 9 |
| Wire | `wire` |  | ["post-punk"] |  | 9 |
| Nick Cave & The Bad Seeds | `nick-cave-and-the-bad-seeds` |  | ["post-punk","art-rock"] |  | 8 |
| Alvvays | `alvvays` |  | ["jangle-pop","dream-pop"] |  | 8 |
| Broadcast | `broadcast` |  | ["dream-pop","art-rock"] |  | 7 |
| Big Star | `big-star` |  | ["power-pop","jangle-pop"] |  | 6 |
| This Mortal Coil | `this-mortal-coil` |  | ["dream-pop"] |  | 6 |
| Deerhunter | `deerhunter` |  | ["shoegaze","indie-rock"] |  | 6 |
| Wolf Alice | `wolf-alice` |  | ["shoegaze","alt-rock"] |  | 6 |
| Sweet Trip | `sweet-trip` |  | ["shoegaze","dream-pop"] |  | 6 |
| The Birthday Party | `the-birthday-party` |  | ["post-punk","goth"] |  | 5 |
| Mazzy Star | `mazzy-star` |  | ["dream-pop"] |  | 5 |
| Beach House | `beach-house` |  | ["dream-pop"] |  | 5 |
| Nico | `nico` |  | ["art-rock","dream-pop"] |  | 4 |
| New York Dolls | `new-york-dolls` |  | ["proto-punk"] |  | 4 |
| Parannoul | `parannoul` |  | ["shoegaze"] |  | 4 |
| The Stone Roses | `the-stone-roses` |  | ["jangle-pop","indie-rock"] |  | 4 |
| Echo & the Bunnymen | `echo-and-the-bunnymen` |  | ["post-punk","jangle-pop"] |  | 4 |
| Fontaines D.C. | `fontaines-dc` |  | ["post-punk","indie-rock"] |  | 3 |
| Julee Cruise | `julee-cruise` |  | ["dream-pop"] |  | 3 |
| The Sundays | `the-sundays` |  | ["jangle-pop","dream-pop"] |  | 3 |
| Lush | `lush` |  | ["shoegaze","dream-pop"] |  | 3 |
| IDLES | `idles` |  | ["post-punk"] |  | 2 |
| The Modern Lovers | `the-modern-lovers` |  | ["proto-punk"] |  | 2 |
| Silversun Pickups | `silversun-pickups` |  | ["shoegaze","alt-rock"] |  | 1 |
| Fishmans | `fishmans` |  | ["dream-pop"] |  | 1 |

### american-underground (46 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| Sonic Youth | `sonic-youth` | noise-alt | ["noise-rock","alt-rock"] | american-underground | 42 |
| Radiohead | `radiohead` | indie-rock | ["alt-rock","art-rock"] |  | 18 |
| Pixies | `pixies` | noise-alt | ["alt-rock","noise-rock"] | american-underground | 16 |
| Animal Collective | `animal-collective` | psych | ["psychedelic-pop","experimental-pop","freak-folk"] |  | 16 |
| Nirvana | `nirvana` | noise-alt | ["grunge","alt-rock"] |  | 14 |
| Pavement | `pavement` | noise-alt | ["indie-rock","alt-rock"] | american-underground | 11 |
| R.E.M. | `rem` | college-rock | ["jangle-pop","alt-rock"] | american-underground | 11 |
| Modest Mouse | `modest-mouse` | indie-rock | ["indie-rock","alt-rock"] |  | 11 |
| The Flaming Lips | `the-flaming-lips` | psych | ["neo-psychedelia","alt-rock"] |  | 10 |
| Dinosaur Jr. | `dinosaur-jr` | noise-alt | ["alt-rock","noise-rock"] | american-underground | 9 |
| Neutral Milk Hotel | `neutral-milk-hotel` | psych | ["indie-rock","psychedelic-pop"] |  | 9 |
| Hüsker Dü | `husker-du` | noise-alt | ["alt-rock"] | american-underground | 7 |
| The Replacements | `the-replacements` | college-rock | ["alt-rock","power-pop"] | american-underground | 7 |
| Yeah Yeah Yeahs | `yeah-yeah-yeahs` | indie-rock | ["indie-rock","dance-punk"] |  | 7 |
| Geese | `geese` | indie-rock | ["art-rock","indie-rock"] |  | 7 |
| Yo La Tengo | `yo-la-tengo` | college-rock | ["indie-rock","noise-rock"] |  | 6 |
| Interpol | `interpol` | indie-rock | ["post-punk","indie-rock"] |  | 6 |
| Blur | `blur` | indie-rock | ["alt-rock","indie-rock"] |  | 6 |
| The National | `the-national` | indie-rock | ["indie-rock","chamber-pop"] |  | 6 |
| Destroyer | `destroyer` | indie-rock | ["art-pop","indie-rock"] |  | 6 |
| of Montreal | `of-montreal` | psych | ["psychedelic-pop","art-pop"] |  | 6 |
| MGMT | `mgmt` | psych | ["psychedelic-pop","electronic"] |  | 6 |
| Guided by Voices | `guided-by-voices` | college-rock | ["lo-fi","indie-rock"] |  | 5 |
| Women | `women` | college-rock | ["post-punk","noise-rock"] |  | 5 |
| Superchunk | `superchunk` | college-rock | ["indie-rock","noise-rock"] |  | 5 |
| The Shins | `the-shins` | indie-rock | ["indie-rock","psychedelic-pop"] |  | 5 |
| Arcade Fire | `arcade-fire` | neo-psych | ["indie-rock","chamber-pop"] |  | 5 |
| The Strokes | `the-strokes` | indie-rock | ["indie-rock","alt-rock"] |  | 4 |
| Built to Spill | `built-to-spill` | indie-rock | ["indie-rock","alt-rock"] |  | 4 |
| Violent Femmes | `violent-femmes` | college-rock | ["folk-punk","indie-rock"] |  | 4 |
| Parquet Courts | `parquet-courts` | indie-rock | ["post-punk","indie-rock"] |  | 4 |
| Spoon | `spoon` | indie-rock | ["indie-rock","art-rock"] |  | 4 |
| Car Seat Headrest | `car-seat-headrest` | indie-rock | ["lo-fi","indie-rock"] |  | 4 |
| St. Vincent | `st-vincent` | neo-psych | ["art-pop","art-rock"] |  | 4 |
| Tame Impala | `tame-impala` | neo-psych | ["neo-psychedelia","psychedelic-pop"] |  | 4 |
| Vampire Weekend | `vampire-weekend` | neo-psych | ["indie-rock","art-pop"] |  | 4 |
| Sebadoh | `sebadoh` | noise-alt | ["lo-fi","indie-rock"] |  | 3 |
| The Walkmen | `the-walkmen` | indie-rock | ["indie-rock","art-rock"] |  | 3 |
| Pulp | `pulp` | indie-rock | ["britpop","art-pop"] |  | 3 |
| Sleater-Kinney | `sleater-kinney` | college-rock | ["post-punk","indie-rock"] |  | 2 |
| The White Stripes | `the-white-stripes` | indie-rock | ["garage-rock","alt-rock"] |  | 2 |
| Grizzly Bear | `grizzly-bear` | psych | ["art-pop","indie-rock"] |  | 2 |
| Olivia Tremor Control | `olivia-tremor-control` | psych | ["psychedelic-pop","lo-fi"] |  | 2 |
| Beck | `beck` | neo-psych | ["lo-fi","alt-rock"] |  | 2 |
| King Gizzard and the Lizard Wizard | `king-gizzard-and-the-lizard-wizard` | neo-psych | ["neo-psychedelia","garage-rock"] |  | 2 |
| Wilco | `wilco` | college-rock | ["indie-rock","art-rock"] |  | 1 |

### electronic (44 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| Depeche Mode | `depeche-mode` | synth-pop | ["electronic"] |  | 15 |
| Orchestral Manoeuvres in the Dark | `omd` | synth-pop | ["electronic"] |  | 12 |
| Aphex Twin | `aphex-twin` | idm | ["electronic"] |  | 11 |
| Suicide | `suicide` | krautrock | ["electronic"] |  | 9 |
| Cabaret Voltaire | `cabaret-voltaire` | krautrock | ["electronic"] |  | 8 |
| LCD Soundsystem | `lcd-soundsystem` | electronic-indie-dancepunk | ["electronic"] |  | 7 |
| Arca | `arca` | hyperpop-pcmusic | ["electronic"] |  | 7 |
| Björk | `bjork` | art-electronic | ["electronic"] |  | 7 |
| The Human League | `the-human-league` | synth-pop | ["electronic"] |  | 6 |
| Autechre | `autechre` | idm | ["electronic"] |  | 6 |
| Boards of Canada | `boards-of-canada` | idm | ["electronic"] |  | 6 |
| SOPHIE | `sophie` | hyperpop-pcmusic | ["electronic"] |  | 6 |
| Caribou | `caribou` | electronic-indie-dancepunk | ["electronic"] |  | 5 |
| Portishead | `portishead` | trip-hop-downtempo | ["electronic"] |  | 5 |
| Jane Remover | `jane-remover` | hyperpop-pcmusic | ["electronic"] |  | 5 |
| Silver Apples | `silver-apples` | krautrock | ["electronic"] |  | 4 |
| Faust | `faust` | krautrock | ["electronic"] |  | 4 |
| Gary Numan | `gary-numan` | synth-pop | ["electronic"] |  | 4 |
| Grouper | `grouper` | ambient-drone | ["electronic"] |  | 4 |
| The Postal Service | `the-postal-service` | electronic-indie-dancepunk | ["electronic"] |  | 4 |
| Charli XCX | `charli-xcx` | hyperpop-pcmusic | ["electronic"] |  | 4 |
| Caroline Polachek | `caroline-polachek` | hyperpop-pcmusic | ["electronic"] |  | 4 |
| yeule | `yeule` | hyperpop-pcmusic | ["electronic"] |  | 4 |
| Porter Robinson | `porter-robinson` | hyperpop-pcmusic | ["electronic"] |  | 4 |
| Tim Hecker | `tim-hecker` | ambient-drone | ["electronic"] |  | 3 |
| Hot Chip | `hot-chip` | electronic-indie-dancepunk | ["electronic"] |  | 3 |
| Massive Attack | `massive-attack` | trip-hop-downtempo | ["electronic"] |  | 3 |
| underscores | `underscores` | hyperpop-pcmusic | ["electronic"] |  | 3 |
| Imogen Heap | `imogen-heap` | art-electronic | ["electronic"] |  | 3 |
| The Knife | `the-knife` | synth-pop | ["electronic"] |  | 2 |
| Sparks | `sparks` | synth-pop | ["electronic"] |  | 2 |
| Squarepusher | `squarepusher` | idm | ["electronic"] |  | 2 |
| Oneohtrix Point Never | `oneohtrix-point-never` | ambient-drone | ["electronic"] |  | 2 |
| Harold Budd | `harold-budd` | ambient-drone | ["electronic"] |  | 2 |
| Four Tet | `four-tet` | electronic-indie-dancepunk | ["electronic"] |  | 2 |
| The Rapture | `the-rapture` | electronic-indie-dancepunk | ["electronic"] |  | 2 |
| !!! | `chk-chk-chk` | electronic-indie-dancepunk | ["electronic"] |  | 2 |
| Tricky | `tricky` | trip-hop-downtempo | ["electronic"] |  | 2 |
| Oklou | `oklou` | hyperpop-pcmusic | ["electronic"] |  | 2 |
| Ninajirachi | `ninajirachi` | hyperpop-pcmusic | ["electronic"] |  | 2 |
| Burial | `burial` | idm | ["electronic"] |  | 1 |
| Stars of the Lid | `stars-of-the-lid` | ambient-drone | ["electronic"] |  | 1 |
| A.G. Cook | `a-g-cook` | hyperpop-pcmusic | ["electronic"] |  | 1 |
| 100 gecs | `100-gecs` | hyperpop-pcmusic | ["electronic"] |  | 1 |

### folk-confessional (44 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| Bob Dylan | `bob-dylan` | folk-roots | ["folk"] |  | 13 |
| Neil Young | `neil-young` | folk-roots | ["folk"] |  | 13 |
| Liz Phair | `liz-phair` | confessional | ["folk"] |  | 13 |
| Nick Drake | `nick-drake` | folk-roots | ["folk"] |  | 11 |
| Elliott Smith | `elliott-smith` | confessional | ["folk"] |  | 11 |
| Sharon Van Etten | `sharon-van-etten` | confessional | ["folk"] |  | 9 |
| Low | `low` | slowcore | ["folk"] |  | 8 |
| Galaxie 500 | `galaxie-500` | slowcore | ["dream-pop","indie-rock"] |  | 8 |
| Leonard Cohen | `leonard-cohen` | folk-roots | ["folk"] |  | 7 |
| Sufjan Stevens | `sufjan-stevens` | freak-folk | ["folk"] |  | 7 |
| Snail Mail | `snail-mail` | confessional | ["folk"] |  | 7 |
| Kurt Vile | `kurt-vile` | indie-folk | ["folk"] |  | 7 |
| Phoebe Bridgers | `phoebe-bridgers` | confessional | ["folk"] |  | 6 |
| Angel Olsen | `angel-olsen` | confessional | ["folk"] |  | 6 |
| Ethel Cain | `ethel-cain` | confessional | ["folk"] |  | 6 |
| Cat Power | `cat-power` | confessional | ["folk"] |  | 6 |
| Red House Painters | `red-house-painters` | slowcore | ["folk"] |  | 6 |
| Vashti Bunyan | `vashti-bunyan` | folk-roots | ["folk"] |  | 5 |
| Joni Mitchell | `joni-mitchell` | folk-roots | ["folk"] |  | 5 |
| Fleet Foxes | `fleet-foxes` | freak-folk | ["folk"] |  | 5 |
| Bon Iver | `bon-iver` | freak-folk | ["folk"] |  | 5 |
| Mitski | `mitski` | confessional | ["folk"] |  | 5 |
| Weyes Blood | `weyes-blood` | confessional | ["folk"] |  | 5 |
| Japanese Breakfast | `japanese-breakfast` | confessional | ["folk"] |  | 5 |
| Julia Holter | `julia-holter` | confessional | ["folk"] |  | 5 |
| Joanna Newsom | `joanna-newsom` | freak-folk | ["folk"] |  | 4 |
| Bright Eyes | `bright-eyes` | freak-folk | ["folk"] |  | 4 |
| Fiona Apple | `fiona-apple` | confessional | ["folk"] |  | 4 |
| The Mountain Goats | `the-mountain-goats` | indie-folk | ["folk"] |  | 4 |
| Codeine | `codeine` | slowcore | ["folk"] |  | 4 |
| Townes Van Zandt | `townes-van-zandt` | folk-roots | ["folk"] |  | 3 |
| Jeff Buckley | `jeff-buckley` | confessional | ["folk"] |  | 3 |
| Mount Eerie | `mount-eerie` | slowcore | ["folk"] |  | 3 |
| Mac DeMarco | `mac-demarco` | indie-folk | ["folk"] |  | 3 |
| Bert Jansch | `bert-jansch` | folk-roots | ["folk"] |  | 2 |
| Roy Harper | `roy-harper` | folk-roots | ["folk"] |  | 2 |
| Karen Dalton | `karen-dalton` | folk-roots | ["folk"] |  | 2 |
| Incredible String Band | `incredible-string-band` | folk-roots | ["folk"] |  | 2 |
| John Prine | `john-prine` | folk-roots | ["folk"] |  | 2 |
| Big Thief | `big-thief` | freak-folk | ["folk"] |  | 2 |
| Clairo | `clairo` | confessional | ["folk"] |  | 2 |
| Have A Nice Life | `have-a-nice-life` | slowcore | ["folk"] |  | 2 |
| Silver Jews | `silver-jews` | indie-folk | ["folk"] |  | 2 |
| Adrianne Lenker | `adrianne-lenker` | freak-folk | ["folk"] |  | 1 |

### emo-posthardcore (30 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| Fugazi | `fugazi` | hardcore-roots | ["post-hardcore"] |  | 25 |
| American Football | `american-football` | midwest-emo | ["midwest-emo","emo","math-rock"] |  | 14 |
| Unwound | `unwound` | post-hardcore | ["post-hardcore","noise-rock"] |  | 12 |
| Black Flag | `black-flag` | hardcore-roots | ["hardcore-punk"] |  | 11 |
| The Jesus Lizard | `the-jesus-lizard` | post-hardcore | ["post-hardcore","noise-rock"] |  | 11 |
| Drive Like Jehu | `drive-like-jehu` | post-hardcore | ["post-hardcore","math-rock"] |  | 9 |
| Brand New | `brand-new` | midwest-emo | ["emo","post-hardcore"] |  | 9 |
| Rites of Spring | `rites-of-spring` | hardcore-roots | ["hardcore-punk","emo"] |  | 7 |
| Slint | `slint` | post-hardcore | ["post-hardcore","math-rock"] |  | 7 |
| La Dispute | `la-dispute` | midwest-emo | ["post-hardcore","emo"] |  | 7 |
| Minutemen | `minutemen` | hardcore-roots | ["hardcore-punk"] |  | 6 |
| At The Drive-In | `at-the-drive-in` | post-hardcore | ["post-hardcore","math-rock"] |  | 6 |
| Minor Threat | `minor-threat` | hardcore-roots | ["post-hardcore","hardcore-punk"] |  | 5 |
| Bad Brains | `bad-brains` | hardcore-roots | ["hardcore-punk"] |  | 5 |
| Big Black | `big-black` | post-hardcore | ["post-hardcore","noise-rock"] |  | 4 |
| Sunny Day Real Estate | `sunny-day-real-estate` | midwest-emo | ["midwest-emo","emo"] |  | 4 |
| Far Apart | `far-apart` | midwest-emo | ["midwest-emo","emo"] |  | 3 |
| Hum | `hum` | midwest-emo | ["alt-rock","indie-rock"] |  | 3 |
| The Dismemberment Plan | `the-dismemberment-plan` | midwest-emo | ["post-hardcore","indie-rock"] |  | 3 |
| Dead Kennedys | `dead-kennedys` | hardcore-roots | ["hardcore-punk"] |  | 2 |
| Refused | `refused` | post-hardcore | ["post-hardcore","hardcore-punk"] |  | 2 |
| ...And You Will Know Us by the Trail of Dead | `trail-of-dead` | post-hardcore | ["post-hardcore","noise-rock"] |  | 2 |
| Cap'n Jazz | `cap-n-jazz` | midwest-emo | ["midwest-emo","emo"] |  | 2 |
| Duster | `duster` | midwest-emo | ["midwest-emo","indie-rock"] |  | 2 |
| Jeff Rosenstock | `jeff-rosenstock` | midwest-emo | ["hardcore-punk"] |  | 2 |
| The Get Up Kids | `get-up-kids` | midwest-emo | ["midwest-emo","emo"] |  | 2 |
| Descendents | `descendents` | hardcore-roots | ["hardcore-punk"] |  | 1 |
| NoMeansNo | `nomeansno` | post-hardcore | ["post-hardcore","hardcore-punk"] |  | 1 |
| toe | `toe` | math-rock | ["math-rock"] |  | 1 |
| Christie Front Drive | `christie-front-drive` | midwest-emo | ["midwest-emo","emo"] |  | 1 |

### post-rock-drone-noise (23 artists)
| Artist | id | lineage | genres[] | scene | degree |
|---|---|---|---|---|---|
| Godspeed You! Black Emperor | `godspeed-you-black-emperor` | post-rock | ["post-rock","art-rock"] |  | 15 |
| Mogwai | `mogwai` | post-rock | ["post-rock"] |  | 14 |
| Swans | `swans` | no-wave | ["no-wave","noise-rock","industrial"] |  | 10 |
| This Heat | `this-heat` | no-wave | ["post-rock","industrial"] |  | 8 |
| Talk Talk | `talk-talk` | drone | ["post-rock","art-rock"] |  | 7 |
| Sigur Rós | `sigur-ros` | post-rock | ["post-rock"] |  | 6 |
| Bark Psychosis | `bark-psychosis` | post-rock | ["post-rock"] |  | 6 |
| Tortoise | `tortoise` | post-rock | ["post-rock"] |  | 6 |
| Mono | `mono` | post-rock | ["post-rock"] |  | 5 |
| Explosions in the Sky | `explosions-in-the-sky` | post-rock | ["post-rock"] |  | 4 |
| Glenn Branca | `glenn-branca` | no-wave | ["no-wave","minimalism"] |  | 4 |
| Teenage Jesus and the Jerks | `teenage-jesus-and-the-jerks` | no-wave | ["no-wave","noise-rock"] |  | 3 |
| Mars | `mars` | no-wave | ["no-wave","noise-rock"] |  | 3 |
| DNA | `dna` | no-wave | ["no-wave","noise-rock"] |  | 3 |
| Blonde Redhead | `blonde-redhead` | no-wave | ["noise-rock","dream-pop"] |  | 3 |
| Anna von Hausswolff | `anna-von-hausswolff` | drone | ["drone","darkwave"] |  | 3 |
| Rhys Chatham | `rhys-chatham` | no-wave | ["no-wave","minimalism"] |  | 2 |
| Dead Can Dance | `dead-can-dance` | drone | ["darkwave","goth"] |  | 2 |
| Spiritualized | `spiritualized` | drone | ["drone","post-rock"] |  | 2 |
| Dirty Three | `dirty-three` | drone | ["post-rock","drone"] |  | 2 |
| Do Make Say Think | `do-make-say-think` | post-rock | ["post-rock"] |  | 1 |
| James Chance and the Contortions | `james-chance-and-the-contortions` | no-wave | ["no-wave","dance-punk"] |  | 1 |
| A Silver Mt. Zion | `a-silver-mt-zion` | post-rock | ["post-rock"] |  | 0 |

## 1. Genre vocabulary audit

Every id in the declared `genres` list, its `name`, `parent`, and actual artist count.

| id | name | parent | count |
|---|---|---|---|
| underground | Underground | — | 0 ← ZERO |
| indie | Indie | underground | 0 ← ZERO |
| art-rock | Art rock | indie | 16 |
| proto-punk | Proto-punk | indie | 5 |
| post-punk | Post-punk | indie | 16 |
| goth | Gothic rock | post-punk | 4 |
| dance-punk | Dance-punk | post-punk | 4 |
| jangle-pop | Jangle pop | indie | 7 |
| power-pop | Power pop | indie | 2 |
| shoegaze | Shoegaze | indie | 11 |
| dream-pop | Dream pop | indie | 15 |
| noise-rock | Noise rock | indie | 16 |
| alt-rock | Alternative rock | indie | 19 |
| indie-rock | Indie rock | indie | 35 |
| krautrock | Krautrock | indie | 3 |
| post-hardcore | Post-hardcore | post-punk | 14 |
| electronic | Electronic | underground | 46 |
| folk | Folk | underground | 43 |
| hardcore-punk | Hardcore punk | underground | 10 |
| emo | Emo | post-hardcore | 9 |
| midwest-emo | Midwest emo | emo | 7 |
| math-rock | Math rock | post-hardcore | 5 |
| post-rock | Post-rock | indie | 13 |
| no-wave | No wave | post-punk | 7 |
| drone | Drone | indie | 3 |
| darkwave | Darkwave | goth | 2 |
| minimalism | Minimalism | no-wave | 2 |
| industrial | Industrial | no-wave | 2 |
| grunge | Grunge | alt-rock | 1 |
| lo-fi | Lo-fi | indie-rock | 5 |
| folk-punk | Folk punk | folk | 1 |
| chamber-pop | Chamber pop | indie-rock | 2 |
| art-pop | Art pop | art-rock | 6 |
| garage-rock | Garage rock | alt-rock | 2 |
| britpop | Britpop | indie-rock | 1 |
| psychedelic-pop | Psychedelic pop | indie-rock | 7 |
| neo-psychedelia | Neo-psychedelia | psychedelic-pop | 3 |
| experimental-pop | Experimental pop | psychedelic-pop | 1 |
| freak-folk | Freak folk | folk | 1 |

Confirmed: only `underground` and `indie` have zero artists. No other declared id is unused. 37 of 39 declared ids are live. Genres like `ambient`, `trip-hop`, `IDM`, `synth-pop`, `hyperpop`, `slowcore` — despite being real `Lineage` values in `data/types.ts` — have no corresponding `Genre` entry at all.

## 2. Every `genres[]` consumption site

| File:line | Treatment |
|---|---|
| `components/artist/ArtistCard.tsx:12-14` | `.slice(0, 2)` then `.map().join(' · ')` — **positional**: only the first two array entries are ever displayed on browse cards |
| `components/graph/ArtistPanel.tsx:174` | `.map()` over the full array, rendered as chips — order-independent |
| `components/graph/ArtistPanel.tsx:88` | `genreMap` built from `graphData.genres` (the declared list, not per-artist) — lookup table, not array consumption |
| `app/(graph)/artist/[slug]/page.tsx:47` | `.map(g => genreMap[g] ?? g).join(', ')` for the page `<meta>` description — order affects the *string* produced but nothing downstream reads position back out |
| `app/browse/page.tsx:30` | passes `data.genres` (declared list) as a prop to `BrowseClient` — pass-through only |
| `app/genre/[genre]/page.tsx:20,26,34` | `data.genres.map()`/`.find()` over the *declared* genre list for static params/lookup — not per-artist `genres[]` |
| `app/genre/[genre]/page.tsx:64` | `a.genres.includes('shoegaze')` — order-independent, hardcoded to the one genre this page currently supports |
| `components/graph/GraphView.tsx:56` | `a.genres.includes(genreParam)` for the `?genre=` highlight query param — order-independent |
| `components/browse/BrowseClient.tsx:33` | `a.genres.includes(activeGenre)` filter — order-independent |
| `components/browse/BrowseClient.tsx:45` | `for (const g of artist.genres)` building genre counts for the browse sidebar — order-independent |

**`ArtistCard.tsx`'s `.slice(0, 2)` is the only place order is load-bearing** — nothing else reads or depends on array position.

## 3. Realm/lineage inconsistencies (flagged, not fixed)

These are judgment calls the same way Julia Holter's was — not a mechanical check, so treat confidence as stated, not certain.

**High confidence (parallel to the Holter case — genuinely the wrong genre for the sound, not just under-specified):**
- **Liz Phair** (`liz-phair`) — tagged `folk`, realm `folk-confessional`/`confessional`. *Exile in Guyville*-era Phair is 90s lo-fi indie rock, not folk by any reasonable reading. Reads closer to `american-underground`'s lo-fi/college-rock cluster than to this realm.
- **Have A Nice Life** (`have-a-nice-life`) — tagged `folk`, realm `folk-confessional`/`slowcore`. They're a drone/doom/blackgaze duo; "folk" doesn't describe this act at all. Closer to `post-rock-drone-noise`'s drone lineage.
- **Codeine** (`codeine`) — tagged `folk`, realm `folk-confessional`/`slowcore`. Foundational slowcore, not folk in any traditional sense.

**Medium confidence:**
- **Mitski** (`mitski`) — tagged `folk`. Generally classed as indie rock/art-pop; folk undersells the sound considerably.
- **Weyes Blood** (`weyes-blood`) — tagged `folk`. Baroque/chamber/art-pop (similar profile to Holter) more than folk.
- **Duster** (`duster`) — realm `emo-posthardcore`, lineage `midwest-emo`, tagged `["midwest-emo","indie-rock"]`. Duster is a slowcore/space-rock act; neither the lineage nor the genre tag reflects that, and the realm placement itself is questionable — they read closer to `folk-confessional`'s slowcore lineage (Codeine/Red House Painters territory) than to midwest emo.
- **Hum** (`hum`) — realm `emo-posthardcore`, lineage `midwest-emo`, tagged `["alt-rock","indie-rock"]`. The genre tags don't carry any emo/post-hardcore/midwest-emo signal at all, and Hum's actual sound (heavy, spacerock-adjacent alt-metal) doesn't obviously fit midwest-emo either — this one looks off at both the lineage and genre level simultaneously.

Beyond these individual cases, the systemic pattern stands: every electronic-realm and folk-confessional-realm artist's sole tag is a tautological restatement of the realm name, so "inconsistency" mostly doesn't apply there — the problem for those 88 artists isn't a wrong tag, it's zero information beyond what the realm field already says.
