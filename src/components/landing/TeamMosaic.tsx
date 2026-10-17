import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { initials } from "./primitives";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  banner: string;
  bio: string;
  order: number;
  // Optional: marks the people the homepage leads with (see the handoff, §2).
  isKeyMember?: boolean;
};

/*
 * Irregular masonry. Every tile is one column wide so portraits keep a
 * portrait shape (faces never get cropped by a wide tile). Tiles mix two
 * heights, each one is placed in the currently shortest column, and the
 * last tile of every column grows to fill what is left, so the bottom
 * edge is flat with no empty space under the final photos.
 */
const TALL = [true, false, true, false, false, true, false, true, true, false];
const HEIGHT = {
  tall: "h-[17rem] sm:h-[19rem] lg:h-[21.5rem]",
  short: "h-[11rem] sm:h-[12.5rem] lg:h-[15.5rem]",
};
const GAP = "gap-3 sm:gap-4";
const isTall = (i: number) => TALL[i % TALL.length];

function useColumnCount() {
  const read = () =>
    window.matchMedia("(min-width: 1024px)").matches ? 4 : window.matchMedia("(min-width: 640px)").matches ? 3 : 2;
  const [cols, setCols] = useState(() => (typeof window === "undefined" ? 4 : read()));
  useEffect(() => {
    const queries = ["(min-width: 1024px)", "(min-width: 640px)"].map((q) => window.matchMedia(q));
    const sync = () => setCols(read());
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  }, []);
  return cols;
}

/** Tile indexes per column, each tile going to the currently shortest column. */
function masonry(count: number, cols: number): number[][] {
  const columns = Array.from({ length: cols }, () => [] as number[]);
  const heights = new Array<number>(cols).fill(0);
  for (let i = 0; i < count; i++) {
    const c = heights.indexOf(Math.min(...heights));
    columns[c].push(i);
    heights[c] += isTall(i) ? 3 : 2;
  }
  return columns;
}

const RADII = [
  "rounded-[1.75rem]",
  "rounded-[1rem]",
  "rounded-[2.25rem_1rem_2.25rem_1rem]",
  "rounded-[1.25rem]",
  "rounded-[1rem_2.25rem_1rem_2.25rem]",
  "rounded-[2rem]",
  "rounded-[1rem_1rem_2.5rem_1rem]",
];

// Width of the hover card; it opens beside the hovered tile, inside the grid.
const CARD_WIDTH = 440;

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 220, damping: 28, mass: 0.9 } as const;

type Anchor = { top: number; left: number; width: number; height: number; gridWidth: number };

