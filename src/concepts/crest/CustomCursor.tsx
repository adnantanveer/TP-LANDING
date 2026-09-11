import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Site-wide cursor-reactive touch, reinforcing the same throughline as the
 * Statement spotlight and the Work floating preview: a small dot tracks
 * the pointer directly (no spring — it should feel glued to the tip), a
 * larger ring trails behind it on a spring, and the ring grows over any
 * link/button. Pointer devices only (checked once via matchMedia, not
 * re-checked per event) and skipped entirely under prefers-reduced-motion
 * — the OS cursor is the accessible default, this is a bonus on top.
 */
export function CrestCustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 26, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 220, damping: 26, mass: 0.4 });

  useEffect(() => {
    if (reduceMotion) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const root = document.querySelector(".concept-crest");
    if (!canHover || !root) return;

    setEnabled(true);
    root.classList.add("crest-cursor-none");

    function handleMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    function handleOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      setHoveringLink(!!target.closest("a, button, [role='button']"));
    }
    function handleLeave() {
      x.set(-100);
      y.set(-100);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerover", handleOver);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      root.classList.remove("crest-cursor-none");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [reduceMotion, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x, y }}
        animate={{ scale: hoveringLink ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
      />
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hoveringLink ? 1.8 : 1, opacity: hoveringLink ? 0.5 : 0.85 }}
        transition={{ scale: { type: "spring", stiffness: 300, damping: 22 }, opacity: { duration: 0.2 } }}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary"
      />
    </>
  );
}
