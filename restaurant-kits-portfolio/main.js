import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   TEMP (round 9): logo strip variants for comparison.
   ?logos=2row (default) | 3row | colour | 3row-colour
   Sets html[data-logos] (styles.css has the matching TEMP block), rebuilds the
   rows from the logos in the markup, and pads every track so the loop stays
   seamless up to 1920px wide. Remove once a variant is chosen; the 2row markup
   in index.html is the default and needs no JS.
   ============================================================ */
(() => {
  const allowed = ['2row', '3row', 'colour', '3row-colour'];
  const param = new URLSearchParams(location.search).get('logos');
  const variant = allowed.includes(param) ? param : '2row';
  document.documentElement.dataset.logos = variant;
  const strip = document.querySelector('.brand-strip');
  if (!strip) return;
  const marquees = [...strip.querySelectorAll('.marquee')];
  const visibleTracks = marquees.map((m) => m.querySelector('.marquee-track:not([aria-hidden])'));
  const items = visibleTracks.flatMap((t) => [...t.children]);
  const rowCount = variant.startsWith('3row') ? 3 : marquees.length;
  const rows = Array.from({ length: rowCount }, () => []);
  if (rowCount === marquees.length) {
    visibleTracks.forEach((t, r) => rows[r].push(...t.children));
  } else {
    items.forEach((item, i) => rows[i % rowCount].push(item));
  }
  const minWidth = Math.max(innerWidth, 1920) * 1.1;
  marquees.forEach((m) => m.remove());
  rows.forEach((rowItems, r) => {
    const marquee = document.createElement('div');
    marquee.className = r % 2 ? 'marquee reverse' : 'marquee';
    const track = document.createElement('div');
    track.className = 'marquee-track';
    rowItems.forEach((item) => track.appendChild(item));
    marquee.appendChild(track);
    strip.appendChild(marquee);
    /* pad with copies of the row until one track alone covers the widest screen */
    const originals = [...track.children];
    let guard = 0;
    while (track.scrollWidth < minWidth && guard < 6) {
      originals.forEach((item) => track.appendChild(item.cloneNode(true)));
      guard += 1;
    }
    const dup = track.cloneNode(true);
    dup.setAttribute('aria-hidden', 'true');
    dup.querySelectorAll('a').forEach((link) => {
      link.tabIndex = -1;
      link.setAttribute('aria-hidden', 'true');
    });
    dup.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
    marquee.appendChild(dup);
  });
})();

/* Split a heading into words that can rise into place */
const splitWords = (el) => {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'word';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  return el.querySelectorAll('.word-inner');
};

/* Intro: a one-off staggered entrance that alternates between the hero copy and
   the hero images. Nothing loops afterwards (no breathing / bobbing). */
if (!reduceMotion) {
  const heroTitle = document.querySelector('.banner-copy-wrap h1');
  const titleWords = heroTitle ? splitWords(heroTitle) : [];

  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .to('.page-shell', { duration: 0.8, autoAlpha: 1, ease: 'power2.out' })
    .from('.brand', { duration: 0.9, y: -24, opacity: 0, filter: 'blur(16px)' }, '-=0.6')
    .from('nav a', { duration: 0.8, y: -16, opacity: 0, stagger: 0.08, filter: 'blur(10px)' }, '-=0.7')
    .from('.header-link', { duration: 0.6, y: -12, opacity: 0 }, '-=0.6')
    /* text */
    .from('.icon-banner', { duration: 0.7, y: 18, opacity: 0 }, '-=0.3')
    /* image */
    .from('.mini-stack img:first-child', { duration: 0.8, y: 32, opacity: 0, scale: 0.96 }, '-=0.45')
    /* text */
    .from(titleWords, { duration: 0.9, yPercent: 110, rotate: 4, stagger: 0.06, ease: 'power4.out' }, '-=0.5')
    /* image */
    .from('.mini-stack img:last-child', { duration: 0.8, y: 32, opacity: 0, scale: 0.96 }, '-=0.7')
    /* text */
    .from('.banner-copy-wrap > p', { duration: 0.8, y: 22, opacity: 0 }, '-=0.55')
    /* image */
    .from('.banner-right img', { duration: 1.1, x: 48, opacity: 0, scale: 0.97 }, '-=0.6')
    /* text */
    .from('.hero-stats li', { duration: 0.7, y: 18, opacity: 0, stagger: 0.09 }, '-=0.8')
    .from('.banner-actions .btn', { duration: 0.6, y: 16, opacity: 0, stagger: 0.1 }, '-=0.45');
}

