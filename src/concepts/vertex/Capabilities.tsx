import { Reveal } from "@/components/landing/primitives";
import { capabilities } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function VertexCapabilities() {
  return (
    <section id="capabilities" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// capabilities</p>
        <h2 className="mt-4 max-w-xl text-[clamp(2rem,4.6vw,3.2rem)] font-bold leading-[1.05]">
          Everything a UK team needs, under one roof.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-primary/25 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <div className="group relative h-full border-primary/10 bg-background p-8 transition-colors hover:bg-primary/[0.04]">
                <CapabilityIcon icon={c.icon} className="h-8 w-8 text-primary/60 transition-colors group-hover:text-primary" />
                <h3 className="mt-6 text-lg font-semibold">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <div className="absolute inset-0 border border-transparent transition-colors group-hover:border-primary/40" aria-hidden />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
