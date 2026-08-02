'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TimelineNode } from '@/lib/genre-timeline';
import { VIEW_W, PAD_LEFT, PAD_RIGHT, AVG_GLYPH_W, LABEL_GAP_PAD, estimateLabelWidth } from '@/lib/genre-timeline';

interface Props {
  nodes: TimelineNode[];
  rankCount: number;
  yearMarks: { year: number; rank: number }[];
  viewH: number;
  plotH: number;
}

const LABEL_FONT_SIZE = 10;
const LABEL_CHIP_PAD_X = 3;
const LABEL_CHIP_PAD_Y = 2;
const LABEL_CHIP_RADIUS = 3;
// IBM Plex Mono digits at font-size 10 run close to 0.62em — noticeably
// wider than AVG_GLYPH_W's proportional-font estimate, so the axis (all
// 4-digit years, always mono) gets its own, more conservative constants.
const AXIS_GLYPH_W = 6.3;
const AXIS_LABEL_BUFFER = 8;

function truncateToWidth(text: string, maxWidth: number): string {
  if (estimateLabelWidth(text) <= maxWidth) return text;
  const maxChars = Math.max(3, Math.floor(maxWidth / AVG_GLYPH_W) - 1);
  if (maxChars >= text.length) return text;
  return text.slice(0, maxChars).replace(/\s+$/, '') + '…';
}

