# Genre Vocabulary Export — Scoping Report

Report only, no changes made. Computed directly from `data/seed-data.ts`.

## 1. Declared genre list

| id | name | parent | artist count |
|---|---|---|---|
| electronic | Electronic | underground | 59 |
| folk | Folk | underground | 48 |
| indie-rock | Indie rock | indie | 48 |
| art-rock | Art rock | indie | 24 |
| alt-rock | Alternative rock | indie | 23 |
| post-punk | Post-punk | indie | 23 |
| dream-pop | Dream pop | indie | 20 |
| art-pop | Art pop | art-rock | 19 |
| noise-rock | Noise rock | indie | 19 |
| post-hardcore | Post-hardcore | post-punk | 16 |
| shoegaze | Shoegaze | indie | 16 |
| post-rock | Post-rock | indie | 14 |
| hardcore-punk | Hardcore punk | underground | 11 |
| punk | Punk | indie | 11 |
| jangle-pop | Jangle pop | indie | 10 |
| chamber-pop | Chamber pop | indie-rock | 9 |
| emo | Emo | post-hardcore | 9 |
| lo-fi | Lo-fi | indie-rock | 9 |
| proto-punk | Proto-punk | indie | 9 |
| no-wave | No wave | post-punk | 8 |
| psychedelic-pop | Psychedelic pop | indie-rock | 8 |
| math-rock | Math rock | post-hardcore | 7 |
| goth | Gothic rock | post-punk | 6 |
| midwest-emo | Midwest emo | emo | 6 |
| dance-punk | Dance-punk | post-punk | 5 |
| neo-psychedelia | Neo-psychedelia | psychedelic-pop | 5 |
| alt-country | Alt-country | folk | 4 |
| ambient | Ambient | electronic | 4 |
| drone | Drone | indie | 4 |
| experimental-pop | Experimental pop | psychedelic-pop | 4 |
| krautrock | Krautrock | indie | 4 |
| garage-rock | Garage rock | alt-rock | 3 |
| industrial | Industrial | no-wave | 3 |
| power-pop | Power pop | indie | 3 |
| riot-grrrl | Riot grrrl | punk | 3 |
| synth-pop | Synth-pop | electronic | 3 |
| vaporwave | Vaporwave | electronic | 3 |
| darkwave | Darkwave | goth | 2 |
| freak-folk | Freak folk | folk | 2 |
| grunge | Grunge | alt-rock | 2 |
| minimalism | Minimalism | no-wave | 2 |
| britpop | Britpop | indie-rock | 1 |
| folk-punk | Folk punk | folk | 1 |
| hyperpop | Hyperpop | electronic | 1 |
| hypnagogic-pop | Hypnagogic pop | psychedelic-pop | 1 |
| trip-hop | Trip-hop | electronic | 1 |
| idm | IDM | electronic | 0 |
| indie | Indie | underground | 0 |
| underground | Underground | (none) | 0 |

**Declared genres with zero artists attached (3):** idm, indie, underground

**⚠️ Genre ids used by artists but NOT declared in the `genres` array:** bedroom-pop, art-punk

## 2. Lineage values by realm

### american-underground (55 artists)

| lineage | artist count |
|---|---|
| indie-rock | 21 |
| college-rock | 11 |
| noise-alt | 8 |
| neo-psych | 8 |
| psych | 7 |

### core (5 artists)

| lineage | artist count |
|---|---|
| ambient-drone | 1 |

**4 artist(s) in core have no lineage set.**

### electronic (58 artists)

| lineage | artist count |
|---|---|
| hyperpop-pcmusic | 13 |
| synth-pop | 9 |
| ambient-drone | 9 |
| electronic-indie-dancepunk | 7 |
| art-electronic | 7 |
| idm | 5 |
| krautrock | 4 |
| trip-hop-downtempo | 4 |

### emo-posthardcore (31 artists)

| lineage | artist count |
|---|---|
| midwest-emo | 12 |
| hardcore-roots | 9 |
| post-hardcore | 9 |
| math-rock | 1 |

### folk-confessional (50 artists)

| lineage | artist count |
|---|---|
| confessional | 16 |
| folk-roots | 14 |
| freak-folk | 8 |
| slowcore | 7 |
| indie-folk | 5 |

