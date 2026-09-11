import { motion } from "motion/react";

/**
 * The bold coral "color block" chapter with a giant wordmark statement —
 * reference: webisoft.com's own huge bottom-of-hero wordmark. The
 * solid-line + outline-line pairing is borrowed from inngest.com's hero
 * headline treatment, used once here rather than as a repeated default.
 */
export function IndexStatement() {
  return (
    <section className="index-color-chapter relative overflow-hidden py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-border pb-6 font-mono text-xs uppercase tracking-[0.1em]">
          <span>Techpotam®</span>
          <span>Noida (IND)</span>
          <span>UK-facing</span>
          <span>Engineering_</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-[clamp(2.6rem,10vw,8rem)] leading-[0.86]"
        >
          SOFTWARE,
          <br />
          <span className="index-outline-text">SHIPPED.</span>
        </motion.h2>
      </div>
    </section>
  );
}
