import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

export function useSectionProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  return { ref, progress: smooth as MotionValue<number> };
}

export function Reveal({
  children,
  delay = 0,
  y = 32,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [14, 0, -10]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0.2, 1, 1, 0.35]);
  const smoothRotate = useSpring(rotateX, { stiffness: 80, damping: 22 });
  const smoothScale = useSpring(scale, { stiffness: 80, damping: 22 });

  return (
    <div ref={ref} className="perspective-scene">
      <motion.div
        style={{ rotateX: smoothRotate, scale: smoothScale, opacity, transformStyle: "preserve-3d" }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

// First + last initials ("Amit Kumar" -> "AK") read as a deliberate
// monogram badge rather than a single stray letter — used wherever a
// person (or a role-only attribution like "Operations Director") needs a
// placeholder avatar (TeamFlipCard, Testimonials' Quote).
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
      <span className="h-px w-8 bg-primary/60" />
      {children}
    </span>
  );
}

/** Cinematic entrance: the section rises, un-tilts and settles as it enters the viewport. */
export function SceneEnter({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.4 });

  const opacity = useTransform(smooth, [0, 1], [0, 1]);
  const y = useTransform(smooth, [0, 1], [140, 0]);
  const scale = useTransform(smooth, [0, 1], [0.9, 1]);
  const rotateX = useTransform(smooth, [0, 1], [14, 0]);
  const blur = useTransform(smooth, (v) => `blur(${(1 - v) * 12}px)`);

  return (
    <div ref={ref} className="perspective-scene">
      <motion.div
        style={{ opacity, y, scale, rotateX, filter: blur, transformStyle: "preserve-3d", transformOrigin: "top center" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

