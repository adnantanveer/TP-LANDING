import "./vertex.css";
import { useState } from "react";
import { VertexNav } from "./Nav";
import { VertexHero } from "./Hero";
import { VertexSceneSection } from "./Scene";
import { VertexCapabilities } from "./Capabilities";
import { VertexWork } from "./Work";
import { VertexProcess } from "./Process";
import { VertexStack } from "./Stack";
import { VertexTestimonials } from "./Testimonials";
import { VertexContact } from "./Contact";
import { VertexFooter } from "./Footer";

/**
 * Concept C — "Vertex": dark, single neon-lime accent, zero radius. Same
 * cinematic video hero as every other concept; the real rendered Three.js
 * scene (not a CSS approximation) is its own section right after the hero.
 * Full depth, matching Signal/Vantage.
 */
export function VertexPage() {
  const [heroReady] = useState(true);

  return (
    <main id="top" className="concept-vertex relative">
      <VertexNav />
      <VertexHero autoIntroReady={heroReady} />
      <VertexSceneSection />
      <VertexCapabilities />
      <VertexWork />
      <VertexProcess />
      <VertexStack />
      <VertexTestimonials />
      <VertexContact />
      <VertexFooter />
    </main>
  );
}
