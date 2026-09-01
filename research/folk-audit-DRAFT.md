# Folk & Confessional Realm: Influence Audit — DRAFT (Layer 1 of 3)

**Status: DRAFT / LAYER 1 ONLY.** This document is pure sourcing research. Nothing in it has been written to `data/seed-data.ts` or any other file. No nodes or edges exist in code. Per the 3-layer review process: **Layer 1 (this document) = source. Layer 2 = assistant flags. Layer 3 = human decides.** Nothing here should be treated as approved.

Modeled directly on the precedent document for the electronic realm, `island-two/influence-audit-proposal.md` (read in full before starting this one) — same schema grounding, same edge convention, same internal/bridge tagging, same standard of "verified edges only, real named publication/interview + literal quote or specific documented fact, never a vague blanket claim," same practice of flagging thin cases honestly instead of padding them.

**Methodology note (specific to this document):** the underlying research was split across five parallel passes, one per lineage family below, each with independent web-search/fetch access and no visibility into the other four families' findings. This compilation pass then cross-referenced all five for shared targets — several artists clear the 2-edge bar only once edges sourced by *different* families are combined (Townes Van Zandt, Nick Drake, and the Bright Eyes/Conor Oberst summon are the clearest examples; each is called out explicitly where it happens). The rule applied throughout: **an edge counts toward both its endpoints' totals regardless of whether the other endpoint is an existing Starweave node, another artist in this roster, or a summon candidate that itself doesn't (yet) clear the bar** — a sourced edge is a sourced edge; whether the far end becomes a real node is a separate, later decision for the human reviewer. This is a slightly more literal reading of "2+ connecting edges to earn a node" than the electronic-realm precedent's final summary appears to have applied (see Section 8 for where this changes an outcome), stated explicitly here rather than left implicit.

---

## 0. Grounding in the real data (read directly from source, not assumed)

Source files read: `data/types.ts`, `data/seed-data.ts`, `island-two/influence-audit-proposal.md` (Starweave repo, as of this audit).

### 0.1 Exact node (Artist) schema — `data/types.ts`

```ts
export interface Artist {
  id: string;
  name: string;
  layer: Layer;           // 'root' | 'post-punk' | 'shoegaze-dreampop' | 'indie-alt' | 'outside'
  genres: string[];
  scope: Scope[];          // 'shoegaze-dreampop-v1' | 'indie' | 'underground'
  country?: string;
  activeFrom?: number;
  bio?: string;
  classicAlbums?: Album[];
  spotifyId?: string | null;
  musicbrainzId?: string | null;
  signatureSong?: string;
  realm?: Realm;            // 'core' | 'region-one' | 'electronic' — NOTE: no 'folk' value exists yet
  lineage?: Lineage;         // currently an electronic-only enum — NOTE: no folk lineage values exist yet
  imageUrl?: string | null;
  previewUrl?: string | null;
  previewTrack?: string | null;
  previewAlbum?: string | null;
  influenceScore?: number;
}
```

**Type-system flag, called out up front:** `Realm` is currently `'core' | 'region-one' | 'electronic'` — there is no `'folk'` value. `Lineage` is currently the 8-value electronic-only enum (`krautrock` | `synth-pop` | `idm` | `ambient-drone` | `electronic-indie-dancepunk` | `trip-hop-downtempo` | `hyperpop-pcmusic` | `art-electronic`) — there is no folk lineage value either. **If any part of this proposal is adopted, both types need extending** (`Realm` gains `'folk'`; `Lineage` gains the five family names used as lineage values below: `folk-roots`, `freak-folk`, `confessional`, `slowcore-sadcore`, `indie-folk-songwriter`). That is a Layer 3 (human) decision and a code change — explicitly out of scope for this document.

### 0.2 Exact edge (Edge) schema — `data/types.ts`

```ts
export interface Edge {
  // CONVENTION: source = the INFLUENCED artist (the disciple),
  //             target = the INFLUENCE (the root/master).
  // The arrow is drawn source -> target, i.e. it points BACK toward the root.
  source: string;
  target: string;
  type: EdgeType;      // 'influence' | 'contemporary' | 'similarity'
  status: EdgeStatus;   // 'verified' | 'ai-suggested'
  confidence: number;
  citation?: string | null;
}
```

### 0.3 Exact edge-creation helper — `data/seed-data.ts`

```ts
const inf = (
  source: string,
  target: string,
  confidence = 0.8,
  status: Edge['status'] = 'verified',
): Edge => ({ source, target, type: 'influence', status, confidence, citation: null });
```

**Convention confirmed from code:** `inf('a', 'b')` means **a was influenced by b**. Every edge below follows that reading: `a → b` means "a, influenced by b."

**Hard rule applied throughout, per this audit's explicit brief:** verified edges only — there is no `ai-suggested` tier in this document. Anywhere a genuine, specific, checkable source could not be found, the edge is marked **UNSOURCED** or simply omitted — never invented.

### 0.4 How node IDs are formed

Same loose, hand-authored kebab-case convention as the existing 106 nodes (strips a leading "The" inconsistently; no fixed rule). Every id proposed below is a **new** proposal, not verified against any existing literal — because none of these artists exist in `data/seed-data.ts` yet (with the two exceptions noted in 0.6).

### 0.5 Full current Starweave node ID list (106 nodes, as they exist in `data/seed-data.ts` today)

**CORE (5):** `velvet-underground`, `kraftwerk`, `can`, `neu`, `brian-eno`

**REGION-ONE (57):** `nico`, `television`, `talking-heads`, `big-star`, `the-stooges`, `new-york-dolls`, `joy-division`, `new-order`, `the-cure`, `siouxsie-and-the-banshees`, `the-smiths`, `gang-of-four`, `nick-cave-and-the-bad-seeds`, `wire`, `the-birthday-party`, `fontaines-dc`, `idles`, `the-jesus-and-mary-chain`, `cocteau-twins`, `this-mortal-coil`, `julee-cruise`, `the-sundays`, `mazzy-star`, `my-bloody-valentine`, `slowdive`, `ride`, `lush`, `broadcast`, `beach-house`, `deerhunter`, `alvvays`, `wolf-alice`, `silversun-pickups`, `fishmans`, `sweet-trip`, `parannoul`, `pixies`, `sonic-youth`, `dinosaur-jr`, `husker-du`, `the-replacements`, `pavement`, `yo-la-tengo`, `rem`, `radiohead`, `the-stone-roses`, `interpol`, `the-strokes`, `yeah-yeah-yeahs`, `geese`, `built-to-spill`, `modest-mouse`, `blur`, `stereolab`, `fugazi`, `minor-threat`, `david-bowie`

**ELECTRONIC (44):** `silver-apples`, `suicide`, `cabaret-voltaire`, `faust`, `depeche-mode`, `the-human-league`, `omd`, `gary-numan`, `the-knife`, `sparks`, `aphex-twin`, `autechre`, `boards-of-canada`, `squarepusher`, `burial`, `oneohtrix-point-never`, `tim-hecker`, `stars-of-the-lid`, `grouper`, `harold-budd`, `lcd-soundsystem`, `hot-chip`, `the-postal-service`, `four-tet`, `caribou`, `the-rapture`, `chk-chk-chk` (this is "!!!"), `massive-attack`, `portishead`, `tricky`, `sophie`, `a-g-cook`, `100-gecs`, `charli-xcx`, `arca`, `caroline-polachek`, `underscores`, `jane-remover`, `oklou`, `ninajirachi`, `yeule`, `porter-robinson`, `bjork`, `imogen-heap`

### 0.6 Two roster names already exist as nodes

- **Nico** (`nico`, region-one, layer `root`) — she was on the folk-roots research list. She is carried through Section 2 as an *edge-only* candidate (same treatment the precedent gave Kraftwerk/Can/Neu!/New Order): no new node is proposed for her.
- **Grouper** (`grouper`, electronic realm, lineage `ambient-drone`) — she was on the indie-folk-songwriter research list. Same edge-only treatment in Section 6.

### 0.7 Existing genre ids (hierarchical)

`underground` (root) → `indie`, `electronic` (both parent `underground`) → `art-rock`, `proto-punk`, `post-punk`, `jangle-pop`, `power-pop`, `shoegaze`, `dream-pop`, `noise-rock`, `alt-rock`, `indie-rock`, `krautrock` (all parent `indie`) → `goth`, `dance-punk`, `post-hardcore` (all parent `post-punk`).

**New genre ids proposed across this audit** (compiled and deduplicated in Section 8.4) — none of these currently exist and would need adding to `data/seed-data.ts`'s `genres` array if adopted.

---

## 1. Full folk-and-confessional candidate roster held in context (all families, for correct internal/bridge tagging)

- **folk-roots** (elders): Nick Drake, Leonard Cohen, Vashti Bunyan, Townes Van Zandt, Joni Mitchell, Nico*
- **freak-folk:** Joanna Newsom, Sufjan Stevens, Big Thief, Adrianne Lenker, Fleet Foxes, Bon Iver
- **confessional:** Elliott Smith, Fiona Apple, Jeff Buckley, Mitski, Phoebe Bridgers, Sharon Van Etten, Angel Olsen, Weyes Blood, Ethel Cain, Snail Mail, Japanese Breakfast, Clairo, Julia Holter, Tori Amos, Liz Phair, Amy Winehouse
- **slowcore-sadcore:** Red House Painters, Sun Kil Moon, Songs: Ohia, Silver Jews, Purple Mountains, Low, Carissa's Wierd, Mount Eerie, The Microphones, Have A Nice Life, Giles Corey
- **indie-folk-songwriter:** Kurt Vile, Mac DeMarco, Men I Trust, The Mountain Goats, Grouper*, Natalia Lafourcade

