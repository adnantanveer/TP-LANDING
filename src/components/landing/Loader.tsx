import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { LogoMorph } from "@/components/LogoMorph/LogoMorph";
import { TunnelBackground } from "@/components/LogoMorph/TunnelBackground";

/**
 * Site intro: the cinematic particle logo morph (see LogoMorph) plays inside
 * this fixed overlay, holds on the completed wordmark, then the whole
 * overlay rolls up and shrinks away into its top-left corner — like a rug
 * being rolled up from its bottom-right corner — revealing the hero
 * underneath, which clears from the bottom-right first. Anchoring the
 * scale/rotate at the top-left ("0% 0%") is what makes the shrink gather
 * toward that corner rather than toward the center. One continuous
 * sequence ("Phase 6"), not "loader finishes, then site appears".
 */
export function Loader({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(true);

  const handleMorphComplete = useCallback(() => {
    // brief hold on the completed wordmark before it rolls away
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
          style={{ transformOrigin: "0% 0%", willChange: "transform" }}
          exit={{
            scaleX: 0.05,
            scaleY: 0.035,
            rotate: -14,
            opacity: 0.5,
            filter: "blur(4px)",
            boxShadow: "18px 26px 60px -12px rgba(0,0,0,0.65)",
          }}
          transition={{ duration: 0.95, ease: [0.7, 0, 0.35, 1] }}
          aria-hidden
        >
          <TunnelBackground />
          <LogoMorph onComplete={handleMorphComplete} />
          {/* darkens toward the far (bottom-right) edge as it rolls — that
              edge is furthest from the top-left anchor, so it travels the
              fastest and should read as receding into shadow first */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to bottom right, transparent 35%, rgba(0,0,0,0.4) 100%)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
