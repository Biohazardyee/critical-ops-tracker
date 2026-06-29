import { useId, useState } from "react";
import type { ProfileSummary } from "@cops/core";

type Seasons = ProfileSummary["seasons"];
type Metric = "kd" | "kda" | "winrate";

const METRICS: { id: Metric; label: string }[] = [
  { id: "kd", label: "K/D" },
  { id: "kda", label: "KDA" },
  { id: "winrate", label: "Win %" },
];

const W = 640;
const H = 200;
const PADL = 36;
const PADR = 12;
const PADT = 16;
const PADB = 26;

export function SeasonChart({
  seasons,
  onSelectSeason,
}: {
  seasons: Seasons;
  onSelectSeason?: (season: number) => void;
}) {
  const [metric, setMetric] = useState<Metric>("kd");
  const gradId = useId();

  const data = seasons.filter((s) => s.ranked.k > 0 || s.ranked.games > 0);

  if (data.length === 0) {
    return <p className="text-sm text-muted">No ranked season data.</p>;
  }

  const val = (i: number): number => data[i]!.ranked[metric];
  const fmt = (v: number): string =>
    metric === "winrate" ? `${(v * 100).toFixed(0)}%` : v.toFixed(2);

  const values = data.map((_, i) => val(i));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = range === 0 ? (max || 1) * 0.2 : range * 0.15;
  const lo = Math.max(0, min - pad);
  const hi = max + pad || 1;

  const n = data.length;
  const x = (i: number): number =>
    n === 1 ? W / 2 : PADL + (i / (n - 1)) * (W - PADL - PADR);
  const y = (v: number): number =>
    H - PADB - ((v - lo) / (hi - lo || 1)) * (H - PADT - PADB);

  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" L ");
  const area = `M ${x(0)},${H - PADB} L ${line} L ${x(n - 1)},${H - PADB} Z`;

  return (
    <div>
      <div className="mb-3 flex justify-end gap-1">
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetric(m.id)}
            className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
              metric === m.id
                ? "bg-accent text-black"
                : "bg-panel-2 text-muted hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid + y labels */}
        {[hi, (hi + lo) / 2, lo].map((v, i) => (
          <g key={i}>
            <line
              x1={PADL}
              y1={y(v)}
              x2={W - PADR}
              y2={y(v)}
              stroke="var(--color-line)"
              strokeOpacity={0.5}
            />
            <text x={4} y={y(v) + 3} fill="var(--color-muted)" fontSize={10}>
              {fmt(v)}
            </text>
          </g>
        ))}

        {n > 1 && <path d={area} fill={`url(#${gradId})`} />}
        {n > 1 && (
          <polyline
            points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {data.map((s, i) => (
          <g key={s.season}>
            <circle cx={x(i)} cy={y(val(i))} r={3} fill="var(--color-accent)" />
            <text
              x={x(i)}
              y={H - 8}
              fill="var(--color-muted)"
              fontSize={10}
              textAnchor="middle"
            >
              S{s.season}
            </text>
            {/* Larger transparent hit area: hover tooltip + click for details. */}
            <circle
              cx={x(i)}
              cy={y(val(i))}
              r={12}
              fill="transparent"
              style={{ cursor: onSelectSeason ? "pointer" : "default" }}
              onClick={() => onSelectSeason?.(s.season)}
            >
              <title>{`Season ${s.season} — ${fmt(val(i))} (${s.ranked.w}W-${s.ranked.l}L) — click for details`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
