/**
 * Leaderboard types. These live under the API's `/api/leaderboard/*` path
 * (note: NOT under `/api/public`), the same endpoints the official
 * criticalopsgame.com leaderboards use.
 */

export type LeaderboardMode = "elite" | "ranked" | "kills" | "clan";

export const LEADERBOARD_MODES: LeaderboardMode[] = [
  "elite",
  "ranked",
  "kills",
  "clan",
];

/** ranked / kills leaderboards: top players by kills. */
export interface PlayerLeaderboardEntry {
  rank: number;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  ratio: number;
}

/** elite leaderboard: top competitive players by rating (MMR). */
export interface EliteLeaderboardEntry {
  rank: number;
  name: string;
  tag: string;
  rating: number;
}

/** clan leaderboard. */
export interface ClanLeaderboardEntry {
  rank: number;
  name: string;
  tag: string;
  rating: number;
  players: number;
  average_rating: number;
  kills: number;
  deaths: number;
  kdr: number;
  assists: number;
  wins: number;
  losses: number;
  wlr: number;
}

export type LeaderboardEntry =
  | PlayerLeaderboardEntry
  | EliteLeaderboardEntry
  | ClanLeaderboardEntry;

export const LEADERBOARD_LABELS: Record<LeaderboardMode, string> = {
  elite: "Elite",
  ranked: "Ranked",
  kills: "Kills",
  clan: "Clans",
};
