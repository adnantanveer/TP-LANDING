import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef } from "react";
import { testimonials } from "@/concepts/shared/content";

export function VantageTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section id="testimonials" ref={ref} className="relative h-[260vh] bg-background">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="perspective-scene relative h-[46vh] w-full max-w-2xl">
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
  const scale = useTransform(progress, [start, mid, end], [0.96, 1, 0.96]);

  return (
    <motion.figure style={{ opacity, scale }} className="vantage-glass absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] p-10 text-center md:p-14">
      <blockquote>
        <p className="text-[clamp(1.3rem,2.8vw,2.1rem)] font-medium leading-[1.3] text-foreground">&ldquo;{quote}&rdquo;</p>
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
