import { useState } from "react";
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
  // Optional, new: marks the handful of people the homepage leads with.
  // Absent on the live CMS today — TeamSection falls back to CMS order.
  isKeyMember?: boolean;
};

/**
 * Shared by the homepage teaser (TeamSection.tsx) and the full roster
 * (pages/Team.tsx) — front shows the photo/name like before, hovering
 * flips it 3D to the back: their own bio as a line/quote about them, with
 * their banner photo (when the admin's added one) dimmed behind it instead
 * of sitting in a second, disconnected gallery elsewhere on the page.
 *
 * The flip itself (.team-flip*) is real CSS in styles.css, not Tailwind
 * arbitrary values — Tailwind can't emit the -webkit-backface-visibility
 * pairing a smooth, non-flickering 3D flip needs across browsers.
 */
// The placeholder underneath the photo, rendered from the very first
// frame (not swapped in on error) so a card never sits blank while its
// photo is in flight. Formerly a blue-ish monogram disc; now an editorial
// frame — a fine metallic foil ring (.foil-ring) around a hollow-letter
// monogram in the brand's condensed face — so a member without a photo
// still reads as premium rather than as a missing avatar.
function EditorialFrame({ name }: { name: string }) {
  return (
    // `isolate`: the ring's pseudo-elements carry z-index 1 (so they sit
    // above a photo *inside* a ring), which here would lift them above the
    // real photo layered on top — a new stacking context keeps them under.
    <div className="absolute inset-0 isolate flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_70%)] bg-card">
      <div className="foil-ring relative flex h-28 w-24 items-center justify-center rounded-lg sm:h-32 sm:w-28">
        <span className="brand-wordmark statement-outline-text text-4xl leading-none sm:text-5xl">{initials(name)}</span>
      </div>
    </div>
  );
}

export function TeamFlipCard({ name, role, photo, banner, bio }: TeamMember) {
  // Cross-fade in once the browser confirms the image actually decoded —
  // never on mount, and never on a timer. Until then (loading, slow, or a
  // hung/broken URL that never fires onload at all) the frame underneath
  // just keeps showing; there's no separate "failed" state to react to
  // because not-loaded-yet and never-going-to-load look identical here by
  // design, and both should resolve to the same calm placeholder.
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  return (
    <div tabIndex={0} className="team-flip group h-full w-full outline-none">
      <div className="team-flip__inner">
        {/* front */}
        <div className="team-flip__face border border-foreground/10 bg-muted shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-500 group-hover:border-primary/40 group-hover:shadow-[var(--shadow-ember)] group-focus-visible:border-primary/40">
          <EditorialFrame name={name} />
          {photo && (
            <img
              src={photo}
              alt={name}
              loading="lazy"
              width={800}
              height={800}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${photoLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setPhotoLoaded(true)}
            />
          )}
          {/* The same foil frame, inset over the photo, so every profile
              carries the treatment — not only the ones without a photo. */}
          <div className="foil-ring pointer-events-none absolute inset-2.5 rounded-xl" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/75 to-transparent px-5 pb-5 pt-14">
            <h3 className="text-sm font-semibold uppercase tracking-wide">{name}</h3>
            {role && <p className="mt-0.5 text-xs italic text-muted-foreground">{role}</p>}
            <span className="mt-2 block h-px w-6 bg-primary/60 transition-all duration-500 group-hover:w-10" />
          </div>
        </div>

        {/* back */}
        <div className="team-flip__face--back team-flip__face border border-primary/30 bg-card shadow-[var(--shadow-ember)]">
          {banner && (
            <img
              src={banner}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${bannerLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setBannerLoaded(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/92 via-background/90 to-background/95" />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
            <span aria-hidden className="font-display text-3xl leading-none text-primary/70">
              &ldquo;
            </span>
            {bio ? (
              <div
                className="rich-text-content line-clamp-5 text-xs italic leading-relaxed text-foreground/90 sm:text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(bio) }}
              />
            ) : (
              role && <p className="text-xs italic text-muted-foreground sm:text-sm">{role}</p>
            )}
            <span className="mt-1 block h-px w-6 bg-primary/60" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
