import { Reveal } from "@/components/landing/primitives";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { useContactForm, BUDGETS } from "@/concepts/shared/useContactForm";
import { contactInfo } from "@/concepts/shared/content";

const fieldClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary";

export function AirContact() {
  const { status, errorMessage, recaptchaConfig, setV2Token, handleSubmit } = useContactForm();

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
        </Reveal>

        <Reveal delay={0.1}>
          {status === "success" ? (
            <p className="text-sm text-foreground">Thanks. We've got your message and will be in touch shortly.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
              <input type="text" name="name" placeholder="Name" required className={fieldClass} />
              <input type="tel" name="phone" placeholder="Phone" required pattern="[0-9 \(\)+\-]{6,}" className={fieldClass} />
              <input type="hidden" name="countryCode" value="+44" />
              <input type="email" name="email" placeholder="Email" required className={fieldClass} />
              <select name="budget" defaultValue="" required className={`${fieldClass} appearance-none`}>
                <option value="" disabled>
                  Budget
                </option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <textarea name="message" placeholder="Message" required minLength={10} rows={3} className={`${fieldClass} resize-none`} />

              {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
                <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
              )}
              {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="border-b border-foreground pb-1 text-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
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
