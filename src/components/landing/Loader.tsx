import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HERO_PREVIEW_CLIP = "/assets/vid/hero-forge.mp4";
const HERO_PREVIEW_CLIP_MOBILE = "/assets/vid/hero-forge-m.mp4";

type Phase = "word" | "box" | "grow";

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;
// Governs how the two text halves glide apart once the video window is
// inserted between them — a spring (not a fixed-duration tween) so the
// separation settles naturally instead of snapping to its end position.
const BREAK_SPRING = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } as const;

/**
 * Site intro: the "TECHPOTAM." wordmark appears first, as one solid word.
 * Once it's settled, it breaks apart at the middle — a video window opens
 * right in that gap between the two halves, playing the hero's own forge
 * clip (a preview of the destination, not an abstract animation) — and that
 * window then rapidly scales up to fill the screen.
 *
 * The two text halves carry `layout`, so when the video window mounts
 * between them Motion animates their separation as a spring instead of an
 * instant flex reflow — that's what makes the "break" read as one continuous
 * gesture rather than a jump cut.
 *
 * The box itself is a single persistent element that goes from an inline
 * flex child (small, sitting between the two text halves) to `position:
 * fixed; inset: 0` (fullscreen) — `layout` makes Motion interpolate that
 * transition automatically (its projection system handles static→fixed
 * natively), instead of hand-animating vw/vh values.
 *
 * By the time it's fullscreen it reads as the hero itself, so the real
 * <Hero> underneath is started (onRevealed) right at that moment rather
 * than after this overlay fully disappears — the loader then only needs a
 * quick opacity fade to hand off, instead of a hard cut from a static
 * poster to a playing video.
 */
export function Loader({ onDone, onRevealed }: { onDone?: () => void; onRevealed?: () => void }) {
  const [open, setOpen] = useState(true);
  const [phase, setPhase] = useState<Phase>("word");
  const revealedRef = useRef(false);

  const clip = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? HERO_PREVIEW_CLIP_MOBILE : HERO_PREVIEW_CLIP),
    []
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    // The word gets a full, unhurried 0.9s entrance (see `default` transition
    // below) before it breaks apart — waiting for it to actually settle
    // reads as calmer than cutting the entrance short.
    const toBox = window.setTimeout(() => setPhase("box"), 950);
    const toGrow = window.setTimeout(() => setPhase("grow"), 1750);
    return () => {
      window.clearTimeout(toBox);
      window.clearTimeout(toGrow);
    };
  }, []);

  const handleGrowComplete = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    onDone?.();
    onRevealed?.();
    // brief overlap: the real hero underneath is already playing by the
    // time this overlay finishes its own fade, so the handoff reads as a
    // crossfade rather than a pop between two different video elements.
    window.setTimeout(() => setOpen(false), 260);
  }, [onDone, onRevealed]);

  const textOpacity = phase === "grow" ? 0 : 1;
  const wordClass =
    "pointer-events-none select-none font-display text-[clamp(2.5rem,10vw,7rem)] font-semibold uppercase tracking-tight text-foreground";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 0, 0.2, 1] }}
          aria-hidden
        >
          <div className="flex items-center justify-center">
            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
              animate={{ opacity: textOpacity, scale: 1, filter: "blur(0px)" }}
              transition={{ layout: BREAK_SPRING, default: { duration: 0.9, ease: SOFT_EASE } }}
              className={wordClass}
            >
              TECH
            </motion.span>

            {phase !== "word" && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  layout: { duration: 0.95, ease: [0.6, 0, 0.9, 0.3] },
                  default: { duration: 0.55, ease: SOFT_EASE },
                }}
                onLayoutAnimationComplete={() => {
                  if (phase === "grow") handleGrowComplete();
                }}
                className={
                  phase === "grow"
                    ? "fixed inset-0 z-10 overflow-hidden bg-black"
                    : "relative z-10 mx-[0.06em] h-[0.85em] w-[2.6em] shrink-0 overflow-hidden rounded-xl bg-black text-[clamp(2.5rem,10vw,7rem)]"
                }
              >
                <video className="h-full w-full object-cover" src={clip} autoPlay muted playsInline preload="auto" />
              </motion.div>
            )}

            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
              animate={{ opacity: textOpacity, scale: 1, filter: "blur(0px)" }}
              transition={{ layout: BREAK_SPRING, default: { duration: 0.9, ease: SOFT_EASE, delay: 0.12 } }}
              className={wordClass}
            >
              POTAM<span className="text-primary">.</span>
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
