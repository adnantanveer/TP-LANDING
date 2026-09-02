import { Reveal } from "@/components/landing/primitives";
import { techStack } from "@/concepts/shared/content";
import { TechIcon } from "@/concepts/shared/techIcons";

const GROUPS = ["Frontend", "Backend", "Cloud", "Data & AI"];

/** Grouped clusters instead of one long 16-row list, and real brand marks
 * (Simple Icons) instead of text chips — desaturated to foreground/70 at
 * rest, snapping to full brand-neutral cobalt on hover. */
export function SignalStack() {
  return (
    <section
      id="stack"
      className="relative border-t border-border py-28 md:py-36"
      style={{
        background:
          "linear-gradient(180deg, var(--background) 0%, color-mix(in oklab, var(--primary) 5%, var(--background)) 45%, var(--background) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.03]">
          A full-spectrum technology stack.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          {GROUPS.map((group) => (
            <Reveal key={group}>
              <div className="border-l-2 border-primary pl-6">
                <h3 className="font-mono text-sm text-muted-foreground">{group}</h3>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {techStack
                    .filter((t) => t.group === group)
                    .map((t) => (
                      <li
                        key={t.name}
                        title={t.blurb}
                        className="group flex items-center gap-2 border border-border px-3.5 py-2.5 text-sm text-foreground/80 transition-colors hover:border-primary"
                      >
                        <TechIcon name={t.name} className="h-4 w-4 text-foreground/50 transition-colors group-hover:text-primary" />
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
