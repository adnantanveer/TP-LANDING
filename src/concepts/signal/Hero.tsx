import { ScrollWorldMount } from "@/components/ScrollWorldMount";
import type { ScrollWorldConfig } from "@/lib/scrub-engine";
import { heroContent } from "@/concepts/shared/content";

// Must match .concept-signal's --primary in signal.css — the engine takes a
// literal color per section (not a CSS var reference), same constraint the
// live Hero.tsx documents.
const ACCENT = "oklch(0.52 0.21 260)";

const CONFIG: ScrollWorldConfig = {
  nav: false,
  diveScroll: 1.3,
  connScroll: 0.9,
  autoIntroSeconds: 1.5,
  autoIntroRate: 0.5,
  hint: "Scroll to explore",
  runwayVh: 0.3,
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
      introAt: 0.65,
      title: heroContent.forge.title,
      body: heroContent.forge.body,
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
      title: heroContent.core.title,
      body: heroContent.core.body,
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
      title: heroContent.launch.title,
      body: heroContent.launch.body,
    },
  ],
  connectors: [null, null],
};

/** Same scroll-scrubbed video engine as the live hero, same footage and
 * copy (the two things this redesign was asked to keep) — only the theme
 * tokens it reads (--sw-accent etc., via .hero-world's global reskin in
 * styles.css) change, cascading from .concept-signal's cobalt/light tokens. */
export function SignalHero({ autoIntroReady = false }: { autoIntroReady?: boolean }) {
  return <ScrollWorldMount config={CONFIG} className="hero-world" autoIntroReady={autoIntroReady} />;
}
