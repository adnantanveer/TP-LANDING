import { footerInfo, contactInfo } from "@/concepts/shared/content";

export function VantageFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-muted-foreground">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-8 border-b border-border pb-8">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {contactInfo.details
              .filter((d) => "href" in d && d.href)
              .map((d) => (
                <a key={d.label} href={(d as { href: string }).href} className="transition-colors hover:text-primary">
                  {d.label}: {d.value}
                </a>
              ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {footerInfo.copyright}</p>
          <p className="font-mono uppercase tracking-[0.3em]">{footerInfo.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
