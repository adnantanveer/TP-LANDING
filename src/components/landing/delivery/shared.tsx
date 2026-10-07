import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export type DeliveryVariant = "a" | "b" | "c";

/**
 * TEMP review switch: `?delivery=a|b|c` (default a). On a HashRouter the
 * query can sit either before the hash (`/?delivery=b#/`, which only
 * window.location.search sees) or inside it (`/#/?delivery=b`, which only
 * react-router's own search params see) — both are accepted so whichever
 * form the reviewer types works. Remove once a variant is chosen.
 */
export function useDeliveryVariant(): DeliveryVariant {
  const [params] = useSearchParams();
  const fromHash = params.get("delivery");
  const fromSearch = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("delivery") : null;
  const v = (fromSearch ?? fromHash ?? "a").toLowerCase();
  return v === "b" || v === "c" ? v : "a";
}

// The delivery promise, pulled out of Process.tsx (which keeps the four
// steps) — this is the "why it's safe to buy" beat, so it's proof points,
// not a method. Hard-coded for now: there's no CMS key for it yet (see the
// handoff for the proposed `delivery` content shape).
export const DELIVERY = {
  label: "Delivery",
  heading: "A delivery model built for *certainty.*",
  line: "Fixed scope. Weekly demos. Your code, your cloud.",
  proofs: [
    { k: "Fixed", v: "scope and price" },
    { k: "Friday", v: "demo, every week" },
    { k: "Yours", v: "code, cloud and IP" },
    { k: "SLA", v: "from the day you launch" },
  ],
};

export const VIDEO = {
  a: { src: "/assets/vid/delivery/delivery-a.mp4", poster: "/assets/vid/delivery/delivery-a.jpg" },
  b: { src: "/assets/vid/delivery/delivery-b.mp4", poster: "/assets/vid/delivery/delivery-b.jpg" },
  c: { src: "/assets/vid/delivery/delivery-c.mp4", poster: "/assets/vid/delivery/delivery-c.jpg" },
} satisfies Record<DeliveryVariant, { src: string; poster: string }>;

/**
 * Background loop: muted, inline, looping, metadata-only preload, and
 * only actually playing while on screen (an off-screen autoplaying video
 * still decodes every frame). Under prefers-reduced-motion the poster is
 * shown instead and the clip never loads.
 */
export function DeliveryVideo({ variant, className }: { variant: DeliveryVariant; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const { src, poster } = VIDEO[variant];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = `h-full w-full object-cover ${className ?? ""}`;
  if (reduce) return <img src={poster} alt="" width={1280} height={720} className={cls} />;

  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden className={cls} />;
}
