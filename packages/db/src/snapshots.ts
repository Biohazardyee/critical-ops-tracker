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

  // Compare to the previous snapshot to emit a notification event on change.
  const prev = await prisma.snapshot.findFirst({
    where: { userId },
    orderBy: { takenAt: "desc" },
  });

  const snapshot = await prisma.snapshot.create({
    data: { userId, ...metrics, raw: JSON.stringify(profile) },
  });

  if (prev) {
    let kind: string | null = null;
    if (metrics.rank !== prev.rank) {
      kind = metrics.rank > prev.rank ? "rank_up" : "rank_down";
    } else if (metrics.mmr !== prev.mmr) {
      kind = "mmr";
    }
    if (kind) {
      await prisma.rankEvent.create({
        data: {
          userId,
          name: profile.basicInfo.name,
          kind,
          oldRank: prev.rank,
          newRank: metrics.rank,
          oldMmr: prev.mmr,
          newMmr: metrics.mmr,
        },
      });
    }
  }

  return snapshot;
}

/** Follow a player for notifications under a device token. */
export async function followPlayer(token: string, profile: RawProfile) {
  const userId = String(profile.basicInfo.userID);
  return prisma.follow.upsert({
    where: { token_userId: { token, userId } },
    create: { token, userId, name: profile.basicInfo.name },
    update: { name: profile.basicInfo.name },
  });
}

/** Stop following a player under a device token. */
export async function unfollowPlayer(token: string, userId: string) {
  await prisma.follow.deleteMany({ where: { token, userId } });
}

/** Recent rank/MMR events for the players a token follows (newest first). */
export async function getFeed(token: string, limit = 30) {
  const follows = await prisma.follow.findMany({
    where: { token },
    select: { userId: true },
  });
  const ids = follows.map((f) => f.userId);
  if (ids.length === 0) return [];
  return prisma.rankEvent.findMany({
    where: { userId: { in: ids } },
    orderBy: { at: "desc" },
    take: limit,
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
