import { Link, Navigate, useParams } from "react-router-dom";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { getWorkBySlug } from "@/data/work";

/**
 * Detail page for a single "Our Work Speaks" project — linked from each
 * card in OurWork.tsx (/work/:slug). Same theme/chrome as the rest of the
 * site (Nav, Footer, Reveal/SectionLabel primitives) but no Loader — that
 * cinematic intro is specific to the homepage's first impression, matching
 * the precedent set by ReuseComponent.tsx.
 */
export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const project = getWorkBySlug(slug);

  if (!project) return <Navigate to="/" replace />;

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
            to="/#work"
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
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src={project.img}
                alt={project.title}
                width={1600}
                height={1000}
                className="h-[38vh] w-full object-cover md:h-[56vh]"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* overview / challenge / approach */}
      <section className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-3">
          <Reveal>
            <SectionLabel>Overview</SectionLabel>
            <p className="mt-5 text-muted-foreground">{project.overview}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionLabel>The challenge</SectionLabel>
            <p className="mt-5 text-muted-foreground">{project.challenge}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <SectionLabel>Our approach</SectionLabel>
            <p className="mt-5 text-muted-foreground">{project.approach}</p>
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

      {/* testimonial */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_85%,transparent)_0%,color-mix(in_oklab,var(--primary)_14%,transparent)_55%,color-mix(in_oklab,var(--background)_88%,transparent)_100%)] py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-[clamp(1.4rem,3.2vw,2.2rem)] font-medium leading-snug">
              “{project.testimonial.quote}”
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              {project.testimonial.name} · {project.testimonial.role}
            </p>
          </Reveal>
        </div>
      </section>

      {/* closing CTA */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-card p-10">
              <h3 className="max-w-md text-2xl font-semibold leading-tight">
                Want a result like this for <span className="text-ember">your product</span>?
              </h3>
              <Link
                to="/#contact"
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
