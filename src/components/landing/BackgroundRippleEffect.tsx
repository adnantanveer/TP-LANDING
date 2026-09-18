import { useEffect, useMemo, useRef, useState } from "react";

const CELL = 44; // px, grid cell size
const DURATION = 900; // ms the one-shot scroll-in pulse takes
const SPEED = 900; // px/s the ripple wavefront travels outward — controls ring spacing

interface Origin {
  row: number;
  col: number;
}

// Explicit cell offsets from the hovered origin, rather than a symmetric
// radius test — a radius of ~1.2 (the hovered cell + its 4 orthogonal
// neighbors) reads as a "+" glyph sitting on the grid, which is what this
// replaces: three cells across the top, two down the middle, tracing a T.
const RIPPLE_SHAPE: Origin[] = [
  { row: 0, col: -1 },
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 2, col: 0 },
];

/**
 * A grid of cells that ripple outward from wherever the pointer is —
 * inspired by https://ui.aceternity.com/components/background-ripple-effect,
 * rebuilt from scratch (no dependency added) and matching this site's
 * dark/amber theme instead of that demo's own colors.
 *
 * Two distinct behaviors, not one shared animation:
 *  - Scroll into view: a single one-shot pulse from the center (CSS
 *    keyframe, fixed 900ms, fades back out on its own — nobody's pointer
 *    is actually there, so it shouldn't linger).
 *  - Pointer hover: the T-shape under the cursor turns on and *stays* on
 *    (a plain CSS transition, not a timed animation) for as long as the
 *    pointer sits there, and only eases back out once the pointer moves to
 *    a different cell or leaves the grid — it was fading mid-hover before
 *    because it reused the scroll-in pulse's fixed 900ms timer regardless
 *    of whether the pointer was still there.
 */
export function BackgroundRippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ rows: 0, cols: 0 });
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [hovering, setHovering] = useState(false);
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
          setHovering(false);
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
    setHovering(true);
    if (lastCell.current && lastCell.current.row === cell.row && lastCell.current.col === cell.col) return;
    lastCell.current = cell;
    setOrigin(cell);
  }

  function handlePointerLeave() {
    setHovering(false);
    setOrigin(null);
    lastCell.current = null;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
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
          const offRow = origin ? row - origin.row : null;
          const offCol = origin ? col - origin.col : null;
          const inRange = offRow !== null && offCol !== null && RIPPLE_SHAPE.some((s) => s.row === offRow && s.col === offCol);
          const dist = offRow !== null && offCol !== null ? Math.hypot(offRow, offCol) : Infinity;
          const delay = `${(dist * CELL) / SPEED}s`;

          if (hovering) {
            return (
              <div
                key={`${row}-${col}`}
                className={`rb-cell${inRange ? " rb-cell--active" : ""}`}
                style={inRange ? { transitionDelay: delay } : undefined}
              />
            );
          }
          return (
            <div
              key={`${row}-${col}`}
              className="rb-cell"
              style={inRange ? { animation: `rb-ripple ${DURATION}ms ease-out ${delay} 1 normal backwards` } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
