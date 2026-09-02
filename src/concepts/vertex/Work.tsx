import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/landing/primitives";
import { workItems, type WorkItem } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

export function VertexWork() {
  return (
    <section id="work" className="relative border-t border-primary/20 bg-background py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// selected work</p>
        <h2 className="mt-4 max-w-xl text-[clamp(2rem,4.6vw,3.2rem)] font-bold leading-[1.05]">
          Work that speaks for itself.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {workItems.map((w, i) => (
            <Reveal key={w.slug} delay={(i % 2) * 0.08}>
              <WorkCard item={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Classic parallax: the image sits 130% tall inside an overflow-hidden
 * frame and translates opposite the card's own scroll progress, so it
 * drifts slower than the page around it instead of scrolling 1:1. */
function WorkCard({ item }: { item: WorkItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-32, 32]);

  return (
    <div ref={ref} className="group relative overflow-hidden border border-primary/20 transition-colors hover:border-primary/60">
      <div className="relative h-56 overflow-hidden">
        <motion.img
          src={item.img}
          alt=""
          loading="lazy"
          style={{ y }}
          className="h-[130%] w-full object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>
      <div className="p-7">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary/80">{item.client}</p>
        <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.caption}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {item.meta.map((m) => (
            <li key={m} className="flex items-center gap-1.5 border border-primary/20 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              <TechIcon name={m} className="h-3 w-3 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