### post-rock-drone-noise (23 artists)

| lineage | artist count |
|---|---|
| post-rock | 9 |
| no-wave | 9 |
| drone | 5 |

### region-one (72 artists)

_No lineage values set on any artist in this realm._

**72 artist(s) in region-one have no lineage set.**

## 3. Tag-count distribution

| # tags | # artists |
|---|---|
| 0 | 0 |
| 1 | 124 |
| 2 | 141 |
| 3 | 27 |
| 4 | 2 |
| 5+ | 0 |

### Artists with exactly 1 genre tag, by realm

**american-underground (1):** Hüsker Dü [alt-rock]

**core (4):** Kraftwerk [krautrock], Can [krautrock], Neu! [krautrock], Brian Eno [electronic]

**electronic (44):** Silver Apples [electronic], Suicide [electronic], Cabaret Voltaire [electronic], Faust [electronic], Depeche Mode [electronic], The Human League [electronic], Orchestral Manoeuvres in the Dark [electronic], Gary Numan [electronic], The Knife [electronic], Sparks [electronic], Aphex Twin [electronic], Autechre [electronic], Boards of Canada [electronic], Squarepusher [electronic], Burial [electronic], Oneohtrix Point Never [electronic], Tim Hecker [electronic], Stars of the Lid [electronic], Grouper [electronic], Harold Budd [electronic], LCD Soundsystem [electronic], Hot Chip [electronic], The Postal Service [electronic], Four Tet [electronic], Caribou [electronic], The Rapture [electronic], !!! [electronic], Massive Attack [electronic], Portishead [electronic], Tricky [electronic], SOPHIE [electronic], A.G. Cook [electronic], 100 gecs [electronic], Charli XCX [electronic], Arca [electronic], Caroline Polachek [electronic], underscores [electronic], Jane Remover [electronic], Oklou [electronic], Ninajirachi [electronic], yeule [electronic], Porter Robinson [electronic], Björk [electronic], Imogen Heap [electronic]

**emo-posthardcore (8):** Fugazi [post-hardcore], Minutemen [hardcore-punk], Black Flag [hardcore-punk], Bad Brains [hardcore-punk], Dead Kennedys [hardcore-punk], Descendents [hardcore-punk], toe [math-rock], Jeff Rosenstock [hardcore-punk]

**folk-confessional (43):** Nick Drake [folk], Leonard Cohen [folk], Vashti Bunyan [folk], Townes Van Zandt [folk], Joni Mitchell [folk], Bob Dylan [folk], Neil Young [folk], Bert Jansch [folk], Roy Harper [folk], Karen Dalton [folk], Incredible String Band [folk], John Prine [folk], Joanna Newsom [folk], Sufjan Stevens [folk], Big Thief [folk], Adrianne Lenker [folk], Fleet Foxes [folk], Bon Iver [folk], Bright Eyes [folk], Elliott Smith [folk], Fiona Apple [folk], Jeff Buckley [folk], Mitski [folk], Phoebe Bridgers [folk], Sharon Van Etten [folk], Angel Olsen [folk], Weyes Blood [folk], Ethel Cain [folk], Snail Mail [folk], Japanese Breakfast [folk], Clairo [folk], Julia Holter [folk], Liz Phair [folk], Cat Power [folk], Red House Painters [folk], Mount Eerie [folk], Low [folk], Have A Nice Life [folk], Silver Jews [folk], Kurt Vile [folk], Mac DeMarco [folk], The Mountain Goats [folk], Codeine [folk]

**post-rock-drone-noise (8):** A Silver Mt. Zion [post-rock], Sigur Rós [post-rock], Mogwai [post-rock], Bark Psychosis [post-rock], Mono [post-rock], Explosions in the Sky [post-rock], Tortoise [post-rock], Do Make Say Think [post-rock]

**region-one (16):** The Stooges [proto-punk], New York Dolls [proto-punk], Joy Division [post-punk], Wire [post-punk], IDLES [post-punk], This Mortal Coil [dream-pop], Julee Cruise [dream-pop], Mazzy Star [dream-pop], My Bloody Valentine [shoegaze], Ride [shoegaze], Beach House [dream-pop], Fishmans [dream-pop], Parannoul [shoegaze], David Bowie [art-rock], The Modern Lovers [proto-punk], The Sound [post-punk]

