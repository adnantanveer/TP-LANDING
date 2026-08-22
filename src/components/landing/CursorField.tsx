import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Reactive layer: a soft light that follows the pointer across the whole page
 * and a small ring that lags behind for a tactile, trendy feel.
 * Disabled on touch / coarse pointers.
 */
export function CursorField() {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const gx = useSpring(x, { stiffness: 120, damping: 24, mass: 0.5 });
  const gy = useSpring(y, { stiffness: 120, damping: 24, mass: 0.5 });
  const rx = useSpring(x, { stiffness: 400, damping: 30 });
  const ry = useSpring(y, { stiffness: 400, damping: 30 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      <motion.div
        style={{ x: gx, y: gy }}
        className="absolute -left-[9rem] -top-[9rem] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_25%,transparent),transparent)]"
      />
      <motion.div
        style={{ x: rx, y: ry }}
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full border border-primary/60"
      />
    </div>
  );
}

/** Wrap any block to make it tilt slightly toward the pointer. */
export function ReactiveTilt({
  children,
  className,
  strength = 8,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });

  return (
    <div
      className={className}
      style={{ perspective: 1000 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * strength);
        rx.set(-py * strength);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
