@AGENTS.md

# Starweave — context handoff

## What it is

Starweave is an interactive force-directed graph that maps influence relationships between indie, shoegaze, dream-pop, electronic, folk/confessional, emo/post-hardcore, post-rock/drone/noise, and American-underground artists, rooted at The Velvet Underground. Users explore a constellation of 233 artists split across seven realms — `core` (5 foundational artists: Velvet Underground, Kraftwerk, Can, Neu!, Brian Eno), `region-one` (41 artists: the British post-punk→shoegaze→dream-pop spine, modern UK/Windmill bands, and proto-punk roots), `electronic` (44 artists across 8 electronic lineages), `folk-confessional` (44 artists across 5 folk lineages), `emo-posthardcore` (30 artists across 4 lineages: hardcore-roots/post-hardcore/midwest-emo/math-rock), `post-rock-drone-noise` (23 artists across 3 lineages: post-rock/no-wave/drone), and `american-underground` (46 artists across 5 lineages: noise-alt/college-rock/indie-rock/psych/neo-psych, split out of region-one) — click any node to open a slide-over artist panel, and navigate to full artist detail pages with bios, classic album cards (cover art + 3–4 sentence write-up), and influence chips. Region-one and core nodes are colored by the original five `Layer` values (root → post-punk → shoegaze/dream-pop → indie-alt → outside); every other realm is colored per-lineage instead, each realm owning its own distinct hue family (see Design system below). The aesthetic is atmospheric — dark background, nebula/grain layer, realm/layer-keyed glow colors.

**Stack:** Next.js 16 App Router · TypeScript · `react-force-graph-2d` (canvas) · static JSON data build · no database.

---

## Architecture decisions

**Persistent graph layout.** The graph lives in `app/(graph)/layout.tsx` as a shell that never unmounts. Artist pages (`/artist/[slug]`) are rendered inside that shell so the force simulation stays alive across navigation. The graph uses a Client Component; artist pages are Server Components.

**Static data pipeline.** Source of truth is `data/seed-data.ts` (hand-curated artists, edges, classic albums). At build time, `scripts/build-graph.ts` enriches it — fetching artist images (Deezer) and album cover art (iTunes `artworkUrl100` → `600x600bb`) — and writes `public/graph.json`. At request time, `lib/graph-data.ts` reads that file with a module-level cache (`let _cache`). **Restart the dev server whenever `public/graph.json` is patched** to bust the cache.

**Influence score.** Computed as in-degree of influence edges (how many artists in the graph cite this artist as an influence). Used to scale node radius.

**Realm separation forces.** `components/graph/ForceGraph.tsx`'s `presettleLayout` (run once, synchronously, before `ForceGraph2D` ever mounts — see Zoom-based cloud/detail reveal below for why) places core at dead center and spaces every other realm on an ellipse (`computeRealmHomePositions`, `REALM_RADIUS_X/Y = 230/145`, `REALM_ANGLE_OFFSET` to spin the arrangement). Each realm's angle is a named, tunable constant in `REALM_ANGLE_DEG` (0°=right, 90°=below, 180°=left, 270°=above) rather than pure auto-spacing, so adding a realm can't silently shift the existing ones' positions — current layout: `electronic` 0° (right), `folk-confessional` 45° (bottom-right), `american-underground` 112.5° (bottom), `region-one` 180° (left), `post-rock-drone-noise` 247.5° (upper-left), `emo-posthardcore` 315° (upper-right). Angles for realms bridging heavily into two neighbors (post-rock, american-underground) are deliberately set to the geometric midpoint of the gap between those neighbors, not just "the nearest open slot" — a realm parked only 45° from one neighbor reads visually as "beside" it rather than as its own cloud. Any realm NOT listed in `REALM_ANGLE_DEG` falls back to even auto-spacing among just the other unlisted realms. `forceX`/`forceY` pull each node toward its realm's point (`REALM_PULL_STRENGTH = 0.6`, isotropic; core gets its own stronger `CORE_PULL_STRENGTH = 1.2` so it isn't dragged into region-one's mass by its own heavy edges), realm-tagged nodes get weaker mutual repulsion (`REALM_CHARGE = -22` vs the default `-40`) so each realm's bloom can pull tighter, and link strength is weakened on cross-realm ("bridge") edges relative to within-realm edges. A hand-rolled collision force (`createCollideForce`, positional not velocity-only, `COLLIDE_ITERATIONS = 3` passes/tick) keeps nodes from overlapping even in the densest cluster. A node with no `realm` (there are none among real artists anymore, since `data/seed-data.ts` backfills every artist without an explicit `realm` to `core`/`region-one`) is unaffected by any of this.

