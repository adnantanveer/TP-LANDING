import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef } from "react";
import { testimonials } from "@/concepts/shared/content";

/** Reference: webisoft.com's full-bleed black-and-white photo testimonial
 * with the quote overlaid directly on the image. Uses the same verified
 * mood photography as the Work section (real photos, checked frame by
 * frame earlier this session) rather than the src/assets CGI renders —
 * one of those (work-1.jpg) turned out to be an abstract glass-panel
 * render, wrong tone entirely for "people talking about working with us". */
export function IndexTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <img src="/assets/work-atlas.jpg" alt="" className="h-full w-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="relative h-[42vh] w-full max-w-3xl">
            {testimonials.map((t, i) => (
              <Quote key={t.name + t.org} {...t} index={i} total={testimonials.length} progress={p} />
            ))}
          </div>
          <Dots progress={p} total={testimonials.length} />
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
  const y = useTransform(progress, [start, mid, end], [24, 0, -24]);

  return (
    <motion.figure style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <blockquote>
        <p className="text-[clamp(1.5rem,3.4vw,2.5rem)] font-medium leading-[1.3] text-white">&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-8 font-mono text-sm uppercase tracking-[0.15em] text-white/70">
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
    [0.35, 1, 1, 0.35],
  );
  return <motion.span style={{ opacity }} className="h-1.5 w-6 bg-primary" />;
}
