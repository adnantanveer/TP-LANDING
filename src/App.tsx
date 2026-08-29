import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ReuseComponent } from "@/pages/ReuseComponent";
import { CaseStudy } from "@/pages/CaseStudy";
import { Jobs } from "@/pages/Jobs";
import { JobDetail } from "@/pages/JobDetail";
import { JobApply } from "@/pages/JobApply";
import { NotFound } from "@/pages/NotFound";
import { CosmicDustBackground } from "@/components/background/CosmicDustBackground";

const API_URL = import.meta.env.VITE_API_URL as string;

// Setting innerHTML on a container parses <script> tags into inert,
// non-executing nodes (a standard browser behavior) — this rebuilds each
// one as a real <script> element so it actually runs, same trick browsers'
// own devtools use when injecting markup that must execute.
function injectHtml(html: string, target: HTMLElement) {
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const node of Array.from(template.content.childNodes)) {
    if (node instanceof HTMLScriptElement) {
      const script = document.createElement("script");
      for (const attr of Array.from(node.attributes)) script.setAttribute(attr.name, attr.value);
      script.textContent = node.textContent;
      target.appendChild(script);
    } else {
      target.appendChild(node);
    }
  }
}

// Module-level, not component state: StrictMode double-invokes effects in
// dev, and unlike the read-only content fetches elsewhere in this app,
// injecting a chat widget or analytics snippet twice is a real duplicate,
// not a harmless repeated setState — this guards against that regardless of
// how many times the effect below fires.
let scriptsInjected = false;

// Admin-configured third-party embeds (chat widgets, analytics) — see
// Site-wide → Scripts in the admin panel. Runs once, site-wide, regardless
// of route, and is never torn down (a chat widget shouldn't reset on nav).
function GlobalScripts() {
  useEffect(() => {
    if (scriptsInjected) return;
    scriptsInjected = true;

    fetch(`${API_URL}/api/content/scripts`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.headActive && data.head) injectHtml(data.head, document.head);
        if (data.bodyEndActive && data.bodyEnd) injectHtml(data.bodyEnd, document.body);
      })
      .catch(() => {});
  }, []);

  return null;
}

// React Router doesn't reset scroll on navigation (SPA route changes just
// swap the element in place) — without this, clicking from a scrolled-down
// homepage into a case study lands mid-page instead of at its own top.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // styles.css sets html{scroll-behavior:smooth} for in-page anchor
    // scrolling — bypass it here so a route change snaps to top instantly
    // instead of visibly animating down from wherever the previous page
    // was scrolled to.
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = prevBehavior;
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <CosmicDustBackground />
      <ScrollToTop />
      <GlobalScripts />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reuse-component" element={<ReuseComponent />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="/careers" element={<Jobs />} />
        <Route path="/careers/apply" element={<JobApply />} />
        <Route path="/careers/:slug" element={<JobDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
