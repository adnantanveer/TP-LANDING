import { Reveal } from "@/components/landing/primitives";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

export function AirProcess() {
  return (
    <section id="process" className="relative border-t border-border bg-background py-32 md:py-48">
      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <Reveal>
          <h2 className="max-w-lg text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">A delivery model built for certainty.</h2>
        </Reveal>

        <div className="mt-24 flex flex-col divide-y divide-border">
          {processSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.04}>
              <div className="flex flex-col gap-4 py-10 md:flex-row md:items-start md:gap-12">
                <ProcessIcon icon={s.icon} className="h-6 w-6 shrink-0 text-primary" />
                <div className="md:w-56 md:shrink-0">
                  <p className="text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-lg">{s.title}</h3>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
