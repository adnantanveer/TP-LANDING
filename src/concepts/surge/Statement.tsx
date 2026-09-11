import { motion, useReducedMotion } from "motion/react";
import { Magnetic } from "@/concepts/shared/Magnetic";
import { ArrowUpRight } from "@phosphor-icons/react";

const BLOBS = [
  { size: 420, top: "-15%", left: "-6%", duration: 18, color: "var(--primary)" },
  { size: 340, top: "30%", left: "75%", duration: 22, color: "var(--primary-glow)" },
];

/** The floating-blob statement that used to be the hero, shifted down
 * into its own section — the hero itself is now the same cinematic video
 * as every other concept (kept identical to the base site, per request).
 * Motion stays this concept's whole personality: blobs never stop
 * drifting (gated behind reduced-motion, same as the hero's own blobs). */
export function SurgeStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {BLOBS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-25 blur-[90px]"
            style={{ width: b.size, height: b.size, top: b.top, left: b.left, backgroundColor: b.color }}
            animate={reduce ? undefined : { x: [0, 50, -30, 0], y: [0, -40, 30, 0] }}
            transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight"
        >
          Software that moves as <span className="surge-gradient-text">fast as you do</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.1 }}
          className="mt-6 max-w-md text-base text-muted-foreground"
        >
          Web platforms, mobile apps and AI systems, shipped by a UK-facing studio that never sits still.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.2 }}
          className="mt-10"
        >
          <Magnetic strength={16}>
            <a href="#work" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)]">
              See the work <ArrowUpRight weight="bold" className="h-4 w-4" />
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
