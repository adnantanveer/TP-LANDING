import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { InlineIcon } from "@/components/InlineIcon";
import { KineticHeading, LineReveal } from "./primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

// `details` is an optional CMS field (see handoffs/techpotam-backend-admin.md §2).
// When the API leaves it out, DEFAULT_DETAILS below fills it by title.
type ServiceItem = { title: string; body: string; icon: string; active: boolean; details?: string[] };

// What each service covers, revealed when a row is hovered, focused or tapped.
const DEFAULT_DETAILS: Record<string, string[]> = {
  "Product engineering": [
    "Web apps and SaaS platforms",
    "React, TypeScript and Node.js",
    "API design and third-party integrations",
    "Automated testing and CI from day one",
  ],
  "Mobile applications": [
    "React Native, Swift and Kotlin",
    "Offline sync and push notifications",
    "App Store and Google Play releases",
    "Analytics and crash reporting",
  ],
  "AI & automation": [
    "LLM assistants and chatbots",
    "Document processing and smart search",
    "Workflow automation across your tools",
    "Guardrails, evaluation and monitoring",
  ],
  "Cloud & DevOps": [
    "AWS and Azure architecture",
    "UK-region hosting for data residency",
    "CI/CD pipelines and infrastructure as code",
    "Monitoring, alerting and cost control",
  ],
  "Design & experience": [
    "UX research and prototyping",
    "UI design and design systems",
    "Accessibility to WCAG 2.2 AA",
    "Motion and interaction design",
  ],
};

// Filled (not outline) so these read as more "colored" than a thin stroke
// glyph — still just currentColor, so they pick up text-primary from
// ServiceRow below rather than introducing new hues (Color Consistency
// Lock: one accent for the whole page). Default fallback content only —
// same as icon: "" before, this is what shows until/unless an admin sets
// a real icon via the CMS; that binding (see the fetch below) is untouched.
const DEFAULT_CONTENT: { visible: boolean; heading: string; subheading: string; items: ServiceItem[] } = {
  visible: true,
  heading: "Everything the UK needs under one roof.",
  subheading: "One squad. Discovery to long-term support.",
  items: [
    {
      title: "Product engineering",
      body: "React, TypeScript and cloud-native SaaS — shipped in weeks.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.7 4.3a1 1 0 0 1 .6 1.28l-4.5 13a1 1 0 1 1-1.9-.66l4.5-13a1 1 0 0 1 1.3-.62Zm-4.3 3.4a1 1 0 0 1 0 1.4L2.9 12l2.5 2.9a1 1 0 1 1-1.5 1.3l-3.2-3.6a1 1 0 0 1 0-1.3L3.9 7.7a1 1 0 0 1 1.5 0Zm8.9 0a1 1 0 0 1 1.5 0l3.2 3.6a1 1 0 0 1 0 1.3l-3.2 3.6a1 1 0 1 1-1.5-1.3l2.5-2.9-2.5-2.9a1 1 0 0 1 0-1.4Z"/></svg>',
      active: true,
    },
    {
      title: "Mobile applications",
      body: "iOS and Android, native-feeling, offline-ready.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2.5A2.5 2.5 0 0 0 4.5 5v14A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5V5A2.5 2.5 0 0 0 17 2.5H7Zm3 1.7h4a.8.8 0 0 1 0 1.6h-4a.8.8 0 0 1 0-1.6ZM12 20a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z"/></svg>',
      active: true,
    },
    {
      title: "AI & automation",
      body: "LLM assistants and automation wired into your systems.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.5a1 1 0 0 1 .95.68L13.8 8.2l5.02 1.85a1 1 0 0 1 0 1.88L13.8 13.8l-1.85 5.02a1 1 0 0 1-1.88 0L8.22 13.8l-5.02-1.85a1 1 0 0 1 0-1.88l5.02-1.87 1.85-5.02A1 1 0 0 1 11 2.5Zm7.5 12a.8.8 0 0 1 .76.55l.6 1.68 1.68.6a.8.8 0 0 1 0 1.5l-1.68.6-.6 1.68a.8.8 0 0 1-1.5 0l-.6-1.68-1.68-.6a.8.8 0 0 1 0-1.5l1.68-.6.6-1.68a.8.8 0 0 1 .74-.55Z"/></svg>',
      active: true,
    },
    {
      title: "Cloud & DevOps",
      body: "AWS and Azure, built for UK data residency and uptime.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a5.5 5.5 0 0 1-.6-10.97A7 7 0 0 1 19.9 9.5 4.75 4.75 0 0 1 19 19H7Z"/></svg>',
      active: true,
    },
    {
      title: "Design & experience",
      body: "Interfaces and design systems that feel considered.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c5.25 0 9.5 3.7 9.5 8.25 0 3.1-2.35 4.75-4.6 4.75h-2.03c-.5 0-.9.4-.9.9 0 .23.1.44.24.63.35.44.56.97.56 1.55 0 1.35-1.2 2.42-2.7 2.42-5.25 0-9.57-4.3-9.57-9.5S6.75 2.5 12 2.5Zm-5 8a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm3.3-4.2a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm5.4 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm2.8 4.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>',
      active: true,
    },
  ],
};

// Same reasoning as TechStack.tsx's withIconFallback: the CMS response
// replaces `content` wholesale, so a live item saved with an empty icon or
// a bare <path> (no wrapping <svg> — InlineIcon's `[&>svg]` sizing
// selector can't target that, so nothing renders) silently loses the good
// default already defined above. Real data still wins whenever it's
// actually usable; this only fills the specific items the API left
// blank/broken, matched by title.
function hasUsableIcon(icon: string | undefined) {
  return !!icon && /<svg[\s>]/i.test(icon);
}

