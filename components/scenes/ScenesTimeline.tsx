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
import { useCoarsePointer } from '@/lib/use-media-query';

interface Props {
  scenes: SceneTimelineScene[];
}

// See flipTooltipUp below — the vertical room a tooltip is assumed to need.
const TOOLTIP_RESERVE_PX = 132;

export default function ScenesTimeline({ scenes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [plotSize, setPlotSize] = useState({ width: 1352, height: 560 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isCoarsePointer = useCoarsePointer();
  // Touch only: which scene the next tap would OPEN. Separate from hoveredId
  // because a synthesised mouseenter lands before the click on the same tap,
  // so hoveredId is already set by the time the click handler runs.
  const [touchArmedId, setTouchArmedId] = useState<string | null>(null);

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

  // Room a tooltip needs below a bar before it would overhang the plot. A
  // deliberate over-estimate rather than a measured height: measuring would
  // mean rendering first and repositioning after, which flickers on every
  // first hover, and erring large only flips a row or two early.
  const flipTooltipUp = hoveredRow !== null
    && hoveredRow.rowTop + hoveredRow.geo.barHeight + 6 + TOOLTIP_RESERVE_PX > plotHeight;

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
          // Touch keeps the tooltip up until another bar is tapped — the
          // synthesised mouseleave fires immediately after the tap and would
          // otherwise close the tooltip that same gesture just opened.
          const onUnhover = () => { if (!isCoarsePointer) setHoveredId(null); };
          // Both the bar and the label are <Link>s, so on touch the first tap
          // navigated straight to the scene page — meaning the tooltip (dates,
          // member count, the whole reason a bar is hoverable) was unreachable
          // on a phone. First tap now shows it; a second tap opens the page.
          const onActivate = (e: React.MouseEvent) => {
            if (!isCoarsePointer) return;
            if (touchArmedId === scene.id) return;
            e.preventDefault();
            setTouchArmedId(scene.id);
            setHoveredId(scene.id);
          };

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
                  // Tapers but never reaches transparent: the bar has to
                  // still be visibly present at the plot's extreme right edge,
                  // or an ongoing scene reads as having stopped short of it.
                  background: scene.isOpenEnded
                    ? `linear-gradient(90deg, ${scene.color} 0%, color-mix(in srgb, ${scene.color} 72%, black) 62%, color-mix(in srgb, ${scene.color} 42%, transparent) 100%)`
                    : `linear-gradient(135deg, ${scene.color}, color-mix(in srgb, ${scene.color} 60%, black))`,
                  boxShadow: isHovered
                    ? `0 0 0 1px color-mix(in srgb, ${scene.color} 70%, white), 0 0 24px color-mix(in srgb, ${scene.color} 55%, transparent)`
                    : scene.isOpenEnded ? 'none' : `0 0 0 1px color-mix(in srgb, ${scene.color} 35%, transparent)`,
                }}
                onMouseEnter={onHover}
                onMouseLeave={onUnhover}
                onClick={onActivate}
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
                onClick={onActivate}
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
              // Positioned relative to .scenes-timeline__plot directly (an
              // explicit pixel offset, not the old top:100% which relied on
              // being nested inside the row it belonged to).
              //
              // Below the bar normally, ABOVE it for rows near the bottom.
              // The flip is not cosmetic: .scenes-overlay is the scroll
              // container, so a tooltip hanging past the plot's bottom edge
              // grew the scrollable height on hover and shrank it again on
              // unhover — the page visibly jumped every time the pointer left
              // a bottom-row bar. Anchoring by `bottom` when flipped means the
              // tooltip grows upward from the bar's top edge and never needs
              // its own height measured.
              ...(flipTooltipUp
                ? { bottom: Math.max(0, plotHeight - hoveredRow.rowTop + 6) }
                : { top: hoveredRow.rowTop + hoveredRow.geo.barHeight + 6 }),
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
            {/* Touch only: the first tap opened this tooltip instead of
                following the bar's link, so the page has to say that the
                link is still there and how to take it. The tooltip is
                pointer-events:none, so this states the gesture rather than
                being a tap target itself. */}
            {isCoarsePointer && touchArmedId === hoveredRow.scene.id && (
              <p
                className="scenes-timeline__tooltip-cta"
                style={{ '--scene-color': hoveredRow.scene.color } as React.CSSProperties}
              >
                Tap again to open {hoveredRow.scene.name} →
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
