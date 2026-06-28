/**
 * Mapping of the numeric `rank` value (from the API) to a human-readable tier.
 *
 * Verified against live data: Elite-leaderboard players report rank 9, a ~1841
 * MMR player reports rank 8. Combined with the official tier list, the scale is:
 *   0 Unranked · 1 Iron · 2 Bronze · 3 Silver · 4 Gold · 5 Platinum ·
 *   6 Diamond · 7 Master · 8 Special Ops · 9 Elite Ops
 * `rank: 0` means unranked / placements not finished.
 */
export interface RankTier {
  id: number;
  name: string;
  /** Hex color used by the web UI badge. */
  color: string;
}

const RANK_TIERS: RankTier[] = [
  { id: 0, name: "Unranked", color: "#6b7280" },
  { id: 1, name: "Iron", color: "#8a8f98" },
  { id: 2, name: "Bronze", color: "#cd7f32" },
  { id: 3, name: "Silver", color: "#c0c7d0" },
  { id: 4, name: "Gold", color: "#f2c14e" },
  { id: 5, name: "Platinum", color: "#3fc1c9" },
  { id: 6, name: "Diamond", color: "#5cc8ff" },
  { id: 7, name: "Master", color: "#b06cf0" },
  { id: 8, name: "Special Ops", color: "#ff7a3d" },
  { id: 9, name: "Elite Ops", color: "#ff2e4d" },
];

const FALLBACK_COLOR = "#6b7280";

export function resolveRank(rankId: number): RankTier {
  return (
    RANK_TIERS.find((t) => t.id === rankId) ?? {
      id: rankId,
      name: `Rank ${rankId}`,
      color: FALLBACK_COLOR,
    }
  );
}

export { RANK_TIERS };
