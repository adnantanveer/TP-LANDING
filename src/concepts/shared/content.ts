/**
 * Shared, hardcoded content for the two redesign concepts (`/concepts/signal`
 * and `/concepts/vantage`). Real Techpotam copy pulled from the live site's
 * DEFAULT_* fallbacks (Hero/Services/Precision/TechStack/Testimonials/
 * Sections.tsx) rather than invented placeholder text — these are concept
 * pages for visual review, not CMS-wired, so content is fixed here instead
 * of fetched from the API.
 */

export const heroContent = {
  forge: {
    title: "Built in the forge, shipped to production.",
    body: "From first commit to a live product in your users' hands. Clean architecture, fast iteration, dependable delivery.",
  },
  core: {
    title: "Every detail, considered.",
    body: "From the first keystroke to the silicon it runs on, nothing ships until it's right.",
  },
  launch: {
    title: "From first line to launch.",
    body: "Deployed on infrastructure that holds up under real-world load. Monitored, hardened, and ready from day one.",
  },
};

export type CapabilityIconKey = "code" | "mobile" | "ai" | "cloud" | "design";

export type CapabilityItem = { title: string; body: string; icon: CapabilityIconKey };

export const capabilities: CapabilityItem[] = [
  {
    title: "Product engineering",
    body: "Web platforms and SaaS built on React, TypeScript and cloud-native infrastructure. Shipped in weeks, not quarters.",
    icon: "code",
  },
  {
    title: "Mobile applications",
    body: "iOS and Android products with native performance, offline resilience and App Store release support.",
    icon: "mobile",
  },
  {
    title: "AI & automation",
    body: "LLM assistants, document intelligence and workflow automation wired directly into your existing systems.",
    icon: "ai",
  },
  {
    title: "Cloud & DevOps",
    body: "AWS and Azure architecture, CI/CD pipelines and observability tuned for UK data residency and uptime.",
    icon: "cloud",
  },
  {
    title: "Design & experience",
    body: "Interface design, motion and design systems that make enterprise software feel considered.",
    icon: "design",
  },
];

export type ProcessIconKey = "discover" | "design" | "build" | "scale";

export type ProcessStep = { title: string; body: string; icon: ProcessIconKey };

export const processSteps: ProcessStep[] = [
  {
    title: "Discover",
    body: "Two weeks of workshops, technical audit and a costed delivery roadmap you own outright.",
    icon: "discover",
  },
  {
    title: "Design",
    body: "Prototypes and design systems validated with your users before a line of production code.",
    icon: "design",
  },
  {
    title: "Build",
    body: "Two-week sprints, demo every Friday, working software in your environment from week three.",
    icon: "build",
  },
  {
    title: "Scale",
    body: "Monitoring, SLAs and an embedded squad that keeps shipping long after launch.",
    icon: "scale",
  },
];

export type TechItem = { name: string; blurb: string; group: string };

export const techStack: TechItem[] = [
  { name: "React", blurb: "Component systems at scale", group: "Frontend" },
  { name: "Next.js", blurb: "SSR / edge rendering", group: "Frontend" },
  { name: "TypeScript", blurb: "Type-safe, zero-drift codebases", group: "Frontend" },
  { name: "Tailwind CSS", blurb: "Design-system driven UI", group: "Frontend" },
  { name: "Node.js", blurb: "High-throughput services", group: "Backend" },
  { name: "PostgreSQL", blurb: "Relational rigor & RLS", group: "Backend" },
  { name: "GraphQL", blurb: "Typed, federated APIs", group: "Backend" },
  { name: "Redis", blurb: "Real-time caching & queues", group: "Backend" },
  { name: "AWS", blurb: "Cloud-native UK hosting", group: "Cloud" },
  { name: "Azure", blurb: "Enterprise & Gov cloud", group: "Cloud" },
  { name: "Docker", blurb: "Reproducible deployments", group: "Cloud" },
  { name: "Supabase", blurb: "Postgres + auth + storage", group: "Cloud" },
  { name: "Python", blurb: "ML, data & automation", group: "Data & AI" },
  { name: "MongoDB", blurb: "Flexible document stores", group: "Data & AI" },
  { name: "Vue", blurb: "Progressive, lightweight UI", group: "Data & AI" },
  { name: "Angular", blurb: "Enterprise SPA architecture", group: "Data & AI" },
];

export type Testimonial = { quote: string; name: string; org: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "They treated our product like it was their own. The craft shows in every screen, every transition, every detail.",
    name: "Operations Director",
    org: "UK Healthcare Provider",
  },
  {
    quote:
      "What impressed us most was the restraint. Nothing in the product feels unnecessary, it just works, beautifully.",
    name: "Head of Digital",
    org: "UK Financial Services Firm",
  },
  {
    quote: "From discovery to launch, the process felt calm and considered. The result speaks for itself.",
    name: "Founder",
    org: "UK Logistics Startup",
  },
];

export type WorkItem = {
  slug: string;
  img: string;
  client: string;
  title: string;
  caption: string;
  meta: string[];
};

// Case studies live in the CMS in production (see OurWork.tsx) — these five
// image assets already ship in public/assets with no hardcoded fallback
// copy anywhere in the frontend, so plausible captions are authored here,
// consistent with the rest of the site's real sectors (healthcare,
// financial services, logistics) and its plain, non-hyperbolic voice.
export const workItems: WorkItem[] = [
  {
    slug: "atlas",
    img: "/assets/work-atlas.jpg",
    client: "Atlas",
    title: "Fleet routing, rebuilt for scale",
    caption: "Real-time routing and fleet visibility for a logistics operator running vehicles nationwide.",
    meta: ["React", "Node.js", "AWS"],
  },
  {
    slug: "civica",
    img: "/assets/work-civica.jpg",
    client: "Civica",
    title: "One portal, five legacy systems retired",
    caption: "A citizen-facing services portal for local government, replacing paper forms and five separate logins.",
    meta: ["Next.js", "PostgreSQL", "Accessibility"],
  },
  {
    slug: "harborline",
    img: "/assets/work-harborline.jpg",
    client: "Harborline",
    title: "Berth scheduling, off the spreadsheet",
    caption: "Cargo and berth visibility for a port operator, cutting vessel turnaround admin from days to hours.",
    meta: ["TypeScript", "GraphQL", "Azure"],
  },
  {
    slug: "meridian",
    img: "/assets/work-meridian.jpg",
    client: "Meridian",
    title: "Live uptime, across a national network",
    caption: "A monitoring platform for an EV charging network, watching connector uptime across every site.",
    meta: ["React Native", "Python", "Kubernetes"],
  },
  {
    slug: "northfield",
    img: "/assets/work-northfield.jpg",
    client: "Northfield",
    title: "A wealth platform clients trust",
    caption: "A client portal and reporting suite for a private wealth manager, built around real-time portfolio data.",
    meta: ["React", "TypeScript", "SOC 2"],
  },
];

export const contactInfo = {
  heading: "Let's build the next one together.",
  body: "Tell us what you're planning. We'll come back within one working day with a view on scope, timeline and cost.",
  email: "info@techpotam.com",
  details: [
    { label: "Address", value: "C1-301, Sector 16C, Noida, India 201318" },
    { label: "Call us", value: "+91 99583 37775", href: "tel:+919958337775", whatsapp: "https://wa.me/919958337775" },
    { label: "Email us", value: "info@techpotam.com", href: "mailto:info@techpotam.com" },
  ],
};

export const footerInfo = {
  copyright: "Techpotam Ltd — United Kingdom",
  tagline: "London / Remote-first",
};
