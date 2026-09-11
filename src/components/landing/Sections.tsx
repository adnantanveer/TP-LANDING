import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { SectionLabel, Reveal } from "./primitives";
import { BackgroundRippleEffect } from "./BackgroundRippleEffect";
import { CalendlyEmbed } from "@/concepts/shared/CalendlyEmbed";
import { getRecaptchaConfig, getRecaptchaTokenV3, type RecaptchaConfig } from "@/lib/recaptcha";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import sceneLayers from "@/assets/scene-layers.jpg";
import sceneRibbon from "@/assets/scene-ribbon.jpg";
import sceneTerrain from "@/assets/scene-terrain.jpg";
import studio from "@/assets/studio.jpg";
import iconOrb from "@/assets/icon-orb.png";
import iconCube from "@/assets/icon-cube.png";
import iconTorus from "@/assets/icon-torus.png";
import iconRocket from "@/assets/icon-rocket.png";

// Images/icons are fixed art, not admin-editable — only heading/item
// title+body come from the CMS (see /api/content/process), matched to
// these 4 slots by index.
const STEP_ART = [
  { img: sceneLayers, icon: iconCube },
  { img: sceneRibbon, icon: iconOrb },
  { img: studio, icon: iconTorus },
  { img: sceneTerrain, icon: iconRocket },
];

