import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchPage } from "./pages/SearchPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ComparePage } from "./pages/ComparePage";
import { WatchlistPage } from "./pages/WatchlistPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
