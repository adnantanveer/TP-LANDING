import { ScrollWorldMount } from "@/components/ScrollWorldMount";
import type { ScrollWorldConfig } from "@/lib/scrub-engine";
import { heroContent } from "@/concepts/shared/content";

// Must match .concept-vantage's --primary in vantage.css.
const ACCENT = "oklch(0.74 0.13 220)";

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

export function VantageHero({ autoIntroReady = false }: { autoIntroReady?: boolean }) {
  return <ScrollWorldMount config={CONFIG} className="hero-world" autoIntroReady={autoIntroReady} />;
}
