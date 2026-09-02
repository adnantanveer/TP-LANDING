import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/landing/primitives";
import { workItems, type WorkItem } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

export function ConcreteWork() {
  return (
    <section id="work" className="relative border-b-2 border-foreground bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-[clamp(2rem,5.5vw,4rem)] font-display leading-[0.95]">Work that speaks for itself.</h2>

        <div className="mt-14 flex flex-col">
          {workItems.map((w, i) => (
            <Reveal key={w.slug}>
              <Row item={w} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ item, index }: { item: WorkItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <div className="group grid grid-cols-1 gap-6 border-t-2 border-foreground py-8 md:grid-cols-[6rem_14rem_1fr_1fr] md:items-center">
      <span className="font-mono text-2xl font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
      <div ref={ref} className="h-36 w-full overflow-hidden border-2 border-foreground md:h-44 md:w-56">
        <motion.img
          src={item.img}
          alt=""
          loading="lazy"
          style={{ y }}
          className="h-[130%] w-full object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
        />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{item.client}</p>
        <h3 className="mt-2 text-xl font-bold uppercase tracking-tight">{item.title}</h3>
      </div>
      <div>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.caption}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.meta.map((m) => (
            <li key={m} className="flex items-center gap-1.5 border-2 border-foreground px-2.5 py-1 text-xs font-bold uppercase">
              <TechIcon name={m} className="h-3 w-3 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