/* Scroll reveals (skipped entirely for reduced motion so nothing stays hidden) */
if (!reduceMotion) gsap.utils.toArray('.reveal').forEach((item) => {
  gsap.fromTo(
    item,
    { opacity: 0, y: 42 },
    {
      scrollTrigger: { trigger: item, start: 'top 85%', once: true },
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
    }
  );
});

/* Count-up numbers */
const formatNumber = (value, el) => {
  const decimals = Number(el.dataset.decimals || 0);
  const format = el.dataset.format;
  if (format === 'k') return `${Math.round(value / 1000)}k`;
  if (format === 'comma') return Math.round(value).toLocaleString('en-GB');
  return value.toFixed(decimals);
};

document.querySelectorAll('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count);
  if (reduceMotion) {
    el.textContent = formatNumber(target, el);
    return;
  }
  const counter = { value: 0 };
  el.textContent = formatNumber(0, el);
  gsap.to(counter, {
    value: target,
    duration: 1.8,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    onUpdate: () => {
      el.textContent = formatNumber(counter.value, el);
    },
  });
});

/* ============================================================
   Users chart (Traction)
   ------------------------------------------------------------
   ILLUSTRATIVE ESTIMATES. These quarterly "users" figures are not from the
   investor deck; they are placeholders over the ~18 months the company traded
   (2021 Q1 to 2022 Q2), shaped to end at the deck's "30k+" boxes-shipped figure. Replace with real numbers before relying on them.
   See handoffs/restaurant-kits-missing.md.
   ============================================================ */
const USERS_SERIES = [
  { label: '2021 Q1', value: 1200 },
  { label: '2021 Q2', value: 4500 },
  { label: '2021 Q3', value: 9800 },
  { label: '2021 Q4', value: 16000 },
  { label: '2022 Q1', value: 23500 },
  { label: '2022 Q2', value: 30400 },
];

const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n));

