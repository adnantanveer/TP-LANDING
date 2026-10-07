import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { KineticHeading, LineReveal, SectionLabel } from "./primitives";
import { processSteps, type ProcessIconKey } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

// Fixed art per step, not admin-editable (same rule as Sections.tsx's
// STEP_ART). Stock photography from public/assets/stock — sources and
// licences in handoffs/techpotam-backend-admin.md.
const STEP_IMAGE: Record<ProcessIconKey, { src: string; alt: string }> = {
  discover: { src: "/assets/stock/process-discover.jpg", alt: "Workshop notes and sketches on a table" },
  design: { src: "/assets/stock/process-design.jpg", alt: "Interface wireframes on a designer's screen" },
  build: { src: "/assets/stock/process-build.jpg", alt: "Code on a monitor in a dim studio" },
  scale: { src: "/assets/stock/process-scale.jpg", alt: "Data centre aisle of server racks" },
};

// One quiet proof per step, instead of a paragraph each.
const STEP_PROOF: Record<ProcessIconKey, string> = {
  discover: "Week 1–2",
  design: "Before any production code",
  build: "Demo every Friday",
  scale: "SLA-backed",
};

/**
 * "How we work" — the four steps keep their numbered spine, but the
 * section is now driven by imagery: on desktop a photograph panel pins
 * to the left and crossfades as each step scrolls through the middle of
 * the viewport; on mobile each step carries its own image. The palette
 * is deliberately the calm half of the page — near-black with a teal
 * (--secondary) tint and neutral type, no ember wash — so the section
 * reads as a breath between the ember chapters either side of it. Only
 * opacity/transform animate.
 */
export function Process() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.4 });
  const panelY = useTransform(p, [0, 1], reduce ? [0, 0] : [40, -40]);

  return (
    <section
      id="process"
      ref={ref}
      className="relative bg-[radial-gradient(90%_60%_at_0%_0%,color-mix(in_oklab,var(--secondary)_14%,transparent),transparent_60%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--secondary)_6%,var(--background)))] py-28 md:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <SectionLabel>How we work</SectionLabel>
          <KineticHeading
            text="Four steps. No surprises."
            className="mt-6 text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1.02]"
          />
          <LineReveal
            lines={["A fixed rhythm from the first workshop to the week after launch."]}
            delay={0.35}
            className="mt-5 max-w-md text-base text-muted-foreground"
          />
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
          {/* Pinned image panel (desktop only). All four images are
              stacked and the active one fades up; the rest stay mounted
              so there's never a flash of nothing between them. */}
          <div className="hidden md:block">
            <motion.div style={{ y: panelY }} className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-[var(--shadow-deep)]">
                {processSteps.map((s, i) => (
                  <motion.img
                    key={s.icon}
                    src={STEP_IMAGE[s.icon].src}
                    alt={STEP_IMAGE[s.icon].alt}
                    width={1200}
                    height={1500}
                    loading="lazy"
                    initial={false}
                    animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.06 }}
                    transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 h-full w-full object-cover saturate-[0.75]"
                  />
                ))}
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,color-mix(in_oklab,var(--background)_85%,transparent)_100%),linear-gradient(90deg,color-mix(in_oklab,var(--secondary)_18%,transparent),transparent_60%)]"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-foreground/80">
                    {processSteps[active]?.title}
                  </span>
                  <span className="font-mono text-xs text-secondary">
                    0{active + 1} / 0{processSteps.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <ol className="flex flex-col">
            {processSteps.map((s, i) => (
              <Step key={s.title} index={i} title={s.title} body={s.body} icon={s.icon} onActive={setActive} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({
  index,
  title,
  body,
  icon,
  onActive,
}: {
  index: number;
  title: string;
  body: string;
  icon: ProcessIconKey;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  // A step is "active" while it crosses the middle band of the viewport —
  // reported to the parent from an effect, only when that changes. The
  // callback is the stable state setter itself (never an inline closure):
  // two steps straddling the band would otherwise re-run each other's
  // effects every render and ping-pong the index forever.
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li ref={ref} className="border-t border-foreground/10 py-10 first:border-t-0 md:min-h-[60vh] md:py-16">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-xl border border-foreground/10 md:hidden">
          <img
            src={STEP_IMAGE[icon].src}
            alt={STEP_IMAGE[icon].alt}
            width={1200}
            height={750}
            loading="lazy"
            className="h-full w-full object-cover saturate-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" aria-hidden />
        </div>

        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-secondary/40 text-secondary">
            <ProcessIcon icon={icon} className="h-5 w-5" />
          </span>
          <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
          <span className="ml-auto font-mono text-[0.65rem] uppercase tracking-[0.3em] text-secondary">{STEP_PROOF[icon]}</span>
        </div>
        <h3 className="mt-6 text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-none tracking-tight">{title}</h3>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">{body}</p>
      </motion.div>
    </li>
  );
}
