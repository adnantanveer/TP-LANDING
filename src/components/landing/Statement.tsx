import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Giant wordmark statement — pulled in from the Index concept's own
 * Statement.tsx (same layout, condensed impact-display font, and
 * solid-line + outline-line headline pairing), themed with this homepage's
 * own dark background and ember --primary instead of Index's light page +
 * coral color-block inversion — see .chapter-glow-bg in styles.css (shared
 * with Process.tsx, the other section pulled in from a concept).
 *
 * Index's original is a pure typographic beat with no other content — fine
 * for a portfolio concept, but this is the real homepage, so it earns its
 * spot with a supporting line and the same two conversions (Work, Contact)
 * every other section eventually points at, not just a wordmark for its
 * own sake. The floating glow + scroll-linked headline drift are this
 * page's own motion language (see PrecisionCard/TeamCard's identical
 * useScroll+useSpring pattern) applied here instead of Index's plain fade.
 */
export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });
  const headlineY = useTransform(p, [0, 1], [48, -48]);

  return (
    <section ref={ref} className="chapter-glow-bg relative overflow-hidden py-16 md:py-20">
      {/* Slow-drifting ember glow — reinforces "warm, not black" without a
          flat static wash; kept far enough off-canvas it never competes
          with the type for attention. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/25 blur-[110px]"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -18, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-border pb-6 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
          <span>Techpotam®</span>
          <span>Noida (IND)</span>
          <span>UK-facing</span>
          <span>Engineering_</span>
        </div>

        <div className="mt-10 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-primary">
          <span className="h-px w-8 bg-primary/60" />
          Manifesto
        </div>

        <motion.h2
          style={{ y: headlineY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6 }}
          className="brand-wordmark statement-display mt-4 text-[clamp(2.6rem,10vw,8rem)] leading-[0.86]"
        >
          IDEAS,
          <br />
          <span className="statement-outline-text">ENGINEERED.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-col gap-8 border-t border-border pt-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-xl text-lg text-muted-foreground">
            We take ambiguous briefs and ambitious ideas and turn them into dependable, production-grade software — from first sketch to the infrastructure it runs on.
          </p>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/?section=work"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
            >
              See our work
            </Link>
            <Link
              to="/?section=contact"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              Start a project
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
