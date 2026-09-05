import { useEffect, useRef } from "react";

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
let scriptPromise: Promise<void> | null = null;

// Calendly's own official inline-embed technique: their script scans the
// DOM for `.calendly-inline-widget[data-url]` and initializes it — there's
// no self-hostable alternative, since this talks to Calendly's own backend
// for real-time availability. Loaded once (module-level promise, not
// per-mount) since multiple pages could render this component.
function loadCalendlyScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${CALENDLY_SCRIPT_SRC}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly widget script"));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function CalendlyEmbed({ url, className, height = 700 }: { url: string; className?: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCalendlyScript().catch(() => {});
  }, []);

  return (
    <div
      ref={ref}
      className={`calendly-inline-widget ${className ?? ""}`}
      data-url={url}
      style={{ minWidth: "320px", height: `${height}px` }}
    />
  );
}
