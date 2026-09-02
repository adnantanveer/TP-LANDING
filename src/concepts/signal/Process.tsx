import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/** The one horizontal-scroll-hijack section on this page (Work uses vertical
 * stacked panels instead, so this mechanic isn't repeated). */
export function SignalProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-58%"]);

  return (
    <section id="process" ref={ref} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-14 w-full max-w-6xl px-6">
          <h2 className="max-w-xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.03]">
            A delivery model built for certainty.
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-6 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {processSteps.map((s, i) => (
            <article key={s.title} className="group w-[78vw] shrink-0 border border-border p-10 md:w-[32vw]">
              <div className="flex items-center justify-between">
                <span className="signal-index text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                <ProcessIcon
                  icon={s.icon}
                  className="h-10 w-10 text-primary/40 transition-all duration-500 group-hover:rotate-6 group-hover:text-primary"
                />
              </div>
              <h3 className="mt-6 text-3xl font-medium">{s.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <div className="mt-10 h-px w-full bg-primary/50" />
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
