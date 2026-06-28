import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { SearchPage } from "./pages/SearchPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ComparePage } from "./pages/ComparePage";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </div>
  );
}
