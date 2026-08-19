import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import iconCube from "@/assets/icon-cube.png";
import iconTorus from "@/assets/icon-torus.png";
import iconOrb from "@/assets/icon-orb.png";
import iconStack from "@/assets/icon-stack.png";
import iconRocket from "@/assets/icon-rocket.png";

const SERVICES = [
  {
    n: "01",
    title: "Product engineering",
    icon: iconCube,
    body: "Web platforms and SaaS built on React, TypeScript and cloud-native infrastructure — shipped in weeks, not quarters.",
  },
  {
    n: "02",
    title: "Mobile applications",
    icon: iconOrb,
    body: "iOS and Android products with native performance, offline resilience and App Store release support.",
  },
  {
    n: "03",
    title: "AI & automation",
    icon: iconTorus,
    body: "LLM assistants, document intelligence and workflow automation wired directly into your existing systems.",
  },
  {
    n: "04",
    title: "Cloud & DevOps",
    icon: iconStack,
    body: "AWS and Azure architecture, CI/CD pipelines and observability tuned for UK data residency and uptime.",
  },
  {
    n: "05",
    title: "Design & experience",
    icon: iconRocket,
    body: "Interface design, motion and design systems that make enterprise software feel considered.",
  },
];


export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <section id="services" ref={ref} className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-xl text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]">
          Everything a UK team needs, under one roof.
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Cross-functional squads embedded with your business — discovery, delivery and long-term
          support.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 hidden h-full w-px bg-border md:block">
          <motion.div style={{ height: lineHeight }} className="w-px bg-primary" />
        </div>

        <div className="md:pl-12">
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.n} {...s} index={i} />
          ))}
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
      <motion.img
        src={icon}
        alt=""
        loading="lazy"
        width={768}
        height={768}
        style={{ rotateY: iconRotate, scale: iconScale }}
        className="h-14 w-14 object-contain drop-shadow-[0_18px_40px_color-mix(in_oklab,var(--primary)_40%,transparent)] transition-transform duration-500 group-hover:scale-110"
      />
      <span className="font-mono text-xs text-primary">{n}</span>
      <h3 className="text-2xl font-medium transition-colors duration-300 group-hover:text-primary md:text-3xl">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>

    </motion.div>
  );
}
