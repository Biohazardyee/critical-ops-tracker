import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEADERBOARD_MODES, LEADERBOARD_LABELS } from "@cops/core";
import type {
  ClanLeaderboardEntry,
  EliteLeaderboardEntry,
  LeaderboardEntry,
  LeaderboardMode,
  PlayerLeaderboardEntry,
} from "@cops/core";
import { getLeaderboard, type LeaderboardResponse } from "../api";
import { Tabs } from "../components/Tabs";
import { cleanName } from "../ranks";
import { useI18n } from "../i18n";

const PAGE_SIZE = 50;

const rankClass = (rank: number): string =>
  rank === 1
    ? "text-accent"
    : rank <= 3
      ? "text-accent-soft"
      : "text-muted";

export function LeaderboardPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<LeaderboardMode>("elite");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeaderboard(mode, 1000)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setError((e as Error).message);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  // Reset to the first page whenever the mode or search query changes.
  useEffect(() => {
    setPage(0);
  }, [mode, query]);

  const tabs = LEADERBOARD_MODES.map((m) => ({
    id: m,
    label: LEADERBOARD_LABELS[m],
  }));

  const q = query.trim().toLowerCase();
  const all = data?.entries ?? [];
  const filtered = q
    ? all.filter((e) => {
        const name = (e as { name?: string }).name ?? "";
        const tag = (e as { tag?: string }).tag ?? "";
        return name.toLowerCase().includes(q) || tag.toLowerCase().includes(q);
      })
    : all;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const start = current * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          {t("lb.title")}
        </h1>
        <p className="text-muted">{t("lb.subtitle")}</p>
      </div>

      <Tabs
        tabs={tabs}
        active={mode}
        onChange={(id) => setMode(id as LeaderboardMode)}
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("lb.find")}
        className="w-full border border-line bg-panel-2 px-4 py-2.5 text-sm tracking-wider outline-none placeholder:uppercase placeholder:text-muted focus:border-accent"
      />

      {error && <p className="text-danger">{error}</p>}
      {loading && <p className="text-muted">{t("common.loading")}</p>}

      {data && !loading && (
        <>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
            <span>
              {filtered.length === 0
                ? `${t("lb.noMatch")} “${query}”`
                : `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} / ${filtered.length}`}
            </span>
            {data.count >= 1000 && <span>{t("lb.cap")}</span>}
          </div>

          {shown.length > 0 && (
            <div className="clip-corner overflow-x-auto border border-line bg-panel">
              {/* Render by data.mode (always consistent with entries) to avoid a
                  shape mismatch while a new mode is still loading. */}
              <LeaderboardTable mode={data.mode} entries={shown} />
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(current - 1)}
                disabled={current === 0}
                className="border border-line bg-panel-2 px-3 py-1.5 text-sm font-semibold uppercase tracking-wider transition hover:border-accent disabled:opacity-40"
              >
                {t("lb.prev")}
              </button>
              <span className="tabular text-sm text-muted">
                {t("lb.page")} {current + 1} / {pageCount}
              </span>
              <button
                onClick={() => setPage(current + 1)}
                disabled={current >= pageCount - 1}
                className="border border-line bg-panel-2 px-3 py-1.5 text-sm font-semibold uppercase tracking-wider transition hover:border-accent disabled:opacity-40"
              >
                {t("lb.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LeaderboardTable({
  mode,
  entries,
}: {
  mode: LeaderboardMode;
  entries: LeaderboardEntry[];
}) {
  if (mode === "clan") {
    return <ClanTable entries={entries as ClanLeaderboardEntry[]} />;
  }
  if (mode === "elite") {
    return <EliteTable entries={entries as EliteLeaderboardEntry[]} />;
  }
  return <PlayerTable entries={entries as PlayerLeaderboardEntry[]} />;
}

const TH = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted";
const TD = "px-4 py-2.5 tabular";
const ROW = "border-t border-line/60 hover:bg-panel-2";

function PlayerTable({ entries }: { entries: PlayerLeaderboardEntry[] }) {
  const navigate = useNavigate();
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className={TH}>#</th>
          <th className={TH}>Player</th>
          <th className={`${TH} text-right`}>Kills</th>
          <th className={`${TH} text-right`}>Deaths</th>
          <th className={`${TH} text-right`}>Assists</th>
          <th className={`${TH} text-right`}>K/D</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr
            key={e.rank}
            className={`${ROW} cursor-pointer`}
            onClick={() =>
              navigate(`/?q=${encodeURIComponent(cleanName(e.name))}`)
            }
          >
            <td className={`${TD} font-bold ${rankClass(e.rank)}`}>{e.rank}</td>
            <td className={`${TD} font-semibold`}>{e.name}</td>
            <td className={`${TD} text-right`}>{e.kills.toLocaleString()}</td>
            <td className={`${TD} text-right`}>{e.deaths.toLocaleString()}</td>
            <td className={`${TD} text-right`}>{e.assists.toLocaleString()}</td>
            <td className={`${TD} text-right font-semibold`}>{e.ratio}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EliteTable({ entries }: { entries: EliteLeaderboardEntry[] }) {
  const navigate = useNavigate();
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className={TH}>#</th>
          <th className={TH}>Player</th>
          <th className={TH}>Clan</th>
          <th className={`${TH} text-right`}>Rating</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr
            key={e.rank}
            className={`${ROW} cursor-pointer`}
            onClick={() =>
              navigate(`/?q=${encodeURIComponent(cleanName(e.name))}`)
            }
          >
            <td className={`${TD} font-bold ${rankClass(e.rank)}`}>{e.rank}</td>
            <td className={`${TD} font-semibold`}>{e.name}</td>
            <td className={`${TD} text-muted`}>{e.tag ? `[${e.tag}]` : "—"}</td>
            <td className={`${TD} text-right font-semibold`}>
              {e.rating.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClanTable({ entries }: { entries: ClanLeaderboardEntry[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className={TH}>#</th>
          <th className={TH}>Clan</th>
          <th className={`${TH} text-right`}>Rating</th>
          <th className={`${TH} text-right`}>Members</th>
          <th className={`${TH} text-right`}>Avg MMR</th>
          <th className={`${TH} text-right`}>K/D</th>
          <th className={`${TH} text-right`}>W/L</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.rank} className={ROW}>
            <td className={`${TD} font-bold ${rankClass(e.rank)}`}>{e.rank}</td>
            <td className={`${TD} font-semibold`}>
              {e.name}{" "}
              <span className="text-muted">{e.tag ? `[${e.tag}]` : ""}</span>
            </td>
            <td className={`${TD} text-right`}>{e.rating.toLocaleString()}</td>
            <td className={`${TD} text-right`}>{e.players}</td>
            <td className={`${TD} text-right`}>{Math.round(e.average_rating)}</td>
            <td className={`${TD} text-right`}>{e.kdr}</td>
            <td className={`${TD} text-right`}>{e.wlr}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
