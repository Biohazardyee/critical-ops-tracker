// Tiny in-memory TTL cache to avoid hammering the (unofficial) upstream API.
interface Entry {
  value: unknown;
  expires: number;
}

const store = new Map<string, Entry>();

/** Default cache window (ms). */
export const TTL = 60_000;

/** Return a cached value for `key`, or compute + store it for `ttlMs`. */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = TTL,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;

  const value = await fn();
  store.set(key, { value, expires: now + ttlMs });

  // Opportunistic cleanup of expired entries.
  if (store.size > 500) {
    for (const [k, e] of store) if (e.expires <= now) store.delete(k);
  }
  return value;
}
