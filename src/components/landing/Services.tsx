import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { InlineIcon } from "@/components/InlineIcon";

const API_URL = import.meta.env.VITE_API_URL as string;

type ServiceItem = { title: string; body: string; icon: string; active: boolean };

// Filled (not outline) so these read as more "colored" than a thin stroke
// glyph — still just currentColor, so they pick up text-primary from
// ServiceRow below rather than introducing new hues (Color Consistency
// Lock: one accent for the whole page). Default fallback content only —
// same as icon: "" before, this is what shows until/unless an admin sets
// a real icon via the CMS; that binding (see the fetch below) is untouched.
const DEFAULT_CONTENT: { visible: boolean; heading: string; subheading: string; items: ServiceItem[] } = {
  visible: true,
  heading: "Everything a team needs, under one roof.",
  subheading: "Cross-functional squads embedded with your business — discovery, delivery and long-term support.",
  items: [
    {
      title: "Product engineering",
      body: "Web platforms and SaaS built on React, TypeScript and cloud-native infrastructure — shipped in weeks, not quarters.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.7 4.3a1 1 0 0 1 .6 1.28l-4.5 13a1 1 0 1 1-1.9-.66l4.5-13a1 1 0 0 1 1.3-.62Zm-4.3 3.4a1 1 0 0 1 0 1.4L2.9 12l2.5 2.9a1 1 0 1 1-1.5 1.3l-3.2-3.6a1 1 0 0 1 0-1.3L3.9 7.7a1 1 0 0 1 1.5 0Zm8.9 0a1 1 0 0 1 1.5 0l3.2 3.6a1 1 0 0 1 0 1.3l-3.2 3.6a1 1 0 1 1-1.5-1.3l2.5-2.9-2.5-2.9a1 1 0 0 1 0-1.4Z"/></svg>',
      active: true,
    },
    {
      title: "Mobile applications",
      body: "iOS and Android products with native performance, offline resilience and App Store release support.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2.5A2.5 2.5 0 0 0 4.5 5v14A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5V5A2.5 2.5 0 0 0 17 2.5H7Zm3 1.7h4a.8.8 0 0 1 0 1.6h-4a.8.8 0 0 1 0-1.6ZM12 20a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z"/></svg>',
      active: true,
    },
    {
      title: "AI & automation",
      body: "LLM assistants, document intelligence and workflow automation wired directly into your existing systems.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.5a1 1 0 0 1 .95.68L13.8 8.2l5.02 1.85a1 1 0 0 1 0 1.88L13.8 13.8l-1.85 5.02a1 1 0 0 1-1.88 0L8.22 13.8l-5.02-1.85a1 1 0 0 1 0-1.88l5.02-1.87 1.85-5.02A1 1 0 0 1 11 2.5Zm7.5 12a.8.8 0 0 1 .76.55l.6 1.68 1.68.6a.8.8 0 0 1 0 1.5l-1.68.6-.6 1.68a.8.8 0 0 1-1.5 0l-.6-1.68-1.68-.6a.8.8 0 0 1 0-1.5l1.68-.6.6-1.68a.8.8 0 0 1 .74-.55Z"/></svg>',
      active: true,
    },
    {
      title: "Cloud & DevOps",
      body: "AWS and Azure architecture, CI/CD pipelines and observability tuned for UK data residency and uptime.",
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a5.5 5.5 0 0 1-.6-10.97A7 7 0 0 1 19.9 9.5 4.75 4.75 0 0 1 19 19H7Z"/></svg>',
      active: true,
    },
    {
      title: "Design & experience",
      body: "Interface design, motion and design systems that make enterprise software feel considered.",
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

  const services = content.items.filter((item) => item.active).map((item, i) => ({ n: String(i + 1).padStart(2, "0"), ...item }));

  return (
    <section
      id="services"
      ref={ref}
      className="relative bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-32"
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "#00000090" }} aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
            {content.heading}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">{content.subheading}</p>
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
  index,
}: {
  n: string;
  title: string;
  body: string;
  icon: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 40%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [index % 2 ? 60 : -60, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [index % 2 ? 6 : -6, 0]);
  const iconRotate = useTransform(scrollYProgress, [0, 1], [index % 2 ? -25 : 25, 0]);
  const iconScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x, rotateY: rotate, transformStyle: "preserve-3d" }}
      className="perspective-scene group grid grid-cols-1 items-center gap-4 border-t border-border py-10 md:grid-cols-[4.5rem_6rem_1fr_1.1fr]"
    >
      <motion.span style={{ rotateY: iconRotate, scale: iconScale }} className="transition-transform duration-500 group-hover:scale-110">
        <InlineIcon
          svg={icon}
          fallback={title}
          className="h-14 w-14 text-primary drop-shadow-[0_18px_40px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
        />
      </motion.span>
      <span className="font-mono text-xs text-primary">{n}</span>
      <h3 className="text-2xl font-medium transition-colors duration-300 group-hover:text-primary md:text-3xl">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>

    </motion.div>
  );
}
