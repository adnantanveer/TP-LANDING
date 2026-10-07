# TechPotam landing — backend / admin handoff

Written for the agent implementing backend and admin-panel changes. The frontend
(this repo) keeps every existing endpoint, type and default-then-swap fetch
pattern; everything below is either a **value the admin should update** in the
existing CMS, or a **new optional field** the frontend already reads with a
fallback, so the backend can add it whenever convenient.

Endpoints are all `GET ${VITE_API_URL}/api/content/<key>`.

## Status (2026-10-07, branch `VersionFinal`)

- Done: progress bars removed, kinetic "Ideas, engineered." statement, glass work cards with
  always-on overlays, Process imagery, three Delivery variants, Precision removed, stack and
  testimonial copy shortened, crossfading testimonials, team fade-in with foil frames, readable
  contact block, artistic footer, UK placeholder contact details, large "By the numbers" heading.
- Not done: the reviewer pass never ran; the user gave feedback directly instead. Delivery
  variant not yet chosen (section 6). CMS values in section 1 still need entering in the admin.
- Local review against live content: `TP_API_PROXY=https://techpotam.tech VITE_API_URL= npm run dev`
  proxies `/api` to production (`vite.config.ts`). Contact and booking forms then post to
  production too.
- Restaurant Kits moved to its own repo (`arjs1000/restaurant-kits`, live at
  https://restaurant-kits.com). The copy under `restaurant-kits-portfolio/` and
  `public/restaurant-kits/` matches it as of commit `a2fa734`; see `restaurant-kits-missing.md`.

---

## 1. Values the admin should update (existing fields)

| Endpoint | Field | Type | Current (live) | Change to | Reason |
|---|---|---|---|---|---|
| `contact` | `details[type=address].value` | string | `C1-301, Sector 16C, Noida, India 201318` | `71-75 Shelton Street, London WC2H 9JQ` (**placeholder**) | Business is UK-facing. Final details to follow from the client. |
| `contact` | `details[type=phone].value` | string | `+91 99583 37775` | `+44 20 7946 0123` (**placeholder**, Ofcom drama range) | Same. |
| `contact` | `details[type=phone].href` | string | `tel:+919958337775` | `tel:+442079460123` | Same. |
| `contact` | `details[type=phone].whatsapp` | string (URL) | `https://wa.me/919958337775` | `https://wa.me/442079460123` | Same. |
| `contact` | `body` | rich text | long sentence | `Tell us what you're planning. Scope, timeline and cost back within one working day.` | Shorter copy across the site. |
| `footer` | `contactDetails[]` | array | whatever holds the Indian phone/address | mirror the UK placeholders above | Footer re-renders the same details. |
| `services` | `heading` | string | `Everything a team needs, under one roof.` | `Everything the UK needs under one roof.` | Requested wording. |
| `services` | `subheading` | string | long sentence | `One squad. Discovery to long-term support.` | Shorter copy. |
| `services` | `items[].body` | string | one sentence each | see `src/components/landing/Services.tsx` `DEFAULT_CONTENT` for the five short versions | Shorter copy. |
| `techStack` | `heading` | string | `A full-spectrum` | `We're experts in` | Section heading is now the single line "We're experts in many technologies."; the frontend no longer appends ", deployed with precision." |
| `techStack` | `headingEmphasis` | string | `technology stack` | `many technologies.` | Same (this half renders in the ember gradient). |
| `techStack` | `subheading` | string | long sentence | *(leave empty)* | The subheading is no longer rendered on the homepage. The field can stay in the admin for now; safe to remove later. |
| `marquee` | `items[]` | string[] | `Web platforms`, `Mobile apps`, … | `Web`, `Mobile`, `AI`, `Cloud`, `Design`, `Data` | Shorter copy. |
| `hero` | `forge.body` / `core.body` / `launch.body` | string | long sentences | see `DEFAULT_HERO_CONTENT` in `src/components/landing/Hero.tsx` | Shorter copy. |
| `menu` | `links[]` | array | contains `{ href: "#precision", label: "Capabilities" }` | replace with `{ href: "#process", label: "Process", active: true }` | The Precision section is no longer on the homepage (see §3). `#precision` now scrolls nowhere. |
| `testimonials` | `testimonials[]` | array | role-only attributions, no photos | real, permissioned client quotes with `name`, `role`, `organization`, `photo` | The frontend currently ships **fictional placeholder people** (see §4) that must not go live. Section heading is hard-coded ("From our clients."), not a CMS field. |
| `team` | `teamMembers[]` | array | (unknown) | real members with `photo`; mark the four leads with `isKeyMember: true` (new, see §2) | Frontend ships a fictional fallback team (see §4). |

---

## 2. New optional fields (frontend already reads them, with fallbacks)

| Endpoint | Field | Type | Example | Fallback in frontend | Reason |
|---|---|---|---|---|---|
| `case-studies` | `caseStudies[].sector` | string, optional | `"Logistics"` | not shown when absent | The rebuilt "Our work speaks" cards show a sector line in the hover/tap panel. Suggested admin UI: a short text input next to `client`. |
| `team` | `teamMembers[].isKeyMember` | boolean, optional | `true` | if no member has it, the first four by `order` are used | Homepage leads with four "key member" cards; the rest go into the wider-team mosaic. Suggested admin UI: a checkbox per member. |
| `team` | `headcount` | number, optional (top level, next to `teamMembers`) | `150` | `150` | Powers the "+N" tile and the "150+ engineers and designers" line. Should match the Stats figure. |
| *(new key)* `delivery` | `visible`, `heading`, `line`, `proofs[] { k, v }` | see `src/components/landing/delivery/shared.tsx` `DELIVERY` | `{ heading: "A delivery model built for *certainty.*", line: "Fixed scope. Weekly demos. Your code, your cloud.", proofs: [{ k: "Fixed", v: "scope and price" }, …] }` | hard-coded today, **no fetch yet** | The "A delivery model built for certainty" section was split out of Process and is currently static. If the admin should edit it, add this key and the frontend can fetch it with the same default-then-swap pattern. Asterisks in `heading` mark the ember-coloured word (frontend convention in `KineticHeading`). |

Note on `process`: the homepage "How we work" section (`src/components/landing/Process.tsx`) still reads the shared **static** step copy in `src/concepts/shared/content.ts` (`processSteps`), as before — it was never CMS-wired on the homepage. The `/api/content/process` endpoint is only consumed by the off-homepage `Process` in `Sections.tsx` (route `/reuse-component`). Nothing changed there.

---

## 3. Sections removed from the homepage (endpoints untouched)

- **`precision`** ("Built with precision") — `src/components/landing/Precision.tsx` and its fetch are intact but the component is no longer rendered on `/`. The admin's Precision section is therefore **unused**. Either hide it in the admin UI or leave it for future reuse. The default menu link to `#precision` was replaced (see §1 `menu`).

---

## 4. TEMP placeholder people (must be replaced before launch)

All names are **fictional**; photos are Pexels stock (licence below). Each is marked `// TEMP placeholder testimonial` or lives in `DEFAULT_MEMBERS` in the source.

Testimonials (`src/components/landing/Testimonials.tsx`):

| Name | Role, org | Photo |
|---|---|---|
| Eleanor Whitcombe | Operations Director, UK Healthcare Provider | `/assets/stock/portrait-1.jpg` |
| Daniel Okafor | Head of Digital, UK Financial Services Firm | `/assets/stock/portrait-2.jpg` |
| Thomas Ashdown | Founder, UK Logistics Startup | `/assets/stock/portrait-3.jpg` |

Team fallback (`src/components/landing/TeamSection.tsx`, only shown when the API returns nothing):

| Name | Role | Key member | Photo |
|---|---|---|---|
| Amara Osei | Engineering Director | yes | `/assets/stock/team-1.jpg` |
| Rafael Mendes | Principal Engineer | yes | `/assets/stock/team-2.jpg` |
| Sophie Lindqvist | Head of Design | yes | `/assets/stock/team-3.jpg` |
| Marcus Bellamy | Cloud & DevOps Lead | yes | `/assets/stock/team-4.jpg` |
| Hannah Ritter | Product Manager | | `/assets/stock/team-5.jpg` |
| Kenji Watanabe | Senior Engineer | | `/assets/stock/team-6.jpg` |
| Margaret Holloway | Delivery Lead | | `/assets/stock/team-7.jpg` |
| Jerome Adebayo | Mobile Engineer | | `/assets/stock/team-8.jpg` |

Case-study fallback cards (`src/components/landing/OurWork.tsx` `DEFAULT_WORK`): TadiBrothers, Quick Step and TaskFlow — the three real CMS projects, but with **similar-product stock photography instead of the real platform screenshots** (those only exist as admin uploads in the CMS, not in this repo). Shown only when `case-studies` returns nothing. **Replace later**: `public/assets/stock/work-ecommerce.jpg`, `work-flooring.jpg`, `work-dashboard.jpg` → the real screenshots, and the guessed slugs/titles/captions/meta → the real CMS values. The live cards always use `images[0]` from the CMS, unchanged.

Team: no real team photos exist in this repo either (the previous build was CMS-only with no fallback), so the stock portraits above remain a **local fallback only**; the live section uses the CMS `photo` URLs unchanged.

---

## 5. Stock assets added (source + licence)

All from **Pexels**, under the Pexels License (free for commercial use, no attribution required, modification allowed): https://www.pexels.com/license/

Videos — `public/assets/vid/delivery/` (H.264, 1280x720, no audio, crf 29, `+faststart`; poster JPEG at 1 s):

| File | Source | Creator | Size |
|---|---|---|---|
| `delivery-a.mp4` / `.jpg` | https://www.pexels.com/video/glowing-particles-swirling-in-darkness-29756785/ | Nicola Narracci | 2.74 MB, 10 s |
| `delivery-b.mp4` / `.jpg` | https://www.pexels.com/video/pedestal-shot-of-a-glass-facade-8783447/ | RDNE Stock project | 2.13 MB, 9.4 s |
| `delivery-c.mp4` / `.jpg` | https://www.pexels.com/video/a-person-using-his-laptop-for-programming-5495845/ | Pavel Danilyuk | 0.51 MB, 12 s |

Photos — `public/assets/stock/` (JPEG, ≤1600 px wide, each <250 KB; headshots 800x800):

| File | Source | Photographer |
|---|---|---|
| `process-discover.jpg` | https://www.pexels.com/photo/15543028/ | Walls.io |
| `process-design.jpg` | https://www.pexels.com/photo/3471423/ | Fabian Wiktor |
| `process-build.jpg` | https://www.pexels.com/photo/12899191/ | Mizuno K |
| `process-scale.jpg` | https://www.pexels.com/photo/4508751/ | Brett Sayles |
| `team-bg-1.jpg` (unused, kept as alternative) | https://www.pexels.com/photo/12570421/ | Ulises Peña |
| `team-bg-2.jpg` (unused, kept as alternative) | https://www.pexels.com/photo/18301295/ | Philip Borden |
| `team-bg-3.jpg` (in use) | https://www.pexels.com/photo/14340820/ | Edoardo Colombo |
| `portrait-1.jpg` | https://www.pexels.com/photo/31530222/ | Oliver Dohrn |
| `portrait-2.jpg` | https://www.pexels.com/photo/36687799/ | Travel with Lenses |
| `portrait-3.jpg` | https://www.pexels.com/photo/37148308/ | Vincent Santamaria |
| `team-1.jpg` | https://www.pexels.com/photo/21316048/ | Leonardo Monção |
| `team-2.jpg` | https://www.pexels.com/photo/10657877/ | Ahmed Elwakel_ph |
| `team-3.jpg` | https://www.pexels.com/photo/38197025/ | Tony Zohari |
| `team-4.jpg` | https://www.pexels.com/photo/7447356/ | Gustavo Fring |
| `team-5.jpg` | https://www.pexels.com/photo/36646353/ | Mario Spencer |
| `team-6.jpg` | https://www.pexels.com/photo/18165006/ | Lil K |
| `team-7.jpg` | https://www.pexels.com/photo/20819288/ | Emiliano Vittoriosi |
| `team-8.jpg` | https://www.pexels.com/photo/4797690/ | TUBARONES PHOTOGRAPHY |
| `work-ecommerce.jpg` (**replace later** with the real TadiBrothers screenshot) | https://www.pexels.com/photo/7667442/ | MART PRODUCTION |
| `work-flooring.jpg` (**replace later** with the real Quick Step screenshot) | https://www.pexels.com/photo/7181184/ | Thirdman |
| `work-dashboard.jpg` (**replace later** with the real TaskFlow screenshot) | https://www.pexels.com/photo/577210/ | Lukas Blazek |

---

## 6. Temporary review switches to remove before shipping

- `?delivery=a|b|c` — picks one of the three Delivery variants (`src/components/landing/delivery/`). Works both as `/?delivery=b#/` and `/#/?delivery=b`. Once a variant is chosen: import it directly in `Delivery.tsx`, delete the other two files and `useDeliveryVariant` in `shared.tsx`.
- `DEV_ALWAYS_REPLAY_INTRO = true` in `src/pages/Home.tsx` (pre-existing) — flip to `false`.

## 7. Animation notes

- No GSAP was added; everything is `motion` (motion/react) plus a few CSS keyframes (`statement-blink`, `foil-sweep`, `testimonial-ring`). All scroll-linked motion is transform/opacity only.
- `prefers-reduced-motion`: the Statement drops its pin and shows the finished frame; kinetic headings render static; carousels stop auto-rotating; delivery videos are replaced by their poster image.
