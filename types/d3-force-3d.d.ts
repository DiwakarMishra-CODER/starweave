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
    strength(strength: number): this;
    links(links: LinkDatum[]): this;
  }

  export function forceLink<
    NodeDatum extends SimulationNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>,
  >(links?: LinkDatum[]): ForceLink<NodeDatum, LinkDatum>;

  export interface ForceManyBody {
    strength(strength: number): this;
  }

  export function forceManyBody(): ForceManyBody;

  export interface ForceCenter {
    strength(strength: number): this;
  }

  export function forceCenter(x?: number, y?: number): ForceCenter;
}
