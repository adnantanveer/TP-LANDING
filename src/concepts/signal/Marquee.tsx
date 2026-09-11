import { motion } from "motion/react";

const ITEMS = ["Web platforms", "Mobile apps", "AI systems", "Cloud migration", "Design systems", "Data engineering"];

/**
 * One marquee, used once on this page — large outline (stroke-only) type
 * instead of a small text ticker, for real poster-scale presence between
 * the hero and the Manifesto section.
 */
export function SignalMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-border py-6">
      <motion.div
        className="flex w-max items-center gap-16 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 34, ease: "linear", repeat: Infinity }}
      >
        {[...ITEMS, ...ITEMS, ...ITEMS].map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-semibold uppercase leading-none tracking-tight"
            style={{ WebkitTextStroke: "1.5px var(--foreground)", color: "transparent" }}
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
