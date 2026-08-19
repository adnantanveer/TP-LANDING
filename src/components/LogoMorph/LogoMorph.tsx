import { useEffect, useRef, useState } from "react";
import { detectTier, LogoMorphEngine } from "./particleEngine";
import logoFallback from "./techpotam-logo-full.png";
import "./LogoMorph.css";

/**
 * Cinematic particle logo intro: darkness → particles awaken → TP icon forms
 * → morphs into the TECHPOTAM wordmark → holds → hands off to the caller.
 * Runs entirely on a <canvas> via `LogoMorphEngine` (see particleEngine.ts) —
 * no React state updates during the animation itself, only the one-time
 * `onComplete` call at the end.
 */
export function LogoMorph({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tier = detectTier();
    const engine = new LogoMorphEngine(canvas, tier, onComplete);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => engine.resize(window.innerWidth, window.innerHeight, dpr);
    resize();
    window.addEventListener("resize", resize);

    engine.start();

    return () => {
      window.removeEventListener("resize", resize);
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useEffect(() => {
    if (!reducedMotion) return;
    const timer = window.setTimeout(onComplete, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="logo-morph logo-morph--static">
        <img src={logoFallback} alt="Techpotam" className="logo-morph__static-img" />
      </div>
    );
  }

  return <canvas ref={canvasRef} className="logo-morph__canvas" aria-label="Techpotam" role="img" />;
}
