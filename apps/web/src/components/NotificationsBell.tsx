import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolveRank } from "@cops/core";
import { getFeed, type FeedEvent } from "../api";
import { getToken, getLastSeen, markSeen } from "../notifications";
import { cleanName } from "../ranks";

function describe(e: FeedEvent): string {
  if (e.kind === "rank_up") return `promoted to ${resolveRank(e.newRank).name}`;
  if (e.kind === "rank_down") return `dropped to ${resolveRank(e.newRank).name}`;
  const d = e.newMmr - e.oldMmr;
  return `MMR ${d >= 0 ? "+" : ""}${d} → ${e.newMmr}`;
}

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function NotificationsBell() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(getLastSeen());

  useEffect(() => {
    const token = getToken();
    let cancelled = false;
    const load = () =>
      getFeed(token)
        .then((r) => {
          if (!cancelled) setEvents(r.events);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const unread = events.filter(
    (e) => new Date(e.at).getTime() > lastSeen,
  ).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      markSeen();
      setLastSeen(Date.now());
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative px-2 py-1 text-lg leading-none text-muted transition hover:text-white"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="clip-corner absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto border border-line bg-panel-2 shadow-xl">
            <div className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Notifications
            </div>
            {events.length === 0 ? (
              <p className="p-4 text-sm text-muted">
                No alerts yet. Watchlist players to get rank & MMR notifications.
              </p>
            ) : (
              events.map((e) => (
                <Link
                  key={e.id}
                  to={`/?q=${encodeURIComponent(cleanName(e.name))}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-2 border-b border-line/50 px-4 py-2 text-sm transition hover:bg-panel"
                >
                  <span>
                    <span className="font-semibold">{e.name}</span>{" "}
                    <span className="text-muted">{describe(e)}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {timeAgo(e.at)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
