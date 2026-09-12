import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "./primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

// Same fly-in-by-index pattern as Precision.tsx — keeps the entrance varied
// regardless of team size instead of a fixed 1:1 slot mapping.
const OFFSET_PATTERN = [
  { x: -50, y: -30, rotate: -3 },
  { x: 50, y: 20, rotate: 2 },
  { x: -30, y: 40, rotate: 3 },
  { x: 40, y: -40, rotate: -2 },
  { x: -45, y: 15, rotate: 4 },
  { x: 30, y: -15, rotate: -4 },
];

type TeamMember = { id: string; name: string; role: string; photo: string; order: number };

/**
 * Public "Our Team" grid — same section shell/card-motion language as
 * Precision.tsx (gradient wash, rounded-2xl bg-card cards, scroll fly-in),
 * but the card itself follows the photo-top / overlapping-name-panel
 * layout the client referenced from a screenshot, reskinned to this site's
 * dark/amber theme instead of the screenshot's light one.
 */
export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/content/team`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.teamMembers && setMembers(data.teamMembers))
      .catch(() => {});
  }, []);

  if (members.length === 0) return null;

  return (
    <section
      id="team"
      className="relative py-32 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel>Our team</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
          The people <span className="text-ember">behind the work</span>.
        </h2>

        <div className="mt-16 flex flex-wrap justify-center gap-x-4 gap-y-8">
          {members.map((m, i) => (
            <TeamCard key={m.id} {...m} {...OFFSET_PATTERN[i % OFFSET_PATTERN.length]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({
  name,
  role,
  photo,
  x,
  y,
  rotate,
  index,
}: TeamMember & { x: number; y: number; rotate: number; index: number }) {
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
      className="group relative w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)]"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted">
        {photo ? (
          <img
            src={photo}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div className="relative z-10 mx-2.5 -mt-6 rounded-lg border border-border bg-card px-2.5 py-2 text-center shadow-[var(--shadow-deep)]">
        <h3 className="text-xs font-semibold uppercase tracking-wide">{name}</h3>
        {role && <p className="mt-0.5 text-[0.7rem] italic text-muted-foreground">{role}</p>}
      </div>
    </motion.article>
  );
}
