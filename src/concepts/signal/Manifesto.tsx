import { KineticText } from "@/concepts/shared/KineticText";

/**
 * A dedicated statement moment: the word-by-word kinetic reveal only
 * happens once on this page, here, where the whole point is the words
 * assembling themselves. Signal's signature set-piece, distinct from any
 * of Vantage's sections. Storytelling justification, not decoration.
 */
export function SignalManifesto() {
  return (
    <section id="manifesto" className="relative border-y border-border bg-background py-32 md:py-44">
      <div className="mx-auto max-w-5xl px-6">
        <KineticText
          text="We build the software your business is actually betting on, not the deck that sold it."
          className="text-[clamp(1.9rem,5.6vw,4.4rem)] font-display font-medium leading-[1.08] tracking-tight"
        />
      </div>
    </section>
  );
}
