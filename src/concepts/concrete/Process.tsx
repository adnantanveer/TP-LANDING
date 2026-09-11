import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/** Horizontal scroll-pin — the one section on this page that scrolls
 * sideways, so it stays a single signature move against Work's vertical
 * list. */
export function ConcreteProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-58%"]);

  return (
    <section id="process" ref={ref} className="relative h-[280vh] border-b-2 border-foreground bg-background">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-12 w-full max-w-6xl px-6">
          <h2 className="max-w-xl text-[clamp(2rem,5.5vw,4rem)] font-display leading-[0.95]">A delivery model built for certainty.</h2>
        </div>

        <motion.div style={{ x }} className="flex gap-6 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {processSteps.map((s, i) => (
            <article key={s.title} className="concrete-block w-[76vw] shrink-0 border-2 border-foreground bg-card p-9 md:w-[30vw]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <ProcessIcon icon={s.icon} className="h-9 w-9" />
              </div>
              <h3 className="mt-6 text-2xl font-bold uppercase tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
