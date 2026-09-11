import { Link } from "react-router-dom";
import { Reveal } from "@/components/landing/primitives";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { contactInfo } from "@/concepts/shared/content";
import { ArrowRight } from "@phosphor-icons/react";

/** Leads with the real Calendly booking widget (calendly.com/techpotam,
 * "30 Minute Meeting") instead of the full form — the form itself lives on
 * its own page (ContactPage.tsx) for anyone who'd rather write than book a
 * call, linked below instead of duplicated here. */
export function VertexContact() {
  return (
    <section id="contact" className="relative border-t border-primary/20 bg-background py-28 md:py-36">
      <div className="mx-auto grid max-w-5xl gap-14 px-6 md:grid-cols-2 md:items-start">
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// contact</p>
            <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.2rem)] font-bold leading-[1.03]">{contactInfo.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">{contactInfo.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 space-y-3 font-mono text-sm">
              {contactInfo.details.map((d) => (
                <p key={d.label} className="text-muted-foreground">
                  {d.label}: {"href" in d && d.href ? (
                    <a href={d.href} className="text-foreground transition-colors hover:text-primary">
                      {d.value}
                    </a>
                  ) : (
                    <span className="text-foreground">{d.value}</span>
                  )}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/concepts/vertex/contact"
              className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground"
            >
              // prefer to write? send a message <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="border border-primary/25">
            <div className="border-b border-primary/25 px-6 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">// book a call</p>
              <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