function withIconFallback(items: ServiceItem[]): ServiceItem[] {
  const defaults = new Map(DEFAULT_CONTENT.items.map((s) => [s.title, s.icon]));
  return items.map((item) => (hasUsableIcon(item.icon) ? item : { ...item, icon: defaults.get(item.title) ?? item.icon }));
}

// Same idea for the hover details: real CMS data wins when present.
function detailsFor(item: ServiceItem): string[] {
  return item.details?.filter(Boolean).length ? item.details.filter(Boolean) : DEFAULT_DETAILS[item.title] ?? [];
}

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/services`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent({ ...data, items: withIconFallback(data.items) }))
      .catch(() => {});
  }, []);

  if (!content.visible) return null;

  const services = content.items
    .filter((item) => item.active)
    .map((item, i) => ({ n: String(i + 1).padStart(2, "0"), ...item, details: detailsFor(item) }));

  return (
    <section
      id="services"
      ref={ref}
      className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-32"
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "#00000090" }} aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
          <KineticHeading text={content.heading} className="max-w-xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]" />
          <LineReveal lines={[content.subheading]} delay={0.3} className="max-w-sm text-sm text-muted-foreground" />
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 hidden h-full w-px bg-border md:block">
            <motion.div style={{ height: lineHeight }} className="w-px bg-primary" />
          </div>

          <div className="md:pl-12">
            {services.map((s, i) => (
              <ServiceRow key={s.n} {...s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceRow({
  n,
  title,
  body,
  icon,
  details,
  index,
}: {
  n: string;
  title: string;
  body: string;
  icon: string;
  details: string[];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 40%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [index % 2 ? 60 : -60, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [index % 2 ? 6 : -6, 0]);
  const iconRotate = useTransform(scrollYProgress, [0, 1], [index % 2 ? -25 : 25, 0]);
  const iconScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);

  // Mouse users get hover; touch users tap to toggle. Keyboard users use Enter/Space.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || canHover) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, canHover]);

  const hasDetails = details.length > 0;
  const toggle = () => hasDetails && setOpen((o) => !o);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x, rotateY: rotate, transformStyle: "preserve-3d", zIndex: open ? 30 : 1 }}
      role={hasDetails ? "button" : undefined}
      tabIndex={hasDetails ? 0 : undefined}
      aria-expanded={hasDetails ? open : undefined}
      aria-controls={hasDetails ? panelId : undefined}
      onMouseEnter={() => canHover && hasDetails && setOpen(true)}
      onMouseLeave={() => canHover && setOpen(false)}
      onClick={() => !canHover && toggle()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
        if (e.key === "Escape") setOpen(false);
      }}
      className={`perspective-scene group relative grid grid-cols-1 items-center gap-4 border-t border-border py-10 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 md:grid-cols-[4.5rem_6rem_1fr_1.1fr] ${
        hasDetails ? "cursor-pointer" : ""
      }`}
    >
      {/* Soft highlight behind the open row */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-1.5rem] inset-y-0 -z-10 rounded-2xl bg-primary/[0.07]"
        initial={false}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.98 }}
        transition={{ duration: reduce ? 0 : 0.35 }}
      />

      <motion.span style={{ rotateY: iconRotate, scale: iconScale }} className="transition-transform duration-500 group-hover:scale-110">
        <InlineIcon
          svg={icon}
          fallback={title}
          className="h-14 w-14 text-primary drop-shadow-[0_18px_40px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
        />
      </motion.span>
      <span className="font-mono text-xs text-primary">{n}</span>
      <h3
        className={`text-2xl font-medium transition-colors duration-300 group-hover:text-primary md:text-3xl ${
          open ? "text-primary" : ""
        }`}
      >
        {title}
      </h3>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        {hasDetails && (
          <motion.span
            aria-hidden
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-primary"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </motion.span>
        )}
      </div>

      {/* Full-width details card: rises above the list instead of pushing it down */}
      <div
        className={`pointer-events-none absolute inset-x-[-1.5rem] top-3 z-10 ${open ? "" : "invisible"}`}
      >
        <AnimatePresence>
          {open && hasDetails && (
            <motion.div
              key="details"
              id={panelId}
              role="region"
              aria-label={`${title}: what's included`}
              className="pointer-events-auto w-full rounded-3xl border border-primary/25 bg-[color-mix(in_oklab,var(--background)_90%,transparent)] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),0_0_0_1px_color-mix(in_oklab,var(--primary)_12%,transparent),0_30px_80px_-40px_color-mix(in_oklab,var(--primary)_70%,transparent)] backdrop-blur-xl md:p-8"
              initial={{ opacity: 0, y: reduce ? 0 : 36, scale: reduce ? 1 : 0.96, rotateX: reduce ? 0 : -10 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200, transformOrigin: "50% 100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10">
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <InlineIcon svg={icon} fallback={title} className="h-11 w-11 text-primary" />
                    <span className="font-mono text-xs text-primary">{n}</span>
                  </div>
                  <h4 className="text-2xl font-medium text-primary md:text-3xl">{title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <a
                    href="#contact"
                    aria-label={`Talk to us about ${title}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    Talk to us about this <span aria-hidden>→</span>
                  </a>
                </div>

                <div className="md:border-l md:border-border md:pl-10">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary">What’s included</span>
                  <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {details.map((item, i) => (
                      <motion.li
                        key={item}
                        className="flex items-start gap-3 rounded-xl border border-border/70 bg-primary/[0.04] px-4 py-3 text-sm text-foreground/90"
                        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduce ? 0 : 0.12 + i * 0.07, duration: reduce ? 0 : 0.35 }}
                      >
                        <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
