import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/landing/primitives";
import { workItems, type WorkItem } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

export function SurgeWork() {
  return (
    <section id="work" className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-xl text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.05]">Work that speaks for itself.</h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {workItems.map((w, i) => (
            <Reveal key={w.slug} delay={(i % 2) * 0.06}>
              <WorkCard item={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ item }: { item: WorkItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-28, 28]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group overflow-hidden rounded-[2rem] border border-border bg-card"
    >
      <div ref={ref} className="relative h-52 overflow-hidden">
        <motion.img
          src={item.img}
          alt=""
          loading="lazy"
          style={{ y }}
          whileHover={{ scale: 1.05 }}
          transition={{ scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
          className="h-[130%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
      </div>
      <div className="p-7">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{item.client}</p>
        <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.caption}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {item.meta.map((m) => (
            <li key={m} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <TechIcon name={m} className="h-3 w-3 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
