import type { DerivedModeStats } from "@cops/core";

const fmtPct = (n: number): string => `${(n * 100).toFixed(1)}%`;

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="tabular text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

interface Props {
  title: string;
  stats: DerivedModeStats;
  accent?: boolean;
}

export function StatCard({ title, stats, accent = false }: Props) {
  return (
    <div
      className={`clip-corner border bg-panel p-5 ${
        accent ? "border-accent/50" : "border-line"
      }`}
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
        {accent && <span className="h-3 w-1 bg-accent" />}
        {title}
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <Metric label="K/D" value={stats.kd.toFixed(2)} />
        <Metric label="KDA" value={stats.kda.toFixed(2)} />
        <Metric label="Win %" value={fmtPct(stats.winrate)} />
      </div>
      <div className="tabular mt-4 flex justify-between text-xs text-muted">
        <span>{stats.k.toLocaleString()} K</span>
        <span>{stats.d.toLocaleString()} D</span>
        <span>{stats.a.toLocaleString()} A</span>
        <span>
          {stats.w}-{stats.l}
        </span>
      </div>
    </div>
  );
}
