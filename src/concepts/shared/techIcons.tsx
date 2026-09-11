import {
  siReact,
  siNextdotjs,
  siTypescript,
  siTailwindcss,
  siNodedotjs,
  siPostgresql,
  siGraphql,
  siRedis,
  siDocker,
  siSupabase,
  siPython,
  siMongodb,
  siVuedotjs,
  siAngular,
  siKubernetes,
} from "simple-icons";
import { Cloud } from "@phosphor-icons/react";
import type { ReactNode } from "react";

// AWS and Azure marks aren't distributed by Simple Icons (trademark
// policy) — those two fall back to a generic Phosphor glyph, same
// bounding box as the real marks so the grid stays visually consistent.
const CLOUD_FALLBACK = new Set(["AWS", "Azure"]);

const BRAND_ICONS: Record<string, { path: string } | undefined> = {
  React: siReact,
  "React Native": siReact, // no separate official mark; RN's own logo is React's
  "Next.js": siNextdotjs,
  TypeScript: siTypescript,
  "Tailwind CSS": siTailwindcss,
  "Node.js": siNodedotjs,
  PostgreSQL: siPostgresql,
  GraphQL: siGraphql,
  Redis: siRedis,
  Docker: siDocker,
  Supabase: siSupabase,
  Python: siPython,
  MongoDB: siMongodb,
  Vue: siVuedotjs,
  Angular: siAngular,
  Kubernetes: siKubernetes,
};

/** Real brand mark when one exists, a generic cloud glyph for the two
 * trademark-restricted clouds, or nothing at all for labels that were
 * never a brand to begin with (compliance/process tags like "SOC 2" or
 * "Accessibility") — showing a random icon next to those would mislead
 * rather than inform. */
export function TechIcon({ name, className }: { name: string; className?: string }): ReactNode {
  const icon = BRAND_ICONS[name];
  if (icon) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d={icon.path} />
      </svg>
    );
  }
  if (CLOUD_FALLBACK.has(name)) {
    return <Cloud weight="bold" className={className} />;
  }
  return null;
}
