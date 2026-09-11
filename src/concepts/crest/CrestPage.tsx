import "./crest.css";
import { useState } from "react";
import { CrestNav } from "./Nav";
import { CrestHero } from "./Hero";
import { CrestStatement } from "./Statement";
import { CrestCraft } from "./Craft";
import { CrestCapabilities } from "./Capabilities";
import { CrestWork } from "./Work";
import { CrestProcess } from "./Process";
import { CrestStack } from "./Stack";
import { CrestStats } from "./Stats";
import { CrestTestimonials } from "./Testimonials";
import { CrestContact } from "./Contact";
import { CrestFooter } from "./Footer";
import { CrestCustomCursor } from "./CustomCursor";

/**
 * Concept I — "Crest": the synthesis concept, built after the other eight
 * to carry forward what worked (a spotlight/cursor-reactive throughline in
 * place of any one borrowed reference site) rather than add a ninth
 * reference-driven direction. Light, deep-violet accent, one inverted dark
 * "spotlight" chapter for the Statement section. Signature mechanics none
 * of the other concepts use: a cursor-glow-revealed manifesto, a
 * cursor-tracked floating image preview on the work list, a real
 * drag-physics testimonial carousel, a kinetic count-up stats strip (real
 * numbers, all derived from shared/content.ts — 16 stack entries, 5 work
 * items, 4 process steps), and a site-wide custom cursor. Craft.tsx is
 * real, license-verified Unsplash photography, color-graded into the
 * page's own violet rather than used at native color — deliberately not
 * claiming to depict Techpotam's own office (the team is remote-first; see
 * Contact for the real address instead of a staged location section).
 * Same cinematic video hero as every other concept. Full depth.
 */
export function CrestPage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-crest relative">
      <CrestCustomCursor />
      <CrestNav />
      <CrestHero autoIntroReady={heroReady} />
      <CrestStatement />
      <CrestCraft />
      <CrestCapabilities />
      <CrestWork />
      <CrestProcess />
      <CrestStack />
      <CrestStats />
      <CrestTestimonials />
      <CrestContact />
      <CrestFooter />
    </main>
  );
}
