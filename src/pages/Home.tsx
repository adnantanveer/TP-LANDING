import { useState } from "react";
import { Loader } from "@/components/landing/Loader";
import { Nav } from "@/components/landing/Nav";
import { CursorField, ReactiveTilt } from "@/components/landing/CursorField";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { OurWork } from "@/components/landing/OurWork";
import { Precision } from "@/components/landing/Precision";
import { TechStack } from "@/components/landing/TechStack";
import { UkSection } from "@/components/landing/UkSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { Process, Marquee, Contact, Footer } from "@/components/landing/Sections";
import { SceneEnter } from "@/components/landing/primitives";

const INTRO_SEEN_KEY = "techpotam-intro-seen";
// TEMP (review only): forces the intro to replay on every refresh instead of
// once per session, so it's easy to watch repeatedly while reviewing.
// Flip back to false before shipping.
const DEV_ALWAYS_REPLAY_INTRO = true;

export function Home() {
  // The cinematic logo intro plays once per browser session — set on Loader's
  // onDone, checked here so a refresh/re-render mid-session doesn't replay it.
  const [showIntro] = useState(() => {
    if (DEV_ALWAYS_REPLAY_INTRO) return true;
    if (typeof window === "undefined") return false;
    try {
      return !window.sessionStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      return true; // sessionStorage unavailable (private mode etc) — safe default
    }
  });

  // Gates the hero's auto-intro (see Hero.tsx/scrub-engine.ts): if there's no
  // loader to wait for (intro already seen this session), the hero can start
  // its own auto-intro immediately. Otherwise it waits for Loader's
  // onRevealed — fired only once the loader's exit animation has fully
  // finished, not when it merely starts — so the slomo playback begins right
  // as the hero actually becomes visible, not while still hidden behind it.
  const [heroReady, setHeroReady] = useState(() => !showIntro);

  return (
    <main id="top" className="relative">
      {showIntro && (
        <Loader
          onDone={() => {
            try {
              window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
            } catch {
              /* noop */
            }
          }}
          onRevealed={() => setHeroReady(true)}
        />
      )}
      <CursorField />
      <Nav />

      <Hero autoIntroReady={heroReady} />

      <Marquee />
      <SceneEnter>
        <ReactiveTilt strength={5}>
          <Services />
        </ReactiveTilt>
      </SceneEnter>

      <SceneEnter>
        <OurWork />
      </SceneEnter>

      <SceneEnter>
        <Precision />
      </SceneEnter>

      <SceneEnter>
        <TechStack />
      </SceneEnter>
      <UkSection />

      <Testimonials />

      <SceneEnter>
        <Process />
      </SceneEnter>

      <SceneEnter>
        <Contact />
      </SceneEnter>
      <Footer />
    </main>
  );
}
