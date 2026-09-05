import { useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

const STATEMENT =
  "We don't hand off a deck and disappear. We stay in the codebase, sprint after sprint, until the thing is actually live.";

/**
 * Signature section: the statement sits fully legible in solid white —
 * never dimmed, never hidden behind a hover state — and a soft violet glow
 * washes across it wherever the cursor moves, blending back to white at
 * its wide, feathered edge. The glow layer itself fades in on pointer
 * enter and back out on pointer leave (a separate opacity animate, not
 * tied to mx/my) — without it the glow just sat frozen at its last
 * position once the cursor left the text instead of clearing away.
 *
 * Driven entirely by Motion values (useMotionValue/useSpring), the same
 * mechanism already used for Capabilities' tilt-glow and the custom
 * cursor, rather than the earlier version's CSS-custom-property + `mask-
 * position` + native CSS `transition` combo — that mixed a percentage
 * default ("50% 35%") with JS-set pixel values, which some browsers don't
 * interpolate smoothly across a unit change, so the "hover" could read as
 * unresponsive. Motion writes a fully-formed radial-gradient string to
 * mask-image on every animation frame instead, so there's no unit
 * mismatch and no native CSS transition to fight with — the spring itself
 * is what makes it feel smooth.
 */
export function CrestStatement() {
  const boxRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 120, damping: 22, mass: 0.4 });
  const smy = useSpring(my, { stiffness: 120, damping: 22, mass: 0.4 });
  const maskImage = useTransform([smx, smy], ([x, y]) =>
    `radial-gradient(circle 460px at ${x}px ${y}px, black 0%, transparent 100%)`,
  );

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <section className="crest-spotlight-chapter crest-spotlight-grid relative border-y border-border py-32 md:py-44">
      <div className="mx-auto max-w-5xl px-6">
        <span className="crest-eyebrow">Who we are</span>

        <div
          ref={boxRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          className="relative mt-8"
        >
          <p className="text-[clamp(1.9rem,5.6vw,4.2rem)] font-display font-medium leading-[1.1] tracking-tight text-foreground">
            {STATEMENT}
          </p>
          {!reduce && (
            <motion.p
              aria-hidden
              animate={{ opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                WebkitMaskImage: maskImage,
                maskImage,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundImage: "linear-gradient(120deg, var(--primary-glow), color-mix(in oklab, var(--primary-glow) 60%, white))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
              className="pointer-events-none absolute inset-0 text-[clamp(1.9rem,5.6vw,4.2rem)] font-display font-medium leading-[1.1] tracking-tight"
            >
              {STATEMENT}
            </motion.p>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex items-center gap-3 text-sm text-muted-foreground"
        >
          <span className="h-px w-8 bg-current opacity-40" />
          Move your cursor across the line above.
        </motion.p>
      </div>
    </section>
  );
}
