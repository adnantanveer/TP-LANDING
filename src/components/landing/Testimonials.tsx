import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { KineticHeading, SectionLabel, initials } from "./primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

const ROTATE_MS = 5000;
const SWIPE_PX = 48;

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
 * "Trusted by ambitious teams" — an auto-rotating showcase instead of the
 * old 280vh scroll-pinned crossfade. One quote on stage at a time; the
 * next slides in every five seconds, pausing while the pointer or
 * keyboard focus is inside the section. Dots jump directly, a horizontal
 * drag/swipe moves one step (motion's drag gesture, so it works with a
 * mouse too), and the ring around the portrait doubles as the timer.
 * Transform/opacity only; under prefers-reduced-motion the rotation
 * stops and slides cut instead of sliding.
 */
export function Testimonials() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<TestimonialItem[]>(DEFAULT_ITEMS);
  const [[index, dir], setIndex] = useState<[number, 1 | -1]>([0, 1]);
  const [paused, setPaused] = useState(false);
  // Remounts the timer ring on every manual jump so it restarts from 0.
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/content/testimonials`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.testimonials?.length && setItems(data.testimonials))
      .catch(() => {});
  }, []);

  const go = useCallback(
    (to: number, d: 1 | -1) => {
      setIndex([((to % items.length) + items.length) % items.length, d]);
      setCycle((c) => c + 1);
    },
    [items.length]
  );

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const id = window.setInterval(() => go(index + 1, 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduce, items.length, index, go]);

  const current = items[index];
  if (!current) return null;

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_PX) go(index + 1, 1);
    else if (info.offset.x > SWIPE_PX) go(index - 1, -1);
  }

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)] py-28 md:py-36"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        setCycle((c) => c + 1); // the interval restarts from 0, so the ring must too
      }}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <SectionLabel>In their words</SectionLabel>
          <KineticHeading
            text="Trusted by *ambitious* teams."
            className="mt-6 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02]"
          />
        </div>

        <motion.div
          drag={items.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
          aria-live="polite"
          aria-roledescription="carousel"
          className="relative mt-14 min-h-[26rem] cursor-grab touch-pan-y select-none active:cursor-grabbing md:min-h-[22rem]"
        >
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.figure
              key={current.id}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 80, rotate: dir * 1.5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -80, rotate: dir * -1.5 }}
              transition={{ duration: reduce ? 0.2 : 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center text-center"
            >
              <PersonImage name={current.name} photo={current.photo} timerKey={cycle} running={!paused && !reduce && items.length > 1} />
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
        </motion.div>

        {items.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3" role="tablist" aria-label="Testimonials">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => go(i, i > index ? 1 : -1)}
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

// Portrait with the rotation timer drawn as a ring around it. The stroke
// draws over ROTATE_MS via a CSS animation (.testimonial-ring in
// styles.css) — remounted (timerKey) on each change so it starts from
// empty, and frozen in place via animation-play-state while paused.
function PersonImage({ name, photo, timerKey, running }: { name: string; photo: string; timerKey: number; running: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-36 w-36 shrink-0 md:h-40 md:w-40">
      <svg viewBox="0 0 100 100" className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="48" fill="none" stroke="color-mix(in oklab, var(--primary) 25%, transparent)" strokeWidth="1" />
        <circle
          key={timerKey}
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={1}
          className="testimonial-ring"
          style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: running ? "running" : "paused" }}
        />
      </svg>
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