export function TeamMosaic({ members }: { members: TeamMember[] }) {
  const reduce = useReducedMotion();
  const baseId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLDivElement>());
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Desktop card stays mounted and is driven by state (no mount/unmount), so
  // a card that is fading out can never swallow the hover on the tile below
  // it. `shownId` keeps the last person visible while the card fades out;
  // `fresh` is true when the card opens from closed (snap to the tile and
  // unroll) and false while moving between people (glide).
  const [shownId, setShownId] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const activeRef = useRef<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [canHover, setCanHover] = useState(true);
  const columnCount = useColumnCount();
  const columns = masonry(members.length, Math.max(1, Math.min(columnCount, Math.ceil(members.length / 2))));

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const open = useCallback((id: string) => {
    const tile = tileRefs.current.get(id);
    const grid = gridRef.current;
    if (!tile || !grid) return;
    window.clearTimeout(closeTimer.current);
    setAnchor({ top: tile.offsetTop, left: tile.offsetLeft, width: tile.offsetWidth, height: tile.offsetHeight, gridWidth: grid.offsetWidth });
    setFresh(activeRef.current === null);
    activeRef.current = id;
    setShownId(id);
    setActiveId(id);
  }, []);

  const close = useCallback(() => {
    window.clearTimeout(openTimer.current);
    activeRef.current = null;
    setActiveId(null);
  }, []);

  // Hover intent: a short delay before opening (none when switching between
  // people) and a slightly longer one before closing, so sweeping the mouse
  // across the grid doesn't flicker cards open and shut.
  const hoverOpen = (id: string) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => open(id), activeId ? 0 : 110);
  };
  const hoverClose = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(close, 220);
  };
  const keepOpen = () => window.clearTimeout(closeTimer.current);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const id = activeId;
      close();
      tileRefs.current.get(id)?.querySelector("button")?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  const active = members.find((m) => m.id === activeId) ?? null;
  const activeIndex = active ? members.indexOf(active) : -1;
  const shown = members.find((m) => m.id === shownId) ?? null;
  const shownIndex = shown ? members.indexOf(shown) : -1;
  const isOpen = active !== null;
  const panelId = `${baseId}-details`;

  // Open the card right beside the hovered tile (right side when there is
  // room, otherwise left) so the person's photo stays visible while their
  // details show. Clamped to the grid; top aligned with the tile.
  const GUTTER = 12;
  const cardWidth = anchor ? Math.min(CARD_WIDTH, anchor.gridWidth) : CARD_WIDTH;
  const fitsRight = anchor ? anchor.left + anchor.width + GUTTER + cardWidth <= anchor.gridWidth : true;
  const cardLeft = anchor
    ? Math.max(
        0,
        Math.min(
          fitsRight ? anchor.left + anchor.width + GUTTER : anchor.left - GUTTER - cardWidth,
          anchor.gridWidth - cardWidth,
        ),
      )
    : 0;
  const cardTop = anchor ? anchor.top : 0;
  const panelStyle: CSSProperties | undefined = anchor ? { width: cardWidth } : undefined;

  return (
    <div className="relative">
      <div ref={gridRef} className={`relative flex items-stretch ${GAP}`}>
        {columns.map((column, c) => (
          <div key={c} className={`flex min-w-0 flex-1 flex-col ${GAP}`}>
            {column.map((i, k) => {
              const m = members[i];
              const last = k === column.length - 1;
              return (
                <div
                  key={m.id}
                  ref={(el) => {
                    if (el) tileRefs.current.set(m.id, el);
                    else tileRefs.current.delete(m.id);
                  }}
                  className={`${isTall(i) ? HEIGHT.tall : HEIGHT.short} shrink-0 ${last ? "grow" : ""}`}
                >
                  <motion.div
                    className="h-full w-full"
                    initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-8% 0px" }}
                    transition={{ duration: 0.9, delay: (i % 8) * 0.07, ease: EASE }}
                  >
                    <Tile
                      member={m}
                      index={i}
                      radius={RADII[i % RADII.length]}
                      active={activeId === m.id}
                      dimmed={activeId !== null && activeId !== m.id}
                      panelId={panelId}
                      reduce={!!reduce}
                      onEnter={() => canHover && hoverOpen(m.id)}
                      onLeave={() => canHover && hoverClose()}
                      onActivate={(viaKeyboard) => {
                        if (canHover && !viaKeyboard) return;
                        if (activeId === m.id) close();
                        else open(m.id);
                      }}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop: the card opens beside the hovered tile and glides between people. */}
      {canHover && shown && anchor && (
        <motion.div
          id={panelId}
          role="region"
          aria-label={`${shown.name}, ${shown.role}`}
          aria-hidden={!isOpen}
          style={{ ...panelStyle, pointerEvents: isOpen ? "auto" : "none" }}
          className="absolute z-30"
          initial={false}
          animate={
            isOpen
              ? { opacity: 1, y: 0, top: cardTop, left: cardLeft }
              : { opacity: 0, y: reduce ? 0 : -16, top: cardTop, left: cardLeft }
          }
          transition={
            reduce
              ? { duration: 0 }
              : isOpen
                ? {
                    ...SPRING,
                    opacity: { duration: 0.2 },
                    // Opening fresh: jump to the tile, then drop in. Switching: glide.
                    top: fresh ? { duration: 0 } : SPRING,
                    left: fresh ? { duration: 0 } : SPRING,
                  }
                : { duration: 0.18, ease: [0.4, 0, 1, 1] }
          }
          onMouseEnter={keepOpen}
          onMouseLeave={hoverClose}
        >
          {/* Arrow pointing back at the hovered person, level with the tile's top. */}
          <motion.span
            aria-hidden
            className={`absolute top-7 z-10 h-4 w-4 rotate-45 border-primary/70 bg-[color-mix(in_oklab,var(--background)_95%,var(--primary))] ${
              fitsRight ? "-left-2 border-b border-l" : "-right-2 border-r border-t"
            }`}
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ delay: isOpen && fresh && !reduce ? 0.15 : 0, duration: reduce ? 0 : 0.25 }}
          />
          {/* The card unrolls from its top edge, in line with the tile. */}
          <motion.div
            initial={false}
            animate={{ clipPath: isOpen || reduce ? "inset(0 0 0% 0 round 1.5rem)" : "inset(0 0 100% 0 round 1.5rem)" }}
            transition={
              isOpen
                ? { duration: reduce || !fresh ? 0 : 0.5, ease: EASE }
                : { duration: 0, delay: 0.2 } // re-arm the unroll after the fade-out
            }
          >
            <DetailsCard member={shown} index={shownIndex} total={members.length} reduce={!!reduce} onClose={close} />
          </motion.div>
        </motion.div>
      )}

      {/* Touch: the same card as a bottom sheet over a dimmed page. */}
      {!canHover && (
        <AnimatePresence>
          {active && (
            <>
              <motion.button
                key="team-backdrop"
                type="button"
                aria-label="Close details"
                className="fixed inset-0 z-[60] bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.25 }}
                onClick={close}
              />
              <motion.div
                key="team-sheet"
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-label={`${active.name}, ${active.role}`}
                className="fixed inset-x-3 bottom-3 z-[61] max-h-[82vh] overflow-y-auto rounded-3xl"
                initial={{ opacity: 0, y: reduce ? 0 : 60 }}
                animate={{ opacity: 1, y: 0, transition: reduce ? { duration: 0 } : SPRING }}
                exit={{ opacity: 0, y: reduce ? 0 : 40, transition: { duration: reduce ? 0 : 0.2 } }}
              >
                <DetailsCard member={active} index={activeIndex} total={members.length} reduce={!!reduce} onClose={close} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/** Placeholder tiles in the same irregular layout while the roster loads. */
export function TeamMosaicSkeleton({ count = 8 }: { count?: number }) {
  const columns = masonry(count, useColumnCount());
  return (
    <div className={`flex items-stretch ${GAP}`} aria-hidden>
      {columns.map((column, c) => (
        <div key={c} className={`flex min-w-0 flex-1 flex-col ${GAP}`}>
          {column.map((i, k) => (
            <div
              key={i}
              className={`${isTall(i) ? HEIGHT.tall : HEIGHT.short} ${k === column.length - 1 ? "grow" : ""} shrink-0 ${RADII[i % RADII.length]} animate-pulse bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Tile({
  member,
  index,
  radius,
  active,
  dimmed,
  panelId,
  reduce,
  onEnter,
  onLeave,
  onActivate,
}: {
  member: TeamMember;
  index: number;
  radius: string;
  active: boolean;
  dimmed: boolean;
  panelId: string;
  reduce: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onActivate: (viaKeyboard: boolean) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const { name, role, photo } = member;

  return (
    <motion.button
      type="button"
      aria-expanded={active}
      aria-controls={active ? panelId : undefined}
      aria-label={`${name}${role ? `, ${role}` : ""}. Show details`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => onActivate(e.detail === 0)}
      animate={{ opacity: dimmed ? 0.38 : 1, scale: active ? 1.025 : 1, y: active ? -4 : 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
      className={`group relative block h-full w-full overflow-hidden ${radius} border text-left outline-none transition-[border-color,box-shadow] duration-500 focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "z-10 border-primary/60 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85),0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
          : "border-foreground/10 hover:border-primary/40"
      } bg-card`}
    >
      {/* Monogram underneath, so a tile never sits blank while its photo loads. */}
      <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_70%)]">
        <span className="brand-wordmark statement-outline-text text-4xl leading-none sm:text-5xl">{initials(name)}</span>
      </span>

      {photo && (
        <img
          src={photo}
          alt=""
          loading="lazy"
          width={800}
          height={800}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover object-top grayscale transition-[opacity,transform,filter] duration-700 ease-out group-hover:scale-[1.06] group-hover:grayscale-0 ${
            active ? "scale-[1.06] grayscale-0" : ""
          } ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}

      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />

      <span className="absolute left-4 top-4 font-mono text-[0.65rem] text-foreground/70">{String(index + 1).padStart(2, "0")}</span>

      <span
        aria-hidden
        className={`absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/20 bg-background/40 text-primary transition-all duration-500 ${
          active ? "rotate-45 border-primary/60 opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>

      <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <span className="block text-sm font-semibold uppercase tracking-wide sm:text-base">{name}</span>
        {role && <span className="mt-0.5 block text-xs capitalize text-muted-foreground">{role.toLowerCase()}</span>}
        <span className="mt-2 block h-px w-6 bg-primary/70 transition-all duration-500 group-hover:w-12" />
      </span>
    </motion.button>
  );
}

function DetailsCard({
  member,
  index,
  total,
  reduce,
  onClose,
}: {
  member: TeamMember;
  index: number;
  total: number;
  reduce: boolean;
  onClose: () => void;
}) {
  const { name, role, photo, banner, bio } = member;
  const [loaded, setLoaded] = useState(false);
  const stagger = (n: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.06 + n * 0.05, duration: reduce ? 0 : 0.35, ease: EASE },
  });

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-primary/70 bg-[color-mix(in_oklab,var(--background)_95%,var(--primary))] p-5 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9),0_24px_60px_-34px_color-mix(in_oklab,var(--primary)_65%,transparent)]">
      {banner && (
        <img
          src={banner}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full object-cover opacity-20 [mask-image:linear-gradient(180deg,black,transparent)]"
        />
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close details"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      {/* Keyed by person so switching tiles cross-fades the content. */}
      <motion.div
        key={member.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        className="relative"
      >
        <div className="flex items-center gap-4 pr-8">
          <motion.div
            {...stagger(0)}
            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-foreground/10 bg-card"
          >
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="brand-wordmark statement-outline-text text-2xl leading-none">{initials(name)}</span>
            </span>
            {photo && (
              <img
                src={photo}
                alt={name}
                onLoad={() => setLoaded(true)}
                className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </motion.div>

          <div className="min-w-0">
            <motion.p {...stagger(1)} className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </motion.p>
            <motion.h3 {...stagger(2)} className="mt-1.5 text-xl font-semibold leading-tight">
              {name}
            </motion.h3>
            {role && (
              <motion.p {...stagger(2)} className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-primary/90">
                {role}
              </motion.p>
            )}
          </div>
        </div>

        <motion.span {...stagger(3)} className="mt-4 block h-px w-full bg-foreground/10" />

        {bio ? (
          <motion.div
            {...stagger(3)}
            className="rich-text-content mt-4 max-h-44 overflow-y-auto pr-1 text-sm leading-relaxed text-foreground/85 [&_p:empty]:hidden"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(bio) }}
          />
        ) : (
          <motion.p {...stagger(3)} className="mt-4 text-sm text-muted-foreground">
            {role}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
