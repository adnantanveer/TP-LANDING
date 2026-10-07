import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { KineticHeading, SectionLabel } from "./primitives";
import { workItems } from "@/concepts/shared/content";

const API_URL = import.meta.env.VITE_API_URL as string;

type WorkImage = { url: string; type: "image" | "video"; title: string; altText: string; caption: string };
// `sector` is new and optional — the live CMS predates it. When it's
// missing the card simply shows no sector line (see WorkCard).
type WorkItem = { slug: string; images: WorkImage[]; client: string; title: string; caption: string; meta: string[]; sector?: string };

// Until now this section had no fallback at all — with the API down it
// rendered an empty pinned viewport. These five come from the shared
// concept content (same slugs/images already shipped in public/assets),
// mapped into the CMS's own case-study shape so the card code has one
// path. Sectors are authored here only; the admin can add the field later.
const FALLBACK_SECTORS: Record<string, string> = {
  atlas: "Logistics",
  civica: "Local government",
  harborline: "Ports & maritime",
  meridian: "Energy",
  northfield: "Wealth management",
};

const DEFAULT_WORK: WorkItem[] = workItems.map((w) => ({
  slug: w.slug,
  images: [{ url: w.img, type: "image", title: w.title, altText: w.title, caption: "" }],
  client: w.client,
  title: w.title,
  caption: w.caption,
  meta: w.meta,
  sector: FALLBACK_SECTORS[w.slug],
}));

// Editorial grid: a wide card then a tall one, mirrored on the next row,
// so the eye moves in a zigzag instead of scanning a uniform grid. Any
// overflow past the pattern falls back to the regular half-width slot.
const SPAN_PATTERN = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];

/**
 * "Our work speaks" — the former pinned horizontal track (which hid its
 * own heading under the fixed header and read as a loading bar) replaced
 * by a scrolling editorial grid of glass cards. Each card leads with the
 * product image; title, sector, summary and the link only surface as a
 * frosted panel on hover, keyboard focus, or a first tap on touch (the
 * second tap follows the link). The grid itself settles in with a
 * staggered rise, and every image drifts a few percent against the scroll
 * so the cards read as windows rather than stickers.
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
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Selected work</SectionLabel>
            <KineticHeading
              text="Our work *speaks.*"
              className="mt-6 max-w-2xl text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.98]"
            />
          </div>
          <p className="hidden font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground md:block">
            Hover · tap · open
          </p>
        </div>

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
  const [open, setOpen] = useState(false);
  const cover = images?.[0];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  // Touch has no hover: the first tap reveals the panel (and swallows the
  // navigation), the second tap — or the explicit link inside — follows it.
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (coarse && !open) {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <motion.div
      className={`${span} col-span-1`}
      initial={reduce ? false : { opacity: 0, y: 70, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        ref={ref}
        to={`/work/${slug}`}
        onClick={onClick}
        // Touch fires pointerleave between the tap's pointerup and click,
        // which would re-close the panel before the second tap could follow
        // the link — so only a real mouse leaving closes it.
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
        data-open={open || undefined}
        className="group relative block h-[22rem] overflow-hidden rounded-2xl border border-border bg-card outline-none transition-[border-color,box-shadow] duration-500 hover:border-primary/40 hover:shadow-[var(--shadow-ember)] focus-visible:border-primary/60 focus-visible:shadow-[var(--shadow-ember)] data-[open]:border-primary/40 md:h-[30rem]"
      >
        {/* Oversized so the parallax drift never exposes an edge. */}
        <motion.div style={{ y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
          {cover?.type === "video" ? (
            <video
              src={cover.url}
              muted
              loop
              autoPlay
              playsInline
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] group-data-[open]:scale-[1.06]"
            />
          ) : (
            <img
              src={cover?.url}
              alt={cover?.altText || title}
              loading="lazy"
              width={1200}
              height={900}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] group-data-[open]:scale-[1.06]"
            />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" aria-hidden />

        {/* Resting state: just the client and an index. */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-foreground/80">
          <span>{client}</span>
          <span className="text-primary">0{index + 1}</span>
        </div>

        {/* Revealed state: frosted glass panel rising from the bottom edge. */}
        <div className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+1rem)] rounded-xl border border-foreground/10 bg-background/70 p-5 opacity-0 backdrop-blur-xl transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-data-[open]:translate-y-0 group-data-[open]:opacity-100 md:p-6">
          {sector && <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary">{sector}</p>}
          <h3 className="mt-2 text-xl font-medium leading-tight md:text-2xl">{title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{caption}</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <ul className="flex flex-wrap gap-1.5">
              {meta.slice(0, 3).map((m) => (
                <li key={m} className="rounded-full border border-border px-2.5 py-0.5 text-[0.7rem] text-muted-foreground">
                  {m}
                </li>
              ))}
            </ul>
            <span className="shrink-0 text-xs font-medium text-primary">View case study →</span>
          </div>
        </div>

        {/* Always-visible title on touch devices' resting state would defeat
            the reveal, but a bare image is unlabelled for screen readers —
            so the title is announced via the link's own text. */}
        <span className="sr-only">{title}</span>
      </Link>
    </motion.div>
  );
}
