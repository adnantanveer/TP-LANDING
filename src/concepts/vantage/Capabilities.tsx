import { Reveal } from "@/components/landing/primitives";
import gridTexture from "@/assets/grid.jpg";
import { capabilities, type CapabilityIconKey } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

/** 5 items -> 5 bento cells, no empty slots: auto-placement with A at
 * col-span-2 row-span-2 fills row1-2 as [A A B / A A C], then D (col-span-2)
 * and E complete row 3 as [D D E]. Three cells carry real visual variation
 * (gradient mesh, a real image, a CSS pattern) so it isn't five identical
 * glass-on-glass text tiles. */
export function VantageCapabilities() {
  const [a, b, c, d, e] = capabilities;

  return (
    <section id="capabilities" className="relative bg-background py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="max-w-xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.03]">
          Everything a UK team needs, under one roof.
        </h2>
        <p className="mt-5 max-w-md text-base text-muted-foreground">
          Cross-functional squads embedded with your business. Discovery, delivery and long-term support.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[12rem]">
          <Reveal className="md:col-span-2 md:row-span-2">
            <Cell tone="gradient" title={a.title} body={a.body} icon={a.icon} tall />
          </Reveal>
          <Reveal delay={0.05}>
            <Cell title={b.title} body={b.body} icon={b.icon} />
          </Reveal>
          <Reveal delay={0.1}>
            <Cell tone="pattern" title={c.title} body={c.body} icon={c.icon} />
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-2">
            <Cell tone="image" title={d.title} body={d.body} icon={d.icon} />
          </Reveal>
          <Reveal delay={0.2}>
            <Cell title={e.title} body={e.body} icon={e.icon} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Cell({
  title,
  body,
  icon,
  tone = "glass",
  tall = false,
}: {
  title: string;
  body: string;
  icon: CapabilityIconKey;
  tone?: "glass" | "gradient" | "pattern" | "image";
  tall?: boolean;
}) {
  return (
    <div
      className={`vantage-glass relative h-full min-h-[12rem] overflow-hidden rounded-[1.75rem] p-7 ${tall ? "flex flex-col justify-end" : ""} ${tone === "gradient" ? "vantage-sheen" : ""}`}
    >
      {tone === "gradient" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 15% 0%, color-mix(in oklab, var(--primary) 35%, transparent), transparent 60%), radial-gradient(90% 90% at 100% 100%, color-mix(in oklab, var(--primary-glow) 25%, transparent), transparent 65%)",
          }}
          aria-hidden
        />
      )}
      {tone === "pattern" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(color-mix(in oklab, var(--primary) 70%, transparent) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
          aria-hidden
        />
      )}
      {tone === "image" && (
        <>
          <img src={gridTexture} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" aria-hidden />
        </>
      )}

      <div className="relative">
        <CapabilityIcon icon={icon} className={`text-primary ${tall ? "mb-4 h-9 w-9" : "mb-2.5 h-6 w-6"}`} />
        <h3 className={`font-medium ${tall ? "text-2xl" : "text-lg"}`}>{title}</h3>
        <p className={`mt-2 text-muted-foreground ${tall ? "max-w-sm text-sm" : "text-xs leading-relaxed"}`}>{body}</p>
      </div>
    </div>
  );
}