**Zoom-based cloud/detail reveal.** The graph has two visual modes tied to `globalScale`, both driven from `ForceGraph.tsx`: **cloud/overview** (zoom ≤ `FADE_ZOOM_OUT = 2.5`) and **detail** (zoom ≥ `FADE_ZOOM_IN = 3.5`), crossfading continuously in between (`computeZoomFade`, hub-biased so influential nodes/labels resolve in earlier). User scroll-zoom is clamped to `[SCROLL_MIN_ZOOM, SCROLL_MAX_ZOOM] = [1.6, 7]` (the floor was lowered from 2.5 once six realms plus core no longer fit in view at that zoom — see the `REALM_RADIUS_X/Y` comment in `ForceGraph.tsx`; `FADE_ZOOM_OUT` was deliberately NOT lowered alongside it, since the added headroom below 2.5 is just more room to pull back while already fully in cloud-dot rendering, not a new visual state); the focus/click-to-zoom camera can escape those bounds (declarative `minZoom`/`maxZoom` props swap between a clamped/unclamped tuple via React state — they're not in `react-force-graph-2d`'s imperative ref API, so this can't be done by calling a method).
- **Cloud zoom:** every node draws as a small sharp colored point (size/brightness scaled by `influenceScore`, most nodes faint, hubs brighter + a soft halo), against a near-black background wash (`OVERVIEW_BG_WASH_COLOR`/`_MAX_ALPHA`, painted in raw screen space so it ignores pan/zoom), a per-node additive nebula glow per realm (`CLOUD_BACKDROP_INTENSITY = 0.08`, deliberately dim — flat dark gold for core, no white-hot center), and a decorative dust starfield (`DUST_STAR_COUNT = 450` static, non-interactive points jittered around each realm's home cluster, pure decoration, not in `stableData`). Only edges touching a `core` node render as faint glowing "galaxy arm" threads (`isCoreEdge`, gated `&& edgeFade < 1` so this is structurally cloud-zoom-only, not just a formula that happens to converge); every other edge is a near-invisible floor-opacity web. Only the top `ANCHOR_COUNT = 12` nodes by `influenceScore` get name labels.
- **Detail zoom:** node radius/label `fontSize` are otherwise fixed graph-space values with no zoom term — since `react-force-graph-2d` scales everything (position AND radius) by the same `globalScale`, that meant zooming in never actually opened up relative gaps between nodes. `computeZoomSizeMult` (`ZOOM_SIZE_REFERENCE = 3.5`, `ZOOM_SIZE_DAMPEN = 0.75`) shrinks graph-space radius/font-size relative to the (unchanged) node spacing above the reference zoom — a no-op at/below it. Applied identically in `drawNode` and `paintNodePointerArea` (hit-testing must stay in sync with what's drawn) and to label `fontSize`, always *before* the separate click-focus readability floor so that floor's guaranteed minimum on-screen size is never undercut.
- **Labels:** placed in `onRenderFramePost` after every node's circle is known, with a bump-search collision avoidance (`LABEL_BUMP_MAX_STEPS`/`LABEL_BUMP_STRIDE_MULT`) and a dark rounded "chip" background (`LABEL_CHIP_PAD_X/Y`, `LABEL_CHIP_RADIUS`, `LABEL_CHIP_MAX_ALPHA`, via a small `drawRoundedRect` helper) instead of a text shadow. Forced (persistent hub/anchor) labels are processed highest-`influenceScore`-first and are **hidden entirely** rather than drawn overlapping if no clear spot is found — a lower-influence label always yields to a higher one. Focus/hover/path labels keep the old "accept the overlap" fallback instead, since hiding something the user is actively pointing at would be worse.
- **Edges:** arrowheads (`linkDirectionalArrowLength`/`RelPos`/`Color` props) only render on focused/hovered/genre-set-highlighted edges; the resting web (including path-find mode) is plain lines, no arrowheads.
- **Perf:** `autoPauseRedraw={false}` (needed because cloud-zoom brightness is continuously zoom-dependent) makes the canvas repaint every frame regardless of physics state, so every radial-gradient glow (nebula, bloom haze, cloud dot) is pre-rendered once into a cached offscreen-canvas sprite and reused via `drawImage` + `globalAlpha`/scale — never reconstruct a `CanvasGradient` per node per frame, that's what caused a severe lag regression the one time it slipped in.

**Realm/lineage color model.** `lib/colors.ts` defines `LAYER_COLORS` (5 hex values, one per `Layer`) plus a second, orthogonal axis layered on top: one `*_LINEAGE_COLORS` map per non-core, non-region-one realm — `LINEAGE_COLORS` (electronic, 8 hues, magenta/pink-purple), `FOLK_LINEAGE_COLORS` (folk-confessional, 5 hues, yellow-green/olive), `EMO_LINEAGE_COLORS` (emo-posthardcore, 4 hues, red/crimson), `POSTROCK_LINEAGE_COLORS` (post-rock-drone-noise, 3 hues, purple/violet), `AMERICAN_UNDERGROUND_LINEAGE_COLORS` (american-underground, 5 hues, amber/orange/rust) — plus a shared `CORE_COLOR` (reuses `LAYER_COLORS.root`). Every family is deliberately kept at a different hue range from every other (see Design system below) so realms never read as ambiguous with each other at a glance. Everything reads through resolver functions — `resolveNodeColor` / `resolveNodeGlow` / `resolveEdgeTint` / `resolveNodeLabel` — that branch on `node.realm`: no `realm` → `LAYER_COLORS[layer]` (this is the only branch any region-one node takes, keeping its rendering byte-for-byte unchanged from before the realm system existed), `realm === 'core'` → `CORE_COLOR`, every other known realm → its own per-`lineage` hex via a small `xColor(lineage)` helper with a defensive default. Adding a new realm's branch is always additive: a new `if (node.realm === '...')` line inserted before the final region-one fallback in each of the four resolvers, never a change to the existing branches. These feed node fills, artist page backgrounds (`--layer-color`), album card hover glows, and influence chip borders (`--chip-color`).

---

## Data model

`data/seed-data.ts` → `data/types.ts` for full interface definitions.

**Artist**
```
id           slug, kebab-case, stable forever
name         display name
layer        'root' | 'post-punk' | 'shoegaze-dreampop' | 'indie-alt' | 'outside'
realm        'core' | 'region-one' | 'electronic' | 'folk-confessional' | 'emo-posthardcore' | 'post-rock-drone-noise' | 'american-underground' — orthogonal to layer, drives graph clustering + resolver color fallback (see Realm/lineage color model above)
lineage      sub-family within a non-core, non-region-one realm — electronic: krautrock/synth-pop/idm/ambient-drone/electronic-indie-dancepunk/trip-hop-downtempo/hyperpop-pcmusic/art-electronic · folk-confessional: folk-roots/freak-folk/confessional/slowcore/indie-folk · emo-posthardcore: hardcore-roots/post-hardcore/midwest-emo/math-rock · post-rock-drone-noise: post-rock/no-wave/drone · american-underground: noise-alt/college-rock/indie-rock/psych/neo-psych. Only set when realm is one of these five.
scope        array of scope tags (e.g. ['shoegaze-dreampop-v1', 'indie'])
genres       array of genre IDs (see genres list in seed-data)
country      ISO 2-letter
activeFrom   year (number)
bio          for the original 106 v1 artists: injected from data/bios.ts at build time (`BIOS[a.id] ?? a.bio`). Every realm added since electronic (folk-confessional onward) writes `bio` directly inline on the artist literal instead — `data/bios.ts` is not touched for new realms, and isn't the source of truth for most of the graph anymore.
imageUrl     artist photo — enriched at build time, null = placeholder
classicAlbums  array of Album (usually exactly 1)
```

**Album**
```
id           slug
title        display title
year         number
isClassic    true
classicReason  3–4 sentence write-up (see style below)
imageUrl     album cover — fetched from iTunes at build time, null = placeholder
spotifyId    optional, for SpotifyEmbed
```

**Edge**
```
source / target   artist IDs (source = influenced BY target)
type              'influence'
status            'verified' | 'ai-suggested'
confidence        0–1
citation          source + what was said, null on most original v1/electronic edges
```

**Citation discipline (folk/emo/post-rock/american-underground on):** every edge added since the folk-confessional realm carries a real, named, checkable source in `citation` — never left null, never invented. `confidence` is used as a sourcing-tier signal on these newer edges, not just a vague "how sure are we": ~0.85 for a first-person artist quote, ~0.6–0.7 for a critic claim corroborated across independent sources, ~0.5 for a single-source critic comparison or an explicitly flagged weak/thin source. The tier is also spelled out in the citation string itself so it stays auditable without cross-referencing `confidence`. Original v1 (region-one) and electronic-realm edges predate this convention and are mostly `citation: null` — leave them alone, don't backfill citations you can't actually verify.

**classicReason style:** 3–4 tight, punchy sentences. One sharp point about sound, one about a standout track or technical detail, why it endures. No mini-essays. Straight ASCII double-quote delimiters only.

---

## Current state

**Done:**
- Force graph with layer/scope filtering, focus mode, path-finder, plus realm-separation clustering (core / region-one / electronic / folk-confessional / emo-posthardcore / post-rock-drone-noise / american-underground — seven realms) on a radial/elliptical layout, each realm at its own named angle (`REALM_ANGLE_DEG` in `ForceGraph.tsx`)
- Zoom-based cloud/detail reveal — starfield-style overview (crisp colored point nodes, dim per-realm nebula, decorative dust starfield, near-black background wash, core-touching edge threads, top-12 anchor labels) crossfading into the full detail view (photos, labels, calm faint edge web) — see Architecture decisions above. Scroll-zoom floor lowered to 1.6 (from 2.5) so all seven realms fit in view at max zoom-out.
- Zoom-size dampening + label collision/demotion/chip backgrounds to keep the detail view legible at high zoom instead of cluttered
- Artist slide-over panel (graph) + full artist detail pages (`/artist/[slug]`)
- Bios + classic album write-ups for all 233 artists across all seven realms
- Classic album visual cards — solo = horizontal layout (cover left, text right); multiple = auto-fill grid
- Artist photos: effectively all artists have a non-null `imageUrl` in the current build (Deezer, with iTunes/MusicBrainz fallback for album art)
- Album cover art: a small number of albums still fall back to placeholder — mostly obscure/no-wave releases (Teenage Jesus and the Jerks, Mars, DNA, toe) that don't have art on iTunes/Deezer/MusicBrainz; check `public/graph.json` for `classicAlbums` entries with `imageUrl: null`
- "Listen on Spotify/Apple Music" search links on album cards (`components/ui/StreamingLinks.tsx`)
- Influence chips with artist photo avatars and layer-keyed glow
- Atmospheric `ArtistBackground` (canvas aurora + grain) on artist pages
- All write-ups trimmed to 3–4 sentences
- CI workflow (`.github/workflows/ci.yml`)
- Electronic-lineage merge (island-two): 44 electronic artists + Brian Eno folded into the main graph with realm/lineage tags, separation forces, and core glow — see `git log` for the `island-two` → `/lab/merged` → main-graph merge sequence
- Folk-confessional realm: 44 artists across 5 lineages (folk-roots/freak-folk/confessional/slowcore/indie-folk), same research→audit→write pattern as island-two — see `folk-audit-DRAFT.md`/`folk-audit-FINAL.md`
- Emo-posthardcore realm: 30 artists across 4 lineages (hardcore-roots/post-hardcore/midwest-emo/math-rock); Fugazi and Minor Threat moved in from region-one (realm/lineage added to their existing literals, edges untouched) — see `emo-audit-DRAFT.md`
- Post-rock-drone-noise realm: 23 artists across 3 lineages (post-rock/no-wave/drone) — see `postrock-audit-DRAFT.md`
- American-underground realm: split out of region-one (16 nodes moved: Sonic Youth, Pixies, Dinosaur Jr., Hüsker Dü, Radiohead, Blur, etc.), then grown to 46 artists across 5 lineages (noise-alt/college-rock/indie-rock/psych/neo-psych) via a full research pass, including an Animal Collective hub (~16 edges) added once its sourcing file arrived in a follow-up pass. Galaxie 500 was researched for this realm but re-homed to folk-confessional/slowcore instead — a real slowcore headwater, not an American-underground node.
- Citation discipline: every edge added from the folk-confessional realm onward carries a real, sourced `citation` string with a visible confidence tier (see Data model above) — a deliberate departure from the original v1/electronic edges, which are mostly uncited

**Pending / known gaps:**
- No deployment configured (Vercel/Netlify — `npm run build` → `next build` works)
- A handful of classic albums still on placeholder cover art (see above — mostly obscure releases with no art on any of the three enrichment sources)
- Browse page (`app/browse/page.tsx`) and genre pages work (search/filter, dynamic counts, narrative sections) but haven't been given the same design pass as artist pages
- A `rejectedEdges` schema addition was proposed (storing recorded artist denials of a commonly-assumed influence, e.g. Car Seat Headrest explicitly denying Pavement/Sonic Youth/Dinosaur Jr./the Strokes) but never implemented — proposal only, not in `data/types.ts`
- Pulp was deferred out of the region-one split (id didn't exist yet) and later written directly into american-underground instead — no outstanding region-one/american-underground mismatch remains
- The American-underground research pass depended on a `realm6-handoff.md` research file that was briefly unavailable mid-pass; Animal Collective/Panda Bear were held back until it arrived. Panda Bear was ultimately never written — zero confirmed in-graph edges (its one real documented influence, Black Dice, isn't a graph node) — held per the same no-orphans principle as `the-apples-in-stereo` and `broken-social-scene`, neither of which were written either

---

## Discipline / hard rules

These aren't aspirational — they're the pattern the codebase itself was built with (see the `island-two` electronic-lineage merge: sandboxed at `data/island-two-data.ts` → tuned in isolation at `/lab/merged` → merged into the real graph → lab scaffolding deleted, each as its own commit).

- **Read the current code before changing anything.** Don't assume this doc, or your last session, still matches what's in the files — verify against `data/seed-data.ts`, `lib/colors.ts`, `data/types.ts`, and the component you're touching first. In particular: before writing any new node or edge, check whether the id already exists (it may already be a fully-developed node in a different realm — see the Stereolab case in the american-underground work, where the artist was already a region-one node and was correctly left alone rather than duplicated or moved).
- **Edit region-one data and shared components additively and backward-compatibly.** New realms/lineages/features must extend, not alter, existing behavior for real region-one artists. The concrete mechanism for this is the `!node.realm` fallback branch in every `resolve*` function in `lib/colors.ts` — any new color/label axis must preserve that branch untouched.
- **One change at a time.** Land a sandboxed/isolated version first (a new file, a `/lab` route, an additive field), confirm it doesn't touch existing rendering, then merge — don't do the merge and the new feature in the same step.
- **Never write scripts to surgically edit `seed-data.ts`** — see the quirk below.
- **New realm data goes through three layers, not straight to code.** Established across folk-confessional, emo-posthardcore, post-rock-drone-noise, and american-underground: **Layer 1** is pure research (an `*-audit-DRAFT.md` file at the repo root — per-artist real, named, checkable sources for who influenced whom, explicitly researching each artist's actual documented influence network rather than validating a fixed pre-guessed pair list, which is what caused the folk realm's first pass to under-count). **Layer 2** is the reviewer applying rulings on top of that research (confidence tiers, summon/cut/hold decisions, denial tracking, chronology checks) without re-researching. **Layer 3** is the actual write to `seed-data.ts`/`types.ts`/`lib/colors.ts`/`ForceGraph.tsx` — structure and edges first (no bios/albums), content (bios/classicReason) as a separate later pass. Never skip a layer or collapse research and writing into the same step.
- **Verified edges only; never invent a citation.** If a real, specific, checkable source can't be found for a claimed influence, mark it UNSOURCED/drop it — do not write a plausible-sounding but unverified claim, and do not invent quote text to fill a citation string. If a needed source file is genuinely unavailable (this happened once, with `realm6-handoff.md`), hold the affected nodes/edges rather than guess, and say so explicitly when reporting back.
- **A node with zero real edges is held, not written ("no orphans").** Established with `the-apples-in-stereo` and `broken-social-scene` (emo/american-underground research found their entire relationship sets were personnel/production/label/simultaneity, not influence), and again with Panda Bear. Writing a 0-edge node just to match a roster count is worse than leaving it out and saying why.
- **Personnel overlap, production credit, shared label, and collaboration are not influence edges.** A recurring false-positive category across every realm audit — a member also being in another band, a producer/engineer relationship (e.g. Dave Fridmann producing both the Flaming Lips and Tame Impala/MGMT), a shared record label, or a guest feature all *look* like a citable connection and are not one. Check for this specifically before writing an edge that seems too easy.

---

## Known quirks / gotchas

**Never write scripts to surgically edit `seed-data.ts`.** The file previously had smart-quote (U+2018/2019) string delimiters that broke script-based parsing. It is now fully corrected to straight ASCII quotes. Edit strings directly in the file — find the artist, change the value, done.

**Module cache in `lib/graph-data.ts`.** The `let _cache: GraphData | null = null` at module level means patching `public/graph.json` has no effect until you restart the dev server (`pkill -f "next dev"` then `npm run dev`).

**Next.js 16 breaking changes.** Read `node_modules/next/dist/docs/` before touching routing or server/client component boundaries. `dynamic` with `ssr: false` is NOT allowed in Server Components — use a plain import instead.

**No `'use client'` on graph routes.** The `(graph)` layout is a Server Component shell; only the canvas-based `ForceGraph` and search/filter components are Client Components.

**`react-force-graph-2d`'s `minZoom`/`maxZoom` are declarative-only.** They're not in the ref's imperative `methodNames` — you can't call `fgRef.current.minZoom(...)`. To change zoom bounds at runtime, swap which prop value is passed via React state instead.

**Never reconstruct a `CanvasGradient` per node per frame.** With `autoPauseRedraw={false}` (required for the zoom-based cloud/detail reveal, see Architecture decisions above), the whole canvas repaints every frame regardless of physics state — any per-node gradient/glow must be a pre-rendered offscreen-canvas sprite reused via `drawImage`, or it's a severe, easy-to-reintroduce lag regression (this happened once already, from a star-twinkle effect).

---

## Design system

**Layer palette** (defined in `lib/colors.ts`, hex — not HSL):
| Layer | Color |
|---|---|
| root | `#E8C87A` — gold (also `CORE_COLOR`, reused for every `realm: 'core'` node) |
| post-punk | `#8891F2` — indigo |
| shoegaze-dreampop | `#F2A8C4` — pink/rose |
| indie-alt | `#5FD0C0` — teal |
| outside | `#EDEBF5` — near-white lavender |

**Electronic lineage palette** (`LINEAGE_COLORS` in `lib/colors.ts`, magenta/pink-purple family, one per `Lineage`): krautrock `#C77DD1`, synth-pop `#E066C4`, idm `#B25CC9`, ambient-drone `#C99AE0`, electronic-indie-dancepunk `#F25FA8`, trip-hop-downtempo `#B0679E`, hyperpop-pcmusic `#FF6EC7`, art-electronic `#A56DD6`. Only applies to `realm: 'electronic'` nodes — see `resolveNodeColor` in `lib/colors.ts`.

**Folk-confessional lineage palette** (`FOLK_LINEAGE_COLORS`, yellow-green/olive family, hue ~70–85°): folk-roots `#78963C` (deepest) → freak-folk `#8CAA52` → confessional `#A1BD6C` → slowcore `#B7D089` → indie-folk `#CEE3AA` (lightest).

**Emo-posthardcore lineage palette** (`EMO_LINEAGE_COLORS`, red/crimson family, hue ~0–8°): hardcore-roots `#8C1E1E` (deepest) → post-hardcore `#B02E2E` → midwest-emo `#D14A3A` → math-rock `#F26B52` (brightest).

**Post-rock-drone-noise lineage palette** (`POSTROCK_LINEAGE_COLORS`, true purple/violet family, hue ~271°): no-wave `#3B1F5C` (deepest, the scene's 1970s NYC origin) → post-rock `#6B3FA0` → drone `#A87FD1` (lightest).

**American-underground lineage palette** (`AMERICAN_UNDERGROUND_LINEAGE_COLORS`, amber/orange/rust family, hue ~18–22° — deliberately held to orange-rust rather than drifting toward core's gold at ~42°): noise-alt `#7A3418` (deepest) → college-rock `#B85C2E` → indie-rock `#E8834A` (lightest). (psych and neo-psych lineages fall through to the family's default mid-tone rather than having their own dedicated shade — a defensive fallback, not a deliberate 5-shade design like the others.)

Every family above is kept at a hue range no other family occupies, checked by eye against the others (region-one's post-punk indigo ~235°, electronic's magenta ~300–330°, core/root's gold ~42°) so that no two realms can be mistaken for each other at cloud zoom.

**Fonts:**
- Display/headings: `Fraunces` (variable, Google Fonts)
- Body: `Inter`
- Mono/labels: `IBM Plex Mono`

**Aesthetic:** very dark background (`#0e0b1a`, `--color-bg`), translucent frosted panels (`rgba(255,255,255,0.04)` backgrounds, `1px solid rgba(255,255,255,0.08)` borders), canvas nebula behind artist pages, CSS grain overlay (`app/globals.css` `.grain` pseudo-element). All interactive elements use `color-mix(in srgb, var(--layer-color) …, transparent)` for glow/hover states.
