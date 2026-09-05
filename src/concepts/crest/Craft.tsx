import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { processSteps } from "@/concepts/shared/content";

// Real photo (Unsplash License — free for commercial use, no attribution
// required): a developer's multi-monitor desk, illustrative code on
// screen. Shown here as atmosphere, not as a claim about a specific
// Techpotam desk or team member — same reason the body copy below reuses
// the Build step's own already-established line rather than inventing a
// new operational claim.
export function CrestCraft() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-10%", "10%"]);

  const build = processSteps.find((s) => s.title === "Build")!;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="grid grid-cols-1 items-stretch md:grid-cols-2">
        <div ref={ref} className="relative h-[50vh] overflow-hidden md:h-[70vh]">
          <motion.img
            src="/assets/crest-craft.jpg"
            alt=""
            style={{ y }}
            className="crest-photo-grade absolute inset-0 h-[130%] w-full object-cover"
          />
          <div className="crest-photo-tint absolute inset-0" aria-hidden />
        </div>
        <div className="flex items-center px-6 py-16 md:px-16">
          <Reveal>
            <span className="crest-eyebrow">How we build</span>
            <h2 className="mt-5 max-w-md text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1]">
              Real engineers, real screens, real deadlines.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">{build.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
