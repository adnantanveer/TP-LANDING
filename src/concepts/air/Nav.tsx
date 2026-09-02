import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Plain text, no backdrop — deliberately, this concept's whole premise is
 * restraint. But that text now sits over the same dark video hero every
 * concept shares, and Air's foreground is near-black: unreadable over
 * dark footage. Same fix as Signal's Nav (verified in a real render there
 * that mix-blend-mode: difference doesn't blend reliably against a
 * position:fixed element) — track whether the hero is still on screen and
 * switch to white explicitly instead.
 */
export function AirNav() {
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
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-6 py-8 md:px-12">
        <a href="#top" className={`text-sm font-medium tracking-tight transition-colors duration-300 ${chromeText}`}>
          Techpotam
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`text-sm transition-colors duration-300 ${chromeTextSoft}`}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background"
          >
            {[
              { href: "#capabilities", label: "Capabilities" },
              { href: "#work", label: "Work" },
              { href: "#contact", label: "Contact" },
            ].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-3xl font-medium">
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
