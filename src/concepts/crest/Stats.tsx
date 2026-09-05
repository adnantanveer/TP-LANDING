import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Code, Globe, ListChecks, CalendarBlank, RocketLaunch } from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/primitives";
import { techStack, workItems, processSteps } from "@/concepts/shared/content";

// Every number here is counted straight from shared/content.ts at build
// time (array lengths), not written by hand — if a concept elsewhere in
// this app adds a technology or a case study, this strip updates itself
// rather than drifting out of sync with a hardcoded claim.
const STATS = [
  { value: techStack.length, label: "Technologies in active use", icon: Code },
  { value: workItems.length, label: "Sectors delivered into", icon: Globe },
  { value: processSteps.length, label: "Steps, kickoff to launch", icon: ListChecks },
];

// Deliberately NOT real numbers — "years in business" and "projects
// shipped" aren't derivable from anything in shared/content.ts, and
// guessing a figure like "15+ years" risks publishing a false, checkable
// claim. Rendered as literal placeholders (outline icon, "XX", an explicit
// confirm-before-shipping note) specifically so this can't be mistaken for
// real data if this ships as-is.
const PLACEHOLDER_STATS = [
  { label: "Years delivering software", icon: CalendarBlank },
  { label: "Projects shipped", icon: RocketLaunch },
];

/** A second dark "chapter" (see Statement.tsx for the first) — the same
 * real smoke photograph from Craft.tsx's neighbourhood but a different
 * shot, color-graded into the page's violet, sitting behind the numbers at
 * low opacity so it reads as atmosphere rather than competing with them. */
export function CrestStats() {
  return (
    <section className="crest-dark-chapter relative overflow-hidden border-y border-border py-20 md:py-28">
      <img
        src="/assets/crest-stats-bg.jpg"
        alt=""
        aria-hidden
        className="crest-photo-grade absolute inset-y-0 left-0 h-full w-full object-cover opacity-60 md:w-2/3"
      />
      <div className="crest-photo-tint absolute inset-y-0 left-0 h-full w-full md:w-2/3" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-background" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <span className="crest-eyebrow">By the numbers</span>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div>
                <s.icon weight="light" className="h-7 w-7 text-primary-glow" />
                <p className="mt-4 font-display text-[clamp(3rem,7vw,5rem)] font-semibold leading-none text-foreground">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-background/30 p-6 backdrop-blur-sm sm:p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6">
              {PLACEHOLDER_STATS.map((s) => (
                <div key={s.label}>
                  <s.icon weight="light" className="h-6 w-6 text-muted-foreground/60" />
                  <p className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3rem)] font-semibold leading-none text-muted-foreground/60">
                    XX<span className="text-primary-glow/60">+</span>
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground/70">
              Placeholders — swap in your real figures before this ships. Not shown as live claims.
            </p>
          </div>
        </Reveal>
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

  return <span ref={ref}>{String(display).padStart(2, "0")}</span>;
}
