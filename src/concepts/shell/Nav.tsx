import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X, ArrowUpRight } from "@phosphor-icons/react";
import { Magnetic } from "@/concepts/shared/Magnetic";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
];

/** Same hero-legibility approach as Signal/Air: the nav sits over the
 * shared dark video hero for the first viewport, then a light "Shell"
 * background beneath — track intersection with .hero-world and swap. */
export function ShellNav() {
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const hero = document.querySelector(".hero-world");
    if (!hero) {
      setOverHero(false);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const chromeText = overHero ? "text-white" : "text-foreground";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className={`font-mono text-sm uppercase tracking-wide transition-colors duration-300 ${chromeText}`}>
          techpotam<span className="text-primary">@</span>studio
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-md px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors duration-300 ${overHero ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <Magnetic strength={10} className="hidden md:inline-block">
          <a href="#contact" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            Get in touch <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
          </a>
        </Magnetic>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-md border md:hidden ${overHero ? "border-white/30 bg-black/20 text-white backdrop-blur-sm" : "border-border text-foreground"}`}
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
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-6">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-mono text-sm uppercase tracking-wide text-foreground/80">
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="font-mono text-sm uppercase tracking-wide text-primary">
                Get in touch
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
