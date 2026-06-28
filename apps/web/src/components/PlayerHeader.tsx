import type { ProfileSummary } from "@cops/core";
import { rankImage } from "../ranks";
import { Avatar } from "./Avatar";

export function PlayerHeader({ summary }: { summary: ProfileSummary }) {
  const xpPct =
    summary.xp.next > 0
      ? Math.min(100, Math.round((summary.xp.current / summary.xp.next) * 100))
      : 0;
  const rankImg = rankImage(summary.rank.id);

  return (
    <div className="clip-corner border border-line bg-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={summary.name} color={summary.rank.color} size={64} />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
                {summary.name}
              </h2>
              {summary.clan && (
                <span className="border border-line bg-panel-2 px-2 py-0.5 text-sm text-muted">
                  [{summary.clan.tag}]
                </span>
              )}
              {summary.banned && (
                <span className="bg-danger/20 px-2 py-0.5 text-sm text-danger">
                  Banned
                </span>
              )}
            </div>
            <p className="mt-1 text-sm uppercase tracking-wide text-muted">
              Level {summary.level} · MMR {summary.mmr}
              {summary.leaderboardPosition
                ? ` · Leaderboard #${summary.leaderboardPosition}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rankImg && (
            <img
              src={rankImg}
              alt={summary.rank.name}
              className="h-16 w-16 object-contain drop-shadow"
            />
          )}
          <div className="text-right">
            <div
              className="font-display text-xl font-bold uppercase tracking-wide"
              style={{ color: summary.rank.color }}
            >
              {summary.rank.name}
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">
              Peak: {summary.highestRank.name}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs uppercase tracking-wide text-muted">
          <span>XP</span>
          <span className="tabular">
            {summary.xp.current.toLocaleString()} /{" "}
            {summary.xp.next.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden bg-panel-2">
          <div className="h-full bg-accent" style={{ width: `${xpPct}%` }} />
        </div>
      </div>
    </div>
  );
}
