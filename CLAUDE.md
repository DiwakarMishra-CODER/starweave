@AGENTS.md

# Starweave — context handoff

## What it is

Starweave is an interactive force-directed graph that maps influence relationships between indie, shoegaze, dream-pop, and electronic artists, rooted at The Velvet Underground. Users explore a constellation of 106 artists split across three realms — `core` (5 foundational artists: Velvet Underground, Kraftwerk, Can, Neu!, Brian Eno), `region-one` (57 indie/shoegaze/dream-pop artists, the original v1 graph), and `electronic` (44 artists across 8 electronic lineages, merged in later) — click any node to open a slide-over artist panel, and navigate to full artist detail pages with bios, classic album cards (cover art + 3–4 sentence write-up), and influence chips. Region-one and core nodes are additionally colored by the original five `Layer` values (root → post-punk → shoegaze/dream-pop → indie-alt → outside); electronic nodes are colored per-lineage instead. The aesthetic is atmospheric — dark background, nebula/grain layer, realm/layer-keyed glow colors.

**Stack:** Next.js 16 App Router · TypeScript · `react-force-graph-2d` (canvas) · static JSON data build · no database.

---

## Architecture decisions

**Persistent graph layout.** The graph lives in `app/(graph)/layout.tsx` as a shell that never unmounts. Artist pages (`/artist/[slug]`) are rendered inside that shell so the force simulation stays alive across navigation. The graph uses a Client Component; artist pages are Server Components.

**Static data pipeline.** Source of truth is `data/seed-data.ts` (hand-curated artists, edges, classic albums). At build time, `scripts/build-graph.ts` enriches it — fetching artist images (Deezer) and album cover art (iTunes `artworkUrl100` → `600x600bb`) — and writes `public/graph.json`. At request time, `lib/graph-data.ts` reads that file with a module-level cache (`let _cache`). **Restart the dev server whenever `public/graph.json` is patched** to bust the cache.

**Influence score.** Computed as in-degree of influence edges (how many artists in the graph cite this artist as an influence). Used to scale node radius.

**Realm separation forces.** `components/graph/ForceGraph.tsx`'s `presettleLayout` (run once, synchronously, before `ForceGraph2D` ever mounts — see Zoom-based cloud/detail reveal below for why) places core at dead center and spaces every other realm present in the data evenly around it on an ellipse (`computeRealmHomePositions`, `REALM_RADIUS_X/Y = 230/145`, `REALM_ANGLE_OFFSET` to spin the arrangement) — data-driven, so a new realm needs no formula change, it just re-spaces automatically. `forceX`/`forceY` pull each node toward its realm's point (`REALM_PULL_STRENGTH = 0.6`, isotropic; core gets its own stronger `CORE_PULL_STRENGTH = 1.2` so it isn't dragged into region-one's mass by its own heavy edges), realm-tagged nodes get weaker mutual repulsion (`REALM_CHARGE = -22` vs the default `-40`) so each realm's bloom can pull tighter, and link strength is weakened on cross-realm ("bridge") edges relative to within-realm edges. A hand-rolled collision force (`createCollideForce`, positional not velocity-only, `COLLIDE_ITERATIONS = 3` passes/tick) keeps nodes from overlapping even in the densest cluster (region-one, ~57 nodes). A node with no `realm` (there are none among real artists anymore, since `data/seed-data.ts` backfills every artist to `core`/`region-one`/`electronic`) is unaffected by any of this.

