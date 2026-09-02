import { Reveal } from "@/components/landing/primitives";
import { BackgroundRippleEffect } from "@/components/landing/BackgroundRippleEffect";
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, CaretDown } from "@phosphor-icons/react";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { useContactForm, BUDGETS } from "@/concepts/shared/useContactForm";
import { contactInfo } from "@/concepts/shared/content";

const fieldClass =
  "w-full border border-border bg-background px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";

const DETAIL_ICONS = {
  Address: <MapPin weight="bold" className="h-[18px] w-[18px]" />,
  "Call us": <Phone weight="bold" className="h-[18px] w-[18px]" />,
  "Email us": <EnvelopeSimple weight="bold" className="h-[18px] w-[18px]" />,
};

export function SignalContact() {
  return (
    <section id="contact" className="signal-dark-chapter relative overflow-hidden border-t border-border py-28 md:py-36">
      {/* Same ripple grid the live site uses on its own contact section
          (BackgroundRippleEffect, reused as-is) — it reads var(--primary)
          directly, so it re-themes to cobalt here for free. */}
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
        </div>

        <Reveal delay={0.15}>
          <SignalContactForm />
        </Reveal>
      </div>
    </section>
  );
}

function SignalContactForm() {
  const { status, errorMessage, recaptchaConfig, setV2Token, handleSubmit } = useContactForm();

  if (status === "success") {
    return (
      <div className="border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium text-foreground">Thanks. We've got your message and will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-6 sm:p-8">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div>
        <label htmlFor="signal-name" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Name
        </label>
        <input id="signal-name" type="text" name="name" placeholder="Your full name" required className={fieldClass} />
      </div>

      <div className="flex gap-3">
        <div className="relative w-[6.5rem] shrink-0">
          <label htmlFor="signal-code" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Code
          </label>
          <select id="signal-code" name="countryCode" defaultValue="+44" required className={`${fieldClass} appearance-none pr-8 text-center`}>
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <CaretDown className="pointer-events-none absolute bottom-4 right-3 h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <label htmlFor="signal-phone" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Phone
          </label>
          <input id="signal-phone" type="tel" name="phone" placeholder="Phone number" required pattern="[0-9 \(\)+\-]{6,}" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="signal-email" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Email
        </label>
        <input id="signal-email" type="email" name="email" placeholder="you@company.com" required className={fieldClass} />
      </div>

      <div className="relative">
        <label htmlFor="signal-budget" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Budget
        </label>
        <select id="signal-budget" name="budget" defaultValue="" required className={`${fieldClass} appearance-none`}>
          <option value="" disabled>
            Select your budget
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <CaretDown className="pointer-events-none absolute bottom-4 right-3 h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div>
        <label htmlFor="signal-message" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Message
        </label>
        <textarea id="signal-message" name="message" placeholder="Tell us about the project" required minLength={10} rows={5} className={`${fieldClass} resize-none`} />
      </div>

      {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
        <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
      )}

      {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
