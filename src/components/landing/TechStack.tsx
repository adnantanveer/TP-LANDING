import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { useRef, type ComponentType } from "react";
import { SectionLabel } from "./primitives";
import {
  ReactLogo,
  AngularLogo,
  VueLogo,
  NextLogo,
  TsLogo,
  NodeLogo,
  MongoLogo,
  PostgresLogo,
  AwsLogo,
  AzureLogo,
  DockerLogo,
  PythonLogo,
  GraphqlLogo,
  SupabaseLogo,
  TailwindLogo,
  RedisLogo,
} from "./tech-logos";

type Tech = {
  name: string;
  blurb: string;
  Logo: ComponentType<{ className?: string }>;
  hue: string;
};

const TECH: Tech[] = [
  { name: "React", blurb: "Component systems at scale", Logo: ReactLogo, hue: "oklch(0.78 0.16 230)" },
  { name: "Angular", blurb: "Enterprise SPA architecture", Logo: AngularLogo, hue: "oklch(0.72 0.18 18)" },
  { name: "Vue", blurb: "Progressive, lightweight UI", Logo: VueLogo, hue: "oklch(0.72 0.14 145)" },
  { name: "Next.js", blurb: "SSR / edge rendering", Logo: NextLogo, hue: "oklch(0.85 0.02 250)" },
  { name: "TypeScript", blurb: "Type-safe, zero-drift codebases", Logo: TsLogo, hue: "oklch(0.62 0.16 250)" },
  { name: "Node.js", blurb: "High-throughput services", Logo: NodeLogo, hue: "oklch(0.78 0.16 140)" },
  { name: "MongoDB", blurb: "Flexible document stores", Logo: MongoLogo, hue: "oklch(0.72 0.16 140)" },
  { name: "PostgreSQL", blurb: "Relational rigor & RLS", Logo: PostgresLogo, hue: "oklch(0.7 0.16 245)" },
  { name: "AWS", blurb: "Cloud-native UK hosting", Logo: AwsLogo, hue: "oklch(0.78 0.14 50)" },
  { name: "Azure", blurb: "Enterprise & Gov cloud", Logo: AzureLogo, hue: "oklch(0.62 0.16 245)" },
  { name: "Docker", blurb: "Reproducible deployments", Logo: DockerLogo, hue: "oklch(0.7 0.16 220)" },
  { name: "Python", blurb: "ML, data & automation", Logo: PythonLogo, hue: "oklch(0.7 0.14 245)" },
  { name: "GraphQL", blurb: "Typed, federated APIs", Logo: GraphqlLogo, hue: "oklch(0.76 0.16 295)" },
  { name: "Supabase", blurb: "Postgres + auth + storage", Logo: SupabaseLogo, hue: "oklch(0.72 0.14 145)" },
  { name: "Tailwind CSS", blurb: "Design-system driven UI", Logo: TailwindLogo, hue: "oklch(0.72 0.14 230)" },
  { name: "Redis", blurb: "Real-time caching & queues", Logo: RedisLogo, hue: "oklch(0.62 0.2 18)" },
];

export function TechStack() {
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

  return (
    <section id="stack" ref={ref} className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="perspective-scene">
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
                A full-spectrum{" "}
                <span className="text-ember">technology stack</span>, deployed with UK precision.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              From frontend frameworks to cloud infrastructure, we pick the right tool for the job
              and ship it with senior-grade engineering.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {TECH.map((t, i) => (
              <TechCard key={t.name} {...t} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TechCard({ name, blurb, Logo, hue, index }: Tech & { index: number }) {
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
          style={{
            x: glowX,
            y: glowY,
            backgroundColor: hue,
          }}
          className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        />

        <div className="relative flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
          <span style={{ color: hue }} className="transition-transform duration-300 group-hover:scale-110">
            <Logo className="h-10 w-10 text-foreground" />
          </span>
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
