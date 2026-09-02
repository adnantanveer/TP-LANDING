import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { VertexScene } from "./VertexScene";

/**
 * The 3D scene, shifted down into its own section instead of driving the
 * hero — the hero is now the same scroll-scrubbed video as every other
 * concept (kept identical to the base site, per request). This is where
 * Vertex still gets to prove "a real rendered scene, not a CSS trick."
 */
export function VertexSceneSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35], [0, -60]);

  return (
    <section ref={ref} className="relative h-[200vh] border-t border-primary/20">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        <VertexScene scrollTarget={ref} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,color-mix(in_oklab,var(--background)_92%,transparent),transparent)]" />

        <motion.div style={{ opacity, y }} className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">// rendered, not simulated</p>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[0.98] tracking-tight">
            Software engineered in three dimensions.
          </h2>
          <p className="mt-6 max-w-md text-sm text-muted-foreground md:text-base">
            A real Three.js scene, drifting with your pointer and dollying forward as you scroll.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
