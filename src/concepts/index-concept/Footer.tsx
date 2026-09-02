import { footerInfo, contactInfo, capabilities } from "@/concepts/shared/content";

/** Reference: webisoft.com's own coral footer — wordmark, service links,
 * office address, all on the brand color rather than a plain dark bar. */
export function IndexFooter() {
  return (
    <footer className="index-color-chapter relative">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 border-b border-dashed border-border pb-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl uppercase leading-none">Techpotam®</p>
            <p className="mt-4 max-w-xs text-sm text-foreground/80">
              A UK-facing software studio, delivery team based in Noida, India.
            </p>
          </div>
          <div>
            <p className="index-tag">Capabilities</p>
            <ul className="mt-4 space-y-2 text-sm">
              {capabilities.map((c) => (
                <li key={c.title}>{c.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="index-tag">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              {contactInfo.details.map((d) => (
                <li key={d.label}>
                  {"href" in d && d.href ? (
                    <a href={d.href} className="transition-colors hover:opacity-70">
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 font-mono text-xs uppercase tracking-[0.1em]">
          <p>© {new Date().getFullYear()} {footerInfo.copyright}</p>
          <p>{footerInfo.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
