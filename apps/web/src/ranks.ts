// Maps a rank id to its badge image (served from web/public/ranks).
const RANK_IMAGES: Record<number, string> = {
  0: "/ranks/unranked.webp",
  1: "/ranks/iron.png",
  2: "/ranks/bronze.jpg",
  3: "/ranks/silver.jpg",
  4: "/ranks/gold.jpg",
  5: "/ranks/plat.webp",
  6: "/ranks/diamond.webp",
  7: "/ranks/master.jpg",
  8: "/ranks/specops.png",
  9: "/ranks/elite-ops.png",
};

export const rankImage = (id: number): string | undefined => RANK_IMAGES[id];

/** Strip a leading "[TAG] " from a leaderboard display name. */
export const cleanName = (name: string): string =>
  name.replace(/^\[[^\]]*\]\s*/, "").trim();
