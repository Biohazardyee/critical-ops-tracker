import type { RankTier } from "@cops/core";
import { rankImage } from "../ranks";

interface Props {
  rank: RankTier;
  size?: "sm" | "md";
}

export function RankBadge({ rank, size = "md" }: Props) {
  const img = rankImage(rank.id);
  const imgSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: `${rank.color}22`,
        color: rank.color,
        border: `1px solid ${rank.color}55`,
      }}
    >
      {img && (
        <img
          src={img}
          alt={rank.name}
          className={`${imgSize} object-contain`}
        />
      )}
      {rank.name}
    </span>
  );
}
