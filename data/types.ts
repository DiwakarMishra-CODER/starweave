// ─────────────────────────────────────────────────────────────
// Indie Influence Graph — data model
//
// Design principles baked in (do not "simplify" these away):
//  1. Stable slug IDs key everything. Edges reference ids, never names.
//     (Referential integrity is what makes a force graph crash — never
//      let an edge point at a name string.)
//  2. Genres are first-class, multi-valued, and hierarchical (parent chain
//     shoegaze -> indie -> underground). Powers the "all indie regardless
//     of genre" filter and the future all-underground expansion additively.
//  3. Every artist carries a `scope` so v1 can render one dense slice
//     without deleting anything. Expansion = flipping what's included.
//  4. Edges already have the FULL shape (type, status, confidence, citation)
//     from row one, so nothing needs re-auditing when the honesty layer
//     and similarity edges arrive.
//  5. External IDs (spotify, musicbrainz) live on every entity so scale-up
//     joins on stable keys instead of fuzzy-matching names.
// ─────────────────────────────────────────────────────────────

// Color axis of the graph: which lineage a node belongs to.
// 'outside' = influences from beyond the indie tradition (e.g. Bowie) —
// rendered in a distinct color. Everything else is inside-lineage.
export type Layer =
  | 'root'                // proto/foundational (Velvet Underground, Television...)
  | 'post-punk'           // the connective generation
  | 'shoegaze-dreampop'   // the heart / v1 focus
  | 'indie-alt'           // the wider indie/alt-rock bridge
  | 'outside';            // non-indie roots pulled in by edges

// influence  = directional (A influenced B). The hero relationship.
// contemporary / similarity = symmetric. Similarity is the WEAKEST signal
// and must be visually quietest + toggleable (it is not influence).
export type EdgeType = 'influence' | 'contemporary' | 'similarity';

// verified     = documented, citable relationship.
// ai-suggested = proposed by the LLM pipeline; render differently
//                (dashed / muted) and require confirmation before trusting.
export type EdgeStatus = 'verified' | 'ai-suggested';

// Phasing. v1 renders only 'shoegaze-dreampop-v1'. Later phases add rows.
export type Scope = 'shoegaze-dreampop-v1' | 'indie' | 'underground';

// Second color/layout axis, orthogonal to Layer — separates the graph into
// three broad clusters (core roots / region-one indie-alt lineage / island-two
// electronic lineage) for the force-graph's realm-separation forces and
// gold/magenta coloring (see lib/colors.ts's resolveNodeColor family).
// Optional: absent on an Artist means "no realm assigned" (the resolvers in
// lib/colors.ts fall back to Layer-based coloring in that case).
export type Realm = 'core' | 'region-one' | 'electronic';

// Sub-grouping within realm: 'electronic' — which family of electronic music
// a node belongs to. Drives the per-lineage magenta/pink-purple shade.
export type Lineage =
  | 'krautrock'
  | 'synth-pop'
  | 'idm'
  | 'ambient-drone'
  | 'electronic-indie-dancepunk'
  | 'trip-hop-downtempo'
  | 'hyperpop-pcmusic'
  | 'art-electronic';

export interface Genre {
  id: string;            // slug, e.g. 'shoegaze'
  name: string;          // display, e.g. 'Shoegaze'
  parent: string | null; // parent genre slug — builds the hierarchy
}

// A scene is a time + place, not a sound — distinct from Genre.
// The narrative reads as a chronological arc (sections in order), not a
// definitional structure. memberIds is the community who were there.
export interface SceneSection {
  heading: string;        // e.g. 'The Circuit'
  paragraphs: string[];   // prose, rendered in order
}

export interface Scene {
  id: string;              // slug, e.g. 'american-underground'
  name: string;            // display name, e.g. 'American Underground'
  era: string;             // display range, e.g. '1980–1991'
  place: string;           // display place, e.g. 'US'
  deck: string;            // opening paragraph, shown in the hero
  sections: SceneSection[]; // narrative body, in chronological order
  memberIds: string[];     // artist ids — the scene's community
}

export interface Album {
  id: string;
  title: string;
  year?: number;
  isClassic?: boolean;        // surfaced as a badge + filter
  classicReason?: string;     // the "why it's a classic" essay (AI-drafted, human-verified)
  spotifyId?: string | null;  // for the embed preview player
  imageUrl?: string | null;   // album cover art — enriched at build time
}

export interface Artist {
  id: string;            // stable slug — the key for everything
  name: string;          // display name
  layer: Layer;          // color axis
  genres: string[];      // genre slugs (multi-valued)
  scope: Scope[];        // which phase(s) this artist belongs to
  country?: string;      // ISO-ish, for optional map/filter later
  activeFrom?: number;   // year the act started — powers a timeline view later

  // Content for the artist page. Enrich via the AI-draft / human-verify
  // pipeline — never publish unreviewed (LLMs go generic/wrong on deep cuts).
  bio?: string;
  classicAlbums?: Album[];

  // External IDs — enrich from Spotify / MusicBrainz. Spotify id is required
  // for the audio preview embed. MusicBrainz id is the universal join key.
  spotifyId?: string | null;
  musicbrainzId?: string | null;

  // The chosen signature song — used at build time to find the correct iTunes preview.
  signatureSong?: string;

  // Realm/lineage — see the Realm/Lineage type comments above.
  realm?: Realm;
  lineage?: Lineage;

  // ENRICHED AT BUILD TIME by scripts/build-graph.ts — do not author by hand.
  imageUrl?: string | null;    // Deezer artist photo (250×250)
  previewUrl?: string | null;  // iTunes 30s AAC preview URL
  previewTrack?: string | null; // track title shown in the audio player
  previewAlbum?: string | null; // album title shown below the track name

  // COMPUTED AT BUILD TIME — do not author by hand.
  // in-degree of influence edges (how many artists cite this node as an
  // influence). Drives node SIZE and the "classic / important" ranking.
  // Computing this instead of hand-labelling is the defensible, graph-first move.
  influenceScore?: number;
}

export interface GraphData {
  artists: Artist[];
  genres: Genre[];
  scenes: Scene[];
  edges: Edge[];
}

export interface Edge {
  // CONVENTION: source = the INFLUENCED artist (the disciple),
  //             target = the INFLUENCE (the root/master).
  // The arrow is drawn source -> target, i.e. it points BACK toward the root,
  // so the visual reads "everything points back to the Velvet Underground".
  source: string;   // artist slug
  target: string;   // artist slug
  type: EdgeType;
  status: EdgeStatus;
  confidence: number;        // 0..1
  citation?: string | null;  // source URL/text for verified edges (fill in)
}
