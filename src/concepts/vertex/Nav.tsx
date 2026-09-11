import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X } from "@phosphor-icons/react";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
];

export function VertexNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/20 bg-background/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="font-display text-base font-bold uppercase tracking-[0.08em]">
          techpotam<span className="text-primary">/</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden border border-primary bg-primary/10 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:inline-flex"
        >
          Contact
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center border border-primary/40 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-primary/20 md:hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-6">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-mono text-sm uppercase tracking-[0.2em] text-foreground/80">
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="font-mono text-sm uppercase tracking-[0.2em] text-primary">
                Contact
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
