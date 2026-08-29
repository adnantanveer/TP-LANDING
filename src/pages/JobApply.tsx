import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { ApplyForm } from "@/components/careers/ApplyForm";
import { NotFound } from "@/pages/NotFound";

const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * Standalone application page (/careers/apply) — reached from the "Apply
 * for a job" button on the careers listing, not tied to a specific role.
 * Same ApplyForm as JobDetail.tsx, just without a role pre-selected (an
 * optional ?role=slug still pre-fills it, e.g. for a future "Apply" button
 * elsewhere that already knows the role).
 */
export function JobApply() {
  const [searchParams] = useSearchParams();
  const initialSlug = searchParams.get("role") ?? undefined;

  // /api/jobs doubles as the "is the Careers page published" check (see
  // Jobs.tsx) — same signal, so this page 404s the same way the listing
  // does when the page is disabled, rather than staying reachable directly.
  const [pagePublished, setPagePublished] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(`${API_URL}/api/jobs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPagePublished(data?.pagePublished ?? true))
      .catch(() => setPagePublished(true));
  }, []);

  if (pagePublished === false) return <NotFound />;

  return (
    <main className="relative">
      <Nav progressAxis="y" />

      <section className="relative overflow-hidden pb-16 pt-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_60%,transparent)_0%,transparent_40%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Back to careers
          </Link>

          <Reveal>
            <SectionLabel>Apply</SectionLabel>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.2rem,6vw,3.6rem)] font-semibold leading-[1.02]">
              Tell us about <span className="text-ember">yourself</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Pick the role you're interested in and share a few details — we'll come back to you if there's a
              match.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto max-w-3xl px-6">
          <ApplyForm initialSlug={initialSlug} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
