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

**Realm separation forces.** `components/graph/ForceGraph.tsx` runs three "home" positions (`REALM_HOME_X_CORE/REGION_ONE/ELECTRONIC`) that pull each realm's nodes toward its own cluster instead of one hairball, weakens link strength on cross-realm ("bridge") edges relative to within-realm edges, and gives `realm === 'core'` nodes an extra glow multiplier. A node with no `realm` (there are none among real artists anymore, since `data/seed-data.ts` backfills every artist to `core` or `region-one`) is unaffected by any of this.

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
- Force graph with layer/scope filtering, focus mode, path-finder, plus realm-separation clustering (core / region-one / electronic)
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
