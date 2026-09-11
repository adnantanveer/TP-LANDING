import { Reveal } from "@/components/landing/primitives";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

const GROUPS = ["Frontend", "Backend", "Cloud", "Data & AI"];

/** Quiet grouped list, no cards, no borders beyond the section's own
 * divide-y — the restraint IS the design here. */
export function AirStack() {
  return (
    <section id="stack" className="relative border-t border-border bg-background py-32 md:py-48">
      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <Reveal>
          <h2 className="max-w-lg text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.15]">A full-spectrum technology stack.</h2>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-14 md:grid-cols-2">
          {GROUPS.map((group, gi) => (
            <Reveal key={group} delay={gi * 0.05}>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{group}</p>
                <ul className="mt-5 space-y-3">
                  {techStack
                    .filter((t) => t.group === group)
                    .map((t) => (
                      <li key={t.name} className="flex items-center gap-3 text-sm">
                        <TechIcon name={t.name} className="h-4 w-4 shrink-0 text-primary" />
                        <span>{t.name}</span>
                        <span className="text-muted-foreground">{t.blurb}</span>
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
