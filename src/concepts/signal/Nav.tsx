import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { List, X, ArrowUpRight } from "@phosphor-icons/react";
import { Magnetic } from "@/concepts/shared/Magnetic";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
];

/**
 * Corner-pinned chrome instead of a conventional bar (reference: the
 * fixed-corner nav pattern on coronel.design) — logo top-left, links
 * top-right, one persistent magnetic contact orb bottom-right.
 *
 * The logo/links need to read over both the dark hero video AND this
 * theme's light page background. First pass used mix-blend-mode:
 * difference to auto-invert; verified in a real render that it doesn't
 * blend reliably against a position:fixed element here (the logo went
 * near-invisible past the hero). Replaced with the same mechanism the
 * live site's own Nav.tsx already uses successfully: track whether the
 * hero is still on screen and switch color explicitly.
 */
export function SignalNav() {
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
  const chromeTextSoft = overHero ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground";

  return (
    <>
      <div className="fixed left-6 top-6 z-50 md:left-10 md:top-8">
        <a href="#top" className={`font-display text-lg font-semibold tracking-tight transition-colors duration-300 ${chromeText}`}>
          techpotam<span className="text-primary">.</span>
        </a>
      </div>

      <nav className="fixed right-10 top-8 z-50 hidden items-center gap-8 md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className={`text-sm transition-colors duration-300 ${chromeTextSoft}`}>
            {l.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-6 top-6 z-50 flex h-11 w-11 items-center justify-center border md:hidden ${overHero ? "border-white/30 bg-black/20 backdrop-blur-sm" : "border-foreground/20 bg-background"}`}
      >
        {open ? <X className={`h-5 w-5 ${chromeText}`} /> : <List className={`h-5 w-5 ${chromeText}`} />}
      </button>

      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-10">
        <Magnetic strength={22}>
          <a
            href="#contact"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-ember)] transition-transform hover:scale-105 md:h-20 md:w-20"
            aria-label="Contact"
          >
            <span className="flex flex-col items-center gap-0.5 text-[0.6rem] font-medium uppercase tracking-[0.1em]">
              Talk
              <ArrowUpRight weight="bold" className="h-4 w-4" />
            </span>
          </a>
        </Magnetic>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-start justify-center gap-6 bg-background px-10 md:hidden"
          >
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-4xl font-medium">
                {l.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="text-4xl font-medium text-primary">
              Contact
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
