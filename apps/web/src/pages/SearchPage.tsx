import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getHistory,
  getPlayer,
  trackPlayer,
  type HistoryResponse,
  type PlayerResponse,
} from "../api";
import { SearchBar } from "../components/SearchBar";
import { PlayerHeader } from "../components/PlayerHeader";
import { StatCard } from "../components/StatCard";
import { SeasonChart } from "../components/SeasonChart";
import { HistoryChart } from "../components/HistoryChart";
import { ServerStatus } from "../components/ServerStatus";
import { Tabs } from "../components/Tabs";

const TABS = [
  { id: "player", label: "Player" },
  { id: "servers", label: "Servers" },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const [tab, setTab] = useState("player");
  const [data, setData] = useState<PlayerResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    setTab("player");
    try {
      const [player, hist] = await Promise.all([
        getPlayer(name),
        getHistory(name),
      ]);
      setData(player);
      setHistory(hist);
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
              Search a player to see their stats, rank and season history.
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
                    Ranked by season
                  </h3>
                  <SeasonChart seasons={data.summary.seasons} />
                </section>

                <section className="clip-corner border border-line bg-panel p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                    MMR history
                  </h3>
                  <HistoryChart
                    snapshots={history?.snapshots ?? []}
                    tracked={data.tracked}
                  />
                </section>
              </div>

              <div className="flex items-center gap-3">
                {data.tracked ? (
                  <span className="text-sm uppercase tracking-wide text-online">
                    ✓ This player is being tracked
                  </span>
                ) : (
                  <button
                    onClick={track}
                    disabled={tracking}
                    className="border border-line bg-panel-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider transition hover:border-accent disabled:opacity-50"
                  >
                    {tracking ? "Adding…" : "Track this player"}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
