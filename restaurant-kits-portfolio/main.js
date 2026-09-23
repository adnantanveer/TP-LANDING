import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Intro */
gsap.timeline({ defaults: { ease: 'power3.out' } })
  .to('.page-shell', { duration: 1, autoAlpha: 1, ease: 'power2.out' })
  .from('.brand', { duration: 0.9, y: -24, opacity: 0, filter: 'blur(16px)' }, '-=0.7')
  .from('nav a', { duration: 0.8, y: -16, opacity: 0, stagger: 0.08, filter: 'blur(10px)' }, '-=0.7')
  .from('.banner-shell', { duration: 1.5, y: 70, opacity: 0, filter: 'blur(20px)', scale: 0.97, ease: 'expo.out' }, '-=0.6')
  .from('.mini-stack img', { duration: 0.9, y: 28, opacity: 0, stagger: 0.18 }, '-=1.0')
  .from('.banner-copy-wrap', { duration: 1.05, y: 32, opacity: 0 }, '-=0.8')
  .from('.banner-actions', { duration: 0.8, y: 20, opacity: 0 }, '-=0.6')
  .from('.banner-right img', { duration: 1.25, x: 52, opacity: 0, scale: 0.96, ease: 'power3.out' }, '-=1.0');

/* Scroll reveals */
gsap.utils.toArray('.reveal').forEach((item) => {
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

/* Partner circles and IP logos pop in one by one */
[['.logo-wall', '.logo-wall figure'], ['.ip-row', '.ip-card']].forEach(([trigger, items]) => {
  if (!document.querySelector(trigger)) return;
  gsap.from(items, {
    scrollTrigger: { trigger, start: 'top 80%', once: true },
    scale: 0.6,
    opacity: 0,
    duration: 0.6,
    stagger: 0.06,
    ease: 'back.out(1.7)',
  });
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

/* Revenue bars grow in */
if (document.querySelector('.bar-chart')) {
  gsap.from('.bar-fill', {
    scrollTrigger: { trigger: '.bar-chart', start: 'top 80%', once: true },
    scaleY: 0,
    duration: 1.1,
    stagger: 0.15,
    ease: 'power3.out',
  });
}

/* Hero float */
const floatGroup = document.querySelector('.banner-shell');
if (floatGroup && !reduceMotion) {
  gsap.to(floatGroup, { y: -6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

/* Game of Thrones slider */
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('.slider-track');
  const slides = [...slider.querySelectorAll('.slide')];
  const dotsWrap = slider.querySelector('.slider-dots');
  const caption = slider.querySelector('.slider-caption');
  const panels = [...slider.querySelectorAll('.copy-panel')];
  let index = 0;

  const pauseVideos = () => {
    slider.querySelectorAll('.slide-video iframe').forEach((frame) => {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
    });
  };
  let timer = null;
  let userInteracted = false;

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

  function goTo(i) {
    if (i !== index) pauseVideos();
    index = (i + slides.length) % slides.length;
    const panelKey = slides[index].dataset.panel;
    panels.forEach((panel) => {
      const active = panel.dataset.panel === panelKey;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, n) => slide.setAttribute('aria-hidden', String(n !== index)));
    dots.forEach((dot, n) => dot.setAttribute('aria-selected', String(n === index)));
    caption.textContent = slides[index].dataset.caption || '';
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    const onVideo = 'video' in slides[index].dataset;
    if (reduceMotion || userInteracted || onVideo) return;
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

  goTo(0);
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
  /* Split headings into words that rise into place */
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

  const heroTitle = document.querySelector('.banner-copy-wrap h1');
  if (heroTitle) {
    gsap.from(splitWords(heroTitle), {
      yPercent: 110,
      rotate: 4,
      duration: 1,
      stagger: 0.07,
      ease: 'power4.out',
      delay: 0.9,
    });
  }

  document
    .querySelectorAll('.section-heading h2, .archive-box h2, .seasonal-head h2')
    .forEach((heading) => {
      gsap.from(splitWords(heading), {
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
        yPercent: 110,
        duration: 0.9,
        stagger: 0.05,
        ease: 'power4.out',
      });
    });

  /* Hero parallax */
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

  /* Coral highlight sweeps behind key phrases */
  document.querySelectorAll('.intro-statement em, .rkx-statement em').forEach((em) => {
    ScrollTrigger.create({
      trigger: em,
      start: 'top 80%',
      once: true,
      onEnter: () => em.classList.add('is-lit'),
    });
  });

  /* Chef photos rise in */
  gsap.from('.chef-row li', {
    scrollTrigger: { trigger: '.chef-row', start: 'top 80%', once: true },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  });

  /* RKX lockup lands */
  const rkxTl = gsap.timeline({
    scrollTrigger: { trigger: '.rkx-head', start: 'top 80%', once: true },
  });
  rkxTl
    .from('.rkx-logo', { scale: 0.5, rotate: -10, opacity: 0, duration: 0.9, ease: 'back.out(1.8)' })
    .from('.rkx-tag', { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');

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

  /* KPI tiles and case cards stagger */
  gsap.from('.kpi-grid li', {
    scrollTrigger: { trigger: '.kpi-grid', start: 'top 85%', once: true },
    y: 30,
    opacity: 0,
    scale: 0.94,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
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

    /* Magnetic primary buttons */
    document.querySelectorAll('.btn.primary, .primary-link').forEach((btn) => {
      btn.addEventListener('mousemove', (event) => {
        const box = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (event.clientX - box.left - box.width / 2) * 0.25,
          y: (event.clientY - box.top - box.height / 2) * 0.35,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

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
