import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ReuseComponent } from "@/pages/ReuseComponent";
import { CaseStudy } from "@/pages/CaseStudy";
import { Jobs } from "@/pages/Jobs";
import { JobDetail } from "@/pages/JobDetail";
import { JobApply } from "@/pages/JobApply";
import { NotFound } from "@/pages/NotFound";
import { CosmicDustBackground } from "@/components/background/CosmicDustBackground";

// Redesign concepts (review branch only) — lazy-loaded so their fonts/CSS
// never ship in the main site's bundle unless one of these routes is hit.
const ConceptsIndex = lazy(() => import("@/concepts/ConceptsIndex").then((m) => ({ default: m.ConceptsIndex })));
const SignalPage = lazy(() => import("@/concepts/signal/SignalPage").then((m) => ({ default: m.SignalPage })));
const VantagePage = lazy(() => import("@/concepts/vantage/VantagePage").then((m) => ({ default: m.VantagePage })));
const VertexPage = lazy(() => import("@/concepts/vertex/VertexPage").then((m) => ({ default: m.VertexPage })));
const ConcretePage = lazy(() => import("@/concepts/concrete/ConcretePage").then((m) => ({ default: m.ConcretePage })));
const SurgePage = lazy(() => import("@/concepts/surge/SurgePage").then((m) => ({ default: m.SurgePage })));
const AirPage = lazy(() => import("@/concepts/air/AirPage").then((m) => ({ default: m.AirPage })));
const ShellPage = lazy(() => import("@/concepts/shell/ShellPage").then((m) => ({ default: m.ShellPage })));
const IndexConceptPage = lazy(() => import("@/concepts/index-concept/IndexConceptPage").then((m) => ({ default: m.IndexConceptPage })));

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
        <Route
          path="/concepts"
          element={
            <Suspense fallback={null}>
              <ConceptsIndex />
            </Suspense>
          }
        />
        <Route
          path="/concepts/signal"
          element={
            <Suspense fallback={null}>
              <SignalPage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/vantage"
          element={
            <Suspense fallback={null}>
              <VantagePage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/vertex"
          element={
            <Suspense fallback={null}>
              <VertexPage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/concrete"
          element={
            <Suspense fallback={null}>
              <ConcretePage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/surge"
          element={
            <Suspense fallback={null}>
              <SurgePage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/air"
          element={
            <Suspense fallback={null}>
              <AirPage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/shell"
          element={
            <Suspense fallback={null}>
              <ShellPage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/index"
          element={
            <Suspense fallback={null}>
              <IndexConceptPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
