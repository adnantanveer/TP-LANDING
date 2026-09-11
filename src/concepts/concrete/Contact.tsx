import { Link } from "react-router-dom";
import { Reveal } from "@/components/landing/primitives";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { contactInfo } from "@/concepts/shared/content";
import { ArrowRight } from "@phosphor-icons/react";

/** Leads with the real Calendly booking widget (calendly.com/techpotam,
 * "30 Minute Meeting") instead of the full form — the form itself lives on
 * its own page (ContactPage.tsx) for anyone who'd rather write than book a
 * call, linked below instead of duplicated here. */
export function ConcreteContact() {
  return (
    <section id="contact" className="relative bg-primary py-20 text-primary-foreground md:py-28">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:items-start">
        <div>
          <Reveal>
            <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-display leading-[0.95]">{contactInfo.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-sm font-medium">{contactInfo.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 space-y-3 font-mono text-sm">
              {contactInfo.details.map((d) => (
                <p key={d.label}>
                  {d.label.toUpperCase()}: {"href" in d && d.href ? (
                    <a href={d.href} className="underline decoration-2 underline-offset-4">
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/concepts/concrete/contact"
              className="mt-8 inline-flex items-center gap-2 border-b-2 border-primary-foreground pb-1 text-sm font-bold uppercase tracking-wide"
            >
              Prefer to write instead? <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="border-2 border-primary-foreground bg-background text-foreground">
            <div className="border-b-2 border-foreground px-6 py-4">
              <p className="font-mono text-xs font-bold uppercase tracking-wide">Book a call</p>
              <p className="mt-1 text-sm">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
