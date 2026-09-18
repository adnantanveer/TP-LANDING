import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader } from "@/components/landing/Loader";
import { Nav } from "@/components/landing/Nav";
import { ReactiveTilt } from "@/components/landing/CursorField";
import { Hero } from "@/components/landing/Hero";
import { Statement } from "@/components/landing/Statement";
import { Services } from "@/components/landing/Services";
import { OurWork } from "@/components/landing/OurWork";
import { Process } from "@/components/landing/Process";
import { Precision } from "@/components/landing/Precision";
import { TechStack } from "@/components/landing/TechStack";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { TeamSection } from "@/components/landing/TeamSection";
import { Marquee, Contact, Footer } from "@/components/landing/Sections";
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

  // A nav link (or a case-study "back"/CTA link) arriving with ?section=...
  // wants App.tsx's ScrollToTop to land on that section — but the auto-intro
  // drives its own repeated window.scrollTo calls to animate into the hero,
  // with no idea a target section was requested, and reliably wins that race
  // (it fires after ScrollToTop's own corrections have already run). Skipping
  // it here avoids fighting a scroll the user explicitly asked for; it isn't
  // relevant to reaching a section anyway.
  const [searchParams] = useSearchParams();
  const hasSectionTarget = searchParams.has("section");

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
      <Nav />

      <Hero autoIntroReady={heroReady && !hasSectionTarget} />
      <Statement />

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
        <Process />
      </SceneEnter>

      <SceneEnter>
        <Precision />
      </SceneEnter>

      <SceneEnter>
        <TechStack />
      </SceneEnter>

      <SceneEnter>
        <Stats />
      </SceneEnter>

      <Testimonials />

      <SceneEnter>
        <TeamSection />
      </SceneEnter>

      <SceneEnter>
        <Contact />
      </SceneEnter>
      <Footer />
    </main>
  );
}
