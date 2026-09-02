import { Reveal } from "@/components/landing/primitives";
import { capabilities } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function AirCapabilities() {
  return (
    <section id="capabilities" className="relative bg-background py-32 md:py-48">
      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <Reveal>
          <h2 className="max-w-lg text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">
            Everything a UK team needs, under one roof.
          </h2>
        </Reveal>

        <div className="mt-24 flex flex-col divide-y divide-border">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.04}>
              <div className="flex flex-col gap-4 py-10 md:flex-row md:items-start md:gap-12">
                <CapabilityIcon icon={c.icon} className="h-6 w-6 shrink-0 text-primary" />
                <div className="md:w-56 md:shrink-0">
                  <h3 className="text-lg">{c.title}</h3>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
