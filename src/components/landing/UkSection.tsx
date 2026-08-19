import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import london from "@/assets/london.jpg";
import { SectionLabel, Reveal } from "./primitives";

export function UkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });
  const y = useTransform(smooth, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(smooth, [0, 0.5, 1], [1.3, 1.12, 1.3]);
  const dim = useTransform(smooth, [0, 0.5, 1], [0.85, 0.45, 0.85]);

  const stats = [
    { k: "12+", v: "Years building software" },
    { k: "80+", v: "Products delivered" },
    { k: "GDPR", v: "UK data compliant" },
    { k: "GMT", v: "Overlapping hours" },
  ];

  return (
    <section ref={ref} className="relative h-[130vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.img
          src={london}
          alt="London skyline at dusk"
          loading="lazy"
          width={1600}
          height={1000}
          style={{ y, scale }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-background" aria-hidden />

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <SectionLabel>UK presence</SectionLabel>
          <Reveal>
            <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[1.02]">
              A delivery partner that works on <span className="text-ember">British time</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-muted-foreground">
              Contracts under UK law, invoicing in GBP, and teams available through the full working
              day — from stand-up in the morning to release in the evening.
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.k} delay={0.08 * i}>
                <p className="text-3xl font-semibold text-ember md:text-5xl">{s.k}</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.v}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
