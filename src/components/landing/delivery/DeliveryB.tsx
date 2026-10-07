import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { KineticHeading, LineReveal, SectionLabel } from "../primitives";
import { DELIVERY, DeliveryVideo } from "./shared";

/**
 * Variant B — "Glass ledger". Split layout: copy on the left, the
 * glass-facade footage on the right inside a tall rounded window that
 * pins while the proof points scroll past it. The window's corners open
 * from a tight inset as it arrives, a teal (--secondary) tint over the
 * footage keeps this the cool chapter of the page, and a scroll-filled
 * hairline ties the four proofs together like a ledger. The most
 * "structured" of the three — reads as a contract, not a mood piece.
 */
export function DeliveryB() {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.4 });
  const inset = useTransform(p, [0.05, 0.4], reduce ? ["inset(0% round 24px)", "inset(0% round 24px)"] : ["inset(10% 12% 10% 12% round 48px)", "inset(0% 0% 0% 0% round 24px)"]);
  const videoScale = useTransform(p, [0, 1], reduce ? [1, 1] : [1.15, 1]);

  const { scrollYProgress: listProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(listProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <section
      id="delivery"
      ref={ref}
      className="relative bg-[radial-gradient(70%_50%_at_100%_0%,color-mix(in_oklab,var(--secondary)_16%,transparent),transparent_60%)] py-28 md:py-36"
    >
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-[1fr_1.05fr] md:gap-16">
        <div>
          <SectionLabel>{DELIVERY.label}</SectionLabel>
          <KineticHeading
            text={DELIVERY.heading}
            className="mt-6 text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold leading-[1]"
          />
          <LineReveal lines={[DELIVERY.line]} delay={0.4} className="mt-6 max-w-sm text-base text-muted-foreground" />

          {/* Mobile: the video sits between the heading and the ledger. */}
          <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-2xl border border-foreground/10 md:hidden">
            <DeliveryVideo variant="b" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--secondary)_35%,transparent),color-mix(in_oklab,var(--background)_70%,transparent))]" aria-hidden />
          </div>

          <div className="relative mt-12 pl-8">
            <span className="absolute left-0 top-0 h-full w-px bg-foreground/10" aria-hidden />
            <motion.span style={{ scaleY: fill }} className="absolute left-0 top-0 h-full w-px origin-top bg-secondary" aria-hidden />
            <ol ref={listRef} className="flex flex-col gap-10">
              {DELIVERY.proofs.map((pt, i) => (
                <motion.li
                  key={pt.k}
                  initial={reduce ? false : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4"
                >
                  <span className="font-mono text-xs text-secondary">0{i + 1}</span>
                  <div>
                    <p className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-none">{pt.k}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{pt.v}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="sticky top-28">
            <motion.div style={{ clipPath: inset }} className="relative aspect-[4/5] overflow-hidden border border-foreground/10 bg-card shadow-[var(--shadow-deep)]">
              <motion.div style={{ scale: videoScale }} className="absolute inset-0">
                <DeliveryVideo variant="b" />
              </motion.div>
              <div
                className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--secondary)_40%,transparent)_0%,transparent_45%,color-mix(in_oklab,var(--background)_85%,transparent)_100%)]"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground/80">
                <span>Techpotam · UK</span>
                <span className="text-secondary">Est. certainty</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
