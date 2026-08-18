'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AXIS_HEADER_HEIGHT,
  computeAxis,
  computeBarGeometry,
  computeVerticalSizing,
  computeYearTicks,
  LABEL_GAP,
  type SceneTimelineScene,
} from '@/lib/scenes-timeline';

interface Props {
  scenes: SceneTimelineScene[];
}

export default function ScenesTimeline({ scenes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [plotSize, setPlotSize] = useState({ width: 1352, height: 560 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // .scenes-timeline__plot is flex:1 inside a column that fills the
  // viewport (see globals.css) — its rendered height is whatever's actually
  // left over after the nav bar, header, and page padding, on THIS window.
  // Measuring it (rather than assuming a fixed target like 750px) is what
  // lets the diagram fill the whole window instead of stopping at a
  // compact size and leaving empty background below it on a taller one.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPlotSize({ width: rect.width, height: rect.height });
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      setPlotSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width: plotWidth, height: plotHeight } = plotSize;

  const scale = useMemo(() => computeAxis(scenes), [scenes]);
  const yearTicks = useMemo(() => computeYearTicks(scale, plotWidth), [scale, plotWidth]);

  const sizing = useMemo(() => computeVerticalSizing(scenes, plotHeight), [scenes, plotHeight]);

  const bars = useMemo(
    () => scenes.map((s, i) => ({
      scene: s,
      geo: computeBarGeometry(
        s, scale, plotWidth,
        sizing.barHeights[i], sizing.faceSize, sizing.faceStep,
      ),
    })),
    [scenes, scale, plotWidth, sizing],
  );

  // One row per scene → each row's own (scaled) bar height sets its height,
  // rows stack top to bottom in scene.row order with the scaled gap between
  // them.
  const rowTops = useMemo(() => {
    const tops: number[] = [];
    let cursor = AXIS_HEADER_HEIGHT;
    for (const { geo } of bars) {
      tops.push(cursor);
      cursor += geo.barHeight + sizing.rowGap;
    }
    return tops;
  }, [bars, sizing.rowGap]);

  // Every row's fully-resolved geometry, computed once — the tooltip (below)
  // used to render as a CHILD of each row div, but every row shares the same
  // z-index (2) and is its OWN stacking context (position:absolute + a
  // z-index establishes one), so a nested z-index:30 tooltip could never
  // outrank a DIFFERENT row's content — only siblings within the same row.
  // That's exactly what let Dischord's label read through SST's tooltip.
  // Hoisting the tooltip to render once, after every row, at the plot's own
  // top level fixes it structurally rather than by raising z-index further.
  const rows = useMemo(() => bars.map(({ scene, geo }, i) => {
    const barLeftPx = (geo.leftPct / 100) * plotWidth;
    const barRightPx = barLeftPx + geo.widthPx;
    const wouldClipRight = plotWidth - barRightPx < geo.labelWidthPx + LABEL_GAP;
    return {
      scene,
      geo,
      rowTop: rowTops[i],
      barLeftPx,
      barRightPx,
      wouldClipRight,
      labelStyle: wouldClipRight
        ? { left: Math.max(0, barLeftPx - LABEL_GAP - geo.labelWidthPx) }
        : { left: barRightPx + LABEL_GAP },
    };
  }), [bars, rowTops, plotWidth]);

  const hoveredRow = hoveredId ? rows.find(r => r.scene.id === hoveredId) ?? null : null;

  return (
    <div className="scenes-timeline">
      <div className="scenes-timeline__plot" ref={containerRef}>
        {/* Year axis + faint vertical gridlines — shared across every row so
            time-aligned overlaps (SST/Dischord, 4AD/Creation, riot
            grrrl/Seattle) are visible at a glance without hovering anything.
            Tick spacing is deliberately uneven: the axis is density-weighted
            (see computeAxis), so evenly-spaced years would hide exactly the
            compression the scale is applying. */}
        <div className="scenes-timeline__axis" aria-hidden>
          {yearTicks.map(year => (
            <div
              key={year}
              className="scenes-timeline__tick"
              style={{ left: `${scale.yearToPct(year)}%` }}
            >
              <span className="scenes-timeline__tick-label">{year}</span>
              <span className="scenes-timeline__tick-line" style={{ top: AXIS_HEADER_HEIGHT, height: Math.max(0, plotHeight - AXIS_HEADER_HEIGHT) }} />
            </div>
          ))}
        </div>

        {rows.map(({ scene, geo, rowTop, labelStyle }) => {
          const isHovered = hoveredId === scene.id;
          const isDimmed = hoveredId !== null && !isHovered;

          const onHover = () => setHoveredId(scene.id);
          const onUnhover = () => setHoveredId(null);

          return (
            <div
              key={scene.id}
              className="scenes-timeline__row"
              style={{ top: rowTop, height: geo.barHeight }}
            >
              <Link
                href={`/scene/${scene.id}`}
                className={`scenes-timeline__bar${isDimmed ? ' scenes-timeline__bar--dimmed' : ''}${isHovered ? ' scenes-timeline__bar--hovered' : ''}`}
                style={{
                  left: `${geo.leftPct}%`,
                  width: `${geo.widthPct}%`,
                  height: geo.barHeight,
                  top: 0,
                  // Open-ended (Windmill only): square off the right corner
                  // and fade to transparent instead of a hard rounded stop —
                  // a rounded cap under a fade still reads as "this shape
                  // ends here, softly," where a squared edge trailing into
                  // nothing reads as "this continues past what's drawn."
                  borderRadius: scene.isOpenEnded ? '999px 0 0 999px' : undefined,
                  background: scene.isOpenEnded
                    ? `linear-gradient(90deg, ${scene.color}, color-mix(in srgb, ${scene.color} 60%, black) 70%, transparent 100%)`
                    : `linear-gradient(135deg, ${scene.color}, color-mix(in srgb, ${scene.color} 60%, black))`,
                  boxShadow: isHovered
                    ? `0 0 0 1px color-mix(in srgb, ${scene.color} 70%, white), 0 0 24px color-mix(in srgb, ${scene.color} 55%, transparent)`
                    : scene.isOpenEnded ? 'none' : `0 0 0 1px color-mix(in srgb, ${scene.color} 35%, transparent)`,
                }}
                onMouseEnter={onHover}
                onMouseLeave={onUnhover}
                aria-label={`${scene.name} — ${scene.city}, ${scene.era} — ${scene.members.length} artists${scene.isOpenEnded ? ', ongoing' : ''}`}
              >
                <span className="scenes-timeline__faces">
                  {scene.members.map((m, mi) => (
                    <span
                      key={m.id}
                      className="scenes-timeline__face"
                      style={{ left: mi * geo.faceStep, zIndex: scene.members.length - mi, width: geo.faceSize, height: geo.faceSize }}
                    >
                      {m.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.imageUrl} alt="" width={geo.faceSize} height={geo.faceSize} />
                      ) : (
                        <span className="scenes-timeline__face-initial" style={{ fontSize: Math.max(8, geo.faceSize * 0.4) }}>{m.name.charAt(0)}</span>
                      )}
                    </span>
                  ))}
                </span>
              </Link>

              <Link
                href={`/scene/${scene.id}`}
                className={`scenes-timeline__label${isDimmed ? ' scenes-timeline__label--dimmed' : ''}${isHovered ? ' scenes-timeline__label--hovered' : ''}`}
                style={{ ...labelStyle, top: geo.barHeight / 2, '--scene-color': scene.color } as React.CSSProperties}
                onMouseEnter={onHover}
                onMouseLeave={onUnhover}
              >
                {geo.labelText}
              </Link>
            </div>
          );
        })}

        {/* Single tooltip, rendered once at the plot's own top level (not
            nested inside a row) — see the note on `rows` above for why. */}
        {hoveredRow && (
          <div
            className="scenes-timeline__tooltip"
            style={{
              // Positioned relative to .scenes-timeline__plot directly now
              // (an explicit pixel top, not the old top:100% which relied on
              // being nested inside the row it belonged to) — just below the
              // hovered row's own bar.
              top: hoveredRow.rowTop + hoveredRow.geo.barHeight + 6,
              ...(hoveredRow.wouldClipRight
                ? { left: hoveredRow.barLeftPx, transform: 'translateX(-100%)' }
                : { left: hoveredRow.barRightPx }),
            }}
          >
            <p className="scenes-timeline__tooltip-name">{hoveredRow.scene.name}</p>
            <p className="scenes-timeline__tooltip-meta">
              {hoveredRow.scene.city} · {hoveredRow.scene.era} · {hoveredRow.scene.members.length} artists
            </p>
            <p className="scenes-timeline__tooltip-members">{hoveredRow.scene.members.map(m => m.name).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
