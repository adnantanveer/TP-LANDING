import { useEffect, useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer, ContactForm, DEFAULT_CONTACT_CONTENT, type ContactContent, DETAIL_ICONS } from "@/components/landing/Sections";
import { Reveal } from "@/components/landing/primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

/** The full contact form as its own page — the homepage's Contact section
 * leads with the real Calendly booking widget instead (see Sections.tsx's
 * Contact()) and links here for anyone who'd rather write than book a
 * call. Same CMS-driven heading/body/details (fetched from
 * /api/content/contact, same as the homepage section) and the same real
 * ContactForm, just given its own page instead of sharing space with the
 * scheduler. */
export function ContactPage() {
  const [content, setContent] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/contact`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
      .catch(() => {});
  }, []);

  return (
    <main className="relative">
      <Nav />

      <section className="relative overflow-hidden pb-32 pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_85%,transparent)_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_55%,color-mix(in_oklab,var(--background)_88%,transparent)_100%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
          <div className="text-left">
            <Reveal>
              <h1 className="text-[clamp(2.4rem,5.5vw,4rem)] font-semibold leading-[0.98]">{content.heading}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-lg text-muted-foreground">{content.body}</p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 space-y-5">
                {content.details.map((d) => (
                  <div key={d.label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                      {DETAIL_ICONS[d.type]}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{d.label}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                        {d.href ? (
                          <a href={d.href} className="transition-colors hover:text-primary">
                            {d.value}
                          </a>
                        ) : (
                          <span>{d.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
