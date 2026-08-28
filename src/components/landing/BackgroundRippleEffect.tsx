import { useEffect, useMemo, useRef, useState } from "react";

const CELL = 44; // px, grid cell size
const DURATION = 900; // ms a single cell's own pulse takes
const SPEED = 900; // px/s the ripple wavefront travels outward — controls ring spacing
const MAX_RADIUS = 1.2; // cells — just the hovered cell + its 4 direct neighbors (excludes diagonals at ~1.41)

interface Origin {
  row: number;
  col: number;
}

/**
 * A grid of cells that ripple outward from wherever the pointer is —
 * inspired by https://ui.aceternity.com/components/background-ripple-effect,
 * rebuilt from scratch (no dependency added) and matching this site's
 * dark/amber theme instead of that demo's own colors. Auto-ripples once
 * from center when it scrolls into view, then follows the pointer: moving
 * over the grid re-ripples from whichever cell is under it.
 *
 * Pure CSS keyframe animation per cell (see .rb-cell's `animation` in
 * styles.css) — React only computes each cell's distance-based delay,
 * updating the same DOM nodes' inline style on every new hovered cell
 * (no key-forced remount) so following the pointer across many cells in a
 * row stays cheap even at a few hundred cells.
 */
export function BackgroundRippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ rows: 0, cols: 0 });
  const [origin, setOrigin] = useState<Origin | null>(null);
  const lastCell = useRef<Origin | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setDims({
        cols: Math.ceil(el.clientWidth / CELL) + 1,
        rows: Math.ceil(el.clientHeight / CELL) + 1,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || dims.rows === 0 || dims.cols === 0) return;
    let fired = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          setOrigin({ row: Math.floor(dims.rows / 2), col: Math.floor(dims.cols / 2) });
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dims.rows, dims.cols]);

  const cells = useMemo(() => {
    const arr: { row: number; col: number }[] = [];
    for (let r = 0; r < dims.rows; r++) {
      for (let c = 0; c < dims.cols; c++) arr.push({ row: r, col: c });
    }
    return arr;
  }, [dims.rows, dims.cols]);

  // Only re-ripples when the pointer crosses into a DIFFERENT cell, not on
  // every pixel of movement — otherwise this would re-render all cells on
  // every mousemove event.
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cell: Origin = {
      row: Math.floor((e.clientY - rect.top) / CELL),
      col: Math.floor((e.clientX - rect.left) / CELL),
    };
    if (lastCell.current && lastCell.current.row === cell.row && lastCell.current.col === cell.col) return;
    lastCell.current = cell;
    setOrigin(cell);
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${dims.cols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${dims.rows}, ${CELL}px)`,
        }}
      >
        {cells.map(({ row, col }) => {
          const dist = origin ? Math.hypot(row - origin.row, col - origin.col) : Infinity;
          const inRange = origin && dist <= MAX_RADIUS;
          return (
            <div
              key={`${row}-${col}`}
              className="rb-cell"
              style={
                inRange
                  ? { animation: `rb-ripple ${DURATION}ms ease-out ${(dist * CELL) / SPEED}s 1 normal backwards` }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
