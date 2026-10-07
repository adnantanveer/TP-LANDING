import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { LineReveal, SectionLabel } from "../primitives";
import { DELIVERY, DeliveryVideo } from "./shared";

/**
 * Variant C — "Knockout". The overhead hands-on-keyboard footage is only
 * visible *through* the type: a black panel with the condensed wordmark
 * face is multiplied over the video (see .video-knockout), so CERTAINTY
 * fills with moving footage while everything around it stays black. The
 * word tracks sideways with scroll, the small heading sits above it in
 * plain type, and the proofs land as four frosted tiles. The boldest of
 * the three — closest to the Statement's own typographic language.
 */
export function DeliveryC() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 26, mass: 0.5 });
  const wordX = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["6%", "-6%"]);
  const videoScale = useTransform(p, [0, 1], reduce ? [1, 1] : [1.1, 1.25]);

  return (
    <section id="delivery" ref={ref} className="relative overflow-hidden bg-black py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <SectionLabel>{DELIVERY.label}</SectionLabel>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight text-foreground/90"
          >
            A delivery model built for
          </motion.h2>
        </div>
      </div>

      {/* The knockout. The video is sized to the word's box; the black
          panel with the white word is multiplied over it. */}
      <div className="relative isolate mt-4 h-[32vw] min-h-[9rem] w-full overflow-hidden md:h-[24vw]">
        <motion.div style={{ scale: videoScale }} className="absolute inset-0">
          <DeliveryVideo variant="c" className="brightness-125 contrast-110" />
        </motion.div>
        <motion.div
          style={{ x: wordX }}
          aria-hidden
          className="video-knockout absolute inset-0 flex items-center justify-center"
        >
          <span className="brand-wordmark whitespace-nowrap text-[32vw] uppercase leading-none tracking-[-0.02em] md:text-[24vw]">
            Certainty
          </span>
        </motion.div>
        <span className="sr-only">certainty.</span>
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl px-6">
        <LineReveal lines={[DELIVERY.line]} delay={0.1} className="max-w-md text-lg text-foreground/80" />
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {DELIVERY.proofs.map((pt, i) => (
            <motion.li
              key={pt.k}
              initial={reduce ? false : { opacity: 0, y: 30, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "0% 100%" }}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.04] p-5 backdrop-blur-md"
            >
              <p className="font-display text-2xl font-semibold text-primary">{pt.k}</p>
              <p className="mt-1 text-sm text-foreground/75">{pt.v}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
