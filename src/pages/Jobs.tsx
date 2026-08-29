import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { NotFound } from "@/pages/NotFound";

const API_URL = import.meta.env.VITE_API_URL as string;

type JobListing = {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  salaryRange: string;
};

/**
 * Careers listing page (/careers) — same theme/chrome as the rest of the
 * site (Nav, Footer, Reveal/SectionLabel primitives), matching the
 * precedent set by CaseStudy.tsx for standalone non-homepage routes. No
 * Loader — that cinematic intro is specific to the homepage's first
 * impression.
 */
export function Jobs() {
  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [pagePublished, setPagePublished] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/jobs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setJobs(data?.jobs ?? []);
        setPagePublished(data?.pagePublished ?? true);
      })
      .catch(() => setJobs([]));
  }, []);

  if (jobs !== null && !pagePublished) return <NotFound />;

  return (
    <main className="relative">
      <Nav />

      <section className="relative overflow-hidden pb-16 pt-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_60%,transparent)_0%,transparent_40%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel>Careers</SectionLabel>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.2rem,6vw,4.2rem)] font-semibold leading-[1.02]">
              Build the next one <span className="text-ember">with us</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              We're a small, senior team that ships fast and cares about the craft. Here's what we're hiring for
              right now.
            </p>
            <Link
              to="/careers/apply"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
            >
              Apply for a job
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto max-w-6xl px-6">
          {jobs === null ? (
            <p className="text-sm text-muted-foreground">Loading open roles...</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">No open roles right now — check back soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <Reveal key={job.slug} delay={0.05 * i}>
                  <Link
                    to={`/careers/${job.slug}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 transition-colors duration-300 hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-medium text-foreground">{job.title}</h2>
                        <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                          {job.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {job.department} · {job.location}
                        {job.salaryRange ? ` · ${job.salaryRange}` : ""}
                      </p>
                      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{job.summary}</p>
                    </div>
                    <span className="shrink-0 text-sm text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      View role →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
