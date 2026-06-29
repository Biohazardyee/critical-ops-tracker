import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getHistory,
  getPlayer,
  trackPlayer,
  followPlayer,
  unfollowPlayer,
  type HistoryResponse,
  type PlayerResponse,
} from "../api";
import { useI18n } from "../i18n";
import { getToken } from "../notifications";
import { SearchBar } from "../components/SearchBar";
import { PlayerHeader } from "../components/PlayerHeader";
import { StatCard } from "../components/StatCard";
import { SeasonChart } from "../components/SeasonChart";
import { SeasonDetailModal } from "../components/SeasonDetailModal";
import { HistoryChart } from "../components/HistoryChart";
import { ServerStatus } from "../components/ServerStatus";
import { Tabs } from "../components/Tabs";
import { addRecent, getRecent, isWatched, toggleWatch } from "../storage";
import { useSeo } from "../seo";

export function SearchPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const TABS = [
    { id: "player", label: t("tab.player") },
    { id: "servers", label: t("tab.servers") },
  ];

  const [tab, setTab] = useState("player");
  const [data, setData] = useState<PlayerResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [watched, setWatched] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useSeo(
    data
      ? `${data.summary.name} — Critical Ops Stats & Rank | COPS Tracker`
      : undefined,
    data
      ? `${data.summary.name}: ${data.summary.rank.name}, MMR ${data.summary.mmr}, K/D ${data.summary.career.ranked.kd}. Critical Ops stats, ranks & season history.`
      : undefined,
  );

  const search = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    setTab("player");
    setSelectedSeason(null);
    try {
      const [player, hist] = await Promise.all([
        getPlayer(name),
        getHistory(name),
      ]);
      setData(player);
      setHistory(hist);
      addRecent(player.summary.name);
      setWatched(isWatched(player.summary.name));
    } catch (err) {
      setData(null);
      setHistory(null);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (q) void search(q);
    else {
      setData(null);
      setHistory(null);
    }
  }, [q, search]);

  async function track() {
    if (!data) return;
    setTracking(true);
    try {
      await trackPlayer(data.summary.name);
      await search(data.summary.name);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTracking(false);
    }
  }

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "servers" ? (
        <ServerStatus />
      ) : (
        <>
          {!data && (
            <div className="py-2 text-center">
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
                <span className="text-accent">Critical Ops</span> Stats Tracker
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
                {t("home.intro")}
              </p>
            </div>
          )}

          <SearchBar
            onSearch={(name) => setParams(name ? { q: name } : {})}
            loading={loading}
            initial={q}
          />

          {error && (
            <p className="border border-danger/40 bg-danger/10 p-4 text-danger">
              {error}
            </p>
          )}

          {!data && !error && !loading && (
            <div className="border border-dashed border-line p-10 text-center text-muted">
              <p>{t("search.empty")}</p>
              {getRecent().length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs uppercase tracking-wide">
                    {t("search.recent")}
                  </span>
                  {getRecent().map((name) => (
                    <button
                      key={name}
                      onClick={() => setParams({ q: name })}
                      className="border border-line bg-panel-2 px-3 py-1 text-xs text-white transition hover:border-accent"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              <PlayerHeader summary={data.summary} />

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  title="Ranked"
                  stats={data.summary.career.ranked}
                  accent
                />
                <StatCard title="Casual" stats={data.summary.career.casual} />
                <StatCard title="Custom" stats={data.summary.career.custom} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="clip-corner border border-line bg-panel p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("section.season")}
                  </h3>
                  <SeasonChart
                    seasons={data.summary.seasons}
                    onSelectSeason={setSelectedSeason}
                  />
                </section>

                <section className="clip-corner border border-line bg-panel p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("section.mmr")}
                  </h3>
                  <HistoryChart
                    snapshots={history?.snapshots ?? []}
                    tracked={data.tracked}
                  />
                </section>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const next = toggleWatch(data.summary.name);
                    setWatched(next);
                    const fn = next ? followPlayer : unfollowPlayer;
                    fn(getToken(), data.summary.name).catch(() => {});
                  }}
                  className={`border px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${
                    watched
                      ? "border-accent text-accent"
                      : "border-line bg-panel-2 hover:border-accent"
                  }`}
                >
                  {watched ? t("btn.watchlisted") : t("btn.watchlist")}
                </button>
                {data.tracked ? (
                  <span className="text-sm uppercase tracking-wide text-online">
                    {t("status.tracked")}
                  </span>
                ) : (
                  <button
                    onClick={track}
                    disabled={tracking}
                    className="border border-line bg-panel-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider transition hover:border-accent disabled:opacity-50"
                  >
                    {tracking ? t("btn.tracking") : t("btn.track")}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {data && selectedSeason !== null && (
        <SeasonDetailModal
          season={
            data.summary.seasons.find((s) => s.season === selectedSeason) ??
            data.summary.seasons[0]!
          }
          onClose={() => setSelectedSeason(null)}
        />
      )}
    </div>
  );
}
