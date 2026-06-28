import type { RawProfile } from "@cops/core";
import { toSnapshotMetrics } from "@cops/core";
import { prisma } from "./client.js";

/**
 * Upsert the tracked player and store a fresh snapshot of their stats.
 * Returns the created snapshot row.
 */
export async function recordSnapshot(profile: RawProfile) {
  const userId = String(profile.basicInfo.userID);
  const metrics = toSnapshotMetrics(profile);

  await prisma.trackedPlayer.upsert({
    where: { userId },
    create: { userId, name: profile.basicInfo.name },
    update: { name: profile.basicInfo.name },
  });

  return prisma.snapshot.create({
    data: { userId, ...metrics, raw: JSON.stringify(profile) },
  });
}

/** All snapshots for a tracked player, oldest first (excludes the bulky raw payload). */
export function getSnapshots(userId: string) {
  return prisma.snapshot.findMany({
    where: { userId },
    orderBy: { takenAt: "asc" },
    select: {
      id: true,
      takenAt: true,
      level: true,
      mmr: true,
      rank: true,
      rankedKills: true,
      rankedDeaths: true,
      rankedAssists: true,
      rankedWins: true,
      rankedLosses: true,
    },
  });
}

/** Every tracked player (without their snapshots). */
export function listTrackedPlayers() {
  return prisma.trackedPlayer.findMany({ orderBy: { name: "asc" } });
}
