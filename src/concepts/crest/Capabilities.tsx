import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Reveal } from "@/components/landing/primitives";
import { capabilities, type CapabilityItem } from "@/concepts/shared/content";
import { CapabilityIcon } from "@/concepts/shared/sectionIcons";

export function CrestCapabilities() {
  return (
    <section className="relative border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <span className="crest-eyebrow">What we do</span>
          <h2 className="mt-5 max-w-xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.05]">
            Everything a UK team needs, under one roof.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <TiltCard item={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Card tilts toward wherever the cursor is inside it — the same
 * useMotionValue/useSpring-driven, never-useState physics as
 * shared/Magnetic.tsx, applied to rotateX/rotateY instead of x/y. */
function TiltCard({ item, index }: { item: CapabilityItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spx = useSpring(px, { stiffness: 200, damping: 20, mass: 0.4 });
  const spy = useSpring(py, { stiffness: 200, damping: 20, mass: 0.4 });
  const rotateX = useTransform(spy, [0, 1], [7, -7]);
  const rotateY = useTransform(spx, [0, 1], [-7, 7]);
  const glowX = useTransform(spx, (v) => `${v * 100}%`);
  const glowY = useTransform(spy, (v) => `${v * 100}%`);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([gx, gy]) => `radial-gradient(240px circle at ${gx} ${gy}, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)`,
  );

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7"
    >
      <motion.div
        aria-hidden
        style={{ background: glowBackground }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-center justify-between">
        <CapabilityIcon icon={item.icon} className="h-7 w-7 text-primary" />
        <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
      </div>
      <h3 className="relative mt-5 text-lg font-medium">{item.title}</h3>
      <p className="relative mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
    </motion.div>
  );
}
