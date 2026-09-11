import "./surge.css";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { Reveal } from "@/components/landing/primitives";
import { useContactForm, BUDGETS } from "@/concepts/shared/useContactForm";
import { contactInfo } from "@/concepts/shared/content";
import { CaretDown, MapPin, Phone, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { SurgeNav } from "./Nav";
import { SurgeFooter } from "./Footer";

const fieldClass =
  "w-full rounded-full border border-border bg-background/60 px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";

const DETAIL_ICONS = {
  Address: <MapPin weight="bold" className="h-[18px] w-[18px]" />,
  "Call us": <Phone weight="bold" className="h-[18px] w-[18px]" />,
  "Email us": <EnvelopeSimple weight="bold" className="h-[18px] w-[18px]" />,
};

/** The full contact form as its own page — the main page's Contact section
 * leads with the real Calendly booking widget instead (see Contact.tsx)
 * and links here for anyone who'd rather write than book a call. */
export function SurgeContactPage() {
  const { status, errorMessage, recaptchaConfig, setV2Token, handleSubmit } = useContactForm();

  return (
    <main id="top" className="concept-surge relative">
      <SurgeNav />

      <section className="relative overflow-hidden bg-background pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="relative mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-start">
          <div>
            <Reveal>
              <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.05]">{contactInfo.heading}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-base text-muted-foreground">{contactInfo.body}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10 space-y-4">
                {contactInfo.details.map((d) => (
                  <div key={d.label} className="flex items-center gap-4 rounded-full border border-border bg-card p-3 pr-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
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
          </div>

          <Reveal delay={0.1}>
            {status === "success" ? (
              <div className="rounded-[2rem] border border-border bg-card p-8 text-center">
                <p className="text-sm font-medium text-foreground">Thanks. We've got your message and will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-border bg-card p-6 sm:p-8">
                <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
                <input type="text" name="name" placeholder="Enter your name" required className={fieldClass} />
                <div className="flex gap-3">
                  <div className="relative w-[6.5rem] shrink-0">
                    <select name="countryCode" defaultValue="+44" required className={`${fieldClass} appearance-none pr-8 text-center`}>
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <CaretDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <input type="tel" name="phone" placeholder="Phone number" required pattern="[0-9 \(\)+\-]{6,}" className={`${fieldClass} flex-1`} />
                </div>
                <input type="email" name="email" placeholder="Enter your email" required className={fieldClass} />
                <div className="relative">
                  <select name="budget" defaultValue="" required className={`${fieldClass} appearance-none`}>
                    <option value="" disabled>
                      Select your budget
                    </option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <textarea name="message" placeholder="Tell us about the project" required minLength={10} rows={4} className={`${fieldClass} resize-none !rounded-3xl`} />
                {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
                  <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
                )}
                {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60 sm:w-auto"
                >
                  {status === "submitting" ? "Sending..." : "Submit"}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <SurgeFooter />
    </main>
  );
}
