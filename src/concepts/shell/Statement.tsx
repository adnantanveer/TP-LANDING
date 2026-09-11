import { motion } from "motion/react";
import { TextScramble } from "@/concepts/shared/TextScramble";

/** Reference: shankar.io's "$ whoami" bio block, decode-in name. */
export function ShellStatement() {
  return (
    <section className="relative border-b border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <span className="shell-cmd">
          $ <b>whoami</b>
        </span>

        <h1 className="mt-6 text-[clamp(2.4rem,8vw,6rem)] font-display uppercase leading-[0.92] tracking-tight">
          <TextScramble text="Techpotam Studio" />
          <span className="shell-cursor ml-2 inline-block w-[0.5em] bg-primary align-middle" aria-hidden />
        </h1>

        <div className="mt-3 flex items-center gap-3">
          <span className="h-px w-8 bg-primary" />
          <p className="font-mono text-sm text-muted-foreground">Noida, India / UK-facing</p>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 max-w-2xl text-[clamp(1.2rem,2.6vw,1.7rem)] leading-[1.4] text-foreground/90"
        >
          A product-focused engineering studio building and shipping technical products from ideation through
          launch and <span className="text-primary">growth</span>.
        </motion.p>
      </div>
    </section>
  );
}
