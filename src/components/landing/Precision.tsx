import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "./primitives";
import { InlineIcon } from "@/components/InlineIcon";

const API_URL = import.meta.env.VITE_API_URL as string;

// Fly-in direction/rotation cycles through these hand-tuned variations by
// index rather than a fixed 1:1 slot mapping — keeps the same varied,
// not-all-identical entrance motion regardless of how many cards there are.
const OFFSET_PATTERN = [
  { x: -50, y: -30, rotate: -3 },
  { x: 50, y: 20, rotate: 2 },
  { x: -30, y: 40, rotate: 3 },
  { x: 40, y: -40, rotate: -2 },
  { x: -45, y: 15, rotate: 4 },
  { x: 30, y: -15, rotate: -4 },
];

type CapabilityItem = { label: string; description: string; icon: string; active: boolean };

type PrecisionContent = {
  visible: boolean;
  heading: string;
  headingEmphasis: string;
  items: CapabilityItem[];
};

const DEFAULT_PRECISION_CONTENT: PrecisionContent = {
  visible: true,
  heading: "Built With",
  headingEmphasis: "Precision",
  items: [
    {
      label: "Design Systems",
      description: "Tokens, components and documentation that keep teams shipping in one voice.",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>',
      active: true,
    },
    {
      label: "Frontend",
      description: "React, accessible markup and animation that never costs you performance.",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M2.5 8.5h19"/><path d="m8 13-2 2 2 2"/><path d="m13 13 2 2-2 2"/></svg>',
      active: true,
    },
    {
      label: "Backend",
      description: "Reliable services and APIs built to scale with your business, not against it.",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/><path d="M4 11.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>',
      active: true,
    },
    {
      label: "Cloud",
      description: "AWS and Azure infrastructure, provisioned for resilience from day one.",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 19a4.5 4.5 0 0 1-.5-8.98A6 6 0 0 1 17.5 8.5 4.5 4.5 0 0 1 17 19h-10.5Z"/></svg>',
      active: true,
    },
    {
      label: "Mobile",
      description: "Cross-platform products that still feel entirely native.",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
      active: true,
    },
    {
      label: "AI",
      description: "Applied machine learning that solves a real problem, not a headline.",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/><circle cx="12" cy="12" r="4"/></svg>',
      active: true,
    },
  ],
};

export function Precision() {
  const [content, setContent] = useState<PrecisionContent>(DEFAULT_PRECISION_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/precision`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
      .catch(() => {});
  }, []);

  if (!content.visible) return null;

  const capabilities = content.items.filter((item) => item.active);

  return (
    <section
      id="precision"
      className="relative py-32 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel>Capabilities</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
          {content.heading} <span className="text-ember">{content.headingEmphasis}</span>.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <PrecisionCard key={`${c.label}-${i}`} {...c} {...OFFSET_PATTERN[i % OFFSET_PATTERN.length]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrecisionCard({
  label,
  description,
  icon,
  x,
  y,
  rotate,
  index,
}: CapabilityItem & { x: number; y: number; rotate: number; index: number }) {
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
      <InlineIcon svg={icon} fallback={label} className="h-11 w-11 rounded-full border border-primary/30 bg-primary/10 p-2.5 text-primary" />
      <h3 className="mt-5 text-xl font-medium">{label}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.article>
  );
}
