import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { LogoMorph } from "@/components/LogoMorph/LogoMorph";
import { TunnelBackground } from "@/components/LogoMorph/TunnelBackground";

/**
 * Site intro: the cinematic particle logo morph (see LogoMorph) plays inside
 * this fixed overlay, over the WebGL wormhole tunnel (TunnelBackground),
 * holds on the completed wordmark, then the whole overlay scales sharply
 * up and fades — reading as the camera accelerating forward through the
 * tunnel and bursting out the far end — revealing the hero's own video
 * underneath. One continuous sequence ("Phase 6"), not "loader finishes,
 * then site appears".
 */
export function Loader({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(true);

  const handleMorphComplete = useCallback(() => {
    // brief hold on the completed wordmark before flying through
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
          style={{ willChange: "transform, opacity" }}
          exit={{ scale: 4.2, opacity: 0, filter: "blur(10px)" }}
          transition={{
            // scale/blur keep the hard accelerating "flying forward" feel;
            // opacity gets its own gentler curve so the hero resolves in
            // gradually instead of snapping visible only in the last instant
            scale: { duration: 1.15, ease: [0.55, 0, 1, 0.45] },
            filter: { duration: 1.15, ease: [0.55, 0, 1, 0.45] },
            opacity: { duration: 1.15, ease: [0.33, 0, 0.2, 1] },
          }}
          aria-hidden
        >
          <TunnelBackground />
          <LogoMorph onComplete={handleMorphComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
