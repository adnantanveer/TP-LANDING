import { ScrollWorldMount } from "@/components/ScrollWorldMount";
import type { ScrollWorldConfig } from "@/lib/scrub-engine";

/**
 * Scroll-world hero: a pinned, scroll-scrubbed video flight through four
 * scenes (ported from LandingPageUK's `mountScrollWorld()` hero config,
 * reusing its pre-rendered clips as-is — reskinned to the amber theme via
 * the `.sw-root` CSS overrides in styles.css, not by touching this config).
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
 */
const ACCENT = "oklch(0.76 0.16 62)"; // must match --primary in styles.css

const HERO_CONFIG: ScrollWorldConfig = {
  nav: false,
  diveScroll: 1.3,
  connScroll: 0.9,
  sections: [
    {
      id: "product",
      accent: ACCENT,
      label: "The Product",
      still: "/assets/product.jpg",
      clip: "/assets/vid/product.mp4",
      clipMobile: "/assets/vid/product-m.mp4",
      scroll: 2.2,
      linger: 0.4,
      eyebrow: "Product Engineering",
      title: "We build software that just works.",
      body: "From first commit to a live product in your users' hands. Clean architecture, fast iteration, dependable delivery.",
      tags: ["Web & Mobile", "Cloud-native", "UK-based team"],
    },
    {
      id: "process",
      accent: ACCENT,
      label: "How We Work",
      still: "/assets/process.jpg",
      clip: "/assets/vid/process.mp4",
      clipMobile: "/assets/vid/process-m.mp4",
      scroll: 2.0,
      linger: 0.35,
      eyebrow: "How We Work",
      title: "Every build starts with a plan.",
      body: "We map the system before we write a line of code, so what ships matches exactly what you asked for.",
      tags: ["Discovery", "Design", "Delivery"],
    },
    {
      id: "precision",
      accent: ACCENT,
      label: "Precision Engineering",
      still: "/assets/precision.jpg",
      clip: "/assets/vid/precision.mp4",
      clipMobile: "/assets/vid/precision-m.mp4",
      scroll: 2.0,
      linger: 0.35,
      eyebrow: "Precision Engineering",
      title: "Every detail, considered.",
      body: "From the first keystroke to the silicon it runs on, nothing ships until it's right.",
      tags: ["Code review", "Performance budget", "Security-first"],
    },
    {
      id: "team",
      accent: ACCENT,
      label: "One Team",
      still: "/assets/team.jpg",
      clip: "/assets/vid/team.mp4",
      clipMobile: "/assets/vid/team-m.mp4",
      scroll: 2.4,
      linger: 0.4,
      eyebrow: "One Team",
      title: "Not a vendor. A team that sits with you.",
      body: "You'll talk to the people writing the code, not an account manager relaying messages. From kickoff to the day it ships.",
      tags: ["Weekly demos", "Direct Slack access", "Decisions made with you"],
      cta: {
        primary: { label: "Book a call", href: "mailto:hello@techpotam.com" },
        secondary: { label: "Our approach", href: "#process" },
      },
    },
  ],
  connectors: [null, null, null],
};

export function Hero() {
  return <ScrollWorldMount config={HERO_CONFIG} className="hero-world" />;
}
