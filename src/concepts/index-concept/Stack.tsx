import { Reveal } from "@/components/landing/primitives";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

const GROUPS = ["Frontend", "Backend", "Cloud", "Data & AI"];

export function IndexStack() {
  return (
    <section id="stack" className="relative border-t border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <span className="index-tag">/ STACK</span>
        <h2 className="mt-4 max-w-xl text-[clamp(1.9rem,5vw,3.4rem)] leading-[0.95]">A full-spectrum technology stack.</h2>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
          {GROUPS.map((group, gi) => (
            <Reveal key={group} delay={gi * 0.05}>
              <div className="index-dashed border-t border-dashed border-border pt-5">
                <p className="index-tag">{group}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {techStack
                    .filter((t) => t.group === group)
                    .map((t) => (
                      <li key={t.name} title={t.blurb} className="flex items-center gap-2 border border-border px-3 py-2 text-sm transition-colors hover:border-primary">
                        <TechIcon name={t.name} className="h-4 w-4 text-foreground/60" />
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
