import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SectionLabel, Reveal } from "./primitives";
import { BackgroundRippleEffect } from "./BackgroundRippleEffect";
import sceneLayers from "@/assets/scene-layers.jpg";
import sceneRibbon from "@/assets/scene-ribbon.jpg";
import sceneTerrain from "@/assets/scene-terrain.jpg";
import studio from "@/assets/studio.jpg";
import iconOrb from "@/assets/icon-orb.png";
import iconCube from "@/assets/icon-cube.png";
import iconTorus from "@/assets/icon-torus.png";
import iconRocket from "@/assets/icon-rocket.png";

const STEPS = [
  {
    k: "Discover",
    img: sceneLayers,
    icon: iconCube,
    d: "Two weeks of workshops, technical audit and a costed delivery roadmap you own outright.",
  },
  {
    k: "Design",
    img: sceneRibbon,
    icon: iconOrb,
    d: "Prototypes and design systems validated with your users before a line of production code.",
  },
  {
    k: "Build",
    img: studio,
    icon: iconTorus,
    d: "Two-week sprints, demo every Friday, working software in your environment from week three.",
  },
  {
    k: "Scale",
    img: sceneTerrain,
    icon: iconRocket,
    d: "Monitoring, SLAs and an embedded squad that keeps shipping long after launch.",
  },
];


export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <section
      id="process"
      ref={ref}
      className="relative h-[300vh] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_12%,transparent)_50%,color-mix(in_oklab,var(--background)_80%,transparent)_100%)]"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-14 w-full max-w-6xl px-6">
          <SectionLabel>How we work</SectionLabel>
          <h2 className="mt-6 max-w-xl text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.02]">
            A delivery model built for certainty.
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {STEPS.map((s, i) => (
            <article
              key={s.k}
              className="group relative w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-border bg-card md:w-[34vw]"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={s.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <img
                  src={s.icon}
                  alt=""
                  loading="lazy"
                  width={768}
                  height={768}
                  className="absolute -bottom-4 right-6 h-24 w-24 object-contain drop-shadow-[0_20px_50px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-transform duration-700 group-hover:-translate-y-2"
                />
              </div>
              <div className="p-10 pt-6">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-4 text-3xl font-medium">{s.k}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                <div className="mt-10 h-px w-full bg-gradient-to-r from-primary/70 to-transparent" />
              </div>
            </article>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export function Marquee() {
  const items = [
    "Web platforms",
    "Mobile apps",
    "AI systems",
    "Cloud migration",
    "Design systems",
    "Data engineering",
  ];
  return (
    <div className="relative overflow-hidden border-y border-border py-6">
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground"
          >
            {t} <span className="text-primary">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-40 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_85%,transparent)_0%,color-mix(in_oklab,var(--primary)_14%,transparent)_55%,color-mix(in_oklab,var(--background)_88%,transparent)_100%)]"
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "#00000095" }} aria-hidden />
      <BackgroundRippleEffect />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_100%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        <div className="text-left">
          <Reveal>
            <h2 className="text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[0.98]">
              Let's build the <span className="text-ember">next one</span> together.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-lg text-muted-foreground">
              Tell us what you're planning. We'll come back within one working day with a view on
              scope, timeline and cost.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href="mailto:info@techpotam.com"
                className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
              >
                info@techpotam.com
              </a>
              <a
                href="https://www.techpotam.com/"
                className="rounded-full border border-border px-8 py-4 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Book a discovery call
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-10 space-y-5">
              {CONTACT_DETAILS.map((d) => (
                <div key={d.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                    {d.icon}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{d.label}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      {d.href ? (
                        <a href={d.href} className="transition-colors hover:text-primary">
                          {d.value}
                        </a>
                      ) : (
                        <span>{d.value}</span>
                      )}
                      {d.whatsapp && (
                        <a
                          href={d.whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Chat on WhatsApp"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.5 4 3.5.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

const CONTACT_DETAILS = [
  {
    label: "Address",
    value: "C1-301, Sector 16C, Noida, India 201318",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Call us",
    value: "+91 99583 37775",
    href: "tel:+919958337775",
    whatsapp: "https://wa.me/919958337775",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6.5 3h2.4l1.2 4-2 1.3a11.5 11.5 0 0 0 5.6 5.6l1.3-2 4 1.2v2.4c0 1-.9 1.8-1.9 1.6-6-1-10.5-5.5-11.5-11.5C5 4.4 5.6 3 6.5 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Email us",
    value: "info@techpotam.com",
    href: "mailto:info@techpotam.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const BUDGETS = ["Under £10k", "£10k – £25k", "£25k – £75k", "£75k+", "Not sure yet"];
const COUNTRY_CODES = [
  { flag: "🇬🇧", code: "+44" },
  { flag: "🇺🇸", code: "+1" },
  { flag: "🇦🇪", code: "+971" },
  { flag: "🇮🇳", code: "+91" },
  { flag: "🇪🇺", code: "+353" },
];

const fieldClass =
  "w-full rounded-xl border border-border bg-background/95 px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      <path d="M2.5 4.5 7 9l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContactForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4 rounded-2xl border border-border bg-background/90 p-6 backdrop-blur-md shadow-[var(--shadow-deep)] sm:p-8"
    >
      <input type="text" name="name" placeholder="Enter your name" required className={fieldClass} />

      <div className="flex gap-3">
        <div className="relative w-[6.5rem] shrink-0">
          <select
            name="countryCode"
            defaultValue="+44"
            required
            className={`${fieldClass} appearance-none pr-8 text-center`}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code} className="bg-background text-foreground">
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
        <input
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          required
          pattern="[0-9 ()+-]{6,}"
          className={`${fieldClass} flex-1`}
        />
      </div>

      <input type="email" name="email" placeholder="Enter your email" required className={fieldClass} />

      <div className="relative">
        <select name="budget" defaultValue="" required className={`${fieldClass} appearance-none`}>
          <option value="" disabled className="bg-background text-muted-foreground">
            Select your budget
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b} className="bg-background text-foreground">
              {b}
            </option>
          ))}
        </select>
        <ChevronDown />
      </div>

      <textarea
        name="message"
        placeholder="Enter your message"
        required
        minLength={10}
        rows={5}
        className={`${fieldClass} resize-none`}
      />

      <button
        type="submit"
        className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.02] sm:w-auto"
      >
        Submit
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Techpotam Ltd — United Kingdom</p>
        <p className="font-mono uppercase tracking-[0.3em]">London · Remote-first</p>
      </div>
    </footer>
  );
}
