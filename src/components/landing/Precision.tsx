import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef, type SVGProps } from "react";
import { SectionLabel } from "./primitives";

function IconDesignSystems(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </svg>
  );
}

function IconFrontend(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="M2.5 8.5h19" />
      <path d="m8 13-2 2 2 2" />
      <path d="m13 13 2 2-2 2" />
    </svg>
  );
}

function IconBackend(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      <path d="M4 11.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function IconCloud(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6.5 19a4.5 4.5 0 0 1-.5-8.98A6 6 0 0 1 17.5 8.5 4.5 4.5 0 0 1 17 19h-10.5Z" />
    </svg>
  );
}

function IconMobile(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

function IconAI(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

const CAPABILITIES = [
  { label: "Design Systems", description: "Tokens, components and documentation that keep teams shipping in one voice.", icon: IconDesignSystems, x: -50, y: -30, rotate: -3 },
  { label: "Frontend", description: "React, accessible markup and animation that never costs you performance.", icon: IconFrontend, x: 50, y: 20, rotate: 2 },
  { label: "Backend", description: "Reliable services and APIs built to scale with your business, not against it.", icon: IconBackend, x: -30, y: 40, rotate: 3 },
  { label: "Cloud", description: "AWS and Azure infrastructure, provisioned for resilience from day one.", icon: IconCloud, x: 40, y: -40, rotate: -2 },
  { label: "Mobile", description: "Cross-platform products that still feel entirely native.", icon: IconMobile, x: -45, y: 15, rotate: 4 },
  { label: "AI", description: "Applied machine learning that solves a real problem, not a headline.", icon: IconAI, x: 30, y: -15, rotate: -4 },
];

export function Precision() {
  return (
    <section
      id="precision"
      className="relative py-32 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)]"
    >
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
  icon: Icon,
  x,
  y,
  rotate,
  index,
}: {
  label: string;
  description: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
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
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-medium">{label}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.article>
  );
}
