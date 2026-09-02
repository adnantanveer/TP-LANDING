import "./air.css";
import { useState } from "react";
import { AirNav } from "./Nav";
import { AirHero } from "./Hero";
import { AirStatement } from "./Statement";
import { AirCapabilities } from "./Capabilities";
import { AirWork } from "./Work";
import { AirProcess } from "./Process";
import { AirStack } from "./Stack";
import { AirTestimonials } from "./Testimonials";
import { AirContact } from "./Contact";
import { AirFooter } from "./Footer";

/**
 * Concept F — "Air": light, ultra-minimal/gallery. Same cinematic video
 * hero as every other concept; the quiet split photo+statement is its
 * own section right after it. Full depth, matching Signal/Vantage.
 */
export function AirPage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-air relative">
      <AirNav />
      <AirHero autoIntroReady={heroReady} />
      <AirStatement />
      <AirCapabilities />
      <AirWork />
      <AirProcess />
      <AirStack />
      <AirTestimonials />
      <AirContact />
      <AirFooter />
    </main>
  );
}
