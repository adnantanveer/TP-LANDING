import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { processSteps, type ProcessIconKey } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

/**
 * Vertical sticky-stack: each step gets its own h-screen wrapper (normal
 * flow, not sticky) containing a sticky top-0 child. Tracking the
 * *wrapper's* own scroll progress (not the sticky child's, which stays put
 * at rect.top===0 for its whole pinned span and wouldn't animate smoothly)
 * gives a clean 0->1 over exactly the one viewport-height of scroll during
 * which this card is on stage, before the next wrapper's card covers it.
 * The one sticky-stack section on the page — Work above uses a horizontal
 * pin instead, so the two don't repeat the same mechanic.
 */
export function VantageProcess() {
  return (
    <section id="process" className="relative bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-28 md:pt-36">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">How we work</p>
        <h2 className="mt-4 max-w-xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.03]">
          A delivery model built for certainty.
        </h2>
      </div>

      <div className="relative">
        {processSteps.map((s, i) => (
          <StackSlot key={s.title} index={i} total={processSteps.length} {...s} />
        ))}
      </div>
    </section>
  );
}

function StackSlot({
  index,
  total,
  title,
  body,
  icon,
}: {
  index: number;
  total: number;
  title: string;
  body: string;
  icon: ProcessIconKey;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end start"] });
  const isLast = index === total - 1;

  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, isLast ? 1 : 0.4]);
  const y = useTransform(scrollYProgress, [0, 1], [0, isLast ? 0 : -18]);

  return (
    <div ref={wrapperRef} className="relative h-screen">
      <div className="sticky top-0 flex h-screen items-center justify-center px-6" style={{ zIndex: index + 1 }}>
        <motion.div
          style={{ scale, opacity, y }}
          className="vantage-glass w-full max-w-2xl rounded-[2rem] p-10 md:p-14"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-primary">{String(index + 1).padStart(2, "0")}</span>
            <ProcessIcon icon={icon} className="h-9 w-9 text-primary" />
          </div>
          <h3 className="mt-6 text-3xl font-medium md:text-4xl">{title}</h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">{body}</p>
        </motion.div>
      </div>
    </div>
  );
}
