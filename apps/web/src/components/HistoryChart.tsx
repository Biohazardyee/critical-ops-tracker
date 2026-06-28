import type { SnapshotRow } from "../api";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-line p-6 text-center text-sm text-muted">
      {message}
    </div>
  );
}

interface Props {
  snapshots: SnapshotRow[];
  tracked: boolean;
}

const W = 600;
const H = 180;
const PAD = 28;

export function HistoryChart({ snapshots, tracked }: Props) {
  if (!tracked || snapshots.length === 0) {
    return (
      <EmptyState message="Not tracked yet — hit “Track this player”. Snapshots are taken daily to build the curve." />
    );
  }
  if (snapshots.length < 2) {
    return (
      <EmptyState message="Only one snapshot so far — the MMR curve appears once there are at least two (the worker snapshots daily)." />
    );
  }

  const mmrs = snapshots.map((s) => s.mmr);
  const min = Math.min(...mmrs);
  const max = Math.max(...mmrs);
  const span = max - min || 1;
  const n = snapshots.length;

  const x = (i: number): number =>
    PAD + (i / (n - 1)) * (W - 2 * PAD);
  const y = (mmr: number): number =>
    H - PAD - ((mmr - min) / span) * (H - 2 * PAD);

  const points = snapshots.map((s, i) => `${x(i)},${y(s.mmr)}`).join(" ");
  const first = snapshots[0]!;
  const last = snapshots[n - 1]!;
  const delta = last.mmr - first.mmr;
  const fmtDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3 text-sm">
        <span className="tabular text-2xl font-bold">{last.mmr}</span>
        <span className="text-xs uppercase tracking-wide text-muted">MMR</span>
        <span
          className={`tabular text-sm font-semibold ${
            delta >= 0 ? "text-online" : "text-danger"
          }`}
        >
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full">
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="var(--color-line)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {snapshots.map((s, i) => (
          <circle
            key={s.id}
            cx={x(i)}
            cy={y(s.mmr)}
            r={2.5}
            fill="var(--color-accent)"
          >
            <title>{`${fmtDate(s.takenAt)} — MMR ${s.mmr}`}</title>
          </circle>
        ))}
        <text x={PAD} y={H - 8} fill="var(--color-muted)" fontSize={11}>
          {fmtDate(first.takenAt)}
        </text>
        <text
          x={W - PAD}
          y={H - 8}
          fill="var(--color-muted)"
          fontSize={11}
          textAnchor="end"
        >
          {fmtDate(last.takenAt)}
        </text>
        <text x={PAD} y={16} fill="var(--color-muted)" fontSize={11}>
          {max}
        </text>
        <text x={PAD} y={H - PAD - 2} fill="var(--color-muted)" fontSize={11}>
          {min}
        </text>
      </svg>
    </div>
  );
}