*Already exists as a node in a different realm — see 0.6.

45 candidates total (43 net-new node proposals + 2 existing-node edge-additions).

---

## 2. Family: folk-roots

*Lineage value proposed: `folk-roots`.*

### Nick Drake · `nick-drake` · family: folk-roots
genres: `folk`, `singer-songwriter`
scene: Joe Boyd's Witchseason/Sound Techniques London folk stable (1968–72), alongside Fairport Convention, John Martyn, the Incredible String Band

Edges:
- `rem → nick-drake` [bridge] — Wikipedia/Nick Drake, "Legacy": by the mid-1980s Drake was cited as an influence by "Kate Bush, Paul Weller, the Black Crowes, Peter Buck of R.E.M. and Robert Smith of the Cure."
- `radiohead → nick-drake` [bridge] — same Wikipedia legacy passage: contemporary artists influenced by Drake include "...Bon Iver, Alexi Murdoch, Philip Selway of Radiohead, Steven Wilson, and Brian Molko of Placebo."
- `the-cure → nick-drake` [bridge] — Robert Smith, Word magazine: "Nick Drake and Van Morrison were my touchstones" when the Cure were starting out; on *Wild Mood Swings*: "I actually wanted it to be like a Nick Drake album... approached this producer called Haydn Bendall, who'd worked with Kate Bush and done the strings for Nick Drake." Also called Drake "the British inverse of Jimi Hendrix" (FarOut Magazine).
- `mazzy-star → nick-drake` [bridge] — David Roback (Mazzy Star), 1990: "I've listened to Nick Drake – there is a certain feeling in his music that I find very tangible and sad."
- `nick-drake → bert-jansch` [internal, → summon] — Joe Boyd (Drake's producer): Drake "had listened to Dylan and Bert Jansch and Donovan." Corroborated: Drake had mastered guitar licks from Jansch's debut LP; Jansch's "Strolling Down the Highway" was a staple of Drake's own 1967–68 busking sets in Aix-en-Provence.
- `sufjan-stevens → nick-drake` [internal] *(sourced by the freak-folk pass)* — The National, citing a 2006 interview: as a 10-year-old, Stevens listened to cassettes of Nick Drake and Neil Young his stepfather Lowell Brams had mailed him; corroborated by his 2021 cover of "Pink Moon."
- `adrianne-lenker → nick-drake` [internal, critic-comparison] *(sourced by the freak-folk pass)* — The Line of Best Fit, reviewing Lenker's *Songs and Instrumentals* (2020): the record evokes "the bare folk of Fairport Convention, Nick Drake and Vashti Bunyan." Flagged: critic comparison, not Lenker's own words.

**Verified edge count: 7** (5 from folk-roots research + 2 merged in from the freak-folk pass — see this document's methodology note). No flag on threshold.

**Notes:** Drake gave almost no interviews; his own stated influences (Dylan, Jansch, Donovan, Django Reinhardt, Miles Davis, Paul Simon, Randy Newman, the Beach Boys) come entirely through his mother's testimony and producer Joe Boyd's recollections — only the Jansch connection maps to a valid target. A claimed Beach House/Slowdive lineage recurs constantly in dream-pop criticism but no direct band-member quote naming Drake could be pinned down — excluded rather than forced.

### Leonard Cohen · `leonard-cohen` · family: folk-roots
genres: `folk`, `singer-songwriter`
scene: Montreal literary/poetry scene → NYC Chelsea Hotel folk scene, 1960s

Edges:
- `nick-cave-and-the-bad-seeds → leonard-cohen` [bridge] — Nick Cave: "I discovered Leonard Cohen with 'Songs of Love and Hate.' I listened to this record for hours... this was the first record that really had an effect on me... he is the symbol of my musical independence." Also: "For many of us Leonard Cohen was the greatest songwriter of them all."
- `fontaines-dc → leonard-cohen` [bridge, ⚠ needs re-verification — source could not be re-fetched] — Reverb.com interview reportedly has Carlos O'Connell naming Leonard Cohen (alongside Elliott Smith) among Fontaines D.C.'s influences; separately, Grian Chatten spent an extended stay on Hydra, the Greek island where Cohen lived and wrote in the 1960s (Evening Standard, Oct 2020) — biographical color, not itself an influence claim.

**Verified edge count: 2.** No flag on threshold — but the second edge is caveated, see Section 8.3.

**Notes:** Cohen's own touchstones (Federico García Lorca, Irving Layton, Walt Whitman, Woody Guthrie, Ray Charles, Hank Williams) are real and sourced but map to no valid target — he is structurally a pure influence-giver here. **Rejected leads:** an Ian Curtis/Joy Division–Cohen connection could not be verified despite searching (FarOut's own "musicians that inspired Ian Curtis" piece names Bowie, Iggy Pop, Jim Morrison, Kraftwerk — not Cohen). Cohen's brief romantic relationship with Nico (per Sylvie Simmons' biography *I'm Your Man*) reportedly inspired several of his songs and he wrote two for her, but this reads as personal-muse material, not a sound-influence claim, and no edge was forced from it.

### Vashti Bunyan · `vashti-bunyan` · family: folk-roots
genres: `folk`, `singer-songwriter`
scene: mid-60s Andrew Loog Oldham pop-folk scene → British folk revival/commune scene, alongside the Incredible String Band and Donovan

Edges:
- `vashti-bunyan → incredible-string-band` [internal, → summon] — Wikipedia/Vashti Bunyan: ISB member Robin Williamson played on her 1970 debut *Just Another Diamond Day*; she and partner Robert Lewis subsequently settled at ISB's Glen Row cottages in the Scottish Borders.
- `oklou → vashti-bunyan` [bridge] — Oklou's 2025 NTS "Choke Soundscape" guest mix, curating the influences behind *Choke Enough*, explicitly included Vashti Bunyan.
- `devendra-banhart → vashti-bunyan` [internal, → near-miss summon] — Wikipedia/Devendra Banhart: "Banhart has cited Vashti Bunyan, Simón Díaz, Nusrat Fateh Ali Khan, Arthur Russell, Ali Farka Touré, and Caetano Veloso as being his main influences."
- `animal-collective → vashti-bunyan` [internal, → near-miss summon] — Wikipedia/Animal Collective: fans of *Just Another Diamond Day*, the group had dinner with Bunyan and asked her to collaborate, resulting in her lead vocal on the *Prospect Hummer* EP (2005).
- `joanna-newsom → vashti-bunyan` [internal, collaboration-credit, not a stated-influence quote] — Newsom is a featured guest musician on Bunyan's 2005 comeback album *Lookaftering*.

**Verified edge count: 5.** No flag — unusually well-documented as an influence-receiver.

**Notes:** Bunyan's own stated influences (Bob Dylan, Derroll Adams) don't map to valid targets. Her link to Donovan (his abortive Isle of Skye commune plan prompted the 1968 horse-and-cart journey chronicled on the album) and her 1965 discovery by Andrew Loog Oldham are real but biographical, not sound-influence claims — neither is a valid node regardless.

### Townes Van Zandt · `townes-van-zandt` · family: folk-roots
genres: `folk`, `country-folk`
scene: Texas outlaw/progressive country songwriter circle (Houston/Austin), alongside Guy Clark and Blaze Foley

Edges:
- `bright-eyes → townes-van-zandt` [internal, → summon; ⚠ needs re-verification] — Conor Oberst, on the influences behind *I'm Wide Awake, It's Morning* (NPR, 2007 — transcript could not be re-fetched to confirm exact placement): being "very heavily influenced by like Jackson Browne and Joni Mitchell and Gram Parsons... [and] Townes Van Zandt." Oberst has separately said, "Townes is the deep, dark part that I carry around."
- `grouper → townes-van-zandt` [bridge] *(sourced by the indie-folk-songwriter pass)* — Digital in Berlin, Liz Harris's "5 favorite albums" interview: named Townes Van Zandt's *Live at the Old Quarter, Houston, Texas* among her five all-time favorites.

**Verified edge count: 2** (1 from folk-roots research + 1 merged in from the indie-folk-songwriter pass, crossing the bar only once combined — see methodology note). Thin, borderline — flagged for attention rather than confidently passing.

**Notes:** Van Zandt's own influences (Lightnin' Hopkins, Bob Dylan, Hank Williams, Muddy Waters, Blind Willie McTell) are extensively documented but none map to a valid target. His closest real-world relationships — Guy Clark, Blaze Foley — are genuine but don't connect to a second roster/family target. No sourced connection was found between Van Zandt and any shoegaze/dream-pop/indie/electronic Starweave node directly; his only two connections into this graph run through two other new folk-realm nodes (Bright Eyes and Grouper), not through the pre-existing 106.

### Joni Mitchell · `joni-mitchell` · family: folk-roots
genres: `folk`, `singer-songwriter`
scene: Laurel Canyon singer-songwriter scene, California, late 1960s–70s

Edges:
- `bright-eyes → joni-mitchell` [internal, → summon; ⚠ needs re-verification] — same Conor Oberst NPR quote as above.
- `bjork → joni-mitchell` [bridge] — Rolling Stone, "15 Great Artists Influenced by the 'Blue' Singer": Björk cited Mitchell's *Don Juan's Reckless Daughter* (1977) as an all-time favorite (2011); reaffirmed to Pitchfork (2015): "I really love Joni Mitchell."
- `david-bowie → joni-mitchell` [bridge, looser framing] — Bowie, Playboy interview with Cameron Crowe: "Joni Mitchell has our hearts."

**Verified edge count: 3.** No flag.

