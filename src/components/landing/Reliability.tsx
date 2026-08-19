import { ScrollWorldMount } from "@/components/ScrollWorldMount";
import type { ScrollWorldConfig } from "@/lib/scrub-engine";

const ACCENT = "oklch(0.76 0.16 62)"; // must match --primary in styles.css

/**
 * Second, embedded scroll-world instance mounted at the bottom of the page
 * (ported from LandingPageUK's "infra-world" — nav/atmosphere off, mounted
 * as a raw sibling rather than a full second hero). `.sw-embedded` (applied
 * via `embedded` prop) hides the topbar/route-rail/hint/scrollbar so it
 * reads as one self-contained scene, not a duplicate header.
 */
const RELIABILITY_CONFIG: ScrollWorldConfig = {
  nav: false,
  atmosphere: false,
  sections: [
    {
      id: "infra",
      label: "Reliability",
      accent: ACCENT,
      still: "/assets/infra-scene.jpg",
      clip: "/assets/vid/infra.mp4",
      clipMobile: "/assets/vid/infra-m.mp4",
      scroll: 2.2,
      linger: 0.4,
      eyebrow: "Reliability",
      title: "Enterprise-grade infrastructure. Every time.",
      body: "Every build is engineered for uptime, monitored continuously, and hardened before it ever reaches production.",
      tags: ["Cloud-native", "Monitored 24/7", "Security reviewed"],
    },
  ],
};

export function Reliability() {
  return <ScrollWorldMount config={RELIABILITY_CONFIG} className="reliability-world" embedded />;
}
