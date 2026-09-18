import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Reveal, SectionLabel } from "./primitives";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/**
 * "How we work" — pulled in from the Crest concept's own Process.tsx: same
 * numbered vertical spine with a scroll-filled progress line (so the line
 * connecting each step reads as something the reader draws themselves by
 * scrolling, not a static decoration), same shared processSteps copy and
 * icons every concept already draws from.
 *
 * Crest's own version flips this section dark against its otherwise light
 * page, for an actual light/dark rhythm — this homepage is dark already,
 * so there's nothing to flip; it picks up the same warm radial ember
 * background as Statement.tsx (`.chapter-glow-bg`), so the two sections
 * pulled in from concepts read as the same recurring "chapter" moment,
 * plus Crest's own slow ambient breathing glow (`.process-ambient-glow`,
 * tinted from this site's own --primary-glow) as this section's one extra
 * atmospheric touch. (A genuine light-mode chapter was tried here too —
 * dropped for now, a real light theme is its own separate piece of work.)
 */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 40%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section id="process" className="chapter-glow-bg relative overflow-hidden py-28">
      <div className="process-ambient-glow -right-40 -top-40" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-6">
        <Reveal>
          <SectionLabel>How we work</SectionLabel>
          <h2 className="mt-6 max-w-xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05]">
            A delivery model built for <span className="text-ember">certainty</span>.
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16 pl-14">
          <span className="absolute left-[1.45rem] top-2 bottom-2 w-px bg-border" aria-hidden />
          <motion.span
            style={{ scaleY: fill }}
            className="absolute left-[1.45rem] top-2 bottom-2 w-px origin-top bg-primary"
            aria-hidden
          />

          <div className="flex flex-col gap-14">
            {processSteps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="relative">
                  <span className="absolute -left-14 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary">
                    <ProcessIcon icon={s.icon} className="h-5 w-5" />
                  </span>
                  <p className="font-mono text-xs text-muted-foreground">0{i + 1}</p>
                  <h3 className="mt-1.5 text-xl font-medium tracking-tight md:text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
