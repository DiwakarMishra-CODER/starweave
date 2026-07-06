# Starweave

An interactive force-directed influence graph of indie music, v1 focused on the shoegaze / dream-pop lineage rooted at the Velvet Underground.

Starweave is not a music-discovery app that happens to have a graph. Its identity is a **graph-data-structure engine**: nodes are artists, directed edges are influence relationships, node size is computed from the graph, and the whole product is built around traversal, filtering, and path-finding over that structure.

## Stack

- **Next.js 16 (App Router) + TypeScript** — strict mode throughout
- **react-force-graph-2d** (canvas) — owns the physics and React lifecycle; graph data is memoized to prevent simulation restarts
- **Static JSON generated at build time** — no database, no auth, no runtime API for the graph; the graph cannot break in front of a visitor
- **Vercel** — deployment target

## Build-time pipeline

The graph is generated before `next build` runs, via a Node.js/TypeScript script:

```bash
npm run build:data
```

The pipeline (`scripts/build-graph.ts`) does three things:

1. **Validate** — every `edge.source` and `edge.target` must resolve to a real artist ID. Fails loudly (`process.exit(1)`) on a dangling reference.
2. **Compute `influenceScore`** — in-degree count of `type: 'influence'` edges per node. Drives node size and the "most important" ranking. Never hand-labelled.
3. **Enrich** (stubbed in v1) — Spotify and MusicBrainz IDs for audio preview embeds. Skipped gracefully when API keys are absent.

The script emits `public/graph.json`, which Next.js then ships as a static asset.

## Data model

See `data/types.ts` for the full schema. Key decisions:

| Decision | Why |
|---|---|
| Slug IDs key everything | Referential integrity — edges reference IDs, never name strings |
| Genres are hierarchical | Powers additive filters (shoegaze → indie → underground) |
| Every artist has a `scope` | v1 renders one dense slice without deleting data |
| Edges carry full shape from row one | No re-auditing when honesty layer / similarity edges arrive |
| External IDs on every entity | Build-time enrichment joins on stable keys |

## The honesty layer

`ai-suggested` edges and any AI-generated text are **proposals, not truth**:

- Dashed + muted rendering for `ai-suggested` edges
- Prominent "AI-drafted · pending review" badge on all AI-generated prose
- Verified vs AI-suggested legend visible on the graph at all times

## Development

```bash
npm install
npm run build:data   # generates public/graph.json (run once before dev)
npm run dev          # localhost:3000
```

### Optional env vars (Spotify/MusicBrainz enrichment)

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
MUSICBRAINZ_USER_AGENT=starweave/1.0 (your@email.com)
```

If absent, `build:data` skips enrichment and logs a notice. The app functions fully without them.

## Testing

```bash
npm test             # vitest run (unit + component)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## Features (v1)

- Force graph — canvas, node size = influence score, color = layer, directed arrows, glow halos, verified edges solid / ai-suggested dashed + muted
- Layer filter — operates on the live graph (physics keeps running; only draw is filtered)
- Hover — highlights node + direct connections, dims the rest
- Shortest path — BFS over directed influence edges, highlights path on canvas with chromatic-aberration effect
- Artist pages — bio, genres, classic albums, influences + descendants
- Genre story — `/genre/shoegaze` fully built; others stubbed; all marked AI-drafted
- Browse + search — list all v1 artists, filter by layer/genre, sorted by influence score

---

## Original Next.js notes

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
