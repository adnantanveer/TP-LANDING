import { Fragment, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Word-by-word scroll-in reveal for statement-scale headlines (Signal's
 * Manifesto section) — masked (overflow-hidden) so each word rises into
 * place from behind its own line, staggered. Motivated by storytelling:
 * the statement assembles itself as you arrive at it, once, not a
 * decorative loop. Collapses to a plain static heading under
 * prefers-reduced-motion.
 *
 * After the reveal, hovering any word tints it and its near neighbors
 * toward the accent color, fading out with distance — feedback that
 * rewards a reader who lingers on the statement, not a decorative loop
 * (it's inert until a pointer actually arrives). Skipped entirely under
 * reduced motion, same as the reveal.
 *
 * Two gotchas fixed here, both confirmed by inspecting computed styles
 * rather than guessing:
 * 1. Pixel `y`, not a percentage — a percentage initial/whileInView pair
 *    measured fine (getBoundingClientRect looked right) but never
 *    animated; the transform stayed frozen through a real incremental
 *    scroll. Numeric pixels animate reliably in the identical setup.
 * 2. The space between words is a plain sibling text node, not part of
 *    the `inline-block` word span's own text — a trailing space at the
 *    edge of an inline-block box gets collapsed away, which silently ran
 *    every word together with no gaps.
 */
export function KineticText({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const words = text.split(" ");

  if (reduce) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className} onPointerLeave={() => setHovered(null)}>
      {words.map((word, i) => {
        const distance = hovered === null ? Infinity : Math.abs(i - hovered);
        // Falls off over 3 words either side of whichever one is hovered —
        // "that particular word and a few around it", not the whole line.
        const strength = Math.max(0, 1 - distance * 0.3);
        const color = strength > 0 ? `color-mix(in oklab, var(--primary) ${Math.round(strength * 100)}%, var(--foreground))` : undefined;

        return (
          <Fragment key={`${word}-${i}`}>
            <span className="signal-word-mask">
              <motion.span
                className="inline-block cursor-default transition-colors duration-300 ease-out"
                style={{ color }}
                onHoverStart={() => setHovered(i)}
                initial={{ y: 34, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        );
      })}
    </p>
  );
}
