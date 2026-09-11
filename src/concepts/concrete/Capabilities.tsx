import { Reveal } from "@/components/landing/primitives";
import { capabilities } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function ConcreteCapabilities() {
  return (
    <section id="capabilities" className="relative border-b-2 border-foreground bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-[clamp(2rem,5.5vw,4rem)] font-display leading-[0.95]">
          Everything a UK team needs, under one roof.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.04}>
              <div className="concrete-block h-full border-2 border-foreground bg-card p-7">
                <CapabilityIcon icon={c.icon} className="h-8 w-8 text-primary" />
                <h3 className="mt-5 text-lg font-bold uppercase tracking-tight">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
