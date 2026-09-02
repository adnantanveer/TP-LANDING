import { footerInfo } from "@/concepts/shared/content";

export function ShellFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-mono text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {footerInfo.copyright}</p>
        <p className="uppercase tracking-wide">{footerInfo.tagline}</p>
      </div>
    </footer>
  );
}
