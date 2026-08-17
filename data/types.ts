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
export type Realm = 'core' | 'region-one' | 'electronic' | 'folk-confessional' | 'emo-posthardcore' | 'post-rock-drone-noise' | 'american-underground';

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
  | 'art-electronic'
  | 'folk-roots'
  | 'freak-folk'
  | 'confessional'
  | 'slowcore'
  | 'indie-folk'
  | 'hardcore-roots'
  | 'post-hardcore'
  | 'midwest-emo'
  | 'math-rock'
  | 'post-rock'
  | 'no-wave'
  | 'drone'
  | 'noise-alt'
  | 'college-rock'
  | 'indie-rock'
  | 'psych'
  | 'neo-psych';

export interface Genre {
  id: string;            // slug, e.g. 'shoegaze'
  name: string;          // display, e.g. 'Shoegaze'
  parent: string | null; // primary parent genre slug — drives layout/position in the tree
  alsoFrom?: string[];    // secondary parents — real influence, drawn on top of the tree, never affects layout position. A genre never repeats its own `parent` here (that would be redundant, not additive).
  emerged?: number;       // year the genre emerged — undefined for pure containers (electronic, folk, indie, underground)
  emergedBasis?: string;  // what that year refers to (an album, a term being coined, a scene forming) — emergence dates are contested, so a bare year is unsupportable; same discipline as the edge citation field
}

// A scene is a time + place, not a sound — distinct from Genre. Scene pages
// are deliberately short (3-7 artists, a few years, one room) — see the
// SceneMemberRole/placeAndTime/legacy fields below, added in the 2026 scene-
// page pass that replaced an earlier deck/sections shape (a genre-page-style
// narrative arc that ran too long for how small a scene actually is).
export interface SceneMemberRole {
  artistId: string;  // must be one of the scene's memberIds
  // This member's specific role IN THIS SCENE — one line, not a generic bio
  // snippet. Keep it roughly 120-230 characters, the range every existing
  // scene sits in. This is a layout constraint, not just a style preference:
  // SceneMemberRoster renders these into a CSS grid (.scene-roster), where
  // every card in a row takes the height of the tallest card in that row, so
  // one oversized role leaves visible dead space under all of its neighbours.
  // A 449-character role broke the DC Hardcore roster exactly this way once.
  // If there is more to say, it belongs in placeAndTime (a paragraph array)
  // or legacy, not here.
  role: string;
}

export interface Scene {
  id: string;              // slug, e.g. 'no-wave'
  name: string;            // display name, e.g. 'No New York'
  era: string;             // display range, e.g. '1978–1983'
  place: string;           // display place, e.g. 'Lower Manhattan'
  city: string;            // timeline-index location, e.g. 'Washington DC', 'Bristol', 'Lower Manhattan'
  yearStart: number;
  yearEnd?: number;        // the year the SCENE stopped being a coherent thing, not the year the bands stopped — omit entirely for a scene that hasn't closed (currently just Windmill; every other scene here has genuinely ended even where its members are still active). The /scenes timeline renders an open bar (a fade, not a hard stop) when this is absent.
  blurb: string;           // one or two sentences, for compact/timeline display (the /scenes index tooltip, meta description)
  placeAndTime: string[];  // 1-2 paragraphs, rendered in order — the physical room: venue/house/studio, who booked it, who owned the gear. What makes a scene a scene rather than a genre.
  memberRoles: SceneMemberRole[]; // one per member, in memberIds order — their specific role in this scene, with internal influence edges worked into the prose where the graph records them
  legacy: string;          // 2-3 sentences — the downstream, what came out of it
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
  rejectedEdges: RejectedEdge[];
}

// Explicit-effort states only. 'cited' is NOT a member here — it's derived
// from `citation` being non-null (see resolveCitationStatus below), so it
// can never drift out of sync with the citation field itself.
// 'unsourceable' = research explicitly looked and failed to find a quotable
//   source for a real, accepted, undisputed influence — a genuine property
//   of the data (the most self-evident influences are the least citable),
//   not a research failure. Only ever set when an audit document recorded
//   that failure explicitly.
// 'unchecked'/undefined = default. Nobody has looked yet. Never assign this
//   explicitly — its whole meaning is "no one wrote anything here."
export type CitationStatus = 'unsourceable' | 'unchecked';

// Who is speaking in `citation`, not how confident we are (that's
// `confidence`). Kept separate from the citation string itself so the tier
// is metadata a UI can render as a marker, not a word the reader has to
// parse out of prose. Populated only on cited edges — meaningless without
// a citation to characterize.
// 'first-person' = the artist's own quoted or directly-reported statement.
// 'reported'     = a publication states/lists the fact, no direct quote
//                  (e.g. a Wikipedia influence-section listing).
// 'critic'       = a critic's comparison or analysis, not the artist's own
//                  account.
export type SourceTier = 'first-person' | 'reported' | 'critic';

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
  citationStatus?: CitationStatus; // see CitationStatus above; omit unless 'unsourceable'
  sourceTier?: SourceTier;   // see SourceTier above; only meaningful when citation is set
}

// Single source of truth for the three-way cited/unsourceable/unchecked
// read. Any UI showing citation state should call this rather than reading
// `citation`/`citationStatus` directly, so the two fields can't disagree.
export function resolveCitationStatus(edge: Pick<Edge, 'citation' | 'citationStatus'>): 'cited' | CitationStatus {
  if (edge.citation) return 'cited';
  return edge.citationStatus ?? 'unchecked';
}

// A documented case of an artist explicitly denying a commonly-assumed
// influence — recorded so a future research pass doesn't re-propose and
// "confirm" the same false edge off the same critic comparisons.
export interface RejectedEdge {
  source: string;    // the artist who denies it
  target: string;    // the claimed influence
  citation: string;  // source + what was actually said
  strength: 'clean' | 'contested';
}
