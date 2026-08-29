import { useEffect, useRef } from "react";
import { loadRecaptchaV2Script } from "@/lib/recaptcha";

/** v2 checkbox widget — renders Google's actual iframe challenge into a div;
 * the token comes back through `onChange` (null again once it expires). */
export function RecaptchaCheckbox({ siteKey, onChange }: { siteKey: string; onChange: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadRecaptchaV2Script().then(() => {
      if (cancelled || !containerRef.current || rendered.current) return;
      window.grecaptcha!.ready(() => {
        if (cancelled || !containerRef.current || rendered.current) return;
        rendered.current = true;
        window.grecaptcha!.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onChange(token),
          "expired-callback": () => onChange(null),
        });
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <div ref={containerRef} />;
}
