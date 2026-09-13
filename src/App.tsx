import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ReuseComponent } from "@/pages/ReuseComponent";
import { CaseStudy } from "@/pages/CaseStudy";
import { Jobs } from "@/pages/Jobs";
import { JobDetail } from "@/pages/JobDetail";
import { JobApply } from "@/pages/JobApply";
import { ContactPage } from "@/pages/Contact";
import { NotFound } from "@/pages/NotFound";
import { CosmicDustBackground } from "@/components/background/CosmicDustBackground";

// Redesign concepts (review branch only) — lazy-loaded so their fonts/CSS
// never ship in the main site's bundle unless one of these routes is hit.
const ConceptsIndex = lazy(() => import("@/concepts/ConceptsIndex").then((m) => ({ default: m.ConceptsIndex })));
const SignalPage = lazy(() => import("@/concepts/signal/SignalPage").then((m) => ({ default: m.SignalPage })));
const SignalContactPage = lazy(() => import("@/concepts/signal/ContactPage").then((m) => ({ default: m.SignalContactPage })));
const VantagePage = lazy(() => import("@/concepts/vantage/VantagePage").then((m) => ({ default: m.VantagePage })));
const VantageContactPage = lazy(() => import("@/concepts/vantage/ContactPage").then((m) => ({ default: m.VantageContactPage })));
const VertexPage = lazy(() => import("@/concepts/vertex/VertexPage").then((m) => ({ default: m.VertexPage })));
const VertexContactPage = lazy(() => import("@/concepts/vertex/ContactPage").then((m) => ({ default: m.VertexContactPage })));
const ConcretePage = lazy(() => import("@/concepts/concrete/ConcretePage").then((m) => ({ default: m.ConcretePage })));
const ConcreteContactPage = lazy(() => import("@/concepts/concrete/ContactPage").then((m) => ({ default: m.ConcreteContactPage })));
const SurgePage = lazy(() => import("@/concepts/surge/SurgePage").then((m) => ({ default: m.SurgePage })));
const SurgeContactPage = lazy(() => import("@/concepts/surge/ContactPage").then((m) => ({ default: m.SurgeContactPage })));
const AirPage = lazy(() => import("@/concepts/air/AirPage").then((m) => ({ default: m.AirPage })));
const AirContactPage = lazy(() => import("@/concepts/air/ContactPage").then((m) => ({ default: m.AirContactPage })));
const ShellPage = lazy(() => import("@/concepts/shell/ShellPage").then((m) => ({ default: m.ShellPage })));
const ShellContactPage = lazy(() => import("@/concepts/shell/ContactPage").then((m) => ({ default: m.ShellContactPage })));
const IndexConceptPage = lazy(() => import("@/concepts/index-concept/IndexConceptPage").then((m) => ({ default: m.IndexConceptPage })));
const IndexContactPage = lazy(() => import("@/concepts/index-concept/ContactPage").then((m) => ({ default: m.IndexContactPage })));
const CrestPage = lazy(() => import("@/concepts/crest/CrestPage").then((m) => ({ default: m.CrestPage })));
const CrestContactPage = lazy(() => import("@/concepts/crest/ContactPage").then((m) => ({ default: m.CrestContactPage })));

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
//
// Also handles a navigation that arrives wanting to land on a specific
// section (e.g. Nav's links, real <Link to="/?section=services">
// navigations so they work from any page — see Nav.tsx). The target
// travels as a query param, not router state: state doesn't survive a hard
// refresh or a pasted/shared link, and the section should both show up in
// the URL and still work after reloading it — a query param does both
// while a same-page anchor would have to stack a second hash on top of the
// route's own ("/#/#services"), which works but reads as a mistake.
//
// Landing on the right pixel is its own problem, separate from knowing
// *which* element to land on. Three independent things can each block or
// undo a scroll attempt after this effect fires:
//   1. Home's intro Loader sets `document.body.style.overflow = "hidden"`
//      for the length of its own cinematic animation (see Loader.tsx) —
//      every scroll attempt made before it releases is a silent no-op, not
//      a wrong-position landing.
//   2. The target section usually exists in the DOM immediately, but
//      content below it keeps arriving asynchronously (CMS fetches that
//      can take over a second on a cold backend — see Hero.tsx's own
//      2500ms fetch timeout), growing the page's real height after the
//      fact.
//   3. The hero itself is a scroll-scrubbed video that keeps settling via
//      transform, not a height change, for a bit after mount — invisible
//      to a resize observer.
// Rather than timing each of these precisely, this retries on every signal
// that any of them just resolved (the overflow lock clearing, the page
// growing) plus a handful of fixed-delay backstops for #3, for a few
// seconds after landing.
function ScrollToTop() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const scrollTo = searchParams.get("section");

  useEffect(() => {
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;

    if (scrollTo) {
      const selector = `#${scrollTo}`;
      const scroll = () => document.querySelector(selector)?.scrollIntoView({ block: "start" });

      scroll();
      const ro = new ResizeObserver(scroll);
      ro.observe(document.body);
      const mo = new MutationObserver(scroll);
      mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
      const correctionDelays = [200, 500, 900, 1400, 2000, 2800, 3500];
      const timers = correctionDelays.map((ms) => window.setTimeout(scroll, ms));
      // Nothing on this page legitimately keeps moving past this point —
      // stop correcting so a user who's since scrolled elsewhere on their
      // own doesn't get yanked back by an unrelated late shift.
      const stop = window.setTimeout(() => {
        ro.disconnect();
        mo.disconnect();
      }, 4000);
      return () => {
        ro.disconnect();
        mo.disconnect();
        clearTimeout(stop);
        timers.forEach(clearTimeout);
      };
    }

    // styles.css sets html{scroll-behavior:smooth} for in-page anchor
    // scrolling — bypass it here so a route change snaps to top instantly
    // instead of visibly animating down from wherever the previous page
    // was scrolled to.
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = prevBehavior;
  }, [pathname, scrollTo]);
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
        <Route path="/contact" element={<ContactPage />} />
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
          path="/concepts/signal/contact"
          element={
            <Suspense fallback={null}>
              <SignalContactPage />
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
          path="/concepts/vantage/contact"
          element={
            <Suspense fallback={null}>
              <VantageContactPage />
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
          path="/concepts/vertex/contact"
          element={
            <Suspense fallback={null}>
              <VertexContactPage />
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
          path="/concepts/concrete/contact"
          element={
            <Suspense fallback={null}>
              <ConcreteContactPage />
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
          path="/concepts/surge/contact"
          element={
            <Suspense fallback={null}>
              <SurgeContactPage />
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
          path="/concepts/air/contact"
          element={
            <Suspense fallback={null}>
              <AirContactPage />
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
          path="/concepts/shell/contact"
          element={
            <Suspense fallback={null}>
              <ShellContactPage />
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
        <Route
          path="/concepts/index/contact"
          element={
            <Suspense fallback={null}>
              <IndexContactPage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/crest"
          element={
            <Suspense fallback={null}>
              <CrestPage />
            </Suspense>
          }
        />
        <Route
          path="/concepts/crest/contact"
          element={
            <Suspense fallback={null}>
              <CrestContactPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
