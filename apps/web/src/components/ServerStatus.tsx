import { useEffect, useState } from "react";
import { getServers, type ServerRow } from "../api";

export function ServerStatus() {
  const [rows, setRows] = useState<ServerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServers()
      .then(setRows)
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!rows) return <p className="text-muted">Loading servers…</p>;

  const groups = new Map<string, ServerRow[]>();
  for (const r of rows) {
    const region = (r.name.split("/")[0] ?? "Other").trim();
    const list = groups.get(region) ?? [];
    list.push(r);
    groups.set(region, list);
  }

  const online = rows.filter((r) => r.status === "online").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        <span className="font-semibold text-online">{online}</span> / {rows.length}{" "}
        servers online
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...groups.entries()].map(([region, servers]) => (
          <div
            key={region}
            className="clip-corner border border-line bg-panel p-4"
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              {region}
            </h3>
            <ul className="space-y-2">
              {servers.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{s.name}</span>
                  <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s.status === "online" ? "bg-online" : "bg-danger"
                      }`}
                    />
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
