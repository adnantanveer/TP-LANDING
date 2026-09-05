/* ============================================================================
   scroll-world — portable scroll-scrubbed camera-flight engine
   ----------------------------------------------------------------------------
   Vendored from the "scroll-world" skill / LandingPageUK's scrub-engine.js.
   Framework-agnostic vanilla JS, zero dependencies, ported to TS with two
   changes from the original:
     1. `export`ed instead of relying on the UMD/`window.mountScrollWorld` tail
        (this file is bundled by Vite, not loaded as a raw <script>).
     2. `mountScrollWorld` now returns a cleanup function that removes every
        `window` listener it registers — the original never tore anything
        down (fine for a static <script src>, unsafe for a React component
        that can mount/unmount, especially under StrictMode's double-invoke).

   Everything else — the DOM it builds, the CSS classes, the scroll math — is
   unchanged. See THEME below for how a host page reskins it purely via CSS
   custom properties; no mechanic-level code here needs to change per brand.

   THEME (CSS custom properties; set on the container or :root to override)
     --sw-bg         page background (match your scene bg for seamless posters)
     --sw-ink        primary text
     --sw-ink-soft   secondary text
     --sw-accent     default accent (each section overrides via its `accent`)
     --sw-font-display / --sw-font-body
   ========================================================================== */

export interface ScrollWorldSection {
  id?: string;
  label?: string;
  still?: string;
  stillMobile?: string;
  clip?: string;
  clipMobile?: string;
  accent?: string;
  scroll?: number;
  linger?: number;
  /** First section only: fraction (0..1) into this section's own scroll
   * range before its copy starts fading in — 0 (default) keeps the
   * original "greets on landing" behavior (visible immediately at the
   * very top of the page). Has no effect on any other section. */
  introAt?: number;
  eyebrow?: string;
  title?: string;
  body?: string;
  tags?: string[];
  cta?: {
    primary?: { label: string; href?: string };
    secondary?: { label: string; href?: string };
  };
}

export interface ScrollWorldConfig {
  brand?: { name?: string; href?: string };
  cta?: { label?: string; href?: string };
  hint?: string;
  nav?: boolean;
  atmosphere?: boolean;
  diveScroll?: number;
  connScroll?: number;
  crossfade?: number;
  sections: ScrollWorldSection[];
  connectors?: (string | null)[];
  connectorsMobile?: (string | null)[];
  /** Plays the first section's clip forward natively (slow motion, not
   * scroll-driven) once *externally triggered* (see `startAutoIntro` on
   * mountScrollWorld's returned controls — this does NOT self-trigger on
   * load, so a host page can time it to when its own intro/loader actually
   * finishes) until the clip's own currentTime reaches this many seconds,
   * then pauses and reveals the `hint` text. Any scroll during that window
   * cuts it short and hands off to normal scroll-scrubbing immediately.
   * Omit (default) to keep the original behavior — frozen on frame 0 until
   * the user scrolls. */
  autoIntroSeconds?: number;
  /** Playback rate during the auto-intro window. Default 0.5 (slow motion). */
  autoIntroRate?: number;
  /** Extra scroll track appended after the last section, in viewport
   * heights, so its final crossfade/settle fully completes before the pin
   * releases into whatever comes next. Default 1 (a full viewport height)
   * — lower it (e.g. 0.3) for an instance where that default reads as a
   * long dead gap of unchanging content before the next section arrives. */
  runwayVh?: number;
}

export interface ScrollWorldControls {
  destroy: () => void;
  /** No-op if autoIntroSeconds isn't set, it's already run, or the user has
   * already scrolled away from the top. Safe to call before the first
   * section's clip has finished loading — it'll start as soon as it's ready. */
  startAutoIntro: () => void;
}

interface Segment {
  kind: "dive" | "conn";
  si: number;
  clip?: string;
  clipM?: string;
  still?: string;
  stillM?: string;
  accent?: string;
  w: number;
  linger?: number;
  start: number;
  end: number;
  el: HTMLDivElement;
  img: HTMLImageElement;
  video: HTMLVideoElement | null;
  hasClip: boolean;
  loading: boolean;
  ready: boolean;
  cur: number;
  target: number;
  visible: boolean;
  /** Set once the auto-intro finishes: the video-progress fraction it was
   * playing at when paused. Scroll position 0 for this segment then maps to
   * this fraction instead of true frame 0, so scroll-scrub picks up from
   * where playback stopped instead of rewinding. */
  introFloor?: number;
}

interface SectionWithSeg extends ScrollWorldSection {
  _seg?: Segment;
}

