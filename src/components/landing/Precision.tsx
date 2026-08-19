import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import { SectionLabel } from "./primitives";

const CAPABILITIES = [
  { label: "Design Systems", description: "Tokens, components and documentation that keep teams shipping in one voice.", x: -50, y: -30, rotate: -3 },
  { label: "Frontend", description: "React, accessible markup and animation that never costs you performance.", x: 50, y: 20, rotate: 2 },
  { label: "Backend", description: "Reliable services and APIs built to scale with your business, not against it.", x: -30, y: 40, rotate: 3 },
  { label: "Cloud", description: "AWS and Azure infrastructure, provisioned for resilience from day one.", x: 40, y: -40, rotate: -2 },
  { label: "Mobile", description: "Cross-platform products that still feel entirely native.", x: -45, y: 15, rotate: 4 },
  { label: "AI", description: "Applied machine learning that solves a real problem, not a headline.", x: 30, y: -15, rotate: -4 },
];

export function Precision() {
  return (
    <section id="precision" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel>Capabilities</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
          Built With <span className="text-ember">Precision</span>.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <PrecisionCard key={c.label} {...c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrecisionCard({
  label,
  description,
  x,
  y,
  rotate,
  index,
}: {
  label: string;
  description: string;
  x: number;
  y: number;
  rotate: number;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 45%"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 22, mass: 0.4 });

  const tx = useTransform(p, [0, 1], [`${x}%`, "0%"]);
  const ty = useTransform(p, [0, 1], [`${y}%`, "0%"]);
  const tr = useTransform(p, [0, 1], [rotate * 3, 0]);
  const scale = useTransform(p, [0, 1], [1.5, 1]);
  const opacity = useTransform(p, [0, 0.6, 1], [0, 0.7, 1]);

  return (
    <motion.article
      ref={ref}
      style={{ x: tx, y: ty, rotate: tr, scale, opacity }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
    >
      <h3 className="text-xl font-medium">{label}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.article>
  );
}
