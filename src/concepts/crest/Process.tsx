import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/** A single spine runs the length of the list; its fill tracks scroll
 * progress through the section, so the "line connecting the steps" reads
 * as something the reader is drawing themselves by scrolling, not a static
 * decoration. */
export function CrestProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 40%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section id="process" className="crest-dark-chapter relative overflow-hidden border-b border-border py-20 md:py-28">
      <div className="crest-ambient-glow -right-40 -top-40" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-6">
        <Reveal>
          <span className="crest-eyebrow">How we work</span>
          <h2 className="mt-5 max-w-xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.05]">
            A delivery model built for certainty.
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
                  <span className="absolute -left-14 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-primary-glow">
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
