import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { KineticHeading, LineReveal, SectionLabel } from "../primitives";
import { DELIVERY, DeliveryVideo } from "./shared";

/**
 * Variant A — "Ember field". Full-bleed golden-particle footage behind a
 * centred statement. The video window opens as you arrive (clip-path
 * inset shrinking to zero while the footage eases from 1.2x to 1x), a
 * dark vertical gradient pins the type to the page top and bottom, and
 * the four proof points step in along a hairline rule at the base.
 * The quietest of the three: one big headline, nothing else moving.
 */
export function DeliveryA() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.4 });
  const scale = useTransform(p, [0, 0.5], reduce ? [1, 1] : [1.2, 1]);
  const inset = useTransform(p, [0, 0.35], reduce ? ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 0% 0% round 0px)"] : ["inset(12% 6% 12% 6% round 24px)", "inset(0% 0% 0% 0% round 0px)"]);
  const y = useTransform(p, [0, 1], reduce ? [0, 0] : [60, -60]);

  return (
    <section id="delivery" ref={ref} className="relative overflow-hidden">
      <motion.div style={{ clipPath: inset }} className="relative min-h-[90vh] md:min-h-screen">
        <motion.div style={{ scale }} className="absolute inset-0">
          <DeliveryVideo variant="a" />
        </motion.div>
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklab,var(--background)_35%,transparent)_30%,color-mix(in_oklab,var(--background)_35%,transparent)_65%,var(--background)_100%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_55%,color-mix(in_oklab,var(--background)_55%,transparent),transparent_80%)]" aria-hidden />

        <motion.div style={{ y }} className="relative mx-auto flex min-h-[90vh] max-w-5xl flex-col items-center justify-center px-6 py-32 text-center md:min-h-screen">
          <SectionLabel>{DELIVERY.label}</SectionLabel>
          <KineticHeading
            text={DELIVERY.heading}
            className="mt-8 text-[clamp(2.6rem,7.5vw,6rem)] font-semibold leading-[0.98] [text-shadow:0_2px_30px_rgba(0,0,0,0.6)]"
          />
          <LineReveal
            lines={[DELIVERY.line]}
            delay={0.5}
            className="mt-8 max-w-md text-lg text-foreground/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]"
          />

          <ul className="mt-16 grid w-full grid-cols-2 gap-x-6 gap-y-8 border-t border-foreground/15 pt-8 md:grid-cols-4">
            {DELIVERY.proofs.map((pt, i) => (
              <motion.li
                key={pt.k}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-left"
              >
                <p className="font-display text-2xl font-semibold text-primary">{pt.k}</p>
                <p className="mt-1 text-sm text-foreground/80">{pt.v}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
