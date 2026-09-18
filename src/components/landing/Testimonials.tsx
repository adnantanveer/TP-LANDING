import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionLabel, initials } from "./primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

const HEADING = "Trusted By Ambitious Teams.";

type TestimonialItem = {
  id: string;
  name: string;
  organization: string;
  role: string;
  quote: string;
  photo: string;
};

const DEFAULT_ITEMS: TestimonialItem[] = [
  {
    id: "default-1",
    quote:
      "They treated our product like it was their own. The craft shows in every screen, every transition, every detail.",
    name: "Operations Director",
    organization: "UK Healthcare Provider",
    role: "",
    photo: "",
  },
  {
    id: "default-2",
    quote:
      "What impressed us most was the restraint — nothing in the product feels unnecessary. It just works, beautifully.",
    name: "Head of Digital",
    organization: "UK Financial Services Firm",
    role: "",
    photo: "",
  },
  {
    id: "default-3",
    quote: "From discovery to launch, the process felt calm and considered. The result speaks for itself.",
    name: "Founder",
    organization: "UK Logistics Startup",
    role: "",
    photo: "",
  },
];

/**
 * Pinned quote crossfade: same "act" mechanic as the hero (progress-driven
 * opacity/scale bands over a shared scroll range), applied to three real
 * client quotes instead of hero copy.
 */
export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const [items, setItems] = useState<TestimonialItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    fetch(`${API_URL}/api/content/testimonials`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.testimonials && setItems(data.testimonials))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative h-[280vh] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)]"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="mb-16 text-center">
          <SectionLabel>In their words</SectionLabel>
          <h2 className="mt-6 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">{HEADING}</h2>
        </div>

        <div className="perspective-scene relative h-[40vh] w-full max-w-3xl">
          {items.map((t, i) => (
            <Quote key={t.id} {...t} index={i} total={items.length} progress={p} />
          ))}
        </div>

        <Dots progress={p} total={items.length} />
      </div>
    </section>
  );
}

function Quote({
  quote,
  name,
  organization,
  role,
  photo,
  index,
  total,
  progress,
}: {
  quote: string;
  name: string;
  organization: string;
  role: string;
  photo: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const span = 1 / total;
  const start = index * span;
  const mid = start + span * 0.5;
  const end = start + span;
  const first = index === 0;

  const opacity = useTransform(
    progress,
    first ? [0, 0.02, end - 0.08, end] : [start - 0.06, start + 0.04, end - 0.08, end],
    [first ? 1 : 0, 1, 1, 0]
  );
  const scale = useTransform(progress, [start, mid, end], [0.94, 1, 0.94]);
  const y = useTransform(progress, [start, mid, end], [24, 0, -24]);

  return (
    <motion.figure
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <PersonImage name={name} photo={photo} />
      <blockquote>
        <p className="text-[clamp(1.4rem,3vw,2.25rem)] font-medium leading-[1.3] text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-6 flex flex-col items-center">
        <p className="font-medium">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{[role, organization].filter(Boolean).join(", ")}</p>
      </figcaption>
    </motion.figure>
  );
}

// The section's one real "image": a proper portrait rather than the tiny
// 12px thumbnail this used to tuck under the caption. Same cross-fade +
// monogram-fallback pattern as TeamFlipCard's badge — the client's own
// default quotes are attributed by role, not a named person ("Operations
// Director"), so there's rarely a real photo to show; the monogram still
// gives every quote a face-shaped anchor instead of just floating text.
function PersonImage({ name, photo }: { name: string; photo: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative mb-6 h-44 w-44 shrink-0 overflow-hidden rounded-full border border-primary/30 shadow-[var(--shadow-ember)]">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-transparent font-display text-4xl font-semibold text-primary">
        {initials(name)}
      </div>
      {photo && (
        <img
          src={photo}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

function Dots({ progress, total }: { progress: MotionValue<number>; total: number }) {
  return (
    <div className="mt-16 flex gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
}

function Dot({ index, total, progress }: { index: number; total: number; progress: MotionValue<number> }) {
  const span = 1 / total;
  const opacity = useTransform(
    progress,
    [index * span - 0.02, index * span + 0.03, (index + 1) * span - 0.03, (index + 1) * span],
    [0.3, 1, 1, 0.3]
  );
  return <motion.span style={{ opacity }} className="h-1.5 w-6 rounded-full bg-primary" />;
}
