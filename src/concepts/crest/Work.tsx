import { useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/primitives";
import { workItems } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

/**
 * Signature section: a plain list of projects that, on pointer devices,
 * grows a floating image preview which tracks the cursor and swaps to
 * whichever row is under it — the classic agency-site "hover the title,
 * see the shot" move. Position is spring-driven via useMotionValue (never
 * useState — this fires on every pointermove); which image is showing is
 * the one piece of genuinely discrete state, so that alone uses useState.
 * The row list is real, readable text with no dependency on hover, so
 * nothing here is lost on touch — the floating panel is `hidden lg:block`,
 * a bonus for the audience that actually has a cursor to move.
 */
export function CrestWork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  return (
    <section id="work" className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <span className="crest-eyebrow">Selected work</span>
          <h2 className="mt-5 max-w-xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.05]">
            Real products, shipped for real sectors.
          </h2>
        </Reveal>

        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
          className="relative mt-14"
        >
          {workItems.map((w, i) => (
            <Reveal key={w.slug} delay={i * 0.04}>
              <div
                onPointerEnter={() => setHovered(i)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-t border-border py-6 last:border-b"
              >
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary">{w.client}</p>
                  <h3 className="mt-1.5 text-xl font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-2 md:text-2xl">
                    {w.title}
                  </h3>
                  <div className="mt-2 hidden items-center gap-2 lg:flex">
                    {w.meta.map((m) => (
                      <span key={m} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TechIcon name={m} className="h-3 w-3 shrink-0" />
                        {m}
                      </span>
                    ))}
                  </div>
                  {/* Below lg the floating preview never mounts, so the shot
                      and caption need to live inline instead of being lost. */}
                  <div className="mt-4 lg:hidden">
                    <img src={w.img} alt="" loading="lazy" className="h-40 w-full rounded-lg object-cover" />
                    <p className="mt-3 text-sm text-muted-foreground">{w.caption}</p>
                  </div>
                </div>
                <ArrowUpRight
                  weight="bold"
                  className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
            </Reveal>
          ))}

          <motion.div
            aria-hidden
            style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
            animate={{ opacity: hovered !== null ? 1 : 0, scale: hovered !== null ? 1 : 0.85 }}
            transition={{ opacity: { duration: 0.2 }, scale: { type: "spring", stiffness: 300, damping: 24 } }}
            className="pointer-events-none absolute left-0 top-0 z-10 hidden h-64 w-96 overflow-hidden rounded-2xl shadow-[var(--shadow-deep)] lg:block"
          >
            {workItems.map((w, i) => (
              <img
                key={w.slug}
                src={w.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                style={{ opacity: hovered === i ? 1 : 0 }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
