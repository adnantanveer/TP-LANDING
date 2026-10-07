import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { KineticHeading, LineReveal, SectionLabel, initials } from "./primitives";
import { TeamFlipCard, type TeamMember } from "./TeamFlipCard";

const API_URL = import.meta.env.VITE_API_URL as string;

const KEY_COUNT = 4;
const MOSAIC_MAX = 10;
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
 * Leads with the key members (isKeyMember when the CMS sets it, else the
 * first four by order) as large flip cards, then suggests the real scale
 * of the bench with a mosaic of the wider team's portraits and a "+N"
 * count that hands off to the full grid. Sits on a moody architectural
 * photograph (public/assets/stock/team-bg-*) that drifts against the
 * scroll under a heavy dark wash — texture, not a picture.
 */
export function TeamSection() {
  const reduce = useReducedMotion();
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [headcount, setHeadcount] = useState(DEFAULT_HEADCOUNT);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  useEffect(() => {
    fetch(`${API_URL}/api/content/team`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.teamMembers?.length) setMembers(data.teamMembers);
        if (typeof data?.headcount === "number") setHeadcount(data.headcount);
      })
      .catch(() => {});
  }, []);

  if (members.length === 0) return null;

  const sorted = members.slice().sort((a, b) => a.order - b.order);
  const flagged = sorted.filter((m) => m.isKeyMember);
  const key = (flagged.length > 0 ? flagged : sorted).slice(0, KEY_COUNT);
  const keyIds = new Set(key.map((m) => m.id));
  const wider = sorted.filter((m) => !keyIds.has(m.id)).slice(0, MOSAIC_MAX);
  const remaining = Math.max(0, headcount - key.length - wider.length);

  return (
    <section id="team" ref={ref} className="relative overflow-hidden py-28 md:py-36">
      {/* Backdrop photograph, oversized for the parallax drift. */}
      <motion.div style={{ y: bgY }} className="absolute -inset-y-[10%] inset-x-0" aria-hidden>
        <img
          src="/assets/stock/team-bg-3.jpg"
          alt=""
          width={1600}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover opacity-50 saturate-[0.4]"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklab,var(--background)_78%,transparent)_30%,color-mix(in_oklab,var(--background)_82%,transparent)_70%,var(--background)_100%)]"
        aria-hidden
      />

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
            lines={[`${headcount}+ engineers and designers. These are the ones you'll talk to.`]}
            delay={0.35}
            className="max-w-xs text-sm text-muted-foreground"
          />
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {key.map((m, i) => (
            <div key={m.id} className="h-72 w-full sm:h-80">
              <TeamCard {...m} index={i} />
            </div>
          ))}
        </div>

        {/* Wider team mosaic. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-foreground/10 pt-8"
        >
          <div className="flex items-center">
            <ul className="flex -space-x-3">
              {wider.map((m, i) => (
                <li key={m.id} className="relative" style={{ zIndex: wider.length - i }}>
                  <MosaicAvatar {...m} />
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <span className="foil-ring relative z-0 -ml-3 flex h-12 w-12 items-center justify-center rounded-full bg-background font-mono text-xs text-foreground sm:h-14 sm:w-14">
                +{remaining}
              </span>
            )}
            <p className="ml-5 hidden max-w-[14rem] text-sm text-muted-foreground sm:block">
              across engineering, design and delivery.
            </p>
          </div>

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

function MosaicAvatar({ name, role, photo }: TeamMember) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span
      title={role ? `${name}, ${role}` : name}
      className="foil-ring relative block h-12 w-12 overflow-hidden rounded-full bg-card sm:h-14 sm:w-14"
    >
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.65rem] text-foreground/70">
        {initials(name)}
      </span>
      {photo && (
        <img
          src={photo}
          alt={name}
          width={800}
          height={800}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}

// Entrance: a soft fade and short rise from blur to sharp, each card a
// beat after the last — no rotation, no 3D, no per-card directions.
function TeamCard({ index, ...member }: TeamMember & { index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      <TeamFlipCard {...member} />
    </motion.article>
  );
}
