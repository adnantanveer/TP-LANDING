import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { TeamMosaic, TeamMosaicSkeleton } from "@/components/landing/TeamMosaic";
import { sortTeam, useTeamContent } from "@/components/landing/useTeamContent";

/**
 * Full "Our Team" roster, linked from the homepage TeamSection. Same
 * `/api/content/team` feed and the same irregular TeamMosaic grid, with
 * everyone the admin has added (no cap). No placeholder people here: it
 * shows skeleton tiles while loading and a short note if the feed fails.
 */
export function Team() {
  const { members, status } = useTeamContent();
  const roster = sortTeam(members);

  return (
    <main className="relative">
      <Nav />

      <section className="relative pb-24 pt-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel>Our team</SectionLabel>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1.02]">
              The people <span className="text-ember">behind the work</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Hover anyone to meet them. On a phone, tap.
            </p>
          </Reveal>

          <div className="mt-16">
            {roster.length > 0 ? (
              <TeamMosaic members={roster} />
            ) : status === "error" ? (
              <p className="text-sm text-muted-foreground">The team list couldn’t load right now. Please try again shortly.</p>
            ) : (
              <TeamMosaicSkeleton count={10} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
