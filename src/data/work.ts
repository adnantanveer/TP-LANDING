import workAtlas from "@/assets/work-atlas.jpg";
import workMeridian from "@/assets/work-meridian.jpg";
import workHarborline from "@/assets/work-harborline.jpg";
import workCivica from "@/assets/work-civica.jpg";
import workNorthfield from "@/assets/work-northfield.jpg";

export interface WorkResult {
  stat: string;
  label: string;
}

export interface WorkItem {
  slug: string;
  img: string;
  client: string;
  title: string;
  caption: string;
  meta: string[];
  overview: string;
  challenge: string;
  approach: string;
  results: WorkResult[];
  stack: string[];
  testimonial: { quote: string; name: string; role: string };
}

/**
 * Single source of truth for both the homepage's "Our Work Speaks" gallery
 * (OurWork.tsx, uses img/client/title/caption/meta) and each project's case
 * study page (CaseStudy.tsx, uses the rest) — keyed by slug for /work/:slug.
 */
export const WORK: WorkItem[] = [
  {
    slug: "atlas-health",
    img: workAtlas,
    client: "Healthcare · Patient Portal",
    title: "Atlas Health",
    caption: "A calmer way to manage care, built for patients and clinicians alike.",
    meta: ["React", "Node", "HIPAA-ready"],
    overview:
      "Atlas Health needed a single portal where patients could book appointments, message clinicians and view records — replacing three disconnected legacy systems patients had learned to avoid.",
    challenge:
      "The existing tools were built for administrators, not patients — dense, slow, and inconsistent across departments. Adoption was under 20%, and support calls for basic tasks like rebooking were the top ticket category.",
    approach:
      "We ran clinician and patient interviews across four departments, then rebuilt the portal around three tasks people actually needed: book, message and review results. A HIPAA-ready architecture and a shared component library kept every screen consistent and fast to extend.",
    results: [
      { stat: "71%", label: "Patient adoption within 3 months" },
      { stat: "-42%", label: "Support tickets for booking" },
      { stat: "4.8/5", label: "Patient satisfaction score" },
    ],
    stack: ["React", "Node", "PostgreSQL", "HIPAA-ready infra", "AWS"],
    testimonial: {
      quote: "Patients finally use the portal instead of calling us.",
      name: "Dr. Priya Menon",
      role: "Clinical Director, Atlas Health",
    },
  },
  {
    slug: "meridian-capital",
    img: workMeridian,
    client: "Finance · Investor Platform",
    title: "Meridian Capital",
    caption: "A precise, data-dense product made to feel effortless.",
    meta: ["Next-gen data", "Realtime", "AWS"],
    overview:
      "Meridian Capital's investor dashboard tracked billions in assets but ran on a spreadsheet-fed tool that lagged behind live markets. We rebuilt it as a real-time platform their analysts and clients could both trust.",
    challenge:
      "Data arrived from six different feeds on different schedules, and the old dashboard reconciled them manually overnight — meaning every number on screen could already be a day stale during a trading session.",
    approach:
      "We designed a streaming data layer that normalises every feed the moment it lands, then built a dense but calm interface that surfaces the numbers that matter without overwhelming the analyst reading it under pressure.",
    results: [
      { stat: "<200ms", label: "Data latency, feed to screen" },
      { stat: "$3.2B", label: "Assets tracked live" },
      { stat: "6 → 1", label: "Data feeds unified" },
    ],
    stack: ["Next.js", "WebSockets", "Rust ingestion", "AWS", "PostgreSQL"],
    testimonial: {
      quote: "We finally trust the number on the screen.",
      name: "James Okafor",
      role: "Head of Platform, Meridian Capital",
    },
  },
  {
    slug: "harborline",
    img: workHarborline,
    client: "Logistics · Operations Dashboard",
    title: "Harborline",
    caption: "Real-time visibility across a fleet, redesigned from the ground up.",
    meta: ["Maps", "Realtime", "Azure"],
    overview:
      "Harborline runs a fleet of over 400 vehicles across three ports. Dispatchers were tracking them across radio calls and a whiteboard — we gave them one live map instead.",
    challenge:
      "Without live visibility, delays were only discovered when a customer called to ask where their shipment was. Dispatchers spent more time chasing status updates than actually dispatching.",
    approach:
      "We integrated the existing telematics hardware into a single real-time map, layered with route-deviation alerts and a redesigned dispatch queue built around how dispatchers actually triage a shift.",
    results: [
      { stat: "400+", label: "Vehicles tracked live" },
      { stat: "-35%", label: "Average delay response time" },
      { stat: "3 ports", label: "Unified into one view" },
    ],
    stack: ["React", "Mapbox", "Azure", "Realtime telemetry"],
    testimonial: {
      quote: "We see a delay before the customer does now.",
      name: "Sofia Reyes",
      role: "Head of Operations, Harborline",
    },
  },
  {
    slug: "civica-council-services",
    img: workCivica,
    client: "Government · Citizen Services",
    title: "Civica Council Services",
    caption: "A public-sector portal that finally feels like a modern product.",
    meta: ["Accessibility", "GDS", "GOV.UK"],
    overview:
      "Civica Council Services needed a citizen-facing portal that met GDS accessibility standards without feeling like a government form — we delivered both.",
    challenge:
      "The legacy site failed basic accessibility audits and required residents to re-enter the same details across five separate forms just to report an issue or request a service.",
    approach:
      "We consolidated every citizen service behind one accessible, GDS-pattern-compliant flow, tested against WCAG 2.2 AA with real assistive-technology users, not just an automated scanner.",
    results: [
      { stat: "WCAG 2.2 AA", label: "Full accessibility compliance" },
      { stat: "5 → 1", label: "Forms consolidated into one flow" },
      { stat: "+58%", label: "Service requests completed online" },
    ],
    stack: ["GOV.UK Design System", "Node", "Accessibility audits", "GDS"],
    testimonial: {
      quote: "Residents can finally finish a request without calling us to ask what a field means.",
      name: "Tom Whitfield",
      role: "Digital Services Lead, Civica Council",
    },
  },
  {
    slug: "northfield-retail",
    img: workNorthfield,
    client: "Retail · Commerce Platform",
    title: "Northfield Retail",
    caption: "An editorial storefront built to move fast without losing polish.",
    meta: ["Headless", "Next.js", "Stripe"],
    overview:
      "Northfield Retail wanted an editorial storefront that felt like a fashion magazine, without sacrificing the speed a headless commerce stack demands.",
    challenge:
      "Their existing platform coupled content and commerce so tightly that every seasonal campaign meant a multi-week dev cycle just to reskin the homepage.",
    approach:
      "We moved to a headless Next.js storefront with a composable content layer, so the marketing team can ship a full campaign redesign themselves — no deploy required — while checkout stays untouched and fast.",
    results: [
      { stat: "1.8s", label: "Median page load, down from 4.6s" },
      { stat: "+24%", label: "Checkout conversion" },
      { stat: "Same-day", label: "Campaign launches, no dev needed" },
    ],
    stack: ["Next.js", "Headless CMS", "Stripe", "Vercel Edge"],
    testimonial: {
      quote: "Marketing ships campaigns the same day now, not three weeks later.",
      name: "Aisha Bello",
      role: "E-commerce Director, Northfield Retail",
    },
  },
];

export function getWorkBySlug(slug: string | undefined) {
  return WORK.find((w) => w.slug === slug);
}