const buildUsersChart = (figure) => {
  const svg = figure.querySelector('svg');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 640;
  const H = 300;
  const pad = { top: 28, right: 86, bottom: 40, left: 48 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const max = 32000;
  const xs = USERS_SERIES.map((_, i) => pad.left + (i / (USERS_SERIES.length - 1)) * plotW);
  const ys = USERS_SERIES.map((d) => pad.top + plotH - (d.value / max) * plotH);
  const baseline = pad.top + plotH;

  const el = (name, attrs = {}, text) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text !== undefined) node.textContent = text;
    return node;
  };

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  /* Gridlines + y ticks (hairline, solid, recessive) */
  const grid = el('g', { class: 'chart-grid' });
  [0, 10000, 20000, 30000].forEach((tick) => {
    const y = pad.top + plotH - (tick / max) * plotH;
    grid.appendChild(el('line', { x1: pad.left, x2: W - pad.right, y1: y, y2: y }));
    grid.appendChild(el('text', { x: pad.left - 10, y: y + 4, 'text-anchor': 'end', class: 'chart-tick' }, tick === 0 ? '0' : compact(tick)));
  });
  svg.appendChild(grid);

  /* X labels: year at each Q1, quarter ticks elsewhere */
  const xg = el('g', { class: 'chart-x' });
  USERS_SERIES.forEach((d, i) => {
    const [year, q] = d.label.split(' ');
    const isYear = q === 'Q1';
    xg.appendChild(
      el('text', { x: xs[i], y: baseline + 22, 'text-anchor': 'middle', class: isYear ? 'chart-tick chart-tick-year' : 'chart-tick chart-tick-q' }, isYear ? year : q)
    );
  });
  svg.appendChild(xg);

  /* Smooth path through the points (Catmull-Rom to cubic bezier) */
  const pathD = () => {
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i += 1) {
      const p0x = xs[Math.max(i - 1, 0)], p0y = ys[Math.max(i - 1, 0)];
      const p1x = xs[i], p1y = ys[i];
      const p2x = xs[i + 1], p2y = ys[i + 1];
      const p3x = xs[Math.min(i + 2, xs.length - 1)], p3y = ys[Math.min(i + 2, xs.length - 1)];
      const c1x = p1x + (p2x - p0x) / 6, c1y = p1y + (p2y - p0y) / 6;
      const c2x = p2x - (p3x - p1x) / 6, c2y = p2y - (p3y - p1y) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2x} ${p2y}`;
    }
    return d;
  };
  const line = pathD();
  const area = `${line} L ${xs[xs.length - 1]} ${baseline} L ${xs[0]} ${baseline} Z`;

  const areaEl = el('path', { d: area, class: 'chart-area' });
  const lineEl = el('path', { d: line, class: 'chart-line' });
  svg.appendChild(areaEl);
  svg.appendChild(lineEl);

  /* End-point marker (8px, surface ring) + callout */
  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];
  const last = USERS_SERIES[USERS_SERIES.length - 1];
  const endDot = el('circle', { cx: lastX, cy: lastY, r: 5, class: 'chart-end' });
  const callout = el('g', { class: 'chart-callout' });
  callout.appendChild(el('text', { x: lastX + 12, y: lastY - 2, class: 'chart-callout-value' }, `${compact(last.value)}`));
  callout.appendChild(el('text', { x: lastX + 12, y: lastY + 14, class: 'chart-callout-label' }, 'users'));
  svg.appendChild(endDot);
  svg.appendChild(callout);

  /* Hover layer: crosshair + tooltip + hit targets */
  const hover = el('g', { class: 'chart-hover', 'aria-hidden': 'true' });
  const cross = el('line', { y1: pad.top, y2: baseline, class: 'chart-cross' });
  const hDot = el('circle', { r: 5, class: 'chart-hover-dot' });
  const tip = el('g', { class: 'chart-tip' });
  const tipBg = el('rect', { rx: 6, ry: 6, height: 40, class: 'chart-tip-bg' });
  const tipA = el('text', { x: 10, y: 16, class: 'chart-tip-label' });
  const tipB = el('text', { x: 10, y: 32, class: 'chart-tip-value' });
  tip.append(tipBg, tipA, tipB);
  hover.append(cross, hDot, tip);
  hover.style.opacity = '0';
  svg.appendChild(hover);

  const showPoint = (i) => {
    const d = USERS_SERIES[i];
    cross.setAttribute('x1', xs[i]);
    cross.setAttribute('x2', xs[i]);
    hDot.setAttribute('cx', xs[i]);
    hDot.setAttribute('cy', ys[i]);
    tipA.textContent = d.label;
    tipB.textContent = `${d.value.toLocaleString('en-GB')} users`;
    const tipW = Math.max(tipA.getComputedTextLength(), tipB.getComputedTextLength()) + 20;
    tipBg.setAttribute('width', tipW);
    const flip = xs[i] + 14 + tipW > W - 4;
    const tx = flip ? xs[i] - 14 - tipW : xs[i] + 14;
    const ty = Math.max(pad.top, Math.min(ys[i] - 20, baseline - 40));
    tip.setAttribute('transform', `translate(${tx} ${ty})`);
    hover.style.opacity = '1';
  };
  const hidePoint = () => {
    hover.style.opacity = '0';
  };

  const hit = el('rect', { x: pad.left, y: pad.top, width: plotW, height: plotH, fill: 'transparent', class: 'chart-hit' });
  svg.appendChild(hit);
  const nearest = (clientX) => {
    const box = svg.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * W;
    let best = 0;
    xs.forEach((px, i) => {
      if (Math.abs(px - x) < Math.abs(xs[best] - x)) best = i;
    });
    return best;
  };
  hit.addEventListener('mousemove', (e) => showPoint(nearest(e.clientX)));
  hit.addEventListener('touchstart', (e) => showPoint(nearest(e.touches[0].clientX)), { passive: true });
  hit.addEventListener('touchmove', (e) => showPoint(nearest(e.touches[0].clientX)), { passive: true });
  hit.addEventListener('mouseleave', hidePoint);
  hit.addEventListener('touchend', hidePoint);

  /* Keyboard: arrow keys walk the points */
  let kIndex = USERS_SERIES.length - 1;
  svg.setAttribute('tabindex', '0');
  svg.addEventListener('focus', () => showPoint(kIndex));
  svg.addEventListener('blur', hidePoint);
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') kIndex = Math.max(0, kIndex - 1);
    else if (e.key === 'ArrowRight') kIndex = Math.min(USERS_SERIES.length - 1, kIndex + 1);
    else return;
    e.preventDefault();
    showPoint(kIndex);
  });

  /* Animate in */
  if (reduceMotion) return;
  const length = lineEl.getTotalLength();
  gsap.set(lineEl, { strokeDasharray: length, strokeDashoffset: length });
  gsap.set(areaEl, { opacity: 0 });
  gsap.set([endDot], { scale: 0, transformOrigin: 'center' });
  gsap.set(callout, { opacity: 0, x: -8 });
  gsap
    .timeline({ scrollTrigger: { trigger: figure, start: 'top 78%', once: true } })
    .to(lineEl, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
    .to(areaEl, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.7')
    .to(endDot, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.35')
    .to(callout, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25');
};

document.querySelectorAll('[data-chart-users]').forEach(buildUsersChart);

/* Featured collaborations slider.
   Slide 0 is always the Game of Thrones item: the slider boots on it, autoplay
   only runs while the slider is on screen, and if the visitor scrolls away
   without touching the controls it quietly resets to slide 0 so it always
   re-enters on Game of Thrones. */
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('.slider-track');
  const slides = [...slider.querySelectorAll('.slide')];
  const dotsWrap = slider.querySelector('.slider-dots');
  const caption = slider.querySelector('.slider-caption');
  const panels = [...slider.querySelectorAll('.copy-panel')];
  const firstIndex = Math.max(0, slides.findIndex((slide) => slide.dataset.panel === 'got'));
  let index = firstIndex;
  let timer = null;
  let userInteracted = false;
  let visible = false;

  /* Featured video (YouTube IFrame API). The API script is only requested the
     first time the video slide is reached. Autoplay has to start muted or the
     browser blocks it; the on-video button lets the viewer unmute. The 63s to
     180s segment loops by reloading the clip with endSeconds, because loop=1
     would restart from 0. Reduced motion: poster + play button, no autoplay. */
  const videoShells = [...slider.querySelectorAll('.video-shell')].map((shell) => {
    const state = {
      shell,
      id: shell.dataset.yt,
      start: Number(shell.dataset.start || 0),
      end: Number(shell.dataset.end || 0),
      player: null,
      ready: false,
      wantPlaying: false,
      guard: null,
    };
    const soundBtn = shell.querySelector('.video-sound');
    const playBtn = shell.querySelector('.video-play');
    const tapBtn = shell.querySelector('.video-tap');
    const flash = shell.querySelector('.video-flash');
    state.userPaused = false;
    const flashIcon = (kind) => {
      flash.classList.remove('is-flashing', 'show-play', 'show-pause');
      // eslint-disable-next-line no-unused-expressions
      flash.offsetWidth;
      flash.classList.add('is-flashing', kind === 'play' ? 'show-play' : 'show-pause');
    };
    const setTapLabel = (playing) => tapBtn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');

    const loadApi = () =>
      new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(window.YT);
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve(window.YT);
        };
        if (!document.querySelector('script[data-yt-api]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          tag.async = true;
          tag.dataset.ytApi = '';
          document.head.appendChild(tag);
        }
      });

    const segment = () => ({ videoId: state.id, startSeconds: state.start, endSeconds: state.end || undefined });

    const startGuard = () => {
      clearInterval(state.guard);
      if (!state.end) return;
      state.guard = setInterval(() => {
        if (!state.ready || !state.wantPlaying) return;
        const t = state.player.getCurrentTime?.() || 0;
        if (t >= state.end - 0.25 || t < state.start - 1) state.player.loadVideoById(segment());
      }, 500);
    };

    const create = async (muted) => {
      if (state.player) return;
      const YT = await loadApi();
      const host = shell.querySelector('.yt-host');
      state.player = new YT.Player(host, {
        videoId: state.id,
        playerVars: {
          autoplay: 1,
          mute: muted ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          start: state.start,
          end: state.end || undefined,
          enablejsapi: 1,
          origin: location.origin,
        },
        events: {
          onReady: (e) => {
            state.ready = true;
            if (muted) e.target.mute();
            else e.target.unMute();
            soundBtn.hidden = false;
            tapBtn.hidden = false;
            soundBtn.setAttribute('aria-pressed', String(!muted));
            soundBtn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
            if (state.wantPlaying) e.target.playVideo();
            startGuard();
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              shell.classList.add('is-playing');
              setTapLabel(true);
            }
            if (e.data === YT.PlayerState.PAUSED) setTapLabel(false);
            if (e.data === YT.PlayerState.ENDED && state.wantPlaying) e.target.loadVideoById(segment());
          },
        },
      });
    };

    tapBtn.addEventListener('click', () => {
      if (!state.ready) return;
      const playing = state.player.getPlayerState() === window.YT.PlayerState.PLAYING;
      if (playing) {
        state.userPaused = true;
        state.wantPlaying = false;
        clearInterval(state.guard);
        state.player.pauseVideo();
        flashIcon('pause');
      } else {
        state.userPaused = false;
        state.wantPlaying = true;
        state.player.playVideo();
        startGuard();
        flashIcon('play');
      }
    });

    soundBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!state.ready) return;
      const muted = state.player.isMuted();
      if (muted) state.player.unMute();
      else state.player.mute();
      soundBtn.setAttribute('aria-pressed', String(muted));
      soundBtn.setAttribute('aria-label', muted ? 'Mute video' : 'Unmute video');
    });

    if (reduceMotion) {
      playBtn.hidden = false;
      playBtn.addEventListener('click', () => {
        playBtn.hidden = true;
        state.wantPlaying = true;
        create(false);
      });
    }

    state.play = () => {
      if (state.userPaused) return; // the viewer paused it; leave it paused
      state.wantPlaying = true;
      if (reduceMotion && !state.player) return; // waits for the play button
      if (!state.player) create(true);
      else if (state.ready) {
        state.player.playVideo();
        startGuard();
      }
    };
    state.pause = () => {
      state.wantPlaying = false;
      clearInterval(state.guard);
      if (state.ready) state.player.pauseVideo();
    };
    return state;
  });

  const pauseVideos = () => videoShells.forEach((v) => v.pause());
  const playActiveVideo = () => {
    if (!visible) return;
    const active = slides[index];
    if (!('video' in active.dataset)) return;
    videoShells.filter((v) => active.contains(v.shell)).forEach((v) => v.play());
  };

  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', slide.dataset.caption || `Slide ${i + 1}`);
    dot.addEventListener('click', () => {
      userInteracted = true;
      goTo(i);
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render(instant = false) {
    const panelKey = slides[index].dataset.panel;
    panels.forEach((panel) => {
      const active = panel.dataset.panel === panelKey;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
    if (instant) track.style.transition = 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    if (instant) {
      // eslint-disable-next-line no-unused-expressions
      track.offsetHeight;
      track.style.transition = '';
    }
    slides.forEach((slide, n) => slide.setAttribute('aria-hidden', String(n !== index)));
    dots.forEach((dot, n) => dot.setAttribute('aria-selected', String(n === index)));
    caption.textContent = slides[index].dataset.caption || '';
  }

  function goTo(i, instant = false) {
    if (i !== index) pauseVideos();
    index = (i + slides.length) % slides.length;
    render(instant);
    playActiveVideo();
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    const onVideo = 'video' in slides[index].dataset;
    if (reduceMotion || userInteracted || onVideo || !visible) return;
    timer = setTimeout(() => goTo(index + 1), 5500);
  }

  slider.querySelector('[data-prev]').addEventListener('click', () => {
    userInteracted = true;
    goTo(index - 1);
  });
  slider.querySelector('[data-next]').addEventListener('click', () => {
    userInteracted = true;
    goTo(index + 1);
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      userInteracted = true;
      goTo(index - 1);
    }
    if (event.key === 'ArrowRight') {
      userInteracted = true;
      goTo(index + 1);
    }
  });

  slider.addEventListener('mouseenter', () => clearTimeout(timer));
  slider.addEventListener('mouseleave', schedule);

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        schedule();
        playActiveVideo();
      } else {
        clearTimeout(timer);
        pauseVideos();
        if (!userInteracted && index !== firstIndex) goTo(firstIndex, true);
      }
    },
    { threshold: 0.2 }
  ).observe(slider);

  /* Translate percentages survive resize; re-render keeps aria state honest. */
  addEventListener('resize', () => render(true));

  goTo(firstIndex, true);
});

/* ============================================================
   Motion layer
   ============================================================ */

/* Scroll progress bar + header state (useful even with reduced motion) */
const progress = document.createElement('div');
progress.className = 'scroll-progress';
document.body.appendChild(progress);
const topbar = document.querySelector('.topbar');

const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  topbar?.classList.toggle('is-scrolled', scrollY > 24);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (!reduceMotion) {
  /* About: each paragraph writes itself on word by word (the highlighted
     phrases are split and revealed in sequence with the rest); when a paragraph
     completes, its key phrases turn black and the underline draws in. The second
     paragraph starts once it is on screen AND the first has finished. */
  const statement = document.querySelector('.intro-statement');
  if (statement) {
    const splitFlat = (el) => {
      const walk = (node, inPhrase) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment();
            const parts = child.textContent.split(/(\s+)/).filter(Boolean);
            parts.forEach((part, i) => {
              if (/^\s+$/.test(part)) {
                // inside a highlighted phrase the space rides with the previous
                // word so the underline runs through the gap
                if (inPhrase && frag.lastChild && frag.lastChild.nodeType === Node.ELEMENT_NODE && i < parts.length - 1) {
                  frag.lastChild.textContent += part;
                } else {
                  frag.appendChild(document.createTextNode(part));
                }
                return;
              }
              const w = document.createElement('span');
              w.className = inPhrase === 'u' ? 'tw-word tw-u' : 'tw-word';
              w.textContent = part;
              frag.appendChild(w);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            walk(child, inPhrase || (child.tagName === 'EM' ? (child.classList.contains('u') ? 'u' : 'em') : false));
          }
        });
      };
      walk(el, false);
      return el.querySelectorAll('.tw-word');
    };
    const paras = [...statement.querySelectorAll('p')];
    let previousDone = Promise.resolve();
    paras.forEach((para) => {
      const words = [...splitFlat(para)];
      const phrases = [...para.querySelectorAll('em')];
      const ruleWords = [...para.querySelectorAll('em.u .tw-u')];
      para.classList.add('tw-pending');
      gsap.set(words, { opacity: 0 });
      gsap.set(ruleWords, { backgroundSize: '0% 3px' });

      /* 1. brisk word-by-word reveal (grey), 2. highlight phrases turn black,
         staggered, 3. the single underlined phrase draws left to right. */
      const tl = gsap.timeline({ paused: true });
      words.forEach((w, i) => tl.to(w, { opacity: 1, duration: 0.2, ease: 'none' }, i * 0.022));
      const revealed = words.length * 0.022 + 0.2;
      phrases.forEach((em, i) => tl.call(() => em.classList.add('is-lit'), null, revealed + 0.1 + i * 0.15));
      const bolded = revealed + 0.1 + (phrases.length - 1) * 0.15 + 0.3;
      const each = ruleWords.length ? 0.5 / ruleWords.length : 0;
      ruleWords.forEach((w, i) => tl.to(w, { backgroundSize: '100% 3px', duration: each, ease: 'power2.out' }, bolded + 0.45 + i * each));
      tl.call(() => para.classList.remove('tw-pending'), null, bolded + 0.45 + 0.5 + 0.05);

      const onScreen = new Promise((resolve) => {
        ScrollTrigger.create({ trigger: para, start: 'top 82%', once: true, onEnter: resolve });
      });
      const gate = previousDone;
      previousDone = new Promise((done) => {
        tl.eventCallback('onComplete', () => setTimeout(done, 300));
        Promise.all([onScreen, gate]).then(() => tl.delay(0.15).play());
        /* Scrolled well past before it finished: complete instantly. */
        ScrollTrigger.create({
          trigger: para,
          start: 'bottom 45%',
          once: true,
          onEnter: () => {
            if (tl.progress() < 1) {
              gate.then(() => tl.progress(1));
            }
          },
        });
      });
    });
  }

  /* Partners: heading words rise, the "best chefs" block wipes in, then after a
     beat the four chefs land one by one. */
  const partnersTitle = document.querySelector('.partners-title');
  if (partnersTitle) {
    const mark = partnersTitle.querySelector('.hl');
    const chefs = document.querySelectorAll('.chef-row li');
    gsap
      .timeline({ scrollTrigger: { trigger: partnersTitle, start: 'top 85%', once: true } })
      .from(splitWords(partnersTitle), { yPercent: 110, duration: 0.9, stagger: 0.06, ease: 'power4.out' })
      .call(() => mark?.classList.add('is-on'), null, '-=0.3')
      .from(chefs, { y: 50, opacity: 0, duration: 0.8, stagger: 0.28, ease: 'power3.out' }, '+=0.3');
  }

  /* Case studies: card, then each line */
  document.querySelectorAll('.case-card').forEach((card) => {
    gsap
      .timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true } })
      .from(card, { y: 40, opacity: 0, duration: 0.8, ease: 'power2.out' })
      .from(card.querySelector('img'), { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.4')
      .from(card.querySelectorAll('.card-kicker, h3, dl > div'), { y: 14, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' }, '-=0.3');
  });

  document
    .querySelectorAll('.section-heading h2:not(.partners-title), .archive-box h2, .seasonal-head h2')
    .forEach((heading) => {
      gsap.from(splitWords(heading), {
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
        yPercent: 110,
        duration: 0.9,
        stagger: 0.05,
        ease: 'power4.out',
      });
    });

  /* Hero parallax (scroll-driven, not a loop) */
  gsap.to('.banner-right', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.mini-stack', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* Highlight sweeps behind key phrases */
  document.querySelectorAll('.rkx-statement em').forEach((em) => {
    ScrollTrigger.create({
      trigger: em,
      start: 'top 80%',
      once: true,
      onEnter: () => em.classList.add('is-lit'),
    });
  });

  /* About photo opens like a curtain */
  if (document.querySelector('.intro-photo')) {
    gsap.fromTo(
      '.intro-photo',
      { clipPath: 'inset(0 0 100% 0 round 28px)' },
      {
        clipPath: 'inset(0 0 0% 0 round 28px)',
        duration: 1.2,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: '.intro-photo', start: 'top 80%', once: true },
      }
    );
  }

  /* RKX lockup lands */
  const rkxTl = gsap.timeline({
    scrollTrigger: { trigger: '.rkx-head', start: 'top 80%', once: true },
  });
  rkxTl
    .from('.rkx-logo', { scale: 0.5, rotate: -10, opacity: 0, duration: 0.9, ease: 'back.out(1.8)' })
    .from('.rkx-tag', { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
  gsap.from('.ip-card', {
    scrollTrigger: { trigger: '.ip-row', start: 'top 85%', once: true },
    y: 36,
    opacity: 0,
    scale: 0.94,
    duration: 0.7,
    stagger: 0.14,
    ease: 'power3.out',
  });

  /* Carousel opens like a curtain */
  gsap.fromTo(
    '.slider-viewport',
    { clipPath: 'inset(0 100% 0 0 round 24px)' },
    {
      clipPath: 'inset(0 0% 0 0 round 24px)',
      duration: 1.3,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: '.got-section', start: 'top 65%', once: true },
    }
  );

  /* KPI tiles and funder chips stagger */
  [['.kpi-grid', '.kpi-grid li'], ['.backer-chips', '.backer-chip']].forEach(([trigger, items]) => {
    if (!document.querySelector(trigger)) return;
    gsap.from(items, {
      scrollTrigger: { trigger, start: 'top 85%', once: true },
      y: 30,
      opacity: 0,
      scale: 0.94,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
    });
  });

  /* Gentle 3D tilt on cards */
  const canHover = matchMedia('(hover: hover)').matches;
  if (canHover) {
    document.querySelectorAll('.case-card, .tech-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        gsap.to(card, {
          rotateY: x * 8,
          rotateX: -y * 8,
          transformPerspective: 900,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
      });
    });

  }

  /* Iconic section on phones: the coral dot rides the connector from the box
     image down to the dish image as you scroll (scroll direction = the story:
     box turns into dish), and the dish wipes in as the dot arrives. */
  gsap.matchMedia().add('(max-width: 768px)', () => {
    const conn = document.querySelector('.iconic-connector');
    const dot = conn?.querySelector('.connector-dot');
    const dish = document.querySelector('.turn-img');
    if (!conn || !dot) return;
    gsap.fromTo(
      dot,
      { y: 0 },
      {
        y: () => conn.clientHeight - dot.offsetHeight,
        ease: 'none',
        scrollTrigger: { trigger: conn, start: 'top 78%', end: 'bottom 50%', scrub: true, invalidateOnRefresh: true },
      }
    );
    if (dish) {
      gsap.fromTo(
        dish,
        { clipPath: 'inset(0 0 100% 0 round 14px)' },
        {
          clipPath: 'inset(0 0 0% 0 round 14px)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: conn, start: 'bottom 58%', once: true },
        }
      );
    }
  });

  /* Rising embers behind the Game of Thrones carousel */
  const gotSection = document.querySelector('.got-section');
  if (gotSection) {
    const canvas = document.createElement('canvas');
    canvas.className = 'embers';
    canvas.setAttribute('aria-hidden', 'true');
    gotSection.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let running = false;
    const ratio = Math.min(devicePixelRatio || 1, 2);

    const resize = () => {
      width = gotSection.clientWidth;
      height = gotSection.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const makeEmber = (fromBottom) => ({
      x: Math.random() * width,
      y: fromBottom ? height + Math.random() * 40 : Math.random() * height,
      r: Math.random() * 1.8 + 0.6,
      speed: Math.random() * 0.6 + 0.25,
      drift: Math.random() * 0.6 - 0.3,
      phase: Math.random() * Math.PI * 2,
      life: Math.random() * 0.5 + 0.5,
    });

    resize();
    const embers = Array.from({ length: Math.round(width / 22) }, () => makeEmber(false));
    addEventListener('resize', resize);

    const draw = (time) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      embers.forEach((ember, i) => {
        ember.y -= ember.speed;
        ember.x += ember.drift + Math.sin(time / 900 + ember.phase) * 0.3;
        const fade = Math.max(0, Math.min(1, ember.y / height)) * ember.life;
        if (ember.y < -10) embers[i] = makeEmber(true);
        const glow = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.r * 4);
        glow.addColorStop(0, `rgba(255, 190, 110, ${fade})`);
        glow.addColorStop(0.4, `rgba(255, 110, 40, ${fade * 0.5})`);
        glow.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.r * 4, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    new IntersectionObserver(([entry]) => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning) requestAnimationFrame(draw);
    }).observe(gotSection);
  }
}
