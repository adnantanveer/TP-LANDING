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
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2.5" y="2.5" width="8" height="8" rx="2"/><rect x="13.5" y="2.5" width="8" height="8" rx="2"/><rect x="2.5" y="13.5" width="8" height="8" rx="2"/><circle cx="17.5" cy="17.5" r="4"/></svg>',
      active: true,
    },
    {
      label: "Frontend",
      description: "React, accessible markup and animation that never costs you performance.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v11A1.5 1.5 0 0 1 19.5 17h-15A1.5 1.5 0 0 1 3 15.5v-11Zm7 14.5h4a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2ZM9.7 8.3a1 1 0 0 1 0 1.4L8.4 11l1.3 1.3a1 1 0 1 1-1.4 1.4l-2-2a1 1 0 0 1 0-1.4l2-2a1 1 0 0 1 1.4 0Zm4.6 0a1 1 0 0 1 1.4 0l2 2a1 1 0 0 1 0 1.4l-2 2a1 1 0 1 1-1.4-1.4l1.3-1.3-1.3-1.3a1 1 0 0 1 0-1.4Z"/></svg>',
      active: true,
    },
    {
      label: "Backend",
      description: "Reliable services and APIs built to scale with your business, not against it.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c4.7 0 8.5 1.5 8.5 3.5v12c0 2-3.8 3.5-8.5 3.5S3.5 20 3.5 18V6c0-2 3.8-3.5 8.5-3.5Zm0 3c-3.9 0-6.2-1-6.4-1.3.2-.3 2.5-1.3 6.4-1.3s6.2 1 6.4 1.3c-.2.3-2.5 1.3-6.4 1.3Zm-6.5 2.2C7.1 8.5 9.4 9 12 9s4.9-.5 6.5-1.3v3.6c-.2.3-2.5 1.3-6.5 1.3s-6.3-1-6.5-1.3V7.7Zm0 5.5C7.1 14 9.4 14.5 12 14.5s4.9-.5 6.5-1.3V16c-.2.3-2.5 1.3-6.5 1.3s-6.3-1-6.5-1.3v-2.8Z"/></svg>',
      active: true,
    },
    {
      label: "Cloud",
      description: "AWS and Azure infrastructure, provisioned for resilience from day one.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a5.5 5.5 0 0 1-.6-10.97A7 7 0 0 1 19.9 9.5 4.75 4.75 0 0 1 19 19H7Z"/></svg>',
      active: true,
    },
    {
      label: "Mobile",
      description: "Cross-platform products that still feel entirely native.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2.5A2.5 2.5 0 0 0 4.5 5v14A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5V5A2.5 2.5 0 0 0 17 2.5H7Zm3 1.7h4a.8.8 0 0 1 0 1.6h-4a.8.8 0 0 1 0-1.6ZM12 20a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z"/></svg>',
      active: true,
    },
    {
      label: "AI",
      description: "Applied machine learning that solves a real problem, not a headline.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.5a1 1 0 0 1 .95.68L13.8 8.2l5.02 1.85a1 1 0 0 1 0 1.88L13.8 13.8l-1.85 5.02a1 1 0 0 1-1.88 0L8.22 13.8l-5.02-1.85a1 1 0 0 1 0-1.88l5.02-1.87 1.85-5.02A1 1 0 0 1 11 2.5Zm7.5 12a.8.8 0 0 1 .76.55l.6 1.68 1.68.6a.8.8 0 0 1 0 1.5l-1.68.6-.6 1.68a.8.8 0 0 1-1.5 0l-.6-1.68-1.68-.6a.8.8 0 0 1 0-1.5l1.68-.6.6-1.68a.8.8 0 0 1 .74-.55Z"/></svg>',
      active: true,
    },
  ],
};

// Same safety net as TechStack.tsx/Services.tsx: real CMS data still wins
// whenever it's actually usable, this only fills in for an item the API
// leaves blank or saved as a bare <path> with no wrapping <svg> (which
// InlineIcon's `[&>svg]` sizing selector can't target, so nothing
// renders). Matched by label.
function hasUsableIcon(icon: string | undefined) {
  return !!icon && /<svg[\s>]/i.test(icon);
}

function withIconFallback(items: CapabilityItem[]): CapabilityItem[] {
  const defaults = new Map(DEFAULT_PRECISION_CONTENT.items.map((c) => [c.label, c.icon]));
  return items.map((item) => (hasUsableIcon(item.icon) ? item : { ...item, icon: defaults.get(item.label) ?? item.icon }));
}

export function Precision() {
  const [content, setContent] = useState<PrecisionContent>(DEFAULT_PRECISION_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/precision`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent({ ...data, items: withIconFallback(data.items) }))
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
