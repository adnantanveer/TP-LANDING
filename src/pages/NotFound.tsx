import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

type NotFoundButton = { label: string; href: string };
type NotFoundContent = {
  heading: string;
  headingEmphasis: string;
  body: string;
  buttons: NotFoundButton[];
};

const DEFAULT_CONTENT: NotFoundContent = {
  heading: "This page went",
  headingEmphasis: "off-script",
  body: "The page you're looking for doesn't exist, or may have moved. Let's get you back on track.",
  buttons: [
    { label: "Back to home", href: "/" },
    { label: "View open roles", href: "/careers" },
  ],
};

/**
 * Catch-all route (path="*" in App.tsx) — same theme/chrome as the rest of
 * the site (Nav, Footer, Reveal/SectionLabel primitives), matching the
 * precedent set by CaseStudy.tsx/Jobs.tsx for standalone non-homepage
 * routes. No Loader — that cinematic intro is specific to the homepage's
 * first impression. Buttons use react-router's Link (not a plain <a>)
 * since they always point to internal routes — Link handles the
 * HashRouter's "#/" prefixing automatically, a raw href wouldn't.
 */
export function NotFound() {
  const [content, setContent] = useState<NotFoundContent>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/notFound`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
      .catch(() => {});
  }, []);

  return (
    <main className="relative">
      <Nav />

      <section className="relative flex min-h-screen items-center overflow-hidden pt-32 pb-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_60%,transparent)_0%,transparent_40%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel>404</SectionLabel>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98]">
              {content.heading} <span className="text-ember">{content.headingEmphasis}</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{content.body}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {content.buttons.map((b, i) => (
                <Link
                  key={i}
                  to={b.href}
                  className={
                    i === 0
                      ? "rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
                      : "rounded-full border border-border px-8 py-4 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                  }
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
