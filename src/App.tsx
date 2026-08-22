import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ReuseComponent } from "@/pages/ReuseComponent";
import { CaseStudy } from "@/pages/CaseStudy";
import { CosmicDustBackground } from "@/components/background/CosmicDustBackground";

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reuse-component" element={<ReuseComponent />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
      </Routes>
    </>
  );
}

export default App;
