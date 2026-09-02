import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";

const CONCEPTS = [
  {
    href: "/concepts/signal",
    name: "Signal",
    tagline: "Light, Swiss-editorial-kinetic. Single cobalt accent, sharp architectural radius.",
    tokens: ["Light mode", "Space Grotesk / IBM Plex", "Cobalt", "Full depth"],
  },
  {
    href: "/concepts/vantage",
    name: "Vantage",
    tagline: "Dark, cold-luxury bento and glass. Single ice-blue accent, soft pill radius.",
    tokens: ["Dark mode", "Bricolage / Plus Jakarta", "Ice blue", "Full depth"],
  },
  {
    href: "/concepts/vertex",
    name: "Vertex",
    tagline: "Dark, a real rendered Three.js scene driving the hero. Single neon-lime accent, zero radius.",
    tokens: ["Dark mode", "Syne / Hanken Grotesk", "Neon lime", "Real 3D scene"],
  },
  {
    href: "/concepts/concrete",
    name: "Concrete",
    tagline: "Light, brutalist/raw. Off-white, near-black, one alarm-red accent, thick offset shadows.",
    tokens: ["Light mode", "Archivo Black / Archivo", "Alarm red", "Full depth"],
  },
  {
    href: "/concepts/surge",
    name: "Surge",
    tagline: "Dark, maximalist and constantly moving. Single hot-magenta accent, full-pill radius.",
    tokens: ["Dark mode", "Unbounded / Onest", "Hot magenta", "Full depth"],
  },
  {
    href: "/concepts/air",
    name: "Air",
    tagline: "Light, ultra-minimal gallery. One type family, near-monochrome, huge whitespace.",
    tokens: ["Light mode", "Instrument Sans", "Restrained pine", "Full depth"],
  },
  {
    href: "/concepts/shell",
    name: "Shell",
    tagline: "Dark, developer-terminal aesthetic. Git-log work history, dependency-graph tech stack, amber accent.",
    tokens: ["Dark mode", "Big Shoulders / Work Sans", "Amber", "Full depth"],
  },
  {
    href: "/concepts/index",
    name: "Index",
    tagline: "Light, bold editorial. Scroll-driven accordion services list, coral color-block chapters, huge impact type.",
    tokens: ["Light mode", "Anton / Figtree", "Coral", "Full depth"],
  },
];

/** Plain switcher page, not itself one of the design concepts — kept
 * neutral so it doesn't bias comparison between them. All six are full
 * depth: hero, capabilities, work, process, stack, testimonials, contact,
 * footer. Signal/Vantage keep the scroll-driven video hero; the other
 * four each have their own signature hero treatment instead. */
export function ConceptsIndex() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-24 text-foreground">
      <div className="w-full max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Redesign concepts</p>
        <h1 className="mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.05]">
          Eight directions for the new Techpotam site.
        </h1>
        <p className="mt-4 max-w-lg text-sm text-muted-foreground">
          Every concept is built out in full, with its own hero, capabilities, work, process, stack,
          testimonials and a working contact form.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <Link
              key={c.href}
              to={c.href}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{c.name}</h2>
                  <ArrowUpRight weight="bold" className="h-5 w-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.tagline}</p>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2">
                {c.tokens.map((t) => (
                  <li key={t} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {t}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
