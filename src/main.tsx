import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./styles.css";
import App from "./App.tsx";

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
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
