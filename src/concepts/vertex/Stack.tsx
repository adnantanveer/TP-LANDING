import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { useRef } from "react";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

export function VertexStack() {
  return (
    <section id="stack" className="relative border-t border-primary/20 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// stack</p>
        <h2 className="mt-4 max-w-xl text-[clamp(2rem,4.6vw,3.2rem)] font-bold leading-[1.05]">
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
  const y = useTransform(smooth, [0, 1], [30, 0]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(py, { stiffness: 200, damping: 18 });
  const ry = useSpring(px, { stiffness: 200, damping: 18 });

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="perspective-scene" transition={{ delay: (index % 4) * 0.03 }}>
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          px.set(((e.clientX - r.left) / r.width - 0.5) * 10);
          py.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        className="group flex h-full min-h-[8.5rem] flex-col justify-between border border-primary/20 bg-card p-5 transition-colors hover:border-primary/60"
      >
        <TechIcon name={name} className="h-6 w-6 text-foreground/50 transition-colors group-hover:text-primary" />
        <div>
          <h3 className="text-base font-medium text-foreground">{name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
