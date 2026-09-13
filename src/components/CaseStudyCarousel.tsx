import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "motion/react";

type WorkImage = { url: string; type: "image" | "video"; title: string; altText: string; caption: string };

/**
 * Drag-physics carousel for the case study cover (same mechanism as
 * Crest's testimonials carousel — Motion's real `drag="x"`, not a
 * scroll-linked auto-advance), swapped in for what used to be a single
 * static <img>/<video>. Same outer sizing/border/radius as the old cover
 * so the page's layout is unchanged — only this one element's content is
 * now browsable when a project has more than one image. Prev/next buttons
 * and dots duplicate the drag gesture for keyboard/touch users, and the
 * whole nav row is skipped entirely for a single-image project (identical
 * to the old static-image behavior in that case).
 */
export function CaseStudyCarousel({ images, title }: { images: WorkImage[]; title: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function go(next: number) {
    setIndex(Math.max(0, Math.min(total - 1, next)));
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = width * 0.18;
    if (info.offset.x < -threshold || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > threshold || info.velocity.x > 400) go(index - 1);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <div ref={viewportRef} className="overflow-hidden">
        <motion.div
          drag={total > 1 && width > 0 ? "x" : false}
          dragConstraints={{ left: -(total - 1) * width, right: 0 }}
          dragElastic={0.12}
          animate={{ x: -index * width }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          onDragEnd={handleDragEnd}
          className={`flex ${total > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
          {images.map((img, i) => (
            <div key={img.url + i} className="shrink-0" style={{ width: width || "100%" }}>
              {img.type === "video" ? (
                <video src={img.url} controls className="h-[38vh] w-full object-cover md:h-[56vh]" />
              ) : (
                <img
                  src={img.url}
                  alt={img.altText || title}
                  width={1600}
                  height={1000}
                  className="h-[38vh] w-full object-cover md:h-[56vh]"
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary disabled:opacity-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5 7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next image"
            disabled={index === total - 1}
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary disabled:opacity-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="m9 5 8 7-8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {images.map((img, i) => (
              <button key={img.url + i} type="button" aria-label={`Go to image ${i + 1}`} aria-current={i === index} onClick={() => go(i)} className="p-1.5">
                <span
                  className="block h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === index ? 20 : 6, backgroundColor: i === index ? "var(--primary)" : "rgba(255,255,255,0.5)" }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
