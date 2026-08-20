import { ScrollWorldMount } from "@/components/ScrollWorldMount";
import type { ScrollWorldConfig } from "@/lib/scrub-engine";

/**
 * Scroll-world hero: a pinned, scroll-scrubbed flight through a single
 * continuous shot (public/assets/vid/hero-forge → hero-core → hero-launch —
 * split from one source clip at 10s/19.5s, the two boundaries closest to the
 * midpoints between its three "beats" at ~7s/13s/26s). Because all three
 * pieces come from one continuous take rather than separate AI-rendered
 * scenes, the cuts between them are already frame-perfect — no connector
 * clips or frame-matching needed, unlike the earlier four-scene hero.
 *
 * `accent` is set explicitly (not omitted) to the theme's --primary value:
 * the engine does `el.style.setProperty('--sw-accent', s.accent || '')`
 * per scene/copy/dot element, and an inline custom property set to an empty
 * string is a real (invalid-at-use) value, not "unset" — it would shadow
 * the `.sw-root` fallback instead of falling through to it.
 *
 * No `brand`/`cta`/`nav` here: the engine's own topbar (with its "jump to
 * this hero scene" pills) would otherwise persist as a second, competing
 * header for the entire page below the hero. `<Nav />` is the one real site
 * header, anchored to the page's actual sections — see .hero-world
 * .sw-topbar in styles.css, which hides the engine's topbar entirely.
 *
 * Copy below is a first draft written to match what's on screen at each
 * beat (circuit-board sparks / crystal-core sparks / satellite in space) —
 * swap title/body for real copy whenever you have it. Deliberately just a
 * heading + one line of body text, no eyebrow/tags/CTA/card panel — see
 * the .sw-copy override in styles.css for the "no card" treatment.
 */
const ACCENT = "oklch(0.76 0.16 62)"; // must match --primary in styles.css

const HERO_CONFIG: ScrollWorldConfig = {
  nav: false,
  diveScroll: 1.3,
  connScroll: 0.9,
  autoIntroSeconds: 1.5,
  autoIntroRate: 0.5, // slow motion
  hint: "Scroll to dive in deep",
  sections: [
    {
      id: "forge",
      accent: ACCENT,
      label: "The Forge",
      still: "/assets/hero-forge.jpg",
      clip: "/assets/vid/hero-forge.mp4",
      clipMobile: "/assets/vid/hero-forge-m.mp4",
      scroll: 2.0,
      linger: 0.35,
      // scroll position 0 now starts at video-time 1.5s (the auto-intro's
      // own end point, via introFloor), not true 0 — 0.65 (not 0.7) is
      // recalibrated so the copy still lands around the ~7s beat from there
      introAt: 0.65,
      title: "Built in the forge, shipped to production.",
      body: "From first commit to a live product in your users' hands — clean architecture, fast iteration, dependable delivery.",
    },
    {
      id: "core",
      accent: ACCENT,
      label: "The Core",
      still: "/assets/hero-core.jpg",
      clip: "/assets/vid/hero-core.mp4",
      clipMobile: "/assets/vid/hero-core-m.mp4",
      scroll: 1.8,
      linger: 0.3,
      title: "Every detail, considered.",
      body: "From the first keystroke to the silicon it runs on, nothing ships until it's right.",
    },
    {
      id: "launch",
      accent: ACCENT,
      label: "Launch",
      still: "/assets/hero-launch.jpg",
      clip: "/assets/vid/hero-launch.mp4",
      clipMobile: "/assets/vid/hero-launch-m.mp4",
      scroll: 2.4,
      linger: 0.4,
      title: "From first line to launch.",
      body: "Deployed on infrastructure that holds up under real-world load — monitored, hardened, and ready from day one.",
    },
  ],
  connectors: [null, null],
};

export function Hero({ autoIntroReady = false }: { autoIntroReady?: boolean }) {
  return <ScrollWorldMount config={HERO_CONFIG} className="hero-world" autoIntroReady={autoIntroReady} />;
}
