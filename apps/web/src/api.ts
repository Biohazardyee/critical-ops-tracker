import type {
  LeaderboardEntry,
  LeaderboardMode,
  ProfileSummary,
} from "@cops/core";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export interface PlayerResponse {
  summary: ProfileSummary;
  tracked: boolean;
}

export interface SnapshotRow {
  id: number;
  takenAt: string;
  level: number;
  mmr: number;
  rank: number;
  rankedKills: number;
  rankedDeaths: number;
  rankedAssists: number;
  rankedWins: number;
  rankedLosses: number;
}

export interface HistoryResponse {
  userId: string;
  name: string;
  tracked: boolean;
  snapshots: SnapshotRow[];
}

export interface ServerRow {
  id: string;
  name: string;
  status: string;
}

export interface LeaderboardResponse {
  mode: LeaderboardMode;
  count: number;
  entries: LeaderboardEntry[];
}

export const getPlayer = (name: string): Promise<PlayerResponse> =>
  getJson(`/player/${encodeURIComponent(name)}`);

export const getHistory = (name: string): Promise<HistoryResponse> =>
  getJson(`/player/${encodeURIComponent(name)}/history`);

export const trackPlayer = (name: string): Promise<PlayerResponse> =>
  getJson(`/player/${encodeURIComponent(name)}/track`, { method: "POST" });

export const getServers = (): Promise<ServerRow[]> => getJson(`/servers`);

export const getPlayers = (
  names: string[],
): Promise<{ players: ProfileSummary[] }> =>
  getJson(`/players?names=${encodeURIComponent(names.join(","))}`);

export interface FeedEvent {
  id: number;
  userId: string;
  name: string;
  at: string;
  kind: "rank_up" | "rank_down" | "mmr";
  oldRank: number;
  newRank: number;
  oldMmr: number;
  newMmr: number;
}

const postJson = (path: string, body: unknown) =>
  getJson(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const getFeed = (token: string): Promise<{ events: FeedEvent[] }> =>
  getJson(`/feed?token=${encodeURIComponent(token)}`);

export const followPlayer = (token: string, name: string): Promise<unknown> =>
  postJson(`/feed/follow`, { token, name });

export const unfollowPlayer = (token: string, name: string): Promise<unknown> =>
  postJson(`/feed/unfollow`, { token, name });

export const getLeaderboard = (
  mode: LeaderboardMode,
  limit = 100,
): Promise<LeaderboardResponse> =>
  getJson(`/leaderboard/${mode}?limit=${limit}`);
