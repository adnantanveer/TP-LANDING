const API_URL = import.meta.env.VITE_API_URL as string;

export type RecaptchaConfig = { active: boolean; version: "v2" | "v3"; siteKey: string };

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      render: (
        container: HTMLElement,
        params: { sitekey: string; callback?: (token: string) => void; "expired-callback"?: () => void },
      ) => number;
    };
  }
}

// Fetched once per page load from the admin-managed setting (see Settings →
// reCAPTCHA) rather than baked in at build time — lets the site key/version/
// active flag change without a redeploy.
let configPromise: Promise<RecaptchaConfig> | null = null;
export function getRecaptchaConfig(): Promise<RecaptchaConfig> {
  if (!configPromise) {
    configPromise = fetch(`${API_URL}/api/content/recaptcha`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data): RecaptchaConfig => (data?.active && data?.siteKey ? data : { active: false, version: "v3", siteKey: "" }))
      .catch((): RecaptchaConfig => ({ active: false, version: "v3", siteKey: "" }));
  }
  return configPromise;
}

const scriptPromises = new Map<string, Promise<void>>();
function loadScript(src: string) {
  const cached = scriptPromises.get(src);
  if (cached) return cached;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
  scriptPromises.set(src, promise);
  return promise;
}

// v3 (invisible) — call at submit time, returns a fresh token per action.
export async function getRecaptchaTokenV3(action: string): Promise<string | undefined> {
  const config = await getRecaptchaConfig();
  if (!config.active || config.version !== "v3") return undefined;
  await loadScript(`https://www.google.com/recaptcha/api.js?render=${config.siteKey}`);
  return new Promise((resolve, reject) => {
    window.grecaptcha!.ready(() => {
      window.grecaptcha!.execute(config.siteKey, { action }).then(resolve, reject);
    });
  });
}

// v2 (visible checkbox) — the widget itself lives in <RecaptchaCheckbox>;
// this just loads the shared script it renders into.
export function loadRecaptchaV2Script(): Promise<void> {
  return loadScript("https://www.google.com/recaptcha/api.js");
}
