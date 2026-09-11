import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/** Horizontal scroll-pin gallery — a mechanic not used elsewhere on this
 * page (Work is a vertical grid), so it stays a single-use signature move. */
export function VertexProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <section id="process" ref={ref} className="relative h-[280vh] border-t border-primary/20 bg-background">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-12 w-full max-w-6xl px-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// how we work</p>
          <h2 className="mt-4 max-w-xl text-[clamp(2rem,4.6vw,3.2rem)] font-bold leading-[1.05]">
            A delivery model built for certainty.
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-6 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {processSteps.map((s, i) => (
            <article key={s.title} className="group w-[76vw] shrink-0 border border-primary/25 bg-card p-9 transition-colors hover:border-primary/60 md:w-[30vw]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                <ProcessIcon icon={s.icon} className="h-8 w-8 text-primary/50 transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
