import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/** Cards idle-float continuously (subtle, staggered) instead of pinning
 * horizontally — this concept's whole point is that nothing ever sits
 * still, so the "signature move" here is ambient motion, not a scroll
 * mechanic. Idle float is gated behind reduced-motion like every other
 * loop on this page. */
export function SurgeProcess() {
  const reduce = useReducedMotion();

  return (
    <section id="process" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-xl text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.05]">
          A delivery model <span className="surge-gradient-text">built for certainty</span>.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {processSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <motion.div
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-deep)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <ProcessIcon icon={s.icon} className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
