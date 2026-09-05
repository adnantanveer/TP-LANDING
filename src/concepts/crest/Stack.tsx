import { motion } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

const GROUPS = ["Frontend", "Backend", "Cloud", "Data & AI"];

export function CrestStack() {
  return (
    <section id="stack" className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <span className="crest-eyebrow">Technology</span>
          <h2 className="mt-5 max-w-xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.05]">
            A full-spectrum technology stack.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((group, gi) => (
            <Reveal key={group} delay={gi * 0.05}>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{group}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {techStack
                    .filter((t) => t.group === group)
                    .map((t) => (
                      <motion.div
                        key={t.name}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        title={t.blurb}
                        className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-colors duration-300 hover:border-primary/50"
                      >
                        <TechIcon name={t.name} className="h-4 w-4 shrink-0 text-foreground/60 transition-colors duration-300 group-hover:text-primary" />
                        <span className="text-sm">{t.name}</span>
                      </motion.div>
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
