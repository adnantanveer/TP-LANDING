import { motion } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { capabilities } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function SurgeCapabilities() {
  return (
    <section id="capabilities" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-xl text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.05]">
          Everything a UK team needs, <span className="surge-gradient-text">under one roof</span>.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full rounded-[2rem] border border-border bg-card p-7 shadow-[var(--shadow-deep)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CapabilityIcon icon={c.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
