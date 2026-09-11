import { footerInfo } from "@/concepts/shared/content";

export function SurgeFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {footerInfo.copyright}</p>
        <p className="uppercase tracking-[0.3em]">{footerInfo.tagline}</p>
      </div>
    </footer>
  );
}
