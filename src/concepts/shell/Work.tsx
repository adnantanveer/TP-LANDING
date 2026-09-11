import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ArrowUpRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/primitives";
import { workItems, type WorkItem } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

/** Reference: shankar.io's "$ git shortlog -sn" work-history log — each
 * project is a commit-log row (name, one-line message, expandable detail)
 * instead of a card grid. */
export function ShellWork() {
  return (
    <section id="work" className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <span className="shell-cmd">
          $ <b>git log</b> --oneline --stat
        </span>
        <h2 className="mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,3rem)] font-display uppercase leading-[0.95]">
          Work that speaks for itself.
        </h2>

        <div className="mt-14 flex flex-col">
          {workItems.map((w) => (
            <Reveal key={w.slug}>
              <LogRow item={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LogRow({ item }: { item: WorkItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group border-t border-border py-7 transition-colors duration-300 hover:bg-card/50">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-6 px-2 text-left">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-primary">{item.client}</p>
          <h3 className="mt-2 text-2xl font-display uppercase tracking-tight transition-transform duration-300 group-hover:translate-x-1.5 md:text-3xl">
            {item.title}
          </h3>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.25 }}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 group-hover:border-primary group-hover:text-primary"
        >
          <Plus weight="bold" className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-6 px-2 pt-6 md:grid-cols-[minmax(0,16rem)_1fr]">
              <div className="h-40 w-full overflow-hidden rounded-lg md:h-full">
                <img src={item.img} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-lg border border-border bg-card p-5 font-mono text-sm">
                <p className="text-muted-foreground">{item.caption}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.meta.map((m) => (
                    <span key={m} className="flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-foreground/80">
                      <TechIcon name={m} className="h-3 w-3 shrink-0" />
                      {m}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-primary">
                  <ArrowUpRight weight="bold" className="h-3.5 w-3.5" /> View project
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
