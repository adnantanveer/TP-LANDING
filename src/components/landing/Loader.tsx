import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { LogoMorph } from "@/components/LogoMorph/LogoMorph";

/**
 * Site intro: the cinematic particle logo morph (see LogoMorph) plays inside
 * this fixed overlay, holds on the completed wordmark, then the whole
 * overlay folds away like a book page — anchored at its top-left corner,
 * the bottom-right corner is what lifts and swings away, a real 3D
 * rotation (combined rotateX + rotateY around a corner-anchored
 * transform-origin), not a fade — to reveal the hero beneath. One
 * continuous sequence ("Phase 6"), not "loader finishes, then site
 * appears".
 */
export function Loader({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(true);

  const handleMorphComplete = useCallback(() => {
    // brief hold on the completed wordmark before the page turns away
    window.setTimeout(() => {
      setOpen(false);
      onDone?.();
    }, 450);
  }, [onDone]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] overflow-hidden bg-background"
          style={{
            transformOrigin: "0% 0%",
            transformPerspective: 2000,
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
          exit={{
            rotateX: 96,
            rotateY: 58,
            rotateZ: 6,
            x: "2%",
            y: "2%",
            boxShadow: "40px 50px 100px -20px rgba(0,0,0,0.6)",
          }}
          transition={{ duration: 1.1, ease: [0.61, 0.06, 0.4, 1] }}
          aria-hidden
        >
          <LogoMorph onComplete={handleMorphComplete} />
          {/* page-shading: darkens toward the hinge-opposite corner
              (bottom-right, the part lifting away), sells the "paper
              catching less light as it folds away" read */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to bottom right, transparent 42%, rgba(0,0,0,0.45) 100%)" }}
          />
          {/* rim highlight along the fold crease — a bare page has no
              visible thickness, this catch-light is what reads as "paper
              folding" rather than "flat rectangle rotating" */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to bottom right, transparent 55%, rgba(255,255,255,0.06) 62%, transparent 70%)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
