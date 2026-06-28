import type { RawProfile, RawServerStatus } from "./types.js";
import type {
  ClanLeaderboardEntry,
  EliteLeaderboardEntry,
  LeaderboardEntry,
  LeaderboardMode,
  PlayerLeaderboardEntry,
} from "./leaderboard.js";

const DEFAULT_BASE = "https://default.prod.copsapi.criticalforce.fi/api/public";

export class CopsApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "CopsApiError";
  }
}

export class PlayerNotFoundError extends CopsApiError {
  constructor(query: string) {
    super(`No Critical Ops player found for "${query}".`, 404);
    this.name = "PlayerNotFoundError";
  }
}

export interface CopsClientOptions {
  /** Override the API base URL (defaults to COPS_API_BASE env or the public endpoint). */
  baseUrl?: string;
  /** Request timeout in milliseconds (default 10000). */
  timeoutMs?: number;
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof fetch;
}

/**
 * Thin, typed client over the public Critical Ops API.
 * Uses the global `fetch` (Node >= 18) — no runtime dependencies.
 */
export class CopsClient {
  private readonly baseUrl: string;
  /** API root without the `/public` suffix (e.g. for `/leaderboard/*`). */
  private readonly apiRoot: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: CopsClientOptions = {}) {
    // Read COPS_API_BASE without referencing the Node `process` global directly,
    // so this module stays usable in browser/type-check contexts too.
    const envBase = (
      globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env?.COPS_API_BASE;
    this.baseUrl = (options.baseUrl ?? envBase ?? DEFAULT_BASE).replace(
      /\/+$/,
      "",
    );
    this.apiRoot = this.baseUrl.replace(/\/public$/, "");
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.fetchImpl = options.fetch ?? fetch;
  }

  private async request<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, {
        headers: { "content-type": "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new CopsApiError(
          `Critical Ops API returned ${res.status} for ${url}`,
          res.status,
        );
      }
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof CopsApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new CopsApiError(`Critical Ops API request timed out (${url})`);
      }
      throw new CopsApiError(
        `Failed to reach the Critical Ops API: ${(err as Error).message}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private get<T>(path: string): Promise<T> {
    return this.request<T>(`${this.baseUrl}${path}`);
  }

  /**
   * Fetch profiles, mapping the API's "500 for unknown player" quirk to an
   * empty result so callers can treat it as not-found.
   */
  private async getProfiles(query: string): Promise<RawProfile[]> {
    try {
      return await this.get<RawProfile[]>(`/profile?${query}`);
    } catch (err) {
      if (err instanceof CopsApiError && err.status === 500) return [];
      throw err;
    }
  }

  /** Look up one or more profiles by in-game name. */
  async getProfilesByName(names: string[]): Promise<RawProfile[]> {
    if (names.length === 0) return [];
    return this.getProfiles(`usernames=${encodeURIComponent(names.join(","))}`);
  }

  /** Look up a single profile by in-game name. Throws if not found. */
  async getProfileByName(name: string): Promise<RawProfile> {
    const profiles = await this.getProfilesByName([name]);
    const profile = profiles[0];
    if (!profile) throw new PlayerNotFoundError(name);
    return profile;
  }

  /** Look up one or more profiles by numeric user id. */
  async getProfilesById(ids: Array<number | string>): Promise<RawProfile[]> {
    if (ids.length === 0) return [];
    return this.getProfiles(`ids=${encodeURIComponent(ids.join(","))}`);
  }

  /** Look up a single profile by numeric user id. Throws if not found. */
  async getProfileById(id: number | string): Promise<RawProfile> {
    const profiles = await this.getProfilesById([id]);
    const profile = profiles[0];
    if (!profile) throw new PlayerNotFoundError(String(id));
    return profile;
  }

  /** Current status of all game servers. */
  async getServerStatus(): Promise<RawServerStatus> {
    return this.get<RawServerStatus>(`/status/servers`);
  }

  /** Top players / clans for a leaderboard mode. */
  getLeaderboard(
    mode: "ranked" | "kills",
  ): Promise<PlayerLeaderboardEntry[]>;
  getLeaderboard(mode: "elite"): Promise<EliteLeaderboardEntry[]>;
  getLeaderboard(mode: "clan"): Promise<ClanLeaderboardEntry[]>;
  getLeaderboard(mode: LeaderboardMode): Promise<LeaderboardEntry[]>;
  getLeaderboard(mode: LeaderboardMode): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(
      `${this.apiRoot}/leaderboard/${mode}`,
    );
  }
}
