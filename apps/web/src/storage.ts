// Local (per-browser) persistence for the watchlist and recent searches.

const WATCH_KEY = "cops:watchlist";
const RECENT_KEY = "cops:recent";
const MAX_RECENT = 8;

function read(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, list: string[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

const sameName = (a: string, b: string): boolean =>
  a.toLowerCase() === b.toLowerCase();

// ---- Watchlist ----
export const getWatchlist = (): string[] => read(WATCH_KEY);

export const isWatched = (name: string): boolean =>
  read(WATCH_KEY).some((n) => sameName(n, name));

/** Toggle a name in the watchlist. Returns the new watched state. */
export function toggleWatch(name: string): boolean {
  const list = read(WATCH_KEY);
  const idx = list.findIndex((n) => sameName(n, name));
  if (idx >= 0) {
    list.splice(idx, 1);
    write(WATCH_KEY, list);
    return false;
  }
  write(WATCH_KEY, [name, ...list]);
  return true;
}

export function removeWatch(name: string): void {
  write(
    WATCH_KEY,
    read(WATCH_KEY).filter((n) => !sameName(n, name)),
  );
}

// ---- Recent searches ----
export const getRecent = (): string[] => read(RECENT_KEY);

export function addRecent(name: string): void {
  const list = read(RECENT_KEY).filter((n) => !sameName(n, name));
  write(RECENT_KEY, [name, ...list].slice(0, MAX_RECENT));
}
