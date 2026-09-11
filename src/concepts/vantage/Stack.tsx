import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { useRef } from "react";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

/** Uniform pointer-tilt card grid — a different composition family from the
 * Capabilities bento above (asymmetric tile sizes there vs. a regular grid
 * here, and the interaction itself, not the layout, is the point). */
export function VantageStack() {
  return (
    <section id="stack" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Stack we master</p>
        <h2 className="mt-4 max-w-xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.03]">
          A full-spectrum technology stack.
        </h2>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {techStack.map((t, i) => (
            <TiltCard key={t.name} index={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({ name, blurb, index }: { name: string; blurb: string; group: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 60%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 22, mass: 0.4 });
  const opacity = useTransform(smooth, [0, 1], [0, 1]);
  const y = useTransform(smooth, [0, 1], [40, 0]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(py, { stiffness: 200, damping: 18 });
  const ry = useSpring(px, { stiffness: 200, damping: 18 });
  const glowX = useSpring(px, { stiffness: 120, damping: 24 });
  const glowY = useSpring(py, { stiffness: 120, damping: 24 });

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="perspective-scene" transition={{ delay: (index % 4) * 0.03 }}>
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          px.set(((e.clientX - r.left) / r.width - 0.5) * 12);
          py.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        className="vantage-glass group relative flex h-full min-h-[8.5rem] flex-col justify-between overflow-hidden rounded-2xl p-5"
      >
        <motion.div
          aria-hidden
          style={{ x: glowX, y: glowY, backgroundColor: "var(--primary)" }}
          className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
        />
        <TechIcon
          name={name}
          className="relative h-6 w-6 text-foreground/60 transition-colors duration-300 group-hover:text-primary"
        />
        <div className="relative">
          <h3 className="text-base font-medium text-foreground">{name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
