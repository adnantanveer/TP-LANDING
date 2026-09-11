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
export function CrestContact() {
  return (
    <section id="contact" className="relative overflow-hidden border-b border-border bg-background py-20 md:py-28">
      <BackgroundRippleEffect />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-start">
        <div>
          <Reveal>
            <span className="crest-eyebrow">Get in touch</span>
            <h2 className="mt-5 text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.05]">{contactInfo.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">{contactInfo.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 space-y-4">
              {contactInfo.details.map((d) => (
                <div key={d.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {DETAIL_ICONS[d.label as keyof typeof DETAIL_ICONS]}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-foreground">
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
              to="/concepts/crest/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Prefer to write instead? Send a message <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <span className="crest-eyebrow">Book a call</span>
              <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
