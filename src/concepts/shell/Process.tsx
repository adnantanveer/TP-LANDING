import { motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import { processSteps } from "@/concepts/shared/content";

/** The delivery model presented as an actual mock terminal session — each
 * step "runs" in sequence with a completion check, rather than a card
 * grid. One consistent voice with the rest of this concept's CLI motif. */
export function ShellProcess() {
  return (
    <section id="process" className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <span className="shell-cmd">
          $ <b>./deploy.sh</b>
        </span>
        <h2 className="mt-5 max-w-xl text-[clamp(1.9rem,4.6vw,3rem)] font-display uppercase leading-[0.95]">
          A delivery model built for certainty.
        </h2>

        <div className="mt-12 overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">delivery.sh — techpotam</span>
          </div>

          <div className="space-y-6 p-6 font-mono text-sm md:p-8">
            {processSteps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.4, delay: i * 0.18 }}
                whileHover={{ x: 4 }}
                className="-mx-3 rounded-md px-3 py-1 transition-colors duration-200 hover:bg-background/60"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <span className="text-primary">$</span>
                  <span>run {s.title.toLowerCase()}</span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.18 + 0.3, duration: 0.3 }}
                    className="ml-auto flex items-center gap-1.5 text-xs text-primary"
                  >
                    <CheckCircle weight="fill" className="h-4 w-4" /> done
                  </motion.span>
                </div>
                <p className="mt-2 pl-5 text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