export default function GenreTimeline({ nodes, rankCount, yearMarks, viewH, plotH }: Props) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: TimelineNode } | null>(null);

  const nodesById = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const rankStep = (VIEW_W - PAD_LEFT - PAD_RIGHT) / Math.max(1, rankCount - 1);
  const xOfRank = useCallback((rank: number) => PAD_LEFT + rank * rankStep, [rankStep]);

  // Weight by significance (the single biggest fix on the old, "boring like
  // a PPT" version — proto-punk and folk-punk used to render identically).
  // Both scale off the genre's own artist count, with a much wider dynamic
  // range and a much higher ceiling than before: art-pop at 32 reads as a
  // hub at a glance, darkwave at 2 stays a hairline.
  const radiusOf = useCallback((count: number) => Math.min(24, 4 + Math.sqrt(count) * 2.6), []);
  const strokeOf = useCallback((count: number) => Math.min(9, 0.75 + Math.sqrt(count) * 0.95), []);
  // Secondary (alsoFrom) lines deliberately do NOT scale by count — they
  // recede as a class, not by their own weight, so 41 of them on top of 46
  // primary lines don't start competing with the structure they're meant to
  // sit quietly behind. RESTING is the always-on state; ACTIVE is only for
  // a secondary edge touching the currently-hovered node — thicker and
  // brighter than resting, but still deliberately behind the primary
  // chain's full brightness/solid treatment (see the three-state hover
  // note below): flattening the two into one highlight loses the reason
  // alsoFrom exists as a separate concept from parent.
  const SECONDARY_STROKE_RESTING = 1.1;
  const SECONDARY_STROKE_ACTIVE = 2.4;

  // Primary ancestor chain of the hovered node (up through primary parents
  // to its band root) — fully highlighted, solid lines, exactly as before.
  const activeChain = useMemo(() => {
    if (!hoveredId) return null;
    const chain = new Set<string>();
    let cur: string | undefined = hoveredId;
    while (cur) {
      chain.add(cur);
      cur = nodesById.get(cur)?.parentId ?? undefined;
    }
    return chain;
  }, [hoveredId, nodesById]);

  // Secondary (alsoFrom) edges touching the hovered node — in either
  // direction (the hovered node's OWN alsoFrom list, and any other node
  // that lists the hovered node as one of ITS secondary parents). Three
  // states on hover, not two: the primary ancestral chain (full brightness,
  // solid, thickest), secondary parents (medium brightness, dashed,
  // thinner), everything else (dimmed hard). `secondaryTouchedIds` is the
  // node-level counterpart — a node at the far end of a lit secondary line
  // needs its own "medium" state too, or a visible line would dead-end at
  // an almost-invisible dot.
  const { activeSecondaryPairs, secondaryTouchedIds } = useMemo(() => {
    if (!hoveredId) return { activeSecondaryPairs: null, secondaryTouchedIds: null };
    const pairs = new Set<string>();
    const touched = new Set<string>();
    const hovered = nodesById.get(hoveredId);
    if (hovered) {
      for (const af of hovered.alsoFromIds) {
        pairs.add(`${hoveredId}::${af}`);
        touched.add(af);
      }
    }
    for (const n of nodes) {
      if (n.alsoFromIds.includes(hoveredId)) {
        pairs.add(`${n.id}::${hoveredId}`);
        touched.add(n.id);
      }
    }
    return { activeSecondaryPairs: pairs, secondaryTouchedIds: touched };
  }, [hoveredId, nodesById, nodes]);

  // Per-physical-row grouping of always-labeled nodes, keyed by their
  // resolved y (two nodes share a row iff they share a y, regardless of
  // which band produced that row) — used to size each label's truncation
  // budget against its next same-row neighbor rather than letting two
  // labels print on top of each other.
  const labelBudget = useMemo(() => {
    const byRow = new Map<number, TimelineNode[]>();
    for (const n of nodes) {
      if (!n.alwaysLabeled) continue;
      if (!byRow.has(n.y)) byRow.set(n.y, []);
      byRow.get(n.y)!.push(n);
    }
    const budget = new Map<string, number>();
    for (const list of byRow.values()) {
      list.sort((a, b) => a.rank - b.rank);
      list.forEach((n, i) => {
        const next = list[i + 1];
        const gap = next ? next.x - n.x : VIEW_W - PAD_RIGHT - n.x;
        budget.set(n.id, Math.max(8, gap - radiusOf(n.count) - LABEL_GAP_PAD));
      });
    }
    return budget;
  }, [nodes, radiusOf]);

  // Axis year labels: skip a label (keep the tick) if it would sit closer
  // than its own text width to the last label actually drawn.
  const axisLabels = useMemo(() => {
    const result: { year: number; x: number; draw: boolean }[] = [];
    let lastDrawnX = -Infinity;
    for (const { year, rank } of yearMarks) {
      const x = xOfRank(rank);
      const w = String(year).length * AXIS_GLYPH_W;
      const draw = x - w / 2 > lastDrawnX + AXIS_LABEL_BUFFER;
      if (draw) lastDrawnX = x + w / 2;
      result.push({ year, x, draw });
    }
    return result;
  }, [yearMarks, xOfRank]);

  const handleEnter = useCallback((node: TimelineNode, e: React.MouseEvent) => {
    setHoveredId(node.id);
    setTooltip({ x: e.clientX, y: e.clientY, node });
  }, []);
  const handleMove = useCallback((node: TimelineNode, e: React.MouseEvent) => {
    setTooltip({ x: e.clientX, y: e.clientY, node });
  }, []);
  const handleLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);
  const handleClick = useCallback((id: string) => {
    router.push(`/genre/${id}`);
  }, [router]);

  // Secondary edges as a flat list up front (each drawn once, keyed by both
  // endpoints) — curved rather than straight, per the routing note: with 41
  // of these crossing a much denser tree than the old layout, a crossing
  // straight diagonal reads as noise where a curve reads as deliberate.
  const secondaryEdges = useMemo(() => {
    const edges: { from: TimelineNode; to: TimelineNode; key: string }[] = [];
    for (const n of nodes) {
      for (const afId of n.alsoFromIds) {
        const target = nodesById.get(afId);
        if (target) edges.push({ from: n, to: target, key: `${n.id}::${afId}` });
      }
    }
    return edges;
  }, [nodes, nodesById]);

  return (
    <div className="genre-timeline">
      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        className="genre-timeline__svg"
        role="img"
        aria-label="Genre emergence timeline, subway-map style"
      >
        <defs>
          {/* Shared glow filter — matches the main graph canvas's node glow
              (a soft halo, not a flat dot) rather than the flat chart look
              this page was called out for. One shared filter, reused via
              url() on every node, is cheap since this SVG only renders once
              (no per-frame redraw the way the force graph's canvas has). */}
          <filter id="genre-node-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Secondary (alsoFrom) edges — drawn first, furthest back.
            Dashed, thin, low opacity, gently curved so a crossing line
            reads as deliberate rather than as noise. ── */}
        {secondaryEdges.map(({ from, to, key }) => {
          const isActivePair = activeSecondaryPairs ? activeSecondaryPairs.has(key) : false;
          const dimmedByChain = activeChain !== null && !isActivePair;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          // Perpendicular offset, scaled to distance and capped, so short
          // hops curve subtly and long cross-band hops curve more visibly.
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.hypot(dx, dy) || 1;
          const offset = Math.min(18, dist * 0.09);
          const nx = -dy / dist;
          const ny = dx / dist;
          const cx = midX + nx * offset;
          const cy = midY + ny * offset;
          return (
            <path
              key={`also-${key}`}
              d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
              fill="none"
              stroke={from.color}
              strokeWidth={isActivePair ? SECONDARY_STROKE_ACTIVE : SECONDARY_STROKE_RESTING}
              strokeDasharray="3 3"
              strokeLinecap="round"
              opacity={dimmedByChain ? 0.06 : isActivePair ? 0.65 : 0.28}
              style={{ transition: 'opacity 160ms ease, stroke-width 160ms ease' }}
            />
          );
        })}

        {/* ── Primary (parent) edges ── */}
        {nodes.map(n => {
          if (n.parentId === null) return null;
          const parent = nodesById.get(n.parentId);
          if (!parent) return null;
          const isActive = activeChain ? activeChain.has(n.id) && activeChain.has(parent.id) : true;
          const dimmed = activeChain !== null && !isActive;
          return (
            <line
              key={`edge-${n.id}`}
              x1={parent.x}
              y1={parent.y}
              x2={n.x}
              y2={n.y}
              stroke={n.color}
              strokeWidth={strokeOf(n.count)}
              strokeLinecap="round"
              opacity={dimmed ? 0.08 : isActive && activeChain ? 1 : 0.6}
              style={{ transition: 'opacity 160ms ease' }}
            />
          );
        })}

        {/* ── Nodes + labels — same three states as the lines above:
            primary-active (full), secondary-active (medium), dimmed. ── */}
        {nodes.map(n => {
          const r = radiusOf(n.count);
          const hovering = activeChain !== null;
          const isPrimaryActive = hovering ? activeChain!.has(n.id) : true;
          const isSecondaryActive = hovering && !isPrimaryActive && (secondaryTouchedIds?.has(n.id) ?? false);
          const dimmed = hovering && !isPrimaryActive && !isSecondaryActive;
          const showLabel = n.alwaysLabeled || (hovering && (isPrimaryActive || isSecondaryActive));
          const budget = labelBudget.get(n.id);
          const label = n.alwaysLabeled && !hovering
            ? truncateToWidth(n.name, budget ?? 999)
            : n.name;
          const labelX = n.x + r + 4;
          const labelW = estimateLabelWidth(label);
          return (
            <g
              key={n.id}
              onMouseEnter={e => handleEnter(n, e)}
              onMouseMove={e => handleMove(n, e)}
              onMouseLeave={handleLeave}
              onClick={() => handleClick(n.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible larger hit-area so small dots stay easy to hover/click.
                  The label itself (chip + text, below) is ALSO a real hit target
                  now — it used to be pointer-events:none, so hovering/clicking a
                  longer label past this circle's edge silently did nothing. */}
              <circle cx={n.x} cy={n.y} r={Math.max(r, 10)} fill="transparent" />
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={n.color}
                filter={dimmed ? undefined : 'url(#genre-node-glow)'}
                opacity={dimmed ? 0.16 : isSecondaryActive ? 0.62 : 1}
                stroke={isPrimaryActive && hovering ? '#fff' : 'none'}
                strokeWidth={isPrimaryActive && hovering ? 1.2 : 0}
                style={{ transition: 'opacity 160ms ease' }}
              />
              {showLabel && (
                <>
                  {/* Solid chip behind the label — a connector line running
                      through unlabeled space read fine, but several labels
                      sit directly over their own or a crossing branch's
                      line. A background chip fixes this unconditionally,
                      regardless of which line is under a given label —
                      same pattern the main graph canvas uses for its own
                      node labels (see CLAUDE.md's label chip note). */}
                  <rect
                    x={labelX - LABEL_CHIP_PAD_X}
                    y={n.y - LABEL_FONT_SIZE / 2 - LABEL_CHIP_PAD_Y}
                    width={labelW + LABEL_CHIP_PAD_X * 2}
                    height={LABEL_FONT_SIZE + LABEL_CHIP_PAD_Y * 2}
                    rx={LABEL_CHIP_RADIUS}
                    fill="rgba(14, 11, 26, 0.72)"
                    opacity={dimmed ? 0.3 : isSecondaryActive ? 0.75 : 1}
                    style={{ cursor: 'pointer', transition: 'opacity 160ms ease' }}
                  />
                  <text
                    x={labelX}
                    y={n.y}
                    dominantBaseline="middle"
                    fontSize={LABEL_FONT_SIZE}
                    fontFamily="var(--font-body)"
                    fill={dimmed ? 'rgba(255,255,255,0.25)' : isSecondaryActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.92)'}
                    style={{ cursor: 'pointer', transition: 'opacity 160ms ease' }}
                  >
                    {label}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ── Time axis ── */}
        <line
          x1={PAD_LEFT}
          y1={plotH + 6}
          x2={VIEW_W - PAD_RIGHT}
          y2={plotH + 6}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />
        {axisLabels.map(({ year, x, draw }) => (
          <g key={year}>
            <line x1={x} y1={plotH + 2} x2={x} y2={plotH + 10} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            {draw && (
              <text
                x={x}
                y={plotH + 24}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(255,255,255,0.55)"
                fontFamily="var(--font-mono)"
              >
                {year}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* HTML tooltip — deliberately outside the scaled SVG viewBox, so it
          stays fully readable at real CSS pixel sizes regardless of how far
          the SVG itself has been scaled down at a narrower viewport. */}
      {tooltip && (
        <div
          className="genre-timeline__tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14, '--tooltip-cta-color': tooltip.node.color } as React.CSSProperties}
        >
          <p className="genre-timeline__tooltip-name">{tooltip.node.name}</p>
          <p className="genre-timeline__tooltip-meta">
            {tooltip.node.emerged} — {tooltip.node.emergedBasis}
          </p>
          <p className="genre-timeline__tooltip-count">
            {tooltip.node.count} {tooltip.node.count === 1 ? 'artist' : 'artists'}
          </p>
          {/* The single highest-value fix here — without this line the
              tooltip reads as a pure data-viz readout, and testers
              consistently didn't realize a node was clickable. */}
          <p className="genre-timeline__tooltip-cta">Open {tooltip.node.name} →</p>
        </div>
      )}
    </div>
  );
}
