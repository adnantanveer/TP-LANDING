import { Reveal } from "@/components/landing/primitives";
import { processSteps } from "@/concepts/shared/content";
import { ProcessIcon } from "@/concepts/shared/sectionIcons";

export function IndexProcess() {
  return (
    <section id="process" className="relative bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <span className="index-tag">/ PROCESS</span>
        <h2 className="mt-4 max-w-xl text-[clamp(1.9rem,5vw,3.4rem)] leading-[0.95]">A delivery model built for certainty.</h2>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <div className="border-t-2 border-foreground pt-5">
                <div className="flex items-center justify-between">
                  <span className="index-tag text-primary">P/{String(i + 1).padStart(3, "0")}</span>
                  <ProcessIcon icon={s.icon} className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-2xl uppercase leading-none">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
