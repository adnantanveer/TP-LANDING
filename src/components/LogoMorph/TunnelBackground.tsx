import { useEffect, useRef, useState } from "react";
import { TunnelScene } from "./tunnelScene";
import { detectTier } from "./particleEngine";

/**
 * WebGL wormhole-tunnel background layered behind the particle logo (see
 * particleEngine.ts's canvas, which now clears to a translucent veil
 * instead of an opaque fill so this shows through — see styles change in
 * particleEngine.ts's draw()).
 *
 * Gated off entirely on low-tier devices and under prefers-reduced-motion:
 * this is a 3-composer bloom pipeline stacked underneath an already-active
 * 2D particle canvas, so it only mounts where the device can plausibly
 * carry both without dropping frames.
 */
export function TunnelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return detectTier() !== "low";
  });

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new TunnelScene(canvas);
    const resize = () => scene.resize(window.innerWidth, window.innerHeight);
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      scene.setPointer(x, y, true);
    };
    const onLeave = () => scene.setPointer(0, 0, false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    scene.start();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      scene.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
