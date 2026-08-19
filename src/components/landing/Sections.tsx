import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SectionLabel, Reveal } from "./primitives";
import sceneLayers from "@/assets/scene-layers.jpg";
import sceneRibbon from "@/assets/scene-ribbon.jpg";
import sceneTerrain from "@/assets/scene-terrain.jpg";
import studio from "@/assets/studio.jpg";
import iconOrb from "@/assets/icon-orb.png";
import iconCube from "@/assets/icon-cube.png";
import iconTorus from "@/assets/icon-torus.png";
import iconRocket from "@/assets/icon-rocket.png";

const STEPS = [
  {
    k: "Discover",
    img: sceneLayers,
    icon: iconCube,
    d: "Two weeks of workshops, technical audit and a costed delivery roadmap you own outright.",
  },
  {
    k: "Design",
    img: sceneRibbon,
    icon: iconOrb,
    d: "Prototypes and design systems validated with your users before a line of production code.",
  },
  {
    k: "Build",
    img: studio,
    icon: iconTorus,
    d: "Two-week sprints, demo every Friday, working software in your environment from week three.",
  },
  {
    k: "Scale",
    img: sceneTerrain,
    icon: iconRocket,
    d: "Monitoring, SLAs and an embedded squad that keeps shipping long after launch.",
  },
];


export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <section id="process" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-14 w-full max-w-6xl px-6">
          <SectionLabel>How we work</SectionLabel>
          <h2 className="mt-6 max-w-xl text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.02]">
            A delivery model built for certainty.
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {STEPS.map((s, i) => (
            <article
              key={s.k}
              className="group relative w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-border bg-card md:w-[34vw]"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={s.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <img
                  src={s.icon}
                  alt=""
                  loading="lazy"
                  width={768}
                  height={768}
                  className="absolute -bottom-4 right-6 h-24 w-24 object-contain drop-shadow-[0_20px_50px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-transform duration-700 group-hover:-translate-y-2"
                />
              </div>
              <div className="p-10 pt-6">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-3xl font-medium">{s.k}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                <div className="mt-10 h-px w-full bg-gradient-to-r from-primary/70 to-transparent" />
              </div>
            </article>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export function Marquee() {
  const items = [
    "Web platforms",
    "Mobile apps",
    "AI systems",
    "Cloud migration",
    "Design systems",
    "Data engineering",
  ];
  return (
    <div className="relative overflow-hidden border-y border-border py-6">
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground"
          >
            {t} <span className="text-primary">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-40">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_100%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_70%)]"
        aria-hidden
      />
      <motion.img
        src={iconTorus}
        alt=""
        loading="lazy"
        aria-hidden
        animate={{ y: [0, -22, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[6%] top-[18%] hidden h-28 w-28 object-contain opacity-70 md:block"
      />
      <motion.img
        src={iconOrb}
        alt=""
        loading="lazy"
        aria-hidden
        animate={{ y: [0, 26, 0], rotate: [0, -14, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[8%] top-[26%] hidden h-24 w-24 object-contain opacity-70 md:block"
      />
      <motion.img
        src={iconCube}
        alt=""
        loading="lazy"
        aria-hidden
        animate={{ y: [0, -18, 0], rotate: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-[14%] left-[16%] hidden h-20 w-20 object-contain opacity-60 md:block"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="text-[clamp(2.2rem,7vw,5rem)] font-semibold leading-[0.98]">
            Let's build the <span className="text-ember">next one</span> together.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-lg text-muted-foreground">
            Tell us what you're planning. We'll come back within one working day with a view on
            scope, timeline and cost.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@techpotam.com"
              className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
            >
              hello@techpotam.com
            </a>
            <a
              href="https://www.techpotam.com/"
              className="rounded-full border border-border px-8 py-4 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Book a discovery call
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Techpotam Ltd — United Kingdom</p>
        <p className="font-mono uppercase tracking-[0.3em]">London · Remote-first</p>
      </div>
    </footer>
  );
}
