import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/landing/primitives";
import { workItems, type WorkItem } from "@/concepts/shared/content";

export function AirWork() {
  return (
    <section id="work" className="relative bg-background py-32 md:py-48">
      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <Reveal>
          <h2 className="max-w-lg text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">Work that speaks for itself.</h2>
        </Reveal>

        <div className="mt-24 flex flex-col gap-28 md:gap-40">
          {workItems.map((w) => (
            <Reveal key={w.slug}>
              <WorkFrame item={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkFrame({ item }: { item: WorkItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-24, 24]);

  return (
    <div>
      <div ref={ref} className="aspect-[16/10] w-full overflow-hidden rounded-lg">
        <motion.img src={item.img} alt="" loading="lazy" style={{ y }} className="h-[120%] w-full object-cover" />
      </div>
      <div className="mt-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.client}</p>
          <h3 className="mt-2 text-xl">{item.title}</h3>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{item.caption}</p>
      </div>
    </div>
  );
}
