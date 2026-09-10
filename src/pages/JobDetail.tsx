import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { ApplyForm } from "@/components/careers/ApplyForm";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const API_URL = import.meta.env.VITE_API_URL as string;

type Attachment = { id: string; filename: string; mimeType: string; size: number };
type Job = {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  salaryRange: string;
  attachments: Attachment[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M4 2.5h7l3 3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 8h6M6 11h6M6 5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Job detail page (/careers/:slug) — same theme/chrome as CaseStudy.tsx
 * (Nav, Footer, Reveal/SectionLabel primitives). The application form is
 * the full multi-section ApplyForm (shared with the standalone
 * /careers/apply page) — too long for a sidebar, so it runs full-width
 * below the role description rather than alongside it.
 */
export function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null | "not-found">(null);

  useEffect(() => {
    fetch(`${API_URL}/api/jobs/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setJob(data?.job ?? "not-found"))
      .catch(() => setJob("not-found"));
  }, [slug]);

  if (job === null) return null;
  if (job === "not-found") return <Navigate to="/careers" replace />;

  return (
    <main className="relative">
      <Nav progressAxis="y" />

      <section className="relative overflow-hidden pb-16 pt-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_60%,transparent)_0%,transparent_40%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Back to careers
          </Link>

          <Reveal>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {job.department} · {job.location}
            </p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98]">{job.title}</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{job.summary}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap items-center gap-2">
              {[job.type, ...(job.salaryRange ? [job.salaryRange] : [])].map((m) => (
                <li key={m} className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                  {m}
                </li>
              ))}
              <li>
                <a
                  href="#apply"
                  className="rounded-full bg-primary px-6 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
                >
                  Apply for this role
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-28">
        <div className="mx-auto max-w-3xl space-y-14 px-6">
          <Reveal>
            <SectionLabel>About the role</SectionLabel>
            <div className="rich-text-content mt-5 text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }} />
          </Reveal>

          {job.attachments.length > 0 && (
            <Reveal delay={0.05}>
              <SectionLabel>Downloads</SectionLabel>
              <div className="mt-5 space-y-2">
                {job.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={`${API_URL}/api/jobs/${job.slug}/attachments/${a.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                      <FileIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{a.filename}</span>
                      <span className="block text-xs text-muted-foreground">{formatBytes(a.size)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          )}

          {job.responsibilities.length > 0 && (
            <Reveal delay={0.1}>
              <SectionLabel>What you'll do</SectionLabel>
              <ul className="mt-5 space-y-3">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {job.requirements.length > 0 && (
            <Reveal delay={0.15}>
              <SectionLabel>What we're looking for</SectionLabel>
              <ul className="mt-5 space-y-3">
                {job.requirements.map((r) => (
                  <li key={r} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {job.benefits.length > 0 && (
            <Reveal delay={0.2}>
              <SectionLabel>Benefits</SectionLabel>
              <ul className="mt-5 space-y-3">
                {job.benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      <section id="apply" className="relative py-28">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <SectionLabel>Apply for this role</SectionLabel>
            <h2 className="mt-5 max-w-xl text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.05]">
              Tell us about <span className="text-ember">yourself</span>.
            </h2>
          </Reveal>
          <div className="mt-10">
            <ApplyForm initialSlug={job.slug} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