**Notes:** Mitchell's own influences (Lambert, Hendricks & Ross; Piaf; Miles Davis; Debussy; Pete Seeger's songbook) map to no valid target — she is a pure influence-giver here. A claimed Cocteau Twins connection via her song "Amelia" recurs in fan circles but no named critic or Robin Guthrie quote could be attached — excluded.

### Nico · exists (`nico`) · edge-only addition, NOT a new node
**Current graph state:** Nico has exactly one existing edge, `nico → velvet-underground` (0.9). No folk-lineage edges exist yet.

**Proposed new folk-lineage edges: none survived sourcing. Verified edge count: 0.** FAILS-BAR — flagged as a genuine sourcing gap, not a shortcut.

**Notes:** *Chelsea Girl*'s folk-adjacency comes almost entirely from its songwriters (Jackson Browne, Bob Dylan, Tim Hardin), none of whom are valid targets, and there's no source suggesting Nico's own sound was shaped by, or shaped, any of the other five folk-roots artists here. **Important cross-family flag:** Nico's much better-documented influence lineage — as a goth/post-punk influence-giver via *The Marble Index*/*Desertshore* (Robert Smith, Björk, Peter Hook, Morrissey, Peter Murphy of Bauhaus have all named her/those records specifically, per her own Wikipedia Legacy section) — is real and heavily sourced, but belongs to a different family entirely, not folk-roots. Recommend the human reviewer not tag her with a folk lineage on the strength of this research pass.

---

## 3. Family: freak-folk

*Lineage value proposed: `freak-folk`.*

A structural note stated honestly rather than smoothed over: this family sits almost entirely outside the sonic lineage of Starweave's existing 106 nodes. The touchstones these six artists actually name — Dylan, Neil Young, Nick Drake, Roy Harper, Karen Dalton, The Band — are almost never valid roster/bridge ids, because the existing graph is a post-punk/shoegaze/krautrock/hyperpop lineage, not a folk-revival one. That produces genuinely thin per-artist counts, reported honestly below rather than padded.

### Joanna Newsom · `joanna-newsom` · family: freak-folk
genres: `freak-folk`, `chamber-folk`
scene: 2000s "freak-folk"/New Weird America scene (Devendra Banhart, Vetiver, CocoRosie), Drag City

Edges:
- `joanna-newsom → karen-dalton` [internal, → summon; source-chain caveat] — Karen Dalton's Wikipedia article (citing *Vogue*, 2015) states Newsom has named Dalton an influence, feeding into Newsom's own vocal timbre; the primary *Vogue* text could not be independently re-fetched to confirm exact wording.
- `fleet-foxes → joanna-newsom` [internal] — Seattle Weekly, "An Incomplete History of the Musical Relationship Between Joanna Newsom and Robin Pecknold": Pecknold opened solo tours for Newsom (2010), covered her "On a Good Day," and reviewers describe him as heavily influenced by her while writing *Helplessness Blues*; Newsom reciprocally named "Blue Spotted Tail" her favorite Fleet Foxes song.
- `joanna-newsom → roy-harper` [internal, → summon] — BOMB Magazine, Roy Harper interviewing Newsom directly: "*Stormcock* quickly became, and has remained, my favorite album... you have influenced the way I write."
- `joanna-newsom → vashti-bunyan` [internal, collaboration-credit] *(cross-referenced from the folk-roots pass)* — guest musician on Bunyan's *Lookaftering* (2005).

**Verified edge count: 4** (the researching agent reported 2, not having visibility into the Roy Harper summon section or the folk-roots pass's Vashti Bunyan entry — both add distinct edges once merged). No flag.

**Notes:** Newsom's own strongest, most direct influence statement is to Roy Harper. Newsom has stated she had *not* heard Bunyan's *Just Another Diamond Day* when she made her own debut — evidence *against* a Bunyan-influenced-Newsom edge, which is why that direction was not created despite the two being constantly grouped by critics.

### Sufjan Stevens · `sufjan-stevens` · family: freak-folk
genres: `indie-folk`, `chamber-folk`
scene: Asthmatic Kitty Records (co-founded with stepfather Lowell Brams)

Edges:
- `sufjan-stevens → nick-drake` [internal] — see Nick Drake entry (Section 2).

**Verified edge count: 1.** FAILS-BAR.

**Notes:** A hard case structurally, similar to Burial in the electronic-realm precedent. Everything else Stevens names by name — Prince ("Prince really wasn't of this world," The Creative Independent), Steve Reich, Neil Young — is off-roster. A frequently-repeated claim that Stevens was shaped by "Brian Eno and Steve Reich['s] cathedrals of atmosphere" traces only to unattributed Apple Music editorial copy, **not** a Stevens quote or named critic — deliberately excluded and marked UNSOURCED even though `brian-eno` is a core node and this would have been the single most useful edge available. Flagged explicitly for human follow-up in Section 8.3. His real professional relationship with Justin Vernon (Bon Iver) — recording at April Base, a 2024 CARM collaboration — is collaboration, not stated influence either direction, left unscored.

### Big Thief · `big-thief` · family: freak-folk
genres: `indie-folk`, `freak-folk`
scene: none identified (DIY Brooklyn/upstate-NY indie; Saddle Creek then 4AD)

Edges:
- `big-thief → my-bloody-valentine` [bridge, critic-comparison] — Rolling Stone Australia, reviewing *Double Infinity* (2025): "All Night All Day" opens like a "hand-carved My Bloody Valentine."
- `phoebe-bridgers → big-thief` [internal, ⚠ needs re-verification] *(cross-referenced from the confessional pass's prose notes, not originally formatted as a clean edge by either researcher)* — Variety (2021) reportedly has Bridgers naming Big Thief among her pandemic-era listening/personal influences. Neither researcher pinned an exact article title or quote for this — presented here as a **provisional** second edge, not a confirmed one.

**Verified edge count: 1 confirmed + 1 provisional (pending citation verification).** FAILS-BAR on confirmed evidence alone; would clear the bar if the Variety citation is confirmed — flagged for a human/follow-up pass rather than asserted as passing.

**Notes:** Band members' own named influences (Rilo Kiley, Crazy Horse, Townes Van Zandt and John Prine via Buck Meek) are off-roster. Critic comparisons to Cocteau Twins/Kate Bush/Pixies were hedged and not first-person — excluded.

### Adrianne Lenker · `adrianne-lenker` · family: freak-folk
genres: `indie-folk`, `freak-folk`
scene: none

Edges:
- `adrianne-lenker → nick-drake` [internal, critic-comparison] — see Nick Drake entry (Section 2).

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Lenker has directly named Elliott Smith, Joni Mitchell, and Leonard Cohen as teenage influences (Stereogum) — all real but map to no *additional* valid target beyond what's already counted for other artists (a `adrianne-lenker → elliott-smith` edge is plausible but was not independently sourced by either the freak-folk or confessional researcher — flagged as a likely-findable gap for a follow-up pass). Buck Meek reportedly introduced her to Townes Van Zandt and John Prine — same off-roster problem. A promising lead, `adrianne-lenker → grouper` (bandmate James Krivchenia reportedly introduced her to Grouper's *Ruins*), could only be traced to a low-credibility fan-blog aggregation — marked **UNSOURCED** per the hard rule rather than included, but flagged strongly for human follow-up since a primary-source confirmation would bridge her directly into an existing electronic-realm node.

### Fleet Foxes · `fleet-foxes` · family: freak-folk
genres: `indie-folk`, `chamber-folk`
scene: Sub Pop

Edges:
- `fleet-foxes → joanna-newsom` [internal] — see Joanna Newsom entry.
- `fleet-foxes → roy-harper` [internal, → summon] — Louder Sound's *Stormcock* retrospective and multiple corroborating pieces: the 12-string textures on *Helplessness Blues* were directly shaped by Harper's *Stormcock*, per Pecknold's own account of the album's sonic pivot.

**Verified edge count: 2.** Thin but real, clears the bar.

**Notes:** Pecknold's other frequently-quoted touchstones (Van Morrison's *Astral Weeks*, Dylan, Neil Young, Brian Wilson) are real and sourced but off-roster.

### Bon Iver · `bon-iver` · family: freak-folk
genres: `indie-folk`, `chamber-folk`
scene: April Base studio / Eaux Claires festival (Justin Vernon), Jagjaguwar

Edges:
- `bon-iver → radiohead` [bridge, ⚠ sourced at one remove] — per Wikipedia's Bon Iver article, citing Pitchfork's review of *22, A Million*, likened to Radiohead's *Kid A*; this is Wikipedia paraphrasing Pitchfork, not a Vernon quote, and the primary review text could not be independently re-fetched to confirm exact wording.

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Vernon's own most emphatic, well-documented influences — Springsteen's *Nebraska*, Dylan's *Basement Tapes* (AV Club, on the DIY approach behind *For Emma*) — are off-roster. A widely-repeated "influenced by Nick Drake, Peter Gabriel, Indigo Girls, John Prine, Bruce Springsteen" claim traces only to a TVTropes-style aggregator — excluded.

---

## 4. Family: confessional

*Lineage value proposed: `confessional`. The largest family — 16 artists, all researched, none skipped.*

### Elliott Smith · `elliott-smith` · family: confessional
genres: `singer-songwriter`, `indie-folk`, `lo-fi`
scene: Portland/Pacific Northwest lo-fi indie (Heatmiser alum, Kill Rock Stars)

Edges:
- `elliott-smith → big-star` [bridge] — Wikipedia/Elliott Smith, "Musical style and influences": named among a long list including the Beatles, Big Star, Television, Fugazi, Built to Spill. Corroborated by his own cover of Big Star's "Thirteen."
- `elliott-smith → television` [bridge] — same passage.
- `elliott-smith → fugazi` [bridge] — same passage.
- `elliott-smith → built-to-spill` [bridge] — same passage.
- `phoebe-bridgers → elliott-smith` [internal] — Wikipedia/Phoebe Bridgers: "cited Elliott Smith as one of her favorite artists and the biggest influence on her songwriting and production style." Corroborated, NPR: "It's like The Beatles to me, and I mean that in every way."
- `clairo → elliott-smith` [internal] — Wikipedia/Elliott Smith, "Legacy" passage naming artists who've cited or covered him, including Clairo.
- `snail-mail → elliott-smith` [internal] — Wikipedia/Snail Mail, "Influences": "Her other influences include Fiona Apple, Cat Power, Elliott Smith, Bon Iver, Sufjan Stevens, My Bloody Valentine and Sheer Mag."

**Verified edge count: 7.** No flag — the strongest convergence hub in this family.

**Notes:** Smith functions as a major generational pivot: he's both a disciple of the region-one/Big Star/Television lineage and one of the most-cited influences for the entire 2010s–2020s confessional cohort.

### Fiona Apple · `fiona-apple` · family: confessional
genres: `singer-songwriter`, `art-pop`, `jazz-pop`
scene: none

Edges:
- `snail-mail → fiona-apple` [internal] — Wikipedia/Snail Mail, "Influences."

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Apple's own documented influences (Billie Holiday, Ella Fitzgerald) are off-roster. **Rejected:** a recurring "Tori Amos → Fiona Apple" lineage framing (The Dowsers: Apple "followed Amos to the piano bench") is a critic's genre-lineage argument, not Apple's own words, and sits in direct tension with Apple's own 1997 SPIN remark dismissing the Amos comparison — excluded as contested.

### Jeff Buckley · `jeff-buckley` · family: confessional
genres: `singer-songwriter`, `alt-rock`
scene: none (NYC Sin-é café scene, early '90s)

Edges:
- `radiohead → jeff-buckley` [bridge] — Wikipedia/Jeff Buckley: "Thom Yorke said Buckley gave him the confidence to sing in falsetto"; Radiohead recorded "Fake Plastic Trees" after Yorke saw Buckley perform live in London (1994).
- `mitski → jeff-buckley` [internal] — Wikipedia/Mitski: "Mitski's music tastes developed after discovering Jeff Buckley, and later, Björk, M.I.A. and Sheena Ringo."
- `lana-del-rey → jeff-buckley` [internal, → summon] — Wikipedia/Jeff Buckley, "Legacy": "Other musicians influenced by Buckley include Adele, Bat For Lashes, Lana Del Rey..."

**Verified edge count: 3.** No flag.

**Notes:** Buckley is a pure root here — his own influences (Nina Simone, Nusrat Fateh Ali Khan, Led Zeppelin, Joni Mitchell, Judy Garland, Van Morrison) map to no valid target.

### Mitski · `mitski` · family: confessional
genres: `indie-rock`, `art-pop`, `singer-songwriter`
scene: none

Edges:
- `mitski → jeff-buckley` [internal] — see above.
- `mitski → bjork` [bridge] — same Wikipedia passage; corroborated by Far Out Magazine: discovering Björk at 15 in a Japanese record store — "I put on the headphones and I was terrified!"; "*Vespertine* especially really helped me look further into myself."
- `phoebe-bridgers → mitski` [internal] — Rolling Stone, "Phoebe Bridgers: My Favorite Things of the Decade" (2019): named Mitski the artist who "had the best decade" of the 2010s.

**Verified edge count: 3.** No flag.

**Notes:** M.I.A. and Shiina Ringo are real, self-cited influences but off-roster. **Rejected:** a widely-circulated "Mitski pulled a Fiona Apple" quote traces only to fan-archive social-media reposts — excluded as UNSOURCED.

### Phoebe Bridgers · `phoebe-bridgers` · family: confessional
genres: `indie-folk`, `singer-songwriter`, `indie-rock`
scene: LA "sad girl" circle / boygenius / Better Oblivion Community Center

Edges:
- `phoebe-bridgers → elliott-smith` [internal] — see Elliott Smith entry.
- `phoebe-bridgers → mitski` [internal] — see Mitski entry.
- `phoebe-bridgers → bright-eyes` [internal, → summon] — Wikipedia lists Bright Eyes among Bridgers's cited influences; she and Conor Oberst formed Better Oblivion Community Center (2019 joint album); widely quoted: "it's kind of sexist not to like Bright Eyes."
- `phoebe-bridgers → big-thief` [internal, ⚠ provisional] — see Big Thief entry; citation not independently pinned.

**Verified edge count: 3 confirmed** (4th provisional). No flag.

**Notes:** The Replacements, Blake Mills, Tom Waits, Jackson Browne are Wikipedia-documented but off-roster. No sourced connection to Sharon Van Etten was found despite both being scene-adjacent peers.

### Sharon Van Etten · `sharon-van-etten` · family: confessional
genres: `singer-songwriter`, `indie-rock`
scene: none

Edges:
- `sharon-van-etten → cocteau-twins` [bridge] — Wikipedia/Sharon Van Etten, "Influences and musical style."
- `sharon-van-etten → joy-division` [bridge] — same section.
- `sharon-van-etten → nick-cave-and-the-bad-seeds` [bridge] — same section; corroborated directly, Billboard: told producer John Congleton that Nick Cave — specifically *Skeleton Tree* — was a main influence on *Remind Me Tomorrow*.
- `sharon-van-etten → suicide` [bridge] — same Billboard interview, named alongside Cave and Portishead.
- `sharon-van-etten → portishead` [bridge] — same interview.
- `sharon-van-etten → omd` [bridge] — same Wikipedia influences section.

**Verified edge count: 6.** No flag.

**Notes:** Van Etten's own line on Ani DiFranco — "the first musician I had ever heard whose songs were super confessional" — is striking evidence for this realm's naming even though DiFranco isn't a valid target.

### Angel Olsen · `angel-olsen` · family: confessional
genres: `indie-rock`, `singer-songwriter`, `art-rock`
scene: none (former Cairo Gang/Bonnie "Prince" Billy backing vocalist)

Edges:
- `angel-olsen → cocteau-twins` [bridge, critic-comparison] — Pitchfork, reviewing *All Mirrors* (via Wikipedia): likened to "acts such as the Cure, Cocteau Twins and Siouxsie and the Banshees," "dark dream-pop dealing with anxiety."
- `angel-olsen → the-cure` [bridge, critic-comparison] — same citation.
- `angel-olsen → siouxsie-and-the-banshees` [bridge, critic-comparison] — same citation.
- `angel-olsen → david-bowie` [bridge] — Song Exploder/SPIN (Nov 2016): the percussive piano on "Shut Up Kiss Me" is "a nod to David Bowie... he had just passed away."

**Verified edge count: 4.** No flag on count; three of the four rest on a single critic passage rather than Olsen's own words — flagged for transparency.

**Notes:** Olsen's own most emphatic influences (Patsy Cline, the Everly Brothers, Roy Orbison, Dolly Parton, Emmylou Harris) are classic country, off-roster. Cat Power is constantly compared to her by critics but no direct Olsen quote naming Cat Power was found.

### Weyes Blood · `weyes-blood` · family: confessional
genres: `art-pop`, `chamber-pop`, `singer-songwriter`
scene: none (Sub Pop; former Ariel Pink touring member)

Edges:
- `weyes-blood → velvet-underground` [bridge] — Wikipedia/Weyes Blood, "Musical style and influences."
- `weyes-blood → nico` [bridge] — same section.
- `weyes-blood → can` [bridge] — same section.
- `weyes-blood → cocteau-twins` [bridge] — same section; corroborated, Flying Nun interview (Nov 2022): discusses listening to Elizabeth Fraser while writing *And in the Darkness, Hearts Aglow*.
- `weyes-blood → this-mortal-coil` [bridge] — same Flying Nun interview, named alongside Cocteau Twins/Fraser.

**Verified edge count: 5.** No flag.

**Notes:** Harry Nilsson, Joni Mitchell (*Hejira* is her stated favorite album), Judee Sill, Alice Coltrane are real but off-roster (Judee Sill was explicitly named as a candidate summon in the original brief — no second sourced edge into her was found this pass; see Section 8.2). No sourced Ethel Cain connection found despite shared festival bills.

### Ethel Cain · `ethel-cain` · family: confessional
genres: `alt-country`, `gothic-americana`, `singer-songwriter`
scene: none

Edges:
- `ethel-cain → lana-del-rey` [internal, → summon] — Wikipedia/Ethel Cain: as a teenager, covered several Lana Del Rey songs and named her one of her "favorite artists"; *Born to Die* was the first CD she ever bought.

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Cain's other self-cited influences (Karen Carpenter, Florence Welch, Steve Miller Band, Avril Lavigne, Title Fight, Chelsea Wolfe, King Woman) map to no valid target. **Rejected:** the frequently-repeated Mazzy Star/Cocteau Twins/Nine Inch Nails comparisons could not be traced to a genuine Cain quote or named-critic citation — excluded as UNSOURCED despite being sonically plausible.

### Snail Mail · `snail-mail` · family: confessional
genres: `indie-rock`, `singer-songwriter`
scene: Ellicott City, MD DIY scene

Edges:
- `snail-mail → liz-phair` [internal] — Wikipedia/Snail Mail: "cited Hayley Williams of Paramore, Liz Phair and Avril Lavigne as her idols and major musical inspirations." Corroborated, Rolling Stone: "Liz Phair's 'Why Can't I?' is the first pop song I remember hearing"; NME (2021): played in a childhood tribute band ("Lizard Phair"), later met Phair in person.
- `snail-mail → fiona-apple` [internal] — Wikipedia/Snail Mail, "Influences."
- `snail-mail → elliott-smith` [internal] — same passage.
- `snail-mail → my-bloody-valentine` [bridge] — same passage.
- `snail-mail → grouper` [bridge] — 9:30 Club interview (2016): while writing *Habit*, "definitely listening to a lot of Grouper, Broadcast, Joni Mitchell, Psychic TV, Beat Happening, and Liz Phair."
- `snail-mail → broadcast` [bridge] — same 9:30 Club interview.

**Verified edge count: 6.** No flag.

**Notes:** Cat Power, Bon Iver, Sufjan Stevens, Hayley Williams/Paramore, Psychic TV, Beat Happening are real but off-roster.

### Japanese Breakfast · `japanese-breakfast` · family: confessional
genres: `indie-pop`, `indie-rock`, `dream-pop`
scene: none

Edges:
- `japanese-breakfast → bjork` [bridge] — Rolling Stone/AnOther Magazine coverage of *Jubilee*: Zauner said she was inspired to "go big" by Björk's *Homogenic*; on Björk/Kate Bush: "these women who are essentially pop musicians with mass appeal — but they're both really fucking weird."

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Kate Bush recurs constantly alongside Björk but isn't a Starweave node. No sourced connection found to Mitski or Clairo despite shared scene/audience — both excluded as UNSOURCED rather than assumed from proximity.

### Clairo · `clairo` · family: confessional
genres: `bedroom-pop`, `indie-pop`, `singer-songwriter`
scene: bedroom-pop/SoundCloud-era DIY

Edges:
- `clairo → cocteau-twins` [bridge] — Wikipedia/Clairo, "Influences": cites Cocteau Twins among a mix of her parents' tastes. Corroborated, Dazed ("Six things that inspired *Immunity*"): learned about them from her mother, later via Tumblr; "Alewife" carries their "gauzy and ethereal dream pop."
- `clairo → elliott-smith` [internal] — Wikipedia/Elliott Smith, "Legacy" passage.

**Verified edge count: 2.** No flag.

**Notes:** Al Green, Brenton Wood, Billy Paul, The The, Public Image Ltd, The Shins are real but off-roster. **Rejected:** a "Phoebe Bridgers/Snail Mail/Soccer Mommy" genre-placement in secondary coverage is a journalist's framing, not a direct Clairo citation — no edge added.

### Julia Holter · `julia-holter` · family: confessional
genres: `art-pop`, `experimental`, `chamber-pop`
scene: CalArts experimental/avant-garde

Edges:
- `julia-holter → julee-cruise` [bridge] — Holter interview material (Tone Glow) names Julee Cruise among primary influences alongside Joni Mitchell, Robert Wyatt, Steve Reich, Terry Riley.
- `julia-holter → cocteau-twins` [bridge] — Dummy Mag interview: discusses "Fluffy Tufts" directly; a track on *Loud City Song* described as recalling *Heaven or Las Vegas*.
- `julia-holter → nico` [bridge, critic-comparison] — Wikipedia/Julia Holter, "Style": vocal register "faintly recalls Siouxsie Sioux or Nico."
- `julia-holter → siouxsie-and-the-banshees` [bridge, critic-comparison] — same sentence.

**Verified edge count: 4** (2 self-reported, 2 critic-comparison). No flag on count — flagged on genre fit, see Section 8.1.

**Notes:** Holter's own most emphatic influences (Alice Coltrane, Arthur Russell, Steve Reich, Terry Riley, Robert Wyatt) sit almost entirely outside the roster.

### Tori Amos · `tori-amos` · family: confessional
genres: `singer-songwriter`, `art-rock`, `piano-rock`
scene: none

Edges: none found that map to a valid Starweave target.

**Verified edge count: 0.** FAILS-BAR — genuinely thin, not a shortcut.

**Notes:** A foundational confessional-piano artist thematically, but zero citable connections found in either direction. The Kate Bush "influence" most commonly repeated is directly contested by Amos's own account (she says she only started hearing the comparison after *Hounds of Love* and hadn't been listening to Bush beforehand) — and Bush isn't a valid target regardless.

### Liz Phair · `liz-phair` · family: confessional
genres: `indie-rock`, `singer-songwriter`, `alt-rock`
scene: Chicago indie scene (Wicker Park)

Edges:
- `snail-mail → liz-phair` [internal] — see Snail Mail entry; three independent corroborating sources.

**Verified edge count: 1** (inbound only). FAILS-BAR on Starweave-mappable outbound targets — though the one inbound edge is unusually well corroborated.

**Notes:** Phair's own defining influence — the Rolling Stones' *Exile on Main St.*, used song-for-song as the structural template for *Exile in Guyville* — is extensively documented but the Stones aren't a valid target.

### Amy Winehouse · `amy-winehouse` · family: confessional
genres: `neo-soul`, `jazz-pop`, `r&b`
scene: Camden, London

Edges: none found that map to a valid Starweave target, in either direction.

**Verified edge count: 0.** FAILS-BAR, and a genre-fit question — see Section 8.1.

**Notes:** Winehouse's influences are unusually well-documented in her own words (Dinah Washington, Sarah Vaughan, the Ronettes, the Shangri-Las) but every named figure sits in 1950s–60s jazz/soul/girl-group lineage entirely outside Starweave's existing graph. No inbound connection either — none of the other 15 confessional artists, nor any existing node, has a sourced quote citing her.

---

## 5. Family: slowcore-sadcore

*Lineage value proposed: `slowcore-sadcore`. Genuinely the thinnest-sourced family in this audit — several of these acts have minimal interview coverage by nature (short-lived bands, one songwriter's 2013 death). Reported honestly rather than padded, per the brief's own expectation.*

### Red House Painters · `red-house-painters` · family: slowcore-sadcore
genres: `slowcore`, `sadcore`, `indie-rock`
scene: San Francisco slowcore / 4AD's first Californian signing (1992)

Edges:
- `red-house-painters → this-mortal-coil` [bridge] — 4AD's own artist page: Mark Kozelek "took musical cues from 4AD's rich history such as This Mortal Coil, Dead Can Dance and Cocteau Twins, but transplanted the spacey, Goth-tinged style of those groups onto confessional acoustic songs."
- `red-house-painters → cocteau-twins` [bridge] — same source.

**Verified edge count: 2.** No flag.

**Notes:** Signed to 4AD in 1992 on the strength of a demo passed to Ivo Watts-Russell by American Music Club's Mark Eitzel (not a valid node). Kozelek's own most emphatic self-cited influence, Neil Young, is off-roster. **See Section 8.2 for the Sun Kil Moon successor relationship** — not counted as influence.

### Sun Kil Moon · `sun-kil-moon` · family: slowcore-sadcore
genres: `slowcore`, `sadcore`, `folk`
scene: San Francisco — Kozelek's post-Red House Painters recording name

Edges:
- `sun-kil-moon → modest-mouse` [bridge] — Wikipedia/AV Club/Paste: Kozelek was struck by a 2003 Modest Mouse show at The Fillmore, began working their songs into his sets, and released *Tiny Cities* (2005), a full album of Modest Mouse covers reworked as acoustic ballads.

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Sun Kil Moon "was initially a continuation of the defunct" Red House Painters (Wikipedia) following the delayed release of RHP's final album — **same songwriter, direct continuation, not counted as an influence edge** (see Section 8.2). Kozelek also released full covers albums of AC/DC and John Denver — neither a valid target.

### Songs: Ohia · `songs-ohia` · family: slowcore-sadcore
genres: `slowcore`, `alt-country`, `folk`
scene: Secretly Canadian/Bloomington-Chicago alt-country underground

Edges: none survived sourcing.

**Verified edge count: 0.** FAILS-BAR — genuinely thin, not a shortcut.

**Notes:** The hardest case in the roster, as expected (Jason Molina died in 2013; his own influence-interviews are thin). His single most load-bearing real relationship — Will Oldham (Palace/Bonnie "Prince" Billy) released Songs: Ohia's first single on his own label after Molina passed him a demo, and suggested the band name — is a genuine mentorship, but Oldham/Palace isn't a valid roster or bridge node. Critics compare his voice to Oldham's and his lyrical intensity to Neil Young/Leonard Cohen, but none is first-person attribution. His own account of his roots runs through Black Sabbath and Cleveland heavy metal.

### Silver Jews · `silver-jews` · family: slowcore-sadcore
genres: `alt-country`, `indie-rock`
scene: Drag City — NYC/Nashville alt-country, formed out of a University of Virginia noise-rock trio (Ectoslavia)

Edges:
- `silver-jews → velvet-underground` [bridge, ⚠ needs re-verification] — Nashville Scene, "Trains Across the Sea": critic characterization that "San Francisco B.C." "rolls along on a minimalist drum pattern straight out of The Velvet Underground's *White Light/White Heat*" — a secondary critical characterization, not a Berman quote.

**Verified edge count: 1.** FAILS-BAR.

**Notes — important flag:** Silver Jews was co-founded (1989) by David Berman with Stephen Malkmus and Bob Nastanovich, his UVA-era bandmates in Ectoslavia; Malkmus and Nastanovich then founded Pavement. Malkmus played guitar on two Silver Jews albums. **This is a founding-member/collaboration relationship, not a sourced "X was influenced by Y" claim in either direction** — no Berman quote framing Pavement's sound as an influence (or vice versa) could be found. A `silver-jews ↔ pavement` [bridge] edge would be defensible under a "shared members" framing but is not currently supportable as `type: 'influence'` under this document's citation rule — flagged for human judgment in Section 8.2. See also the Purple Mountains successor relationship below.

### Purple Mountains · `purple-mountains` · family: slowcore-sadcore
genres: `alt-country`, `indie-rock`, `folk`
scene: Drag City — Berman's 2019 return

Edges: none survived sourcing as influence (see Section 8.2 — same-artist successor to Silver Jews).

**Verified edge count: 0.** FAILS-BAR.

**Notes:** David Berman is the same songwriter as Silver Jews, a decade later, under a new band name — should not be encoded as an `inf()` influence edge. No independent interview material was found where Berman frames Purple Mountains' sound as influenced by any specific roster artist; the 2019 press run (Stereogum, Loud and Quiet, The Believer) focused on his father, sobriety, and Silver Jews' end, not musical touchstones.

### Low · `low` · family: slowcore-sadcore
genres: `slowcore`, `sadcore`
scene: Duluth, MN — Sub Pop/Kranky; one of the two or three bands that defined "slowcore" as a term

Edges:
- `low → velvet-underground` [bridge] — Alan Sparhawk, Music in Minnesota: "Velvet Underground really helped open my mind to songwriting too – poetry in the rough, unbridled, brutal, and broken. Lou was both irreverent and attributive at the same time."
- `low → joy-division` [bridge] — same interview: "Ian Curtis from Joy Division. His were the first lyrics I really dove into and felt like home in... unafraid of how darkly personal it was."
- `low → the-cure` [bridge, ⚠ needs re-verification — paraphrase, not verbatim] — Vice, "Low's Alan Sparhawk Ranks the Band's 11 Albums": describes Sparhawk citing "early Cure and Joy Division as early touchstones."

**Verified edge count: 3.** No flag on the first two; the third is caveated.

**Notes:** Sparhawk is also reportedly on record praising Codeine ("in awe of them") — not independently re-confirmed to a single primary article this session, flagged rather than counted (see Codeine summon, Section 6.2). He's also referenced Galaxie 500 (not a valid node) and hearing Red House Painters' first record, without a strong enough quote to count.

### Carissa's Wierd · `carissas-wierd` · family: slowcore-sadcore
genres: `slowcore`, `indie-rock`
scene: Seattle, 1995–2003 — pre-Band of Horses/Grand Archives lineup

Edges:
- `carissas-wierd → low` [internal, critic-comparison] — Bandcamp Daily, "Slowcore: A Brief Timeline": the band "channeled Robert Altman as much as Ida or Low."

**Verified edge count: 1.** FAILS-BAR.

**Notes:** Exactly the kind of thin case anticipated — a short-lived (1995–2003), never-widely-interviewed band. Ida is named in the same sentence as a comparison point and was explicitly flagged as a possible summon in the original brief, but no second independent edge into Ida was found this pass (see Section 8.2 near-misses). Members went on to Band of Horses, Grand Archives, and Death Cab for Cutie — real but not influence claims.

### Mount Eerie · `mount-eerie` · family: slowcore-sadcore
genres: `folk`, `indie-rock`, `sadcore`
scene: Anacortes, WA — Phil Elverum's post-Microphones recording name, K Records lineage

Edges: none survived sourcing as influence (see Section 8.2 — Elverum's own rename statement).

**Verified edge count: 0.** FAILS-BAR.

**Notes:** Elverum, CITR-FM's *Discorder* (Sept 2003): "Mount Eerie is a new project. The Microphones was completed... I did it because I am ready for new things. I am new." Same person, explicit self-announced rename — not an influence relationship. No separate sourced bridge into the existing 106-node roster was found for Mount Eerie specifically.

### The Microphones · `the-microphones` · family: slowcore-sadcore
genres: `indie-rock`, `folk`
scene: Anacortes/Olympia, WA — K Records, mid-to-late 1990s lo-fi scene

Edges: none survived sourcing.

**Verified edge count: 0.** FAILS-BAR — thin, but for a documentable reason.

**Notes:** Elverum's real formative influence is Beat Happening/Calvin Johnson and the K Records/Dub Narcotic scene (Bret Lunsford of Beat Happening, who ran Elverum's hometown record store, became his direct mentor) — extremely well documented but Beat Happening isn't a roster/bridge node. Flagged as the single most load-bearing off-roster figure in this family, but on its own it only connects to one artist here (The Microphones itself), so it doesn't clear the 2-edge summon bar (see Section 8.2 near-misses).

### Have A Nice Life · `have-a-nice-life` · family: slowcore-sadcore
genres: `post-punk`, `shoegaze`, `goth`
scene: Connecticut DIY / The Flenser

Edges:
- `have-a-nice-life → joy-division` [bridge] — Dan Barrett, Steel For Brains: "All the bands I see influencing HANL most directly - Sisters of Mercy, Joy Division, My Bloody Valentine - aren't bands I listened to when I was young."
- `have-a-nice-life → my-bloody-valentine` [bridge] — same quote.

**Verified edge count: 2.** No flag — a clean, direct first-person quote naming both.

**Notes:** Sisters of Mercy is named in the same quote but isn't a valid target. See Giles Corey below for the same-member relationship.

### Giles Corey · `giles-corey` · family: slowcore-sadcore
genres: `folk`, `alt-country`
scene: Connecticut DIY — Dan Barrett's solo project, genre-distinct from Have a Nice Life

Edges: none survived sourcing as influence (see Section 8.2 — same-member relationship with Have a Nice Life).

**Verified edge count: 0.** FAILS-BAR.

**Notes:** Barrett's own stated influences specifically for this project are Hank Williams, Johnny Cash, and Merle Haggard — classic country, entirely outside Starweave's existing 106-node graph. **Roster-fit note:** genre sits further from "slowcore/sadcore" than the rest of this family — may belong under a general `folk` lineage tag instead, see Section 8.1.

---

## 6. Family: indie-folk-songwriter

*Lineage value proposed: `indie-folk-songwriter`.*

### Kurt Vile · `kurt-vile` · family: indie-folk-songwriter
genres: `indie-folk`, `indie-rock`, `folk-rock`, `lo-fi`
scene: none formally — closely tied to the Philadelphia indie scene (The War on Drugs, the Violators)

Edges:
- `kurt-vile → velvet-underground` [bridge] — Rolling Stone: "Lou Reed/the Velvet Underground were probably my earliest classic rock influence." Corroborated on signing to Verve Records (Variety/Stereogum/PhillyVoice, 2021) and Under the Radar (2022): "I grew up listening to The Velvet Underground."
- `kurt-vile → pavement` [bridge] — Philadelphia Inquirer: "Pavement was my gateway drug to indie rock. Stephen Malkmus was my hero." Corroborated by Under the Radar (Matador Records signing quote naming Pavement, Yo La Tengo, Cat Power as artists he "grew up listening to").
- `kurt-vile → yo-la-tengo` [bridge] — same Under the Radar quote.
- `kurt-vile → dinosaur-jr` [bridge] — Rolling Stone, "J Mascis, Kurt Vile Talk Guitar Lore": Vile "clearly remembers the first time he met one of his biggest influences, J Mascis," describing discovering the band as a Philadelphia teenager.

**Verified edge count: 4.** No flag.

**Notes:** Neil Young, Bruce Springsteen, Tom Petty, Bob Dylan, John Fahey, John Prine (duet partner on "How Lucky," days before Prine's 2020 death) are real but off-roster — John Prine carried below as a near-miss summon.

### Mac DeMarco · `mac-demarco` · family: indie-folk-songwriter
genres: `indie-pop`, `lo-fi`, `bedroom-pop`
scene: none formally — see Section 8.1, genre fit is genuinely questionable

Edges:
- `mac-demarco → the-smiths` [bridge] — FarOut Magazine, DeMarco's own list of songs that shaped him: on The Smiths' "Ask" — "it's a really catchy, beautiful song."
- `mac-demarco → jonathan-richman` [internal, → near-miss summon] — Interview Magazine (on his 2012 album *2*): named "John Lennon, Jonathan Richman, and Arthur Russell" among his influences.

**Verified edge count: 2** (thin — one leg points to a summon candidate, Jonathan Richman, that does not itself yet clear its own bar; see the methodology note at the top of this document for why the edge still counts toward Mac DeMarco's own total regardless). Flagged as borderline rather than confidently passing.

**Notes:** Herman's Hermits, Steely Dan, Wipers, Neil Young are real but off-roster. A widely-repeated claim that DeMarco named Pavement/Weezer/Yo La Tengo as influences could not be traced to a primary quote — marked UNSOURCED, excluded.

### Men I Trust · `men-i-trust` · family: indie-folk-songwriter
genres: `dream-pop`, `electropop`
scene: none — see Section 8.1, weakest genre fit in this family

Edges:
- `men-i-trust → radiohead` [bridge] — Monster RX93.1: "Dragos named 'OK Computer' by Radiohead as his all-time favorite album."

**Verified edge count: 1.** FAILS-BAR.

**Notes:** The same source paraphrases (not a direct quote) that the band has acknowledged '70s folk artists like Joni Mitchell and Nick Drake alongside ABBA, the Bee Gees, Pink Floyd, Black Sabbath — too vague/unquoted and none map to valid targets regardless. Individual-member interviews (WHRB, Billboard) skew toward Michael/Janet Jackson, Whitney Houston, nu-metal, Bach, Italo-disco — none folk-adjacent. No direct citation of Beach House/Mazzy Star/Stereolab/Broadcast (the acts critics most compare them to) was found in the band's own words.

### The Mountain Goats · `the-mountain-goats` · family: indie-folk-songwriter
genres: `indie-folk`, `folk-rock`, `lo-fi`
scene: none formally, though John Darnielle's early cassette-only records (1991–2002) sit in the American lo-fi/DIY folk tradition

Edges:
- `the-mountain-goats → the-cure` [bridge] — Spin/Consequence/Paste (Feb 2017, on *Goths*): inspired by "an adolescence listening to The Cure, Bauhaus, Siouxsie and the Banshees, and Joy Division."
- `the-mountain-goats → siouxsie-and-the-banshees` [bridge] — same source; corroborated by Darnielle's 2014 solo cover of "Spellbound."
- `the-mountain-goats → joy-division` [bridge] — same source.

**Verified edge count: 3.** No flag.

**Notes:** Bauhaus (same quote) isn't a valid target. Darnielle's other documented influences — Christian singer-songwriters Amy Grant and especially Rich Mullins — are outside genre/roster scope. A co-headline tour with Bright Eyes (2011) is a touring fact, not stated influence.

### Grouper · exists (`grouper`) · family: indie-folk-songwriter (cross-tag note — see Section 8.1)
**Current graph state:** exists as `realm: electronic`, `lineage: ambient-drone`, with existing edges to `this-mortal-coil` and `siouxsie-and-the-banshees` (both sourced in the island-two audit, not re-proposed here).

Proposed new edge:
- `grouper → townes-van-zandt` [bridge] — see Townes Van Zandt entry (Section 2); Digital in Berlin interview.

**Verified edge count (new): 1** — contributes the second qualifying edge that brings Townes Van Zandt to a passing total; does not itself change Grouper's own already-secure existing-node status.

**Notes:** Harris's formative listening (raised in a Fourth Way commune; parents' Eastern European folk/American avant-pop records; father teaching guitar/piano) is real and specific but doesn't name a second individual folk songwriter with a citable quote. No sourced case was found of her citing Vashti Bunyan, Nick Drake, Karen Dalton, Judee Sill, or Nico specifically — those are critic/genre-adjacent associations, not her own stated influences.

### Natalia Lafourcade · `natalia-lafourcade` · family: indie-folk-songwriter
genres: `latin-folk`, `folk`, `bolero`, `pop-rock`
scene: none from the Anglo-American indie-folk world — works primarily in Mexican/Latin American nueva canción, bolero, and son jarocho traditions; see Section 8.1, likely outlier

Edges:
- `natalia-lafourcade → bjork` [bridge] — Wikipedia/Natalia Lafourcade, "Early life": "She would be influenced by Fiona Apple, Björk and Café Tacvba as well as Ely Guerra and Julieta Venegas."

**Verified edge count: 1.** FAILS-BAR, and flagged as a probable roster-fit outlier — see Section 8.1.

**Notes:** Her most substantial, most-repeated influences — Violeta Parra, Chavela Vargas, Agustín Lara (real, well-documented: a full 2011 tribute album to Lara; explicit *Musas*-era citations of Parra and Vargas) — sit in a Latin American nueva canción/bolero/ranchera lineage with essentially zero overlap with Starweave's existing 106-artist roster. Fiona Apple and Café Tacvba (same sentence as the Björk edge) aren't roster nodes either. English-language coverage skews toward the *Musas*-era press cycle rather than deep-catalog interviews; a genuinely thorough pass would need fluent Spanish-language source verification, which was not attempted to full citation standard here rather than risk a bad citation.

---

## 7. Proposed additions ("summoned" nodes)

Not part of the original 45-artist roster. Each surfaced during research with 2+ independently-sourced edges connecting it into this realm, per the rules for this section. **Proposals only — a human decides**, none merged into the main roster above.

### Bert Jansch (folk-roots family)
- `nick-drake → bert-jansch` [internal] — see Nick Drake entry.
- `the-smiths → bert-jansch` [bridge] — Johnny Marr: "Anyone who got into Nick Drake – totally into Bert... No Bert Jansch, no 'Back to the Old House,' no 'Unhappy Birthday,' even my electric stuff... All roads lead back to Bert Jansch."

**2 sourced edges.** Clears the bar. Also constantly cited (via secondary aggregation, not a pinned quote) as an influence on Joanna Newsom, Beth Orton, Devendra Banhart — worth a follow-up pass if those names gain other footing.

### Incredible String Band (folk-roots family)
- `vashti-bunyan → incredible-string-band` [internal] — see Vashti Bunyan entry.
- `boards-of-canada → incredible-string-band` [bridge] — Boards of Canada, on their own "rural sensibilities": "we have all the String Band records... a bit twisted," a direct touchstone for their aesthetic. (This exact claim was already noted, unpromoted, in the electronic-realm precedent's Boards of Canada section — this pass supplies the second qualifying edge that clears the bar.)

**2 sourced edges.** Clears the bar.

### Bright Eyes / Conor Oberst (folk-roots + confessional families — merged)
- `bright-eyes → townes-van-zandt` [internal] — see Townes Van Zandt entry. ⚠ needs re-verification.
- `bright-eyes → joni-mitchell` [internal] — see Joni Mitchell entry. ⚠ needs re-verification.
- `phoebe-bridgers → bright-eyes` [internal] — see Phoebe Bridgers entry.

**3 sourced edges, spanning two independently-researched families** — the clearest example in this document of why the "apply the bar centrally, not per-researcher" instruction mattered. Two of the three edges share a re-verification caveat (both trace to the same 2007 NPR interview, which could not be re-fetched); the third (Bridgers) is independently and solidly sourced. Clears the bar even discounting the caveated pair.

### Roy Harper (freak-folk family)
- `joanna-newsom → roy-harper` [internal] — see Joanna Newsom entry.
- `fleet-foxes → roy-harper` [internal] — see Fleet Foxes entry.

**2 sourced edges**, both first-person artist testimonial. The cleanest summon case in this document.

### Karen Dalton (freak-folk family)
- `joanna-newsom → karen-dalton` [internal] — see Joanna Newsom entry. ⚠ source-chain caveat (Wikipedia citing *Vogue*, primary text not independently re-fetched).
- `nick-cave-and-the-bad-seeds → karen-dalton` [bridge] — Nick Cave, liner notes to the 2006 reissue of *In My Own Time*: "All of us in the Bad Seeds were huge Karen Dalton fans." Cave and the Bad Seeds' "When I First Came to Town" (*Henry's Dream*, 1992) is directly modeled on Dalton's "Katie Cruel."
- `devendra-banhart → karen-dalton` [internal, ⚠ weaker sourcing] — per Wikipedia, citing SF Weekly (2007); no exact quote independently confirmed this pass.

**2 solidly-sourced edges + 1 weaker lead.** Clears the bar on the first two alone.

### Lana Del Rey (confessional family)
- `ethel-cain → lana-del-rey` [internal] — see Ethel Cain entry.
- `lana-del-rey → jeff-buckley` [internal] — see Jeff Buckley entry.

**2 sourced edges.** Clears the bar. **Note for whoever writes copy:** Del Rey and Cain are also publicly feuding as of 2025 (widely reported) — the teenage-fandom influence relationship and the current public antagonism are both real and worth knowing about together.

---

### Near-miss summon candidates — do NOT clear the bar, flagged for visibility only

- **Devendra Banhart** — `→ vashti-bunyan` (solid) + `→ karen-dalton` (weaker-sourced lead, see above) = arguably 2, but the second is caveated enough that this document is not confidently promoting him; a human should decide whether the Karen Dalton lead is strong enough on its own.
- **Animal Collective** — only `→ vashti-bunyan` confirmed (Wikipedia: dinner + collaboration leading to the *Prospect Hummer* EP).
- **Cat Power** — only `snail-mail → cat-power` confirmed. Angel Olsen and Sharon Van Etten are both constantly critic-compared to her, but no first-person quote from either naming her was found.
- **Codeine** — only `low → codeine` (Sparhawk "in awe of them," not independently re-confirmed to a primary article this session). Extremely likely to clear the bar on a follow-up pass given how central the act is to the genre's own founding narrative.
- **Jonathan Richman** — only `mac-demarco → jonathan-richman`.
- **John Prine** — only `kurt-vile → john-prine`.
- **Ida** — named as a direct comparison point for Carissa's Wierd but no second independent edge found.
- **Beat Happening / Calvin Johnson** — the single most load-bearing off-roster figure found in the entire slowcore-sadcore family (direct mentor to Phil Elverum), but only connects to one artist (The Microphones) in this research.

---

## 8. Flags

### 8.1 Roster-fit concerns

- **Amy Winehouse** — zero connective tissue, in either direction, to Starweave's existing graph or to any of her 15 confessional-family-mates. Her entire sourced lineage runs through 1950s–60s jazz/soul/girl-groups, a different musical family tree entirely. **Recommend a human decision on whether she belongs in this realm at all.**
- **Julia Holter** — real, well-sourced dream-pop/art-pop connections, but her actual output (CalArts avant-garde composition, minimalism) sits at the far experimental edge of "confessional singer-songwriter." Possibly a better future fit for an art-pop/experimental cluster.
- **Tori Amos** — no genre-fit problem (a foundational confessional-piano artist), but zero citable connections to any Starweave node either direction — a sourcing gap, not a mismatch.
- **Men I Trust** — the weakest fit in the indie-folk-songwriter family. Sourced influences (Bach, disco/Italo-disco, Motown/Whitney Houston, nu-metal) and actual sound (dream-pop/electropop) have essentially no documented folk/confessional connection beyond one paraphrased, unquoted aside.
- **Mac DeMarco** — a softer version of the same concern; his stated lineage (Herman's Hermits, Steely Dan, Wipers, Plastic Ono Band) reads as slacker/jangle/bedroom-pop rather than folk-confessional.
- **Natalia Lafourcade** — flagged per the original brief's own instruction. Her core influences (Violeta Parra, Chavela Vargas, Agustín Lara — nueva canción/bolero/ranchera) come from a wholly separate Latin American tradition with no historical connection to the Velvet-Underground-rooted Anglo-American lineage this graph otherwise traces. Recommend treating her as a genuine outlier: either exclude her from this realm, or accept she'll be a structurally isolated, lightly-bridged node.
- **Giles Corey** — genre (country/folk per Barrett's own stated influences: Hank Williams, Johnny Cash, Merle Haggard) sits further from "slowcore/sadcore" than his family-mates — may fit better under a general `folk` lineage tag.
- **Grouper** — a genuine dual-fit, not a mismatch: already `realm: electronic`/`lineage: ambient-drone`; her stripped-down acoustic catalog (*Dragging a Dead Deer Up a Hill*, *Ruins*) also plausibly fits folk-confessional. Recommend a cross-tag/secondary-lineage discussion, not a realm move — her existing electronic-realm placement and edges should stay untouched regardless of what's decided.
- **Nico** — her much-better-documented influence lineage (goth/post-punk influence-giver, via *The Marble Index*/*Desertshore*) belongs to a different family entirely, and this pass found zero folk-specific edges for her. Recommend NOT tagging her with a folk lineage.

