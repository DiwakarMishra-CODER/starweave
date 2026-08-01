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

  const radiusOf = useCallback((count: number) => Math.min(11, 3 + Math.sqrt(count) * 1.15), []);
  const strokeOf = useCallback((count: number) => Math.min(5, 1 + Math.sqrt(count) * 0.35), []);

  // Ancestor chain of the hovered node (up through effective parents to its
  // band root) — this is what actually highlights, per genre; everything
  // else dims. Recomputed only when the hover target changes.
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

  // Per-physical-row grouping of always-labeled nodes, keyed by their
  // resolved y (two nodes share a row iff they share a y, regardless of
  // which original band/strip produced that row) — used to size each
  // label's truncation budget against its next same-row neighbor rather
  // than letting two labels print on top of each other.
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
    let lastDrawnX = -Infinity;
    return yearMarks.map(({ year, rank }) => {
      const x = xOfRank(rank);
      const w = String(year).length * AXIS_GLYPH_W;
      const draw = x - w / 2 > lastDrawnX + AXIS_LABEL_BUFFER;
      if (draw) lastDrawnX = x + w / 2;
      return { year, x, draw };
    });
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

  return (
    <div className="genre-timeline">
      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        className="genre-timeline__svg"
        role="img"
        aria-label="Genre emergence timeline, subway-map style"
      >
        {/* ── Edges (drawn first, under the dots/labels) ── */}
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
              opacity={dimmed ? 0.1 : isActive && activeChain ? 1 : 0.55}
              style={{ transition: 'opacity 160ms ease' }}
            />
          );
        })}

        {/* ── Nodes + labels ── */}
        {nodes.map(n => {
          const r = radiusOf(n.count);
          const isActive = activeChain ? activeChain.has(n.id) : true;
          const dimmed = activeChain !== null && !isActive;
          const showLabel = n.alwaysLabeled || (activeChain !== null && activeChain.has(n.id));
          const budget = labelBudget.get(n.id);
          const label = n.alwaysLabeled && !activeChain
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
              {/* Invisible larger hit-area so small dots stay easy to hover/click */}
              <circle cx={n.x} cy={n.y} r={Math.max(r, 9)} fill="transparent" />
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={n.color}
                opacity={dimmed ? 0.18 : 1}
                stroke={isActive && activeChain ? '#fff' : 'none'}
                strokeWidth={isActive && activeChain ? 1.2 : 0}
                style={{ transition: 'opacity 160ms ease' }}
              />
              {showLabel && (
                <>
                  {/* Solid chip behind the label — a connector line running
                      through unlabeled space read fine, but several labels
                      (indie-rock, lo-fi, chamber-pop, alt-rock among them)
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
                    opacity={dimmed ? 0.3 : 1}
                    style={{ pointerEvents: 'none', transition: 'opacity 160ms ease' }}
                  />
                  <text
                    x={labelX}
                    y={n.y}
                    dominantBaseline="middle"
                    fontSize={LABEL_FONT_SIZE}
                    fontFamily="var(--font-body)"
                    fill={dimmed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.92)'}
                    style={{ pointerEvents: 'none', transition: 'opacity 160ms ease' }}
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
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <p className="genre-timeline__tooltip-name">{tooltip.node.name}</p>
          <p className="genre-timeline__tooltip-meta">
            {tooltip.node.emerged} — {tooltip.node.emergedBasis}
          </p>
          <p className="genre-timeline__tooltip-count">
            {tooltip.node.count} {tooltip.node.count === 1 ? 'artist' : 'artists'}
          </p>
        </div>
      )}
    </div>
  );
}
