import "./vantage.css";
import { useState } from "react";
import { VantageNav } from "./Nav";
import { VantageHero } from "./Hero";
import { VantageMarquee } from "./Marquee";
import { VantageCapabilities } from "./Capabilities";
import { VantageWork } from "./Work";
import { VantageShowcase } from "./Showcase";
import { VantageProcess } from "./Process";
import { VantageStack } from "./Stack";
import { VantageTestimonials } from "./Testimonials";
import { VantageContact } from "./Contact";
import { VantageFooter } from "./Footer";

/**
 * Concept B — "Vantage": dark, cold-luxury bento/glass, single ice-blue
 * accent, soft/pill radius. Same hero footage/copy and the same contact
 * form fields/behavior as the live site — everything else (bento
 * capabilities, sticky-stack process, tilt-card stack) is a fresh visual
 * language distinct from both the live site and Concept A ("Signal").
 */
export function VantagePage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-vantage relative">
      <VantageNav />
      <VantageHero autoIntroReady={heroReady} />
      <VantageMarquee />
      <VantageCapabilities />
      <VantageWork />
      <VantageShowcase />
      <VantageProcess />
      <VantageStack />
      <VantageTestimonials />
      <VantageContact />
      <VantageFooter />
    </main>
  );
}
