import "./shell.css";
import { useState } from "react";
import { ShellNav } from "./Nav";
import { ShellHero } from "./Hero";
import { ShellStatement } from "./Statement";
import { ShellCapabilities } from "./Capabilities";
import { ShellWork } from "./Work";
import { ShellProcess } from "./Process";
import { ShellStack } from "./Stack";
import { ShellTestimonials } from "./Testimonials";
import { ShellContact } from "./Contact";
import { ShellFooter } from "./Footer";

/**
 * Concept G — "Shell": dark, developer-terminal aesthetic (reference:
 * shankar.io). Warm charcoal + amber accent, condensed bold display type,
 * command-style eyebrows ("$ whoami", "$ git log", "$ skill --graph")
 * throughout, a git-log-styled work history, a dependency-graph-styled
 * tech stack, and a mock-terminal delivery process. Same cinematic video
 * hero as every other concept. Full depth.
 */
export function ShellPage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-shell relative">
      <ShellNav />
      <ShellHero autoIntroReady={heroReady} />
      <ShellStatement />
      <ShellCapabilities />
      <ShellWork />
      <ShellProcess />
      <ShellStack />
      <ShellTestimonials />
      <ShellContact />
      <ShellFooter />
    </main>
  );
}
