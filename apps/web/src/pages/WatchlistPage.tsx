import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProfileSummary } from "@cops/core";
import { getPlayers, unfollowPlayer } from "../api";
import { getWatchlist, removeWatch } from "../storage";
import { getToken } from "../notifications";
import { useI18n } from "../i18n";
import { useSeo } from "../seo";
import { Avatar } from "../components/Avatar";
import { rankImage } from "../ranks";

export function WatchlistPage() {
  const { t } = useI18n();
  // Personal page — no SEO value, keep it out of the index.
  useSeo("Watchlist | Critical Ops Tracker", undefined, true);
  const [names, setNames] = useState<string[]>(getWatchlist());
  const [players, setPlayers] = useState<ProfileSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (names.length === 0) {
      setPlayers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPlayers(names)
      .then((r) => {
        if (!cancelled) setPlayers(r.players);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [names]);

  function remove(name: string) {
    removeWatch(name);
    setNames(getWatchlist());
    unfollowPlayer(getToken(), name).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          {t("wl.title")}
        </h1>
        <p className="text-muted">{t("wl.subtitle")}</p>
      </div>

      {names.length === 0 && (
        <div className="border border-dashed border-line p-10 text-center text-muted">
          {t("wl.empty")}
        </div>
      )}
      {error && <p className="text-danger">{error}</p>}
      {loading && <p className="text-muted">{t("common.loading")}</p>}

      {players && players.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => {
            const img = rankImage(p.rank.id);
            return (
              <div
                key={p.userId}
                className="clip-corner relative border border-line bg-panel p-4"
              >
                <button
                  onClick={() => remove(p.name)}
                  title="Remove from watchlist"
                  className="absolute right-2 top-1 text-lg text-muted transition hover:text-danger"
                >
                  ×
                </button>
                <Link
                  to={`/player/${encodeURIComponent(p.name)}`}
                  className="flex items-center gap-3"
                >
                  <Avatar name={p.name} color={p.rank.color} size={44} />
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg font-bold uppercase tracking-wide">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted">
                      {img && (
                        <img src={img} alt="" className="h-4 w-4 object-contain" />
                      )}
                      <span style={{ color: p.rank.color }}>{p.rank.name}</span>
                    </div>
                  </div>
                </Link>
                <div className="tabular mt-3 flex justify-between text-xs text-muted">
                  <span>MMR {p.mmr}</span>
                  <span>K/D {p.career.ranked.kd}</span>
                  <span>Lvl {p.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
