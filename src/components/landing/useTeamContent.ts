import { useEffect, useState } from "react";
import type { TeamMember } from "./TeamMosaic";

const API_URL = import.meta.env.VITE_API_URL as string;

type TeamContent = {
  members: TeamMember[];
  headcount: number | null;
  status: "loading" | "ready" | "error";
};

/**
 * One fetch of `/api/content/team` for both the homepage teaser and the
 * full /team page, so they always show the same people the admin manages.
 *
 * `fallback` is only used while loading or when the request fails. The
 * homepage passes its placeholder roster; /team passes nothing and shows
 * skeleton tiles instead, so fictional people never reach that page.
 *
 * Local dev: the live API rejects cross-origin requests from localhost.
 * Run `npm run dev:live` to proxy /api to the live backend and see real data.
 */
export function useTeamContent(fallback: TeamMember[] = []): TeamContent {
  const [state, setState] = useState<TeamContent>({ members: fallback, headcount: null, status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/content/team`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (cancelled) return;
        const members: TeamMember[] = Array.isArray(data?.teamMembers) ? data.teamMembers : [];
        setState({
          members: members.length ? members : fallback,
          headcount: typeof data?.headcount === "number" ? data.headcount : null,
          status: "ready",
        });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      });
    return () => {
      cancelled = true;
    };
    // The fallback is a module-level constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

/** Key members first (when the admin flags them), then everyone else by `order`. */
export function sortTeam(members: TeamMember[]): TeamMember[] {
  const byOrder = members.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return [...byOrder.filter((m) => m.isKeyMember), ...byOrder.filter((m) => !m.isKeyMember)];
}
