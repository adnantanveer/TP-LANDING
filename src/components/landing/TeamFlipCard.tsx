import { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { initials } from "./primitives";

export type TeamMember = { id: string; name: string; role: string; photo: string; banner: string; bio: string; order: number };

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
// The monogram badge: rendered underneath the <img> from the very first
// frame (not swapped in on error) so a card never sits blank while its
// photo is in flight — an admin-uploaded photo that's slow, or that never
// loads at all, quietly stays on this instead of a stuck loading gap.
function InitialsBadge({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_72%)] bg-card">
      <span
        aria-hidden
        className="pointer-events-none absolute font-display text-[7rem] font-bold leading-none text-primary/[0.06] select-none sm:text-[9rem]"
      >
        {initials(name)}
      </span>
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent font-display text-3xl font-bold text-primary shadow-[0_0_50px_-12px_var(--primary)] sm:h-28 sm:w-28 sm:text-4xl">
        {initials(name)}
      </div>
    </div>
  );
}

export function TeamFlipCard({ name, role, photo, banner, bio }: TeamMember) {
  // Cross-fade in once the browser confirms the image actually decoded —
  // never on mount, and never on a timer. Until then (loading, slow, or a
  // hung/broken URL that never fires onload at all) the badge underneath
  // just keeps showing; there's no separate "failed" state to react to
  // because not-loaded-yet and never-going-to-load look identical here by
  // design, and both should resolve to the same calm placeholder.
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  return (
    <div tabIndex={0} className="team-flip group h-full w-full outline-none">
      <div className="team-flip__inner">
        {/* front */}
        <div className="team-flip__face border border-border bg-muted shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-500 group-hover:border-primary/50 group-hover:shadow-[var(--shadow-ember)] group-focus-visible:border-primary/50">
          <InitialsBadge name={name} />
          {photo && (
            <img
              src={photo}
              alt={name}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${photoLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setPhotoLoaded(true)}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/75 to-transparent px-4 pb-4 pt-12">
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
