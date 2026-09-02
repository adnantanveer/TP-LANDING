import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { List, X, ArrowUpRight } from "@phosphor-icons/react";
import { Magnetic } from "@/concepts/shared/Magnetic";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#testimonials", label: "Clients" },
];

/** Floating glass capsule nav, centered — a different chrome family from
 * Signal's full-width flat bar, fitting Vantage's bento/glass language. */
export function VantageNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-5 z-50 px-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full border border-border bg-card/70 py-2.5 pl-5 pr-2.5 backdrop-blur-xl">
        <a href="#top" className="font-display text-base font-semibold tracking-tight">
          techpotam<span className="text-primary">.</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <Magnetic strength={10} className="hidden md:inline-block">
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Contact <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
          </a>
        </Magnetic>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 md:hidden"
        >
          {open ? <X className="h-4.5 w-4.5" /> : <List className="h-4.5 w-4.5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-3xl rounded-3xl border border-border bg-card/90 p-6 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-4">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="text-base text-foreground/80">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" onClick={() => setOpen(false)} className="text-base font-medium text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