const DEFAULT_PROCESS_CONTENT = {
  visible: true,
  heading: "A delivery model built for certainty.",
  items: [
    { title: "Discover", body: "Two weeks of workshops, technical audit and a costed delivery roadmap you own outright." },
    { title: "Design", body: "Prototypes and design systems validated with your users before a line of production code." },
    { title: "Build", body: "Two-week sprints, demo every Friday, working software in your environment from week three." },
    { title: "Scale", body: "Monitoring, SLAs and an embedded squad that keeps shipping long after launch." },
  ],
};

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);
  const [content, setContent] = useState(DEFAULT_PROCESS_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/process`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
      .catch(() => {});
  }, []);

  const steps = content.items.map((item, i) => ({
    k: item.title,
    d: item.body,
    ...STEP_ART[i],
  }));

  if (!content.visible) return null;

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
            {content.heading}
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {steps.map((s, i) => (
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

const DEFAULT_MARQUEE_ITEMS = [
  "Web platforms",
  "Mobile apps",
  "AI systems",
  "Cloud migration",
  "Design systems",
  "Data engineering",
];

export function Marquee() {
  const [visible, setVisible] = useState(true);
  const [items, setItems] = useState<string[]>(DEFAULT_MARQUEE_ITEMS);

  useEffect(() => {
    fetch(`${API_URL}/api/content/marquee`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setVisible(data.visible ?? true);
        if (Array.isArray(data.items) && data.items.length > 0) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

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

export type ContactDetail = { type: "address" | "phone" | "email"; label: string; value: string; href?: string; whatsapp?: string };
export type ContactContent = {
  visible: boolean;
  heading: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  details: ContactDetail[];
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  visible: true,
  heading: "Let's build the next one together.",
  body: "Tell us what you're planning. We'll come back within one working day with a view on scope, timeline and cost.",
  primaryCtaLabel: "info@techpotam.com",
  primaryCtaHref: "mailto:info@techpotam.com",
  secondaryCtaLabel: "Book a discovery call",
  secondaryCtaHref: "https://www.techpotam.com/",
  details: [
    { type: "address", label: "Address", value: "C1-301, Sector 16C, Noida, India 201318" },
    { type: "phone", label: "Call us", value: "+91 99583 37775", href: "tel:+919958337775", whatsapp: "https://wa.me/919958337775" },
    { type: "email", label: "Email us", value: "info@techpotam.com", href: "mailto:info@techpotam.com" },
  ],
};

// Icons are fixed art per detail type, not admin-editable — only
// label/value/href/whatsapp come from the CMS (see /api/content/contact).
export const DETAIL_ICONS: Record<ContactDetail["type"], ReactNode> = {
  address: (
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
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 3h2.4l1.2 4-2 1.3a11.5 11.5 0 0 0 5.6 5.6l1.3-2 4 1.2v2.4c0 1-.9 1.8-1.9 1.6-6-1-10.5-5.5-11.5-11.5C5 4.4 5.6 3 6.5 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function Contact() {
  const [content, setContent] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);

  useEffect(() => {
    fetch(`${API_URL}/api/content/contact`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setContent(data))
      .catch(() => {});
  }, []);

  if (!content.visible) return null;

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
            <h2 className="text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[0.98]">{content.heading}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-lg text-muted-foreground">{content.body}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href={content.primaryCtaHref}
                className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.04]"
              >
                {content.primaryCtaLabel}
              </a>
              <a
                href={content.secondaryCtaHref}
                className="rounded-full border border-border px-8 py-4 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {content.secondaryCtaLabel}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-10 space-y-5">
              {content.details.map((d) => (
                <div key={d.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                    {DETAIL_ICONS[d.type]}
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
          <div className="overflow-hidden rounded-2xl border border-border bg-background/90 shadow-[var(--shadow-deep)] backdrop-blur-md">
            <div className="border-b border-border px-6 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Book a call</p>
              <p className="mt-1 text-sm text-foreground">30 minutes, pick a time that works for you.</p>
            </div>
            <CalendlyEmbed url="https://calendly.com/techpotam/30min" height={650} />
            <Link
              to="/contact"
              className="flex items-center justify-between gap-2 border-t border-border px-6 py-4 text-sm text-foreground transition-colors hover:text-primary"
            >
              Prefer to write instead? Send a message
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const API_URL = import.meta.env.VITE_API_URL as string;

const BUDGETS = ["Under £10k", "£10k – £25k", "£25k – £75k", "£75k+", "Not sure yet"];

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

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaConfig, setRecaptchaConfig] = useState<RecaptchaConfig | null>(null);
  const [v2Token, setV2Token] = useState<string | null>(null);

  useEffect(() => {
    getRecaptchaConfig().then(setRecaptchaConfig);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real users never fill this hidden field.
    if (data.get("company")) return;

    if (recaptchaConfig?.active && recaptchaConfig.version === "v2" && !v2Token) {
      setStatus("error");
      setErrorMessage("Please complete the reCAPTCHA check.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const recaptchaToken =
        recaptchaConfig?.active && recaptchaConfig.version === "v2" ? v2Token! : await getRecaptchaTokenV3("contact");

      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          countryCode: data.get("countryCode"),
          phone: data.get("phone"),
          email: data.get("email"),
          budget: data.get("budget"),
          message: data.get("message"),
          recaptchaToken,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong. Please try again later.");

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-background/90 p-6 text-center backdrop-blur-md shadow-[var(--shadow-deep)] sm:p-8">
        <p className="text-sm font-medium text-foreground">Thanks — we've got your message and will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-background/90 p-6 backdrop-blur-md shadow-[var(--shadow-deep)] sm:p-8"
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

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
          pattern="[0-9 \(\)+\-]{6,}"
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

      {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
        <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
      )}

      {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
      >
        {status === "submitting" ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}

type FooterContactDetail = { label: string; value: string; href?: string; active: boolean };
type FooterSocialLink = { platform: string; url: string; active: boolean };

export function Footer() {
  const [contactDetails, setContactDetails] = useState<FooterContactDetail[]>([]);
  const [social, setSocial] = useState<FooterSocialLink[]>([]);
  const [copyrightName, setCopyrightName] = useState("Techpotam Ltd — United Kingdom");
  const [copyrightActive, setCopyrightActive] = useState(true);
  const [tagline, setTagline] = useState("London · Remote-first");
  const [taglineActive, setTaglineActive] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/content/footer`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setContactDetails(data.contactDetails ?? []);
        setSocial(data.social ?? []);
        if (data.copyrightName) setCopyrightName(data.copyrightName);
        setCopyrightActive(data.copyrightActive ?? true);
        if (data.tagline) setTagline(data.tagline);
        setTaglineActive(data.taglineActive ?? true);
      })
      .catch(() => {});
  }, []);

  const activeContactDetails = contactDetails.filter((d) => d.active);
  const activeSocial = social.filter((s) => s.active);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-muted-foreground">
        {(activeContactDetails.length > 0 || activeSocial.length > 0) && (
          <div className="mb-8 flex flex-wrap items-start justify-between gap-8 border-b border-border pb-8">
            {activeContactDetails.length > 0 && (
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {activeContactDetails.map((d) =>
                  d.href ? (
                    <a key={d.label} href={d.href} className="transition-colors hover:text-primary">
                      {d.label}: {d.value}
                    </a>
                  ) : (
                    <span key={d.label}>
                      {d.label}: {d.value}
                    </span>
                  ),
                )}
              </div>
            )}
            {activeSocial.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {activeSocial.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        {(copyrightActive || taglineActive) && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            {copyrightActive && (
              <p>
                © {new Date().getFullYear()} {copyrightName}
              </p>
            )}
            {taglineActive && <p className="font-mono uppercase tracking-[0.3em]">{tagline}</p>}
          </div>
        )}
      </div>
    </footer>
  );
}
