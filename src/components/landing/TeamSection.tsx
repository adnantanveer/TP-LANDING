import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SectionLabel } from "./primitives";
import { TeamFlipCard, type TeamMember } from "./TeamFlipCard";

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

/**
 * Homepage teaser for the full "Our Team" roster (see pages/Team.tsx) —
 * a fixed 4-up row (the first 4 members only, regardless of how many the
 * CMS ends up with — client's said they'll grow this to 15-16 people) with
 * a "View more" button beneath it that hands off to the full grid.
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

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {members.slice(0, 4).map((m, i) => (
            <div key={m.id} className="h-64 w-full">
              <TeamCard {...m} {...OFFSET_PATTERN[i % OFFSET_PATTERN.length]} index={i} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TeamCard({
  x,
  y,
  rotate,
  index,
  ...member
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
    <motion.article ref={ref} style={{ x: tx, y: ty, rotate: tr, scale, opacity }} transition={{ delay: index * 0.03 }} className="h-64 w-full">
      <TeamFlipCard {...member} />
    </motion.article>
  );
}
