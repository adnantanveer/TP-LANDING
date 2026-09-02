import { motion } from "motion/react";

/** The bold typographic moment that used to be the hero, shifted down
 * into its own section — the hero itself is now the same cinematic video
 * as every other concept (kept identical to the base site, per request). */
export function ConcreteStatement() {
  return (
    <section className="relative border-b-2 border-foreground bg-background pb-16 pt-16 md:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-primary"
        >
          UK software studio / est. delivery in Noida
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[clamp(2.6rem,9vw,7rem)] font-display leading-[0.86] tracking-tight"
        >
          SOFTWARE.
          <br />
          <span className="text-primary">BUILT RAW.</span>
        </motion.h2>

        <div className="mt-10 grid grid-cols-1 gap-6 border-t-2 border-foreground pt-8 md:grid-cols-[2fr_1fr] md:items-end">
          <p className="max-w-md text-base font-medium leading-snug">
            No decks. No slideware. Web platforms, mobile apps and AI systems, shipped by the people who build them.
          </p>
          <a href="#work" className="concrete-block inline-flex w-fit items-center justify-center border-2 border-foreground bg-foreground px-8 py-4 text-sm font-bold uppercase tracking-wide text-background md:ml-auto">
            See the work
          </a>
        </div>
      </div>
    </section>
  );
}
