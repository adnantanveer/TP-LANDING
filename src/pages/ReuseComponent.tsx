import { Link } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Reliability } from "@/components/landing/Reliability";
import { ScrollWorld } from "@/components/landing/ScrollWorld";
import { UkSection } from "@/components/landing/UkSection";
import { Process, Footer } from "@/components/landing/Sections";

/**
 * Standalone route for sections pulled off the homepage but kept around for
 * reuse elsewhere — Reliability ("Enterprise-grade infrastructure. Every
 * time."), ScrollWorld ("Scroll into the machine"), UkSection ("A delivery
 * partner that works on British time."), and Process ("A delivery model
 * built for certainty."). No Loader here: that cinematic intro is specific
 * to the homepage's first impression, not every route.
 */
export function ReuseComponent() {
  return (
    <main className="relative">
      <Nav />

      <div className="relative z-10 px-6 pt-32">
        <Link
          to="/"
          className="mx-auto block w-fit rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          ← Back to home
        </Link>
      </div>

      <Reliability />
      <ScrollWorld />
      <UkSection />
      <Process />

      <Footer />
    </main>
  );
}
