/**
 * Types describing the raw responses of the public Critical Ops API.
 * Shapes were derived from live responses of:
 *   GET /api/public/profile?usernames=<name>
 *   GET /api/public/status/servers
 */

/** Kills / deaths / assists / wins / losses for a single game mode. */
export interface RawModeStats {
  k: number;
  d: number;
  a: number;
  w: number;
  l: number;
}

export type GameMode = "ranked" | "casual" | "custom";

/** One season's stats, split across the three game modes. */
export interface RawSeasonStats {
  season: number;
  ranked: RawModeStats;
  casual: RawModeStats;
  custom: RawModeStats;
}

/** Current-season ranked standing. */
export interface RawRankedInfo {
  placement_matches_left: number;
  wins: number;
  losses: number;
  highest_rank: number;
  mmr: number;
  global_position: number;
  rank: number;
}

export interface RawLeaderboardData {
  position: number;
  score: number;
}

export interface RawPlayerLevel {
  level: number;
  current_xp: number;
  next_level_xp: number;
}

export interface RawBasicInfo {
  userID: number;
  name: string;
  userType: number;
  iconID: number;
  playerLevel: RawPlayerLevel;
  lastSeenTime: string;
}

export interface RawClanInfo {
  basicInfo: { name: string; tag: string };
  id: number;
  memberRank: number;
}

export interface RawProfile {
  basicInfo: RawBasicInfo;
  userSettings: Record<string, unknown>;
  friendStatus: number;
  ban: unknown | null;
  stats: {
    seasonal_stats: RawSeasonStats[];
    ranked: RawRankedInfo;
    leaderboard_data: RawLeaderboardData;
  };
  /** Present only when the player belongs to a clan. */
  clan?: RawClanInfo;
}

/** Map of server id -> status, as returned by /status/servers. */
export type RawServerStatus = Record<
  string,
  { name: string; status: string }
>;
