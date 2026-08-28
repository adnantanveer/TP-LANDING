import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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
  // Only meant to live behind the hero, not the whole page below it — once
  // the hero's own bottom edge scrolls past the viewport top, hide the dust
  // for every section after that (Services onward) and only bring it back
  // if the user scrolls back up into the hero. Same hero-bottom tracking
  // Nav.tsx already uses, just inverted (Nav shows AFTER the hero, this
  // shows only DURING it). Pages with no hero at all (CaseStudy,
  // ReuseComponent) never show it at all — this component is mounted once
  // at the App root and survives client-side route changes, so `pathname`
  // is a dependency here purely to force this effect (and its hero lookup)
  // to re-run on every navigation instead of only once at first mount.
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-world");
    if (!hero) {
      setVisible(false);
      return;
    }

    let heroBottom = 0;
    const measure = () => {
      heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY < heroBottom);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [pathname]);

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
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    />
  );
}
