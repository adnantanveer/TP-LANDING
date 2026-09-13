import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { CaseStudyCarousel } from "@/components/CaseStudyCarousel";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const API_URL = import.meta.env.VITE_API_URL as string;

type WorkResult = { stat: string; label: string };
type WorkImage = { url: string; type: "image" | "video"; title: string; altText: string; caption: string };

// Real photography already used elsewhere on this site (not a fabricated
// screenshot) — appended only so the carousel has a second slide to
// actually browse between while most projects still have just the one
// admin-uploaded cover image. Drop this once every project has 2+ real
// images from the admin panel.
const DUMMY_IMAGE: WorkImage = { url: "/assets/work-atlas.jpg", type: "image", title: "", altText: "", caption: "" };
type WorkItem = {
  slug: string;
  images: WorkImage[];
  client: string;
  title: string;
  caption: string;
  meta: string[];
  overview: string;
  challenge: string;
  approach: string;
  results: WorkResult[];
  stack: string[];
};

/**
 * Detail page for a single "Our Work Speaks" project — linked from each
 * card in OurWork.tsx (/work/:slug). Same theme/chrome as the rest of the
 * site (Nav, Footer, Reveal/SectionLabel primitives) but no Loader — that
 * cinematic intro is specific to the homepage's first impression, matching
 * the precedent set by ReuseComponent.tsx.
 */
export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const [all, setAll] = useState<WorkItem[] | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/content/case-studies`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAll(data?.caseStudies ?? []))
      .catch(() => setAll([]));
  }, []);

  if (all === null) return null;

  const project = all.find((w) => w.slug === slug);
  if (!project) return <Navigate to="/" replace />;
  const realImages = project.images ?? [];
  const coverImages = realImages.length >= 2 ? realImages : [...realImages, DUMMY_IMAGE];
  const gallery = project.images?.slice(1) ?? [];

  return (
    <main className="relative">
      <Nav progressAxis="y" />

      {/* hero */}
      <section className="relative overflow-hidden pb-16 pt-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_60%,transparent)_0%,transparent_40%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            to="/"
            state={{ scrollTo: "work" }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Back to our work
          </Link>

          <Reveal>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-primary">{project.client}</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98]">
              {project.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{project.caption}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {project.meta.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
                >
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="relative mx-auto mt-14 max-w-6xl px-6">
            <CaseStudyCarousel images={coverImages} title={project.title} />
          </div>
        </Reveal>
      </section>

      {/* overview / challenge / approach */}
      <section className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-3">
          <Reveal>
            <SectionLabel>Overview</SectionLabel>
            <div className="rich-text-content mt-5 text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.overview) }} />
          </Reveal>
          <Reveal delay={0.1}>
            <SectionLabel>The challenge</SectionLabel>
            <div className="rich-text-content mt-5 text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.challenge) }} />
          </Reveal>
          <Reveal delay={0.2}>
            <SectionLabel>Our approach</SectionLabel>
            <div className="rich-text-content mt-5 text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.approach) }} />
          </Reveal>
        </div>
      </section>

      {/* results */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel>The result</SectionLabel>
            <h2 className="mt-5 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05]">
              Outcomes that <span className="text-ember">held up</span> after launch.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {project.results.map((r, i) => (
              <Reveal key={r.label} delay={0.08 * i}>
                <div className="rounded-2xl border border-border bg-card p-8">
                  <p className="text-3xl font-semibold text-ember md:text-4xl">{r.stat}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{r.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-14 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-background/40 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground backdrop-blur"
                >
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* gallery — every image beyond the cover, only rendered if there are any */}
      {gallery.length > 0 && (
        <section className="relative py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <SectionLabel>Gallery</SectionLabel>
              <h2 className="mt-5 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05]">
                More from <span className="text-ember">this project</span>.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {gallery.map((img, i) => (
                <Reveal key={img.url + i} delay={0.06 * i}>
                  <figure className="overflow-hidden rounded-2xl border border-border bg-card">
                    {img.type === "video" ? (
                      <video src={img.url} controls className="h-64 w-full object-cover" />
                    ) : (
                      <img
                        src={img.url}
                        alt={img.altText || img.title || project.title}
                        loading="lazy"
                        className="h-64 w-full object-cover"
                      />
                    )}
                    {img.caption && <figcaption className="px-5 py-4 text-sm text-muted-foreground">{img.caption}</figcaption>}
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* closing CTA */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-card p-10">
              <h3 className="max-w-md text-2xl font-semibold leading-tight">
                Want a result like this for <span className="text-ember">your product</span>?
              </h3>
              <Link
                to="/"
                state={{ scrollTo: "contact" }}
                className="shrink-0 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
              >
                Start a conversation
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