### 8.2 Same-artist / successor-project / membership-overlap pairs (not genuine "influence" relationships — needs an explicit human/schema decision)

- `sun-kil-moon` ← `red-house-painters` — same songwriter (Mark Kozelek), direct continuation after RHP's 2001 dissolution.
- `purple-mountains` ← `silver-jews` — same songwriter (David Berman), new band name after a decade-long hiatus.
- `mount-eerie` ← `the-microphones` — same person (Phil Elverum), explicit self-announced rename (2003).
- `giles-corey` ↔ `have-a-nice-life` — same core member (Dan Barrett), parallel/contemporaneous projects in different genres.
- `silver-jews` ↔ `pavement` (existing region-one node) — David Berman co-founded Silver Jews with Stephen Malkmus and Bob Nastanovich (all three ex-Ectoslavia); Malkmus later played on two Silver Jews albums before founding Pavement with Nastanovich. Real, heavily documented, but not sourced as "X influenced Y" in either direction.

**None of these five should be encoded as `type: 'influence'` edges as the schema currently exists.** The `Edge` schema's `EdgeType` union (`'influence' | 'contemporary' | 'similarity'`) doesn't cleanly cover "same artist, later era" or "founding members in common" either — this may be worth a schema discussion in its own right, separate from this realm's content.