### Artists whose only tag is their realm's umbrella genre

_"Umbrella genre" defined as: electronic→`electronic`, folk-confessional→`folk`, emo-posthardcore→`emo`, post-rock-drone-noise→`post-rock`. american-underground and region-one have no single umbrella genre tag in the vocabulary, so reported as N/A._

**electronic** (umbrella: `electronic`): 44 of 58 artists tagged with nothing but the umbrella — Silver Apples, Suicide, Cabaret Voltaire, Faust, Depeche Mode, The Human League, Orchestral Manoeuvres in the Dark, Gary Numan, The Knife, Sparks, Aphex Twin, Autechre, Boards of Canada, Squarepusher, Burial, Oneohtrix Point Never, Tim Hecker, Stars of the Lid, Grouper, Harold Budd, LCD Soundsystem, Hot Chip, The Postal Service, Four Tet, Caribou, The Rapture, !!!, Massive Attack, Portishead, Tricky, SOPHIE, A.G. Cook, 100 gecs, Charli XCX, Arca, Caroline Polachek, underscores, Jane Remover, Oklou, Ninajirachi, yeule, Porter Robinson, Björk, Imogen Heap

**folk-confessional** (umbrella: `folk`): 43 of 50 artists tagged with nothing but the umbrella — Nick Drake, Leonard Cohen, Vashti Bunyan, Townes Van Zandt, Joni Mitchell, Bob Dylan, Neil Young, Bert Jansch, Roy Harper, Karen Dalton, Incredible String Band, John Prine, Joanna Newsom, Sufjan Stevens, Big Thief, Adrianne Lenker, Fleet Foxes, Bon Iver, Bright Eyes, Elliott Smith, Fiona Apple, Jeff Buckley, Mitski, Phoebe Bridgers, Sharon Van Etten, Angel Olsen, Weyes Blood, Ethel Cain, Snail Mail, Japanese Breakfast, Clairo, Julia Holter, Liz Phair, Cat Power, Red House Painters, Mount Eerie, Low, Have A Nice Life, Silver Jews, Kurt Vile, Mac DeMarco, The Mountain Goats, Codeine

**emo-posthardcore** (umbrella: `emo`): 0 of 31 artists tagged with nothing but the umbrella — (none)

**post-rock-drone-noise** (umbrella: `post-rock`): 8 of 23 artists tagged with nothing but the umbrella — A Silver Mt. Zion, Sigur Rós, Mogwai, Bark Psychosis, Mono, Explosions in the Sky, Tortoise, Do Make Say Think

**american-underground:** no single umbrella genre id exists for this realm in the vocabulary (its artists are tagged with specific genres like `indie-rock`, `noise-rock`, `alt-country`, etc., not a realm-wide catch-all) — N/A for this check.

**region-one:** same — no realm-wide umbrella genre id exists; region-one artists carry specific genres (`post-punk`, `shoegaze`, `dream-pop`, etc.) — N/A for this check.

## 4. Consumption sites

All confirmed, plus three you didn't mention:

