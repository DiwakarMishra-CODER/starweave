@AGENTS.md

# Starweave — context handoff

## What it is

Starweave is an interactive force-directed graph that maps influence relationships between indie, shoegaze, and dream-pop artists, rooted at The Velvet Underground. Users explore a constellation of 46 artists across five layers (root → post-punk → shoegaze/dream-pop → indie-alt → outside), click any node to open a slide-over artist panel, and navigate to full artist detail pages with bios, classic album cards (cover art + 3–4 sentence write-up), and influence chips. The aesthetic is atmospheric — dark background, nebula/grain layer, layer-keyed glow colors.

**Stack:** Next.js 16 App Router · TypeScript · `react-force-graph-2d` (canvas) · static JSON data build · no database.

---

## Architecture decisions

**Persistent graph layout.** The graph lives in `app/(graph)/layout.tsx` as a shell that never unmounts. Artist pages (`/artist/[slug]`) are rendered inside that shell so the force simulation stays alive across navigation. The graph uses a Client Component; artist pages are Server Components.

**Static data pipeline.** Source of truth is `data/seed-data.ts` (hand-curated artists, edges, classic albums). At build time, `scripts/build-graph.ts` enriches it — fetching artist images (Deezer) and album cover art (iTunes `artworkUrl100` → `600x600bb`) — and writes `public/graph.json`. At request time, `lib/graph-data.ts` reads that file with a module-level cache (`let _cache`). **Restart the dev server whenever `public/graph.json` is patched** to bust the cache.

**Influence score.** Computed as in-degree of influence edges (how many artists in the graph cite this artist as an influence). Used to scale node radius.

**Layer colors** drive the whole visual system — each layer has an HSL color that flows into node fills, artist page backgrounds (`--layer-color`), album card hover glows, and influence chip borders (`--chip-color`). Defined in `lib/colors.ts`.

---

## Data model

`data/seed-data.ts` → `data/types.ts` for full interface definitions.

**Artist**
```
id           slug, kebab-case, stable forever
name         display name
layer        'root' | 'post-punk' | 'shoegaze-dreampop' | 'indie-alt' | 'outside'
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
- Force graph with layer/scope filtering, focus mode, path-finder
- Artist slide-over panel (graph) + full artist detail pages (`/artist/[slug]`)
- Bios for all 46 artists (`data/bios.ts`)
- Classic album visual cards — solo = horizontal layout (cover left, text right); multiple = auto-fill grid
- Album cover art (41/46 from iTunes; 5 use placeholder: The Boatman's Call, Visions of a Life, Zen Arcade, Slanted and Enchanted, Getting Killed)
- Influence chips with artist photo avatars and layer-keyed glow
- Atmospheric `ArtistBackground` (canvas aurora + grain) on artist pages
- All 46 write-ups trimmed to 3–4 sentences
- CI workflow (`.github/workflows/ci.yml`)

**Pending / known gaps:**
- Some artist images fall back to initials placeholder (Deezer enrichment incomplete for certain artists)
- "Listen on Spotify/Apple Music" links not yet added to album cards
- No deployment configured (Vercel/Netlify — `npm run build` → `next build` works)
- Browse and genre pages exist but are minimal stubs

---

## Known quirks / gotchas

**Never write scripts to surgically edit `seed-data.ts`.** The file previously had smart-quote (U+2018/2019) string delimiters that broke script-based parsing. It is now fully corrected to straight ASCII quotes. Edit strings directly in the file — find the artist, change the value, done.

**Module cache in `lib/graph-data.ts`.** The `let _cache: GraphData | null = null` at module level means patching `public/graph.json` has no effect until you restart the dev server (`pkill -f "next dev"` then `npm run dev`).

**Next.js 16 breaking changes.** Read `node_modules/next/dist/docs/` before touching routing or server/client component boundaries. `dynamic` with `ssr: false` is NOT allowed in Server Components — use a plain import instead.

**No `'use client'` on graph routes.** The `(graph)` layout is a Server Component shell; only the canvas-based `ForceGraph` and search/filter components are Client Components.

---

## Design system

**Layer palette** (defined in `lib/colors.ts`):
| Layer | Color |
|---|---|
| root | `hsl(260 80% 75%)` — soft violet |
| post-punk | `hsl(340 70% 65%)` — rose |
| shoegaze-dreampop | `hsl(200 75% 70%)` — sky blue |
| indie-alt | `hsl(150 60% 60%)` — seafoam |
| outside | `hsl(40 70% 65%)` — amber |

**Fonts:**
- Display/headings: `Fraunces` (variable, Google Fonts)
- Body: `Inter`
- Mono/labels: `IBM Plex Mono`

**Aesthetic:** very dark background (`#06060e`), translucent frosted panels (`rgba(255,255,255,0.04)` backgrounds, `1px solid rgba(255,255,255,0.08)` borders), canvas nebula behind artist pages, CSS grain overlay (`app/globals.css` `.grain` pseudo-element). All interactive elements use `color-mix(in srgb, var(--layer-color) …, transparent)` for glow/hover states.
