// d3-force-3d ships no type declarations. This covers only the handful of
// exports Starweave actually uses (the off-screen graph pre-settle in
// components/graph/ForceGraph.tsx) — not a full port of the package's API.
declare module 'd3-force-3d' {
  export interface SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
    source: NodeDatum | string | number;
    target: NodeDatum | string | number;
  }

  export interface Simulation<NodeDatum extends SimulationNodeDatum> {
    tick(iterations?: number): Simulation<NodeDatum>;
    stop(): Simulation<NodeDatum>;
    alpha(): number;
    alpha(alpha: number): Simulation<NodeDatum>;
    velocityDecay(decay: number): Simulation<NodeDatum>;
    force(name: string, force: unknown): Simulation<NodeDatum>;
    force(name: string): unknown;
    nodes(): NodeDatum[];
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum>(
    nodes?: NodeDatum[],
    numDimensions?: number,
  ): Simulation<NodeDatum>;

  export interface ForceLink<
    NodeDatum extends SimulationNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>,
  > {
    id(id: (node: NodeDatum, i: number, nodes: NodeDatum[]) => string): this;
    distance(distance: number): this;
    // Widened to also accept a per-link function — the real d3-force-3d
    // implementation (src/link.js) already supports this; only this shim
    // previously restricted it to a constant.
    strength(
      strength: number | ((link: LinkDatum, i: number, links: LinkDatum[]) => number),
    ): this;
    links(links: LinkDatum[]): this;
  }

  export function forceLink<
    NodeDatum extends SimulationNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>,
  >(links?: LinkDatum[]): ForceLink<NodeDatum, LinkDatum>;

  export interface ForceManyBody<NodeDatum extends SimulationNodeDatum> {
    // Widened to also accept a per-node function — the real d3-force-3d
    // implementation (src/manyBody.js) already supports this; only this
    // shim previously restricted it to a constant.
    strength(
      strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
    ): this;
  }

  export function forceManyBody<
    NodeDatum extends SimulationNodeDatum,
  >(): ForceManyBody<NodeDatum>;

  export interface ForceCenter {
    strength(strength: number): this;
  }

  export function forceCenter(x?: number, y?: number): ForceCenter;

  // Added for the realm-separation force in components/graph/ForceGraph.tsx
  // (island-two sandbox tuning) — both the target and the strength accept
  // either a constant or a per-node function, matching the real forceX API.
  export interface ForceX<NodeDatum extends SimulationNodeDatum> {
    strength(
      strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
    ): this;
    x(x: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
  }

  export function forceX<NodeDatum extends SimulationNodeDatum>(
    x?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
  ): ForceX<NodeDatum>;

  // Vertical counterpart to ForceX/forceX above — same shape, y instead of x.
  export interface ForceY<NodeDatum extends SimulationNodeDatum> {
    strength(
      strength: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
    ): this;
    y(y: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number)): this;
  }

  export function forceY<NodeDatum extends SimulationNodeDatum>(
    y?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
  ): ForceY<NodeDatum>;
}
