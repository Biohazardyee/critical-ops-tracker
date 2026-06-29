import { useEffect } from "react";

const ORIGIN = "https://cops.melodia.cloud";
const DEFAULT_TITLE = "Critical Ops Tracker — Stats, Ranks & Leaderboard";
const DEFAULT_DESC =
  "Free Critical Ops tracker: look up any player's stats, rank & MMR, K/D and season history, plus the global leaderboard.";

function setMetaByName(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string): void {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-route SEO: title, meta description, canonical and og:url/title/description.
 * The canonical MUST be per-route — a single static canonical makes every SPA
 * route look like a duplicate of "/" (Bing refuses to index those).
 */
export function useSeo(
  title?: string,
  description?: string,
  noindex = false,
): void {
  useEffect(() => {
    const url = ORIGIN + window.location.pathname + window.location.search;
    const finalTitle = title ?? DEFAULT_TITLE;
    const finalDesc = description ?? DEFAULT_DESC;

    document.title = finalTitle;
    setMetaByName("description", finalDesc);
    setMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);
    setMetaByProperty("og:url", url);
    setMetaByProperty("og:title", finalTitle);
    setMetaByProperty("og:description", finalDesc);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaByName("description", DEFAULT_DESC);
      setMetaByName("robots", "index, follow");
      setCanonical(ORIGIN + "/");
      setMetaByProperty("og:url", ORIGIN + "/");
    };
  }, [title, description, noindex]);
}
