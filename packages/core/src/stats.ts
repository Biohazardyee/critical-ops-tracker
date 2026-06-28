import type {
  GameMode,
  RawModeStats,
  RawProfile,
  RawSeasonStats,
} from "./types.js";
import { resolveRank, type RankTier } from "./ranks.js";

const MODES: GameMode[] = ["ranked", "casual", "custom"];

/** Mode stats enriched with derived ratios. */
export interface DerivedModeStats extends RawModeStats {
  /** Kill/death ratio (kills when deaths === 0). */
  kd: number;
  /** (kills + assists) / deaths. */
  kda: number;
  /** Wins / (wins + losses), in [0, 1]. */
  winrate: number;
  /** Total games with a recorded result (wins + losses). */
  games: number;
}

const round = (n: number, dp = 2): number => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

export function deriveMode(m: RawModeStats): DerivedModeStats {
  const kd = m.d === 0 ? m.k : m.k / m.d;
  const kda = m.d === 0 ? m.k + m.a : (m.k + m.a) / m.d;
  const games = m.w + m.l;
  const winrate = games === 0 ? 0 : m.w / games;
  return { ...m, kd: round(kd), kda: round(kda), winrate: round(winrate, 4), games };
}

const EMPTY: RawModeStats = { k: 0, d: 0, a: 0, w: 0, l: 0 };

function addMode(a: RawModeStats, b: RawModeStats): RawModeStats {
  return { k: a.k + b.k, d: a.d + b.d, a: a.a + b.a, w: a.w + b.w, l: a.l + b.l };
}

/** Sum a single mode across every season (career totals). */
export function aggregateMode(
  seasons: RawSeasonStats[],
  mode: GameMode,
): RawModeStats {
  return seasons.reduce<RawModeStats>(
    (acc, s) => addMode(acc, s[mode]),
    { ...EMPTY },
  );
}

export interface SeasonSummary {
  season: number;
  ranked: DerivedModeStats;
  casual: DerivedModeStats;
  custom: DerivedModeStats;
}

export interface ProfileSummary {
  userId: number;
  name: string;
  iconId: number;
  level: number;
  xp: { current: number; next: number };
  rank: RankTier;
  highestRank: RankTier;
  mmr: number;
  placementMatchesLeft: number;
  leaderboardPosition: number;
  clan: { name: string; tag: string } | null;
  banned: boolean;
  /** Career totals (summed across all seasons) per mode. */
  career: Record<GameMode, DerivedModeStats>;
  /** Per-season breakdown, ordered by season ascending, empty seasons removed. */
  seasons: SeasonSummary[];
}

const hasActivity = (s: RawSeasonStats): boolean =>
  MODES.some((m) => {
    const v = s[m];
    return v.k || v.d || v.a || v.w || v.l;
  });

/**
 * Turn a raw profile into a display-ready summary with all derived stats.
 * Shared by the API, the Discord bot and (via the API) the web UI.
 */
export function summarizeProfile(p: RawProfile): ProfileSummary {
  const seasons = p.stats.seasonal_stats;
  return {
    userId: p.basicInfo.userID,
    name: p.basicInfo.name,
    iconId: p.basicInfo.iconID,
    level: p.basicInfo.playerLevel.level,
    xp: {
      current: p.basicInfo.playerLevel.current_xp,
      next: p.basicInfo.playerLevel.next_level_xp,
    },
    rank: resolveRank(p.stats.ranked.rank),
    highestRank: resolveRank(p.stats.ranked.highest_rank),
    mmr: p.stats.ranked.mmr,
    placementMatchesLeft: p.stats.ranked.placement_matches_left,
    leaderboardPosition: p.stats.leaderboard_data.position,
    clan: p.clan
      ? { name: p.clan.basicInfo.name, tag: p.clan.basicInfo.tag }
      : null,
    banned: p.ban != null,
    career: {
      ranked: deriveMode(aggregateMode(seasons, "ranked")),
      casual: deriveMode(aggregateMode(seasons, "casual")),
      custom: deriveMode(aggregateMode(seasons, "custom")),
    },
    seasons: seasons
      .filter(hasActivity)
      .map((s) => ({
        season: s.season,
        ranked: deriveMode(s.ranked),
        casual: deriveMode(s.casual),
        custom: deriveMode(s.custom),
      })),
  };
}

/** A point-in-time snapshot of the headline numbers we persist for tracking. */
export interface SnapshotMetrics {
  level: number;
  mmr: number;
  rank: number;
  rankedKills: number;
  rankedDeaths: number;
  rankedAssists: number;
  rankedWins: number;
  rankedLosses: number;
}

/** Extract the metrics we store in a snapshot from a raw profile. */
export function toSnapshotMetrics(p: RawProfile): SnapshotMetrics {
  const ranked = aggregateMode(p.stats.seasonal_stats, "ranked");
  return {
    level: p.basicInfo.playerLevel.level,
    mmr: p.stats.ranked.mmr,
    rank: p.stats.ranked.rank,
    rankedKills: ranked.k,
    rankedDeaths: ranked.d,
    rankedAssists: ranked.a,
    rankedWins: ranked.w,
    rankedLosses: ranked.l,
  };
}

export type SnapshotDelta = Record<keyof SnapshotMetrics, number>;

/** Difference between two snapshots (newer - older). */
export function diffSnapshots(
  older: SnapshotMetrics,
  newer: SnapshotMetrics,
): SnapshotDelta {
  const keys = Object.keys(newer) as Array<keyof SnapshotMetrics>;
  return keys.reduce((acc, key) => {
    acc[key] = newer[key] - older[key];
    return acc;
  }, {} as SnapshotDelta);
}
