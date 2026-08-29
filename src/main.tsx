import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./styles.css";
import App from "./App.tsx";
import { initSentry, Sentry } from "./lib/sentry";

initSentry();

// On refresh, browsers restore the previous scroll position by default —
// this site's hero (auto-intro, scroll-scrubbed video) assumes it's starting
// from the very top, so force that instead of trusting scroll restoration.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

// HashRouter, not BrowserRouter: routes live at /#/reuse-component rather
// than a clean /reuse-component path. That means every route works on any
// static host with zero server-side rewrite config (no "index.html for
// all paths" fallback needed), since the server only ever sees a request
// for "/" — the part after "#" is resolved entirely client-side.
// Sentry.ErrorBoundary catches render-time errors React's own lifecycle
// would otherwise turn into a blank white screen — window.onerror (which
// Sentry.init also listens for) doesn't see those, only this does.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ padding: "4rem 1.5rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <p>Something went wrong. Please refresh the page.</p>
        </div>
      }
    >
      <HashRouter>
        <App />
      </HashRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>
);
