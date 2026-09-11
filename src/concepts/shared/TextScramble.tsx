import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";

/**
 * Decodes into the real text left-to-right on scroll-into-view, once —
 * reference: the glitch/decode headline on shankar.io. Plain setInterval +
 * React state, not Motion's animate/whileInView system, deliberately:
 * this only needs a one-shot visibility boolean (Motion's `useInView`
 * hook gives that directly, no percentage-transform involved), so it
 * sidesteps the whileInView-with-percentage-values bug found elsewhere in
 * this app (see Signal's KineticText) entirely rather than working around it.
 */
export function TextScramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? text : "");

  useEffect(() => {
    if (!inView || reduce) return;
    let frame = 0;
    const totalFrames = 26;
    const id = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            const charThreshold = i / text.length;
            if (progress > charThreshold + 0.2) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(""),
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(id);
      }
    }, 32);
    return () => clearInterval(id);
  }, [inView, reduce, text]);

  return (
    <span ref={ref} className={className}>
      {display || " "}
    </span>
  );
}
