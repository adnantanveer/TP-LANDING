import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

// No-op until VITE_SENTRY_DSN is set — same pattern as the backend and as
// this app's own reCAPTCHA/SMTP/S3 settings: the feature exists and
// activates the moment real credentials are added.
export const sentryEnabled = Boolean(DSN);

export function initSentry() {
  if (!sentryEnabled) return;
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
