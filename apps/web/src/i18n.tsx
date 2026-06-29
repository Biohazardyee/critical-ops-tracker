import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fr";

const dict = {
  en: {
    "app.tagline": "Critical Ops player stats, ranks & history.",
    "nav.tracker": "Tracker",
    "nav.leaderboard": "Leaderboard",
    "nav.compare": "Compare",
    "nav.watchlist": "Watchlist",
    "common.loading": "Loading…",
    "common.search": "Search",
    "tab.player": "Player",
    "tab.servers": "Servers",
    "search.placeholder": "Enter a Critical Ops username…",
    "home.intro":
      "Look up any Critical Ops player's rank, MMR, K/D and season history — and browse the global Elite Ops, Ranked, Kills and Clan leaderboards.",
    "search.empty": "Search a player to see their stats, rank and season history.",
    "search.recent": "Recent:",
    "section.season": "Ranked by season",
    "section.mmr": "MMR history",
    "btn.watchlist": "☆ Watchlist",
    "btn.watchlisted": "★ Watchlisted",
    "btn.track": "Track this player",
    "btn.tracking": "Adding…",
    "status.tracked": "✓ This player is being tracked",
    "lb.title": "Leaderboard",
    "lb.subtitle": "Top players and clans in Critical Ops.",
    "lb.find": "Find a player or clan…",
    "lb.prev": "‹ Prev",
    "lb.next": "Next ›",
    "lb.page": "Page",
    "lb.noMatch": "No match for",
    "lb.cap": "source caps at 1000",
    "wl.title": "Watchlist",
    "wl.subtitle": "Players you've pinned.",
    "wl.empty": "No players pinned yet. Open a player and hit “☆ Watchlist”.",
    "cmp.title": "Compare",
    "cmp.subtitle": "Two players, side by side.",
    "cmp.p1": "Player 1",
    "cmp.p2": "Player 2",
    "cmp.cta": "Compare",
    "notif.title": "Notifications",
    "notif.empty":
      "No alerts yet. Watchlist players to get rank & MMR notifications.",
  },
  fr: {
    "app.tagline": "Stats, rangs et historique des joueurs Critical Ops.",
    "nav.tracker": "Tracker",
    "nav.leaderboard": "Classement",
    "nav.compare": "Comparer",
    "nav.watchlist": "Suivis",
    "common.loading": "Chargement…",
    "common.search": "Rechercher",
    "tab.player": "Joueur",
    "tab.servers": "Serveurs",
    "search.placeholder": "Entre un pseudo Critical Ops…",
    "home.intro":
      "Consultez le rang, le MMR, le K/D et l'historique par saison de n'importe quel joueur Critical Ops — et explorez les classements Elite Ops, Ranked, Kills et Clans.",
    "search.empty":
      "Recherche un joueur pour voir ses stats, son rang et son historique.",
    "search.recent": "Récents :",
    "section.season": "Classé par saison",
    "section.mmr": "Historique MMR",
    "btn.watchlist": "☆ Suivre",
    "btn.watchlisted": "★ Suivi",
    "btn.track": "Suivre ce joueur",
    "btn.tracking": "Ajout…",
    "status.tracked": "✓ Ce joueur est suivi",
    "lb.title": "Classement",
    "lb.subtitle": "Meilleurs joueurs et clans sur Critical Ops.",
    "lb.find": "Trouver un joueur ou un clan…",
    "lb.prev": "‹ Préc.",
    "lb.next": "Suiv. ›",
    "lb.page": "Page",
    "lb.noMatch": "Aucun résultat pour",
    "lb.cap": "limité à 1000 par la source",
    "wl.title": "Suivis",
    "wl.subtitle": "Les joueurs que tu as épinglés.",
    "wl.empty": "Aucun joueur épinglé. Ouvre un joueur et clique « ☆ Suivre ».",
    "cmp.title": "Comparer",
    "cmp.subtitle": "Deux joueurs, côte à côte.",
    "cmp.p1": "Joueur 1",
    "cmp.p2": "Joueur 2",
    "cmp.cta": "Comparer",
    "notif.title": "Notifications",
    "notif.empty":
      "Aucune alerte. Suis des joueurs pour recevoir les changements de rang/MMR.",
  },
} as const;

export type I18nKey = keyof (typeof dict)["en"];

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => dict.en[key] ?? key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("cops:lang");
    if (saved === "fr" || saved === "en") return saved;
    return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("cops:lang", l);
  };

  const t = (key: I18nKey): string => dict[lang][key] ?? dict.en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = (): I18nValue => useContext(I18nContext);
