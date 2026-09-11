import { motion } from "motion/react";

const ITEMS = ["Web platforms", "Mobile apps", "AI systems", "Cloud migration", "Design systems", "Data engineering"];

/** One marquee, used once on this page — pill chips instead of Signal's
 * plain-text ticker, matching Vantage's rounded/glass language. */
export function VantageMarquee() {
  return (
    <div className="relative overflow-hidden py-8">
      <motion.div
        className="flex w-max items-center gap-3 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {[...ITEMS, ...ITEMS, ...ITEMS].map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="vantage-glass rounded-full px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
