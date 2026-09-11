import { footerInfo } from "@/concepts/shared/content";

export function AirFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:px-12">
        <p>© {new Date().getFullYear()} {footerInfo.copyright}</p>
        <p>{footerInfo.tagline}</p>
      </div>
    </footer>
  );
}