### 8.3 Sourcing caveats needing re-verification before being treated as fully equivalent-rigor to the rest of this document

- `leonard-cohen ← fontaines-dc` (Reverb.com, page could not be re-fetched)
- `bright-eyes → townes-van-zandt` / `→ joni-mitchell` (NPR 2007, transcript not re-fetched)
- `big-thief ← phoebe-bridgers` (reported only as a Variety-2021 prose aside, not a pinned quote)
- `bon-iver → radiohead` (Wikipedia paraphrasing Pitchfork, not the primary review text)
- `silver-jews → velvet-underground` (Nashville Scene characterization, not a Berman quote)
- `low → the-cure` (Vice paraphrase, not verbatim)
- `low → codeine` (aggregated recollection, not independently re-confirmed — see Codeine near-miss summon)
- `karen-dalton ← devendra-banhart` (Wikipedia citing SF Weekly 2007, no exact quote pulled)

**Explicitly marked UNSOURCED and excluded rather than included with a caveat** (surfaced here for awareness, not proposed as edges):
- `sufjan-stevens → brian-eno` (only unattributed Apple Music playlist copy — would be a valuable core-node bridge if a real quote exists)
- `adrianne-lenker → grouper` (only a low-credibility fan-blog aggregation — would be a valuable electronic-realm bridge if verified)

