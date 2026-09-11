import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { capabilities, type CapabilityIconKey } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function SignalCapabilities() {
  return (
    <section id="capabilities" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-[clamp(2.1rem,5vw,3.8rem)] font-semibold leading-[1.03]">
            Everything a UK team needs, under one roof.
          </h2>
          <p className="mt-6 max-w-md text-base text-muted-foreground">
            Cross-functional squads embedded with your business. Discovery, delivery and long-term support.
          </p>
        </div>

        <div className="mt-16 border-t border-border">
          {capabilities.map((c, i) => (
            <Row key={c.title} index={i} title={c.title} body={c.body} icon={c.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ index, title, body, icon }: { index: number; title: string; body: string; icon: CapabilityIconKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 55%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <motion.article
      ref={ref}
      style={{ opacity, y }}
      className="group grid grid-cols-1 gap-4 border-b border-border py-9 md:grid-cols-[5rem_3.5rem_1fr_2fr_auto] md:items-center md:gap-8"
    >
      <span className="signal-index text-sm text-primary">{String(index + 1).padStart(2, "0")}</span>
      <CapabilityIcon
        icon={icon}
        className="hidden h-9 w-9 shrink-0 text-primary/50 transition-all duration-500 group-hover:scale-110 group-hover:text-primary md:block"
      />
      <h3 className="text-2xl font-medium leading-tight transition-colors group-hover:text-primary md:text-[1.75rem]">
        {title}
      </h3>
      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{body}</p>
      <ArrowUpRight
        weight="bold"
        className="hidden h-5 w-5 shrink-0 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 md:block"
      />
    </motion.article>
  );
}
