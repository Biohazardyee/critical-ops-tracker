// Per-device notification token + unread tracking.
// The token identifies your notification feed; paste it on another device to
// follow the same players' alerts there.

const TOKEN_KEY = "cops:token";
const SEEN_KEY = "cops:notifLastSeen";

export function getToken(): string {
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t =
      crypto.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

export function setToken(t: string): void {
  const v = t.trim();
  if (v) localStorage.setItem(TOKEN_KEY, v);
}

export const getLastSeen = (): number =>
  Number(localStorage.getItem(SEEN_KEY) ?? 0);

export const markSeen = (): void =>
  localStorage.setItem(SEEN_KEY, String(Date.now()));
