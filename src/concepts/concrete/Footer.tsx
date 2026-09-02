import { footerInfo } from "@/concepts/shared/content";

export function ConcreteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs font-bold uppercase tracking-wide">
        <p>© {new Date().getFullYear()} {footerInfo.copyright}</p>
        <p>{footerInfo.tagline}</p>
      </div>
    </footer>
  );
}
