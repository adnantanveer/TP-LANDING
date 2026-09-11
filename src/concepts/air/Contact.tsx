import { Link } from "react-router-dom";
import { Reveal } from "@/components/landing/primitives";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { contactInfo } from "@/concepts/shared/content";
import { ArrowRight } from "@phosphor-icons/react";

/** Leads with the real Calendly booking widget (calendly.com/techpotam,
 * "30 Minute Meeting") instead of the full form — the form itself lives on
 * its own page (ContactPage.tsx) for anyone who'd rather write than book a
 * call, linked below instead of duplicated here. */
export function AirContact() {
  return (
    <section id="contact" className="relative bg-background py-32 md:py-48">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-16 px-6 md:grid-cols-2 md:gap-24 md:px-12">
        <Reveal>
          <h2 className="max-w-sm text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">{contactInfo.heading}</h2>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">{contactInfo.body}</p>
          <div className="mt-14 space-y-4 text-sm">
            {contactInfo.details.map((d) => (
              <p key={d.label} className="text-muted-foreground">
                {d.label}{" "}
                {"href" in d && d.href ? (
                  <a href={d.href} className="text-foreground transition-colors hover:text-primary">
                    {d.value}
                  </a>
                ) : (
                  <span className="text-foreground">{d.value}</span>
                )}
              </p>
            ))}
          </div>
          <Link
            to="/concepts/air/contact"
            className="mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            Prefer to write instead? <ArrowRight weight="bold" className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-sm text-muted-foreground">Book a call</p>
          <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
          <div className="mt-6 border-t border-border">
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