export function mountScrollWorld(container: HTMLElement, config: ScrollWorldConfig): ScrollWorldControls {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const smallMQ = window.matchMedia("(max-width: 860px)");
  const isMobile = () => coarse || smallMQ.matches;
  const SECTIONS: SectionWithSeg[] = config.sections || [];
  const CONNECTORS = config.connectors || [];
  const CONNECTORS_M = config.connectorsMobile || [];
  const DIVE_W = config.diveScroll || 1.3;
  const CONN_W = config.connScroll || 0.9;
  const CROSSFADE = config.crossfade != null ? config.crossfade : 0.12;
  const N = SECTIONS.length;
  let destroyed = false;
  const cleanupFns: Array<() => void> = [];

  if (!N) return { destroy: () => {}, startAutoIntro: () => {} };

  injectCSS();
  container.classList.add("sw-root");

  // ---- build the interleaved segment chain: dive0, conn0, dive1, … diveN-1 ----
  const SEGMENTS: Segment[] = [];
  SECTIONS.forEach((s, i) => {
    const dive: Segment = {
      kind: "dive",
      si: i,
      clip: s.clip,
      clipM: s.clipMobile,
      still: s.still,
      stillM: s.stillMobile,
      accent: s.accent,
      w: s.scroll || DIVE_W,
      linger: s.linger || 0,
      start: 0,
      end: 0,
      el: null as unknown as HTMLDivElement,
      img: null as unknown as HTMLImageElement,
      video: null,
      hasClip: false,
      loading: false,
      ready: false,
      cur: 0,
      target: 0,
      visible: false,
    };
    SEGMENTS.push(dive);
    s._seg = dive;
    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push({
        kind: "conn",
        si: i,
        clip: CONNECTORS[i] || undefined,
        clipM: CONNECTORS_M[i] || undefined,
        still: SECTIONS[i + 1].still,
        stillM: SECTIONS[i + 1].stillMobile,
        accent: SECTIONS[i + 1].accent,
        w: CONN_W,
        start: 0,
        end: 0,
        el: null as unknown as HTMLDivElement,
        img: null as unknown as HTMLImageElement,
        video: null,
        hasClip: false,
        loading: false,
        ready: false,
        cur: 0,
        target: 0,
        visible: false,
      });
    }
  });
  const NSEG = SEGMENTS.length;

  // ---- DOM ----
  const sky = el("div", "sw-sky");
  if (config.atmosphere !== false) {
    sky.appendChild(el("div", "sw-sky__grad"));
    sky.appendChild(el("div", "sw-sky__glow"));
  }
  const particles = el("div", "sw-particles");
  sky.appendChild(particles);

  const scrollbar = el("div", "sw-scrollbar");
  const scrollbarFill = el("span");
  scrollbar.appendChild(scrollbarFill);

  const topbar = el("div", "sw-topbar");
  if (config.brand) {
    const brand = el("a", "sw-brand") as HTMLAnchorElement;
    brand.href = config.brand.href || "#";
    brand.appendChild(el("span", "sw-brand__mark"));
    const nm = el("span", "sw-brand__name");
    nm.textContent = config.brand.name || "";
    brand.appendChild(nm);
    topbar.appendChild(brand);
  }
  const nav = el("nav", "sw-nav");
  if (config.nav !== false) topbar.appendChild(nav);
  if (config.cta && config.cta.label) {
    const c = el("a", "sw-topcta") as HTMLAnchorElement;
    c.href = config.cta.href || "#";
    c.textContent = config.cta.label;
    topbar.appendChild(c);
  }

  const stage = el("div", "sw-stage");
  const copylayer = el("div", "sw-copylayer");
  const route = el("div", "sw-route");
  const hint = el("div", "sw-hint sw-hint--idle");
  const hintText = el("span");
  hintText.textContent = config.hint || "scroll";
  hint.appendChild(hintText);
  hint.appendChild(el("i"));
  const track = el("div", "sw-track");

  [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach((n) => container.appendChild(n));

  // segment scenes
  SEGMENTS.forEach((s) => {
    const scene = el("div", "sw-scene");
    scene.style.setProperty("--sw-accent", s.accent || "");
    const img = el("img", "sw-scene__still") as HTMLImageElement;
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    const poster = isMobile() && s.stillM ? s.stillM : s.still;
    if (poster) img.src = poster;
    scene.appendChild(img);
    stage.appendChild(scene);
    s.el = scene as HTMLDivElement;
    s.img = img;
  });

  // per-section copy / route / nav
  const copies: HTMLElement[] = [];
  const dots: HTMLButtonElement[] = [];
  SECTIONS.forEach((s, i) => {
    const c = el("article", "sw-copy");
    c.style.setProperty("--sw-accent", s.accent || "");
    c.innerHTML =
      `<span class="sw-copy__num">${pad(i + 1)} / ${pad(N)}</span>` +
      (s.eyebrow ? `<span class="sw-copy__eyebrow">${esc(s.eyebrow)}</span>` : "") +
      (s.title ? `<h2 class="sw-copy__title">${esc(s.title)}</h2>` : "") +
      (s.body ? `<p class="sw-copy__body">${esc(s.body)}</p>` : "") +
      (s.tags && s.tags.length ? `<ul class="sw-copy__tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "") +
      (s.cta ? `<div class="sw-copy__cta">${ctaBtns(s.cta)}</div>` : "");
    copylayer.appendChild(c);
    copies.push(c);

    const dot = el("button", "sw-route__dot") as HTMLButtonElement;
    dot.style.setProperty("--sw-accent", s.accent || "");
    dot.innerHTML = `<span class="sw-route__label">${esc(s.label || "")}</span><i></i>`;
    dot.addEventListener("click", () => jumpTo(i));
    route.appendChild(dot);
    dots.push(dot);

    if (config.nav !== false) {
      const b = el("button", "sw-nav__item") as HTMLButtonElement;
      b.textContent = s.label || "";
      b.addEventListener("click", () => jumpTo(i));
      nav.appendChild(b);
    }
  });

  // ---- math ----
  const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x: number) => {
    x = clamp(x);
    return x * x * (3 - 2 * x);
  };
  const lingerEase = (x: number, L: number) => {
    L = clamp(L);
    const c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  };
  // Auto-intro: play SEGMENTS[0]'s clip natively for config.autoIntroMs once
  // it's *externally triggered* (via the returned controls' startAutoIntro,
  // not on load — a host page times that call to when its own intro/loader
  // actually finishes, not to whenever this clip happens to finish loading
  // in the background, which could be well before the loader is done).
  // `introActive` gates raf()'s scroll-scrub forcing off that segment while
  // it's playing natively, and read()'s hint opacity (hidden during
  // playback, revealed once it stops).
  let introActive = false;
  let introTriggered = false;
  let introRequested = false;
  function startAutoIntro() {
    if (introRequested || !config.autoIntroSeconds) return;
    introRequested = true;
    tryStartAutoIntro();
  }
  function tryStartAutoIntro() {
    if (introTriggered || !introRequested || !config.autoIntroSeconds) return;
    const first = SEGMENTS[0];
    if (!first?.video || !first.ready) return; // will retry from the clip's own ready path
    if ((window.scrollY || window.pageYOffset) > 40) return; // already scrolled past the top
    introTriggered = true;
    introActive = true;
    const targetSeconds = config.autoIntroSeconds;
    first.video.playbackRate = config.autoIntroRate ?? 0.5;
    first.video.play().catch(() => {
      introActive = false; // autoplay was blocked — fall back to normal scroll-scrub immediately
    });
    let introRaf = 0;
    const endIntro = (clampToTarget: boolean) => {
      if (!introActive) return;
      introActive = false;
      cancelAnimationFrame(introRaf);
      try {
        if (first.video) {
          // `timeupdate` only fires every ~250ms in most engines — by the
          // time it (or this rAF poll) observes currentTime >= target, the
          // video has already drifted past it, and .pause() itself isn't
          // instant either. Force the exact frame instead of trusting
          // wherever playback happened to be caught, but only when we
          // stopped BECAUSE we reached the target — a scroll interrupt
          // should freeze wherever the user actually saw it stop, not jump.
          if (clampToTarget) first.video.currentTime = Math.min(targetSeconds, first.video.duration || targetSeconds);
          first.video.pause();
          first.video.playbackRate = 1;
        }
        // Without this, the very next raf()/read() tick would compute
        // target from actual scroll position (still ~0) and yank the video
        // straight back to frame 0 — a full rewind, not a "stop". Anchoring
        // scroll position 0 to the fraction it actually paused at (and
        // matching `cur` so there's nothing to lerp away from) makes
        // scroll-scrub continue from here instead of restarting.
        if (first.video && first.video.duration) {
          first.introFloor = clamp(first.video.currentTime / first.video.duration, 0, 0.98);
          first.cur = first.introFloor;
        }
      } catch {
        /* noop */
      }
      window.removeEventListener("scroll", onScrollDuringIntro);
      // read() is otherwise only ever called from a scroll/layout event —
      // without this, the hint would stay hidden until the user's first
      // scroll tick instead of appearing the instant playback stops.
      read();
    };
    // Video-time-based, not a wall-clock timer — "stop at 1.5s of the clip's
    // own timing" should hold regardless of playbackRate. Polled per-frame
    // (not `timeupdate`, which fires too coarsely to catch the target
    // precisely) so the clamp above only ever needs to correct a
    // sub-frame's worth of drift.
    const pollIntro = () => {
      if (!introActive) return;
      if (first.video && first.video.currentTime >= targetSeconds) {
        endIntro(true);
        return;
      }
      introRaf = requestAnimationFrame(pollIntro);
    };
    introRaf = requestAnimationFrame(pollIntro);
    const onScrollDuringIntro = () => endIntro(false);
    window.addEventListener("scroll", onScrollDuringIntro, { passive: true, once: true });
  }

  let vh = window.innerHeight,
    stageX = 0,
    totalW = 0,
    activeIndex = -1,
    ticking = false,
    base = 0;
  let laidOutW = window.innerWidth;

  function layout() {
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    base = window.scrollY + container.getBoundingClientRect().top;
    let off = 0;
    SEGMENTS.forEach((s) => {
      s.start = base + off * vh;
      off += s.w;
      s.end = base + off * vh;
    });
    totalW = off;
    track.style.height = totalW * vh + (config.runwayVh ?? 1) * vh + "px";
    read();
  }

  function jumpTo(i: number) {
    const seg = SECTIONS[i]._seg!;
    window.scrollTo({ top: seg.start + (seg.end - seg.start) * 0.5, behavior: reduce ? "auto" : "smooth" });
  }

  function loadClip(s: Segment) {
    if (reduce || s.loading || !s.clip) return;
    s.loading = true;
    const url = isMobile() && s.clipM ? s.clipM : s.clip;
    fetch(url!)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("404"))))
      .then((blob) => {
        if (destroyed) return;
        const v = document.createElement("video");
        v.className = "sw-scene__video";
        v.muted = true;
        v.playsInline = true;
        v.preload = "auto";
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.src = URL.createObjectURL(blob);
        v.addEventListener("loadedmetadata", () => {
          s.ready = true;
          read();
          if (s === SEGMENTS[0]) tryStartAutoIntro();
        });
        v.addEventListener(
          "seeked",
          () => {
            s.el.classList.add("has-clip");
          },
          { once: true }
        );
        v.addEventListener("loadeddata", () => {
          // Don't undo the auto-intro's own play() — this handler normally
          // keeps every freshly-loaded clip paused/static until scroll-scrub
          // takes over, but segment 0 mid-auto-intro is deliberately playing
          // itself natively.
          if (!(introActive && s === SEGMENTS[0])) {
            try {
              v.pause();
            } catch {
              /* noop */
            }
          }
          if (userReady) primeVideo(v);
        });
        s.el.appendChild(v);
        s.video = v;
        s.hasClip = true;
      })
      .catch(() => {
        s.loading = false;
      });
  }

  function read() {
    const y = window.scrollY || window.pageYOffset;
    const fade = CROSSFADE * vh;
    let ci = 0;
    for (let i = 0; i < NSEG; i++) if (y >= SEGMENTS[i].start) ci = i;

    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (y > s.start - 1.6 * vh && y < s.end + 1.6 * vh) loadClip(s);
      const local = clamp((y - s.start) / (s.end - s.start), 0, 1);
      // linger first (guaranteed f(0)=0, f(1)=1 on the raw 0..1 scroll
      // fraction), THEN rescale into the introFloor..1 range — the other
      // order (rescale first, then linger) breaks that f(0)=0 guarantee,
      // since lingerEase(introFloor, L) != introFloor for L>0, which
      // reintroduced exactly the rewind/jump introFloor exists to prevent.
      const eased = s.linger ? lingerEase(local, s.linger) : local;
      s.target = s.introFloor ? s.introFloor + (1 - s.introFloor) * eased : eased;
      let outside = 0;
      if (y < s.start) outside = s.start - y;
      else if (y > s.end) outside = y - s.end;
      const op = smooth(1 - outside / fade);
      s.el.style.opacity = String(op);
      s.visible = op > 0.001;
      s.el.style.zIndex = i === ci ? "120" : String(100 + Math.round(op * 10));
      if (!s.hasClip || !s.ready) {
        const sc = reduce ? 1 : 1.03 + local * 0.14;
        s.img.style.transform = `translateX(${stageX - 2}vw) scale(${sc.toFixed(3)})`;
      }
    }

    for (let i = 0; i < N; i++) {
      const seg = SECTIONS[i]._seg!;
      const pr = clamp((y - seg.start) / (seg.end - seg.start), 0, 1);
      const before = y < seg.start,
        after = y > seg.end;
      let cop: number;
      if (i === 0 && !SECTIONS[i].introAt) cop = before || after ? 0 : smooth(1 - pr / 0.62);
      else if (i === 0) {
        // Delayed intro: same fixed-pixel fade-in/out window as a middle
        // section (see the `else` branch below), just anchored to a point
        // partway into this section's own range instead of its very start —
        // copy stays hidden until the video reaches that point, then fades
        // in, holds, and fades out approaching the section's end.
        const introAt = clamp(SECTIONS[i].introAt ?? 0, 0, 0.95);
        const introY = seg.start + introAt * (seg.end - seg.start);
        const distIn = y - introY,
          distOut = seg.end - y;
        const fadeWindow = Math.min(0.5 * vh, (seg.end - introY) / 2);
        cop = before || after || y < introY ? 0 : smooth(Math.min(distIn, distOut) / fadeWindow);
      } else if (i === N - 1) cop = before ? 0 : smooth(pr / 0.4);
      else {
        const distIn = y - seg.start,
          distOut = seg.end - y;
        const fadeWindow = Math.min(0.5 * vh, (seg.end - seg.start) / 2);
        cop = before || after ? 0 : smooth(Math.min(distIn, distOut) / fadeWindow);
      }
      const c = copies[i];
      c.style.opacity = String(cop);
      c.style.transform = reduce ? "translateY(-50%)" : `translateY(calc(-50% + ${(0.5 - pr) * 4}vh))`;
      c.style.pointerEvents = cop > 0.5 ? "auto" : "none";
    }

    const cur = SEGMENTS[ci];
    const near = clamp(
      cur.kind === "dive" ? cur.si : (cur.end - cur.start ? (y - cur.start) / (cur.end - cur.start) : 0) > 0.5 ? cur.si + 1 : cur.si,
      0,
      N - 1
    );
    if (near !== activeIndex) {
      activeIndex = near;
      dots.forEach((d, k) => d.classList.toggle("is-active", k === near));
      nav.querySelectorAll(".sw-nav__item").forEach((n, k) => n.classList.toggle("is-active", k === near));
      container.style.setProperty("--sw-accent", SECTIONS[near].accent || "");
    }
    scrollbarFill.style.transform = `scaleX(${clamp((y - base) / (totalW * vh))})`;
    // Hidden for the auto-intro's own duration (the clip is playing itself,
    // not asking to be scrolled yet). Once it stops, stays at full opacity
    // for this instance's ENTIRE scroll range — not just a fade within the
    // first half-viewport of scroll — and only fades out over the final
    // stretch as the whole section is actually finishing.
    const distFromEnd = base + totalW * vh - y;
    const hintFadeWindow = 0.6 * vh;
    hint.style.opacity = introActive ? "0" : String(clamp(distFromEnd / hintFadeWindow));
    if (particles) particles.style.transform = `translate3d(0, ${-y * 0.05}px, 0)`;
    ticking = false;
  }

  function raf() {
    if (destroyed) return;
    const eps = isMobile() ? 0.02 : 0.008;
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (introActive && s === SEGMENTS[0]) continue; // playing natively — don't fight it with scroll-scrub
      if (!s.hasClip || !s.ready || !s.video) continue;
      if (s.video.seeking) continue;
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
      s.cur += (s.target - s.cur) * (reduce ? 1 : 0.18);
      const dur = s.video.duration || 1;
      const t = clamp(s.cur, 0, 0.999) * dur;
      if (Math.abs(s.video.currentTime - t) > eps) {
        try {
          s.video.currentTime = t;
        } catch {
          /* noop */
        }
      }
    }
    requestAnimationFrame(raf);
  }

  let userReady = false;
  function primeVideo(v: HTMLVideoElement | null) {
    if (!isMobile() || !v) return;
    try {
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          try {
            v.pause();
          } catch {
            /* noop */
          }
        }).catch(() => {});
      }
    } catch {
      /* noop */
    }
  }
  function onFirstGesture() {
    if (userReady) return;
    userReady = true;
    SEGMENTS.forEach((s) => primeVideo(s.video));
  }
  window.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
  window.addEventListener("touchstart", onFirstGesture, { once: true, passive: true });
  cleanupFns.push(() => window.removeEventListener("pointerdown", onFirstGesture));
  cleanupFns.push(() => window.removeEventListener("touchstart", onFirstGesture));

  seedParticles(particles, reduce || coarse);

  // The hint sits centered (larger, ".sw-hint--idle") whenever the user
  // isn't actively scrolling, and drops down to its normal corner position
  // the moment they start — purely based on scroll activity, independent of
  // the opacity fade above (which still governs overall show/hide). A
  // scroll event clears the idle state immediately; idle resumes once no
  // further scroll event has arrived for HINT_IDLE_MS. 3s (not the previous
  // 260ms) so a normal short pause between scroll gestures — reading a
  // line, a moment's hesitation — doesn't read as the hint restlessly
  // floating up and dropping back on every little break; it only resets
  // once the user has genuinely stopped.
  const HINT_IDLE_MS = 3000;
  let hintIdleTimer: ReturnType<typeof setTimeout> | undefined;
  const onScroll = () => {
    hint.classList.remove("sw-hint--idle");
    clearTimeout(hintIdleTimer);
    hintIdleTimer = setTimeout(() => hint.classList.add("sw-hint--idle"), HINT_IDLE_MS);
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(read);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  cleanupFns.push(() => {
    window.removeEventListener("scroll", onScroll);
    clearTimeout(hintIdleTimer);
  });

  function onResize() {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  }
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", layout);
  window.addEventListener("load", layout);
  cleanupFns.push(() => window.removeEventListener("resize", onResize));
  cleanupFns.push(() => window.removeEventListener("orientationchange", layout));
  cleanupFns.push(() => window.removeEventListener("load", layout));

  layout();
  requestAnimationFrame(raf);

  // ---- helpers ----
  function el(tag: string, cls?: string) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function pad(n: number) {
    return String(n).padStart(2, "0");
  }
  function esc(s: string) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c);
  }
  function ctaBtns(cta: NonNullable<ScrollWorldSection["cta"]>) {
    let h = "";
    if (cta.primary) h += `<a class="sw-btn sw-btn--primary" href="${esc(cta.primary.href || "#")}">${esc(cta.primary.label)}</a>`;
    if (cta.secondary) h += `<a class="sw-btn sw-btn--ghost" href="${esc(cta.secondary.href || "#")}">${esc(cta.secondary.label)}</a>`;
    return h;
  }

  return {
    startAutoIntro,
    destroy: () => {
      destroyed = true;
      cleanupFns.forEach((fn) => fn());
      SEGMENTS.forEach((s) => {
        if (s.video) {
          try {
            URL.revokeObjectURL(s.video.src);
          } catch {
            /* noop */
          }
        }
      });
      // Remove every top-level node this call appended to `container` —
      // without this, a remount (React StrictMode's dev-only double-invoke,
      // Fast Refresh, or any real unmount/remount) stacks a second full copy
      // of the topbar/copylayer/route rail on top of the first instead of
      // replacing it, since container.appendChild() never clears existing
      // children.
      [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach((n) => n.remove());
      container.classList.remove("sw-root");
    },
  };
}

function seedParticles(host: HTMLElement | null, reduce: boolean) {
  if (!host || reduce) return;
  const kinds = ["dot", "dot", "ring"];
  const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
  for (let k = 0; k < 20; k++) {
    const s = document.createElement("span");
    s.className = "sw-pt sw-pt--" + kinds[k % kinds.length];
    s.style.left = seeds[k % seeds.length] + "vw";
    s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + "vh";
    s.style.setProperty("--sw-sc", (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
    const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
    s.style.animationDuration = dur + "s";
    s.style.animationDelay = -(seeds[(k * 2) % seeds.length] % dur) + "s";
    host.appendChild(s);
  }
}

function injectCSS() {
  if (document.getElementById("sw-css")) return;
  const css = `
  .sw-root{--sw-bg:#F5EDE0;--sw-ink:#241d2b;--sw-ink-soft:#6a6072;--sw-accent:#8a7bb5;
    --sw-font-display:ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,sans-serif;
    --sw-font-body:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
    color:var(--sw-ink);font-family:var(--sw-font-body);}
  .sw-sky{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var(--sw-bg);}
  .sw-sky__grad{position:absolute;inset:-10%;background:linear-gradient(178deg,color-mix(in srgb,var(--sw-accent) 12%,var(--sw-bg)) 0%,var(--sw-bg) 55%,color-mix(in srgb,var(--sw-accent) 6%,var(--sw-bg)) 100%);}
  .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,color-mix(in srgb,var(--sw-accent) 22%,transparent),transparent 70%),radial-gradient(46% 34% at 50% 50%,color-mix(in srgb,#fff 45%,transparent),transparent 70%);}
  .sw-particles{position:absolute;inset:-6% -2%;will-change:transform;}
  .sw-pt{position:absolute;width:13px;height:13px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite;}
  .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%;}
  .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--sw-accent) 60%,#000),#000 82%);}
  .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 55%,transparent);}
  @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.5}88%{opacity:.45}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
  .sw-scrollbar{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:color-mix(in srgb,var(--sw-accent) 14%,transparent);}
  .sw-scrollbar span{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--sw-accent);}
  .sw-topbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:clamp(14px,2.4vw,26px) clamp(18px,5vw,64px);}
  .sw-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--sw-ink);}
  .sw-brand__mark{width:24px;height:28px;border-radius:7px 7px 10px 10px;background:linear-gradient(160deg,var(--sw-accent),color-mix(in srgb,var(--sw-accent) 60%,#000));box-shadow:0 6px 14px color-mix(in srgb,var(--sw-accent) 40%,transparent);}
  .sw-brand__name{font-family:var(--sw-font-display);font-weight:700;font-size:1.1rem;}
  .sw-nav{display:flex;gap:4px;padding:5px;background:color-mix(in srgb,#fff 55%,transparent);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--sw-accent) 16%,transparent);border-radius:999px;}
  .sw-nav__item{font:inherit;font-size:.82rem;color:var(--sw-ink-soft);border:0;background:transparent;cursor:pointer;padding:7px 14px;border-radius:999px;transition:color .25s,background .25s;}
  .sw-nav__item:hover{color:var(--sw-ink);} .sw-nav__item.is-active{color:#fff;background:var(--sw-accent);}
  .sw-topcta{text-decoration:none;font-weight:600;font-size:.9rem;color:#fff;background:var(--sw-ink);padding:10px 20px;border-radius:999px;white-space:nowrap;}
  .sw-stage{position:fixed;inset:0;z-index:10;pointer-events:none;}
  .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity;}
  .sw-scene__video,.sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;}
  .sw-scene__still{will-change:transform;} .sw-scene.has-clip .sw-scene__still{opacity:0;} .sw-scene__video{z-index:1;}
  .sw-copylayer{position:fixed;inset:0;z-index:20;pointer-events:none;}
  .sw-copylayer::before{content:"";position:absolute;inset:0;width:min(58vw,780px);background:linear-gradient(90deg,var(--sw-bg) 0%,color-mix(in srgb,var(--sw-bg) 82%,transparent) 34%,color-mix(in srgb,var(--sw-bg) 40%,transparent) 62%,transparent 100%);}
  .sw-copy{position:absolute;left:clamp(18px,5vw,64px);top:50%;transform:translateY(-50%);width:min(42vw,460px);opacity:0;will-change:opacity,transform;}
  .sw-copy__num{font-family:ui-monospace,Menlo,monospace;font-size:.74rem;letter-spacing:.12em;color:var(--sw-ink-soft);}
  .sw-copy__eyebrow{display:block;margin-top:18px;font-family:var(--sw-font-display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--sw-accent);}
  .sw-copy__title{font-family:var(--sw-font-display);font-weight:700;color:var(--sw-ink);font-size:clamp(2rem,4.4vw,3.5rem);line-height:1.03;margin:12px 0 0;letter-spacing:-.01em;text-shadow:0 2px 20px color-mix(in srgb,var(--sw-bg) 70%,transparent);}
  .sw-copy__body{margin-top:18px;font-size:clamp(1rem,1.25vw,1.14rem);line-height:1.55;color:color-mix(in srgb,var(--sw-ink) 78%,var(--sw-ink-soft));max-width:40ch;text-shadow:0 1px 12px color-mix(in srgb,var(--sw-bg) 90%,transparent);}
  .sw-copy__tags{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;}
  .sw-copy__tags li{font-size:.82rem;font-weight:600;color:color-mix(in srgb,var(--sw-accent) 70%,#000);padding:7px 14px;border-radius:999px;background:color-mix(in srgb,var(--sw-accent) 14%,#fff);border:1px solid color-mix(in srgb,var(--sw-accent) 30%,transparent);}
  .sw-copy__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;pointer-events:auto;}
  .sw-btn{text-decoration:none;font-weight:600;font-size:.95rem;padding:13px 24px;border-radius:999px;transition:transform .2s;}
  .sw-btn--primary{color:#fff;background:var(--sw-ink);} .sw-btn--primary:hover{transform:translateY(-2px);}
  .sw-btn--ghost{color:var(--sw-ink);border:1.5px solid color-mix(in srgb,var(--sw-ink) 25%,transparent);} .sw-btn--ghost:hover{transform:translateY(-2px);}
  .sw-route{position:fixed;right:clamp(14px,2.4vw,30px);top:50%;z-index:40;transform:translateY(-50%);display:flex;flex-direction:column;gap:22px;padding:18px 10px;}
  .sw-route::before{content:"";position:absolute;left:50%;top:22px;bottom:22px;width:2px;transform:translateX(-50%);background:var(--sw-accent);opacity:.28;}
  .sw-route__dot{position:relative;border:0;background:transparent;cursor:pointer;width:14px;height:14px;display:grid;place-items:center;}
  .sw-route__dot i{width:9px;height:9px;border-radius:50%;background:color-mix(in srgb,var(--sw-accent) 40%,transparent);transition:transform .3s,background .3s,box-shadow .3s;}
  .sw-route__dot:hover i{transform:scale(1.25);background:var(--sw-accent);}
  .sw-route__dot.is-active i{background:var(--sw-accent);transform:scale(1.4);box-shadow:0 0 0 5px color-mix(in srgb,var(--sw-accent) 22%,transparent);}
  .sw-route__label{position:absolute;right:24px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;font-size:.78rem;font-weight:600;color:var(--sw-ink);background:color-mix(in srgb,#fff 85%,transparent);backdrop-filter:blur(6px);padding:5px 11px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;border:1px solid color-mix(in srgb,var(--sw-accent) 14%,transparent);}
  .sw-route__dot:hover .sw-route__label,.sw-route__dot.is-active .sw-route__label{opacity:1;transform:translateY(-50%) translateX(0);}
  .sw-hint{--sw-hint-bottom:26px;position:fixed;inset:0;z-index:30;pointer-events:none;transition:opacity .3s;}
  .sw-hint>span{position:absolute;left:50%;bottom:calc(var(--sw-hint-bottom) + 44px);transform:translate(-50%,0);font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-ink-soft);white-space:nowrap;transition:bottom .9s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1),font-size .9s ease;}
  .sw-hint--idle>span{bottom:50%;transform:translate(-50%,50%);font-size:1.5rem;letter-spacing:.08em;}
  .sw-hint>i{position:absolute;left:50%;bottom:var(--sw-hint-bottom);transform:translateX(-50%);width:22px;height:34px;border-radius:12px;border:2px solid color-mix(in srgb,var(--sw-ink) 28%,transparent);}
  .sw-hint>i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:7px;border-radius:2px;background:var(--sw-accent);transform:translateX(-50%);animation:sw-wheel 1.7s ease-in-out infinite;}
  @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:17px}}
  .sw-track{position:relative;z-index:1;width:100%;pointer-events:none;}
  @media (max-width:860px){
    .sw-nav{display:none;}
    .sw-copylayer::before{width:100%;height:60%;top:auto;bottom:0;background:linear-gradient(0deg,var(--sw-bg) 8%,color-mix(in srgb,var(--sw-bg) 70%,transparent) 46%,transparent 100%);}
    .sw-copy{left:clamp(18px,5vw,64px);right:clamp(18px,5vw,64px);top:auto;bottom:clamp(64px,14vh,120px);transform:none;width:auto;max-width:560px;}
    .sw-copy{bottom:calc(clamp(56px,12dvh,110px) + env(safe-area-inset-bottom));}
    .sw-copy__title{font-size:clamp(1.9rem,7.5vw,2.7rem);}
    .sw-copy__body{max-width:none;font-size:clamp(.98rem,3.6vw,1.1rem);} .sw-scene__video,.sw-scene__still{object-position:center 46%;}
    .sw-hint{--sw-hint-bottom:calc(20px + env(safe-area-inset-bottom));}
    .sw-route{gap:16px;right:6px;} .sw-route__label{display:none;}
  }
  @media (max-width:860px) and (orientation:portrait){
    .sw-scene__video,.sw-scene__still{object-position:center 44%;}
  }
  @media (hover:none) and (pointer:coarse){
    .sw-route{padding:14px 6px;}
    .sw-route__dot{width:28px;height:28px;}
    .sw-btn{padding:15px 26px;}
  }
  @media (prefers-reduced-motion:reduce){ .sw-hint i::after{animation:none;} .sw-hint{transition:opacity .3s;} .sw-pt{display:none;} }
  `;
  const style = document.createElement("style");
  style.id = "sw-css";
  style.textContent = "@layer sw {\n" + css + "\n}";
  document.head.appendChild(style);
}
