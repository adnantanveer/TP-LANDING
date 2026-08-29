import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { InlineIcon } from "@/components/InlineIcon";

const API_URL = import.meta.env.VITE_API_URL as string;

type ServiceItem = { title: string; body: string; icon: string; active: boolean };

const DEFAULT_CONTENT: { visible: boolean; heading: string; subheading: string; items: ServiceItem[] } = {
  visible: true,
  heading: "Everything a UK team needs, under one roof.",
  subheading: "Cross-functional squads embedded with your business — discovery, delivery and long-term support.",
  items: [
    { title: "Product engineering", body: "Web platforms and SaaS built on React, TypeScript and cloud-native infrastructure — shipped in weeks, not quarters.", icon: "", active: true },
    { title: "Mobile applications", body: "iOS and Android products with native performance, offline resilience and App Store release support.", icon: "", active: true },
    { title: "AI & automation", body: "LLM assistants, document intelligence and workflow automation wired directly into your existing systems.", icon: "", active: true },
    { title: "Cloud & DevOps", body: "AWS and Azure architecture, CI/CD pipelines and observability tuned for UK data residency and uptime.", icon: "", active: true },
    { title: "Design & experience", body: "Interface design, motion and design systems that make enterprise software feel considered.", icon: "", active: true },
  ],
};

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/services`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
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
