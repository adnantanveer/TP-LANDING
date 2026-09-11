import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/primitives";
import { testimonials } from "@/concepts/shared/content";

const TOTAL = testimonials.length;

/**
 * Signature section: an actual drag-physics carousel (Motion's `drag="x"`
 * with real dragConstraints/elastic bounce), not a scroll-linked
 * auto-advance — the reader flicks the quote themselves. Prev/next buttons
 * and dots duplicate the same navigation for keyboard and touch users who
 * never drag, so the gesture is a bonus, never the only way through.
 */
export function CrestTestimonials() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function go(next: number) {
    setIndex(Math.max(0, Math.min(TOTAL - 1, next)));
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = width * 0.18;
    if (info.offset.x < -threshold || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > threshold || info.velocity.x > 400) go(index - 1);
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <span className="crest-eyebrow">Client feedback</span>
          <h2 className="mt-5 max-w-xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.05]">Trusted by teams who ship.</h2>
        </Reveal>
      </div>

      <div ref={viewportRef} className="relative mt-14 overflow-hidden" aria-roledescription="carousel">
        <motion.div
          drag={width > 0 ? "x" : false}
          dragConstraints={{ left: -(TOTAL - 1) * width, right: 0 }}
          dragElastic={0.12}
          animate={{ x: -index * width }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          onDragEnd={handleDragEnd}
          className="flex cursor-grab active:cursor-grabbing"
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name + t.org}
              role="group"
              aria-roledescription="slide"
              aria-label={`Testimonial ${i + 1} of ${TOTAL}`}
              className="shrink-0 px-6"
              style={{ width }}
            >
              <blockquote className="mx-auto max-w-2xl text-center">
                <p className="text-[clamp(1.3rem,3.2vw,2rem)] leading-[1.35] text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 text-sm text-muted-foreground">
                  {t.name}, {t.org}
                </footer>
              </blockquote>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto mt-10 flex max-w-4xl items-center justify-center gap-6 px-6">
        <button
          type="button"
          aria-label="Previous testimonial"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name + t.org}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className="p-1.5"
            >
              <motion.span
                animate={{ width: i === index ? 22 : 8, backgroundColor: i === index ? "var(--primary)" : "var(--border)" }}
                transition={{ duration: 0.3 }}
                className="block h-2 rounded-full"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next testimonial"
          disabled={index === TOTAL - 1}
          onClick={() => go(index + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
        >
          <ArrowRight weight="bold" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
