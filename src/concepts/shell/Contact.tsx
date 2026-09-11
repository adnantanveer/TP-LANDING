import { Link } from "react-router-dom";
import { Reveal } from "@/components/landing/primitives";
import { BackgroundRippleEffect } from "@/components/landing/BackgroundRippleEffect";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { contactInfo } from "@/concepts/shared/content";
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, ArrowRight } from "@phosphor-icons/react";

const DETAIL_ICONS = {
  Address: <MapPin weight="bold" className="h-[18px] w-[18px]" />,
  "Call us": <Phone weight="bold" className="h-[18px] w-[18px]" />,
  "Email us": <EnvelopeSimple weight="bold" className="h-[18px] w-[18px]" />,
};

/** Leads with the real Calendly booking widget (calendly.com/techpotam,
 * "30 Minute Meeting") instead of the full form — the form itself lives on
 * its own page (ContactPage.tsx) for anyone who'd rather write than book a
 * call, linked below instead of duplicated here. */
export function ShellContact() {
  return (
    <section id="contact" className="relative overflow-hidden border-b border-border bg-background py-20 md:py-28">
      <BackgroundRippleEffect />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-start">
        <div>
          <Reveal>
            <span className="shell-cmd">
              $ <b>contact</b> --new
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,4.6vw,3rem)] font-display uppercase leading-[0.95]">{contactInfo.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">{contactInfo.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 space-y-4">
              {contactInfo.details.map((d) => (
                <div key={d.label} className="flex items-center gap-4 rounded-md border border-border bg-card p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    {DETAIL_ICONS[d.label as keyof typeof DETAIL_ICONS]}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                    {"href" in d && d.href ? (
                      <a href={d.href} className="transition-colors hover:text-primary">
                        {d.value}
                      </a>
                    ) : (
                      <span>{d.value}</span>
                    )}
                    {"whatsapp" in d && d.whatsapp && (
                      <a href={d.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-white">
                        <WhatsappLogo weight="fill" className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/concepts/shell/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              $ prefer --write <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <span className="shell-cmd">
                $ <b>book</b> --call
              </span>
              <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
