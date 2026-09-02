import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode, PointerEvent } from "react";

/**
 * Magnetic Micro-physics (taste-skill 5): wraps an interactive child (a
 * link/button) in a block that pulls toward the cursor within `strength`
 * px and springs back on leave. Driven by useMotionValue/useSpring outside
 * React's render cycle — never useState, which would re-render every move.
 * Wraps rather than replaces the child element so the child keeps its own
 * semantics (real <a>/<button>, its own href/onClick/type).
 */
export function Magnetic({
  strength = 18,
  className,
  children,
}: {
  strength?: number;
  className?: string;
  children: ReactNode;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.4 });

  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * strength);
        y.set(((e.clientY - r.top) / r.height - 0.5) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
