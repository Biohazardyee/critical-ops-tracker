import { useEffect } from "react";

const DEFAULT_TITLE = "Critical Ops Tracker — Stats, Ranks & Leaderboard";
const DEFAULT_DESC =
  "Free Critical Ops tracker: look up any player's stats, rank & MMR, K/D and season history, plus the global leaderboard.";

function setMetaDescription(content: string): void {
  let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Set the document title + meta description for the current view.
 * Google renders client-side JS, so per-route titles help long-tail ranking
 * (e.g. a player's name + "Critical Ops stats").
 */
export function useSeo(title?: string, description?: string): void {
  useEffect(() => {
    document.title = title ?? DEFAULT_TITLE;
    setMetaDescription(description ?? DEFAULT_DESC);
    return () => {
      document.title = DEFAULT_TITLE;
      setMetaDescription(DEFAULT_DESC);
    };
  }, [title, description]);
}
