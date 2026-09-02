import { Reveal } from "@/components/landing/primitives";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { useContactForm, BUDGETS } from "@/concepts/shared/useContactForm";
import { contactInfo } from "@/concepts/shared/content";
import { CaretDown } from "@phosphor-icons/react";
import { COUNTRY_CODES } from "@/lib/countryCodes";

const fieldClass =
  "w-full border border-primary/25 bg-background px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";

export function VertexContact() {
  const { status, errorMessage, recaptchaConfig, setV2Token, handleSubmit } = useContactForm();

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
        </div>

        <Reveal delay={0.1}>
          {status === "success" ? (
            <div className="border border-primary/30 p-8 text-center">
              <p className="text-sm text-foreground">Thanks. We've got your message and will be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 border border-primary/25 p-6 sm:p-8">
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
                  <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
                <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
              <textarea name="message" placeholder="Tell us about the project" required minLength={10} rows={4} className={`${fieldClass} resize-none`} />
              {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
                <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
              )}
              {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full border border-primary bg-primary/10 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60 sm:w-auto"
              >
                {status === "submitting" ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
