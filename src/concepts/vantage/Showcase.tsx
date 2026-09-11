import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import london from "@/assets/london.jpg";

/**
 * Vantage's signature set-piece (reference: the giant capsule-shaped media
 * window on coronel.design) — a huge stadium-radius panel that widens
 * slightly as it scrolls through. Distinct from Signal's text-only
 * Manifesto — Vantage's language is dimensional/material, not typographic.
 * Uses a real photo with honest, grounded copy (the UK entity / Noida
 * delivery team split is the site's actual footer/contact info, not a
 * new claim) — an earlier version of this section used the unused
 * reel.mp4 asset, which turned out to be fantasy sci-fi CGI with garbled
 * fake UI text, not real work. Swapped rather than shipped.
 */
export function VantageShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 0.94]);
  const radius = useTransform(scrollYProgress, [0, 0.5, 1], ["6rem", "3rem", "5rem"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.3]);

  return (
    <section ref={ref} className="relative bg-background px-6 py-24 md:py-32">
      <motion.div
        style={{ scale, borderRadius: radius }}
        className="vantage-sheen relative mx-auto h-[55vh] w-full max-w-5xl overflow-hidden md:h-[68vh]"
      >
        <motion.img
          src={london}
          alt=""
          loading="lazy"
          style={{ scale: imgScale }}
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--background) 45%, transparent) 0%, transparent 35%, color-mix(in oklab, var(--background) 75%, transparent) 100%)" }}
        />
        <div className="pointer-events-none absolute bottom-8 left-8 right-8 flex items-end justify-between md:bottom-12 md:left-12 md:right-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/80">Where we work</p>
          <p className="max-w-xs text-right text-sm text-white/80">A UK studio, delivery team based in Noida, India.</p>
        </div>
      </motion.div>
    </section>
  );
}
