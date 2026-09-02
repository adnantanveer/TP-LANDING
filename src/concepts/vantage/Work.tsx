import { motion, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { workItems } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

/**
 * Pinned horizontal-scroll gallery — the one horizontal-pin section on this
 * page (Process below uses a vertical sticky-stack instead, so the
 * mechanic isn't repeated). Same sticky + scroll-driven x-track math as the
 * live OurWork.tsx, restyled with glass cards and full-pill radius.
 */
export function VantageWork() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useLayoutEffect(() => {
    const measure = () => {
      if (trackRef.current) setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section
      id="work"
      ref={ref}
      className="relative bg-background"
      style={{ height: distance ? `calc(100vh + ${distance}px)` : "100vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-6xl px-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Selected work</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.03]">
            Work that speaks for itself.
          </h2>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 pl-6 pr-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))] md:pr-[max(1.5rem,calc((100vw-72rem)/2))]"
        >
          {workItems.map((w) => (
            <Card key={w.slug} {...w} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Card({ img, client, title, caption, meta }: (typeof workItems)[number]) {
  return (
    <div className="vantage-glass group relative w-[80vw] shrink-0 overflow-hidden rounded-[2rem] md:w-[32vw]">
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
      </div>
      <div className="p-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-primary/80">{client}</p>
        <h3 className="mt-3 text-2xl font-medium">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{caption}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {meta.map((m) => (
            <li key={m} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <TechIcon name={m} className="h-3 w-3 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex items-center gap-2 text-xs text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View project <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
