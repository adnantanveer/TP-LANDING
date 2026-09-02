import { motion } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

const GROUPS = ["Frontend", "Backend", "Cloud", "Data & AI"];

/**
 * Reference: shankar.io's "Core Skills" dependency-graph visual — nodes
 * branching off a vertical spine per category, on a dot-grid backdrop,
 * instead of a plain card grid. A simplified, achievable read of that
 * idea: each column IS the spine (border-left), each skill node connects
 * to it with a short horizontal nub, lighting up amber on hover.
 */
export function ShellStack() {
  return (
    <section id="stack" className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <span className="shell-cmd">
          $ <b>skill</b> --graph ./core
        </span>
        <h2 className="mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,3rem)] font-display uppercase leading-[0.95]">
          A full-spectrum technology stack.
        </h2>
      </div>

      <div className="shell-graph-grid relative mt-14 border-y border-border py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-14 px-6 md:grid-cols-4">
          {GROUPS.map((group, gi) => (
            <Reveal key={group} delay={gi * 0.06}>
              <div className="shell-graph-column relative border-l-2 border-dashed border-border pl-6 transition-colors duration-300">
                <p className="mb-6 font-mono text-xs uppercase tracking-wide text-muted-foreground">{group}</p>
                <div className="space-y-4">
                  {techStack
                    .filter((t) => t.group === group)
                    .map((t) => (
                      <Node key={t.name} name={t.name} blurb={t.blurb} />
                    ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Node({ name, blurb }: { name: string; blurb: string }) {
  return (
    <div className="shell-graph-node group relative">
      <span className="absolute -left-6 top-1/2 h-px w-4 bg-border transition-colors duration-300 group-hover:bg-primary" aria-hidden />
      <motion.div
        whileHover={{ x: 4, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        title={blurb}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 transition-colors duration-300 group-hover:border-primary group-hover:shadow-[0_0_0_1px_var(--primary),0_8px_20px_-8px_var(--primary)]"
      >
        <TechIcon name={name} className="h-4 w-4 shrink-0 text-foreground/60 transition-colors duration-300 group-hover:text-primary" />
        <span className="font-mono text-xs text-foreground">{name}</span>
      </motion.div>
    </div>
  );
}
