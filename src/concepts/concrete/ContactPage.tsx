import "./concrete.css";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { Reveal } from "@/components/landing/primitives";
import { useContactForm, BUDGETS } from "@/concepts/shared/useContactForm";
import { contactInfo } from "@/concepts/shared/content";
import { CaretDown } from "@phosphor-icons/react";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { ConcreteNav } from "./Nav";
import { ConcreteFooter } from "./Footer";

const fieldClass =
  "w-full border-2 border-foreground bg-background px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-accent";

/** The full contact form as its own page — the main page's Contact section
 * leads with the real Calendly booking widget instead (see Contact.tsx)
 * and links here for anyone who'd rather write than book a call. */
export function ConcreteContactPage() {
  const { status, errorMessage, recaptchaConfig, setV2Token, handleSubmit } = useContactForm();

  return (
    <main id="top" className="concept-concrete relative">
      <ConcreteNav />

      <section className="relative bg-background pb-20 pt-32 text-foreground md:pb-28 md:pt-40">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:items-start">
          <div>
            <Reveal>
              <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-display leading-[0.95]">{contactInfo.heading}</h1>
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
          </div>

          <Reveal delay={0.1}>
            {status === "success" ? (
              <div className="border-2 border-foreground bg-background p-8 text-center">
                <p className="text-sm font-bold">Thanks. We've got your message and will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 border-2 border-foreground bg-background p-6 sm:p-8">
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
                    <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
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
                  <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                </div>
                <textarea name="message" placeholder="Tell us about the project" required minLength={10} rows={4} className={`${fieldClass} resize-none`} />
                {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
                  <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
                )}
                {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="concrete-block w-full border-2 border-foreground bg-foreground px-8 py-4 text-sm font-bold uppercase tracking-wide text-background disabled:opacity-60 sm:w-auto"
                >
                  {status === "submitting" ? "Sending..." : "Submit"}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <ConcreteFooter />
    </main>
  );
}
