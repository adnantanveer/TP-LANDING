import { motion, useScroll, useSpring } from "motion/react";
import techpotamIcon from "./techpotam-icon.png";

/**
 * The one persistent header for the whole page — anchors through the actual
 * sections below, not just the hero's own internal scroll-world scenes
 * (which have no meaningful jump target once you're past the hero).
 */
export function Nav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const links = [
    { href: "#services", label: "Services" },
    { href: "#work", label: "Work" },
    { href: "#precision", label: "Capabilities" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
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
    </header>
  );
}
