import { NavLink } from "react-router-dom";
import { useI18n } from "../i18n";
import { NotificationsBell } from "./NotificationsBell";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `border-b-2 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition ${
    isActive
      ? "border-accent text-white"
      : "border-transparent text-muted hover:text-white"
  }`;

export function Header() {
  const { t, lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="h-5 w-1.5 bg-accent" />
          <span className="font-display text-xl font-bold uppercase tracking-wider">
            <span className="text-accent">Critical Ops</span> Tracker
          </span>
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            {t("nav.tracker")}
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            {t("nav.leaderboard")}
          </NavLink>
          <NavLink to="/compare" className={linkClass}>
            {t("nav.compare")}
          </NavLink>
          <NavLink to="/watchlist" className={linkClass}>
            {t("nav.watchlist")}
          </NavLink>
          <NotificationsBell />
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="ml-1 border border-line px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted transition hover:border-accent hover:text-white"
            title="Language"
          >
            {lang === "en" ? "FR" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
