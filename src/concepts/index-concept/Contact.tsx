import { Link } from "react-router-dom";
import { Reveal } from "@/components/landing/primitives";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { contactInfo } from "@/concepts/shared/content";
import { ArrowRight, MapPin, Phone, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";

const DETAIL_ICONS = {
  Address: <MapPin weight="bold" className="h-[18px] w-[18px]" />,
  "Call us": <Phone weight="bold" className="h-[18px] w-[18px]" />,
  "Email us": <EnvelopeSimple weight="bold" className="h-[18px] w-[18px]" />,
};

/** Main-page contact moment: an inline Calendly widget for booking a slot
 * directly (Techpotam's own real scheduling page — calendly.com/techpotam,
 * "30 Minute Meeting"), rather than the full form. The form itself lives
 * on its own page (ContactPage.tsx) for anyone who'd rather write than
 * book a call — linked below instead of duplicated here. */
export function IndexContact() {
  return (
    <section id="contact" className="relative border-t border-border bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-start">
        <div>
          <Reveal>
            <span className="index-tag">/ CONTACT</span>
            <h2 className="mt-4 text-[clamp(1.9rem,5vw,3.4rem)] leading-[0.95]">{contactInfo.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">{contactInfo.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 space-y-5">
              {contactInfo.details.map((d) => (
                <div key={d.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/40 text-primary">
                    {DETAIL_ICONS[d.label as keyof typeof DETAIL_ICONS]}
                  </span>
                  <div>
                    <p className="index-tag">{d.label}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
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
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/concepts/index/contact"
              className="mt-10 inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Prefer to write instead? Send a message <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <p className="index-tag">/ BOOK A CALL</p>
              <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
