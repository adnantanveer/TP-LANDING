import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const PHRASE = "Ideas, engineered.";

// Scroll-progress bands (0..1 across the pinned track). Typing finishes
// well before the fly-out starts so the whole phrase is readable for a
// beat; the code starts typing as the letters leave, not after, so the
// transformation reads as one gesture rather than two scenes.
const TYPE_START = 0.04;
const TYPE_END = 0.34;
const OUT_START = 0.42;
const OUT_SPREAD = 0.012; // per-letter stagger of the fly-out
const OUT_LEN = 0.12;
const CODE_START = 0.48;
const CODE_END = 0.78;
const TAIL_START = 0.8;

type Token = { text: string; tone: "kw" | "id" | "fn" | "op" | "str" | "cm" };

// The phrase, rewritten as the thing we actually do with it. Tones map to
// the page's own palette (teal keyword, ember call, muted comment) — one
// accent pair, not a full editor theme.
const CODE: Token[][] = [
  [
    { text: "const ", tone: "kw" },
    { text: "idea", tone: "id" },
    { text: " = ", tone: "op" },
    { text: "engineer", tone: "fn" },
    { text: "(", tone: "op" },
    { text: "vision", tone: "id" },
    { text: ");", tone: "op" },
  ],
  [
    { text: "await ", tone: "kw" },
    { text: "ship", tone: "fn" },
    { text: "(idea, { ", tone: "op" },
    { text: "to", tone: "id" },
    { text: ": ", tone: "op" },
    { text: "'production'", tone: "str" },
    { text: " });", tone: "op" },
  ],
  [{ text: "// monitored. scaled. yours.", tone: "cm" }],
];

const TONE_CLASS: Record<Token["tone"], string> = {
  kw: "text-secondary",
  id: "text-foreground",
  fn: "text-primary",
  op: "text-muted-foreground",
  str: "text-primary-glow",
  cm: "text-muted-foreground/70",
};

// Flattened once: each token's absolute start offset in the typed stream,
// grouped per line, so CodeBlock can slice by a single `typed` count.
const CODE_LINES = (() => {
  let offset = 0;
  return CODE.map((line) => {
    const start = offset;
    const tokens = line.map((t) => {
      const from = offset;
      offset += t.text.length;
      return { ...t, from };
    });
    return { start, end: offset, tokens };
  });
})();
const CODE_LENGTH = CODE_LINES[CODE_LINES.length - 1]?.end ?? 0;

/**
 * "Ideas, engineered." — a pinned typographic beat, scrubbed by scroll.
 * The phrase types itself in oversized condensed display type as you
 * scroll, then each letter peels away (flip + rise, staggered left to
 * right) while the same idea re-types underneath as a three-line snippet
 * in the mono face, syntax-tinted from the page's own two accents. The
 * supporting line and the two conversions land last, once the code has
 * settled, and the pin releases straight into the Marquee.
 *
 * Everything that moves per frame is a transform/opacity driven by one
 * useScroll progress value; the two "how many characters are typed"
 * counters are the only React state, and they only re-render when the
 * integer actually changes. Under prefers-reduced-motion the pin is
 * dropped and the finished state (headline + code) is simply shown.
 */
