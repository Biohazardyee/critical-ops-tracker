import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `border-b-2 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition ${
    isActive
      ? "border-accent text-white"
      : "border-transparent text-muted hover:text-white"
  }`;

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="h-5 w-1.5 bg-accent" />
          <span className="font-display text-xl font-bold uppercase tracking-wider">
            <span className="text-accent">Critical Ops</span> Tracker
          </span>
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Tracker
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Leaderboard
          </NavLink>
          <NavLink to="/compare" className={linkClass}>
            Compare
          </NavLink>
          <NavLink to="/watchlist" className={linkClass}>
            Watchlist
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
