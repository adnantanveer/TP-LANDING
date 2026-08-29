import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "./primitives";
import { InlineIcon } from "@/components/InlineIcon";

type Tech = { name: string; blurb: string; icon: string; active: boolean };

const API_URL = import.meta.env.VITE_API_URL as string;

type TechStackContent = {
  visible: boolean;
  heading: string;
  headingEmphasis: string;
  subheading: string;
  items: Tech[];
};

const DEFAULT_TECH_STACK_CONTENT: TechStackContent = {
  visible: true,
  heading: "A full-spectrum",
  headingEmphasis: "technology stack",
  subheading: "From frontend frameworks to cloud infrastructure, we pick the right tool for the job and ship it with senior-grade engineering.",
  items: [
    { name: "React", blurb: "Component systems at scale", icon: "", active: true },
    { name: "Angular", blurb: "Enterprise SPA architecture", icon: "", active: true },
    { name: "Vue", blurb: "Progressive, lightweight UI", icon: "", active: true },
    { name: "Next.js", blurb: "SSR / edge rendering", icon: "", active: true },
    { name: "TypeScript", blurb: "Type-safe, zero-drift codebases", icon: "", active: true },
    { name: "Node.js", blurb: "High-throughput services", icon: "", active: true },
    { name: "MongoDB", blurb: "Flexible document stores", icon: "", active: true },
    { name: "PostgreSQL", blurb: "Relational rigor & RLS", icon: "", active: true },
    { name: "AWS", blurb: "Cloud-native UK hosting", icon: "", active: true },
    { name: "Azure", blurb: "Enterprise & Gov cloud", icon: "", active: true },
    { name: "Docker", blurb: "Reproducible deployments", icon: "", active: true },
    { name: "Python", blurb: "ML, data & automation", icon: "", active: true },
    { name: "GraphQL", blurb: "Typed, federated APIs", icon: "", active: true },
    { name: "Supabase", blurb: "Postgres + auth + storage", icon: "", active: true },
    { name: "Tailwind CSS", blurb: "Design-system driven UI", icon: "", active: true },
    { name: "Redis", blurb: "Real-time caching & queues", icon: "", active: true },
  ],
};

export function TechStack() {
  const [content, setContent] = useState<TechStackContent>(DEFAULT_TECH_STACK_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/techStack`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
      .catch(() => {});
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.5 });

  // The whole grid tilts in 3D as it passes through the viewport.
  const rotateX = useTransform(smooth, [0, 0.5, 1], [22, 0, -16]);
  const rotateZ = useTransform(smooth, [0, 0.5, 1], [3, 0, -2]);
  const scale = useTransform(smooth, [0, 0.5, 1], [0.86, 1, 0.92]);
  const yShift = useTransform(smooth, [0, 0.5, 1], [120, 0, -60]);

  if (!content.visible) return null;

  const tech = content.items.filter((item) => item.active);

  return (
    <section
      id="stack"
      ref={ref}
      className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-32"
    >
      <div className="perspective-scene relative mx-auto max-w-6xl px-6">
        <motion.div
          style={{
            rotateX,
            rotateZ,
            scale,
            y: yShift,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>Stack we master</SectionLabel>
              <h2 className="mt-5 max-w-xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
                {content.heading}{" "}
                <span className="text-ember">{content.headingEmphasis}</span>, deployed with precision.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">{content.subheading}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {tech.map((t, i) => (
              <TechCard key={`${t.name}-${i}`} {...t} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TechCard({ name, blurb, icon, index }: Tech & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 55%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 22, mass: 0.4 });

  const opacity = useTransform(smooth, [0, 1], [0, 1]);
  const y = useTransform(smooth, [0, 1], [60, 0]);
  // staggered depth: cards slightly behind/front depending on column
  const z = useTransform(smooth, [0, 1], [-90, index % 2 ? 30 : -30]);

  // pointer-reactive tilt
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(py, { stiffness: 200, damping: 18 });
  const ry = useSpring(px, { stiffness: 200, damping: 18 });
  const glowX = useSpring(px, { stiffness: 120, damping: 24 });
  const glowY = useSpring(py, { stiffness: 120, damping: 24 });

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, transformStyle: "preserve-3d" }}
      className="perspective-scene"
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, translateZ: z, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const fx = (e.clientX - r.left) / r.width - 0.5;
          const fy = (e.clientY - r.top) / r.height - 0.5;
          px.set(fx * 14);
          py.set(-fy * 14);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        className="group relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-primary/50"
      >
        {/* reactive glow that follows the pointer */}
        <motion.div
          aria-hidden
          style={{ x: glowX, y: glowY, backgroundColor: "var(--primary)" }}
          className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        />

        <div className="relative flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
          <InlineIcon svg={icon} fallback={name} className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="relative" style={{ transform: "translateZ(20px)" }}>
          <h3 className="text-lg font-medium text-foreground">{name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
