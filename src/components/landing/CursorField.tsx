import { motion, useMotionValue, useSpring } from "motion/react";

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
