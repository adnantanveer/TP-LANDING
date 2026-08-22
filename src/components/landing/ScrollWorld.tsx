import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import obj1 from "@/assets/obj-1.jpg";
import obj2 from "@/assets/obj-2.jpg";
import grid from "@/assets/grid.jpg";
import studio from "@/assets/studio.jpg";
import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import london from "@/assets/london.jpg";
import sceneLayers from "@/assets/scene-layers.jpg";
import sceneRibbon from "@/assets/scene-ribbon.jpg";
import sceneTerrain from "@/assets/scene-terrain.jpg";
import iconCube from "@/assets/icon-cube.png";
import iconTorus from "@/assets/icon-torus.png";
import iconOrb from "@/assets/icon-orb.png";
import iconStack from "@/assets/icon-stack.png";
import iconRocket from "@/assets/icon-rocket.png";

import { SectionLabel } from "./primitives";

/**
 * A pinned "scroll world": the viewer flies through a 3D space of floating
 * image planes and a rotating wireframe cube, then the next section is pulled
 * in from depth.
 */
export function ScrollWorld() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  // camera dolly
  const camZ = useTransform(p, [0, 1], [0, 5400]);
  const camRotate = useTransform(p, [0, 1], [-8, 8]);
  const gridScale = useTransform(p, [0, 1], [1, 2.2]);
  const gridOpacity = useTransform(p, [0, 0.5, 1], [0.25, 0.6, 0.1]);
  const headOpacity = useTransform(p, [0, 0.18, 0.3], [1, 1, 0]);
  const headY = useTransform(p, [0, 0.3], ["0%", "-30%"]);

  const planes = [
    { src: obj1, z: -1400, x: "-28%", y: "-14%", w: "26vw", label: "Systems" },
    { src: work1, z: -900, x: "30%", y: "-20%", w: "30vw", label: "Platforms" },
    { src: sceneLayers, z: -1150, x: "-6%", y: "-30%", w: "20vw", label: "Architecture" },
    { src: obj2, z: -1800, x: "8%", y: "22%", w: "22vw", label: "Interfaces" },
    { src: iconTorus, z: -2000, x: "38%", y: "24%", w: "12vw", label: "Motion" },
    { src: studio, z: -2400, x: "-34%", y: "18%", w: "34vw", label: "Studio" },
    { src: iconCube, z: -2600, x: "-14%", y: "-26%", w: "11vw", label: "Modules" },
    { src: work2, z: -3000, x: "26%", y: "6%", w: "28vw", label: "Delivery" },
    { src: sceneRibbon, z: -3400, x: "-30%", y: "-8%", w: "26vw", label: "Flow" },
    { src: iconOrb, z: -3700, x: "14%", y: "-24%", w: "12vw", label: "Data" },
    { src: work3, z: -4100, x: "34%", y: "-6%", w: "26vw", label: "Products" },
    { src: sceneTerrain, z: -4500, x: "-24%", y: "20%", w: "28vw", label: "Insight" },
    { src: iconStack, z: -4800, x: "6%", y: "8%", w: "11vw", label: "Storage" },
    { src: london, z: -5200, x: "28%", y: "18%", w: "26vw", label: "London" },
    { src: iconRocket, z: -5600, x: "-10%", y: "-18%", w: "13vw", label: "Launch" },
  ];


  return (
    <section ref={ref} className="relative h-[700vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_92%,transparent)_0%,color-mix(in_oklab,var(--primary)_14%,transparent)_50%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]">
        {/* wireframe tunnel */}
        <motion.img
          src={grid}
          alt="Glowing wireframe grid tunnel"
          loading="lazy"
          width={1600}
          height={1008}
          style={{ scale: gridScale, opacity: gridOpacity }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          className="absolute inset-0"
          style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}
        >
          <motion.div
            style={{ transformStyle: "preserve-3d", z: camZ, rotateY: camRotate }}
            className="absolute inset-0"
          >
            {planes.map((pl) => (
              <Plane key={pl.label} {...pl} progress={p} />
            ))}
            <Cube progress={p} />
          </motion.div>
        </div>

        {/* vignette */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent,var(--background)_85%)]"
          aria-hidden
        />

        <motion.div
          style={{ opacity: headOpacity, y: headY }}
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-4xl -translate-y-1/2 px-6 text-center"
        >
          <SectionLabel>Inside the work</SectionLabel>
          <h2 className="mt-6 text-[clamp(2rem,6vw,4.4rem)] font-semibold leading-[1.02]">
            Scroll into the <span className="text-ember">machine</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
            Every layer — interface, platform, infrastructure — engineered in one continuous
            delivery motion.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Plane({
  src,
  z,
  x,
  y,
  w,
  label,
  progress,
}: {
  src: string;
  z: number;
  x: string;
  y: string;
  w: string;
  label: string;
  progress: ReturnType<typeof useSpring>;
}) {
  const rotate = useTransform(progress, [0, 1], [10, -10]);
  const opacity = useTransform(progress, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);

  return (
    <motion.figure
      style={{
        transformStyle: "preserve-3d",
        translateZ: z,
        left: `calc(50% + ${x})`,
        top: `calc(50% + ${y})`,
        width: w,
        rotateY: rotate,
        opacity,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      <img
        src={src}
        alt={`${label} visual`}
        loading="lazy"
        className="h-auto w-full rounded-2xl border border-border object-cover shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
      />
      <figcaption className="mt-3 inline-block rounded-full border border-primary/30 bg-background/80 px-3.5 py-1.5 font-mono text-sm font-medium uppercase tracking-[0.15em] text-foreground shadow-lg backdrop-blur-md">
        {label}
      </figcaption>
    </motion.figure>
  );
}

/** Pure-CSS 3D wireframe cube driven by scroll. */
function Cube({ progress }: { progress: ReturnType<typeof useSpring> }) {
  const rotateX = useTransform(progress, [0, 1], [0, 360]);
  const rotateY = useTransform(progress, [0, 1], [0, 540]);
  const z = useTransform(progress, [0, 1], [-2600, -300]);
  const opacity = useTransform(progress, [0.15, 0.35, 0.9, 1], [0, 1, 1, 0]);
  const size = 220;
  const half = size / 2;

  const faces = [
    { t: `rotateY(0deg) translateZ(${half}px)` },
    { t: `rotateY(90deg) translateZ(${half}px)` },
    { t: `rotateY(180deg) translateZ(${half}px)` },
    { t: `rotateY(270deg) translateZ(${half}px)` },
    { t: `rotateX(90deg) translateZ(${half}px)` },
    { t: `rotateX(-90deg) translateZ(${half}px)` },
  ];

  return (
    <motion.div
      aria-hidden
      style={{ transformStyle: "preserve-3d", translateZ: z, rotateX, rotateY, opacity }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div style={{ width: size, height: size, transformStyle: "preserve-3d" }} className="relative">
        {faces.map((f, i) => (
          <div
            key={i}
            style={{ transform: f.t }}
            className="absolute inset-0 border border-primary/60 bg-primary/5 backdrop-blur-[1px]"
          />
        ))}
      </div>
    </motion.div>
  );
}
