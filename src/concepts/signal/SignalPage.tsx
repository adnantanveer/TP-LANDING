import "./signal.css";
import { useState } from "react";
import { SignalNav } from "./Nav";
import { SignalHero } from "./Hero";
import { SignalMarquee } from "./Marquee";
import { SignalCapabilities } from "./Capabilities";
import { SignalManifesto } from "./Manifesto";
import { SignalWork } from "./Work";
import { SignalProcess } from "./Process";
import { SignalStack } from "./Stack";
import { SignalTestimonials } from "./Testimonials";
import { SignalContact } from "./Contact";
import { SignalFooter } from "./Footer";

/**
 * Concept A — "Signal": light, Swiss-editorial-kinetic, single cobalt
 * accent, sharp/architectural radius. Same hero footage/copy and the same
 * contact form fields/behavior as the live site (the two things asked to
 * be kept) — everything else is a fresh visual language. See
 * src/concepts/README.md for how this compares to Concept B ("Vantage").
 */
export function SignalPage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-signal relative">
      <SignalNav />
      <SignalHero autoIntroReady={heroReady} />
      <SignalMarquee />
      <SignalCapabilities />
      <SignalManifesto />
      <SignalWork />
      <SignalProcess />
      <SignalStack />
      <SignalTestimonials />
      <SignalContact />
      <SignalFooter />
    </main>
  );
}
