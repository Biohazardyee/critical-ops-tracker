import { useEffect } from "react";
import type { ProfileSummary } from "@cops/core";
import { StatCard } from "./StatCard";

type Season = ProfileSummary["seasons"][number];

export function SeasonDetailModal({
  season,
  onClose,
}: {
  season: Season;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="clip-corner w-full max-w-3xl border border-line bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold uppercase tracking-wide">
            Season {season.season}
          </h3>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-muted transition hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Ranked" stats={season.ranked} accent />
          <StatCard title="Casual" stats={season.casual} />
          <StatCard title="Custom" stats={season.custom} />
        </div>
      </div>
    </div>
  );
}
