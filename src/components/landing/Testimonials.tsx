import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useRef } from "react";
import { SectionLabel } from "./primitives";

const TESTIMONIALS = [
  {
    quote:
      "They treated our product like it was their own. The craft shows in every screen, every transition, every detail.",
    name: "Operations Director",
    org: "UK Healthcare Provider",
  },
  {
    quote:
      "What impressed us most was the restraint — nothing in the product feels unnecessary. It just works, beautifully.",
    name: "Head of Digital",
    org: "UK Financial Services Firm",
  },
  {
    quote: "From discovery to launch, the process felt calm and considered. The result speaks for itself.",
    name: "Founder",
    org: "UK Logistics Startup",
  },
];

/**
 * Pinned quote crossfade: same "act" mechanic as the hero (progress-driven
 * opacity/scale bands over a shared scroll range), applied to three real
 * client quotes instead of hero copy.
 */
export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative h-[280vh] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)]"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="mb-16 text-center">
          <SectionLabel>In their words</SectionLabel>
          <h2 className="mt-6 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
            Trusted By <span className="text-ember">Ambitious Teams</span>.
          </h2>
        </div>

        <div className="perspective-scene relative h-[40vh] w-full max-w-3xl">
          {TESTIMONIALS.map((t, i) => (
            <Quote key={t.name} {...t} index={i} total={TESTIMONIALS.length} progress={p} />
          ))}
        </div>

        <Dots progress={p} total={TESTIMONIALS.length} />
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
    [first ? 1 : 0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, mid, end], [0.94, 1, 0.94]);
  const y = useTransform(progress, [start, mid, end], [24, 0, -24]);

  return (
    <motion.figure
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <blockquote>
        <p className="text-[clamp(1.4rem,3vw,2.25rem)] font-medium leading-[1.3] text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-8">
        <p className="font-medium">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{org}</p>
      </figcaption>
    </motion.figure>
  );
}

function Dots({ progress, total }: { progress: MotionValue<number>; total: number }) {
  return (
    <div className="mt-16 flex gap-3">
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
    [0.3, 1, 1, 0.3]
  );
  return <motion.span style={{ opacity }} className="h-1.5 w-6 rounded-full bg-primary" />;
}
