import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-line">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
        <p className="max-w-3xl">
          <strong className="text-white">Critical Ops Tracker</strong> — look up
          player stats, competitive rank and MMR, K/D, KDA, win rate and season
          history, and browse the global Critical Ops leaderboards (Elite Ops,
          Ranked, Kills and Clans).
        </p>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/" className="hover:text-white">
            Tracker
          </Link>
          <Link to="/leaderboard" className="hover:text-white">
            Leaderboard
          </Link>
          <Link to="/compare" className="hover:text-white">
            Compare
          </Link>
          <Link to="/watchlist" className="hover:text-white">
            Watchlist
          </Link>
        </nav>
        <p className="mt-3 text-xs">
          Not affiliated with Critical Force or Critical Ops. Stats come from the
          public Critical Ops API.
        </p>
      </div>
    </footer>
  );
}
