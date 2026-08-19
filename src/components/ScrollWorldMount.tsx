import { useEffect, useRef } from "react";
import { mountScrollWorld, type ScrollWorldConfig } from "@/lib/scrub-engine";

/**
 * Mounts a scroll-world instance into a plain div. `config` is only read on
 * mount (the engine builds its own DOM/scroll-math around it once) — pass a
 * stable object, not one recreated every render.
 */
export function ScrollWorldMount({
  config,
  className,
  embedded = false,
}: {
  config: ScrollWorldConfig;
  className?: string;
  embedded?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const destroy = mountScrollWorld(node, config);

    // Release the engine's viewport-fixed layers (copy/route/hint/scrollbar)
    // once this instance's own scroll track has fully passed — without this
    // they're position:fixed and would float over every section below this
    // one for the rest of the page. .sw-stage/.sw-sky are left alone: the
    // engine already fades each scene's own opacity to 0 tied to scroll
    // position, so forcing them off here would hard-cut a mid-crossfade.
    let ticking = false;
    const updateRelease = () => {
      ticking = false;
      const vh = window.innerHeight;
      node.classList.toggle("sw-done", node.getBoundingClientRect().bottom <= vh);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateRelease);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateRelease);
    updateRelease();

    return () => {
      destroy();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateRelease);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className={`${embedded ? "sw-embedded" : ""} ${className || ""}`.trim()} />;
}