export function Statement() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const [typed, setTyped] = useState(0);
  const [codeTyped, setCodeTyped] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const t = Math.round(((v - TYPE_START) / (TYPE_END - TYPE_START)) * PHRASE.length);
    setTyped(Math.max(0, Math.min(PHRASE.length, t)));
    const c = Math.round(((v - CODE_START) / (CODE_END - CODE_START)) * CODE_LENGTH);
    setCodeTyped(Math.max(0, Math.min(CODE_LENGTH, c)));
  });

  // Caret blinks only while the phrase is still being typed; the code gets
  // its own caret (see CodeBlock).
  const caretOpacity = useTransform(p, [TYPE_START, TYPE_END + 0.04, OUT_START], [1, 1, 0]);
  const codeOpacity = useTransform(p, [CODE_START - 0.02, CODE_START + 0.04], [0, 1]);
  const codeY = useTransform(p, [CODE_START - 0.02, CODE_START + 0.1, TAIL_START, 1], [40, 0, 0, -24]);
  const codeScale = useTransform(p, [TAIL_START, 1], [1, 0.96]);
  const tailOpacity = useTransform(p, [TAIL_START, TAIL_START + 0.1], [0, 1]);
  const tailY = useTransform(p, [TAIL_START, TAIL_START + 0.12], [28, 0]);
  const gridOpacity = useTransform(p, [CODE_START - 0.05, CODE_START + 0.1], [0, 1]);
  const eyebrowOpacity = useTransform(p, [0, 0.03, OUT_START, OUT_START + 0.08], [1, 1, 1, 0]);

  if (reduce) return <StaticStatement />;

  return (
    <section ref={ref} className="relative h-[240vh] md:h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Editor backdrop: a faint ruled grid + line numbers that only
            exist once the phrase has become code. */}
        <motion.div
          aria-hidden
          style={{ opacity: gridOpacity }}
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_50%,#000,transparent)]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-secondary/15 blur-[120px]"
          animate={{ x: [0, -30, 0], y: [0, -18, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <motion.div
            style={{ opacity: eyebrowOpacity }}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-primary"
          >
            <span className="h-px w-8 bg-primary/60" />
            Manifesto
          </motion.div>

          <div className="relative mt-6 min-h-[42vh]">
            {/* The phrase. Letters are absolutely layered over the code so
                the fly-out and the type-in share one box. */}
            <h2
              aria-label={PHRASE}
              className="brand-wordmark statement-display perspective-scene text-[clamp(4rem,15vw,13rem)] leading-[0.88] tracking-[-0.01em]"
            >
              {/* One word per line, always — the second word must never
                  wrap mid-letter as the type-in lengthens it. The caret
                  follows whichever line is currently being typed. */}
              {PHRASE.split(" ").map((word, wi) => {
                const offset = wi === 0 ? 0 : PHRASE.indexOf(" ") + 1;
                const lineDone = typed >= offset + word.length;
                const lineActive = typed >= offset && (!lineDone || wi === 1);
                return (
                  <span key={wi} className="block whitespace-nowrap">
                    {word.split("").map((ch, i) => (
                      <Letter key={i} ch={ch} index={offset + i} typed={typed} progress={p} />
                    ))}
                    {lineActive && (
                      <motion.span
                        aria-hidden
                        style={{ opacity: caretOpacity }}
                        className="statement-caret ml-1 inline-block h-[0.78em] w-[0.08em] translate-y-[0.08em] bg-primary align-baseline"
                      />
                    )}
                  </span>
                );
              })}
            </h2>

            <motion.div
              style={{ opacity: codeOpacity, y: codeY, scale: codeScale, transformOrigin: "0% 0%" }}
              className="absolute inset-x-0 top-0"
            >
              <CodeBlock typed={codeTyped} />
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: tailOpacity, y: tailY }}
            className="mt-10 flex flex-col gap-8 border-t border-border pt-8 md:flex-row md:items-end md:justify-between"
          >
            <p className="max-w-md text-lg text-muted-foreground">
              Ambitious briefs, turned into software that holds.
            </p>
            <Ctas />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Letter({ ch, index, typed, progress }: { ch: string; index: number; typed: number; progress: MotionValue<number> }) {
  const start = OUT_START + index * OUT_SPREAD;
  const end = start + OUT_LEN;
  // Alternating rise/fall and a 3D flip away from the reader — reads as the
  // letters being peeled off the page, not a uniform fade.
  const y = useTransform(progress, [start, end], [0, index % 2 ? -90 : 70]);
  const rotateX = useTransform(progress, [start, end], [0, index % 2 ? 80 : -80]);
  const opacity = useTransform(progress, [start, end * 0.95], [1, 0]);
  const visible = index < typed;

  if (ch === " ") return <span> </span>;

  return (
    <motion.span
      aria-hidden
      style={{ y, rotateX, opacity, display: "inline-block", transformOrigin: "50% 50%" }}
      className={`transition-opacity duration-150 ${visible ? "" : "!opacity-0"} ${ch === "." || ch === "," ? "text-primary" : ""} ${index >= 7 ? "statement-outline-text" : ""}`}
    >
      {ch}
    </motion.span>
  );
}

function CodeBlock({ typed }: { typed: number }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-[clamp(1.05rem,3.6vw,2.9rem)] leading-[1.35] tracking-tight">
      {CODE_LINES.map((line, li) => {
        // The caret sits at the end of whatever has been typed so far — on
        // this line if the count falls inside it (or exactly at its end).
        const caretHere = typed > 0 && typed < CODE_LENGTH && typed > line.start && typed <= line.end;
        return (
          <span key={li} className="block">
            <span className="mr-6 inline-block w-[1.6em] select-none text-right text-muted-foreground/40">{li + 1}</span>
            {line.tokens.map((t, ti) => {
              const shown = Math.max(0, Math.min(t.text.length, typed - t.from));
              return (
                <span key={ti} className={TONE_CLASS[t.tone]}>
                  {t.text.slice(0, shown)}
                </span>
              );
            })}
            {caretHere && (
              <span aria-hidden className="statement-caret ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-primary/80" />
            )}
          </span>
        );
      })}
    </pre>
  );
}

function Ctas() {
  return (
    <div className="flex shrink-0 flex-wrap gap-3">
      <Link
        to="/?section=work"
        className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
      >
        See our work
      </Link>
      <Link
        to="/?section=contact"
        className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
      >
        Start a project
      </Link>
    </div>
  );
}

// prefers-reduced-motion: no pin, no scrub — the finished frame, static.
function StaticStatement() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-primary">
          <span className="h-px w-8 bg-primary/60" />
          Manifesto
        </div>
        <h2 className="brand-wordmark statement-display mt-6 text-[clamp(3.6rem,13vw,11rem)] leading-[0.88]">
          Ideas,
          <br />
          <span className="statement-outline-text">engineered.</span>
        </h2>
        <div className="mt-8">
          <CodeBlock typed={CODE_LENGTH} />
        </div>
        <div className="mt-10 flex flex-col gap-8 border-t border-border pt-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg text-muted-foreground">Ambitious briefs, turned into software that holds.</p>
          <Ctas />
        </div>
      </div>
    </section>
  );
}