| File : line | How `genres[]` is treated |
|---|---|
| `components/artist/ArtistCard.tsx:12-15` | `.slice(0, 2)` — only the first two entries ever render on browse cards, joined with " · ". **Order is load-bearing here today**, not just once artists carry 4-5 tags. |
| `components/graph/ArtistPanel.tsx:174-176` | Maps the **full** array, one `<span class="panel-tag">` chip per genre, in array order. No truncation, but visual left-to-right order follows array order. |
| `components/browse/BrowseClient.tsx:33` | `activeGenre` filter uses `.includes()` — order-independent, membership test only. |
| `components/browse/BrowseClient.tsx:42-53` | `topGenres` — counts every tag across all artists, takes the top 8 by frequency, renders as filter chips. Order-independent (aggregation, not per-artist display). |
| `app/genre/[genre]/page.tsx:64` | `.includes('shoegaze')` — hardcoded literal string, order-independent. This is the *only* genre-specific filter in the whole codebase; every other genre id has no equivalent artist-list query at all (see §5). |
| `app/(graph)/artist/[slug]/page.tsx:39,47` | Maps the **full** array (not sliced) into a comma-joined string used as a subtitle line under the artist name on the full artist page. Array order determines reading order of that line, e.g. "Shoegaze, Dream pop" vs "Dream pop, Shoegaze." |
| **`components/graph/GraphView.tsx:56`** *(not in your list)* | Reads a `?genre=` URL search param, filters `graphData.artists` via `.includes()`, and highlights the matching artist ids as a cluster on the force graph itself. This is the target of every "See it light up the graph" button — order-independent. |
| **`components/browse/BrowseClient.tsx` genreNames map (line 21)** *(not in your list)* | Builds an id→name lookup object from the full `genres` array (not per-artist `genres[]`, but adjacent — flagging since it's the same data source ArtistCard's labels come from). |
| **`scripts/build-graph.ts:432`** *(not in your list)* | Passes `graphData.genres` (the declared vocabulary, not per-artist tags) straight through into `public/graph.json` unmodified at build time — no per-artist genre transformation happens in the build pipeline at all. Confirms retagging only needs to touch `seed-data.ts`. |

**Two adjacent things worth knowing before committing to an ordering convention:**
- `lib/colors.ts`'s `GENRE_COLORS` map (line 313) only assigns a distinct color to **13 of the 49 declared genre ids** (mostly region-one-era genres: shoegaze, dream-pop, post-punk, goth, dance-punk, proto-punk, art-rock, underground, indie, indie-rock, alt-rock, noise-rock, jangle-pop, power-pop). Every other genre — everything electronic, folk, emo, post-rock, and american-underground added later — falls through to `DEFAULT_GENRE_COLOR` (`#8891F2`, indigo). This affects genre-page accent colors (see §5) but not the graph itself, which colors by realm/layer, not genre.
- `ForceGraph.tsx` never reads `artist.genres` directly — it only consumes a pre-computed `highlightSetIds` array that `GraphView.tsx` produces. Not a separate consumption site, just downstream of the one above.

## 5. Genre pages

**Confirmed: only `shoegaze` is authored.** `app/genre/[genre]/page.tsx` has a single hardcoded set, `BUILT_GENRES = new Set(['shoegaze'])` (line 16) — every one of the other 48 declared genre ids (including the 3 with zero artists) hits the same generic branch.

**What the generic branch actually renders** (line 39-59): a title, one fixed paragraph of boilerplate text ("This genre story is coming in a future update. The graph already includes {genre} artists — explore them on the graph."), and a single "Open graph →" link to the homepage. **It does not degrade gracefully from the authored template — it's a structurally different, much simpler page that never queries the artist list, never shows a count, and never renders `ArtistCircleGrid` or `AlbumGrid` at all.** There is no "mostly-empty sections" failure mode to worry about, because the stub never builds those sections in the first place. This holds identically whether the genre has 59 artists (`electronic`) or 0 (`idm`, `indie`, `underground`) — the stub page for `idm` and the stub page for `electronic` are byte-for-byte the same template with a different name substituted in.

**The shoegaze page itself would not degrade gracefully if reused as-is for a sparse genre.** Its structure (`pioneers` = `activeFrom < 1995`, `modern` = `activeFrom >= 1995`, split into two `ArtistCircleGrid`s, plus a chronologically-sorted `AlbumGrid`) assumes enough artists to populate multiple sections meaningfully. A genre with 2-4 artists split across those two buckets would likely render one populated grid and one with 0-1 entries — `ArtistCircleGrid`/`AlbumGrid` weren't checked for an explicit empty state in this pass, so treat "does a near-empty grid look intentional or broken" as an open question for whichever genres get the next authored treatment.

**One more finding relevant to scoping which genres are worth authoring next:** there's no genre index/directory page anywhere in the app. `TopNav.tsx`'s only genre-related link is hardcoded to `/genre/shoegaze` directly (labeled "Genres" but pointing at one specific genre, not a list). The only other way to reach a `/genre/[id]` route is a direct URL or the "View in graph" style buttons that already assume you're on that page. If more genres get authored content, they'll need their own discovery path — right now shoegaze is reachable from nav and nothing else is.

