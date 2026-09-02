import "./surge.css";
import { useState } from "react";
import { SurgeNav } from "./Nav";
import { SurgeHero } from "./Hero";
import { SurgeStatement } from "./Statement";
import { SurgeCapabilities } from "./Capabilities";
import { SurgeWork } from "./Work";
import { SurgeProcess } from "./Process";
import { SurgeStack } from "./Stack";
import { SurgeTestimonials } from "./Testimonials";
import { SurgeContact } from "./Contact";
import { SurgeFooter } from "./Footer";

/**
 * Concept E — "Surge": dark, maximalist/constantly-moving. Single
 * hot-magenta accent, full-pill radius. Same cinematic video hero as
 * every other concept; the floating-blob statement is its own section
 * right after it. Full depth, matching Signal/Vantage.
 */
export function SurgePage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-surge relative">
      <SurgeNav />
      <SurgeHero autoIntroReady={heroReady} />
      <SurgeStatement />
      <SurgeCapabilities />
      <SurgeWork />
      <SurgeProcess />
      <SurgeStack />
      <SurgeTestimonials />
      <SurgeContact />
      <SurgeFooter />
    </main>
  );
}
