import { motion, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import workAtlas from "@/assets/work-atlas.jpg";
import workMeridian from "@/assets/work-meridian.jpg";
import workHarborline from "@/assets/work-harborline.jpg";
import workCivica from "@/assets/work-civica.jpg";
import workNorthfield from "@/assets/work-northfield.jpg";
import { SectionLabel } from "./primitives";

const WORK = [
  {
    img: workAtlas,
    client: "Healthcare · Patient Portal",
    title: "Atlas Health",
    caption: "A calmer way to manage care, built for patients and clinicians alike.",
    meta: ["React", "Node", "HIPAA-ready"],
  },
  {
    img: workMeridian,
    client: "Finance · Investor Platform",
    title: "Meridian Capital",
    caption: "A precise, data-dense product made to feel effortless.",
    meta: ["Next-gen data", "Realtime", "AWS"],
  },
  {
    img: workHarborline,
    client: "Logistics · Operations Dashboard",
    title: "Harborline",
    caption: "Real-time visibility across a fleet, redesigned from the ground up.",
    meta: ["Maps", "Realtime", "Azure"],
  },
  {
    img: workCivica,
    client: "Government · Citizen Services",
    title: "Civica Council Services",
    caption: "A public-sector portal that finally feels like a modern product.",
    meta: ["Accessibility", "GDS", "GOV.UK"],
  },
  {
    img: workNorthfield,
    client: "Retail · Commerce Platform",
    title: "Northfield Retail",
    caption: "An editorial storefront built to move fast without losing polish.",
    meta: ["Headless", "Next.js", "Stripe"],
  },
];

/**
 * Pinned horizontal-scroll gallery — same sticky-pin + scroll-driven x-track
 * mechanic as Sections.tsx's Process (proven pattern in this codebase),
 * applied to the work cards instead of process steps. Matches the
 * interaction on techpotam-landing's (5173) "Our Work Speaks" section —
 * cards changing on scroll via parallax inside a pinned section — reskinned
 * to this project's amber/teal theme rather than porting its own tokens.
 *
 * The track travels an exact pixel distance (trackWidth - viewportWidth,
 * the same calculation 5173's own GSAP version used), not an approximated
 * percentage — a fixed percentage either overshoots into dead scroll space
 * after the last card or undershoots and never fully reveals it. The
 * wrapper's own height is set to match that same distance 1:1
 * (100vh + distance, not a fixed guess like h-[320vh]) so the pinned
 * scroll range's length always equals exactly what the track needs — the
 * last card finishes arriving exactly as the pin releases, continuing
 * straight into the next section with no dead scroll either way.
 */
export function OurWork() {
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
    <section id="work" ref={ref} className="relative" style={{ height: distance ? `calc(100vh + ${distance}px)` : "100vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-12 w-full max-w-6xl px-6">
          <SectionLabel>Selected work</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
            Our Work <span className="text-ember">Speaks</span>.
          </h2>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 pl-6 pr-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))] md:pr-[max(1.5rem,calc((100vw-72rem)/2))]"
        >
          {WORK.map((w, i) => (
            <WorkCard key={w.title} {...w} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WorkCard({
  img,
  client,
  title,
  caption,
  meta,
  index,
}: {
  img: string;
  client: string;
  title: string;
  caption: string;
  meta: string[];
  index: number;
}) {
  return (
    <article className="group relative aspect-[4/5] w-[80vw] shrink-0 overflow-hidden rounded-2xl border border-border bg-card md:aspect-[16/10] md:w-[46vw]">
      <img
        src={img}
        alt={title}
        loading="lazy"
        width={1200}
        height={900}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />

      <span className="absolute right-6 top-6 font-mono text-xs text-primary/80">{String(index + 1).padStart(2, "0")}</span>

      <div className="absolute inset-x-0 bottom-0 p-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-primary">{client}</p>
        <h3 className="mt-3 text-2xl font-medium md:text-3xl">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {caption}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {meta.map((m) => (
            <li key={m} className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {m}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
