import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { workItems } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

/** Full-bleed stacked panels — deliberately not the zigzag image/text split
 * used elsewhere on this page's Process cards, and not a horizontal-scroll
 * gallery either (that mechanic is reserved for Process, once). */
export function SignalWork() {
  return (
    <section id="work" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto mb-14 max-w-6xl px-6">
        <h2 className="max-w-2xl text-[clamp(2.1rem,5vw,3.8rem)] font-semibold leading-[1.03]">
          Work that speaks for itself.
        </h2>
      </div>

      <div className="flex flex-col gap-4 px-4 md:gap-6 md:px-6">
        {workItems.map((w, i) => (
          <Panel key={w.slug} index={i} {...w} />
        ))}
      </div>
    </section>
  );
}

function Panel({
  index,
  img,
  client,
  title,
  caption,
  meta,
}: {
  index: number;
  img: string;
  client: string;
  title: string;
  caption: string;
  meta: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);
  const overlayY = useTransform(scrollYProgress, [0.2, 0.5], [24, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  return (
    <div
      ref={ref}
      className="group relative block h-[62vh] w-full overflow-hidden md:h-[78vh]"
      role="figure"
      aria-label={`${client}: ${title}`}
    >
      <motion.img
        style={{ scale }}
        src={img}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" aria-hidden />

      <span className="signal-index absolute left-6 top-6 text-sm text-white/80 md:left-10 md:top-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      <motion.div
        style={{ y: overlayY, opacity: overlayOpacity }}
        className="absolute inset-x-6 bottom-6 md:inset-x-10 md:bottom-10"
      >
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-white/70">{client}</p>
        <h3 className="mt-2 max-w-xl text-[clamp(1.5rem,3.4vw,2.6rem)] font-medium leading-[1.05] text-white">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">{caption}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {meta.map((m) => (
            <li key={m} className="flex items-center gap-1.5 border border-white/25 px-3 py-1 text-xs text-white/85">
              <TechIcon name={m} className="h-3 w-3 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
