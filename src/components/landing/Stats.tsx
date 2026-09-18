import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Code, Briefcase, Users, Clock, Sparkle, Smiley } from "@phosphor-icons/react";
import { Reveal, SectionLabel } from "./primitives";

/**
 * "By the numbers" — pulled in from Crest's own Stats.tsx, same layout and
 * count-up motion, re-themed onto this homepage's own warm ember
 * `.chapter-glow-bg` instead of Crest's violet dark-chapter + photograph.
 *
 * Every figure here is a marketing round number the client gave directly
 * (a "+" claim, not an exact count) — Crest ships the equivalent as
 * explicit unfilled "XX+" placeholders since a concept has no real client
 * figures to put there; this is the real site, so they're filled in with
 * the actual numbers instead of left blank. Earlier drafts wired
 * "Engineers on the team" and "Technologies in active use" to live CMS
 * counts, but the client's real figures for both are well above what's
 * individually profiled on the team/stack sections (150+ engineers vs. a
 * handful listed, 40+ technologies vs. the curated stack grid) — a
 * broader "total bench" claim than those sections show, not a
 * discrepancy to reconcile.
 *
 * Client satisfaction is the one non-"+" figure here on purpose — every
 * other stat is a scale/output claim (how much was built), this one's a
 * quality/trust claim (how it landed), and a percentage reads as visibly
 * a different kind of number rather than just another count.
 */
const STATS = [
  { value: 100, suffix: "+", label: "Projects delivered", icon: Briefcase },
  { value: 150, suffix: "+", label: "Engineers on the team", icon: Users },
  { value: 40, suffix: "+", label: "Technologies in active use", icon: Code },
  { value: 10, suffix: "+", label: "AI deployments shipped", icon: Sparkle },
  { value: 7500, suffix: "+", label: "Engineering hours delivered", icon: Clock },
  { value: 98, suffix: "%", label: "Client satisfaction rate", icon: Smiley },
];

export function Stats() {
  return (
    <section className="chapter-glow-bg relative overflow-hidden py-20 md:py-28">
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionLabel>By the numbers</SectionLabel>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div>
                <s.icon weight="light" className="h-7 w-7 text-primary" />
                <p className="mt-4 font-display text-[clamp(2.4rem,5.5vw,3.6rem)] font-semibold leading-none text-foreground">
                  <CountUp value={s.value} />
                  {s.suffix}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const duration = 1100;
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, value]);

  return <span ref={ref}>{display}</span>;
}
