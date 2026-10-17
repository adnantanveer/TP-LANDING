import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { KineticHeading, LineReveal, SectionLabel } from "./primitives";
import { TeamMosaic, type TeamMember } from "./TeamMosaic";
import { sortTeam, useTeamContent } from "./useTeamContent";

// The homepage shows two rows of four (eight people); everyone else is on
// the full /team page behind "Meet the team".
const HOME_MAX = 8;
// Matches the "150+ engineers" figure in Stats.tsx — the admin can set a
// real `headcount` on the team endpoint (optional, see the handoff).
const DEFAULT_HEADCOUNT = 150;

// Fictional people on Pexels stock portraits (see the handoff for sources)
// so the section has something to show without the API. The live CMS
// replaces this wholesale; none of it ships as real staff.
const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "t1", name: "Amara Osei", role: "Engineering Director", photo: "/assets/stock/team-1.jpg", banner: "", bio: "Runs the squads. Still reviews the pull requests that matter.", order: 1, isKeyMember: true },
  { id: "t2", name: "Rafael Mendes", role: "Principal Engineer", photo: "/assets/stock/team-2.jpg", banner: "", bio: "Architecture, performance and the hard bugs nobody else wants.", order: 2, isKeyMember: true },
  { id: "t3", name: "Sophie Lindqvist", role: "Head of Design", photo: "/assets/stock/team-3.jpg", banner: "", bio: "Design systems that engineers actually enjoy building against.", order: 3, isKeyMember: true },
  { id: "t4", name: "Marcus Bellamy", role: "Cloud & DevOps Lead", photo: "/assets/stock/team-4.jpg", banner: "", bio: "AWS, Azure and the 3am pages that never happen.", order: 4, isKeyMember: true },
  { id: "t5", name: "Hannah Ritter", role: "Product Manager", photo: "/assets/stock/team-5.jpg", banner: "", bio: "", order: 5 },
  { id: "t6", name: "Kenji Watanabe", role: "Senior Engineer", photo: "/assets/stock/team-6.jpg", banner: "", bio: "", order: 6 },
  { id: "t7", name: "Margaret Holloway", role: "Delivery Lead", photo: "/assets/stock/team-7.jpg", banner: "", bio: "", order: 7 },
  { id: "t8", name: "Jerome Adebayo", role: "Mobile Engineer", photo: "/assets/stock/team-8.jpg", banner: "", bio: "", order: 8 },
];

/**
 * Homepage teaser for the full "Our Team" roster (see pages/Team.tsx).
 * Same admin feed (`/api/content/team`) and the same irregular TeamMosaic
 * grid as /team: key members first, then by order, capped at HOME_MAX,
 * with a "+N" count that hands off to the full page. Sits on a moody
 * architectural photograph that drifts against the scroll under a heavy
 * dark wash: texture, not a picture.
 */
export function TeamSection() {
  const reduce = useReducedMotion();
  const { members, headcount: liveHeadcount } = useTeamContent(DEFAULT_MEMBERS);
  const headcount = liveHeadcount ?? DEFAULT_HEADCOUNT;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  if (members.length === 0) return null;

  const shown = sortTeam(members).slice(0, HOME_MAX);
  const remaining = Math.max(0, headcount - shown.length);

  return (
    <section id="team" ref={ref} className="relative py-28 md:py-36">
      {/* Backdrop photograph, oversized for the parallax drift. Clipped here
          rather than on the section, so the floating details card can
          overhang the grid without being cut off. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div style={{ y: bgY }} className="absolute -inset-y-[10%] inset-x-0">
          <img
            src="/assets/stock/team-bg-3.jpg"
            alt=""
            width={1600}
            height={1000}
            loading="lazy"
            className="h-full w-full object-cover opacity-50 saturate-[0.4]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklab,var(--background)_78%,transparent)_30%,color-mix(in_oklab,var(--background)_82%,transparent)_70%,var(--background)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Our team</SectionLabel>
            <KineticHeading
              text="The people *behind* the work."
              className="mt-6 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]"
            />
          </div>
          <LineReveal
            lines={[`${headcount}+ engineers and designers. Hover anyone to meet them.`]}
            delay={0.35}
            className="max-w-xs text-sm text-muted-foreground"
          />
        </div>

        <div className="mt-14">
          <TeamMosaic members={shown} />
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-foreground/10 pt-8"
        >
          <p className="flex items-center gap-4 text-sm text-muted-foreground">
            {remaining > 0 && (
              <span className="foil-ring relative flex h-12 w-12 items-center justify-center rounded-full bg-background font-mono text-xs text-foreground sm:h-14 sm:w-14">
                +{remaining}
              </span>
            )}
            more across engineering, design and delivery.
          </p>

          <Link
            to="/team"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Meet the team
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
