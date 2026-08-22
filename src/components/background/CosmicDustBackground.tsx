import { useEffect, useRef, useState } from "react";
import { DustScene } from "./dustScene";
import { detectTier } from "@/components/LogoMorph/particleEngine";

/**
 * Persistent, site-wide ambient WebGL background (rust dust motes + corner
 * flames) — mounted once at the app root (see App.tsx) so it survives route
 * navigation instead of remounting per page. Fully independent of the
 * Loader's own Tunnel scene (LogoMorph/TunnelBackground.tsx) — that intro is
 * final and untouched by this.
 *
 * Fixed + negative z-index, pointer-events none: sits behind every route's
 * content. Pages with their own opaque section backgrounds (ScrollWorld,
 * UkSection, OurWork, Loader) simply paint over it as normal; it only shows
 * through the transparent gaps (see Home.tsx/ReuseComponent.tsx's <main>).
 *
 * Gated off on low-tier devices and prefers-reduced-motion, same threshold
 * as the Tunnel — this one runs for the whole session rather than ~5s, so
 * getting the gate wrong costs a lot more battery/frame budget.
 */
export function CosmicDustBackground() {
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

    const scene = new DustScene(canvas);
    const resize = () => scene.resize(window.innerWidth, window.innerHeight);
    resize();
    window.addEventListener("resize", resize);

    scene.start();

    return () => {
      window.removeEventListener("resize", resize);
      scene.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden
    />
  );
}
