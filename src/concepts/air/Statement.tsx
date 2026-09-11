import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/** The quiet split photo+statement that used to be the hero, shifted down
 * into its own section — the hero itself is now the same cinematic video
 * as every other concept (kept identical to the base site, per request).
 * Kept just as restrained here: no video, no loop, a very subtle
 * parallax drift on the photo. */
export function AirStatement() {
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section className="relative border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:gap-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="max-w-md text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.1]">Software, considered.</h2>
          <p className="mt-8 max-w-sm text-base leading-relaxed text-muted-foreground">
            A UK-facing studio building web platforms, mobile apps and AI systems, one careful decision at a time.
          </p>
          <a href="#work" className="mt-10 inline-block border-b border-foreground pb-1 text-sm transition-colors hover:border-primary hover:text-primary">
            View selected work
          </a>
        </motion.div>

        <motion.div
          ref={frameRef}
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-first h-[50vh] overflow-hidden rounded-lg md:order-last md:h-[60vh]"
        >
          <motion.img
            src="/assets/work-northfield.jpg"
            alt=""
            style={{ y, height: "calc(100% + 60px)" }}
            className="w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
