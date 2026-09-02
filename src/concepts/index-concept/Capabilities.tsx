import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { capabilities } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

/**
 * The signature section (reference: webisoft.com's services list). Not a
 * sticky-stack (nothing pins or overlaps with z-index) — a scroll-driven
 * accordion: one IntersectionObserver watches a thin band near the
 * viewport's vertical center, and whichever row currently crosses that
 * band expands (description, CTA, icon) while every other row collapses
 * to a title-only bar. That's the "losing one on other" effect the brief
 * asked for: earlier rows visually shrink away as the next one takes
 * focus, rather than literally stacking on top of each other.
 */
export function IndexCapabilities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rows = Array.from(container.querySelectorAll<HTMLElement>("[data-row-index]"));

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(Number(hit.target.getAttribute("data-row-index")));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    rows.forEach((row) => io.observe(row));
    return () => io.disconnect();
  }, []);

  return (
    <section id="capabilities" className="relative bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <span className="index-tag">/ CAPABILITIES</span>
        <h2 className="mt-4 max-w-2xl text-[clamp(1.9rem,5vw,3.4rem)] leading-[0.95]">
          Everything a UK team needs, under one roof.
        </h2>
      </div>

      <div ref={containerRef} className="mt-16 border-t border-border">
        {capabilities.map((c, i) => (
          <Row key={c.title} index={i} title={c.title} body={c.body} icon={c.icon} active={active === i} />
        ))}
      </div>
    </section>
  );
}

function Row({
  index,
  title,
  body,
  icon,
  active,
}: {
  index: number;
  title: string;
  body: string;
  icon: import("@/concepts/shared/content").CapabilityIconKey;
  active: boolean;
}) {
  return (
    <div data-row-index={index} className="index-dashed border-b border-dashed border-border">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[4.5rem_1fr] md:items-baseline">
          <span className={`index-tag transition-colors duration-300 ${active ? "text-primary" : ""}`}>
            S/{String(index + 1).padStart(3, "0")}
          </span>
          <h3 className={`font-display text-3xl uppercase leading-none transition-colors duration-300 md:text-4xl ${active ? "text-foreground" : "text-muted-foreground"}`}>
            {title}
          </h3>
        </div>

        <motion.div
          initial={false}
          animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-[4.5rem_1fr_auto] md:items-center">
            <div className="hidden md:block" aria-hidden />
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{body}</p>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border text-primary">
                <CapabilityIcon icon={icon} className="h-6 w-6" />
              </span>
              <span className="inline-flex items-center gap-1.5 border border-border px-4 py-2.5 text-xs uppercase tracking-wide">
                Explore <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