### 8.4 New genre ids proposed (compiled and deduplicated across all five families)

None of these currently exist in `data/seed-data.ts`'s `genres` array.

| id | proposed name | proposed parent |
|---|---|---|
| `folk` | Folk | `underground` (new top-level sibling to `indie`/`electronic`) |
| `singer-songwriter` | Singer-songwriter | `folk` |
| `confessional` | Confessional | `singer-songwriter` |
| `freak-folk` | Freak folk | `folk` |
| `chamber-folk` | Chamber folk | `folk` |
| `indie-folk` | Indie folk | `folk` |
| `country-folk` | Country folk | `folk` |
| `alt-country` | Alt-country | `folk` |
| `gothic-americana` | Gothic Americana | `alt-country` |
| `slowcore` | Slowcore | `indie-rock` |
| `sadcore` | Sadcore | `slowcore` |
| `art-pop` | Art pop | `indie` |
| `bedroom-pop` | Bedroom pop | `indie` |
| `lo-fi` | Lo-fi | `indie` |
| `latin-folk` | Latin folk | `folk` |
| `bolero` | Bolero | `latin-folk` |
| `neo-soul` / `jazz-pop` | Neo-soul / Jazz-pop | *(no natural parent in the current `indie`-rooted hierarchy — flagged as its own gap, further evidence toward the Amy Winehouse roster-fit question in 8.1)* |

