import { useEffect, useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import { Reveal, SectionLabel } from "@/components/landing/primitives";
import { TeamFlipCard, type TeamMember } from "@/components/landing/TeamFlipCard";

const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * Full "Our Team" roster — everything the homepage's TeamSection teaser
 * (a single scrollable line ending in "View more") links out to. Same
 * `/api/content/team` feed, unfiltered, so adding members in the admin
 * panel (client's said they'll grow this to 15-16 people) is the only
 * thing needed to populate this page — no code changes.
 */
export function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/content/team`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.teamMembers && setMembers(data.teamMembers))
      .catch(() => {});
  }, []);

  return (
    <main className="relative">
      <Nav />

      <section className="relative pb-20 pt-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionLabel>Our team</SectionLabel>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1.02]">
              The people <span className="text-ember">behind the work</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Hover a card to hear it in their own words.
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {members
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((m, i) => (
                <Reveal key={m.id} delay={0.04 * (i % 8)}>
                  <div className="h-72 w-full sm:h-80">
                    <TeamFlipCard {...m} />
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
