import { Reveal } from "@/components/landing/primitives";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

const GROUPS = ["Frontend", "Backend", "Cloud", "Data & AI"];

export function ConcreteStack() {
  return (
    <section id="stack" className="relative border-b-2 border-foreground bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-2xl text-[clamp(2rem,5.5vw,4rem)] font-display leading-[0.95]">A full-spectrum technology stack.</h2>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
          {GROUPS.map((group, gi) => (
            <Reveal key={group} delay={gi * 0.05}>
              <div>
                <h3 className="border-b-2 border-foreground pb-2 text-sm font-bold uppercase tracking-wide">{group}</h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {techStack
                    .filter((t) => t.group === group)
                    .map((t) => (
                      <li key={t.name} title={t.blurb} className="flex items-center gap-2 border-2 border-foreground px-3 py-2 text-sm font-bold uppercase">
                        <TechIcon name={t.name} className="h-4 w-4" />
                        {t.name}
                      </li>
                    ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