### 8.5 Direction-uncertain edges

**None.** Every researcher, in every case where direction was genuinely ambiguous (a personal relationship, a collaboration, a same-artist successor project), resolved it by omission or by explicit same-artist/collaboration flagging (Section 8.2) rather than guessing a direction. No edge in this document has an uncertain `source`/`target` assignment.

---

## 9. Summary

**45 candidates researched across 5 families**, plus 2 existing-node edge-only passes (Nico, Grouper). 43 are net-new node proposals if any of this is adopted.

**20 of the 43 new-node candidates flagged FAILS-BAR** (fewer than 2 verified connecting edges, per the hard rule — flagged, not dropped; a human decides): Sufjan Stevens (1), Big Thief (1 confirmed, 1 provisional), Adrianne Lenker (1), Bon Iver (1), Fiona Apple (1), Ethel Cain (1), Japanese Breakfast (1), Tori Amos (0), Liz Phair (1, inbound only), Amy Winehouse (0), Sun Kil Moon (1), Songs: Ohia (0), Silver Jews (1), Purple Mountains (0), Carissa's Wierd (1), Mount Eerie (0), The Microphones (0), Giles Corey (0), Men I Trust (1), Natalia Lafourcade (1).

Nearly half the roster (20/43) failing the bar is a markedly higher ratio than the electronic-realm precedent's 8/45 — a real finding, not a research-quality problem: this realm's canon is genuinely more insular (many artists' own stated influences run through country/Americana/jazz/soul figures with no footprint anywhere in Starweave's existing post-punk/shoegaze/krautrock/hyperpop-rooted graph), and several specific roster members have unusually thin interview records by nature (Jason Molina's 2013 death, Carissa's Wierd's short 1995–2003 run, Nick Drake's near-total silence in life). Nico, the one existing-node edge-only pass, also found 0 new folk-lineage edges (Section 2) but isn't counted in this ratio since she isn't a new-node proposal.

