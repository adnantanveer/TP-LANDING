import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { KineticHeading, SectionLabel } from "./primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

type WorkImage = { url: string; type: "image" | "video"; title: string; altText: string; caption: string };
// `sector` is new and optional — the live CMS predates it. When it's
// missing the card simply shows no sector line (see WorkCard).
type WorkItem = { slug: string; images: WorkImage[]; client: string; title: string; caption: string; meta: string[]; sector?: string };

// Local fallback only — the real cards (TadiBrothers, Quick Step,
// TaskFlow) come from the CMS with the admin's own platform screenshots as
// `images[0]`. None of those screenshots exist in this repo, so these use
// similar-product stock photography (public/assets/stock/work-*.jpg,
// sources in the handoff) and are flagged "replace later". Slugs are
// guesses; with the API down the detail route redirects home anyway.
const DEFAULT_WORK: WorkItem[] = [
  {
    slug: "tadibrothers",
    images: [{ url: "/assets/stock/work-ecommerce.jpg", type: "image", title: "", altText: "Online storefront on a laptop", caption: "" }],
    client: "TadiBrothers",
    title: "An electronics store, rebuilt for conversion",
    caption: "Storefront, checkout and fulfilment for a specialist electronics retailer.",
    meta: ["Next.js", "Stripe", "AWS"],
    sector: "E-commerce",
  },
  {
    slug: "quick-step",
    images: [{ url: "/assets/stock/work-flooring.jpg", type: "image", title: "", altText: "Flooring retailer website on a screen", caption: "" }],
    client: "Quick Step",
    title: "Flooring, from sample to installed",
    caption: "Product catalogue, room visualiser and dealer locator for a flooring brand.",
    meta: ["React", "Node.js", "Azure"],
    sector: "Retail",
  },
  {
    slug: "taskflow",
    images: [{ url: "/assets/stock/work-dashboard.jpg", type: "image", title: "", altText: "Task management dashboard on a monitor", caption: "" }],
    client: "TaskFlow",
    title: "A dashboard teams actually open",
    caption: "Boards, timelines and reporting for a project-management SaaS.",
    meta: ["TypeScript", "PostgreSQL", "Kubernetes"],
    sector: "SaaS",
  },
];

// Editorial grid: a wide card then a tall one, mirrored on the next row,
// so the eye moves in a zigzag instead of scanning a uniform grid. Any
// overflow past the pattern falls back to the regular half-width slot.
const SPAN_PATTERN = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];

/**
 * "Our work speaks" — a scrolling editorial grid of screenshot-led cards.
 * Each card is the platform screenshot with the copy (sector, title,
 * summary, tags, link) always visible on a frosted strip over a heavy
 * bottom gradient — no hover/tap reveal. The only motion is a slow
 * parallax drift of the screenshot against the scroll and a slight zoom
 * on hover; the grid itself settles in with a staggered rise.
 */
export function OurWork() {
  const [work, setWork] = useState<WorkItem[]>(DEFAULT_WORK);

  useEffect(() => {
    fetch(`${API_URL}/api/content/case-studies`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.caseStudies?.length && setWork(data.caseStudies))
      .catch(() => {});
  }, []);

  return (
    <section
      id="work"
      className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-28 md:py-36"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionLabel>Selected work</SectionLabel>
        <KineticHeading text="Our work *speaks.*" className="mt-6 max-w-2xl text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.98]" />

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
          {work.map((w, i) => (
            <WorkCard key={w.slug} {...w} index={i} span={SPAN_PATTERN[i % SPAN_PATTERN.length] ?? "md:col-span-3"} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ slug, images, client, title, caption, meta, sector, index, span }: WorkItem & { index: number; span: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const cover = images?.[0];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  const mediaClass =
    "h-full w-full object-cover object-top transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04]";

  return (
    <motion.div
      className={`${span} col-span-1`}
      initial={reduce ? false : { opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        ref={ref}
        to={`/work/${slug}`}
        className="group relative block h-[24rem] overflow-hidden rounded-2xl border border-foreground/10 bg-card outline-none transition-[border-color,box-shadow] duration-500 hover:border-primary/40 hover:shadow-[var(--shadow-ember)] focus-visible:border-primary/60 focus-visible:shadow-[var(--shadow-ember)] md:h-[30rem]"
      >
        {/* Oversized so the parallax drift never exposes an edge. */}
        <motion.div style={{ y: imgY }} className="absolute -inset-y-[8%] inset-x-0">
          {/* The admin prevents a video from ever being set as the cover,
              but render it correctly here too rather than assume. */}
          {cover?.type === "video" ? (
            <video src={cover.url} muted loop autoPlay playsInline className={mediaClass} />
          ) : (
            <img src={cover?.url} alt={cover?.altText || title} loading="lazy" width={1600} height={1000} className={mediaClass} />
          )}
        </motion.div>

        {/* Legibility stack: a heavy bottom gradient under a frosted strip,
            so the type always sits on near-black whatever the screenshot
            is doing behind it. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_55%,transparent)_0%,transparent_28%,transparent_45%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]" aria-hidden />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-foreground/85">
          <span>{client}</span>
          <span className="text-primary">0{index + 1}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-foreground/10 bg-background/70 p-5 backdrop-blur-xl md:p-6">
          {sector && <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary">{sector}</p>}
          <h3 className="mt-2 text-xl font-medium leading-tight text-foreground md:text-2xl">{title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">{caption}</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <ul className="flex flex-wrap gap-1.5">
              {meta.slice(0, 3).map((m) => (
                <li key={m} className="rounded-full border border-foreground/15 px-2.5 py-0.5 text-[0.7rem] text-foreground/70">
                  {m}
                </li>
              ))}
            </ul>
            <span className="shrink-0 text-xs font-medium text-primary transition-transform duration-500 group-hover:translate-x-1">View case study →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
