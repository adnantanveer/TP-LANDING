import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X } from "@phosphor-icons/react";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
];

/** Same hero-legibility approach as Signal/Air/Shell: track intersection
 * with .hero-world and swap white/foreground explicitly. */
export function IndexNav() {
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
        <a href="#top" className={`font-display text-lg uppercase tracking-tight transition-colors duration-300 ${chromeText}`}>
          Techpotam<span className="text-primary">®</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${overHero ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className={`hidden items-center gap-1 border px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors duration-300 hover:border-primary hover:text-primary md:inline-flex ${overHero ? "border-white/60 text-white" : "border-foreground/60 text-foreground"}`}
        >
          Let&apos;s talk →
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center border md:hidden ${overHero ? "border-white/30 bg-black/20 text-white backdrop-blur-sm" : "border-border text-foreground"}`}
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
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm uppercase tracking-[0.15em] text-foreground/80">
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="text-sm uppercase tracking-[0.15em] text-primary">
                Let&apos;s talk
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
