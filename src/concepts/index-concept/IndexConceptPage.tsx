import "./index-theme.css";
import { useState } from "react";
import { IndexNav } from "./Nav";
import { IndexHero } from "./Hero";
import { IndexStatement } from "./Statement";
import { IndexCapabilities } from "./Capabilities";
import { IndexWork } from "./Work";
import { IndexProcess } from "./Process";
import { IndexStack } from "./Stack";
import { IndexTestimonials } from "./Testimonials";
import { IndexContact } from "./Contact";
import { IndexFooter } from "./Footer";

/**
 * Concept H — "Index": light, bold editorial (reference: webisoft.com).
 * Near-white + near-black + one bold coral accent used as a real
 * color-block chapter, huge condensed impact display type (Anton),
 * monospace index labels. Signature section: a scroll-driven accordion
 * services list (Capabilities) — each row collapses to a title-only bar
 * once scrolled past while the one in focus expands, the "losing one on
 * other" effect from the brief. Same cinematic video hero as every other
 * concept. Full depth.
 */
export function IndexConceptPage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-index relative">
      <IndexNav />
      <IndexHero autoIntroReady={heroReady} />
      <IndexStatement />
      <IndexCapabilities />
      <IndexWork />
      <IndexProcess />
      <IndexStack />
      <IndexTestimonials />
      <IndexContact />
      <IndexFooter />
    </main>
  );
}
