import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

// CMS-configured hrefs come in two shapes: a same-page anchor ("#services")
// meant to scroll within the homepage, or a real route ("#/careers"). A
// bare <a href="#services"> only works while already on the homepage — on
// a HashRouter, the URL hash *is* the route, so clicking it from any other
// page (e.g. a case study) overwrites the whole route with "/services",
// which doesn't exist, landing on the 404 page instead of scrolling
// anywhere.
//
// Routing both shapes through react-router's own <Link> instead makes them
// real client-side navigations from anywhere in the app. The anchor target
// travels as router *state* (`{ scrollTo: "services" }`), not as a second
// URL hash — this is already a HashRouter, so the URL's one hash slot is
// spoken for by the route itself; stacking the anchor on top of that as
// its own hash renders as an ugly (if technically working) "/#/#services".
// State keeps the URL to a single "/#/" and is exactly what App.tsx's
// ScrollToTop reads to perform the actual scroll.
function toLinkProps(href: string): { to: string; state?: { scrollTo: string } } {
  if (href.startsWith("#/")) return { to: href.slice(1) };
  return { to: "/", state: { scrollTo: href.slice(1) } };
}

const API_URL = import.meta.env.VITE_API_URL as string;

type MenuLink = { label: string; href: string; active: boolean };
type MenuContent = { links: MenuLink[]; ctaLabel: string; ctaHref: string; ctaActive: boolean };

const DEFAULT_MENU: MenuContent = {
  links: [
    { href: "#services", label: "Services", active: true },
    { href: "#work", label: "Work", active: true },
    { href: "#precision", label: "Capabilities", active: true },
    { href: "#testimonials", label: "Testimonials", active: true },
  ],
  ctaLabel: "Contact",
  ctaHref: "#contact",
  ctaActive: true,
};

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
export function Nav({ progressAxis = "x" }: { progressAxis?: "x" | "y" }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState<MenuContent>(DEFAULT_MENU);

  useEffect(() => {
    fetch(`${API_URL}/api/content/menu`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMenu(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let hero = document.querySelector<HTMLElement>(".hero-world");
    if (!hero) {
      setVisible(true); // no hero on this page — just show the header
      return;
    }

    let heroBottom = 0;
    const measure = () => {
      heroBottom = hero!.getBoundingClientRect().bottom + window.scrollY;
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

    // The hero is a scroll-world video sequence — its real height is only
    // set once the engine computes the scroll track (ScrollWorldMount's own
    // mount effect, which can run/settle after this one). Without watching
    // for that, heroBottom gets measured against a too-small/zero height and
    // the header shows immediately instead of staying hidden through the hero.
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);

    // Hero.tsx renders a plain placeholder div while its CMS content is
    // loading, then swaps in ScrollWorldMount's own div once it resolves —
    // a brand-new .hero-world node, not a resize of the old one. Without
    // retargeting, the ResizeObserver above keeps watching the now-detached
    // placeholder (whose rect reads as all-zero), which made heroBottom
    // collapse to ~0 and the header appear the moment the page loaded.
    const mo = new MutationObserver(() => {
      const next = document.querySelector<HTMLElement>(".hero-world");
      if (next && next !== hero) {
        ro.disconnect();
        hero = next;
        ro.observe(hero);
        measure();
        update();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  const activeLinks = menu.links.filter((l) => l.active);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -18 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <div className="flex items-center justify-between bg-gradient-to-b from-background/90 to-background/50 px-6 py-5 backdrop-blur-lg md:px-16">
          <Link {...toLinkProps("#top")} className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-tight">
            techpotam<span className="text-primary">.</span>
          </Link>
          <nav className="hidden gap-2 rounded-full border border-border bg-foreground/5 p-1.5 backdrop-blur-md md:flex">
            {activeLinks.map((l) => (
              <Link
                key={l.href}
                {...toLinkProps(l.href)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-[0.01em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {menu.ctaActive && (
            <Link
              {...toLinkProps(menu.ctaHref)}
              className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors hover:border-primary hover:text-primary"
            >
              {menu.ctaLabel}
            </Link>
          )}
        </div>
        {progressAxis === "x" && (
          <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-primary" />
        )}
      </motion.header>

      {/* Rendered as a sibling of <header>, not nested inside it: the header
          animates its own `transform` (via the `y` in `animate`), which would
          turn it into a containing block for any `position: fixed`
          descendant — the bar would then track the header's small box
          instead of running the full viewport height. */}
      {progressAxis === "y" && <ZigzagProgress progress={progress} />}
    </>
  );
}

/** A thin zigzag rail, top-to-bottom on the left edge, whose completed
 * portion (from the top down) draws in as the page scrolls — used instead
 * of Nav's default straight horizontal progress bar on routes that ask
 * for progressAxis="y" (see CaseStudy.tsx). The zigzag itself is generated
 * from the container's actual measured height so it always reaches exactly
 * from top to bottom regardless of viewport size. */
function ZigzagProgress({ progress }: { progress: MotionValue<number> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const path = useMemo(() => {
    if (!height) return "";
    const step = 20; // px of vertical travel per zigzag half-cycle
    const xs = [2, 10]; // sharp left/right points within a 12-wide viewBox
    const segs = Math.ceil(height / step);
    let d = `M ${xs[0]} 0`;
    for (let i = 1; i <= segs; i++) {
      d += ` L ${xs[i % 2]} ${Math.min(i * step, height)}`;
    }
    return d;
  }, [height]);

  // pathLength=1 normalizes the zigzag's actual (longer, diagonal) length to
  // 0..1, so the dashoffset can be driven directly by scroll progress.
  const dashoffset = useTransform(progress, (p) => 1 - p);

  return (
    <div ref={containerRef} className="fixed left-4 top-20 bottom-4 z-50 w-3">
      <svg width="12" height="100%" viewBox={`0 0 12 ${height || 1}`} preserveAspectRatio="none" className="h-full w-full">
        <path
          d={path}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity={0.18}
          strokeWidth={1}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <motion.path
          d={path}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: dashoffset }}
        />
      </svg>
    </div>
  );
}