**Borderline passes** (clear the 2-edge floor, but thin/caveated enough to flag the same way regardless): Leonard Cohen, Townes Van Zandt, Fleet Foxes, Clairo, Mac DeMarco, Red House Painters, Have A Nice Life, Low (3rd edge caveated).

**6 candidates cleared the bar only after cross-family merging** (the clearest demonstration of why this compilation applied the bar centrally rather than per-researcher, per this document's own methodology note): Nick Drake (5→7), Townes Van Zandt (1→2), Joanna Newsom (2→4), Fleet Foxes (1→2), Mac DeMarco (1→2), and the Bright Eyes/Conor Oberst summon (2+1→3 across two families).

**6 summoned-node candidates proposed** (Section 7): Bert Jansch, Incredible String Band, Bright Eyes/Conor Oberst, Roy Harper, Karen Dalton, Lana Del Rey — each with 2+ independently-sourced edges. **8 near-miss candidates** documented but not promoted: Devendra Banhart, Animal Collective, Cat Power, Codeine, Jonathan Richman, John Prine, Ida, Beat Happening/Calvin Johnson.

**5 same-artist/successor/membership-overlap relationships** flagged as needing a schema or human decision before being represented at all (Section 8.2) — none should become `type: 'influence'` edges as currently proposed.

**Genuinely contested or rejected framings**, called out in notes rather than forced into a clean edge: Fiona Apple vs. the "Tori Amos lineage" narrative (contradicted by Apple's own 1997 remark); Tori Amos vs. the Kate Bush comparison (Amos's own account is a convergent-discovery story, not influence); several Ethel Cain/Weyes Blood/Japanese Breakfast/Mitski cross-comparisons that are purely critic pattern-matching with no first-person confirmation from either artist.

**Total proposed edges across Sections 2–6, not counting summons:** approximately 95, spanning internal (folk-realm ↔ folk-realm) and bridge (folk-realm ↔ existing 106-node graph) connections. As with the electronic-realm precedent, per-edge confidence values were not assigned here — sourcing and tagging was this document's job, scoring is a judgment call for whoever converts any accepted edge into an `inf()` call.

**Type-system note repeated from Section 0.1:** adopting any of this requires extending `Realm` (add `'folk'`) and `Lineage` (add the five family names as new lineage values) in `data/types.ts` — a code change, explicitly out of scope for this document.

**Nothing in this document has been written to `data/seed-data.ts`, `data/types.ts`, or any other file.** This is Layer 1 of 3 — sourcing only. Layer 2 (assistant flags) and Layer 3 (human decision) follow separately.
