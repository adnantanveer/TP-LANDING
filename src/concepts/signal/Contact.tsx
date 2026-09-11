import { Link } from "react-router-dom";
import { Reveal } from "@/components/landing/primitives";
import { BackgroundRippleEffect } from "@/components/landing/BackgroundRippleEffect";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, ArrowRight } from "@phosphor-icons/react";
import { contactInfo } from "@/concepts/shared/content";

const DETAIL_ICONS = {
  Address: <MapPin weight="bold" className="h-[18px] w-[18px]" />,
  "Call us": <Phone weight="bold" className="h-[18px] w-[18px]" />,
  "Email us": <EnvelopeSimple weight="bold" className="h-[18px] w-[18px]" />,
};

/** Leads with the real Calendly booking widget (calendly.com/techpotam,
 * "30 Minute Meeting") instead of the full form — the form itself lives on
 * its own page (ContactPage.tsx) for anyone who'd rather write than book a
 * call, linked below instead of duplicated here. */
export function SignalContact() {
  return (
    <section id="contact" className="signal-dark-chapter relative overflow-hidden border-t border-border py-28 md:py-36">
      <BackgroundRippleEffect />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 100%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-start">
        <div>
          <Reveal>
            <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02]">{contactInfo.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-base text-muted-foreground">{contactInfo.body}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-12 space-y-6">
              {contactInfo.details.map((d) => (
                <div key={d.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/40 text-primary">
                    {DETAIL_ICONS[d.label as keyof typeof DETAIL_ICONS]}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{d.label}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      {"href" in d && d.href ? (
                        <a href={d.href} className="transition-colors hover:text-primary">
                          {d.value}
                        </a>
                      ) : (
                        <span>{d.value}</span>
                      )}
                      {"whatsapp" in d && d.whatsapp && (
                        <a
                          href={d.whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Chat on WhatsApp"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
                        >
                          <WhatsappLogo weight="fill" className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <Link
              to="/concepts/signal/contact"
              className="mt-10 inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Prefer to write instead? Send a message <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Book a call</p>
              <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
