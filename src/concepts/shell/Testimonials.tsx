import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef } from "react";
import { testimonials } from "@/concepts/shared/content";

/** The one deliberate light "color block" chapter on this page — the
 * reference site does the same thing for its own Deployments section.
 * Client quotes get the calmer, warmer treatment; everything technical
 * (log, graph, terminal) stays dark. */
export function ShellTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section ref={ref} className="shell-light-chapter relative h-[260vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <span className="shell-cmd">
          $ <b>cat</b> reviews.log
        </span>
        <div className="relative mt-10 h-[38vh] w-full max-w-2xl">
          {testimonials.map((t, i) => (
            <Quote key={t.name + t.org} {...t} index={i} total={testimonials.length} progress={p} />
          ))}
        </div>
        <Dots progress={p} total={testimonials.length} />
      </div>
    </section>
  );
}

function Quote({
  quote,
  name,
  org,
  index,
  total,
  progress,
}: {
  quote: string;
  name: string;
  org: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const span = 1 / total;
  const start = index * span;
  const mid = start + span * 0.5;
  const end = start + span;
  const first = index === 0;

  const opacity = useTransform(
    progress,
    first ? [0, 0.02, end - 0.08, end] : [start - 0.06, start + 0.04, end - 0.08, end],
    [first ? 1 : 0, 1, 1, 0],
  );
  const y = useTransform(progress, [start, mid, end], [20, 0, -20]);

  return (
    <motion.figure style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <blockquote>
        <p className="text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.35] text-foreground">&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-7 font-mono text-sm text-muted-foreground">
        {name}, {org}
      </figcaption>
    </motion.figure>
  );
}

function Dots({ progress, total }: { progress: MotionValue<number>; total: number }) {
  return (
    <div className="mt-10 flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
}

function Dot({ index, total, progress }: { index: number; total: number; progress: MotionValue<number> }) {
  const span = 1 / total;
  const opacity = useTransform(
    progress,
    [index * span - 0.02, index * span + 0.03, (index + 1) * span - 0.03, (index + 1) * span],
    [0.3, 1, 1, 0.3],
  );
  return <motion.span style={{ opacity }} className="h-1.5 w-6 rounded-full bg-primary" />;
}
