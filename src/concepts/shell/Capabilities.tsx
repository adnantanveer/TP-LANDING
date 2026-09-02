import { motion } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { capabilities } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function ShellCapabilities() {
  return (
    <section id="capabilities" className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <span className="shell-cmd">
          $ <b>ls</b> ./capabilities
        </span>
        <h2 className="mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,3rem)] font-display uppercase leading-[0.95]">
          Everything a UK team needs, under one roof.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.04}>
              <div className="group h-full bg-background p-7 transition-colors hover:bg-card">
                <div className="flex items-center justify-between">
                  <motion.div whileHover={{ scale: 1.15, rotate: -6 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                    <CapabilityIcon icon={c.icon} className="h-7 w-7 text-primary" />
                  </motion.div>
                  <span className="font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
