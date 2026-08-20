import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import techpotamIcon from "./techpotam-icon.png";

/**
 * The one persistent header for the whole page — anchors through the actual
 * sections below, not just the hero's own internal scroll-world scenes
 * (which have no meaningful jump target once you're past the hero).
 *
 * Hidden for the entire hero: the hero is itself a full scroll-world video
 * sequence with its own chrome (route dots, per-scene copy), and a header
 * sitting on top of that for the whole scroll fights it. The header fades
 * in only once the hero is fully scrolled past — i.e. once the next section
 * has started entering — and fades back out if the user scrolls back up
 * into the hero, rather than a one-time reveal.
 */
export function Nav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-world");
    if (!hero) {
      setVisible(true); // no hero on this page — just show the header
      return;
    }

    let heroBottom = 0;
    const measure = () => {
      heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY >= heroBottom);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // The hero is a scroll-world video sequence — its real height is only
    // set once the engine computes the scroll track (ScrollWorldMount's own
    // mount effect, which can run/settle after this one). Without watching
    // for that, heroBottom gets measured against a too-small/zero height and
    // the header shows immediately instead of staying hidden through the hero.
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  const links = [
    { href: "#services", label: "Services" },
    { href: "#work", label: "Work" },
    { href: "#precision", label: "Capabilities" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -18 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="flex items-center justify-between bg-gradient-to-b from-background/90 to-background/50 px-6 py-5 backdrop-blur-lg md:px-16">
        <a href="#top" className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-tight">
          <img src={techpotamIcon} alt="" width={22} height={27} className="h-[27px] w-auto" />
          techpotam<span className="text-primary">.</span>
        </a>
        <nav className="hidden gap-2 rounded-full border border-border bg-foreground/5 p-1.5 backdrop-blur-md md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-[0.01em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors hover:border-primary hover:text-primary"
        >
          Contact
        </a>
      </div>
      <motion.div style={{ scaleX }} className="h-px origin-left bg-primary" />
    </motion.header>
  );
}
