import "./concrete.css";
import { useState } from "react";
import { ConcreteNav } from "./Nav";
import { ConcreteHero } from "./Hero";
import { ConcreteStatement } from "./Statement";
import { ConcreteCapabilities } from "./Capabilities";
import { ConcreteWork } from "./Work";
import { ConcreteProcess } from "./Process";
import { ConcreteStack } from "./Stack";
import { ConcreteTestimonials } from "./Testimonials";
import { ConcreteContact } from "./Contact";
import { ConcreteFooter } from "./Footer";

/**
 * Concept D — "Concrete": light, brutalist/raw. Off-white + near-black +
 * one alarm-red accent, zero radius, thick offset-shadow blocks. Same
 * cinematic video hero as every other concept; the bold "SOFTWARE. BUILT
 * RAW." typographic statement is its own section right after it. Full
 * depth, matching Signal/Vantage.
 */
export function ConcretePage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-concrete relative">
      <ConcreteNav />
      <ConcreteHero autoIntroReady={heroReady} />
      <ConcreteStatement />
      <ConcreteCapabilities />
      <ConcreteWork />
      <ConcreteProcess />
      <ConcreteStack />
      <ConcreteTestimonials />
      <ConcreteContact />
      <ConcreteFooter />
    </main>
  );
}
