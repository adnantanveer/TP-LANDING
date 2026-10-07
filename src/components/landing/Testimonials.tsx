import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { KineticHeading, SectionLabel, initials } from "./primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

const ROTATE_MS = 3500;

type TestimonialItem = {
  id: string;
  name: string;
  organization: string;
  role: string;
  quote: string;
  photo: string;
};

// The client's own default quotes are attributed by role only. For the
// visual review they're given fictional names and stock portraits (Pexels
// licence, see the handoff) so the section reads as personal — every one
// of these must be replaced with real, permissioned testimonials via the
// CMS before launch.
const DEFAULT_ITEMS: TestimonialItem[] = [
  {
    // TEMP placeholder testimonial
    id: "default-1",
    quote: "They treated our product like it was their own. The craft shows in every screen.",
    name: "Eleanor Whitcombe",
    organization: "UK Healthcare Provider",
    role: "Operations Director",
    photo: "/assets/stock/portrait-1.jpg",
  },
  {
    // TEMP placeholder testimonial
    id: "default-2",
    quote: "What impressed us most was the restraint. Nothing feels unnecessary — it just works.",
    name: "Daniel Okafor",
    organization: "UK Financial Services Firm",
    role: "Head of Digital",
    photo: "/assets/stock/portrait-2.jpg",
  },
  {
    // TEMP placeholder testimonial
    id: "default-3",
    quote: "Discovery to launch felt calm and considered. The result speaks for itself.",
    name: "Thomas Ashdown",
    organization: "UK Logistics Startup",
    role: "Founder",
    photo: "/assets/stock/portrait-3.jpg",
  },
];

/**
 * "From our clients." — an auto-rotating showcase instead of the old
 * 280vh scroll-pinned crossfade. One quote on stage at a time; the next
 * crossfades in every 3.5 s (opacity only — no sideways travel, no timer
 * ring), pausing while the pointer or keyboard focus is inside the
 * section. The dots jump directly. Under prefers-reduced-motion the
 * rotation stops and the dots still work.
 */
export function Testimonials() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<TestimonialItem[]>(DEFAULT_ITEMS);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/content/testimonials`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.testimonials?.length && setItems(data.testimonials))
      .catch(() => {});
  }, []);

  const go = useCallback((to: number) => setIndex(((to % items.length) + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const id = window.setInterval(() => go(index + 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduce, items.length, index, go]);

  const current = items[index];
  if (!current) return null;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-28 md:py-36"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <SectionLabel>In their words</SectionLabel>
          <KineticHeading text="From our *clients.*" className="mt-6 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]" />
        </div>

        <div aria-live="polite" aria-roledescription="carousel" className="relative mt-14 min-h-[26rem] md:min-h-[22rem]">
          {/* mode="sync" so the outgoing and incoming quotes overlap into a
              true crossfade rather than fading out, then in. */}
          <AnimatePresence mode="sync" initial={false}>
            <motion.figure
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.2 : 0.9, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center text-center"
            >
              <PersonImage name={current.name} photo={current.photo} />
              <blockquote className="mt-6">
                <p className="text-[clamp(1.35rem,2.8vw,2.1rem)] font-medium leading-[1.3] text-foreground">
                  &ldquo;{current.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-6">
                <p className="font-medium">{current.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{[current.role, current.organization].filter(Boolean).join(", ")}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3" role="tablist" aria-label="Testimonials">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => go(i)}
                className="group flex h-11 w-11 items-center justify-center rounded-full outline-none"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-primary/60 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background ${
                    i === index ? "w-8 bg-primary" : "w-3 bg-foreground/25 group-hover:bg-foreground/50"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Portrait with the same monogram-underneath cross-fade as the team cards;
// a thin static ember ring, nothing animated around it.
function PersonImage({ name, photo }: { name: string; photo: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-36 w-36 shrink-0 md:h-40 md:w-40">
      <div className="relative h-full w-full overflow-hidden rounded-full border border-primary/30 shadow-[var(--shadow-ember)]">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-transparent font-display text-4xl font-semibold text-primary">
          {initials(name)}
        </div>
        {photo && (
          <img
            src={photo}
            alt=""
            width={800}
            height={800}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}
