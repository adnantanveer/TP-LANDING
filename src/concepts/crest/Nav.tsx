import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X, ArrowUpRight } from "@phosphor-icons/react";
import { Magnetic } from "@/concepts/shared/Magnetic";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#stack", label: "Stack" },
];

/** The nav is hidden entirely over the hero — a clean, chrome-free first
 * viewport for the cinematic video — and fades/slides in once the hero has
 * scrolled past. From there it's the same hero-legibility approach as
 * every other concept: track intersection with the shared dark "chapters"
 * and swap text/backdrop tone. Crest has several of these further down
 * (.crest-spotlight-chapter for Statement, .crest-dark-chapter for Process
 * and Stats) that the shared pattern doesn't know about on its own, so
 * every one of them is observed and any single one intersecting the nav's
 * own band is enough to call it a dark zone. */
export function CrestNav() {
  const [open, setOpen] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const hero = document.querySelector(".hero-world");
    const zones = document.querySelectorAll(".hero-world, .crest-spotlight-chapter, .crest-dark-chapter");
    if (zones.length === 0) {
      setOverDark(false);
      setOverHero(false);
      return;
    }
    const intersecting = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        }
        setOverDark(intersecting.size > 0);
        setOverHero(hero !== null && intersecting.has(hero));
      },
      // Top-heavy rootMargin: only the thin band the nav itself occupies
      // (roughly y:64-135px) counts as "intersecting", not the whole
      // viewport. With three separate dark chapters now on this page, a
      // -0px bottom margin let a dark section merely peeking in at the very
      // BOTTOM of the screen (nowhere near the nav) flip the nav dark while
      // it was still visually sitting over a light section up top.
      { rootMargin: "-64px 0px -85% 0px" },
    );
    zones.forEach((zone) => io.observe(zone));
    return () => io.disconnect();
  }, []);

  const chromeText = overDark ? "text-white" : "text-foreground";

  return (
    <motion.header
      animate={{ opacity: overHero ? 0 : 1, y: overHero ? -16 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: overHero ? "none" : "auto" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* A permanent frosted panel behind the whole bar — not just a text-
          color swap keyed to "is this whole section dark or light". Craft.tsx
          (and any future split section) puts a dark photo on one half of the
          viewport and a light background on the other, both under the same
          nav band at once; a single overDark boolean can only guess right for
          one half. The blur+tint here gives every letter a consistent
          contrast cushion regardless of what's directly behind it, so a
          wrong guess is no longer illegible, just slightly less ideal. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 backdrop-blur-md transition-colors duration-300 ${overDark ? "bg-black/25" : "bg-white/55"}`}
      />
      <div className="relative flex items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className={`font-display text-lg font-semibold tracking-tight transition-colors duration-300 ${chromeText}`}>
          Techpotam
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 ${overDark ? "text-white/75 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <Magnetic strength={10} className="hidden md:inline-block">
          <a href="#contact" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Start a project <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
          </a>
        </Magnetic>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border md:hidden ${overDark ? "border-white/30 bg-black/20 text-white backdrop-blur-sm" : "border-border text-foreground"}`}
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
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-foreground/80">
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="text-sm text-primary">
                Start a project
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
