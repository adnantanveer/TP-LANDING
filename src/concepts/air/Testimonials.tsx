import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef } from "react";
import { testimonials } from "@/concepts/shared/content";

/** A single huge quote at a time, no card, no border — typography carries
 * the whole section, matching this concept's one-family-no-ornament rule. */
export function AirTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section ref={ref} className="relative h-[260vh] border-t border-border bg-background">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="relative h-[40vh] w-full max-w-2xl">
          {testimonials.map((t, i) => (
            <Quote key={t.name + t.org} {...t} index={i} total={testimonials.length} progress={p} />
          ))}
        </div>
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
  const y = useTransform(progress, [start, mid, end], [16, 0, -16]);

  return (
    <motion.figure style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <blockquote>
        <p className="text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.4]">&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-8 text-sm text-muted-foreground">
        {name}, {org}
      </figcaption>
    </motion.figure>
  );
}
