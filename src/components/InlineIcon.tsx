import { sanitizeSvg } from "@/lib/sanitizeSvg";

/** Renders admin-pasted SVG markup, scaled to fill its container regardless
 * of the pasted SVG's own width/height/viewBox, and colored via
 * currentColor if the markup uses it (same as this site's bundled icons
 * always have). Falls back to the item's initial letter when no icon has
 * been set yet, rather than an empty box. */
export function InlineIcon({ svg, fallback, className }: { svg: string; fallback: string; className?: string }) {
  // inline-flex, not the default inline: width/height/padding on a <span>
  // are no-ops for a non-replaced inline element, so h-11/w-11 etc. passed
  // in via `className` would otherwise silently do nothing.
  if (!svg) {
    return (
      <span className={`inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold ${className ?? ""}`}>
        {fallback.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center [&>svg]:h-full [&>svg]:w-full ${className ?? ""}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
    />
  );
}
