import { motion, useInView, useReducedMotion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { Fragment, createElement, useRef, type ReactNode } from "react";

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

const KINETIC_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Kinetic headline: the text is split into words (or letters for a short
 * line), each clipped by its own mask so it rises into place from behind
 * its baseline, with a small un-rotate as it lands — the "type animating
 * on screen" language every section heading now shares (see Statement.tsx
 * for the scroll-scrubbed version of the same idea).
 *
 * Words wrapped in *asterisks* pick up the ember gradient, so a heading
 * can keep its one accent moment without the caller splitting JSX by hand.
 *
 * Visibility is observed on the heading element itself, not on each
 * animated span: the spans start translated fully outside their
 * overflow-hidden mask, and IntersectionObserver honours that clipping —
 * a per-span whileInView would therefore never fire. Pixel `y` on purpose
 * (percentage values never animated under whileInView here, see
 * concepts/shared/KineticText.tsx). Collapses to a static heading under
 * prefers-reduced-motion.
 */
export function KineticHeading({
  text,
  as: Tag = "h2",
  split = "words",
  className,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  split?: "words" | "chars";
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const words = text.split(" ");

  if (reduce) {
    return createElement(
      Tag,
      { className },
      words.map((w, i) => {
        const em = w.startsWith("*") && w.endsWith("*");
        const clean = em ? w.slice(1, -1) : w;
        return (
          <Fragment key={i}>
            {em ? <span className="text-ember">{clean}</span> : clean}
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        );
      })
    );
  }

  let unit = 0;
  return createElement(
    Tag,
    { ref, className, "aria-label": text.replace(/\*/g, "") },
    words.map((w, wi) => {
        const em = w.startsWith("*") && w.endsWith("*");
        const clean = em ? w.slice(1, -1) : w;
        const pieces = split === "chars" ? clean.split("") : [clean];
        return (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap align-top">
              {pieces.map((piece, pi) => {
                const i = unit++;
                return (
                  <span key={pi} className="kinetic-mask">
                    <motion.span
                      aria-hidden
                      className={`inline-block ${em ? "text-ember" : ""}`}
                      initial={{ y: 80, opacity: 0, rotate: 5 }}
                      animate={inView ? { y: 0, opacity: 1, rotate: 0 } : undefined}
                      transition={{ duration: 0.9, delay: delay + i * (split === "chars" ? 0.025 : 0.06), ease: KINETIC_EASE }}
                      style={{ transformOrigin: "0% 100%" }}
                    >
                      {piece}
                    </motion.span>
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </Fragment>
        );
      })
  );
}

/**
 * Masked line reveal for short body copy: each line is its own clip box
 * and rises in sequence after the heading above it. Lines are passed
 * explicitly (not auto-wrapped) so the break points are deliberate.
 */
export function LineReveal({ lines, className, delay = 0 }: { lines: string[]; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" }); // see KineticHeading
  return (
    <p ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={reduce ? "block" : "kinetic-mask block"}>
          <motion.span
            className="block"
            initial={reduce ? false : { y: 28, opacity: 0 }}
            animate={inView || reduce ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.8, delay: delay + i * 0.09, ease: KINETIC_EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </p>
  );
}

/**
 * Scroll-linked settle: the block arrives slightly scaled-down and skewed
 * (a page "caught mid-motion") and straightens as it crosses the lower
 * half of the viewport. Transform + opacity only, so it stays on the
 * compositor; a no-op under prefers-reduced-motion.
 */
export function SkewReveal({ children, className, skew = 4 }: { children: ReactNode; className?: string; skew?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 45%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const skewY = useTransform(p, [0, 1], [reduce ? 0 : skew, 0]);
  const scale = useTransform(p, [0, 1], [reduce ? 1 : 0.94, 1]);
  const y = useTransform(p, [0, 1], [reduce ? 0 : 56, 0]);
  const opacity = useTransform(p, [0, 0.6, 1], [reduce ? 1 : 0.2, 1, 1]);

  return (
    <motion.div ref={ref} style={{ skewY, scale, y, opacity, transformOrigin: "0% 100%" }} className={className}>
      {children}
    </motion.div>
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

