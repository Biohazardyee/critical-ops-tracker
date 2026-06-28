import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ProfileSummary } from "@cops/core";
import { getPlayer } from "../api";
import { Avatar } from "../components/Avatar";
import { rankImage } from "../ranks";

const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;

function PlayerColumn({ s }: { s: ProfileSummary }) {
  const img = rankImage(s.rank.id);
  return (
    <div className="flex items-center gap-3">
      <Avatar name={s.name} color={s.rank.color} size={48} />
      <div className="min-w-0">
        <div className="truncate font-display text-xl font-bold uppercase tracking-wide">
          {s.name}
        </div>
        <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted">
          {img && <img src={img} alt="" className="h-4 w-4 object-contain" />}
          <span style={{ color: s.rank.color }}>{s.rank.name}</span>
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  label: string;
  a: number;
  b: number;
  format?: (n: number) => string;
  higherIsBetter?: boolean;
}

function CompareRow({
  label,
  a,
  b,
  format = (n) => String(n),
  higherIsBetter = true,
}: RowProps) {
  const aWins = a === b ? null : higherIsBetter ? a > b : a < b;
  const cls = (win: boolean | null) =>
    win === null
      ? "text-white"
      : win
        ? "font-bold text-accent"
        : "text-muted";
  return (
    <tr className="border-t border-line/60">
      <td className={`tabular px-4 py-2.5 text-left text-lg ${cls(aWins === true)}`}>
        {format(a)}
      </td>
      <td className="px-4 py-2.5 text-center text-xs uppercase tracking-wider text-muted">
        {label}
      </td>
      <td
        className={`tabular px-4 py-2.5 text-right text-lg ${cls(aWins === false)}`}
      >
        {format(b)}
      </td>
    </tr>
  );
}

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const a = params.get("a") ?? "";
  const b = params.get("b") ?? "";

  const [inA, setInA] = useState(a);
  const [inB, setInB] = useState(b);
  const [pa, setPa] = useState<ProfileSummary | null>(null);
  const [pb, setPb] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (na: string, nb: string) => {
    setLoading(true);
    setError(null);
    try {
      const [ra, rb] = await Promise.all([getPlayer(na), getPlayer(nb)]);
      setPa(ra.summary);
      setPb(rb.summary);
    } catch (err) {
      setError((err as Error).message);
      setPa(null);
      setPb(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInA(a);
    setInB(b);
    if (a && b) void load(a, b);
  }, [a, b, load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Compare
        </h1>
        <p className="text-muted">Put two players head to head.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inA.trim() && inB.trim())
            setParams({ a: inA.trim(), b: inB.trim() });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={inA}
          onChange={(e) => setInA(e.target.value)}
          placeholder="PLAYER 1"
          className="flex-1 border border-line bg-panel-2 px-4 py-3 tracking-wider outline-none placeholder:uppercase placeholder:text-muted focus:border-accent"
        />
        <input
          value={inB}
          onChange={(e) => setInB(e.target.value)}
          placeholder="PLAYER 2"
          className="flex-1 border border-line bg-panel-2 px-4 py-3 tracking-wider outline-none placeholder:uppercase placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="clip-corner bg-accent px-6 py-3 font-semibold uppercase tracking-wider text-black transition hover:bg-accent-soft disabled:opacity-50"
        >
          {loading ? "…" : "Compare"}
        </button>
      </form>

      {error && (
        <p className="border border-danger/40 bg-danger/10 p-4 text-danger">
          {error}
        </p>
      )}

      {pa && pb && !loading && (
        <div className="clip-corner border border-line bg-panel">
          <div className="grid grid-cols-2 gap-4 border-b border-line p-4">
            <PlayerColumn s={pa} />
            <div className="flex justify-end">
              <PlayerColumn s={pb} />
            </div>
          </div>
          <table className="w-full">
            <tbody>
              <CompareRow label="Level" a={pa.level} b={pb.level} />
              <CompareRow label="MMR" a={pa.mmr} b={pb.mmr} />
              <CompareRow
                label="Ranked K/D"
                a={pa.career.ranked.kd}
                b={pb.career.ranked.kd}
              />
              <CompareRow
                label="Ranked KDA"
                a={pa.career.ranked.kda}
                b={pb.career.ranked.kda}
              />
              <CompareRow
                label="Ranked Win %"
                a={pa.career.ranked.winrate}
                b={pb.career.ranked.winrate}
                format={pct}
              />
              <CompareRow
                label="Ranked Kills"
                a={pa.career.ranked.k}
                b={pb.career.ranked.k}
                format={(n) => n.toLocaleString()}
              />
              <CompareRow
                label="Casual K/D"
                a={pa.career.casual.kd}
                b={pb.career.casual.kd}
              />
              <CompareRow
                label="Custom K/D"
                a={pa.career.custom.kd}
                b={pb.career.custom.kd}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
