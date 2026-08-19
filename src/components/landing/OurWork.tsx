import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
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
    title: "Atlas Health — a calmer way to manage care",
    meta: ["React", "Node", "HIPAA-ready"],
  },
  {
    img: workMeridian,
    client: "Finance · Investor Platform",
    title: "Meridian Capital — data-dense made effortless",
    meta: ["Next-gen data", "Realtime", "AWS"],
  },
  {
    img: workHarborline,
    client: "Logistics · Operations Dashboard",
    title: "Harborline — fleet visibility, rebuilt from the ground up",
    meta: ["Maps", "Realtime", "Azure"],
  },
  {
    img: workCivica,
    client: "Government · Citizen Services",
    title: "Civica Council Services — public sector that feels modern",
    meta: ["Accessibility", "GDS", "GOV.UK"],
  },
  {
    img: workNorthfield,
    client: "Retail · Commerce Platform",
    title: "Northfield Retail — an editorial storefront built to move fast",
    meta: ["Headless", "Next.js", "Stripe"],
  },
];

export function OurWork() {
  return (
    <section id="work" className="relative py-32">
      <div className="mx-auto mb-16 max-w-6xl px-6">
        <SectionLabel>Selected work</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
          Our Work <span className="text-ember">Speaks</span>.
        </h2>
      </div>

      <div className="space-y-24">
        {WORK.map((w, i) => (
          <WorkCard key={w.title} {...w} index={i} />
        ))}
      </div>
    </section>
  );
}

function WorkCard({
  img,
  client,
  title,
  meta,
  index,
}: {
  img: string;
  client: string;
  title: string;
  meta: string[];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });

  const rotateX = useTransform(smooth, [0, 0.5, 1], [12, 0, -8]);
  const rotateZ = useTransform(smooth, [0, 1], [index % 2 ? 2 : -2, 0]);
  const scale = useTransform(smooth, [0, 0.5, 1], [0.88, 1, 0.94]);
  const imgY = useTransform(smooth, [0, 1], ["-12%", "12%"]);
  const glow = useTransform(smooth, [0, 0.5, 1], [0, 0.7, 0]);

  return (
    <div ref={ref} className="perspective-scene mx-auto max-w-6xl px-6">
      <motion.article
        style={{ rotateX, rotateZ, scale, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-deep)]"
      >
        <motion.div
          style={{ opacity: glow }}
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(80%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]"
          aria-hidden
        />
        <div className="relative h-[52vh] min-h-[320px] overflow-hidden">
          <motion.img
            src={img}
            alt={title}
            loading="lazy"
            width={1200}
            height={900}
            style={{ y: imgY, scale: 1.25 }}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-20 flex flex-wrap items-end justify-between gap-6 border-t border-border bg-card/80 p-8 backdrop-blur">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-primary">{client}</p>
            <h3 className="mt-3 max-w-xl text-2xl font-medium md:text-3xl">{title}</h3>
          </div>
          <ul className="flex flex-wrap gap-2">
            {meta.map((m) => (
              <li key={m} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </motion.article>
    </div>
  );
}