**Zoom-based cloud/detail reveal.** The graph has two visual modes tied to `globalScale`, both driven from `ForceGraph.tsx`: **cloud/overview** (zoom ≤ `FADE_ZOOM_OUT = 2.5`) and **detail** (zoom ≥ `FADE_ZOOM_IN = 3.5`), crossfading continuously in between (`computeZoomFade`, hub-biased so influential nodes/labels resolve in earlier). User scroll-zoom is clamped to `[SCROLL_MIN_ZOOM, SCROLL_MAX_ZOOM] = [2.5, 7]`; the focus/click-to-zoom camera can escape those bounds (declarative `minZoom`/`maxZoom` props swap between a clamped/unclamped tuple via React state — they're not in `react-force-graph-2d`'s imperative ref API, so this can't be done by calling a method).
- **Cloud zoom:** every node draws as a small sharp colored point (size/brightness scaled by `influenceScore`, most nodes faint, hubs brighter + a soft halo), against a near-black background wash (`OVERVIEW_BG_WASH_COLOR`/`_MAX_ALPHA`, painted in raw screen space so it ignores pan/zoom), a per-node additive nebula glow per realm (`CLOUD_BACKDROP_INTENSITY = 0.08`, deliberately dim — flat dark gold for core, no white-hot center), and a decorative dust starfield (`DUST_STAR_COUNT = 450` static, non-interactive points jittered around each realm's home cluster, pure decoration, not in `stableData`). Only edges touching a `core` node render as faint glowing "galaxy arm" threads (`isCoreEdge`, gated `&& edgeFade < 1` so this is structurally cloud-zoom-only, not just a formula that happens to converge); every other edge is a near-invisible floor-opacity web. Only the top `ANCHOR_COUNT = 12` nodes by `influenceScore` get name labels.
- **Detail zoom:** node radius/label `fontSize` are otherwise fixed graph-space values with no zoom term — since `react-force-graph-2d` scales everything (position AND radius) by the same `globalScale`, that meant zooming in never actually opened up relative gaps between nodes. `computeZoomSizeMult` (`ZOOM_SIZE_REFERENCE = 3.5`, `ZOOM_SIZE_DAMPEN = 0.75`) shrinks graph-space radius/font-size relative to the (unchanged) node spacing above the reference zoom — a no-op at/below it. Applied identically in `drawNode` and `paintNodePointerArea` (hit-testing must stay in sync with what's drawn) and to label `fontSize`, always *before* the separate click-focus readability floor so that floor's guaranteed minimum on-screen size is never undercut.
- **Labels:** placed in `onRenderFramePost` after every node's circle is known, with a bump-search collision avoidance (`LABEL_BUMP_MAX_STEPS`/`LABEL_BUMP_STRIDE_MULT`) and a dark rounded "chip" background (`LABEL_CHIP_PAD_X/Y`, `LABEL_CHIP_RADIUS`, `LABEL_CHIP_MAX_ALPHA`, via a small `drawRoundedRect` helper) instead of a text shadow. Forced (persistent hub/anchor) labels are processed highest-`influenceScore`-first and are **hidden entirely** rather than drawn overlapping if no clear spot is found — a lower-influence label always yields to a higher one. Focus/hover/path labels keep the old "accept the overlap" fallback instead, since hiding something the user is actively pointing at would be worse.
- **Edges:** arrowheads (`linkDirectionalArrowLength`/`RelPos`/`Color` props) only render on focused/hovered/genre-set-highlighted edges; the resting web (including path-find mode) is plain lines, no arrowheads.
- **Perf:** `autoPauseRedraw={false}` (needed because cloud-zoom brightness is continuously zoom-dependent) makes the canvas repaint every frame regardless of physics state, so every radial-gradient glow (nebula, bloom haze, cloud dot) is pre-rendered once into a cached offscreen-canvas sprite and reused via `drawImage` + `globalAlpha`/scale — never reconstruct a `CanvasGradient` per node per frame, that's what caused a severe lag regression the one time it slipped in.

**Realm/lineage color model.** `lib/colors.ts` defines `LAYER_COLORS` (5 hex values, one per `Layer`) plus a second, orthogonal axis layered on top: `LINEAGE_COLORS` (8 hex values, one per electronic `Lineage`) and a shared `CORE_COLOR` (reuses `LAYER_COLORS.root`). Everything reads through resolver functions — `resolveNodeColor` / `resolveNodeGlow` / `resolveEdgeTint` / `resolveNodeLabel` — that branch on `node.realm`: no `realm` → `LAYER_COLORS[layer]` (this is the only branch any region-one node takes, keeping its rendering byte-for-byte unchanged from before the realm system existed), `realm === 'core'` → `CORE_COLOR`, `realm === 'electronic'` → per-`lineage` hex. These feed node fills, artist page backgrounds (`--layer-color`), album card hover glows, and influence chip borders (`--chip-color`).

---

## Data model

`data/seed-data.ts` → `data/types.ts` for full interface definitions.

**Artist**
```
id           slug, kebab-case, stable forever
name         display name
layer        'root' | 'post-punk' | 'shoegaze-dreampop' | 'indie-alt' | 'outside'
realm        'core' | 'region-one' | 'electronic' — orthogonal to layer, drives graph clustering + resolver color fallback (see Realm/lineage color model above)
lineage      electronic sub-family (krautrock, synth-pop, idm, ambient-drone, electronic-indie-dancepunk, trip-hop-downtempo, hyperpop-pcmusic, art-electronic) — only set when realm === 'electronic'
scope        array of scope tags (e.g. ['shoegaze-dreampop-v1', 'indie'])
genres       array of genre IDs (see genres list in seed-data)
country      ISO 2-letter
activeFrom   year (number)
bio          injected from data/bios.ts at build time
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
```

**classicReason style:** 3–4 tight, punchy sentences. One sharp point about sound, one about a standout track or technical detail, why it endures. No mini-essays. Straight ASCII double-quote delimiters only.

---

## Current state

**Done:**
- Force graph with layer/scope filtering, focus mode, path-finder, plus realm-separation clustering (core / region-one / electronic) on a radial/elliptical layout
- Zoom-based cloud/detail reveal — starfield-style overview (crisp colored point nodes, dim per-realm nebula, decorative dust starfield, near-black background wash, core-touching edge threads, top-12 anchor labels) crossfading into the full detail view (photos, labels, calm faint edge web) — see Architecture decisions above
- Zoom-size dampening + label collision/demotion/chip backgrounds to keep the detail view legible at high zoom instead of cluttered
- Artist slide-over panel (graph) + full artist detail pages (`/artist/[slug]`)
- Bios for all 106 artists (`data/bios.ts`)
- Classic album visual cards — solo = horizontal layout (cover left, text right); multiple = auto-fill grid
- Artist photos: all 106 artists have a non-null `imageUrl` in the current build
- Album cover art: 106 classic albums, 3 currently fall back to placeholder (not yet identified by title — check `public/graph.json` for `classicAlbums` entries with `imageUrl: null`)
- "Listen on Spotify/Apple Music" search links on album cards (`components/ui/StreamingLinks.tsx`)
- Influence chips with artist photo avatars and layer-keyed glow
- Atmospheric `ArtistBackground` (canvas aurora + grain) on artist pages
- All write-ups trimmed to 3–4 sentences
- CI workflow (`.github/workflows/ci.yml`)
- Electronic-lineage merge (island-two): 44 electronic artists + Brian Eno folded into the main graph with realm/lineage tags, separation forces, and core glow — see `git log` for the `island-two` → `/lab/merged` → main-graph merge sequence

**Pending / known gaps:**
- No deployment configured (Vercel/Netlify — `npm run build` → `next build` works)
- 3 classic albums still on placeholder cover art (see above — needs identifying by title)
- Browse page (`app/browse/page.tsx`) and genre pages work (search/filter, dynamic counts, narrative sections) but haven't been given the same design pass as artist pages

---

## Discipline / hard rules

These aren't aspirational — they're the pattern the codebase itself was built with (see the `island-two` electronic-lineage merge: sandboxed at `data/island-two-data.ts` → tuned in isolation at `/lab/merged` → merged into the real graph → lab scaffolding deleted, each as its own commit).

- **Read the current code before changing anything.** Don't assume this doc, or your last session, still matches what's in the files — verify against `data/seed-data.ts`, `lib/colors.ts`, `data/types.ts`, and the component you're touching first.
- **Edit region-one data and shared components additively and backward-compatibly.** New realms/lineages/features must extend, not alter, existing behavior for real region-one artists. The concrete mechanism for this is the `!node.realm` fallback branch in every `resolve*` function in `lib/colors.ts` — any new color/label axis must preserve that branch untouched.
- **One change at a time.** Land a sandboxed/isolated version first (a new file, a `/lab` route, an additive field), confirm it doesn't touch existing rendering, then merge — don't do the merge and the new feature in the same step.
- **Never write scripts to surgically edit `seed-data.ts`** — see the quirk below.

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

**Fonts:**
- Display/headings: `Fraunces` (variable, Google Fonts)
- Body: `Inter`
- Mono/labels: `IBM Plex Mono`

**Aesthetic:** very dark background (`#0e0b1a`, `--color-bg`), translucent frosted panels (`rgba(255,255,255,0.04)` backgrounds, `1px solid rgba(255,255,255,0.08)` borders), canvas nebula behind artist pages, CSS grain overlay (`app/globals.css` `.grain` pseudo-element). All interactive elements use `color-mix(in srgb, var(--layer-color) …, transparent)` for glow/hover states.
