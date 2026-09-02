import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/landing/primitives";
import { workItems, type WorkItem } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

export function IndexWork() {
  return (
    <section id="work" className="relative bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <span className="index-tag">/ WORK</span>
        <h2 className="mt-4 max-w-2xl text-[clamp(1.9rem,5vw,3.4rem)] leading-[0.95]">Work that speaks for itself.</h2>
      </div>

      <div className="mt-16 border-t border-border">
        {workItems.map((w, i) => (
          <Reveal key={w.slug}>
            <Row item={w} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Row({ item, index }: { item: WorkItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <div className="index-dashed border-b border-dashed border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[4.5rem_11rem_1fr_1fr] md:items-center">
        <span className="index-tag">W/{String(index + 1).padStart(3, "0")}</span>
        <div ref={ref} className="h-32 w-full overflow-hidden md:h-24">
          <motion.img src={item.img} alt="" loading="lazy" style={{ y }} className="h-[130%] w-full object-cover" />
        </div>
        <div>
          <p className="index-tag text-primary">{item.client}</p>
          <h3 className="mt-1 font-display text-2xl uppercase leading-none">{item.title}</h3>
        </div>
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">{item.caption}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {item.meta.map((m) => (
              <li key={m} className="flex items-center gap-1.5 border border-border px-2.5 py-1 text-xs text-foreground/80">
                <TechIcon name={m} className="h-3 w-3 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
