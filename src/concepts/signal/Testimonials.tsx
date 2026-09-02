import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef } from "react";
import { testimonials } from "@/concepts/shared/content";

export function SignalTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative h-[260vh]"
      style={{
        background:
          "linear-gradient(180deg, var(--background) 0%, color-mix(in oklab, var(--primary) 4%, var(--background)) 50%, var(--background) 100%)",
      }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="perspective-scene relative h-[42vh] w-full max-w-3xl">
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
  const y = useTransform(progress, [start, mid, end], [28, 0, -28]);

  return (
    <motion.figure style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <blockquote>
        <p className="text-[clamp(1.5rem,3.2vw,2.5rem)] font-medium leading-[1.25] text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-8 font-mono text-sm text-muted-foreground">
        {name}, {org}
      </figcaption>
    </motion.figure>
  );
}

function Dots({ progress, total }: { progress: MotionValue<number>; total: number }) {
  return (
    <div className="mt-16 flex gap-2">
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
    [0.25, 1, 1, 0.25],
  );
  return <motion.span style={{ opacity }} className="h-[3px] w-8 bg-primary" />;
}
